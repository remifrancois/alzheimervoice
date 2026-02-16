/**
 * V4 TRAJECTORY PREDICTOR
 *
 * Enhanced trajectory prediction with:
 * 1. 9 domains (added acoustic, pd_motor)
 * 2. Individual decline profiles — per-domain velocity ranking
 * 3. PD-specific progression models (H&Y-modulated)
 * 4. MSA/PSP atypical parkinsonism models
 * 5. Cascade-aware domain-level forecasting
 * 6. Cognitive twin trajectory (pure aging, 9 domains)
 *
 * Extends V3 with condition-specific domain ordering:
 *   AD  — lexical/semantic lead, cascade-accelerated
 *   PD  — phonation first, then articulation, then prosody
 *   MSA — faster than PD, articulatory acceleration
 *   PSP — fastest motor decline, spastic component
 *
 * No LLM inference needed — pure computation from evidence-based models.
 */

import { DOMAIN_WEIGHTS } from './indicators.js';

// ════════════════════════════════════════════════════════
// NORMAL AGING RATES (from meta-analyses, per week)
// 9 domains — V4 adds acoustic and pd_motor
// ════════════════════════════════════════════════════════

const WEEKLY_AGING_RATES = {
  lexical:   -0.02  / 52,
  syntactic: -0.01  / 52,
  semantic:  -0.01  / 52,
  temporal:  -0.015 / 52,
  memory:    -0.02  / 52,
  discourse: -0.005 / 52,
  affective: -0.005 / 52,
  acoustic:  -0.01  / 52,
  pd_motor:  -0.005 / 52,
};

// ════════════════════════════════════════════════════════
// CASCADE BOOST TABLES
// ════════════════════════════════════════════════════════

/**
 * AD cascade: semantic -> syntactic -> temporal -> memory -> global
 * Higher stage = more domains recruited, faster per-domain decline.
 */
function getCascadeBoost(domain, stage) {
  const boosts = {
    0: { lexical: 1.0, semantic: 1.0, syntactic: 1.0, temporal: 1.5, memory: 1.0, discourse: 1.0, affective: 1.0, acoustic: 1.0, pd_motor: 1.0 },
    1: { lexical: 1.5, semantic: 1.5, syntactic: 1.0, temporal: 1.2, memory: 1.3, discourse: 1.0, affective: 1.0, acoustic: 1.0, pd_motor: 1.0 },
    2: { lexical: 1.5, semantic: 1.5, syntactic: 1.5, temporal: 1.3, memory: 1.5, discourse: 1.2, affective: 1.0, acoustic: 1.0, pd_motor: 1.0 },
    3: { lexical: 1.5, semantic: 1.5, syntactic: 1.5, temporal: 1.5, memory: 1.5, discourse: 1.5, affective: 1.0, acoustic: 1.0, pd_motor: 1.0 },
  };
  return boosts[stage]?.[domain] || 1.0;
}

/**
 * PD domain ordering: phonation -> articulation -> prosody -> cognitive.
 * Acoustic and pd_motor domains decline 1.5-2x faster than text domains.
 */
function getPdDomainRate(domain, baseRate) {
  const pdMultipliers = {
    acoustic:  2.0,   // phonation degrades first
    pd_motor:  1.5,   // motor features next
    temporal:  1.2,   // prosodic timing
    lexical:   0.5,   // cognitive domains spared early
    syntactic: 0.4,
    semantic:  0.3,
    memory:    0.4,
    discourse: 0.3,
    affective: 0.3,
  };
  return baseRate * (pdMultipliers[domain] || 0.5);
}

/**
 * MSA domain ordering: faster than PD, more variable, articulatory decay accelerating.
 */
function getMsaDomainRate(domain, weekOffset) {
  const baseRates = {
    acoustic:  -0.025,
    pd_motor:  -0.020,
    temporal:  -0.018,
    lexical:   -0.008,
    syntactic: -0.006,
    semantic:  -0.005,
    memory:    -0.006,
    discourse: -0.005,
    affective: -0.004,
  };
  const rate = baseRates[domain] || -0.005;
  // Articulatory acceleration: rate worsens 5% per week for motor domains
  const isMotor = domain === 'acoustic' || domain === 'pd_motor' || domain === 'temporal';
  const acceleration = isMotor ? 1 + (weekOffset * 0.05) : 1.0;
  return rate * acceleration;
}

/**
 * PSP model: spastic component, fastest motor decline.
 */
function getPspDomainRate(domain) {
  const pspRates = {
    acoustic:  -0.030,  // spastic dysarthria — severe
    pd_motor:  -0.025,  // fastest motor decline
    temporal:  -0.020,  // severe timing disruption
    lexical:   -0.010,
    syntactic: -0.008,
    semantic:  -0.008,
    memory:    -0.010,
    discourse: -0.008,
    affective: -0.005,
  };
  return pspRates[domain] || -0.008;
}

