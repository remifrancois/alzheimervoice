/**
 * User store — canonical demo users mirroring the frontend.
 *
 * Each user has: id, name, email, role, avatar, assignedPatients (clinician)
 * or patientId (family). Patient assignments are set during demo data generation.
 */
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.resolve(process.env.DATA_ROOT || './data', 'users.json');

/**
 * Plans:
 *   free      — Dashboard view + 1 family member (default for self-registration)
 *   pro       — Full analysis + multiple patients
 *   clinical  — Clinical-grade tools for professionals
 *   admin     — Platform management (no plan-based limits)
 */

const DEFAULT_USERS = [
  { id: 'remifran', name: 'Remi Francois', email: 'remifran@memovoice.ai', role: 'superadmin', avatar: 'RF', password: 'demo', plan: 'admin', assignedPatients: [] },
  { id: 'u2', name: 'Dr. Remi Francois', email: 'remi@memovoice.ai', role: 'clinician', avatar: 'RF', password: 'demo', plan: 'clinical', assignedPatients: ['8613281f-dbd2-481c-9e01-05edd7fc188c', '6e2a3de1-1040-4a22-be15-30d6f40738b0', '85a94b4f-71e1-4a44-99b8-1c1017ab114c', '42395508-8cc9-48ac-9835-f9092898f230'] },
  { id: 'u3', name: 'Dr. Sophie Martin', email: 'sophie@memovoice.ai', role: 'clinician', avatar: 'SM', password: 'demo', plan: 'clinical', assignedPatients: ['8613281f-dbd2-481c-9e01-05edd7fc188c', '6e2a3de1-1040-4a22-be15-30d6f40738b0'] },
  { id: 'u4', name: 'Pierre Dupont', email: 'pierre@famille.fr', role: 'family', avatar: 'PD', password: 'demo', plan: 'free', patientId: '8613281f-dbd2-481c-9e01-05edd7fc188c' },
  { id: 'u5', name: 'Marie-Claire Petit', email: 'mc@famille.fr', role: 'family', avatar: 'MP', password: 'demo', plan: 'free', patientId: '6e2a3de1-1040-4a22-be15-30d6f40738b0' },
  { id: 'u6', name: 'Jean-Luc Bernard', email: 'jlbernard@famille.fr', role: 'family', avatar: 'JB', password: 'demo', plan: 'free', patientId: '85a94b4f-71e1-4a44-99b8-1c1017ab114c' },
  { id: 'u7', name: 'Sarah Johnson', email: 'sarah@family.com', role: 'family', avatar: 'SJ', password: 'demo', plan: 'free', patientId: '42395508-8cc9-48ac-9835-f9092898f230' },
  { id: 'u8', name: 'Jean Administrateur', email: 'jean@memovoice.ai', role: 'admin', avatar: 'JA', password: 'demo', plan: 'admin', assignedPatients: [] },
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

export async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  cachedUsers = users;
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
