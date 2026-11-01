/**
 * Generates full-page website mockups (SVG) used as catalog thumbnails until
 * real screenshots are uploaded from the admin panel.
 */

export interface Palette {
  primary: string;
  secondary: string;
  tint: string;
  dark: string;
}

const FONT = "Segoe UI, Helvetica, Arial, sans-serif";

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[ch]!);
}

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function productCard(x: number, y: number, w: number, p: Palette, rand: () => number, price: string) {
  const imgH = Math.round(w * 0.95);
  const hue = rand() > 0.5 ? p.tint : '#f1f5f9';
  const shape =
    rand() > 0.5
      ? `<circle cx="${x + w / 2}" cy="${y + imgH / 2}" r="${w * 0.24}" fill="${p.primary}" opacity="0.18"/>
         <rect x="${x + w * 0.3}" y="${y + imgH * 0.28}" width="${w * 0.4}" height="${imgH * 0.44}" rx="14" fill="${p.secondary}" opacity="0.55"/>`
      : `<rect x="${x + w * 0.22}" y="${y + imgH * 0.2}" width="${w * 0.56}" height="${imgH * 0.6}" rx="18" fill="${p.primary}" opacity="0.22"/>
         <circle cx="${x + w * 0.62}" cy="${y + imgH * 0.4}" r="${w * 0.12}" fill="${p.secondary}" opacity="0.7"/>`;
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${imgH + 118}" rx="16" fill="#ffffff" stroke="#e2e8f0"/>
      <rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${imgH - 10}" rx="12" fill="${hue}"/>
      ${shape}
      <rect x="${x + 16}" y="${y + imgH + 16}" width="${w * 0.7}" height="12" rx="6" fill="#1e293b" opacity="0.85"/>
      <rect x="${x + 16}" y="${y + imgH + 38}" width="${w * 0.45}" height="10" rx="5" fill="#94a3b8"/>
      <text x="${x + 16}" y="${y + imgH + 86}" font-family="${FONT}" font-size="22" font-weight="700" fill="${p.primary}">${price}</text>
      <rect x="${x + w - 56}" y="${y + imgH + 62}" width="40" height="34" rx="10" fill="${p.primary}"/>
    </g>`;
}

export function websiteMockup(params: { name: string; tagline: string; palette: Palette; seed: string }): string {
  const { name, tagline, palette: p } = params;
  const rand = seeded(params.seed);
  const W = 1200;
  const H = 2700;
  const prices = ['৳1,250', '৳890', '৳2,450', '৳640', '৳1,990', '৳3,200', '৳720', '৳1,480'];

  const nav = ['Home', 'Shop', 'Categories', 'Offers', 'Contact']
    .map((label, i) => `<text x="${420 + i * 110}" y="128" font-family="${FONT}" font-size="17" fill="#334155">${label}</text>`)
    .join('');

  const chips = Array.from({ length: 6 }, (_, i) => {
    const cx = 130 + i * 188;
    return `<circle cx="${cx}" cy="905" r="54" fill="${i % 2 ? p.tint : '#f8fafc'}" stroke="#e2e8f0"/>
      <circle cx="${cx}" cy="905" r="24" fill="${i % 2 ? p.primary : p.secondary}" opacity="0.65"/>
      <rect x="${cx - 40}" y="976" width="80" height="11" rx="5" fill="#64748b"/>`;
  }).join('');

  const gridA = Array.from({ length: 4 }, (_, i) => productCard(60 + i * 276, 1090, 252, p, rand, prices[i]!)).join('');
  const gridB = Array.from({ length: 4 }, (_, i) => productCard(60 + i * 276, 1960, 252, p, rand, prices[i + 4]!)).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.primary}"/>
      <stop offset="1" stop-color="${p.secondary}"/>
    </linearGradient>
    <linearGradient id="banner" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${p.dark}"/>
      <stop offset="1" stop-color="${p.primary}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#ffffff"/>

  <rect width="${W}" height="56" fill="#f1f5f9"/>
  <circle cx="30" cy="28" r="7" fill="#f87171"/><circle cx="54" cy="28" r="7" fill="#fbbf24"/><circle cx="78" cy="28" r="7" fill="#34d399"/>
  <rect x="300" y="14" width="600" height="28" rx="14" fill="#ffffff" stroke="#e2e8f0"/>
  <rect x="320" y="22" width="10" height="9" rx="2" fill="#94a3b8"/>
  <rect x="340" y="23" width="180" height="10" rx="5" fill="#cbd5e1"/>

  <rect y="56" width="${W}" height="40" fill="${p.dark}"/>
  <text x="600" y="82" text-anchor="middle" font-family="${FONT}" font-size="15" fill="#ffffff" opacity="0.9">Free delivery on orders over ৳1,500 · Cash on delivery available</text>

  <rect x="60" y="104" width="44" height="44" rx="12" fill="url(#hero)"/>
  <text x="118" y="136" font-family="${FONT}" font-size="28" font-weight="800" fill="${p.dark}">${esc(name)}</text>
  ${nav}
  <circle cx="1050" cy="126" r="22" fill="#f1f5f9"/><circle cx="1110" cy="126" r="22" fill="${p.primary}"/>

  <rect x="60" y="180" width="1080" height="600" rx="28" fill="url(#hero)"/>
  <circle cx="980" cy="300" r="190" fill="#ffffff" opacity="0.10"/>
  <circle cx="1080" cy="640" r="120" fill="#ffffff" opacity="0.08"/>
  <rect x="680" y="250" width="380" height="460" rx="26" fill="#ffffff" opacity="0.92"/>
  <rect x="712" y="282" width="316" height="300" rx="18" fill="${p.tint}"/>
  <circle cx="870" cy="432" r="92" fill="${p.primary}" opacity="0.28"/>
  <rect x="800" y="380" width="140" height="110" rx="16" fill="${p.secondary}" opacity="0.75"/>
  <rect x="712" y="604" width="200" height="16" rx="8" fill="#1e293b" opacity="0.8"/>
  <rect x="712" y="634" width="130" height="14" rx="7" fill="#94a3b8"/>
  <text x="120" y="300" font-family="${FONT}" font-size="20" font-weight="600" fill="#ffffff" opacity="0.85" letter-spacing="3">NEW SEASON</text>
  <text x="120" y="380" font-family="${FONT}" font-size="64" font-weight="800" fill="#ffffff">${esc(name)}</text>
  <text x="120" y="440" font-family="${FONT}" font-size="26" fill="#ffffff" opacity="0.9">${esc(tagline)}</text>
  <rect x="120" y="500" width="400" height="14" rx="7" fill="#ffffff" opacity="0.45"/>
  <rect x="120" y="528" width="320" height="14" rx="7" fill="#ffffff" opacity="0.35"/>
  <rect x="120" y="592" width="200" height="60" rx="30" fill="#ffffff"/>
  <text x="220" y="630" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="700" fill="${p.primary}">Shop Now</text>
  <rect x="340" y="592" width="170" height="60" rx="30" fill="none" stroke="#ffffff" stroke-width="2"/>

  <text x="60" y="842" font-family="${FONT}" font-size="30" font-weight="800" fill="#0f172a">Shop by Category</text>
  ${chips}

  <text x="60" y="1060" font-family="${FONT}" font-size="30" font-weight="800" fill="#0f172a">Trending Now</text>
  <rect x="1020" y="1036" width="120" height="34" rx="17" fill="${p.tint}"/>
  ${gridA}

  <rect x="60" y="1500" width="530" height="380" rx="26" fill="url(#banner)"/>
  <text x="100" y="1600" font-family="${FONT}" font-size="22" fill="#ffffff" opacity="0.8">Limited offer</text>
  <text x="100" y="1660" font-family="${FONT}" font-size="46" font-weight="800" fill="#ffffff">Up to 40% Off</text>
  <rect x="100" y="1720" width="160" height="50" rx="25" fill="#ffffff"/>
  <circle cx="500" cy="1780" r="80" fill="#ffffff" opacity="0.12"/>
  <rect x="610" y="1500" width="530" height="380" rx="26" fill="${p.tint}"/>
  <text x="650" y="1600" font-family="${FONT}" font-size="22" fill="${p.dark}" opacity="0.7">Just arrived</text>
  <text x="650" y="1660" font-family="${FONT}" font-size="46" font-weight="800" fill="${p.dark}">New Collection</text>
  <rect x="650" y="1720" width="160" height="50" rx="25" fill="${p.primary}"/>
  <rect x="930" y="1560" width="170" height="260" rx="20" fill="${p.secondary}" opacity="0.45"/>

  <text x="60" y="1930" font-family="${FONT}" font-size="30" font-weight="800" fill="#0f172a">Best Sellers</text>
  ${gridB}

  <rect y="2390" width="${W}" height="310" fill="${p.dark}"/>
  <rect x="60" y="2440" width="44" height="44" rx="12" fill="url(#hero)"/>
  <text x="118" y="2472" font-family="${FONT}" font-size="26" font-weight="800" fill="#ffffff">${esc(name)}</text>
  <rect x="60" y="2510" width="300" height="10" rx="5" fill="#ffffff" opacity="0.3"/>
  <rect x="60" y="2532" width="240" height="10" rx="5" fill="#ffffff" opacity="0.3"/>
  ${[480, 700, 920]
    .map(
      (x) => `<rect x="${x}" y="2446" width="120" height="14" rx="7" fill="#ffffff" opacity="0.75"/>
    <rect x="${x}" y="2484" width="150" height="10" rx="5" fill="#ffffff" opacity="0.3"/>
    <rect x="${x}" y="2510" width="110" height="10" rx="5" fill="#ffffff" opacity="0.3"/>
    <rect x="${x}" y="2536" width="130" height="10" rx="5" fill="#ffffff" opacity="0.3"/>`,
    )
    .join('')}
  <rect x="60" y="2620" width="1080" height="1" fill="#ffffff" opacity="0.15"/>
</svg>`;
}

