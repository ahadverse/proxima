import type { Localized, ProductType, TechStack } from '@/shared';
import type { Palette } from './mockups';

export interface SeedCategory {
  slug: string;
  name: Localized;
  icon: string;
}

export const categories: SeedCategory[] = [
  { slug: 'fashion', name: { en: 'Fashion', bn: 'ফ্যাশন' }, icon: 'shirt' },
  { slug: 'grocery', name: { en: 'Grocery', bn: 'গ্রোসারি' }, icon: 'shopping-basket' },
  { slug: 'electronics', name: { en: 'Electronics & Gadgets', bn: 'ইলেকট্রনিক্স ও গ্যাজেট' }, icon: 'smartphone' },
  { slug: 'beauty', name: { en: 'Beauty & Skincare', bn: 'বিউটি ও স্কিনকেয়ার' }, icon: 'sparkles' },
  { slug: 'business', name: { en: 'Business', bn: 'বিজনেস' }, icon: 'briefcase' },
  { slug: 'education', name: { en: 'Education & LMS', bn: 'এডুকেশন ও এলএমএস' }, icon: 'graduation-cap' },
  { slug: 'restaurant', name: { en: 'Restaurant & Food', bn: 'রেস্টুরেন্ট ও খাবার' }, icon: 'utensils' },
  { slug: 'real-estate', name: { en: 'Real Estate', bn: 'রিয়েল এস্টেট' }, icon: 'building-2' },
  { slug: 'health', name: { en: 'Health & Pharmacy', bn: 'হেলথ ও ফার্মেসি' }, icon: 'heart-pulse' },
  { slug: 'news', name: { en: 'News & Magazine', bn: 'নিউজ ও ম্যাগাজিন' }, icon: 'newspaper' },
  { slug: 'portfolio', name: { en: 'Portfolio & Agency', bn: 'পোর্টফোলিও ও এজেন্সি' }, icon: 'palette' },
  { slug: 'plugins', name: { en: 'Plugins & Tools', bn: 'প্লাগইন ও টুলস' }, icon: 'puzzle' },
];

export interface SeedProduct {
  slug: string;
  type: ProductType;
  category: string;
  name: string;
  kind: Localized;
  tagline: string;
  price: number;
  compareAtPrice: number | null;
  techStack: TechStack;
  techTags: string[];
  palette: Palette;
  featured?: boolean;
  specific: Localized[];
  views: number;
  sales: number;
}

const STACK = ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'MongoDB'];

