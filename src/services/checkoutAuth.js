// Browser checks guide the customer. The API validates the session and account.
export function getSessionToken(storage = localStorage) {
  const token = storage.getItem('token')?.trim().replace(/^"|"$/g, '');
  return token && !['undefined', 'null'].includes(token) ? token : null;
}

export function readCheckoutIntent(value) {
  const productId = Number(value?.productId);
  const quantity = Number(value?.quantity);
  return Number.isSafeInteger(productId) && productId > 0 && Number.isSafeInteger(quantity) && quantity > 0
    ? { productId, quantity } : null;
}

export function checkoutLoginState(product, quantity = 1) {
  const checkout = readCheckoutIntent({ productId: product.id, quantity });
  return { from: checkout ? `/product/${checkout.productId}` : '/', checkout, loginRequired: true };
}

// Only store routes may be used after authentication; never accept an external redirect.
export function getLoginReturn(state) {
  const from = typeof state?.from === 'string' && /^\/(?:checkout|product\/[1-9]\d*)$/.test(state.from) ? state.from : '/';
  const checkout = readCheckoutIntent(state?.checkout);
  return { to: from, state: checkout && from === `/product/${checkout.productId}` ? { checkout } : null };
}
