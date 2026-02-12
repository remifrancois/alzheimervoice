/**
 * V4 INDICATOR DEFINITIONS
 *
 * 85 indicators derived from 80 studies across 3 conditions.
 * Two-stream architecture: text (64 indicators) + audio (21 indicators).
 * 9 domains including new ACOUSTIC and PD_MOTOR domains.
 *
 * Domains:
 *   LEX  — Lexical Richness (17 indicators)
 *   SYN  — Syntactic Complexity (8 indicators)
 *   SEM  — Semantic Coherence (9 indicators)
 *   TMP  — Temporal / Fluency (11 indicators)
 *   MEM  — Memory & Recall (6 indicators)
 *   DIS  — Discourse & Pragmatic (5 indicators)
 *   AFF  — Affective / Depression-specific (6 indicators)
 *   ACU  — Acoustic / Voice Quality (11 indicators) [NEW]
 *   PDM  — Parkinson Motor / Nonlinear (12 indicators) [NEW]
 */

const UP = 1;
const DOWN = -1;
const STABLE = 0;
const VARIES = 0.5;

export const INDICATORS = {

  // ════════════════════════════════════════════════════════
  // LEXICAL RICHNESS (LEX) — 17 indicators
  // ════════════════════════════════════════════════════════

  LEX_TTR: {
    id: 'LEX_TTR', domain: 'lexical', name: 'Type-Token Ratio',
    formula: 'V / N (unique words / total words)',
    extractable: 'text', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 1.0, depression: 0.3, parkinson: 0.1 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015', 'eyigoz2020', 'adress2020']
  },
  LEX_MATTR: {
    id: 'LEX_MATTR', domain: 'lexical', name: 'Moving-Average TTR',
    formula: 'mean(TTR over sliding 50-word windows)',
    extractable: 'text', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.9, depression: 0.3 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015'],
    note: 'Length-independent TTR variant; superior for short samples.'
  },
  LEX_BRUNET: {
    id: 'LEX_BRUNET', domain: 'lexical', name: "Brunet's Index",
    formula: 'N^(V^(-0.172))',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015']
  },
  LEX_HONORE: {
    id: 'LEX_HONORE', domain: 'lexical', name: "Honore's Statistic",
    formula: '100 × log(N) / (1 - V1/V)',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015']
  },
  LEX_CONTENT_DENSITY: {
    id: 'LEX_CONTENT_DENSITY', domain: 'lexical', name: 'Content Density',
    formula: 'content_words / total_words',
    extractable: 'text', evidence: 5, base_weight: 0.80,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.8, depression: 0.3, parkinson: 0.3 },
    early_detection: { alzheimer: true },
    studies: ['snowdon1996', 'fraser2015', 'subert2024']
  },
  LEX_WORD_FREQ: {
    id: 'LEX_WORD_FREQ', domain: 'lexical', name: 'Word Frequency Level',
    formula: 'mean(frequency_rank(content_words))',
    extractable: 'text', evidence: 4, base_weight: 0.75,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7 },
    early_detection: { alzheimer: true },
    studies: ['eyigoz2020', 'robin2023']
  },
  LEX_PRONOUN_NOUN: {
    id: 'LEX_PRONOUN_NOUN', domain: 'lexical', name: 'Pronoun-to-Noun Ratio',
    formula: 'pronouns / nouns',
    extractable: 'text', evidence: 5, base_weight: 0.90,
    directions: { alzheimer: UP, depression: UP, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.9, depression: 0.6 },
    early_detection: { alzheimer: true, depression: true },
    studies: ['fraser2015', 'zhang2022'],
    differential_note: 'AD: generic pronouns replacing nouns. Depression: I/me/my self-focus.'
  },
  LEX_NOUN_VERB: {
    id: 'LEX_NOUN_VERB', domain: 'lexical', name: 'Noun-to-Verb Ratio',
    formula: 'nouns / verbs',
    extractable: 'text', evidence: 4, base_weight: 0.60,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.6 },
    studies: ['fraser2015', 'ahmed2013'],
    note: 'AD decreases nouns faster than verbs — semantic naming deficit.'
  },
  LEX_GENERIC_SUB: {
    id: 'LEX_GENERIC_SUB', domain: 'lexical', name: 'Generic Substitution Rate',
    formula: 'generic_words / content_words',
    extractable: 'text', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: UP },
    effect_sizes: { alzheimer: 0.8 },
    early_detection: { alzheimer: true }
  },
  LEX_LIGHT_VERB: {
    id: 'LEX_LIGHT_VERB', domain: 'lexical', name: 'Light Verb Ratio',
    formula: 'light_verbs / total_verbs (do, make, get, have, go, take)',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5 }
  },
  LEX_IMAGEABILITY: {
    id: 'LEX_IMAGEABILITY', domain: 'lexical', name: 'Word Imageability',
    formula: 'mean(imageability_rating(content_words))',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.6 },
    studies: ['fraser2015'],
    note: 'AD patients shift to more imageable (concrete) words — abstract vocabulary loss.'
  },
  LEX_AOA: {
    id: 'LEX_AOA', domain: 'lexical', name: 'Age of Acquisition',
    formula: 'mean(aoa_rating(content_words))',
    extractable: 'text', evidence: 3, base_weight: 0.55,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5 },
    studies: ['fraser2015'],
    note: 'AD patients regress to earlier-acquired vocabulary.'
  },
  LEX_CLOSED_OPEN: {
    id: 'LEX_CLOSED_OPEN', domain: 'lexical', name: 'Closed-to-Open Class Ratio',
    formula: 'closed_class_words / open_class_words',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5 },
    studies: ['orimaye2017', 'fraser2015']
  },
  LEX_DEATH_WORDS: {
    id: 'LEX_DEATH_WORDS', domain: 'lexical', name: 'Death-Related Word Rate',
    formula: 'death_words / total_words × 100',
    extractable: 'text', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: STABLE, depression: UP, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { depression: 0.7 },
    studies: ['mocnik2025', 'dinkel2020'],
    note: 'Depression-specific. Words: death, dying, funeral, kill, suicide, end.'
  },
  LEX_RUMINATIVE: {
    id: 'LEX_RUMINATIVE', domain: 'lexical', name: 'Ruminative Language Rate',
    formula: 'ruminative_phrases / total_phrases × 100',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: STABLE, depression: UP, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { depression: 0.65 },
    studies: ['mocnik2025'],
    note: 'Repetitive negative self-focused thought patterns.'
  },
  LEX_VERBAL_OUTPUT: {
    id: 'LEX_VERBAL_OUTPUT', domain: 'lexical', name: 'Total Verbal Output',
    formula: 'total_words / session_duration_minutes',
    extractable: 'text', evidence: 5, base_weight: 0.75,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { alzheimer: 0.5, depression: 0.7, parkinson: 0.6 },
    studies: ['mocnik2025'],
    note: 'Simplest psychomotor marker — reduced output across all conditions.'
  },
  LEX_NID_RATE: {
    id: 'LEX_NID_RATE', domain: 'lexical', name: 'Not-in-Dictionary Rate',
    formula: 'unknown_words / total_words × 100',
    extractable: 'text', evidence: 3, base_weight: 0.45,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.4 },
    studies: ['fraser2015'],
    note: 'Captures paraphasias, neologisms, distortions.'
  },

  // ════════════════════════════════════════════════════════
  // SYNTACTIC COMPLEXITY (SYN) — 8 indicators
  // ════════════════════════════════════════════════════════

  SYN_MLU: {
    id: 'SYN_MLU', domain: 'syntactic', name: 'Mean Length of Utterance',
    formula: 'total_words / total_utterances',
    extractable: 'text', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.65, depression: 0.4, parkinson: 0.3 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015', 'mueller2018', 'chou2024']
  },
  SYN_SUBORDINATION: {
    id: 'SYN_SUBORDINATION', domain: 'syntactic', name: 'Subordination Index',
    formula: 'subordinate_clauses / total_clauses',
    extractable: 'text', evidence: 4, base_weight: 0.60,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.65 },
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
  SYN_YNGVE: {
    id: 'SYN_YNGVE', domain: 'syntactic', name: 'Yngve Depth',
    formula: 'mean(max_left_branching_depth per sentence)',
    extractable: 'text', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.7 },
    studies: ['fraser2015'],
    note: 'Parse-tree embeddedness; more sensitive than MLU for AD.'
  },
  SYN_CFG_DIVERSITY: {
    id: 'SYN_CFG_DIVERSITY', domain: 'syntactic', name: 'CFG Rule Diversity',
    formula: 'unique_cfg_rules / total_clauses',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5 },
    studies: ['fraser2015']
  },
  SYN_FRAGMENT_RATE: {
    id: 'SYN_FRAGMENT_RATE', domain: 'syntactic', name: 'Sentence Fragment Rate',
    formula: 'fragments / total_utterances',
    extractable: 'text', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.5 },
    studies: ['fraser2015']
  },

  // ════════════════════════════════════════════════════════
  // SEMANTIC COHERENCE (SEM) — 9 indicators
  // ════════════════════════════════════════════════════════

  SEM_IDEA_DENSITY: {
    id: 'SEM_IDEA_DENSITY', domain: 'semantic', name: 'Idea Density',
    formula: 'propositions / total_words × 10',
    extractable: 'text', evidence: 5, base_weight: 0.95,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 1.25, depression: 0.4 },
    early_detection: { alzheimer: true },
    studies: ['snowdon1996', 'fraser2015'],
    note: 'Strongest single AD predictor. Nun Study: detectable 60+ years before diagnosis.'
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
    effect_sizes: { alzheimer: 1.0 },
    early_detection: { alzheimer: true },
    studies: ['fraser2015'],
    differential_note: 'BEST single AD vs Depression differentiator. AD degrades; depression preserves.'
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
  SEM_COSINE_SIM: {
    id: 'SEM_COSINE_SIM', domain: 'semantic', name: 'Utterance Cosine Similarity',
    formula: 'mean(cosine_sim(adjacent_utterance_embeddings))',
    extractable: 'text', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: VARIES, depression: UP, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.6, depression: 0.3 },
    studies: ['fraser2015'],
    note: 'High similarity = repetitiveness. Low = incoherence. Both pathological.'
  },
  SEM_EMBEDDING_COHERENCE: {
    id: 'SEM_EMBEDDING_COHERENCE', domain: 'semantic', name: 'Embedding-Based Global Coherence',
    formula: 'mean(embedding_similarity across all utterance pairs)',
    extractable: 'text', evidence: 4, base_weight: 0.75,
    directions: { alzheimer: DOWN, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.8 },
    studies: ['eyigoz2020'],
    note: 'Predicts AD 7.6 years pre-diagnosis (AUC 0.74). Framingham Heart Study.'
  },

  // ════════════════════════════════════════════════════════
  // TEMPORAL / FLUENCY (TMP) — 11 indicators
  // ════════════════════════════════════════════════════════

  TMP_LPR: {
    id: 'TMP_LPR', domain: 'temporal', name: 'Long Pause Ratio',
    formula: 'pauses_over_2s / total_utterances',
    extractable: 'text', evidence: 5, base_weight: 0.90,
    directions: { alzheimer: UP, depression: UP, parkinson: UP, normal_aging: UP },
    effect_sizes: { alzheimer: 1.0, depression: 0.65, parkinson: 0.9 },
    early_detection: { alzheimer: true, parkinson: true },
    studies: ['pistono2019', 'young2024', 'chou2024'],
    differential_note: 'AD: mid-utterance before nouns. Depression: uniform. PD: pre-utterance.'
  },
  TMP_WITHIN_CLAUSE: {
    id: 'TMP_WITHIN_CLAUSE', domain: 'temporal', name: 'Within-Clause Pause Rate',
    formula: 'within_clause_pauses / total_pauses',
    extractable: 'text', evidence: 4, base_weight: 0.80,
    directions: { alzheimer: UP, depression: STABLE, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { alzheimer: 0.9 },
    early_detection: { alzheimer: true },
    studies: ['pistono2019'],
    differential_note: 'AD-specific: pauses WITHIN clauses before nouns.'
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
    differential_note: 'AD: same story unknowingly. Depression: same worry knowingly. PD: palilalia.'
  },
  TMP_RESPONSE_LATENCY: {
    id: 'TMP_RESPONSE_LATENCY', domain: 'temporal', name: 'Response Latency',
    formula: 'mean(time_to_first_word_after_question)',
    extractable: 'text', evidence: 5, base_weight: 0.90,
    directions: { alzheimer: UP, depression: UP, parkinson: UP, normal_aging: UP },
    effect_sizes: { alzheimer: 0.65, depression: 0.8, parkinson: 0.4 },
    early_detection: { alzheimer: true, depression: true },
    studies: ['young2024', 'yamamoto2020'],
    differential_note: 'Depression: r=0.458 with HAMD-17, highest effect. MDD > BP (p=0.001).'
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
    differential_note: 'AD: monotonic (LOW). Depression: episodic (HIGH). LBD: daily fluctuation.'
  },
  TMP_PAUSE_DURATION: {
    id: 'TMP_PAUSE_DURATION', domain: 'temporal', name: 'Mean Pause Duration',
    formula: 'mean(all_pause_durations_seconds)',
    extractable: 'audio', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: UP, depression: UP, parkinson: UP, normal_aging: UP },
    effect_sizes: { alzheimer: 0.6, depression: 0.5, parkinson: 0.7 },
    studies: ['yamamoto2020', 'toth2018'],
    note: 'Independent predictor separate from pause ratio. r=0.298 with HAMD-17.'
  },
  TMP_PAUSE_FREQUENCY: {
    id: 'TMP_PAUSE_FREQUENCY', domain: 'temporal', name: 'Pause Frequency',
    formula: 'pauses_per_minute',
    extractable: 'audio', evidence: 4, base_weight: 0.60,
    directions: { alzheimer: UP, depression: UP, parkinson: UP, normal_aging: UP },
    effect_sizes: { alzheimer: 0.5, depression: 0.4, parkinson: 0.6 },
    studies: ['cao2025']
  },
  TMP_ARTIC_RATE: {
    id: 'TMP_ARTIC_RATE', domain: 'temporal', name: 'Articulation Rate',
    formula: 'syllables_per_second (excluding pauses)',
    extractable: 'audio', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { alzheimer: 0.5, depression: 0.4, parkinson: 0.6 },
    studies: ['toth2018', 'szatloczki2015'],
    note: 'Most significant temporal parameter differentiating MCI (Toth 2018).'
  },

  // ════════════════════════════════════════════════════════
  // MEMORY & RECALL (MEM) — 6 indicators
  // ════════════════════════════════════════════════════════

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
    effect_sizes: { alzheimer: 1.0 },
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
    formula: 'category_items_in_60s',
    extractable: 'micro_task', evidence: 5, base_weight: 0.80,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { alzheimer: 1.0, depression: 0.4, parkinson: 0.4 },
    early_detection: { alzheimer: true, parkinson: true }
  },

  // ════════════════════════════════════════════════════════
  // DISCOURSE & PRAGMATIC (DIS) — 5 indicators
  // ════════════════════════════════════════════════════════

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
    note: 'Inverted U: increases early (deficit awareness), then decreases (awareness loss).'
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

  // ════════════════════════════════════════════════════════
  // AFFECTIVE / DEPRESSION-SPECIFIC (AFF) — 6 indicators
  // ════════════════════════════════════════════════════════

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
    studies: ['zhang2022', 'low2020']
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
    note: 'Anhedonia marker.'
  },
  AFF_ENGAGEMENT: {
    id: 'AFF_ENGAGEMENT', domain: 'affective', name: 'Conversational Engagement',
    formula: 'topic_initiations + elaborations / total_turns',
    extractable: 'conversation', evidence: 3, base_weight: 0.55,
    directions: { alzheimer: STABLE, depression: DOWN, parkinson: STABLE, normal_aging: STABLE },
    effect_sizes: { depression: 0.5 },
    studies: ['cohn2009']
  },

  // ════════════════════════════════════════════════════════
  // ACOUSTIC / VOICE QUALITY (ACU) — 11 indicators [NEW]
  // ════════════════════════════════════════════════════════

  ACU_F0_MEAN: {
    id: 'ACU_F0_MEAN', domain: 'acoustic', name: 'Mean Fundamental Frequency',
    formula: 'mean(F0) in Hz',
    extractable: 'audio', evidence: 4, base_weight: 0.55,
    directions: { alzheimer: STABLE, depression: DOWN, parkinson: VARIES, normal_aging: DOWN },
    effect_sizes: { depression: 0.4, parkinson: 0.3 },
    studies: ['voleti2019', 'szatloczki2015'],
    note: 'Gender-dependent: male ~120Hz, female ~220Hz. Depression lowers F0.'
  },
  ACU_F0_SD: {
    id: 'ACU_F0_SD', domain: 'acoustic', name: 'F0 Standard Deviation (Monopitch Index)',
    formula: 'SD(F0) across utterance',
    extractable: 'audio', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: STABLE, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { depression: 0.5, parkinson: 0.9, normal_aging: 0.2 },
    early_detection: { parkinson: true, depression: true },
    studies: ['rusz2021', 'cao2025', 'hlavnicka2017'],
    note: 'MOST CONSISTENT prodromal PD marker (AUC 0.80). Low SD = monopitch = flat affect.'
  },
  ACU_F0_RANGE: {
    id: 'ACU_F0_RANGE', domain: 'acoustic', name: 'F0 Range',
    formula: 'max(F0) - min(F0) in semitones',
    extractable: 'audio', evidence: 4, base_weight: 0.60,
    directions: { alzheimer: STABLE, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { depression: 0.5, parkinson: 0.7 },
    studies: ['voleti2019']
  },
  ACU_JITTER: {
    id: 'ACU_JITTER', domain: 'acoustic', name: 'Jitter (Local)',
    formula: 'cycle-to-cycle F0 variation (%)',
    extractable: 'audio', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: UP, depression: UP, parkinson: UP, normal_aging: UP },
    effect_sizes: { alzheimer: 0.3, depression: 0.3, parkinson: 0.7 },
    studies: ['little2009', 'godino2017', 'le2026'],
    note: 'PD: vocal fold instability. Healthy: <1.04%. PD: often >1.5%.'
  },
  ACU_SHIMMER: {
    id: 'ACU_SHIMMER', domain: 'acoustic', name: 'Shimmer (Local)',
    formula: 'cycle-to-cycle amplitude variation (%)',
    extractable: 'audio', evidence: 4, base_weight: 0.65,
    directions: { alzheimer: UP, depression: UP, parkinson: UP, normal_aging: UP },
    effect_sizes: { alzheimer: 0.3, depression: 0.3, parkinson: 0.7 },
    studies: ['little2009', 'tsanas2010'],
    note: 'Reflects incomplete vocal fold closure. Healthy: <3.81%. PD: often >5%.'
  },
  ACU_HNR: {
    id: 'ACU_HNR', domain: 'acoustic', name: 'Harmonics-to-Noise Ratio',
    formula: 'harmonic_energy / noise_energy (dB)',
    extractable: 'audio', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { alzheimer: 0.4, depression: 0.5, parkinson: 0.9 },
    early_detection: { parkinson: true },
    studies: ['little2009', 'wroge2018'],
    note: 'Part of the PD quartet (HNR+RPDE+DFA+PPE = 91.4%). Healthy: >20dB. PD: often <15dB.'
  },
  ACU_MFCC2: {
    id: 'ACU_MFCC2', domain: 'acoustic', name: 'MFCC Coefficient 2',
    formula: 'mean(mfcc[2]) across utterance',
    extractable: 'audio', evidence: 5, base_weight: 0.90,
    directions: { alzheimer: VARIES, depression: VARIES, parkinson: VARIES, normal_aging: STABLE },
    effect_sizes: { depression: 0.9, alzheimer: 0.4, parkinson: 0.4 },
    early_detection: { depression: true },
    studies: ['le2026', 'martinc2021'],
    note: 'HIGHEST SHAP feature for depression (0.069). Cross-cultural. Reflects vocal tract shape.'
  },
  ACU_CPP: {
    id: 'ACU_CPP', domain: 'acoustic', name: 'Cepstral Peak Prominence',
    formula: 'prominence of cepstral peak (dB)',
    extractable: 'audio', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { parkinson: 0.6, depression: 0.4 },
    studies: ['godino2017', 'cao2025'],
    note: 'Overall voice clarity. More robust than perturbation measures for disordered voices.'
  },
  ACU_SPECTRAL_HARM: {
    id: 'ACU_SPECTRAL_HARM', domain: 'acoustic', name: 'Spectral Harmonicity',
    formula: 'harmonic_energy / total_spectral_energy',
    extractable: 'audio', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: STABLE, depression: DOWN, parkinson: DOWN, normal_aging: STABLE },
    effect_sizes: { depression: 0.6, parkinson: 0.5 },
    studies: ['le2026'],
    note: 'Cross-cultural depression marker (SHAP=0.036). Psychomotor slowing signal.'
  },
  ACU_ENERGY_RANGE: {
    id: 'ACU_ENERGY_RANGE', domain: 'acoustic', name: 'Energy Dynamic Range',
    formula: 'max(energy_dB) - min(energy_dB)',
    extractable: 'audio', evidence: 3, base_weight: 0.55,
    directions: { alzheimer: DOWN, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { depression: 0.5, parkinson: 0.6 },
    note: 'Reduced dynamic range = monoloudness (PD) or flat affect (depression).'
  },
  ACU_F1F2_RATIO: {
    id: 'ACU_F1F2_RATIO', domain: 'acoustic', name: 'Formant F1/F2 Ratio',
    formula: 'mean(F1) / mean(F2)',
    extractable: 'audio', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: UP, normal_aging: STABLE },
    effect_sizes: { parkinson: 0.5 },
    studies: ['voleti2019'],
    note: 'PD: formant centralization increases F1/F2 ratio (vowel space compression).'
  },

  // ════════════════════════════════════════════════════════
  // PD MOTOR / NONLINEAR DYNAMICS (PDM) — 12 indicators [NEW]
  // ════════════════════════════════════════════════════════

  PDM_PPE: {
    id: 'PDM_PPE', domain: 'pd_motor', name: 'Pitch Period Entropy',
    formula: 'Shannon_entropy(histogram(relative_semitone_F0_differences))',
    extractable: 'audio', evidence: 5, base_weight: 0.95,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: UP, normal_aging: STABLE },
    effect_sizes: { parkinson: 1.2 },
    early_detection: { parkinson: true },
    studies: ['little2009'],
    note: 'SINGLE BEST PD feature: 85.6% accuracy alone. Designed for PD telemonitoring.'
  },
  PDM_RPDE: {
    id: 'PDM_RPDE', domain: 'pd_motor', name: 'Recurrence Period Density Entropy',
    formula: 'entropy of recurrence period density in phase space',
    extractable: 'audio', evidence: 5, base_weight: 0.90,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: UP, normal_aging: STABLE },
    effect_sizes: { parkinson: 1.0 },
    early_detection: { parkinson: true },
    studies: ['little2007', 'little2009', 'wroge2018'],
    note: 'Measures deviation from strict periodicity. Part of the PD quartet.'
  },
  PDM_DFA: {
    id: 'PDM_DFA', domain: 'pd_motor', name: 'Detrended Fluctuation Analysis',
    formula: 'fractal_scaling_exponent of noise',
    extractable: 'audio', evidence: 5, base_weight: 0.85,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: UP, normal_aging: STABLE },
    effect_sizes: { parkinson: 0.9 },
    early_detection: { parkinson: true },
    studies: ['little2007', 'little2009', 'wroge2018'],
    note: 'Part of the PD quartet. DFA exponent increases in PD (more self-similar noise).'
  },
  PDM_D2: {
    id: 'PDM_D2', domain: 'pd_motor', name: 'Correlation Dimension',
    formula: 'fractal dimension of attractor in phase space',
    extractable: 'audio', evidence: 3, base_weight: 0.55,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: UP, normal_aging: STABLE },
    effect_sizes: { parkinson: 0.5 },
    studies: ['godino2017']
  },
  PDM_VSA: {
    id: 'PDM_VSA', domain: 'pd_motor', name: 'Vowel Space Area',
    formula: 'area of triangle formed by F1/F2 of /a/, /i/, /u/',
    extractable: 'micro_task', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { parkinson: 0.7 },
    studies: ['rusz2013', 'cao2025'],
    note: 'Progressive restriction. More sensitive than standard articulation tests.'
  },
  PDM_VAI: {
    id: 'PDM_VAI', domain: 'pd_motor', name: 'Vowel Articulation Index',
    formula: '(F2i + F1a) / (F1i + F1u + F2u + F2a)',
    extractable: 'micro_task', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { parkinson: 0.7 },
    studies: ['rusz2013', 'skodda2012'],
    note: 'Appears more sensitive than tVSA to altered vowels. Correlates with axial gait dysfunction.'
  },
  PDM_DDK_RATE: {
    id: 'PDM_DDK_RATE', domain: 'pd_motor', name: 'DDK Syllable Rate',
    formula: 'syllables_per_second during /pa-ta-ka/ repetition',
    extractable: 'micro_task', evidence: 5, base_weight: 0.80,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { parkinson: 0.8 },
    studies: ['harel2004', 'moro2024'],
    note: '/pataka/ repetition: 68.9% PD, 77.4% MSA accuracy. Critical for differential.'
  },
  PDM_DDK_REG: {
    id: 'PDM_DDK_REG', domain: 'pd_motor', name: 'DDK Regularity',
    formula: '1 - CV(inter_syllable_intervals)',
    extractable: 'micro_task', evidence: 4, base_weight: 0.70,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: DOWN, normal_aging: STABLE },
    effect_sizes: { parkinson: 0.7 },
    studies: ['skodda2011', 'moro2024'],
    note: 'Instable pace and pace acceleration present in PD. Distinguishes TD vs PIGD subtypes.'
  },
  PDM_VOT: {
    id: 'PDM_VOT', domain: 'pd_motor', name: 'Voice Onset Time',
    formula: 'mean(VOT) for plosive consonants',
    extractable: 'audio', evidence: 3, base_weight: 0.55,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: UP, normal_aging: STABLE },
    effect_sizes: { parkinson: 0.5 },
    studies: ['cao2025', 'godino2017'],
    note: 'Prolonged VOT reflects impaired articulatory timing in PD.'
  },
  PDM_SPIRANT: {
    id: 'PDM_SPIRANT', domain: 'pd_motor', name: 'Spirantization Index',
    formula: 'mean([continuant] posterior probability for stops)',
    extractable: 'audio', evidence: 3, base_weight: 0.50,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: UP, normal_aging: STABLE },
    effect_sizes: { parkinson: 0.5 },
    studies: ['galaz2023'],
    note: 'Cutting-edge Phonet DNN marker. Coronal consonants (/t/,/d/) most vulnerable.'
  },
  PDM_FESTINATION: {
    id: 'PDM_FESTINATION', domain: 'pd_motor', name: 'Oral Festination Index',
    formula: 'acceleration_of_speech_rate across utterance',
    extractable: 'micro_task', evidence: 3, base_weight: 0.55,
    directions: { alzheimer: STABLE, depression: STABLE, parkinson: UP, normal_aging: STABLE },
    effect_sizes: { parkinson: 0.5 },
    studies: ['moreau2007', 'cao2025'],
    note: 'Involuntary speeding up. Correlates with gait festination.'
  },
  PDM_MONOPITCH: {
    id: 'PDM_MONOPITCH', domain: 'pd_motor', name: 'Connected Speech Monopitch',
    formula: 'SD(F0) / mean(F0) during connected speech',
    extractable: 'audio', evidence: 5, base_weight: 0.90,
    directions: { alzheimer: STABLE, depression: DOWN, parkinson: DOWN, normal_aging: DOWN },
    effect_sizes: { parkinson: 0.9, depression: 0.5 },
    early_detection: { parkinson: true },
    studies: ['rusz2021', 'cao2025'],
    note: 'Validated across Czech, English, German, French, Italian. AUC 0.80 PD, 0.65 prodromal RBD.'
  },
};

