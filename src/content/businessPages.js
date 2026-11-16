import business from './business.json' with { type: 'json' };
import { getReadinessIssues, getDraftContentIssues } from './readiness.js';
const review = (value, instruction) => value || `REVIEW REQUIRED — ${instruction}`;
const section = (id, title, ...body) => ({ id, title, body });
const contact = `Contact ${business.businessName} at ${business.supportEmail}, call or WhatsApp ${business.supportPhone}, or write to ${business.postalAddress}. Business availability is ${business.businessHours}; no immediate or round-the-clock staffed support response is guaranteed. Returns must be authorized before products are sent to the approved return destination, ${business.postalAddress}; follow the return instructions supplied by support.`;
const registeredBusiness = `${business.registeredName} is a ${business.registrationStatus.toLowerCase()} ${business.businessType.toLowerCase()} (business registration ${business.registrationNumber}), operating the ${business.brand} brand and using the trading name ${business.tradingName}.`;
const proprietor = business.soleProprietorLegalName
  ? `The legal seller and responsible sole proprietor is ${business.soleProprietorLegalName}, carrying on business as ${business.registeredName}.`
  : 'REVIEW REQUIRED — insert the sole proprietor’s verified legal personal name to identify the seller/controller; a registered business name does not identify a separate limited company or partnership.';

