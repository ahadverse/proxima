import pino from 'pino';
import { isProduction } from '../config/env';

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  redact: ['req.headers.cookie', 'password', 'passwordHash', '*.password'],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
      }),
});
