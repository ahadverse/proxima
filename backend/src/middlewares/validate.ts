import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Parses and replaces req.body / req.query / req.params with the schema output.
 * Express 5 exposes req.query as a getter, so it is redefined on the request.
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as typeof req.params;
    }
    if (schemas.query) {
      const query = schemas.query.parse(req.query);
      Object.defineProperty(req, 'query', { value: query, writable: true, configurable: true, enumerable: true });
    }
    if (schemas.body) {
      req.body = schemas.body.parse(req.body ?? {});
    }
    next();
  };
}
