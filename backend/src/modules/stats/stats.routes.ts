import { Router } from 'express';
import * as controller from './stats.controller';

export const adminStatsRouter = Router();
adminStatsRouter.get('/overview', controller.overview);
