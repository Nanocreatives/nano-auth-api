const express = require('express');
const { validate } = require('express-validation');

const controller = require('./auth.signin.controller');
const { oAuth } = require('../../../middlewares/auth');
const { login, oAuthRequest } = require('./auth.signin.validation');

const router = express.Router();

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
 * @api {post} v1/auth/refresh Refresh Token
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
router.route('/refresh').post(controller.refresh);

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

module.exports = router;
