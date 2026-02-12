import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { readSecureJSONSafe, writeSecureJSON } from '../lib/secure-fs.js';

const DATA_DIR = path.resolve('data/patients');

export function createMemory({ content, source, category, people, places, dates, emotionalValence }) {
  return {
    id: `mem_${randomUUID().slice(0, 8)}`,
    content,
    source: source || 'family',
    date_added: new Date().toISOString().split('T')[0],
    category: category || 'other',  // achievement, family, travel, work, hobby, food, other
    people: people || [],
    places: places || [],
    dates: dates || [],
    emotional_valence: emotionalValence || 'positive',
    times_tested: 0,
    recall_history: []
  };
}

export async function loadMemoryProfile(patientId) {
  const filePath = path.join(DATA_DIR, `memories_${patientId}.json`);
  return await readSecureJSONSafe(filePath, { patient_id: patientId, memories: [] });
}

export async function saveMemoryProfile(profile) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `memories_${profile.patient_id}.json`);
  await writeSecureJSON(filePath, profile);
  return profile;
}

// Memory selection algorithm for daily calls
export function selectMemoriesForSession(memories, maxCount = 2) {
  if (memories.length === 0) return [];

  const now = new Date();
  const scored = memories.map(mem => {
    let priority = 0;

    // 1. Not tested in >7 days → high priority
    const lastTest = mem.recall_history.length > 0
      ? new Date(mem.recall_history[mem.recall_history.length - 1].date)
      : new Date(0);
    const daysSinceTest = (now - lastTest) / (1000 * 60 * 60 * 24);
    if (daysSinceTest > 7) priority += 3;
    else if (daysSinceTest > 3) priority += 1;

    // 2. Showed decline in last test → needs retest
    if (mem.recall_history.length > 0) {
      const last = mem.recall_history[mem.recall_history.length - 1];
      if (!last.success) priority += 2;
      if (last.type === 'cued' || last.type === 'recognition') priority += 1;
    }

    // 3. Mix emotional valence
    if (mem.emotional_valence === 'positive') priority += 0.5;

    // 4. Never tested → moderate priority
    if (mem.times_tested === 0) priority += 1.5;

    return { memory: mem, priority, daysSinceTest };
  });

  // Sort by priority descending, take top N
  scored.sort((a, b) => b.priority - a.priority);

  // Avoid testing same memory twice in a week
  const selected = [];
  for (const item of scored) {
    if (selected.length >= maxCount) break;
    if (item.daysSinceTest >= 2) {
      selected.push(item.memory);
    }
  }

  return selected;
}
