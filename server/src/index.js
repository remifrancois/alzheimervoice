import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
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

// Security plugins
import authPlugin from './plugins/auth.js';
import auditPlugin from './plugins/audit.js';
import { requireRole, requirePatientAccess, filterPatientsForUser } from './plugins/rbac.js';

const app = Fastify({ logger: true });

// --- Security middleware ---
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
await app.register(cors, {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
});
await app.register(authPlugin);
await app.register(auditPlugin);

// ============================================================
// Patient Routes
// ============================================================

app.get('/api/patients', {
  preHandler: [requireRole('clinician', 'family')],
}, async (request) => {
  const all = await listPatients();
  return filterPatientsForUser(request, all);
});

app.post('/api/patients', {
  preHandler: [requireRole('clinician')],
}, async (request) => {
  const patient = createPatient(request.body);
  await savePatient(patient);
  return patient;
});

app.get('/api/patients/:id', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess('id')],
}, async (request, reply) => {
  try {
    return await loadPatient(request.params.id);
  } catch {
    return reply.code(404).send({ error: 'Patient not found' });
  }
});

// ============================================================
// CVF Routes
// ============================================================

app.post('/api/cvf/process', {
  preHandler: [requireRole('clinician')],
}, async (request, reply) => {
  const { patientId, transcript, language, confounders, durationSeconds } = request.body;
  // Check patient access via body param
  const { patientIds } = request.user;
  if (patientIds && !patientIds.includes(patientId)) {
    return reply.code(403).send({ error: 'Access denied for this patient' });
  }
  return await processConversation({ patientId, transcript, language, confounders, durationSeconds });
});

app.get('/api/cvf/timeline/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request) => {
  return await getPatientTimeline(request.params.patientId);
});

app.post('/api/cvf/weekly-analysis', {
  preHandler: [requireRole('clinician')],
}, async (request, reply) => {
  const { patientId, weekNumber } = request.body;
  const { patientIds } = request.user;
  if (patientIds && !patientIds.includes(patientId)) {
    return reply.code(403).send({ error: 'Access denied for this patient' });
  }
  return await runWeeklyAnalysis(patientId, weekNumber);
});

app.get('/api/cvf/weekly-report/:patientId/:weekNumber', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request, reply) => {
  const { loadWeeklyAnalysis } = await import('./models/cvf.js');
  const data = await loadWeeklyAnalysis(request.params.patientId, parseInt(request.params.weekNumber));
  if (!data) return reply.code(404).send({ error: 'Report not found' });
  return data;
});

// ============================================================
// Memory Routes
// ============================================================

app.get('/api/memories/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request) => {
  return await loadMemoryProfile(request.params.patientId);
});

app.post('/api/memories/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request) => {
  const profile = await loadMemoryProfile(request.params.patientId);
  const memory = createMemory(request.body);
  profile.memories.push(memory);
  await saveMemoryProfile(profile);
  return memory;
});

// ============================================================
// GDPR Routes
// ============================================================

app.get('/api/gdpr/export/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request, reply) => {
  const { patientId } = request.params;
  try {
    const patient = await loadPatient(patientId);
    const sessions = await loadPatientSessions(patientId);
    const memories = await loadMemoryProfile(patientId);
    const cvfData = await exportPatientCvfData(patientId);
    return {
      exportDate: new Date().toISOString(),
      gdprArticle: 'Art. 20 — Right to Data Portability',
      patient, sessions, memories,
      cvfBaseline: cvfData.baseline,
      weeklyReports: cvfData.weeklyReports,
    };
  } catch {
    return reply.code(404).send({ error: 'Patient not found' });
  }
});

app.delete('/api/gdpr/erase/:patientId', {
  preHandler: [requireRole('clinician'), requirePatientAccess()],
}, async (request, reply) => {
  const { patientId } = request.params;
  const { confirmPatientId } = request.body || {};
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
    details: { patient: 1, sessions: deletedSessions, cvfFiles: deletedCvf, memories: 1 },
  };
});

app.delete('/api/gdpr/erase-all', {
  preHandler: [requireRole('superadmin')],
}, async (request, reply) => {
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

// ============================================================
// V2 Routes — 6-Layer Deep Analysis
// ============================================================

app.post('/api/v2/deep-analysis/:patientId', {
  preHandler: [requireRole('clinician'), requirePatientAccess()],
}, async (request, reply) => {
  const { patientId } = request.params;
  const { weekNumber } = request.body;
  if (!weekNumber) return reply.code(400).send({ error: 'weekNumber is required' });
  return await runDeepAnalysis(patientId, weekNumber);
});

app.get('/api/v2/deep-analysis/:patientId/:weekNumber', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request, reply) => {
  const data = await loadHologramAnalysis(request.params.patientId, parseInt(request.params.weekNumber));
  if (!data) return reply.code(404).send({ error: 'Deep analysis not found' });
  return data;
});

app.get('/api/v2/deep-analysis/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request) => {
  return await listHologramAnalyses(request.params.patientId);
});

