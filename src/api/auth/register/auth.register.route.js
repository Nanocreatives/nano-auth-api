const express = require('express');
const { validate } = require('express-validation');

const controller = require('./auth.register.controller');
const { register, verifyAccount, sendAccountVerification } = require('./auth.register.validation');

const router = express.Router();

/**
 * @api {post} v1/auth/register Register
 * @apiDescription Register a new user
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup Auth Registration
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
router.route('/').post(validate(register), controller.register);

/**
 * @api {post} v1/auth/register/verify/request Send Verification Token
 * @apiDescription Send a verification account token to verify a new registered account
 * @apiVersion 1.0.0
 * @apiName Send Verification
 * @apiGroup Auth Registration
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
 * @api {put} v1/auth/register/verify Verify Account
 * @apiDescription Verify a registered account
 * @apiVersion 1.0.0
 * @apiName Verify
 * @apiGroup Auth Registration
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

module.exports = router;
