/**
 * LAYER 4 — Cognitive Twin (~150K tokens)
 *
 * Creates a personalized "cognitive twin" — a simulation of what the patient's
 * linguistic profile would look like if they were aging normally.
 *
 * Solves the fundamental problem of CVF v1: baseline drift.
 * The baseline is fixed (sessions 1-14), but the patient ages.
 * Without a twin, normal aging over 2 years triggers false positives.
 * The twin ages WITH the patient, only flagging what exceeds expected aging.
 *
 * Divergence Score:
 *   < 1.0 → Normal (within expected aging)
 *   1.0 - 2.0 → Monitor (diverging from twin)
 *   > 2.0 → Investigate (significant divergence)
 *   > 3.0 → Alert (critical divergence)
 */

import fs from 'fs/promises';
import path from 'path';
import { readSecureJSONSafe, writeSecureJSON } from '../lib/secure-fs.js';
import { ALL_FEATURES, CVF_FEATURES } from '../models/cvf.js';

const DATA_DIR = path.resolve('data/twins');

// Normal aging parameters (from meta-analyses)
const AGING_RATES = {
  // Annual decline rates for healthy aging (z-score units per year)
  lexical: {
    L1_ttr: -0.02,        // TTR drops ~1% per year after 65
    L2_brunet: -0.015,
    L3_honore: -0.01,
    L4_content_density: -0.01,
    L5_word_frequency: -0.005  // Slight shift to common words
  },
  syntactic: {
    S1_mlu: -0.01,
    S2_subordination: -0.01,
    S3_completeness: -0.005,
    S4_passive_ratio: 0.0,     // Stable
    S5_embedding_depth: -0.01
  },
  coherence: {
    C1_idea_density: -0.01,
    C2_topic_maintenance: -0.005,
    C3_referential_coherence: -0.005,
    C4_temporal_sequencing: -0.005,
    C5_information_units: -0.01
  },
  fluency: {
    F1_long_pause_ratio: -0.015,  // Pauses increase slightly
    F2_filler_rate: -0.005,
    F3_false_starts: -0.005,
    F4_repetition_rate: -0.005,
    F5_response_latency: -0.015   // Response time increases
  },
  memory: {
    M1_free_recall: -0.02,         // Free recall slows most
    M2_cued_recall: -0.005,        // Cued recall preserved
    M3_recognition: -0.002,        // Recognition very stable
    M4_temporal_precision: -0.01,
    M5_emotional_engagement: -0.005
  }
};

// Normal day-to-day variance (standard deviations)
const DAILY_VARIANCE = {
  L1_ttr: 0.04, L2_brunet: 0.04, L3_honore: 0.05, L4_content_density: 0.04, L5_word_frequency: 0.03,
  S1_mlu: 0.04, S2_subordination: 0.05, S3_completeness: 0.03, S4_passive_ratio: 0.04, S5_embedding_depth: 0.04,
  C1_idea_density: 0.04, C2_topic_maintenance: 0.03, C3_referential_coherence: 0.04, C4_temporal_sequencing: 0.04, C5_information_units: 0.04,
  F1_long_pause_ratio: 0.05, F2_filler_rate: 0.04, F3_false_starts: 0.05, F4_repetition_rate: 0.04, F5_response_latency: 0.05,
  M1_free_recall: 0.05, M2_cued_recall: 0.03, M3_recognition: 0.02, M4_temporal_precision: 0.04, M5_emotional_engagement: 0.04
};

/**
 * Generate the cognitive twin's expected CVF vector at a given week.
 * Based on baseline + normal aging trajectory.
 */
export function generateTwinVector(baselineVector, weekNumber, patientProfile = {}) {
  const twinVector = {};
  const confidenceIntervals = {};
  const yearsElapsed = weekNumber / 52;

  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    for (const feature of features) {
      const baselineMean = baselineVector[feature]?.mean ?? 0.5;
      const agingRate = AGING_RATES[domain]?.[feature] ?? -0.01;
      const variance = DAILY_VARIANCE[feature] ?? 0.04;

      // Apply education correction (higher education = slower decline)
      let educationFactor = 1.0;
      if (patientProfile.education === 'high') educationFactor = 0.7;
      else if (patientProfile.education === 'low') educationFactor = 1.3;

      // Expected value = baseline + aging * time * education
      const expectedValue = baselineMean + (agingRate * yearsElapsed * educationFactor);

      // Confidence interval widens with time
      const timeVariance = variance * (1 + yearsElapsed * 0.1);

      twinVector[feature] = {
        expected: Math.max(0, Math.min(1, expectedValue)),
        variance: timeVariance,
        ci_lower: Math.max(0, expectedValue - 1.96 * timeVariance),
        ci_upper: Math.min(1, expectedValue + 1.96 * timeVariance)
      };

      confidenceIntervals[feature] = {
        mean: expectedValue,
        std: timeVariance,
        range: [twinVector[feature].ci_lower, twinVector[feature].ci_upper]
      };
    }
  }

  return { twinVector, confidenceIntervals, weekNumber, yearsElapsed };
}

