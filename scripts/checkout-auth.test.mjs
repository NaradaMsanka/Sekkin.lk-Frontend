import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutLoginState, getLoginReturn, getSessionToken } from '../src/services/checkoutAuth.js';

test('missing and placeholder browser tokens cannot open checkout', () => {
  for (const value of [null, '', ' ', 'null', 'undefined', '"null"']) {
    assert.equal(getSessionToken({ getItem: () => value }), null);
  }
  assert.equal(getSessionToken({ getItem: () => ' "synthetic-session-token" ' }), 'synthetic-session-token');
});

test('product and quantity survive login while checkout stays an explicit customer action', () => {
  const state = checkoutLoginState({ id: 42 }, 3);
  assert.deepEqual(getLoginReturn(state), { to: '/product/42', state: { checkout: { productId: 42, quantity: 3 } } });
  assert.deepEqual(getLoginReturn({ from: '/checkout' }), { to: '/checkout', state: null });
});

test('authentication cannot redirect outside the store or resume a different product', () => {
  for (const from of ['https://example.test', '//example.test', '/\\example.test', 'javascript:alert(1)', '/product/42?next=https://example.test']) {
    assert.deepEqual(getLoginReturn({ from, checkout: { productId: 42, quantity: 2 } }), { to: '/', state: null });
  }
  assert.deepEqual(getLoginReturn({ from: '/product/42', checkout: { productId: 99, quantity: 2 } }), { to: '/product/42', state: null });
  for (const quantity of [-1, 0, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(getLoginReturn({ from: '/product/42', checkout: { productId: 42, quantity } }).state, null);
  }
});
