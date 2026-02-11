import { extractFeatures } from './claude.js';
import { createSession, saveSession, loadPatientSessions } from '../models/session.js';
import { loadPatient, savePatient } from '../models/patient.js';
import {
  computeBaseline, computeDelta, computeComposite, computeDomainScores,
  getAlertLevel, ALL_FEATURES, createBaseline, saveBaseline, loadBaseline
} from '../models/cvf.js';

const BASELINE_MIN_SESSIONS = 14;
const HIGH_VARIANCE_THRESHOLD = 0.3;

/**
 * Process a new conversation: extract features, update baseline or compute drift.
 */
export async function processConversation({ patientId, transcript, language, confounders, durationSeconds }) {
  const patient = await loadPatient(patientId);

  // Create and save the session
  const session = createSession({
    patientId,
    language: language || patient.language,
    transcript,
    durationSeconds,
    confounders
  });

  // Extract features using Claude
  console.log(`[CVF] Extracting features for session ${session.session_id}...`);
  const featureVector = await extractFeatures(transcript, {
    language: patient.language,
    patientProfile: patient,
    baselineInfo: patient.baseline_established ? await loadBaseline(patientId) : null
  });

  session.feature_vector = featureVector;
  session.extracted_at = new Date().toISOString();
  await saveSession(session);

  // Update baseline or compute drift
  if (!patient.baseline_established) {
    return await updateBaseline(patient, session);
  } else {
    return await computeSessionDrift(patient, session);
  }
}

/**
 * During calibration: accumulate session vectors toward baseline.
 */
async function updateBaseline(patient, session) {
  let baseline = await loadBaseline(patient.patient_id) || createBaseline(patient.patient_id);
  const sessions = await loadPatientSessions(patient.patient_id);
  const vectors = sessions
    .filter(s => s.feature_vector)
    .map(s => s.feature_vector);

  patient.baseline_sessions = vectors.length;

  if (vectors.length >= BASELINE_MIN_SESSIONS) {
    // Compute baseline statistics
    const baselineVector = computeBaseline(vectors);

    // Check for high-variance features
    const highVarianceFeatures = [];
    for (const feature of ALL_FEATURES) {
      const stats = baselineVector[feature];
      if (stats && stats.mean > 0) {
        const cv = stats.std / stats.mean;
        if (cv > HIGH_VARIANCE_THRESHOLD) {
          highVarianceFeatures.push(feature);
        }
      }
    }

    if (highVarianceFeatures.length > 5 && vectors.length < 20) {
      console.log(`[CVF] ${highVarianceFeatures.length} features with high variance. Extending calibration.`);
      baseline.sessions_used = vectors.length;
      baseline.baseline_vector = baselineVector;
      await saveBaseline(baseline);
      return {
        status: 'calibrating',
        sessionsComplete: vectors.length,
        sessionsTarget: BASELINE_MIN_SESSIONS,
        highVarianceFeatures,
        message: `Calibration extended: ${highVarianceFeatures.length} features need more data.`
      };
    }

    // Baseline established!
    baseline.calibration_complete = true;
    baseline.sessions_used = vectors.length;
    baseline.baseline_vector = baselineVector;
    baseline.updated_at = new Date().toISOString();
    await saveBaseline(baseline);

    patient.baseline_established = true;
    patient.baseline_sessions = vectors.length;
    await savePatient(patient);

    console.log(`[CVF] Baseline established for ${patient.first_name} after ${vectors.length} sessions.`);
    return {
      status: 'baseline_established',
      sessionsUsed: vectors.length,
      message: `Baseline established for ${patient.first_name}. Monitoring begins.`
    };
  }

  // Still calibrating
  baseline.sessions_used = vectors.length;
  if (vectors.length >= 3) {
    baseline.baseline_vector = computeBaseline(vectors);
  }
  await saveBaseline(baseline);

  const phase = vectors.length <= 3 ? 'rapport_building'
    : vectors.length <= 7 ? 'deep_calibration'
    : 'baseline_consolidation';

  return {
    status: 'calibrating',
    phase,
    sessionsComplete: vectors.length,
    sessionsTarget: BASELINE_MIN_SESSIONS,
    message: `Calibration: ${vectors.length}/${BASELINE_MIN_SESSIONS} sessions (${phase.replace('_', ' ')})`
  };
}

/**
 * Post-baseline: compute drift from baseline for this session.
 */
async function computeSessionDrift(patient, session) {
  const baseline = await loadBaseline(patient.patient_id);
  if (!baseline?.baseline_vector) {
    throw new Error('No baseline found for drift computation');
  }

  const delta = computeDelta(session.feature_vector, baseline.baseline_vector);
  const composite = computeComposite(delta);
  const domainScores = computeDomainScores(delta);
  const alertLevel = getAlertLevel(composite);

  // Update patient alert level if it escalated
  if (alertSeverity(alertLevel) > alertSeverity(patient.alert_level)) {
    patient.alert_level = alertLevel;
    await savePatient(patient);
  }

  return {
    status: 'drift_computed',
    session_id: session.session_id,
    composite_score: composite,
    domain_scores: domainScores,
    alert_level: alertLevel,
    feature_deltas: delta,
    message: `Session analyzed. Composite: ${composite.toFixed(3)}, Alert: ${alertLevel.toUpperCase()}`
  };
}

function alertSeverity(level) {
  return { green: 0, yellow: 1, orange: 2, red: 3 }[level] || 0;
}

/**
 * Get the full CVF timeline for a patient.
 */
export async function getPatientTimeline(patientId) {
  const patient = await loadPatient(patientId);
  const baseline = await loadBaseline(patientId);
  const sessions = await loadPatientSessions(patientId);

  const timeline = [];

  for (const session of sessions) {
    if (!session.feature_vector) continue;

    const entry = {
      session_id: session.session_id,
      timestamp: session.timestamp,
      feature_vector: session.feature_vector,
      confounders: session.confounders
    };

    if (baseline?.calibration_complete && baseline?.baseline_vector) {
      const delta = computeDelta(session.feature_vector, baseline.baseline_vector);
      entry.delta = delta;
      entry.composite = computeComposite(delta);
      entry.domain_scores = computeDomainScores(delta);
      entry.alert_level = getAlertLevel(entry.composite);
    }

    timeline.push(entry);
  }

  return {
    patient,
    baseline: baseline?.baseline_vector || null,
    baseline_established: baseline?.calibration_complete || false,
    sessions_count: sessions.length,
    timeline
  };
}
