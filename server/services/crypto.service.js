// Crypto Service — MailPilot
// AES-256-GCM Authenticated Encryption for OAuth Access & Refresh Tokens at rest

const crypto = require('crypto');
const { JWT_SECRET } = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM

/**
 * Derives a consistent 256-bit (32-byte) key from the configured secret
 */
function getEncryptionKey() {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET || JWT_SECRET || 'mailpilot_default_token_secret_32b';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext token string using AES-256-GCM
 * Output format: enc:IV_HEX:AUTH_TAG_HEX:CIPHERTEXT_HEX
 */
function encryptToken(plainText) {
  if (!plainText || typeof plainText !== 'string') return null;

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return `enc:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (err) {
    console.error('❌ [Crypto Service] Encryption failed:', err.message);
    throw new Error('Failed to encrypt sensitive token data.');
  }
}

/**
 * Decrypts an encrypted token string using AES-256-GCM
 * Handles legacy unencrypted plaintext gracefully for backward compatibility
 */
function decryptToken(cipherText) {
  if (!cipherText || typeof cipherText !== 'string') return null;

  // If not formatted as encrypted token, return as-is (graceful fallback)
  if (!cipherText.startsWith('enc:')) {
    return cipherText;
  }

  const parts = cipherText.split(':');
  if (parts.length !== 4) {
    return null;
  }

  const [, ivHex, authTagHex, encryptedHex] = parts;

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (err) {
    console.error('❌ [Crypto Service] Decryption failed (invalid key or tampered data):', err.message);
    return null;
  }
}

module.exports = {
  encryptToken,
  decryptToken,
};
