/**
 * LAYER 5 — Synthetic Cohort (~150K tokens)
 *
 * 100 synthetic patient trajectories loaded in-context for k-NN matching.
 * Each trajectory = 52 weeks of CVF vectors simulating:
 *   Group A (40): Normal aging — stable, noise only
 *   Group B (20): MCI stable — mild decline then plateau
 *   Group C (25): MCI → AD progression — cascade pattern
 *   Group D (10): Depression — episodic fluctuations
 *   Group E (5):  Other dementias — distinctive patterns
 *
 * This is k-Nearest Neighbors IN CONTEXT — no training, just reasoning.
 * Opus can explain WHY a patient matches a group, not just that they do.
 */

import fs from 'fs/promises';
import path from 'path';
import { CVF_FEATURES, ALL_FEATURES, DOMAIN_WEIGHTS } from '../models/cvf.js';
import { readSecureJSONSafe, writeSecureJSON } from '../lib/secure-fs.js';

const DATA_DIR = path.resolve('data/cohort');
const COHORT_FILE = path.join(DATA_DIR, 'trajectories.json');

// Cohort group definitions
const COHORT_GROUPS = {
  A: { label: 'Normal Aging', count: 40, diagnosis: 'normal' },
  B: { label: 'MCI Stable', count: 20, diagnosis: 'mci_stable' },
  C: { label: 'MCI → AD', count: 25, diagnosis: 'alzheimer' },
  D: { label: 'Depression', count: 10, diagnosis: 'depression' },
  E: { label: 'Other Dementia', count: 5, diagnosis: 'other_dementia' }
};

/**
 * Generate the complete synthetic cohort (100 trajectories × 52 weeks).
 * Each trajectory is a clinically realistic CVF progression.
 */
