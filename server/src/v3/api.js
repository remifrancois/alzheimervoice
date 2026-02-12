/**
 * V3 API ROUTES — Fastify Plugin
 *
 * RESTful API for the V3 CVF Engine.
 * Designed for platform consumption — external clients call these endpoints.
 *
 * Architecture:
 *   POST /api/v3/process    — Daily: Sonnet extraction + algorithmic scoring
 *   POST /api/v3/weekly     — Weekly: Opus deep analysis on 7 days of data
 *   GET  /api/v3/drift/:id  — Get latest drift score for a patient
 *   GET  /api/v3/timeline   — Full timeline with V3 scores
 *   GET  /api/v3/differential — Differential diagnosis
 *   GET  /api/v3/trajectory — 12-week prediction
 *   GET  /api/v3/report     — Weekly report (family + medical)
 *   GET  /api/v3/indicators — Indicator catalog (for UI rendering)
 *   GET  /api/v3/meta       — Engine metadata
 */

import {
  computeV3Baseline, analyzeSession, analyzeWeek,
  computeZScores, computeDomainScores, computeComposite, getAlertLevel, detectCascade,
  ALERT_THRESHOLDS,
} from './algorithm.js';
import { runDifferential } from './differential.js';
import { predictTrajectory } from './trajectory.js';
import { extractFeatures, extractEarlyDetection } from './feature-extractor.js';
import { runWeeklyDeepAnalysis, loadWeeklyReport, listWeeklyReports } from './weekly-deep.js';
import { INDICATORS, ALL_INDICATOR_IDS, INDICATOR_COUNT, DOMAINS, DOMAIN_WEIGHTS, V3_META } from './index.js';
import { loadPatient, savePatient } from '../models/patient.js';
import { createSession, saveSession, loadPatientSessions } from '../models/session.js';
import { loadBaseline, saveBaseline, createBaseline } from '../models/cvf.js';

import fs from 'fs/promises';
import path from 'path';

const V3_BASELINE_DIR = path.resolve('data/v3-baselines');

/**
 * Register V3 API routes as a Fastify plugin.
 */
