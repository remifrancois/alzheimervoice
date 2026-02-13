/**
 * Database bridge — Feature flag routing between file-based and PostgreSQL storage.
 *
 * When USE_DATABASE=true, delegates to @azh/database repositories.
 * Otherwise, falls through to the file-based implementations.
 *
 * The bridge requires orgId for DB operations. Callers that don't have orgId
 * (legacy code paths) will use the DEFAULT_ORG_ID.
 */

const USE_DB = () => process.env.USE_DATABASE === 'true';
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Lazy imports to avoid loading @azh/database when not needed
let _db = null;
async function db() {
  if (!_db) {
    _db = await import('@azh/database');
  }
  return _db;
}

/**
 * Resolve orgId: use provided value, or fall back to DEFAULT_ORG_ID.
 */
function resolveOrgId(orgId) {
  return orgId || DEFAULT_ORG_ID;
}

// ── Patient Bridge ──

import * as filePatient from './patient.js';

export async function savePatient(patient, orgId) {
  if (USE_DB()) {
    const { patientRepo } = await db();
    return patientRepo.savePatient(resolveOrgId(orgId), patient);
  }
  return filePatient.savePatient(patient);
}

export async function loadPatient(patientId, orgId) {
  if (USE_DB()) {
    const { patientRepo } = await db();
    return patientRepo.loadPatient(resolveOrgId(orgId), patientId);
  }
  return filePatient.loadPatient(patientId);
}

export async function listPatients(orgId) {
  if (USE_DB()) {
    const { patientRepo } = await db();
    return patientRepo.listPatients(resolveOrgId(orgId));
  }
  return filePatient.listPatients();
}

export async function deletePatient(patientId, orgId) {
  if (USE_DB()) {
    const { patientRepo } = await db();
    return patientRepo.deletePatient(resolveOrgId(orgId), patientId);
  }
  return filePatient.deletePatient(patientId);
}

// ── Session Bridge ──

import * as fileSession from './session.js';

export async function saveSession(session, orgId) {
  if (USE_DB()) {
    const { sessionRepo } = await db();
    return sessionRepo.saveSession(resolveOrgId(orgId), session);
  }
  return fileSession.saveSession(session);
}

export async function loadSession(sessionId, orgId) {
  if (USE_DB()) {
    const { sessionRepo } = await db();
    return sessionRepo.loadSession(resolveOrgId(orgId), sessionId);
  }
  return fileSession.loadSession(sessionId);
}

export async function loadPatientSessions(patientId, orgId) {
  if (USE_DB()) {
    const { sessionRepo } = await db();
    return sessionRepo.loadPatientSessions(resolveOrgId(orgId), patientId);
  }
  return fileSession.loadPatientSessions(patientId);
}

export async function deletePatientSessions(patientId, orgId) {
  if (USE_DB()) {
    const { sessionRepo } = await db();
    return sessionRepo.deletePatientSessions(resolveOrgId(orgId), patientId);
  }
  return fileSession.deletePatientSessions(patientId);
}

// ── CVF / Baseline Bridge ──

import * as fileCvf from './cvf.js';

export async function saveBaseline(baseline, orgId) {
  if (USE_DB()) {
    const { baselineRepo } = await db();
    return baselineRepo.saveBaseline(resolveOrgId(orgId), {
      ...baseline,
      version: 'v1',
    });
  }
  return fileCvf.saveBaseline(baseline);
}

export async function loadBaseline(patientId, orgId) {
  if (USE_DB()) {
    const { baselineRepo } = await db();
    return baselineRepo.loadBaseline(resolveOrgId(orgId), patientId, 'v1');
  }
  return fileCvf.loadBaseline(patientId);
}

export async function loadV3Baseline(patientId, orgId) {
  if (USE_DB()) {
    const { baselineRepo } = await db();
    return baselineRepo.loadV3Baseline(resolveOrgId(orgId), patientId);
  }
  return fileCvf.loadV3Baseline(patientId);
}

export async function saveV3Baseline(patientId, baseline, orgId) {
  if (USE_DB()) {
    const { baselineRepo } = await db();
    return baselineRepo.saveV3Baseline(resolveOrgId(orgId), patientId, baseline);
  }
  return fileCvf.saveV3Baseline(patientId, baseline);
}

export async function saveWeeklyAnalysis(analysis, orgId) {
  if (USE_DB()) {
    const { reportRepo } = await db();
    return reportRepo.saveWeeklyReport(resolveOrgId(orgId), analysis);
  }
  return fileCvf.saveWeeklyAnalysis(analysis);
}

export async function loadWeeklyAnalysis(patientId, weekNumber, orgId) {
  if (USE_DB()) {
    const { reportRepo } = await db();
    return reportRepo.loadWeeklyReport(resolveOrgId(orgId), patientId, weekNumber);
  }
  return fileCvf.loadWeeklyAnalysis(patientId, weekNumber);
}

export async function deletePatientCvfData(patientId, orgId) {
  if (USE_DB()) {
    const { baselineRepo, reportRepo } = await db();
    const oid = resolveOrgId(orgId);
    const baselines = await baselineRepo.deletePatientBaselines(oid, patientId);
    const reports = await reportRepo.deletePatientReports(oid, patientId);
    return baselines + reports;
  }
  return fileCvf.deletePatientCvfData(patientId);
}

export async function exportPatientCvfData(patientId, orgId) {
  if (USE_DB()) {
    const { baselineRepo, reportRepo } = await db();
    const oid = resolveOrgId(orgId);
    const baseline = await baselineRepo.loadBaseline(oid, patientId, 'v1');
    const v3Baseline = await baselineRepo.loadBaseline(oid, patientId, 'v3');
    const weeklyReports = await reportRepo.loadPatientReports(oid, patientId);
    return { baseline, v3Baseline, weeklyReports };
  }
  return fileCvf.exportPatientCvfData(patientId);
}

// ── Memory Bridge ──

import * as fileMemory from './memory.js';

export async function loadMemoryProfile(patientId, orgId) {
  if (USE_DB()) {
    const { memoryRepo } = await db();
    return memoryRepo.loadMemoryProfile(resolveOrgId(orgId), patientId);
  }
  return fileMemory.loadMemoryProfile(patientId);
}

export async function saveMemoryProfile(profile, orgId) {
  if (USE_DB()) {
    const { memoryRepo } = await db();
    return memoryRepo.saveMemoryProfile(resolveOrgId(orgId), profile);
  }
  return fileMemory.saveMemoryProfile(profile);
}

// ── User Bridge ──

import * as fileUsers from './users.js';

export async function loadUsers(orgId) {
  if (USE_DB()) {
    const { userRepo } = await db();
    return userRepo.loadUsers(resolveOrgId(orgId));
  }
  return fileUsers.loadUsers();
}

export async function findUser(userId) {
  if (USE_DB()) {
    const { userRepo } = await db();
    return userRepo.findUserWithAccess(userId);
  }
  return fileUsers.findUser(userId);
}

export async function getUserPatientIds(user, orgId) {
  if (USE_DB()) {
    const { patientRepo } = await db();
    return patientRepo.getUserPatientIds(resolveOrgId(orgId), user.id);
  }
  return fileUsers.getUserPatientIds(user);
}

export async function canUserAccessPatient(user, patientId, orgId) {
  if (USE_DB()) {
    const { patientRepo } = await db();
    return patientRepo.canUserAccessPatient(resolveOrgId(orgId), user.id, patientId);
  }
  return fileUsers.canUserAccessPatient(user, patientId);
}
