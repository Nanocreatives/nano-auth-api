const mongoose = require('mongoose');

/**
 * Login Change Code Schema
 * @private
 */
const loginChangeCodeModel = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userEmail: {
      type: 'String',
      required: true
    },
    newEmail: {
      type: 'String',
      required: true
    },
    createdAt: {
      type: Date,
      expires: '10m',
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

loginChangeCodeModel.statics = {
  /**
   * Generate a login change code object and saves it into the database
   *
   * @param {User} user
   * @param {String} newEmail
   * @returns {LoginChangeCode}
   */
  async generate(user, newEmail) {
    const userId = user._id;
    const userEmail = user.email;
    const code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    const loginChangeCodeObject = new LoginChangeCodeModel({
      code,
      userId,
      userEmail,
      newEmail
    });
    await loginChangeCodeObject.save();
    return loginChangeCodeObject;
  }
};

/**
 * @typedef LoginChangeCode
 */
const LoginChangeCodeModel = mongoose.model('LoginChangeCode', loginChangeCodeModel);
module.exports = LoginChangeCodeModel;
