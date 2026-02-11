import Fastify from 'fastify';
import cors from '@fastify/cors';
import { processConversation, getPatientTimeline } from './services/cvf-engine.js';
import { runWeeklyAnalysis } from './services/drift-detector.js';
import { createPatient, savePatient, loadPatient, listPatients } from './models/patient.js';
import { loadMemoryProfile, saveMemoryProfile, createMemory } from './models/memory.js';

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
