// Display estimates mirror the confirmed rule. OrderService calculates and stores final amounts.
export const fixedDeliveryCharge = 350;
export const deliveryPricingNotice = 'A fixed delivery charge of LKR 350 applies once per order, islandwide.';
const money = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function estimateOrderTotals(subtotal, couponCode = '', hasItems = true) {
  const amount = money(subtotal);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Invalid merchandise subtotal');
  const code = couponCode.trim().toUpperCase();
  const discount = ['GLOW10', 'WELCOME10'].includes(code) ? money(amount * .1)
    : code === 'SAVE500' && amount >= 2500 ? 500 : 0;
  const deliveryCharge = hasItems ? fixedDeliveryCharge : 0;
  const couponDiscount = hasItems ? Math.min(amount, discount) : 0;
  return { subtotal: amount, couponDiscount, deliveryCharge, total: hasItems ? money(Math.max(0, amount - couponDiscount) + deliveryCharge) : 0 };
}

// Missing historical fees remain unknown; never substitute today's delivery charge.
export const formatDeliveryCharge = amount => amount != null && Number.isFinite(Number(amount))
  ? `Rs. ${Number(amount).toFixed(2)}` : 'Not recorded';
