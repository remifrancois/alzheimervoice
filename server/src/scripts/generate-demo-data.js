#!/usr/bin/env node
/**
 * generate-demo-data.js — Generate a complete demo dataset offline.
 *
 * Creates 4 patients:
 * - Marie (75, FR) — 90 days, progressive decline (GREEN → YELLOW → ORANGE)
 * - Thomas (52, EN) — 90 days, stable throughout (GREEN)
 * - Mike (68, EN) — 120 days, oscillating regression/normalize cycles
 * - Jenny (86, EN) — 40 days, already in critical state from the start
 *
 * NO API KEY NEEDED — uses synthetic but realistic data.
 * Usage: node src/scripts/generate-demo-data.js
 */
import fs from 'fs/promises';
import path from 'path';
import { createPatient, savePatient } from '../models/patient.js';
import { createSession, saveSession } from '../models/session.js';
import { createMemory, saveMemoryProfile } from '../models/memory.js';
import {
  CVF_FEATURES, ALL_FEATURES, computeBaseline, computeDelta,
  computeComposite, computeDomainScores, getAlertLevel,
  createBaseline, saveBaseline, saveWeeklyAnalysis
} from '../models/cvf.js';
import { detectCascadePattern } from '../services/drift-detector.js';

// ═══════════════════════════════════════════════════════════════════
//  AGE-APPROPRIATE HEALTHY PROFILES
// ═══════════════════════════════════════════════════════════════════

// Healthy 52-year-old (Thomas) — sharp, consistent
const PROFILE_52 = {
  L1_ttr: { mean: 0.76, std: 0.02 }, L2_brunet: { mean: 0.80, std: 0.03 },
  L3_honore: { mean: 0.73, std: 0.04 }, L4_content_density: { mean: 0.77, std: 0.02 },
  L5_word_frequency: { mean: 0.68, std: 0.03 },
  S1_mlu: { mean: 0.79, std: 0.03 }, S2_subordination: { mean: 0.72, std: 0.04 },
  S3_completeness: { mean: 0.84, std: 0.02 }, S4_passive_ratio: { mean: 0.58, std: 0.03 },
  S5_embedding_depth: { mean: 0.67, std: 0.04 },
  C1_idea_density: { mean: 0.76, std: 0.03 }, C2_topic_maintenance: { mean: 0.80, std: 0.02 },
  C3_referential_coherence: { mean: 0.78, std: 0.03 }, C4_temporal_sequencing: { mean: 0.74, std: 0.04 },
  C5_information_units: { mean: 0.72, std: 0.03 },
  F1_long_pause_ratio: { mean: 0.78, std: 0.03 }, F2_filler_rate: { mean: 0.76, std: 0.02 },
  F3_false_starts: { mean: 0.80, std: 0.03 }, F4_repetition_rate: { mean: 0.82, std: 0.02 },
  F5_response_latency: { mean: 0.72, std: 0.04 },
  M1_free_recall: { mean: 0.78, std: 0.05 }, M2_cued_recall: { mean: 0.85, std: 0.03 },
  M3_recognition: { mean: 0.90, std: 0.02 }, M4_temporal_precision: { mean: 0.73, std: 0.05 },
  M5_emotional_engagement: { mean: 0.80, std: 0.03 }
};

