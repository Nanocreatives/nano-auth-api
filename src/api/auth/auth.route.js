const express = require('express');
const { validate } = require('express-validation');

const controller = require('./auth.controller');
const { oAuth, authorize } = require('../../middlewares/auth');
const {
  login,
  register,
  oAuthRequest,
  sendPasswordReset,
  passwordChange,
  passwordReset,
  verifyAccount,
  sendAccountVerification,
  accountDeletion,
  accountDeletionRequest,
  loginChange,
  loginChangeRequest
} = require('./auth.validation');

const router = express.Router();

/**
 * @api {post} v1/auth/register Register
 * @apiDescription Register a new user
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}          email     User's email
 * @apiParam  {String{6..128}}  password  User's password
 *
 * @apiSuccess (Created 201) {String}  user.id          User's id
 * @apiSuccess (Created 201) {String}  user.email       User's email
 * @apiSuccess (Created 201) {String}  user.role        User's role
 * @apiSuccess (Created 201) {String}  user.verified    User's account verification status
 * @apiSuccess (Created 201) {Date}    user.createdAt   Timestamp
 *
 * @apiError (Bad Request 400)  APIError  Some parameters may contain invalid values
 */
router.route('/register').post(validate(register), controller.register);

/**
 * @api {post} v1/auth/verify/request Send Verification Account Token
 * @apiDescription Send a verification account token to verify a new registered account
 * @apiVersion 1.0.0
 * @apiName Send Verification
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam    {String}    email       User's email
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Not Found 404)    APIError    Unverified Account not found
 * @apiError (Bad Request 400)  APIError    Some parameters may contain invalid values
 */
router
  .route('/verify/request')
  .post(validate(sendAccountVerification), controller.sendAccountVerification);

/**
 * @api {put} v1/auth/verify Verify Account
 * @apiDescription Verify a registered account
 * @apiVersion 1.0.0
 * @apiName Verify
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}      token       Account Verification Token
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Unauthorized 401) APIError    Verify Token invalid
 * @apiError (Bad Request 400)  APIError    Some parameters may contain invalid values
 */
router.route('/verify').put(validate(verifyAccount), controller.verifyAccount);

/**
 * @api {post} v1/auth/login Login
 * @apiDescription Get an accessToken
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}         email     User's email
 * @apiParam  {String{..128}}  password  User's password
 *
 * @apiSuccess  {String}  user.id             User's id
 * @apiSuccess  {String}  user.lastname       User's lastname
 * @apiSuccess  {String}  user.firstname      User's firstname
 * @apiSuccess  {String}  user.email          User's email
 * @apiSuccess  {String}  user.role           User's role
 * @apiSuccess  {Date}    user.createdAt      Timestamp
 *
 * @apiError (Bad Request 400)  APIError        Some parameters may contain invalid values
 * @apiError (Unauthorized 401) Unauthorized    Incorrect email or password
 */
router.route('/login').post(validate(login), controller.login);

/**
 * @api {post} v1/auth/refresh-token Refresh Token
 * @apiDescription Refresh expired accessToken
 * @apiVersion 1.0.0
 * @apiName RefreshToken
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  refreshToken  Refresh token aquired when user logged in
 *
 * @apiSuccess  {String}  user.id             User's id
 * @apiSuccess  {String}  user.lastname       User's lastname
 * @apiSuccess  {String}  user.firstname      User's firstname
 * @apiSuccess  {String}  user.email          User's email
 * @apiSuccess  {String}  user.role           User's role
 * @apiSuccess  {Date}    user.createdAt      Timestamp
 *
 * @apiError (Bad Request 400)  APIError        Some parameters may contain invalid values
 * @apiError (Unauthorized 401) Unauthorized    Invalid refreshToken
 */
router.route('/refresh-token').post(controller.refresh);

/**
 * @api {post} v1/auth/logout Logout
 * @apiDescription Revoke all authentication tokens
 * @apiVersion 1.0.0
 * @apiName Logout
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  Cookie.refreshToken     Refresh token aquired when user logged in
 * @apiParam  {String}  Cookie.accessTokenHP    Access Token Payload aquired when user logged in
 * @apiParam  {String}  Cookie.accessTokenS     Access token Signature aquired when user logged in
 *
 * @apiSuccess  {String}  user.id             User's id
 * @apiSuccess  {String}  user.lastname       User's lastname
 * @apiSuccess  {String}  user.firstname      User's firstname
 * @apiSuccess  {String}  user.email          User's email
 * @apiSuccess  {String}  user.role           User's role
 * @apiSuccess  {Date}    user.createdAt      Timestamp
 *
 * @apiError (Bad Request 400)  APIError        Some parameters may contain invalid values
 * @apiError (Unauthorized 401) Unauthorized    Invalid refreshToken
 */
router.route('/logout').post(controller.logout);

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
router
  .route('/password/recovery-request')
  .post(validate(sendPasswordReset), controller.sendPasswordReset);

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
router.route('/password/reset').put(validate(passwordReset), controller.resetPassword);

