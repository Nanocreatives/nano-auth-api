const httpStatus = require('http-status');

const User = require('../../user/user.model');
const RefreshToken = require('./auth.signin.refresh-token.model');
const emailProvider = require('../../../services/email/email.provider');
const config = require('../../../config/config');
const Errors = require('../../../utils/auth.errors');
const APIError = require('../../../utils/APIError');
const APIStatus = require('../../../utils/APIStatus');

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
  res.clearCookie('access_token_hp');
  res.clearCookie('access_token_s');
  res.clearCookie('refresh_token');
}

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
    const { user } = req.locals;
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
