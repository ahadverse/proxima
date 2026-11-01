import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { getSettings } from '@/lib/api';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Default share image for every page without its own (products use their thumbnail). */
export default async function OpengraphImage() {
  // English copy for both locales: the built-in renderer has no Bengali shaping.
  const [settings, t] = await Promise.all([getSettings(), getTranslations({ locale: 'en', namespace: 'hero' })]);
  const trust = [t('trust.source'), t('trust.payments'), t('trust.support')];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          color: '#fff',
          backgroundImage: 'linear-gradient(135deg, #2e1065 0%, #5b21b6 55%, #a21caf 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 76, height: 76, borderRadius: 20, background: '#fff' }}>
            <svg width="52" height="52" viewBox="0 0 64 64">
              <path d="M20 47V17h13.7c6.8 0 11.3 4 11.3 10.2S40.5 37.4 33.7 37.4h-6.4V47H20Zm7.3-16h5.8c2.8 0 4.5-1.5 4.5-3.8 0-2.5-1.7-3.9-4.5-3.9h-5.8V31Z" fill="#6d28d9" />
              <circle cx="47" cy="46" r="4" fill="#c026d3" />
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>{settings.brand.name}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
            {`${t('script')} ${t('title')}`}
          </div>
          <div style={{ display: 'flex', maxWidth: 1050, fontSize: 32, lineHeight: 1.35, color: 'rgba(255,255,255,0.82)' }}>{t('subtitle')}</div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {trust.map((label) => (
            <div
              key={label}
              style={{ display: 'flex', padding: '12px 22px', borderRadius: 999, fontSize: 24, fontWeight: 600, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)' }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
