const Joi = require('@hapi/joi');

module.exports = {
    accountDeletionRequest: {
        body: Joi.object({
            password: Joi.string().required()
        })
    },

    accountDeletion: {
        body: Joi.object({
            password: Joi.string().required(),
            code: Joi.string().required()
        })
    }
};
