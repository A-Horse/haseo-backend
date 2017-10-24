import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf } = format;

const formatLog = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = new createLogger({
  format: combine(timestamp(), formatLog),
  transports: [new transports.Console()]
});

export default logger;
