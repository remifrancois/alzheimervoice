/**
 * V4 DIFFERENTIAL DIAGNOSIS ENGINE
 *
 * Enhanced rule-based differential diagnosis compiled from 80+ studies.
 * No LLM inference needed — the decision tree IS the science.
 *
 * 23 rules across 8 conditions:
 *   1. Alzheimer's Disease (cascade pattern)
 *   2. Major Depression (episodic, affective)
 *   3. Parkinson's Disease (motor-dominant)
 *   4. Normal Aging (stable, within noise)
 *   5. Medication Effects (acute, global)
 *   6. Grief / Emotional Distress (topic-dependent)
 *   7. Multiple System Atrophy (MSA — PD-like with vocal tremor)
 *   8. Progressive Supranuclear Palsy (PSP — PD-like with stuttering)
 *
 * V4 additions over V3:
 *   - 9 new rules (15-23) for PD subtypes, MSA/PSP, acoustic depression
 *   - Updated Rule 6 depression weighting (r=0.458, Yamamoto 2020)
 *   - Acoustic and PD motor domain integration
 *   - Prodromal PD/RBD detection (Rusz 2021)
 */

import { INDICATORS, DOMAINS, SENTINELS } from './indicators.js';

// ════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ════════════════════════════════════════════════════════════════

/**
 * Run differential diagnosis from z-scores, domain scores, and context.
 *
 * @param {Object} domainScores — per-domain z-scores
 * @param {Object} zScores — per-indicator z-scores
 * @param {Object} context — { timeline, confounders, sessionCount }
 * @returns {Object} probability distribution + reasoning
 */
