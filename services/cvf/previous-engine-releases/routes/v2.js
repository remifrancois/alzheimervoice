/**
 * V2 CVF Routes — 6-Layer Deep Analysis
 *
 * Prefix: /cvf/v2
 */

import { runDeepAnalysis, loadHologramAnalysis, listHologramAnalyses, estimateCost } from '../engine/v2/temporal-hologram.js';
import { computeDifferentialScores, DIFFERENTIAL_PROFILES } from '../engine/v2/differential-diagnosis.js';
import { buildConversationArchive, loadSemanticMap } from '../engine/v2/cognitive-archaeology.js';
import { loadTwinAnalysis, generateTwinVector, computeDivergence } from '../engine/v2/cognitive-twin.js';
import { loadCohort, matchTrajectory, generateCohort } from '../engine/v2/synthetic-cohort.js';
import { getLibraryStatus } from '../engine/v2/living-library.js';
import { getPatientTimeline } from '../engine/v1/cvf-engine.js';
import { loadPatient } from '@azh/shared-models/patient';
import { loadPatientSessions } from '@azh/shared-models/session';
import { loadBaseline, computeDelta, computeComposite, computeDomainScores } from '@azh/shared-models/cvf';

export default async function v2Routes(app) {

  // POST /cvf/v2/deep-analysis/:patientId
  app.post('/deep-analysis/:patientId', async (request, reply) => {
    const { patientId } = request.params;
    const { weekNumber } = request.body;
    if (!weekNumber) return reply.code(400).send({ error: 'weekNumber is required' });
    return await runDeepAnalysis(patientId, weekNumber);
  });

  // GET /cvf/v2/deep-analysis/:patientId/:weekNumber
  app.get('/deep-analysis/:patientId/:weekNumber', async (request, reply) => {
    const data = await loadHologramAnalysis(request.params.patientId, parseInt(request.params.weekNumber));
    if (!data) return reply.code(404).send({ error: 'Deep analysis not found' });
    return data;
  });

  // GET /cvf/v2/deep-analysis/:patientId — List all analyses
  app.get('/deep-analysis/:patientId', async (request) => {
    return await listHologramAnalyses(request.params.patientId);
  });

  // GET /cvf/v2/differential/:patientId
  app.get('/differential/:patientId', async (request, reply) => {
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

  // GET /cvf/v2/semantic-map/:patientId
  app.get('/semantic-map/:patientId', async (request, reply) => {
    const map = await loadSemanticMap(request.params.patientId);
    if (!map) return reply.code(404).send({ error: 'No semantic map available. Run deep analysis first.' });
    return map;
  });

  // GET /cvf/v2/twin/:patientId
  app.get('/twin/:patientId', async (request, reply) => {
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

  // GET /cvf/v2/cohort-match/:patientId
  app.get('/cohort-match/:patientId', async (request, reply) => {
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

  // POST /cvf/v2/cohort/generate
  app.post('/cohort/generate', async () => {
    const cohort = await generateCohort();
    return { status: 'generated', trajectories: cohort.length };
  });

  // GET /cvf/v2/library/status
  app.get('/library/status', async () => {
    return await getLibraryStatus();
  });

  // GET /cvf/v2/cost-estimate/:patientId
  app.get('/cost-estimate/:patientId', async (request) => {
    const archive = await buildConversationArchive(request.params.patientId);
    return estimateCost(archive);
  });
}
