/**
 * Secure file I/O — encrypts JSON at rest using AES-256-GCM.
 *
 * Drop-in replacements for:
 *   fs.writeFile(path, JSON.stringify(obj, null, 2))  -->  writeSecureJSON(path, obj)
 *   JSON.parse(await fs.readFile(path, 'utf-8'))      -->  readSecureJSON(path)
 *
 * When ENCRYPTION_KEY is not set, falls back to plain JSON (dev mode).
 */

import fs from 'fs/promises';
import path from 'path';
import { encrypt, decrypt, isEncryptionEnabled } from './crypto.js';

/**
 * Write an object as encrypted JSON (or plain JSON in dev mode).
 * Automatically creates parent directories.
 */
export async function writeSecureJSON(filePath, obj) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const json = JSON.stringify(obj, null, 2);

  if (isEncryptionEnabled()) {
    const blob = encrypt(json);
    await fs.writeFile(filePath, blob, 'utf-8');
  } else {
    await fs.writeFile(filePath, json, 'utf-8');
  }
}

/**
 * Read and decrypt a JSON file. Throws if file does not exist.
 */
export async function readSecureJSON(filePath) {
  const raw = await fs.readFile(filePath, 'utf-8');

  if (isEncryptionEnabled()) {
    const json = decrypt(raw);
    return JSON.parse(json);
  }

  return JSON.parse(raw);
}

/**
 * Read and decrypt a JSON file. Returns `fallback` if file does not exist.
 * This is the safe variant — never throws on missing files.
 */
export async function readSecureJSONSafe(filePath, fallback = null) {
  try {
    return await readSecureJSON(filePath);
  } catch {
    return fallback;
  }
}
