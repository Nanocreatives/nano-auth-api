const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const methodOverride = require('method-override');
const helmet = require('helmet');
const expressWinston = require('express-winston');

const config = require('./config');
const logger = require('./logger');
const routes = require('../routes');
const error = require('../middlewares/error');
const correlator = require('../middlewares/correlator');

const app = express();

// request logging. dev: console | production: file
const morganFormat = config.env === 'development' ? 'dev' : 'combined';
app.use(
    morgan(morganFormat, {
        skip: (req, res) => {
            return res.statusCode < 400;
        },
        stream: process.stderr
    })
);
app.use(
    morgan(morganFormat, {
        skip: (req, res) => {
            return res.statusCode >= 400;
        },
        stream: process.stdout
    })
);

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser(config.cookieParserSecret));
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
const corsConfig = {
    origin: true,
    credentials: true
};

app.use(cors(corsConfig));

// enable detailed API logging in dev env
if (config.env) {
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    expressWinston.bodyBlacklist.push('password');
    app.use(
        expressWinston.logger({
            transports: logger.inoutTransport,
            meta: true,
            msg:
                'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms {{req.ip}}',
            colorStatus: false,
            headerBlacklist: ['authorization', 'cookie']
        })
    );
}

// Correlator Middleware to Get and/or Set Correlation ID
app.use(correlator);

// Routes Configuration
app.use('/', routes);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);
// catch 404 and forward to error handler
app.use(error.notFound);
// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
