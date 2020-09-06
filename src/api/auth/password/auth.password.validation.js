const Joi = require('@hapi/joi');

module.exports = {
    sendPasswordReset: {
        body: Joi.object({
            email: Joi.string().email().required()
        })
    },

    passwordReset: {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required().min(8).max(128),
            resetToken: Joi.string().required()
        })
    },

    passwordChange: {
        body: Joi.object({
            password: Joi.string().required(),
            newPassword: Joi.string().required().min(8).max(128)
        })
    }
};
