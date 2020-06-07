const { createLogger, format, transports } = require('winston');

const config = require('./config');

function formatParams(info) {
  const { timestamp, level, message, ...args } = info;
  const ts = timestamp.slice(0, 19).replace('T', ' ');

  return `${ts} ${level}: ${message} ${
    Object.keys(args).length ? JSON.stringify(args, '', '') : ''
  }`;
}

const fileFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.json()
);

const consoleFormat = format.combine(
  format.timestamp(),
  format.align(),
  format.colorize(),
  format.printf(formatParams)
);

const options = {
  error: {
    level: 'error',
    filename: 'logs/error.log',
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: fileFormat
  },
  combined: {
    level: 'debug',
    filename: 'logs/app.log',
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: fileFormat
  },
  inout: {
    level: 'debug',
    filename: 'logs/request.log',
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: fileFormat
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    format: consoleFormat
  }
};

const logger = createLogger({
  level: 'info',
  transports: [new transports.File(options.error), new transports.File(options.combined)]
});

logger.inoutTransport = [new transports.File(options.inout)];
//
// If we're not in production then log to the `console` with the format:
//
if (config.env === 'development') {
  logger.add(new transports.Console(options.console));
}

module.exports = logger;
