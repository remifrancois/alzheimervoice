import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve('data/cvf');

// The 25 features across 5 domains
export const CVF_FEATURES = {
  lexical: ['L1_ttr', 'L2_brunet', 'L3_honore', 'L4_content_density', 'L5_word_frequency'],
  syntactic: ['S1_mlu', 'S2_subordination', 'S3_completeness', 'S4_passive_ratio', 'S5_embedding_depth'],
  coherence: ['C1_idea_density', 'C2_topic_maintenance', 'C3_referential_coherence', 'C4_temporal_sequencing', 'C5_information_units'],
  fluency: ['F1_long_pause_ratio', 'F2_filler_rate', 'F3_false_starts', 'F4_repetition_rate', 'F5_response_latency'],
  memory: ['M1_free_recall', 'M2_cued_recall', 'M3_recognition', 'M4_temporal_precision', 'M5_emotional_engagement']
};

export const DOMAIN_WEIGHTS = {
  lexical: 0.25,
  syntactic: 0.20,
  coherence: 0.25,
  fluency: 0.20,
  memory: 0.10
};

export const ALL_FEATURES = Object.values(CVF_FEATURES).flat();

// Alert thresholds (z-scores)
export const ALERT_THRESHOLDS = {
  green:  { min: -0.5, label: 'Normal variation' },
  yellow: { min: -1.0, label: 'Notable drift — monitor closely' },
  orange: { min: -1.5, label: 'Significant drift — suggest medical consultation' },
  red:    { min: -Infinity, label: 'Critical drift — urgent medical consultation' }
};

export function getAlertLevel(compositeZScore) {
  if (compositeZScore >= -0.5) return 'green';
  if (compositeZScore >= -1.0) return 'yellow';
  if (compositeZScore >= -1.5) return 'orange';
  return 'red';
}

// Create an empty feature vector (all features at 0.5 = baseline neutral)
export function createEmptyVector() {
  const vector = {};
  for (const feature of ALL_FEATURES) {
    vector[feature] = 0.5;
  }
  return vector;
}

// Baseline structure
export function createBaseline(patientId) {
  return {
    patient_id: patientId,
    calibration_complete: false,
    sessions_used: 0,
    baseline_vector: {},  // { feature: { mean, std, range: [min, max] } }
    personality_notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Compute baseline statistics from session vectors
export function computeBaseline(sessionVectors) {
  const baseline = {};
  const featureNames = ALL_FEATURES;

  for (const feature of featureNames) {
    const values = sessionVectors.map(v => v[feature]).filter(v => v != null);
    if (values.length === 0) {
      baseline[feature] = { mean: 0.5, std: 0.1, range: [0.3, 0.7] };
      continue;
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length) || 0.03;
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Floor at 0.03: natural session-to-session variation is never zero
    baseline[feature] = { mean, std: Math.max(std, 0.03), range: [min, max] };
  }

  return baseline;
}

// Compute z-score delta from baseline for a single session vector
export function computeDelta(sessionVector, baselineVector) {
  const delta = {};
  for (const feature of ALL_FEATURES) {
    const current = sessionVector[feature] ?? 0.5;
    const { mean, std } = baselineVector[feature] || { mean: 0.5, std: 0.1 };
    delta[feature] = (current - mean) / std;
  }
  return delta;
}

// Compute weekly composite score from deltas
export function computeComposite(deltas) {
  let composite = 0;

  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    const domainZScores = features.map(f => deltas[f] ?? 0);
    const domainMean = domainZScores.reduce((a, b) => a + b, 0) / domainZScores.length;
    composite += DOMAIN_WEIGHTS[domain] * domainMean;
  }

  return composite;
}

// Compute domain-level scores from deltas
export function computeDomainScores(deltas) {
  const scores = {};
  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    const zScores = features.map(f => deltas[f] ?? 0);
    scores[domain] = zScores.reduce((a, b) => a + b, 0) / zScores.length;
  }
  return scores;
}

// Persistence
export async function saveBaseline(baseline) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `baseline_${baseline.patient_id}.json`);
  await fs.writeFile(filePath, JSON.stringify(baseline, null, 2));
  return baseline;
}

export async function loadBaseline(patientId) {
  const filePath = path.join(DATA_DIR, `baseline_${patientId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Save weekly analysis
export async function saveWeeklyAnalysis(analysis) {
  const dir = path.resolve('data/reports');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `week_${analysis.patient_id}_${analysis.week_number}.json`);
  await fs.writeFile(filePath, JSON.stringify(analysis, null, 2));
  return analysis;
}

// Load weekly analysis
export async function loadWeeklyAnalysis(patientId, weekNumber) {
  const filePath = path.resolve('data/reports', `week_${patientId}_${weekNumber}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}
