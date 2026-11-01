import { Router } from 'express';
import { databaseState } from './db/connect';
import { requireAdmin } from './middlewares/auth';
import { authRouter } from './modules/auth/auth.routes';
import { adminCategoryRouter, categoryRouter } from './modules/category/category.routes';
import { adminCouponRouter } from './modules/coupon/coupon.routes';
import { libraryRouter } from './modules/library/library.routes';
import { adminOrderRouter, cartRouter, orderRouter } from './modules/order/order.routes';
import { adminPageRouter, pageRouter } from './modules/page/page.routes';
import { paymentRouter } from './modules/payment/payment.routes';
import { adminProductRouter, membershipRouter, productRouter } from './modules/product/product.routes';
import { adminRatingRouter, productRatingRouter, ratingRouter } from './modules/rating/rating.routes';
import { adminSettingRouter, settingRouter } from './modules/setting/setting.routes';
import { adminStatsRouter } from './modules/stats/stats.routes';
import { adminUploadRouter } from './modules/upload/upload.routes';
import { adminUserRouter } from './modules/user/user.routes';
import { adminVideoReviewRouter, videoReviewRouter } from './modules/video-review/video-review.routes';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', database: databaseState(), time: new Date().toISOString() } });
});

routes.use('/auth', authRouter);
routes.use('/settings', settingRouter);
routes.use('/categories', categoryRouter);
routes.use('/products', productRouter);
routes.use('/products', productRatingRouter);
routes.use('/membership', membershipRouter);
routes.use('/ratings', ratingRouter);
routes.use('/video-reviews', videoReviewRouter);
routes.use('/pages', pageRouter);
routes.use('/cart', cartRouter);
routes.use('/orders', orderRouter);
routes.use('/payments', paymentRouter);
routes.use('/library', libraryRouter);

const admin = Router();
admin.use(requireAdmin);
admin.use('/stats', adminStatsRouter);
admin.use('/products', adminProductRouter);
admin.use('/categories', adminCategoryRouter);
admin.use('/orders', adminOrderRouter);
admin.use('/users', adminUserRouter);
admin.use('/coupons', adminCouponRouter);
admin.use('/ratings', adminRatingRouter);
admin.use('/video-reviews', adminVideoReviewRouter);
admin.use('/pages', adminPageRouter);
admin.use('/settings', adminSettingRouter);
admin.use('/uploads', adminUploadRouter);

routes.use('/admin', admin);