// Healthy 68-year-old (Mike) — good for age, moderate variation
const PROFILE_68 = {
  L1_ttr: { mean: 0.70, std: 0.03 }, L2_brunet: { mean: 0.74, std: 0.04 },
  L3_honore: { mean: 0.67, std: 0.05 }, L4_content_density: { mean: 0.72, std: 0.03 },
  L5_word_frequency: { mean: 0.62, std: 0.04 },
  S1_mlu: { mean: 0.74, std: 0.04 }, S2_subordination: { mean: 0.67, std: 0.05 },
  S3_completeness: { mean: 0.80, std: 0.03 }, S4_passive_ratio: { mean: 0.56, std: 0.04 },
  S5_embedding_depth: { mean: 0.62, std: 0.05 },
  C1_idea_density: { mean: 0.72, std: 0.04 }, C2_topic_maintenance: { mean: 0.76, std: 0.03 },
  C3_referential_coherence: { mean: 0.74, std: 0.04 }, C4_temporal_sequencing: { mean: 0.70, std: 0.05 },
  C5_information_units: { mean: 0.67, std: 0.04 },
  F1_long_pause_ratio: { mean: 0.72, std: 0.04 }, F2_filler_rate: { mean: 0.74, std: 0.03 },
  F3_false_starts: { mean: 0.77, std: 0.04 }, F4_repetition_rate: { mean: 0.80, std: 0.03 },
  F5_response_latency: { mean: 0.67, std: 0.05 },
  M1_free_recall: { mean: 0.72, std: 0.06 }, M2_cued_recall: { mean: 0.82, std: 0.04 },
  M3_recognition: { mean: 0.87, std: 0.03 }, M4_temporal_precision: { mean: 0.67, std: 0.06 },
  M5_emotional_engagement: { mean: 0.77, std: 0.04 }
};

// Healthy 75-year-old (Marie) — normal age-related baseline
const PROFILE_75 = {
  L1_ttr: { mean: 0.68, std: 0.03 }, L2_brunet: { mean: 0.72, std: 0.04 },
  L3_honore: { mean: 0.65, std: 0.05 }, L4_content_density: { mean: 0.70, std: 0.03 },
  L5_word_frequency: { mean: 0.60, std: 0.04 },
  S1_mlu: { mean: 0.72, std: 0.04 }, S2_subordination: { mean: 0.65, std: 0.05 },
  S3_completeness: { mean: 0.78, std: 0.03 }, S4_passive_ratio: { mean: 0.55, std: 0.04 },
  S5_embedding_depth: { mean: 0.60, std: 0.05 },
  C1_idea_density: { mean: 0.70, std: 0.04 }, C2_topic_maintenance: { mean: 0.75, std: 0.03 },
  C3_referential_coherence: { mean: 0.72, std: 0.04 }, C4_temporal_sequencing: { mean: 0.68, std: 0.05 },
  C5_information_units: { mean: 0.65, std: 0.04 },
  F1_long_pause_ratio: { mean: 0.70, std: 0.04 }, F2_filler_rate: { mean: 0.72, std: 0.03 },
  F3_false_starts: { mean: 0.75, std: 0.04 }, F4_repetition_rate: { mean: 0.78, std: 0.03 },
  F5_response_latency: { mean: 0.65, std: 0.05 },
  M1_free_recall: { mean: 0.70, std: 0.06 }, M2_cued_recall: { mean: 0.80, std: 0.04 },
  M3_recognition: { mean: 0.85, std: 0.03 }, M4_temporal_precision: { mean: 0.65, std: 0.06 },
  M5_emotional_engagement: { mean: 0.75, std: 0.04 }
};

// Healthy 86-year-old (Jenny) — lower baseline, more variable
const PROFILE_86 = {
  L1_ttr: { mean: 0.58, std: 0.04 }, L2_brunet: { mean: 0.62, std: 0.05 },
  L3_honore: { mean: 0.55, std: 0.06 }, L4_content_density: { mean: 0.60, std: 0.04 },
  L5_word_frequency: { mean: 0.52, std: 0.05 },
  S1_mlu: { mean: 0.62, std: 0.05 }, S2_subordination: { mean: 0.55, std: 0.06 },
  S3_completeness: { mean: 0.68, std: 0.04 }, S4_passive_ratio: { mean: 0.48, std: 0.05 },
  S5_embedding_depth: { mean: 0.50, std: 0.06 },
  C1_idea_density: { mean: 0.60, std: 0.05 }, C2_topic_maintenance: { mean: 0.65, std: 0.04 },
  C3_referential_coherence: { mean: 0.62, std: 0.05 }, C4_temporal_sequencing: { mean: 0.58, std: 0.06 },
  C5_information_units: { mean: 0.55, std: 0.05 },
  F1_long_pause_ratio: { mean: 0.58, std: 0.05 }, F2_filler_rate: { mean: 0.62, std: 0.04 },
  F3_false_starts: { mean: 0.65, std: 0.05 }, F4_repetition_rate: { mean: 0.68, std: 0.04 },
  F5_response_latency: { mean: 0.55, std: 0.06 },
  M1_free_recall: { mean: 0.58, std: 0.07 }, M2_cued_recall: { mean: 0.70, std: 0.05 },
  M3_recognition: { mean: 0.78, std: 0.04 }, M4_temporal_precision: { mean: 0.55, std: 0.07 },
  M5_emotional_engagement: { mean: 0.65, std: 0.05 }
};

