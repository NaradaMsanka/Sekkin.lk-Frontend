import business from './catalogBusiness.json' with { type: 'json' };

export const orderingNotice = 'Online ordering is temporarily unavailable. Browse the collection and contact us for product information or help with an existing order.';
export const catalogLinks = [
  ['/', 'Collection'], ['/about', 'About us'], ['/contact', 'Contact us'],
  ['/privacy-policy', 'Privacy'], ['/terms-and-conditions', 'Terms'],
  ['/shipping-policy', 'Delivery'], ['/refund-policy', 'Returns & exchanges'],
];
const identity = `${business.soleProprietorLegalName}, sole proprietor carrying on business as ${business.registeredName} (registration ${business.registrationNumber}), operates SEKKIN.LK.`;
const contact = `Email ${business.supportEmail}, call or WhatsApp ${business.supportPhone}, or write to ${business.postalAddress}. Business availability is 24 hours; an immediate staffed response is not guaranteed.`;

export const catalogPages = {
  about: {
    title: 'About SEKKIN.LK',
    intro: 'Beauty for your everyday. Explore cosmetics, skincare and beauty products in our public collection.',
    sections: [
      ['Our business', identity],
      ['The collection', 'This release is a public catalog. Prices and descriptions come from the owner-approved catalog snapshot. Some images are temporary illustrations; contact support if an item’s identity is unclear. Online ordering and customer accounts are temporarily unavailable.'],
      ['Here to help', contact],
    ],
  },
  contact: {
    title: 'Contact us', intro: 'Questions about a product or an existing order? Contact us using the details below.',
    sections: [['Business information', identity, contact], ['Your information', 'Please share only what is needed for your enquiry. Do not send passwords, login tokens or card details. This catalog has no enquiry form, account registration or online checkout. Email, telephone and WhatsApp open their respective services.']],
  },
  'privacy-policy': {
    title: 'Catalog Privacy Notice', intro: 'How this public catalog and the business contact channels handle information.',
    sections: [
      ['Who is responsible', identity, `The privacy contact is ${business.supportEmail}.`],
      ['Browsing this catalog', 'The catalog is served as static pages and local images/fonts by Vercel. It does not call the shopping backend, create accounts, collect order/payment details, or use application analytics, marketing cookies or browser storage. Search and display filters stay in page memory and are not submitted to a service.'],
      ['Hosting and connection information', 'Vercel receives connection information needed to deliver and protect the website, which can include IP address, request time and browser/request metadata. Its infrastructure and service processing may be international. This notice does not promise storage in a particular country or a specific account-level log-retention period. Provider processing is subject to the applicable service settings and Vercel’s privacy information.'],
      ['Contacting the business', 'If you choose email, telephone or WhatsApp, the business and those service providers receive the information you send. It is used to respond to your enquiry or handle an existing order. Send only necessary information. This catalog does not automatically export those messages into an account or order database.'],
      ['Retention and requests', 'The business keeps necessary correspondence and existing transaction records for the relevant enquiry, operational needs and applicable obligations. Proposed 12-month support and 30-day log/backup periods remain under implementation review; they are not promised automatic deletion controls. Verified access, correction or deletion requests are reviewed manually through support, with proportionate identity checks and a response aim of 30 calendar days, subject to applicable obligations. No self-service deletion or compliance certification is claimed.'],
      ['Publication and changes', 'This notice applies to the public catalog release. The intended effective date is its actual public launch; actual publication details are recorded when publication is verified. A future shopping/account release requires its own accurate disclosures and completed safety checks.'],
    ],
  },
  'terms-and-conditions': {
    title: 'Catalog Terms', intro: 'Terms for browsing the SEKKIN.LK public catalog.',
    sections: [
      ['Business', identity, contact],
      ['Catalog mode', 'Online ordering, checkout, registration, sign-in and payment collection are temporarily unavailable. Viewing a product does not place or accept an order. The catalog uses a published snapshot; prices and recorded availability are not live quotations or stock reservations. Prices are LKR and include applicable taxes; the business is not VAT registered.'],
      ['Product information and imagery', 'The owner approves the current catalog and temporary illustrative images. An illustration may not show the item supplied. Contact support if a product is unclear. Existing image and supplier-description permissions are owner-confirmed; new assets require appropriate permission. No medical benefit or certification is promised.'],
      ['Existing orders and customer rights', 'The approved delivery, cancellation, return and exchange information remains available for existing-order support. Catalog mode does not remove applicable remedies or require a customer to use online checkout for support.', business.refund.consumerRights],
      ['Liability and governing law', business.terms.liability, business.terms.governingLaw],
      ['Updates', business.terms.updates],
    ],
  },
  'shipping-policy': {
    title: 'Shipping & Delivery', intro: 'Approved delivery information for existing-order support. New online ordering is temporarily unavailable.',
    sections: [
      ['Coverage and timing', business.shipping.coverage, business.shipping.processing, business.shipping.deliveryEstimate],
      ['Charges and courier', business.shipping.charges, business.shipping.partners],
      ['Delivery attempts and returns', business.shipping.failedDelivery],
      ['Tracking and support', business.shipping.tracking, business.shipping.delays, contact],
    ],
  },
  'refund-policy': {
    title: 'Refunds, Returns & Exchanges', intro: 'Approved customer-care information. Contact support about an existing order while online ordering is unavailable.',
    sections: [
      ['Eligibility', business.refund.eligibility, business.refund.returnWindow, business.refund.condition, business.refund.hygieneRestrictions],
      ['Wrong, damaged or faulty products', business.refund.damagedItems],
      ['Requests and delivery charges', business.refund.requestProcedure, business.refund.returnShipping],
      ['Refunds', business.refund.refundMethod, business.refund.refundTimeline],
      ['Cancellations and exchanges', business.refund.cancellations, business.refund.exchanges],
      ['Customer rights', business.refund.consumerRights],
    ],
  },
};
