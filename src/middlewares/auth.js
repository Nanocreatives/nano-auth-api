const httpStatus = require('http-status');
const jwt = require('jwt-simple');
const moment = require('moment-timezone');

const User = require('../api/user/user.model');
const config = require('../config/config');
const APIError = require('../utils/APIError');
const authProvider = require('../services/auth.provider');

const ADMIN = 'admin';
const SUPER_ADMIN = 'super-admin';
const LOGGED_USER = '_loggedUser';

exports.ADMIN = ADMIN;
exports.SUPER_ADMIN = SUPER_ADMIN;
exports.LOGGED_USER = LOGGED_USER;

exports.authorize = (roles = User.roles) => async (req, res, next) => {
  let user;
  const error = new APIError({
    message: 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: undefined
  });

  const authHeader = req.headers.authorization;
  let tokenHeaderPayload;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    tokenHeaderPayload = authHeader.substring(7, authHeader.length);
  }
  const tokenHeaderPayloadCookie = req.cookies.access_token_hp;
  const tokenSignatureCookie = req.signedCookies.access_token_s;

  if (
    !tokenSignatureCookie ||
    !tokenHeaderPayload ||
    !tokenHeaderPayloadCookie ||
    tokenHeaderPayload !== tokenHeaderPayloadCookie
  ) {
    return next(error);
  }

  try {
    const decoded = jwt.decode(
      `${tokenHeaderPayloadCookie}.${tokenSignatureCookie}`,
      config.auth.jwtSecret
    );
    if (moment().isAfter(decoded.exp)) {
      error.message = 'Token Expired';
      return next(error);
    }
    user = await User.get(decoded.sub);
  } catch (e) {
    error.stack = e.stack;
    return next(error);
  }

  if (!user) {
    return next(error);
  }
  if (roles === LOGGED_USER) {
    if (
      user.role !== SUPER_ADMIN &&
      user.role !== ADMIN &&
      req.params.userId !== user._id.toString()
    ) {
      error.status = httpStatus.FORBIDDEN;
      error.message = 'Forbidden';
      return next(error);
    }
  } else if (!roles.includes(user.role)) {
    error.status = httpStatus.FORBIDDEN;
    error.message = 'Forbidden';
    return next(error);
  }

  req.user = user;

  return next();
};

exports.oAuth = (service) => async (req, res, next) => {
  try {
    const providerAccessToken = req.body.access_token;
    const userData = await authProvider[service](providerAccessToken);
    const user = await User.oAuthLogin(userData);
    req.user = user;
    return next();
  } catch (e) {
    const error = new APIError({
      message: 'Unauthorized',
      status: httpStatus.UNAUTHORIZED,
      stack: e.stack
    });
    return next(error);
  }
};
