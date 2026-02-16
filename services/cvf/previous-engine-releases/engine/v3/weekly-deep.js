/**
 * V3 WEEKLY DEEP ANALYSIS — Opus 4.6
 *
 * Daily: Sonnet extracts features → V3 algorithm scores drift ($0.05/session)
 * Weekly: Opus 4.6 performs deep clinical reasoning on 7 days of data ($0.30-0.50)
 *
 * The weekly analysis uses Opus with Extended Thinking to:
 * 1. Cross-validate the algorithmic differential diagnosis
 * 2. Discover micro-patterns the rules might miss
 * 3. Generate clinical narratives (family + medical)
 * 4. Design next week's conversation probes
 * 5. Assess confidence and flag uncertainties
 *
 * This is NOT the V2 approach (900K tokens). We send only:
 * - 7 session vectors (structured, ~2K tokens)
 * - Baseline reference (~1K tokens)
 * - V3 algorithmic results (differential, cascade, trajectory — ~2K tokens)
 * - Patient context (~500 tokens)
 * Total: ~6-8K tokens input → Opus reasons deeply on pre-computed data.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { analyzeWeek } from './algorithm.js';
import { runDifferential } from './differential.js';
import { predictTrajectory } from './trajectory.js';
import { INDICATORS, DOMAINS, DOMAIN_WEIGHTS } from './indicators.js';

const client = new Anthropic();
const DATA_DIR = path.resolve('data/v3-reports');

/**
 * Run the weekly Opus deep analysis.
 *
 * @param {Object} params
 * @param {Object} params.patient — patient record
 * @param {Object} params.baseline — V3 baseline
 * @param {Array}  params.sessions — last 7 sessions with feature_vector
 * @param {Array}  params.weeklyHistory — past weekly analyses
 * @param {number} params.weekNumber
 * @returns {Object} — complete weekly report
 */
export async function runWeeklyDeepAnalysis({ patient, baseline, sessions, weeklyHistory, weekNumber }) {
  // Step 1: Run V3 algorithm (deterministic)
  const weekAnalysis = analyzeWeek(sessions, baseline.vector, weekNumber);
  if (!weekAnalysis) {
    return { status: 'no_data', message: 'No sessions available for weekly analysis.' };
  }

  // Step 2: Run differential diagnosis (deterministic)
  const confounders = sessions.map(s => ({ confounders: s.confounders || {} }));
  const timeline = weeklyHistory?.map(w => ({ composite: w.composite })) || [];
  const differential = runDifferential(
    weekAnalysis.domain_scores,
    weekAnalysis.z_scores || {},
    { timeline, confounders, sessionCount: sessions.length }
  );

  // Step 3: Run trajectory prediction (deterministic)
  const trajectory = predictTrajectory(
    [...(weeklyHistory || []), weekAnalysis],
    differential,
    weekAnalysis.cascade
  );

  // Step 4: Opus deep reasoning on pre-computed results
  console.log(`[V3-Weekly] Running Opus deep analysis for ${patient.first_name}, week ${weekNumber}...`);

  let opusAnalysis;
  try {
    opusAnalysis = await callOpusDeep({
      patient,
      weekNumber,
      weekAnalysis,
      differential,
      trajectory,
      sessions,
      baseline,
      previousWeek: weeklyHistory?.[weeklyHistory.length - 1] || null
    });
  } catch (err) {
    console.error('[V3-Weekly] Opus analysis failed, using algorithmic results:', err.message);
    opusAnalysis = buildFallbackNarratives(patient, weekAnalysis, differential);
  }

  // Step 5: Assemble complete report
  const report = {
    version: 'v3',
    patient_id: patient.patient_id,
    week_number: weekNumber,
    created_at: new Date().toISOString(),

    // V3 algorithmic results
    composite_score: weekAnalysis.composite,
    alert_level: weekAnalysis.alert_level,
    domain_scores: weekAnalysis.domain_scores,
    cascade: weekAnalysis.cascade,
    trend: weekAnalysis.trend,
    sessions_analyzed: weekAnalysis.sessions_analyzed,

    // Differential diagnosis (algorithmic + Opus-validated)
    differential: {
      algorithmic: differential,
      opus_validated: opusAnalysis?.differential_validation || null,
      final_hypothesis: opusAnalysis?.final_hypothesis || differential.primary_hypothesis,
      confidence: opusAnalysis?.confidence || differential.confidence,
    },

    // Trajectory prediction
    trajectory: {
      predicted_12_weeks: trajectory.predictions?.slice(0, 12) || [],
      predicted_alert_12w: trajectory.predicted_alert_12w,
      velocity: trajectory.velocity,
      twin_trajectory: trajectory.twin_trajectory?.slice(0, 12) || [],
    },

    // Opus clinical narratives
    reports: {
      family: opusAnalysis?.family_report || '',
      medical: opusAnalysis?.medical_report || '',
      internal: opusAnalysis?.internal_recommendations || '',
      confidence: opusAnalysis?.confidence_assessment || '',
    },

    // Next week planning
    next_week: {
      conversation_probes: opusAnalysis?.next_week_probes || [],
      focus_domains: opusAnalysis?.focus_domains || [],
      adaptations: opusAnalysis?.adaptations || [],
    },

    flags: opusAnalysis?.flags || [],
  };

  // Save report
  await saveWeeklyReport(patient.patient_id, weekNumber, report);

  return report;
}