/**
 * @api {put} v1/auth/password/change Change Password
 * @apiDescription Change the password of a user account
 * @apiVersion 1.0.0
 * @apiName Change Password
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}      password        User current password
 * @apiParam  {String}      newPassword     New user password
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Unauthorized 401) APIError  Invalid current Password
 * @apiError (Bad Request 400)  APIError  Some parameters may contain invalid values
 */
router
  .route('/password/change')
  .put(authorize(), validate(passwordChange), controller.changePassword);

/**
 * @api {post} v1/auth/facebook Facebook Login
 * @apiDescription Login with facebook. Creates a new user if it does not exist
 * @apiVersion 1.0.0
 * @apiName FacebookLogin
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  access_token  Facebook's access_token
 *
 * @apiSuccess {String}  tokenType     Access Token's type
 * @apiSuccess {String}  accessToken   Authorization Token
 * @apiSuccess {String}  refreshToken  Token to get a new accessToken after expiration time
 * @apiSuccess {Number}  expiresIn     Access Token's expiration time in miliseconds
 *
 * @apiError (Bad Request 400)  APIError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized    Incorrect access_token
 */
router.route('/facebook').post(validate(oAuthRequest), oAuth('facebook'), controller.oAuth);

/**
 * @api {post} v1/auth/google Google Login
 * @apiDescription Login with google. Creates a new user if it does not exist
 * @apiVersion 1.0.0
 * @apiName GoogleLogin
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  access_token  Google's access_token
 *
 * @apiSuccess {String}  tokenType     Access Token's type
 * @apiSuccess {String}  accessToken   Authorization Token
 * @apiSuccess {String}  refreshToken  Token to get a new accpessToken after expiration time
 * @apiSuccess {Number}  expiresIn     Access Token's expiration time in miliseconds
 *
 * @apiError (Bad Request 400)  APIError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized    Incorrect access_token
 */
router.route('/google').post(validate(oAuthRequest), oAuth('google'), controller.oAuth);

/**
 * @api {post} v1/auth/account/deletion-request Send Account Deletion Request Email
 * @apiDescription Send a code to delete the user account
 * @apiVersion 1.0.0
 * @apiName Send Account Deletion Request
 * @apiGroup Auth
 * @apiPermission user
 *
 * @apiParam    {String}    password    User's password
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Unauthorized 401) Unauthorized    Only authenticated users can delete an account
 * @apiError (Forbidden 403)    Forbidden       Only user with same id or admins can delete an
 *                                              account
 * @apiError (Bad Request 400)  APIError        Some parameters may contain invalid values
 */
router
  .route('/account/deletion-request')
  .post(authorize(), validate(accountDeletionRequest), controller.sendAccountDeletionCode);

/**
 * @api {delete} v1/auth/account Delete Account
 * @apiDescription Delete the user account
 * @apiVersion 1.0.0
 * @apiName Delete Account
 * @apiGroup Auth
 * @apiPermission user
 *
 * @apiParam    {String}    password    User's password
 * @apiParam    {String}    code        User's validation code
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Unauthorized 401) Unauthorized    Invalid Code
 * @apiError (Unauthorized 401) Unauthorized    Only authenticated users can delete an account
 * @apiError (Forbidden 403)    Forbidden       Only user with same id or admins can delete
 *                                              an account
 * @apiError (Bad Request 400)  APIError        Some parameters may contain invalid values
 */
router.route('/account').delete(authorize(), validate(accountDeletion), controller.deleteAccount);

/**
 * @api {post} v1/auth/id/change-request Send Login Change Request Email
 * @apiDescription Send a code to change the user login
 * @apiVersion 1.0.0
 * @apiName Send Login Change Request
 * @apiGroup Auth
 * @apiPermission user
 *
 * @apiParam    {String}    password    User's password
 * @apiParam    {String}    newEmail    User's new email
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Unauthorized 401) Unauthorized    Only authenticated users can change the login
 * @apiError (Forbidden 403)    Forbidden       Only user with same id or admins can change a login
 * @apiError (Bad Request 400)  APIError        Some parameters may contain invalid values
 */
router
  .route('/id/change-request')
  .post(authorize(), validate(loginChangeRequest), controller.sendAccountLoginChangeCode);

/**
 * @api {put} v1/auth/id/change Change User ID
 * @apiDescription Change the user id
 * @apiVersion 1.0.0
 * @apiName Change User ID
 * @apiGroup Auth
 * @apiPermission user
 *
 * @apiParam    {String}    password    User's password
 * @apiParam    {String}    code        User's validation code
 * @apiParam    {String}    newEmail    User's new Login
 *
 * @apiSuccess  {String}    status      Status success
 * @apiSuccess  {String}    code        Status success code
 * @apiSuccess  {String}    message     Status success message
 *
 * @apiError (Unauthorized 401) Unauthorized    Invalid Code
 * @apiError (Unauthorized 401) Unauthorized    Only authenticated users can delete an account
 * @apiError (Forbidden 403)    Forbidden       Only user with same id or admins can delete
 *                                              an account
 * @apiError (Bad Request 400)  APIError        Some parameters may contain invalid values
 */
router.route('/id/change').put(authorize(), validate(loginChange), controller.changeUserLogin);

module.exports = router;