export function dashboardMockup(params: { name: string; palette: Palette; seed: string }): string {
  const { name, palette: p } = params;
  const rand = seeded(`${params.seed}-dash`);
  const W = 1600;
  const H = 1000;

  const menu = ['Dashboard', 'Orders', 'Products', 'Customers', 'Coupons', 'Reports', 'Settings']
    .map((label, i) => {
      const y = 200 + i * 56;
      const active = i === 0;
      return `${active ? `<rect x="20" y="${y - 30}" width="240" height="44" rx="12" fill="${p.primary}"/>` : ''}
      <rect x="40" y="${y - 16}" width="16" height="16" rx="4" fill="${active ? '#ffffff' : '#94a3b8'}"/>
      <text x="70" y="${y - 2}" font-family="${FONT}" font-size="16" font-weight="${active ? 700 : 500}" fill="${active ? '#ffffff' : '#cbd5e1'}">${label}</text>`;
    })
    .join('');

  const stats = [
    ['Revenue', '৳4,82,350'],
    ['Orders', '1,284'],
    ['Customers', '936'],
    ['Conversion', '3.8%'],
  ]
    .map(
      ([label, value], i) => `<rect x="${310 + i * 318}" y="120" width="298" height="140" rx="18" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="${334 + i * 318}" y="166" font-family="${FONT}" font-size="16" fill="#64748b">${label}</text>
      <text x="${334 + i * 318}" y="214" font-family="${FONT}" font-size="34" font-weight="800" fill="#0f172a">${value}</text>
      <rect x="${334 + i * 318}" y="232" width="70" height="10" rx="5" fill="${i % 2 ? p.secondary : p.primary}" opacity="0.5"/>`,
    )
    .join('');

  const points = Array.from({ length: 12 }, (_, i) => {
    const x = 350 + i * 76;
    const y = 640 - (80 + rand() * 220 + i * 8);
    return `${x},${Math.round(y)}`;
  });
  const area = `350,660 ${points.join(' ')} ${350 + 11 * 76},660`;

  const bars = Array.from({ length: 7 }, (_, i) => {
    const h = 80 + rand() * 200;
    return `<rect x="${1300 + i * 36}" y="${640 - h}" width="22" height="${h}" rx="6" fill="${i === 4 ? p.primary : p.tint}"/>`;
  }).join('');

  const rows = Array.from({ length: 4 }, (_, i) => {
    const y = 770 + i * 52;
    return `<rect x="334" y="${y}" width="120" height="12" rx="6" fill="#334155"/>
      <rect x="560" y="${y}" width="180" height="12" rx="6" fill="#94a3b8"/>
      <rect x="860" y="${y}" width="90" height="12" rx="6" fill="#94a3b8"/>
      <rect x="1060" y="${y - 8}" width="86" height="28" rx="14" fill="${i % 3 === 0 ? '#dcfce7' : p.tint}"/>
      <rect x="1360" y="${y}" width="110" height="12" rx="6" fill="#0f172a" opacity="0.8"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.primary}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${p.primary}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#f8fafc"/>
  <rect width="280" height="${H}" fill="${p.dark}"/>
  <rect x="24" y="36" width="40" height="40" rx="12" fill="${p.primary}"/>
  <text x="78" y="64" font-family="${FONT}" font-size="22" font-weight="800" fill="#ffffff">${esc(name)}</text>
  ${menu}
  <rect x="280" width="${W - 280}" height="84" fill="#ffffff"/>
  <rect x="310" y="24" width="420" height="38" rx="19" fill="#f1f5f9"/>
  <circle cx="1500" cy="42" r="20" fill="${p.tint}"/><circle cx="1550" cy="42" r="20" fill="${p.primary}"/>
  ${stats}
  <rect x="310" y="290" width="950" height="410" rx="18" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="334" y="334" font-family="${FONT}" font-size="20" font-weight="700" fill="#0f172a">Sales overview</text>
  <polygon points="${area}" fill="url(#area)"/>
  <polyline points="${points.join(' ')}" fill="none" stroke="${p.primary}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
  <rect x="1280" y="290" width="292" height="410" rx="18" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="1300" y="334" font-family="${FONT}" font-size="20" font-weight="700" fill="#0f172a">This week</text>
  ${bars}
  <rect x="310" y="720" width="1262" height="250" rx="18" fill="#ffffff" stroke="#e2e8f0"/>
  ${rows}
</svg>`;
}

export function membershipMockup(): string {
  const W = 1200;
  const H = 1500;
  const tiles = Array.from({ length: 12 }, (_, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 90 + col * 260;
    const y = 760 + row * 230;
    const colors = ['#7c3aed', '#c026d3', '#0ea5e9', '#16a34a', '#f59e0b', '#ef4444'];
    const c = colors[i % colors.length]!;
    return `<rect x="${x}" y="${y}" width="240" height="210" rx="20" fill="#ffffff" opacity="0.96"/>
      <rect x="${x + 14}" y="${y + 14}" width="212" height="120" rx="12" fill="${c}" opacity="0.18"/>
      <rect x="${x + 70}" y="${y + 40}" width="100" height="70" rx="10" fill="${c}" opacity="0.6"/>
      <rect x="${x + 14}" y="${y + 150}" width="150" height="12" rx="6" fill="#1e293b" opacity="0.8"/>
      <rect x="${x + 14}" y="${y + 174}" width="90" height="10" rx="5" fill="#94a3b8"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2e1065"/>
      <stop offset="0.55" stop-color="#6d28d9"/>
      <stop offset="1" stop-color="#c026d3"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1050" cy="160" r="260" fill="#ffffff" opacity="0.07"/>
  <circle cx="120" cy="620" r="180" fill="#ffffff" opacity="0.05"/>
  <rect x="90" y="120" width="220" height="48" rx="24" fill="#ffffff" opacity="0.15"/>
  <text x="200" y="152" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="700" fill="#ffffff" letter-spacing="3">LIFETIME</text>
  <text x="90" y="300" font-family="${FONT}" font-size="104" font-weight="900" fill="#ffffff">All Access</text>
  <text x="90" y="400" font-family="${FONT}" font-size="104" font-weight="900" fill="#f5d0fe">Membership</text>
  <text x="90" y="480" font-family="${FONT}" font-size="30" fill="#ffffff" opacity="0.85">Every website and plugin. One payment. Forever.</text>
  <rect x="90" y="540" width="300" height="76" rx="38" fill="#ffffff"/>
  <text x="240" y="588" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="800" fill="#6d28d9">Get All Access</text>
  ${tiles}
</svg>`;
}
