import type { Request, Response } from 'express';
import { created, noContent, ok } from '../../utils/response';
import * as service from './page.service';

export async function getPublished(req: Request, res: Response) {
  ok(res, await service.getPublished(String(req.params.slug)));
}

export async function listPublished(_req: Request, res: Response) {
  ok(res, await service.listPublished());
}

export async function listAll(_req: Request, res: Response) {
  ok(res, await service.listAll());
}

export async function getById(req: Request, res: Response) {
  ok(res, await service.getById(String(req.params.id)));
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
