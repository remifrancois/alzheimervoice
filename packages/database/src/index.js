/**
 * @azh/database — PostgreSQL database layer for AlzheimerVoice.
 *
 * Usage:
 *   import { pool, query, withTransaction, withOrgScope } from '@azh/database';
 *   import * as patientRepo from '@azh/database/repositories/patient.repo';
 */

// Connection & pool
export {
  getPool,
  query,
  withTransaction,
  withOrgScope,
  orgQuery,
  runMigrations,
  closePool,
} from './connection.js';

// Repositories
export * as patientRepo from './repositories/patient.repo.js';
export * as sessionRepo from './repositories/session.repo.js';
export * as baselineRepo from './repositories/baseline.repo.js';
export * as reportRepo from './repositories/report.repo.js';
export * as memoryRepo from './repositories/memory.repo.js';
export * as userRepo from './repositories/user.repo.js';
export * as auditRepo from './repositories/audit.repo.js';
export * as organizationRepo from './repositories/organization.repo.js';
export * as consentRepo from './repositories/consent.repo.js';
export * as subscriptionRepo from './repositories/subscription.repo.js';
export * as notificationRepo from './repositories/notification.repo.js';
export * as usageRepo from './repositories/usage.repo.js';