// ═══════════════════════════════════════════════════════════════════
//  AD CASCADE DECLINE RATES
// ═══════════════════════════════════════════════════════════════════

// Per-feature multiplier following the cascade: lexical → coherence → syntactic → fluency → memory
const DECLINE_RATES = {
  L1_ttr: 1.4, L2_brunet: 1.5, L3_honore: 1.3, L4_content_density: 1.2, L5_word_frequency: 1.6,
  C1_idea_density: 1.2, C2_topic_maintenance: 1.1, C3_referential_coherence: 1.3, C4_temporal_sequencing: 1.0, C5_information_units: 1.1,
  S1_mlu: 0.8, S2_subordination: 0.9, S3_completeness: 0.7, S4_passive_ratio: 0.6, S5_embedding_depth: 0.8,
  F1_long_pause_ratio: 1.3, F2_filler_rate: 1.1, F3_false_starts: 1.0, F4_repetition_rate: 1.2, F5_response_latency: 1.4,
  M1_free_recall: 1.5, M2_cued_recall: 1.0, M3_recognition: 0.7, M4_temporal_precision: 1.3, M5_emotional_engagement: 0.8
};

// ═══════════════════════════════════════════════════════════════════
//  VECTOR GENERATION (supports 4 patterns)
// ═══════════════════════════════════════════════════════════════════

function generateVector(sessionIndex, config) {
  const { profile, baselineCount, totalSessions, pattern, maxDecline, initialDecline, noiseMultiplier } = config;
  const vector = {};
  const isBaseline = sessionIndex < baselineCount;
  const monitoringCount = totalSessions - baselineCount;
  const noise = noiseMultiplier ?? 1.5;

  for (const feature of ALL_FEATURES) {
    const p = profile[feature];
    if (!p) continue;

    let value;
    if (isBaseline) {
      // Natural variation around healthy mean
      value = p.mean + (Math.random() - 0.5) * p.std * 2;
      if (sessionIndex > 0) value += (Math.random() - 0.5) * 0.01;
    } else {
      const sessionsInto = sessionIndex - baselineCount;
      const rate = DECLINE_RATES[feature] || 1.0;
      let decline = 0;

      switch (pattern) {
        case 'decline': {
          // Linear progressive decline over entire monitoring period
          const progress = sessionsInto / monitoringCount;
          decline = maxDecline * progress * rate;
          break;
        }
        case 'stable': {
          // No decline — just natural noise
          decline = 0;
          break;
        }
        case 'oscillating': {
          // 4 phases: decline → normalize → decline → normalize
          const phaseLen = monitoringCount / 4;
          const phase = Math.floor(sessionsInto / phaseLen);
          const phaseProgress = (sessionsInto % phaseLen) / phaseLen;
          if (phase % 2 === 0) {
            // Slow regression: 0 → maxDecline
            decline = maxDecline * phaseProgress * rate;
          } else {
            // Normalize: maxDecline → 0
            decline = maxDecline * (1 - phaseProgress) * rate;
          }
          break;
        }
        case 'already_critical': {
          // Starts with large decline, continues worsening
          const progress = sessionsInto / monitoringCount;
          decline = (initialDecline + maxDecline * progress) * rate;
          break;
        }
      }

      value = p.mean - decline + (Math.random() - 0.5) * p.std * noise;
    }

    // Memory features occasionally null (not probed in ~20% of sessions)
    const nullRate = config.memoryNullRate ?? 0.2;
    if (feature.startsWith('M') && nullRate > 0 && Math.random() < nullRate) {
      vector[feature] = null;
    } else {
      vector[feature] = Math.max(0.05, Math.min(0.95, value));
    }
  }

  return vector;
}

