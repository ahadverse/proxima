import type { Request, Response } from 'express';
import { created, noContent, ok } from '../../utils/response';
import * as service from './category.service';

export async function listPublic(_req: Request, res: Response) {
  ok(res, await service.listPublic());
}

export async function listAll(_req: Request, res: Response) {
  ok(res, await service.listAll());
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

export async function reorder(req: Request, res: Response) {
  ok(res, await service.reorder(req.body.ids));
}
