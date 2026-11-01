import { waitUntil } from '@vercel/functions';
import { logger } from './logger';

/**
 * Runs work after the response is sent. On Vercel the function stays alive until
 * the task settles; on a regular Node server it simply runs in the background.
 */
export function runInBackground(task: Promise<unknown>, label: string): void {
  waitUntil(task.catch((error: Error) => logger.warn({ err: error.message }, `${label} failed`)));
}