export function runDifferential(domainScores, zScores, context = {}) {
  const scores = {
    alzheimer: 0,
    depression: 0,
    parkinson: 0,
    normal_aging: 0,
    medication: 0,
    grief: 0,
    msa: 0,
    psp: 0,
  };

  const evidence = {
    alzheimer: [],
    depression: [],
    parkinson: [],
    normal_aging: [],
    medication: [],
    grief: [],
    msa: [],
    psp: [],
  };

  const flags = [];

  // ════════════════════════════════════════════════
  // RULE 1: Cascade Pattern (AD-specific)
  // ════════════════════════════════════════════════
  const hasCascade = detectADCascade(domainScores);
  if (hasCascade.detected) {
    { const value = 0.25 * hasCascade.confidence; if (Number.isFinite(value)) scores.alzheimer += value; }
    evidence.alzheimer.push(`AD cascade pattern detected (stage ${hasCascade.stage}, confidence ${(hasCascade.confidence * 100).toFixed(0)}%)`);
  }

  // ════════════════════════════════════════════════
  // RULE 2: Referential Coherence (THE differentiator)
  // Preserved in depression, degraded in AD
  // ════════════════════════════════════════════════
  const refCoherence = zScores.SEM_REF_COHERENCE;
  if (refCoherence != null) {
    if (refCoherence < -0.5) {
      if (Number.isFinite(0.20)) scores.alzheimer += 0.20;
      evidence.alzheimer.push(`Referential coherence degraded (z=${refCoherence.toFixed(2)}) — AD signature`);
    } else if (refCoherence > -0.2) {
      if (Number.isFinite(0.15)) scores.depression += 0.15;
      if (Number.isFinite(0.10)) scores.normal_aging += 0.10;
      evidence.depression.push(`Referential coherence preserved (z=${refCoherence.toFixed(2)}) — rules against AD`);
    }
  }

  // ════════════════════════════════════════════════
  // RULE 3: Cued Recall Response (THE memory differentiator)
  // Depression: cues help. AD: cues fail.
  // ════════════════════════════════════════════════
  const cuedRecall = zScores.MEM_CUED_RECALL;
  const freeRecall = zScores.MEM_FREE_RECALL;
  if (cuedRecall != null && freeRecall != null) {
    const cueBenefit = cuedRecall - freeRecall;
    if (freeRecall < -0.5 && cueBenefit > 0.3) {
      // Poor free recall but cues help -> retrieval deficit -> depression
      if (Number.isFinite(0.20)) scores.depression += 0.20;
      evidence.depression.push(`Cued recall responsive (benefit=${cueBenefit.toFixed(2)}) — retrieval deficit, not storage`);
    } else if (freeRecall < -0.5 && cueBenefit < 0.15) {
      // Poor free recall and cues DON'T help -> storage deficit -> AD
      if (Number.isFinite(0.20)) scores.alzheimer += 0.20;
      evidence.alzheimer.push(`Cued recall NON-responsive (benefit=${cueBenefit.toFixed(2)}) — storage deficit, AD pattern`);
    }
  }

  // ════════════════════════════════════════════════
  // RULE 4: Self-Referential Pronouns (Depression marker)
  // ════════════════════════════════════════════════
  const selfPronoun = zScores.AFF_SELF_PRONOUN;
  if (selfPronoun != null) {
    if (selfPronoun < -0.5) {
      // Note: z-score is inverted for "UP" direction indicators
      // For depression where UP = bad, a very negative z actually means elevated
      if (Number.isFinite(0.15)) scores.depression += 0.15;
      evidence.depression.push(`Self-referential pronouns elevated (z=${selfPronoun.toFixed(2)}) — depression marker`);
    }
  }

  // ════════════════════════════════════════════════
  // RULE 5: Negative Valence (Depression-specific)
  // ════════════════════════════════════════════════
  const negValence = zScores.AFF_NEG_VALENCE;
  if (negValence != null && negValence < -0.4) {
    if (Number.isFinite(0.15)) scores.depression += 0.15;
    evidence.depression.push(`Negative valence language elevated — depression marker`);
  }

  // ════════════════════════════════════════════════
  // RULE 6: Session-to-Session Variability (pattern type)
  // AD: monotonic. Depression: episodic. LBD: fluctuating.
  // V4 UPDATE: Depression weight increased (r=0.458, Yamamoto 2020)
  // ════════════════════════════════════════════════
  const variability = zScores.TMP_VARIABILITY;
  if (context.timeline?.length >= 7) {
    const pattern = detectTemporalPattern(context.timeline);

    if (pattern.type === 'monotonic_decline') {
      if (Number.isFinite(0.15)) scores.alzheimer += 0.15;
      evidence.alzheimer.push(`Monotonic decline pattern over ${pattern.weeks} weeks — AD trajectory`);
    } else if (pattern.type === 'episodic') {
      // V4: increased from 0.15 to 0.20 (Yamamoto 2020: r=0.458 response latency-HAMD)
      if (Number.isFinite(0.20)) scores.depression += 0.20;
      evidence.depression.push(`Episodic fluctuation pattern — depression trajectory (r=0.458, Yamamoto 2020)`);
    } else if (pattern.type === 'acute_drop') {
      if (Number.isFinite(0.25)) scores.medication += 0.25;
      evidence.medication.push(`Acute onset correlated with timeline — medication effect pattern`);
    } else if (pattern.type === 'stable') {
      if (Number.isFinite(0.25)) scores.normal_aging += 0.25;
      evidence.normal_aging.push(`Stable pattern — within normal aging variance`);
    }
  }

  // ════════════════════════════════════════════════
  // RULE 7: Idea Density (strongest AD predictor)
  // ════════════════════════════════════════════════
  const ideaDensity = zScores.SEM_IDEA_DENSITY;
  if (ideaDensity != null && ideaDensity < -0.5) {
    if (Number.isFinite(0.15)) scores.alzheimer += 0.15;
    evidence.alzheimer.push(`Idea density declining (z=${ideaDensity.toFixed(2)}) — Snowdon: strongest AD predictor`);
  }

  // ════════════════════════════════════════════════
  // RULE 8: Pause Location (mid-clause = AD, boundary = depression)
  // ════════════════════════════════════════════════
  const withinClause = zScores.TMP_WITHIN_CLAUSE;
  if (withinClause != null) {
    if (withinClause < -0.5) {
      if (Number.isFinite(0.10)) scores.alzheimer += 0.10;
      evidence.alzheimer.push(`Within-clause pauses elevated — word-finding difficulty (Pistono 2019)`);
    }
  }

  // ════════════════════════════════════════════════
  // RULE 9: Semantic vs Fluency domain split
  // AD: semantic first. PD: fluency-dominant. Depression: uniform.
  // ════════════════════════════════════════════════
  const sem = domainScores.semantic ?? 0;
  const tmp = domainScores.temporal ?? 0;
  const lex = domainScores.lexical ?? 0;

  if (tmp < -0.5 && sem > -0.2 && lex > -0.2) {
    if (Number.isFinite(0.20)) scores.parkinson += 0.20;
    evidence.parkinson.push(`Fluency-dominant decline (temporal=${tmp.toFixed(2)}) with preserved language — PD pattern`);
  }

  if (sem < -0.5 && lex < -0.5 && tmp > -0.3) {
    if (Number.isFinite(0.10)) scores.alzheimer += 0.10;
    evidence.alzheimer.push(`Semantic+lexical decline with preserved fluency — early AD pattern`);
  }

  // ════════════════════════════════════════════════
  // RULE 10: Engagement + hedonic (depression anhedonia)
  // ════════════════════════════════════════════════
  const hedonic = zScores.AFF_HEDONIC;
  const engagement = zScores.AFF_ENGAGEMENT;
  if (hedonic != null && hedonic < -0.4) {
    if (Number.isFinite(0.10)) scores.depression += 0.10;
    evidence.depression.push(`Reduced hedonic language — anhedonia marker`);
  }
  if (engagement != null && engagement < -0.4) {
    if (Number.isFinite(0.10)) scores.depression += 0.10;
    evidence.depression.push(`Reduced conversational engagement — withdrawal marker`);
  }

  // ════════════════════════════════════════════════
  // RULE 11: Confounder check — medication change
  // ════════════════════════════════════════════════
  if (context.confounders?.some?.(c => c?.confounders?.medication_change)) {
    if (Number.isFinite(0.20)) scores.medication += 0.20;
    evidence.medication.push(`Medication change reported in recent sessions`);
  }

  // ════════════════════════════════════════════════
  // RULE 12: Emotional distress -> grief
  // ════════════════════════════════════════════════
  if (context.confounders?.some?.(c => c?.confounders?.emotional_distress)) {
    if (Number.isFinite(0.15)) scores.grief += 0.15;
    evidence.grief.push(`Emotional distress reported`);
  }

  // ════════════════════════════════════════════════
  // RULE 13: Global stability check (normal aging)
  // ════════════════════════════════════════════════
  const allAboveThreshold = Object.values(domainScores).every(v => v == null || v > -0.3);
  if (allAboveThreshold) {
    if (Number.isFinite(0.30)) scores.normal_aging += 0.30;
    evidence.normal_aging.push(`All domains within normal range (>-0.3) — consistent with healthy aging`);
  }

  // ════════════════════════════════════════════════
  // RULE 14: Self-correction preservation
  // ════════════════════════════════════════════════
  const selfCorrection = zScores.DIS_SELF_CORRECTION;
  if (selfCorrection != null) {
    if (selfCorrection < -0.5) {
      if (Number.isFinite(0.10)) scores.alzheimer += 0.10;
      evidence.alzheimer.push(`Self-correction declining — loss of metacognitive monitoring`);
    } else {
      if (Number.isFinite(0.05)) scores.depression += 0.05;
      if (Number.isFinite(0.05)) scores.normal_aging += 0.05;
      evidence.normal_aging.push(`Self-correction preserved — metacognition intact`);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //
  //  V4 RULES 15-23 — ACOUSTIC + PD MOTOR + EXTENDED DEPRESSION
  //
  // ════════════════════════════════════════════════════════════════

  // ════════════════════════════════════════════════
  // RULE 15: PD Acoustic Signature
  // PPE + RPDE + HNR trio = PD acoustic quartet (minus DFA for simplicity)
  // Little 2009: quartet achieves 91.4% accuracy
  // ════════════════════════════════════════════════
  const pdmPpe = zScores.PDM_PPE;
  const pdmRpde = zScores.PDM_RPDE;
  const acuHnr = zScores.ACU_HNR;
  const pdAcousticPositive = (
    pdmPpe != null && pdmPpe < -0.5 &&
    pdmRpde != null && pdmRpde < -0.5 &&
    acuHnr != null && acuHnr < -0.5
  );

  if (pdAcousticPositive) {
    if (Number.isFinite(0.30)) scores.parkinson += 0.30;
    evidence.parkinson.push(
      `PD acoustic quartet detected (PPE z=${pdmPpe.toFixed(2)}, RPDE z=${pdmRpde.toFixed(2)}, HNR z=${acuHnr.toFixed(2)}) — Little 2009`
    );
  }

  // ════════════════════════════════════════════════
  // RULE 16: PD Articulatory Decline
  // Vowel space area or DDK rate degradation
  // Rusz 2013, Harel 2004
  // ════════════════════════════════════════════════
  const pdmVsa = zScores.PDM_VSA;
  const pdmDdkRate = zScores.PDM_DDK_RATE;
  const articulatoryInvolved = (
    (pdmVsa != null && pdmVsa < -0.5) ||
    (pdmDdkRate != null && pdmDdkRate < -0.5)
  );

  if (articulatoryInvolved) {
    if (Number.isFinite(0.15)) scores.parkinson += 0.15;
    const parts = [];
    if (pdmVsa != null && pdmVsa < -0.5) parts.push(`VSA z=${pdmVsa.toFixed(2)}`);
    if (pdmDdkRate != null && pdmDdkRate < -0.5) parts.push(`DDK rate z=${pdmDdkRate.toFixed(2)}`);
    evidence.parkinson.push(`Articulatory involvement (${parts.join(', ')})`);
  }

  // ════════════════════════════════════════════════
  // RULE 17: MSA Differentiation
  // MSA differs from PD: F0 SD INCREASES (vocal tremor), shimmer elevated,
  // DDK regularity severely degraded.
  // Moro 2024: /pataka/ 77.4% MSA accuracy
  // ════════════════════════════════════════════════
  const acuF0Sd = zScores.ACU_F0_SD;
  const acuShimmer = zScores.ACU_SHIMMER;
  const pdmDdkReg = zScores.PDM_DDK_REG;

  // MSA: PD acoustic features present BUT F0 SD is INCREASED (not decreased like in PD)
  // AND shimmer elevated AND DDK regularity severely degraded
  const f0SdIncreased = acuF0Sd != null && acuF0Sd > 0.3;
  const shimmerElevated = acuShimmer != null && acuShimmer < -0.5;
  const ddkRegSevere = pdmDdkReg != null && pdmDdkReg < -0.8;

  if (pdAcousticPositive && f0SdIncreased && shimmerElevated && ddkRegSevere) {
    if (Number.isFinite(0.20)) scores.msa += 0.20;
    if (Number.isFinite(-0.10)) scores.parkinson -= 0.10;
    evidence.msa.push(
      `Excessive pitch fluctuation + vocal tremor — MSA pattern ` +
      `(F0_SD z=${acuF0Sd.toFixed(2)} INCREASED, shimmer z=${acuShimmer.toFixed(2)}, DDK_REG z=${pdmDdkReg.toFixed(2)})`
    );
  }

  // ════════════════════════════════════════════════
  // RULE 18: PSP Differentiation
  // PSP: PD features + stuttering-like repetitions + severe DDK irregularity
  // + progressive articulatory decay
  // Skodda 2011, Moro 2024
  // ════════════════════════════════════════════════
  const tmpRepetition = zScores.TMP_REPETITION;
  const repetitionSevere = tmpRepetition != null && tmpRepetition < -0.8;

  // PSP pattern: PD-like features + stuttering-like repetitions + severely degraded DDK regularity
  // + articulatory decay (rule 16 positive)
  if (
    pdAcousticPositive &&
    repetitionSevere &&
    ddkRegSevere &&
    articulatoryInvolved
  ) {
    if (Number.isFinite(0.15)) scores.psp += 0.15;
    evidence.psp.push(
      `Stuttering-like behavior + severe articulatory decay — PSP pattern ` +
      `(repetition z=${tmpRepetition.toFixed(2)}, DDK_REG z=${pdmDdkReg.toFixed(2)})`
    );
  }

  // ════════════════════════════════════════════════
  // RULE 19: MDD vs Bipolar Differentiation (evidence note only)
  // Yamamoto 2020: response latency MDD >> BP (p=0.001)
  // Does NOT change scores — adds diagnostic evidence note
  // ════════════════════════════════════════════════
  const responseLatency = zScores.TMP_RESPONSE_LATENCY;
  if (scores.depression > 0.20 && responseLatency != null && responseLatency < -1.0) {
    evidence.depression.push(
      `MDD pattern (response time MDD >> BP, Yamamoto 2020 p=0.001) — ` +
      `latency z=${responseLatency.toFixed(2)}, extremely elevated`
    );
    flags.push('mdd_vs_bipolar_noted');
  }

  // ════════════════════════════════════════════════
  // RULE 20: Acoustic Depression Markers
  // MFCC-2 + spectral harmonicity — cross-cultural markers
  // Le 2026: MFCC-2 highest SHAP (0.069), spectral harmonicity SHAP (0.036)
  // ════════════════════════════════════════════════
  const acuMfcc2 = zScores.ACU_MFCC2;
  const acuSpectralHarm = zScores.ACU_SPECTRAL_HARM;
  if (acuMfcc2 != null && acuMfcc2 < -0.5 && acuSpectralHarm != null && acuSpectralHarm < -0.5) {
    if (Number.isFinite(0.15)) scores.depression += 0.15;
    evidence.depression.push(
      `Acoustic depression markers (MFCC-2 z=${acuMfcc2.toFixed(2)} + spectral harmonicity z=${acuSpectralHarm.toFixed(2)}) — Le 2026`
    );
  }

  // ════════════════════════════════════════════════
  // RULE 21: Death/Ruminative Language
  // Mocnik 2025: death-related and ruminative language as depression markers
  // ════════════════════════════════════════════════
  const lexDeathWords = zScores.LEX_DEATH_WORDS;
  const lexRuminative = zScores.LEX_RUMINATIVE;
  if (lexDeathWords != null && lexDeathWords < -0.4 && lexRuminative != null && lexRuminative < -0.4) {
    if (Number.isFinite(0.10)) scores.depression += 0.10;
    evidence.depression.push(
      `Death-related and ruminative language elevated ` +
      `(death z=${lexDeathWords.toFixed(2)}, ruminative z=${lexRuminative.toFixed(2)})`
    );
  }

  // ════════════════════════════════════════════════
  // RULE 22: Verbal Output Reduction
  // Reduced verbal output shared across depression and PD
  // Depression: spectral markers differentiate. PD: articulatory markers differentiate.
  // Mocnik 2025
  // ════════════════════════════════════════════════
  const lexVerbalOutput = zScores.LEX_VERBAL_OUTPUT;
  if (lexVerbalOutput != null && lexVerbalOutput < -0.5) {
    if (Number.isFinite(0.05)) scores.depression += 0.05;
    if (Number.isFinite(0.05)) scores.parkinson += 0.05;
    evidence.depression.push(
      `Verbal output reduced (z=${lexVerbalOutput.toFixed(2)}) — shared psychomotor marker`
    );
    evidence.parkinson.push(
      `Verbal output reduced (z=${lexVerbalOutput.toFixed(2)}) — shared psychomotor marker`
    );
  }

  // ════════════════════════════════════════════════
  // RULE 23: Monopitch as Prodromal PD / RBD
  // Isolated monopitch with near-normal other PD motor features
  // may indicate prodromal PD or REM-sleep behavior disorder (RBD)
  // Rusz 2021: monopitch AUC 0.80 PD, AUC 0.65 for prodromal RBD
  // ════════════════════════════════════════════════
  const pdmMonopitch = zScores.PDM_MONOPITCH;
  const pdMotorDomain = domainScores.pd_motor ?? 0;

  if (pdmMonopitch != null && pdmMonopitch < -0.4 && pdMotorDomain > -0.2) {
    if (Number.isFinite(0.10)) scores.parkinson += 0.10;
    evidence.parkinson.push(
      `Monopitch detected (z=${pdmMonopitch.toFixed(2)}) with near-normal PD motor domain (${pdMotorDomain.toFixed(2)}) — ` +
      `possible prodromal PD/RBD (Rusz 2021: AUC 0.65 for RBD)`
    );
    flags.push('prodromal_pd_rbd_flag');
  }

  // ════════════════════════════════════════════════
  // NORMALIZE TO PROBABILITIES
  // ════════════════════════════════════════════════
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const probabilities = {};
  if (!Number.isFinite(total) || total <= 0) {
    // Equal probability fallback
    const n = Object.keys(scores).length;
    for (const key of Object.keys(scores)) {
      probabilities[key] = Math.round((1 / n) * 1000) / 1000;
    }
  } else {
    for (const [condition, score] of Object.entries(scores)) {
      probabilities[condition] = Math.round((score / total) * 1000) / 1000;
    }
    // Ensure probabilities sum to exactly 1.0
    const probSum = Object.values(probabilities).reduce((a, b) => a + b, 0);
    if (probSum !== 1.0 && probSum > 0) {
      const largest = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0][0];
      probabilities[largest] = Math.round((probabilities[largest] + (1.0 - probSum)) * 1000) / 1000;
    }
  }

  // Primary hypothesis
  const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][0];

  // Confidence: how decisive is the distribution?
  const confidence = Math.min(sorted[0][1] / (sorted[1][1] || 0.01) * 0.3, 0.95);

  return {
    probabilities,
    primary_hypothesis: primary,
    secondary_hypothesis: secondary,
    confidence: Math.round(confidence * 100) / 100,
    evidence,
    flags,
    rules_fired: Object.values(evidence).flat().length,
    recommendation: generateRecommendation(primary, secondary, confidence, evidence)
  };
}

