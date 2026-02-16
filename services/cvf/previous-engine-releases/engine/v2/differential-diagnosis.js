/**
 * LAYER 2 — Differential Diagnosis (~100K tokens)
 *
 * The critical innovation: CVF v1 detects decline, but not its CAUSE.
 * This layer loads linguistic profiles for 6 conditions and produces
 * a probability distribution across conditions for each analysis.
 *
 * Conditions: Alzheimer's, Depression, Parkinson's, Normal Aging,
 *             Medication Effects, Grief/Emotional Distress
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

/**
 * Complete linguistic signatures for differential diagnosis.
 * Each condition has distinctive patterns across the 5 CVF domains.
 */
export const DIFFERENTIAL_PROFILES = {
  alzheimer: {
    label: "Alzheimer's Disease (MCI → Mild AD)",
    linguistic_signature: {
      lexical: {
        pattern: 'progressive_decline',
        description: 'TTR drops 15-25% over 12 months, shift to high-frequency words',
        key_features: ['L1_ttr', 'L4_content_density', 'L5_word_frequency'],
        expected_trajectory: 'gradual_monotonic_decline',
        z_score_range: [-0.5, -2.5]
      },
      syntactic: {
        pattern: 'delayed_decline',
        description: 'Subordination drops, but basic grammar preserved early. Follows lexical decline.',
        key_features: ['S1_mlu', 'S2_subordination'],
        expected_trajectory: 'decline_after_lexical',
        z_score_range: [-0.3, -1.8]
      },
      coherence: {
        pattern: 'early_decline',
        description: 'Topic drift increases, referential clarity drops. Co-occurs with lexical decline.',
        key_features: ['C1_idea_density', 'C3_referential_coherence', 'C5_information_units'],
        expected_trajectory: 'early_co_decline_with_lexical',
        z_score_range: [-0.5, -2.0]
      },
      fluency: {
        pattern: 'mid_utterance_pauses',
        description: 'Long pauses (>2s) increase, concentrated mid-utterance (word-finding)',
        key_features: ['F1_long_pause_ratio', 'F5_response_latency'],
        expected_trajectory: 'gradual_increase_pauses',
        z_score_range: [-0.3, -1.5]
      },
      memory: {
        pattern: 'cascading_failure',
        description: 'Free recall fails first, cued recall preserved initially, recognition intact',
        key_features: ['M1_free_recall', 'M2_cued_recall', 'M3_recognition'],
        expected_trajectory: 'free_then_cued_then_recognition',
        z_score_range: [-0.5, -3.0]
      }
    },
    key_discriminators: [
      'Semantic memory degrades BEFORE procedural memory',
      '"Empty speech" — grammatically correct but content-poor',
      'Cascade: Semantic → Syntactic → Discourse → Pragmatic',
      'Progressive over weeks/months — NOT episodic',
      'Self-correction attempts decrease over time'
    ],
    cascade_order: ['lexical', 'coherence', 'syntactic', 'fluency', 'memory']
  },

  depression: {
    label: 'Major Depression',
    linguistic_signature: {
      lexical: {
        pattern: 'reduced_output_not_variety',
        description: 'Vocabulary contracts differently — emotional words increase, overall output drops',
        key_features: ['L1_ttr', 'L4_content_density'],
        expected_trajectory: 'episodic_not_progressive',
        z_score_range: [-0.3, -1.0]
      },
      syntactic: {
        pattern: 'motivation_not_inability',
        description: 'Simplified due to reduced motivation, not cognitive inability',
        key_features: ['S1_mlu', 'S2_subordination'],
        expected_trajectory: 'flat_reduction',
        z_score_range: [-0.2, -0.8]
      },
      coherence: {
        pattern: 'maintained',
        description: 'Can follow a topic, just engages less. Coherence preserved.',
        key_features: ['C2_topic_maintenance', 'C3_referential_coherence'],
        expected_trajectory: 'stable',
        z_score_range: [-0.1, -0.4]
      },
      fluency: {
        pattern: 'psychomotor_retardation',
        description: 'Response latency increases, but pauses are at turn boundaries, not mid-utterance',
        key_features: ['F5_response_latency'],
        expected_trajectory: 'episodic_pattern',
        z_score_range: [-0.3, -1.2]
      },
      memory: {
        pattern: 'responsive_to_cues',
        description: 'Recall difficulty BUT responds well to ANY cue (vs AD: progressive cue failure)',
        key_features: ['M1_free_recall', 'M2_cued_recall'],
        expected_trajectory: 'cued_recall_preserved',
        z_score_range: [-0.2, -0.8]
      }
    },
    key_discriminators: [
      'Self-referential language increases ("I", "me", "my")',
      'Negative valence words increase',
      'Pattern is EPISODIC — bad days cluster, not gradual slope',
      'Procedural AND semantic memory both suppressed equally',
      'Good days show near-baseline performance',
      'Responds well to encouragement and cueing'
    ],
    cascade_order: null  // No cascade — all domains affected simultaneously
  },

  parkinsons: {
    label: "Parkinson's Disease",
    linguistic_signature: {
      lexical: {
        pattern: 'relatively_preserved',
        description: 'Vocabulary richness preserved despite reduced output',
        key_features: ['L1_ttr'],
        expected_trajectory: 'stable',
        z_score_range: [0.0, -0.3]
      },
      syntactic: {
        pattern: 'shortened_not_simplified',
        description: 'Shorter utterances due to physical fatigue, not cognitive decline',
        key_features: ['S1_mlu'],
        expected_trajectory: 'slight_decline',
        z_score_range: [-0.1, -0.5]
      },
      coherence: {
        pattern: 'maintained',
        description: 'Discourse coherence maintained',
        key_features: ['C2_topic_maintenance'],
        expected_trajectory: 'stable',
        z_score_range: [0.0, -0.2]
      },
      fluency: {
        pattern: 'distinctive_motor',
        description: 'Reduced volume (hypophonia), monotone, rushed speech (festination)',
        key_features: ['F1_long_pause_ratio', 'F3_false_starts'],
        expected_trajectory: 'motor_pattern',
        z_score_range: [-0.5, -2.0]
      },
      memory: {
        pattern: 'subcortical',
        description: 'Retrieval difficulty but recognition INTACT (subcortical pattern)',
        key_features: ['M1_free_recall', 'M3_recognition'],
        expected_trajectory: 'retrieval_not_storage',
        z_score_range: [-0.2, -0.6]
      }
    },
    key_discriminators: [
      'Hypophonia — reduced volume over conversation',
      'Articulatory imprecision, NOT semantic emptiness',
      'Preserved vocabulary richness despite reduced output',
      'Monotone prosody (reduced pitch variation)',
      'Motor speech > cognitive speech issues'
    ],
    cascade_order: null  // Fluency-dominant, not cascade
  },

  normal_aging: {
    label: 'Normal Aging',
    linguistic_signature: {
      lexical: {
        pattern: 'stable_with_minor_decline',
        description: 'TTR may drop 5-8% per decade after 60 — STABLE within months',
        key_features: ['L1_ttr'],
        expected_trajectory: 'stable_monthly',
        z_score_range: [0.2, -0.3]
      },
      syntactic: {
        pattern: 'minor_simplification',
        description: 'Minor simplification, preserved subordination',
        key_features: ['S2_subordination'],
        expected_trajectory: 'stable',
        z_score_range: [0.1, -0.2]
      },
      coherence: {
        pattern: 'maintained',
        description: 'Generally maintained, occasional tangential speech',
        key_features: ['C2_topic_maintenance'],
        expected_trajectory: 'stable',
        z_score_range: [0.1, -0.2]
      },
      fluency: {
        pattern: 'stable_minor_changes',
        description: 'Slightly longer pauses, slightly more fillers — STABLE pattern',
        key_features: ['F1_long_pause_ratio', 'F2_filler_rate'],
        expected_trajectory: 'stable',
        z_score_range: [0.1, -0.3]
      },
      memory: {
        pattern: 'slowed_not_impaired',
        description: 'Recall slows but accuracy maintained, no progressive deterioration',
        key_features: ['M1_free_recall'],
        expected_trajectory: 'stable',
        z_score_range: [0.0, -0.3]
      }
    },
    key_discriminators: [
      'STABLE — month to month variation is NOISE, not SIGNAL',
      'Self-correction PRESERVED ("No wait, it was Tuesday not Monday")',
      'Tip-of-tongue compensated by circumlocution',
      'No progressive pattern over weeks',
      'Variance within normal baseline range'
    ],
    cascade_order: null  // No cascade
  },

  medication: {
    label: 'Medication Effects',
    linguistic_signature: {
      lexical: {
        pattern: 'acute_global',
        description: 'All features affected simultaneously at medication change',
        expected_trajectory: 'acute_onset_then_recovery',
        z_score_range: [-0.3, -1.5]
      },
      syntactic: {
        pattern: 'acute_global',
        description: 'Disrupted acutely, recovers with adjustment',
        expected_trajectory: 'acute_onset_then_recovery',
        z_score_range: [-0.3, -1.0]
      },
      coherence: {
        pattern: 'acute_confusion',
        description: 'Anticholinergics: acute confusion, incoherent speech',
        expected_trajectory: 'acute_onset_then_recovery',
        z_score_range: [-0.5, -2.0]
      },
      fluency: {
        pattern: 'sedation',
        description: 'Benzodiazepines: slowed speech, word-finding difficulty',
        expected_trajectory: 'acute_onset_then_recovery',
        z_score_range: [-0.3, -1.5]
      },
      memory: {
        pattern: 'transient',
        description: 'Memory effects resolve with medication adjustment',
        expected_trajectory: 'acute_onset_then_recovery',
        z_score_range: [-0.3, -1.0]
      }
    },
    key_discriminators: [
      'ACUTE onset correlated with medication change date',
      'Affects ALL domains simultaneously (vs AD cascade)',
      'Temporal correlation with prescription changes',
      'Recovery expected within 1-3 weeks of adjustment',
      'No domain-specific cascade pattern'
    ],
    cascade_order: null  // All at once, not cascade
  },

  grief: {
    label: 'Grief / Emotional Distress',
    linguistic_signature: {
      lexical: {
        pattern: 'topic_dependent',
        description: 'Preoccupation with loss — speech fragmented on emotional topics only',
        expected_trajectory: 'topic_specific',
        z_score_range: [-0.1, -0.8]
      },
      syntactic: {
        pattern: 'preserved',
        description: 'Syntax preserved on neutral topics',
        expected_trajectory: 'stable_neutral',
        z_score_range: [0.0, -0.3]
      },
      coherence: {
        pattern: 'emotional_flooding',
        description: 'Fragmented when triggered, coherent on neutral topics',
        expected_trajectory: 'topic_specific',
        z_score_range: [-0.2, -1.0]
      },
      fluency: {
        pattern: 'emotional_variation',
        description: 'Fluency drops when discussing loss, normal otherwise',
        expected_trajectory: 'topic_specific',
        z_score_range: [-0.2, -0.8]
      },
      memory: {
        pattern: 'intact_neutral',
        description: 'Cognitive infrastructure intact when discussing neutral topics',
        expected_trajectory: 'stable_neutral',
        z_score_range: [0.0, -0.3]
      }
    },
    key_discriminators: [
      'Domain-specific — neutral conversation is NORMAL',
      'Temporal — worst in first 6 months, gradual recovery',
      'Emotional topics trigger decline, neutral topics do not',
      'Recovery trajectory visible over weeks',
      'No cascade pattern'
    ],
    cascade_order: null
  }
};

