#!/usr/bin/env node
/**
 * Profile01 V4 Full Analysis Runner
 *
 * Takes the extracted data (transcripts + acoustic features) and:
 * 1. Runs Claude Sonnet text extraction on each transcript (64 text indicators)
 * 2. Normalizes acoustic features to 0.0-1.0 scale (21 audio indicators)
 * 3. Merges into 85-indicator feature vectors
 * 4. Computes baseline from all sessions
 * 5. Runs full V4 analysis pipeline (z-scores, domains, composite, cascades, sentinels)
 * 6. Runs differential diagnosis
 * 7. Outputs comprehensive diagnostic report
 */

import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

// V4 Engine imports
const engineDir = '/Users/code/azh/services/cvf/src/engine/v4';
const { extractV4Features } = await import(`${engineDir}/text-extractor.js`);
const { normalizeAcousticValue } = await import(`${engineDir}/acoustic-pipeline.js`);
const {
  computeV4Baseline, computeZScores, computeDomainScores,
  computeComposite, getAlertLevel, detectCascade, checkSentinels,
  applyConfounders, analyzeSession, computeDeclineProfile
} = await import(`${engineDir}/algorithm.js`);
const { runDifferential } = await import(`${engineDir}/differential.js`);
const {
  INDICATORS, ALL_INDICATOR_IDS, AUDIO_INDICATORS,
  DOMAINS, DOMAIN_WEIGHTS, ACOUSTIC_NORMS
} = await import(`${engineDir}/indicators.js`);

// ─────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────
const EXTRACTED_PATH = '/Users/code/azh/scripts/profile01_extracted.json';
const OUTPUT_PATH = '/Users/code/azh/scripts/profile01_v4_results.json';
const GENDER = 'male'; // will be auto-detected from F0

// Map Python feature keys to indicator IDs
const PYTHON_KEY_TO_INDICATOR = {
  f0_mean: 'ACU_F0_MEAN', f0_sd: 'ACU_F0_SD', f0_range: 'ACU_F0_RANGE',
  jitter_local: 'ACU_JITTER', shimmer_local: 'ACU_SHIMMER', hnr: 'ACU_HNR',
  mfcc2_mean: 'ACU_MFCC2', cpp: 'ACU_CPP',
  spectral_harmonicity: 'ACU_SPECTRAL_HARM', energy_range: 'ACU_ENERGY_RANGE',
  f1f2_ratio: 'ACU_F1F2_RATIO',
  ppe: 'PDM_PPE', rpde: 'PDM_RPDE', dfa: 'PDM_DFA', d2: 'PDM_D2',
  ddk_rate: 'PDM_DDK_RATE', ddk_regularity_cv: 'PDM_DDK_REG',
  vot: 'PDM_VOT', monopitch: 'PDM_MONOPITCH',
  articulation_rate: 'TMP_ARTIC_RATE',
};

// ─────────────────────────────────────────────────
// NORMALIZE ACOUSTIC FEATURES
// ─────────────────────────────────────────────────
function normalizeAcousticVector(rawFeatures, gender) {
  const vector = {};

  // Compute derived features
  if (rawFeatures.f1_mean != null && rawFeatures.f2_mean != null && rawFeatures.f2_mean > 0) {
    rawFeatures.f1f2_ratio = rawFeatures.f1_mean / rawFeatures.f2_mean;
  }
  if (rawFeatures.f0_sd != null && rawFeatures.f0_mean != null && rawFeatures.f0_mean > 0) {
    rawFeatures.monopitch = rawFeatures.f0_sd / rawFeatures.f0_mean;
  }

  for (const id of AUDIO_INDICATORS) {
    const pythonKey = Object.entries(PYTHON_KEY_TO_INDICATOR)
      .find(([, indId]) => indId === id)?.[0];

    if (!pythonKey || rawFeatures[pythonKey] == null) {
      vector[id] = null;
      continue;
    }

    vector[id] = normalizeAcousticValue(id, rawFeatures[pythonKey], gender);
  }

  return vector;
}

