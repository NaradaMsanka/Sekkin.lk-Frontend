// Display estimates mirror the confirmed rule. OrderService calculates and stores final amounts.
export const fixedDeliveryCharge = 400;
export const deliveryPricingNotice = 'A flat delivery fee of Rs. 400 applies once per order, islandwide.';
const money = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function estimateOrderTotals(subtotal, verifiedDiscount = 0, hasItems = true) {
  const amount = money(subtotal);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Invalid merchandise subtotal');
  const discount = money(Number(verifiedDiscount));
  if (!Number.isFinite(discount) || discount < 0) throw new Error('Invalid verified discount');
  const deliveryCharge = hasItems ? fixedDeliveryCharge : 0;
  const couponDiscount = hasItems ? Math.min(amount, discount) : 0;
  return { subtotal: amount, couponDiscount, deliveryCharge, total: hasItems ? money(Math.max(0, amount - couponDiscount) + deliveryCharge) : 0 };
}

// Missing historical fees remain unknown; never substitute today's delivery charge.
export const formatDeliveryCharge = amount => amount != null && Number.isFinite(Number(amount))
  ? `Rs. ${Number(amount).toFixed(2)}` : 'Not recorded';
