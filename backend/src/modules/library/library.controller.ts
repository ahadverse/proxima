import type { Request, Response } from 'express';
import { currentUser } from '../../middlewares/auth';
import { ok } from '../../utils/response';
import * as service from './library.service';

export async function list(req: Request, res: Response) {
  ok(res, await service.getLibrary(currentUser(req).id));
}

export async function download(req: Request, res: Response) {
  const link = await service.createDownloadLink(currentUser(req).id, String(req.params.id), {
    ip: req.ip ?? '',
    userAgent: req.get('user-agent') ?? '',
  });
  ok(res, link);
}
