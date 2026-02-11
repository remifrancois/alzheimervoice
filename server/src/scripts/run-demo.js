#!/usr/bin/env node
/**
 * run-demo.js — Quick demo: single conversation extraction + drift check.
 *
 * Faster than full simulation. Creates a patient, runs one healthy
 * and one declined session to demonstrate the CVF pipeline end-to-end.
 *
 * Usage: npm run demo
 * Requires: ANTHROPIC_API_KEY in .env
 */
import 'dotenv/config';
import { createPatient, savePatient } from '../models/patient.js';
import { extractFeatures, generateConversation } from '../services/claude.js';
import {
  computeBaseline, computeDelta, computeComposite,
  computeDomainScores, getAlertLevel, CVF_FEATURES, ALL_FEATURES
} from '../models/cvf.js';

async function main() {
  console.log(`\n  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║  MemoVoice CVF — Quick Demo                  ║`);
  console.log(`  ║  "La voix se souvient de ce que              ║`);
  console.log(`  ║   l'esprit oublie."                          ║`);
  console.log(`  ╚══════════════════════════════════════════════╝\n`);

  const patient = createPatient({ firstName: 'Marie', language: 'fr' });
  await savePatient(patient);

  // --- Step 1: Generate + extract a healthy baseline session ---
  console.log(`  STEP 1: Healthy baseline session (decline=0.0)`);
  console.log(`  Generating conversation...`);

  const healthyTranscript = await generateConversation({
    patient,
    memoryProfile: null,
    sessionNumber: 1,
    declineLevel: 0.0,
    language: 'fr'
  });

  console.log(`  Extracting features...`);
  const healthyVector = await extractFeatures(healthyTranscript, {
    language: 'fr',
    patientProfile: patient,
    baselineInfo: null
  });

  console.log(`  Healthy vector extracted.\n`);
  printVector('HEALTHY', healthyVector);

  // --- Step 2: Generate + extract a declined session ---
  console.log(`\n  STEP 2: Declined session (decline=0.6)`);
  console.log(`  Generating conversation...`);

  const declinedTranscript = await generateConversation({
    patient,
    memoryProfile: null,
    sessionNumber: 30,
    declineLevel: 0.6,
    language: 'fr'
  });

  console.log(`  Extracting features...`);
  const declinedVector = await extractFeatures(declinedTranscript, {
    language: 'fr',
    patientProfile: patient,
    baselineInfo: null
  });

  console.log(`  Declined vector extracted.\n`);
  printVector('DECLINED', declinedVector);

  // --- Step 3: Compute drift between the two ---
  console.log(`\n  STEP 3: Drift Analysis (declined vs healthy baseline)`);

  // Create a synthetic baseline from the healthy vector
  // (In production, this uses 14 sessions — here we simulate with 1)
  const syntheticBaseline = {};
  for (const feature of ALL_FEATURES) {
    syntheticBaseline[feature] = {
      mean: healthyVector[feature] ?? 0.5,
      std: 0.05,  // Small std since single session
      range: [(healthyVector[feature] ?? 0.5) - 0.05, (healthyVector[feature] ?? 0.5) + 0.05]
    };
  }

  const delta = computeDelta(declinedVector, syntheticBaseline);
  const composite = computeComposite(delta);
  const domainScores = computeDomainScores(delta);
  const alertLevel = getAlertLevel(composite);

  console.log(`\n  DRIFT RESULTS:`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Composite Z-Score: ${composite.toFixed(3)}`);
  console.log(`  Alert Level: ${alertLevel.toUpperCase()}`);
  console.log();

  console.log(`  DOMAIN SCORES:`);
  for (const [domain, score] of Object.entries(domainScores)) {
    const bar = renderZBar(score);
    console.log(`    ${domain.padEnd(12)} z=${score.toFixed(2).padStart(6)}  ${bar}`);
  }

  console.log(`\n  FEATURE DELTAS (top changes):`);
  const sortedDeltas = Object.entries(delta)
    .filter(([k]) => !k.startsWith('extraction'))
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  for (const [feature, z] of sortedDeltas.slice(0, 10)) {
    const direction = z < 0 ? '↓' : '↑';
    console.log(`    ${feature.padEnd(26)} z=${z.toFixed(2).padStart(6)}  ${direction}`);
  }

  // --- Step 4: Show transcripts ---
  console.log(`\n  ─────────────────────────────────────`);
  console.log(`  SAMPLE TRANSCRIPT EXCERPTS:`);
  console.log(`\n  Healthy (Session 1):`);
  for (const turn of healthyTranscript.slice(0, 4)) {
    const speaker = turn.role === 'assistant' ? 'MemoVoice' : 'Marie';
    console.log(`    [${speaker}] ${turn.text.substring(0, 100)}${turn.text.length > 100 ? '...' : ''}`);
  }
  console.log(`\n  Declined (Session 30):`);
  for (const turn of declinedTranscript.slice(0, 4)) {
    const speaker = turn.role === 'assistant' ? 'MemoVoice' : 'Marie';
    console.log(`    [${speaker}] ${turn.text.substring(0, 100)}${turn.text.length > 100 ? '...' : ''}`);
  }

  console.log(`\n  Demo complete.\n`);
}

function printVector(label, vector) {
  console.log(`  ${label} VECTOR:`);
  for (const [domain, features] of Object.entries(CVF_FEATURES)) {
    const values = features.map(f => {
      const v = vector[f];
      return v != null ? v.toFixed(2) : 'null';
    });
    console.log(`    ${domain.padEnd(12)} ${values.join('  ')}`);
  }
}

function renderZBar(z) {
  // Z-score bar: center at 0, negative = bad (left), positive = good (right)
  const width = 20;
  const center = width / 2;
  const pos = Math.round(center + Math.max(-center, Math.min(center, z * (center / 2))));
  let bar = '';
  for (let i = 0; i < width; i++) {
    if (i === center) bar += '│';
    else if (z < 0 && i >= pos && i < center) bar += '▓';
    else if (z > 0 && i > center && i <= pos) bar += '▓';
    else bar += '·';
  }
  return `[${bar}]`;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