export const products: SeedProduct[] = [
  {
    slug: 'shoplane',
    type: 'website',
    category: 'fashion',
    name: 'Shoplane',
    kind: { en: 'fashion eCommerce website', bn: 'ফ্যাশন ই-কমার্স ওয়েবসাইট' },
    tagline: 'Style that moves with you',
    price: 2490,
    compareAtPrice: 4990,
    techStack: 'nextjs',
    techTags: [...STACK, 'Stripe-ready'],
    palette: { primary: '#db2777', secondary: '#f472b6', tint: '#fdf2f8', dark: '#500724' },
    featured: true,
    specific: [
      { en: 'Size and color variants with stock per variant', bn: 'ভ্যারিয়েন্ট অনুযায়ী সাইজ, কালার ও স্টক' },
      { en: 'Lookbook and new-arrival collections', bn: 'লুকবুক ও নিউ অ্যারাইভাল কালেকশন' },
    ],
    views: 4280,
    sales: 64,
  },
  {
    slug: 'freshcart',
    type: 'website',
    category: 'grocery',
    name: 'Freshcart',
    kind: { en: 'grocery delivery website', bn: 'গ্রোসারি ডেলিভারি ওয়েবসাইট' },
    tagline: 'Farm-fresh groceries at your door',
    price: 2290,
    compareAtPrice: 4490,
    techStack: 'nextjs',
    techTags: STACK,
    palette: { primary: '#16a34a', secondary: '#84cc16', tint: '#f0fdf4', dark: '#052e16' },
    featured: true,
    specific: [
      { en: 'Delivery slots and area-based shipping charges', bn: 'ডেলিভারি স্লট ও এলাকাভিত্তিক শিপিং চার্জ' },
      { en: 'Weight-based units (kg, gram, piece)', bn: 'ওজনভিত্তিক ইউনিট (কেজি, গ্রাম, পিস)' },
    ],
    views: 3910,
    sales: 58,
  },
  {
    slug: 'voltix',
    type: 'website',
    category: 'electronics',
    name: 'Voltix',
    kind: { en: 'gadget and electronics store', bn: 'গ্যাজেট ও ইলেকট্রনিক্স স্টোর' },
    tagline: 'The latest tech, delivered fast',
    price: 2690,
    compareAtPrice: 5490,
    techStack: 'nextjs',
    techTags: [...STACK, 'EMI-ready'],
    palette: { primary: '#2563eb', secondary: '#06b6d4', tint: '#eff6ff', dark: '#0b1a3d' },
    featured: true,
    specific: [
      { en: 'Product specifications table and comparison', bn: 'প্রোডাক্ট স্পেসিফিকেশন টেবিল ও তুলনা' },
      { en: 'Warranty and EMI information blocks', bn: 'ওয়ারেন্টি ও ইএমআই তথ্য সেকশন' },
    ],
    views: 5120,
    sales: 71,
  },
  {
    slug: 'glowella',
    type: 'website',
    category: 'beauty',
    name: 'Glowella',
    kind: { en: 'beauty and skincare store', bn: 'বিউটি ও স্কিনকেয়ার স্টোর' },
    tagline: 'Skincare that loves you back',
    price: 2190,
    compareAtPrice: 4290,
    techStack: 'nextjs',
    techTags: STACK,
    palette: { primary: '#e11d48', secondary: '#fb923c', tint: '#fff1f2', dark: '#4c0519' },
    specific: [
      { en: 'Skin-type filters and routine bundles', bn: 'স্কিন টাইপ ফিল্টার ও রুটিন বান্ডেল' },
      { en: 'Authenticity badges and ingredient lists', bn: 'অথেনটিসিটি ব্যাজ ও উপাদান তালিকা' },
    ],
    views: 2760,
    sales: 39,
  },
  {
    slug: 'ledgerly',
    type: 'website',
    category: 'business',
    name: 'Ledgerly',
    kind: { en: 'SaaS business website with dashboard', bn: 'ড্যাশবোর্ডসহ SaaS বিজনেস ওয়েবসাইট' },
    tagline: 'Accounting made effortless',
    price: 2990,
    compareAtPrice: 5990,
    techStack: 'nextjs',
    techTags: [...STACK, 'Subscriptions'],
    palette: { primary: '#4f46e5', secondary: '#8b5cf6', tint: '#eef2ff', dark: '#1e1b4b' },
    specific: [
      { en: 'Pricing plans with subscription billing', bn: 'সাবস্ক্রিপশন বিলিংসহ প্রাইসিং প্ল্যান' },
      { en: 'Customer workspace with invoices and reports', bn: 'ইনভয়েস ও রিপোর্টসহ কাস্টমার ওয়ার্কস্পেস' },
    ],
    views: 1980,
    sales: 22,
  },
  {
    slug: 'learnova',
    type: 'website',
    category: 'education',
    name: 'Learnova',
    kind: { en: 'online course and LMS platform', bn: 'অনলাইন কোর্স ও এলএমএস প্ল্যাটফর্ম' },
    tagline: 'Learn practical skills online',
    price: 3490,
    compareAtPrice: 6990,
    techStack: 'nextjs',
    techTags: [...STACK, 'Video streaming'],
    palette: { primary: '#0d9488', secondary: '#22c55e', tint: '#f0fdfa', dark: '#042f2e' },
    featured: true,
    specific: [
      { en: 'Courses, lessons, quizzes and certificates', bn: 'কোর্স, লেসন, কুইজ ও সার্টিফিকেট' },
      { en: 'Student progress tracking and instructor panel', bn: 'স্টুডেন্ট প্রগ্রেস ট্র্যাকিং ও ইন্সট্রাক্টর প্যানেল' },
    ],
    views: 3340,
    sales: 47,
  },
  {
    slug: 'tastebud',
    type: 'website',
    category: 'restaurant',
    name: 'Tastebud',
    kind: { en: 'restaurant ordering website', bn: 'রেস্টুরেন্ট অর্ডারিং ওয়েবসাইট' },
    tagline: 'Order your favourite meals',
    price: 1990,
    compareAtPrice: 3990,
    techStack: 'nextjs',
    techTags: STACK,
    palette: { primary: '#ea580c', secondary: '#facc15', tint: '#fff7ed', dark: '#431407' },
    specific: [
      { en: 'Menu with add-ons and combo meals', bn: 'অ্যাড-অন ও কম্বো মিলসহ মেনু' },
      { en: 'Table reservation and kitchen order view', bn: 'টেবিল রিজার্ভেশন ও কিচেন অর্ডার ভিউ' },
    ],
    views: 2210,
    sales: 31,
  },
  {
    slug: 'nestora',
    type: 'website',
    category: 'real-estate',
    name: 'Nestora',
    kind: { en: 'real estate listing website', bn: 'রিয়েল এস্টেট লিস্টিং ওয়েবসাইট' },
    tagline: 'Find the home you deserve',
    price: 2790,
    compareAtPrice: 5490,
    techStack: 'nextjs',
    techTags: [...STACK, 'Maps'],
    palette: { primary: '#0f766e', secondary: '#0ea5e9', tint: '#ecfeff', dark: '#083344' },
    specific: [
      { en: 'Property search with location, price and size filters', bn: 'লোকেশন, দাম ও সাইজ ফিল্টারসহ প্রপার্টি সার্চ' },
      { en: 'Agent profiles and inquiry management', bn: 'এজেন্ট প্রোফাইল ও ইনকোয়ারি ম্যানেজমেন্ট' },
    ],
    views: 1640,
    sales: 18,
  },
  {
    slug: 'medikit',
    type: 'website',
    category: 'health',
    name: 'Medikit',
    kind: { en: 'online pharmacy website', bn: 'অনলাইন ফার্মেসি ওয়েবসাইট' },
    tagline: 'Genuine medicine, delivered',
    price: 2490,
    compareAtPrice: 4990,
    techStack: 'nextjs',
    techTags: STACK,
    palette: { primary: '#0284c7', secondary: '#10b981', tint: '#f0f9ff', dark: '#082f49' },
    specific: [
      { en: 'Prescription upload with order review', bn: 'প্রেসক্রিপশন আপলোড ও অর্ডার রিভিউ' },
      { en: 'Generic name search and dosage details', bn: 'জেনেরিক নাম সার্চ ও ডোজের তথ্য' },
    ],
    views: 1870,
    sales: 26,
  },
  {
    slug: 'dainik-pulse',
    type: 'website',
    category: 'news',
    name: 'Dainik Pulse',
    kind: { en: 'news portal', bn: 'নিউজ পোর্টাল' },
    tagline: 'Breaking news, every minute',
    price: 2290,
    compareAtPrice: 4490,
    techStack: 'nextjs',
    techTags: [...STACK, 'ISR'],
    palette: { primary: '#dc2626', secondary: '#1d4ed8', tint: '#fef2f2', dark: '#1f2937' },
    specific: [
      { en: 'Bangla-first typography and breaking-news ticker', bn: 'বাংলা টাইপোগ্রাফি ও ব্রেকিং নিউজ টিকার' },
      { en: 'Editor roles, categories and scheduled posts', bn: 'এডিটর রোল, ক্যাটাগরি ও শিডিউলড পোস্ট' },
    ],
    views: 2450,
    sales: 29,
  },
  {
    slug: 'folio-studio',
    type: 'website',
    category: 'portfolio',
    name: 'Folio Studio',
    kind: { en: 'agency and portfolio website', bn: 'এজেন্সি ও পোর্টফোলিও ওয়েবসাইট' },
    tagline: 'We craft digital experiences',
    price: 1490,
    compareAtPrice: 2990,
    techStack: 'nextjs',
    techTags: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Motion'],
    palette: { primary: '#7c3aed', secondary: '#ec4899', tint: '#f5f3ff', dark: '#1e1033' },
    specific: [
      { en: 'Case studies with rich media galleries', bn: 'রিচ মিডিয়া গ্যালারিসহ কেস স্টাডি' },
      { en: 'Smooth page transitions and scroll animations', bn: 'স্মুথ পেজ ট্রানজিশন ও স্ক্রল অ্যানিমেশন' },
    ],
    views: 1720,
    sales: 21,
  },
  {
    slug: 'threadline',
    type: 'website',
    category: 'fashion',
    name: 'Threadline',
    kind: { en: 'clothing and apparel store', bn: 'ক্লোদিং ও অ্যাপারেল স্টোর' },
    tagline: 'Everyday wear, elevated',
    price: 2190,
    compareAtPrice: 4390,
    techStack: 'nextjs',
    techTags: STACK,
    palette: { primary: '#0f172a', secondary: '#f59e0b', tint: '#f8fafc', dark: '#020617' },
    specific: [
      { en: 'Size guide and fit recommendations', bn: 'সাইজ গাইড ও ফিট রিকমেন্ডেশন' },
      { en: 'Bulk order and wholesale pricing', bn: 'বাল্ক অর্ডার ও হোলসেল প্রাইসিং' },
    ],
    views: 2980,
    sales: 41,
  },
  {
    slug: 'bazaarly',
    type: 'website',
    category: 'business',
    name: 'Bazaarly',
    kind: { en: 'multipurpose eCommerce website', bn: 'মাল্টিপারপাস ই-কমার্স ওয়েবসাইট' },
    tagline: 'Everything you need, one store',
    price: 2490,
    compareAtPrice: 4990,
    techStack: 'nextjs',
    techTags: STACK,
    palette: { primary: '#9333ea', secondary: '#f97316', tint: '#faf5ff', dark: '#2e1065' },
    featured: true,
    specific: [
      { en: 'Unlimited categories with mega menu', bn: 'মেগা মেনুসহ আনলিমিটেড ক্যাটাগরি' },
      { en: 'Flash sales with countdown timers', bn: 'কাউন্টডাউন টাইমারসহ ফ্ল্যাশ সেল' },
    ],
    views: 4630,
    sales: 69,
  },
  {
    slug: 'modestia',
    type: 'website',
    category: 'fashion',
    name: 'Modestia',
    kind: { en: 'modest fashion and hijab store', bn: 'মডেস্ট ফ্যাশন ও হিজাব স্টোর' },
    tagline: 'Elegance in every layer',
    price: 1990,
    compareAtPrice: 3990,
    techStack: 'nextjs',
    techTags: STACK,
    palette: { primary: '#9d174d', secondary: '#d4a373', tint: '#fdf4f8', dark: '#3b0a20' },
    specific: [
      { en: 'Fabric and occasion filters', bn: 'ফেব্রিক ও অকেশন ফিল্টার' },
      { en: 'Pre-order support for new collections', bn: 'নতুন কালেকশনের প্রি-অর্ডার সাপোর্ট' },
    ],
    views: 2140,
    sales: 33,
  },
  {
    slug: 'booknook',
    type: 'website',
    category: 'education',
    name: 'Booknook',
    kind: { en: 'online bookstore', bn: 'অনলাইন বুকস্টোর' },
    tagline: 'Stories worth reading',
    price: 1790,
    compareAtPrice: 3590,
    techStack: 'nextjs',
    techTags: STACK,
    palette: { primary: '#b45309', secondary: '#0d9488', tint: '#fffbeb', dark: '#451a03' },
    specific: [
      { en: 'Author, publisher and series pages', bn: 'লেখক, প্রকাশক ও সিরিজ পেজ' },
      { en: 'Read-a-sample previews', bn: 'বইয়ের নমুনা পাতা প্রিভিউ' },
    ],
    views: 1530,
    sales: 19,
  },
  {
    slug: 'courierly',
    type: 'website',
    category: 'business',
    name: 'Courierly',
    kind: { en: 'courier and parcel tracking platform', bn: 'কুরিয়ার ও পার্সেল ট্র্যাকিং প্ল্যাটফর্ম' },
    tagline: 'Track every parcel in real time',
    price: 2990,
    compareAtPrice: 5490,
    techStack: 'nextjs',
    techTags: [...STACK, 'Realtime'],
    palette: { primary: '#ca8a04', secondary: '#2563eb', tint: '#fefce8', dark: '#1c1917' },
    specific: [
      { en: 'Merchant panel with bulk parcel booking', bn: 'বাল্ক পার্সেল বুকিংসহ মার্চেন্ট প্যানেল' },
      { en: 'Rider assignment and delivery status updates', bn: 'রাইডার অ্যাসাইনমেন্ট ও ডেলিভারি স্ট্যাটাস আপডেট' },
    ],
    views: 1290,
    sales: 14,
  },
  {
    slug: 'paykit-bd',
    type: 'plugin',
    category: 'plugins',
    name: 'PayKit BD',
    kind: { en: 'bKash, Nagad and Rocket payment kit for Next.js', bn: 'Next.js-এর জন্য বিকাশ, নগদ ও রকেট পেমেন্ট কিট' },
    tagline: 'Local payments in minutes',
    price: 990,
    compareAtPrice: 1990,
    techStack: 'nextjs',
    techTags: ['Next.js 16', 'TypeScript', 'bKash', 'Nagad'],
    palette: { primary: '#e2136e', secondary: '#f97316', tint: '#fdf2f8', dark: '#3f0b24' },
    specific: [
      { en: 'Drop-in checkout components and server actions', bn: 'রেডিমেড চেকআউট কম্পোনেন্ট ও সার্ভার অ্যাকশন' },
      { en: 'Webhook verification and payment logs', bn: 'ওয়েবহুক ভেরিফিকেশন ও পেমেন্ট লগ' },
    ],
    views: 2870,
    sales: 52,
  },
  {
    slug: 'fraud-guard',
    type: 'plugin',
    category: 'plugins',
    name: 'Fraud Guard',
    kind: { en: 'order fraud checker module', bn: 'অর্ডার ফ্রড চেকার মডিউল' },
    tagline: 'Stop fake orders before they ship',
    price: 790,
    compareAtPrice: 1490,
    techStack: 'nextjs',
    techTags: ['Next.js 16', 'TypeScript', 'MongoDB'],
    palette: { primary: '#dc2626', secondary: '#7c3aed', tint: '#fef2f2', dark: '#2a0a0a' },
    specific: [
      { en: 'Courier success-rate check by phone number', bn: 'ফোন নম্বর দিয়ে কুরিয়ার সাকসেস রেট চেক' },
      { en: 'Block list and suspicious order alerts', bn: 'ব্লক লিস্ট ও সন্দেহজনক অর্ডার অ্যালার্ট' },
    ],
    views: 1960,
    sales: 37,
  },
  {
    slug: 'launchpad-starter',
    type: 'website',
    category: 'portfolio',
    name: 'Launchpad',
    kind: { en: 'free Next.js landing page starter', bn: 'ফ্রি Next.js ল্যান্ডিং পেজ স্টার্টার' },
    tagline: 'Launch your idea today',
    price: 0,
    compareAtPrice: null,
    techStack: 'nextjs',
    techTags: ['Next.js 16', 'TypeScript', 'Tailwind CSS'],
    palette: { primary: '#6366f1', secondary: '#14b8a6', tint: '#eef2ff', dark: '#1e1b4b' },
    specific: [
      { en: 'Hero, features, pricing and FAQ sections', bn: 'হিরো, ফিচার, প্রাইসিং ও FAQ সেকশন' },
      { en: 'Contact form with email delivery', bn: 'ইমেইল ডেলিভারিসহ কন্টাক্ট ফর্ম' },
    ],
    views: 3620,
    sales: 88,
  },
];

