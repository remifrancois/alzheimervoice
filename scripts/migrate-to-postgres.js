#!/usr/bin/env node

/**
 * AlzheimerVoice — Data Migration: JSON files → PostgreSQL
 *
 * Migrates all data from /data/ directory to Neon PostgreSQL.
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable set
 *   - Migrations 001-003 already applied
 *   - Data files in DATA_ROOT (default: ./data)
 *
 * Usage:
 *   node scripts/migrate-to-postgres.js
 *   node scripts/migrate-to-postgres.js --dry-run
 *   DATA_ROOT=./data DATABASE_URL=postgres://... node scripts/migrate-to-postgres.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_ROOT = path.resolve(process.env.DATA_ROOT || path.join(ROOT, 'data'));

const DRY_RUN = process.argv.includes('--dry-run');
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Counters for summary
const stats = {
  organizations: 0,
  users: 0,
  userPatientAccess: 0,
  patients: 0,
  sessions: 0,
  baselines: 0,
  weeklyReports: 0,
  memories: 0,
  memoryRecallEvents: 0,
  errors: [],
};

async function main() {
  console.log('=== AlzheimerVoice Data Migration ===');
  console.log(`Data source: ${DATA_ROOT}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('');

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is required');
    process.exit(1);
  }

  // Dynamic import of the database module
  const { query, withTransaction, closePool } = await import('@azh/database');

  try {
    // Verify connection
    const { rows } = await query('SELECT current_database() AS db, now() AS time');
    console.log(`Connected to: ${rows[0].db} at ${rows[0].time}`);
    console.log('');

    if (DRY_RUN) {
      console.log('[DRY RUN] Scanning data files...');
      await scanData();
      printSummary();
      return;
    }

    await withTransaction(async (client) => {
      // Step 1: Ensure default org exists (seed should have done this)
      console.log('Step 1: Verifying default organization...');
      const { rows: orgs } = await client.query(
        'SELECT id FROM organizations WHERE id = $1', [DEFAULT_ORG_ID]
      );
      if (orgs.length === 0) {
        console.error('ERROR: Default organization not found. Run migration 003_seed_default_org.sql first.');
        throw new Error('Default org missing');
      }
      stats.organizations = 1;
      console.log(`  Default org: ${DEFAULT_ORG_ID}`);

      // Step 2: Migrate users
      console.log('\nStep 2: Migrating users...');
      await migrateUsers(client);

      // Step 3: Migrate patients
      console.log('\nStep 3: Migrating patients...');
      await migratePatients(client);

      // Step 4: Create user_patient_access entries
      console.log('\nStep 4: Creating user→patient access mappings...');
      await migrateUserPatientAccess(client);

      // Step 5: Migrate sessions
      console.log('\nStep 5: Migrating sessions...');
      await migrateSessions(client);

      // Step 6: Migrate baselines
      console.log('\nStep 6: Migrating baselines...');
      await migrateBaselines(client);

      // Step 7: Migrate weekly reports
      console.log('\nStep 7: Migrating weekly reports...');
      await migrateWeeklyReports(client);

      // Step 8: Migrate memories
      console.log('\nStep 8: Migrating memories...');
      await migrateMemories(client);
    });

    console.log('\n');
    printSummary();

    // Verify counts
    console.log('\n=== Verification ===');
    await verifyCounts(query);

  } finally {
    await closePool();
  }
}

// ── Step 2: Users ──

async function migrateUsers(client) {
  let users;
  try {
    const data = await fs.readFile(path.join(DATA_ROOT, 'users.json'), 'utf-8');
    users = JSON.parse(data);
  } catch {
    console.log('  No users.json found, using default users');
    users = getDefaultUsers();
  }

  for (const user of users) {
    try {
      // Map role: superadmin → admin (enum doesn't have superadmin)
      let role = user.role;
      if (role === 'superadmin') role = 'admin';

      // Map plan: admin → enterprise
      let plan = user.plan;
      if (plan === 'admin') plan = 'enterprise';

      await client.query(`
        INSERT INTO users (id, org_id, name, email, role, plan, avatar, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        ON CONFLICT (id) DO NOTHING
      `, [user.id, DEFAULT_ORG_ID, user.name, user.email, role, plan, user.avatar || '']);

      stats.users++;
      console.log(`  User: ${user.name} (${user.role} → ${role})`);
    } catch (err) {
      stats.errors.push(`User ${user.id}: ${err.message}`);
      console.error(`  ERROR: User ${user.id}: ${err.message}`);
    }
  }
}

// ── Step 3: Patients ──

async function migratePatients(client) {
  const patientsDir = path.join(DATA_ROOT, 'patients');
  let files;
  try {
    files = await fs.readdir(patientsDir);
  } catch {
    console.log('  No patients directory found');
    return;
  }

  const patientFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('memories_'));

  for (const file of patientFiles) {
    try {
      const data = JSON.parse(await fs.readFile(path.join(patientsDir, file), 'utf-8'));

      await client.query(`
        INSERT INTO patients (
          patient_id, org_id, first_name, language, phone_number,
          call_schedule, baseline_established, baseline_sessions,
          alert_level, confounders, personality_notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (patient_id) DO NOTHING
      `, [
        data.patient_id,
        DEFAULT_ORG_ID,
        data.first_name,
        data.language || 'fr',
        data.phone_number,
        JSON.stringify(data.call_schedule || {}),
        data.baseline_established || false,
        data.baseline_sessions || 0,
        data.alert_level || 'green',
        JSON.stringify(data.confounders || {}),
        data.personality_notes || '',
        data.created_at || new Date().toISOString(),
      ]);

      stats.patients++;
      console.log(`  Patient: ${data.first_name} (${data.patient_id})`);
    } catch (err) {
      stats.errors.push(`Patient ${file}: ${err.message}`);
      console.error(`  ERROR: Patient ${file}: ${err.message}`);
    }
  }
}

// ── Step 4: User→Patient Access ──

async function migrateUserPatientAccess(client) {
  let users;
  try {
    const data = await fs.readFile(path.join(DATA_ROOT, 'users.json'), 'utf-8');
    users = JSON.parse(data);
  } catch {
    users = getDefaultUsers();
  }

  for (const user of users) {
    // Clinicians: assignedPatients[]
    if (user.assignedPatients?.length > 0) {
      for (const patientId of user.assignedPatients) {
        try {
          await client.query(`
            INSERT INTO user_patient_access (user_id, patient_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, patient_id) DO NOTHING
          `, [user.id, patientId]);

          stats.userPatientAccess++;
          console.log(`  Access: ${user.name} → ${patientId}`);
        } catch (err) {
          stats.errors.push(`Access ${user.id}→${patientId}: ${err.message}`);
        }
      }
    }

    // Family: patientId
    if (user.patientId) {
      try {
        await client.query(`
          INSERT INTO user_patient_access (user_id, patient_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, patient_id) DO NOTHING
        `, [user.id, user.patientId]);

        stats.userPatientAccess++;
        console.log(`  Access: ${user.name} → ${user.patientId}`);
      } catch (err) {
        stats.errors.push(`Access ${user.id}→${user.patientId}: ${err.message}`);
      }
    }
  }
}

// ── Step 5: Sessions ──

async function migrateSessions(client) {
  const sessionsDir = path.join(DATA_ROOT, 'sessions');
  let files;
  try {
    files = await fs.readdir(sessionsDir);
  } catch {
    console.log('  No sessions directory found');
    return;
  }

  const sessionFiles = files.filter(f => f.endsWith('.json'));
  let count = 0;

  for (const file of sessionFiles) {
    try {
      const data = JSON.parse(await fs.readFile(path.join(sessionsDir, file), 'utf-8'));

      await client.query(`
        INSERT INTO sessions (
          session_id, patient_id, org_id, language, timestamp,
          duration_seconds, transcript, confounders, feature_vector,
          extracted_at, v3, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (session_id) DO NOTHING
      `, [
        data.session_id,
        data.patient_id,
        DEFAULT_ORG_ID,
        data.language || 'fr',
        data.timestamp,
        data.duration_seconds || 0,
        JSON.stringify(data.transcript || []),
        JSON.stringify(data.confounders || {}),
        data.feature_vector ? JSON.stringify(data.feature_vector) : null,
        data.extracted_at,
        data.v3 || false,
        data.created_at || data.timestamp,
      ]);

      stats.sessions++;
      count++;
      if (count % 50 === 0) {
        console.log(`  Migrated ${count}/${sessionFiles.length} sessions...`);
      }
    } catch (err) {
      stats.errors.push(`Session ${file}: ${err.message}`);
    }
  }
  console.log(`  Done: ${stats.sessions} sessions migrated`);
}

// ── Step 6: Baselines ──

async function migrateBaselines(client) {
  // V1 baselines
  const cvfDir = path.join(DATA_ROOT, 'cvf');
  try {
    const files = await fs.readdir(cvfDir);
    for (const file of files) {
      if (!file.startsWith('baseline_') || !file.endsWith('.json')) continue;

      try {
        const data = JSON.parse(await fs.readFile(path.join(cvfDir, file), 'utf-8'));

        await client.query(`
          INSERT INTO baselines (
            patient_id, org_id, version, complete, sessions_used,
            vector, personality_notes, created_at
          ) VALUES ($1, $2, 'v1', $3, $4, $5, $6, $7)
          ON CONFLICT (patient_id, version) DO NOTHING
        `, [
          data.patient_id,
          DEFAULT_ORG_ID,
          data.calibration_complete || false,
          data.sessions_used || 0,
          JSON.stringify(data.baseline_vector || {}),
          data.personality_notes || '',
          data.created_at || new Date().toISOString(),
        ]);

        stats.baselines++;
        console.log(`  V1 baseline: ${data.patient_id}`);
      } catch (err) {
        stats.errors.push(`V1 baseline ${file}: ${err.message}`);
      }
    }
  } catch {}

  // V3 baselines
  const v3Dir = path.join(DATA_ROOT, 'v3-baselines');
  try {
    const files = await fs.readdir(v3Dir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      try {
        const data = JSON.parse(await fs.readFile(path.join(v3Dir, file), 'utf-8'));
        const patientId = data.patient_id || file.replace('v3_baseline_', '').replace('.json', '');

        await client.query(`
          INSERT INTO baselines (
            patient_id, org_id, version, complete, sessions_used,
            vector, created_at
          ) VALUES ($1, $2, 'v3', $3, $4, $5, $6)
          ON CONFLICT (patient_id, version) DO NOTHING
        `, [
          patientId,
          DEFAULT_ORG_ID,
          true,
          data.sessions_used || 0,
          JSON.stringify(data),
          data.created_at || new Date().toISOString(),
        ]);

        stats.baselines++;
        console.log(`  V3 baseline: ${patientId}`);
      } catch (err) {
        stats.errors.push(`V3 baseline ${file}: ${err.message}`);
      }
    }
  } catch {}
}

// ── Step 7: Weekly Reports ──

async function migrateWeeklyReports(client) {
  const reportsDir = path.join(DATA_ROOT, 'reports');
  let files;
  try {
    files = await fs.readdir(reportsDir);
  } catch {
    console.log('  No reports directory found');
    return;
  }

  const reportFiles = files.filter(f => f.startsWith('week_') && f.endsWith('.json'));

  for (const file of reportFiles) {
    try {
      const data = JSON.parse(await fs.readFile(path.join(reportsDir, file), 'utf-8'));

      // Extract promoted columns
      const compositeScore = data.composite_score ?? data.computed_composite ?? null;
      const alertLevel = data.alert_level || 'green';
      const sessionsAnalyzed = data.sessions_analyzed || 0;
      const domainScores = data.domain_scores ?? data.computed_domains ?? {};

      // Rest goes to report_body
      const reportBody = {
        confidence: data.confidence,
        computed_composite: data.computed_composite,
        computed_domains: data.computed_domains,
        cascade_patterns: data.cascade_patterns,
        clinical_narrative_family: data.clinical_narrative_family,
        clinical_narrative_medical: data.clinical_narrative_medical,
        conversation_adaptations: data.conversation_adaptations,
        next_week_focus: data.next_week_focus,
        flags: data.flags,
      };

      await client.query(`
        INSERT INTO weekly_reports (
          patient_id, org_id, week_number, version,
          composite_score, alert_level, sessions_analyzed, trend,
          domain_scores, report_body, created_at
        ) VALUES ($1, $2, $3, 'v3', $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (patient_id, week_number, version) DO NOTHING
      `, [
        data.patient_id,
        DEFAULT_ORG_ID,
        data.week_number,
        compositeScore,
        alertLevel,
        sessionsAnalyzed,
        0,  // trend not in file format
        JSON.stringify(domainScores),
        JSON.stringify(reportBody),
        data.created_at || new Date().toISOString(),
      ]);

      stats.weeklyReports++;
    } catch (err) {
      stats.errors.push(`Report ${file}: ${err.message}`);
    }
  }
  console.log(`  Done: ${stats.weeklyReports} weekly reports migrated`);
}

// ── Step 8: Memories ──

async function migrateMemories(client) {
  const patientsDir = path.join(DATA_ROOT, 'patients');
  let files;
  try {
    files = await fs.readdir(patientsDir);
  } catch {
    console.log('  No patients directory found');
    return;
  }

  const memoryFiles = files.filter(f => f.startsWith('memories_') && f.endsWith('.json'));

  for (const file of memoryFiles) {
    try {
      const profile = JSON.parse(await fs.readFile(path.join(patientsDir, file), 'utf-8'));
      const patientId = profile.patient_id;

      for (const memory of (profile.memories || [])) {
        try {
          await client.query(`
            INSERT INTO memories (
              id, patient_id, org_id, content, source, category,
              people, places, dates, emotional_valence, times_tested, date_added
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO NOTHING
          `, [
            memory.id,
            patientId,
            DEFAULT_ORG_ID,
            memory.content,
            memory.source || 'family',
            memory.category || 'other',
            memory.people || [],
            memory.places || [],
            memory.dates || [],
            memory.emotional_valence || 'positive',
            memory.times_tested || 0,
            memory.date_added || new Date().toISOString().split('T')[0],
          ]);

          stats.memories++;

          // Migrate recall history as events
          if (memory.recall_history?.length > 0) {
            for (const event of memory.recall_history) {
              try {
                await client.query(`
                  INSERT INTO memory_recall_events (
                    memory_id, patient_id, recall_date, recall_type, success
                  ) VALUES ($1, $2, $3, $4, $5)
                `, [
                  memory.id,
                  patientId,
                  event.date,
                  event.type || 'free',
                  event.success,
                ]);
                stats.memoryRecallEvents++;
              } catch (err) {
                stats.errors.push(`Recall event for ${memory.id}: ${err.message}`);
              }
            }
          }
        } catch (err) {
          stats.errors.push(`Memory ${memory.id}: ${err.message}`);
        }
      }

      console.log(`  Memories for patient ${patientId}: ${profile.memories?.length || 0} memories`);
    } catch (err) {
      stats.errors.push(`Memory file ${file}: ${err.message}`);
    }
  }
}

// ── Dry run: scan data ──

async function scanData() {
  try {
    const usersData = await fs.readFile(path.join(DATA_ROOT, 'users.json'), 'utf-8');
    stats.users = JSON.parse(usersData).length;
  } catch {
    stats.users = 7; // default users
  }

  try {
    const files = await fs.readdir(path.join(DATA_ROOT, 'patients'));
    stats.patients = files.filter(f => f.endsWith('.json') && !f.startsWith('memories_')).length;

    for (const file of files.filter(f => f.startsWith('memories_'))) {
      const data = JSON.parse(await fs.readFile(path.join(DATA_ROOT, 'patients', file), 'utf-8'));
      stats.memories += data.memories?.length || 0;
      for (const m of (data.memories || [])) {
        stats.memoryRecallEvents += m.recall_history?.length || 0;
      }
    }
  } catch {}

  try {
    const files = await fs.readdir(path.join(DATA_ROOT, 'sessions'));
    stats.sessions = files.filter(f => f.endsWith('.json')).length;
  } catch {}

  try {
    const files = await fs.readdir(path.join(DATA_ROOT, 'cvf'));
    stats.baselines += files.filter(f => f.startsWith('baseline_')).length;
  } catch {}
  try {
    const files = await fs.readdir(path.join(DATA_ROOT, 'v3-baselines'));
    stats.baselines += files.filter(f => f.endsWith('.json')).length;
  } catch {}

  try {
    const files = await fs.readdir(path.join(DATA_ROOT, 'reports'));
    stats.weeklyReports = files.filter(f => f.startsWith('week_')).length;
  } catch {}
}

// ── Verification ──

async function verifyCounts(queryFn) {
  const tables = ['organizations', 'users', 'user_patient_access', 'patients', 'sessions', 'baselines', 'weekly_reports', 'memories', 'memory_recall_events'];

  for (const table of tables) {
    const { rows } = await queryFn(`SELECT COUNT(*)::int AS count FROM ${table}`);
    console.log(`  ${table}: ${rows[0].count} rows`);
  }
}

// ── Helpers ──

function getDefaultUsers() {
  return [
    { id: 'u1', name: 'Super Admin', email: 'admin@memovoice.ai', role: 'superadmin', avatar: 'SA', plan: 'admin', assignedPatients: [] },
    { id: 'u2', name: 'Dr. Remi Francois', email: 'remi@memovoice.ai', role: 'clinician', avatar: 'RF', plan: 'clinical', assignedPatients: [] },
    { id: 'u3', name: 'Dr. Sophie Martin', email: 'sophie@memovoice.ai', role: 'clinician', avatar: 'SM', plan: 'clinical', assignedPatients: [] },
    { id: 'u4', name: 'Pierre Dupont', email: 'pierre@famille.fr', role: 'family', avatar: 'PD', plan: 'free', patientId: null },
    { id: 'u5', name: 'Marie-Claire Petit', email: 'mc@famille.fr', role: 'family', avatar: 'MP', plan: 'free', patientId: null },
    { id: 'u6', name: 'Jean Administrateur', email: 'jean@memovoice.ai', role: 'admin', avatar: 'JA', plan: 'admin', assignedPatients: [] },
    { id: 'u-demo', name: 'Demo User', email: 'demo@memovoice.ai', role: 'clinician', avatar: 'DU', plan: 'clinical', assignedPatients: [] },
  ];
}

function printSummary() {
  console.log('=== Migration Summary ===');
  console.log(`  Organizations:         ${stats.organizations}`);
  console.log(`  Users:                 ${stats.users}`);
  console.log(`  User→Patient access:   ${stats.userPatientAccess}`);
  console.log(`  Patients:              ${stats.patients}`);
  console.log(`  Sessions:              ${stats.sessions}`);
  console.log(`  Baselines:             ${stats.baselines}`);
  console.log(`  Weekly reports:        ${stats.weeklyReports}`);
  console.log(`  Memories:              ${stats.memories}`);
  console.log(`  Memory recall events:  ${stats.memoryRecallEvents}`);

  if (stats.errors.length > 0) {
    console.log(`\n  ERRORS (${stats.errors.length}):`);
    for (const err of stats.errors) {
      console.log(`    - ${err}`);
    }
  } else {
    console.log('\n  No errors!');
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
