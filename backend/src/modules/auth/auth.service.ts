import crypto from 'node:crypto';
import argon2 from 'argon2';
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '@/shared';
import { normalizeBdPhone } from '@/shared';
import { env } from '../../config/env';
import { sendMail } from '../../lib/mailer';
import { ApiError } from '../../utils/ApiError';
import { User, type IUser } from '../user/user.model';
import { verifyRefreshToken } from './auth.tokens';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export async function register(input: RegisterInput) {
  const exists = await User.exists({ email: input.email });
  if (exists) {
    throw ApiError.conflict('An account with this email already exists', 'EMAIL_TAKEN', [
      { path: 'email', message: 'email_taken' },
    ]);
  }
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  return User.create({ name: input.name, email: input.email, passwordHash, lastLoginAt: new Date() });
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  const valid = user ? await argon2.verify(user.passwordHash, input.password).catch(() => false) : false;
  if (!user || !valid) {
    throw ApiError.unauthorized('Incorrect email or password', 'INVALID_CREDENTIALS');
  }
  if (user.isBanned) {
    throw ApiError.forbidden('Your account has been suspended', 'ACCOUNT_BANNED');
  }
  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

export async function refresh(token: string | undefined) {
  if (!token) throw ApiError.unauthorized('Session expired', 'REFRESH_REQUIRED');
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Session expired', 'REFRESH_INVALID');
  }
  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.tv || user.isBanned) {
    throw ApiError.unauthorized('Session expired', 'REFRESH_INVALID');
  }
  return user;
}

export async function getMe(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) throw ApiError.unauthorized();
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { name: input.name, phone: input.phone ? normalizeBdPhone(input.phone) : '' } },
    { new: true },
  ).lean();
  if (!user) throw ApiError.unauthorized();
  return user;
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw ApiError.unauthorized();
  const valid = await argon2.verify(user.passwordHash, input.currentPassword).catch(() => false);
  if (!valid) {
    throw ApiError.validation([{ path: 'currentPassword', message: 'current_password_wrong' }], 'Current password is incorrect');
  }
  user.passwordHash = await argon2.hash(input.newPassword, { type: argon2.argon2id });
  user.tokenVersion += 1;
  await user.save();
  return user;
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email });
  if (!user || user.isBanned) return;

  const token = crypto.randomBytes(32).toString('hex');
  await User.updateOne(
    { _id: user._id },
    { $set: { resetTokenHash: hashToken(token), resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS) } },
  );

  const link = `${env.CLIENT_URL.replace(/\/+$/, '')}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your Proxima password',
    text: `Hi ${user.name},\n\nUse the link below to set a new password. It expires in 30 minutes.\n\n${link}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hi ${escapeHtml(user.name)},</p><p>Use the button below to set a new password. It expires in 30 minutes.</p><p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#7c3aed;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<IUser> {
  const user = await User.findOne({
    resetTokenHash: hashToken(input.token),
    resetTokenExpires: { $gt: new Date() },
  }).select('+resetTokenHash +resetTokenExpires');
  if (!user) {
    throw ApiError.badRequest('This reset link is invalid or has expired', 'RESET_TOKEN_INVALID');
  }
  user.passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  user.resetTokenHash = null;
  user.resetTokenExpires = null;
  user.tokenVersion += 1;
  await user.save();
  return user;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
}
