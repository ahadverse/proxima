import { Schema, model, type Types } from 'mongoose';
import { USER_ROLES, type UserRole } from '@/shared';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  isBanned: boolean;
  membership: {
    active: boolean;
    activatedAt: Date | null;
    order: Types.ObjectId | null;
  };
  tokenVersion: number;
  resetTokenHash: string | null;
  resetTokenExpires: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'user', index: true },
    isBanned: { type: Boolean, default: false },
    membership: {
      active: { type: Boolean, default: false, index: true },
      activatedAt: { type: Date, default: null },
      order: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
    },
    tokenVersion: { type: Number, default: 0 },
    resetTokenHash: { type: String, default: null, select: false, index: true },
    resetTokenExpires: { type: Date, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);

type UserLike = Pick<IUser, '_id' | 'name' | 'email' | 'phone' | 'role' | 'isBanned' | 'membership' | 'createdAt' | 'lastLoginAt'>;

export function toUserDTO(user: UserLike) {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
    isBanned: user.isBanned,
    membership: {
      active: Boolean(user.membership?.active),
      activatedAt: user.membership?.activatedAt ? user.membership.activatedAt.toISOString() : null,
    },
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
  };
}