// ════════════════════════════════════════════════════════
// DERIVED CONSTANTS
// ════════════════════════════════════════════════════════

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
  acoustic:  ALL_INDICATOR_IDS.filter(id => INDICATORS[id].domain === 'acoustic'),
  pd_motor:  ALL_INDICATOR_IDS.filter(id => INDICATORS[id].domain === 'pd_motor'),
};

// Domain weights for composite scoring — rebalanced for 9 domains
export const DOMAIN_WEIGHTS = {
  lexical:   0.15,
  syntactic: 0.10,
  semantic:  0.20,
  temporal:  0.12,
  memory:    0.10,
  discourse: 0.06,
  affective: 0.05,
  acoustic:  0.12,
  pd_motor:  0.10,
};

// Feature extractability categories
export const TEXT_INDICATORS = ALL_INDICATOR_IDS.filter(id =>
  INDICATORS[id].extractable === 'text' || INDICATORS[id].extractable === 'conversation'
);

export const AUDIO_INDICATORS = ALL_INDICATOR_IDS.filter(id =>
  INDICATORS[id].extractable === 'audio'
);

export const MICRO_TASK_INDICATORS = ALL_INDICATOR_IDS.filter(id =>
  INDICATORS[id].extractable === 'micro_task'
);

// Early detection indicators — expanded with acoustic markers
export const EARLY_DETECTION_INDICATORS = ALL_INDICATOR_IDS.filter(id =>
  INDICATORS[id].early_detection?.alzheimer ||
  INDICATORS[id].early_detection?.parkinson ||
  INDICATORS[id].early_detection?.depression
);

