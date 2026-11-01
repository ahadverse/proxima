import type { Readable } from 'node:stream';
import busboy from 'busboy';
import type { Request } from 'express';
import { ApiError } from '../utils/ApiError';

export interface IncomingFile {
  /** Ends early with `truncated` set once the file passes the size limit. */
  stream: Readable & { truncated?: boolean };
  fileName: string;
  mimeType: string;
}

export const fileTooLarge = () => new ApiError(413, 'This file is too large', 'FILE_TOO_LARGE');

/**
 * Streams the `file` field of a multipart request into `handle` without
 * buffering the whole body in the parser.
 */
export function receiveFile<T>(req: Request, maxBytes: number, handle: (file: IncomingFile) => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let parser: busboy.Busboy;
    try {
      parser = busboy({ headers: req.headers, limits: { files: 1, fields: 0, fileSize: maxBytes } });
    } catch {
      reject(ApiError.badRequest('Expected a multipart file upload', 'INVALID_UPLOAD'));
      return;
    }

    let task: Promise<T> | null = null;

    parser.on('file', (field, stream, info) => {
      if (field !== 'file' || task) {
        stream.resume();
        return;
      }
      task = handle({ stream, fileName: info.filename ?? 'file', mimeType: info.mimeType });
      // Drain the rest after a failure so the parser can finish and the error reaches the client.
      task.catch(() => {
        stream.unpipe();
        stream.resume();
      });
    });

    parser.on('error', () => reject(ApiError.badRequest('The upload was interrupted', 'UPLOAD_INTERRUPTED')));
    parser.on('close', () => {
      if (!task) reject(ApiError.badRequest('No file was uploaded', 'NO_FILE'));
      else task.then(resolve, reject);
    });

    req.pipe(parser);
  });
}
