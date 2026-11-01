import { Schema } from 'mongoose';
import type { Localized } from '@/shared';

/** Embedded { en, bn } text used by every bilingual field. */
export const localizedSchema = new Schema<Localized>(
  {
    en: { type: String, default: '', trim: true },
    bn: { type: String, default: '', trim: true },
  },
  { _id: false },
);

export const emptyLocalized = (): Localized => ({ en: '', bn: '' });