export const businessPages = {
  'refund-policy': {
    title: 'Refund & Return Policy', category: 'Customer care',
    description: 'Seven-day return and exchange requests, product conditions and return delivery responsibilities for Sekkin.lk.',
    intro: 'Request a return or exchange within seven days of receiving your order. Read the ordinary return conditions and the separate guidance for wrong, damaged or faulty goods below.',
    sections: [
      section('eligibility', 'Return eligibility & time limits', review(business.refund.eligibility, 'Confirm which purchases qualify for a return.'), review(business.refund.returnWindow, 'Set the return request period and when that period starts.')),
      section('damaged-items', 'Damaged, defective or incorrect products', review(business.refund.damagedItems, 'Confirm how customers should report damage, missing items or an incorrect product, the evidence needed, and the remedies offered.')),
      section('condition', 'Product condition, packaging & hygiene', review(business.refund.condition, 'Confirm product condition and packaging requirements.'), review(business.refund.hygieneRestrictions, 'Confirm cosmetics/skincare hygiene restrictions and exceptions for faulty or incorrect goods.')),
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
    description: 'How the current Sekkin.lk application handles account, order, review and browser information.',
    intro: 'This privacy policy remains a draft while actual hosting, processing-location, retention and historical-payment disclosures are verified. The owner has approved the prepared policy wording.',
    sections: [
      section('controller', 'Who is responsible for your information', registeredBusiness, review(business.privacy.controller, 'Identify the responsible sole proprietor accurately.'), contact),
      section('information', 'Information used by the website', 'Registration collects a name, email address and password. Login uses email and password. The backend uses password hashing and issues a login token.', 'The cart checkout collects a delivery address, reachable delivery phone and optional coupon. Direct COD checkout also collects customer name, phone number, email and an optional postal code. Orders record products, quantities, prices, delivery details and order/payment status. Authorized collection records include the administrator, time and courier-evidence reference needed for COD reconciliation; do not submit card credentials.', 'Product reviews display a rating, written comment and date. The reviewed local API omits reviewer account emails and the storefront labels authors as Customer. Production deployment and historical exposure still require verification.', 'Saved wishlist records link your account to selected products and the time they were saved. The reviewed backend also keeps short-lived request counters in memory, keyed by hashes of the request address and, for login controls, the submitted login identity. These counters support abuse prevention; actual hosted proxy and logging behavior still require verification.'),
      section('purpose', 'How information is used', 'The application uses account information to sign customers in and associate their cart, saved wishlist choices, orders and reviews. Delivery information supports fulfilment; order information supports order administration and customer enquiries. Short-lived security request counters help limit abusive login, registration and order submissions. For an approved COD refund, support arranges the necessary bank-transfer details directly with the customer. Never send card numbers, expiry dates or security codes to support.'),
      section('services', 'Storage, hosting & service providers', 'The project uses Supabase PostgreSQL for application records, Render for the backend, Vercel for the website, and Cloudinary for product images. Loading hosted images and pages sends connection requests to those services. Following an external social or WhatsApp link opens that service.', review(business.privacy.processingLocations, 'Confirm service operators, processing locations, support access, transfers and relevant contractual arrangements. Do not assume all data stays in Sri Lanka.')),
      section('payments', 'Payment information', 'The updated direct checkout uses cash on delivery and does not ask for card numbers, expiry dates or security codes. No live PayHere integration is active. Future card payments must use an authorised payment provider. Never send card credentials to customer support.', 'REVIEW REQUIRED — confirm the payment-data policy and review historical records and logs from the earlier simulated payment flow. No card fields were found in the Order database entity; this is not a claim that sensitive information was never collected in the past.'),
      section('browser', 'Cookies & browser storage', 'The reviewed application stores the login token in localStorage. Direct checkout may read an optional saved user profile from localStorage to prefill delivery fields. Signing out removes the local login token; the separate Log out on all devices action also asks the server to invalidate the account’s current sessions. Browser storage can be cleared using browser settings.', 'Checkout uses this tab’s sessionStorage to remember a random retry key, a fingerprint of the order request and whether its receipt was received. This helps retrieve the same request after an uncertain response. The retry helper does not store raw contact details, addresses, passwords, login tokens or receipts in sessionStorage. Clearing this state can remove retry protection; check My orders or contact support if an order result is unclear.', 'No application analytics or marketing-cookie integration was identified in the reviewed source. Hosting/provider logging and any additional tracking must be checked before this policy is approved.'),
      section('retention', 'Retention', review(business.privacy.retention, 'Define retention periods and deletion/backup treatment for accounts, orders, reviews, support correspondence and logs. No automatic deletion schedule has been verified.')),
      section('rights', 'Privacy enquiries & requests', review(business.privacy.rightsProcedure, 'Confirm applicable access, correction, deletion and other rights, identity checks, contact channel and response process. No self-service account deletion feature was found.'), 'The 30-calendar-day response aim is the approved business process, not a claim that every provision of Sri Lanka’s Personal Data Protection Act is already in force or that the website is certified compliant. Requests are considered under the applicable law and obligations at the time.'),
      section('updates', 'Policy updates', 'The prepared update wording has owner approval. This privacy policy remains a draft until outstanding factual verifications are complete; actual dates are recorded when published.', review(business.terms.updates, 'Approve an effective date, version process and how material policy changes will be communicated.')),
    ],
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions', category: 'Shopping with us',
    description: 'Proposed website, account, product, ordering and support terms for Sekkin.lk.',
    intro: 'Read these terms together with the returns, privacy and shipping pages. The prepared terms wording and temporary placeholder product imagery have owner approval; actual policy dates are recorded at public launch and publication.',
    sections: [
      section('identity', 'Business & website', registeredBusiness, proprietor, contact),
      section('accounts', 'Website use & customer accounts', 'Use the website for lawful shopping and provide accurate account and delivery information. Keep login credentials private. Contact the business if you believe your account has been accessed without permission. Accounts associate shopping carts, orders and product reviews.'),
      section('products', 'Product information & availability', 'Listings display recorded product details, prices and stock. Ingredients, brand or skin-type information appear where supplied. Some current images are temporary illustrative placeholders and may not depict the item supplied; contact support before ordering if the product identity or image is unclear. The owner has approved this temporary presentation and plans to replace it with original product imagery after launch. Current commercial product, price, stock and fulfilment information is owner-confirmed against the reviewed catalog snapshot. No medical benefit or certification is promised.'),
      section('prices', 'Prices & charges', 'Prices are displayed in Sri Lankan rupees (LKR). Cart and checkout display item totals; coupon estimates are confirmed when an order is created.', review(business.terms.pricesAndTaxes, 'Approve how taxes, price changes, errors and other applicable charges are handled.')),
      section('orders', 'Orders & confirmation', 'Submitting checkout creates an order request and a backend order record. The request is accepted only after the business checks availability and details and communicates acceptance. An acknowledgement or order confirmation is not evidence of payment.', review(business.terms.orderAcceptance, 'Confirm when an order is legally accepted, how stock/price errors are handled and how customers are notified.')),
      section('payments', 'Payment methods', 'Cash on Delivery is supported. Online card and KOKO payments are unavailable. PayHere application and merchant approval are pending.', review(business.terms.paymentMethods, 'Approve payment collection and fulfilment procedures. Order confirmation is not proof of payment.')),
      section('delivery', 'Shipping & delivery', 'Delivery is islandwide in Sri Lanka through Koombiyo Delivery Company, with an estimated two to three business days after order confirmation. Orders are normally dispatched within one business day after confirmation, subject to stock. Business days exclude Saturdays, Sundays and Sri Lankan public holidays. A fixed LKR 350 delivery charge applies to every normal order and is displayed before confirmation. The courier arrangement has three delivery attempts and no fee for an unsuccessful attempt itself. A separate LKR 500 returned-parcel charge can apply for customer-responsibility returns, with wrong/damaged/faulty exceptions and no duplicate charge for the same parcel. Read the Shipping & Delivery and Refund & Return policies for the exact conditions.'),
      section('returns', 'Cancellations, returns & refunds', 'Return and exchange requests can be made within seven days of receiving an order. Ordinary change-of-mind returns/exchanges require unused, unopened products in original sealed packaging; those restrictions do not exclude remedies for wrong, damaged or faulty goods. Customers can request cancellation before dispatch; cancellation is confirmed when Sekkin.lk sends confirmation. Read the Refund & Return Policy for authorization, inspection, bank-transfer refunds, exchanges and shipping responsibilities.'),
      section('ownership', 'Intellectual property', review(business.terms.intellectualProperty, 'Confirm rights to the brand, logo, website assets, product photographs and supplier descriptions, and approve lawful usage terms.')),
      section('liability', 'Liability & customer rights', review(business.terms.liability, 'Obtain legal review of reasonable liability terms and applicable mandatory consumer protections. No blanket waiver or exclusion is approved.')),
      section('complaints', 'Support & complaints', review(business.terms.complaints, 'Confirm complaint contact, acknowledgement, escalation and resolution procedures.'), contact),
      section('law', 'Governing law', review(business.terms.governingLaw, 'Confirm the applicable Sri Lankan governing-law and dispute provisions with qualified legal advice.')),
      section('changes', 'Updates', review(business.terms.updates, 'Approve the effective date, version process and customer notices for policy changes.')),
    ],
  },
  'shipping-policy': {
    title: 'Shipping & Delivery', category: 'Customer care',
    description: 'Islandwide Sri Lankan delivery, a two-to-three-business-day estimate, Koombiyo Delivery Company and a fixed LKR 350 normal delivery charge per order.',
    intro: 'Islandwide delivery across Sri Lanka with Koombiyo Delivery. Delivery is estimated within two to three business days after order confirmation; a fixed LKR 350 delivery charge applies to every order. Orders are normally dispatched within one business day after confirmation, subject to stock. Business days exclude Saturdays, Sundays and Sri Lankan public holidays. Delivery dates are estimates.',
    sections: [
      section('coverage', 'Delivery coverage', review(business.shipping.coverage, 'Confirm delivery areas within Sri Lanka.')),
      section('processing', 'Order processing', review(business.shipping.processing, 'Confirm processing times, working days, cut-off times and stock-related delays.')),
      section('timelines', 'Estimated delivery periods', review(business.shipping.deliveryEstimate, 'Confirm realistic delivery estimates by area and when the estimate starts. No delivery date is guaranteed in this draft.')),
      section('charges', 'Delivery charges', review(business.shipping.charges, 'Approve delivery charges, applicable conditions and how charges are shown before order confirmation.')),
      section('partners', 'Delivery partners', review(business.shipping.partners, 'Confirm delivery partners or state explicitly if none are contracted.')),
      section('tracking', 'Tracking & updates', 'My orders shows recorded order status. It is not a courier-tracking integration.', review(business.shipping.tracking, 'Confirm whether tracking is offered and how customers receive it. No automated email/SMS delivery update service has been verified.')),
      section('delays', 'Delays', review(business.shipping.delays, 'Confirm the customer notification and support procedure for delivery delays.')),
      section('failed-delivery', 'Failed deliveries', review(business.shipping.failedDelivery, 'Confirm address corrections, unreachable recipients, repeat attempts, collection and any redelivery or return charges.')),
      section('support', 'Delivery questions', contact),
    ],
  },
  about: {
    title: 'About SEKKIN.LK', category: 'Our brand',
    description: 'Discover SEKKIN.LK, the cosmetics, skincare and beauty brand operated under registered sole-proprietor business SEKKIN LK.',
    intro: 'Beauty for your everyday. A place to explore cosmetics and skincare and choose what belongs in your routine.',
    sections: [
      section('brand', 'A place for your daily favourites', registeredBusiness, 'The business is an online retailer of cosmetics, skincare and beauty products for customers in Sri Lanka. It is a sole proprietorship, not a partnership or limited company.'),
      section('shopping', 'Explore with the details in view', 'Browse product information, ingredients where provided, current prices and recorded availability. Save items to your cart, review the order summary and view your orders through your account.'),
      section('care', 'Clear information, thoughtful care', 'The Contact, Shipping, Returns, Privacy and Terms pages bring customer information together. Prepared policy wording and the temporary catalog presentation have owner approval; policies remain drafts until outstanding hosting, retention and security verifications are complete.'),
      section('business', 'Business information', registeredBusiness, proprietor, contact),
    ],
  },
  contact: {
    title: 'Contact us', category: 'Here to help',
    description: 'Email support@sekkin.lk, call or WhatsApp 0740309918, or contact Sekkin.lk at Mahawattha, Batapola, Sri Lanka.',
    intro: 'Questions about a product, delivery or an order? Email, call or WhatsApp using the confirmed contact details below. Business availability is 24 hours; a support response time is not guaranteed.',
    sections: [
      section('orders', 'Help with an order', `Contact ${business.supportEmail} or ${business.supportPhone} with your order details and a short description of the issue. Include clear photographs when reporting wrong, damaged or faulty goods. Do not send your password, full card number, expiry date or security code.`),
      section('availability', 'Availability & business identity', registeredBusiness, 'Business availability is 24 hours. This is not a guarantee of an immediate or round-the-clock staffed support response.', proprietor),
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
