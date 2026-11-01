import { connectDatabase, createAllIndexes, disconnectDatabase } from '../db/connect';

/** Builds all database indexes. Run once per environment and after schema index changes. */
try {
  await connectDatabase();
  const models = await createAllIndexes();
  console.log(`Indexes are up to date for: ${models.join(', ')}`);
} catch (error) {
  console.error(`Index build failed: ${(error as Error).message}`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase().catch(() => undefined);
}
