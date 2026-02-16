/**
 * V3 DIFFERENTIAL DIAGNOSIS ENGINE
 *
 * Rule-based differential diagnosis compiled from 60+ studies.
 * No LLM inference needed — the decision tree IS the science.
 *
 * Distinguishes 6 conditions:
 *   1. Alzheimer's Disease (cascade pattern)
 *   2. Major Depression (episodic, affective)
 *   3. Parkinson's Disease (motor-dominant)
 *   4. Normal Aging (stable, within noise)
 *   5. Medication Effects (acute, global)
 *   6. Grief / Emotional Distress (topic-dependent)
 */

import { INDICATORS, DOMAINS, SENTINELS } from './indicators.js';

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
  };

  const evidence = {
    alzheimer: [],
    depression: [],
    parkinson: [],
    normal_aging: [],
    medication: [],
    grief: [],
  };

  // ════════════════════════════════════════════════
  // RULE 1: Cascade Pattern (AD-specific)
  // ════════════════════════════════════════════════
  const hasCascade = detectADCascade(domainScores);
  if (hasCascade.detected) {
    scores.alzheimer += 0.25 * hasCascade.confidence;
    evidence.alzheimer.push(`AD cascade pattern detected (stage ${hasCascade.stage}, confidence ${(hasCascade.confidence * 100).toFixed(0)}%)`);
  }

  // ════════════════════════════════════════════════
  // RULE 2: Referential Coherence (THE differentiator)
  // Preserved in depression, degraded in AD
  // ════════════════════════════════════════════════
  const refCoherence = zScores.SEM_REF_COHERENCE;
  if (refCoherence != null) {
    if (refCoherence < -0.5) {
      scores.alzheimer += 0.20;
      evidence.alzheimer.push(`Referential coherence degraded (z=${refCoherence.toFixed(2)}) — AD signature`);
    } else if (refCoherence > -0.2) {
      scores.depression += 0.15;
      scores.normal_aging += 0.10;
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
      // Poor free recall but cues help → retrieval deficit → depression
      scores.depression += 0.20;
      evidence.depression.push(`Cued recall responsive (benefit=${cueBenefit.toFixed(2)}) — retrieval deficit, not storage`);
    } else if (freeRecall < -0.5 && cueBenefit < 0.15) {
      // Poor free recall and cues DON'T help → storage deficit → AD
      scores.alzheimer += 0.20;
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
      scores.depression += 0.15;
      evidence.depression.push(`Self-referential pronouns elevated (z=${selfPronoun.toFixed(2)}) — depression marker`);
    }
  }

  // ════════════════════════════════════════════════
  // RULE 5: Negative Valence (Depression-specific)
  // ════════════════════════════════════════════════
  const negValence = zScores.AFF_NEG_VALENCE;
  if (negValence != null && negValence < -0.4) {
    scores.depression += 0.15;
    evidence.depression.push(`Negative valence language elevated — depression marker`);
  }

  // ════════════════════════════════════════════════
  // RULE 6: Session-to-Session Variability (pattern type)
  // AD: monotonic. Depression: episodic. LBD: fluctuating.
  // ════════════════════════════════════════════════
  const variability = zScores.TMP_VARIABILITY;
  if (context.timeline?.length >= 7) {
    const pattern = detectTemporalPattern(context.timeline);

    if (pattern.type === 'monotonic_decline') {
      scores.alzheimer += 0.15;
      evidence.alzheimer.push(`Monotonic decline pattern over ${pattern.weeks} weeks — AD trajectory`);
    } else if (pattern.type === 'episodic') {
      scores.depression += 0.15;
      evidence.depression.push(`Episodic fluctuation pattern — depression trajectory`);
    } else if (pattern.type === 'acute_drop') {
      scores.medication += 0.25;
      evidence.medication.push(`Acute onset correlated with timeline — medication effect pattern`);
    } else if (pattern.type === 'stable') {
      scores.normal_aging += 0.25;
      evidence.normal_aging.push(`Stable pattern — within normal aging variance`);
    }
  }

  // ════════════════════════════════════════════════
  // RULE 7: Idea Density (strongest AD predictor)
  // ════════════════════════════════════════════════
  const ideaDensity = zScores.SEM_IDEA_DENSITY;
  if (ideaDensity != null && ideaDensity < -0.5) {
    scores.alzheimer += 0.15;
    evidence.alzheimer.push(`Idea density declining (z=${ideaDensity.toFixed(2)}) — Snowdon: strongest AD predictor`);
  }

  // ════════════════════════════════════════════════
  // RULE 8: Pause Location (mid-clause = AD, boundary = depression)
  // ════════════════════════════════════════════════
  const withinClause = zScores.TMP_WITHIN_CLAUSE;
  if (withinClause != null) {
    if (withinClause < -0.5) {
      scores.alzheimer += 0.10;
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
    scores.parkinson += 0.20;
    evidence.parkinson.push(`Fluency-dominant decline (temporal=${tmp.toFixed(2)}) with preserved language — PD pattern`);
  }

  if (sem < -0.5 && lex < -0.5 && tmp > -0.3) {
    scores.alzheimer += 0.10;
    evidence.alzheimer.push(`Semantic+lexical decline with preserved fluency — early AD pattern`);
  }

  // ════════════════════════════════════════════════
  // RULE 10: Engagement + hedonic (depression anhedonia)
  // ════════════════════════════════════════════════
  const hedonic = zScores.AFF_HEDONIC;
  const engagement = zScores.AFF_ENGAGEMENT;
  if (hedonic != null && hedonic < -0.4) {
    scores.depression += 0.10;
    evidence.depression.push(`Reduced hedonic language — anhedonia marker`);
  }
  if (engagement != null && engagement < -0.4) {
    scores.depression += 0.10;
    evidence.depression.push(`Reduced conversational engagement — withdrawal marker`);
  }

  // ════════════════════════════════════════════════
  // RULE 11: Confounder check — medication change
  // ════════════════════════════════════════════════
  if (context.confounders?.some?.(c => c?.confounders?.medication_change)) {
    scores.medication += 0.20;
    evidence.medication.push(`Medication change reported in recent sessions`);
  }

  // ════════════════════════════════════════════════
  // RULE 12: Emotional distress → grief
  // ════════════════════════════════════════════════
  if (context.confounders?.some?.(c => c?.confounders?.emotional_distress)) {
    scores.grief += 0.15;
    evidence.grief.push(`Emotional distress reported`);
  }

  // ════════════════════════════════════════════════
  // RULE 13: Global stability check (normal aging)
  // ════════════════════════════════════════════════
  const allAboveThreshold = Object.values(domainScores).every(v => v == null || v > -0.3);
  if (allAboveThreshold) {
    scores.normal_aging += 0.30;
    evidence.normal_aging.push(`All domains within normal range (>-0.3) — consistent with healthy aging`);
  }

  // ════════════════════════════════════════════════
  // RULE 14: Self-correction preservation
  // ════════════════════════════════════════════════
  const selfCorrection = zScores.DIS_SELF_CORRECTION;
  if (selfCorrection != null) {
    if (selfCorrection < -0.5) {
      scores.alzheimer += 0.10;
      evidence.alzheimer.push(`Self-correction declining — loss of metacognitive monitoring`);
    } else {
      scores.depression += 0.05;
      scores.normal_aging += 0.05;
      evidence.normal_aging.push(`Self-correction preserved — metacognition intact`);
    }
  }

  // ════════════════════════════════════════════════
  // NORMALIZE TO PROBABILITIES
  // ════════════════════════════════════════════════
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const probabilities = {};
  for (const [condition, score] of Object.entries(scores)) {
    probabilities[condition] = Math.round((score / total) * 1000) / 1000;
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
    rules_fired: Object.values(evidence).flat().length,
    recommendation: generateRecommendation(primary, secondary, confidence, evidence)
  };
}

// ════════════════════════════════════════════════
// TEMPORAL PATTERN DETECTION
// ════════════════════════════════════════════════

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

// ════════════════════════════════════════════════
// AD CASCADE DETECTION
// ════════════════════════════════════════════════

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

// ════════════════════════════════════════════════
// RECOMMENDATION GENERATION
// ════════════════════════════════════════════════

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
  } else if (primary === 'medication') {
    recs.push('Changes correlate with medication timing. Recommend pharmacist review.');
    recs.push('Defer cognitive concern until medication adjustment period (2-3 weeks).');
  } else if (primary === 'grief') {
    recs.push('Changes appear event-linked. Monitor for recovery over 4-8 weeks.');
    recs.push('If patterns persist beyond 3 months, consider depression screening.');
  }

  return recs;
}
