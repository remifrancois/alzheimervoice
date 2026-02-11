/**
 * LAYER 6 — Temporal Hologram (Extended Thinking)
 *
 * Master orchestrator that assembles all 6 layers into a single ~900K token
 * context and performs deep clinical reasoning using Extended Thinking.
 *
 * Produces 4 outputs:
 *   1. Family report (plain language, warm, actionable)
 *   2. Medical report (clinical terminology, domain scores, differential)
 *   3. Internal recommendations (conversation design for next week)
 *   4. Confidence report (what we know, don't know, what would help)
 *
 * Adaptive mode:
 *   GREEN patients → Standard CVF analysis only (~$0.30/week)
 *   YELLOW patients → Full 6-layer deep analysis (~$2.97/week)
 *   ORANGE/RED → Full analysis + bi-weekly (~$5.94/week)
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

import { buildLivingLibraryContext } from './living-library.js';
import { buildDifferentialContext, computeDifferentialScores } from './differential-diagnosis.js';
import { buildConversationArchive, buildArchaeologyPrompt, saveSemanticMap } from './cognitive-archaeology.js';
import { buildTwinContext, generateTwinVector, computeDivergence, saveTwinAnalysis } from './cognitive-twin.js';
import { loadCohort, matchTrajectory, buildCohortContext } from './synthetic-cohort.js';
import { loadPatient } from '../models/patient.js';
import { loadBaseline, computeDelta, computeComposite, computeDomainScores } from '../models/cvf.js';
import { loadPatientSessions } from '../models/session.js';
import { loadMemoryProfile } from '../models/memory.js';
import { detectCascadePattern } from './drift-detector.js';

const client = new Anthropic();
const DATA_DIR = path.resolve('data/hologram');

/**
 * Run the full 6-layer deep analysis for a patient.
 * This is the most powerful analysis mode — ~900K tokens input + Extended Thinking.
 */