/**
 * Build the differential diagnosis context for the 1M token window.
 */
export function buildDifferentialContext() {
  const profiles = Object.entries(DIFFERENTIAL_PROFILES).map(([key, profile]) => {
    return `## ${profile.label}

### Linguistic Signature
${Object.entries(profile.linguistic_signature).map(([domain, sig]) =>
  `- **${domain}**: ${sig.description} (Pattern: ${sig.pattern}, Z-range: [${sig.z_score_range?.join(', ') || 'variable'}])`
).join('\n')}

### Key Discriminators
${profile.key_discriminators.map(d => `- ${d}`).join('\n')}

### Cascade Order
${profile.cascade_order ? profile.cascade_order.join(' → ') : 'No cascade — simultaneous or domain-specific'}
`;
  }).join('\n---\n\n');

  return `<differential_profiles total_conditions="6">

# DIFFERENTIAL DIAGNOSIS — LINGUISTIC PROFILES

These profiles define the distinctive linguistic signatures of 6 conditions that can cause
cognitive decline detectable through speech analysis. Use these to DIFFERENTIATE the cause
of any observed decline in a patient's CVF scores.

## CRITICAL INSTRUCTION
When analyzing a patient's drift, you MUST compare their pattern against ALL 6 profiles
and produce a probability distribution. A decline in CVF scores is NOT automatically Alzheimer's.

${profiles}

## DECISION MATRIX

| Feature | Alzheimer's | Depression | Parkinson's | Normal Aging | Medication | Grief |
|---------|------------|------------|-------------|--------------|------------|-------|
| Onset | Gradual (months) | Episodic | Gradual | Stable | Acute | Event-linked |
| Semantic | Early decline | Reduced output | Preserved | Stable | Global | Topic-dependent |
| Syntax | Late decline | Motivation-based | Motor-limited | Preserved | Global acute | Preserved |
| Coherence | Progressive | Maintained | Maintained | Maintained | Confused | Emotional only |
| Free recall | Progressive fail | Cue-responsive | Retrieval slow | Slowed, accurate | Transient | Intact neutral |
| Self-correction | Decreases | Maintained | Maintained | Preserved | Variable | Maintained |
| Recovery | No | With treatment | With medication | N/A | With adjustment | Over months |

</differential_profiles>`;
}

