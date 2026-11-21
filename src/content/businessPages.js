import business from './business.json' with { type: 'json' };
import { getReadinessIssues, getDraftContentIssues } from './readiness.js';
import { privacyPolicy } from './privacyPolicy.js';
import { refundPolicy } from './refundPolicy.js';
import { termsAndConditions } from './termsAndConditions.js';
const review = (value, instruction) => value || `REVIEW REQUIRED — ${instruction}`;
const section = (id, title, ...body) => ({ id, title, body });
const contact = 'Use the Contact us page for the business details available for review. The support email and full postal address must be confirmed before publication.';

export const businessPages = {
  'refund-policy': refundPolicy,
  'privacy-policy': privacyPolicy,
  'terms-and-conditions': termsAndConditions,
  'shipping-policy': {
    title: 'Shipping & Delivery', category: 'Customer care',
    description: 'Delivery coverage, charges, processing, tracking and support decisions for sekkinLK.',
    intro: 'Know what to expect before ordering. The owner must confirm the delivery information below before this becomes a final policy.',
    sections: [
      section('coverage', 'Delivery coverage', review(business.shipping.coverage, 'Confirm delivery areas within Sri Lanka and any excluded or remote locations. The earlier islandwide claim is unverified.')),
      section('processing', 'Order processing', review(business.shipping.processing, 'Confirm processing times, working days, cut-off times and stock-related delays.')),
      section('timelines', 'Estimated delivery periods', review(business.shipping.deliveryEstimate, 'Confirm realistic delivery estimates by area and when the estimate starts. No delivery date is guaranteed in this draft.')),
      section('charges', 'Delivery charges', business.shipping.charges),
      section('partners', 'Delivery partners', review(business.shipping.partners, 'Confirm delivery partners or state explicitly if none are contracted.')),
      section('tracking', 'Tracking & updates', 'My orders shows recorded order status. It is not a courier-tracking integration.', review(business.shipping.tracking, 'Confirm whether tracking is offered and how customers receive it. No automated email/SMS delivery update service has been verified.')),
      section('delays', 'Delays', review(business.shipping.delays, 'Confirm the customer notification and support procedure for delivery delays.')),
      section('failed-delivery', 'Failed deliveries', review(business.shipping.failedDelivery, 'Confirm address corrections, unreachable recipients, repeat attempts, collection and any redelivery or return charges.')),
      section('support', 'Delivery questions', contact),
    ],
  },
  about: {
    title: 'About SEKKIN.LK', category: 'Our brand',
    description: 'Discover sekkinLK, a Sri Lankan cosmetics, skincare and beauty shopping website.',
    intro: 'Beauty for your everyday. A place to explore cosmetics and skincare and choose what belongs in your routine.',
    sections: [
      section('brand', 'A place for your daily favourites', `${business.businessName} operates the ${business.brand} shopping website, focused on cosmetics, skincare and beauty products for customers in Sri Lanka. No business history, certification or partnership is claimed here.`),
      section('shopping', 'Explore with the details in view', 'Browse product information, ingredients where provided, current prices and recorded availability. Save items to your cart, review the order summary and view your orders through your account.'),
      section('care', 'Clear information, thoughtful care', 'The Contact, Shipping, Returns, Privacy and Terms pages bring customer information together. They remain drafts while the owner confirms the business details and policies.'),
      section('business', 'Business information', review(business.registeredName, 'Confirm the registered business identity, address and support email before merchant review.')),
    ],
  },
  contact: {
    title: 'Contact us', category: 'Here to help',
    description: 'Contact details and customer support information for sekkinLK.',
    intro: 'Questions about a product, delivery or an order? Find the business details below. Unconfirmed contacts are marked for review.',
    sections: [
      section('orders', 'Help with an order', 'When the support channels are confirmed, include your order number and a short description of the issue. Do not send your password, full card number, expiry date or security code.'),
      section('policies', 'Find your information', 'You can read the shipping, return, privacy and website terms from the links on this page. No contact form is shown because no submission service is configured.'),
    ],
  },
};

export const publicBusinessLinks = [
  { label: 'Contact us', to: '/contact' }, { label: 'Shipping & delivery', to: '/shipping-policy' },
  { label: 'Refund & return policy', to: '/refund-policy' }, { label: 'About us', to: '/about' },
  { label: 'Privacy policy', to: '/privacy-policy' }, { label: 'Terms & conditions', to: '/terms-and-conditions' },
];

export const isBusinessReady = getReadinessIssues(business).length === 0 && getDraftContentIssues(businessPages).length === 0;
