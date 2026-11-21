import { supportPhoneHref } from './businessContacts.js';

// Owner-supplied policy. Formatting is structured for the page; no dates are inferred.
export const refundPolicy = {
  title: 'Refund Policy',
  category: 'Returns & customer care',
  approved: true,
  canonicalUrl: 'https://www.sekkin.lk/refund-policy',
  description: 'Read the Sekkin lk return, refund, exchange, and return shipping policy.',
  intro: 'Thank you for shopping at Sekkin lk. We providing high-quality cosmetics products and ensuring customer satisfaction. We understand that situations may arise where you may need to request a refund. To be eligible for a refund, please note the following:',
  contact: { phone: '078 8153473', phoneHref: supportPhoneHref, email: 'lksekkin@gmail.com' },
  sections: [
    {
      id: 'returns',
      title: 'Returns',
      body: [
        'We accept returns within 3 days from the date of purchase. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.',
      ],
    },
    {
      id: 'refunds',
      title: 'Refunds',
      body: [
        'Once we receive your return and inspect the item, we will notify you of the status of your refund. If your return is approved, we will initiate a refund to your original method of payment. Please note that the refund amount will exclude any shipping charges incurred during the initial purchase.',
      ],
    },
    {
      id: 'return-and-refund-process',
      title: 'Return and Refund Process',
      body: ['If you wish to request a refund or exchange, please follow these steps:'],
      steps: [
        {
          text: 'Contact our customer support team within 3 days of receiving your product. You can contact us via lksekkin@gmail.com or 078 8153473.',
        },
        {
          text: 'When contacting us, please provide the following information:',
          details: [
            'Your order number.',
            'Details of the issue, including whether you are requesting a refund or an exchange.',
            'Any supporting documentation such as photographs of damaged products, if applicable',
          ],
        },
        {
          text: 'After reviewing your request, we will provide instructions on how to return the product. The return shipping costs may be your responsibility, except in cases of damaged or defective products',
        },
      ],
    },
    {
      id: 'exchanges',
      title: 'Exchanges',
      body: [
        'If you would like to exchange your item for a different brand or size please contact our customer support team within 3 days of receiving your order. We will provide you with further instructions on how to proceed with the exchange.',
      ],
    },
    {
      id: 'non-returnable-items',
      title: 'Non-Returnable Items',
      bulleted: true,
      body: [
        'Please be aware that some items may not be eligible for a refund or exchange, including, but not limited to, items that are:',
        'Opened or used.',
        'Not in their original condition.',
        'Items that are damaged due to misuse or mishandling by the customer.',
      ],
      after: [
        'In the unfortunate event that your item arrives damaged or defective, please contact us immediately. We will arrange for a replacement or issue a refund, depending on your preference and product availability.',
      ],
    },
    {
      id: 'return-shipping',
      title: 'Return Shipping',
      body: [
        'You will be responsible for paying the shipping costs for returning your item unless the return is due to our error (e.g., wrong item shipped, defective product, Expired product). In such cases, we will provide you with a prepaid shipping label.',
      ],
    },
    {
      id: 'processing-time',
      title: 'Processing Time',
      body: [
        'Refunds and exchanges will be processed within 3 business days after we receive your returned item. Please note that it may take additional time for the refund to appear in your account, depending on your payment provider.',
      ],
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      body: [
        'If you have any questions or concerns regarding our refund policy, please contact us. We are here to assist you and ensure your shopping experience with us is enjoyable and hassle-free.',
        'lksekkin@gmail.com',
        '078 8153473',
      ],
    },
  ],
};
