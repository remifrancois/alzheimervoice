/**
 * @azh/shared-auth — JWT + RBAC primitives for AlzheimerVoice
 *
 * Shared between services/api and services/cvf.
 */

export { base64url, signJWT, verifyJWT } from './jwt.js';
export { requireRole, requirePatientAccess, filterPatientsForUser } from './rbac.js';
