const Joi = require('@hapi/joi');

module.exports = {
    register: {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required().min(8).max(128)
        })
    },

    verifyAccount: {
        body: Joi.object({
            token: Joi.string().required(),
            captcha: Joi.string().required().min(10)
        })
    },

    sendAccountVerification: {
        body: Joi.object({
            email: Joi.string().email().required()
        })
    }
};
