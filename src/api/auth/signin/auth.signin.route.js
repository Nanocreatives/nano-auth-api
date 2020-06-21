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
 * @apiGroup Auth Signing
 * @apiPermission public
 *
 * @apiParam  {String}         email     User's email
 * @apiParam  {String{..128}}  password  User's password
 *
 * @apiSuccess {String}  id         User's id
 * @apiSuccess {String}  lastname   User's lastname
 * @apiSuccess {String}  firstname  User's firstname
 * @apiSuccess {String}  email      User's email
 * @apiSuccess {String}  role       User's role
 * @apiSuccess {String}  phone      User's phone number
 * @apiSuccess {String}  country    User's country
 * @apiSuccess {String}  picture    User's profile picture
 * @apiSuccess {Boolean} verified   User's account verification status
 * @apiSuccess {Date}    createdAt  User's account date of creation
 * @apiSuccess {Date}    birthdate  User's birthdate
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
 * @apiGroup Auth Signing
 * @apiPermission public
 *
 * @apiParam  {String}  refreshToken  Refresh token aquired when user logged in
 *
 * @apiSuccess {String}  id         User's id
 * @apiSuccess {String}  lastname   User's lastname
 * @apiSuccess {String}  firstname  User's firstname
 * @apiSuccess {String}  email      User's email
 * @apiSuccess {String}  role       User's role
 * @apiSuccess {String}  phone      User's phone number
 * @apiSuccess {String}  country    User's country
 * @apiSuccess {String}  picture    User's profile picture
 * @apiSuccess {Boolean} verified   User's account verification status
 * @apiSuccess {Date}    createdAt  User's account date of creation
 * @apiSuccess {Date}    birthdate  User's birthdate
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
 * @apiGroup Auth Signing
 * @apiPermission public
 *
 * @apiParam  {String}  Cookie.refreshToken     Refresh token aquired when user logged in
 * @apiParam  {String}  Cookie.accessTokenHP    Access Token Payload aquired when user logged in
 * @apiParam  {String}  Cookie.accessTokenS     Access token Signature aquired when user logged in
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
 * @apiGroup Auth Social Signing
 * @apiPermission public
 *
 * @apiParam  {String}  access_token  Facebook's access_token
 *
 * @apiSuccess {String}  tokenType     Access Token's type
 * @apiSuccess {String}  id         User's id
 * @apiSuccess {String}  lastname   User's lastname
 * @apiSuccess {String}  firstname  User's firstname
 * @apiSuccess {String}  email      User's email
 * @apiSuccess {String}  role       User's role
 * @apiSuccess {String}  phone      User's phone number
 * @apiSuccess {String}  country    User's country
 * @apiSuccess {String}  picture    User's profile picture
 * @apiSuccess {Boolean} verified   User's account verification status
 * @apiSuccess {Date}    createdAt  User's account date of creation
 * @apiSuccess {Date}    birthdate  User's birthdate
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
 * @apiGroup Auth Social Signing
 * @apiPermission public
 *
 * @apiParam  {String}  access_token  Google's access_token
 *
 * @apiSuccess {String}  id         User's id
 * @apiSuccess {String}  lastname   User's lastname
 * @apiSuccess {String}  firstname  User's firstname
 * @apiSuccess {String}  email      User's email
 * @apiSuccess {String}  role       User's role
 * @apiSuccess {String}  phone      User's phone number
 * @apiSuccess {String}  country    User's country
 * @apiSuccess {String}  picture    User's profile picture
 * @apiSuccess {Boolean} verified   User's account verification status
 * @apiSuccess {Date}    createdAt  User's account date of creation
 * @apiSuccess {Date}    birthdate  User's birthdate
 *
 * @apiError (Bad Request 400)  APIError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized    Incorrect access_token
 */
router.route('/google').post(validate(oAuthRequest), oAuth('google'), controller.oAuth);

module.exports = router;
