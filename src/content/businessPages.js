import business from './business.json' with { type: 'json' };
import { getReadinessIssues, getDraftContentIssues } from './readiness.js';
import { privacyPolicy } from './privacyPolicy.js';
import { refundPolicy } from './refundPolicy.js';
import { termsAndConditions } from './termsAndConditions.js';
import { aboutUs } from './aboutUs.js';
import { shippingPolicy } from './shippingPolicy.js';
import { contactUs } from './contactUs.js';

export const businessPages = {
  'refund-policy': refundPolicy,
  'privacy-policy': privacyPolicy,
  'terms-and-conditions': termsAndConditions,
  'shipping-policy': shippingPolicy,
  about: aboutUs,
  contact: contactUs,
};

export const publicBusinessLinks = [
  { label: 'Contact us', to: '/contact' }, { label: 'Shipping & delivery', to: '/shipping-policy' },
  { label: 'Refund & return policy', to: '/refund-policy' }, { label: 'About us', to: '/about' },
  { label: 'Privacy policy', to: '/privacy-policy' }, { label: 'Terms & conditions', to: '/terms-and-conditions' },
];

export const isBusinessReady = getReadinessIssues(business).length === 0 && getDraftContentIssues(businessPages).length === 0;
