import business from './business.json' with { type: 'json' };
import { supportPhoneHref } from './businessContacts.js';

// Content supplied by the website owner in Shipping and delivery.txt.
export const shippingPolicy = {
  title: 'Shipping & Delivery',
  category: 'Customer care',
  approved: true,
  canonicalUrl: `${business.siteUrl}/shipping-policy`,
  description: 'Islandwide delivery with Koombiyoo Delivery, order processing, delivery charges, tracking and support at Sekkin.lk.',
  intro: 'At Sekkin.lk, we strive to get your skincare essentials delivered safely and promptly to your doorstep.',
  contact: { phone: business.supportPhone, phoneHref: supportPhoneHref, email: business.supportEmail },
  sections: [
    { id: 'coverage', title: 'Delivery Coverage', body: [business.shipping.coverage] },
    { id: 'processing', title: 'Order Processing', body: [business.shipping.processing] },
    { id: 'timelines', title: 'Estimated Delivery Period', body: [business.shipping.deliveryEstimate] },
    { id: 'charges', title: 'Delivery Charges', body: [business.shipping.charges] },
    { id: 'tracking', title: 'Tracking & Updates', body: [business.shipping.tracking] },
    { id: 'delays', title: 'Delays', body: [business.shipping.delays] },
    {
      id: 'failed-delivery',
      title: 'Failed Deliveries',
      body: [
        'Please ensure your delivery address and contact number are accurate at checkout and that someone is available to receive the package.',
        'If a delivery attempt fails because the recipient is unreachable or unavailable, the courier will typically attempt re-delivery on the next working day.',
        'Orders returned to us due to 3 failed delivery attempts, unanswered phone calls, incorrect addresses, or refusal to accept a confirmed Cash-on-Delivery (COD) parcel may require an additional re-delivery fee before being dispatched again.',
      ],
    },
    {
      id: 'support',
      title: 'Delivery Questions',
      relatedLink: { text: 'Contact Us', to: '/contact' },
      body: ['Have a question about your shipment or need to update your delivery details before dispatch? Reach out to our support team with your Order ID on Contact Us.'],
    },
  ],
};
