const httpStatus = require('http-status');

const AccountLoginChangeCode = require('./auth.id.login-change-code.model');
const emailProvider = require('../../../services/email/email.provider');
const Errors = require('../../../utils/auth.errors');
const APIError = require('../../../utils/APIError');
const APIStatus = require('../../../utils/APIStatus');

/**
 * Send Login Change Code to User
 * @public
 */
exports.sendAccountLoginChangeCode = async (req, res, next) => {
  try {
    const { password, newEmail } = req.body;
    const { user } = req.locals;

    if (user.email === newEmail) {
      throw new APIError(Errors.LOGIN_MUST_BE_DIFFERENT);
    }

    if (user && (await user.passwordMatches(password))) {
      await AccountLoginChangeCode.deleteMany({
        userEmail: user.email
      });
      const accountLoginChangeCode = await AccountLoginChangeCode.generate(user, newEmail);
      emailProvider.sendAccountLoginChangeCodeEmail(accountLoginChangeCode);
      res.status(httpStatus.OK);
      return res.json(new APIStatus({ message: 'Email sent successfully' }));
    }
    throw new APIError(Errors.UNAUTHORIZED);
  } catch (error) {
    return next(error);
  }
};

/**
 * Change the user login
 * @public
 */
exports.changeUserLogin = async (req, res, next) => {
  try {
    const { password, code, newEmail } = req.body;
    const { user } = req.locals;
    const userEmail = user.email;
    if (user && userEmail && newEmail && (await user.passwordMatches(password))) {
      const changeLoginCodeObj = await AccountLoginChangeCode.findOneAndRemove({
        userEmail,
        newEmail,
        code
      });
      if (!changeLoginCodeObj) {
        await AccountLoginChangeCode.deleteMany({ userEmail });
        throw new APIError(Errors.UNAUTHORIZED);
      }

      user.email = newEmail;
      await user.save();

      res.status(httpStatus.OK);
      return res.json(new APIStatus({ message: 'Login changed successfully' }));
    }
    throw new APIError(Errors.UNAUTHORIZED);
  } catch (error) {
    return next(error);
  }
};
