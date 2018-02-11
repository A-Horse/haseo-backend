import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

const argv = require('optimist').argv;
const consoleLogLevel = argv.logLevel || 'verbose';

const formatLog = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = new createLogger({
  format: combine(timestamp(), formatLog),
  transports: [new transports.Console({ level: consoleLogLevel })]
});

export const pipelineLogger = new createLogger({
  format: combine(timestamp(), formatLog),
  transports: [new transports.Console({ level: consoleLogLevel })]
});

export const taskLogger = new createLogger({
  format: combine(timestamp(), formatLog),
  transports: [new transports.Console({ level: consoleLogLevel })]
});

export const repoLogger = new createLogger({
  format: combine(timestamp(), formatLog),
  transports: [new transports.Console({ level: consoleLogLevel })]
});

export const expressLogger = new createLogger({
  format: combine(timestamp(), formatLog),
  transports: [new transports.Console({ level: consoleLogLevel })]
});

export default logger;
