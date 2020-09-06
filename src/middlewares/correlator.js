const { v4: uuidv4 } = require('uuid');

const config = require('../config/config');
/**
 * Correlator middleware
 * @public
 */
module.exports = (req, res, next) => {
    const correlationID = req.cookies['x-correlation-id'] || uuidv4();
    req.correlationID = correlationID;
    config.correlationID = correlationID;
    res.cookie('x-correlation-id', correlationID, {
        httpOnly: false,
        secure: false,
        sameSite: false
    });
    next();
};
