#!/usr/bin/env node
/**
 * simulate-timeline.js — Generate a full simulated patient timeline.
 *
 * Creates a patient (Marie, 75, FR), generates 14 baseline sessions
 * followed by sessions with progressive cognitive decline, processes
 * each through the CVF engine, and outputs the drift trajectory.
 *
 * Usage: npm run simulate [-- --sessions=20 --decline-start=0.0 --decline-end=0.6]
 * Requires: ANTHROPIC_API_KEY in .env
 */
import 'dotenv/config';
import { createPatient, savePatient } from '../models/patient.js';
import { createMemory, saveMemoryProfile, loadMemoryProfile } from '../models/memory.js';
import { processConversation } from '../services/cvf-engine.js';
import { generateConversation } from '../services/claude.js';
import { CVF_FEATURES } from '../models/cvf.js';

// Parse CLI args
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => {
      const [k, v] = a.replace('--', '').split('=');
      return [k, v];
    })
);

const TOTAL_SESSIONS = parseInt(args['sessions'] || '20', 10);
const DECLINE_START = parseFloat(args['decline-start'] || '0.0');
const DECLINE_END = parseFloat(args['decline-end'] || '0.6');
const LANGUAGE = args['language'] || 'fr';
const PATIENT_NAME = args['name'] || 'Marie';
const BASELINE_SESSIONS = 14;

