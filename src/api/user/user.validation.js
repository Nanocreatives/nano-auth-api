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
      phone: Joi.string(),
      country: Joi.string(),
      verified: Joi.boolean(),
      role: Joi.string().valid(...User.roles)
    })
  },

  createUser: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
      firstname: Joi.string().max(128),
      lastname: Joi.string().max(128),
      picture: Joi.string().max(255),
      phone: Joi.string().max(20),
      country: Joi.string().max(128),
      birthdate: Joi.date(),
      createdAt: Joi.date(),
      role: Joi.string().valid(...User.roles),
      verified: Joi.boolean()
    })
  },

  replaceUser: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
      firstname: Joi.string().max(128),
      lastname: Joi.string().max(128),
      picture: Joi.string().max(255),
      phone: Joi.string().max(20),
      country: Joi.string().max(128),
      birthdate: Joi.date(),
      createdAt: Joi.date(),
      role: Joi.string().valid(...User.roles),
      verified: Joi.boolean()
    }),
    params: Joi.object({
      userId: Joi.string().min(20).required()
    })
  },

  updateUser: {
    body: Joi.object({
      email: Joi.string().email(),
      password: Joi.string().min(8).max(128),
      firstname: Joi.string().max(128),
      lastname: Joi.string().max(128),
      picture: Joi.string().max(255),
      phone: Joi.string().max(20),
      country: Joi.string().max(128),
      birthdate: Joi.date(),
      createdAt: Joi.date(),
      role: Joi.string().valid(...User.roles),
      verified: Joi.boolean()
    }),
    params: Joi.object({
      userId: Joi.string().min(20).required()
    })
  },

  updateUserProfile: {
    body: Joi.object({
      phone: Joi.string().max(20),
      country: Joi.string().max(128),
      birthdate: Joi.date(),
      picture: Joi.string().max(255),
      firstname: Joi.string().max(128),
      lastname: Joi.string().max(128)
    })
  }
};
