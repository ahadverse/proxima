import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** PNG home-screen icon for iOS, which ignores SVG icons. Same mark as icon.svg, square because iOS rounds it. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #7c3aed, #c026d3)',
        }}
      >
        <svg width="132" height="132" viewBox="0 0 64 64">
          <path d="M20 47V17h13.7c6.8 0 11.3 4 11.3 10.2S40.5 37.4 33.7 37.4h-6.4V47H20Zm7.3-16h5.8c2.8 0 4.5-1.5 4.5-3.8 0-2.5-1.7-3.9-4.5-3.9h-5.8V31Z" fill="#fff" />
          <circle cx="47" cy="46" r="4" fill="#f5d0fe" />
        </svg>
      </div>
    ),
    size,
  );
}