// ═══════════════════════════════════════════════════════════════════
//  PATIENT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════

const PATIENT_CONFIGS = [
  // ── Marie (75, FR) — Progressive decline over 90 days ──
  {
    name: 'Marie',
    language: 'fr',
    phone: '+33612345678',
    callTime: '09:00',
    timezone: 'Europe/Paris',
    totalSessions: 90,
    baselineCount: 14,
    pattern: 'decline',
    maxDecline: 0.06,
    profile: PROFILE_75,
    memories: [
      { content: "Voyage à Amsterdam en 1997 avec André pour voir les champs de tulipes à Keukenhof. Ils ont pris le train depuis Paris.", category: 'travel', people: ['André', 'Pierre'], places: ['Amsterdam', 'Keukenhof', 'Paris'], dates: ['1997'], emotionalValence: 'positive' },
      { content: "Recette des asperges à la flamande de sa mère : œufs durs, beurre noisette, persil, et le secret — une pointe de muscade.", category: 'food', people: ['sa mère'], emotionalValence: 'positive' },
      { content: "Pierre est parti à l'université en 1998 à Lyon. Il a étudié la médecine.", category: 'family', people: ['Pierre'], places: ['Lyon'], dates: ['1998'], emotionalValence: 'positive' },
      { content: "André adorait les fleurs sombres, surtout les iris noirs. Ils les plantaient ensemble chaque automne au jardin.", category: 'hobby', people: ['André'], emotionalValence: 'positive' }
    ],
    confounders: {
      5: { poor_sleep: true },
      12: { illness: true },
      18: { poor_sleep: true },
      22: { emotional_distress: true },
      25: { medication_change: true },
      35: { poor_sleep: true },
      42: { illness: true },
      50: { poor_sleep: true },
      58: { emotional_distress: true },
      65: { medication_change: true },
      72: { poor_sleep: true },
      80: { illness: true },
      85: { poor_sleep: true }
    }
  },

  // ── Thomas (52, EN) — Stable throughout 90 days ──
  {
    name: 'Thomas',
    language: 'en',
    phone: '+12025551234',
    callTime: '08:00',
    timezone: 'America/New_York',
    totalSessions: 90,
    baselineCount: 14,
    pattern: 'stable',
    maxDecline: 0,
    noiseMultiplier: 0.8,
    memoryNullRate: 0,
    profile: PROFILE_52,
    memories: [
      { content: "Family vacation to Yellowstone in 2015 with wife Sarah and kids Emma and Jack. Watched Old Faithful erupt three times — Jack couldn't stop counting the seconds.", category: 'travel', people: ['Sarah', 'Emma', 'Jack'], places: ['Yellowstone'], dates: ['2015'], emotionalValence: 'positive' },
      { content: "Emma's first piano recital in 2019. She played Für Elise and didn't miss a single note. Sarah cried in the audience.", category: 'family', people: ['Emma', 'Sarah'], dates: ['2019'], emotionalValence: 'positive' },
      { content: "Building a treehouse with Dad in the summer of 1982. He let me use the power drill for the first time. It's still standing in their backyard.", category: 'family', people: ['Dad'], dates: ['1982'], emotionalValence: 'positive' },
      { content: "Annual fishing trip to Lake Michigan with college buddies — Mike, Dave, and Chris. We've gone every September since 1996. Dave still can't bait a hook.", category: 'hobby', people: ['Mike', 'Dave', 'Chris'], places: ['Lake Michigan'], dates: ['1996'], emotionalValence: 'positive' }
    ],
    confounders: {
      8: { poor_sleep: true },
      22: { illness: true },
      40: { poor_sleep: true },
      55: { poor_sleep: true },
      70: { illness: true },
      82: { poor_sleep: true }
    }
  },

  // ── Mike (68, EN) — Oscillating: slow regression → normalize (×2) over 120 days ──
  {
    name: 'Mike',
    language: 'en',
    phone: '+12025559876',
    callTime: '10:00',
    timezone: 'America/Chicago',
    totalSessions: 120,
    baselineCount: 14,
    pattern: 'oscillating',
    maxDecline: 0.025,
    noiseMultiplier: 1.2,
    profile: PROFILE_68,
    memories: [
      { content: "Retirement party after 35 years teaching high school math in 2023. Students from the class of '94 showed up with a signed yearbook. Carol organized the whole thing.", category: 'achievement', people: ['Carol'], dates: ['2023'], emotionalValence: 'positive' },
      { content: "Trip to Tuscany with Carol in 2018. Wine tasting in Chianti — she loved the Brunello and we shipped a whole case home.", category: 'travel', people: ['Carol'], places: ['Tuscany', 'Chianti'], dates: ['2018'], emotionalValence: 'positive' },
      { content: "Teaching grandson Tyler to ride a bike in the summer of 2022. He fell seven times and got right back up. The look on his face when he finally got it — pure joy.", category: 'family', people: ['Tyler'], dates: ['2022'], emotionalValence: 'positive' },
      { content: "The victory garden — heirloom tomatoes every summer since 1990. Brandywine and Cherokee Purple. Carol makes sauce from them every August.", category: 'hobby', people: ['Carol'], dates: ['1990'], emotionalValence: 'positive' }
    ],
    confounders: {
      5: { poor_sleep: true },
      18: { illness: true },
      30: { poor_sleep: true },
      45: { poor_sleep: true },
      55: { medication_change: true },
      70: { poor_sleep: true },
      85: { illness: true },
      95: { poor_sleep: true },
      110: { poor_sleep: true }
    }
  },

  // ── Jenny (86, EN) — Already in the red from day 1 of monitoring ──
  {
    name: 'Jenny',
    language: 'en',
    phone: '+12025554567',
    callTime: '09:30',
    timezone: 'America/Los_Angeles',
    totalSessions: 40,
    baselineCount: 14,
    pattern: 'already_critical',
    maxDecline: 0.03,
    initialDecline: 0.08,
    profile: PROFILE_86,
    memories: [
      { content: "Wedding day to Harold at St. Mary's Church in June 1962. Wore her mother's pearl necklace. Harold was so nervous he put the ring on the wrong hand.", category: 'family', people: ['Harold'], places: ["St. Mary's Church"], dates: ['1962'], emotionalValence: 'positive' },
      { content: "Ran Jenny's Sweet Corner bakery for 30 years, from 1970 to 2000. Famous for the apple pie — people drove from two towns over. Harold handled the books.", category: 'achievement', people: ['Harold'], dates: ['1970', '2000'], emotionalValence: 'positive' },
      { content: "Granddaughter Lily's college graduation in 2020 — summa cum laude in biology. She wants to be a marine biologist. Reminded Jenny of her own dreams at that age.", category: 'family', people: ['Lily'], dates: ['2020'], emotionalValence: 'positive' },
      { content: "Sunday dinners with the whole family. Harold's roast chicken with rosemary from the garden. The grandchildren always fought over the drumsticks.", category: 'food', people: ['Harold', 'Lily'], emotionalValence: 'positive' }
    ],
    confounders: {
      3: { poor_sleep: true },
      8: { illness: true },
      16: { poor_sleep: true },
      20: { medication_change: true },
      25: { illness: true },
      28: { emotional_distress: true },
      32: { poor_sleep: true },
      37: { medication_change: true }
    }
  }
];

