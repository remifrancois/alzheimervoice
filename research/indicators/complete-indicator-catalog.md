# COMPLETE CATALOG OF SPEECH & VOICE INDICATORS FOR ALZHEIMER'S DETECTION
# 60+ Indicators Across 7 Domains
# For MemoVoice CVF Engine v2

---

## OVERVIEW

This catalog contains every speech/voice indicator documented in the scientific literature
for Alzheimer's disease and MCI detection. Each indicator includes:
- Exact name and abbreviation
- Mathematical definition
- Direction of change in AD
- Sensitivity (early/moderate/late stage detection)
- Source studies
- Implementation notes for MemoVoice

**Total indicators cataloged: 62**

---

## DOMAIN A: ACOUSTIC FEATURES (17 indicators)

These require raw audio signal processing. In MemoVoice's text-based approach (using
transcription APIs), some can be extracted from timestamp metadata; others require the
audio stream.

### A1. Fundamental Frequency (F0) — Mean

- **Definition:** Average pitch of voice in Hz, computed from voiced segments only
- **Formula:** F0_mean = mean(f0(t)) for all voiced frames t
- **Unit:** Hz (typically 85-180 Hz male, 165-255 Hz female)
- **Direction in AD:** Slightly decreased mean, but PRIMARY change is reduced variability
- **Stage Sensitivity:** Moderate-to-late
- **Extraction:** Requires audio; pitch detection algorithm (autocorrelation, YIN, CREPE)
- **Sources:** Konig 2015, Haider 2020, Lopez-de-Ipina 2013
- **Notes:** Less reliable over telephone (codec distortion). More useful as part of F0 variability.

### A2. Fundamental Frequency (F0) — Standard Deviation

- **Definition:** Variability of pitch across an utterance or recording
- **Formula:** F0_std = std(f0(t)) for all voiced frames t
- **Unit:** Hz or semitones
- **Direction in AD:** DECREASED (flatter, more monotone speech)
- **Stage Sensitivity:** Moderate (detectable in mild-moderate AD)
- **Extraction:** Requires audio
- **Sources:** Konig 2015, Haider 2020, Lopez-de-Ipina 2013, Horley 2010
- **Notes:** One of the more reliable acoustic indicators. AD speech becomes more monotone.

### A3. Jitter (Local)

- **Definition:** Cycle-to-cycle variation of the fundamental frequency period
- **Formula:** Jitter = (1/(N-1)) * SUM(|T_i - T_{i+1}|) / ((1/N) * SUM(T_i))
- **Unit:** Percentage (%)
- **Direction in AD:** INCREASED (more pitch perturbation)
- **Stage Sensitivity:** Moderate-to-late
- **Extraction:** Requires audio; Praat, openSMILE, or parselmouth
- **Sources:** Konig 2015, Lopez-de-Ipina 2013, Meilán 2014
- **Notes:** Reflects laryngeal instability. Also increases with aging (confounder).

### A4. Shimmer (Local)

- **Definition:** Cycle-to-cycle variation of amplitude (loudness)
- **Formula:** Shimmer = (1/(N-1)) * SUM(|A_i - A_{i+1}|) / ((1/N) * SUM(A_i))
- **Unit:** Percentage (%) or dB
- **Direction in AD:** INCREASED (more amplitude perturbation)
- **Stage Sensitivity:** Moderate-to-late
- **Extraction:** Requires audio
- **Sources:** Konig 2015, Lopez-de-Ipina 2013, Meilán 2014
- **Notes:** Less specific to AD than jitter. Also affected by general health, hydration.

### A5. Harmonics-to-Noise Ratio (HNR)

- **Definition:** Ratio of harmonic (periodic) energy to noise energy in voice signal
- **Formula:** HNR = 10 * log10(E_harmonic / E_noise)
- **Unit:** dB (typical healthy: 20-25 dB; pathological: <15 dB)
- **Direction in AD:** DECREASED (more noise in voice, breathier quality)
- **Stage Sensitivity:** Late (not highly specific early)
- **Extraction:** Requires audio
- **Sources:** Konig 2015, Haider 2020
- **Notes:** Non-specific; also affected by aging, respiratory issues, medications.

### A6. Formant Frequencies (F1, F2, F3) — Mean Values

- **Definition:** Resonance frequencies of the vocal tract, reflecting articulatory position
- **Formula:** Extracted via LPC analysis or formant tracking algorithms
- **Unit:** Hz (F1 ~300-800, F2 ~800-2500, F3 ~2000-3500)
- **Direction in AD:** More variable, less precisely targeted (INCREASED formant bandwidth)
- **Stage Sensitivity:** Moderate-to-late
- **Extraction:** Requires audio; degraded significantly over telephone
- **Sources:** Konig 2015, Haider 2020
- **Notes:** Unreliable over phone. Better measured in controlled recording conditions.

### A7. Formant Dispersion / Vowel Space Area

- **Definition:** Spread of vowel formants in F1-F2 space; measures articulatory precision
- **Formula:** Vowel Space = area of polygon formed by corner vowels (/i/, /a/, /u/) in F1-F2 space
- **Unit:** Hz^2 or normalized
- **Direction in AD:** DECREASED (vowels become more centralized, less distinct)
- **Stage Sensitivity:** Moderate-to-late
- **Extraction:** Requires audio + vowel segmentation
- **Sources:** Konig 2015, Horley 2010
- **Notes:** Reflects motor speech control deterioration.

### A8. MFCCs (Mel-Frequency Cepstral Coefficients) 1-13

- **Definition:** Spectral envelope representation on a perceptual (mel) frequency scale
- **Formula:** MFCC = DCT(log(mel_filterbank_energy(signal)))
- **Unit:** Dimensionless (typically 13 coefficients + 13 deltas + 13 delta-deltas = 39 features)
- **Direction in AD:** Systematic shifts in multiple coefficients reflecting articulatory and phonatory changes
- **Stage Sensitivity:** Moderate (useful in aggregate, not individually)
- **Extraction:** Requires audio; standard speech processing libraries (librosa, openSMILE)
- **Sources:** Luz 2020 (ADReSS), Haider 2020, Gauder 2021, Lopez-de-Ipina 2013
- **Notes:** Best used as input to machine learning models rather than interpreted individually. MFCC1 relates to overall energy, MFCC2 to spectral slope (voice brightness).

### A9. Speech Rate

