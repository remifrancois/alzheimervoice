/**
 * V4 CVF API — Fastify Plugin
 *
 * 14 endpoints for the V4 two-stream engine.
 * Prefix: /cvf/v4
 *
 * New in V4:
 *   - POST /process accepts optional audioBase64 for parallel text+audio extraction
 *   - POST /process-audio for audio-only micro-task processing
 *   - GET /pd/:patientId for PD-specific analysis
 *   - GET /micro-tasks/:patientId for scheduled micro-task recommendations
 *   - 85 indicators, 9 domains, 8-condition differential, 23 rules
 */

import {
  computeV4Baseline,
  analyzeSession,
  analyzeWeek,
  computeZScores,
  computeDomainScores,
  computeComposite,
  getAlertLevel,
  detectCascade,
  checkSentinels,
  computeDeclineProfile,
  ALERT_THRESHOLDS,
  runDifferential,
  predictTrajectory,
  extractV4Features,
  extractV4EarlyDetection,
  extractAcousticFeatures,
  extractMicroTaskAudio,
  convertToWav,
  cleanupAudioTemp,
  runPDAnalysis,
  MICRO_TASKS,
  getScheduledTasks,
  scoreMicroTask,
  runWeeklyDeepAnalysis,
  loadWeeklyReport,
  listWeeklyReports,
  INDICATORS,
  ALL_INDICATOR_IDS,
  INDICATOR_COUNT,
  DOMAINS,
  DOMAIN_WEIGHTS,
  AUDIO_INDICATORS,
  SENTINELS,
  V4_META,
} from './index.js';

// ════════════════════════════════════════════════
// IN-MEMORY STORAGE (demo purposes)
// ════════════════════════════════════════════════

const patients = new Map();
const sessions = new Map();    // patientId -> [session, ...]
const baselines = new Map();   // patientId -> baseline

function getPatient(patientId) { return patients.get(patientId) || null; }
function savePatientLocal(patient) { patients.set(patient.patient_id, patient); }

function getPatientSessions(patientId) { return sessions.get(patientId) || []; }
function pushSession(patientId, session) {
  if (!sessions.has(patientId)) sessions.set(patientId, []);
  sessions.get(patientId).push(session);
}

function getBaseline(patientId) { return baselines.get(patientId) || null; }
function saveBaselineLocal(patientId, baseline) { baselines.set(patientId, baseline); }

// ════════════════════════════════════════════════
// PLUGIN
// ════════════════════════════════════════════════

