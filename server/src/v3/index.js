/**
 * V3 CVF ENGINE — Public API
 *
 * The evidence-based cognitive voice fingerprint engine.
 * 47 indicators, 6-condition differential, cascade detection,
 * trajectory prediction — all without 1M token inference.
 *
 * Usage:
 *   import { v3 } from './v3/index.js';
 *   const result = v3.analyzeSession(vector, baseline, confounders);
 *   const diff = v3.differential(result.domain_scores, result.z_scores, context);
 *   const trajectory = v3.predict(weeklyHistory, diff, result.cascade);
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
export {
  runDifferential,
} from './differential.js';

// Trajectory prediction
export {
  predictTrajectory,
} from './trajectory.js';

// Feature extraction (the only LLM call)
export {
  extractFeatures as extractV3Features,
  extractEarlyDetection,
} from './feature-extractor.js';

// Indicator definitions (the knowledge graph in code)
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
  extraction_model: 'claude-sonnet-4-5-20250929',
  extraction_cost_per_session: '$0.05-0.08',
  inference_requires_llm: false,
  paradigm: 'evidence_compiled_algorithm',
  description: 'Research IS the algorithm. 60+ studies compiled into deterministic scoring, differential, and prediction. LLM used only for feature extraction.'
};