- **Definition:** Number of words (or syllables) produced per unit time, including pauses
- **Formula:** SR = total_words / total_duration_seconds (or syllables/second)
- **Unit:** Words/second or syllables/second
- **Direction in AD:** DECREASED (slower speech)
- **Stage Sensitivity:** Early-to-moderate (one of the earliest acoustic changes)
- **Extraction:** From transcription + timestamps (no raw audio needed for word-level SR)
- **Sources:** Robin 2023, Konig 2015, Haider 2020, de la Fuente Garcia 2020
- **Notes:** VERY robust feature. Detectable from transcription timestamps alone.

### A10. Articulation Rate

- **Definition:** Number of syllables per second during PHONATION ONLY (excluding pauses)
- **Formula:** AR = total_syllables / total_phonation_time
- **Unit:** Syllables/second (typical healthy: 4-6 syl/s)
- **Direction in AD:** DECREASED (but less than speech rate, since pauses account for most slowing)
- **Stage Sensitivity:** Moderate
- **Extraction:** Requires audio or precise phonation segmentation
- **Sources:** Robin 2023, Konig 2015
- **Notes:** Separates articulatory speed from planning pauses. Decline suggests motor speech involvement.

### A11. Phonation Time Ratio

- **Definition:** Proportion of total recording time spent in voiced speech
- **Formula:** PTR = total_phonation_time / total_recording_time
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (more time spent in silence/pauses)
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** Requires voice activity detection (VAD)
- **Sources:** Fraser 2015, Haider 2020
- **Notes:** Simple to extract; equivalent to 1 - pause_ratio.

### A12. Intensity/Loudness — Mean

- **Definition:** Average volume of speech
- **Formula:** I_mean = mean(RMS_energy(t)) or mean(loudness(t))
- **Unit:** dB
- **Direction in AD:** Variable (can increase or decrease)
- **Stage Sensitivity:** Late (not reliable early indicator)
- **Extraction:** Requires audio
- **Sources:** Haider 2020
- **Notes:** Confounded by recording setup, microphone distance, hearing loss compensation.

### A13. Intensity/Loudness — Variability

- **Definition:** Variation in volume across speech
- **Formula:** I_std = std(loudness(t))
- **Unit:** dB
- **Direction in AD:** DECREASED (less dynamic range, flatter delivery)
- **Stage Sensitivity:** Moderate
- **Extraction:** Requires audio
- **Sources:** Haider 2020, Lopez-de-Ipina 2013
- **Notes:** Part of the "Emotional Temperature" concept. Combined with F0 variability, captures prosodic flatness.

### A14. Alpha Ratio

- **Definition:** Ratio of energy in the 1-5 kHz band to energy in the 0-1 kHz band
- **Formula:** Alpha = energy(1000-5000 Hz) / energy(50-1000 Hz)
- **Unit:** dB (log ratio)
- **Direction in AD:** Tends to decrease (less high-frequency energy, breathy/weak voice quality)
- **Stage Sensitivity:** Late
- **Extraction:** Requires audio; included in eGeMAPS standard set
- **Sources:** Haider 2020 (eGeMAPS)

### A15. Spectral Centroid

- **Definition:** Center of mass of the frequency spectrum; correlates with perceived "brightness"
- **Formula:** SC = SUM(f * |X(f)|) / SUM(|X(f)|)
- **Unit:** Hz
- **Direction in AD:** Tends to decrease slightly
- **Stage Sensitivity:** Late
- **Extraction:** Requires audio
- **Sources:** Haider 2020

### A16. Zero Crossing Rate (ZCR)

- **Definition:** Rate at which the signal changes sign per unit time
- **Formula:** ZCR = (1/N) * SUM(|sign(x(n)) - sign(x(n-1))|)
- **Unit:** Crossings per second
- **Direction in AD:** Variable
- **Stage Sensitivity:** Not highly discriminative on its own
- **Sources:** Lopez-de-Ipina 2013

### A17. Emotional Temperature (Composite)

- **Definition:** Combined measure of emotional expressiveness in voice
- **Formula:** ET = weighted_combination(F0_variability, intensity_variability, speech_rate_variability)
- **Unit:** Normalized score (0-1)
- **Direction in AD:** DECREASED (emotional flatness)
- **Stage Sensitivity:** Moderate
- **Sources:** Lopez-de-Ipina 2013, 2015
- **Notes:** Proprietary composite; can be approximated by combining A2 + A13 + variability of A9.

---

## DOMAIN B: TEMPORAL / FLUENCY FEATURES (12 indicators)

These are the MOST ROBUST features for text-based analysis. Many can be extracted from
transcription timestamps alone without raw audio.

### B1. Long Pause Ratio (LPR)

- **Definition:** Ratio of pauses longer than 2 seconds to total number of utterances
- **Formula:** LPR = count(pauses > 2s) / total_utterances
- **Unit:** Ratio
- **Direction in AD:** SIGNIFICANTLY INCREASED
- **Stage Sensitivity:** EARLY (one of the earliest detectable changes)
- **Extraction:** From transcription timestamps
- **Sources:** Frontiers 2024, Pistono 2019, Yuan 2020
- **Notes:** THE single most reliable early indicator according to multiple studies. 82% accuracy alone.

### B2. Mean Pause Duration

- **Definition:** Average duration of all silent pauses in speech
- **Formula:** MPD = SUM(pause_durations) / count(pauses)
- **Unit:** Seconds
- **Direction in AD:** INCREASED
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** From transcription timestamps
- **Sources:** Fraser 2015, Robin 2023, Pistono 2019

### B3. Pause-to-Speech Ratio

- **Definition:** Total pause time divided by total speech time
- **Formula:** PSR = total_pause_time / total_phonation_time
- **Unit:** Ratio
- **Direction in AD:** INCREASED (more time pausing relative to speaking)
- **Stage Sensitivity:** Early
- **Extraction:** From transcription timestamps or VAD
- **Sources:** Robin 2023, Fraser 2015, Konig 2015

### B4. Within-Clause Pause Rate

- **Definition:** Pauses occurring WITHIN a syntactic clause (word-finding pauses)
- **Formula:** WCPR = count(pauses_within_clauses) / total_clauses
- **Unit:** Ratio
- **Direction in AD:** SIGNIFICANTLY INCREASED (specific to word-finding difficulty)
- **Stage Sensitivity:** EARLY (very sensitive to lexical access problems)
- **Extraction:** Requires syntactic parsing + pause timestamps
- **Sources:** Pistono 2019
- **Notes:** MORE discriminative than overall pause rate. Pauses BEFORE nouns are especially diagnostic.

### B5. Filled Pause Rate

