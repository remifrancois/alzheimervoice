#!/usr/bin/env node
/**
 * generate-demo-data.js — Generate a complete demo dataset offline.
 *
 * Creates Marie (75, FR) with:
 * - Patient profile
 * - Memory profile with 4 family memories
 * - 14 baseline sessions (calibration)
 * - 16 monitoring sessions with progressive decline
 * - Baseline computation
 * - Weekly analyses (4 weeks)
 *
 * NO API KEY NEEDED — uses synthetic but realistic data.
 * Usage: node src/scripts/generate-demo-data.js
 */
import { createPatient, savePatient } from '../models/patient.js';
import { createSession, saveSession } from '../models/session.js';
import { createMemory, saveMemoryProfile } from '../models/memory.js';
import {
  CVF_FEATURES, ALL_FEATURES, computeBaseline, computeDelta,
  computeComposite, computeDomainScores, getAlertLevel,
  createBaseline, saveBaseline, saveWeeklyAnalysis
} from '../models/cvf.js';
import { detectCascadePattern } from '../services/drift-detector.js';

// Realistic baseline values for a healthy 75-year-old French speaker
const HEALTHY_PROFILES = {
  L1_ttr:       { mean: 0.68, std: 0.03 },  // Good type-token ratio
  L2_brunet:    { mean: 0.72, std: 0.04 },  // Rich vocabulary (Brunet's W)
  L3_honore:    { mean: 0.65, std: 0.05 },  // Honoré's R — good hapax legomena
  L4_content_density: { mean: 0.70, std: 0.03 },
  L5_word_frequency:  { mean: 0.60, std: 0.04 },  // Uses some rare words

  S1_mlu:       { mean: 0.72, std: 0.04 },  // Good sentence length
  S2_subordination: { mean: 0.65, std: 0.05 },  // Uses subordinate clauses
  S3_completeness:  { mean: 0.78, std: 0.03 },  // Completes most sentences
  S4_passive_ratio: { mean: 0.55, std: 0.04 },  // Some passive voice
  S5_embedding_depth: { mean: 0.60, std: 0.05 },

  C1_idea_density:  { mean: 0.70, std: 0.04 },
  C2_topic_maintenance: { mean: 0.75, std: 0.03 },  // Stays on topic
  C3_referential_coherence: { mean: 0.72, std: 0.04 },
  C4_temporal_sequencing: { mean: 0.68, std: 0.05 },
  C5_information_units: { mean: 0.65, std: 0.04 },

  F1_long_pause_ratio: { mean: 0.70, std: 0.04 },  // Few long pauses (higher = better)
  F2_filler_rate: { mean: 0.72, std: 0.03 },  // Few fillers
  F3_false_starts: { mean: 0.75, std: 0.04 },  // Rare false starts
  F4_repetition_rate: { mean: 0.78, std: 0.03 },  // Rare repetition
  F5_response_latency: { mean: 0.65, std: 0.05 },

  M1_free_recall: { mean: 0.70, std: 0.06 },
  M2_cued_recall: { mean: 0.80, std: 0.04 },
  M3_recognition: { mean: 0.85, std: 0.03 },
  M4_temporal_precision: { mean: 0.65, std: 0.06 },
  M5_emotional_engagement: { mean: 0.75, std: 0.04 }
};

// AD decline progression by domain (per session multiplier)
// Follows the cascade: lexical → coherence → syntactic → fluency → memory
const DECLINE_RATES = {
  // Lexical declines first (semantic memory involvement)
  L1_ttr: 1.4, L2_brunet: 1.5, L3_honore: 1.3, L4_content_density: 1.2, L5_word_frequency: 1.6,
  // Coherence declines second
  C1_idea_density: 1.2, C2_topic_maintenance: 1.1, C3_referential_coherence: 1.3, C4_temporal_sequencing: 1.0, C5_information_units: 1.1,
  // Syntactic declines third (slower)
  S1_mlu: 0.8, S2_subordination: 0.9, S3_completeness: 0.7, S4_passive_ratio: 0.6, S5_embedding_depth: 0.8,
  // Fluency declines (pauses increase first per Young 2024)
  F1_long_pause_ratio: 1.3, F2_filler_rate: 1.1, F3_false_starts: 1.0, F4_repetition_rate: 1.2, F5_response_latency: 1.4,
  // Memory declines
  M1_free_recall: 1.5, M2_cued_recall: 1.0, M3_recognition: 0.7, M4_temporal_precision: 1.3, M5_emotional_engagement: 0.8
};

