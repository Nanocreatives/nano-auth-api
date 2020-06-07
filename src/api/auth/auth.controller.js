const httpStatus = require('http-status');
const { omit } = require('lodash');
const moment = require('moment-timezone');

const User = require("../user/user.model");
const RefreshToken = require('./auth-refresh-token.model');
const PasswordResetToken = require('./auth-password-reset-token.model');
const AccountDeletionCode = require('./auth-account-deletion-code.model');
const AccountVerificationToken = require('./auth-account-verification-token.model');
const emailProvider = require('../../services/email/email.provider');
const config = require('../../config/config');
const Errors = require('../../utils/auth.errors');
const APIError = require('../../utils/APIError');
const APIStatus = require('../../utils/APIStatus');

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken, res) {
  const tokenParts = accessToken.split('.');
  if (tokenParts.length === 3) {
    res.cookie('access_token_hp', `${tokenParts[0]}.${tokenParts[1]}`, {
      maxAge: parseInt(config.auth.accessTokenValidity, 10) * 1000,
      httpOnly: false,
      secure: config.env !== 'development',
      sameSite: true
    });

    res.cookie('access_token_s', tokenParts[2], {
      maxAge: parseInt(config.auth.accessTokenValidity, 10) * 1000,
      httpOnly: true,
      secure: config.env !== 'development',
      signed: true,
      sameSite: true
    });

    const refreshToken = RefreshToken.generate(user).token;
    res.cookie('refresh_token', refreshToken, {
      maxAge: parseInt(config.auth.refreshTokenValidity, 10) * 1000,
      httpOnly: true,
      secure: config.env !== 'development',
      signed: true,
      sameSite: true
    });
  } else {
    throw new APIError(Errors.KO_AUTH_TOKEN);
  }
}

/**
 * Clear all authentication Cookies
 * @param res
 * @private
 */
function clearAuthCookies(res) {
  res.clearCookie('refresh_token');
  res.clearCookie('access_token_hp');
  res.clearCookie('access_token_s');
}

/**
 * Returns the user if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try {
    const userData = omit(req.body, 'role');

    if (!config.auth.accountVerification) {
      userData.verified = true;
    }

    const user = await new User(userData).save();

    if (!user.verified) {
      const accountVerificationObj = await AccountVerificationToken.generate(user);
      emailProvider.sendAccountVerification(accountVerificationObj);
    }

    const userTransformed = user.transform();
    res.status(httpStatus.CREATED);
    return res.json(userTransformed);
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    generateTokenResponse(user, accessToken, res);
    return res.json(user.transform());
  } catch (error) {
    if (req.body && req.body.email && error.code === Errors.ACCOUNT_LOCKED_ON_FAILED_ATTEMPT.code) {
      emailProvider.sendAccountLockEmail(req.body.email);
    }
    return next(error);
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req, res, next) => {
  try {
    const { user } = req;
    const accessToken = user.token();
    generateTokenResponse(user, accessToken, res);
    return res.json(user.transform());
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const refreshTokenCookie = req.signedCookies.refresh_token;
    if (!refreshTokenCookie) {
      throw new APIError(Errors.INVALID_CREDENTIAL);
    }
    const refreshObject = await RefreshToken.findOneAndRemove({
      token: refreshTokenCookie
    });
    if (!refreshObject) {
      throw new APIError(Errors.INVALID_CREDENTIAL);
    }
    const { user, accessToken } = await User.findAndGenerateToken({
      email: refreshObject.userEmail,
      refreshObject
    });
    generateTokenResponse(user, accessToken, res);
    return res.json(user.transform());
  } catch (error) {
    return next(error);
  }
};

/**
 * Revoke all authentication Tokens
 * @public
 */
exports.logout = async (req, res, next) => {
  try {
    const refreshTokenCookie = req.signedCookies.refresh_token;
    await RefreshToken.deleteOne({
      token: refreshTokenCookie
    });
    clearAuthCookies(res);

    res.status(httpStatus.OK);

    return res.json(
      new APIStatus({
        message: 'Logged Out successfully'
      })
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * Send Password Reset Token to User
 * @public
 */
exports.sendPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user) {
      const passwordResetObj = await PasswordResetToken.generate(user);
      emailProvider.sendPasswordReset(passwordResetObj);
      res.status(httpStatus.OK);
      return res.json(new APIStatus({ message: 'Email sent successfully' }));
    }
    throw new APIError(Errors.NOT_FOUND);
  } catch (error) {
    return next(error);
  }
};

