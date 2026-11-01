import type { SiteSettingsDTO } from '@/shared';

export function defaultSettings(): SiteSettingsDTO {
  return {
    brand: {
      name: 'Proxima',
      tagline: { en: 'Marketplace', bn: 'মার্কেটপ্লেস' },
      logo: '',
      footerAbout: {
        en: 'Production-ready Next.js websites for growing businesses in Bangladesh. Pick a design, get the source code, and launch in days instead of months.',
        bn: 'বাংলাদেশের ব্যবসার জন্য প্রোডাকশন-রেডি Next.js ওয়েবসাইট। ডিজাইন বেছে নিন, সোর্স কোড পান, আর মাসের বদলে কয়েক দিনেই লঞ্চ করুন।',
      },
    },
    contact: {
      whatsapp: '',
      messenger: '',
      email: '',
      phone: '',
      hours: { en: '', bn: '' },
      address: { en: '', bn: '' },
      tradeLicense: '',
    },
    socials: { facebook: '', youtube: '', instagram: '', linkedin: '', tiktok: '' },
    offerBar: {
      enabled: true,
      label: { en: 'Lifetime Access', bn: 'লাইফটাইম অ্যাক্সেস' },
      price: 9990,
      comparePrice: 19990,
      mode: 'evergreen-daily',
      endsAt: null,
      ctaLabel: { en: 'Get All Access', bn: 'সব অ্যাক্সেস নিন' },
      ctaHref: '/membership',
    },
    promoPopup: {
      enabled: true,
      title: { en: 'Lifetime Membership', bn: 'লাইফটাইম মেম্বারশিপ' },
      subtitle: {
        en: 'Every website and plugin, including future releases, with a single payment.',
        bn: 'একবার পেমেন্টে সব ওয়েবসাইট ও প্লাগইন, ভবিষ্যতের রিলিজসহ।',
      },
      couponCode: 'PROXIMA20',
      discountText: { en: '20% OFF', bn: '২০% ছাড়' },
      delaySeconds: 25,
    },
    hostingPromo: {
      enabled: false,
      title: { en: 'Recommended Hosting', bn: 'রিকমেন্ডেড হোস্টিং' },
      text: { en: 'Deploy your website on fast, reliable hosting.', bn: 'দ্রুত ও নির্ভরযোগ্য হোস্টিংয়ে আপনার ওয়েবসাইট চালু করুন।' },
      ctaLabel: { en: 'Get Started', bn: 'শুরু করুন' },
      url: '',
    },
    paymentLogos: '',
    helpTopics: [
      { en: 'Setting up your website after purchase', bn: 'কেনার পর ওয়েবসাইট সেটআপ' },
      { en: 'Accessing the GitHub repository and downloads', bn: 'GitHub রিপোজিটরি ও ডাউনলোড অ্যাক্সেস' },
      { en: 'Free Vercel deployment setup', bn: 'ফ্রি Vercel ডিপ্লয়মেন্ট সেটআপ' },
      { en: 'Payment and order issues', bn: 'পেমেন্ট ও অর্ডার সংক্রান্ত সমস্যা' },
      { en: 'Membership benefits and access', bn: 'মেম্বারশিপের সুবিধা ও অ্যাক্সেস' },
      { en: 'Customization and environment variables', bn: 'কাস্টমাইজেশন ও এনভায়রনমেন্ট ভেরিয়েবল' },
    ],
    membershipFaq: [
      {
        q: { en: 'Is the membership really a one-time payment?', bn: 'মেম্বারশিপ কি সত্যিই এককালীন পেমেন্ট?' },
        a: {
          en: 'Yes. You pay once and keep access to every website and plugin for life, with no renewals.',
          bn: 'হ্যাঁ। একবার পেমেন্ট করলেই আজীবন সব ওয়েবসাইট ও প্লাগইনের অ্যাক্সেস পাবেন, কোনো রিনিউয়াল নেই।',
        },
      },
      {
        q: { en: 'Do I get products released in the future?', bn: 'ভবিষ্যতে আসা প্রোডাক্টগুলোও কি পাব?' },
        a: {
          en: 'Yes. Every new website and plugin appears in your account automatically.',
          bn: 'হ্যাঁ। প্রতিটি নতুন ওয়েবসাইট ও প্লাগইন স্বয়ংক্রিয়ভাবে আপনার অ্যাকাউন্টে যুক্ত হবে।',
        },
      },
      {
        q: { en: 'Can I use the websites for client projects?', bn: 'ক্লায়েন্ট প্রজেক্টে কি ওয়েবসাইটগুলো ব্যবহার করতে পারব?' },
        a: {
          en: 'Yes. The commercial license covers your own businesses and client work.',
          bn: 'হ্যাঁ। কমার্শিয়াল লাইসেন্সে নিজের ব্যবসা ও ক্লায়েন্টের কাজ দুটোই অন্তর্ভুক্ত।',
        },
      },
      {
        q: { en: 'How do I get the source code?', bn: 'সোর্স কোড কীভাবে পাব?' },
        a: {
          en: 'Right after payment, open My Products in your account to find the GitHub link and the download for each product.',
          bn: 'পেমেন্টের পরপরই অ্যাকাউন্টের My Products-এ প্রতিটি প্রোডাক্টের GitHub লিংক ও ডাউনলোড পাবেন।',
        },
      },
    ],
  };
}
