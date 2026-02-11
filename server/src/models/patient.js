import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

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
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `${patient.patient_id}.json`);
  await fs.writeFile(filePath, JSON.stringify(patient, null, 2));
  return patient;
}

export async function loadPatient(patientId) {
  const filePath = path.join(DATA_DIR, `${patientId}.json`);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function listPatients() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const files = await fs.readdir(DATA_DIR);
  const patients = [];
  for (const file of files) {
    if (file.endsWith('.json')) {
      const data = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
      patients.push(JSON.parse(data));
    }
  }
  return patients;
}
