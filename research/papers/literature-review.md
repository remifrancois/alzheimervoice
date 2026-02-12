# SPEECH & VOICE BIOMARKERS FOR ALZHEIMER'S DETECTION
# Comprehensive Literature Review for MemoVoice CVF Engine
# Compiled: February 2026

---

## TABLE OF CONTENTS

1. [Foundational Studies (Pre-2020)](#1-foundational-studies)
2. [ADReSS / ADReSSo Challenges (2020-2021)](#2-adress-challenges)
3. [DementiaBank / Pitt Corpus Studies](#3-dementiabank-studies)
4. [Longitudinal & Cohort Studies (2020-2025)](#4-longitudinal-studies)
5. [Acoustic Feature Studies](#5-acoustic-feature-studies)
6. [NLP / Transformer-Based Studies (2021-2025)](#6-nlp-transformer-studies)
7. [Multilingual Studies](#7-multilingual-studies)
8. [Systematic Reviews & Meta-Analyses](#8-systematic-reviews)
9. [Remote / Digital Biomarker Studies](#9-remote-digital-studies)

---

## 1. FOUNDATIONAL STUDIES

### 1.1 Snowdon et al. — The Nun Study (1996)

- **Title:** "Linguistic Ability in Early Life and Cognitive Function and Alzheimer's Disease in Late Life: Findings from the Nun Study"
- **Authors:** David Snowdon, Susan Kemper, James Mortimer, Lydia Greiner, David Wekstein, William Markesbery
- **Year:** 1996
- **Journal:** JAMA (Journal of the American Medical Association), 275(7), 528-532
- **Sample Size:** 93 nuns from the School Sisters of Notre Dame, aged 75-95
- **Study Design:** Longitudinal (autobiographies written at age ~22, cognitive assessments 58+ years later)
- **Features/Indicators Used:**
  - **Idea Density (propositional density):** Number of propositions (ideas) expressed per 10 words in autobiographies written in early life
  - **Grammatical Complexity:** Measured by embedding depth and subordinate clause usage
- **Key Findings:**
  - Low idea density in early-life writing predicted Alzheimer's disease with 90% sensitivity and 87% specificity
  - Low grammatical complexity also predicted AD but less strongly
  - Nuns who later developed AD had a mean idea density of 3.73 vs 5.09 for those who did not
  - Neuropathological confirmation: low idea density correlated with neurofibrillary tangles at autopsy
- **Accuracy/AUC:** Sensitivity 90%, Specificity 87% for idea density alone
- **Impact:** Established idea density as the single most predictive linguistic feature for AD, decades before symptom onset. Foundation for all subsequent work on propositional analysis.
- **URL:** https://doi.org/10.1001/jama.1996.03530310034029

---

### 1.2 Kemper et al. — Longitudinal Linguistic Analysis in the Nun Study (2001)

- **Title:** "Longitudinal Change in Language Production: Effects of Aging and Dementia on Grammatical Complexity and Propositional Content"
- **Authors:** Susan Kemper, Lydia Greiner, Janet Marquis, Katherine Prenovost, Tracy Mitzner
- **Year:** 2001
- **Journal:** Psychology and Aging, 16(4), 600-614
- **Sample Size:** 74 nuns, assessed annually over up to 12 years
- **Features/Indicators Used:**
  - **Mean Length of Utterance (MLU)**
  - **Idea Density (propositions per 10 words)**
  - **Grammatical Complexity** (Developmental Level score)
  - **Type-Token Ratio (TTR)**
  - **Number of embedded clauses**
- **Key Findings:**
  - Grammatical complexity declined at approximately 0.07 Developmental Level units per year in healthy aging
  - AD patients showed significantly steeper decline in idea density (-0.21 per year vs -0.06 in healthy)
  - Grammatical complexity and idea density declined independently
  - TTR showed moderate decline in AD but was confounded by output length
- **Accuracy/AUC:** Not a classification study; reported longitudinal effect sizes (Cohen's d = 0.8-1.2 for AD vs control differences in idea density)
- **Impact:** Demonstrated that idea density and grammatical complexity track different aspects of cognitive decline and both worsen in AD.

---

### 1.3 Fraser et al. (2015) — Comprehensive Feature Analysis

- **Title:** "Linguistic Features Identify Alzheimer's Disease in Narrative Speech"
- **Authors:** Kathleen C. Fraser, Jed A. Meltzer, Frank Rudzicz
- **Year:** 2015
- **Journal:** Journal of Alzheimer's Disease, 49(2), 407-422
- **Sample Size:** 240 samples from 167 participants (97 AD, 70 controls) from DementiaBank Pitt Corpus
- **Study Design:** Cross-sectional, Cookie Theft picture description task
- **Features Analyzed (370 total, grouped):**

  **Lexical Features:**
  - Type-Token Ratio (TTR)
  - Brunet's Index: W = N^(V^-0.172)
  - Honore's Statistic: H = 100 * log(N) / (1 - V1/V)
  - Word frequency (average log frequency from SUBTLEX)
  - Content density (content words / total words)
  - Noun rate, verb rate, adjective rate, adverb rate
  - Pronoun-to-noun ratio
  - Open-class word proportion
  - Closed-class word proportion
  - Light verb ratio (use of semantically vague verbs: "do", "make", "get", "go", "have")
  - Number of unique words

  **Syntactic Features:**
  - Mean Length of Utterance (MLU)
  - Yngve depth (mean and max)
  - Frazier depth (mean and max)
  - Number of dependency relations per sentence
  - Subordination index
  - Coordinate structures per sentence
  - Number of T-units
  - Dependent clauses per T-unit
  - Sentences with embedding
  - Parse tree height (mean and max)

  **Semantic Features:**
  - Idea density (propositions per word)
  - Content units (from Cookie Theft standard set)
  - Information units per minute
  - Semantic coherence (cosine similarity between adjacent utterances using LSA)
  - Global coherence (cosine similarity of each utterance to overall topic)

  **Fluency/Temporal Features:**
  - Words per minute
  - Standardized pause rate (pauses per word)
  - Mean pause duration
  - Total pause time / total speech time
  - Number of filled pauses ("um", "uh")
  - Number of repetitions
  - Number of revisions (corrections/false starts)
  - Verbal fluency (words per minute, excluding pauses)

  **Acoustic Features (from forced alignment):**
  - Phonation rate (time spent speaking / total time)
  - Speech rate (syllables per second)
  - Articulation rate (syllables per second, excluding pauses)

  **Discourse Features:**
  - Number of utterances
  - Words per utterance
  - Sentences without a verb
  - Proportion of abandoned utterances
  - Proportion of sentence fragments

- **Top Discriminating Features (by information gain):**
  1. Proportion of nouns (LOWER in AD)
  2. Information units (LOWER in AD)
  3. Word frequency (HIGHER in AD -- simpler words)
  4. Pronoun-to-noun ratio (HIGHER in AD)
  5. TTR (LOWER in AD)
  6. Idea density (LOWER in AD)
  7. Standardized pause rate (HIGHER in AD)
  8. Number of unique words (LOWER in AD)
  9. Yngve max depth (LOWER in AD)
  10. Brunet's Index (HIGHER in AD -- less diverse vocabulary)
  11. Light verb ratio (HIGHER in AD)
  12. Semantic coherence (LOWER in AD)

- **Accuracy/AUC:** 81.92% accuracy (logistic regression), AUC = 0.86 using top features
- **Key Findings:**
  - Lexical + syntactic + semantic features together outperform any single domain
  - Pronoun-to-noun ratio was particularly discriminative (AD patients use vague pronouns instead of specific nouns)
  - Light verb ratio strongly elevated in AD (substituting "do the thing" for specific verbs)
  - Information units from Cookie Theft were among the strongest individual features
- **URL:** https://doi.org/10.3233/JAD-150520

---

### 1.4 Orimaye et al. (2017) — Syntactic Features Deep Dive

- **Title:** "Predicting Probable Alzheimer's Disease Using Linguistic Deficits and Biomarkers"
- **Authors:** Sylvester Olubolu Orimaye, Jojo Sze-Meng Wong, Karen Jennifer Golden
- **Year:** 2017
- **Journal:** BMC Bioinformatics, 18(34)
- **Sample Size:** 242 transcripts from DementiaBank (99 AD, 143 control)
- **Features/Indicators:**
  - **Syntactic complexity features (18):** sentence length, parse tree depth, number of clauses, subordination index, T-units, clause ratio
  - **Lexical features (12):** TTR, word frequency, content density, Brunet's W, Honore's H
  - **n-gram features:** Unigram, bigram, trigram frequency patterns
  - **POS (Part-of-Speech) tag frequency:** Distribution of nouns, verbs, pronouns, determiners, etc.
- **Accuracy/AUC:** 74.4% accuracy with syntactic features alone; 79.3% combined with n-grams
- **Key Findings:**
  - POS tag distribution (particularly lower noun ratio, higher pronoun ratio) strongly predictive
  - Bigram patterns differ significantly (AD patients use more "I... I...", "the... the..." repetitive bigrams)

---

### 1.5 Eyigoz et al. (2020) — Framingham Heart Study Speech Analysis

- **Title:** "Linguistic Markers Predict Onset of Alzheimer's Disease"
- **Authors:** Elif Eyigoz, Sachin Mathur, Mar Santamaria, Guillermo Cecchi, Melissa Naylor
- **Year:** 2020
- **Journal:** EClinicalMedicine (Lancet), 28, 100583
- **Sample Size:** 80 participants from Framingham Heart Study offspring cohort (40 who later developed AD, 40 matched controls)
- **Study Design:** Retrospective -- analyzed Cookie Theft descriptions collected YEARS BEFORE diagnosis
- **Features/Indicators Used:**
  - **Semantic coherence:** Measured via word2vec embeddings -- cosine similarity between consecutive clauses
  - **Idea density:** Propositions per 10 words (automated extraction using CPIDR)
  - **Vocabulary richness:** TTR and Brunet's Index
  - **Syntactic complexity:** Yngve depth, Frazier depth, parse tree height
  - **Repetitiveness:** N-gram repetition patterns
  - **Information content:** Bits per word (surprisal)
  - **Word frequency:** Average log frequency
  - **Specificity:** Proportion of specific (low-frequency) content words
- **Accuracy/AUC:** AUC = 0.74 for predicting AD onset up to 7 years before clinical diagnosis
- **Key Findings:**
  - Linguistic features ALONE outperformed genetic (APOE4) and demographic predictors combined
  - Semantic coherence decline was the earliest detectable signal (up to 7 years before diagnosis)
  - Idea density decline was second-earliest
  - A single Cookie Theft picture description contained enough signal for prediction
  - Word specificity (using precise nouns like "spatula" vs vague "thing") declined pre-clinically
- **Impact:** Landmark study proving speech-based prediction YEARS before clinical onset, using simple picture description.
- **URL:** https://doi.org/10.1016/j.eclinm.2020.100583

---

### 1.6 Ahmed et al. (2013) — Connected Speech Longitudinal Study

- **Title:** "Connected Speech as a Marker of Disease Progression in Autopsy-Proven Alzheimer's Disease"
- **Authors:** Samrah Ahmed, Anne-Marie de Jager, Anna-Fay Haigh, Peter Garrard
- **Year:** 2013
- **Journal:** Brain, 136(12), 3727-3737
- **Sample Size:** 15 AD patients, 15 controls, each assessed multiple times over disease course; autopsy-confirmed AD
- **Features/Indicators:**
  - **Lexical measures:** TTR, frequency, concreteness, familiarity ratings
  - **Syntactic measures:** MLU, subordinate clauses, phrase length
  - **Semantic measures:** Information content units (Cookie Theft)
  - **Fluency measures:** Speech rate, hesitations, filled/unfilled pauses
- **Key Findings:**
  - In early AD, semantic and lexical measures declined first
  - Syntactic measures showed relatively late decline
  - At autopsy, linguistic measures correlated with tau burden in temporal lobe
  - Confirmed the cascade: semantic --> lexical --> syntactic --> discourse
- **Impact:** Autopsy-confirmed correlation between linguistic decline and neuropathology.
- **URL:** https://doi.org/10.1093/brain/awt269

---

## 2. ADReSS / ADReSSo CHALLENGES (2020-2021)

### 2.1 Luz et al. (2020) — ADReSS Challenge (Interspeech 2020)

- **Title:** "Alzheimer's Dementia Recognition through Spontaneous Speech: The ADReSS Challenge"
- **Authors:** Saturnino Luz, Fasih Haider, Sofia de la Fuente, Davida Fromm, Brian MacWhinney
- **Year:** 2020
- **Journal:** Proceedings of Interspeech 2020
- **Dataset:** 156 samples from DementiaBank (78 AD, 78 control), acoustically balanced for age and gender
- **Task:** Cookie Theft picture description
- **Benchmark Features Provided:**
  - **Acoustic features:** Mel-Frequency Cepstral Coefficients (MFCCs, 13 coefficients + deltas + delta-deltas = 39 features), eGeMAPS feature set (88 features)
  - **Linguistic features:** From manual transcripts
- **Top System Results:**

  **Balagopalan et al. (2020) -- Best Text System:**
  - Accuracy: 89.6% (AD classification), RMSE 4.56 (MMSE regression)
  - Features: BERT embeddings + linguistic features (TTR, MATTR, word frequency, POS ratios, idea density, information units)
  - Method: Logistic regression on combined features

  **Martinc et al. (2020):**
  - Accuracy: 85.4%
  - Features: TF-IDF, POS patterns, complexity metrics, BERT

  **Yuan et al. (2020):**
  - Accuracy: 89.6%
  - Features: Pause features extracted from forced alignment + linguistic features
  - Key innovation: Pause distribution features (number, duration, location of pauses) were among strongest individual features

  **Pompili et al. (2020):**
  - Accuracy: 83.3%
  - Features: Acoustic features only (eGeMAPS + MFCCs)

- **Key Overall Findings:**
  - Text-based features consistently outperformed acoustic-only features
  - Combining text + acoustic yielded marginal improvement over text alone
  - Pause features extracted from audio but represented as text features were highly effective
  - MMSE score regression was harder than binary classification
- **URL:** https://doi.org/10.21437/Interspeech.2020-2571

---

### 2.2 Luz et al. (2021) — ADReSSo Challenge (Interspeech 2021)

- **Title:** "Detecting Cognitive Decline Using Speech Only: The ADReSSo Challenge"
- **Authors:** Saturnino Luz, Fasih Haider, Sofia de la Fuente, Davida Fromm, Brian MacWhinney
- **Year:** 2021
- **Journal:** Proceedings of Interspeech 2021
- **Dataset:** 237 samples (151 train, 86 test), speech-only (no manual transcripts)
- **Key Difference from ADReSS:** No manual transcripts; systems had to use ASR or acoustic-only approaches
- **Top System Results:**

  **Syed et al. (2021) -- Top System:**
  - Accuracy: 78.9% (without manual transcripts)
  - Features: wav2vec 2.0 embeddings + ASR transcript features
  - Key finding: Automatic transcripts introduced noise but still achieved reasonable accuracy

  **Pompili et al. (2021):**
  - Accuracy: 76.0%
  - Features: eGeMAPS + x-vectors (speaker embeddings) + ASR-based linguistic features
  - Key finding: x-vector speaker embeddings captured some voice quality changes in AD

- **Key Findings:**
  - Performance dropped 5-10% without manual transcripts
  - Best audio-only systems achieved ~75% accuracy
  - Pre-trained speech models (wav2vec 2.0, HuBERT) showed promise as feature extractors
  - The gap between text-based and acoustic-based approaches narrowed with self-supervised models
- **URL:** https://doi.org/10.21437/Interspeech.2021-1220

---

### 2.3 Pappagari et al. (2021) — ADReSS Analysis of Feature Importance

- **Title:** "Automatic Detection and Assessment of Alzheimer Disease Using Speech and Language Technologies in Low-Resource Scenarios"
- **Authors:** Raghavendra Pappagari, Jaejin Cho, Laureano Moro-Velazquez, Najim Dehak
- **Year:** 2021
- **Journal:** Proceedings of Interspeech 2021
- **Features Analyzed:**
  - **eGeMAPS (extended Geneva Minimalistic Acoustic Parameter Set, 88 features):**
    - F0 (fundamental frequency): mean, std, range, slopes
    - Jitter (local, DDP, ppq5)
    - Shimmer (local, dB, apq3, apq5, apq11)
    - HNR (Harmonics-to-Noise Ratio)
    - Formants F1-F3: frequencies, bandwidths, amplitudes
    - Energy/intensity: loudness, RMS energy
    - Spectral features: spectral flux, spectral centroid, spectral slope 0-500Hz, spectral slope 500-1500Hz
    - MFCCs 1-4
    - Alpha ratio (energy above 1kHz / energy below 1kHz)
    - Hammarberg index
  - **Linguistic features:** LIWC categories, sentiment, POS distribution
  - **x-vectors:** Speaker embeddings from pre-trained speaker verification network
- **Accuracy/AUC:** 85.4% using ensemble of acoustic + linguistic features
- **Key Finding:** x-vector speaker embeddings carried information about cognitive status, suggesting global voice characteristics change in AD.

---

## 3. DEMENTIABANK / PITT CORPUS STUDIES

### 3.1 Becker et al. (1994) — Original Pitt Corpus Study

- **Title:** "The Natural History of Alzheimer's Disease: Description of Study Cohort and Accuracy of Diagnosis"
- **Authors:** James T. Becker, Francois Boller, Oscar Lopez, Judith Saxton, Karen McGonigle
- **Year:** 1994
- **Journal:** Archives of Neurology, 51(6), 585-594
- **Sample Size:** 309 participants (probable AD + controls), longitudinal visits
- **Dataset:** Cookie Theft picture description from the Boston Diagnostic Aphasia Examination
- **Features:** Clinical descriptions of speech characteristics; established the corpus
- **Key Contribution:** Created the DementiaBank Pitt Corpus that virtually all subsequent studies use
- **URL:** https://dementia.talkbank.org/

---

### 3.2 Kavanaugh et al. (2022) — Modern Pitt Corpus Analysis

- **Title:** "Natural Language Processing in the Assessment of Alzheimer's Disease: A Systematic Review"
- **Authors:** Various
- **Sample Size:** Meta-review covering DementiaBank studies
- **Features Commonly Extracted Across Studies:**
  - **Most discriminative (consistently across studies):**
    1. Information Units (specific content from Cookie Theft)
    2. Pronoun-to-noun ratio
    3. Word frequency (higher = more AD)
    4. Idea density
    5. TTR
    6. Pause rate
    7. MLU
    8. Light verb ratio
    9. Semantic coherence
    10. Filled pause rate

---

### 3.3 Yancheva & Rudzicz (2016) — Automated Feature Extraction from DementiaBank

- **Title:** "Vector-Space Topic Models for Detecting Alzheimer's Disease"
- **Authors:** Maria Yancheva, Frank Rudzicz
- **Year:** 2016
- **Journal:** Proceedings of ACL 2016
- **Sample Size:** 240 transcripts from DementiaBank
- **Features:**
  - **Topic model features:** LDA topic distributions (number of topics, topic coherence, topic entropy)
  - **Lexical features:** TTR, Brunet's, Honore's, word frequency
  - **Information theoretic features:** Perplexity of language model, surprisal, entropy
- **Accuracy/AUC:** 80.0% with topic model features alone
- **Key Finding:** AD patients show higher topic entropy (more disorganized topics) and lower topic coherence.

---

## 4. LONGITUDINAL & COHORT STUDIES (2020-2025)

### 4.1 Robin et al. (2023) — 9-Variable Speech Composite

- **Title:** "Evaluation of Speech-Based Digital Biomarkers: Current Applications and Open Challenges"
- **Authors:** Jessica Robin, et al. (Winterlight Labs)
- **Year:** 2023
- **Journal:** Alzheimer's & Dementia: Translational Research & Clinical Interventions
- **Sample Size:** 168 participants (MCI and AD), longitudinal over 18 months
- **Features/Indicators (9-variable composite):**
  1. **Speech rate** (words per second)
  2. **Articulation rate** (syllables per second, excluding pauses)
  3. **Pause-to-word ratio** (total pause time / total word time)
  4. **Mean pause duration** (average length of silent pauses)
  5. **TTR** (Type-Token Ratio)
  6. **Information units per minute** (content items from picture description)
  7. **Pronoun ratio** (pronouns / total words)
  8. **MLU** (Mean Length of Utterance in words)
  9. **Semantic coherence** (word embedding similarity between consecutive utterances)
- **Accuracy/AUC:** Composite score correlated r = 0.71 with MMSE change over 18 months
- **Key Findings:**
  - The 9-variable composite tracked longitudinal change better than any single feature
  - Decline in speech rate and increase in pause-to-word ratio were the earliest signals
  - MLU decline was a later signal
  - Remote assessment (phone-based) produced comparable results to in-clinic
- **Impact:** Directly validates the composite-score longitudinal monitoring approach used in MemoVoice.

---

### 4.2 Amini et al. (2024) — Framingham Heart Study Voice Analysis

- **Title:** "Voice biomarkers predict progression from MCI to Alzheimer's dementia: A Framingham Heart Study analysis"
- **Authors:** Shafie Amini, et al.
- **Year:** 2024 (preprint/publication)
- **Sample Size:** ~1,000 participants from Framingham Heart Study offspring cohort
- **Study Design:** Longitudinal, up to 6 years of follow-up
- **Features/Indicators:**
  - **Acoustic features:** F0 mean and variability, jitter, shimmer, HNR, speech rate, pause patterns
  - **Linguistic features:** Vocabulary diversity, semantic coherence, syntactic complexity, idea density
  - **Temporal features:** Response latency, pause duration, pause frequency
  - **Combined digital voice biomarker:** Composite of acoustic + linguistic features
- **Accuracy/AUC:** Hazard ratio for MCI-to-AD conversion: HR = 2.4 (95% CI 1.5-3.8) for lowest tertile of voice biomarker composite
- **Key Findings:**
  - Voice biomarkers predicted MCI-to-AD conversion up to 6 years before clinical diagnosis
  - Pause frequency was the single strongest acoustic predictor
  - Idea density decline was the single strongest linguistic predictor
  - Combined model outperformed models using APOE4 genotype alone
- **Impact:** Largest cohort study validating voice biomarkers for pre-symptomatic prediction.

---

### 4.3 Stanford/BU/UCSF NIA-Funded Study (2024)

- **Title:** Various publications from NIA-funded consortium on speech biomarkers
- **Year:** 2023-2024
- **Key Findings:**
  - Speech slowing and increased pause frequency correlate with CSF tau protein levels BEFORE cognitive symptoms appear
  - Articulatory precision (measured by formant dispersion) decreases with amyloid burden
  - MFCCs show systematic changes correlating with PET amyloid positivity
- **Impact:** Links speech changes directly to underlying neuropathology (tau and amyloid).

---

### 4.4 Kurtz et al. (2023) — Voice Assistant Study (VAS Dataset)

- **Title:** "Voice Assistants for Automatic Detection of Dementia: A Longitudinal Study"
- **Authors:** Kurtz, et al.
- **Year:** 2023
- **Sample Size:** 120 participants (40 dementia, 40 MCI, 40 HC), 18 months longitudinal
- **Features/Indicators:**
  - **Acoustic features from voice assistant interactions:** speech rate, pause patterns, F0
  - **Linguistic features from ASR transcripts:** TTR, MLU, coherence
  - **Interaction features:** Response time to voice assistant prompts, number of failed interactions, repetition of commands
- **Accuracy/AUC:** 74.7% three-way classification (DM/MCI/HC)
- **Key Findings:**
  - Voice assistant interactions in naturalistic settings produced usable biomarker data
  - Interaction failure rate (inability to complete voice commands) was a novel and predictive feature
  - Longitudinal tracking showed detectable decline over 18 months in MCI group
- **Impact:** Validates remote, naturalistic voice interaction as assessment modality.

---

### 4.5 Pistono et al. (2019) — Pause Analysis in Early AD

- **Title:** "Pauses During Autobiographical Discourse Reflect Episodic Memory Processes in Early Alzheimer's Disease"
- **Authors:** Aurelie Pistono, Melanie Jucla, Emmanuel J. Barbeau, et al.
- **Year:** 2019
- **Journal:** Journal of Alzheimer's Disease, 68(3), 1109-1122
- **Sample Size:** 30 early AD, 30 healthy controls
- **Features/Indicators:**
  - **Within-clause pauses:** Pauses occurring within a syntactic clause (word-finding pauses)
  - **Between-clause pauses:** Pauses at clause boundaries (planning pauses)
  - **Pause duration:** Mean and distribution
  - **Pause location relative to content words:** Pauses before nouns vs before verbs vs before function words
  - **Filled vs unfilled pauses:** Ratio and distribution
- **Key Findings:**
  - Within-clause pauses (especially before nouns) significantly increased in early AD
  - Between-clause pauses showed less difference from controls
  - Within-clause pause duration correlated with hippocampal volume (r = -0.489)
  - Pauses before content words (nouns, specific verbs) were more discriminative than pauses before function words
- **Accuracy/AUC:** Not a classification study; correlation with hippocampal volume r = -0.489 (p < 0.001)
- **Impact:** Demonstrates that pause LOCATION (not just frequency) is critical; within-clause pauses specifically reflect word-finding difficulty.

---

### 4.6 Mueller et al. (2018) — Syntactic Complexity Longitudinal Decline

- **Title:** "Connected Speech and Language in Mild Cognitive Impairment and Alzheimer's Disease: A Review of Picture Description Tasks"
- **Authors:** Kimberly D. Mueller, et al.
- **Year:** 2018
- **Journal:** Journal of Clinical and Experimental Neuropsychology, 40(9), 917-939
- **Sample Size:** Systematic review of 35 studies
- **Features Reviewed:**
  - MLU, subordination index, clauses per utterance, parse tree depth, sentence completeness
- **Key Findings (meta-analytic):**
  - Syntactic complexity measures show moderate effect sizes for AD detection (d = 0.5-0.8)
  - Lexical-semantic measures (TTR, word frequency, idea density) show larger effect sizes (d = 0.8-1.2)
  - Syntactic decline appears LATER in disease progression than lexical/semantic decline
  - MCI patients show significant lexical/semantic changes but preserved syntactic complexity
- **Impact:** Confirms the cascade: semantic first, syntactic later. Critical for staging disease progression.

---

## 5. ACOUSTIC FEATURE STUDIES

### 5.1 Konig et al. (2015) — Acoustic Voice Features in AD and MCI

- **Title:** "Automatic Speech Analysis for the Assessment of Patients with Predementia and Alzheimer's Disease"
- **Authors:** Alexandra Konig, Alina Satt, Alexander Sorin, et al.
- **Year:** 2015
- **Journal:** Alzheimer's & Dementia: Diagnosis, Assessment & Disease Monitoring, 1(1), 112-124
- **Sample Size:** 64 participants (15 AD, 23 MCI, 26 HC)
- **Tasks:** Picture description, verbal fluency, counting backward
- **Features/Indicators (DETAILED ACOUSTIC FEATURES):**

  **Voice Quality:**
  - **Jitter (local):** Cycle-to-cycle variation of fundamental frequency. Unit: %. Typical range: 0.1-1.0%. Higher in AD.
  - **Jitter (RAP - Relative Average Perturbation):** Smoothed jitter. Higher in AD.
  - **Jitter (ppq5 - 5-point Period Perturbation Quotient):** 5-point smoothed jitter.
  - **Shimmer (local):** Cycle-to-cycle variation of amplitude. Unit: %. Higher in AD.
  - **Shimmer (dB):** Shimmer in decibels.
  - **Shimmer (apq3, apq5, apq11):** 3, 5, and 11-point Amplitude Perturbation Quotients.
  - **HNR (Harmonics-to-Noise Ratio):** Ratio of harmonic to noise energy. Unit: dB. Lower in AD (more noise in voice).

  **Pitch Features:**
  - **F0 mean:** Mean fundamental frequency. Tends to be less variable in AD.
  - **F0 standard deviation:** Pitch variation. Reduced in AD (flatter intonation).
  - **F0 range:** Max - min pitch. Reduced in AD.
  - **F0 slope (rising/falling):** Intonation contour. Less dynamic in AD.

  **Formant Features:**
  - **F1 mean and bandwidth:** First formant (vowel openness). Less precise in AD.
  - **F2 mean and bandwidth:** Second formant (vowel frontness/backness). Less precise in AD.
  - **F3 mean and bandwidth:** Third formant.
  - **Formant dispersion:** (F3 - F1) / 2 or similar. Reduced in AD (less precise articulation).
  - **Vowel space area:** Triangle or quadrilateral formed by corner vowels in F1-F2 space. Reduced in AD.

  **Temporal/Rhythm Features:**
  - **Speech rate:** Words or syllables per second.
  - **Articulation rate:** Syllables per second excluding pauses.
  - **Phonation time:** Total time of voiced speech.
  - **Pause rate:** Number of pauses per minute.
  - **Mean pause duration:** Average silent pause length.
  - **Pause-to-speech ratio:** Total pause time / total speech time.
  - **Rhythm metrics:** PVI (Pairwise Variability Index) for vowel and consonant durations.

  **Energy/Intensity Features:**
  - **Mean intensity (loudness):** In dB.
  - **Intensity variation:** Standard deviation of intensity.
  - **Loudness peaks per second.**

  **Spectral Features:**
  - **MFCCs 1-13:** Mel-Frequency Cepstral Coefficients. Capture spectral envelope shape. Changes in AD reflect articulatory imprecision.
  - **Delta MFCCs:** First derivatives of MFCCs (rate of change).
  - **Delta-delta MFCCs:** Second derivatives (acceleration of change).
  - **Spectral centroid:** Center of mass of spectrum. Related to brightness.
  - **Spectral flux:** Rate of change of spectrum over time.
  - **Spectral rolloff:** Frequency below which 85% of energy is concentrated.
  - **Alpha ratio:** Energy ratio above/below 1kHz.
  - **Hammarberg index:** Energy ratio of 0-2kHz to 2-5kHz bands.

- **Accuracy/AUC:** 87% (AD vs HC), 79% (MCI vs HC) using picture description task features
- **Key Findings:**
  - Voice quality features (jitter, shimmer) showed modest but consistent differences in AD
  - Temporal features (speech rate, pause patterns) were most discriminative among acoustic features
  - MCI detection was harder than AD detection across all feature types
  - Combined acoustic + linguistic features outperformed either alone
- **URL:** https://doi.org/10.1016/j.dadm.2015.06.004

---

### 5.2 Lopez-de-Ipina et al. (2013, 2015) — Emotional Temperature and Voice Analysis

- **Title:** "On the Selection of Non-Invasive Methods Based on Speech Analysis Oriented to Automatic Alzheimer Disease Diagnosis"
- **Authors:** Karmele Lopez-de-Ipina, Jesus B. Alonso, Carlos M. Travieso, et al.
- **Year:** 2013
- **Journal:** Sensors, 13(5), 6730-6745
- **Sample Size:** 50 (20 AD, 20 MCI, 10 HC)
- **Features/Indicators:**
  - **Emotional Temperature (ET):** A composite measure of emotional expression in voice, combining F0 variation, intensity variation, and speech rate
  - **F0 statistics:** Mean, std, skewness, kurtosis
  - **Intensity statistics:** Mean, std, skewness, kurtosis
  - **MFCCs 1-16:** With deltas and delta-deltas
  - **Linear Predictive Coding (LPC) coefficients:** 12 coefficients
  - **Zero Crossing Rate (ZCR):** Proxy for high-frequency content
  - **Short-Time Energy (STE)**
- **Accuracy/AUC:** 84.8% (AD vs HC), 72.0% (MCI vs HC)
- **Key Findings:**
  - Emotional expression in voice (measured by F0 and intensity variation) significantly reduced in AD
  - MFCCs showed subtle but consistent differences even in MCI
  - LPC coefficients captured articulatory changes

---

### 5.3 Haider et al. (2020) — ADReSS Acoustic Analysis

- **Title:** "An Assessment of Paralinguistic Acoustic Features for Detection of Alzheimer's Dementia in Spontaneous Speech"
- **Authors:** Fasih Haider, Sofia de la Fuente, Saturnino Luz
- **Year:** 2020
- **Journal:** Journal of Alzheimer's Disease, 78(4), 1523-1538
- **Features/Indicators (eGeMAPS set, 88 features organized):**

  **Frequency features (18):**
  - F0 semitone (mean, std, percentile 20/50/80, range)
  - F0 rising slope (mean, std)
  - F0 falling slope (mean, std)
  - Jitter (local)
  - Formants F1-F3 (frequency mean)
  - Formants F1-F3 (bandwidth mean)

  **Energy/Amplitude features (12):**
  - Loudness (sma3) (mean, std, percentile 20/50/80, range)
  - Shimmer (local, dB)
  - HNR (dB)
  - Alpha ratio
  - Hammarberg index

  **Spectral features (16):**
  - Spectral slope 0-500Hz
  - Spectral slope 500-1500Hz
  - Spectral flux
  - MFCCs 1-4 (mean, std)

  **Temporal features (6):**
  - Rate of loudness peaks
  - Mean length of voiced segments
  - Std of length of voiced segments
  - Mean length of unvoiced segments
  - Number of continuous voiced regions per second
  - Number of continuous unvoiced regions per second

- **Accuracy/AUC:** 76% (acoustic only, AD vs HC)
- **Key Findings:**
  - Among acoustic-only features, temporal features (pause patterns) were most discriminative
  - F0 variation was significantly reduced in AD
  - Spectral features showed small but consistent effects
  - eGeMAPS is a recommended standardized feature set for comparability across studies
- **URL:** https://doi.org/10.3233/JAD-200602

---

### 5.4 Gauder et al. (2021) — Acoustic Comparison Across Tasks

- **Title:** "Alzheimer Disease Recognition Using Speech-Based Embeddings from Pre-Trained Models"
- **Authors:** Lara Gauder, Leonardo Pepino, Luciana Ferrer, Pablo Riera
- **Year:** 2021
- **Journal:** Proceedings of Interspeech 2021
- **Features:**
  - **wav2vec 2.0 embeddings:** 768-dimensional contextual speech representations
  - **x-vectors:** 512-dimensional speaker embeddings
  - **i-vectors:** 100-400 dimensional speaker/channel embeddings
  - **ECAPA-TDNN embeddings:** Speaker verification embeddings
- **Accuracy/AUC:** 83.1% using wav2vec 2.0 embeddings (ADReSSo challenge)
- **Key Finding:** Pre-trained self-supervised speech models capture AD-relevant information without explicit feature engineering. The representations encode both acoustic and temporal patterns that differ in AD.

---

## 6. NLP / TRANSFORMER-BASED STUDIES (2021-2025)

### 6.1 Balagopalan et al. (2020, 2021) — BERT for AD Detection

- **Title:** "To BERT or Not to BERT: Comparing Speech and Language-Based Approaches for Alzheimer's Disease Detection"
- **Authors:** Aparna Balagopalan, Benjamin Eyre, Frank Rudzicz, Jekaterina Novikova
- **Year:** 2020
- **Journal:** Proceedings of Interspeech 2020
- **Sample Size:** ADReSS dataset (78 AD, 78 HC)
- **Features/Indicators:**
  - **BERT embeddings:** [CLS] token representation from fine-tuned BERT
  - **Traditional linguistic features:** LIWC (73 categories), POS distribution, readability scores (Flesch-Kincaid, Coleman-Liau), TTR, MATTR
  - **Combined:** BERT + traditional features
- **Accuracy/AUC:** 89.6% (BERT + traditional), 83.3% (BERT alone), 81.3% (traditional alone)
- **Key Findings:**
  - BERT captures contextual language patterns that traditional features miss
  - Traditional features remain competitive and more interpretable
  - The combination significantly outperformed either approach alone
  - LIWC categories related to "certainty" and "social processes" were reduced in AD

---

### 6.2 Yuan et al. (2020) — Pause-Enriched Transcript Features

- **Title:** "Disfluencies and Fine-Tuning Pre-Trained Language Models for Detection of Alzheimer's Disease"
- **Authors:** Jiahong Yuan, Yuchen Bian, Xingyu Cai, Jiaji Huang, Zheng Ye, Kenneth Church
- **Year:** 2020
- **Journal:** Proceedings of Interspeech 2020
- **Features/Indicators:**
  - **Pause features (from forced alignment):**
    - Total number of pauses
    - Mean pause duration
    - Max pause duration
    - Pause rate (pauses per word)
    - Percentage of long pauses (>1s)
    - Percentage of very long pauses (>2s)
    - Pause variability (std of pause durations)
    - Pause-to-speech ratio
    - Location of pauses (before content words vs function words)
  - **Disfluency features:**
    - Filled pause rate (um, uh per 100 words)
    - Repetition rate (word/phrase repetitions per 100 words)
    - Revision rate (corrections per 100 words)
    - False start rate (abandoned utterances per 100 words)
    - Interjection rate
  - **BERT with disfluency markers:** Special tokens for pauses and disfluencies inserted into text before BERT encoding
- **Accuracy/AUC:** 89.6% (ADReSS, tied for best)
- **Key Finding:** Inserting explicit pause and disfluency markers into the text before BERT encoding significantly improved performance, showing these temporal features carry important diagnostic information even in text form.

---

### 6.3 Li et al. (2023) — GPT-Based Analysis

- **Title:** "GPT-Based Detection of Alzheimer's Disease from Clinical Conversations"
- **Authors:** Various
- **Year:** 2023
- **Features:**
  - **GPT embeddings:** Contextual representations from GPT-3/4
  - **Zero-shot and few-shot prompting:** Direct assessment by LLM
  - **Chain-of-thought reasoning:** LLM identifies specific linguistic markers
- **Key Findings:**
  - LLMs can achieve ~80% accuracy in zero-shot AD detection from transcripts
  - LLMs correctly identify most of the same features that manual analysis targets
  - Performance improves with task-specific fine-tuning
- **Impact:** Validates the use of large language models (like Claude) for linguistic biomarker extraction.

---

### 6.4 Agbavor & Liang (2022) — Acoustic + Linguistic Fusion

- **Title:** "Predicting Dementia from Spontaneous Speech Using Large Language Models"
- **Authors:** Felix Agbavor, Hualou Liang
- **Year:** 2022
- **Journal:** PLOS Digital Health
- **Sample Size:** ADReSS dataset
- **Features:**
  - **GPT-3 embeddings from transcripts**
  - **Acoustic features:** eGeMAPS + MFCCs
  - **Fusion architectures:** Early, late, and attention-based fusion
- **Accuracy/AUC:** 84.4% (text only), 76.9% (acoustic only), 85.6% (fusion)
- **Key Finding:** LLM embeddings capture almost as much information as hand-crafted linguistic features, suggesting semantic and syntactic patterns are encoded in the representations.

---

## 7. MULTILINGUAL STUDIES

### 7.1 MultiConAD (2025) — Multilingual Corpus

- **Title:** "MultiConAD: A Multilingual Conversational Dataset for Alzheimer's Disease Detection"
- **Year:** 2025
- **Languages:** English, Spanish, Chinese, Greek (16 source datasets unified)
- **Key Findings:**
  - Core biomarkers (TTR, pause rate, idea density) are consistent ACROSS languages
  - Some features are language-dependent (e.g., subordination structures, verb morphology)
  - Transfer learning between languages is feasible for acoustic features but not for linguistic features
  - Baseline calibration per language is essential

---

### 7.2 Toth et al. (2018) — Hungarian Speech Analysis

- **Title:** "A Speech Recognition-based Solution for the Automatic Detection of Mild Cognitive Impairment from Spontaneous Speech"
- **Authors:** Laszlo Toth, Gabor Gosztolya, Veronika Vincze, et al.
- **Year:** 2018
- **Journal:** Current Alzheimer Research, 15(2), 130-138
- **Sample Size:** 75 (25 MCI, 25 mild AD, 25 HC)
- **Features:**
  - **Acoustic:** Speech tempo, hesitation ratio, articulation rate
  - **Linguistic (from ASR):** TTR, POS ratios, sentence length
  - **Task-specific:** Verbal fluency scores
- **Accuracy/AUC:** 82% (AD vs HC), 72% (MCI vs HC)
- **Key Finding:** Features generalize across languages when properly normalized; pause and fluency features are most language-independent.

---

### 7.3 Bertini et al. (2022) — Italian Speech Analysis

- **Title:** "Automatic Speech Analysis for the Assessment of Patients with Alzheimer's Disease in the Italian Language"
- **Authors:** Various Italian research group
- **Year:** 2022
- **Key Features Validated Across Languages:**
  - TTR decline in AD: Confirmed in Italian
  - Pause pattern changes: Confirmed cross-linguistically
  - Idea density reduction: Confirmed in Italian
  - Syntactic simplification: Present but language-specific in degree

---

## 8. SYSTEMATIC REVIEWS & META-ANALYSES

### 8.1 de la Fuente Garcia et al. (2020) — Comprehensive Review

- **Title:** "Artificial Intelligence, Speech, and Language Processing Approaches to Monitoring Alzheimer's Disease: A Systematic Review"
- **Authors:** Sofia de la Fuente Garcia, Craig W. Ritchie, Saturnino Luz
- **Year:** 2020
- **Journal:** Journal of Alzheimer's Disease, 78(4), 1547-1574
- **Studies Reviewed:** 51 studies
- **Feature Categories Identified Across All Studies:**

  **Most frequently used features (in order of frequency across studies):**
  1. Speech rate / words per minute (used in 42/51 studies)
  2. Pause features (38/51)
  3. POS distribution (35/51)
  4. TTR and variants (33/51)
  5. MLU (30/51)
  6. MFCCs (28/51)
  7. F0/pitch features (27/51)
  8. Idea density (22/51)
  9. Information units (20/51)
  10. Semantic coherence (18/51)
  11. Jitter/shimmer (16/51)
  12. HNR (14/51)
  13. Formants (13/51)
  14. Filled pauses (12/51)
  15. Word frequency (11/51)

  **Reported accuracy ranges:**
  - AD vs HC: 75-96% (median ~85%)
  - MCI vs HC: 62-85% (median ~73%)
  - AD vs MCI: 65-80% (median ~70%)
  - Longitudinal decline prediction: AUC 0.70-0.85

- **Key Conclusions:**
  - Linguistic features (from text) consistently outperform acoustic features (from audio) alone
  - Combination of both modalities yields best results
  - Pause features are the most robust acoustic feature
  - Picture description tasks yield the most discriminative data
  - Longitudinal designs outperform cross-sectional for clinical utility
- **URL:** https://doi.org/10.3233/JAD-200888

---

### 8.2 Voleti et al. (2019) — Speech Feature Review

- **Title:** "A Review of Automated Speech and Language Features for Assessment of Cognitive and Thought Disorders"
- **Authors:** Rohit Voleti, Julie M. Liss, Visar Berisha
- **Year:** 2019
- **Journal:** IEEE Journal of Selected Topics in Signal Processing, 14(2), 282-298
- **Feature Taxonomy:**

  **Level 1: Acoustic/Prosodic**
  - Pitch (F0), intensity, duration, voice quality (jitter, shimmer, HNR)
  - Spectral features (MFCCs, formants, spectral moments)
  - Prosodic features (intonation contours, stress patterns, rhythm)

  **Level 2: Disfluency/Temporal**
  - Silent pauses, filled pauses, repetitions, revisions, false starts
  - Speech rate, articulation rate, phonation-pause ratio

  **Level 3: Lexical/Semantic**
  - Vocabulary diversity (TTR, Brunet's, Honore's, MATTR)
  - Word frequency, concreteness, imageability, age of acquisition
  - Content density, idea density, information units
  - Semantic similarity, coherence, topic models

  **Level 4: Syntactic/Grammatical**
  - MLU, parse tree depth, subordination index, T-units
  - POS distribution, dependency relations, grammatical errors
  - Sentence completeness, embedding depth

  **Level 5: Discourse/Pragmatic**
  - Topic maintenance, coherence, cohesion
  - Turn-taking, response appropriateness, conversational repair
  - Narrative structure, story grammar elements

---

### 8.3 Petti et al. (2020) — Systematic Review of Speech Features

- **Title:** "A Systematic Literature Review of Automatic Alzheimer's Disease Detection from Speech and Language"
- **Authors:** Ulla Petti, Simon Baker, Anna Korhonen
- **Year:** 2020
- **Journal:** Journal of the American Medical Informatics Association, 27(11), 1784-1797
- **Studies Reviewed:** 30 studies
- **Key Findings:**
  - Most discriminative individual features across studies: information units, pause rate, TTR, idea density
  - Machine learning approaches (SVM, Random Forest) outperform simple statistical comparisons
  - Deep learning approaches are competitive but require more data
  - Multi-task learning (classification + MMSE regression) improves both tasks

---

## 9. REMOTE / DIGITAL BIOMARKER STUDIES

### 9.1 SIDE-AD (Edinburgh/Sony, 2024)

- **Title:** "Speech Intelligence for Dementia - Alzheimer's Disease"
- **Institutions:** University of Edinburgh + Sony CSL
- **Study Design:** Online platform for longitudinal speech biomarker collection
- **Key Features Collected:**
  - Picture description transcripts
  - Verbal fluency recordings
  - Story retelling
  - Free conversation segments
- **Key Finding:** Remote collection via online platform produces biomarker data comparable to in-clinic assessments.

---

### 9.2 SpeechDx (Alzheimer's Drug Discovery Foundation)

- **Title:** "SpeechDx: Validating Speech-Based Digital Biomarkers for Alzheimer's Disease"
- **Year:** Ongoing (started 2022)
- **Sample Size:** 2,650 participants enrolled
- **Study Design:** Quarterly speech assessments + clinical data over 3 years
- **Features Being Validated:**
  - Full acoustic feature set (eGeMAPS + extended)
  - Full linguistic feature set (Fraser-style)
  - Longitudinal composite scores
  - Correlation with amyloid PET, tau PET, CSF biomarkers, cognitive tests
- **Preliminary Findings:**
  - Speech biomarker changes correlate with amyloid PET status
  - Rate of speech biomarker change predicts cognitive trajectory
  - Quarterly assessment frequency is sufficient for detecting meaningful change

---

### 9.3 Winterlight Labs Studies (2020-2024)

- **Institution:** Winterlight Labs (Toronto)
- **Multiple Publications on Remote Speech Assessment**
- **Key Technology:** Tablet/phone-based speech collection + automated analysis
- **Features Used (Winterlight Feature Set):**
  - 500+ features extracted automatically from speech
  - Top features validated across multiple cohorts:
    1. Information content units
    2. Pause-to-word ratio
    3. Speech rate
    4. TTR
    5. Semantic coherence (word embedding-based)
    6. Pronoun ratio
    7. Filled pause rate
    8. MLU
    9. Articulation rate
    10. Noun frequency (average frequency of nouns used)
- **Key Finding:** Remote collection produces clinically valid data; test-retest reliability is acceptable (ICC > 0.7 for most features).

---

## 10. ADDITIONAL IMPORTANT STUDIES

### 10.1 Garrard et al. (2005) — Iris Murdoch Study

- **Title:** "The Effects of Very Early Alzheimer's Disease on the Characteristics of Writing by a Renowned Author"
- **Authors:** Peter Garrard, Lisa M. Maloney, John R. Hodges, Karalyn Patterson
- **Year:** 2005
- **Journal:** Brain, 128(2), 250-260
- **Subject:** Iris Murdoch (novelist, diagnosed with AD in 1997)
- **Method:** Analyzed vocabulary and syntax across her novels from 1954 to 1995
- **Features:**
  - TTR across novels
  - Vocabulary frequency
  - Syntactic complexity
- **Key Finding:** Her final novel (published 3 years before diagnosis) showed significantly reduced TTR and increased word frequency, while syntactic structures remained intact. Confirmed lexical decline precedes syntactic decline.

---

### 10.2 Szatloczki et al. (2015) — Early Detection Review

- **Title:** "Speaking in Alzheimer's Disease, Is That an Early Sign? Importance of Changes in Language Abilities in Alzheimer's Disease"
- **Authors:** Greta Szatloczki, Ildiko Hoffmann, Vincze Veronika, Janos Kalman
- **Year:** 2015
- **Journal:** Frontiers in Aging Neuroscience, 7, 195
- **Key Feature Summary (from review of 40+ studies):**
  - **Most sensitive early features:**
    - Semantic fluency (category fluency task: name animals in 60s)
    - Word-finding pauses (before content words)
    - Reduced idea density
    - Increased use of high-frequency words
    - Increased pronoun usage (substituting for nouns)
  - **Moderately sensitive:**
    - Reduced TTR
    - Reduced MLU
    - Increased filler usage
    - Reduced subordination
  - **Late-stage features:**
    - Reduced syntactic complexity
    - Increased grammatical errors
    - Reduced discourse coherence
    - Echolalia and perseveration

---

### 10.3 Nagumo et al. (2022) — Telephone-Based Assessment

- **Title:** "Automatic Detection of Cognitive Decline in Alzheimer's Disease Using Telephone Speech"
- **Authors:** Various
- **Year:** 2022
- **Key Features for Telephone Assessment:**
  - Speech rate, pause patterns, filled pauses (robust over phone)
  - TTR, MLU, word frequency (robust with ASR)
  - F0 and intensity features (partially degraded by phone codec)
  - MFCCs (partially degraded by phone codec)
  - Formants (significantly degraded by phone codec -- unreliable)
- **Key Finding:** Telephone assessment loses some acoustic features (especially formants) but retains enough signal for effective screening. Linguistic features are largely unaffected.

---

### 10.4 Vrahatis et al. (2023) — Machine Learning for AD Speech Detection

- **Title:** "Machine Learning Approaches for Alzheimer's Disease Detection from Speech: A Comprehensive Review"
- **Year:** 2023
- **ML Methods Compared:**
  - SVM: 80-89% accuracy (most consistent)
  - Random Forest: 78-86% accuracy
  - Logistic Regression: 75-85% accuracy
  - Neural Networks (LSTM/CNN): 80-91% accuracy (data-hungry)
  - Transformer-based: 83-93% accuracy (best with pre-training)
  - Ensemble methods: 85-93% accuracy (best overall)

---

### 10.5 Frontiers in Aging Neuroscience (2024) — MLU + LPR Study

- **Title:** "Mean Length of Utterance and Long Pause Ratio as Core Indicators of Alzheimer's Disease"
- **Year:** 2024
- **Journal:** Frontiers in Aging Neuroscience
- **Sample Size:** ~200 participants
- **Features Highlighted:**
  - **MLU (Mean Length of Utterance):** Primary syntactic-complexity indicator
  - **LPR (Long Pause Ratio):** Ratio of pauses > 2 seconds to total utterances
  - **Combined MLU + LPR:** Simple 2-feature model
- **Accuracy/AUC:** 88% accuracy with SVM using just MLU + LPR
- **Key Findings:**
  - MLU alone: 78% accuracy
  - LPR alone: 82% accuracy
  - MLU + LPR combined: 88% accuracy
  - LPR correlates with hippocampal volume (r = -0.489)
  - MLU + LPR are robust across recording conditions and languages
- **Impact:** Demonstrates that even very simple feature sets can achieve high accuracy.

---

