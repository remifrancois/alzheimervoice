/**
 * V3 CORE SCORING ALGORITHM
 *
 * The research IS the algorithm. No 1M-token inference needed.
 * Evidence-based weights, thresholds, and decision rules compiled
 * from 60+ studies into deterministic scoring functions.
 *
 * Pipeline:
 *   transcript → extract 47 features → compute z-scores from baseline
 *   → domain scores → composite score → differential diagnosis
 *   → cascade detection → alert level → trajectory prediction
 *
 * Cost: ~$0.08 per session (feature extraction via Claude)
 * vs V2: ~$3.00 per week (900K token inference)
 */

import { INDICATORS, ALL_INDICATOR_IDS, DOMAINS, DOMAIN_WEIGHTS, SENTINELS, EARLY_DETECTION_INDICATORS } from './indicators.js';

// ════════════════════════════════════════════════
// BASELINE COMPUTATION
// ════════════════════════════════════════════════

/**
 * Compute baseline statistics from calibration sessions.
 * Minimum 14 sessions, extensible to 21 for high-variance features.
 */
export function computeV3Baseline(sessionVectors, minSessions = 14) {
  if (sessionVectors.length < minSessions) {
    return { complete: false, sessions: sessionVectors.length, target: minSessions };
  }

  const baseline = {};
  const highVariance = [];

  for (const id of ALL_INDICATOR_IDS) {
    const values = sessionVectors.map(v => v[id]).filter(v => v != null);
    if (values.length < 3) {
      baseline[id] = { mean: 0.5, std: 0.05, n: 0 };
      continue;
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length) || 0.03;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const cv = mean > 0 ? std / mean : 0;

    baseline[id] = {
      mean, std: Math.max(std, 0.02), min, max, n: values.length, cv
    };

    if (cv > 0.3) highVariance.push(id);
  }

  return {
    complete: true,
    sessions: sessionVectors.length,
    vector: baseline,
    high_variance: highVariance,
    needs_extension: highVariance.length > 5 && sessionVectors.length < 21
  };
}

// ════════════════════════════════════════════════
// Z-SCORE COMPUTATION
// ════════════════════════════════════════════════

/**
 * Compute z-scores for a session vector against baseline.
 * Returns per-indicator z-scores with direction normalization.
 */
export function computeZScores(sessionVector, baseline) {
  const zScores = {};

  for (const id of ALL_INDICATOR_IDS) {
    const value = sessionVector[id];
    const base = baseline[id];

    if (value == null || !base) {
      zScores[id] = null;
      continue;
    }

    // Raw z-score
    const z = (value - base.mean) / (base.std || 0.05);

    // Direction normalization: negative z = decline regardless of raw direction
    // For indicators where UP = bad (e.g., pause ratio), invert the z-score
    const indicator = INDICATORS[id];
    const adDirection = indicator.directions?.alzheimer;

    // If AD direction is UP (bad increases), negative z is actually good, invert
    if (adDirection === 1) {
      zScores[id] = -z; // High value = bad → negative z = decline
    } else {
      zScores[id] = z;  // Low value = bad → negative z = decline
    }
  }

  return zScores;
}

// ════════════════════════════════════════════════
// DOMAIN & COMPOSITE SCORING
// ════════════════════════════════════════════════

/**
 * Compute per-domain scores from z-scores.
 * Each domain score is a weighted average of its indicators.
 */
export function computeDomainScores(zScores) {
  const scores = {};

  for (const [domain, indicatorIds] of Object.entries(DOMAINS)) {
    const validScores = [];

    for (const id of indicatorIds) {
      const z = zScores[id];
      if (z == null) continue;

      const weight = INDICATORS[id].base_weight || 0.5;
      validScores.push({ z, weight });
    }

    if (validScores.length === 0) {
      scores[domain] = null;
      continue;
    }

    const totalWeight = validScores.reduce((s, v) => s + v.weight, 0);
    scores[domain] = validScores.reduce((s, v) => s + v.z * v.weight, 0) / totalWeight;
  }

  return scores;
}

/**
 * Compute composite score from domain scores.
 */