function generateRealisticVector(sessionIndex, totalBaseline, maxDecline) {
  const vector = {};
  const isBaseline = sessionIndex < totalBaseline;

  for (const feature of ALL_FEATURES) {
    const profile = HEALTHY_PROFILES[feature];
    if (!profile) continue;

    let value;
    if (isBaseline) {
      // Baseline: natural variation around healthy mean
      value = profile.mean + (Math.random() - 0.5) * profile.std * 2;
      // Slight session-to-session autocorrelation
      if (sessionIndex > 0) {
        value += (Math.random() - 0.5) * 0.01;
      }
    } else {
      // Post-baseline: progressive decline
      const sessionsIntoDecline = sessionIndex - totalBaseline;
      const totalDeclineSessions = 16;
      const progress = sessionsIntoDecline / totalDeclineSessions;
      const decline = maxDecline * progress * (DECLINE_RATES[feature] || 1.0);

      value = profile.mean - decline + (Math.random() - 0.5) * profile.std * 1.5;
    }

    // Memory features occasionally null (not probed)
    if (feature.startsWith('M') && Math.random() < 0.2) {
      vector[feature] = null;
    } else {
      vector[feature] = Math.max(0.05, Math.min(0.95, value));
    }
  }

  return vector;
}

async function main() {
  console.log(`\n  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║  MemoVoice Demo Data Generator               ║`);
  console.log(`  ║  Patient: Marie, 75, FR                      ║`);
  console.log(`  ║  14 baseline + 16 monitoring = 30 sessions   ║`);
  console.log(`  ╚══════════════════════════════════════════════╝\n`);

  // 1. Create patient
  const patient = createPatient({
    firstName: 'Marie',
    language: 'fr',
    phoneNumber: '+33612345678',
    callTime: '09:00',
    timezone: 'Europe/Paris'
  });
  await savePatient(patient);
  console.log(`  Patient: ${patient.patient_id}`);

  // 2. Create memory profile
  const memories = [
    createMemory({
      content: "Voyage à Amsterdam en 1997 avec André pour voir les champs de tulipes à Keukenhof. Ils ont pris le train depuis Paris.",
      category: 'travel',
      people: ['André', 'Pierre'],
      places: ['Amsterdam', 'Keukenhof', 'Paris'],
      dates: ['1997'],
      emotionalValence: 'positive'
    }),
    createMemory({
      content: "Recette des asperges à la flamande de sa mère : œufs durs, beurre noisette, persil, et le secret — une pointe de muscade.",
      category: 'food',
      people: ['sa mère'],
      emotionalValence: 'positive'
    }),
    createMemory({
      content: "Pierre est parti à l'université en 1998 à Lyon. Il a étudié la médecine.",
      category: 'family',
      people: ['Pierre'],
      places: ['Lyon'],
      dates: ['1998'],
      emotionalValence: 'positive'
    }),
    createMemory({
      content: "André adorait les fleurs sombres, surtout les iris noirs. Ils les plantaient ensemble chaque automne au jardin.",
      category: 'hobby',
      people: ['André'],
      emotionalValence: 'positive'
    })
  ];

  await saveMemoryProfile({ patient_id: patient.patient_id, memories });
  console.log(`  Memories: ${memories.length} seeded`);

  // 3. Generate sessions
  const BASELINE_COUNT = 14;
  const TOTAL = 30;
  const MAX_DECLINE = 0.06;  // Subtle decline — shows GREEN → YELLOW → ORANGE progression
  const allVectors = [];
  const allSessions = [];

  // Confounders for realism
  const confounderSchedule = {
    5: { poor_sleep: true },       // Bad night during calibration
    12: { illness: true },          // Cold during calibration
    18: { poor_sleep: true },       // Bad night post-baseline
    22: { emotional_distress: true }, // Anniversary of André's passing
    25: { medication_change: true }   // Doctor adjusted medication
  };

  // Start date: 2026-01-01
  const startDate = new Date('2026-01-01T09:00:00+01:00');

  for (let i = 0; i < TOTAL; i++) {
    const sessionDate = new Date(startDate.getTime() + i * 86400000); // Daily
    const confounders = confounderSchedule[i] || {};

    const vector = generateRealisticVector(i, BASELINE_COUNT, MAX_DECLINE);
    allVectors.push(vector);

    const session = createSession({
      patientId: patient.patient_id,
      language: 'fr',
      transcript: [],  // No transcript for synthetic data
      durationSeconds: 280 + Math.floor(Math.random() * 40),
      confounders
    });

    // Override timestamp to simulate daily calls
    session.timestamp = sessionDate.toISOString();
    session.feature_vector = vector;
    session.extracted_at = sessionDate.toISOString();

    await saveSession(session);
    allSessions.push(session);

    const phase = i < BASELINE_COUNT ? 'CAL' : 'MON';
    const confStr = Object.keys(confounders).length > 0
      ? ` [${Object.keys(confounders).join(', ')}]`
      : '';
    process.stdout.write(`  [${String(i + 1).padStart(2)}/${TOTAL}] ${phase} ${sessionDate.toISOString().split('T')[0]}${confStr}\n`);
  }

  // 4. Compute and save baseline
  const baselineVectors = allVectors.slice(0, BASELINE_COUNT);
  const baselineStats = computeBaseline(baselineVectors);

  const baseline = createBaseline(patient.patient_id);
  baseline.calibration_complete = true;
  baseline.sessions_used = BASELINE_COUNT;
  baseline.baseline_vector = baselineStats;
  baseline.updated_at = new Date().toISOString();
  await saveBaseline(baseline);

  // Update patient
  patient.baseline_established = true;
  patient.baseline_sessions = BASELINE_COUNT;
  await savePatient(patient);

  console.log(`\n  Baseline established from ${BASELINE_COUNT} sessions`);

  // 5. Compute drift for post-baseline sessions
  console.log(`\n  POST-BASELINE DRIFT:`);
  console.log(`  ${'Sess'.padEnd(6)} ${'Date'.padEnd(12)} ${'Composite'.padEnd(12)} ${'Alert'.padEnd(8)} Domains`);
  console.log(`  ${'─'.repeat(70)}`);

  const weeklyData = {};

  for (let i = BASELINE_COUNT; i < TOTAL; i++) {
    const vector = allVectors[i];
    const delta = computeDelta(vector, baselineStats);
    const composite = computeComposite(delta);
    const domains = computeDomainScores(delta);
    const alert = getAlertLevel(composite);

    // Track highest alert
    const alertOrder = { green: 0, yellow: 1, orange: 2, red: 3 };
    if (alertOrder[alert] > alertOrder[patient.alert_level]) {
      patient.alert_level = alert;
    }

    const week = Math.floor((i - BASELINE_COUNT) / 7) + 1;
    if (!weeklyData[week]) weeklyData[week] = [];
    weeklyData[week].push({ composite, domains, confounders: allSessions[i].confounders });

    const domainStr = Object.entries(domains)
      .map(([d, z]) => `${d}:${z >= 0 ? '+' : ''}${z.toFixed(1)}`)
      .join(' ');
    const date = allSessions[i].timestamp.split('T')[0];
    console.log(`  ${String(i + 1).padEnd(6)} ${date.padEnd(12)} ${composite.toFixed(3).padEnd(12)} ${alert.toUpperCase().padEnd(8)} ${domainStr}`);
  }

  await savePatient(patient);

  // 6. Generate weekly analyses
  console.log(`\n  WEEKLY ANALYSES:`);
  for (const [weekStr, sessions] of Object.entries(weeklyData)) {
    const weekNumber = parseInt(weekStr);
    const avgComposite = sessions.reduce((s, d) => s + d.composite, 0) / sessions.length;
    const avgDomains = {};
    for (const domain of Object.keys(CVF_FEATURES)) {
      avgDomains[domain] = sessions.reduce((s, d) => s + d.domains[domain], 0) / sessions.length;
    }
    const alert = getAlertLevel(avgComposite);
    const patterns = detectCascadePattern(avgDomains);

    const analysis = {
      patient_id: patient.patient_id,
      week_number: weekNumber,
      composite_score: avgComposite,
      confidence: 0.85 - (weekNumber * 0.02),
      alert_level: alert,
      computed_composite: avgComposite,
      computed_domains: avgDomains,
      computed_alert: alert,
      domain_scores: avgDomains,
      cascade_patterns: patterns,
      sessions_analyzed: sessions.length,
      clinical_narrative_family: generateFamilyNarrative(weekNumber, alert, avgDomains),
      clinical_narrative_medical: generateMedicalNarrative(weekNumber, avgComposite, avgDomains, patterns),
      conversation_adaptations: generateAdaptations(avgDomains),
      next_week_focus: patterns.length > 0
        ? `Monitor ${patterns[0].name} pattern progression`
        : 'Continue standard monitoring',
      flags: patterns.map(p => p.description),
      created_at: new Date().toISOString()
    };

    await saveWeeklyAnalysis(analysis);
    console.log(`  Week ${weekNumber}: composite=${avgComposite.toFixed(3)} alert=${alert.toUpperCase()} patterns=${patterns.length}`);
  }

  // 7. Summary
  console.log(`\n  ═══════════════════════════════════════`);
  console.log(`  DEMO DATA GENERATED SUCCESSFULLY`);
  console.log(`  ═══════════════════════════════════════`);
  console.log(`  Patient ID: ${patient.patient_id}`);
  console.log(`  Sessions:   ${TOTAL} (${BASELINE_COUNT} baseline + ${TOTAL - BASELINE_COUNT} monitoring)`);
  console.log(`  Alert:      ${patient.alert_level.toUpperCase()}`);
  console.log(`  Data dir:   ./data/`);
  console.log(`\n  Start the server:`);
  console.log(`    npm run dev`);
  console.log(`\n  Then check:`);
  console.log(`    GET http://localhost:3001/api/patients`);
  console.log(`    GET http://localhost:3001/api/cvf/timeline/${patient.patient_id}`);
  console.log(`    GET http://localhost:3001/health\n`);
}

