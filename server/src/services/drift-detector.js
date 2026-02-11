import { loadPatientSessions } from '../models/session.js';
import { loadBaseline, computeDelta, computeComposite, computeDomainScores, getAlertLevel, CVF_FEATURES, DOMAIN_WEIGHTS, saveWeeklyAnalysis } from '../models/cvf.js';
import { loadPatient } from '../models/patient.js';
import { loadMemoryProfile } from '../models/memory.js';
import { weeklyAnalysis } from './claude.js';

// Confounder weight adjustments
const CONFOUNDER_WEIGHTS = {
  illness: 0.5,
  poor_sleep: 0.5,
  medication_change: 0.3,
  emotional_distress: null  // Domain-specific, handled separately
};

const EMOTIONAL_DOMAIN_ADJUSTMENTS = {
  fluency: 0.5,
  memory: 1.2,
  coherence: 0.7,
  lexical: 1.0,
  syntactic: 1.0
};

/**
 * Run weekly drift analysis for a patient.
 * Takes the last 7 sessions, adjusts for confounders, computes composite.
 */
export async function runWeeklyAnalysis(patientId, weekNumber) {
  const patient = await loadPatient(patientId);
  const baseline = await loadBaseline(patientId);
  const memoryProfile = await loadMemoryProfile(patientId);
  const allSessions = await loadPatientSessions(patientId);

  if (!baseline?.calibration_complete) {
    return { status: 'not_ready', message: 'Baseline not yet established.' };
  }

  // Get the last 7 sessions (or fewer if not enough)
  const recentSessions = allSessions
    .filter(s => s.feature_vector)
    .slice(-7);

  if (recentSessions.length === 0) {
    return { status: 'no_data', message: 'No sessions with feature vectors found.' };
  }

  // Compute deltas and apply confounder weighting
  const weightedDeltas = [];
  const confounders = [];

  for (const session of recentSessions) {
    const delta = computeDelta(session.feature_vector, baseline.baseline_vector);
    let weight = 1.0;

    // Apply confounder weights
    const sessionConfounders = session.confounders || {};
    for (const [confounder, confounderWeight] of Object.entries(CONFOUNDER_WEIGHTS)) {
      if (sessionConfounders[confounder]) {
        if (confounderWeight === null) {
          // Emotional distress: domain-specific adjustment
          for (const [domain, adj] of Object.entries(EMOTIONAL_DOMAIN_ADJUSTMENTS)) {
            const features = CVF_FEATURES[domain];
            for (const f of features) {
              delta[f] = (delta[f] || 0) * adj;
            }
          }
        } else {
          weight = Math.min(weight, confounderWeight);
        }
      }
    }

    confounders.push({ session_id: session.session_id, confounders: sessionConfounders, weight });
    weightedDeltas.push({ delta, weight });
  }

  // Compute weighted average composite
  const totalWeight = weightedDeltas.reduce((sum, d) => sum + d.weight, 0);
  const avgDelta = {};

  for (const feature of Object.values(CVF_FEATURES).flat()) {
    avgDelta[feature] = weightedDeltas.reduce((sum, d) => sum + (d.delta[feature] || 0) * d.weight, 0) / totalWeight;
  }

  const compositeScore = computeComposite(avgDelta);
  const domainScores = computeDomainScores(avgDelta);
  const alertLevel = getAlertLevel(compositeScore);

  // Use Claude for deep analysis with extended thinking
  console.log(`[Drift] Running weekly deep analysis for ${patient.first_name} (week ${weekNumber})...`);

  let deepAnalysis;
  try {
    deepAnalysis = await weeklyAnalysis({
      patient,
      baseline,
      sessionVectors: recentSessions.map(s => s.feature_vector),
      confounders,
      previousAnalysis: null,  // TODO: load previous week
      memoryProfile
    });
  } catch (err) {
    console.error('[Drift] Deep analysis failed, using computed values:', err.message);
    deepAnalysis = {
      week_number: weekNumber,
      composite_score: compositeScore,
      confidence: 0.7,
      alert_level: alertLevel,
      domain_scores: domainScores,
      clinical_narrative_family: `${patient.first_name} continue de bien se porter dans nos conversations.`,
      clinical_narrative_medical: `Week ${weekNumber}: Composite z=${compositeScore.toFixed(2)}. ${Object.entries(domainScores).map(([d, z]) => `${d}: ${z.toFixed(2)}`).join(', ')}.`,
      conversation_adaptations: [],
      next_week_focus: 'Continue standard monitoring.',
      flags: []
    };
  }

  // Save the analysis
  const analysis = {
    patient_id: patientId,
    ...deepAnalysis,
    week_number: weekNumber,
    computed_composite: compositeScore,
    computed_domains: domainScores,
    computed_alert: alertLevel,
    sessions_analyzed: recentSessions.length,
    created_at: new Date().toISOString()
  };

  await saveWeeklyAnalysis(analysis);

  return analysis;
}

/**
 * Detect cross-domain patterns that match the AD cascade.
 */
export function detectCascadePattern(domainScores) {
  const patterns = [];

  // Stage 1: Semantic memory (lexical + coherence decline)
  if (domainScores.lexical < -0.5 && domainScores.coherence < -0.5) {
    patterns.push({
      stage: 1,
      name: 'semantic_memory_involvement',
      description: 'Lexical and coherence decline suggest semantic memory degradation.',
      severity: Math.abs(domainScores.lexical + domainScores.coherence) / 2
    });
  }

  // Stage 2: Syntactic degradation added
  if (domainScores.syntactic < -0.5 && patterns.some(p => p.stage === 1)) {
    patterns.push({
      stage: 2,
      name: 'syntactic_simplification',
      description: 'Syntactic decline on top of semantic involvement.',
      severity: Math.abs(domainScores.syntactic)
    });
  }

  // Stage 3: Discourse collapse
  if (domainScores.coherence < -1.0 && domainScores.fluency < -0.5) {
    patterns.push({
      stage: 3,
      name: 'discourse_coherence_collapse',
      description: 'Coherence and fluency both declining — discourse structure breaking down.',
      severity: Math.abs(domainScores.coherence + domainScores.fluency) / 2
    });
  }

  // Fluency as early warning (pre-symptomatic, per Young 2024)
  if (domainScores.fluency < -0.5 && domainScores.lexical > -0.3) {
    patterns.push({
      stage: 0,
      name: 'fluency_early_warning',
      description: 'Fluency declining while lexical is stable — may indicate pre-symptomatic tau accumulation (Young 2024).',
      severity: Math.abs(domainScores.fluency)
    });
  }

  return patterns;
}
