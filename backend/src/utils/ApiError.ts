import type { ApiFieldError } from '@/shared';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors?: ApiFieldError[];

  constructor(status: number, message: string, code = 'ERROR', errors?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }

  static badRequest(message = 'Bad request', code = 'BAD_REQUEST', errors?: ApiFieldError[]) {
    return new ApiError(400, message, code, errors);
  }

  static unauthorized(message = 'Please sign in to continue', code = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }

  static forbidden(message = 'You do not have access to this resource', code = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static conflict(message: string, code = 'CONFLICT', errors?: ApiFieldError[]) {
    return new ApiError(409, message, code, errors);
  }

  static validation(errors: ApiFieldError[], message = 'Please check the highlighted fields') {
    return new ApiError(422, message, 'VALIDATION_ERROR', errors);
  }
}