function generateFamilyNarrative(weekNumber, alert, domains) {
  if (alert === 'green') {
    return `Marie continue de bien se porter dans nos conversations cette semaine. Son vocabulaire reste riche et ses souvenirs sont clairs. Rien d'inquiétant à signaler.`;
  } else if (alert === 'yellow') {
    return `Marie a eu quelques conversations un peu moins fluides cette semaine, mais rien d'alarmant. Elle cherche parfois ses mots un peu plus que d'habitude. Nous continuerons à suivre attentivement.`;
  } else if (alert === 'orange') {
    return `Nous avons noté quelques changements dans les conversations de Marie cette semaine. Elle a tendance à simplifier ses phrases et ses souvenirs sont un peu moins précis. Nous vous recommandons d'en parler avec son médecin lors du prochain rendez-vous.`;
  }
  return `Des changements significatifs ont été observés dans la communication de Marie. Nous recommandons une consultation médicale rapide.`;
}

function generateMedicalNarrative(weekNumber, composite, domains, patterns) {
  const domainStr = Object.entries(domains)
    .map(([d, z]) => `${d}: z=${z.toFixed(2)}`)
    .join(', ');
  const patternStr = patterns.length > 0
    ? ` Cascade patterns: ${patterns.map(p => p.name).join(', ')}.`
    : '';
  return `Week ${weekNumber}: Composite z=${composite.toFixed(3)}. ${domainStr}.${patternStr} ${Math.abs(composite) > 0.5 ? 'Trending below baseline.' : 'Within normal variation.'}`;
}

function generateAdaptations(domains) {
  const adaptations = [];
  if (domains.lexical < -0.5) {
    adaptations.push("Use simpler vocabulary in conversation prompts");
  }
  if (domains.fluency < -0.5) {
    adaptations.push("Allow longer pauses, reduce time pressure");
  }
  if (domains.coherence < -0.5) {
    adaptations.push("Use more structured conversation topics");
  }
  if (domains.memory < -0.5) {
    adaptations.push("Increase cued recall before free recall probes");
  }
  if (adaptations.length === 0) {
    adaptations.push("Continue current conversation style");
  }
  return adaptations;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