- **Definition:** Rate of filled pauses ("um", "uh", "er", "euh")
- **Formula:** FPR = count(filled_pauses) / total_words * 100
- **Unit:** Filled pauses per 100 words
- **Direction in AD:** INCREASED (more word-finding hesitations)
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** From transcription text
- **Sources:** Fraser 2015, Yuan 2020, de la Fuente Garcia 2020
- **Notes:** Must be distinguished from discourse markers. Language-specific lists needed.

### B6. Response Latency

- **Definition:** Time between end of interviewer's question and start of patient's response
- **Formula:** RL = timestamp(first_patient_word) - timestamp(last_interviewer_word)
- **Unit:** Seconds
- **Direction in AD:** INCREASED (longer time to begin responding)
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** From transcription timestamps
- **Sources:** Robin 2023, Konig 2015
- **Notes:** Very relevant for MemoVoice's conversational format.

### B7. False Start Rate

- **Definition:** Rate of abandoned/restarted utterances
- **Formula:** FSR = count(false_starts) / total_utterances
- **Unit:** Ratio
- **Direction in AD:** INCREASED
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcript analysis (detect abandoned phrases, restarts)
- **Sources:** Fraser 2015, Yuan 2020
- **Notes:** Examples: "I went to the... I saw the..." or "The woman is... she's..."

### B8. Repetition Rate

- **Definition:** Frequency of exact or near-exact word/phrase repetitions within the same conversation
- **Formula:** RR = count(repeated_ngrams) / total_ngrams
- **Unit:** Ratio
- **Direction in AD:** INCREASED (especially phrase-level repetitions)
- **Stage Sensitivity:** Moderate-to-late
- **Extraction:** From transcript text (n-gram analysis)
- **Sources:** Fraser 2015, Orimaye 2017
- **Notes:** Distinguish from emphasis repetitions. Look for verbatim repetitions separated by other speech.

### B9. Revision Rate

- **Definition:** Rate of self-corrections during speech
- **Formula:** RevR = count(revisions) / total_utterances
- **Unit:** Ratio
- **Direction in AD:** Complex pattern -- initially INCREASES (awareness of errors), then DECREASES (loss of monitoring)
- **Stage Sensitivity:** Complex (inverted U-shaped across disease progression)
- **Extraction:** From transcript analysis
- **Sources:** Fraser 2015, Yuan 2020
- **Notes:** A decrease in revisions alongside other decline signals may indicate loss of error monitoring.

### B10. Words Per Minute

- **Definition:** Total words produced per minute (including pause time)
- **Formula:** WPM = total_words / (total_duration / 60)
- **Unit:** Words per minute (typical healthy: 120-180 WPM)
- **Direction in AD:** DECREASED
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** From transcript + timing
- **Sources:** Fraser 2015, de la Fuente Garcia 2020

### B11. Pause Variability (Standard Deviation of Pause Duration)

- **Definition:** How variable pause durations are within a speech sample
- **Formula:** PV = std(all_pause_durations)
- **Unit:** Seconds
- **Direction in AD:** INCREASED (more variable, less rhythmic pausing)
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcription timestamps
- **Sources:** Yuan 2020

### B12. Percentage of Very Long Pauses (>3 seconds)

- **Definition:** Proportion of pauses exceeding 3 seconds
- **Formula:** VLP = count(pauses > 3s) / count(all_pauses)
- **Unit:** Percentage
- **Direction in AD:** INCREASED
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcription timestamps
- **Sources:** Yuan 2020
- **Notes:** Very long pauses may indicate complete word-retrieval failure.

---

## DOMAIN C: LEXICAL RICHNESS FEATURES (10 indicators)

### C1. Type-Token Ratio (TTR)

- **Definition:** Ratio of unique words (types) to total words (tokens)
- **Formula:** TTR = |unique_words| / total_words
- **Unit:** Ratio (0-1; higher = richer vocabulary)
- **Direction in AD:** DECREASED (vocabulary shrinks)
- **Stage Sensitivity:** EARLY (one of the most reliable early markers)
- **Extraction:** From transcript text; use lemmatized forms for inflected languages
- **Sources:** Fraser 2015, Snowdon 1996, Kemper 2001, Robin 2023
- **Notes:** Sensitive to text length (longer texts naturally have lower TTR). Use MATTR for length-independent variant.

### C2. Moving Average Type-Token Ratio (MATTR)

- **Definition:** TTR computed over a moving window (typically 50 words) and averaged
- **Formula:** MATTR = mean(TTR(window_i)) for all 50-word windows
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED
- **Stage Sensitivity:** Early
- **Extraction:** From transcript text
- **Sources:** Covington & McFall 2010, Balagopalan 2020
- **Notes:** More robust than standard TTR for texts of varying length.

### C3. Brunet's Index (W)

- **Definition:** Vocabulary richness measure independent of text length
- **Formula:** W = N^(V^(-0.172)) where N = total words, V = unique words (types)
- **Unit:** Dimensionless (higher value = LESS diverse vocabulary)
- **Direction in AD:** INCREASED (less diverse vocabulary)
- **Stage Sensitivity:** Early
- **Extraction:** From transcript text
- **Sources:** Fraser 2015, Eyigoz 2020

### C4. Honore's Statistic (R)

- **Definition:** Measures proportion of words used only once (hapax legomena)
- **Formula:** R = 100 * log(N) / (1 - V1/V) where N = total words, V = vocab size, V1 = words occurring once
- **Unit:** Dimensionless (higher = richer vocabulary)
- **Direction in AD:** DECREASED (fewer unique single-use words)
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** From transcript text
- **Sources:** Fraser 2015

### C5. Content Density

- **Definition:** Proportion of content words (nouns, verbs, adjectives, adverbs) to total words
- **Formula:** CD = (nouns + verbs + adjectives + adverbs) / total_words
- **Unit:** Ratio (0-1; typically 0.4-0.6)
- **Direction in AD:** DECREASED (more function words, fillers; fewer content words)
- **Stage Sensitivity:** Early
- **Extraction:** From transcript + POS tagging
- **Sources:** Fraser 2015, Snowdon 1996

### C6. Word Frequency Level

- **Definition:** Average frequency rank of content words in a standard frequency database
- **Formula:** WFL = mean(frequency_rank(w)) for all content words w
- **Unit:** Log frequency (higher = more common/simpler words)
- **Direction in AD:** INCREASED (shift to higher-frequency, simpler, more common words)
- **Stage Sensitivity:** EARLY (very sensitive marker)
- **Extraction:** From transcript + word frequency database (SUBTLEX, Lexique 3.0)
- **Sources:** Fraser 2015, Eyigoz 2020, Ahmed 2013
- **Notes:** Patients say "thing" instead of "spatula", "place" instead of "kitchen". This is one of the earliest measurable changes.

