Promise = require('bluebird'); // eslint-disable-line no-global-assign

const { port, env } = require('./config/config');
const logger = require('./config/logger');
const app = require('./config/express');
const mongoose = require('./config/mongoose');

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(port, () => logger.info(`Server started on Port ${port} (${env})`));

/**
 * Exports express
 * @public
 */
module.exports = app;
