const dotEnv = require('dotenv');

dotEnv.config();

const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    version: process.env.VERSION,
    mongo: {
        host: process.env.MONGO_HOST,
    },
    auth: {
        maxLoginAttempt: process.env.AUTH_MAX_LOGIN_ATTEMPT,
        lockDelay: process.env.AUTH_LOCK_DELAY,
        lastPasswordRestriction: process.env.AUTH_LAST_PASSWORD_RESTRICTION,
        accessTokenValidity: process.env.AUTH_ACCESS_TOKEN_VALIDITY,
        refreshTokenValidity: process.env.AUTH_REFRESH_TOKEN_VALIDITY,
        jwt: {
            secret: process.env.AUTH_JWT_SECRET,
            expirationInterval: process.env.AUTH_JWT_EXPIRATION_INTERVAL,
        },
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        username: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD,
    }
};

module.exports = config;