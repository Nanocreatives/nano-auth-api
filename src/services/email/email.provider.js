const nodemailer = require('nodemailer');
const Email = require('email-templates');

const config = require('../../config/config');
const logger = require('../../config/logger');

const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.username,
        pass: config.email.password
    }
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
        from: `${config.email.appName} <${config.email.from}>`
    },
    // uncomment below to send emails in development/test env:
    send: config.env !== 'development',
    transport: transporter
});

exports.sendAccountVerification = async (accountVerificationObject) => {
    email
        .send({
            template: 'account-verification',
            message: {
                to: accountVerificationObject.userEmail
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                appWebsiteUrl: config.email.appWebsiteUrl,
                email: accountVerificationObject.userEmail,
                year: new Date().getFullYear(),
                accountVerificationUrl: `${config.email.accountVerificationUrl}?token=${accountVerificationObject.verificationToken}`
            }
        })
        .catch((e) => {
            logger.error(
                'An error occurred during the sending of the account verification email',
                e
            );
        });
};

exports.sendPasswordReset = async (passwordResetObject) => {
    email
        .send({
            template: 'password-reset',
            message: {
                to: passwordResetObject.userEmail
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                appWebsiteUrl: config.email.appWebsiteUrl,
                year: new Date().getFullYear(),
                passwordResetUrl: `${config.email.passwordResetUrl}?token=${passwordResetObject.resetToken}`
            }
        })
        .catch((e) => {
            logger.error('An error occurred during the sending of the password reset email', e);
        });
};

exports.sendPasswordChangeEmail = async (user) => {
    email
        .send({
            template: 'password-change',
            message: {
                to: user.email
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                appWebsiteUrl: config.email.appWebsiteUrl,
                year: new Date().getFullYear()
            }
        })
        .catch((e) => {
            logger.error('An error occurred during the sending of the password change email', e);
        });
};

exports.sendAccountLockEmail = async (userEmail) => {
    email
        .send({
            template: 'account-locked',
            message: {
                to: userEmail
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                appWebsiteUrl: config.email.appWebsiteUrl,
                year: new Date().getFullYear()
            }
        })
        .catch((e) => {
            logger.error('An error occurred during the sending of the account locked email', e);
        });
};

exports.sendAccountDeletionCodeEmail = async (accountDeletionObject) => {
    email
        .send({
            template: 'account-deletion',
            message: {
                to: accountDeletionObject.userEmail
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                appWebsiteUrl: config.email.appWebsiteUrl,
                year: new Date().getFullYear(),
                code: accountDeletionObject.code
            }
        })
        .catch((e) => {
            logger.error(
                'An error occurred during the sending of the account deletion code email',
                e
            );
        });
};

exports.sendAccountDeletedEmail = async (userEmail) => {
    email
        .send({
            template: 'account-deleted',
            message: {
                to: userEmail
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                appWebsiteUrl: config.email.appWebsiteUrl,
                year: new Date().getFullYear()
            }
        })
        .catch((e) => {
            logger.error('An error occurred during the sending of the account deleted email', e);
        });
};

exports.sendAccountLoginChangeCodeEmail = async (accountLoginChangeObject) => {
    email
        .send({
            template: 'account-login-change',
            message: {
                to: accountLoginChangeObject.userEmail
            },
            locals: {
                appName: config.email.appName,
                appLogo: config.email.appLogo,
                appWebsiteUrl: config.email.appWebsiteUrl,
                year: new Date().getFullYear(),
                code: accountLoginChangeObject.code
            }
        })
        .catch((e) => {
            logger.error(
                'An error occurred during the sending of the account login change code email',
                e
            );
        });
};