/**
 * Score a patient's CVF trajectory against differential profiles.
 * Returns probability distribution across conditions.
 */
export function computeDifferentialScores(domainScores, trajectory, confounders) {
  const scores = {
    alzheimer: 0,
    depression: 0,
    parkinsons: 0,
    normal_aging: 0,
    medication: 0,
    grief: 0
  };

  // Pattern analysis
  const hasProgressiveDecline = trajectory && trajectory.length >= 4 && isProgressive(trajectory);
  const hasEpisodicPattern = trajectory && trajectory.length >= 4 && isEpisodic(trajectory);
  const hasAcuteOnset = trajectory && trajectory.length >= 2 && isAcuteOnset(trajectory);
  const hasCascade = detectSimpleCascade(domainScores);
  const allDomainsAffected = Object.values(domainScores).every(z => z < -0.3);
  const semanticDominant = (domainScores.lexical < -0.5 && domainScores.coherence < -0.5);
  const fluencyDominant = (domainScores.fluency < -0.5 && domainScores.lexical > -0.3);
  const withinNormal = Object.values(domainScores).every(z => z > -0.5);
  const hasMedChange = confounders?.some?.(c => c?.confounders?.medication_change);
  const hasEmotionalDistress = confounders?.some?.(c => c?.confounders?.emotional_distress);

  // Alzheimer's scoring
  if (hasProgressiveDecline) scores.alzheimer += 0.25;
  if (hasCascade) scores.alzheimer += 0.20;
  if (semanticDominant) scores.alzheimer += 0.20;
  if (domainScores.memory < -0.5) scores.alzheimer += 0.15;
  if (!hasEpisodicPattern) scores.alzheimer += 0.10;

  // Depression scoring
  if (hasEpisodicPattern) scores.depression += 0.25;
  if (!hasCascade) scores.depression += 0.10;
  if (domainScores.coherence > -0.3 && domainScores.lexical < -0.5) scores.depression += 0.15;
  if (hasEmotionalDistress) scores.depression += 0.15;

  // Parkinson's scoring
  if (fluencyDominant) scores.parkinsons += 0.30;
  if (domainScores.lexical > -0.3 && domainScores.fluency < -0.5) scores.parkinsons += 0.20;

  // Normal aging scoring
  if (withinNormal) scores.normal_aging += 0.50;
  if (!hasProgressiveDecline && !hasEpisodicPattern) scores.normal_aging += 0.20;
  if (Object.values(domainScores).every(z => z > -0.3)) scores.normal_aging += 0.20;

  // Medication scoring
  if (hasAcuteOnset) scores.medication += 0.25;
  if (allDomainsAffected && hasAcuteOnset) scores.medication += 0.20;
  if (hasMedChange) scores.medication += 0.30;

  // Grief scoring
  if (hasEmotionalDistress) scores.grief += 0.20;
  if (!hasProgressiveDecline && domainScores.coherence < -0.3) scores.grief += 0.10;

  // Normalize to probabilities
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  for (const key of Object.keys(scores)) {
    scores[key] = Math.round((scores[key] / total) * 100) / 100;
  }

  // Confidence based on how decisive the distribution is
  const maxProb = Math.max(...Object.values(scores));
  const confidence = Math.min(maxProb * 1.5, 0.95);

  return {
    probabilities: scores,
    confidence,
    primary_hypothesis: Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0],
    reasoning_hints: buildReasoningHints(scores, domainScores)
  };
}

