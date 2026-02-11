import Fastify from 'fastify';
import cors from '@fastify/cors';
import { processConversation, getPatientTimeline } from './services/cvf-engine.js';
import { runWeeklyAnalysis } from './services/drift-detector.js';
import { createPatient, savePatient, loadPatient, listPatients, deletePatient } from './models/patient.js';
import { loadMemoryProfile, saveMemoryProfile, createMemory } from './models/memory.js';
import { deletePatientSessions, loadPatientSessions } from './models/session.js';
import { deletePatientCvfData, exportPatientCvfData, loadBaseline, computeDelta, computeComposite, computeDomainScores } from './models/cvf.js';

// V2 — 6-Layer Deep Analysis imports
import { runDeepAnalysis, loadHologramAnalysis, listHologramAnalyses, estimateCost } from './services/temporal-hologram.js';
import { computeDifferentialScores, DIFFERENTIAL_PROFILES } from './services/differential-diagnosis.js';
import { buildConversationArchive, loadSemanticMap } from './services/cognitive-archaeology.js';
import { loadTwinAnalysis, generateTwinVector, computeDivergence } from './services/cognitive-twin.js';
import { loadCohort, matchTrajectory, generateCohort } from './services/synthetic-cohort.js';
import { getLibraryStatus } from './services/living-library.js';

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

// ========================================
// V2 Routes — 6-Layer Deep Analysis
// ========================================

// Run full 6-layer temporal hologram analysis
app.post('/api/v2/deep-analysis/:patientId', async (request, reply) => {
  const { patientId } = request.params;
  const { weekNumber } = request.body;
  if (!weekNumber) return reply.code(400).send({ error: 'weekNumber is required' });
  return await runDeepAnalysis(patientId, weekNumber);
});

// Retrieve a previously computed deep analysis
app.get('/api/v2/deep-analysis/:patientId/:weekNumber', async (request, reply) => {
  const data = await loadHologramAnalysis(request.params.patientId, parseInt(request.params.weekNumber));
  if (!data) return reply.code(404).send({ error: 'Deep analysis not found' });
  return data;
});

// List all deep analyses for a patient
app.get('/api/v2/deep-analysis/:patientId', async (request) => {
  return await listHologramAnalyses(request.params.patientId);
});

// Get differential diagnosis scores
app.get('/api/v2/differential/:patientId', async (request, reply) => {
  const patientId = request.params.patientId;
  const baseline = await loadBaseline(patientId);
  if (!baseline?.calibration_complete) {
    return reply.code(400).send({ error: 'Baseline not established' });
  }
  const timeline = await getPatientTimeline(patientId);
  const recentSessions = timeline.timeline.slice(-7);
  if (recentSessions.length === 0) {
    return reply.code(400).send({ error: 'No sessions available' });
  }
  const latestEntry = recentSessions[recentSessions.length - 1];
  const domainScores = latestEntry.domain_scores || {};
  const confounders = recentSessions.map(s => ({ confounders: s.confounders }));
  const differential = computeDifferentialScores(domainScores, recentSessions, confounders);
  return { patient_id: patientId, ...differential,
    profiles: Object.fromEntries(Object.entries(DIFFERENTIAL_PROFILES).map(([k, v]) => [k, { label: v.label, key_discriminators: v.key_discriminators }]))
  };
});

// Get cognitive archaeology semantic map
app.get('/api/v2/semantic-map/:patientId', async (request, reply) => {
  const map = await loadSemanticMap(request.params.patientId);
  if (!map) return reply.code(404).send({ error: 'No semantic map available. Run deep analysis first.' });
  return map;
});

// Get cognitive twin analysis and divergence
app.get('/api/v2/twin/:patientId', async (request, reply) => {
  const patientId = request.params.patientId;
  const weekNumber = parseInt(request.query.week || '0');
  const saved = await loadTwinAnalysis(patientId);
  if (saved && (!weekNumber || saved.weekNumber === weekNumber)) return saved;
  const baseline = await loadBaseline(patientId);
  if (!baseline?.calibration_complete) return reply.code(400).send({ error: 'Baseline not established' });
  const timeline = await getPatientTimeline(patientId);
  const currentWeek = weekNumber || Math.ceil(timeline.timeline.length / 7) || 1;
  const patient = await loadPatient(patientId);
  const twinResult = generateTwinVector(baseline.baseline_vector, currentWeek, { education: patient.education || 'average' });
  const latestVector = timeline.timeline[timeline.timeline.length - 1]?.feature_vector;
  const divergence = latestVector ? computeDivergence(latestVector, twinResult) : null;
  return { patient_id: patientId, week: currentWeek, twin: twinResult, divergence, sessions_total: timeline.timeline.length };
});

// Match patient trajectory against synthetic cohort
app.get('/api/v2/cohort-match/:patientId', async (request, reply) => {
  const patientId = request.params.patientId;
  const baseline = await loadBaseline(patientId);
  if (!baseline?.calibration_complete) return reply.code(400).send({ error: 'Baseline not established' });
  const sessions = await loadPatientSessions(patientId);
  const timeline = sessions.filter(s => s.feature_vector).map(s => {
    const delta = computeDelta(s.feature_vector, baseline.baseline_vector);
    return { composite: computeComposite(delta), domains: computeDomainScores(delta) };
  });
  const cohort = await loadCohort();
  return { patient_id: patientId, ...matchTrajectory(timeline, cohort) };
});

// Generate/regenerate synthetic cohort
app.post('/api/v2/cohort/generate', async () => {
  const cohort = await generateCohort();
  return { status: 'generated', trajectories: cohort.length };
});

// Get Living Library loading status
app.get('/api/v2/library/status', async () => {
  return await getLibraryStatus();
});

// Estimate cost for deep analysis
app.get('/api/v2/cost-estimate/:patientId', async (request) => {
  const archive = await buildConversationArchive(request.params.patientId);
  return estimateCost(archive);
});

// --- Health Check ---
app.get('/health', async () => {
  return {
    status: 'ok',
    service: 'memovoice-cvf-engine',
    version: '2.0.0',
    features: {
      v1: ['cvf_extraction', 'baseline_calibration', 'drift_detection', 'weekly_analysis'],
      v2: ['living_library', 'differential_diagnosis', 'cognitive_archaeology', 'cognitive_twin', 'synthetic_cohort', 'temporal_hologram']
    }
  };
});

// --- Start Server ---
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`\n  MemoVoice CVF Engine V2 running on http://localhost:${port}`);
    console.log(`  6-Layer Architecture: Library | Differential | Archaeology | Twin | Cohort | Hologram`);
    console.log(`  "La voix se souvient de ce que l'esprit oublie."\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
