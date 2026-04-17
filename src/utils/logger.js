const { createLogger, format, transports } = require('winston');
const path = require('path');
const config = require('../config');

const { combine, timestamp, printf, colorize, errors } = format;

const logLineFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: config.logLevel || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logLineFormat
  ),
  transports: [
    new transports.Console({
      format: combine(colorize({ all: true }), logLineFormat),
    }),
    ...(config.env === 'production'
      ? [
          new transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
          }),
          new transports.File({
            filename: path.join('logs', 'combined.log'),
          }),
        ]
      : []),
  ],
});

module.exports = logger;
