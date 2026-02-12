#!/usr/bin/env node
/**
 * validate-pipeline.js — End-to-end validation of the CVF math pipeline.
 * Tests all computations WITHOUT calling the Claude API.
 * Uses synthetic feature vectors to simulate 14 baseline + 6 decline sessions.
 *
 * Usage: node src/scripts/validate-pipeline.js
 */
import {
  CVF_FEATURES, ALL_FEATURES, DOMAIN_WEIGHTS, ALERT_THRESHOLDS,
  computeBaseline, computeDelta, computeComposite, computeDomainScores,
  getAlertLevel, createEmptyVector, createBaseline
} from '../models/cvf.js';
import { createPatient } from '../models/patient.js';
import { createSession } from '../models/session.js';
import { createMemory, selectMemoriesForSession } from '../models/memory.js';
import { detectCascadePattern } from '../services/drift-detector.js';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
  }
}

function assertApprox(actual, expected, tolerance, label) {
  const ok = Math.abs(actual - expected) < tolerance;
  if (ok) {
    console.log(`  ✓ ${label} (${actual.toFixed(4)} ≈ ${expected.toFixed(4)})`);
    passed++;
  } else {
    console.log(`  ✗ ${label} (got ${actual.toFixed(4)}, expected ${expected.toFixed(4)} ±${tolerance})`);
    failed++;
  }
}

// Generate a synthetic feature vector with controlled properties
function generateVector(healthLevel, noise = 0.03) {
  const vector = {};
  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    for (const feature of features) {
      // Base value near healthLevel, with per-feature offset for realism
      let value = healthLevel + (Math.random() - 0.5) * noise * 2;
      // Memory features sometimes null
      if (feature.startsWith('M') && Math.random() < 0.3) {
        value = null;
      } else {
        value = Math.max(0, Math.min(1, value));
      }
      vector[feature] = value;
    }
  }
  return vector;
}

// Generate a declining vector (specific domains decline faster, matching AD cascade)
function generateDecliningVector(baseLevel, declineAmount) {
  const vector = {};
  // AD cascade: lexical first, then coherence, then syntactic, then fluency
  const domainDeclineMultiplier = {
    lexical: 1.5,    // Declines first and fastest
    coherence: 1.3,  // Close second
    syntactic: 0.8,  // Slower decline
    fluency: 1.0,    // Moderate
    memory: 1.2      // Memory decline tracks lexical
  };

  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    const multiplier = domainDeclineMultiplier[domain];
    for (const feature of features) {
      if (feature.startsWith('M') && Math.random() < 0.2) {
        vector[feature] = null;
      } else {
        let value = baseLevel - (declineAmount * multiplier) + (Math.random() - 0.5) * 0.04;
        vector[feature] = Math.max(0, Math.min(1, value));
      }
    }
  }
  return vector;
}