/**
 * Reset the User Password
 * @public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password, resetToken } = req.body;
    const resetTokenObject = await PasswordResetToken.findOneAndRemove({
      userEmail: email,
      resetToken
    });

    if (!resetTokenObject || moment().isAfter(resetTokenObject.expires)) {
      throw new APIError(Errors.INVALID_TOKEN);
    }

    const user = await User.findOne({
      email: resetTokenObject.userEmail
    }).exec();
    user.password = password;
    if (user.locked) {
      user.locked = false;
      user.lockedUntil = null;
      user.lockedAt = null;
      user.lastLoginAttempts = [];
    }
    if (user.mustChangePassword) {
      user.mustChangePassword = false;
    }
    await user.save();
    emailProvider.sendPasswordChangeEmail(user);

    res.status(httpStatus.OK);
    return res.json(new APIStatus({ message: 'Password updated successfully' }));
  } catch (error) {
    return next(error);
  }
};

/**
 * Change the User Password
 * Used by the authenticated user himself
 * @public
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;

    if (password === newPassword) {
      throw new APIError(Errors.PASSWORD_MUST_BE_DIFFERENT);
    }

    const { user } = req;
    if (user && (await user.passwordMatches(password))) {
      user.password = newPassword;
      await user.save();
      emailProvider.sendPasswordChangeEmail(user);
      res.status(httpStatus.OK);
      return res.json(new APIStatus({ message: 'Password updated successfully' }));
    }

    throw new APIError(Errors.UNAUTHORIZED);
  } catch (error) {
    return next(error);
  }
};

/**
 * Verify a registered account
 * @public
 */
exports.verifyAccount = async (req, res, next) => {
  try {
    const { token } = req.body;
    const verificationTokenObject = await AccountVerificationToken.findOneAndRemove({
      verificationToken: token
    });

    if (!verificationTokenObject) {
      throw new APIError(Errors.INVALID_TOKEN);
    }

    const user = await User.findOne({
      email: verificationTokenObject.userEmail
    }).exec();
    user.verified = true;
    await user.save();

    res.status(httpStatus.OK);
    return res.json(new APIStatus({ message: 'Account verified successfully' }));
  } catch (error) {
    return next(error);
  }
};

/**
 * Send Account Verification Token to User
 * @public
 */
exports.sendAccountVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user && !user.verified) {
      const accountVerificationObj = await AccountVerificationToken.generate(user);
      emailProvider.sendAccountVerification(accountVerificationObj);
      res.status(httpStatus.OK);
      return res.json(new APIStatus({ message: 'Email sent successfully' }));
    }
    throw new APIError(Errors.NOT_FOUND);
  } catch (error) {
    return next(error);
  }
};

/**
 * Send Account Deletion Code to User
 * @public
 */
exports.sendAccountDeletionCode = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { user } = req;

    if (user && (await user.passwordMatches(password))) {
      await AccountDeletionCode.deleteMany({
        userEmail: user.email
      });
      const deletionCodeObj = await AccountDeletionCode.generate(user);
      emailProvider.sendAccountDeletionCodeEmail(deletionCodeObj);
      res.status(httpStatus.OK);
      return res.json(new APIStatus({ message: 'Email sent successfully' }));
    }
    throw new APIError(Errors.UNAUTHORIZED);
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete the User Account
 * @public
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password, code } = req.body;
    const { user } = req;
    const userEmail = user.email;
    if (user && userEmail && (await user.passwordMatches(password))) {
      const deletionCodeObj = await AccountDeletionCode.findOneAndRemove({
        userEmail,
        code
      });
      if (!deletionCodeObj) {
        await AccountDeletionCode.deleteMany({ userEmail });
        throw new APIError(Errors.UNAUTHORIZED);
      }

      await user.remove();

      emailProvider.sendAccountDeletedEmail(user.email);
      clearAuthCookies(res);

      res.status(httpStatus.OK);
      return res.json(new APIStatus({ message: 'Account deleted successfully' }));
    }
    throw new APIError(Errors.UNAUTHORIZED);
  } catch (error) {
    return next(error);
  }
};
