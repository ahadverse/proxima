import type { Request, Response } from 'express';
import { ok } from '../../utils/response';
import * as service from './stats.service';

export async function overview(_req: Request, res: Response) {
  ok(res, await service.overview());
}
