const express = require('express');
const { validate } = require('express-validation');

const controller = require('./auth.terminate.controller');
const { authorize } = require('../../../middlewares/auth');
const { accountDeletion, accountDeletionRequest } = require('./auth.terminate.validation');

const router = express.Router();

/**
 * @api {post} v1/auth/terminate/request Send Account Deletion Request Email
 * @apiDescription Send a code to delete the user account
 * @apiVersion 1.0.0
 * @apiName Send Account Deletion Request
 * @apiGroup Auth Extermination
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
  .route('/request')
  .post(authorize(), validate(accountDeletionRequest), controller.sendAccountDeletionCode);

/**
 * @api {delete} v1/auth/terminate Delete Account
 * @apiDescription Delete the user account
 * @apiVersion 1.0.0
 * @apiName Delete Account
 * @apiGroup Auth Extermination
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
router.route('/').delete(authorize(), validate(accountDeletion), controller.deleteAccount);

module.exports = router;