/**
 * Compute divergence between real patient and cognitive twin.
 * Returns a single divergence score with per-domain breakdown.
 */
export function computeDivergence(realVector, twinResult) {
  const { twinVector } = twinResult;
  const domainDivergences = {};
  let totalDivergence = 0;
  let featureCount = 0;

  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    let domainDiv = 0;
    let domainCount = 0;

    for (const feature of features) {
      const real = realVector[feature] ?? 0.5;
      const twin = twinVector[feature];
      if (!twin) continue;

      // Divergence = distance from expected, normalized by variance
      const deviation = (real - twin.expected) / (twin.variance || 0.04);
      domainDiv += Math.abs(deviation);
      domainCount++;
    }

    domainDivergences[domain] = domainCount > 0 ? domainDiv / domainCount : 0;
    totalDivergence += domainDivergences[domain];
    featureCount++;
  }

  const overallDivergence = featureCount > 0 ? totalDivergence / featureCount : 0;

  return {
    overall: Math.round(overallDivergence * 100) / 100,
    domains: domainDivergences,
    interpretation: interpretDivergence(overallDivergence),
    alert_level: divergenceToAlert(overallDivergence)
  };
}

/**
 * Build the cognitive twin context for the 1M token analysis.
 */
export function buildTwinContext(baselineVector, weekNumber, patientProfile, realTimeline) {
  const twinResult = generateTwinVector(baselineVector, weekNumber, patientProfile);

  // Compare twin trajectory to real trajectory
  const twinTrajectory = [];
  for (let w = 1; w <= weekNumber; w++) {
    const weekTwin = generateTwinVector(baselineVector, w, patientProfile);
    twinTrajectory.push({
      week: w,
      twin_composite: computeTwinComposite(weekTwin.twinVector),
      twin_domains: computeTwinDomainScores(weekTwin.twinVector)
    });
  }

  return `<cognitive_twin week="${weekNumber}">

## COGNITIVE TWIN — Personalized Normal Aging Model

This is the expected cognitive trajectory for this patient assuming HEALTHY normal aging.
The twin was constructed from:
- Patient baseline (${baselineVector ? 'established' : 'pending'})
- Normal aging rates from meta-analyses (TTR: -1%/yr, MLU: stable, recall: -2%/yr)
- Patient profile adjustments (education: ${patientProfile.education || 'average'})

### TWIN TRAJECTORY (Week 1 → ${weekNumber})
${JSON.stringify(twinTrajectory, null, 2)}

### CURRENT TWIN VECTOR (Week ${weekNumber})
${JSON.stringify(twinResult.twinVector, null, 2)}

### DIVERGENCE SCORING
Compare real patient values to twin expected values.
- Divergence < 1.0 → Within normal aging
- Divergence 1.0-2.0 → Monitor — exceeds expected aging
- Divergence > 2.0 → Investigate — significant divergence
- Divergence > 3.0 → Alert — critical divergence from expected

</cognitive_twin>`;
}

/**
 * Save twin analysis result.
 */
export async function saveTwinAnalysis(patientId, analysis) {
  const filePath = path.join(DATA_DIR, `twin_${patientId}.json`);
  await writeSecureJSON(filePath, {
    patient_id: patientId,
    generated_at: new Date().toISOString(),
    ...analysis
  });
  return analysis;
}

/**
 * Load twin analysis.
 */
export async function loadTwinAnalysis(patientId) {
  const filePath = path.join(DATA_DIR, `twin_${patientId}.json`);
  return await readSecureJSONSafe(filePath, null);
}

// Helpers
function interpretDivergence(score) {
  if (score < 1.0) return 'Within expected normal aging trajectory';
  if (score < 2.0) return 'Diverging from expected aging — recommend monitoring';
  if (score < 3.0) return 'Significant divergence from twin — recommend investigation';
  return 'Critical divergence — recommend urgent medical evaluation';
}

function divergenceToAlert(score) {
  if (score < 1.0) return 'green';
  if (score < 2.0) return 'yellow';
  if (score < 3.0) return 'orange';
  return 'red';
}

function computeTwinComposite(twinVector) {
  let composite = 0;
  const weights = { lexical: 0.25, syntactic: 0.20, coherence: 0.25, fluency: 0.20, memory: 0.10 };
  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    const vals = features.map(f => twinVector[f]?.expected ?? 0.5);
    const domainMean = vals.reduce((a, b) => a + b, 0) / vals.length;
    composite += (weights[domain] || 0.2) * domainMean;
  }
  return Math.round(composite * 1000) / 1000;
}

function computeTwinDomainScores(twinVector) {
  const scores = {};
  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    const vals = features.map(f => twinVector[f]?.expected ?? 0.5);
    scores[domain] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 1000) / 1000;
  }
  return scores;
}

export { AGING_RATES, DAILY_VARIANCE };