export default async function v3ApiPlugin(app) {

  // ════════════════════════════════════════════════
  // POST /api/v3/process — Daily session processing
  // Sonnet extraction + V3 algorithmic scoring
  // ════════════════════════════════════════════════
  app.post('/api/v3/process', {
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

    // Extract features (Sonnet)
    console.log(`[V3] Extracting ${mode === 'early_detection' ? '15' : '47'} features for ${patient.first_name}...`);
    const vector = mode === 'early_detection'
      ? await extractEarlyDetection(transcript, { language: language || patient.language })
      : await extractFeatures(transcript, { language: language || patient.language });

    // Save session
    const session = createSession({ patientId, language: language || patient.language, transcript, durationSeconds, confounders });
    session.feature_vector = vector;
    session.extraction_model = mode === 'early_detection' ? 'sonnet-early' : 'sonnet-full';
    session.v3 = true;
    session.extracted_at = new Date().toISOString();
    await saveSession(session);

    // Load or build baseline
    let baseline = await loadV3Baseline(patientId);
    const allSessions = await loadPatientSessions(patientId);
    const v3Sessions = allSessions.filter(s => s.feature_vector);

    if (!baseline?.complete) {
      // Still calibrating
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

    // Run V3 analysis
    const result = analyzeSession(vector, baseline.vector, confounders || {});

    // Update patient alert level
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

  // ════════════════════════════════════════════════
  // POST /api/v3/weekly — Weekly Opus deep analysis
  // ════════════════════════════════════════════════
  app.post('/api/v3/weekly', {
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

  // ════════════════════════════════════════════════
  // GET /api/v3/drift/:patientId — Latest drift score
  // ════════════════════════════════════════════════
  app.get('/api/v3/drift/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const baseline = await loadV3Baseline(patientId);
    if (!baseline?.complete) return reply.code(400).send({ error: 'Baseline not established' });

    const sessions = await loadPatientSessions(patientId);
    const latest = sessions.filter(s => s.feature_vector).pop();
    if (!latest) return reply.code(400).send({ error: 'No sessions' });

    const result = analyzeSession(latest.feature_vector, baseline.vector, latest.confounders || {});

    return {
      patient_id: patientId,
      session_id: latest.session_id,
      timestamp: latest.timestamp,
      ...result,
    };
  });

  // ════════════════════════════════════════════════
  // GET /api/v3/timeline/:patientId — Full V3 timeline
  // ════════════════════════════════════════════════
  app.get('/api/v3/timeline/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const patient = await loadPatient(patientId).catch(() => null);
    if (!patient) return reply.code(404).send({ error: 'Patient not found' });

    const baseline = await loadV3Baseline(patientId);
    const sessions = await loadPatientSessions(patientId);

    const timeline = sessions.filter(s => s.feature_vector).map(session => {
      const entry = {
        session_id: session.session_id,
        timestamp: session.timestamp,
        confounders: session.confounders,
      };

      if (baseline?.complete) {
        const result = analyzeSession(session.feature_vector, baseline.vector, session.confounders || {});
        entry.composite = result.composite;
        entry.alert_level = result.alert_level;
        entry.domain_scores = result.domain_scores;
        entry.sentinel_alerts = result.sentinel_alerts;
      }

      return entry;
    });

    return {
      version: 'v3',
      patient,
      baseline_established: baseline?.complete || false,
      sessions_count: sessions.length,
      indicator_count: INDICATOR_COUNT,
      timeline,
    };
  });

  // ════════════════════════════════════════════════
  // GET /api/v3/differential/:patientId — Differential diagnosis
  // ════════════════════════════════════════════════
  app.get('/api/v3/differential/:patientId', {
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

    // Build timeline for temporal pattern detection
    const timeline = sessions.filter(s => s.feature_vector).map(s => {
      const r = analyzeSession(s.feature_vector, baseline.vector, s.confounders || {});
      return { composite: r.composite };
    });
    const confounders = recentSessions.map(s => ({ confounders: s.confounders || {} }));

    const differential = runDifferential(result.domain_scores, result.z_scores, { timeline, confounders });

    return {
      version: 'v3',
      patient_id: patientId,
      ...differential,
    };
  });

  // ════════════════════════════════════════════════
  // GET /api/v3/trajectory/:patientId — 12-week prediction
  // ════════════════════════════════════════════════
  app.get('/api/v3/trajectory/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const weeklyHistory = await listWeeklyReports(patientId);

    if (weeklyHistory.length < 3) {
      return reply.code(400).send({ error: 'Need at least 3 weekly reports for trajectory prediction' });
    }

    const latestDiff = weeklyHistory[weeklyHistory.length - 1]?.differential?.algorithmic;
    const latestCascade = weeklyHistory[weeklyHistory.length - 1]?.cascade;

    const trajectory = predictTrajectory(weeklyHistory, latestDiff, latestCascade);

    return {
      version: 'v3',
      patient_id: patientId,
      ...trajectory,
    };
  });

  // ════════════════════════════════════════════════
  // GET /api/v3/report/:patientId/:weekNumber — Weekly report
  // ════════════════════════════════════════════════
  app.get('/api/v3/report/:patientId/:weekNumber', {
    schema: {
      params: {
        type: 'object',
        properties: {
          patientId: { type: 'string' },
          weekNumber: { type: 'string' },
        }
      }
    }
  }, async (request, reply) => {
    const report = await loadWeeklyReport(
      request.params.patientId,
      parseInt(request.params.weekNumber)
    );
    if (!report) return reply.code(404).send({ error: 'Report not found' });
    return report;
  });

  // ════════════════════════════════════════════════
  // GET /api/v3/reports/:patientId — All weekly reports
  // ════════════════════════════════════════════════
  app.get('/api/v3/reports/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    return await listWeeklyReports(request.params.patientId);
  });

  // ════════════════════════════════════════════════
  // GET /api/v3/indicators — Full indicator catalog
  // For platform UI to render domain breakdowns
  // ════════════════════════════════════════════════
  app.get('/api/v3/indicators', async () => {
    return {
      version: 'v3',
      count: INDICATOR_COUNT,
      domains: Object.fromEntries(
        Object.entries(DOMAINS).map(([domain, ids]) => [
          domain,
          {
            weight: DOMAIN_WEIGHTS[domain],
            indicators: ids.map(id => ({
              id,
              name: INDICATORS[id].name,
              domain: INDICATORS[id].domain,
              extractable: INDICATORS[id].extractable,
              evidence: INDICATORS[id].evidence,
              early_detection: INDICATORS[id].early_detection || {},
            }))
          }
        ])
      ),
    };
  });

  // ════════════════════════════════════════════════
  // GET /api/v3/baseline/:patientId — Baseline status
  // ════════════════════════════════════════════════
  app.get('/api/v3/baseline/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const baseline = await loadV3Baseline(request.params.patientId);
    if (!baseline) return { status: 'not_started', sessions: 0, target: 14 };
    return {
      status: baseline.complete ? 'established' : 'calibrating',
      sessions: baseline.sessions,
      target: 14,
      high_variance: baseline.high_variance || [],
    };
  });

  // ════════════════════════════════════════════════
  // GET /api/v3/meta — Engine metadata
  // ════════════════════════════════════════════════
  app.get('/api/v3/meta', async () => {
    return {
      ...V3_META,
      alert_thresholds: ALERT_THRESHOLDS,
      domains: Object.fromEntries(
        Object.entries(DOMAIN_WEIGHTS).map(([d, w]) => [d, { weight: w, indicator_count: DOMAINS[d]?.length || 0 }])
      ),
      endpoints: {
        daily_process: 'POST /api/v3/process',
        weekly_analysis: 'POST /api/v3/weekly',
        drift_score: 'GET /api/v3/drift/:patientId',
        timeline: 'GET /api/v3/timeline/:patientId',
        differential: 'GET /api/v3/differential/:patientId',
        trajectory: 'GET /api/v3/trajectory/:patientId',
        report: 'GET /api/v3/report/:patientId/:weekNumber',
        reports: 'GET /api/v3/reports/:patientId',
        indicators: 'GET /api/v3/indicators',
        baseline: 'GET /api/v3/baseline/:patientId',
        meta: 'GET /api/v3/meta',
      }
    };
  });
}

// ════════════════════════════════════════════════
// V3 BASELINE PERSISTENCE
// ════════════════════════════════════════════════

async function loadV3Baseline(patientId) {
  const filePath = path.join(V3_BASELINE_DIR, `v3_baseline_${patientId}.json`);
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function saveV3Baseline(patientId, baseline) {
  await fs.mkdir(V3_BASELINE_DIR, { recursive: true });
  const filePath = path.join(V3_BASELINE_DIR, `v3_baseline_${patientId}.json`);
  await fs.writeFile(filePath, JSON.stringify({
    patient_id: patientId,
    created_at: new Date().toISOString(),
    ...baseline,
  }, null, 2));
}
