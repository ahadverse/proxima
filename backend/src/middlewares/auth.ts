import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@/shared';
import { ACCESS_COOKIE, verifyAccessToken } from '../modules/auth/auth.tokens';
import { User } from '../modules/user/user.model';
import { ApiError } from '../utils/ApiError';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  membershipActive: boolean;
}

async function resolveUser(req: Request, strict: boolean): Promise<AuthUser | null> {
  const token: string | undefined = req.cookies?.[ACCESS_COOKIE];
  if (!token) {
    if (strict) throw ApiError.unauthorized();
    return null;
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    if (!strict) return null;
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Your session has expired', 'TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized();
  }

  const user = await User.findById(payload.sub).select('name email role isBanned membership tokenVersion').lean();
  if (!user || user.tokenVersion !== payload.tv) {
    if (strict) throw ApiError.unauthorized();
    return null;
  }
  if (user.isBanned) {
    if (strict) throw ApiError.forbidden('Your account has been suspended', 'ACCOUNT_BANNED');
    return null;
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    membershipActive: Boolean(user.membership?.active),
  };
}

export const requireAuth: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  req.user = (await resolveUser(req, true)) ?? undefined;
  next();
};

export const optionalAuth: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  req.user = (await resolveUser(req, false)) ?? undefined;
  next();
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
}

export const requireAdmin: RequestHandler[] = [requireAuth, requireRole('admin')];

/** Narrows req.user for handlers mounted behind requireAuth. */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}
