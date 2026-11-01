import type { Request, Response } from 'express';
import { created, noContent, ok } from '../../utils/response';
import type { AdminListQuery } from '../shared/common.validation';
import * as service from './coupon.service';

export async function list(req: Request, res: Response) {
  const { items, meta } = await service.list(req.query as unknown as AdminListQuery);
  ok(res, items, meta);
}

export async function create(req: Request, res: Response) {
  created(res, await service.create(req.body));
}

export async function update(req: Request, res: Response) {
  ok(res, await service.update(String(req.params.id), req.body));
}

export async function remove(req: Request, res: Response) {
  await service.remove(String(req.params.id));
  noContent(res);
}
