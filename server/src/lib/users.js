/**
 * User store — canonical demo users mirroring the frontend.
 *
 * Each user has: id, name, email, role, avatar, assignedPatients (clinician)
 * or patientId (family). Patient assignments are set during demo data generation.
 */
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.resolve('data/users.json');

const DEFAULT_USERS = [
  { id: 'u1', name: 'Super Admin', email: 'admin@memovoice.ai', role: 'superadmin', avatar: 'SA', password: 'demo', assignedPatients: [] },
  { id: 'u2', name: 'Dr. Remi Francois', email: 'remi@memovoice.ai', role: 'clinician', avatar: 'RF', password: 'demo', assignedPatients: [] },
  { id: 'u3', name: 'Dr. Sophie Martin', email: 'sophie@memovoice.ai', role: 'clinician', avatar: 'SM', password: 'demo', assignedPatients: [] },
  { id: 'u4', name: 'Pierre Dupont', email: 'pierre@famille.fr', role: 'family', avatar: 'PD', password: 'demo', patientId: null },
  { id: 'u5', name: 'Marie-Claire Petit', email: 'mc@famille.fr', role: 'family', avatar: 'MP', password: 'demo', patientId: null },
  { id: 'u6', name: 'Jean Administrateur', email: 'jean@memovoice.ai', role: 'admin', avatar: 'JA', password: 'demo', assignedPatients: [] },
];

let cachedUsers = null;

export async function loadUsers() {
  if (cachedUsers) return cachedUsers;
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    cachedUsers = JSON.parse(data);
  } catch {
    cachedUsers = DEFAULT_USERS;
  }
  return cachedUsers;
}

export function clearUserCache() {
  cachedUsers = null;
}

export async function findUser(userId) {
  const users = await loadUsers();
  return users.find(u => u.id === userId) || null;
}

/**
 * Check if a user can access a given patient's data.
 * - clinician: patient must be in assignedPatients
 * - family: patient must match patientId
 * - admin/superadmin: always denied (no PHI access)
 */
export function canUserAccessPatient(user, patientId) {
  if (!user || !patientId) return false;
  if (user.role === 'clinician') {
    return (user.assignedPatients || []).includes(patientId);
  }
  if (user.role === 'family') {
    return user.patientId === patientId;
  }
  return false;
}

/**
 * Get all patient IDs this user is authorized to see.
 */
export function getUserPatientIds(user) {
  if (!user) return [];
  if (user.role === 'clinician') return user.assignedPatients || [];
  if (user.role === 'family') return user.patientId ? [user.patientId] : [];
  return [];
}
