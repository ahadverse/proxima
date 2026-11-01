import { z } from 'zod';
import { BD_PHONE_REGEX } from '../constants';
import { EMAIL_REGEX } from './common';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'required')
  .max(254, 'too_long')
  .regex(EMAIL_REGEX, 'invalid_email');

export const passwordSchema = z
  .string()
  .min(8, 'password_min')
  .max(128, 'too_long')
  .regex(/[A-Za-z]/, 'password_letter')
  .regex(/\d/, 'password_number');

export const phoneSchema = z.string().trim().regex(BD_PHONE_REGEX, 'invalid_phone');

export const nameSchema = z.string().trim().min(2, 'name_min').max(80, 'too_long');

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'required').max(128, 'too_long'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, 'invalid_token').max(200, 'invalid_token'),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: nameSchema,
  phone: z.union([z.literal(''), phoneSchema]),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'required').max(128, 'too_long'),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
