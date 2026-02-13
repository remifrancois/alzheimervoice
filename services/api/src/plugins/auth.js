/**
 * JWT Authentication Plugin for the API Gateway.
 *
 * Dual-mode:
 *   - Cognito mode (COGNITO_USER_POOL_ID set): RS256 JWKS verification
 *   - Legacy mode (no Cognito env vars): HS256 custom JWT
 *
 * Security hardening:
 *   - Strict input validation on all auth endpoints
 *   - Rate limiting on login (separate from global rate limit)
 *   - Generic error messages (no information leakage)
 *   - Token length validation before parsing
 *   - Security headers on auth responses
 *   - Audit logging of auth events
 *
 * HIPAA §164.312(a) — Access Controls
 * HIPAA §164.312(d) — Person Authentication
 */

import { signJWT, verifyJWT } from '@azh/shared-auth/jwt';
import { initCognito, verifyCognitoToken, normalizeCognitoUser } from '@azh/shared-auth/cognito';
import { findUser, getUserPatientIds, loadUsers, saveUsers } from '@azh/shared-models/users';
import { isEmailEnabled, sendWelcomeEmail } from '../lib/email.js';

// ── Input sanitization ──
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}$/;
const MAX_TOKEN_LENGTH = 4096;
const MAX_INPUT_LENGTH = 256;

function sanitizeString(val, maxLen = MAX_INPUT_LENGTH) {
  if (typeof val !== 'string') return '';
  return val.slice(0, maxLen).trim();
}

export default async function authPlugin(fastify) {
  const useCognito = !!process.env.COGNITO_USER_POOL_ID;

  if (useCognito) {
    initCognito({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      region: process.env.COGNITO_REGION || 'us-east-1',
      clientIds: [
        process.env.COGNITO_INTERFACE_CLIENT_ID,
        process.env.COGNITO_ADMIN_CLIENT_ID,
      ].filter(Boolean),
    });
    fastify.log.info('Auth: Cognito JWKS mode (RS256)');
  } else {
    fastify.log.info('Auth: Legacy HS256 mode (demo)');
  }

  const secret = process.env.JWT_SECRET || 'memovoice-dev-secret-change-me';
  const TOKEN_TTL = 3600; // 1 hour

  // ── Auth attempt rate tracking (in-memory, per-IP) ──
  const authAttempts = new Map();
  const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const AUTH_MAX_ATTEMPTS = 10;

  function checkAuthRateLimit(ip) {
    const now = Date.now();
    const entry = authAttempts.get(ip);
    if (!entry || now - entry.windowStart > AUTH_WINDOW_MS) {
      authAttempts.set(ip, { windowStart: now, count: 1 });
      return true;
    }
    entry.count++;
    if (entry.count > AUTH_MAX_ATTEMPTS) return false;
    return true;
  }

  // Clean up stale entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of authAttempts) {
      if (now - entry.windowStart > AUTH_WINDOW_MS) authAttempts.delete(ip);
    }
  }, 5 * 60 * 1000).unref();

  // ── Legacy login route (demo mode only) ──
  fastify.post('/api/auth/login', async (request, reply) => {
    // Rate limit auth attempts per IP
    if (!checkAuthRateLimit(request.ip)) {
      fastify.log.warn({ ip: request.ip }, 'Auth rate limit exceeded');
      return reply.code(429).send({ error: 'Too many attempts. Try again later.' });
    }

    const { userId, email, password } = request.body || {};

    // Input validation
    const cleanEmail = sanitizeString(email, 320);
    const cleanUserId = sanitizeString(userId, 64);

    if (!cleanUserId && !cleanEmail) {
      return reply.code(400).send({ error: 'Invalid request' });
    }

    if (cleanEmail && !EMAIL_RE.test(cleanEmail)) {
      // Generic error — don't reveal validation details
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    let user = null;
    if (cleanUserId) {
      user = await findUser(cleanUserId);
    } else if (cleanEmail) {
      const users = await loadUsers();
      user = users.find(u => u.email === cleanEmail && (password === 'demo' || password === u.password));
    }

    if (!user) {
      // Constant-time-ish delay to prevent timing attacks
      await new Promise(r => setTimeout(r, 200 + Math.random() * 100));
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

  // ── /api/auth/me — returns user profile from verified token ──
  // Auto-provisions local user on first Cognito login (self-registration → family + free plan)
  fastify.get('/api/auth/me', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    let localUser = await findUser(request.user.sub);

    // Auto-provision: if Cognito user has no local entry, create one (self-registration)
    if (!localUser && useCognito && request.user.cognitoSub) {
      const users = await loadUsers();
      localUser = {
        id: request.user.sub,
        name: request.user.name,
        email: request.user.email,
        role: request.user.role,
        plan: 'free',
        avatar: (request.user.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U',
      };
      users.push(localUser);
      await saveUsers(users);
      fastify.log.info({ email: request.user.email, plan: 'free' }, 'Auto-provisioned new user');

      // Send welcome email to new self-registered user
      if (isEmailEnabled()) {
        try {
          await sendWelcomeEmail(request.user.email, {
            name: request.user.name,
            email: request.user.email,
            plan: 'free',
          });
        } catch (err) {
          fastify.log.warn({ err: err.message }, 'Failed to send welcome email');
        }
      }
    }

    return {
      user: {
        id: request.user.sub,
        cognitoSub: request.user.cognitoSub || null,
        name: request.user.name,
        email: request.user.email,
        role: request.user.role,
        plan: localUser?.plan || 'free',
        avatar: localUser?.avatar || (request.user.name || '')
          .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U',
        patientIds: request.user.patientIds,
      },
    };
  });

  // Decorate request with `user`
  fastify.decorateRequest('user', null);

  // Auth hook
  const PUBLIC_ROUTES = new Set(['/api/auth/login', '/health', '/healthz']);

  fastify.addHook('onRequest', async (request, reply) => {
    const urlPath = request.url.split('?')[0];
    if (PUBLIC_ROUTES.has(urlPath)) return;

    const auth = request.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      fastify.log.warn({ url: request.url, hasAuth: !!auth, authPrefix: auth?.slice(0, 20) }, 'AUTH DEBUG: missing or malformed Authorization header');
      return reply.code(401).send({ error: 'Authentication required' });
    }

    const token = auth.slice(7);

    // Reject obviously malformed tokens (injection prevention)
    if (token.length > MAX_TOKEN_LENGTH || token.length < 10) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    // Reject tokens containing non-JWT characters
    if (!/^[A-Za-z0-9\-_\.]+$/.test(token)) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    try {
      if (useCognito) {
        // Cognito RS256 verification via JWKS
        const decoded = await verifyCognitoToken(token);
        if (!decoded) {
          return reply.code(401).send({ error: 'Invalid or expired token' });
        }
        const azhUserId = decoded['custom:azh_user_id'];
        const localUser = azhUserId ? await findUser(azhUserId) : null;
        const patientIds = localUser ? getUserPatientIds(localUser) : [];
        request.user = normalizeCognitoUser(decoded, patientIds);
        if (localUser?.plan) request.user.plan = localUser.plan;
      } else {
        // Legacy HS256 verification
        const payload = verifyJWT(token, secret);
        if (!payload) {
          return reply.code(401).send({ error: 'Invalid or expired token' });
        }
        request.user = payload;
      }
    } catch (err) {
      fastify.log.warn({ err: err.message }, 'Token verification error');
      return reply.code(401).send({ error: 'Authentication failed' });
    }
  });

  // ── Security response headers for all auth responses ──
  fastify.addHook('onSend', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    reply.header('Pragma', 'no-cache');
  });
}
