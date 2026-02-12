/**
 * V3 CVF Routes — Internal CVF Service
 *
 * Prefix: /cvf/v3
 * Called only by the API gateway (services/api) via service-to-service auth.
 */

import {
  computeV3Baseline, analyzeSession, analyzeWeek,
  computeZScores, computeDomainScores, computeComposite, getAlertLevel, detectCascade,
  ALERT_THRESHOLDS,
} from '../engine/v3/algorithm.js';
import { runDifferential } from '../engine/v3/differential.js';
import { predictTrajectory } from '../engine/v3/trajectory.js';
import { extractFeatures, extractEarlyDetection } from '../engine/v3/feature-extractor.js';
import { runWeeklyDeepAnalysis, loadWeeklyReport, listWeeklyReports } from '../engine/v3/weekly-deep.js';
import { INDICATORS, ALL_INDICATOR_IDS, INDICATOR_COUNT, DOMAINS, DOMAIN_WEIGHTS, V3_META } from '../engine/v3/index.js';
import { loadPatient, savePatient } from '@azh/shared-models/patient';
import { createSession, saveSession, loadPatientSessions } from '@azh/shared-models/session';
import { loadBaseline, saveBaseline, createBaseline, loadV3Baseline, saveV3Baseline } from '@azh/shared-models/cvf';