const COMMON_FEATURES: Localized[] = [
  { en: 'Admin dashboard for products, orders and customers', bn: 'প্রোডাক্ট, অর্ডার ও কাস্টমার ম্যানেজের অ্যাডমিন ড্যাশবোর্ড' },
  { en: 'bKash, Nagad and card payments ready', bn: 'বিকাশ, নগদ ও কার্ড পেমেন্ট রেডি' },
  { en: 'Courier integration and order tracking', bn: 'কুরিয়ার ইন্টিগ্রেশন ও অর্ডার ট্র্যাকিং' },
  { en: 'Incomplete order capture and recovery', bn: 'ইনকমপ্লিট অর্ডার ক্যাপচার ও রিকভারি' },
  { en: 'Facebook Pixel and Conversion API', bn: 'ফেসবুক পিক্সেল ও কনভার্শন API' },
  { en: 'SEO, sitemap and fast server rendering', bn: 'SEO, সাইটম্যাপ ও দ্রুত সার্ভার রেন্ডারিং' },
  { en: 'Fully responsive, mobile-first design', bn: 'সম্পূর্ণ রেসপন্সিভ, মোবাইল-ফার্স্ট ডিজাইন' },
];

export const HIGHLIGHTS: Localized[] = [
  { en: 'Full source code', bn: 'সম্পূর্ণ সোর্স কোড' },
  { en: 'Lifetime updates', bn: 'লাইফটাইম আপডেট' },
  { en: 'Free Vercel setup', bn: 'ফ্রি Vercel সেটআপ' },
  { en: 'Commercial license', bn: 'কমার্শিয়াল লাইসেন্স' },
  { en: '6 months support', bn: '৬ মাস সাপোর্ট' },
  { en: 'Instant access', bn: 'তাৎক্ষণিক অ্যাক্সেস' },
];

