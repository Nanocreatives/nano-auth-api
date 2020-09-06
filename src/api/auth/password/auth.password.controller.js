const httpStatus = require('http-status');
const moment = require('moment-timezone');

const User = require('../../user/user.model');
const PasswordResetToken = require('./auth.password.reset-token.model');
const emailProvider = require('../../../services/email/email.provider');
const Errors = require('../../../utils/auth.errors');
const APIError = require('../../../utils/APIError');
const APIStatus = require('../../../utils/APIStatus');

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

        const { user } = req.locals;
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
