import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateOrderTotals, fixedDeliveryCharge, formatDeliveryCharge } from '../src/content/delivery.js';
import business from '../src/content/business.json' with { type: 'json' };
import { businessPages } from '../src/content/businessPages.js';

for (const [subtotal, expected] of [[1000, 1400], [5000, 5400], [10000, 10400]]) {
  test(`LKR ${subtotal} merchandise adds one LKR 400 charge`, () => {
    assert.deepEqual(estimateOrderTotals(subtotal), { subtotal, couponDiscount: 0, deliveryCharge: 400, total: expected });
  });
}
test('multiple products and quantities still use a single charge', () => {
  assert.equal(estimateOrderTotals(1000 * 2 + 1500 * 2).total, 5400);
  assert.equal(estimateOrderTotals(1000 * 10).deliveryCharge, 400);
});
test('verified promotional savings never reduce delivery or make merchandise negative', () => {
  assert.equal(estimateOrderTotals(5000, 500).total, 4900);
  assert.equal(estimateOrderTotals(5000, 500).deliveryCharge, 400);
  assert.equal(estimateOrderTotals(2499, 249.9).total, 2649.1);
  assert.equal(estimateOrderTotals(5000, 0).total, 5400);
  assert.equal(estimateOrderTotals(.05, .01).total, 400.04);
  assert.equal(estimateOrderTotals(1000, 2000).total, 400);
  assert.throws(() => estimateOrderTotals(5000, 'UNVERIFIED_CODE'));
});
test('empty cart has no payable order or delivery fee', () => {
  assert.deepEqual(estimateOrderTotals(0, 0, false), { subtotal: 0, couponDiscount: 0, deliveryCharge: 0, total: 0 });
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
  assert.equal(fixedDeliveryCharge, 400);
  assert.equal(business.shipping.charges, 'A flat delivery fee of Rs. 400 applies to all islandwide orders. Any applicable shipping promotions or free-delivery thresholds will be displayed clearly at checkout.');
  assert.deepEqual(businessPages['shipping-policy'].sections.find(section => section.id === 'charges').body, [business.shipping.charges]);
});
