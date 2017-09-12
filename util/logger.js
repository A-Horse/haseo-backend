import winston from 'winston';

const logger = new winston.Logger({
  transports: [new winston.transports.Console({ level: 'info' })({
    timestamp: function() {
      return Date.now();
    }
  })]
});

export default logger;
