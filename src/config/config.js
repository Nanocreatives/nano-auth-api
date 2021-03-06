const dotEnv = require('dotenv');

dotEnv.config();

const config = {
    appName: process.env.APP_NAME,
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    version: process.env.VERSION,
    cookieParserSecret: process.env.EXPRESS_COOKIE_PARSER_SECRET,
    mongo: {
        host: process.env.MONGO_HOST
    },
    auth: {
        accountVerification: process.env.AUTH_ACCOUNT_VERIFICATION === 'true',
        maxLoginAttempt: parseInt(process.env.AUTH_MAX_LOGIN_ATTEMPT, 10),
        lockDelay: process.env.AUTH_LOCK_DELAY,
        lastPasswordRestriction: process.env.AUTH_LAST_PASSWORD_RESTRICTION,
        accessTokenValidity: process.env.AUTH_ACCESS_TOKEN_VALIDITY,
        refreshTokenValidity: process.env.AUTH_REFRESH_TOKEN_VALIDITY,
        jwtSecret: process.env.AUTH_JWT_SECRET
    },
    email: {
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        username: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM,
        appName: process.env.EMAIL_APP_NAME,
        appLogo: process.env.EMAIL_APP_LOGO,
        appWebsiteUrl: process.env.EMAIL_APP_WEBSITE_URL,
        passwordResetUrl: process.env.EMAIL_PASSWORD_RESET_URL,
        accountVerificationUrl: process.env.EMAIL_ACCOUNT_VERIFICATION_URL
    },
    google: {
        recaptcha: {
            secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY
        }
    }
};

module.exports = config;
