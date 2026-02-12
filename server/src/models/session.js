import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { readSecureJSON, writeSecureJSON } from '../lib/secure-fs.js';

const DATA_DIR = path.resolve('data/sessions');

export function createSession({ patientId, language, transcript, durationSeconds, confounders }) {
  return {
    session_id: randomUUID(),
    patient_id: patientId,
    language: language || 'fr',
    timestamp: new Date().toISOString(),
    duration_seconds: durationSeconds || 0,
    transcript: transcript || [],  // Array of { role, text, timestamp, word_timestamps? }
    confounders: confounders || {},
    feature_vector: null,  // Populated after extraction
    extracted_at: null
  };
}

export async function saveSession(session) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `${session.session_id}.json`);
  await writeSecureJSON(filePath, session);
  return session;
}

export async function loadSession(sessionId) {
  const filePath = path.join(DATA_DIR, `${sessionId}.json`);
  return await readSecureJSON(filePath);
}

export async function loadPatientSessions(patientId) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const files = await fs.readdir(DATA_DIR);
  const sessions = [];
  for (const file of files) {
    if (file.endsWith('.json')) {
      const session = await readSecureJSON(path.join(DATA_DIR, file));
      if (session.patient_id === patientId) {
        sessions.push(session);
      }
    }
  }
  return sessions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export async function deletePatientSessions(patientId) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const files = await fs.readdir(DATA_DIR);
  let deleted = 0;
  for (const file of files) {
    if (file.endsWith('.json')) {
      const session = await readSecureJSON(path.join(DATA_DIR, file));
      if (session.patient_id === patientId) {
        await fs.unlink(path.join(DATA_DIR, file));
        deleted++;
      }
    }
  }
  return deleted;
}
