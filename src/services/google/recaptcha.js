const axios = require('axios').default;
const httpStatus = require('http-status');

const { env, google } = require('../../config/config');
const logger = require('../../config/logger');

if (env !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
}

/**
 *  Verify Recaptcha Token.
 *  @param {string} recaptchaToken.
 *  @returns {Promise<>}
 */
const verify = async (recaptchaToken) => {
    try {
        const res = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${google.recaptcha.secretKey}&response=${recaptchaToken}`,
            {}
        );
        if (res.status !== httpStatus.OK) {
            throw res.error || res.data;
        }
        return res.data.success;
    } catch (e) {
        logger.error('Google Recaptcha : Error while trying to verify recaptcha response token', e);
        throw e;
    }
};

module.exports = {
    verify
};
