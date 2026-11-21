import { supportPhoneHref } from './businessContacts.js';

// Official policy supplied by the website owner. No effective date was supplied.
export const privacyPolicy = {
  title: 'Privacy Policy',
  category: 'Your information',
  approved: true,
  canonicalUrl: 'https://www.sekkin.lk/privacy-policy',
  description: 'How Sekkin lk collects, uses, and shares your personal information when you visit sekkin.lk.',
  intro: "We are committed to protecting the privacy and security of our customers' personal information. This Privacy Policy describes how Sekkin lk collects, uses, and shares your personal information when you visit our website, located at sekkin.lk. By accessing or using our website, you consent to the practices described in this Privacy Policy.",
  contact: {
    phone: '078 8153473',
    phoneHref: supportPhoneHref,
    email: 'lksekkin@gmail.com',
  },
  sections: [
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      bulleted: true,
      body: [
        'When you visit our website, we may collect certain information about you, including:',
        'Personal identification information: such as your name, email address, postal address and phone number provided voluntarily by you during the registration or checkout process.',
        'Payment and billing information: necessary to process your orders, including credit card details, which are securely handled by trusted third-party payment processors.',
        'Browsing information: such as your IP address, browser type, and device information, collected automatically using cookies and similar technologies.',
      ],
    },
    {
      id: 'use-of-information',
      title: 'Use of Information',
      bulleted: true,
      body: [
        'We use the information we collect for various purposes, including:',
        'To process and fulfill your orders, including shipping and delivery.',
        'To communicate with you regarding your purchases, provide customer support, and respond to inquiries or requests.',
        'To personalize your shopping experience and present relevant product recommendations and promotions.',
        'To improve our website, products, and services based on your feedback and browsing patterns.',
        'To detect and prevent fraud, unauthorized activities, and abuse of our website.',
        'To monitor the usage of our website.',
        'To send you promotional and marketing materials.',
      ],
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      bulleted: true,
      body: [
        'We respect your privacy and do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:',
        'Trusted service providers: We may share your information with third-party service providers who assist us in operating our website, processing payments, and delivering products. These providers are contractually obligated to handle your data securely and confidentially.',
        'Legal requirements: We may disclose your information if required to do so by law or in response to valid legal requests or orders.',
      ],
    },
    {
      id: 'data-security',
      title: 'Data Security',
      subtitle: 'Security',
      body: [
        'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      id: 'cookies-and-tracking-technologies',
      title: 'Cookies and Tracking Technologies',
      body: [
        'We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and gather information about your preferences and interactions with our website. You have the option to disable cookies through your browser settings, but this may limit certain features and functionality of our website.',
      ],
    },
    {
      id: 'your-choices',
      title: 'Your Choices',
      body: [
        'You have the right to access, correct, or delete your personal information. If you have any questions about your personal information or if you would like to correction or deletion of your data, please contact us at (078 8153473 / lksekkin@gmail.com)',
      ],
    },
    {
      id: 'changes-to-the-privacy-policy',
      title: 'Changes to the Privacy Policy',
      body: [
        'We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with the updated Privacy Policy’s revision date.',
      ],
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      body: [
        'If you have any questions, concerns, or requests regarding our Privacy Policy or the handling of your personal information, please contact us',
        '078 8153473',
        'lksekkin@gmail.com',
      ],
    },
  ],
};
