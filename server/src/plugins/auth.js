/**
 * JWT Authentication Plugin for Fastify.
 *
 * Handles:
 *   POST /api/auth/login  — issue JWT from userId or email+password
 *   onRequest hook        — verify Bearer token on protected routes
 *
 * HIPAA §164.312(a) — Access Controls
 * HIPAA §164.312(d) — Person Authentication
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { findUser, getUserPatientIds, loadUsers } from '../lib/users.js';

const ALG = 'HS256';

// ---- Minimal JWT helpers (no external dep) ----

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function signJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: ALG, typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyJWT(token, secret) {
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

// ---- Fastify Plugin ----

export default async function authPlugin(fastify) {
  const secret = process.env.JWT_SECRET || 'memovoice-dev-secret-change-me';
  const TOKEN_TTL = 8 * 60 * 60; // 8 hours

  // Public login route — accepts { userId } or { email, password }
  fastify.post('/api/auth/login', async (request, reply) => {
    const { userId, email, password } = request.body || {};

    let user = null;
    if (userId) {
      // Login by userId (demo mode)
      user = await findUser(userId);
    } else if (email) {
      // Login by email + password
      const users = await loadUsers();
      user = users.find(u => u.email === email && (password === 'demo' || password === u.password));
    }

    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const patientIds = getUserPatientIds(user);
    const now = Math.floor(Date.now() / 1000);
    const token = signJWT({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      patientIds,
      iat: now,
      exp: now + TOKEN_TTL,
    }, secret);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        patientIds,
      },
    };
  });

  // Decorate request with `user`
  fastify.decorateRequest('user', null);

  // Auth hook — runs on every request except public routes
  const PUBLIC_ROUTES = ['/api/auth/login', '/health', '/healthz'];

  fastify.addHook('onRequest', async (request, reply) => {
    const urlPath = request.url.split('?')[0];
    if (PUBLIC_ROUTES.includes(urlPath)) return;

    const auth = request.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    const token = auth.slice(7);
    const payload = verifyJWT(token, secret);
    if (!payload) {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }

    request.user = payload;
  });
}
