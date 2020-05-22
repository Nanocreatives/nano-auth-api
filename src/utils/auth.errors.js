const httpStatus = require('http-status');

module.exports = {
    INVALID_CREDENTIAL: {
        status: httpStatus.UNAUTHORIZED,
        code: "INVALID_CREDENTIAL",
        message: "Invalid credentials",
        isPublic: true
    },
    LOCKED_ON_NEXT_FAILED_ATTEMPT: {
        status: httpStatus.UNAUTHORIZED,
        code: "LOCKED_ON_NEXT_FAILED_ATTEMPT",
        message: "Invalid credentials. Account will be locked on next failed attempt",
        isPublic: true
    },
    ACCOUNT_UNVERIFIED: {
        status: httpStatus.UNAUTHORIZED,
        code: "ACCOUNT_UNVERIFIED",
        message: "Account not verified",
        isPublic: true
    },
    MUST_CHANGE_PASSWORD: {
        status: httpStatus.UNAUTHORIZED,
        code: "MUST_CHANGE_PASSWORD",
        message: "Your password is not valid anymore. Please change it",
        isPublic: true
    },
    ACCOUNT_LOCKED: {
        status: httpStatus.UNAUTHORIZED,
        code: "ACCOUNT_LOCKED",
        message: "Account locked",
        isPublic: true
    },
    NOT_FOUND: {
        status: httpStatus.NOT_FOUND,
        code: "NOT_FOUND",
        message: 'User does not exist'
    }
};