import { createLogger, format, transports } from 'winston';
import * as path from 'path';

const { combine, timestamp, printf } = format;

const argv = require('optimist').argv;
const consoleLogLevel = argv.logLevel || 'verbose';

const formatLog = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

export const logger = createLogger({
  format: combine(timestamp(), formatLog),
  transports: [
    new transports.Console({ level: consoleLogLevel }),
    new transports.File({
      filename: path.resolve(__dirname, '../../log/', 'error.log'),
      level: 'error'
    }),
    new transports.File({
      filename: path.resolve(__dirname, '../../log/', 'combined.log')
    })
  ]
});

export const pipelineLogger = createLogger({
  format: combine(timestamp(), formatLog),
  transports: [
    new transports.Console({ level: consoleLogLevel }),
    new transports.File({
      filename: path.resolve(__dirname, '../../log/', 'pipelineLogger-error.log'),
      level: 'error'
    }),
    new transports.File({
      filename: path.resolve(__dirname, '../../log/', 'pipelineLogger-combined.log')
    })
  ]
});

export const taskLogger = createLogger({
  format: combine(timestamp(), formatLog),
  transports: [new transports.Console({ level: consoleLogLevel })]
});

export const repoLogger = createLogger({
  format: combine(timestamp(), formatLog),
  transports: [new transports.Console({ level: consoleLogLevel })]
});

export const expressLogger = createLogger({
  format: combine(timestamp(), formatLog),
  transports: [new transports.Console({ level: consoleLogLevel })]
});

export default logger;