async function main() {
  console.log(`\n  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║  MemoVoice CVF Pipeline Validation           ║`);
  console.log(`  ╚══════════════════════════════════════════════╝\n`);

  // --- Test 1: Feature definitions ---
  console.log(`  TEST 1: Feature Definitions`);
  assert(ALL_FEATURES.length === 25, `25 features defined (got ${ALL_FEATURES.length})`);
  assert(Object.keys(CVF_FEATURES).length === 5, `5 domains defined`);
  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    assert(features.length === 5, `${domain}: 5 features`);
  }
  const weightSum = Object.values(DOMAIN_WEIGHTS).reduce((a, b) => a + b, 0);
  assertApprox(weightSum, 1.0, 0.001, `Domain weights sum to 1.0`);
  console.log();

  // --- Test 2: Empty vector ---
  console.log(`  TEST 2: Empty Vector`);
  const empty = createEmptyVector();
  assert(Object.keys(empty).length === 25, `Empty vector has 25 features`);
  assert(Object.values(empty).every(v => v === 0.5), `All values are 0.5 (neutral)`);
  console.log();

  // --- Test 3: Baseline computation ---
  console.log(`  TEST 3: Baseline Computation (14 sessions)`);
  const baselineVectors = [];
  for (let i = 0; i < 14; i++) {
    baselineVectors.push(generateVector(0.65, 0.04));
  }
  const baselineResult = computeBaseline(baselineVectors);
  assert(Object.keys(baselineResult).length === 25, `Baseline has 25 feature stats`);

  // Check L1_ttr stats
  const l1 = baselineResult.L1_ttr;
  assert(l1.mean > 0 && l1.mean < 1, `L1_ttr mean in range (${l1.mean.toFixed(3)})`);
  assert(l1.std > 0, `L1_ttr std > 0 (${l1.std.toFixed(4)})`);
  assert(l1.range[0] <= l1.mean && l1.range[1] >= l1.mean, `L1_ttr range contains mean`);

  // Check all features have valid stats
  let allValid = true;
  for (const feature of ALL_FEATURES) {
    const stat = baselineResult[feature];
    if (!stat || stat.mean === undefined || stat.std === undefined) {
      allValid = false;
    }
  }
  assert(allValid, `All features have valid mean/std/range`);
  console.log();

  // --- Test 4: Delta computation (z-scores) ---
  console.log(`  TEST 4: Delta Computation (Z-Scores)`);

  // A vector at baseline should have near-zero deltas
  const atBaseline = {};
  for (const f of ALL_FEATURES) {
    atBaseline[f] = baselineResult[f].mean;
  }
  const zeroDelta = computeDelta(atBaseline, baselineResult);
  const maxZero = Math.max(...Object.values(zeroDelta).map(Math.abs));
  assertApprox(maxZero, 0, 0.001, `Baseline-matched vector has ~zero deltas`);

  // A declined vector should have negative deltas
  const declined = {};
  for (const f of ALL_FEATURES) {
    declined[f] = baselineResult[f].mean - baselineResult[f].std * 2;  // 2 SDs below
  }
  const negativeDelta = computeDelta(declined, baselineResult);
  const allNeg = Object.values(negativeDelta).every(d => d < 0);
  assert(allNeg, `2-SD decline produces all negative deltas`);
  assertApprox(negativeDelta.L1_ttr, -2.0, 0.001, `L1_ttr delta ≈ -2.0 (2 SDs below)`);
  console.log();

  // --- Test 5: Composite score ---
  console.log(`  TEST 5: Composite Score`);
  const zeroComposite = computeComposite(zeroDelta);
  assertApprox(zeroComposite, 0, 0.01, `Zero deltas → composite ≈ 0`);

  const negComposite = computeComposite(negativeDelta);
  assert(negComposite < -1.5, `2-SD decline → composite < -1.5 (got ${negComposite.toFixed(3)})`);

  // Check that composite is weighted correctly
  const singleDomain = {};
  for (const f of ALL_FEATURES) singleDomain[f] = 0;
  // Set only lexical features to -1
  for (const f of CVF_FEATURES.lexical) singleDomain[f] = -1.0;
  const lexOnlyComposite = computeComposite(singleDomain);
  assertApprox(lexOnlyComposite, -DOMAIN_WEIGHTS.lexical, 0.001, `Lexical-only decline weighted correctly`);
  console.log();

  // --- Test 6: Domain scores ---
  console.log(`  TEST 6: Domain Scores`);
  const domains = computeDomainScores(negativeDelta);
  assert(Object.keys(domains).length === 5, `5 domain scores`);
  for (const [domain, score] of Object.entries(domains)) {
    assert(score < 0, `${domain}: negative (${score.toFixed(3)})`);
  }
  console.log();

  // --- Test 7: Alert levels ---
  console.log(`  TEST 7: Alert Levels`);
  assert(getAlertLevel(0) === 'green', `z=0 → GREEN`);
  assert(getAlertLevel(-0.3) === 'green', `z=-0.3 → GREEN`);
  assert(getAlertLevel(-0.5) === 'green', `z=-0.5 → GREEN (boundary)`);
  assert(getAlertLevel(-0.51) === 'yellow', `z=-0.51 → YELLOW`);
  assert(getAlertLevel(-0.8) === 'yellow', `z=-0.8 → YELLOW`);
  assert(getAlertLevel(-1.01) === 'orange', `z=-1.01 → ORANGE`);
  assert(getAlertLevel(-1.5) === 'orange', `z=-1.5 → ORANGE (boundary)`);
  assert(getAlertLevel(-1.51) === 'red', `z=-1.51 → RED`);
  assert(getAlertLevel(-3.0) === 'red', `z=-3.0 → RED`);
  console.log();

  // --- Test 8: Cascade pattern detection ---
  console.log(`  TEST 8: AD Cascade Pattern Detection`);

  // Healthy — no patterns
  const healthyDomains = { lexical: 0.1, syntactic: 0.2, coherence: 0.0, fluency: -0.1, memory: 0.1 };
  const healthyPatterns = detectCascadePattern(healthyDomains);
  assert(healthyPatterns.length === 0, `Healthy scores → no cascade patterns`);

  // Stage 0: Fluency early warning (fluency down, lexical stable)
  const stage0 = { lexical: -0.1, syntactic: 0.0, coherence: 0.0, fluency: -0.7, memory: 0.0 };
  const s0patterns = detectCascadePattern(stage0);
  assert(s0patterns.some(p => p.stage === 0), `Fluency early warning detected (stage 0)`);
  assert(s0patterns.some(p => p.name === 'fluency_early_warning'), `Named fluency_early_warning`);

  // Stage 1: Semantic memory involvement (lexical + coherence decline)
  const stage1 = { lexical: -0.8, syntactic: -0.1, coherence: -0.7, fluency: -0.2, memory: -0.3 };
  const s1patterns = detectCascadePattern(stage1);
  assert(s1patterns.some(p => p.stage === 1), `Semantic memory involvement detected (stage 1)`);

  // Stage 2: Syntactic added on top of stage 1
  const stage2 = { lexical: -0.8, syntactic: -0.7, coherence: -0.7, fluency: -0.3, memory: -0.5 };
  const s2patterns = detectCascadePattern(stage2);
  assert(s2patterns.some(p => p.stage === 2), `Syntactic simplification detected (stage 2)`);

  // Stage 3: Discourse collapse
  const stage3 = { lexical: -1.2, syntactic: -0.8, coherence: -1.5, fluency: -0.8, memory: -1.0 };
  const s3patterns = detectCascadePattern(stage3);
  assert(s3patterns.some(p => p.stage === 3), `Discourse collapse detected (stage 3)`);
  console.log();

  // --- Test 9: Full simulation (14 baseline + 6 decline) ---
  console.log(`  TEST 9: Full 20-Session Simulation`);

  const sessionVectors = [];
  // 14 baseline sessions at healthy level
  for (let i = 0; i < 14; i++) {
    sessionVectors.push(generateVector(0.65, 0.04));
  }
  // 6 declining sessions
  for (let i = 0; i < 6; i++) {
    const decline = (i + 1) / 6 * 0.3;  // 0.05 to 0.3 decline
    sessionVectors.push(generateDecliningVector(0.65, decline));
  }

  // Compute baseline from first 14
  const baseline = computeBaseline(sessionVectors.slice(0, 14));
  assert(Object.keys(baseline).length === 25, `Baseline computed from 14 sessions`);

  // Track composites for the 6 decline sessions
  const composites = [];
  const alerts = [];
  for (let i = 14; i < 20; i++) {
    const delta = computeDelta(sessionVectors[i], baseline);
    const composite = computeComposite(delta);
    const alert = getAlertLevel(composite);
    composites.push(composite);
    alerts.push(alert);
  }

  // Composites should generally decrease
  assert(composites[composites.length - 1] < composites[0], `Composite decreases over decline sessions`);
  console.log(`    Composite trajectory: ${composites.map(c => c.toFixed(2)).join(' → ')}`);
  console.log(`    Alert trajectory: ${alerts.map(a => a.toUpperCase()).join(' → ')}`);

  // Last session should show some alert
  assert(alerts[alerts.length - 1] !== 'green' || composites[composites.length - 1] < -0.3,
    `Final session shows drift signal`);
  console.log();

  // --- Test 10: Model creation ---
  console.log(`  TEST 10: Model Creation`);
  const patient = createPatient({ firstName: 'Marie', language: 'fr' });
  assert(patient.patient_id.length > 0, `Patient has UUID`);
  assert(patient.first_name === 'Marie', `Patient name: Marie`);
  assert(patient.language === 'fr', `Patient language: fr`);
  assert(patient.baseline_established === false, `Baseline not established initially`);
  assert(patient.alert_level === 'green', `Initial alert: green`);

  const session = createSession({ patientId: patient.patient_id, language: 'fr', transcript: [] });
  assert(session.session_id.length > 0, `Session has UUID`);
  assert(session.patient_id === patient.patient_id, `Session linked to patient`);

  const memory = createMemory({
    content: 'Voyage en Hollande 1997',
    category: 'travel',
    people: ['André'],
    emotionalValence: 'positive'
  });
  assert(memory.id.startsWith('mem_'), `Memory has ID with prefix`);
  assert(memory.category === 'travel', `Memory category: travel`);
  assert(memory.times_tested === 0, `Memory not yet tested`);
  console.log();

  // --- Test 11: Memory selection ---
  console.log(`  TEST 11: Memory Selection Algorithm`);
  const memories = [
    { ...createMemory({ content: 'A', category: 'travel' }), times_tested: 0, recall_history: [] },
    { ...createMemory({ content: 'B', category: 'family' }), times_tested: 3,
      recall_history: [{ date: new Date(Date.now() - 10 * 86400000).toISOString(), success: true, type: 'free' }] },
    { ...createMemory({ content: 'C', category: 'food' }), times_tested: 2,
      recall_history: [{ date: new Date(Date.now() - 1 * 86400000).toISOString(), success: false, type: 'cued' }] },
  ];
  const selected = selectMemoriesForSession(memories, 2);
  assert(selected.length <= 2, `Selected at most 2 memories`);
  assert(selected.length > 0, `At least 1 memory selected`);
  console.log();

  // --- Test 12: Baseline object ---
  console.log(`  TEST 12: Baseline Object`);
  const baselineObj = createBaseline(patient.patient_id);
  assert(baselineObj.patient_id === patient.patient_id, `Baseline linked to patient`);
  assert(baselineObj.calibration_complete === false, `Not calibrated initially`);
  assert(baselineObj.sessions_used === 0, `Zero sessions used`);
  console.log();

  // --- Summary ---
  console.log(`  ═══════════════════════════════════════`);
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`  ═══════════════════════════════════════\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
