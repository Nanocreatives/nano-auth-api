const httpStatus = require('http-status'); // eslint-disable-line max-classes-per-file

/**
 * @extends Error
 */
class ExtendableError extends Error {
    constructor({ code, message, errors, status, isPublic, stack }) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.message = message;
        this.errors = errors;
        this.status = status;
        this.isPublic = isPublic;
        this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
        this.stack = stack;
        // Error.captureStackTrace(this, this.constructor.name);
    }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
    /**
     * Creates an API error.
     * @param {string} code - Error specific code.
     * @param {string} message - Error message.
     * @param {string} errors - Errors
     * @param {object} stack - Error Stack Trace
     * @param {number} status - HTTP status code of error.
     * @param {boolean} isPublic - Whether the message should be visible to user or not.
     */
    constructor({
        code = 'KO',
        message,
        errors,
        stack,
        status = httpStatus.INTERNAL_SERVER_ERROR,
        isPublic = false
    }) {
        super({
            code,
            message,
            errors,
            status,
            isPublic,
            stack
        });
    }
}

module.exports = APIError;
