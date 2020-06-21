const httpStatus = require('http-status');

const AccountDeletionCode = require('./auth.terminate.deletion-code.model');
const emailProvider = require('../../../services/email/email.provider');
const Errors = require('../../../utils/auth.errors');
const APIError = require('../../../utils/APIError');
const APIStatus = require('../../../utils/APIStatus');

/**
 * Clear all authentication Cookies
 * @param res
 * @private
 */
function clearAuthCookies(res) {
  res.clearCookie('refresh_token');
  res.clearCookie('access_token_hp');
  res.clearCookie('access_token_s');
}

/**
 * Send Account Deletion Code to User
 * @public
 */
exports.sendAccountDeletionCode = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { user } = req.locals;

    if (user && (await user.passwordMatches(password))) {
      await AccountDeletionCode.deleteMany({
        userEmail: user.email
      });
      const deletionCodeObj = await AccountDeletionCode.generate(user);
      emailProvider.sendAccountDeletionCodeEmail(deletionCodeObj);
      res.status(httpStatus.OK);
      return res.json(new APIStatus({ message: 'Email sent successfully' }));
    }
    throw new APIError(Errors.UNAUTHORIZED);
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete the User Account
 * @public
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password, code } = req.body;
    const { user } = req.locals;
    const userEmail = user.email;
    if (user && userEmail && (await user.passwordMatches(password))) {
      const deletionCodeObj = await AccountDeletionCode.findOneAndRemove({
        userEmail,
        code
      });
      if (!deletionCodeObj) {
        await AccountDeletionCode.deleteMany({ userEmail });
        throw new APIError(Errors.UNAUTHORIZED);
      }

      await user.remove();

      emailProvider.sendAccountDeletedEmail(user.email);
      clearAuthCookies(res);

      res.status(httpStatus.OK);
      return res.json(new APIStatus({ message: 'Account deleted successfully' }));
    }
    throw new APIError(Errors.UNAUTHORIZED);
  } catch (error) {
    return next(error);
  }
};