// Condition-specific sentinel indicators — expanded for V4
export const SENTINELS = {
  alzheimer: [
    'SEM_IDEA_DENSITY', 'SEM_REF_COHERENCE', 'LEX_PRONOUN_NOUN',
    'TMP_LPR', 'MEM_CUED_RECALL', 'SEM_EMBEDDING_COHERENCE', 'TMP_WITHIN_CLAUSE'
  ],
  depression: [
    'AFF_SELF_PRONOUN', 'AFF_NEG_VALENCE', 'TMP_VARIABILITY',
    'AFF_HEDONIC', 'TMP_RESPONSE_LATENCY', 'ACU_MFCC2', 'ACU_F0_SD'
  ],
  parkinson: [
    'PDM_PPE', 'PDM_RPDE', 'PDM_DFA', 'ACU_HNR',
    'ACU_F0_SD', 'PDM_MONOPITCH', 'PDM_DDK_RATE',
    'PDM_VSA', 'ACU_JITTER', 'ACU_SHIMMER'
  ],
};

// Population norms for acoustic normalization (sigmoid mapping to 0.0-1.0)
export const ACOUSTIC_NORMS = {
  ACU_F0_MEAN:       { male: { mean: 120, std: 20 }, female: { mean: 220, std: 30 } },
  ACU_F0_SD:         { male: { mean: 25, std: 10 }, female: { mean: 35, std: 12 } },
  ACU_F0_RANGE:      { mean: 12, std: 4 }, // semitones
  ACU_JITTER:        { mean: 0.6, std: 0.3 }, // percent
  ACU_SHIMMER:       { mean: 3.0, std: 1.5 }, // percent
  ACU_HNR:           { mean: 22, std: 4 }, // dB
  ACU_MFCC2:         { mean: -20, std: 10 }, // dimensionless
  ACU_CPP:           { mean: 10, std: 3 }, // dB
  ACU_SPECTRAL_HARM: { mean: 0.7, std: 0.15 }, // ratio
  ACU_ENERGY_RANGE:  { mean: 30, std: 8 }, // dB
  ACU_F1F2_RATIO:    { mean: 0.35, std: 0.08 }, // ratio
  PDM_PPE:           { mean: 0.08, std: 0.04 }, // bits
  PDM_RPDE:          { mean: 0.5, std: 0.1 }, // dimensionless
  PDM_DFA:           { mean: 0.65, std: 0.08 }, // exponent
  PDM_D2:            { mean: 2.5, std: 0.5 }, // dimension
  PDM_DDK_RATE:      { mean: 6.0, std: 1.0 }, // syllables/sec
  PDM_DDK_REG:       { mean: 0.85, std: 0.08 }, // regularity (1-CV)
  PDM_VOT:           { mean: 40, std: 15 }, // milliseconds
  PDM_MONOPITCH:     { mean: 0.20, std: 0.06 }, // CV of F0
  TMP_ARTIC_RATE:    { mean: 4.5, std: 0.8 }, // syllables/sec
};
