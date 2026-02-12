/**
 * V3 TRAJECTORY PREDICTOR
 *
 * Predicts future trajectory based on:
 * 1. Current trend direction and velocity
 * 2. Cascade stage (which domains will decline next)
 * 3. Differential diagnosis (AD = progressive, depression = recoverable)
 * 4. Normal aging model (cognitive twin without LLM)
 *
 * No LLM inference needed — pure computation from evidence-based models.
 */

import { DOMAIN_WEIGHTS } from './indicators.js';

// Normal aging rates (from meta-analyses, per week)
const WEEKLY_AGING_RATES = {
  lexical:   -0.02 / 52,
  syntactic: -0.01 / 52,
  semantic:  -0.01 / 52,
  temporal:  -0.015 / 52,
  memory:    -0.02 / 52,
  discourse: -0.005 / 52,
  affective: -0.005 / 52,
};

/**
 * Predict trajectory for the next N weeks.
 *
 * @param {Array} history — past weekly analyses
 * @param {Object} differential — current differential diagnosis
 * @param {Object} cascade — current cascade detection
 * @param {number} weeks — how many weeks to predict (default 12)
 */
export function predictTrajectory(history, differential, cascade, weeks = 12) {
  if (history.length < 3) {
    return { predictions: [], confidence: 0, message: 'Insufficient data for prediction (need 3+ weeks)' };
  }

  const primary = differential?.primary_hypothesis || 'unknown';
  const currentComposite = history[history.length - 1]?.composite ?? 0;
  const currentDomains = history[history.length - 1]?.domain_scores || {};

  // Compute current velocity (rate of change per week)
  const velocity = computeVelocity(history);

  // Build prediction based on condition-specific model
  const predictions = [];
  for (let w = 1; w <= weeks; w++) {
    const prediction = predictWeek(w, currentComposite, currentDomains, velocity, primary, cascade);
    predictions.push(prediction);
  }

  // Confidence decays with prediction horizon
  const baseConfidence = differential?.confidence || 0.5;
  const trajectoryConfidence = Math.max(0.1, baseConfidence * (1 - weeks * 0.03));

  return {
    predictions,
    velocity,
    model: primary,
    confidence: Math.round(trajectoryConfidence * 100) / 100,
    predicted_alert_12w: predictions[weeks - 1]?.alert_level || 'unknown',
    twin_trajectory: computeTwinTrajectory(currentDomains, weeks)
  };
}

/**
 * Compute rate of change per week from history.
 */
function computeVelocity(history) {
  if (history.length < 2) return { composite: 0, domains: {} };

  // Use last 4 weeks for velocity (or all if fewer)
  const recent = history.slice(-4);
  const n = recent.length;

  // Linear regression on composite
  const xs = recent.map((_, i) => i);
  const ys = recent.map(w => w.composite ?? 0);
  const compositeVelocity = linearSlope(xs, ys);

  // Per-domain velocities
  const domainVelocities = {};
  for (const domain of Object.keys(DOMAIN_WEIGHTS)) {
    const domainYs = recent.map(w => w.domain_scores?.[domain] ?? 0);
    domainVelocities[domain] = linearSlope(xs, domainYs);
  }

  return {
    composite: Math.round(compositeVelocity * 10000) / 10000,
    domains: domainVelocities
  };
}

/**
 * Predict a single future week based on condition model.
 */
