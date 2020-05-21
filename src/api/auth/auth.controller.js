const httpStatus = require('http-status');
const { omit } = require('lodash');
const moment = require('moment-timezone');

const User = require('../user/user.model');
const RefreshToken = require('./auth-refresh-token.model');
const PasswordResetToken = require('./auth-password-reset-token.model');
const AccountVerificationToken = require('./auth-account-verification-token.model');
const emailProvider = require('../../services/email/email.provider');
const config = require('../../config/config');
const logger = require('../../config/logger');
const APIError = require('../../utils/APIError');
const APIStatus = require('../../utils/APIStatus');

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
    const tokenType = 'Bearer';
    const refreshToken = RefreshToken.generate(user).token;
    const expires = moment().add(config.auth.jwt.expirationInterval, 'seconds');
    return {
        tokenType,
        accessToken,
        refreshToken,
        expires,
    };
}

/**
 * Returns the user if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
    try {
        const userData = omit(req.body, 'role');

        if(!config.auth.accountVerification){
            userData.verified = true;
        }

        const user = await new User(userData).save();

        if(!user.verified){
            const accountVerificationObj = await AccountVerificationToken.generate(user);
            emailProvider.sendAccountVerification(accountVerificationObj);
        }

        const userTransformed = user.transform();
        res.status(httpStatus.CREATED);
        return res.json(userTransformed);
    } catch (error) {
        logger.error(error);
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
        const token = generateTokenResponse(user, accessToken);
        const userTransformed = user.transform();
        return res.json({ token, user: userTransformed });
    } catch (error) {
        logger.error(error);
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
        const token = generateTokenResponse(user, accessToken);
        const userTransformed = user.transform();
        return res.json({ token, user: userTransformed });
    } catch (error) {
        logger.error(error);
        return next(error);
    }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
    try {
        const { email, refreshToken } = req.body;
        const refreshObject = await RefreshToken.findOneAndRemove({
            userEmail: email,
            token: refreshToken,
        });
        const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
        const response = generateTokenResponse(user, accessToken);
        return res.json(response);
    } catch (error) {
        logger.error(error);
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
            return res.json(new APIStatus({message: "Email sent successfully"}));
        }
        throw new APIError({
            status: httpStatus.NOT_FOUND,
            message: 'No account found with that email',
        });
    } catch (error) {
        logger.error(error);
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
            resetToken,
        });

        const err = {
            status: httpStatus.UNAUTHORIZED,
            isPublic: true,
        };
        if (!resetTokenObject) {
            err.message = 'Cannot find matching reset token';
            throw new APIError(err);
        }
        if (moment().isAfter(resetTokenObject.expires)) {
            err.message = 'Reset token is expired';
            throw new APIError(err);
        }

        const user = await User.findOne({ email: resetTokenObject.userEmail }).exec();
        user.password = password;
        await user.save();
        emailProvider.sendPasswordChangeEmail(user);

        res.status(httpStatus.OK);
        return res.json(new APIStatus({message: "Password updated successfully"}));
    } catch (error) {
        logger.error(error);
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
            verificationToken : token,
        });

        const err = {
            status: httpStatus.UNAUTHORIZED,
            isPublic: true,
        };
        if (!verificationTokenObject) {
            err.message = 'Token is not valid';
            throw new APIError(err);
        }

        const user = await User.findOne({ email: verificationTokenObject.userEmail }).exec();
        user.verified = true;
        await user.save();

        res.status(httpStatus.OK);
        return res.json(new APIStatus({message: "Account verified successfully"}));
    } catch (error) {
        logger.error(error);
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
            return res.json(new APIStatus({message: "Email sent successfully"}));
        }
        throw new APIError({
            status: httpStatus.NOT_FOUND,
            message: 'No unverified account found with that email',
        });
    } catch (error) {
        logger.error(error);
        return next(error);
    }
};