const Joi = require('@hapi/joi');

module.exports = {
    // POST /v1/auth/register
    register: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .required()
                .min(8)
                .max(128),
        }),
    },

    // POST /v1/auth/login
    login: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .required()
                .min(8)
                .max(128),
        }),
    },

    // POST /v1/auth/facebook
    // POST /v1/auth/google
    oAuthRequest: {
        body: Joi.object({
            access_token: Joi.string().required(),
        }),
    },

    // POST /v1/auth/refresh
    sendPasswordReset: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
        }),
    },

    // POST /v1/auth/password-reset
    passwordReset: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .required()
                .min(8)
                .max(128),
            resetToken: Joi.string().required(),
        }),
    },

    // POST /v1/auth/verify
    verifyAccount: {
        body: Joi.object({
            token: Joi.string().required(),
        }),
    },

    // POST /v1/auth/send-account-verification
    sendAccountVerification : {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
        }),
    },

    // POST /v1/auth/account/send-deletion-request
    accountDeletionRequest: {
        body: Joi.object({
            password: Joi.string()
                .required()
        }),
    },

    // DELETE /v1/auth/account
    accountDeletion: {
        body: Joi.object({
            password: Joi.string()
                .required(),
            code: Joi.string()
                .required(),
        }),
    },
};