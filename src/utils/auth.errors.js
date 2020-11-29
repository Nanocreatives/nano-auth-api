const httpStatus = require('http-status');

module.exports = {
    INVALID_CREDENTIAL: {
        status: httpStatus.UNAUTHORIZED,
        code: 'INVALID_CREDENTIAL',
        message: 'Invalid credentials',
        isPublic: true
    },
    LOCKED_ON_NEXT_FAILED_ATTEMPT: {
        status: httpStatus.UNAUTHORIZED,
        code: 'LOCKED_ON_NEXT_FAILED_ATTEMPT',
        message: 'Invalid credentials. Account will be locked on next failed attempt',
        isPublic: true
    },
    ACCOUNT_UNVERIFIED: {
        status: httpStatus.UNAUTHORIZED,
        code: 'ACCOUNT_UNVERIFIED',
        message: 'Account not verified',
        isPublic: true
    },
    MUST_CHANGE_PASSWORD: {
        status: httpStatus.UNAUTHORIZED,
        code: 'MUST_CHANGE_PASSWORD',
        message: 'Your password is not valid anymore. Please change it',
        isPublic: true
    },
    ACCOUNT_LOCKED_ON_FAILED_ATTEMPT: {
        status: httpStatus.UNAUTHORIZED,
        code: 'ACCOUNT_LOCKED_ON_FAILED_ATTEMPT',
        message: 'Your account has been locked',
        isPublic: true
    },
    ACCOUNT_LOCKED: {
        status: httpStatus.UNAUTHORIZED,
        code: 'ACCOUNT_LOCKED',
        message: 'Account locked',
        isPublic: true
    },
    NOT_FOUND: {
        status: httpStatus.NOT_FOUND,
        code: 'NOT_FOUND',
        message: 'Account does not exist'
    },
    PASSWORD_MUST_BE_DIFFERENT: {
        status: httpStatus.BAD_REQUEST,
        code: 'PASSWORD_MUST_BE_DIFFERENT',
        message: 'The new password must be different',
        isPublic: true
    },
    LOGIN_MUST_BE_DIFFERENT: {
        status: httpStatus.BAD_REQUEST,
        code: 'LOGIN_MUST_BE_DIFFERENT',
        message: 'The new login must be different',
        isPublic: true
    },
    UNAUTHORIZED: {
        status: httpStatus.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
        isPublic: true
    },
    INVALID_TOKEN: {
        status: httpStatus.UNAUTHORIZED,
        code: 'INVALID_TOKEN',
        message: 'Token is not valid',
        isPublic: true
    },
    KO_AUTH_TOKEN: {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        code: 'KO_AUTH_TOKEN',
        message: 'Error occured while generating Auth Tokens'
    },
    CAPTCHA: {
        status: httpStatus.TOO_MANY_REQUESTS,
        code: 'KO_CAPTCHA',
        message: 'Error occured while validating captcha'
    }
};
