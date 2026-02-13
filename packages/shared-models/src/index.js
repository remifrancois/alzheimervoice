/**
 * @azh/shared-models — Data models and persistence for AlzheimerVoice
 *
 * Shared between services/api and services/cvf.
 *
 * When USE_DATABASE=true, persistence operations delegate to @azh/database
 * (PostgreSQL via Neon serverless). Otherwise, uses encrypted JSON files
 * from DATA_ROOT env var (default: ./data).
 *
 * Pure functions (createPatient, createSession, computeBaseline, etc.)
 * always come from the original modules — they have no storage side effects.
 */

// ── Pure functions (no I/O, always from original modules) ──

export { createPatient } from './patient.js';
export { createSession } from './session.js';
export {
  CVF_FEATURES, DOMAIN_WEIGHTS, ALL_FEATURES, ALERT_THRESHOLDS,
  getAlertLevel, createEmptyVector, createBaseline, computeBaseline,
  computeDelta, computeComposite, computeDomainScores,
} from './cvf.js';
export { createMemory, selectMemoriesForSession } from './memory.js';
export { encrypt, decrypt, isEncryptionEnabled } from './crypto.js';
export { writeSecureJSON, readSecureJSON, readSecureJSONSafe } from './secure-fs.js';

// ── Persistence functions (routed through db-bridge when USE_DATABASE=true) ──

export {
  savePatient, loadPatient, listPatients, deletePatient,
  saveSession, loadSession, loadPatientSessions, deletePatientSessions,
  saveBaseline, loadBaseline, saveWeeklyAnalysis, loadWeeklyAnalysis,
  loadV3Baseline, saveV3Baseline, deletePatientCvfData, exportPatientCvfData,
  loadMemoryProfile, saveMemoryProfile,
  loadUsers, findUser, canUserAccessPatient, getUserPatientIds,
} from './db-bridge.js';

// ── User functions only available in file mode (saveUsers, clearUserCache) ──

export { saveUsers, clearUserCache } from './users.js';