// ═══════════════════════════════════════════════════════════════════
//  NARRATIVE GENERATION (bilingual)
// ═══════════════════════════════════════════════════════════════════

function generateFamilyNarrative(name, weekNumber, alert, domains, language) {
  if (language === 'fr') {
    if (alert === 'green')
      return `${name} continue de bien se porter dans nos conversations cette semaine. Son vocabulaire reste riche et ses souvenirs sont clairs. Rien d'inquiétant à signaler.`;
    if (alert === 'yellow')
      return `${name} a eu quelques conversations un peu moins fluides cette semaine, mais rien d'alarmant. Elle cherche parfois ses mots un peu plus que d'habitude. Nous continuerons à suivre attentivement.`;
    if (alert === 'orange')
      return `Nous avons noté quelques changements dans les conversations de ${name} cette semaine. Elle a tendance à simplifier ses phrases et ses souvenirs sont un peu moins précis. Nous vous recommandons d'en parler avec son médecin lors du prochain rendez-vous.`;
    return `Des changements significatifs ont été observés dans la communication de ${name}. Nous recommandons une consultation médicale rapide.`;
  }

  // English
  if (alert === 'green')
    return `${name} continues to do well in our conversations this week. Vocabulary remains rich and memories are clear. Nothing concerning to report.`;
  if (alert === 'yellow')
    return `${name} had a few less fluid conversations this week, but nothing alarming. Occasional word-finding pauses noted. We'll continue monitoring closely.`;
  if (alert === 'orange')
    return `We've noted some changes in ${name}'s conversations this week. There's a tendency toward simpler sentences and memories are somewhat less precise. We recommend discussing this with the doctor at the next appointment.`;
  return `Significant changes have been observed in ${name}'s communication patterns. We recommend a prompt medical consultation.`;
}

