#!/usr/bin/env node
/**
 * Profile01 V4 Final Analysis Runner
 *
 * Merges pre-extracted text features + acoustic features and runs
 * the full V4 scoring pipeline with differential diagnosis.
 */

import { readFile, writeFile } from 'fs/promises';

// V4 Engine imports
const engineDir = '/Users/code/azh/services/cvf/src/engine/v4';
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

const EXTRACTED_PATH = '/Users/code/azh/scripts/profile01_extracted.json';
const TEXT_FEATURES_PATH = '/Users/code/azh/scripts/profile01_text_features.json';
const OUTPUT_PATH = '/Users/code/azh/scripts/profile01_v4_results.json';

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

function normalizeAcousticVector(rawFeatures, gender) {
  const vector = {};
  if (rawFeatures.f1_mean != null && rawFeatures.f2_mean != null && rawFeatures.f2_mean > 0) {
    rawFeatures.f1f2_ratio = rawFeatures.f1_mean / rawFeatures.f2_mean;
  }
  if (rawFeatures.f0_sd != null && rawFeatures.f0_mean != null && rawFeatures.f0_mean > 0) {
    rawFeatures.monopitch = rawFeatures.f0_sd / rawFeatures.f0_mean;
  }
  for (const id of AUDIO_INDICATORS) {
    const pythonKey = Object.entries(PYTHON_KEY_TO_INDICATOR).find(([, indId]) => indId === id)?.[0];
    if (!pythonKey || rawFeatures[pythonKey] == null) { vector[id] = null; continue; }
    vector[id] = normalizeAcousticValue(id, rawFeatures[pythonKey], gender);
  }
  return vector;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  MemoVoice CVF V4 — Profile01 Full Diagnostic Analysis  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const extracted = JSON.parse(await readFile(EXTRACTED_PATH, 'utf-8'));
  const textFeatures = JSON.parse(await readFile(TEXT_FEATURES_PATH, 'utf-8'));

  console.log(`Loaded ${extracted.sessions_count} sessions + ${Object.keys(textFeatures).length} text feature sets.\n`);

  // Detect gender from F0
  const f0Values = extracted.sessions.map(s => s.acoustic_features?.f0_mean).filter(v => v != null);
  const avgF0 = f0Values.reduce((a, b) => a + b, 0) / f0Values.length;
  const detectedGender = avgF0 > 165 ? 'female' : 'male';
  console.log(`Speaker Profile: ${detectedGender.toUpperCase()} (avg F0: ${avgF0.toFixed(1)} Hz)\n`);

  // ─── STEP 1: Merge text + acoustic features ───
  console.log('━━━ STEP 1: Feature Vector Assembly (85 indicators) ━━━\n');

  const sessionVectors = [];

  for (const session of extracted.sessions) {
    const sid = session.session_id;
    const tf = textFeatures[sid];

    if (!tf) {
      console.log(`  [${sid}] Skipped (no text features)`);
      continue;
    }

    // Start with text features
    const fullVector = {};
    for (const id of ALL_INDICATOR_IDS) {
      const extractable = INDICATORS[id].extractable;
      if (extractable === 'audio' || extractable === 'micro_task' || extractable === 'meta') {
        fullVector[id] = null;
      } else {
        fullVector[id] = tf[id] != null ? Math.max(0, Math.min(1, tf[id])) : null;
      }
    }

    // Merge acoustic features
    if (session.acoustic_features && !session.acoustic_features.error) {
      const acousticVector = normalizeAcousticVector({ ...session.acoustic_features }, detectedGender);
      for (const [id, value] of Object.entries(acousticVector)) {
        if (value != null) fullVector[id] = value;
      }
    }

    const textCount = Object.entries(fullVector).filter(([id, v]) => v != null && !AUDIO_INDICATORS.includes(id)).length;
    const audioCount = Object.entries(fullVector).filter(([id, v]) => v != null && AUDIO_INDICATORS.includes(id)).length;
    const totalCount = Object.values(fullVector).filter(v => v != null).length;

    console.log(`  [${sid}] ${textCount} text + ${audioCount} audio = ${totalCount} indicators | dur=${session.acoustic_features?.duration_s || '?'}s`);

    sessionVectors.push({
      session_id: sid,
      duration_s: session.acoustic_features?.duration_s || 0,
      language: session.transcript?.language || 'fr',
      feature_vector: fullVector,
      raw_acoustic: session.acoustic_features,
      transcript_text: session.transcript?.text || ''
    });
  }

  console.log(`\n  ✓ ${sessionVectors.length} complete feature vectors assembled.\n`);

  // ─── STEP 2: Baseline ───
  console.log('━━━ STEP 2: Baseline Computation ━━━\n');

  const vectors = sessionVectors.map(s => s.feature_vector);
  const baseline = computeV4Baseline(vectors, Math.min(vectors.length, 5));

  console.log(`  Status: ${baseline.complete ? 'COMPLETE' : 'PARTIAL'}`);
  console.log(`  Sessions: ${baseline.sessions} | Audio: ${baseline.audio_sessions} sessions`);
  console.log(`  High variance: ${baseline.high_variance?.length || 0} indicators`);
  if (baseline.high_variance?.length > 0) {
    console.log(`    → ${baseline.high_variance.slice(0, 10).join(', ')}${baseline.high_variance.length > 10 ? '...' : ''}`);
  }

  // Show baseline means for key indicators
  console.log('\n  Key Baseline Values (mean ± std):');
  const keyIndicators = [
    'LEX_TTR', 'SEM_IDEA_DENSITY', 'SEM_REF_COHERENCE', 'SYN_MLU',
    'TMP_LPR', 'ACU_F0_SD', 'ACU_HNR', 'PDM_PPE', 'AFF_NEG_VALENCE'
  ];
  for (const id of keyIndicators) {
    const b = baseline.vector?.[id];
    if (b && b.n > 0) {
      console.log(`    ${id.padEnd(26)} ${b.mean.toFixed(3)} ± ${b.std.toFixed(3)} (n=${b.n})`);
    }
  }

  // ─── STEP 3: Per-session analysis ───
  console.log('\n━━━ STEP 3: Per-Session V4 Analysis ━━━\n');

  const sessionResults = [];
  const history = [];

  for (let i = 0; i < sessionVectors.length; i++) {
    const sv = sessionVectors[i];
    const result = analyzeSession(sv.feature_vector, baseline, {}, history);

    const entry = {
      ...result,
      session_id: sv.session_id,
      duration_s: sv.duration_s
    };
    sessionResults.push(entry);
    history.push(entry);

    const ds = result.domain_scores;
    const alertIcon = { green: '🟢', yellow: '🟡', orange: '🟠', red: '🔴' }[result.alert_level];
    console.log(`  ${alertIcon} [${sv.session_id}] Composite: ${result.composite.toFixed(3).padStart(7)} | ${result.alert_level.toUpperCase().padEnd(6)} | ${result.indicator_count} indicators | ${sv.duration_s}s`);

    const domainStr = Object.entries(ds)
      .filter(([, v]) => v != null)
      .map(([d, v]) => `${d.slice(0,3)}=${v.toFixed(2)}`)
      .join(' ');
    console.log(`    ${domainStr}`);

    if (result.sentinel_alerts.length > 0) {
      for (const a of result.sentinel_alerts) {
        console.log(`    ⚠ SENTINEL: ${a.condition} (${a.triggered_count}/${a.total_sentinels})`);
      }
    }
    if (result.cascade.all.length > 0) {
      for (const c of result.cascade.all) {
        console.log(`    ⚡ CASCADE: ${c.cascade} stage ${c.stage} — ${c.name} (sev=${c.severity.toFixed(2)})`);
      }
    }
  }

  // ─── STEP 4: Aggregate ───
  console.log('\n━━━ STEP 4: Aggregate Profile Analysis ━━━\n');

  const avgDomainScores = {};
  for (const domain of Object.keys(DOMAINS)) {
    const vals = sessionResults.map(r => r.domain_scores[domain]).filter(v => v != null);
    avgDomainScores[domain] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  const avgZScores = {};
  for (const id of ALL_INDICATOR_IDS) {
    const vals = sessionResults.map(r => r.z_scores[id]).filter(v => v != null);
    avgZScores[id] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  const avgComposite = computeComposite(avgDomainScores);
  const avgAlert = getAlertLevel(avgComposite);

  const alertIcon = { green: '🟢', yellow: '🟡', orange: '🟠', red: '🔴' }[avgAlert];
  console.log(`  AGGREGATE COMPOSITE: ${avgComposite.toFixed(3)} → ${alertIcon} ${avgAlert.toUpperCase()}\n`);

  console.log('  Domain Scores (9-domain average):');
  console.log('  ┌──────────────┬─────────┬────────┬───────────────────────────────────┐');
  console.log('  │ Domain       │  Score  │ Weight │ Visual                            │');
  console.log('  ├──────────────┼─────────┼────────┼───────────────────────────────────┤');
  for (const [domain, weight] of Object.entries(DOMAIN_WEIGHTS)) {
    const score = avgDomainScores[domain];
    if (score != null) {
      const barLen = Math.round(Math.max(0, (score + 2) * 8));
      const bar = score >= -0.5 ? '█'.repeat(barLen) : '▓'.repeat(barLen);
      const color = score >= -0.5 ? '' : score >= -1.0 ? '' : '';
      console.log(`  │ ${domain.padEnd(12)} │ ${score.toFixed(3).padStart(7)} │  ${weight.toFixed(2)}  │ ${bar.padEnd(33)} │`);
    } else {
      console.log(`  │ ${domain.padEnd(12)} │    N/A  │  ${weight.toFixed(2)}  │ ${'—'.padEnd(33)} │`);
    }
  }
  console.log('  └──────────────┴─────────┴────────┴───────────────────────────────────┘');

  // ─── STEP 5: Differential Diagnosis ───
  console.log('\n━━━ STEP 5: Differential Diagnosis (23-Rule Engine) ━━━\n');

  const differential = runDifferential(avgDomainScores, avgZScores, {
    sessionCount: sessionVectors.length
  });

  console.log('  Probability Distribution:');
  const sortedProbs = Object.entries(differential.probabilities).sort((a, b) => b[1] - a[1]);
  for (const [condition, prob] of sortedProbs) {
    const pct = (prob * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(prob * 30));
    console.log(`    ${condition.padEnd(15)} ${pct.padStart(5)}% ${bar}`);
  }

  console.log(`\n  Primary:   ${differential.primary_hypothesis.toUpperCase()}`);
  console.log(`  Secondary: ${differential.secondary_hypothesis}`);
  console.log(`  Confidence: ${(differential.confidence * 100).toFixed(0)}%`);
  console.log(`  Rules Fired: ${differential.rules_fired}`);

  if (differential.flags.length > 0) {
    console.log(`  Flags: ${differential.flags.join(', ')}`);
  }

  console.log('\n  Evidence:');
  for (const [condition, evidences] of Object.entries(differential.evidence)) {
    if (evidences.length > 0) {
      console.log(`    ${condition.toUpperCase()}:`);
      for (const e of evidences) console.log(`      • ${e}`);
    }
  }

  console.log('\n  Recommendations:');
  for (const rec of differential.recommendation) {
    console.log(`    → ${rec}`);
  }

  // ─── STEP 6: Cascades & Sentinels ───
  console.log('\n━━━ STEP 6: Cascade & Sentinel Analysis ━━━\n');

  const aggCascade = detectCascade(avgDomainScores);
  const aggSentinels = checkSentinels(avgZScores);

  if (aggCascade.all.length > 0) {
    console.log('  Active Cascade Patterns:');
    for (const c of aggCascade.all) {
      console.log(`    ${c.cascade.toUpperCase()} Stage ${c.stage}: ${c.name}`);
      console.log(`      ${c.description}`);
      console.log(`      Severity: ${c.severity.toFixed(3)} | Confidence: ${(c.confidence * 100).toFixed(0)}%`);
    }
  } else {
    console.log('  No active cascade patterns detected.');
  }

  if (aggSentinels.length > 0) {
    console.log('\n  Sentinel Alerts:');
    for (const s of aggSentinels) {
      console.log(`    ${s.condition.toUpperCase()}: ${s.triggered_count}/${s.total_sentinels} sentinels (conf=${(s.confidence * 100).toFixed(0)}%)`);
      for (const d of s.details) {
        console.log(`      • ${d.name}: z=${d.z_score}`);
      }
    }
  } else {
    console.log('\n  No sentinel alerts triggered.');
  }

  // ─── STEP 7: Acoustic Voice Profile ───
  console.log('\n━━━ STEP 7: Acoustic Voice Signature ━━━\n');

  const acousticKeys = [
    ['f0_mean', 'Hz', 'Fundamental Frequency'],
    ['f0_sd', 'Hz', 'F0 Standard Deviation (Monopitch)'],
    ['f0_range', 'Hz', 'F0 Range'],
    ['jitter_local', '%', 'Jitter (vocal fold stability)'],
    ['shimmer_local', '%', 'Shimmer (amplitude stability)'],
    ['hnr', 'dB', 'Harmonics-to-Noise Ratio'],
    ['mfcc2_mean', '', 'MFCC-2 (vocal tract shape)'],
    ['cpp', 'dB', 'Cepstral Peak Prominence'],
    ['ppe', 'bits', 'Pitch Period Entropy (PD marker)'],
    ['rpde', '', 'RPDE (periodicity)'],
    ['dfa', '', 'DFA (fractal scaling)'],
    ['spectral_harmonicity', '', 'Spectral Harmonicity'],
    ['energy_range', 'dB', 'Energy Dynamic Range'],
  ];

  console.log('  ┌──────────────────────────────────────────┬──────────┬──────────┬────┐');
  console.log('  │ Feature                                  │     Mean │   StdDev │  n │');
  console.log('  ├──────────────────────────────────────────┼──────────┼──────────┼────┤');
  for (const [key, unit, name] of acousticKeys) {
    const vals = sessionVectors.map(s => s.raw_acoustic?.[key]).filter(v => v != null && typeof v === 'number');
    if (vals.length > 0) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, b) => a + (b - avg) ** 2, 0) / vals.length);
      console.log(`  │ ${name.padEnd(40)} │ ${avg.toFixed(3).padStart(8)} │ ${std.toFixed(3).padStart(8)} │ ${String(vals.length).padStart(2)} │`);
    }
  }
  console.log('  └──────────────────────────────────────────┴──────────┴──────────┴────┘');

  // ─── STEP 8: Session Stability ───
  console.log('\n━━━ STEP 8: Session-to-Session Stability ━━━\n');

  const composites = sessionResults.map(r => r.composite);
  const compMean = composites.reduce((a, b) => a + b, 0) / composites.length;
  const compStd = Math.sqrt(composites.reduce((a, b) => a + (b - compMean) ** 2, 0) / composites.length);
  const compCV = Math.abs(compMean) > 0.01 ? compStd / Math.abs(compMean) : 0;

  console.log(`  Composite scores across sessions:`);
  for (const r of sessionResults) {
    const bar = '█'.repeat(Math.round(Math.max(0, (r.composite + 2) * 10)));
    console.log(`    ${r.session_id}: ${r.composite.toFixed(3).padStart(7)} ${bar}`);
  }
  console.log(`\n  Mean: ${compMean.toFixed(3)} | Std: ${compStd.toFixed(3)} | CV: ${compCV.toFixed(2)}`);
  console.log(`  Pattern: ${compStd < 0.15 ? 'STABLE' : compCV > 0.5 ? 'EPISODIC (depression-like)' : 'VARIABLE'}`);

  // ─── WRITE RESULTS ───
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
    },
    differential,
    cascade: aggCascade,
    sentinels: aggSentinels,
    session_stability: { mean: compMean, std: compStd, cv: compCV },
    baseline_summary: {
      complete: baseline.complete,
      sessions: baseline.sessions,
      audio_available: baseline.audio_available,
      high_variance: baseline.high_variance
    },
    per_session: sessionResults.map(r => ({
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

  console.log(`\n${'═'.repeat(58)}`);
  console.log(`  Full results → ${OUTPUT_PATH}`);
  console.log(`${'═'.repeat(58)}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