/**
 * Call Opus 4.6 with Extended Thinking for deep clinical reasoning.
 * Input: ~6-8K tokens of pre-computed V3 results.
 * NOT 900K tokens of raw data.
 */
async function callOpusDeep({ patient, weekNumber, weekAnalysis, differential, trajectory, sessions, baseline, previousWeek }) {
  const prompt = `You are a clinical neuropsychologist reviewing weekly cognitive monitoring data for ${patient.first_name} (${patient.language === 'fr' ? 'French' : 'English'}-speaking, alert level: ${weekAnalysis.alert_level}).

WEEK ${weekNumber} — V3 ALGORITHMIC RESULTS:

Composite Score: ${weekAnalysis.composite?.toFixed(3)}
Alert Level: ${weekAnalysis.alert_level?.toUpperCase()}
Trend: ${weekAnalysis.trend > 0 ? 'improving' : weekAnalysis.trend < -0.05 ? 'declining' : 'stable'} (${weekAnalysis.trend?.toFixed(3)}/week)
Sessions Analyzed: ${weekAnalysis.sessions_analyzed}

DOMAIN SCORES (z-scores from baseline):
${Object.entries(weekAnalysis.domain_scores || {}).map(([d, z]) => `  ${d}: ${z?.toFixed(3) || 'N/A'}`).join('\n')}

CASCADE PATTERNS DETECTED:
${weekAnalysis.cascade?.length > 0 ? weekAnalysis.cascade.map(c => `  Stage ${c.stage}: ${c.name} (${c.description})`).join('\n') : '  None detected'}

DIFFERENTIAL DIAGNOSIS (algorithmic, 14-rule engine):
${Object.entries(differential.probabilities || {}).map(([c, p]) => `  ${c}: ${(p * 100).toFixed(1)}%`).join('\n')}
  Primary: ${differential.primary_hypothesis}
  Evidence: ${differential.evidence?.[differential.primary_hypothesis]?.join('; ') || 'N/A'}

TRAJECTORY PREDICTION (12 weeks):
  Current: ${weekAnalysis.composite?.toFixed(3)}
  Predicted week +4: ${trajectory.predictions?.[3]?.composite?.toFixed(3) || 'N/A'}
  Predicted week +12: ${trajectory.predictions?.[11]?.composite?.toFixed(3) || 'N/A'}
  Predicted alert at +12: ${trajectory.predicted_alert_12w || 'N/A'}
  Model: ${trajectory.model}

CONFOUNDERS THIS WEEK:
${sessions.filter(s => s.confounders && Object.keys(s.confounders).some(k => s.confounders[k])).map(s => `  ${Object.keys(s.confounders).filter(k => s.confounders[k]).join(', ')}`).join('\n') || '  None reported'}

${previousWeek ? `PREVIOUS WEEK: composite=${previousWeek.composite?.toFixed(3)}, alert=${previousWeek.alert_level}` : 'FIRST WEEKLY ANALYSIS'}

YOUR TASK (use Extended Thinking):
1. VALIDATE the algorithmic differential — do you agree? If not, explain why.
2. Look for micro-patterns the rules might miss (cross-domain interactions, subtle timing shifts).
3. Generate a FAMILY REPORT: 3-5 warm sentences in ${patient.language === 'fr' ? 'French' : 'English'}. Plain language, actionable, never alarming.
4. Generate a MEDICAL REPORT: Clinical terminology, domain scores, differential, trajectory.
5. Recommend conversation topics and memory probes for next week.
6. Assess overall CONFIDENCE: what do we know, what's uncertain, what data would help.

Return ONLY valid JSON:
{
  "differential_validation": "agree|disagree|partially_agree",
  "final_hypothesis": "<condition>",
  "confidence": <0-1>,
  "micro_patterns": ["<any patterns not caught by rules>"],
  "family_report": "<3-5 sentences in patient language>",
  "medical_report": "<clinical report>",
  "internal_recommendations": "<conversation design for next week>",
  "confidence_assessment": "<what we know and don't>",
  "next_week_probes": ["<specific memory/topic probes>"],
  "focus_domains": ["<domains to monitor closely>"],
  "adaptations": ["<conversation style adjustments>"],
  "flags": ["<any urgent concerns>"]
}`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    temperature: 1,
    thinking: {
      type: 'enabled',
      budget_tokens: 16000
    },
    messages: [{ role: 'user', content: prompt }]
  });

  const textBlock = response.content.find(b => b.type === 'text');
  const text = textBlock?.text?.trim() || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse Opus weekly analysis');

  return JSON.parse(jsonMatch[0]);
}

