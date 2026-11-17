import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createOrderRequestStore, validateOrderReceipt, allowedOrderTransitions, canRecordCodCollection } from '../src/services/orderRequest.js';

function storage() {
  const values = new Map();
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const intent = { items: [{ productId: 1, quantity: 2 }], address: 'Synthetic address', contact: { email: 'customer@example.test' }, couponCode: 'GLOW10', expectedTotal: 4850 };

test('unchanged intent retains a UUID v4 across retries and a new store instance', async () => {
  const session = storage();
  const first = createOrderRequestStore({ storage: () => session, crypto: webcrypto });
  const a = await first.get('direct', intent);
  assert.match(a.key, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal((await first.get('direct', structuredClone(intent))).key, a.key);
  const afterRefresh = createOrderRequestStore({ storage: () => session, crypto: webcrypto });
  assert.equal((await afterRefresh.get('direct', intent)).key, a.key);
  assert.equal(a.persistent, true);
});

test('persistent retry metadata contains no raw request, contact details, receipt or JWT', async () => {
  const session = storage();
  const store = createOrderRequestStore({ storage: () => session, crypto: webcrypto });
  await store.get('cart', { ...intent, token: 'synthetic-token-not-a-real-JWT' });
  const raw = [...session.values.values()][0];
  const record = JSON.parse(raw);
  assert.deepEqual(Object.keys(record).sort(), ['completed', 'key', 'signature']);
  assert.match(record.signature, /^[0-9a-f]{64}$/);
  for (const text of ['Synthetic address', 'customer@example.test', 'synthetic-token-not-a-real-JWT', 'GLOW10', '4850']) assert.equal(raw.includes(text), false);
});

test('changed item, address, contact, coupon or consented total creates a new key', async () => {
  for (const change of [
    { items: [{ productId: 1, quantity: 3 }] }, { address: 'Different address' },
    { contact: { email: 'other@example.test' } }, { couponCode: 'SAVE500' }, { expectedTotal: 4950 },
  ]) {
    const session = storage();
    const store = createOrderRequestStore({ storage: () => session, crypto: webcrypto });
    assert.notEqual((await store.get('direct', intent)).key, (await store.get('direct', { ...intent, ...change })).key);
  }
});

test('object property order does not change the intent and checkout scopes are separate', async () => {
  const session = storage();
  const store = createOrderRequestStore({ storage: () => session, crypto: webcrypto });
  const a = await store.get('cart', { a: 1, b: { c: 2, d: 3 } });
  assert.equal((await store.get('cart', { b: { d: 3, c: 2 }, a: 1 })).key, a.key);
  assert.notEqual((await store.get('direct', { a: 1, b: { c: 2, d: 3 } })).key, a.key);
});

test('a completed request remains replayable until an explicit new purchase starts', async () => {
  const session = storage();
  const store = createOrderRequestStore({ storage: () => session, crypto: webcrypto });
  const first = await store.get('direct', intent);
  store.complete('direct', first.key);
  assert.equal((await store.get('direct', intent)).key, first.key);
  const afterRefresh = createOrderRequestStore({ storage: () => session, crypto: webcrypto });
  assert.equal((await afterRefresh.get('direct', intent)).key, first.key);
  const nextPurchase = await afterRefresh.get('direct', intent, { newPurchase: true });
  assert.notEqual(nextPurchase.key, first.key);
  assert.equal((await afterRefresh.get('direct', intent, { newPurchase: true })).key, nextPurchase.key, 'an uncertain new purchase retains its key');
});

test('blocked or full storage uses stable in-memory retry protection with an explicit refresh warning', async () => {
  for (const session of [null, { getItem() { throw new Error('blocked'); }, setItem() {} }, { getItem() { return null; }, setItem() { throw new Error('full'); } }]) {
    const store = createOrderRequestStore({ storage: () => session, crypto: webcrypto });
    const first = await store.get('direct', intent);
    assert.equal(first.persistent, false);
    assert.match(first.warning, /refresh/);
    assert.equal((await store.get('direct', intent)).key, first.key);
  }
});

test('malformed saved metadata is not trusted and cannot silently claim persistence', async () => {
  const session = storage();
  session.setItem('sekkin:order-request:v1:direct', '{bad data');
  const store = createOrderRequestStore({ storage: () => session, crypto: webcrypto });
  const result = await store.get('direct', intent);
  assert.equal(result.persistent, false);
  assert.ok(result.warning);
});

test('missing secure crypto prevents a checkout request key', async () => {
  const store = createOrderRequestStore({ storage, crypto: {} });
  await assert.rejects(store.get('direct', intent), /Secure retry protection/);
});

test('receipt validation requires stored amounts, real order identity and payment/order states', () => {
  const receipt = { orderId: 5, totalAmount: 2350, deliveryCharge: 350, status: 'PENDING', paymentMethod: 'COD', paymentStatus: 'PENDING_COD' };
  assert.equal(validateOrderReceipt(receipt), receipt);
  assert.equal(validateOrderReceipt({ ...receipt, status: 'DELIVERED', paymentStatus: 'PAID' }).paymentStatus, 'PAID');
  for (const change of [{ orderId: null }, { totalAmount: undefined }, { totalAmount: -1 }, { deliveryCharge: null }, { status: 'PAID' }, { paymentMethod: 'CARD' }, { paymentStatus: 'APPROVED' }]) assert.throws(() => validateOrderReceipt({ ...receipt, ...change }), /could not confirm/);
  assert.equal(validateOrderReceipt({ ...receipt, deliveryCharge: 0 }).deliveryCharge, 0, 'historical stored delivery charge is preserved');
  assert.throws(() => validateOrderReceipt(receipt, { direct: true }), /could not confirm/);
  assert.equal(validateOrderReceipt({ ...receipt, quantity: 1, unitPrice: 2000, subtotal: 2000 }, { direct: true }).unitPrice, 2000);
});

test('fulfilment controls expose only approved state transitions and never payment collection', () => {
  assert.deepEqual(allowedOrderTransitions('PENDING'), ['CANCELLED']);
  assert.deepEqual(allowedOrderTransitions('PROCESSING'), ['SHIPPED', 'CANCELLED']);
  assert.deepEqual(allowedOrderTransitions('SHIPPED'), ['DELIVERED']);
  for (const state of ['DELIVERED', 'CANCELLED', 'UNKNOWN']) assert.deepEqual(allowedOrderTransitions(state), []);
});

test('COD collection is offered only for delivered COD with pending collection', () => {
  const order = { status: 'DELIVERED', paymentMethod: 'COD', paymentStatus: 'PENDING_COD' };
  assert.equal(canRecordCodCollection(order), true);
  for (const change of [{ status: 'SHIPPED' }, { status: 'PROCESSING' }, { paymentMethod: 'CARD' }, { paymentStatus: 'PAID' }, { paymentStatus: null }]) assert.equal(canRecordCodCollection({ ...order, ...change }), false);
});
