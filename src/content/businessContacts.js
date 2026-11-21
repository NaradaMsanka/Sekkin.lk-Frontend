import business from './business.json' with { type: 'json' };

// Confirmed public contact facts can be used while the separate, complete
// business-identity sign-off remains pending. This does not approve policies.
export const isContactFieldConfirmed = field => business.contactsConfirmed === true || business.confirmedContactFields?.includes(field) === true;
const internationalNumber = value => {
  const digits = (value || '').replace(/\D/g, '');
  return digits.length === 10 && digits.startsWith('0') ? `94${digits.slice(1)}` : digits;
};

export const supportEmailHref = isContactFieldConfirmed('supportEmail') && business.supportEmail ? `mailto:${business.supportEmail}` : null;
export const supportPhoneHref = isContactFieldConfirmed('supportPhone') && business.supportPhone ? `https://wa.me/${internationalNumber(business.supportPhone)}` : null;
export const supportWhatsAppHref = isContactFieldConfirmed('whatsappNumber') && business.whatsappNumber ? `https://wa.me/${internationalNumber(business.whatsappNumber)}` : null;
export const supportWhatsAppLabel = 'Connect via WhatsApp';

export function whatsappProductHref(productName) {
  return supportWhatsAppHref ? `${supportWhatsAppHref}?text=${encodeURIComponent(`Hello ${business.brand}, I have a question about ${productName}`)}` : '/contact';
}