export async function runDeepAnalysis(patientId, weekNumber) {
  console.log(`[Hologram] Starting 6-layer deep analysis for patient ${patientId}, week ${weekNumber}...`);

  const patient = await loadPatient(patientId);
  const baseline = await loadBaseline(patientId);
  const sessions = await loadPatientSessions(patientId);
  const memoryProfile = await loadMemoryProfile(patientId);

  if (!baseline?.calibration_complete) {
    return { status: 'not_ready', message: 'Baseline not yet established for deep analysis.' };
  }

  // Build current state
  const recentSessions = sessions.filter(s => s.feature_vector).slice(-7);
  const latestVector = recentSessions[recentSessions.length - 1]?.feature_vector;
  const latestDelta = latestVector ? computeDelta(latestVector, baseline.baseline_vector) : null;
  const domainScores = latestDelta ? computeDomainScores(latestDelta) : {};
  const compositeScore = latestDelta ? computeComposite(latestDelta) : 0;
  const cascadePatterns = detectCascadePattern(domainScores);

  // Build timeline for trajectory matching
  const timeline = sessions.filter(s => s.feature_vector).map(s => {
    const delta = computeDelta(s.feature_vector, baseline.baseline_vector);
    return {
      composite: computeComposite(delta),
      domains: computeDomainScores(delta),
      timestamp: s.timestamp,
      confounders: s.confounders
    };
  });

  // ========================================
  // ASSEMBLE ALL 6 LAYERS
  // ========================================
  console.log('[Hologram] Layer 1: Loading Living Library...');
  const libraryContext = await buildLivingLibraryContext();

  console.log('[Hologram] Layer 2: Building Differential Diagnosis context...');
  const differentialContext = buildDifferentialContext();
  const differentialScores = computeDifferentialScores(
    domainScores,
    timeline,
    recentSessions.map(s => ({ confounders: s.confounders }))
  );

  console.log('[Hologram] Layer 3: Building Conversation Archive...');
  const archive = await buildConversationArchive(patientId);

  console.log('[Hologram] Layer 4: Building Cognitive Twin...');
  const twinContext = buildTwinContext(
    baseline.baseline_vector, weekNumber,
    { education: patient.education || 'average' },
    timeline
  );
  const twinResult = generateTwinVector(baseline.baseline_vector, weekNumber, { education: patient.education || 'average' });
  const divergence = latestVector ? computeDivergence(latestVector, twinResult) : null;

  console.log('[Hologram] Layer 5: Loading Synthetic Cohort...');
  const cohort = await loadCohort();
  const cohortMatch = matchTrajectory(timeline, cohort);
  const cohortContext = buildCohortContext(cohort, timeline);

  console.log('[Hologram] Layer 6: Assembling Temporal Hologram prompt...');

  // ========================================
  // BUILD THE HOLOGRAM ANALYSIS PROMPT
  // ========================================
  const hologramPrompt = `<hologram_analysis patient="${patient.first_name}" week="${weekNumber}">

You have in your context the most comprehensive cognitive analysis ever assembled:
1. Complete scientific literature on speech biomarkers (Living Library)
2. Differential diagnosis profiles for 6+ conditions
3. Patient's complete conversational history (${archive.sessionCount} sessions)
4. Personalized cognitive twin trajectory
5. 100 synthetic cohort trajectories for matching
6. Current CVF state and cascade analysis

PATIENT: ${patient.first_name}, Language: ${patient.language}, Age: ${patient.age || 'unknown'}
CURRENT ALERT: ${patient.alert_level}
WEEK: ${weekNumber}
COMPOSITE SCORE: ${compositeScore.toFixed(3)}
DOMAIN SCORES: ${JSON.stringify(domainScores)}
CASCADE PATTERNS: ${JSON.stringify(cascadePatterns)}

PRELIMINARY DIFFERENTIAL (computed):
${JSON.stringify(differentialScores, null, 2)}

TWIN DIVERGENCE: ${divergence ? JSON.stringify(divergence) : 'Not computed'}

COHORT MATCHING: ${JSON.stringify(cohortMatch.outcome_probabilities)}
Closest matches: ${cohortMatch.matches.map(m => `${m.id}(${m.diagnosis})`).join(', ')}

MEMORY PROFILE: ${memoryProfile?.memories?.length || 0} memories tracked

PERFORM THE FOLLOWING ANALYSIS USING EXTENDED THINKING:

## PHASE 1 — TEMPORAL PATTERN EXTRACTION
Look at the ENTIRE timeline at once. Identify:
- Linear trends (steady decline or improvement)
- Cyclic patterns (weekly, monthly, seasonal)
- Breakpoints (sudden changes correlated with events)
- Acceleration/deceleration of existing trends

## PHASE 2 — CROSS-DOMAIN CORRELATION
Analyze how the 5 CVF domains co-vary:
- Lexical-Coherence correlation (semantic network integrity)
- Fluency-Memory correlation (retrieval efficiency)
- Syntax-Coherence correlation (expressive capacity)
Which domain is LEADING the change? This predicts the cascade.

## PHASE 3 — DIFFERENTIAL COMPARISON
Compare the patient's trajectory to:
- Their cognitive twin (divergence analysis)
- The 5 most similar cohort members (outcome matching)
- The known AD progression cascade from literature
- The depression profile (rule out)
- The medication effect profile (rule out)

## PHASE 4 — MICRO-PATTERN DISCOVERY
Look for patterns that DON'T fit standard categories:
- Is there a specific TOPIC that triggers decline?
- Do EMOTIONAL memories show different trajectory than NEUTRAL ones?
- Are there COMPENSATORY STRATEGIES emerging?
  (circumlocution, topic avoidance, reliance on routine phrases)

## PHASE 5 — PREDICTIVE SYNTHESIS
Based on ALL of the above:
1. Current cognitive status assessment (with differential)
2. Predicted trajectory (3 months, 6 months, 12 months)
3. Confidence level with specific uncertainties identified
4. Recommended actions
5. What data would MOST reduce uncertainty? Design next week's probes.

OUTPUT FORMAT (JSON):
{
  "analysis_version": "v2_hologram",
  "week_number": ${weekNumber},
  "composite_score": <number>,
  "confidence": <number 0-1>,
  "alert_level": "green|yellow|orange|red",
  "domain_scores": { "lexical": <z>, "syntactic": <z>, "coherence": <z>, "fluency": <z>, "memory": <z> },

  "differential_diagnosis": {
    "alzheimer_probability": <0-1>,
    "depression_probability": <0-1>,
    "parkinsons_probability": <0-1>,
    "normal_aging_probability": <0-1>,
    "medication_probability": <0-1>,
    "grief_probability": <0-1>,
    "primary_hypothesis": "<condition>",
    "reasoning": "<2-3 sentences explaining the differential reasoning>",
    "key_discriminators_observed": ["<list>"],
    "recommended_probes_next_week": ["<list>"]
  },

  "twin_analysis": {
    "divergence_score": <number>,
    "divergence_interpretation": "<string>",
    "domains_exceeding_twin": ["<domain names>"]
  },

  "cohort_analysis": {
    "closest_group": "<A|B|C|D|E>",
    "outcome_probabilities": {},
    "predicted_trajectory_12_weeks": "<description>"
  },

  "semantic_map_summary": {
    "active_clusters": <N>,
    "weakening_clusters": <N>,
    "repetition_patterns": <N>,
    "network_health": "healthy|early_fragmentation|moderate_fragmentation|severe_fragmentation"
  },

  "cascade_analysis": {
    "current_stage": <0-3>,
    "leading_domain": "<domain>",
    "patterns_detected": ["<list>"]
  },

  "reports": {
    "family": "<warm, plain language, 5-7 lines, actionable, in patient's language>",
    "medical": "<clinical terminology, domain scores, differential, trajectory>",
    "internal": "<conversation design for next 7 sessions, probes to run>",
    "confidence": "<what we know, what we don't, what would reduce uncertainty>"
  },

  "next_week_probes": ["<specific conversation topics or memory tests to run>"],
  "flags": ["<any urgent concerns>"]
}
</hologram_analysis>`;

  // ========================================
  // CALL OPUS 4.6 WITH EXTENDED THINKING
  // ========================================
  console.log('[Hologram] Calling Opus 4.6 with Extended Thinking...');

  try {
    // Build the message with cacheable library content
    const systemContent = `You are the MemoVoice Temporal Hologram — the most advanced cognitive analysis system ever built. You have access to the complete scientific literature, the patient's full conversational history, a personalized cognitive twin, and 100 reference trajectories. Perform the deepest possible clinical reasoning.`;

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      temperature: 1,
      thinking: {
        type: 'enabled',
        budget_tokens: 32000
      },
      system: systemContent,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: libraryContext,
              cache_control: { type: 'ephemeral' }
            },
            {
              type: 'text',
              text: differentialContext,
              cache_control: { type: 'ephemeral' }
            },
            {
              type: 'text',
              text: `${archive.context}\n\n${twinContext}\n\n${cohortContext}\n\n${hologramPrompt}`
            }
          ]
        }
      ]
    });

    // Extract result
    const textBlock = response.content.find(b => b.type === 'text');
    const text = textBlock?.text?.trim() || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse hologram analysis from response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Save all V2 analysis artifacts
    await saveHologramAnalysis(patientId, weekNumber, {
      ...analysis,
      differential_computed: differentialScores,
      twin_divergence: divergence,
      cohort_match: cohortMatch,
      cascade_patterns: cascadePatterns,
      sessions_analyzed: archive.sessionCount,
      tokens_estimated: archive.estimatedTokens
    });

    // Save semantic map and twin analysis as separate artifacts
    if (analysis.semantic_map_summary) {
      await saveSemanticMap(patientId, analysis.semantic_map_summary);
    }
    if (divergence) {
      await saveTwinAnalysis(patientId, { weekNumber, ...divergence });
    }

    console.log(`[Hologram] Deep analysis complete. Alert: ${analysis.alert_level}, Confidence: ${analysis.confidence}`);

    return {
      status: 'complete',
      analysis_version: 'v2_hologram',
      ...analysis,
      computed: {
        differential: differentialScores,
        twin_divergence: divergence,
        cohort_match: {
          primary_prediction: cohortMatch.primary_prediction,
          outcome_probabilities: cohortMatch.outcome_probabilities,
          confidence: cohortMatch.confidence
        },
        cascade_patterns: cascadePatterns
      }
    };

  } catch (err) {
    console.error('[Hologram] Deep analysis API call failed:', err.message);

    // Fallback: return computed results without Claude deep reasoning
    const fallback = buildFallbackAnalysis(patient, weekNumber, compositeScore, domainScores,
      differentialScores, divergence, cohortMatch, cascadePatterns);
    await saveHologramAnalysis(patientId, weekNumber, { ...fallback, fallback: true });
    return fallback;
  }
}