export default async function v3Routes(app) {

  // POST /cvf/v3/process — Daily session processing
  app.post('/process', {
    schema: {
      body: {
        type: 'object',
        required: ['patientId', 'transcript'],
        properties: {
          patientId: { type: 'string' },
          transcript: { type: 'array' },
          language: { type: 'string' },
          confounders: { type: 'object' },
          durationSeconds: { type: 'number' },
          mode: { type: 'string', enum: ['full', 'early_detection'], default: 'full' },
        }
      }
    }
  }, async (request, reply) => {
    const { patientId, transcript, language, confounders, durationSeconds, mode } = request.body;

    const patient = await loadPatient(patientId).catch(() => null);
    if (!patient) return reply.code(404).send({ error: 'Patient not found' });

    console.log(`[V3] Extracting ${mode === 'early_detection' ? '15' : '47'} features for ${patient.first_name}...`);
    const vector = mode === 'early_detection'
      ? await extractEarlyDetection(transcript, { language: language || patient.language })
      : await extractFeatures(transcript, { language: language || patient.language });

    const session = createSession({ patientId, language: language || patient.language, transcript, durationSeconds, confounders });
    session.feature_vector = vector;
    session.extraction_model = mode === 'early_detection' ? 'sonnet-early' : 'sonnet-full';
    session.v3 = true;
    session.extracted_at = new Date().toISOString();
    await saveSession(session);

    let baseline = await loadV3Baseline(patientId);
    const allSessions = await loadPatientSessions(patientId);
    const v3Sessions = allSessions.filter(s => s.feature_vector);

    if (!baseline?.complete) {
      const baselineResult = computeV3Baseline(v3Sessions.map(s => s.feature_vector));
      if (baselineResult.complete) {
        baseline = baselineResult;
        await saveV3Baseline(patientId, baseline);
        patient.baseline_established = true;
        patient.baseline_sessions = baselineResult.sessions;
        await savePatient(patient);
        console.log(`[V3] Baseline established for ${patient.first_name} (${baselineResult.sessions} sessions)`);
      }
      return {
        status: 'calibrating',
        version: 'v3',
        session_id: session.session_id,
        sessions_complete: v3Sessions.length,
        sessions_target: 14,
        phase: v3Sessions.length <= 3 ? 'rapport_building' : v3Sessions.length <= 7 ? 'deep_calibration' : 'consolidation',
      };
    }

    const result = analyzeSession(vector, baseline.vector, confounders || {});

    const alertSeverity = { green: 0, yellow: 1, orange: 2, red: 3 };
    if (alertSeverity[result.alert_level] > alertSeverity[patient.alert_level || 'green']) {
      patient.alert_level = result.alert_level;
      await savePatient(patient);
    }

    return {
      status: 'analyzed',
      version: 'v3',
      session_id: session.session_id,
      extraction_mode: mode,
      ...result,
    };
  });

  // POST /cvf/v3/weekly — Weekly Opus deep analysis
  app.post('/weekly', {
    schema: {
      body: {
        type: 'object',
        required: ['patientId', 'weekNumber'],
        properties: {
          patientId: { type: 'string' },
          weekNumber: { type: 'number' },
        }
      }
    }
  }, async (request, reply) => {
    const { patientId, weekNumber } = request.body;

    const patient = await loadPatient(patientId).catch(() => null);
    if (!patient) return reply.code(404).send({ error: 'Patient not found' });

    const baseline = await loadV3Baseline(patientId);
    if (!baseline?.complete) return reply.code(400).send({ error: 'Baseline not established' });

    const allSessions = await loadPatientSessions(patientId);
    const recentSessions = allSessions.filter(s => s.feature_vector).slice(-7);
    if (recentSessions.length === 0) return reply.code(400).send({ error: 'No sessions available' });

    const weeklyHistory = await listWeeklyReports(patientId);

    const report = await runWeeklyDeepAnalysis({
      patient, baseline, sessions: recentSessions, weeklyHistory, weekNumber
    });

    return report;
  });

  // GET /cvf/v3/drift/:patientId
  app.get('/drift/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const baseline = await loadV3Baseline(patientId);
    if (!baseline?.complete) return reply.code(400).send({ error: 'Baseline not established' });

    const sessions = await loadPatientSessions(patientId);
    const latest = sessions.filter(s => s.feature_vector).pop();
    if (!latest) return reply.code(400).send({ error: 'No sessions' });

    const result = analyzeSession(latest.feature_vector, baseline.vector, latest.confounders || {});

    return { patient_id: patientId, session_id: latest.session_id, timestamp: latest.timestamp, ...result };
  });

  // GET /cvf/v3/timeline/:patientId
  app.get('/timeline/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const patient = await loadPatient(patientId).catch(() => null);
    if (!patient) return reply.code(404).send({ error: 'Patient not found' });

    const baseline = await loadV3Baseline(patientId);
    const sessions = await loadPatientSessions(patientId);

    const timeline = sessions.filter(s => s.feature_vector).map(session => {
      const entry = { session_id: session.session_id, timestamp: session.timestamp, confounders: session.confounders };
      if (baseline?.complete) {
        const result = analyzeSession(session.feature_vector, baseline.vector, session.confounders || {});
        entry.composite = result.composite;
        entry.alert_level = result.alert_level;
        entry.domain_scores = result.domain_scores;
        entry.sentinel_alerts = result.sentinel_alerts;
      }
      return entry;
    });

    return { version: 'v3', patient, baseline_established: baseline?.complete || false, sessions_count: sessions.length, indicator_count: INDICATOR_COUNT, timeline };
  });

  // GET /cvf/v3/differential/:patientId
  app.get('/differential/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const baseline = await loadV3Baseline(patientId);
    if (!baseline?.complete) return reply.code(400).send({ error: 'Baseline not established' });

    const sessions = await loadPatientSessions(patientId);
    const recentSessions = sessions.filter(s => s.feature_vector).slice(-7);
    if (recentSessions.length === 0) return reply.code(400).send({ error: 'No sessions' });

    const latest = recentSessions[recentSessions.length - 1];
    const result = analyzeSession(latest.feature_vector, baseline.vector, latest.confounders || {});

    const timeline = sessions.filter(s => s.feature_vector).map(s => {
      const r = analyzeSession(s.feature_vector, baseline.vector, s.confounders || {});
      return { composite: r.composite };
    });
    const confounders = recentSessions.map(s => ({ confounders: s.confounders || {} }));

    const differential = runDifferential(result.domain_scores, result.z_scores, { timeline, confounders });

    return { version: 'v3', patient_id: patientId, ...differential };
  });

  // GET /cvf/v3/trajectory/:patientId
  app.get('/trajectory/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const weeklyHistory = await listWeeklyReports(patientId);
    if (weeklyHistory.length < 3) return reply.code(400).send({ error: 'Need at least 3 weekly reports for trajectory prediction' });

    const latestDiff = weeklyHistory[weeklyHistory.length - 1]?.differential?.algorithmic;
    const latestCascade = weeklyHistory[weeklyHistory.length - 1]?.cascade;

    const trajectory = predictTrajectory(weeklyHistory, latestDiff, latestCascade);

    return { version: 'v3', patient_id: patientId, ...trajectory };
  });

  // GET /cvf/v3/report/:patientId/:weekNumber
  app.get('/report/:patientId/:weekNumber', async (request, reply) => {
    const report = await loadWeeklyReport(request.params.patientId, parseInt(request.params.weekNumber));
    if (!report) return reply.code(404).send({ error: 'Report not found' });
    return report;
  });

  // GET /cvf/v3/reports/:patientId
  app.get('/reports/:patientId', async (request) => {
    return await listWeeklyReports(request.params.patientId);
  });

  // GET /cvf/v3/indicators
  app.get('/indicators', async () => {
    return {
      version: 'v3',
      count: INDICATOR_COUNT,
      domains: Object.fromEntries(
        Object.entries(DOMAINS).map(([domain, ids]) => [
          domain,
          {
            weight: DOMAIN_WEIGHTS[domain],
            indicators: ids.map(id => ({
              id, name: INDICATORS[id].name, domain: INDICATORS[id].domain,
              extractable: INDICATORS[id].extractable, evidence: INDICATORS[id].evidence,
              early_detection: INDICATORS[id].early_detection || {},
            }))
          }
        ])
      ),
    };
  });

  // GET /cvf/v3/baseline/:patientId
  app.get('/baseline/:patientId', async (request) => {
    const baseline = await loadV3Baseline(request.params.patientId);
    if (!baseline) return { status: 'not_started', sessions: 0, target: 14 };
    return { status: baseline.complete ? 'established' : 'calibrating', sessions: baseline.sessions, target: 14, high_variance: baseline.high_variance || [] };
  });

  // GET /cvf/v3/meta
  app.get('/meta', async () => {
    return {
      ...V3_META,
      alert_thresholds: ALERT_THRESHOLDS,
      domains: Object.fromEntries(
        Object.entries(DOMAIN_WEIGHTS).map(([d, w]) => [d, { weight: w, indicator_count: DOMAINS[d]?.length || 0 }])
      ),
    };
  });
}
