const express = require('express');
const { validate } = require('express-validation');

const controller = require('./user.controller');
const { authorize, ADMIN } = require('../../middlewares/auth');
const {
  listUsers,
  createUser,
  replaceUser,
  updateUser,
  updateUserProfile
} = require('./user.validation');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */
router.param('userId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/users List Users
   * @apiDescription Get a list of users
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
   * @apiParam  {String}             [lastname]   User's lastname
   * @apiParam  {String}             [firstname]  User's firstname
   * @apiParam  {String}             [email]      User's email
   * @apiParam  {String{..20}}       [phone]      User's phone number
   * @apiParam  {String{..128}}      [country]    User's country
   * @apiParam  {Boolean}            [verified]   User's account verification status
   * @apiParam  {String=user,admin}  [role]       User's role
   *
   * @apiSuccess {Object[]} users List of users.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(authorize(ADMIN), validate(listUsers), controller.list)
  /**
   * @api {post} v1/users Create User
   * @apiDescription Create a new user
   * @apiVersion 1.0.0
   * @apiName CreateUser
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             email        User's email
   * @apiParam  {String{6..128}}     password     User's password
   * @apiParam  {String{..128}}      [firstname]  User's firstname
   * @apiParam  {String{..128}}      [lastname]   User's lastname
   * @apiParam  {String{..20}}       [phone]      User's phone number
   * @apiParam  {String{..128}}      [country]    User's country
   * @apiParam  {String{..128}}      [picture]    User's profile picture
   * @apiParam  {Date}               [birthdate]  User's date of birth
   * @apiParam  {Boolean}            [verified]   User's account verification status
   * @apiParam  {String=user,admin}  [role]       User's role
   *
   * @apiSuccess (Created 201) {String}  id           User's id
   * @apiSuccess (Created 201) {String}  firstname    User's name
   * @apiSuccess (Created 201) {String}  lastname     User's name
   * @apiSuccess (Created 201) {String}  email        User's email
   * @apiSuccess (Created 201) {String}  role         User's role
   * @apiSuccess (Created 201) {String}  phone        User's phone
   * @apiSuccess (Created 201) {String}  country      User's country
   * @apiSuccess (Created 201) {String}  picture      User's profile picture
   * @apiSuccess (Created 201) {Boolean} verified     User's account verification status
   * @apiSuccess (Created 201) {Date}    createdAt    User's account date of creation
   * @apiSuccess (Created 201) {Date}    birthdate    User's birthdate
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(ADMIN), validate(createUser), controller.create);

router
  .route('/profile')
  /**
   * @api {get} v1/users/profile User Profile
   * @apiDescription Get logged in user profile information
   * @apiVersion 1.0.0
   * @apiName UserProfile
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
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
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated Users can access the data
   */
  .get(authorize(), controller.loggedIn)
  /**
   * @api {patch} v1/users/profile Update Profile
   * @apiDescription Update some fields of a user profile information
   * @apiVersion 1.0.0
   * @apiName UpdateProfile
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String{..128}}      [firstname]    User's firstname
   * @apiParam  {String{..128}}      [lastname]     User's lastname
   * @apiParam  {String{..20}}       [phone]        User's phone number
   * @apiParam  {String{..128}}      [country]      User's country
   * @apiParam  {String{..128}}      [picture]      User's profile picture
   * @apiParam  {Date}               [birthdate]    User's date of birth
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
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .patch(authorize(), validate(updateUserProfile), controller.updateUserProfile);

router
  .route('/:userId')
  /**
   * @api {get} v1/users/:id Get User
   * @apiDescription Get user information
   * @apiVersion 1.0.0
   * @apiName GetUser
   * @apiGroup User
   * @apiPermission Admin
   *
   * @apiHeader {String} Authorization   User's access token
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
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .get(authorize(ADMIN), controller.get)
  /**
   * @api {put} v1/users/:id Replace User
   * @apiDescription Replace the whole user document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceUser
   * @apiGroup User
   * @apiPermission Admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             email        User's email
   * @apiParam  {String{6..128}}     password     User's password
   * @apiParam  {String{..128}}      [firstname]  User's firstname
   * @apiParam  {String{..128}}      [lastname]   User's lastname
   * @apiParam  {String{..20}}       [phone]      User's phone number
   * @apiParam  {String{..128}}      [country]    User's country
   * @apiParam  {String{..128}}      [picture]    User's profile picture
   * @apiParam  {Date}               [birthdate]  User's date of birth
   * @apiParam  {Boolean}            [verified]   User's account verification status
   * @apiParam  {String=user,admin}  [role]       User's role
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
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .put(authorize(ADMIN), validate(replaceUser), controller.replace)
  /**
   * @api {patch} v1/users/:id Update User
   * @apiDescription Update some fields of a user document
   * @apiVersion 1.0.0
   * @apiName UpdateUser
   * @apiGroup User
   * @apiPermission Admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {String}             email        User's email
   * @apiParam  {String{6..128}}     password     User's password
   * @apiParam  {String{..128}}      [firstname]  User's firstname
   * @apiParam  {String{..128}}      [lastname]   User's lastname
   * @apiParam  {String{..20}}       [phone]      User's phone number
   * @apiParam  {String{..128}}      [country]    User's country
   * @apiParam  {String{..128}}      [picture]    User's profile picture
   * @apiParam  {Date}               [birthdate]  User's date of birth
   * @apiParam  {Boolean}            [verified]   User's account verification status
   * @apiParam  {String=user,admin}  [role]       User's role
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
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .patch(authorize(ADMIN), validate(updateUser), controller.update)
  /**
   * @api {patch} v1/users/:id Delete User
   * @apiDescription Delete a user
   * @apiVersion 1.0.0
   * @apiName DeleteUser
   * @apiGroup User
   * @apiPermission Admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only user with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      User does not exist
   */
  .delete(authorize(ADMIN), controller.remove);

module.exports = router;
