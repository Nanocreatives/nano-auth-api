const httpStatus = require('http-status');
const { omit } = require('lodash');
const moment = require('moment-timezone');

const User = require('../user/user.model');
const RefreshToken = require('./auth-refresh-token.model');
const PasswordResetToken = require('./auth-password-reset-token.model');
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
    if(tokenParts.length === 3){
        res.cookie('access_token_hp', `${tokenParts[0]}.${tokenParts[1]}`, {
            maxAge: parseInt(config.auth.accessTokenValidity) * 1000,
            httpOnly: false,
            secure: true,
            sameSite: true
        });

        res.cookie('access_token_s', tokenParts[2], {
            maxAge: parseInt(config.auth.accessTokenValidity) * 1000,
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: true
        });

        const refreshToken = RefreshToken.generate(user).token;
        res.cookie('refresh_token', refreshToken, {
            maxAge: parseInt(config.auth.refreshTokenValidity) * 1000,
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: true
        });
    }else{
        throw new APIError({
            status: httpStatus.INTERNAL_SERVER_ERROR,
            message: 'KO',
        });
    }

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
        const refreshTokenCookie = req.signedCookies['refresh_token'];
        if (!refreshTokenCookie) {
            throw new APIError(Errors.INVALID_CREDENTIAL);
        }
        const refreshObject = await RefreshToken.findOneAndRemove({
            token: refreshTokenCookie,
        });
        if (!refreshObject) {
            throw new APIError(Errors.INVALID_CREDENTIAL);
        }
        const { user, accessToken } = await User.findAndGenerateToken({ email: refreshObject.userEmail, refreshObject });
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
        res.clearCookie('refresh_token');
        res.clearCookie('access_token_hp');
        res.clearCookie('access_token_s');

        res.status(httpStatus.OK);

        return res.json(new APIStatus({
            message: "Logged Out successfully"
        }));
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
            return res.json(new APIStatus({message: "Email sent successfully"}));
        }
        throw new APIError({
            status: httpStatus.NOT_FOUND,
            message: 'No account found with that email',
        });
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
        if(user.locked){
            user.locked = false;
            user.lockedUntil = null;
            user.lockedAt = null;
            user.lastLoginAttempts = [];
        }
        if(user.mustChangePassword){
            user.mustChangePassword = false;
        }
        await user.save();
        emailProvider.sendPasswordChangeEmail(user);

        res.status(httpStatus.OK);
        return res.json(new APIStatus({message: "Password updated successfully"}));
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
        return next(error);
    }
};