export function featuresFor(product: SeedProduct): Localized[] {
  if (product.type === 'plugin') {
    return [
      ...product.specific,
      { en: 'Typed API with full TypeScript support', bn: 'সম্পূর্ণ TypeScript সাপোর্টসহ টাইপড API' },
      { en: 'Works with any Next.js App Router project', bn: 'যেকোনো Next.js App Router প্রজেক্টে কাজ করে' },
      { en: 'Step-by-step integration guide', bn: 'ধাপে ধাপে ইন্টিগ্রেশন গাইড' },
    ];
  }
  return [...product.specific, ...COMMON_FEATURES];
}

export function descriptionFor(product: SeedProduct): Localized {
  const features = featuresFor(product);
  const list = (lang: 'en' | 'bn') => `<ul>${features.map((f) => `<li>${f[lang]}</li>`).join('')}</ul>`;

  if (product.type === 'plugin') {
    return {
      en: `<p><strong>${product.name}</strong> is a ${product.kind.en}. Add it to your existing Next.js project and get production-ready functionality without writing it from scratch.</p><h3>Features</h3>${list('en')}<h3>What you get</h3><ul><li>Complete source code on GitHub</li><li>Integration guide and environment variable reference</li><li>Free updates for life</li></ul>`,
      bn: `<p><strong>${product.name}</strong> হলো ${product.kind.bn}। আপনার চলমান Next.js প্রজেক্টে যুক্ত করুন এবং শূন্য থেকে কোড না লিখেই প্রোডাকশন-রেডি ফিচার পান।</p><h3>ফিচারসমূহ</h3>${list('bn')}<h3>যা পাবেন</h3><ul><li>GitHub-এ সম্পূর্ণ সোর্স কোড</li><li>ইন্টিগ্রেশন গাইড ও এনভায়রনমেন্ট ভেরিয়েবল রেফারেন্স</li><li>আজীবন ফ্রি আপডেট</li></ul>`,
    };
  }

  return {
    en: `<p><strong>${product.name}</strong> is a production-ready ${product.kind.en} built with Next.js, TypeScript and MongoDB. It ships with a polished storefront, a complete admin dashboard and the integrations businesses in Bangladesh need from day one.</p><p>Change the logo, colors, banners and content from the dashboard, with no coding required.</p><h3>Key features</h3>${list('en')}<h3>What you get</h3><ul><li>Complete source code on GitHub</li><li>Setup guide and environment variable reference</li><li>Free Vercel deployment setup on request</li><li>6 months of support and lifetime updates</li></ul>`,
    bn: `<p><strong>${product.name}</strong> একটি প্রোডাকশন-রেডি ${product.kind.bn}, যা Next.js, TypeScript ও MongoDB দিয়ে তৈরি। এতে আছে আধুনিক স্টোরফ্রন্ট, সম্পূর্ণ অ্যাডমিন ড্যাশবোর্ড এবং বাংলাদেশের ব্যবসার প্রয়োজনীয় সব ইন্টিগ্রেশন।</p><p>কোনো কোডিং ছাড়াই ড্যাশবোর্ড থেকে লোগো, কালার, ব্যানার ও কনটেন্ট পরিবর্তন করা যাবে।</p><h3>প্রধান ফিচারসমূহ</h3>${list('bn')}<h3>যা পাবেন</h3><ul><li>GitHub-এ সম্পূর্ণ সোর্স কোড</li><li>সেটআপ গাইড ও এনভায়রনমেন্ট ভেরিয়েবল রেফারেন্স</li><li>অনুরোধে ফ্রি Vercel ডিপ্লয়মেন্ট সেটআপ</li><li>৬ মাস সাপোর্ট ও আজীবন আপডেট</li></ul>`,
  };
}

