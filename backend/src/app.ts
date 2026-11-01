import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env, isProduction } from './config/env';
import { ensureDatabase } from './db/connect';
import { logger } from './lib/logger';
import { errorHandler, notFound } from './middlewares/error';
import { apiLimiter } from './middlewares/rateLimit';
import { sanitizeBody } from './middlewares/sanitize';
import { routes } from './routes';

/**
 * The Express app, exported as the default so Vercel can run it as a function.
 * `server.ts` wraps the same app in a regular HTTP server for other hosts.
 */
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(
  cors({
    origin: [env.CLIENT_URL, env.ADMIN_URL].map((url) => url.replace(/\/+$/, '')),
    credentials: true,
  }),
);
// Vercel's edge already compresses responses; doing it again would only burn function CPU.
if (!process.env.VERCEL) app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(sanitizeBody);

if (!isProduction) {
  app.use((req, res, next) => {
    const start = performance.now();
    res.on('finish', () => {
      logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} ${Math.round(performance.now() - start)}ms`);
    });
    next();
  });
}

app.use('/api/v1', apiLimiter, ensureDatabase, routes);
app.use(notFound);
app.use(errorHandler);

export default app;
