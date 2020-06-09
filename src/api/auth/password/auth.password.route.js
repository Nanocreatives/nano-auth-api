const express = require('express');
const { validate } = require('express-validation');

const controller = require('./auth.password.controller');
const { authorize } = require('../../../middlewares/auth');
const { sendPasswordReset, passwordChange, passwordReset } = require('./auth.password.validation');

const router = express.Router();

/**
 * @api {post} v1/auth/password/recovery-request Send Password Reset Email
 * @apiDescription Send a password reset token to change the account password
 * @apiVersion 1.0.0
 * @apiName Send Password Reset
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam    {String}    email       User's email
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Not Found 404)    APIError    Account not found
 * @apiError (Bad Request 400)  APIError    Some parameters may contain invalid values
 */
router.route('/recovery-request').post(validate(sendPasswordReset), controller.sendPasswordReset);

/**
 * @api {put} v1/auth/password/reset Reset Password
 * @apiDescription Reset the password of a user account
 * @apiVersion 1.0.0
 * @apiName Reset Password
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}      email       Use email
 * @apiParam  {String}      password    New user password
 * @apiParam  {String}      resetToken  Password reset Token
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Unauthorized 401) APIError  Invalid Verify Token
 * @apiError (Bad Request 400)  APIError  Some parameters may contain invalid values
 */
router.route('/reset').put(validate(passwordReset), controller.resetPassword);

/**
 * @api {put} v1/auth/password/change Change Password
 * @apiDescription Change the password of a user account
 * @apiVersion 1.0.0
 * @apiName Change Password
 * @apiGroup Auth Password
 * @apiPermission Authenticated
 *
 * @apiHeader {String} Authorization Authorization Header
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer {access_token_hp}"
 *     }
 *
 * @apiParam  {String}      password        User current password
 * @apiParam  {String}      newPassword     New user password
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "password": "old-password",
 *       "newPassword": "new-password"
 *     }
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Unauthorized 401) APIError  Invalid current Password
 * @apiError (Bad Request 400)  APIError  Some parameters may contain invalid values
 */
router.route('/change').put(authorize(), validate(passwordChange), controller.changePassword);

module.exports = router;
