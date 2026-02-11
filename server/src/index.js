import Fastify from 'fastify';
import cors from '@fastify/cors';
import { processConversation, getPatientTimeline } from './services/cvf-engine.js';
import { runWeeklyAnalysis } from './services/drift-detector.js';
import { createPatient, savePatient, loadPatient, listPatients, deletePatient } from './models/patient.js';
import { loadMemoryProfile, saveMemoryProfile, createMemory } from './models/memory.js';
import { deletePatientSessions, loadPatientSessions } from './models/session.js';
import { deletePatientCvfData, exportPatientCvfData } from './models/cvf.js';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

// --- Patient Routes ---
app.get('/api/patients', async () => {
  return await listPatients();
});

app.post('/api/patients', async (request) => {
  const patient = createPatient(request.body);
  await savePatient(patient);
  return patient;
});

app.get('/api/patients/:id', async (request) => {
  return await loadPatient(request.params.id);
});

// --- CVF Routes ---
app.post('/api/cvf/process', async (request) => {
  const { patientId, transcript, language, confounders, durationSeconds } = request.body;
  return await processConversation({ patientId, transcript, language, confounders, durationSeconds });
});

app.get('/api/cvf/timeline/:patientId', async (request) => {
  return await getPatientTimeline(request.params.patientId);
});

app.post('/api/cvf/weekly-analysis', async (request) => {
  const { patientId, weekNumber } = request.body;
  return await runWeeklyAnalysis(patientId, weekNumber);
});

app.get('/api/cvf/weekly-report/:patientId/:weekNumber', async (request, reply) => {
  const { loadWeeklyAnalysis } = await import('./models/cvf.js');
  const data = await loadWeeklyAnalysis(request.params.patientId, parseInt(request.params.weekNumber));
  if (!data) return reply.code(404).send({ error: 'Report not found' });
  return data;
});

// --- Memory Routes ---
app.get('/api/memories/:patientId', async (request) => {
  return await loadMemoryProfile(request.params.patientId);
});

app.post('/api/memories/:patientId', async (request) => {
  const profile = await loadMemoryProfile(request.params.patientId);
  const memory = createMemory(request.body);
  profile.memories.push(memory);
  await saveMemoryProfile(profile);
  return memory;
});

// --- GDPR Routes ---

// Export all patient data (GDPR Art. 20 — Data Portability)
app.get('/api/gdpr/export/:patientId', async (request, reply) => {
  const { patientId } = request.params;
  try {
    const patient = await loadPatient(patientId);
    const sessions = await loadPatientSessions(patientId);
    const memories = await loadMemoryProfile(patientId);
    const cvfData = await exportPatientCvfData(patientId);

    return {
      exportDate: new Date().toISOString(),
      gdprArticle: 'Art. 20 — Right to Data Portability',
      patient,
      sessions,
      memories,
      cvfBaseline: cvfData.baseline,
      weeklyReports: cvfData.weeklyReports,
    };
  } catch (err) {
    return reply.code(404).send({ error: 'Patient not found' });
  }
});

// Erase all patient data (GDPR Art. 17 — Right to Erasure)
app.delete('/api/gdpr/erase/:patientId', async (request, reply) => {
  const { patientId } = request.params;
  const { confirmPatientId } = request.body || {};

  // Safety: require confirmation
  if (confirmPatientId !== patientId) {
    return reply.code(400).send({ error: 'Confirmation mismatch. Send { confirmPatientId } matching the patient ID.' });
  }

  const deletedSessions = await deletePatientSessions(patientId);
  const deletedCvf = await deletePatientCvfData(patientId);
  await deletePatient(patientId);

  return {
    erased: true,
    gdprArticle: 'Art. 17 — Right to Erasure',
    patientId,
    timestamp: new Date().toISOString(),
    details: {
      patient: 1,
      sessions: deletedSessions,
      cvfFiles: deletedCvf,
      memories: 1,
    },
  };
});

// Erase ALL platform data (nuclear option — superadmin only)
app.delete('/api/gdpr/erase-all', async (request, reply) => {
  const { confirm } = request.body || {};
  if (confirm !== 'DELETE_ALL_DATA') {
    return reply.code(400).send({ error: 'Send { confirm: "DELETE_ALL_DATA" } to proceed.' });
  }

  const fs = await import('fs/promises');
  const path = await import('path');
  const dirs = ['data/patients', 'data/sessions', 'data/cvf', 'data/reports'];
  let totalDeleted = 0;

  for (const dir of dirs) {
    const dirPath = path.default.resolve(dir);
    try {
      const files = await fs.default.readdir(dirPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.default.unlink(path.default.join(dirPath, file));
          totalDeleted++;
        }
      }
    } catch {}
  }

  return {
    erased: true,
    gdprArticle: 'Art. 17 — Full Platform Erasure',
    timestamp: new Date().toISOString(),
    filesDeleted: totalDeleted,
  };
});

// --- Health Check ---
app.get('/health', async () => {
  return { status: 'ok', service: 'memovoice-cvf-engine', version: '0.1.0' };
});

// --- Start Server ---
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`\n  MemoVoice CVF Engine running on http://localhost:${port}`);
    console.log(`  "La voix se souvient de ce que l'esprit oublie."\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