// Helper: check if trajectory shows progressive decline
function isProgressive(trajectory) {
  if (trajectory.length < 4) return false;
  const composites = trajectory.map(t => t.composite ?? 0);
  const firstHalf = composites.slice(0, Math.floor(composites.length / 2));
  const secondHalf = composites.slice(Math.floor(composites.length / 2));
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  return avgSecond < avgFirst - 0.2;
}

// Helper: check if trajectory shows episodic pattern (depression-like)
function isEpisodic(trajectory) {
  const composites = trajectory.map(t => t.composite ?? 0);
  let directionChanges = 0;
  for (let i = 2; i < composites.length; i++) {
    const prev = composites[i - 1] - composites[i - 2];
    const curr = composites[i] - composites[i - 1];
    if ((prev > 0.1 && curr < -0.1) || (prev < -0.1 && curr > 0.1)) {
      directionChanges++;
    }
  }
  return directionChanges >= 2;
}

// Helper: check for acute onset
function isAcuteOnset(trajectory) {
  const composites = trajectory.map(t => t.composite ?? 0);
  for (let i = 1; i < composites.length; i++) {
    if (composites[i] - composites[i - 1] < -0.5) return true;
  }
  return false;
}

// Helper: detect AD cascade pattern
function detectSimpleCascade(domainScores) {
  const lexDrop = domainScores.lexical < -0.5;
  const cohDrop = domainScores.coherence < -0.5;
  const synDrop = domainScores.syntactic < -0.5;
  // AD cascade: lexical + coherence drop first, syntactic follows
  return lexDrop && cohDrop && (!synDrop || (synDrop && domainScores.syntactic > domainScores.lexical));
}

// Build reasoning hints for Claude deep analysis
function buildReasoningHints(scores, domainScores) {
  const hints = [];
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const second = sorted[1];

  if (top[1] - second[1] < 0.1) {
    hints.push(`Close call between ${top[0]} (${top[1]}) and ${second[0]} (${second[1]}) — need more data or specific probes.`);
  }

  if (domainScores.lexical < -0.5 && domainScores.coherence < -0.5) {
    hints.push('Semantic decline pattern detected (lexical + coherence) — consistent with AD Stage 1 per Fraser 2016.');
  }

  if (domainScores.fluency < -0.5 && domainScores.lexical > -0.3) {
    hints.push('Isolated fluency decline — consider Parkinson\'s or pre-symptomatic tau (Young 2024).');
  }

  return hints;
}

export { DIFFERENTIAL_PROFILES as profiles };
