import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { readSecureJSON, writeSecureJSON } from '../lib/secure-fs.js';

const DATA_DIR = path.resolve('data/patients');

export function createPatient({ firstName, language, phoneNumber, callTime, timezone }) {
  return {
    patient_id: randomUUID(),
    first_name: firstName,
    language: language || 'fr',
    phone_number: phoneNumber || null,
    call_schedule: { time: callTime || '09:00', timezone: timezone || 'Europe/Paris' },
    created_at: new Date().toISOString(),
    baseline_established: false,
    baseline_sessions: 0,
    alert_level: 'green',
    confounders: {},
    personality_notes: ''
  };
}

export async function savePatient(patient) {
  const filePath = path.join(DATA_DIR, `${patient.patient_id}.json`);
  await writeSecureJSON(filePath, patient);
  return patient;
}

export async function loadPatient(patientId) {
  const filePath = path.join(DATA_DIR, `${patientId}.json`);
  return await readSecureJSON(filePath);
}

export async function listPatients() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const files = await fs.readdir(DATA_DIR);
  const patients = [];
  for (const file of files) {
    if (file.endsWith('.json')) {
      const patient = await readSecureJSON(path.join(DATA_DIR, file));
      patients.push(patient);
    }
  }
  return patients;
}

export async function deletePatient(patientId) {
  const filePath = path.join(DATA_DIR, `${patientId}.json`);
  try { await fs.unlink(filePath); } catch {}
  // Also delete memory profile
  const memPath = path.join(DATA_DIR, `memories_${patientId}.json`);
  try { await fs.unlink(memPath); } catch {}
}
