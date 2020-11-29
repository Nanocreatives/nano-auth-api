const httpStatus = require('http-status');
const { omit } = require('lodash');

const User = require('../../user/user.model');
const AccountVerificationToken = require('./auth.register.verification-token.model');
const emailProvider = require('../../../services/email/email.provider');
const { verify } = require('../../../services/google/recaptcha');
const config = require('../../../config/config');
const Errors = require('../../../utils/auth.errors');
const APIError = require('../../../utils/APIError');
const APIStatus = require('../../../utils/APIStatus');

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
 * Verify a registered account
 * @public
 */
exports.verifyAccount = async (req, res, next) => {
    try {
        const captchaValid = await verify(req.body.captcha);
        if (captchaValid) {
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
        }
        throw new APIError(Errors.CAPTCHA);
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