### C7. Pronoun-to-Noun Ratio

- **Definition:** Ratio of pronouns to nouns in speech
- **Formula:** PNR = count(pronouns) / count(nouns)
- **Unit:** Ratio (higher = more pronoun substitution)
- **Direction in AD:** SIGNIFICANTLY INCREASED (pronouns substitute for forgotten nouns)
- **Stage Sensitivity:** EARLY (very strong early indicator)
- **Extraction:** From transcript + POS tagging
- **Sources:** Fraser 2015, Kavanaugh 2022
- **Notes:** "He did the thing there" instead of "The boy reached for the cookie on the shelf." Among the top 3 most discriminative features across studies.

### C8. Light Verb Ratio

- **Definition:** Proportion of semantically vague ("light") verbs to total verbs
- **Formula:** LVR = count(light_verbs) / count(all_verbs)
- **Light Verbs:** "do", "make", "get", "go", "have", "take", "give", "put", "be" (EN); "faire", "avoir", "etre", "mettre", "aller", "prendre" (FR)
- **Unit:** Ratio (0-1)
- **Direction in AD:** INCREASED (more vague verbs replacing specific ones)
- **Stage Sensitivity:** Early
- **Extraction:** From transcript + POS tagging + light verb list
- **Sources:** Fraser 2015
- **Notes:** "She's doing something" instead of "She's washing the dishes."

### C9. Word Concreteness

- **Definition:** Average concreteness rating of content words (concrete = perceptible by senses)
- **Formula:** WC = mean(concreteness_rating(w)) for all content words w
- **Unit:** Rating scale (1-5; Brysbaert et al. 2014 norms)
- **Direction in AD:** Can shift toward more concrete words (easier to access) or become inconsistent
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcript + concreteness norms database
- **Sources:** Garrard 2005, Ahmed 2013

### C10. Word Age of Acquisition (AoA)

- **Definition:** Average age at which content words are typically learned
- **Formula:** AoA = mean(acquisition_age(w)) for all content words w
- **Unit:** Years (using Kuperman et al. 2012 norms)
- **Direction in AD:** DECREASED (regression to earlier-acquired, simpler words)
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcript + AoA norms database
- **Sources:** Various psycholinguistic studies
- **Notes:** AD patients regress to vocabulary learned earlier in life.

---

## DOMAIN D: SYNTACTIC COMPLEXITY FEATURES (8 indicators)

### D1. Mean Length of Utterance (MLU)

- **Definition:** Average number of words per complete utterance (sentence or turn)
- **Formula:** MLU = total_words / total_utterances
- **Unit:** Words per utterance (typical healthy adult: 10-20)
- **Direction in AD:** DECREASED (shorter, simpler sentences)
- **Stage Sensitivity:** Early-to-moderate (78% accuracy alone)
- **Extraction:** From transcript (requires utterance segmentation)
- **Sources:** Fraser 2015, Robin 2023, Kemper 2001, Frontiers 2024

### D2. Subordination Index

- **Definition:** Ratio of subordinate clauses to total clauses
- **Formula:** SI = count(subordinate_clauses) / count(all_clauses)
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (fewer complex multi-clause sentences)
- **Stage Sensitivity:** Moderate (declines after lexical measures)
- **Extraction:** From transcript + clause-level parsing
- **Sources:** Fraser 2015, Kemper 2001, Mueller 2018
- **Notes:** Subordinate clause markers: "because", "although", "when", "which", "that" (EN); "parce que", "bien que", "qui", "que", "dont" (FR)

### D3. Yngve Depth (Mean and Max)

- **Definition:** Maximum left-branching depth in a syntactic parse tree; measures working memory load
- **Formula:** Computed from constituency parse tree; each left branch adds 1 to depth
- **Unit:** Integer (typical: 2-5 mean, 4-10 max)
- **Direction in AD:** DECREASED (simpler syntactic structures requiring less working memory)
- **Stage Sensitivity:** Moderate
- **Extraction:** Requires syntactic parsing (constituency parser)
- **Sources:** Fraser 2015, Eyigoz 2020

### D4. Frazier Depth (Mean and Max)

- **Definition:** Tree depth measure weighting non-terminal nodes more heavily
- **Formula:** Computed from parse tree; right-branching structures add more depth
- **Unit:** Numeric
- **Direction in AD:** DECREASED
- **Stage Sensitivity:** Moderate
- **Extraction:** Requires syntactic parsing
- **Sources:** Fraser 2015

### D5. Sentence Completeness Rate

- **Definition:** Proportion of grammatically complete sentences
- **Formula:** SCR = count(complete_sentences) / count(total_sentence_attempts)
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (more sentence fragments and abandoned sentences)
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcript + grammatical analysis
- **Sources:** Fraser 2015
- **Notes:** Related to B7 (false starts) but specifically measures grammatical completeness.

### D6. Passive Construction Ratio

- **Definition:** Proportion of sentences using passive voice
- **Formula:** PCR = count(passive_voice_sentences) / count(all_sentences)
- **Unit:** Ratio (0-1; typically low: 0.05-0.15)
- **Direction in AD:** DECREASED (passive voice is syntactically complex and drops early)
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcript + syntactic analysis
- **Sources:** Kemper 2001, Mueller 2018

### D7. Embedding Depth (Clausal)

- **Definition:** Average nesting level of subordinate clauses
- **Formula:** ED = mean(nesting_level(clause)) for all clauses
- **Unit:** Numeric (typical: 1.0-2.5)
- **Direction in AD:** DECREASED (less nested, less complex sentence structures)
- **Stage Sensitivity:** Moderate-to-late
- **Extraction:** From transcript + dependency/constituency parsing
- **Sources:** Fraser 2015, Snowdon 1996

### D8. Dependent Clauses Per T-Unit

- **Definition:** Average number of dependent clauses per terminable unit (main clause + all dependent clauses)
- **Formula:** DC/T = count(dependent_clauses) / count(T_units)
- **Unit:** Ratio
- **Direction in AD:** DECREASED
- **Stage Sensitivity:** Moderate
- **Extraction:** Requires syntactic parsing
- **Sources:** Fraser 2015, Orimaye 2017

---

## DOMAIN E: SEMANTIC COHERENCE FEATURES (9 indicators)

### E1. Idea Density (Propositional Density)

