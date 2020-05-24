const Joi = require('@hapi/joi');
const User = require('./user.model');

module.exports = {

    listUsers: {
        query: Joi.object({
            page: Joi.number().min(1),
            perPage: Joi.number().min(1).max(100),
            lastname: Joi.string(),
            firstname: Joi.string(),
            email: Joi.string(),
            role: Joi.string().valid(...User.roles),
        }),
    },

    createUser: {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(128).required(),
            firstname: Joi.string().max(128),
            lastname: Joi.string().max(128),
            role: Joi.string().valid(...User.roles),
        }),
    },

    replaceUser: {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(128).required(),
            firstname: Joi.string().max(128),
            lastname: Joi.string().max(128),
            role: Joi.string().valid(...User.roles),
        }),
        params: Joi.object({
            userId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
        }),
    },

    updateUser: {
        body: Joi.object({
            email: Joi.string().email(),
            password: Joi.string().min(8).max(128),
            firstname: Joi.string().max(128),
            lastname: Joi.string().max(128),
            role: Joi.string().valid(...User.roles),
        }),
        params: Joi.object({
            userId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
        }),
    },
};