import type { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@/shared';
import { env, isProduction } from '../../config/env';

export const ACCESS_COOKIE = 'px_at';
export const REFRESH_COOKIE = 'px_rt';
/** Readable by the browser so clients know a session may exist without probing the API. */
export const SESSION_HINT_COOKIE = 'px_s';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface TokenPayload {
  sub: string;
  role: UserRole;
  tv: number;
}

interface TokenSubject {
  _id: { toString(): string };
  role: UserRole;
  tokenVersion: number;
}

function baseCookie(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
  };
}

const refreshCookiePath = '/api/v1/auth';

export function signAccessToken(user: TokenSubject): string {
  const payload: TokenPayload = { sub: user._id.toString(), role: user.role, tv: user.tokenVersion };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL_SECONDS });
}

export function signRefreshToken(user: TokenSubject): string {
  const payload: TokenPayload = { sub: user._id.toString(), role: user.role, tv: user.tokenVersion };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL_SECONDS });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function setAuthCookies(res: Response, user: TokenSubject): void {
  res.cookie(ACCESS_COOKIE, signAccessToken(user), {
    ...baseCookie(),
    path: '/',
    maxAge: ACCESS_TTL_SECONDS * 1000,
  });
  res.cookie(REFRESH_COOKIE, signRefreshToken(user), {
    ...baseCookie(),
    path: refreshCookiePath,
    maxAge: REFRESH_TTL_SECONDS * 1000,
  });
  res.cookie(SESSION_HINT_COOKIE, '1', {
    ...baseCookie(),
    httpOnly: false,
    path: '/',
    maxAge: REFRESH_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookie(), path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookie(), path: refreshCookiePath });
  res.clearCookie(SESSION_HINT_COOKIE, { ...baseCookie(), httpOnly: false, path: '/' });
}