export async function generateCohort() {
  const cohort = [];

  // Group A: Normal Aging (40 trajectories)
  for (let i = 1; i <= 40; i++) {
    cohort.push(generateNormalAging(`A${i}`, i));
  }

  // Group B: MCI Stable (20 trajectories)
  for (let i = 1; i <= 20; i++) {
    cohort.push(generateMCIStable(`B${i}`, i));
  }

  // Group C: MCI → AD (25 trajectories)
  for (let i = 1; i <= 25; i++) {
    cohort.push(generateMCItoAD(`C${i}`, i));
  }

  // Group D: Depression (10 trajectories)
  for (let i = 1; i <= 10; i++) {
    cohort.push(generateDepression(`D${i}`, i));
  }

  // Group E: Other Dementia (5 trajectories)
  for (let i = 1; i <= 3; i++) {
    cohort.push(generateLewyBody(`E${i}`, i));
  }
  for (let i = 4; i <= 5; i++) {
    cohort.push(generateVascular(`E${i}`, i));
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await writeSecureJSON(COHORT_FILE, cohort);

  return cohort;
}

/**
 * Load the pre-generated cohort.
 */
export async function loadCohort() {
  const data = await readSecureJSONSafe(COHORT_FILE, null);
  if (data) return data;
  return await generateCohort();
}

/**
 * Match a patient's trajectory against the cohort.
 * Returns k-nearest trajectories with predicted outcomes.
 */
export function matchTrajectory(patientTimeline, cohort, k = 5) {
  const currentWeek = patientTimeline.length;
  if (currentWeek < 3) {
    return { matches: [], predicted_outcome: null, confidence: 0 };
  }

  const similarities = cohort.map(member => {
    // Compare patient trajectory to cohort member's first N weeks
    const memberSlice = member.trajectory.slice(0, currentWeek);
    const distance = dtwDistance(patientTimeline, memberSlice);

    return {
      id: member.id,
      group: member.group,
      diagnosis: member.diagnosis,
      label: member.label,
      distance,
      future: member.trajectory.slice(currentWeek, currentWeek + 12), // Next 12 weeks
      outcome: member.outcome_week_52
    };
  });

  // Sort by distance, take top k
  similarities.sort((a, b) => a.distance - b.distance);
  const topK = similarities.slice(0, k);

  // Weighted outcome probabilities
  const maxDist = topK[topK.length - 1]?.distance || 1;
  const outcomes = {};
  let totalWeight = 0;

  for (const match of topK) {
    const weight = 1 - (match.distance / (maxDist + 0.001));
    outcomes[match.diagnosis] = (outcomes[match.diagnosis] || 0) + weight;
    totalWeight += weight;
  }

  // Normalize
  for (const key of Object.keys(outcomes)) {
    outcomes[key] = Math.round((outcomes[key] / totalWeight) * 100) / 100;
  }

  // Predicted trajectory (weighted average of top-k futures)
  const predictedFuture = predictTrajectory(topK, maxDist);

  return {
    matches: topK.map(m => ({
      id: m.id,
      group: m.group,
      label: m.label,
      diagnosis: m.diagnosis,
      distance: Math.round(m.distance * 1000) / 1000,
      future_weeks: m.future?.length || 0
    })),
    outcome_probabilities: outcomes,
    predicted_trajectory: predictedFuture,
    primary_prediction: Object.entries(outcomes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown',
    confidence: Math.round((1 - (topK[0]?.distance || 1) / (maxDist + 1)) * 100) / 100,
    weeks_analyzed: currentWeek
  };
}

/**
 * Build cohort context for the 1M token window.
 * Includes representative trajectories for Opus to reason over.
 */
export function buildCohortContext(cohort, patientTimeline) {
  // Select representative members from each group
  const representatives = [];
  for (const [group, config] of Object.entries(COHORT_GROUPS)) {
    const groupMembers = cohort.filter(m => m.group === group);
    // Take 3-5 representatives per group
    const count = Math.min(group === 'C' ? 5 : 3, groupMembers.length);
    representatives.push(...groupMembers.slice(0, count));
  }

  // Run matching if timeline available
  let matchResult = null;
  if (patientTimeline && patientTimeline.length >= 3) {
    matchResult = matchTrajectory(patientTimeline, cohort);
  }

  return `<synthetic_cohort total_members="${cohort.length}" groups="${Object.keys(COHORT_GROUPS).length}">

## SYNTHETIC COHORT — 100 Reference Trajectories

### Group Distribution
${Object.entries(COHORT_GROUPS).map(([g, c]) => `- **Group ${g}** (${c.count}): ${c.label} → ${c.diagnosis}`).join('\n')}

### Representative Trajectories
${representatives.map(m => `
<trajectory id="${m.id}" group="${m.group}" diagnosis="${m.diagnosis}" label="${m.label}">
Weeks 1-12 composite: ${m.trajectory.slice(0, 12).map(w => w.composite.toFixed(2)).join(', ')}
Weeks 13-24 composite: ${m.trajectory.slice(12, 24).map(w => w.composite.toFixed(2)).join(', ')}
Weeks 25-36 composite: ${m.trajectory.slice(24, 36).map(w => w.composite.toFixed(2)).join(', ')}
Weeks 37-52 composite: ${m.trajectory.slice(36, 52).map(w => w.composite.toFixed(2)).join(', ')}
Outcome at week 52: ${m.outcome_week_52}
</trajectory>`).join('\n')}

${matchResult ? `
### PATIENT MATCHING RESULTS
- Closest matches: ${matchResult.matches.map(m => `${m.id} (${m.diagnosis}, dist: ${m.distance})`).join(', ')}
- Outcome probabilities: ${JSON.stringify(matchResult.outcome_probabilities)}
- Primary prediction: ${matchResult.primary_prediction}
- Confidence: ${matchResult.confidence}
` : ''}

### INSTRUCTIONS
Compare the patient's trajectory to these reference trajectories.
- Which group does the patient's pattern most resemble?
- What outcome do the closest matches predict?
- WHY does the patient match these trajectories? (Explain the reasoning)

</synthetic_cohort>`;
}

// ========================================
// TRAJECTORY GENERATORS
// ========================================

function generateNormalAging(id, seed) {
  const trajectory = [];
  const baseComposite = 0.5 + jitter(seed, 0.05);

  for (let week = 1; week <= 52; week++) {
    const noise = jitter(seed + week, 0.03);
    const aging = -0.001 * week; // Very slight decline
    const composite = baseComposite + aging + noise;
    const domains = generateDomainScores(composite, 'normal', seed + week);
    trajectory.push({ week, composite: clamp(composite), domains });
  }

  return {
    id, group: 'A', label: `Normal Aging ${id}`,
    diagnosis: 'normal', trajectory,
    outcome_week_52: 'stable_normal'
  };
}

function generateMCIStable(id, seed) {
  const trajectory = [];
  const baseComposite = 0.45 + jitter(seed, 0.04);

  for (let week = 1; week <= 52; week++) {
    const noise = jitter(seed + week, 0.03);
    // Decline first 16 weeks, then plateau
    const decline = week <= 16 ? -0.004 * week : -0.004 * 16;
    const composite = baseComposite + decline + noise;
    const domains = generateDomainScores(composite, 'mci_stable', seed + week);
    trajectory.push({ week, composite: clamp(composite), domains });
  }

  return {
    id, group: 'B', label: `MCI Stable ${id}`,
    diagnosis: 'mci_stable', trajectory,
    outcome_week_52: 'stable_mci'
  };
}

function generateMCItoAD(id, seed) {
  const trajectory = [];
  const baseComposite = 0.48 + jitter(seed, 0.03);
  // Transition speed varies: 6-24 months
  const transitionSpeed = 0.003 + (seed % 10) * 0.0003;
  const onsetWeek = 8 + (seed % 12); // Onset between week 8-20

  for (let week = 1; week <= 52; week++) {
    const noise = jitter(seed + week, 0.025);
    let decline = 0;
    if (week > onsetWeek) {
      // Accelerating decline after onset
      const weeksPost = week - onsetWeek;
      decline = -transitionSpeed * weeksPost * (1 + weeksPost * 0.01);
    }
    const composite = baseComposite + decline + noise;
    const domains = generateDomainScores(composite, 'ad_progression', seed + week, week, onsetWeek);
    trajectory.push({ week, composite: clamp(composite), domains });
  }

  return {
    id, group: 'C', label: `MCI→AD ${id}`,
    diagnosis: 'alzheimer', trajectory,
    outcome_week_52: 'progressive_ad'
  };
}

function generateDepression(id, seed) {
  const trajectory = [];
  const baseComposite = 0.48 + jitter(seed, 0.04);

  for (let week = 1; week <= 52; week++) {
    const noise = jitter(seed + week, 0.03);
    // Episodic pattern: bad weeks cluster, then recovery
    const episodePhase = Math.sin((week + seed) * 0.3) * 0.08;
    const badEpisode = (week > 12 && week < 20) || (week > 32 && week < 38) ? -0.06 : 0;
    const composite = baseComposite + episodePhase + badEpisode + noise;
    const domains = generateDomainScores(composite, 'depression', seed + week);
    trajectory.push({ week, composite: clamp(composite), domains });
  }

  return {
    id, group: 'D', label: `Depression ${id}`,
    diagnosis: 'depression', trajectory,
    outcome_week_52: 'episodic_depression'
  };
}

function generateLewyBody(id, seed) {
  const trajectory = [];
  const baseComposite = 0.45 + jitter(seed, 0.03);

  for (let week = 1; week <= 52; week++) {
    const noise = jitter(seed + week, 0.05); // High fluctuation
    const decline = -0.002 * week;
    // Marked fluctuations characteristic of Lewy Body
    const fluctuation = Math.sin(week * 0.5 + seed) * 0.06;
    const composite = baseComposite + decline + fluctuation + noise;
    const domains = generateDomainScores(composite, 'lewy_body', seed + week);
    trajectory.push({ week, composite: clamp(composite), domains });
  }

  return {
    id, group: 'E', label: `Lewy Body ${id}`,
    diagnosis: 'other_dementia', trajectory,
    outcome_week_52: 'lewy_body_dementia'
  };
}

function generateVascular(id, seed) {
  const trajectory = [];
  const baseComposite = 0.47 + jitter(seed, 0.03);
  // Stepwise decline (vascular events)
  const steps = [15 + seed % 5, 30 + seed % 8];

  for (let week = 1; week <= 52; week++) {
    const noise = jitter(seed + week, 0.02);
    let decline = 0;
    for (const step of steps) {
      if (week > step) decline -= 0.05;
    }
    const composite = baseComposite + decline + noise;
    const domains = generateDomainScores(composite, 'vascular', seed + week);
    trajectory.push({ week, composite: clamp(composite), domains });
  }

  return {
    id, group: 'E', label: `Vascular ${id}`,
    diagnosis: 'other_dementia', trajectory,
    outcome_week_52: 'vascular_dementia'
  };
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function generateDomainScores(composite, type, seed, week = 0, onsetWeek = 0) {
  const domains = {};
  const domainNames = Object.keys(CVF_FEATURES);

  for (const domain of domainNames) {
    let score = composite + jitter(seed + domain.length, 0.02);

    // AD cascade: lexical+coherence decline first, then syntactic, then fluency
    if (type === 'ad_progression' && week > onsetWeek) {
      const weeksPost = week - onsetWeek;
      if (domain === 'lexical') score -= weeksPost * 0.003;
      else if (domain === 'coherence') score -= weeksPost * 0.0025;
      else if (domain === 'syntactic') score -= Math.max(0, weeksPost - 8) * 0.002;
      else if (domain === 'fluency') score -= Math.max(0, weeksPost - 12) * 0.0015;
      else if (domain === 'memory') score -= weeksPost * 0.004;
    }

    // Depression: coherence preserved, fluency hit
    if (type === 'depression') {
      if (domain === 'coherence') score += 0.02;
      if (domain === 'fluency') score -= 0.02;
    }

    domains[domain] = clamp(score);
  }

  return domains;
}

function jitter(seed, amplitude) {
  // Deterministic pseudo-random jitter
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 2 * amplitude;
}

function clamp(value, min = 0, max = 1) {
  return Math.round(Math.max(min, Math.min(max, value)) * 1000) / 1000;
}

/**
 * Simplified DTW (Dynamic Time Warping) distance for trajectory comparison.
 */
function dtwDistance(seq1, seq2) {
  const n = seq1.length;
  const m = seq2.length;
  if (n === 0 || m === 0) return Infinity;

  // Use composite scores for comparison
  const a = seq1.map(s => s.composite ?? s);
  const b = seq2.map(s => s.composite ?? s);

  const dtw = Array.from({ length: n + 1 }, () => new Float64Array(m + 1).fill(Infinity));
  dtw[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = Math.abs((typeof a[i - 1] === 'number' ? a[i - 1] : 0) -
                            (typeof b[j - 1] === 'number' ? b[j - 1] : 0));
      dtw[i][j] = cost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
    }
  }

  return dtw[n][m] / Math.max(n, m); // Normalize by length
}

function predictTrajectory(topK, maxDist) {
  if (!topK.length || !topK[0].future?.length) return [];

  const futureWeeks = topK[0].future.length;
  const predicted = [];

  for (let w = 0; w < futureWeeks; w++) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const match of topK) {
      if (match.future && match.future[w]) {
        const weight = 1 - (match.distance / (maxDist + 0.001));
        weightedSum += (match.future[w].composite ?? 0) * weight;
        totalWeight += weight;
      }
    }

    predicted.push({
      week_offset: w + 1,
      predicted_composite: totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 1000) / 1000 : null
    });
  }

  return predicted;
}

export { COHORT_GROUPS };
