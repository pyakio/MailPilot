const test = require('node:test');
const assert = require('node:assert/strict');
const { encryptToken, decryptToken } = require('../services/crypto.service');

test('encryptToken returns formatted ciphertext with enc: prefix', () => {
  const token = 'ya29.a0AfH6SMD_example_google_access_token_12345';
  const encrypted = encryptToken(token);

  assert.ok(encrypted);
  assert.ok(encrypted.startsWith('enc:'));
  const parts = encrypted.split(':');
  assert.equal(parts.length, 4);
  assert.equal(parts[0], 'enc');
  assert.equal(parts[1].length, 24); // 12 bytes IV in hex
  assert.equal(parts[2].length, 32); // 16 bytes auth tag in hex
  assert.ok(parts[3].length > 0); // Ciphertext in hex
});

test('decryptToken successfully decrypts encrypted ciphertext back to original plaintext', () => {
  const original = '1//0gRefresh_Token_Secret_ABCXYZ123456';
  const encrypted = encryptToken(original);
  const decrypted = decryptToken(encrypted);

  assert.equal(decrypted, original);
});

test('encryptToken uses randomized IV producing unique ciphertexts for identical inputs', () => {
  const token = 'same_token_value';
  const enc1 = encryptToken(token);
  const enc2 = encryptToken(token);

  assert.notEqual(enc1, enc2);
  assert.equal(decryptToken(enc1), token);
  assert.equal(decryptToken(enc2), token);
});

test('decryptToken gracefully handles legacy unencrypted plaintext without crashing', () => {
  const legacyToken = 'legacy_plaintext_token_not_encrypted';
  const result = decryptToken(legacyToken);

  assert.equal(result, legacyToken);
});

test('decryptToken returns null for tampered ciphertext or corrupted auth tag', () => {
  const token = 'secret_token';
  const encrypted = encryptToken(token);
  const parts = encrypted.split(':');

  // Corrupt the ciphertext
  const tamperedCiphertext = `enc:${parts[1]}:${parts[2]}:ffffffffffff`;
  assert.equal(decryptToken(tamperedCiphertext), null);

  // Corrupt the auth tag
  const tamperedAuthTag = `enc:${parts[1]}:00000000000000000000000000000000:${parts[3]}`;
  assert.equal(decryptToken(tamperedAuthTag), null);
});

test('encryptToken and decryptToken handle null, undefined, and non-string inputs safely', () => {
  assert.equal(encryptToken(null), null);
  assert.equal(encryptToken(undefined), null);
  assert.equal(encryptToken(123), null);

  assert.equal(decryptToken(null), null);
  assert.equal(decryptToken(undefined), null);
  assert.equal(decryptToken(123), null);
});
