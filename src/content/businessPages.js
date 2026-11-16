import business from './business.json' with { type: 'json' };
import { getReadinessIssues, getDraftContentIssues } from './readiness.js';
const review = (value, instruction) => value || `REVIEW REQUIRED — ${instruction}`;
const section = (id, title, ...body) => ({ id, title, body });
const contact = 'Use the Contact us page for the business details available for review. The support email and full postal address must be confirmed before publication.';

export const businessPages = {
  'refund-policy': {
    title: 'Refund & Return Policy', category: 'Customer care',
    description: 'Review the proposed sekkinLK return, refund, cancellation and exchange policy.',
    intro: 'Clear guidance for when something is not quite right with your order. Business-specific terms below are awaiting owner approval.',
    sections: [
      section('eligibility', 'Return eligibility & time limits', review(business.refund.eligibility, 'Confirm which purchases qualify for a return.'), review(business.refund.returnWindow, 'Set the return request period and when that period starts. No return window has been approved.')),
      section('damaged-items', 'Damaged, defective or incorrect products', review(business.refund.damagedItems, 'Confirm how customers should report damage, missing items or an incorrect product, the evidence needed, and the remedies offered.')),
      section('condition', 'Product condition, packaging & hygiene', review(business.refund.condition, 'Confirm product condition and packaging requirements.'), review(business.refund.hygieneRestrictions, 'Confirm any cosmetics/skincare hygiene restrictions and exceptions for faulty or incorrect goods. No blanket exclusion has been approved.')),
      section('request', 'How to request a return', review(business.refund.requestProcedure, 'Approve the request steps, required order information, authorisation process and return address.'), contact),
      section('return-shipping', 'Return shipping', review(business.refund.returnShipping, 'Confirm who arranges and pays return shipping for each accepted reason, including business errors.')),
      section('refunds', 'Refund procedure & timing', review(business.refund.refundMethod, 'Confirm inspection, approval/decline communication and the refund method for each payment type.'), review(business.refund.refundTimeline, 'Confirm processing periods, when they begin, and any payment-provider delays. No refund timeline has been approved.')),
      section('cancellations', 'Order cancellations', review(business.refund.cancellations, 'Confirm cancellation requests before and after dispatch, eligibility and any applicable costs.')),
      section('exchanges', 'Exchanges', review(business.refund.exchanges, 'Confirm whether exchanges are offered and, if so, the availability, process and costs.')),
      section('rights', 'Customer rights', review(business.refund.consumerRights, 'Obtain Sri Lankan legal review of applicable customer rights. Final terms must preserve rights that cannot lawfully be excluded.')),
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy', category: 'Your information',
    description: 'How the current sekkinLK application handles account, order, review and browser information.',
    intro: 'This draft describes the reviewed application and highlights the privacy decisions that still need confirmation.',
    sections: [
      section('controller', 'Who is responsible for your information', `The business name supplied by the owner is ${business.businessName}.`, review(business.privacy.controller, 'Confirm the responsible legal entity and privacy contact.'), contact),
      section('information', 'Information used by the website', 'Registration collects a name, email address and password. Login uses email and password. The backend uses password hashing and issues a login token.', 'The cart checkout collects a delivery address and optional coupon. Direct COD checkout also collects customer name, phone number, email and an optional postal code. Orders record products, quantities, prices, delivery details and order/payment status.', 'Product reviews include a rating, written comment, date and account identifier. The current review API returns the reviewer email; minimising public account information is a required privacy review item.'),
      section('purpose', 'How information is used', 'The application uses account information to sign customers in and associate their cart, orders and reviews. Delivery information supports fulfilment; order information supports order administration and customer enquiries. Operational support procedures still need approval.'),
      section('services', 'Storage, hosting & service providers', 'The project uses Supabase PostgreSQL for application records, Render for the backend, Vercel for the website, and Cloudinary for product images. Loading hosted images and pages sends connection requests to those services. Following an external social or WhatsApp link opens that service.', review(business.privacy.processingLocations, 'Confirm service operators, processing locations, support access, transfers and relevant contractual arrangements. Do not assume all data stays in Sri Lanka.')),
      section('payments', 'Payment information', 'The updated direct checkout uses cash on delivery and does not ask for card numbers, expiry dates or security codes. No live PayHere integration is active. Future card payments must use an authorised payment provider. Never send card credentials to customer support.', 'REVIEW REQUIRED — confirm the payment-data policy and review historical records and logs from the earlier simulated payment flow. No card fields were found in the Order database entity; this is not a claim that sensitive information was never collected in the past.'),
      section('browser', 'Cookies & browser storage', 'The reviewed application stores the login token in localStorage. Direct checkout may read an optional saved user profile from localStorage to prefill delivery fields. Signing out removes the login token; browser storage can also be cleared using browser settings.', 'No application analytics or marketing-cookie integration was identified in the reviewed source. Hosting/provider logging and any additional tracking must be checked before this policy is approved.'),
      section('retention', 'Retention', review(business.privacy.retention, 'Define retention periods and deletion/backup treatment for accounts, orders, reviews, support correspondence and logs. No automatic deletion schedule has been verified.')),
      section('rights', 'Privacy enquiries & requests', review(business.privacy.rightsProcedure, 'Confirm applicable access, correction, deletion and other rights, identity checks, contact channel and response process. No self-service account deletion feature was found.')),
      section('updates', 'Policy updates', 'This is a draft, not an effective published privacy policy.', review(business.terms.updates, 'Approve an effective date, version process and how material policy changes will be communicated.')),
    ],
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions', category: 'Shopping with us',
    description: 'Proposed website, account, product, ordering and support terms for sekkinLK.',
    intro: 'Please review these draft terms together with the returns, privacy and shipping pages. Unconfirmed terms are marked below.',
    sections: [
      section('identity', 'Business & website', `${business.brand} is the website brand for ${business.businessName}, focused on cosmetics, skincare and beauty products.`, review(business.registeredName, 'Confirm the registered/legal business name and how it relates to the trading name.'), contact),
      section('accounts', 'Website use & customer accounts', 'Use the website for lawful shopping and provide accurate account and delivery information. Keep login credentials private. Contact the business if you believe your account has been accessed without permission. Accounts associate shopping carts, orders and product reviews.'),
      section('products', 'Product information & availability', 'Listings display product details, prices and recorded stock. Ingredients, brand or skin-type information appear where supplied. Check the listing before ordering. The business must verify product authenticity, descriptions, variations and inventory; no certification or medical benefit is promised by this draft.'),
      section('prices', 'Prices & charges', 'Prices are displayed in Sri Lankan rupees (LKR). Cart and checkout display item totals; coupon estimates are confirmed when an order is created.', review(business.terms.pricesAndTaxes, 'Approve how taxes, price changes, errors and other applicable charges are handled.')),
      section('orders', 'Orders & confirmation', 'Submitting checkout creates an order record when the backend accepts it. An order confirmation is not evidence of verified online payment.', review(business.terms.orderAcceptance, 'Confirm when an order is legally accepted, how stock/price errors are handled and how customers are notified.')),
      section('payments', 'Payment methods', 'Cash on delivery is the retained order flow. CARD and KOKO are unavailable in this checkout. PayHere is not connected and the website is not PayHere-approved.', review(business.terms.paymentMethods, 'Approve supported payment methods and payment/fulfilment procedures. Order confirmation is not proof of payment.')),
      section('delivery', 'Shipping & delivery', 'Read the Shipping & Delivery Policy for the delivery decisions awaiting confirmation. Do not treat unconfirmed time estimates or earlier hard-coded charges as an approved business promise.'),
      section('returns', 'Cancellations, returns & refunds', 'Read the Refund & Return Policy for the proposed procedure and outstanding conditions. No return period, refund period or hygiene exclusion is approved by this draft.'),
      section('ownership', 'Intellectual property', review(business.terms.intellectualProperty, 'Confirm rights to the brand, logo, website assets, product photographs and supplier descriptions, and approve lawful usage terms.')),
      section('liability', 'Liability & customer rights', review(business.terms.liability, 'Obtain legal review of reasonable liability terms and applicable mandatory consumer protections. No blanket waiver or exclusion is approved.')),
      section('complaints', 'Support & complaints', review(business.terms.complaints, 'Confirm complaint contact, acknowledgement, escalation and resolution procedures.'), contact),
      section('law', 'Governing law', review(business.terms.governingLaw, 'Confirm the applicable Sri Lankan governing-law and dispute provisions with qualified legal advice.')),
      section('changes', 'Updates', review(business.terms.updates, 'Approve the effective date, version process and customer notices for policy changes.')),
    ],
  },
  'shipping-policy': {
    title: 'Shipping & Delivery', category: 'Customer care',
    description: 'Delivery coverage, charges, processing, tracking and support decisions for sekkinLK.',
    intro: 'Know what to expect before ordering. The owner must confirm the delivery information below before this becomes a final policy.',
    sections: [
      section('coverage', 'Delivery coverage', review(business.shipping.coverage, 'Confirm delivery areas within Sri Lanka and any excluded or remote locations. The earlier islandwide claim is unverified.')),
      section('processing', 'Order processing', review(business.shipping.processing, 'Confirm processing times, working days, cut-off times and stock-related delays.')),
      section('timelines', 'Estimated delivery periods', review(business.shipping.deliveryEstimate, 'Confirm realistic delivery estimates by area and when the estimate starts. No delivery date is guaranteed in this draft.')),
      section('charges', 'Delivery charges', 'The cart checkout and retained COD flow currently display zero delivery charges. The owner must confirm these values as an approved business policy.', review(business.shipping.charges, 'Approve delivery charges, applicable conditions and how charges are shown before order confirmation.')),
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