// ─────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  MemoVoice CVF V4 — Profile01 Full Analysis        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Load extracted data
  const extracted = JSON.parse(await readFile(EXTRACTED_PATH, 'utf-8'));
  console.log(`Loaded ${extracted.sessions_count} sessions from extraction pipeline.\n`);

  // Detect gender from F0 across all sessions
  const f0Values = extracted.sessions
    .map(s => s.acoustic_features?.f0_mean)
    .filter(v => v != null);
  const avgF0 = f0Values.length > 0
    ? f0Values.reduce((a, b) => a + b, 0) / f0Values.length : 150;
  const detectedGender = avgF0 > 165 ? 'female' : 'male';
  console.log(`Detected gender: ${detectedGender} (avg F0: ${avgF0.toFixed(1)} Hz)\n`);

  // ─────────────────────────────────────────────
  // STEP 1: Text feature extraction via Claude Sonnet
  // ─────────────────────────────────────────────
  console.log('─── STEP 1: Text Feature Extraction (Claude Sonnet) ───\n');

  const sessionVectors = [];

  for (let i = 0; i < extracted.sessions.length; i++) {
    const session = extracted.sessions[i];
    const sid = session.session_id;

    // Skip sessions with very short/empty transcripts
    if (!session.transcript?.text || session.transcript.text.length < 20) {
      console.log(`[${i+1}/10] ${sid}: Skipping (transcript too short: ${session.transcript?.text?.length || 0} chars)`);
      continue;
    }

    console.log(`[${i+1}/10] ${sid}: Extracting text features (${session.transcript.text.length} chars)...`);

    try {
      // Build transcript in the format expected by V4 text extractor
      const transcript = [
        { role: 'patient', text: session.transcript.text }
      ];

      // Extract text features via Claude Sonnet
      const textVector = await extractV4Features(transcript, {
        language: session.transcript.language || 'fr',
        model: 'claude-sonnet-4-5-20250929'
      });

      // Normalize acoustic features
      const acousticVector = session.acoustic_features?.error
        ? {} : normalizeAcousticVector(session.acoustic_features || {}, detectedGender);

      // Merge text + acoustic into full 85-indicator vector
      const fullVector = { ...textVector };
      for (const [id, value] of Object.entries(acousticVector)) {
        if (value != null) fullVector[id] = value;
      }

      const textCount = Object.values(textVector).filter(v => v != null).length;
      const audioCount = Object.values(acousticVector).filter(v => v != null).length;
      console.log(`  → ${textCount} text + ${audioCount} audio = ${textCount + audioCount} total indicators`);

      sessionVectors.push({
        session_id: sid,
        duration_s: session.acoustic_features?.duration_s || 0,
        language: session.transcript.language,
        transcript_length: session.transcript.text.length,
        feature_vector: fullVector,
        raw_acoustic: session.acoustic_features,
        transcript_text: session.transcript.text
      });

    } catch (err) {
      console.log(`  ⚠ Error: ${err.message}`);
    }
  }

  console.log(`\n✓ ${sessionVectors.length} sessions with feature vectors.\n`);

  // ─────────────────────────────────────────────
  // STEP 2: Compute baseline from all sessions
  // ─────────────────────────────────────────────
  console.log('─── STEP 2: Baseline Computation ───\n');

  const vectors = sessionVectors.map(s => s.feature_vector);
  // Use all sessions as baseline (since we have 10, use minSessions=5 for this profile)
  const baseline = computeV4Baseline(vectors, Math.min(vectors.length, 5));

  console.log(`Baseline: ${baseline.complete ? 'COMPLETE' : 'PARTIAL'}`);
  console.log(`  Sessions used: ${baseline.sessions}`);
  console.log(`  Audio available: ${baseline.audio_available}`);
  console.log(`  Audio sessions: ${baseline.audio_sessions}`);
  console.log(`  High variance indicators: ${baseline.high_variance?.length || 0}`);
  if (baseline.high_variance?.length > 0) {
    console.log(`    → ${baseline.high_variance.join(', ')}`);
  }

  // ─────────────────────────────────────────────
  // STEP 3: Run V4 analysis on each session
  // ─────────────────────────────────────────────
  console.log('\n─── STEP 3: Per-Session V4 Analysis ───\n');

  const sessionResults = [];

  for (let i = 0; i < sessionVectors.length; i++) {
    const sv = sessionVectors[i];
    const result = analyzeSession(sv.feature_vector, baseline, {}, sessionResults);

    sessionResults.push({
      ...result,
      session_id: sv.session_id,
      duration_s: sv.duration_s,
      domain_scores: result.domain_scores
    });

    const ds = result.domain_scores;
    console.log(`[${sv.session_id}] Composite: ${result.composite.toFixed(3)} | Alert: ${result.alert_level.toUpperCase()} | Indicators: ${result.indicator_count}`);
    console.log(`  Domains: LEX=${ds.lexical?.toFixed(2)||'N/A'} SYN=${ds.syntactic?.toFixed(2)||'N/A'} SEM=${ds.semantic?.toFixed(2)||'N/A'} TMP=${ds.temporal?.toFixed(2)||'N/A'} MEM=${ds.memory?.toFixed(2)||'N/A'} DIS=${ds.discourse?.toFixed(2)||'N/A'} AFF=${ds.affective?.toFixed(2)||'N/A'} ACU=${ds.acoustic?.toFixed(2)||'N/A'} PDM=${ds.pd_motor?.toFixed(2)||'N/A'}`);
    if (result.sentinel_alerts.length > 0) {
      console.log(`  ⚠ Sentinels: ${result.sentinel_alerts.map(a => `${a.condition}(${a.triggered_count}/${a.total_sentinels})`).join(', ')}`);
    }
    if (result.cascade.all.length > 0) {
      console.log(`  ⚡ Cascades: ${result.cascade.all.map(c => `${c.cascade}:${c.name}(${c.severity.toFixed(2)})`).join(', ')}`);
    }
  }

  // ─────────────────────────────────────────────
  // STEP 4: Aggregate analysis
  // ─────────────────────────────────────────────
  console.log('\n─── STEP 4: Aggregate Profile Analysis ───\n');

  // Average domain scores across all sessions
  const avgDomainScores = {};
  for (const domain of Object.keys(DOMAINS)) {
    const vals = sessionResults.map(r => r.domain_scores[domain]).filter(v => v != null);
    avgDomainScores[domain] = vals.length > 0
      ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  // Average z-scores
  const avgZScores = {};
  for (const id of ALL_INDICATOR_IDS) {
    const vals = sessionResults.map(r => r.z_scores[id]).filter(v => v != null);
    avgZScores[id] = vals.length > 0
      ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  // Overall composite
  const avgComposite = computeComposite(avgDomainScores);
  const avgAlert = getAlertLevel(avgComposite);

  console.log(`AGGREGATE COMPOSITE: ${avgComposite.toFixed(3)} → ${avgAlert.toUpperCase()}`);
  console.log('\nDomain Scores (averaged across all sessions):');
  for (const [domain, score] of Object.entries(avgDomainScores)) {
    const bar = score != null ? ('█'.repeat(Math.max(0, Math.round((score + 3) * 5)))) : 'N/A';
    const weight = DOMAIN_WEIGHTS[domain];
    console.log(`  ${domain.padEnd(12)} ${(score?.toFixed(3) || 'N/A').padStart(7)}  w=${weight}  ${bar}`);
  }

  // ─────────────────────────────────────────────
  // STEP 5: Differential Diagnosis
  // ─────────────────────────────────────────────
  console.log('\n─── STEP 5: Differential Diagnosis (23-Rule Engine) ───\n');

  const differential = runDifferential(avgDomainScores, avgZScores, {
    sessionCount: sessionVectors.length
  });

  console.log('Probability Distribution:');
  const sortedProbs = Object.entries(differential.probabilities)
    .sort((a, b) => b[1] - a[1]);
  for (const [condition, prob] of sortedProbs) {
    const pct = (prob * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(prob * 40));
    console.log(`  ${condition.padEnd(15)} ${pct.padStart(5)}%  ${bar}`);
  }

  console.log(`\nPrimary Hypothesis: ${differential.primary_hypothesis.toUpperCase()}`);
  console.log(`Secondary Hypothesis: ${differential.secondary_hypothesis}`);
  console.log(`Confidence: ${(differential.confidence * 100).toFixed(0)}%`);
  console.log(`Rules Fired: ${differential.rules_fired}`);

  console.log('\nEvidence:');
  for (const [condition, evidences] of Object.entries(differential.evidence)) {
    if (evidences.length > 0) {
      console.log(`  ${condition}:`);
      for (const e of evidences) console.log(`    • ${e}`);
    }
  }

  console.log('\nRecommendations:');
  for (const rec of differential.recommendation) {
    console.log(`  → ${rec}`);
  }

  // ─────────────────────────────────────────────
  // STEP 6: Cascade & Sentinel Summary
  // ─────────────────────────────────────────────
  console.log('\n─── STEP 6: Cascade & Sentinel Analysis ───\n');

  const aggCascade = detectCascade(avgDomainScores);
  const aggSentinels = checkSentinels(avgZScores);

  if (aggCascade.all.length > 0) {
    console.log('Active Cascade Patterns:');
    for (const c of aggCascade.all) {
      console.log(`  ${c.cascade.toUpperCase()} Stage ${c.stage}: ${c.name}`);
      console.log(`    ${c.description}`);
      console.log(`    Severity: ${c.severity.toFixed(2)} | Confidence: ${(c.confidence * 100).toFixed(0)}%`);
    }
  } else {
    console.log('No active cascade patterns detected.');
  }

  console.log('');
  if (aggSentinels.length > 0) {
    console.log('Sentinel Alerts:');
    for (const s of aggSentinels) {
      console.log(`  ${s.condition.toUpperCase()}: ${s.triggered_count}/${s.total_sentinels} sentinels triggered (conf: ${(s.confidence * 100).toFixed(0)}%)`);
      for (const d of s.details) {
        console.log(`    • ${d.name} (z=${d.z_score})`);
      }
    }
  } else {
    console.log('No sentinel alerts triggered.');
  }

  // ─────────────────────────────────────────────
  // STEP 7: Acoustic Profile Summary
  // ─────────────────────────────────────────────
  console.log('\n─── STEP 7: Acoustic Voice Profile ───\n');

  // Average raw acoustic features across sessions
  const acousticKeys = ['f0_mean', 'f0_sd', 'f0_range', 'jitter_local', 'shimmer_local',
    'hnr', 'mfcc2_mean', 'cpp', 'ppe', 'rpde', 'dfa', 'spectral_harmonicity', 'energy_range'];

  console.log('Raw Acoustic Averages (across sessions):');
  for (const key of acousticKeys) {
    const vals = sessionVectors
      .map(s => s.raw_acoustic?.[key])
      .filter(v => v != null);
    if (vals.length > 0) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, b) => a + (b - avg) ** 2, 0) / vals.length);
      console.log(`  ${key.padEnd(24)} avg=${avg.toFixed(4).padStart(10)}  std=${std.toFixed(4).padStart(8)}  n=${vals.length}`);
    }
  }

  // ─────────────────────────────────────────────
  // WRITE RESULTS
  // ─────────────────────────────────────────────
  const fullResults = {
    profile: 'profile01',
    analysis_version: 'v4',
    timestamp: new Date().toISOString(),
    detected_gender: detectedGender,
    avg_f0: avgF0,
    sessions_analyzed: sessionVectors.length,
    aggregate: {
      composite: avgComposite,
      alert_level: avgAlert,
      domain_scores: avgDomainScores,
      z_scores: avgZScores
    },
    differential,
    cascade: aggCascade,
    sentinels: aggSentinels,
    baseline_summary: {
      complete: baseline.complete,
      sessions: baseline.sessions,
      audio_available: baseline.audio_available,
      high_variance: baseline.high_variance
    },
    per_session: sessionResults.map((r, i) => ({
      session_id: r.session_id,
      duration_s: r.duration_s,
      composite: r.composite,
      alert_level: r.alert_level,
      domain_scores: r.domain_scores,
      indicator_count: r.indicator_count,
      audio_available: r.audio_available,
      sentinel_alerts: r.sentinel_alerts,
      cascade: r.cascade
    }))
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(fullResults, null, 2));

  console.log(`\n${'═'.repeat(56)}`);
  console.log(`Results written to: ${OUTPUT_PATH}`);
  console.log(`${'═'.repeat(56)}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
