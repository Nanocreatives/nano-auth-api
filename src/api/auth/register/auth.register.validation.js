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
      token: Joi.string().required()
    })
  },

  sendAccountVerification: {
    body: Joi.object({
      email: Joi.string().email().required()
    })
  }
};
