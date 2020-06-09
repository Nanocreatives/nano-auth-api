const express = require('express');
const { validate } = require('express-validation');

const controller = require('./auth.id.controller');
const { authorize } = require('../../../middlewares/auth');
const { loginChange, loginChangeRequest } = require('./auth.id.validation');

const router = express.Router();

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
  .route('/change-request')
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
router.route('/change').put(authorize(), validate(loginChange), controller.changeUserLogin);

module.exports = router;
