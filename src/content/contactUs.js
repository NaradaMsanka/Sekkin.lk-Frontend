import business from './business.json' with { type: 'json' };
import { supportPhoneHref } from './businessContacts.js';

// Content supplied by the website owner in Contact us.txt and Business Details.txt.
export const contactUs = {
  title: 'Contact Us',
  category: 'Here to help',
  approved: true,
  canonicalUrl: `${business.siteUrl}/contact`,
  description: 'Contact Sekkin.lk by email or WhatsApp for help with products, orders and skincare. Based in Batapola, Sri Lanka.',
  intro: 'Have a question about a product, your order, or building your skincare routine? Our team is always happy to help.',
  contact: { phone: business.supportPhone, phoneHref: supportPhoneHref, email: business.supportEmail },
  sections: [
    {
      id: 'customer-support',
      title: 'Customer Support',
      body: [
        `Email: ${business.supportEmail}`,
        `WhatsApp / Hotline: ${business.supportPhone}`,
        `Social Media: ${business.socialHandle} (Instagram / Facebook / TikTok)`,
        `Customer Support Hours: ${business.businessHours}`,
      ],
    },
  ],
};
