import type { Request, Response } from 'express';
import { currentUser } from '../../middlewares/auth';
import { noContent, ok } from '../../utils/response';
import * as service from './rating.service';
import type { AdminRatingListQuery } from './rating.validation';

export async function listForProduct(req: Request, res: Response) {
  const { page } = req.query as unknown as { page: number };
  const { meta, ...data } = await service.listForProduct(String(req.params.slug), page, req.user?.id);
  ok(res, data, meta);
}

export async function upsert(req: Request, res: Response) {
  ok(res, await service.upsert(String(req.params.slug), currentUser(req).id, req.body));
}

export async function latest(_req: Request, res: Response) {
  ok(res, await service.latest());
}

export async function adminList(req: Request, res: Response) {
  const { items, meta } = await service.adminList(req.query as unknown as AdminRatingListQuery);
  ok(res, items, meta);
}

export async function adminSetStatus(req: Request, res: Response) {
  ok(res, await service.adminSetStatus(String(req.params.id), req.body.status));
}

export async function adminRemove(req: Request, res: Response) {
  await service.adminRemove(String(req.params.id));
  noContent(res);
}
