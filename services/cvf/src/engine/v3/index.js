/**
 * V3 CVF ENGINE — Public API
 *
 * Two-tier architecture:
 *   DAILY  → Sonnet extraction + deterministic scoring ($0.05/session)
 *   WEEKLY → Opus 4.6 deep clinical reasoning ($0.30-0.50/week)
 *
 * Platform-ready: register v3ApiPlugin with your Fastify instance.
 */

// Core algorithm
export {
  computeV3Baseline,
  computeZScores,
  computeDomainScores,
  computeComposite,
  getAlertLevel,
  detectCascade,
  applyConfounders,
  analyzeSession,
  analyzeWeek,
  ALERT_THRESHOLDS,
} from './algorithm.js';

// Differential diagnosis
export { runDifferential } from './differential.js';

// Trajectory prediction
export { predictTrajectory } from './trajectory.js';

// Feature extraction (Sonnet daily, Opus weekly)
export {
  extractFeatures as extractV3Features,
  extractEarlyDetection,
} from './feature-extractor.js';

// Weekly deep analysis (Opus 4.6)
export {
  runWeeklyDeepAnalysis,
  loadWeeklyReport,
  listWeeklyReports,
} from './weekly-deep.js';

// Indicator definitions
export {
  INDICATORS,
  ALL_INDICATOR_IDS,
  INDICATOR_COUNT,
  DOMAINS,
  DOMAIN_WEIGHTS,
  TEXT_INDICATORS,
  EARLY_DETECTION_INDICATORS,
  SENTINELS,
} from './indicators.js';

/**
 * V3 version info.
 */
export const V3_META = {
  version: '3.0.0',
  indicator_count: 47,
  domains: 7,
  conditions: 6,
  studies_referenced: 60,
  architecture: {
    daily: { model: 'claude-sonnet-4-5-20250929', cost: '$0.05/session', purpose: 'Feature extraction + algorithmic drift scoring' },
    weekly: { model: 'claude-opus-4-6', cost: '$0.30-0.50/analysis', purpose: 'Deep clinical reasoning, narrative generation, probe design' },
  },
  total_weekly_cost: '$0.65-0.85/patient (7 daily + 1 weekly)',
  paradigm: 'evidence_compiled + deep_validation',
  description: 'Daily Sonnet extracts 47 features → deterministic scoring. Weekly Opus validates differential, generates narratives, designs probes.'
};
