export function readCheckoutDetails() {
  let customer = {};
  try {
    customer = JSON.parse(localStorage.getItem('user') || 'null') || {};
  } catch {
    // Checkout remains usable when saved profile data is unavailable.
  }
  const text = value => typeof value === 'string' ? value : '';
  return {
    name: text(customer.name),
    phoneNumber: text(customer.phone),
    email: text(customer.email),
    address: text(customer.address),
    city: text(customer.city),
    postalCode: text(customer.postalCode),
  };
}

export function deliveryAddress(details) {
  return [details.address.trim(), details.city.trim()].filter(Boolean).join(', ');
}

export function validateCheckoutDetails(details) {
  if (!details.name.trim()) return 'Please enter your full name.';
  if (!details.phoneNumber.trim()) return 'Please enter your phone number for delivery updates.';
  if (!details.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) return 'Please enter a valid email address.';
  if (!details.address.trim()) return 'Please enter your delivery address.';
  if (!details.city.trim()) return 'Please enter your city.';
  if (deliveryAddress(details).length > 2000) return 'Please shorten your delivery address to 2,000 characters including the city.';
  return '';
}