// ════════════════════════════════════════════════════════
// LINEAR REGRESSION HELPER
// ════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════
// VELOCITY COMPUTATION — 9 domains
// ════════════════════════════════════════════════════════

/**
 * Compute rate of change per week from history.
 * Linear regression across all 9 domains.
 */
function computeVelocity(history) {
  if (history.length < 2) return { composite: 0, domains: {} };

  // Use last 4 weeks for velocity (or all if fewer)
  const recent = history.slice(-4);

  // Linear regression on composite
  const xs = recent.map((_, i) => i);
  const ys = recent.map(w => w.composite ?? 0);
  const compositeVelocity = linearSlope(xs, ys);

  // Per-domain velocities across all 9 domains
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

// ════════════════════════════════════════════════════════
// SINGLE WEEK PREDICTION — 8 condition models
// ════════════════════════════════════════════════════════

/**
 * Predict a single future week based on condition model.
 * Extended switch for: alzheimer, depression, parkinson, msa, psp,
 * medication, normal_aging, and default (unknown).
 */
function predictWeek(weekOffset, currentComposite, currentDomains, velocity, condition, cascade) {
  let predictedComposite;
  const predictedDomains = {};

  switch (condition) {
    case 'alzheimer': {
      // AD model: accelerating decline following cascade order
      const cascadeStage = cascade?.length > 0 ? Math.max(...cascade.map(c => c.stage)) : 0;
      const acceleration = 1 + (cascadeStage * 0.1);
      const weeklyDecline = (velocity.composite || -0.02) * acceleration;
      predictedComposite = currentComposite + weeklyDecline * weekOffset;

      for (const [domain, current] of Object.entries(currentDomains)) {
        const domainVel = velocity.domains[domain] || 0;
        const cascadeBoost = getCascadeBoost(domain, cascadeStage);
        predictedDomains[domain] = (current ?? 0) + (domainVel * cascadeBoost) * weekOffset;
      }
      break;
    }

    case 'depression': {
      // Depression model: episodic — predict partial recovery
      const recoveryRate = 0.02;
      predictedComposite = currentComposite + recoveryRate * weekOffset;
      predictedComposite = Math.min(0, predictedComposite);

      for (const [domain, current] of Object.entries(currentDomains)) {
        predictedDomains[domain] = Math.min(0, (current ?? 0) + recoveryRate * weekOffset);
      }
      break;
    }

    case 'parkinson': {
      // PD model: H&Y-modulated. Phonation first, then articulation, then prosody.
      // Slower overall than AD, but acoustic/pd_motor domains decline 1.5-2x faster.
      const pdBaseRate = -0.01;
      predictedComposite = currentComposite + pdBaseRate * weekOffset;

      for (const [domain, current] of Object.entries(currentDomains)) {
        const rate = getPdDomainRate(domain, pdBaseRate);
        predictedDomains[domain] = (current ?? 0) + rate * weekOffset;
      }
      break;
    }

    case 'msa': {
      // MSA model: faster than PD, more variable, articulatory decay accelerating.
      const msaBaseRate = -0.015;
      predictedComposite = currentComposite + msaBaseRate * weekOffset;

      for (const [domain, current] of Object.entries(currentDomains)) {
        const rate = getMsaDomainRate(domain, weekOffset);
        predictedDomains[domain] = (current ?? 0) + rate * weekOffset;
      }
      break;
    }

    case 'psp': {
      // PSP model: spastic component, fastest motor decline.
      const pspBaseRate = -0.02;
      predictedComposite = currentComposite + pspBaseRate * weekOffset;

      for (const [domain, current] of Object.entries(currentDomains)) {
        const rate = getPspDomainRate(domain);
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
        predictedComposite = 0;
      }
      for (const domain of Object.keys(currentDomains)) {
        predictedDomains[domain] = predictedComposite * 0.8;
      }
      break;
    }

    case 'normal_aging': {
      // Explicit normal aging model
      predictedComposite = currentComposite;
      for (const [domain, current] of Object.entries(currentDomains)) {
        const agingRate = WEEKLY_AGING_RATES[domain] || -0.0003;
        predictedDomains[domain] = (current ?? 0) + agingRate * weekOffset;
      }
      break;
    }

    default: {
      // Unknown condition — fall back to very slow decline across 9 domains
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

// ════════════════════════════════════════════════════════
// COGNITIVE TWIN TRAJECTORY — 9 domains
// ════════════════════════════════════════════════════════

/**
 * Compute cognitive twin trajectory (pure aging model).
 * Extended to all 9 domains for V4.
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

// ════════════════════════════════════════════════════════
// DECLINE PROFILE ANALYSIS
// ════════════════════════════════════════════════════════

/**
 * Compute per-domain decline profile from history.
 *
 * Analyzes last 4-8 weeks to identify:
 * - Per-domain velocity (rate of change)
 * - Leading edge (fastest declining domain)
 * - Predicted next domain to decline (cascade-aware)
 * - Profile type classification
 *
 * @param {Array} history — past weekly analyses (need 4+ weeks)
 * @returns {{ leading_edge: string, domain_velocities: Object, predicted_next: string, profile_type: string }}
 */
export function computeDeclineProfile(history) {
  if (!history || history.length < 4) {
    return {
      leading_edge: null,
      domain_velocities: {},
      predicted_next: null,
      profile_type: 'stable',
    };
  }

  // Use last 4-8 weeks
  const windowSize = Math.min(8, history.length);
  const recent = history.slice(-windowSize);
  const xs = recent.map((_, i) => i);

  // Compute per-domain velocity
  const domainVelocities = {};
  for (const domain of Object.keys(DOMAIN_WEIGHTS)) {
    const ys = recent.map(w => w.domain_scores?.[domain] ?? 0);
    domainVelocities[domain] = Math.round(linearSlope(xs, ys) * 10000) / 10000;
  }

  // Rank domains by decline rate (most negative = fastest declining)
  const ranked = Object.entries(domainVelocities)
    .sort(([, a], [, b]) => a - b);

  const leadingEdge = ranked[0][0];
  const leadingVelocity = ranked[0][1];

  // Determine if there is meaningful decline (threshold: -0.005/week)
  const DECLINE_THRESHOLD = -0.005;
  const decliningDomains = ranked.filter(([, v]) => v < DECLINE_THRESHOLD);

  if (decliningDomains.length === 0) {
    return {
      leading_edge: null,
      domain_velocities: domainVelocities,
      predicted_next: null,
      profile_type: 'stable',
    };
  }

  // Predict next domain based on cascade patterns
  let predictedNext = null;
  let profileType = 'uniform';

  // Check for AD-like pattern: lexical or semantic leading
  if (leadingEdge === 'lexical' || leadingEdge === 'semantic') {
    // AD cascade: lexical -> semantic -> syntactic -> memory
    if (leadingEdge === 'lexical') {
      predictedNext = 'semantic';
    } else {
      predictedNext = 'syntactic';
    }
    profileType = 'ad_like';
  }
  // Check for PD-like pattern: acoustic or pd_motor leading
  else if (leadingEdge === 'acoustic' || leadingEdge === 'pd_motor') {
    if (leadingEdge === 'acoustic') {
      predictedNext = 'pd_motor';
    } else {
      predictedNext = 'temporal';
    }
    profileType = 'pd_like';
  }
  // Check for depression-like pattern: affective leading
  else if (leadingEdge === 'affective') {
    predictedNext = 'temporal';
    profileType = 'depression_like';
  }
  // Uniform decline — multiple domains declining at similar rates
  else {
    // If top 2 declining domains are within 30% of each other, uniform
    if (decliningDomains.length >= 2) {
      const fastest = Math.abs(decliningDomains[0][1]);
      const second = Math.abs(decliningDomains[1][1]);
      if (second / fastest > 0.7) {
        profileType = 'uniform';
      }
    }
    // Default: predict the next domain in general cascade order
    const generalOrder = ['lexical', 'semantic', 'temporal', 'syntactic', 'memory', 'acoustic', 'pd_motor', 'discourse', 'affective'];
    const leadIdx = generalOrder.indexOf(leadingEdge);
    predictedNext = generalOrder[(leadIdx + 1) % generalOrder.length];
  }

  // If the predicted next domain is already declining, move to the one after
  if (predictedNext && domainVelocities[predictedNext] < DECLINE_THRESHOLD) {
    const cascadeMap = {
      ad_like:         ['lexical', 'semantic', 'syntactic', 'memory', 'temporal', 'discourse'],
      pd_like:         ['acoustic', 'pd_motor', 'temporal', 'lexical', 'syntactic', 'semantic'],
      depression_like: ['affective', 'temporal', 'lexical', 'memory', 'semantic', 'discourse'],
      uniform:         ['lexical', 'semantic', 'temporal', 'syntactic', 'memory', 'acoustic', 'pd_motor', 'discourse', 'affective'],
    };
    const order = cascadeMap[profileType] || cascadeMap.uniform;
    const notYetDeclining = order.find(d => domainVelocities[d] >= DECLINE_THRESHOLD);
    predictedNext = notYetDeclining || null;
  }

  return {
    leading_edge: leadingEdge,
    domain_velocities: domainVelocities,
    predicted_next: predictedNext,
    profile_type: profileType,
  };
}

// ════════════════════════════════════════════════════════
// MAIN TRAJECTORY PREDICTOR
// ════════════════════════════════════════════════════════

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

  // Compute decline profile for enriched output
  const declineProfile = computeDeclineProfile(history);

  return {
    predictions,
    velocity,
    model: primary,
    confidence: Math.round(trajectoryConfidence * 100) / 100,
    predicted_alert_12w: predictions[weeks - 1]?.alert_level || 'unknown',
    twin_trajectory: computeTwinTrajectory(currentDomains, weeks),
    decline_profile: declineProfile,
  };
}