export const membership = {
  slug: 'lifetime-membership',
  title: { en: 'Lifetime All Access Membership', bn: 'লাইফটাইম অল অ্যাক্সেস মেম্বারশিপ' },
  shortDescription: {
    en: 'Every website and plugin on Proxima, including future releases, with a single payment.',
    bn: 'একবার পেমেন্টে Proxima-র সব ওয়েবসাইট ও প্লাগইন, ভবিষ্যতের রিলিজসহ।',
  },
  description: {
    en: '<p>The lifetime membership unlocks every premium website and plugin on Proxima, including everything we release in the future.</p><h3>Membership benefits</h3><ul><li>Access to all premium websites and plugins</li><li>Every future release added to your account automatically</li><li>GitHub source code and downloads for each product</li><li>Commercial license for your own and client projects</li><li>Free Vercel deployment setup on request</li><li>Priority support</li></ul><p>Ideal for agencies, freelancers and businesses that launch websites regularly.</p>',
    bn: '<p>লাইফটাইম মেম্বারশিপে Proxima-র সব প্রিমিয়াম ওয়েবসাইট ও প্লাগইন আনলক হবে, ভবিষ্যতে যা রিলিজ হবে সেগুলোসহ।</p><h3>মেম্বারশিপের সুবিধা</h3><ul><li>সব প্রিমিয়াম ওয়েবসাইট ও প্লাগইনের অ্যাক্সেস</li><li>প্রতিটি নতুন রিলিজ স্বয়ংক্রিয়ভাবে আপনার অ্যাকাউন্টে</li><li>প্রতিটি প্রোডাক্টের GitHub সোর্স কোড ও ডাউনলোড</li><li>নিজের ও ক্লায়েন্টের প্রজেক্টের জন্য কমার্শিয়াল লাইসেন্স</li><li>অনুরোধে ফ্রি Vercel ডিপ্লয়মেন্ট সেটআপ</li><li>প্রায়োরিটি সাপোর্ট</li></ul><p>যারা নিয়মিত ওয়েবসাইট লঞ্চ করেন, সেই এজেন্সি, ফ্রিল্যান্সার ও ব্যবসার জন্য আদর্শ।</p>',
  },
  price: 9990,
  compareAtPrice: 19990,
  highlights: [
    { en: 'Lifetime access', bn: 'লাইফটাইম অ্যাক্সেস' },
    { en: 'All websites & plugins', bn: 'সব ওয়েবসাইট ও প্লাগইন' },
    { en: 'Future releases included', bn: 'ভবিষ্যতের রিলিজসহ' },
    { en: 'Commercial license', bn: 'কমার্শিয়াল লাইসেন্স' },
    { en: 'Priority support', bn: 'প্রায়োরিটি সাপোর্ট' },
    { en: 'Instant access', bn: 'তাৎক্ষণিক অ্যাক্সেস' },
  ],
};

