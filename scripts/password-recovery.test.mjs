import test from 'node:test';
import assert from 'node:assert/strict';
import { getConfirmationError, getPasswordError, readPasswordResetLink, recoveryRetryMessage } from '../src/content/passwordPolicy.js';

test('password validation matches the existing six-character and BCrypt UTF-8 limits', () => {
  for (const value of ['', '      ', 'abcde']) assert.ok(getPasswordError(value));
  for (const value of ['abcdef', 'a'.repeat(72), 'é'.repeat(36), '😀'.repeat(18)]) assert.equal(getPasswordError(value), '');
  for (const value of ['a'.repeat(73), 'é'.repeat(37), '😀'.repeat(19)]) assert.match(getPasswordError(value), /72 UTF-8 bytes/);
  assert.equal(getPasswordError('  abcd'), '', 'valid leading spaces are not removed');
});

test('malformed Unicode is rejected without silently changing the password', () => {
  for (const value of ['abcde\uD800', 'abcde\uDC00', 'abc\uD800d\uDC00']) assert.match(getPasswordError(value), /valid text/);
  assert.equal(getPasswordError('abc😀d'), '');
});

test('confirmation requires the exact original password', () => {
  assert.ok(getConfirmationError('abcdef', ''));
  assert.ok(getConfirmationError('abcdef', 'ABCDEF'));
  assert.ok(getConfirmationError('abcdef', 'abcdef '));
  assert.equal(getConfirmationError('abcdef ', 'abcdef '), '');
});

const syntheticToken = 'A'.repeat(43);
test('fragment and legacy query tokens are read while the clean URL contains no secrets', () => {
  for (const url of [
    `https://www.sekkin.lk/reset-password#token=${syntheticToken}`,
    `https://www.sekkin.lk/reset-password?token=${syntheticToken}`,
    `https://www.sekkin.lk/reset-password?tracking=ignored#token=${syntheticToken}`,
  ]) assert.deepEqual(readPasswordResetLink(url), { token: syntheticToken, cleanUrl: '/reset-password' });
});

test('missing, duplicate, ambiguous and malformed reset links do not yield a token', () => {
  for (const suffix of ['', '#token=short', '#token=' + 'A'.repeat(44), '#token=' + '!'.repeat(43), `?token=${syntheticToken}#token=${syntheticToken}`, `#token=${syntheticToken}&token=${syntheticToken}`]) {
    assert.equal(readPasswordResetLink(`https://www.sekkin.lk/reset-password${suffix}`).token, '');
  }
  assert.deepEqual(readPasswordResetLink('invalid'), { token: '', cleanUrl: '/reset-password' });
});

test('rate-limit messages handle seconds, dates and missing provider headers safely', () => {
  assert.match(recoveryRetryMessage('60'), /1 minute\./);
  assert.match(recoveryRetryMessage('121'), /3 minutes\./);
  assert.match(recoveryRetryMessage('Sun, 22 Nov 2026 00:02:00 GMT', Date.parse('2026-11-22T00:00:00Z')), /2 minutes\./);
  for (const value of [undefined, 'bad', '-5', '0']) assert.match(recoveryRetryMessage(value), /few minutes/);
});
