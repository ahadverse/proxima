import type { Request, Response } from 'express';
import { currentUser } from '../../middlewares/auth';
import { ok, created } from '../../utils/response';
import { toUserDTO } from '../user/user.model';
import * as authService from './auth.service';
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from './auth.tokens';

export async function register(req: Request, res: Response) {
  const user = await authService.register(req.body);
  setAuthCookies(res, user);
  created(res, toUserDTO(user));
}

export async function login(req: Request, res: Response) {
  const user = await authService.login(req.body);
  setAuthCookies(res, user);
  ok(res, toUserDTO(user));
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookies(res);
  ok(res, null);
}

export async function refresh(req: Request, res: Response) {
  try {
    const user = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
    setAuthCookies(res, user);
    ok(res, toUserDTO(user));
  } catch (error) {
    clearAuthCookies(res);
    throw error;
  }
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(currentUser(req).id);
  ok(res, toUserDTO(user));
}

export async function updateMe(req: Request, res: Response) {
  const user = await authService.updateProfile(currentUser(req).id, req.body);
  ok(res, toUserDTO(user));
}

export async function changePassword(req: Request, res: Response) {
  const user = await authService.changePassword(currentUser(req).id, req.body);
  setAuthCookies(res, user);
  ok(res, null, undefined, 'Password updated');
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.forgotPassword(req.body.email);
  ok(res, null, undefined, 'If an account exists for this email, a reset link has been sent.');
}

export async function resetPassword(req: Request, res: Response) {
  const user = await authService.resetPassword(req.body);
  setAuthCookies(res, user);
  ok(res, toUserDTO(user), undefined, 'Password updated');
}