- **Definition:** Number of expressed propositions (ideas) per number of words
- **Formula:** ID = count(propositions) / total_words * 10 (per 10 words)
- **Unit:** Propositions per 10 words (typical healthy: 4.5-6.0)
- **Direction in AD:** SIGNIFICANTLY DECREASED (fewer ideas per word)
- **Stage Sensitivity:** EARLY (strongest single predictor in Nun Study; detectable DECADES before onset)
- **Extraction:** From transcript; Claude can extract by counting distinct propositions
- **Sources:** Snowdon 1996, Kemper 2001, Fraser 2015, Eyigoz 2020
- **Notes:** THE most studied and validated linguistic feature for AD prediction. Can be automated with CPIDR tool or manual annotation. This is the "gold standard" indicator.

### E2. Topic Maintenance

- **Definition:** Proportion of utterances that remain on the current topic of discussion
- **Formula:** TM = count(on_topic_utterances) / total_utterances
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (more topic drift, tangential speech)
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** From transcript; requires topic tracking (manual or NLP-based)
- **Sources:** Yancheva 2016, Fraser 2015
- **Notes:** Claude can assess this naturally during conversation.

### E3. Referential Coherence

- **Definition:** Clarity of pronoun references and anaphoric expressions
- **Formula:** RC = count(clear_referent_pronouns) / count(all_pronouns)
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (more ambiguous, dangling references)
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** From transcript + coreference resolution
- **Sources:** Fraser 2015
- **Notes:** "He went to the thing over there" (unclear) vs "John went to the store on Main Street" (clear).

### E4. Local Coherence (Adjacent Utterance Similarity)

- **Definition:** Semantic similarity between consecutive utterances, measured via word embeddings
- **Formula:** LC = mean(cosine_similarity(embedding(u_i), embedding(u_{i+1}))) for all consecutive utterance pairs
- **Unit:** Cosine similarity (0-1)
- **Direction in AD:** DECREASED (more abrupt topic shifts between sentences)
- **Stage Sensitivity:** Early (Eyigoz: detectable up to 7 years before diagnosis)
- **Extraction:** From transcript + sentence embedding model
- **Sources:** Eyigoz 2020, Yancheva 2016, Fraser 2015
- **Notes:** One of the EARLIEST detectable changes according to Eyigoz et al.

### E5. Global Coherence (Utterance-to-Topic Similarity)

- **Definition:** Semantic similarity between each utterance and the overall topic/prompt
- **Formula:** GC = mean(cosine_similarity(embedding(u_i), embedding(topic))) for all utterances
- **Unit:** Cosine similarity (0-1)
- **Direction in AD:** DECREASED (more off-topic speech)
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcript + sentence embedding model
- **Sources:** Yancheva 2016, Fraser 2015

### E6. Information Units (Task-Specific)

- **Definition:** Number of standard information content units produced (e.g., Cookie Theft has 24 standard units)
- **Formula:** IU = count(correct_information_units_mentioned)
- **Unit:** Count (0-24 for Cookie Theft)
- **Direction in AD:** SIGNIFICANTLY DECREASED
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** From transcript; match against standard content unit list
- **Sources:** Fraser 2015, Kavanaugh 2022, de la Fuente Garcia 2020
- **Notes:** Highly task-specific. For MemoVoice: adapt to information units in personal memory recall or picture description.

### E7. Information Units Per Minute

- **Definition:** Rate of information production (information units / time)
- **Formula:** IU/min = count(information_units) / (duration_minutes)
- **Unit:** Units per minute
- **Direction in AD:** DECREASED (both fewer units AND slower production)
- **Stage Sensitivity:** EARLY
- **Extraction:** From transcript + timing
- **Sources:** Robin 2023, Fraser 2015

### E8. Topic Entropy

- **Definition:** Information-theoretic measure of topic distribution in speech; how spread/disorganized topics are
- **Formula:** TE = -SUM(p(topic_k) * log(p(topic_k))) from LDA or similar topic model
- **Unit:** Bits (higher = more disorganized)
- **Direction in AD:** INCREASED (more disorganized topic structure)
- **Stage Sensitivity:** Moderate
- **Extraction:** Requires topic modeling (LDA) applied to transcript
- **Sources:** Yancheva 2016

### E9. Temporal Sequencing Accuracy

- **Definition:** Whether events in a narrative are described in correct chronological order
- **Formula:** TSA = count(correctly_ordered_events) / count(total_events_described)
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (events described out of order)
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcript; Claude can assess during narrative evaluation
- **Sources:** Mueller 2018

---

## DOMAIN F: MEMORY & RECALL FEATURES (8 indicators)

