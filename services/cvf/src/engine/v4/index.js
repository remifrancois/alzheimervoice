/**
 * V4 CVF ENGINE — Public API
 *
 * Two-stream architecture:
 *   DAILY TEXT  → Sonnet extraction + deterministic scoring ($0.07/session)
 *   DAILY AUDIO → parselmouth + librosa + nolds acoustic pipeline ($0.00)
 *   WEEKLY      → Opus 4.6 deep clinical reasoning ($0.30-0.50/week)
 *   MICRO-TASKS → Targeted cognitive/motor assessment (sustained vowel, DDK, fluency, depression)
 *
 * 85 indicators across 9 domains, 8-condition differential, 23 diagnostic rules.
 * Platform-ready: register v4ApiPlugin with your Fastify instance.
 */

// Core algorithm (9-domain scoring)
export {
  computeV4Baseline,
  computeZScores,
  computeDomainScores,
  computeComposite,
  getAlertLevel,
  detectCascade,
  applyConfounders,
  checkSentinels,
  computeDeclineProfile,
  analyzeSession,
  analyzeWeek,
  ALERT_THRESHOLDS,
} from './algorithm.js';

// Differential diagnosis (23-rule engine, 8 conditions)
export {
  runDifferential,
  detectTemporalPattern,
  detectADCascade,
  generateRecommendation,
} from './differential.js';

// Trajectory prediction (12-week forecast) + decline profiling
export {
  predictTrajectory,
  computeDeclineProfile as computeTrajectoryDeclineProfile,
} from './trajectory.js';

// Text feature extraction (Sonnet daily — 64 text indicators)
export {
  extractV4Features,
  extractV4EarlyDetection,
  buildV4ExtractionPrompt,
} from './text-extractor.js';

// Acoustic pipeline (parselmouth + librosa + nolds — 21 audio indicators)
export {
  extractAcousticFeatures,
  extractMicroTaskAudio,
  convertToWav,
  normalizeAcousticValue,
  cleanup as cleanupAudioTemp,
} from './acoustic-pipeline.js';

// PD-specific analysis engine
export {
  detectPDSignature,
  classifyPDSubtype,
  differentiateParkinsonism,
  stagePD,
  predictUPDRS,
  getPDCascade,
  runPDAnalysis,
} from './pd-engine.js';

// Micro-tasks (sustained vowel, DDK, category fluency, depression screen)
export {
  MICRO_TASKS,
  getScheduledTasks,
  scoreMicroTask,
  analyzeCategoryFluency,
  embedTaskPrompt,
} from './micro-tasks.js';

// Weekly deep analysis (Opus 4.6 — enhanced with acoustic + PD + micro-tasks)
export {
  runWeeklyDeepAnalysis,
  loadWeeklyReport,
  listWeeklyReports,
} from './weekly-deep.js';

// Indicator definitions (85 indicators, 9 domains)
export {
  INDICATORS,
  ALL_INDICATOR_IDS,
  INDICATOR_COUNT,
  DOMAINS,
  DOMAIN_WEIGHTS,
  TEXT_INDICATORS,
  AUDIO_INDICATORS,
  MICRO_TASK_INDICATORS,
  EARLY_DETECTION_INDICATORS,
  SENTINELS,
  ACOUSTIC_NORMS,
} from './indicators.js';

/**
 * V4 version info.
 */
export const V4_META = {
  version: '4.0.0',
  codename: 'two_stream',
  indicator_count: 85,
  domains: 9,
  conditions_detected: 8,
  differential_rules: 23,
  studies_referenced: 80,
  architecture: {
    daily_text: { model: 'claude-sonnet-4-5-20250929', cost: '$0.07/session', indicators: 64 },
    daily_audio: { engine: 'parselmouth+librosa+nolds', cost: '$0.00', indicators: 21 },
    weekly: { model: 'claude-opus-4-6', cost: '$0.30-0.50', thinking_budget: 20000 },
    micro_tasks: ['sustained_vowel', 'ddk', 'category_fluency', 'depression_screen'],
  },
  cost: { daily: '$0.08-0.12', weekly_opus: '$0.30-0.50', weekly_total: '$0.80-1.00/patient' },
  new_in_v4: [
    'acoustic_pipeline', 'pd_motor_domain', 'nonlinear_dynamics',
    'micro_tasks', 'parkinsonian_differential', 'decline_profiling',
    '23_differential_rules', '85_indicators', '9_domains',
  ],
};
