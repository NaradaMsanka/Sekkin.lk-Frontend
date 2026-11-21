import { supportPhoneHref } from './businessContacts.js';

// Official terms supplied by the website owner. No effective date was supplied.
export const termsAndConditions = {
  title: 'Terms and Conditions',
  category: 'Shopping with us',
  approved: true,
  canonicalUrl: 'https://www.sekkin.lk/terms-and-conditions',
  description: 'Terms and Conditions for using Sekkin.lk and purchasing products from our website.',
  intro: 'Welcome to Sekkin.lk. These Terms and Conditions govern your use of our website and the purchase and sale of products from our platform. By accessing and using our website, you agree to comply with these terms. Please read them carefully before proceeding with any transactions.',
  contact: { phone: '078 8153473', phoneHref: supportPhoneHref, email: 'lksekkin@gmail.com' },
  sections: [
    {
      id: 'use-of-the-website',
      title: 'Use of the Website',
      numbering: 'lower-alpha',
      body: [
        'You must be at least 16 years old to use our website or make purchases.',
        'You are responsible for maintaining the confidentiality of your account information, including your username and password.',
        'You agree to provide accurate and current information during the registration and checkout process.',
        'You may not use our website for any unlawful or unauthorized purposes.',
      ],
    },
    {
      id: 'product-information-and-pricing',
      title: 'Product Information and Pricing',
      numbering: 'lower-alpha',
      body: [
        'We strive to provide accurate product descriptions, images, and pricing information. However, we do not guarantee the accuracy or completeness of such information.',
        'Prices are subject to change without notice. Any promotions or discounts are valid for a limited time and may be subject to additional terms and conditions.',
      ],
    },
    {
      id: 'product-authenticity',
      title: 'Product Authenticity',
      body: [
        'Sekkin lk sells only 100% original and genuine products sourced from trusted suppliers and distributors. Please note that packaging, labels, ingredients, or product appearance may occasionally vary depending on the country of manufacture or brand updates. Where applicable, all products comply with Sri Lanka’s National Medicines Regulatory Authority (NMRA) guidelines and local regulations.',
      ],
    },
    {
      id: 'orders-and-payments',
      title: 'Orders and Payments',
      numbering: 'lower-alpha',
      body: [
        'By placing an order on our website, you are making an offer to purchase the selected products.',
        'We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraudulent activity.',
        'You agree to provide valid and up-to-date payment information and authorize us to charge the total order amount, including applicable taxes and shipping fees, to your chosen payment method.',
        'We use trusted third-party payment processors to handle your payment information securely. We do not store or have access to your full payment details.',
      ],
    },
    {
      id: 'shipping-and-delivery',
      title: 'Shipping and Delivery',
      numbering: 'lower-alpha',
      body: [
        'We will make reasonable efforts to ensure timely shipping and delivery of your orders.',
        'Shipping and delivery times provided are estimates and may vary based on your location and other factors.',
      ],
    },
    {
      id: 'returns-and-refunds',
      title: 'Returns and Refunds',
      numbering: 'lower-alpha',
      relatedLink: { text: 'Returns and Refund Policy', to: '/refund-policy' },
      body: [
        'Our Returns and Refund Policy governs the process and conditions for returning products and seeking refunds. Please refer to the policy provided on our website for more information.',
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      numbering: 'lower-alpha',
      body: [
        'All content and materials on our website, including but not limited to text, images, logos, and graphics, are protected by intellectual property rights and are the property of Sekkin.lk or its licensors.',
        'You may not use, reproduce, distribute, or modify any content from our website without our prior written consent.',
      ],
    },
    {
      id: 'limitation-of-liability',
      title: 'Limitation of Liability',
      numbering: 'lower-alpha',
      body: [
        'In no event shall Sekkin.lk, its directors, employees, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or the purchase and use of our products.',
        'We make no warranties or representations, express or implied, regarding the quality, accuracy, or suitability of the products offered on our website.',
      ],
    },
    {
      id: 'amendments-and-termination',
      title: 'Amendments and Termination',
      body: [
        'We reserve the right to modify, update, or terminate these Terms and Conditions at any time without prior notice. It is your responsibility to review these terms periodically for any changes.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      body: [
        'If you have any questions or concerns about our terms and conditions or refund policy, please contact us',
        'lksekkin@gmail.com',
        '078 8153473',
      ],
    },
  ],
};