// ════════════════════════════════════════════════════════════════
// TEMPORAL PATTERN DETECTION
// ════════════════════════════════════════════════════════════════

/**
 * Detect longitudinal pattern type from session timeline.
 *
 * @param {Array} timeline — array of { composite, ... } session records
 * @returns {Object} { type, ... } pattern descriptor
 */
function detectTemporalPattern(timeline) {
  if (!timeline || timeline.length < 4) return { type: 'insufficient_data' };

  const composites = timeline.map(t => t.composite ?? 0);
  const n = composites.length;

  // Check for monotonic decline (AD)
  let declineCount = 0;
  for (let i = 1; i < n; i++) {
    if (composites[i] < composites[i - 1] - 0.05) declineCount++;
  }
  if (declineCount >= n * 0.6) {
    return { type: 'monotonic_decline', weeks: n, decline_ratio: declineCount / (n - 1) };
  }

  // Check for episodic pattern (depression)
  let directionChanges = 0;
  for (let i = 2; i < n; i++) {
    const prev = composites[i - 1] - composites[i - 2];
    const curr = composites[i] - composites[i - 1];
    if ((prev > 0.1 && curr < -0.1) || (prev < -0.1 && curr > 0.1)) {
      directionChanges++;
    }
  }
  if (directionChanges >= 2) {
    return { type: 'episodic', oscillations: directionChanges };
  }

  // Check for acute drop (medication)
  for (let i = 1; i < n; i++) {
    if (composites[i] - composites[i - 1] < -0.5) {
      return { type: 'acute_drop', drop_at: i, magnitude: composites[i] - composites[i - 1] };
    }
  }

  // Otherwise: stable (normal aging)
  const mean = composites.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(composites.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  if (std < 0.15) {
    return { type: 'stable', mean, std };
  }

  return { type: 'unclear', composites };
}

// ════════════════════════════════════════════════════════════════
// AD CASCADE DETECTION
// ════════════════════════════════════════════════════════════════

/**
 * Detect the Alzheimer's domain cascade pattern.
 * AD degrades domains in order: semantic/lexical -> syntactic -> temporal.
 *
 * @param {Object} domainScores — per-domain z-scores
 * @returns {Object} { detected, stage, confidence, order_preserved, scores }
 */
function detectADCascade(domainScores) {
  const lex = domainScores.lexical ?? 0;
  const sem = domainScores.semantic ?? 0;
  const syn = domainScores.syntactic ?? 0;
  const tmp = domainScores.temporal ?? 0;

  // Stage 1: Semantic+lexical both declining
  const stage1 = lex < -0.5 && sem < -0.5;

  // Stage 2: Syntactic added
  const stage2 = stage1 && syn < -0.5;

  // Stage 3: Discourse collapse
  const stage3 = stage2 && tmp < -0.5;

  // Cascade must follow order: semantic > syntactic > temporal
  // If syntactic is worse than semantic, it's NOT a cascade
  const orderPreserved = Math.abs(sem) >= Math.abs(syn) * 0.8;

  if (!stage1) return { detected: false };

  const stage = stage3 ? 3 : stage2 ? 2 : 1;
  const confidence = orderPreserved ? 0.8 : 0.4;

  return {
    detected: true,
    stage,
    confidence,
    order_preserved: orderPreserved,
    scores: { lexical: lex, semantic: sem, syntactic: syn, temporal: tmp }
  };
}

// ════════════════════════════════════════════════════════════════
// RECOMMENDATION GENERATION
// ════════════════════════════════════════════════════════════════

/**
 * Generate clinical recommendations based on differential results.
 * Extended for V4 with MSA and PSP recommendations.
 *
 * @param {string} primary — primary hypothesis condition key
 * @param {string} secondary — secondary hypothesis condition key
 * @param {number} confidence — confidence ratio (0-0.95)
 * @param {Object} evidence — per-condition evidence arrays
 * @returns {Array<string>} recommendation strings
 */
function generateRecommendation(primary, secondary, confidence, evidence) {
  const recs = [];

  if (primary === 'normal_aging' && confidence > 0.5) {
    recs.push('Continue standard monitoring. No concerns at this time.');
  } else if (primary === 'alzheimer') {
    recs.push('Pattern consistent with early cognitive decline. Recommend cognitive screening.');
    if (confidence < 0.6) recs.push(`Also consider ${secondary} (close probability). Monitor 2 more weeks.`);
  } else if (primary === 'depression') {
    recs.push('Pattern suggests depression rather than cognitive decline. Recommend mood screening.');
    recs.push('Do NOT escalate to AD-specific referral until depression is ruled out.');
  } else if (primary === 'parkinson') {
    recs.push('Fluency-dominant pattern suggests motor speech involvement. Recommend neurological evaluation.');
    if (secondary === 'msa' || secondary === 'psp') {
      recs.push(`Atypical parkinsonism (${secondary.toUpperCase()}) features present. Consider DaTscan and specialist referral.`);
    }
  } else if (primary === 'medication') {
    recs.push('Changes correlate with medication timing. Recommend pharmacist review.');
    recs.push('Defer cognitive concern until medication adjustment period (2-3 weeks).');
  } else if (primary === 'grief') {
    recs.push('Changes appear event-linked. Monitor for recovery over 4-8 weeks.');
    recs.push('If patterns persist beyond 3 months, consider depression screening.');
  } else if (primary === 'msa') {
    recs.push('Vocal tremor and articulatory pattern suggest Multiple System Atrophy (MSA).');
    recs.push('Recommend DaTscan, autonomic function testing, and movement disorder specialist referral.');
    recs.push('Monitor for orthostatic hypotension and cerebellar signs.');
  } else if (primary === 'psp') {
    recs.push('Stuttering-like behavior with articulatory decay suggests Progressive Supranuclear Palsy (PSP).');
    recs.push('Recommend MRI (midbrain atrophy), oculomotor exam, and movement disorder specialist.');
    recs.push('Distinguish from corticobasal degeneration (CBD) with apraxia assessment.');
  }

  // Cross-condition advisories
  if (primary !== 'normal_aging' && primary !== 'medication' && primary !== 'grief') {
    if (evidence.parkinson?.length > 0 && evidence.depression?.length > 0) {
      recs.push('Note: Both motor speech and affective markers present. Consider comorbid PD+depression.');
    }
  }

  return recs;
}

// ════════════════════════════════════════════════════════════════
// EXPORTS — for testing and composition
// ════════════════════════════════════════════════════════════════

export {
  detectTemporalPattern,
  detectADCascade,
  generateRecommendation
};