These are specific to conversational memory testing (relevant to MemoVoice's call format).

### F1. Free Recall Accuracy

- **Definition:** Ability to recall information without any cues or hints
- **Formula:** FRA = count(correct_free_recalls) / count(recall_prompts)
- **Unit:** Ratio (0-1)
- **Direction in AD:** SIGNIFICANTLY DECREASED (early and progressive)
- **Stage Sensitivity:** EARLY
- **Extraction:** During conversation; Claude evaluates response accuracy
- **Sources:** Grober & Buschke (RL/RI-16 protocol), Robin 2023

### F2. Cued Recall Accuracy

- **Definition:** Ability to recall information when given a categorical or contextual cue
- **Formula:** CRA = count(correct_cued_recalls) / count(cued_prompts)
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (later than free recall; cuing helps in MCI but not in AD)
- **Stage Sensitivity:** Moderate (the free-to-cued recall gap is diagnostic)
- **Extraction:** During conversation; Claude provides cue and evaluates response
- **Sources:** Grober & Buschke
- **Notes:** Key diagnostic feature: MCI patients benefit from cues; AD patients do not. The "intrusion error" (recalling wrong item) is specifically diagnostic of AD.

### F3. Recognition Accuracy

- **Definition:** Ability to recognize correct information when presented
- **Formula:** RecA = count(correct_recognitions) / count(recognition_prompts)
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED in moderate-severe AD; relatively preserved in MCI and mild AD
- **Stage Sensitivity:** Late
- **Extraction:** During conversation; Claude presents information and evaluates response
- **Sources:** Grober & Buschke

### F4. Intrusion Errors

- **Definition:** Recalling items that were not in the original information (false memories)
- **Formula:** IE = count(intrusions) / count(total_recall_attempts)
- **Unit:** Ratio
- **Direction in AD:** INCREASED (highly specific to AD vs other dementias)
- **Stage Sensitivity:** Early-to-moderate (intrusions are an early sign)
- **Extraction:** During conversation; detect when patient recalls events/details that did not happen
- **Sources:** Grober & Buschke
- **Notes:** Intrusion errors are more specific to AD than simple forgetting.

### F5. Temporal Precision of Memories

- **Definition:** Accuracy of temporal placement of recalled events
- **Formula:** TP = count(correctly_dated_events) / count(total_dated_events)
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (temporal disorientation)
- **Stage Sensitivity:** Early-to-moderate
- **Extraction:** During conversation; compare stated dates/timeframes to known facts
- **Sources:** Robin 2023

### F6. Detail Richness

- **Definition:** Amount of specific detail in memory recall (sensory details, names, places, emotions)
- **Formula:** DR = count(specific_details) / count(recall_episodes)
- **Unit:** Details per recall episode
- **Direction in AD:** DECREASED (memories become sparser, more generic)
- **Stage Sensitivity:** Early
- **Extraction:** During conversation; Claude evaluates specificity of recalled details
- **Sources:** Pistono 2019
- **Notes:** "I went somewhere nice" (low detail) vs "I went to the blue restaurant on the corner of Oak Street where we had the wonderful fish soup" (high detail).

### F7. Emotional Engagement with Memories

- **Definition:** Appropriate emotional response when recalling personal memories
- **Formula:** EE = count(emotionally_appropriate_responses) / count(emotional_memory_prompts)
- **Unit:** Ratio (0-1)
- **Direction in AD:** Relatively preserved in early AD but becomes flat in moderate-severe
- **Stage Sensitivity:** Late (emotional memory is one of the last to decline)
- **Extraction:** During conversation; Claude assesses emotional appropriateness
- **Sources:** Various clinical studies

### F8. Semantic Fluency (Category Task)

- **Definition:** Number of unique items named in a category (e.g., animals) in 60 seconds
- **Formula:** SF = count(unique_valid_items_in_60s)
- **Unit:** Count (typical healthy: 18-25 animals/minute)
- **Direction in AD:** SIGNIFICANTLY DECREASED (one of the most sensitive neuropsych tests)
- **Stage Sensitivity:** EARLY (among the earliest cognitive test abnormalities in AD)
- **Extraction:** Can be embedded naturally: "Let's play a game -- name all the animals you can think of!"
- **Sources:** Szatloczki 2015, multiple clinical studies
- **Notes:** Semantic fluency (category) declines EARLIER than phonemic fluency (letter) in AD, reflecting semantic memory loss.

---

## DOMAIN G: DISCOURSE & PRAGMATIC FEATURES (8 indicators)

### G1. Narrative Structure (Story Grammar)

- **Definition:** Presence of standard narrative elements (setting, complication, resolution, evaluation)
- **Formula:** NS = count(narrative_elements_present) / count(expected_elements)
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (stories lack structure, missing elements)
- **Stage Sensitivity:** Moderate
- **Extraction:** From transcript; Claude evaluates narrative structure
- **Sources:** Mueller 2018

### G2. Perseveration Rate

- **Definition:** Rate of returning to previously completed topics or repeating entire ideas
- **Formula:** PR = count(perseverative_returns) / total_topic_transitions
- **Unit:** Ratio
- **Direction in AD:** INCREASED (especially in moderate-severe AD)
- **Stage Sensitivity:** Moderate-to-late
- **Extraction:** From transcript; detect repeated theme returns
- **Sources:** Various clinical studies
- **Notes:** Different from B8 (word repetition). Perseveration is returning to a completed topic or idea.

### G3. Metalinguistic Awareness

- **Definition:** Explicit awareness of word-finding difficulty ("what's the word", "I can't remember the name")
- **Formula:** MA = count(metalinguistic_comments) / total_utterances
- **Unit:** Ratio
- **Direction in AD:** Complex: INCREASES in early AD (patient notices difficulty), then DECREASES as anosognosia develops
- **Stage Sensitivity:** Early (increase) then late (decrease)
- **Extraction:** From transcript; detect specific phrases
- **Sources:** Szatloczki 2015
- **Phrases to detect (EN):** "what's the word", "I can't remember", "you know what I mean", "the thing", "what do you call it", "I forgot the name"
- **Phrases to detect (FR):** "comment dire", "le mot m'echappe", "je ne trouve plus le mot", "comment ca s'appelle", "le truc", "le machin"
- **Notes:** Paradoxically, the PRESENCE of metalinguistic comments in early stages is a sign of awareness; their ABSENCE in later stages suggests anosognosia.

### G4. Circumlocution Rate

- **Definition:** Rate of talking around a word instead of using it directly
- **Formula:** CR = count(circumlocutions) / total_content_words
- **Unit:** Ratio
- **Direction in AD:** INCREASED (describing the function/appearance of an object instead of naming it)
- **Stage Sensitivity:** Early
- **Extraction:** From transcript; detect descriptive substitutions for specific words
- **Sources:** Szatloczki 2015, Mueller 2018
- **Notes:** "The thing you use to eat soup" instead of "spoon". Strong indicator of lexical access failure.

### G5. Turn-Taking Appropriateness

- **Definition:** Appropriate timing and content of conversational turn-taking
- **Formula:** TTA = count(appropriate_turns) / total_turns
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED in moderate-severe AD
- **Stage Sensitivity:** Late
- **Extraction:** During conversation; evaluate response relevance and timing
- **Sources:** Various pragmatic communication studies

### G6. Confabulation Rate

- **Definition:** Production of false or fabricated information presented as fact
- **Formula:** ConfR = count(confabulated_statements) / total_factual_statements
- **Unit:** Ratio
- **Direction in AD:** INCREASED (especially in moderate AD)
- **Stage Sensitivity:** Moderate
- **Extraction:** During conversation; compare statements to known facts (family memory profile)
- **Sources:** Various clinical studies
- **Notes:** Different from intrusion errors (F4); confabulation is more elaborate fabrication.

### G7. Discourse Marker Usage

- **Definition:** Appropriate use of discourse connectives and markers
- **Formula:** DMU = count(appropriate_discourse_markers) / total_discourse_markers
- **Unit:** Ratio (0-1)
- **Direction in AD:** Initially maintained, then inappropriate usage increases
- **Stage Sensitivity:** Late
- **Extraction:** From transcript; evaluate contextual appropriateness
- **Sources:** Various discourse analysis studies
- **Markers (EN):** "so", "but", "because", "then", "also", "however", "therefore", "anyway"
- **Markers (FR):** "alors", "donc", "mais", "parce que", "ensuite", "aussi", "du coup", "en fait"

### G8. Pragmatic Coherence

- **Definition:** Overall appropriateness of communication in context (responding to what was asked, staying relevant)
- **Formula:** PC = count(pragmatically_appropriate_responses) / total_responses
- **Unit:** Ratio (0-1)
- **Direction in AD:** DECREASED (responses become less contextually appropriate)
- **Stage Sensitivity:** Moderate-to-late
- **Extraction:** During conversation; Claude evaluates response relevance
- **Sources:** Mueller 2018

---

## SUMMARY TABLE: ALL 62 INDICATORS

| # | ID | Name | Domain | Direction in AD | Early Detection? | Text-Only? |
|---|-----|------|--------|----------------|-----------------|------------|
| 1 | A1 | F0 Mean | Acoustic | Slight decrease | No | No |
| 2 | A2 | F0 Std Dev | Acoustic | DECREASED | Moderate | No |
| 3 | A3 | Jitter | Acoustic | INCREASED | Moderate | No |
| 4 | A4 | Shimmer | Acoustic | INCREASED | Moderate | No |
| 5 | A5 | HNR | Acoustic | DECREASED | Late | No |
| 6 | A6 | Formant Frequencies | Acoustic | More variable | Moderate | No |
| 7 | A7 | Vowel Space Area | Acoustic | DECREASED | Moderate | No |
| 8 | A8 | MFCCs 1-13 | Acoustic | Systematic shifts | Moderate | No |
| 9 | A9 | Speech Rate | Acoustic/Temporal | DECREASED | EARLY | Partial* |
| 10 | A10 | Articulation Rate | Acoustic | DECREASED | Moderate | No |
| 11 | A11 | Phonation Time Ratio | Acoustic | DECREASED | Early | Partial* |
| 12 | A12 | Intensity Mean | Acoustic | Variable | Late | No |
| 13 | A13 | Intensity Variability | Acoustic | DECREASED | Moderate | No |
| 14 | A14 | Alpha Ratio | Acoustic | Decreased | Late | No |
| 15 | A15 | Spectral Centroid | Acoustic | Decreased | Late | No |
| 16 | A16 | Zero Crossing Rate | Acoustic | Variable | -- | No |
| 17 | A17 | Emotional Temperature | Acoustic | DECREASED | Moderate | No |
| 18 | B1 | Long Pause Ratio (LPR) | Temporal | INCREASED | **EARLY** | **YES** |
| 19 | B2 | Mean Pause Duration | Temporal | INCREASED | Early | **YES** |
| 20 | B3 | Pause-to-Speech Ratio | Temporal | INCREASED | Early | **YES** |
| 21 | B4 | Within-Clause Pause Rate | Temporal | INCREASED | **EARLY** | Partial |
| 22 | B5 | Filled Pause Rate | Temporal | INCREASED | Early | **YES** |
| 23 | B6 | Response Latency | Temporal | INCREASED | Early | **YES** |
| 24 | B7 | False Start Rate | Temporal | INCREASED | Moderate | **YES** |
| 25 | B8 | Repetition Rate | Temporal | INCREASED | Moderate | **YES** |
| 26 | B9 | Revision Rate | Temporal | Complex (inverted U) | Complex | **YES** |
| 27 | B10 | Words Per Minute | Temporal | DECREASED | Early | **YES** |
| 28 | B11 | Pause Variability | Temporal | INCREASED | Moderate | **YES** |
| 29 | B12 | Very Long Pause % | Temporal | INCREASED | Moderate | **YES** |
| 30 | C1 | Type-Token Ratio | Lexical | DECREASED | **EARLY** | **YES** |
| 31 | C2 | MATTR | Lexical | DECREASED | Early | **YES** |
| 32 | C3 | Brunet's Index | Lexical | INCREASED | Early | **YES** |
| 33 | C4 | Honore's Statistic | Lexical | DECREASED | Early | **YES** |
| 34 | C5 | Content Density | Lexical | DECREASED | Early | **YES** |
| 35 | C6 | Word Frequency Level | Lexical | INCREASED | **EARLY** | **YES** |
| 36 | C7 | Pronoun-to-Noun Ratio | Lexical | INCREASED | **EARLY** | **YES** |
| 37 | C8 | Light Verb Ratio | Lexical | INCREASED | Early | **YES** |
| 38 | C9 | Word Concreteness | Lexical | Variable | Moderate | **YES** |
| 39 | C10 | Word Age of Acquisition | Lexical | DECREASED | Moderate | **YES** |
| 40 | D1 | MLU | Syntactic | DECREASED | Early | **YES** |
| 41 | D2 | Subordination Index | Syntactic | DECREASED | Moderate | **YES** |
| 42 | D3 | Yngve Depth | Syntactic | DECREASED | Moderate | **YES** |
| 43 | D4 | Frazier Depth | Syntactic | DECREASED | Moderate | **YES** |
| 44 | D5 | Sentence Completeness | Syntactic | DECREASED | Moderate | **YES** |
| 45 | D6 | Passive Construction Ratio | Syntactic | DECREASED | Moderate | **YES** |
| 46 | D7 | Embedding Depth | Syntactic | DECREASED | Moderate | **YES** |
| 47 | D8 | Dep. Clauses per T-Unit | Syntactic | DECREASED | Moderate | **YES** |
| 48 | E1 | Idea Density | Semantic | DECREASED | **EARLY** | **YES** |
| 49 | E2 | Topic Maintenance | Semantic | DECREASED | Early | **YES** |
| 50 | E3 | Referential Coherence | Semantic | DECREASED | Early | **YES** |
| 51 | E4 | Local Coherence | Semantic | DECREASED | **EARLY** | **YES** |
| 52 | E5 | Global Coherence | Semantic | DECREASED | Moderate | **YES** |
| 53 | E6 | Information Units | Semantic | DECREASED | Early | **YES** |
| 54 | E7 | Info Units Per Minute | Semantic | DECREASED | **EARLY** | **YES** |
| 55 | E8 | Topic Entropy | Semantic | INCREASED | Moderate | **YES** |
| 56 | E9 | Temporal Sequencing | Semantic | DECREASED | Moderate | **YES** |
| 57 | F1 | Free Recall Accuracy | Memory | DECREASED | **EARLY** | **YES** |
| 58 | F2 | Cued Recall Accuracy | Memory | DECREASED | Moderate | **YES** |
| 59 | F3 | Recognition Accuracy | Memory | DECREASED | Late | **YES** |
| 60 | F4 | Intrusion Errors | Memory | INCREASED | Early | **YES** |
| 61 | F5 | Temporal Precision | Memory | DECREASED | Early | **YES** |
| 62 | F6 | Detail Richness | Memory | DECREASED | Early | **YES** |
| 63 | F7 | Emotional Engagement | Memory | DECREASED | Late | **YES** |
| 64 | F8 | Semantic Fluency | Memory | DECREASED | **EARLY** | **YES** |
| 65 | G1 | Narrative Structure | Discourse | DECREASED | Moderate | **YES** |
| 66 | G2 | Perseveration Rate | Discourse | INCREASED | Moderate | **YES** |
| 67 | G3 | Metalinguistic Awareness | Discourse | Complex (inverted U) | Early/Late | **YES** |
| 68 | G4 | Circumlocution Rate | Discourse | INCREASED | Early | **YES** |
| 69 | G5 | Turn-Taking Appropriateness | Discourse | DECREASED | Late | **YES** |
| 70 | G6 | Confabulation Rate | Discourse | INCREASED | Moderate | **YES** |
| 71 | G7 | Discourse Marker Usage | Discourse | Inappropriate | Late | **YES** |
| 72 | G8 | Pragmatic Coherence | Discourse | DECREASED | Moderate | **YES** |

*Partial = Can be extracted from transcription timestamps without raw audio

---

## TOP 15 INDICATORS FOR EARLY DETECTION (Ranked by Evidence Strength)

Based on cross-study validation, these are the most powerful early-detection indicators:

| Rank | ID | Indicator | Evidence Strength | Key Study |
|------|----|-----------|------------------|-----------|
| 1 | E1 | Idea Density | Strongest (Nun Study: 90% sens, 87% spec) | Snowdon 1996 |
| 2 | B1 | Long Pause Ratio | Very Strong (82% alone, r=-0.489 hippocampus) | Frontiers 2024, Pistono 2019 |
| 3 | C7 | Pronoun-to-Noun Ratio | Very Strong (top 3 in Fraser, consistent across studies) | Fraser 2015 |
| 4 | E4 | Local Coherence | Very Strong (detectable 7 years pre-diagnosis) | Eyigoz 2020 |
| 5 | C6 | Word Frequency Level | Strong (consistent early marker) | Fraser 2015, Eyigoz 2020 |
| 6 | C1 | TTR | Strong (most replicated feature) | Multiple studies |
| 7 | E7 | Info Units Per Minute | Strong (combines content + speed) | Robin 2023 |
| 8 | F1 | Free Recall Accuracy | Strong (standard clinical test) | Grober & Buschke |
| 9 | B4 | Within-Clause Pause Rate | Strong (specific to word-finding) | Pistono 2019 |
| 10 | F8 | Semantic Fluency | Strong (earliest neuropsych abnormality) | Szatloczki 2015 |
| 11 | C8 | Light Verb Ratio | Moderate-Strong | Fraser 2015 |
| 12 | D1 | MLU | Moderate-Strong (78% alone) | Frontiers 2024 |
| 13 | A9 | Speech Rate | Moderate-Strong | Robin 2023 |
| 14 | G4 | Circumlocution Rate | Moderate-Strong | Szatloczki 2015 |
| 15 | C5 | Content Density | Moderate-Strong | Fraser 2015, Snowdon 1996 |

---

## RECOMMENDED INDICATOR SET FOR MEMOVOICE (40+ Indicators, Text-Based)

Given MemoVoice's architecture (transcription-based, no raw audio processing), here are
the recommended indicators grouped by the current 5-domain CVF structure, expanded from
25 to 42:

### DOMAIN 1: LEXICAL RICHNESS (8 indicators, Weight: 22%)
L1. TTR, L2. MATTR, L3. Brunet's Index, L4. Honore's Statistic,
L5. Content Density, L6. Word Frequency Level, L7. Pronoun-to-Noun Ratio, L8. Light Verb Ratio

### DOMAIN 2: SYNTACTIC COMPLEXITY (6 indicators, Weight: 15%)
S1. MLU, S2. Subordination Index, S3. Sentence Completeness, S4. Passive Construction Ratio,
S5. Embedding Depth, S6. Dependent Clauses per T-Unit

### DOMAIN 3: SEMANTIC COHERENCE (8 indicators, Weight: 25%)
C1. Idea Density, C2. Topic Maintenance, C3. Referential Coherence, C4. Local Coherence,
C5. Global Coherence, C6. Information Units, C7. Info Units Per Minute, C8. Temporal Sequencing

### DOMAIN 4: FLUENCY & HESITATION (10 indicators, Weight: 23%)
F1. Long Pause Ratio (LPR), F2. Mean Pause Duration, F3. Pause-to-Speech Ratio,
F4. Within-Clause Pause Rate, F5. Filled Pause Rate, F6. Response Latency,
F7. False Start Rate, F8. Repetition Rate, F9. Words Per Minute, F10. Very Long Pause %

### DOMAIN 5: MEMORY & RECALL (6 indicators, Weight: 10%)
M1. Free Recall Accuracy, M2. Cued Recall Accuracy, M3. Recognition Accuracy,
M4. Intrusion Errors, M5. Temporal Precision, M6. Detail Richness

### DOMAIN 6: DISCOURSE & PRAGMATIC (4 indicators, Weight: 5%)
D1. Circumlocution Rate, D2. Metalinguistic Awareness, D3. Perseveration Rate,
D4. Confabulation Rate

**Total: 42 indicators across 6 domains**

---

## NOTES ON IMPLEMENTATION

1. **Baseline is everything.** All indicators MUST be measured relative to individual baseline, not population norms (per Snowdon, Robin, and clinical best practice).

2. **The cascade matters.** AD follows a predictable linguistic deterioration pattern:
   - Stage 1 (Pre-symptomatic, 2-7 years before diagnosis): Semantic coherence, idea density, word frequency shift
   - Stage 2 (Early/MCI): TTR decline, pause increases, pronoun-to-noun shift, word-finding pauses
   - Stage 3 (Mild AD): MLU decline, syntactic simplification, reduced narrative structure
   - Stage 4 (Moderate AD): Discourse breakdown, perseveration, confabulation, pragmatic failure
   - Stage 5 (Severe AD): Echolalia, mutism, complete communication breakdown

3. **Confounders are real.** Fatigue, medication, depression, hearing loss, education level, bilingualism, and cultural background all affect these indicators. The baseline calibration period must capture normal variation.

4. **Two-feature screening.** If resource-constrained, MLU + LPR alone achieve 88% accuracy (Frontiers 2024). This is the minimum viable feature set.

5. **Claude's advantage.** As an LLM, Claude can natively assess many of these indicators (especially Domains E, F, G) without explicit NLP pipelines, through its language understanding capabilities.