function generateMedicalNarrative(name, weekNumber, composite, domains, patterns) {
  const domainStr = Object.entries(domains)
    .map(([d, z]) => `${d}: z=${z.toFixed(2)}`)
    .join(', ');
  const patternStr = patterns.length > 0
    ? ` Cascade patterns: ${patterns.map(p => p.name).join(', ')}.`
    : '';
  return `Week ${weekNumber} (${name}): Composite z=${composite.toFixed(3)}. ${domainStr}.${patternStr} ${Math.abs(composite) > 0.5 ? 'Trending below baseline.' : 'Within normal variation.'}`;
}

function generateAdaptations(domains) {
  const adaptations = [];
  if (domains.lexical < -0.5) adaptations.push("Use simpler vocabulary in conversation prompts");
  if (domains.fluency < -0.5) adaptations.push("Allow longer pauses, reduce time pressure");
  if (domains.coherence < -0.5) adaptations.push("Use more structured conversation topics");
  if (domains.memory < -0.5) adaptations.push("Increase cued recall before free recall probes");
  if (adaptations.length === 0) adaptations.push("Continue current conversation style");
  return adaptations;
}

// ═══════════════════════════════════════════════════════════════════
//  DATA CLEANUP
// ═══════════════════════════════════════════════════════════════════

async function cleanData() {
  const dirs = ['data/patients', 'data/sessions', 'data/cvf', 'data/reports'];
  for (const dir of dirs) {
    const fullPath = path.resolve(dir);
    try { await fs.rm(fullPath, { recursive: true }); } catch {}
    await fs.mkdir(fullPath, { recursive: true });
  }
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`\n  ╔══════════════════════════════════════════════════════╗`);
  console.log(`  ║  MemoVoice Demo Data Generator                      ║`);
  console.log(`  ║  4 patients · multiple cognitive trajectories       ║`);
  console.log(`  ╚══════════════════════════════════════════════════════╝\n`);

  await cleanData();
  console.log(`  Data directories cleaned.\n`);

  for (const config of PATIENT_CONFIGS) {
    await generatePatient(config);
    console.log('');
  }

  console.log(`  ═══════════════════════════════════════`);
  console.log(`  ALL DEMO DATA GENERATED SUCCESSFULLY`);
  console.log(`  ═══════════════════════════════════════`);
  console.log(`  Data dir: ./data/`);
  console.log(`\n  Start the server:`);
  console.log(`    npm run dev`);
  console.log(`\n  Then check:`);
  console.log(`    GET http://localhost:3001/api/patients`);
  console.log(`    GET http://localhost:3001/health\n`);
}

