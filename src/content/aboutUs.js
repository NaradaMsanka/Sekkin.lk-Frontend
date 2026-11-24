import business from './business.json' with { type: 'json' };
import { supportPhoneHref } from './businessContacts.js';

// Content supplied by the website owner in About us.txt.
export const aboutUs = {
  title: 'About Us',
  category: 'Our brand',
  approved: true,
  canonicalUrl: `${business.siteUrl}/about`,
  description: 'Get to know Sekkin.lk, founded in 2025 to bring original international skincare brands to customers across Sri Lanka.',
  intro: 'Founded in 2025, Sekkin.lk was built on a simple belief: great skincare starts with trust. Navigating the beauty world can be overwhelming, especially when trying to find genuine, effective international skincare products locally. We launched Sekkin.lk with a clear mission to make 100% original, globally loved skincare brands easily accessible across Sri Lanka without the guesswork, inflated markups, or worry about counterfeits.',
  contact: { phone: business.supportPhone, phoneHref: supportPhoneHref, email: business.supportEmail },
  sections: [
    {
      id: 'our-promise',
      title: 'Our Promise',
      subtitle: 'Authenticity First',
      body: ['Every single product listed on Sekkin.lk is carefully sourced from trusted, verified suppliers and authorized distributors. Where applicable, our sourcing and operations adhere to Sri Lanka’s National Medicines Regulatory Authority (NMRA) guidelines and local regulatory standards.'],
    },
    {
      id: 'why-shop-with-us',
      title: 'Why Shop With Us?',
      bulleted: true,
      body: [
        'Skincare you can choose with confidence.',
        '100% Genuine Products: Authentic products imported from the UK.',
        'Curated for Real Results: We focus on proven, science-backed, and skin-friendly formulas suited for Sri Lanka’s tropical climate and diverse skin needs.',
        'Transparent Product Info: Clear ingredient breakdowns, honest usage guides, and straightforward policies so you always know what you are putting on your skin.',
        'Islandwide Delivery: Fast, secure packaging and reliable doorstep delivery anywhere in Sri Lanka.',
      ],
    },
    {
      id: 'skincare-made-simple',
      title: 'Skincare Made Simple',
      body: ['Whether you are building your very first daily cleanser-and-sunscreen routine or fine-tuning targeted treatments for acne, dullness, or hydration, Sekkin.lk is here to support your skin journey with honesty, care, and reliability.'],
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      relatedLink: { text: 'Contact Us', to: '/contact' },
      body: [
        'Have a question about a product, your order, or building your skincare routine? Our team is always happy to help.',
        'Website: www.sekkin.lk',
        `Email: ${business.supportEmail}`,
        `WhatsApp / Hotline: ${business.supportPhone}`,
        `Social Media: ${business.socialHandle} (Instagram / Facebook / TikTok)`,
        `Customer Support Hours: ${business.businessHours}`,
        'Visit Contact Us for our business details and support channels.',
        'Thank you for trusting Sekkin.lk with your skin.',
      ],
    },
  ],
};
