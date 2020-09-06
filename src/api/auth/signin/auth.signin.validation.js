const Joi = require('@hapi/joi');

module.exports = {
    login: {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required().min(8).max(128)
        })
    },

    oAuthRequest: {
        body: Joi.object({
            access_token: Joi.string().required()
        })
    }
};
