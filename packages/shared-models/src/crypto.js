/**
 * Encryption at rest for patient data.
 *
 * Uses AES-256-GCM with a per-file random IV.
 * The encryption key is derived from ENCRYPTION_KEY env var via PBKDF2.
 *
 * File format: base64( IV (12 bytes) || authTag (16 bytes) || ciphertext )
 */

import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;
const SALT = 'memovoice-cvf-v2'; // Static salt (key is already high-entropy)

let _derivedKey = null;

function getDerivedKey() {
  if (_derivedKey) return _derivedKey;
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    // In development without an encryption key, skip encryption
    return null;
  }
  _derivedKey = pbkdf2Sync(raw, SALT, 100_000, 32, 'sha512');
  return _derivedKey;
}

/**
 * Encrypt a UTF-8 string. Returns a base64 blob.
 */
export function encrypt(plaintext) {
  const key = getDerivedKey();
  if (!key) return plaintext; // No encryption in dev without key

  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // IV || tag || ciphertext
  const blob = Buffer.concat([iv, tag, encrypted]);
  return blob.toString('base64');
}

/**
 * Decrypt a base64 blob. Returns a UTF-8 string.
 */
export function decrypt(base64Blob) {
  const key = getDerivedKey();
  if (!key) return base64Blob; // No encryption in dev without key

  const blob = Buffer.from(base64Blob, 'base64');

  const iv = blob.subarray(0, IV_LEN);
  const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = blob.subarray(IV_LEN + TAG_LEN);

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Check if encryption is enabled.
 */
export function isEncryptionEnabled() {
  return !!process.env.ENCRYPTION_KEY;
}
