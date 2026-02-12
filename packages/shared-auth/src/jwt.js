/**
 * Minimal JWT helpers — no external dependency.
 *
 * HIPAA §164.312(d) — Person Authentication
 */

import { createHmac, timingSafeEqual } from 'crypto';

const ALG = 'HS256';

export function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

export function signJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: ALG, typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp && Date.now() / 1000 > payload.exp) return null;
  return payload;
}