/**
 * Determine if a patient needs deep analysis based on alert level.
 */
export function shouldRunDeepAnalysis(patient, weekNumber) {
  if (patient.alert_level === 'green') {
    // GREEN: standard analysis only, deep every 4 weeks
    return weekNumber % 4 === 0;
  }
  if (patient.alert_level === 'yellow') {
    // YELLOW: weekly deep analysis
    return true;
  }
  // ORANGE/RED: always deep, could be bi-weekly
  return true;
}

/**
 * Estimate cost for a deep analysis.
 */
export function estimateCost(archive) {
  const inputTokens = archive?.estimatedTokens || 0;
  const libraryTokens = 100000; // Estimated library size
  const outputTokens = 8000;

  // With prompt caching (90% off for library)
  const cachedInputCost = libraryTokens * 0.5 / 1000000;   // $0.50/MTok cache read
  const freshInputCost = (inputTokens - libraryTokens) * 5 / 1000000;  // $5/MTok fresh
  const outputCost = outputTokens * 25 / 1000000;  // $25/MTok output

  return {
    estimated_total: Math.round((cachedInputCost + freshInputCost + outputCost) * 100) / 100,
    input_tokens: inputTokens + libraryTokens,
    output_tokens: outputTokens,
    cache_savings: '~90% on library context'
  };
}