export default async function v4Routes(app) {

  // ────────────────────────────────────────────
  // 1. POST /process — Daily session (text + optional audio)
  // ────────────────────────────────────────────
  app.post('/process', {
    schema: {
      body: {
        type: 'object',
        required: ['patientId', 'transcript'],
        properties: {
          patientId: { type: 'string' },
          transcript: { type: 'array' },
          audioBase64: { type: 'string' },
          audioFormat: { type: 'string', default: 'wav' },
          language: { type: 'string', default: 'fr' },
          confounders: { type: 'object' },
          durationSeconds: { type: 'number' },
          mode: { type: 'string', enum: ['full', 'early_detection'], default: 'full' },
        }
      }
    }
  }, async (request, reply) => {
    const { patientId, transcript, audioBase64, audioFormat, language, confounders, durationSeconds, mode } = request.body;

    let patient = getPatient(patientId);
    if (!patient) {
      // Auto-create patient for demo
      patient = { patient_id: patientId, first_name: patientId, language: language || 'fr', alert_level: 'green' };
      savePatientLocal(patient);
    }

    console.log(`[V4] Processing session for ${patient.first_name} (mode=${mode}, audio=${audioBase64 ? 'yes' : 'no'})...`);

    // Run text extraction and audio pipeline in parallel
    const textPromise = mode === 'early_detection'
      ? extractV4EarlyDetection(transcript, { language: language || patient.language })
      : extractV4Features(transcript, { language: language || patient.language });

    let audioPromise = null;
    let audioTempFiles = [];
    if (audioBase64) {
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      audioPromise = extractAcousticFeatures(audioBuffer, {
        format: audioFormat || 'wav',
        gender: patient.gender || 'unknown',
      }).catch(err => {
        console.error('[V4] Audio extraction failed, continuing with text only:', err.message);
        return {};
      });
    }

    const [textVector, audioVector] = await Promise.all([
      textPromise,
      audioPromise || Promise.resolve({}),
    ]);

    // Merge text + audio vectors
    const mergedVector = { ...textVector };
    if (audioVector && typeof audioVector === 'object') {
      for (const [key, value] of Object.entries(audioVector)) {
        if (value !== null && value !== undefined) {
          mergedVector[key] = value;
        }
      }
    }

    // Create session record
    const session = {
      session_id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      patient_id: patientId,
      language: language || patient.language,
      timestamp: new Date().toISOString(),
      duration_seconds: durationSeconds,
      confounders: confounders || {},
      feature_vector: mergedVector,
      extraction_model: mode === 'early_detection' ? 'sonnet-early-v4' : 'sonnet-full-v4',
      has_audio: !!audioBase64,
      v4: true,
    };
    pushSession(patientId, session);

    // Check/compute baseline
    let baseline = getBaseline(patientId);
    const allSessions = getPatientSessions(patientId);
    const v4Sessions = allSessions.filter(s => s.feature_vector);

    if (!baseline?.complete) {
      const baselineResult = computeV4Baseline(v4Sessions.map(s => s.feature_vector));
      if (baselineResult.complete) {
        baseline = baselineResult;
        saveBaselineLocal(patientId, baseline);
        patient.baseline_established = true;
        patient.baseline_sessions = baselineResult.sessions;
        savePatientLocal(patient);
        console.log(`[V4] Baseline established for ${patient.first_name} (${baselineResult.sessions} sessions)`);
      }
      return {
        status: 'calibrating',
        version: 'v4',
        session_id: session.session_id,
        has_audio: session.has_audio,
        sessions_complete: v4Sessions.length,
        sessions_target: 14,
        phase: v4Sessions.length <= 3 ? 'rapport_building' : v4Sessions.length <= 7 ? 'deep_calibration' : 'consolidation',
      };
    }

    // Analyze session against baseline
    const history = v4Sessions.slice(-14).map(s => ({
      domain_scores: s._cached_domain_scores || {},
      composite: s._cached_composite,
    }));
    const result = analyzeSession(mergedVector, baseline.vector, confounders || {}, history);

    // Cache for history building
    session._cached_domain_scores = result.domain_scores;
    session._cached_composite = result.composite;

    // Update alert level
    const alertSeverity = { green: 0, yellow: 1, orange: 2, red: 3 };
    if (alertSeverity[result.alert_level] > alertSeverity[patient.alert_level || 'green']) {
      patient.alert_level = result.alert_level;
      savePatientLocal(patient);
    }

    return {
      status: 'analyzed',
      version: 'v4',
      session_id: session.session_id,
      extraction_mode: mode,
      has_audio: session.has_audio,
      audio_indicators_extracted: audioBase64 ? Object.keys(audioVector || {}).length : 0,
      ...result,
    };
  });

  // ────────────────────────────────────────────
  // 2. POST /process-audio — Audio-only micro-task processing
  // ────────────────────────────────────────────
  app.post('/process-audio', {
    schema: {
      body: {
        type: 'object',
        required: ['patientId', 'audioBase64', 'taskType'],
        properties: {
          patientId: { type: 'string' },
          audioBase64: { type: 'string' },
          audioFormat: { type: 'string', default: 'wav' },
          taskType: { type: 'string', enum: ['sustained_vowel', 'ddk', 'category_fluency', 'depression_screen'] },
          language: { type: 'string', default: 'fr' },
        }
      }
    }
  }, async (request, reply) => {
    const { patientId, audioBase64, audioFormat, taskType, language } = request.body;

    const patient = getPatient(patientId);
    if (!patient) return reply.code(404).send({ error: 'Patient not found' });

    console.log(`[V4] Processing ${taskType} micro-task audio for ${patient.first_name}...`);

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const features = await extractMicroTaskAudio(audioBuffer, taskType, {
      format: audioFormat || 'wav',
      gender: patient.gender || 'unknown',
    });

    const taskResult = scoreMicroTask(taskType, features);

    return {
      version: 'v4',
      patient_id: patientId,
      task_type: taskType,
      timestamp: new Date().toISOString(),
      features,
      score: taskResult,
    };
  });

  // ────────────────────────────────────────────
  // 3. POST /weekly — Weekly Opus deep analysis
  // ────────────────────────────────────────────
  app.post('/weekly', {
    schema: {
      body: {
        type: 'object',
        required: ['patientId', 'weekNumber'],
        properties: {
          patientId: { type: 'string' },
          weekNumber: { type: 'number' },
          microTaskResults: { type: 'object' },
        }
      }
    }
  }, async (request, reply) => {
    const { patientId, weekNumber, microTaskResults } = request.body;

    const patient = getPatient(patientId);
    if (!patient) return reply.code(404).send({ error: 'Patient not found' });

    const baseline = getBaseline(patientId);
    if (!baseline?.complete) return reply.code(400).send({ error: 'Baseline not established' });

    const allSessions = getPatientSessions(patientId);
    const recentSessions = allSessions.filter(s => s.feature_vector).slice(-7);
    if (recentSessions.length === 0) return reply.code(400).send({ error: 'No sessions available' });

    const weeklyHistory = await listWeeklyReports(patientId);

    const report = await runWeeklyDeepAnalysis({
      patient, baseline, sessions: recentSessions, weeklyHistory, weekNumber, microTaskResults,
    });

    return report;
  });

  // ────────────────────────────────────────────
  // 4. GET /drift/:patientId — Latest drift
  // ────────────────────────────────────────────
  app.get('/drift/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const baseline = getBaseline(patientId);
    if (!baseline?.complete) return reply.code(400).send({ error: 'Baseline not established' });

    const allSessions = getPatientSessions(patientId);
    const latest = allSessions.filter(s => s.feature_vector).pop();
    if (!latest) return reply.code(400).send({ error: 'No sessions' });

    const result = analyzeSession(latest.feature_vector, baseline.vector, latest.confounders || {});

    return { version: 'v4', patient_id: patientId, session_id: latest.session_id, timestamp: latest.timestamp, has_audio: latest.has_audio, ...result };
  });

  // ────────────────────────────────────────────
  // 5. GET /timeline/:patientId — Full timeline
  // ────────────────────────────────────────────
  app.get('/timeline/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const patient = getPatient(patientId);
    if (!patient) return reply.code(404).send({ error: 'Patient not found' });

    const baseline = getBaseline(patientId);
    const allSessions = getPatientSessions(patientId);

    const timeline = allSessions.filter(s => s.feature_vector).map(session => {
      const entry = {
        session_id: session.session_id,
        timestamp: session.timestamp,
        confounders: session.confounders,
        has_audio: session.has_audio || false,
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
      version: 'v4',
      patient,
      baseline_established: baseline?.complete || false,
      sessions_count: allSessions.length,
      indicator_count: INDICATOR_COUNT,
      domains: Object.keys(DOMAINS).length,
      timeline,
    };
  });

  // ────────────────────────────────────────────
  // 6. GET /differential/:patientId — 8-condition differential
  // ────────────────────────────────────────────
  app.get('/differential/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const baseline = getBaseline(patientId);
    if (!baseline?.complete) return reply.code(400).send({ error: 'Baseline not established' });

    const allSessions = getPatientSessions(patientId);
    const recentSessions = allSessions.filter(s => s.feature_vector).slice(-7);
    if (recentSessions.length === 0) return reply.code(400).send({ error: 'No sessions' });

    const latest = recentSessions[recentSessions.length - 1];
    const result = analyzeSession(latest.feature_vector, baseline.vector, latest.confounders || {});

    const timeline = allSessions.filter(s => s.feature_vector).map(s => {
      const r = analyzeSession(s.feature_vector, baseline.vector, s.confounders || {});
      return { composite: r.composite };
    });
    const confounders = recentSessions.map(s => ({ confounders: s.confounders || {} }));

    const differential = runDifferential(result.domain_scores, result.z_scores, { timeline, confounders, sessionCount: recentSessions.length });

    return { version: 'v4', patient_id: patientId, conditions_detected: 8, rules: 23, ...differential };
  });

  // ────────────────────────────────────────────
  // 7. GET /trajectory/:patientId — 12-week prediction
  // ────────────────────────────────────────────
  app.get('/trajectory/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const weeklyHistory = await listWeeklyReports(patientId);
    if (weeklyHistory.length < 3) return reply.code(400).send({ error: 'Need at least 3 weekly reports for trajectory prediction' });

    const latestDiff = weeklyHistory[weeklyHistory.length - 1]?.differential?.algorithmic;
    const latestCascade = weeklyHistory[weeklyHistory.length - 1]?.cascade;

    const trajectory = predictTrajectory(weeklyHistory, latestDiff, latestCascade);

    return { version: 'v4', patient_id: patientId, ...trajectory };
  });

  // ────────────────────────────────────────────
  // 8. GET /pd/:patientId — PD-specific analysis (NEW)
  // ────────────────────────────────────────────
  app.get('/pd/:patientId', {
    schema: { params: { type: 'object', properties: { patientId: { type: 'string' } } } }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const baseline = getBaseline(patientId);
    if (!baseline?.complete) return reply.code(400).send({ error: 'Baseline not established' });

    const allSessions = getPatientSessions(patientId);
    const v4Sessions = allSessions.filter(s => s.feature_vector);
    if (v4Sessions.length === 0) return reply.code(400).send({ error: 'No sessions' });

    const latest = v4Sessions[v4Sessions.length - 1];
    const hasAudio = AUDIO_INDICATORS.some(id => latest.feature_vector[id] !== null && latest.feature_vector[id] !== undefined);
    if (!hasAudio) return reply.code(400).send({ error: 'No audio data available. PD analysis requires acoustic features.' });

    const result = analyzeSession(latest.feature_vector, baseline.vector, latest.confounders || {});

    const history = v4Sessions.slice(-14).map(s => {
      const r = analyzeSession(s.feature_vector, baseline.vector, s.confounders || {});
      return { z_scores: r.z_scores, domain_scores: r.domain_scores };
    });

    const pdResult = runPDAnalysis(result.z_scores, result.domain_scores, baseline.vector, history);

    return {
      version: 'v4',
      patient_id: patientId,
      session_id: latest.session_id,
      timestamp: latest.timestamp,
      ...pdResult,
    };
  });

  // ────────────────────────────────────────────
  // 9. GET /micro-tasks/:patientId — Scheduled micro-tasks (NEW)
  // ────────────────────────────────────────────
  app.get('/micro-tasks/:patientId', {
    schema: {
      params: { type: 'object', properties: { patientId: { type: 'string' } } },
      querystring: { type: 'object', properties: { weekNumber: { type: 'number' } } }
    }
  }, async (request, reply) => {
    const { patientId } = request.params;
    const weekNumber = request.query.weekNumber || 1;

    const patient = getPatient(patientId);
    if (!patient) return reply.code(404).send({ error: 'Patient not found' });

    const baseline = getBaseline(patientId);
    const allSessions = getPatientSessions(patientId);

    // Build a risk profile from latest session data
    let riskProfile = { conditions: [], alert_level: 'green' };
    if (baseline?.complete) {
      const v4Sessions = allSessions.filter(s => s.feature_vector);
      if (v4Sessions.length > 0) {
        const latest = v4Sessions[v4Sessions.length - 1];
        const result = analyzeSession(latest.feature_vector, baseline.vector, latest.confounders || {});
        riskProfile.alert_level = result.alert_level;
        riskProfile.sentinel_alerts = result.sentinel_alerts || {};

        // Determine at-risk conditions from sentinel alerts
        if (result.sentinel_alerts?.alzheimer?.length > 0) riskProfile.conditions.push('alzheimer');
        if (result.sentinel_alerts?.depression?.length > 0) riskProfile.conditions.push('depression');
        if (result.sentinel_alerts?.parkinson?.length > 0) riskProfile.conditions.push('parkinson');
      }
    }

    const scheduledTasks = getScheduledTasks(riskProfile, weekNumber, []);

    return {
      version: 'v4',
      patient_id: patientId,
      week_number: weekNumber,
      risk_profile: riskProfile,
      scheduled_tasks: scheduledTasks,
      available_tasks: Object.values(MICRO_TASKS).map(t => ({
        id: t.id,
        duration: t.duration,
        conditions: t.conditions,
        frequency: t.frequency,
        description: t.description,
      })),
    };
  });

  // ────────────────────────────────────────────
  // 10. GET /report/:patientId/:weekNumber — Weekly report
  // ────────────────────────────────────────────
  app.get('/report/:patientId/:weekNumber', async (request, reply) => {
    const report = await loadWeeklyReport(request.params.patientId, parseInt(request.params.weekNumber));
    if (!report) return reply.code(404).send({ error: 'Report not found' });
    return report;
  });

  // ────────────────────────────────────────────
  // 11. GET /reports/:patientId — All reports
  // ────────────────────────────────────────────
  app.get('/reports/:patientId', async (request) => {
    return await listWeeklyReports(request.params.patientId);
  });

  // ────────────────────────────────────────────
  // 12. GET /indicators — V4 indicator catalog (85+)
  // ────────────────────────────────────────────
  app.get('/indicators', async () => {
    return {
      version: 'v4',
      count: INDICATOR_COUNT,
      streams: {
        text: ALL_INDICATOR_IDS.filter(id => INDICATORS[id].extractable === 'text' || INDICATORS[id].extractable === 'conversation').length,
        audio: AUDIO_INDICATORS.length,
        micro_task: ALL_INDICATOR_IDS.filter(id => INDICATORS[id].extractable === 'micro_task').length,
        meta: ALL_INDICATOR_IDS.filter(id => INDICATORS[id].extractable === 'meta').length,
      },
      domains: Object.fromEntries(
        Object.entries(DOMAINS).map(([domain, ids]) => [
          domain,
          {
            weight: DOMAIN_WEIGHTS[domain],
            indicator_count: ids.length,
            indicators: ids.map(id => ({
              id,
              name: INDICATORS[id].name,
              domain: INDICATORS[id].domain,
              extractable: INDICATORS[id].extractable,
              evidence: INDICATORS[id].evidence,
              early_detection: INDICATORS[id].early_detection || {},
              effect_sizes: INDICATORS[id].effect_sizes || {},
            }))
          }
        ])
      ),
      sentinels: {
        alzheimer: SENTINELS.alzheimer,
        depression: SENTINELS.depression,
        parkinson: SENTINELS.parkinson,
      },
    };
  });

  // ────────────────────────────────────────────
  // 13. GET /baseline/:patientId — Baseline status
  // ────────────────────────────────────────────
  app.get('/baseline/:patientId', async (request) => {
    const baseline = getBaseline(request.params.patientId);
    if (!baseline) return { version: 'v4', status: 'not_started', sessions: 0, target: 14 };
    return {
      version: 'v4',
      status: baseline.complete ? 'established' : 'calibrating',
      sessions: baseline.sessions,
      target: 14,
      high_variance: baseline.high_variance || [],
      has_audio_baseline: baseline.has_audio || false,
    };
  });

  // ────────────────────────────────────────────
  // 14. GET /meta — V4_META
  // ────────────────────────────────────────────
  app.get('/meta', async () => {
    return {
      ...V4_META,
      alert_thresholds: ALERT_THRESHOLDS,
      domains: Object.fromEntries(
        Object.entries(DOMAIN_WEIGHTS).map(([d, w]) => [d, { weight: w, indicator_count: DOMAINS[d]?.length || 0 }])
      ),
      sentinels: {
        alzheimer: SENTINELS.alzheimer?.length || 0,
        depression: SENTINELS.depression?.length || 0,
        parkinson: SENTINELS.parkinson?.length || 0,
      },
    };
  });
}