/**
 * Fallback narratives when Opus is unavailable.
 */
function buildFallbackNarratives(patient, weekAnalysis, differential) {
  const name = patient.first_name;
  const lang = patient.language;
  const alert = weekAnalysis.alert_level;
  const primary = differential.primary_hypothesis;

  const familyReports = {
    fr: {
      green: `${name} continue de bien se porter dans nos conversations cette semaine. Son vocabulaire reste riche et ses souvenirs sont clairs. Rien d'inquiétant.`,
      yellow: `${name} a eu quelques conversations un peu moins fluides cette semaine. Nous continuons à suivre attentivement.`,
      orange: `Nous avons noté quelques changements dans les conversations de ${name}. Nous recommandons d'en parler avec son médecin.`,
      red: `Des changements importants ont été observés. Nous recommandons une consultation médicale rapide.`,
    },
    en: {
      green: `${name} continues to do well in our conversations this week. Vocabulary remains rich and memories are clear.`,
      yellow: `${name} had some less fluid conversations this week. We are monitoring closely.`,
      orange: `We've noted some changes in ${name}'s conversations. We recommend discussing with the doctor.`,
      red: `Significant changes observed. We recommend a prompt medical consultation.`,
    }
  };

  const domains = weekAnalysis.domain_scores || {};
  const medReport = `Week ${weekAnalysis.week_number}: Composite z=${weekAnalysis.composite?.toFixed(3)}. ${Object.entries(domains).map(([d, z]) => `${d}: ${z?.toFixed(2)}`).join(', ')}. Differential: ${primary} (${(differential.confidence * 100).toFixed(0)}%).`;

  return {
    differential_validation: 'algorithmic_only',
    final_hypothesis: primary,
    confidence: differential.confidence,
    family_report: familyReports[lang]?.[alert] || familyReports.en[alert] || '',
    medical_report: medReport,
    internal_recommendations: 'Continue standard monitoring. Opus analysis unavailable.',
    confidence_assessment: 'Based on algorithmic analysis only. Deep analysis recommended.',
    next_week_probes: [],
    focus_domains: Object.entries(domains).filter(([, z]) => z != null && z < -0.5).map(([d]) => d),
    adaptations: [],
    flags: alert !== 'green' ? [`Alert: ${alert}`, `Primary: ${primary}`] : [],
  };
}

// ════════════════════════════════════════════════
// PERSISTENCE
// ════════════════════════════════════════════════

async function saveWeeklyReport(patientId, weekNumber, report) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `v3_week_${patientId}_${weekNumber}.json`);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2));
}

export async function loadWeeklyReport(patientId, weekNumber) {
  const filePath = path.join(DATA_DIR, `v3_week_${patientId}_${weekNumber}.json`);
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

export async function listWeeklyReports(patientId) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const files = await fs.readdir(DATA_DIR);
  const reports = [];
  for (const file of files) {
    if (file.startsWith(`v3_week_${patientId}_`) && file.endsWith('.json')) {
      const data = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf-8'));
      reports.push(data);
    }
  }
  return reports.sort((a, b) => (a.week_number || 0) - (b.week_number || 0));
}
