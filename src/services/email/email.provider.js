const nodemailer = require('nodemailer');
const Email = require('email-templates');

const config = require('../../config/config');
const logger = require('../../config/logger');

const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.username,
        pass: config.email.password,
    },
});

// verify connection configuration
transporter.verify((error) => {
    if (error) {
        logger.error('Error occured when connecting NodeMailer Transport', error);
    }
});

const email = new Email({
    views: { root: __dirname },
    message: {
        from: `${config.email.appName} <${config.email.from}>`,
    },
    // uncomment below to send emails in development/test env:
    send: config.env !== "development",
    transport: transporter,
});

exports.sendAccountVerification = async (accountVerificationObject) => {

    email
        .send({
            template: 'account-verification',
            message: {
                to: accountVerificationObject.userEmail,
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                email: accountVerificationObject.userEmail,
                year: (new Date()).getFullYear(),
                accountVerificationUrl: `${config.email.accountVerificationUrl}?token=${accountVerificationObject.verificationToken}`,
            },
        })
        .catch((e) => {
            logger.error('An error occurred during the sending of the account verification email', e);
        });
};

exports.sendPasswordChangeEmail = async (user) => {

    email
        .send({
            template: 'password-change',
            message: {
                to: user.email,
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                year: (new Date()).getFullYear(),
                name: user.name,
            },
        })
        .catch((e) => {
            logger.error('An error occurred during the sending of the password email', e);
        });
};

exports.sendPasswordReset = async (passwordResetObject) => {

    email
        .send({
            template: 'password-reset',
            message: {
                to: passwordResetObject.userEmail,
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                year: (new Date()).getFullYear(),
                passwordResetUrl: `${config.email.passwordResetUrl}?token=${passwordResetObject.resetToken}`,
            },
        })
        .catch((e) => {
            logger.error('An error occurred during the sending of the password reset email', e);
        });
};