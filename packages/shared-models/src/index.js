/**
 * @azh/shared-models — Data models and persistence for AlzheimerVoice
 *
 * Shared between services/api and services/cvf.
 * All data paths resolve from DATA_ROOT env var (default: ./data).
 */

export { createPatient, savePatient, loadPatient, listPatients, deletePatient } from './patient.js';
export { createSession, saveSession, loadSession, loadPatientSessions, deletePatientSessions } from './session.js';
export {
  CVF_FEATURES, DOMAIN_WEIGHTS, ALL_FEATURES, ALERT_THRESHOLDS,
  getAlertLevel, createEmptyVector, createBaseline, computeBaseline,
  computeDelta, computeComposite, computeDomainScores,
  saveBaseline, loadBaseline, saveWeeklyAnalysis, loadWeeklyAnalysis,
  loadV3Baseline, saveV3Baseline,
  deletePatientCvfData, exportPatientCvfData,
} from './cvf.js';
export { createMemory, loadMemoryProfile, saveMemoryProfile, selectMemoriesForSession } from './memory.js';
export { loadUsers, clearUserCache, findUser, canUserAccessPatient, getUserPatientIds } from './users.js';
export { encrypt, decrypt, isEncryptionEnabled } from './crypto.js';
export { writeSecureJSON, readSecureJSON, readSecureJSONSafe } from './secure-fs.js';
