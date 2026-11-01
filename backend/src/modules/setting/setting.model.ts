import { Schema, model, type Types } from 'mongoose';
import type { SiteSettingsDTO } from '@/shared';

export interface ISetting {
  _id: Types.ObjectId;
  key: string;
  data: SiteSettingsDTO;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

export const Setting = model<ISetting>('Setting', settingSchema);

export const SITE_SETTINGS_KEY = 'site';
