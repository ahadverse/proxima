import rateLimit from 'express-rate-limit';

function limiter(windowMinutes: number, limit: number, message: string) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ success: false, code: 'RATE_LIMITED', message });
    },
  });
}

export const authLimiter = limiter(15, 30, 'Too many attempts. Please wait a few minutes and try again.');
export const passwordResetLimiter = limiter(15, 5, 'Too many reset requests. Please try again later.');
export const checkoutLimiter = limiter(10, 30, 'Too many checkout attempts. Please slow down.');
export const couponLimiter = limiter(10, 40, 'Too many coupon attempts. Please try again later.');
export const viewLimiter = limiter(1, 60, 'Too many requests.');
export const apiLimiter = limiter(1, 300, 'Too many requests. Please slow down.');
