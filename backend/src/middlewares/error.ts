import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';
import { ApiError } from '../utils/ApiError';

export const notFound: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
};

interface MongoServerError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface BodyParserError {
  type?: string;
  status?: number;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if (err instanceof ZodError) {
    error = ApiError.validation(err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })));
  } else if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest('Invalid identifier', 'INVALID_ID');
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = ApiError.validation(
      Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
    );
  } else if ((err as MongoServerError)?.code === 11000) {
    const field = Object.keys((err as MongoServerError).keyValue ?? {})[0] ?? 'field';
    error = ApiError.conflict(`This ${field} is already in use`, 'DUPLICATE', [{ path: field, message: 'already_exists' }]);
  } else if ((err as BodyParserError)?.type === 'entity.too.large') {
    error = new ApiError(413, 'Request body is too large', 'PAYLOAD_TOO_LARGE');
  } else if ((err as BodyParserError)?.type === 'entity.parse.failed') {
    error = ApiError.badRequest('Malformed JSON body', 'INVALID_JSON');
  } else {
    logger.error({ err, method: req.method, url: req.originalUrl }, 'Unhandled error');
    error = new ApiError(500, 'Something went wrong. Please try again.', 'INTERNAL_ERROR');
  }

  if (error.status >= 500 && err instanceof ApiError) {
    logger.error({ code: error.code, url: req.originalUrl }, error.message);
  }

  // Admins see the underlying cause of unexpected errors, so production issues can be read from the browser.
  const detail = error.code === 'INTERNAL_ERROR' && req.user?.role === 'admin' && err instanceof Error ? err.message : undefined;

  res.status(error.status).json({
    success: false,
    message: error.message,
    code: error.code,
    ...(error.errors ? { errors: error.errors } : {}),
    ...(detail ? { detail } : {}),
  });
};
