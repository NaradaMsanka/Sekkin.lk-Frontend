import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateOrderTotals, fixedDeliveryCharge, formatDeliveryCharge } from '../src/content/delivery.js';
import business from '../src/content/business.json' with { type: 'json' };
import { businessPages } from '../src/content/businessPages.js';

for (const [subtotal, expected] of [[1000, 1350], [5000, 5350], [10000, 10350]]) {
  test(`LKR ${subtotal} merchandise adds one LKR 350 charge`, () => {
    assert.deepEqual(estimateOrderTotals(subtotal), { subtotal, couponDiscount: 0, deliveryCharge: 350, total: expected });
  });
}
test('multiple products and quantities still use a single charge', () => {
  assert.equal(estimateOrderTotals(1000 * 2 + 1500 * 2).total, 5350);
  assert.equal(estimateOrderTotals(1000 * 10).deliveryCharge, 350);
});
test('existing coupons apply only to merchandise', () => {
  for (const code of ['SAVE500', 'GLOW10', 'WELCOME10', ' save500 ']) {
    assert.equal(estimateOrderTotals(5000, code).total, 4850);
    assert.equal(estimateOrderTotals(5000, code).deliveryCharge, 350);
  }
  assert.equal(estimateOrderTotals(2499, 'SAVE500').total, 2849);
  assert.equal(estimateOrderTotals(5000, 'UNKNOWN').total, 5350);
  assert.equal(estimateOrderTotals(.05, 'GLOW10').total, 350.04);
});
test('empty cart has no payable order or delivery fee', () => {
  assert.deepEqual(estimateOrderTotals(0, '', false), { subtotal: 0, couponDiscount: 0, deliveryCharge: 0, total: 0 });
});
test('invalid estimates are rejected', () => {
  for (const amount of [-1, NaN, Infinity]) assert.throws(() => estimateOrderTotals(amount));
});
test('historical fees are formatted exactly as stored without a new fee fallback', () => {
  assert.equal(formatDeliveryCharge(0), 'Rs. 0.00');
  assert.equal(formatDeliveryCharge(150), 'Rs. 150.00');
  assert.equal(formatDeliveryCharge(350), 'Rs. 350.00');
  assert.equal(formatDeliveryCharge(null), 'Not recorded');
  assert.equal(formatDeliveryCharge(undefined), 'Not recorded');
});
test('fixed charge configuration and rendered shipping wording agree', () => {
  assert.equal(fixedDeliveryCharge, 350);
  assert.equal(business.deliveryCharge.basis, 'per-order');
  assert.equal(business.shipping.charges, 'A fixed delivery charge of LKR 350 applies to every order. The delivery charge is displayed at checkout before you confirm your order.');
  assert.deepEqual(businessPages['shipping-policy'].sections.find(section => section.id === 'charges').body, [business.shipping.charges]);
});
