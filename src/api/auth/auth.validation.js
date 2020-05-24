const Joi = require('@hapi/joi');

module.exports = {

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

    oAuthRequest: {
        body: Joi.object({
            access_token: Joi.string().required(),
        }),
    },

    sendPasswordReset: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
        }),
    },

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

    passwordChange: {
        body: Joi.object({
            password: Joi.string()
                .required(),
            newPassword: Joi.string()
                .required()
                .min(8)
                .max(128),
        }),
    },

    verifyAccount: {
        body: Joi.object({
            token: Joi.string().required(),
        }),
    },

    sendAccountVerification : {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required(),
        }),
    },

    accountDeletionRequest: {
        body: Joi.object({
            password: Joi.string()
                .required()
        }),
    },

    accountDeletion: {
        body: Joi.object({
            password: Joi.string()
                .required(),
            code: Joi.string()
                .required(),
        }),
    },
};