async function main() {
  console.log(`\n  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║  MemoVoice CVF Timeline Simulation           ║`);
  console.log(`  ╠══════════════════════════════════════════════╣`);
  console.log(`  ║  Patient: ${(PATIENT_NAME + ' (' + LANGUAGE + ')').padEnd(34)} ║`);
  console.log(`  ║  Sessions: ${String(TOTAL_SESSIONS).padEnd(33)} ║`);
  console.log(`  ║  Baseline: ${String(BASELINE_SESSIONS).padEnd(33)} ║`);
  console.log(`  ║  Decline: ${(DECLINE_START + ' → ' + DECLINE_END).padEnd(34)} ║`);
  console.log(`  ╚══════════════════════════════════════════════╝\n`);

  // 1. Create patient
  const patient = createPatient({
    firstName: PATIENT_NAME,
    language: LANGUAGE
  });
  await savePatient(patient);
  console.log(`  Patient created: ${patient.patient_id}\n`);

  // 2. Seed memory profile with family memories
  const memoryProfile = await loadMemoryProfile(patient.patient_id);
  const memories = [
    createMemory({
      content: LANGUAGE === 'fr'
        ? "Voyage à Amsterdam en 1997 avec André pour voir les champs de tulipes à Keukenhof"
        : "Trip to Amsterdam in 1997 with David to see the tulip fields at Keukenhof",
      category: 'travel',
      people: LANGUAGE === 'fr' ? ['André'] : ['David'],
      places: ['Amsterdam', 'Keukenhof'],
      dates: ['1997'],
      emotionalValence: 'positive'
    }),
    createMemory({
      content: LANGUAGE === 'fr'
        ? "Recette des asperges à la flamande de sa mère, avec la pointe de muscade secrète"
        : "Mother's asparagus recipe with the secret touch of nutmeg",
      category: 'food',
      people: LANGUAGE === 'fr' ? ['sa mère'] : ['mother'],
      emotionalValence: 'positive'
    }),
    createMemory({
      content: LANGUAGE === 'fr'
        ? "Pierre, son fils, est parti à l'université en 1998"
        : "Thomas graduated from medical school in 2005",
      category: 'family',
      people: LANGUAGE === 'fr' ? ['Pierre'] : ['Thomas'],
      dates: LANGUAGE === 'fr' ? ['1998'] : ['2005'],
      emotionalValence: 'positive'
    }),
    createMemory({
      content: LANGUAGE === 'fr'
        ? "Les roses Queen of Night plantées en octobre — André aimait les fleurs sombres"
        : "The dark rose garden planted in October — David loved dark flowers",
      category: 'hobby',
      people: LANGUAGE === 'fr' ? ['André'] : ['David'],
      emotionalValence: 'positive'
    })
  ];

  memoryProfile.memories = memories;
  await saveMemoryProfile(memoryProfile);
  console.log(`  Seeded ${memories.length} family memories\n`);

  // 3. Run sessions
  const results = [];

  for (let i = 1; i <= TOTAL_SESSIONS; i++) {
    // Calculate decline level for this session
    let declineLevel;
    if (i <= BASELINE_SESSIONS) {
      // Baseline: small natural variation around 0 (healthy)
      declineLevel = DECLINE_START + (Math.random() * 0.05);
    } else {
      // Post-baseline: progressive decline
      const progress = (i - BASELINE_SESSIONS) / (TOTAL_SESSIONS - BASELINE_SESSIONS);
      declineLevel = DECLINE_START + progress * (DECLINE_END - DECLINE_START);
      // Add some noise
      declineLevel += (Math.random() - 0.5) * 0.05;
      declineLevel = Math.max(0, Math.min(1, declineLevel));
    }

    // Random confounders (10% chance each session)
    const confounders = {};
    if (Math.random() < 0.1) confounders.poor_sleep = true;
    if (Math.random() < 0.05) confounders.illness = true;

    const phase = i <= BASELINE_SESSIONS ? 'BASELINE' : 'MONITOR';
    console.log(`  [${String(i).padStart(2)}/${TOTAL_SESSIONS}] ${phase} | decline=${declineLevel.toFixed(2)} ${Object.keys(confounders).length > 0 ? '⚠ ' + Object.keys(confounders).join(', ') : ''}`);

    try {
      // Generate simulated conversation
      console.log(`         Generating conversation...`);
      const transcript = await generateConversation({
        patient,
        memoryProfile,
        sessionNumber: i,
        declineLevel,
        language: LANGUAGE
      });

      // Process through CVF engine
      console.log(`         Extracting features & computing CVF...`);
      const result = await processConversation({
        patientId: patient.patient_id,
        transcript,
        language: LANGUAGE,
        confounders,
        durationSeconds: 300
      });

      results.push({
        session: i,
        phase,
        declineLevel,
        confounders,
        status: result.status,
        composite: result.composite_score || null,
        alertLevel: result.alert_level || null,
        domainScores: result.domain_scores || null
      });

      // Display result
      if (result.status === 'calibrating') {
        console.log(`         → Calibrating (${result.sessionsComplete}/${result.sessionsTarget}) [${result.phase || ''}]`);
      } else if (result.status === 'baseline_established') {
        console.log(`         → BASELINE ESTABLISHED after ${result.sessionsUsed} sessions`);
      } else if (result.status === 'drift_computed') {
        const comp = result.composite_score.toFixed(3);
        const alert = result.alert_level.toUpperCase();
        console.log(`         → Composite: ${comp} | Alert: ${alert}`);
        if (result.domain_scores) {
          const domains = Object.entries(result.domain_scores)
            .map(([d, z]) => `${d}:${z.toFixed(2)}`)
            .join(' ');
          console.log(`           Domains: ${domains}`);
        }
      }
      console.log();

    } catch (err) {
      console.error(`         ERROR: ${err.message}\n`);
      results.push({
        session: i,
        phase,
        declineLevel,
        error: err.message
      });
    }

    // Small delay to avoid rate limiting
    if (i < TOTAL_SESSIONS) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // 4. Summary
  console.log(`\n  ═══════════════════════════════════════`);
  console.log(`  SIMULATION SUMMARY`);
  console.log(`  ═══════════════════════════════════════`);
  console.log(`  Patient: ${PATIENT_NAME} (${patient.patient_id})`);
  console.log(`  Total sessions: ${results.length}`);

  const driftSessions = results.filter(r => r.status === 'drift_computed');
  if (driftSessions.length > 0) {
    console.log(`\n  POST-BASELINE DRIFT TRAJECTORY:`);
    console.log(`  ${'Session'.padEnd(10)} ${'Decline'.padEnd(10)} ${'Composite'.padEnd(12)} ${'Alert'.padEnd(10)}`);
    console.log(`  ${'─'.repeat(42)}`);
    for (const s of driftSessions) {
      console.log(`  ${String(s.session).padEnd(10)} ${s.declineLevel.toFixed(2).padEnd(10)} ${(s.composite?.toFixed(3) || 'N/A').padEnd(12)} ${(s.alertLevel || 'N/A').toUpperCase().padEnd(10)}`);
    }
  }

  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.log(`\n  Errors: ${errors.length} sessions failed`);
  }

  console.log(`\n  Data saved to ./data/`);
  console.log(`  Run the server (npm run dev) and check GET /api/cvf/timeline/${patient.patient_id}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
