import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './db/connect';
import { logger } from './lib/logger';

/** Long-running HTTP server for local development and non-serverless hosts. */
async function main() {
  await connectDatabase();
  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}/api/v1`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

main().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start the API');
  process.exit(1);
});
