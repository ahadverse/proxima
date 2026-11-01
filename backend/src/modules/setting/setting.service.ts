import type { SiteSettingsDTO, SiteSettingsInput } from '@/shared';
import { CacheTags, revalidateStorefront } from '../../lib/revalidate';
import { defaultSettings } from './setting.defaults';
import { SITE_SETTINGS_KEY, Setting } from './setting.model';

type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Fills fields added after the settings were first saved with their defaults. */
function mergeDefaults<T>(defaults: T, stored: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) {
    return (stored === undefined || stored === null ? defaults : stored) as T;
  }
  const result: PlainObject = { ...defaults };
  for (const key of Object.keys(defaults)) {
    result[key] = key in stored ? mergeDefaults((defaults as PlainObject)[key], stored[key]) : (defaults as PlainObject)[key];
  }
  return result as T;
}

export async function getSettings(): Promise<SiteSettingsDTO> {
  const doc = await Setting.findOne({ key: SITE_SETTINGS_KEY }).lean();
  const data = mergeDefaults(defaultSettings(), doc?.data);
  return { ...data, updatedAt: doc?.updatedAt?.toISOString() };
}

export async function updateSettings(input: SiteSettingsInput): Promise<SiteSettingsDTO> {
  await Setting.findOneAndUpdate(
    { key: SITE_SETTINGS_KEY },
    { $set: { data: input } },
    { upsert: true, new: true },
  );
  revalidateStorefront([CacheTags.settings]);
  return getSettings();
}
