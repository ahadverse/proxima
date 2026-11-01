import type { Request, Response } from 'express';
import { currentUser } from '../../middlewares/auth';
import { ok } from '../../utils/response';
import * as service from './user.service';
import type { AdminUserListQuery } from './user.validation';

export async function adminList(req: Request, res: Response) {
  const { items, meta } = await service.adminList(req.query as unknown as AdminUserListQuery);
  ok(res, items, meta);
}

export async function adminDetail(req: Request, res: Response) {
  ok(res, await service.adminDetail(String(req.params.id)));
}

export async function adminUpdate(req: Request, res: Response) {
  ok(res, await service.adminUpdate(String(req.params.id), req.body, currentUser(req).id));
}

export async function adminSetMembership(req: Request, res: Response) {
  ok(res, await service.adminSetMembership(String(req.params.id), req.body.action));
}
