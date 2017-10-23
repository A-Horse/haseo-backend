import winston from 'winston';
import moment from 'moment';

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      timestamp: function() {
        return moment().format('YYYY-MM-DD HH:mm:ss');
      }
    })
  ]
});

export default logger;
