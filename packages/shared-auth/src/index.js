/**
 * @azh/shared-auth — JWT + RBAC + Cognito primitives for AlzheimerVoice
 *
 * Shared between services/api and services/cvf.
 */

export { base64url, signJWT, verifyJWT } from './jwt.js';
export { requireRole, requirePatientAccess, filterPatientsForUser } from './rbac.js';
export { initCognito, verifyCognitoToken, normalizeCognitoUser } from './cognito.js';
