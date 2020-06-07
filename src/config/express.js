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
const routes = require('../routes/v1');
const error = require('../middlewares/error');

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
app.use(cors());

// enable detailed API logging in dev env
if (config.env === 'development') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(
    expressWinston.logger({
      transports: logger.inoutTransport,
      meta: true, // optional: log meta data about request (defaults to true)
      msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms {{req.ip}}',
      colorStatus: false // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    })
  );
}

// mount api v1 routes
app.use('/v1', routes);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);
// catch 404 and forward to error handler
app.use(error.notFound);
// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
