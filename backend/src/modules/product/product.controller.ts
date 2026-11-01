import type { Request, Response } from 'express';
import type { ProductQuery } from '@/shared';
import { created, noContent, ok } from '../../utils/response';
import * as service from './product.service';
import type { AdminProductListQuery } from './product.validation';

export async function list(req: Request, res: Response) {
  const { items, meta } = await service.listPublic(req.query as unknown as ProductQuery);
  ok(res, items, meta);
}

export async function suggest(req: Request, res: Response) {
  ok(res, await service.suggest(String(req.query.q)));
}

export async function detail(req: Request, res: Response) {
  ok(res, await service.getPublicBySlug(String(req.params.slug)));
}

export async function related(req: Request, res: Response) {
  ok(res, await service.related(String(req.params.slug)));
}

export async function view(req: Request, res: Response) {
  await service.registerView(String(req.params.slug));
  noContent(res);
}

export async function membership(_req: Request, res: Response) {
  ok(res, await service.getMembership());
}

export async function adminList(req: Request, res: Response) {
  const { items, meta } = await service.adminList(req.query as unknown as AdminProductListQuery);
  ok(res, items, meta);
}

export async function adminGet(req: Request, res: Response) {
  ok(res, await service.adminGet(String(req.params.id)));
}

export async function create(req: Request, res: Response) {
  created(res, await service.create(req.body));
}

export async function update(req: Request, res: Response) {
  ok(res, await service.update(String(req.params.id), req.body));
}

export async function setStatus(req: Request, res: Response) {
  ok(res, await service.setStatus(String(req.params.id), req.body.status));
}

export async function remove(req: Request, res: Response) {
  await service.remove(String(req.params.id));
  noContent(res);
}
