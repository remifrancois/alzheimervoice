/**
 * V3 INDICATOR DEFINITIONS
 *
 * 47 indicators derived from 60+ studies across 3 conditions.
 * Each indicator has evidence-based weights, thresholds, and
 * condition-specific direction vectors — the research IS the algorithm.
 *
 * Domains:
 *   LEX  — Lexical Richness (10 indicators)
 *   SYN  — Syntactic Complexity (5 indicators)
 *   SEM  — Semantic Coherence (7 indicators)
 *   TMP  — Temporal / Fluency (8 indicators)
 *   MEM  — Memory & Recall (6 indicators)
 *   DIS  — Discourse & Pragmatic (5 indicators)
 *   AFF  — Affective / Depression-specific (6 indicators)
 */

// Direction constants: how the indicator moves in each condition
const UP = 1;      // Increases
const DOWN = -1;   // Decreases
const STABLE = 0;  // No change
const VARIES = 0.5; // Variable/inconsistent

/**
 * Complete indicator registry.
 * evidence: 1-5 scale (meta-analyses=5, single study=1)
 * weight: computed from evidence × effect_size (normalized later)
 * extractable: 'text' | 'audio' | 'conversation' | 'meta'
 */
export const INDICATORS = {
  // ════════════════════════════════════════════════
  // LEXICAL RICHNESS (LEX)
  // ════════════════════════════════════════════════
  LEX_TTR: {
    id: 'LEX_TTR', domain: 'lexical', name: 'Type-Token Ratio',
    formula: 'V / N (unique words / total words)',
    extractable: 'text', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 1.0, depression: 0.3, parkinson: 0.1 },
    early_detection: { alzheimer: true, depression: false, parkinson: false },
    studies: ['fraser2015', 'eyigoz2020', 'adress2020']
  },
  LEX_BRUNET: {
    id: 'LEX_BRUNET', domain: 'lexical', name: "Brunet's Index",
    formula: 'N^(V^(-0.172))',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7, depression: 0.1, parkinson: 0.1 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015']
  },
  LEX_HONORE: {
    id: 'LEX_HONORE', domain: 'lexical', name: "Honore's Statistic",
    formula: '100 × log(N) / (1 - V1/V)',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7, depression: 0.1, parkinson: 0.1 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015']
  },
  LEX_CONTENT_DENSITY: {
    id: 'LEX_CONTENT_DENSITY', domain: 'lexical', name: 'Content Density',
    formula: 'content_words / total_words',
    extractable: 'text', evidence: 5, base_weight: 0.80,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.8, depression: 0.3, parkinson: 0.1 },
    early_detection: { alzheimer: true },
    studies: ['snowdon1996', 'fraser2015']
  },
  LEX_WORD_FREQ: {
    id: 'LEX_WORD_FREQ', domain: 'lexical', name: 'Word Frequency Level',
    formula: 'mean(frequency_rank(content_words))',
    extractable: 'text', evidence: 4, base_weight: 0.75,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7, depression: 0.1, parkinson: 0.1 },
    early_detection: { alzheimer: true },
    studies: ['eyigoz2020', 'robin2023']
  },
  LEX_PRONOUN_NOUN: {
    id: 'LEX_PRONOUN_NOUN', domain: 'lexical', name: 'Pronoun-to-Noun Ratio',
    formula: 'pronouns / nouns',
    extractable: 'text', evidence: 5, base_weight: 0.90,
    directions: { alzheimer: UP, depression: UP, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.9, depression: 0.6, parkinson: 0.1 },
    early_detection: { alzheimer: true, depression: true },
    studies: ['fraser2015', 'zhang2022'],
    differential_note: 'AD: generic pronouns replacing nouns. Depression: I/me/my self-focus.'
  },
  LEX_GENERIC_SUB: {
    id: 'LEX_GENERIC_SUB', domain: 'lexical', name: 'Generic Substitution Rate',
    formula: 'generic_words / content_words',
    extractable: 'text', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: UP },
    effect_sizes: { alzheimer: 0.8, depression: 0.1, parkinson: 0.0 },
    early_detection: { alzheimer: true }
  },
  LEX_LIGHT_VERB: {
    id: 'LEX_LIGHT_VERB', domain: 'lexical', name: 'Light Verb Ratio',
    formula: 'light_verbs / total_verbs (do, make, get, have, go, take)',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5 }
  },

  // ════════════════════════════════════════════════
  // SYNTACTIC COMPLEXITY (SYN)
  // ════════════════════════════════════════════════
  SYN_MLU: {
    id: 'SYN_MLU', domain: 'syntactic', name: 'Mean Length of Utterance',
    formula: 'total_words / total_utterances',
    extractable: 'text', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.65, depression: 0.4, parkinson: 0.3 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015', 'frontiers2024', 'mueller2018']
  },
  SYN_SUBORDINATION: {
    id: 'SYN_SUBORDINATION', domain: 'syntactic', name: 'Subordination Index',
    formula: 'subordinate_clauses / total_clauses',
    extractable: 'text', evidence: 4, base_weight: 0.60,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.65 },
    early_detection: { alzheimer: false },
    studies: ['robin2023', 'mueller2018']
  },
  SYN_COMPLETENESS: {
    id: 'SYN_COMPLETENESS', domain: 'syntactic', name: 'Sentence Completeness',
    formula: 'complete_sentences / total_sentences',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5 },
    differential_note: 'AD: abandoned/fragmented. Depression: complete but brief.'
  },
  SYN_EMBEDDING: {
    id: 'SYN_EMBEDDING', domain: 'syntactic', name: 'Embedding Depth',
    formula: 'mean(max_clause_depth per sentence)',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.55 }
  },
  SYN_PASSIVE: {
    id: 'SYN_PASSIVE', domain: 'syntactic', name: 'Passive Construction Ratio',
    formula: 'passive_sentences / total_sentences',
    extractable: 'text', evidence: 2, base_weight: 0.30,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.3 }
  },

  // ════════════════════════════════════════════════
  // SEMANTIC COHERENCE (SEM)
  // ════════════════════════════════════════════════
  SEM_IDEA_DENSITY: {
    id: 'SEM_IDEA_DENSITY', domain: 'semantic', name: 'Idea Density',
    formula: 'propositions / total_words × 10',
    extractable: 'text', evidence: 5, base_weight: 0.95,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 1.25, depression: 0.4, parkinson: 0.1 },
    early_detection: { alzheimer: true },
    studies: ['snowdon1996', 'fraser2015'],
    note: 'Strongest single predictor. Nun Study: detectable 60+ years before diagnosis.'
  },
  SEM_TOPIC_MAINTENANCE: {
    id: 'SEM_TOPIC_MAINTENANCE', domain: 'semantic', name: 'Topic Maintenance',
    formula: 'on_topic_utterances / total_utterances',
    extractable: 'text', evidence: 5, base_weight: 0.80,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.8, depression: 0.3 },
    early_detection: { alzheimer: true },
    differential_note: 'AD: drift and fragmentation. Depression: narrow but maintained.'
  },
  SEM_REF_COHERENCE: {
    id: 'SEM_REF_COHERENCE', domain: 'semantic', name: 'Referential Coherence',
    formula: 'pronouns_with_clear_antecedent / total_pronouns',
    extractable: 'text', evidence: 5, base_weight: 0.95,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 1.0, depression: 0.0, parkinson: 0.0 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015'],
    differential_note: 'BEST single AD vs Depression differentiator. AD degrades it; depression preserves it.'
  },
  SEM_TEMPORAL_SEQ: {
    id: 'SEM_TEMPORAL_SEQ', domain: 'semantic', name: 'Temporal Sequencing',
    formula: 'correctly_ordered_events / total_events',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7 },
    early_detection: { alzheimer: true }
  },
  SEM_INFO_UNITS: {
    id: 'SEM_INFO_UNITS', domain: 'semantic', name: 'Information Units',
    formula: 'correct_information_units / expected_units',
    extractable: 'text', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 1.0, depression: 0.2 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015', 'petti2020']
  },
  SEM_LOCAL_COHERENCE: {
    id: 'SEM_LOCAL_COHERENCE', domain: 'semantic', name: 'Local Coherence',
    formula: 'adjacent_sentence_semantic_similarity',
    extractable: 'text', evidence: 4, base_weight: 0.75,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.85 },
    early_detection: { alzheimer: true },
    studies: ['eyigoz2020']
  },
  SEM_TOPIC_ENTROPY: {
    id: 'SEM_TOPIC_ENTROPY', domain: 'semantic', name: 'Topic Entropy',
    formula: '-Σ p(topic) × log(p(topic))',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: UP, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5, depression: 0.4 },
    differential_note: 'AD: chaotic topic spread. Depression: narrow focus.'
  },

  // ════════════════════════════════════════════════
  // TEMPORAL / FLUENCY (TMP)
  // ════════════════════════════════════════════════
  TMP_LPR: {
    id: 'TMP_LPR', domain: 'temporal', name: 'Long Pause Ratio',
    formula: 'pauses_over_2s / total_utterances',
    extractable: 'text', evidence: 5, base_weight: 0.90,
    directions: { alzheimer: UP, depression: UP, parkinson: UP, normal_aging: UP },
    effect_sizes: { alzheimer: 1.0, depression: 0.65, parkinson: 0.9 },
    early_detection: { alzheimer: true, parkinson: true },
    studies: ['pistono2019', 'frontiers2024', 'young2024'],
    differential_note: 'AD: mid-utterance before nouns. Depression: uniform. PD: pre-utterance.'
  },
  TMP_WITHIN_CLAUSE: {
    id: 'TMP_WITHIN_CLAUSE', domain: 'temporal', name: 'Within-Clause Pause Rate',
    formula: 'within_clause_pauses / total_pauses',
    extractable: 'text', evidence: 4, base_weight: 0.80,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.9, depression: 0.1 },
    early_detection: { alzheimer: true },
    studies: ['pistono2019'],
    differential_note: 'AD-specific: pauses WITHIN clauses before nouns. Depression: pauses at CLAUSE BOUNDARIES.'
  },
  TMP_FILLER_RATE: {
    id: 'TMP_FILLER_RATE', domain: 'temporal', name: 'Filled Pause Rate',
    formula: 'fillers_per_100_words',
    extractable: 'text', evidence: 3, base_weight: 0.45,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: UP },
    effect_sizes: { alzheimer: 0.4 }
  },
  TMP_FALSE_START: {
    id: 'TMP_FALSE_START', domain: 'temporal', name: 'False Start Rate',
    formula: 'abandoned_utterances / total_utterances',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5 },
    studies: ['robin2023']
  },
  TMP_REPETITION: {
    id: 'TMP_REPETITION', domain: 'temporal', name: 'Repetition Rate',
    formula: 'repeated_phrases / total_phrases',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: UP, depression: UP, parkinson: UP, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7, depression: 0.4, parkinson: 0.3 },
    differential_note: 'AD: same story unknowingly. Depression: same worry knowingly. PD: palilalia (word-level).'
  },
  TMP_RESPONSE_LATENCY: {
    id: 'TMP_RESPONSE_LATENCY', domain: 'temporal', name: 'Response Latency',
    formula: 'mean(time_to_first_word_after_question)',
    extractable: 'text', evidence: 5, base_weight: 0.80,
    directions: { alzheimer: UP, depression: UP, parkinson: UP, normal_aging: UP },
    effect_sizes: { alzheimer: 0.65, depression: 0.6, parkinson: 0.4 },
    early_detection: { alzheimer: true },
    studies: ['young2024', 'yamamoto2020'],
    differential_note: 'AD: variable (content-dependent). Depression: uniform. PD: initiation delay.'
  },
  TMP_SPEECH_RATE: {
    id: 'TMP_SPEECH_RATE', domain: 'temporal', name: 'Speech Rate (words/min)',
    formula: 'total_words / total_time_minutes',
    extractable: 'text', evidence: 5, base_weight: 0.70,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: VARIES, normal_aging: DOWN },
    effect_sizes: { alzheimer: 0.65, depression: 0.6, parkinson: 0.5 }
  },
  TMP_VARIABILITY: {
    id: 'TMP_VARIABILITY', domain: 'temporal', name: 'Session-to-Session Variability',
    formula: 'CV(composite_scores over last 7 sessions)',
    extractable: 'meta', evidence: 3, base_weight: 0.60,
    directions: { alzheimer: STABLE, depression: UP, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.2, depression: 0.7 },
    differential_note: 'AD: monotonic decline (LOW variability). Depression: episodic (HIGH variability). LBD: daily fluctuation.'
  },

  // ════════════════════════════════════════════════
  // MEMORY & RECALL (MEM)
  // ════════════════════════════════════════════════
  MEM_FREE_RECALL: {
    id: 'MEM_FREE_RECALL', domain: 'memory', name: 'Free Recall Accuracy',
    formula: 'correct_free_recalls / memory_prompts',
    extractable: 'conversation', evidence: 5, base_weight: 0.90,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { alzheimer: 1.2, depression: 0.5, parkinson: 0.4 },
    early_detection: { alzheimer: true },
    studies: ['grober1987']
  },
  MEM_CUED_RECALL: {
    id: 'MEM_CUED_RECALL', domain: 'memory', name: 'Cued Recall Response',
    formula: 'correct_cued / cued_prompts',
    extractable: 'conversation', evidence: 5, base_weight: 0.95,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 1.0, depression: 0.0, parkinson: 0.0 },
    studies: ['grober1987'],
    differential_note: 'THE definitive differentiator. Depression: cues unlock memory. AD: cues fail.'
  },
  MEM_RECOGNITION: {
    id: 'MEM_RECOGNITION', domain: 'memory', name: 'Recognition Accuracy',
    formula: 'correct_recognitions / recognition_prompts',
    extractable: 'conversation', evidence: 4, base_weight: 0.60,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.6 }
  },
  MEM_TEMPORAL: {
    id: 'MEM_TEMPORAL', domain: 'memory', name: 'Temporal Precision',
    formula: 'correctly_dated_events / total_events',
    extractable: 'conversation', evidence: 3, base_weight: 0.55,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.6 },
    early_detection: { alzheimer: true }
  },
  MEM_INTRUSION: {
    id: 'MEM_INTRUSION', domain: 'memory', name: 'Intrusion Errors',
    formula: 'false_memories / total_recall_attempts',
    extractable: 'conversation', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7 },
    early_detection: { alzheimer: true }
  },
  MEM_SEMANTIC_FLUENCY: {
    id: 'MEM_SEMANTIC_FLUENCY', domain: 'memory', name: 'Semantic Fluency',
    formula: 'category_items_in_60s (embedded in conversation)',
    extractable: 'conversation', evidence: 5, base_weight: 0.80,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { alzheimer: 1.0, depression: 0.4, parkinson: 0.4 },
    early_detection: { alzheimer: true }
  },

  // ════════════════════════════════════════════════
  // DISCOURSE & PRAGMATIC (DIS)
  // ════════════════════════════════════════════════
  DIS_CIRCUMLOCUTION: {
    id: 'DIS_CIRCUMLOCUTION', domain: 'discourse', name: 'Circumlocution Rate',
    formula: 'circumlocution_instances / content_words × 100',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: UP },
    effect_sizes: { alzheimer: 0.7, normal_aging: 0.2 },
    early_detection: { alzheimer: true }
  },
  DIS_SELF_CORRECTION: {
    id: 'DIS_SELF_CORRECTION', domain: 'discourse', name: 'Self-Correction Rate',
    formula: 'self_corrections / errors_made',
    extractable: 'text', evidence: 3, base_weight: 0.60,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.6 },
    differential_note: 'Metacognitive marker. AD loses it. All other conditions preserve it.'
  },
  DIS_METALINGUISTIC: {
    id: 'DIS_METALINGUISTIC', domain: 'discourse', name: 'Metalinguistic Awareness',
    formula: '"what\'s the word", "I can\'t remember" per session',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: UP },
    effect_sizes: { alzheimer: 0.5 },
    note: 'Inverted U: increases early (awareness of deficit), then decreases (loss of awareness).'
  },
  DIS_TOPIC_DIVERSITY: {
    id: 'DIS_TOPIC_DIVERSITY', domain: 'discourse', name: 'Topic Diversity Index',
    formula: 'unique_topics / session_duration_minutes',
    extractable: 'text', evidence: 3, base_weight: 0.55,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5, depression: 0.5 },
    differential_note: 'AD: loses nodes/clusters. Depression: narrows to negative themes.'
  },
  DIS_PERSEVERATION: {
    id: 'DIS_PERSEVERATION', domain: 'discourse', name: 'Perseveration Rate',
    formula: 'repeated_content / total_content',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5 }
  },

  // ════════════════════════════════════════════════
  // AFFECTIVE / DEPRESSION-SPECIFIC (AFF)
  // ════════════════════════════════════════════════
  AFF_SELF_PRONOUN: {
    id: 'AFF_SELF_PRONOUN', domain: 'affective', name: 'Self-Referential Pronoun Ratio',
    formula: '(I + me + my + mine + myself) / total_words × 100',
    extractable: 'text', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: STABLE, depression: UP, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { depression: 0.8 },
    studies: ['zhang2022'],
    note: 'Strongest depression-specific linguistic marker. NOT elevated in AD.'
  },
  AFF_NEG_VALENCE: {
    id: 'AFF_NEG_VALENCE', domain: 'affective', name: 'Negative Valence Word Ratio',
    formula: 'negative_emotion_words / total_words × 100',
    extractable: 'text', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: STABLE, depression: UP, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { depression: 0.8 },
    studies: ['zhang2022', 'low2020'],
    note: 'Depression-specific. Not elevated in any other condition.'
  },
  AFF_ABSOLUTIST: {
    id: 'AFF_ABSOLUTIST', domain: 'affective', name: 'Absolutist Language',
    formula: '(always + never + nothing + everything + completely) / total_words × 100',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: STABLE, depression: UP, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { depression: 0.6 },
    studies: ['zhang2022']
  },
  AFF_FUTURE_REF: {
    id: 'AFF_FUTURE_REF', domain: 'affective', name: 'Future Reference Ratio',
    formula: 'future_references / total_temporal_references',
    extractable: 'text', evidence: 4, base_weight: 0.60,
    directions: { alzheimer: STABLE, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { depression: 0.6 },
    note: 'Depression reduces future-oriented language (hopelessness).'
  },
  AFF_HEDONIC: {
    id: 'AFF_HEDONIC', domain: 'affective', name: 'Hedonic Language Score',
    formula: 'pleasure_enjoyment_words / total_words × 100',
    extractable: 'text', evidence: 4, base_weight: 0.60,
    directions: { alzheimer: STABLE, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { depression: 0.6 },
    note: 'Anhedonia marker. Reduced pleasure/enjoyment language.'
  },
  AFF_ENGAGEMENT: {
    id: 'AFF_ENGAGEMENT', domain: 'affective', name: 'Conversational Engagement',
    formula: 'topic_initiations + elaborations / total_turns',
    extractable: 'conversation', evidence: 3, base_weight: 0.55,
    directions: { alzheimer: STABLE, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { depression: 0.5 },
    studies: ['cohn2009']
  }
};

// ════════════════════════════════════════════════
// DERIVED CONSTANTS
// ════════════════════════════════════════════════

export const ALL_INDICATOR_IDS = Object.keys(INDICATORS);
export const INDICATOR_COUNT = ALL_INDICATOR_IDS.length;

export const DOMAINS = {
  lexical:   ALL_INDICATOR_IDS.filter(id => INDICATORS[id].domain === 'lexical'),
  syntactic: ALL_INDICATOR_IDS.filter(id => INDICATORS[id].domain === 'syntactic'),
  semantic:  ALL_INDICATOR_IDS.filter(id => INDICATORS[id].domain === 'semantic'),
  temporal:  ALL_INDICATOR_IDS.filter(id => INDICATORS[id].domain === 'temporal'),
  memory:    ALL_INDICATOR_IDS.filter(id => INDICATORS[id].domain === 'memory'),
  discourse: ALL_INDICATOR_IDS.filter(id => INDICATORS[id].domain === 'discourse'),
  affective: ALL_INDICATOR_IDS.filter(id => INDICATORS[id].domain === 'affective'),
};

// Domain weights for composite scoring (from evidence strength distribution)
export const DOMAIN_WEIGHTS = {
  lexical:   0.20,
  syntactic: 0.12,
  semantic:  0.25,
  temporal:  0.15,
  memory:    0.13,
  discourse: 0.08,
  affective: 0.07,
};

// Text-only extractable indicators (no audio needed)
export const TEXT_INDICATORS = ALL_INDICATOR_IDS.filter(id =>
  INDICATORS[id].extractable === 'text' || INDICATORS[id].extractable === 'conversation'
);

// Early detection indicators (highest priority for screening)
export const EARLY_DETECTION_INDICATORS = ALL_INDICATOR_IDS.filter(id =>
  INDICATORS[id].early_detection?.alzheimer
);

// Condition-specific sentinel indicators
export const SENTINELS = {
  alzheimer: ['SEM_IDEA_DENSITY', 'SEM_REF_COHERENCE', 'LEX_PRONOUN_NOUN', 'TMP_LPR', 'MEM_CUED_RECALL'],
  depression: ['AFF_SELF_PRONOUN', 'AFF_NEG_VALENCE', 'TMP_VARIABILITY', 'AFF_HEDONIC', 'SEM_REF_COHERENCE'],
  parkinson: ['TMP_LPR', 'TMP_SPEECH_RATE', 'TMP_REPETITION'],
};