function predictWeek(weekOffset, currentComposite, currentDomains, velocity, condition, cascade) {
  let predictedComposite;
  const predictedDomains = {};

  switch (condition) {
    case 'alzheimer': {
      // AD model: accelerating decline following cascade order
      const cascadeStage = cascade?.length > 0 ? Math.max(...cascade.map(c => c.stage)) : 0;
      const acceleration = 1 + (cascadeStage * 0.1); // Higher stage = faster decline
      const weeklyDecline = (velocity.composite || -0.02) * acceleration;
      predictedComposite = currentComposite + weeklyDecline * weekOffset;

      // Cascade predicts which domains decline next
      for (const [domain, current] of Object.entries(currentDomains)) {
        const domainVel = velocity.domains[domain] || 0;
        const cascadeBoost = getCascadeBoost(domain, cascadeStage);
        predictedDomains[domain] = (current ?? 0) + (domainVel * cascadeBoost) * weekOffset;
      }
      break;
    }

    case 'depression': {
      // Depression model: episodic — predict partial recovery
      const recoveryRate = 0.02; // Slight improvement per week (natural course)
      predictedComposite = currentComposite + recoveryRate * weekOffset;
      // Cap at 0 (can't improve beyond baseline)
      predictedComposite = Math.min(0, predictedComposite);

      for (const [domain, current] of Object.entries(currentDomains)) {
        predictedDomains[domain] = Math.min(0, (current ?? 0) + recoveryRate * weekOffset);
      }
      break;
    }

    case 'parkinson': {
      // PD model: slow progression, fluency-dominant
      const pdRate = -0.01; // Slower than AD
      predictedComposite = currentComposite + pdRate * weekOffset;

      for (const [domain, current] of Object.entries(currentDomains)) {
        const rate = domain === 'temporal' ? pdRate * 1.5 : pdRate * 0.5;
        predictedDomains[domain] = (current ?? 0) + rate * weekOffset;
      }
      break;
    }

    case 'medication': {
      // Medication model: recovery expected within 2-3 weeks
      const recoveryWeek = 3;
      if (weekOffset <= recoveryWeek) {
        const recoveryProgress = weekOffset / recoveryWeek;
        predictedComposite = currentComposite * (1 - recoveryProgress);
      } else {
        predictedComposite = 0; // Full recovery
      }
      for (const domain of Object.keys(currentDomains)) {
        predictedDomains[domain] = predictedComposite * 0.8;
      }
      break;
    }

    default: {
      // Normal aging model: very slow decline
      predictedComposite = currentComposite;
      for (const [domain, current] of Object.entries(currentDomains)) {
        const agingRate = WEEKLY_AGING_RATES[domain] || -0.0003;
        predictedDomains[domain] = (current ?? 0) + agingRate * weekOffset;
      }
      break;
    }
  }

  // Alert level from predicted composite
  const alertLevel = predictedComposite >= -0.5 ? 'green'
    : predictedComposite >= -1.0 ? 'yellow'
    : predictedComposite >= -1.5 ? 'orange' : 'red';

  return {
    week_offset: weekOffset,
    composite: Math.round(predictedComposite * 1000) / 1000,
    domains: Object.fromEntries(
      Object.entries(predictedDomains).map(([k, v]) => [k, Math.round(v * 1000) / 1000])
    ),
    alert_level: alertLevel
  };
}

/**
 * Compute cognitive twin trajectory (pure aging model).
 */
function computeTwinTrajectory(currentDomains, weeks) {
  const trajectory = [];
  for (let w = 1; w <= weeks; w++) {
    const twinDomains = {};
    for (const [domain, current] of Object.entries(currentDomains)) {
      const rate = WEEKLY_AGING_RATES[domain] || -0.0003;
      twinDomains[domain] = Math.round(((current ?? 0) + rate * w) * 1000) / 1000;
    }
    trajectory.push({
      week_offset: w,
      domains: twinDomains,
      composite: Math.round(Object.entries(twinDomains).reduce((s, [d, v]) =>
        s + v * (DOMAIN_WEIGHTS[d] || 0.1), 0) * 1000) / 1000
    });
  }
  return trajectory;
}

// Helpers

function getCascadeBoost(domain, stage) {
  // AD cascade: semantic → syntactic → temporal → memory
  const boosts = {
    0: { lexical: 1.0, semantic: 1.0, syntactic: 1.0, temporal: 1.5, memory: 1.0, discourse: 1.0, affective: 1.0 },
    1: { lexical: 1.5, semantic: 1.5, syntactic: 1.0, temporal: 1.2, memory: 1.3, discourse: 1.0, affective: 1.0 },
    2: { lexical: 1.5, semantic: 1.5, syntactic: 1.5, temporal: 1.3, memory: 1.5, discourse: 1.2, affective: 1.0 },
    3: { lexical: 1.5, semantic: 1.5, syntactic: 1.5, temporal: 1.5, memory: 1.5, discourse: 1.5, affective: 1.0 },
  };
  return boosts[stage]?.[domain] || 1.0;
}

function linearSlope(xs, ys) {
  const n = xs.length;
  if (n < 2) return 0;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  return den !== 0 ? num / den : 0;
}