// ========================================
// PERSISTENCE
// ========================================

async function saveHologramAnalysis(patientId, weekNumber, analysis) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `hologram_${patientId}_week${weekNumber}.json`);
  await fs.writeFile(filePath, JSON.stringify({
    patient_id: patientId,
    week_number: weekNumber,
    analysis_version: 'v2_hologram',
    created_at: new Date().toISOString(),
    ...analysis
  }, null, 2));
}

export async function loadHologramAnalysis(patientId, weekNumber) {
  const filePath = path.join(DATA_DIR, `hologram_${patientId}_week${weekNumber}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function listHologramAnalyses(patientId) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const files = await fs.readdir(DATA_DIR);
  const analyses = [];
  for (const file of files) {
    if (file.startsWith(`hologram_${patientId}_`) && file.endsWith('.json')) {
      const data = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
      analyses.push(JSON.parse(data));
    }
  }
  return analyses.sort((a, b) => (a.week_number || 0) - (b.week_number || 0));
}

// ========================================
// FALLBACK ANALYSIS (when API fails)
// ========================================

function buildFallbackAnalysis(patient, weekNumber, compositeScore, domainScores, differential, divergence, cohortMatch, cascade) {
  const alertLevel = compositeScore >= -0.5 ? 'green' : compositeScore >= -1.0 ? 'yellow' : compositeScore >= -1.5 ? 'orange' : 'red';

  return {
    status: 'fallback',
    analysis_version: 'v2_hologram_fallback',
    week_number: weekNumber,
    composite_score: compositeScore,
    confidence: 0.6,
    alert_level: alertLevel,
    domain_scores: domainScores,
    differential_diagnosis: {
      ...differential.probabilities,
      primary_hypothesis: differential.primary_hypothesis,
      reasoning: 'Computed from heuristic model (deep analysis unavailable).',
      key_discriminators_observed: differential.reasoning_hints,
      recommended_probes_next_week: []
    },
    twin_analysis: {
      divergence_score: divergence?.overall || 0,
      divergence_interpretation: divergence?.interpretation || 'Not computed',
      domains_exceeding_twin: Object.entries(divergence?.domains || {})
        .filter(([, v]) => v > 1.5).map(([k]) => k)
    },
    cohort_analysis: {
      closest_group: cohortMatch?.matches?.[0]?.group || 'unknown',
      outcome_probabilities: cohortMatch?.outcome_probabilities || {},
      predicted_trajectory_12_weeks: `Based on cohort matching: ${cohortMatch?.primary_prediction || 'insufficient data'}`
    },
    cascade_analysis: {
      current_stage: cascade?.length > 0 ? Math.max(...cascade.map(p => p.stage)) : 0,
      leading_domain: Object.entries(domainScores).sort((a, b) => a[1] - b[1])[0]?.[0] || 'none',
      patterns_detected: cascade?.map(p => p.name) || []
    },
    reports: {
      family: `${patient.first_name} continue d'avoir des conversations régulières. Nous surveillons attentivement et vous tiendrons informé de tout changement notable.`,
      medical: `Week ${weekNumber}: Composite z=${compositeScore.toFixed(2)}. ${Object.entries(domainScores).map(([d, z]) => `${d}: ${z.toFixed(2)}`).join(', ')}. Differential: ${differential.primary_hypothesis}. Twin divergence: ${divergence?.overall?.toFixed(2) || 'N/A'}.`,
      internal: 'Continue standard monitoring. Deep analysis was unavailable — retry next cycle.',
      confidence: 'Analysis based on computed heuristics only. Full deep analysis required for clinical confidence.'
    },
    flags: alertLevel !== 'green' ? [`Alert level: ${alertLevel}`, `Primary hypothesis: ${differential.primary_hypothesis}`] : []
  };
}
