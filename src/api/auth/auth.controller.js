const httpStatus = require('http-status');
const { omit } = require('lodash');
const moment = require('moment-timezone');

const User = require('../user/user.model');
const RefreshToken = require('./refresh-token.model');
const PasswordResetToken = require('./password-reset-token.model');
const emailProvider = require('../../services/email/email.provider');
const config = require('../../config/config');
const logger = require('../../config/logger');
const APIError = require('../../utils/APIError');

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
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
    try {
        const userData = omit(req.body, 'role');
        const user = await new User(userData).save();
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

exports.sendPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }).exec();

        if (user) {
            const passwordResetObj = await PasswordResetToken.generate(user);
            emailProvider.sendPasswordReset(passwordResetObj);
            res.status(httpStatus.OK);
            return res.json('success');
        }
        throw new APIError({
            status: httpStatus.UNAUTHORIZED,
            message: 'No account found with that email',
        });
    } catch (error) {
        logger.error(error);
        return next(error);
    }
};

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
        return res.json('Password Updated');
    } catch (error) {
        logger.error(error);
        return next(error);
    }
};