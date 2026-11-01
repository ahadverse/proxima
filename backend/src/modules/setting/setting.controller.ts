import type { Request, Response } from 'express';
import { ok } from '../../utils/response';
import * as service from './setting.service';

export async function getPublic(_req: Request, res: Response) {
  res.set('Cache-Control', 'public, max-age=30');
  ok(res, await service.getSettings());
}

export async function getAdmin(_req: Request, res: Response) {
  ok(res, await service.getSettings());
}

export async function update(req: Request, res: Response) {
  ok(res, await service.updateSettings(req.body));
}
