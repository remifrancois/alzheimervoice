/**
 * Memory repository — PostgreSQL implementation.
 * Replaces file-based memory profile storage in @azh/shared-models/memory.
 *
 * Key difference: memories are individual rows, not a nested array in a JSON file.
 * recall_history is split into the memory_recall_events table.
 */

import { orgQuery, withOrgScope } from '../connection.js';

/**
 * Create a new memory object (in-memory only).
 */
export function createMemory({ content, source = 'family', category = 'other', people = [], places = [], dates = [], emotionalValence = 'positive' }) {
  const id = 'mem_' + crypto.randomUUID().slice(0, 8);
  return {
    id,
    content,
    source,
    date_added: new Date().toISOString().split('T')[0],
    category,
    people,
    places,
    dates,
    emotional_valence: emotionalValence,
    times_tested: 0,
    recall_history: [],
  };
}

/**
 * Save a single memory.
 * @param {string} orgId
 * @param {string} patientId
 * @param {object} memory
 * @returns {Promise<object>}
 */
export async function saveMemory(orgId, patientId, memory) {
  const { rows } = await orgQuery(orgId, `
    INSERT INTO memories (
      id, patient_id, org_id, content, source, category,
      people, places, dates, emotional_valence, times_tested, date_added
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      source = EXCLUDED.source,
      category = EXCLUDED.category,
      people = EXCLUDED.people,
      places = EXCLUDED.places,
      dates = EXCLUDED.dates,
      emotional_valence = EXCLUDED.emotional_valence,
      times_tested = EXCLUDED.times_tested
    RETURNING *
  `, [
    memory.id,
    patientId,
    orgId,
    memory.content,
    memory.source,
    memory.category,
    memory.people || [],
    memory.places || [],
    memory.dates || [],
    memory.emotional_valence,
    memory.times_tested || 0,
    memory.date_added,
  ]);

  return rowToMemory(rows[0]);
}

/**
 * Load memory profile for a patient (compatible with file-based format).
 * Returns { patient_id, memories: [...] }
 *
 * @param {string} orgId
 * @param {string} patientId
 * @returns {Promise<{patient_id: string, memories: object[]}>}
 */
export async function loadMemoryProfile(orgId, patientId) {
  const memories = await loadMemories(orgId, patientId);

  // Attach recall_history to each memory for compatibility
  const memoryIds = memories.map(m => m.id);
  let recallMap = {};

  if (memoryIds.length > 0) {
    const { rows: events } = await orgQuery(orgId, `
      SELECT * FROM memory_recall_events
      WHERE patient_id = $1
      ORDER BY recall_date ASC
    `, [patientId]);

    for (const event of events) {
      if (!recallMap[event.memory_id]) recallMap[event.memory_id] = [];
      recallMap[event.memory_id].push({
        date: event.recall_date,
        success: event.success,
        type: event.recall_type,
      });
    }
  }

  return {
    patient_id: patientId,
    memories: memories.map(m => ({
      ...m,
      recall_history: recallMap[m.id] || [],
    })),
  };
}

/**
 * Save a full memory profile (bulk upsert).
 * Compatible with file-based saveMemoryProfile({ patient_id, memories }).
 *
 * @param {string} orgId
 * @param {object} profile - { patient_id, memories: [...] }
 * @returns {Promise<object>}
 */
export async function saveMemoryProfile(orgId, profile) {
  const { patient_id: patientId, memories } = profile;

  await withOrgScope(orgId, async (client) => {
    for (const memory of memories) {
      await client.query(`
        INSERT INTO memories (
          id, patient_id, org_id, content, source, category,
          people, places, dates, emotional_valence, times_tested, date_added
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          source = EXCLUDED.source,
          category = EXCLUDED.category,
          people = EXCLUDED.people,
          places = EXCLUDED.places,
          dates = EXCLUDED.dates,
          emotional_valence = EXCLUDED.emotional_valence,
          times_tested = EXCLUDED.times_tested
      `, [
        memory.id,
        patientId,
        orgId,
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

      // Save recall history as events
      if (memory.recall_history?.length > 0) {
        for (const event of memory.recall_history) {
          await client.query(`
            INSERT INTO memory_recall_events (
              memory_id, patient_id, recall_date, recall_type, success
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
          `, [
            memory.id,
            patientId,
            event.date,
            event.type,
            event.success,
          ]);
        }
      }
    }
  });

  return profile;
}

/**
 * Load all memories for a patient (without recall_history).
 */
export async function loadMemories(orgId, patientId) {
  const { rows } = await orgQuery(orgId,
    'SELECT * FROM memories WHERE patient_id = $1 ORDER BY date_added ASC',
    [patientId]
  );
  return rows.map(rowToMemory);
}

/**
 * Record a memory recall event.
 */
export async function recordRecallEvent(orgId, { memoryId, patientId, sessionId, recallType, success }) {
  // Insert the event
  await orgQuery(orgId, `
    INSERT INTO memory_recall_events (memory_id, patient_id, session_id, recall_type, success)
    VALUES ($1, $2, $3, $4, $5)
  `, [memoryId, patientId, sessionId, recallType, success]);

  // Update times_tested counter
  await orgQuery(orgId, `
    UPDATE memories SET times_tested = times_tested + 1 WHERE id = $1
  `, [memoryId]);
}

/**
 * Delete all memories for a patient.
 */
export async function deletePatientMemories(orgId, patientId) {
  const { rowCount } = await orgQuery(orgId,
    'DELETE FROM memories WHERE patient_id = $1',
    [patientId]
  );
  return rowCount;
}

// -- Internal helpers --

function rowToMemory(row) {
  return {
    id: row.id,
    content: row.content,
    source: row.source,
    date_added: row.date_added,
    category: row.category,
    people: row.people || [],
    places: row.places || [],
    dates: row.dates || [],
    emotional_valence: row.emotional_valence,
    times_tested: row.times_tested,
  };
}
