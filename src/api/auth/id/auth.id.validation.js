const Joi = require('@hapi/joi');

module.exports = {
  loginChangeRequest: {
    body: Joi.object({
      password: Joi.string().required(),
      newEmail: Joi.string().email().required()
    })
  },

  loginChange: {
    body: Joi.object({
      password: Joi.string().required(),
      code: Joi.string().required(),
      newEmail: Joi.string().email().required()
    })
  }
};