export const pages: { slug: string; title: Localized; content: Localized }[] = [
  {
    slug: 'about',
    title: { en: 'About Proxima', bn: 'Proxima সম্পর্কে' },
    content: {
      en: '<p>Proxima builds production-ready websites for businesses in Bangladesh. Every product is a complete Next.js application with a storefront, an admin dashboard and the local integrations that online businesses rely on: bKash, Nagad, courier services and Facebook advertising tools.</p><h3>Why Proxima</h3><ul><li>Modern technology: Next.js, TypeScript and MongoDB</li><li>Full source code you own and can customize</li><li>Designed for Bangla and English audiences</li><li>Support from the team that built the product</li></ul><p>Our goal is simple: help you launch a fast, professional website in days instead of months.</p>',
      bn: '<p>Proxima বাংলাদেশের ব্যবসার জন্য প্রোডাকশন-রেডি ওয়েবসাইট তৈরি করে। প্রতিটি প্রোডাক্ট একটি সম্পূর্ণ Next.js অ্যাপ্লিকেশন, যাতে আছে স্টোরফ্রন্ট, অ্যাডমিন ড্যাশবোর্ড এবং অনলাইন ব্যবসার প্রয়োজনীয় লোকাল ইন্টিগ্রেশন: বিকাশ, নগদ, কুরিয়ার সার্ভিস ও ফেসবুক বিজ্ঞাপনের টুলস।</p><h3>কেন Proxima</h3><ul><li>আধুনিক প্রযুক্তি: Next.js, TypeScript ও MongoDB</li><li>সম্পূর্ণ সোর্স কোড, যা আপনার নিজের এবং কাস্টমাইজযোগ্য</li><li>বাংলা ও ইংরেজি দুই ভাষার জন্য ডিজাইন করা</li><li>যারা প্রোডাক্ট বানিয়েছে, তাদের কাছ থেকেই সাপোর্ট</li></ul><p>আমাদের লক্ষ্য সহজ: মাসের বদলে কয়েক দিনেই একটি দ্রুত ও প্রফেশনাল ওয়েবসাইট লঞ্চ করতে আপনাকে সাহায্য করা।</p>',
    },
  },
  {
    slug: 'delivery-policy',
    title: { en: 'Delivery Policy', bn: 'ডেলিভারি পলিসি' },
    content: {
      en: '<p>All Proxima products are digital and delivered online. Nothing is shipped physically.</p><h3>How delivery works</h3><ul><li>As soon as your payment is confirmed, the product appears under <strong>My Products</strong> in your account.</li><li>Each product includes its GitHub source code link and, where available, a downloadable zip file.</li><li>Lifetime members get access to every website and plugin immediately after payment.</li></ul><h3>Delays</h3><p>If a product does not appear within 30 minutes of a successful payment, contact support with your invoice number and we will resolve it.</p>',
      bn: '<p>Proxima-র সব প্রোডাক্ট ডিজিটাল এবং অনলাইনে ডেলিভারি করা হয়। কোনো কিছু ফিজিক্যালি পাঠানো হয় না।</p><h3>ডেলিভারি যেভাবে হয়</h3><ul><li>পেমেন্ট নিশ্চিত হওয়ার সাথে সাথে প্রোডাক্টটি আপনার অ্যাকাউন্টের <strong>My Products</strong>-এ চলে আসবে।</li><li>প্রতিটি প্রোডাক্টে GitHub সোর্স কোড লিংক এবং প্রযোজ্য ক্ষেত্রে ডাউনলোডযোগ্য জিপ ফাইল থাকবে।</li><li>লাইফটাইম মেম্বাররা পেমেন্টের পরপরই সব ওয়েবসাইট ও প্লাগইনের অ্যাক্সেস পাবেন।</li></ul><h3>বিলম্ব হলে</h3><p>সফল পেমেন্টের ৩০ মিনিটের মধ্যে প্রোডাক্ট না দেখা গেলে ইনভয়েস নম্বরসহ সাপোর্টে যোগাযোগ করুন, আমরা সমাধান করে দেব।</p>',
    },
  },
  {
    slug: 'terms',
    title: { en: 'Terms & Conditions', bn: 'শর্তাবলি' },
    content: {
      en: '<p>By purchasing from Proxima you agree to the following terms.</p><h3>License</h3><ul><li>Each purchase grants a commercial license to use the product for your own business or for client projects.</li><li>You may modify the source code freely.</li><li>You may not resell, redistribute or share the original source code or files as a template product.</li></ul><h3>Accounts</h3><ul><li>Your account and product access are personal. Sharing access with others may lead to suspension.</li><li>You are responsible for keeping your login details secure.</li></ul><h3>Support</h3><p>Support covers installation guidance and bugs in the original product. Custom development is not included but can be requested separately.</p><h3>Changes</h3><p>We may update these terms. Continued use of the site means you accept the updated terms.</p>',
      bn: '<p>Proxima থেকে কেনাকাটা করলে আপনি নিচের শর্তগুলোতে সম্মত হচ্ছেন।</p><h3>লাইসেন্স</h3><ul><li>প্রতিটি কেনাকাটায় নিজের ব্যবসা বা ক্লায়েন্ট প্রজেক্টে প্রোডাক্ট ব্যবহারের কমার্শিয়াল লাইসেন্স দেওয়া হয়।</li><li>সোর্স কোড আপনি স্বাধীনভাবে পরিবর্তন করতে পারবেন।</li><li>মূল সোর্স কোড বা ফাইল টেমপ্লেট প্রোডাক্ট হিসেবে পুনরায় বিক্রি, বিতরণ বা শেয়ার করা যাবে না।</li></ul><h3>অ্যাকাউন্ট</h3><ul><li>আপনার অ্যাকাউন্ট ও প্রোডাক্ট অ্যাক্সেস ব্যক্তিগত। অন্যের সাথে শেয়ার করলে অ্যাকাউন্ট স্থগিত হতে পারে।</li><li>লগইন তথ্য সুরক্ষিত রাখার দায়িত্ব আপনার।</li></ul><h3>সাপোর্ট</h3><p>সাপোর্টের আওতায় ইনস্টলেশন গাইডেন্স ও মূল প্রোডাক্টের বাগ সমাধান অন্তর্ভুক্ত। কাস্টম ডেভেলপমেন্ট অন্তর্ভুক্ত নয়, তবে আলাদাভাবে অনুরোধ করা যাবে।</p><h3>পরিবর্তন</h3><p>আমরা এই শর্তাবলি হালনাগাদ করতে পারি। সাইট ব্যবহার অব্যাহত রাখলে হালনাগাদ শর্তাবলি মেনে নিয়েছেন বলে গণ্য হবে।</p>',
    },
  },
  {
    slug: 'refund-policy',
    title: { en: 'Refund Policy', bn: 'রিফান্ড পলিসি' },
    content: {
      en: '<p>Because our products are digital and the source code is available immediately after purchase, refunds are limited to the cases below.</p><h3>Eligible for a refund</h3><ul><li>You were charged twice for the same order.</li><li>The product is materially different from its description and we cannot fix it within 7 days of your report.</li><li>You paid but never received access and our team cannot resolve it.</li></ul><h3>Not eligible</h3><ul><li>Change of mind after accessing the source code.</li><li>Issues caused by modifications to the original code or third-party services.</li></ul><h3>How to request</h3><p>Contact support within 7 days of purchase with your invoice number. Approved refunds are returned to the original payment method within 7–10 working days, and access to the product is removed.</p>',
      bn: '<p>আমাদের প্রোডাক্টগুলো ডিজিটাল এবং কেনার পরপরই সোর্স কোড পাওয়া যায়, তাই নিচের ক্ষেত্রগুলোতেই কেবল রিফান্ড প্রযোজ্য।</p><h3>রিফান্ড পাবেন যদি</h3><ul><li>একই অর্ডারের জন্য দুইবার টাকা কাটা হয়।</li><li>প্রোডাক্টটি বর্ণনা থেকে উল্লেখযোগ্যভাবে আলাদা হয় এবং রিপোর্টের ৭ দিনের মধ্যে আমরা ঠিক করতে না পারি।</li><li>পেমেন্ট করেছেন কিন্তু অ্যাক্সেস পাননি এবং আমাদের টিম সমাধান করতে পারেনি।</li></ul><h3>রিফান্ড প্রযোজ্য নয়</h3><ul><li>সোর্স কোড অ্যাক্সেস করার পর মত পরিবর্তন।</li><li>মূল কোড পরিবর্তন বা থার্ড-পার্টি সার্ভিসের কারণে সৃষ্ট সমস্যা।</li></ul><h3>যেভাবে আবেদন করবেন</h3><p>কেনার ৭ দিনের মধ্যে ইনভয়েস নম্বরসহ সাপোর্টে যোগাযোগ করুন। অনুমোদিত রিফান্ড ৭–১০ কর্মদিবসের মধ্যে মূল পেমেন্ট মাধ্যমে ফেরত দেওয়া হবে এবং প্রোডাক্টের অ্যাক্সেস বন্ধ করা হবে।</p>',
    },
  },
  {
    slug: 'setup-guide',
    title: { en: 'Setup Guide', bn: 'সেটআপ গাইড' },
    content: {
      en: '<p>Every Proxima website is a full-stack Next.js application. Follow these steps to run it.</p><h3>1. Get the code</h3><p>Open <strong>My Products</strong> in your account and use the GitHub link, or download the zip file.</p><h3>2. Install</h3><ul><li>Install Node.js 20 or newer.</li><li>Run <code>pnpm install</code> (or <code>npm install</code>) in the project folder.</li></ul><h3>3. Configure</h3><p>Create a <code>.env</code> file using the variable list in the project README: database connection, payment keys and storage.</p><h3>4. Run</h3><p>Start the development server with <code>pnpm dev</code>, then open the URL shown in the terminal.</p><h3>5. Go live</h3><p>Deploy to Vercel or your own server. Need help? Request our free Vercel setup from the Help page.</p>',
      bn: '<p>Proxima-র প্রতিটি ওয়েবসাইট একটি ফুল-স্ট্যাক Next.js অ্যাপ্লিকেশন। চালু করতে নিচের ধাপগুলো অনুসরণ করুন।</p><h3>১. কোড সংগ্রহ</h3><p>অ্যাকাউন্টের <strong>My Products</strong> থেকে GitHub লিংক ব্যবহার করুন অথবা জিপ ফাইল ডাউনলোড করুন।</p><h3>২. ইনস্টল</h3><ul><li>Node.js 20 বা নতুন ভার্সন ইনস্টল করুন।</li><li>প্রজেক্ট ফোল্ডারে <code>pnpm install</code> (বা <code>npm install</code>) চালান।</li></ul><h3>৩. কনফিগার</h3><p>প্রজেক্টের README-তে দেওয়া ভেরিয়েবল তালিকা অনুযায়ী <code>.env</code> ফাইল তৈরি করুন: ডাটাবেস কানেকশন, পেমেন্ট কী ও স্টোরেজ।</p><h3>৪. রান</h3><p><code>pnpm dev</code> দিয়ে ডেভেলপমেন্ট সার্ভার চালু করে টার্মিনালে দেখানো URL খুলুন।</p><h3>৫. লাইভ করুন</h3><p>Vercel বা নিজের সার্ভারে ডিপ্লয় করুন। সাহায্য লাগলে Help পেজ থেকে আমাদের ফ্রি Vercel সেটআপের অনুরোধ করুন।</p>',
    },
  },
];