async function generatePatient(config) {
  const {
    name, language, phone, callTime, timezone,
    totalSessions, baselineCount, pattern, maxDecline, initialDecline,
    profile, memories: memoryDefs, confounders: confounderSchedule
  } = config;

  const monitoringCount = totalSessions - baselineCount;

  console.log(`  ── ${name} (${language.toUpperCase()}) ── ${totalSessions} sessions · pattern: ${pattern}`);

  // 1. Create patient
  const patient = createPatient({
    firstName: name,
    language,
    phoneNumber: phone,
    callTime,
    timezone
  });
  await savePatient(patient);
  console.log(`  Patient: ${patient.patient_id}`);

  // 2. Create memory profile
  const memories = memoryDefs.map(m => createMemory(m));
  await saveMemoryProfile({ patient_id: patient.patient_id, memories });
  console.log(`  Memories: ${memories.length} seeded`);

  // 3. Generate sessions
  // Anchor end date so last session is around Feb 10, 2026
  const endDate = new Date('2026-02-10T09:00:00Z');
  const startDate = new Date(endDate.getTime() - (totalSessions - 1) * 86400000);

  const allVectors = [];
  const allSessions = [];

  for (let i = 0; i < totalSessions; i++) {
    const sessionDate = new Date(startDate.getTime() + i * 86400000);
    const confounders = confounderSchedule[i] || {};

    const vector = generateVector(i, {
      profile, baselineCount, totalSessions, pattern, maxDecline, initialDecline,
      noiseMultiplier: config.noiseMultiplier,
      memoryNullRate: config.memoryNullRate
    });
    allVectors.push(vector);

    const session = createSession({
      patientId: patient.patient_id,
      language,
      transcript: [],
      durationSeconds: 280 + Math.floor(Math.random() * 40),
      confounders
    });

    session.timestamp = sessionDate.toISOString();
    session.feature_vector = vector;
    session.extracted_at = sessionDate.toISOString();

    await saveSession(session);
    allSessions.push(session);

    const phase = i < baselineCount ? 'CAL' : 'MON';
    const confStr = Object.keys(confounders).length > 0
      ? ` [${Object.keys(confounders).join(', ')}]`
      : '';
    process.stdout.write(`  [${String(i + 1).padStart(3)}/${totalSessions}] ${phase} ${sessionDate.toISOString().split('T')[0]}${confStr}\n`);
  }

  // 4. Compute and save baseline
  const baselineVectors = allVectors.slice(0, baselineCount);
  const baselineStats = computeBaseline(baselineVectors);

  const baseline = createBaseline(patient.patient_id);
  baseline.calibration_complete = true;
  baseline.sessions_used = baselineCount;
  baseline.baseline_vector = baselineStats;
  baseline.updated_at = new Date().toISOString();
  await saveBaseline(baseline);

  patient.baseline_established = true;
  patient.baseline_sessions = baselineCount;
  await savePatient(patient);

  console.log(`\n  Baseline established from ${baselineCount} sessions`);

  // 5. Compute drift for post-baseline sessions
  console.log(`\n  POST-BASELINE DRIFT:`);
  console.log(`  ${'Sess'.padEnd(6)} ${'Date'.padEnd(12)} ${'Composite'.padEnd(12)} ${'Alert'.padEnd(8)} Domains`);
  console.log(`  ${'─'.repeat(70)}`);

  const weeklyData = {};

  for (let i = baselineCount; i < totalSessions; i++) {
    const vector = allVectors[i];
    const delta = computeDelta(vector, baselineStats);
    const composite = computeComposite(delta);
    const domains = computeDomainScores(delta);
    const alert = getAlertLevel(composite);

    const alertOrder = { green: 0, yellow: 1, orange: 2, red: 3 };
    if (alertOrder[alert] > alertOrder[patient.alert_level]) {
      patient.alert_level = alert;
    }

    const week = Math.floor((i - baselineCount) / 7) + 1;
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
      clinical_narrative_family: generateFamilyNarrative(name, weekNumber, alert, avgDomains, language),
      clinical_narrative_medical: generateMedicalNarrative(name, weekNumber, avgComposite, avgDomains, patterns),
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

  console.log(`\n  ${name}: ${patient.alert_level.toUpperCase()} | ${totalSessions} sessions | ${Object.keys(weeklyData).length} weekly reports`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
