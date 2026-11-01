import type { Request, Response } from 'express';
import { MAX_IMAGE_BYTES } from '@/shared';
import { receiveFile } from '../../lib/multipart';
import { created, ok } from '../../utils/response';
import * as service from './upload.service';

export async function uploadImage(req: Request, res: Response) {
  created(res, await receiveFile(req, MAX_IMAGE_BYTES, service.storeImage));
}

export async function createFileUpload(req: Request, res: Response) {
  ok(res, await service.createFileUpload(req.body));
}