export function computeComposite(domainScores) {
  let composite = 0;
  let totalWeight = 0;

  for (const [domain, weight] of Object.entries(DOMAIN_WEIGHTS)) {
    const score = domainScores[domain];
    if (score == null) continue;
    composite += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? composite / totalWeight * Object.keys(DOMAIN_WEIGHTS).length * 0.2 : 0;
}

// ════════════════════════════════════════════════
// ALERT LEVELS
// ════════════════════════════════════════════════

export const ALERT_THRESHOLDS = {
  green:  { min: -0.5, label: 'Normal variation' },
  yellow: { min: -1.0, label: 'Notable drift — monitor closely' },
  orange: { min: -1.5, label: 'Significant drift — recommend medical consultation' },
  red:    { min: -Infinity, label: 'Critical drift — urgent consultation' }
};

export function getAlertLevel(compositeScore) {
  if (compositeScore >= -0.5) return 'green';
  if (compositeScore >= -1.0) return 'yellow';
  if (compositeScore >= -1.5) return 'orange';
  return 'red';
}

// ════════════════════════════════════════════════
// CASCADE DETECTION (AD progression staging)
// ════════════════════════════════════════════════

/**
 * Detect AD cascade pattern from domain scores.
 * The cascade predicts disease stage:
 *   Stage 0: Pre-symptomatic (fluency micro-changes)
 *   Stage 1: Semantic involvement (lexical + coherence)
 *   Stage 2: Syntactic simplification
 *   Stage 3: Discourse collapse
 */
export function detectCascade(domainScores) {
  const patterns = [];
  const lex = domainScores.lexical ?? 0;
  const syn = domainScores.syntactic ?? 0;
  const sem = domainScores.semantic ?? 0;
  const tmp = domainScores.temporal ?? 0;
  const mem = domainScores.memory ?? 0;

  // Stage 0: Pre-symptomatic fluency (Young 2024)
  if (tmp < -0.3 && lex > -0.2 && sem > -0.2) {
    patterns.push({
      stage: 0, name: 'pre_symptomatic_fluency',
      description: 'Subtle fluency changes with preserved language — possible pre-symptomatic tau (Young 2024)',
      confidence: Math.min(Math.abs(tmp) / 0.5, 1),
      severity: Math.abs(tmp)
    });
  }

  // Stage 1: Semantic memory involvement (Fraser 2015)
  if ((lex < -0.5 || sem < -0.5) && (lex < -0.3 && sem < -0.3)) {
    patterns.push({
      stage: 1, name: 'semantic_memory_involvement',
      description: 'Lexical and semantic decline — core AD Stage 1 pattern (Fraser 2015)',
      confidence: Math.min((Math.abs(lex) + Math.abs(sem)) / 2, 1),
      severity: (Math.abs(lex) + Math.abs(sem)) / 2
    });
  }

  // Stage 2: Syntactic degradation added
  if (syn < -0.5 && patterns.some(p => p.stage === 1)) {
    patterns.push({
      stage: 2, name: 'syntactic_simplification',
      description: 'Syntactic decline on top of semantic — AD Stage 2 (Mueller 2018)',
      confidence: Math.min(Math.abs(syn) / 1.0, 1),
      severity: Math.abs(syn)
    });
  }

  // Stage 3: Discourse collapse
  if (sem < -1.0 && tmp < -0.5) {
    patterns.push({
      stage: 3, name: 'discourse_collapse',
      description: 'Coherence and fluency breakdown — AD Stage 3 (Fraser 2015)',
      confidence: Math.min((Math.abs(sem) + Math.abs(tmp)) / 3, 1),
      severity: (Math.abs(sem) + Math.abs(tmp)) / 2
    });
  }

  // Memory cascade (Grober & Buschke)
  if (mem < -0.5) {
    const memCascade = patterns.some(p => p.stage >= 1);
    if (memCascade) {
      patterns.push({
        stage: patterns[patterns.length - 1].stage,
        name: 'memory_cascade',
        description: 'Memory decline accelerating alongside language cascade',
        severity: Math.abs(mem)
      });
    }
  }

  return patterns.sort((a, b) => a.stage - b.stage);
}

// ════════════════════════════════════════════════
// CONFOUNDER ADJUSTMENT
// ════════════════════════════════════════════════

const CONFOUNDER_WEIGHTS = {
  illness:           { global: 0.5 },
  poor_sleep:        { global: 0.5 },
  medication_change: { global: 0.3 },
  emotional_distress: {
    domain_specific: {
      temporal: 0.5,
      memory: 1.2,
      semantic: 0.7,
      lexical: 1.0,
      syntactic: 1.0,
      discourse: 0.8,
      affective: 0.3
    }
  }
};

/**
 * Apply confounder weighting to z-scores.
 */
export function applyConfounders(zScores, domainScores, confounders = {}) {
  let globalWeight = 1.0;
  const domainAdjustments = {};

  for (const [confounder, active] of Object.entries(confounders)) {
    if (!active) continue;
    const config = CONFOUNDER_WEIGHTS[confounder];
    if (!config) continue;

    if (config.global) {
      globalWeight = Math.min(globalWeight, config.global);
    }
    if (config.domain_specific) {
      for (const [domain, adj] of Object.entries(config.domain_specific)) {
        domainAdjustments[domain] = (domainAdjustments[domain] || 1.0) * adj;
      }
    }
  }

  // Apply adjustments
  const adjusted = { ...domainScores };
  for (const [domain, score] of Object.entries(adjusted)) {
    if (score == null) continue;
    const domainAdj = domainAdjustments[domain] || 1.0;
    adjusted[domain] = score * globalWeight * domainAdj;
  }

  return { domainScores: adjusted, globalWeight, domainAdjustments };
}

// ════════════════════════════════════════════════
// FULL SESSION ANALYSIS PIPELINE
// ════════════════════════════════════════════════

/**
 * Run the complete V3 analysis pipeline on a session.
 * Returns everything needed for dashboard display.
 */
export function analyzeSession(sessionVector, baseline, confounders = {}, history = []) {
  // 1. Z-scores from baseline
  const zScores = computeZScores(sessionVector, baseline);

  // 2. Domain scores
  const rawDomainScores = computeDomainScores(zScores);

  // 3. Confounder adjustment
  const { domainScores, globalWeight } = applyConfounders(zScores, rawDomainScores, confounders);

  // 4. Composite score
  const composite = computeComposite(domainScores);

  // 5. Alert level
  const alertLevel = getAlertLevel(composite);

  // 6. Cascade detection
  const cascade = detectCascade(domainScores);

  // 7. Sentinel check (early warning indicators)
  const sentinelAlerts = checkSentinels(zScores);

  return {
    version: 'v3',
    composite,
    alert_level: alertLevel,
    domain_scores: domainScores,
    raw_domain_scores: rawDomainScores,
    z_scores: zScores,
    cascade,
    sentinel_alerts: sentinelAlerts,
    confounder_weight: globalWeight,
    indicator_count: Object.values(zScores).filter(v => v != null).length
  };
}

/**
 * Run weekly aggregation over 7 sessions.
 */
export function analyzeWeek(sessions, baseline, weekNumber) {
  if (sessions.length === 0) return null;

  const sessionResults = sessions.map(s =>
    analyzeSession(s.feature_vector, baseline, s.confounders)
  );

  // Weighted average domain scores
  const avgDomainScores = {};
  for (const domain of Object.keys(DOMAINS)) {
    const vals = sessionResults.map(r => r.domain_scores[domain]).filter(v => v != null);
    avgDomainScores[domain] = vals.length > 0
      ? vals.reduce((a, b) => a + b, 0) / vals.length
      : null;
  }

  const composite = computeComposite(avgDomainScores);
  const alertLevel = getAlertLevel(composite);
  const cascade = detectCascade(avgDomainScores);

  // Trend: compare to prior week if available
  const latestComposites = sessionResults.map(r => r.composite);
  const trend = latestComposites.length >= 2
    ? latestComposites[latestComposites.length - 1] - latestComposites[0]
    : 0;

  return {
    version: 'v3',
    week_number: weekNumber,
    composite,
    alert_level: alertLevel,
    domain_scores: avgDomainScores,
    cascade,
    sessions_analyzed: sessions.length,
    trend: Math.round(trend * 1000) / 1000,
    session_composites: latestComposites.map(c => Math.round(c * 1000) / 1000)
  };
}

// ════════════════════════════════════════════════
// SENTINEL CHECKING
// ════════════════════════════════════════════════

/**
 * Check early-warning sentinel indicators.
 * These fire independently of composite score.
 */
function checkSentinels(zScores) {
  const alerts = [];

  for (const [condition, sentinelIds] of Object.entries(SENTINELS)) {
    let triggered = 0;
    const details = [];

    for (const id of sentinelIds) {
      const z = zScores[id];
      if (z == null) continue;

      const threshold = condition === 'alzheimer' ? -0.5 : -0.4;
      if (z < threshold) {
        triggered++;
        details.push({ indicator: id, z_score: Math.round(z * 100) / 100, name: INDICATORS[id].name });
      }
    }

    if (triggered >= 2) {
      alerts.push({
        condition,
        triggered_count: triggered,
        total_sentinels: sentinelIds.length,
        details,
        confidence: Math.min(triggered / sentinelIds.length, 1)
      });
    }
  }

  return alerts;
}
