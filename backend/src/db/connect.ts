import dns from 'node:dns';
import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { env, isProduction } from '../config/env';
import { logger } from '../lib/logger';

mongoose.set('strictQuery', true);
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

const PUBLIC_RESOLVERS = ['1.1.1.1', '8.8.8.8'];

/** Local DNS proxies (VPNs, filters) often refuse the SRV lookups that mongodb+srv:// URIs need. */
function isSrvLookupFailure(error: unknown): boolean {
  const err = error as { syscall?: string; message?: string } | null;
  return err?.syscall === 'querySrv' || Boolean(err?.message?.includes('querySrv'));
}

async function connect() {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15_000,
    // Serverless instances each hold their own pool, so keep it small.
    maxPoolSize: 10,
    // Building indexes on every cold start costs dozens of round trips; production runs `pnpm db:indexes` instead.
    autoIndex: !isProduction,
  });
}

/** Creates every schema-defined index. Non-destructive: existing indexes are left alone. */
export async function createAllIndexes(): Promise<string[]> {
  await import('./models');
  const models = Object.values(mongoose.models);
  await Promise.all(models.map((model) => model.createIndexes()));
  return models.map((model) => model.modelName);
}

async function establish(): Promise<void> {
  try {
    await connect();
  } catch (error) {
    if (!isSrvLookupFailure(error)) throw error;
    logger.warn(`SRV lookup failed with system DNS (${dns.getServers().join(', ')}); retrying with public resolvers`);
    dns.setServers(PUBLIC_RESOLVERS);
    await connect();
  }
  logger.info(`MongoDB connected (${mongoose.connection.name})`);
}

let connecting: Promise<void> | null = null;

/** Connects once per process; concurrent callers share the same attempt, and a failed attempt can be retried. */
export function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  connecting ??= establish().catch((error) => {
    connecting = null;
    throw error;
  });
  return connecting;
}

/** Opens the connection on the first request, so serverless cold starts don't need a separate boot step. */
export const ensureDatabase: RequestHandler = (_req, _res, next) => {
  connectDatabase().then(() => next(), next);
};

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  connecting = null;
}

export function databaseState(): string {
  const states: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return states[mongoose.connection.readyState] ?? 'unknown';
}
