/**
 * Cognito JWT Verification via JWKS.
 *
 * Verifies RS256-signed JWTs from AWS Cognito User Pools.
 * Uses the public JWKS endpoint — no shared secret needed.
 *
 * Security hardening:
 *   - RS256 only (no algorithm confusion attacks)
 *   - Strict issuer + audience validation
 *   - Token type enforcement (id_token only)
 *   - JWKS cache with rate limiting (anti-DDoS)
 *   - Clock tolerance capped at 30s
 *   - Token age check (reject tokens older than maxAge)
 *
 * HIPAA §164.312(d) — Person Authentication
 */

import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

let _client = null;
let _config = null;

/**
 * Initialize the Cognito verifier.
 * @param {{ userPoolId: string, region: string, clientIds: string[] }} opts
 */
export function initCognito({ userPoolId, region, clientIds }) {
  if (!userPoolId || !region) {
    throw new Error('initCognito: userPoolId and region are required');
  }

  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  const jwksUri = `${issuer}/.well-known/jwks.json`;

  _client = jwksClient({
    jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600_000, // 10 min cache
    rateLimit: true,
    jwksRequestsPerMinute: 10, // Anti-DDoS
    timeout: 10_000, // 10s JWKS fetch timeout
  });

  _config = { issuer, clientIds: clientIds.filter(Boolean) };
}

function getKey(header, callback) {
  if (!header.kid) {
    return callback(new Error('Missing kid in token header'));
  }
  _client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

/**
 * Verify a Cognito id_token.
 * Returns the decoded payload or null if invalid.
 */
export function verifyCognitoToken(token) {
  if (!_client || !_config) {
    throw new Error('Cognito verifier not initialized — call initCognito()');
  }

  return new Promise((resolve) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'], // Only RS256 — prevents algorithm confusion
        issuer: _config.issuer,
        clockTolerance: 30, // Max 30s clock skew
        maxAge: '2h', // Reject tokens older than 2h even if exp not reached
        complete: false,
      },
      (err, decoded) => {
        if (err) {
          // Don't expose error details — just reject
          return resolve(null);
        }

        // Must be an id_token (not access_token or refresh_token)
        if (decoded.token_use !== 'id') return resolve(null);

        // Must be for one of our registered app clients
        if (_config.clientIds.length > 0 && !_config.clientIds.includes(decoded.aud)) {
          return resolve(null);
        }

        // Must have a subject
        if (!decoded.sub) return resolve(null);

        // Must have email_verified = true
        if (decoded.email_verified !== true && decoded.email_verified !== 'true') {
          return resolve(null);
        }

        resolve(decoded);
      }
    );
  });
}

/**
 * Map Cognito id_token claims → the request.user shape that RBAC expects.
 *
 * Output: { sub, cognitoSub, role, email, name, patientIds }
 */
export function normalizeCognitoUser(decoded, patientIds = []) {
  const groups = decoded['cognito:groups'] || [];
  const ROLE_PRIORITY = ['admin', 'clinician', 'family'];
  const role = ROLE_PRIORITY.find(r => groups.includes(r)) || 'family';

  return {
    sub: decoded['custom:azh_user_id'] || decoded.sub,
    cognitoSub: decoded.sub,
    role,
    email: decoded.email,
    name: decoded.name || decoded.email,
    patientIds,
  };
}
