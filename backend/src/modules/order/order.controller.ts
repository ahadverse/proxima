import type { Request, Response } from 'express';
import { currentUser } from '../../middlewares/auth';
import { created, ok } from '../../utils/response';
import * as service from './order.service';
import type { AdminOrderListQuery } from './order.validation';

export async function quote(req: Request, res: Response) {
  const { couponId: _couponId, ...result } = await service.quote(req.body, req.user?.id);
  ok(res, result);
}

export async function create(req: Request, res: Response) {
  created(res, await service.createOrder(currentUser(req).id, req.body));
}

export async function pay(req: Request, res: Response) {
  ok(res, await service.retryPayment(currentUser(req).id, String(req.params.invoiceNo)));
}

export async function listMine(req: Request, res: Response) {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const { items, meta } = await service.listMine(currentUser(req).id, page, limit);
  ok(res, items, meta);
}

export async function getMine(req: Request, res: Response) {
  const { verify } = req.query as unknown as { verify: boolean };
  ok(res, await service.getMine(currentUser(req).id, String(req.params.invoiceNo), verify));
}

export async function adminList(req: Request, res: Response) {
  const { items, meta } = await service.adminList(req.query as unknown as AdminOrderListQuery);
  ok(res, items, meta);
}

export async function adminGet(req: Request, res: Response) {
  ok(res, await service.adminGet(String(req.params.id)));
}

export async function adminUpdateStatus(req: Request, res: Response) {
  ok(res, await service.adminUpdateStatus(String(req.params.id), req.body, currentUser(req).id));
}