app.get('/api/v2/differential/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request, reply) => {
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

app.get('/api/v2/semantic-map/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request, reply) => {
  const map = await loadSemanticMap(request.params.patientId);
  if (!map) return reply.code(404).send({ error: 'No semantic map available. Run deep analysis first.' });
  return map;
});

app.get('/api/v2/twin/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request, reply) => {
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

app.get('/api/v2/cohort-match/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request, reply) => {
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

app.post('/api/v2/cohort/generate', {
  preHandler: [requireRole('clinician', 'superadmin')],
}, async () => {
  const cohort = await generateCohort();
  return { status: 'generated', trajectories: cohort.length };
});

app.get('/api/v2/library/status', async (request, reply) => {
  if (!request.user) return reply.code(401).send({ error: 'Authentication required' });
  return await getLibraryStatus();
});

app.get('/api/v2/cost-estimate/:patientId', {
  preHandler: [requireRole('clinician', 'family'), requirePatientAccess()],
}, async (request) => {
  const archive = await buildConversationArchive(request.params.patientId);
  return estimateCost(archive);
});

// ============================================================
// Admin Routes — Enterprise Feature Stubs
// ============================================================

app.get('/api/admin/audit', {
  preHandler: [requireRole('superadmin', 'admin')],
}, async (request) => {
  return {
    entries: [],
    total: 0,
    page: parseInt(request.query.page || '1'),
    pageSize: 50,
    filters: { actor: null, action: null, severity: null },
    message: 'Audit trail stub — connect to immutable log store in production',
  };
});

app.get('/api/admin/organizations', {
  preHandler: [requireRole('superadmin')],
}, async () => {
  return { organizations: [], total: 0, message: 'Organization management stub' };
});

app.get('/api/admin/security/sessions', {
  preHandler: [requireRole('superadmin')],
}, async () => {
  return { activeSessions: [], loginHistory: [], securityScore: null, message: 'Security center stub' };
});

app.get('/api/admin/clinical/assignments', {
  preHandler: [requireRole('superadmin')],
}, async () => {
  return { clinicians: [], assignments: [], qualityMetrics: null, message: 'Clinical governance stub' };
});

app.get('/api/admin/billing/revenue', {
  preHandler: [requireRole('superadmin')],
}, async () => {
  return { mrr: 0, arr: 0, invoices: [], aiCosts: { daily: 0, monthly: 0, byOrg: [] }, message: 'Billing engine stub' };
});

app.get('/api/admin/incidents', {
  preHandler: [requireRole('superadmin', 'admin')],
}, async () => {
  return { incidents: [], activeCount: 0, slaConfig: { red: '1h', orange: '4h', yellow: '24h', system: '30m' }, message: 'Incident management stub' };
});

app.get('/api/admin/compliance', {
  preHandler: [requireRole('superadmin', 'admin')],
}, async () => {
  return { consents: [], agreements: [], gdprArticles: [], message: 'Compliance management stub' };
});

// ============================================================
// Health Check (public)
// ============================================================

app.get('/health', async () => {
  return {
    status: 'ok',
    service: 'memovoice-cvf-engine',
    version: '2.0.0',
    features: {
      v1: ['cvf_extraction', 'baseline_calibration', 'drift_detection', 'weekly_analysis'],
      v2: ['living_library', 'differential_diagnosis', 'cognitive_archaeology', 'cognitive_twin', 'synthetic_cohort', 'temporal_hologram']
    },
    security: ['jwt_auth', 'rbac', 'encryption_at_rest', 'audit_logging', 'rate_limiting', 'helmet']
  };
});

// --- Start Server ---
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`\n  MemoVoice CVF Engine V2 running on http://localhost:${port}`);
    console.log(`  6-Layer Architecture: Library | Differential | Archaeology | Twin | Cohort | Hologram`);
    console.log(`  Security: JWT Auth | RBAC | AES-256-GCM | Audit Log | Rate Limit | Helmet`);
    console.log(`  "La voix se souvient de ce que l'esprit oublie."\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
