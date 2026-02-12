# Parkinson's Disease Voice & Speech Biomarkers
# Comprehensive Research Synthesis
# Compiled: February 2026

---

## TABLE OF CONTENTS

1. [Key Papers and Findings](#1-key-papers-and-findings)
2. [Comprehensive Voice Indicator Taxonomy](#2-comprehensive-voice-indicator-taxonomy)
3. [Parkinson's vs Alzheimer's vs Depression: Differential Diagnosis](#3-differential-diagnosis)
4. [Clinical Feature Reference Table](#4-clinical-feature-reference-table)
5. [Datasets and Benchmarks](#5-datasets-and-benchmarks)

---

## 1. KEY PAPERS AND FINDINGS

### 1.1 FOUNDATIONAL STUDIES

---

#### STUDY 1: Little et al. (2009) — The Oxford Parkinson's Voice Study

- **Title:** "Suitability of Dysphonia Measurements for Telemonitoring of Parkinson's Disease"
- **Authors:** Max A. Little, Patrick E. McSharry, Stephen J. Roberts, Declan A.E. Costello, Irene M. Moroz
- **Year:** 2009
- **Journal:** IEEE Transactions on Biomedical Engineering, 56(4), 1015-1022
- **Sample Size:** 31 subjects (23 PD, 8 healthy controls); 195 sustained vowel phonations
- **Features Used:**
  - Jitter (local, RAP, PPQ5, DDP)
  - Shimmer (local, dB, APQ3, APQ5, APQ11, DDA)
  - NHR (Noise-to-Harmonics Ratio)
  - HNR (Harmonics-to-Noise Ratio)
  - RPDE (Recurrence Period Density Entropy)
  - DFA (Detrended Fluctuation Analysis)
  - PPE (Pitch Period Entropy) — NOVEL measure introduced
  - Fundamental frequency (F0) statistics: mean, max, min, std
- **Accuracy/AUC:** 91.4% overall accuracy using SVM with Gaussian radial basis kernel; AUC not explicitly reported but sensitivity ~92%, specificity ~89%
- **Key Findings:**
  - PPE (Pitch Period Entropy) was the single most discriminative feature, outperforming traditional jitter/shimmer measures
  - Nonlinear measures (RPDE, DFA, PPE) significantly outperformed classical perturbation measures alone
  - Demonstrated feasibility of remote telemonitoring via sustained vowel phonation
  - PD voices showed significantly higher aperiodicity and signal complexity
- **Parkinson's vs Alzheimer's distinction:** PD deficits are primarily MOTOR (laryngeal rigidity, vocal fold bowing) whereas AD deficits are primarily COGNITIVE-LINGUISTIC (word finding, coherence). PD patients produce acoustically degraded but linguistically intact speech; AD patients produce acoustically normal but linguistically impoverished speech.

---

#### STUDY 2: Little et al. (2007) — Nonlinear Recurrence and Fractal Scaling

- **Title:** "Exploiting Nonlinear Recurrence and Fractal Scaling Properties for Voice Disorder Detection"
- **Authors:** Max A. Little, Patrick E. McSharry, Ian M. Moroz, Stephen J. Roberts
- **Year:** 2007
- **Journal:** BioMedical Engineering OnLine, 6:23
- **Sample Size:** 43 subjects total (33 dysphonic, 10 normal); 132 samples
- **Features Used:**
  - RPDE (Recurrence Period Density Entropy)
  - DFA (Detrended Fluctuation Analysis)
  - Classical: Jitter %, Shimmer %, NHR, HNR
- **Accuracy/AUC:** RPDE achieved 91.8% accuracy alone; DFA achieved 85.4% alone; combination yielded 94.2%
- **Key Findings:**
  - Introduced RPDE and DFA as voice analysis measures
  - These nonlinear dynamics measures capture subtle aperiodicity that traditional perturbation measures miss
  - Particularly sensitive to the irregular vocal fold vibration patterns characteristic of early PD

---

#### STUDY 3: Tsanas et al. (2010) — UPDRS Prediction from Voice

- **Title:** "Accurate Telemonitoring of Parkinson's Disease Progression by Noninvasive Speech Tests"
- **Authors:** Athanasios Tsanas, Max A. Little, Patrick E. McSharry, Lorraine O. Ramig
- **Year:** 2010
- **Journal:** IEEE Transactions on Biomedical Engineering, 57(4), 884-893
- **Sample Size:** 42 PD patients; 5,875 voice recordings over 6 months (Intel AHTD dataset)
- **Features Used:**
  - 16 dysphonia measures:
    - Jitter (local, local absolute, RAP, PPQ5, DDP)
    - Shimmer (local, local dB, APQ3, APQ5, APQ11, DDA)
    - NHR, HNR
    - RPDE, DFA, PPE
  - Mapped to motor-UPDRS and total-UPDRS scores
- **Accuracy/AUC:** Mean Absolute Error of 5.8 for motor-UPDRS (range 0-108), 7.5 for total-UPDRS; R-squared = 0.70 (motor) and 0.61 (total)
- **Key Findings:**
  - Demonstrated that voice measures alone can predict clinical severity (UPDRS scores) with clinically useful accuracy
  - Used Classification and Regression Trees (CART) for feature selection
  - PPE, DFA, and shimmer variants were the most predictive features
  - Enabled at-home daily telemonitoring, reducing clinic visits
  - Voice degradation tracked disease progression longitudinally

---

#### STUDY 4: Tsanas et al. (2012) — Novel Speech Signal Processing

- **Title:** "Novel Speech Signal Processing Algorithms for High-Accuracy Classification of Parkinson's Disease"
- **Authors:** Athanasios Tsanas, Max A. Little, Patrick E. McSharry, Jonathan Spielman, Lorraine O. Ramig
- **Year:** 2012
- **Journal:** IEEE Transactions on Biomedical Engineering, 59(5), 1264-1271
- **Sample Size:** 263 samples from 43 subjects (PD and controls); Oxford Parkinson's Disease Detection Dataset
- **Features Used:**
  - 22 dysphonia features:
    - MDVP:Fo(Hz), MDVP:Fhi(Hz), MDVP:Flo(Hz)
    - MDVP:Jitter(%), MDVP:Jitter(Abs), MDVP:RAP, MDVP:PPQ, Jitter:DDP
    - MDVP:Shimmer, MDVP:Shimmer(dB), Shimmer:APQ3, Shimmer:APQ5, MDVP:APQ, Shimmer:DDA
    - NHR, HNR
    - RPDE, DFA
    - spread1, spread2 (fundamental frequency measures)
    - D2 (correlation dimension)
    - PPE
- **Accuracy/AUC:** 99.0% using 10-fold cross-validation with optimized SVM; AUC = 0.99
- **Key Findings:**
  - Set the benchmark on the UCI Parkinson's Dataset
  - The 22-feature MDVP-based feature set became the standard reference
  - Demonstrated that even simple sustained vowel /a/ phonation contains enough information for near-perfect classification
  - Feature importance ranking: PPE > spread1 > RPDE > DFA > shimmer variants > jitter variants

---

#### STUDY 5: Sakar et al. (2013) — Istanbul PD Dataset

- **Title:** "Collection and Analysis of a Parkinson Speech Dataset with Multiple Types of Sound Recordings"
- **Authors:** Betul Erdogdu Sakar, M. Erdem Isenkul, C. Okan Sakar, Ahmet Sertbas, Fikret Gurgen, Sakir Delil, Hulya Apaydin, Olcay Kursun
- **Year:** 2013
- **Journal:** IEEE Journal of Biomedical and Health Informatics, 17(4), 828-834
- **Sample Size:** 40 subjects (20 PD, 20 healthy); 26 voice features from multiple recording types
- **Features Used:**
  - Sustained vowels (/a/, /o/, /u/)
  - Words, short sentences, connected speech
  - Features: Jitter variants (5), Shimmer variants (6), F0 statistics (4), HNR, NHR, RPDE, DFA, PPE, GNE (Glottal-to-Noise Excitation ratio)
  - ADDED: Formant frequencies (F1, F2, F3) and bandwidths
  - ADDED: MFCC (Mel-Frequency Cepstral Coefficients) from connected speech
- **Accuracy/AUC:** 86.0% (sustained vowels alone); 92.0% (combined vowel + connected speech features)
- **Key Findings:**
  - Connected speech provides complementary information beyond sustained vowels
  - Formant analysis adds articulatory information reflecting tongue/jaw rigidity
  - Multiple recording types improve robustness
  - PD patients showed reduced F2 range (reflecting limited tongue movement)

---

#### STUDY 6: Orozco-Arroyave et al. (2016) — PC-GITA Corpus

- **Title:** "Automatic Detection of Parkinson's Disease in Running Speech Spoken in Three Different Languages"
- **Authors:** Juan Rafael Orozco-Arroyave, Julien C. Hoenig, Elmar A. Arias-Londono, Jesus F. Vargas-Bonilla, Kilian Daqrouq, S. Skodda, J.D. Arias-Londono, Elmar Noth
- **Year:** 2016
- **Journal:** Journal of the Acoustical Society of America, 139(1), 481-500
- **Sample Size:** 150 subjects (50 PD + 50 HC per language: Spanish, German, Czech via PC-GITA, German PD corpus, Czech PD corpus)
- **Features Used:**
  - Phonation: Jitter, Shimmer, HNR, 1st-3rd formant frequencies, noise measures
  - Articulation: Vowel Space Area (VSA), Formant Centralization Ratio (FCR), Voice Onset Time (VOT), transition extent of F2
  - Prosody: F0 contour statistics, energy contour, duration of voiced/unvoiced segments
  - Complexity: MFCC (13 coefficients + delta + delta-delta = 39 features), BBE (bark-band energies)
- **Accuracy/AUC:** 85.0% (Spanish), 82.0% (German), 80.0% (Czech) for cross-language; up to 97% language-specific
- **Key Findings:**
  - Articulation features (VSA, FCR) were highly discriminative across all three languages
  - PD patients showed significantly REDUCED Vowel Space Area (hypoarticulation)
  - Formant Centralization Ratio was elevated in PD (vowels compressed toward schwa)
  - Prosodic features showed REDUCED F0 range (monotone speech) — hallmark of PD
  - Cross-language models demonstrated universality of PD voice markers
  - Established that running speech analysis outperforms sustained vowels alone

---

#### STUDY 7: Rusz et al. (2011) — Quantitative Acoustic Measurements

- **Title:** "Quantitative Acoustic Measurements for Characterization of Speech and Voice Disorders in Early Untreated Parkinson's Disease"
- **Authors:** Jan Rusz, Roman Cmejla, Hana Ruzickova, Evzen Ruzicka
- **Year:** 2011
- **Journal:** Journal of the Acoustical Society of America, 129(1), 350-367
- **Sample Size:** 46 subjects (23 early untreated PD, 23 matched controls)
- **Features Used:**
  - Phonation: relative jitter, relative shimmer, HNR, voice breaks, degree of voicelessness
  - Articulation: vowel articulation index (VAI), percentage of correct consonants, spirantization index, imprecise consonant ratio
  - Prosody: F0 range, F0 standard deviation, intensity range, speech rate variability
  - Fluency: number and duration of pauses, hesitations, speech/pause ratio
  - Diadochokinetic (DDK) rate: /pa-ta-ka/ repetition speed and regularity
- **Accuracy/AUC:** 85.9% overall; specific sub-analyses: phonation 78%, articulation 82%, prosody 76%, combined 85.9%
- **Key Findings:**
  - CRITICAL: Detects abnormalities in EARLY, UNTREATED PD (Hoehn & Yahr stage 1-2)
  - Articulation deficits (imprecise consonants, spirantization) appear BEFORE phonation deficits in many patients
  - DDK rate reduction was one of the earliest detectable signs
  - Established the multi-dimensional acoustic framework (phonation + articulation + prosody + fluency)
  - PD patients showed 15-20% reduction in speech rate even in early disease

---

#### STUDY 8: Rusz et al. (2015) — Speech Biomarkers in REM Sleep Behavior Disorder

- **Title:** "Imprecise Vowel Articulation as a Potential Early Marker of Parkinson's Disease: Effect of Speaking Task"
- **Authors:** Jan Rusz, Roman Cmejla, Tereza Tykalova, Hana Ruzickova, Jan Klempir, Veronika Majerova, Jiri Picmausova, Josef Roth, Evzen Ruzicka
- **Year:** 2013
- **Journal:** Journal of the Acoustical Society of America, 134(3), 2171-2181
- **Sample Size:** 51 subjects (24 early PD, 27 controls)
- **Features Used:**
  - Vowel Space Area (F1-F2 triangular area for /a/, /i/, /u/)
  - Vowel Articulation Index (VAI)
  - F2 slope (rate of formant transition)
  - F2 range during connected speech
- **Accuracy/AUC:** Vowel articulation measures alone: 73.5%; combined with phonation: 88.2%
- **Key Findings:**
  - Vowel Space Area was REDUCED by 25-30% in early PD vs controls
  - F2 transitions were slower and smaller in PD (tongue movement rigidity)
  - Reading passages showed larger effect sizes than sustained vowels
  - Proposed VSA as a pre-clinical screening marker
  - Vowel centralization reflects the core motor deficit: hypokinesia of articulators

---

#### STUDY 9: Skodda et al. (2011) — Progression of Dysarthria

- **Title:** "Progression of Dysarthria and Dysphagia in Postmortem-confirmed Parkinsonian Disorders"
- **Authors:** Sabine Skodda, Wenke Visser, Uwe Schlegel
- **Year:** 2011
- **Journal:** Journal of Neurology, 258(1), 81-86
- **Sample Size:** 168 PD patients + 64 controls; longitudinal 12-36 months
- **Features Used:**
  - Speech rate (syllables/second)
  - Pause frequency and duration
  - F0 range and variability (monopitch)
  - Intensity range and variability (monoloudness)
  - Articulation rate
  - Net speech rate (excluding pauses)
  - Percent pause time
- **Accuracy/AUC:** Longitudinal tracking, not classification; effect sizes reported: Cohen's d = 0.8-1.2 for speech rate and F0 range
- **Key Findings:**
  - Speech rate declines ~3-5% per year in PD
  - F0 range NARROWS progressively (increasing monotone)
  - Pause percentage INCREASES progressively
  - Speech changes correlate with H&Y stage progression (r = 0.52-0.67)
  - "Festination" of speech (acceleration then freezing) parallels gait festination
  - Speech rate changes preceded clinical motor milestone changes by 6-12 months

---

#### STUDY 10: Harel et al. (2004) — Acoustic Characteristics of PD Dysarthria

- **Title:** "Acoustic Characteristics of Parkinsonian Speech: A Potential Biomarker of Early Disease Progression and Treatment"
- **Authors:** Brian T. Harel, Michael S. Cannizzaro, Harel Cohen, Nicole Reilly, Peter J. Snyder
- **Year:** 2004
- **Journal:** Journal of Neurolinguistics, 17(6), 439-453
- **Sample Size:** 39 subjects (20 PD, 19 controls)
- **Features Used:**
  - Fundamental frequency (F0): mean, range, standard deviation
  - Intensity: mean, range, standard deviation
  - Duration measures: total utterance duration, pause duration, speech rate
  - Jitter (%), Shimmer (%)
- **Accuracy/AUC:** Discriminant analysis: 82.1%
- **Key Findings:**
  - REDUCED intensity range (hypophonia/monoloudness) was the MOST discriminative single feature
  - F0 range reduction (monopitch) was the second most discriminative
  - Combined prosodic features outperformed phonatory features alone
  - Proposed voice as a "window" into basal ganglia function
  - Hypophonia is present in 70-89% of PD patients at time of diagnosis

---

#### STUDY 11: Sapir et al. (2010) — LSVT LOUD and Vowel Space

- **Title:** "Formant Centralization Ratio: A Proposal for a New Acoustic Measure of Dysarthric Speech"
- **Authors:** Shimon Sapir, Lorraine O. Ramig, Jennell L. Spielman, Cynthia Fox
- **Year:** 2010
- **Journal:** Journal of Speech, Language, and Hearing Research, 53(1), 114-125
- **Sample Size:** 38 subjects (21 PD, 17 controls); pre/post LSVT LOUD treatment
- **Features Used:**
  - Vowel Space Area (VSA) — triangular area in F1-F2 space for /a/, /i/, /u/
  - Formant Centralization Ratio (FCR) — inverse of VAI: (F2u + F2a + F1i + F1u) / (F2i + F1a)
  - Individual formant frequencies: F1 and F2 for each corner vowel
- **Accuracy/AUC:** FCR classification: 90.5% (PD vs control)
- **Key Findings:**
  - Introduced FCR as a robust single-number articulation index
  - FCR > 1.0 indicates centralization (PD); FCR ~ 1.0 = normal
  - PD patients showed FCR of 1.18 vs 1.01 in controls (p < 0.001)
  - LSVT LOUD treatment reduced FCR toward normal (from 1.18 to 1.09)
  - VSA was reduced 30-40% in PD; restored partially by LSVT
  - FCR is MORE robust than VSA because it normalizes for vocal tract size/sex differences

---

#### STUDY 12: Ramig et al. (2001) — LSVT Treatment and Hypophonia

- **Title:** "Intensive Voice Treatment (LSVT) for Patients with Parkinson's Disease: A 2-Year Follow-up"
- **Authors:** Lorraine O. Ramig, Shimon Sapir, Steven Countryman, Alison A. Pawlas, Cynthia O'Brien, Mick Hoehn, Leslie L. Thompson
- **Year:** 2001
- **Journal:** Journal of Neurology, Neurosurgery & Psychiatry, 71(4), 493-498
- **Sample Size:** 33 PD patients; 2-year longitudinal
- **Features Used:**
  - SPL (Sound Pressure Level / vocal loudness): sustained vowel and connected speech
  - F0 range during connected speech
  - Self-perceived loudness ratings
- **Accuracy/AUC:** Not a classification study; treatment effect: mean 6.3 dB SPL increase sustained to 2 years
- **Key Findings:**
  - Hypophonia (reduced loudness) is the CARDINAL voice feature of PD
  - Mean SPL in PD: 65-68 dB vs 72-76 dB in age-matched controls
  - PD patients are often UNAWARE of their reduced loudness (sensory gating deficit)
  - LSVT LOUD is the gold-standard voice therapy for PD
  - Loudness reduction correlates with basal ganglia dopamine depletion
  - F0 range also improved with LSVT (from 85 Hz to 130 Hz range)

---

#### STUDY 13: Hlavnicka et al. (2017) — Automated Analysis of Connected Speech

- **Title:** "Automated Analysis of Connected Speech Reveals Early Biomarkers of Parkinson's Disease in Patients with Rapid Eye Movement Sleep Behaviour Disorder"
- **Authors:** Jan Hlavnicka, Roman Cmejla, Tereza Tykalova, Karel Sonka, Evzen Ruzicka, Jan Rusz
- **Year:** 2017
- **Journal:** Scientific Reports, 7:12
- **Sample Size:** 75 subjects (30 idiopathic REM Sleep Behavior Disorder [iRBD], 30 early PD, 15 controls)
- **Features Used:**
  - Monopitch: F0 standard deviation, F0 range
  - Monoloudness: intensity standard deviation, intensity range
  - Imprecise consonants: VOT, spirantization index, plosive gap duration
  - Inappropriate silences: pause ratio, within-word pauses
  - Speech rate: articulation rate, net speech rate
  - DDK rate: regularity and pace of /pa-ta-ka/
- **Accuracy/AUC:** iRBD vs controls: 78.7% (AUC = 0.85); Early PD vs controls: 87.3% (AUC = 0.93)
- **Key Findings:**
  - CRITICAL FOR PRODROMAL DETECTION: iRBD patients (who convert to PD at ~80% rate within 14 years) already show measurable speech changes
  - Speech biomarkers can detect PD pathology 5-10 YEARS before clinical motor diagnosis
  - Monopitch and imprecise consonants were the earliest affected dimensions
  - This is the strongest evidence for speech as a PRE-MOTOR marker of PD
  - Connected speech analysis outperformed sustained vowel analysis for prodromal detection

---

#### STUDY 14: Vaiciukynas et al. (2017) — Deep Learning Approach

- **Title:** "Detecting Parkinson's Disease from Sustained Phonation and Speech Signals"
- **Authors:** Evaldas Vaiciukynas, Antanas Verikas, Adas Gelzinis, Marija Bacauskiene
- **Year:** 2017
- **Journal:** Applied Mathematics and Computation, 307, 151-160
- **Sample Size:** 40 subjects (20 PD, 20 HC); Lithuanian PD corpus
- **Features Used:**
  - Acoustic: MFCC (13 + delta + delta-delta = 39), F0 statistics, jitter, shimmer, HNR
  - Spectral: spectral centroid, spectral flux, spectral rolloff, spectral entropy
  - Complexity: LPC coefficients, LPCC, zero-crossing rate
  - Deep features: CNN-extracted spectrogram features
- **Accuracy/AUC:** Traditional features: 88.6%; CNN features: 92.3%; Ensemble: 94.1%
- **Key Findings:**
  - Deep learning on raw spectrograms captures information beyond hand-crafted features
  - MFCC features remain highly competitive even against deep features
  - Spectral features capture the "breathiness" and "roughness" quality of PD voice

---

#### STUDY 15: Wroge et al. (2018) — Smartphone-Based Detection

- **Title:** "Parkinson's Disease Diagnosis Using Machine Learning and Voice"
- **Authors:** Timothy J. Wroge, Yasin Ozkanca, Cenk Demiroglu, Dong Si, David C. Atkins, Reza Hosseini Ghomi
- **Year:** 2018
- **Journal:** IEEE Signal Processing in Medicine and Biology Symposium (SPMB)
- **Sample Size:** mPower dataset: 5,826 participants (1,245 self-reported PD)
- **Features Used:**
  - 6,373 acoustic features extracted via openSMILE toolkit:
    - MFCC (0-12), delta-MFCC, delta-delta-MFCC
    - F0, jitter, shimmer, HNR
    - Spectral features (centroid, flux, slope, harmonicity)
    - Energy and loudness statistics
    - Voice quality: CPP (Cepstral Peak Prominence), GNE
    - Temporal: speech rate, rhythm metrics
- **Accuracy/AUC:** 85.3% accuracy; AUC = 0.89 (using XGBoost on selected features)
- **Key Findings:**
  - Largest voice-based PD study to date using the mPower mobile health dataset
  - Smartphone microphone recordings are sufficient for detection
  - Feature selection identified ~200 most informative features from 6,373
  - CPP (Cepstral Peak Prominence) emerged as a strong marker — reflects voice clarity/harmonicity
  - Demographic confounds (age, sex) must be carefully controlled

---

#### STUDY 16: Benba et al. (2016) — Voice Analysis for PD Detection

- **Title:** "Analysis of Multiple Types of Voice Recordings in Cepstral Domain Using MFCC for Discriminating Between Patients with Parkinson's Disease and Healthy People"
- **Authors:** Achraf Benba, Abdelilah Jilbab, Ahmed Hammouch
- **Year:** 2016
- **Journal:** International Journal of Speech Technology, 19(3), 449-456
- **Sample Size:** 40 subjects (20 PD, 20 controls)
- **Features Used:**
  - MFCC coefficients (13 coefficients)
  - Delta-MFCC
  - Delta-delta-MFCC
  - Extracted from sustained vowels and running speech
- **Accuracy/AUC:** 82.5% (sustained vowels); 91.3% (running speech); 92.6% (combined)
- **Key Findings:**
  - MFCC captures the spectral envelope changes caused by PD laryngeal dysfunction
  - Running speech MFCC outperforms sustained vowel MFCC
  - Low-order MFCCs (1-4) capture vocal tract resonance changes
  - High-order MFCCs (8-13) capture fine spectral detail related to breathiness/roughness

---

#### STUDY 17: Godino-Llorente et al. (2017) — Towards Automatic Detection

- **Title:** "Towards the Identification of Idiopathic Parkinson's Disease from the Speech. New Articulatory Kinetic Biomarkers"
- **Authors:** Juan I. Godino-Llorente, Agustin Alvarez-Marquina, Pedro Gomez-Vilda, et al.
- **Year:** 2017
- **Journal:** PLoS ONE, 12(12): e0189583
- **Sample Size:** 51 PD + 50 controls (PC-GITA corpus, Colombian Spanish)
- **Features Used:**
  - Articulatory kinetic features from inverse filtering:
    - Glottal source parameters: OQ (Open Quotient), NAQ (Normalized Amplitude Quotient), QOQ (Quasi-Open Quotient)
    - Vocal fold body stiffness parameters
    - Glottal flow derivative peaks
  - Traditional acoustic features for comparison
- **Accuracy/AUC:** Kinetic features: 88.7%; Combined kinetic + acoustic: 94.3%
- **Key Findings:**
  - Inverse filtering reveals GLOTTAL-LEVEL dysfunction invisible to standard acoustic analysis
  - OQ (Open Quotient) was significantly elevated in PD — vocal folds don't close completely (glottal incompetence)
  - This explains the breathy voice quality in PD
  - Kinetic biomarkers reflect the MOTOR MECHANISM, not just the acoustic outcome

---

#### STUDY 18: Jeancolas et al. (2021) — Voice Analysis in Prodromal PD

- **Title:** "Automatic Detection of Early Stages of Parkinson's Disease through Acoustic Voice Analysis with Mel-Frequency Cepstral Coefficients"
- **Authors:** Laetitia Jeancolas, Habib Benali, Badr-Eddine Benkelfat, et al.
- **Year:** 2021
- **Journal:** International Conference on Advanced Technologies for Signal and Image Processing
- **Sample Size:** 120 subjects (40 early PD, 40 prodromal PD (RBD), 40 controls)
- **Features Used:**
  - MFCC (13 + deltas)
  - Sustained vowel /a/ + sentence reading + spontaneous speech
  - Jitter, shimmer, HNR
  - F0 statistics
- **Accuracy/AUC:** Prodromal (RBD) vs controls: 74.2% (AUC = 0.80); Early PD vs controls: 89.1% (AUC = 0.94)
- **Key Findings:**
  - Confirms prodromal detection is possible but with lower accuracy than diagnosed PD
  - MFCC from spontaneous speech was most informative for prodromal detection
  - Voice changes are detectable in the prodromal phase (RBD stage), years before motor diagnosis

---

#### STUDY 19: Tracy et al. (2020) — Longitudinal Multi-Modal Analysis

- **Title:** "Investigating Voice as a Biomarker: Deep Phenotyping Methods for Early Detection of Parkinson's Disease"
- **Authors:** Jessica M. Tracy, Yasin Ozkanca, David C. Atkins, Reza Hosseini Ghomi
- **Year:** 2020
- **Journal:** Journal of Biomedical Informatics, 104, 103362
- **Sample Size:** mPower dataset subset: 1,800 participants analyzed longitudinally
- **Features Used:**
  - openSMILE Geneva Minimalistic Acoustic Parameter Set (GeMAPS): 88 features
    - Frequency: F0 (mean, std, percentiles), jitter
    - Energy: loudness (mean, std, percentiles), shimmer
    - Spectral: alpha ratio, Hammarberg index, spectral slopes, MFCC 1-4, spectral flux
    - Temporal: rate of loudness peaks, mean/std of voiced/unvoiced segment length
    - Voice quality: HNR, CPP (Cepstral Peak Prominence)
  - Extended: eGeMAPS (88 features total)
- **Accuracy/AUC:** Cross-sectional: AUC = 0.87; Longitudinal tracking: correlation with self-reported symptom scores r = 0.42
- **Key Findings:**
  - eGeMAPS is an efficient standardized feature set for PD voice analysis
  - CPP and spectral slope features were top performers
  - Longitudinal voice changes tracked self-reported symptom worsening
  - Recommended eGeMAPS as a standard feature set for future PD voice studies

---

#### STUDY 20: Brabenec et al. (2017) — Speech Disorders in PD: Review

- **Title:** "Speech Disorders in Parkinson's Disease: Early Diagnostics and Effects of Medication and Brain Stimulation"
- **Authors:** Lubos Brabenec, Jiri Mekyska, Zoltan Galaz, Irena Rektorova
- **Year:** 2017
- **Journal:** Journal of Neural Transmission, 124(3), 303-334
- **Sample Size:** Review article covering 100+ studies
- **Features Used (comprehensive taxonomy from review):**
  - PHONATION: jitter, shimmer, HNR, NHR, F0 statistics, PPE, RPDE, DFA, GNE, CPP, voice breaks, degree of voicelessness
  - ARTICULATION: VSA, FCR, VAI, VOT, F2 slope, F2 range, spirantization, consonant precision, DDK rate
  - PROSODY: F0 range, F0 SD, intensity range, intensity SD, speech rate, pause ratio
  - FLUENCY: pause frequency, pause duration, speech/pause ratio, hesitation rate
  - CONNECTED SPEECH: MFCC, LPC, spectral features, modulation spectrum
- **Key Findings:**
  - Hypokinetic dysarthria affects 70-90% of PD patients across disease course
  - Speech changes may PRECEDE motor symptoms by 5+ years (prodromal period)
  - L-DOPA medication PARTIALLY improves phonation and loudness but has MINIMAL effect on articulation
  - Deep Brain Stimulation (STN-DBS) can WORSEN speech (especially articulation and fluency) while improving limb motor function — known as "speech-DBS paradox"
  - Multi-dimensional analysis (phonation + articulation + prosody + fluency) always outperforms any single dimension

---

### 1.2 RECENT STUDIES (2023-2025)

---

#### STUDY 21: Suppa et al. (2024) — Voice in Digital Biomarkers for PD

- **Title:** "Voice Analysis as a Digital Biomarker for Parkinson's Disease"
- **Authors:** Antonio Suppa, Giovanni Costantini, et al.
- **Year:** 2024
- **Journal:** Movement Disorders (review article)
- **Sample Size:** Systematic review of 50+ studies
- **Key Findings:**
  - Voice is now classified as a Tier 1 digital biomarker by MDS (Movement Disorder Society)
  - Smartphone-based collection achieves 80-90% accuracy
  - Recommended minimum feature set: F0 statistics, jitter, shimmer, HNR, CPP, MFCC 1-4, speech rate, pause ratio
  - AI/ML approaches: SVM, Random Forest, XGBoost, and increasingly deep learning (CNNs, transformers)
  - Key challenge: generalization across recording conditions, languages, and demographics

---

#### STUDY 22: Tong et al. (2024) — Foundation Models for PD Speech

- **Title:** "Leveraging Pre-trained Speech Models for Parkinson's Disease Detection"
- **Authors:** Various (multiple groups in 2024 published similar approaches)
- **Year:** 2024
- **Journal:** Various (IEEE, INTERSPEECH proceedings)
- **Sample Size:** Various; mPower, PC-GITA, Italian PD corpus
- **Features Used:**
  - Wav2Vec 2.0 embeddings
  - HuBERT embeddings
  - Whisper encoder features
  - Fine-tuned on PD vs HC classification
- **Accuracy/AUC:** 88-95% across different datasets and models; AUC 0.92-0.97
- **Key Findings:**
  - Self-supervised speech representations capture PD-relevant information without hand-crafted features
  - Transfer learning from large speech models to PD detection is highly effective
  - These models implicitly learn phonation, articulation, and prosodic features
  - Reduced need for domain-specific feature engineering

---

#### STUDY 23: Galaz et al. (2023) — Prosodic and Articulatory Analysis in Early PD

- **Title:** "Prosodic and Articulatory Features for Parkinson's Disease Detection from Connected Speech"
- **Authors:** Zoltan Galaz, Jiri Mekyska, et al.
- **Year:** 2023
- **Journal:** Sensors, 23(4), 2186
- **Sample Size:** 72 subjects (36 PD, 36 HC)
- **Features Used:**
  - Articulation: VSA, FCR, F2 transitions, DDK regularity
  - Prosody: pitch declination, intensity declination, phrase-final lengthening
  - Rhythm: Pairwise Variability Index (PVI), normalized PVI, %V (percentage of vocalic intervals)
  - Duration: vowel duration ratio, consonant-vowel ratio
- **Accuracy/AUC:** 89.3% (AUC = 0.93) using articulation+prosody combined; prosody alone: 82.1%; articulation alone: 84.7%
- **Key Findings:**
  - Rhythm metrics (PVI, %V) are sensitive to the timing deficits in PD
  - Phrase-final lengthening is REDUCED in PD (prosodic flattening)
  - DDK regularity (coefficient of variation of /pa-ta-ka/ intervals) is highly discriminative
  - PD produces "metronomic" speech rhythm (reduced natural variability)

---

#### STUDY 24: Moro-Velazquez et al. (2024) — Differential Diagnosis via Voice

- **Title:** "Phonation and Articulation Analysis for Differentiating Parkinson's Disease, Essential Tremor, and Healthy Speakers"
- **Authors:** Laureano Moro-Velazquez, Najim Dehak, et al.
- **Year:** 2024
- **Journal:** Speech Communication
- **Sample Size:** 120 subjects (40 PD, 40 Essential Tremor, 40 HC)
- **Features Used:**
  - x-vectors (speaker embeddings from ECAPA-TDNN)
  - i-vectors
  - Acoustic features: F0, jitter, shimmer, CPP, HNR, MFCC
  - Glottal features: OQ, NAQ, H1-H2
- **Accuracy/AUC:** PD vs HC: 91%; PD vs ET: 83%; 3-way: 78%
- **Key Findings:**
  - PD and Essential Tremor (ET) both produce vocal tremor but with DIFFERENT characteristics
  - PD tremor: 4-7 Hz, amplitude modulation, more irregular
  - ET tremor: 5-12 Hz, frequency modulation, more regular
  - x-vector embeddings capture speaker-level pathological patterns effectively
  - Differentiating PD from other tremor disorders is possible but more challenging than PD vs healthy

---

#### STUDY 25: Botelho et al. (2023) — Cross-Lingual PD Detection

- **Title:** "Cross-Lingual Pathological Speech Detection"
- **Authors:** Catarina Botelho, et al.
- **Year:** 2023
- **Journal:** INTERSPEECH 2023
- **Sample Size:** 400+ subjects across English, Spanish, Czech, German corpora
- **Features Used:**
  - Wav2Vec 2.0 XLSR-53 (multilingual pre-trained)
  - Fine-tuned for PD detection
  - Compared with eGeMAPS features
- **Accuracy/AUC:** Within-language: 85-92%; Cross-language: 75-82%
- **Key Findings:**
  - Multilingual self-supervised models enable cross-lingual PD detection
  - Language-independent representations capture universal motor speech deficits
  - Performance gap between within-language and cross-language reduced with multilingual pre-training
  - Supports the hypothesis that PD motor speech deficits are language-universal

---

## 2. COMPREHENSIVE VOICE INDICATOR TAXONOMY

### 2.1 ACOUSTIC / PHONATORY FEATURES

These reflect laryngeal function and vocal fold vibratory behavior.

| # | Feature Name | Definition | Normal Range | PD Abnormality | Effect Size (Cohen's d) | Key Reference |
|---|-------------|-----------|--------------|----------------|------------------------|---------------|
| A1 | **Jitter (local, %)** | Cycle-to-cycle variation in fundamental frequency period | < 1.04% | INCREASED (1.5-3.0%) | 0.8-1.2 | Little 2009, Tsanas 2012 |
| A2 | **Jitter (absolute, us)** | Absolute period-to-period F0 variation in microseconds | < 83.2 us | INCREASED | 0.7-1.0 | MDVP standard |
| A3 | **Jitter (RAP)** | Relative Average Perturbation — 3-point period perturbation | < 0.68% | INCREASED | 0.7-0.9 | Little 2009 |
| A4 | **Jitter (PPQ5)** | 5-point Period Perturbation Quotient | < 0.84% | INCREASED | 0.7-0.9 | Little 2009 |
| A5 | **Jitter (DDP)** | Average absolute difference of differences of consecutive periods / average period | = RAP × 3 | INCREASED | 0.7-0.9 | Little 2009 |
| A6 | **Shimmer (local, %)** | Cycle-to-cycle variation in amplitude | < 3.81% | INCREASED (4-8%) | 1.0-1.5 | Little 2009, Tsanas 2012 |
| A7 | **Shimmer (local, dB)** | Shimmer in decibels | < 0.35 dB | INCREASED | 1.0-1.4 | MDVP standard |
| A8 | **Shimmer (APQ3)** | 3-point Amplitude Perturbation Quotient | < 3.07% | INCREASED | 0.9-1.2 | Little 2009 |
| A9 | **Shimmer (APQ5)** | 5-point Amplitude Perturbation Quotient | < 3.07% | INCREASED | 0.9-1.2 | Little 2009 |
| A10 | **Shimmer (APQ11)** | 11-point Amplitude Perturbation Quotient | < 4.23% | INCREASED | 0.8-1.1 | Little 2009 |
| A11 | **Shimmer (DDA)** | Average absolute difference of differences of consecutive amplitudes / average amplitude | = APQ3 × 3 | INCREASED | 0.9-1.2 | Little 2009 |
| A12 | **HNR (Harmonics-to-Noise Ratio, dB)** | Ratio of harmonic energy to noise energy | > 20 dB | DECREASED (12-18 dB) | 1.0-1.6 | Tsanas 2010 |
| A13 | **NHR (Noise-to-Harmonics Ratio)** | Inverse of HNR — proportion of noise | < 0.19 | INCREASED | 1.0-1.5 | Little 2009 |
| A14 | **F0 Mean (Hz)** | Average fundamental frequency | M: 85-155 Hz; F: 165-255 Hz | Slightly DECREASED (rigidity) or INCREASED (tension) — variable | 0.3-0.6 | Harel 2004 |
| A15 | **F0 Maximum (Hz)** | Highest F0 achieved | Varies | DECREASED (reduced range) | 0.5-0.8 | Harel 2004 |
| A16 | **F0 Minimum (Hz)** | Lowest F0 achieved | Varies | May be INCREASED (floor rises) | 0.3-0.5 | Harel 2004 |
| A17 | **F0 Standard Deviation (Hz)** | Variation in F0 across utterance | > 15 Hz (connected speech) | DECREASED — monopitch | 0.8-1.3 | Skodda 2011 |
| A18 | **F0 Range (semitones)** | Distance between F0 max and min | > 10 semitones | DECREASED (< 5 semitones) | 0.9-1.4 | Skodda 2011 |
| A19 | **PPE (Pitch Period Entropy)** | Entropy of F0 period distribution — measures pitch regularity | Varies | INCREASED (more irregular) | 1.2-1.8 | Little 2009 — NOVEL |
| A20 | **RPDE (Recurrence Period Density Entropy)** | Nonlinear measure of signal periodicity | Varies | INCREASED (more aperiodic) | 1.0-1.5 | Little 2007 |
| A21 | **DFA (Detrended Fluctuation Analysis)** | Fractal scaling exponent of F0 signal | Varies | ALTERED (toward randomness) | 0.8-1.2 | Little 2007 |
| A22 | **D2 (Correlation Dimension)** | Complexity measure from attractor reconstruction | Varies | INCREASED | 0.6-0.9 | Tsanas 2012 |
| A23 | **CPP (Cepstral Peak Prominence, dB)** | Prominence of cepstral peak — measures voice clarity | > 10 dB | DECREASED (less clear voice) | 1.0-1.4 | Tracy 2020, Wroge 2018 |
| A24 | **GNE (Glottal-to-Noise Excitation Ratio)** | Ratio of glottal excitation energy to noise | > 0.5 | DECREASED | 0.7-1.0 | Sakar 2013 |
| A25 | **H1-H2 (dB)** | Difference between first and second harmonic amplitudes — breathiness index | Varies | INCREASED (breathier) | 0.5-0.8 | Moro-Velazquez 2024 |
| A26 | **OQ (Open Quotient)** | Proportion of glottal cycle where folds are open | 0.4-0.6 | INCREASED (0.6-0.8) — incomplete closure | 0.8-1.2 | Godino-Llorente 2017 |
| A27 | **NAQ (Normalized Amplitude Quotient)** | Normalized amplitude of glottal flow derivative | Varies | ALTERED | 0.7-1.0 | Godino-Llorente 2017 |
| A28 | **Voice Breaks (count/duration)** | Number and duration of F0 breaks | 0-1 per passage | INCREASED | 0.5-0.8 | Rusz 2011 |
| A29 | **Degree of Voicelessness (%)** | Percentage of unvoiced frames in sustained phonation | < 1% | INCREASED (3-15%) | 0.8-1.2 | Rusz 2011 |
| A30 | **Vocal Tremor Frequency (Hz)** | Dominant frequency of amplitude/frequency modulation | Absent or minimal | PRESENT: 4-7 Hz (PD-specific range) | 1.0-1.5 | Moro-Velazquez 2024 |
| A31 | **Vocal Tremor Amplitude** | Depth of modulation of vocal tremor | Absent or minimal | INCREASED | 0.8-1.3 | Moro-Velazquez 2024 |

---

### 2.2 ARTICULATORY FEATURES

These reflect movement of tongue, jaw, lips, and soft palate.

| # | Feature Name | Definition | Normal | PD Abnormality | Effect Size | Key Reference |
|---|-------------|-----------|--------|----------------|-------------|---------------|
| AR1 | **Vowel Space Area (VSA, Hz^2)** | Triangular area in F1-F2 space for corner vowels /a/, /i/, /u/ | Large triangle | REDUCED 25-40% (centralized vowels) | 1.0-1.5 | Sapir 2010, Rusz 2013 |
| AR2 | **Formant Centralization Ratio (FCR)** | (F2u+F2a+F1i+F1u)/(F2i+F1a) — higher = more centralized | ~1.0 | INCREASED (>1.1) | 1.2-1.6 | Sapir 2010 |
| AR3 | **Vowel Articulation Index (VAI)** | Inverse of FCR: (F2i+F1a)/(F2u+F2a+F1i+F1u) | ~1.0 | DECREASED (<0.9) | 1.2-1.6 | Rusz 2011 |
| AR4 | **F1 (First Formant, Hz)** | Resonance frequency reflecting jaw opening / tongue height | Vowel-dependent | Compressed range | 0.5-0.8 | Sakar 2013 |
| AR5 | **F2 (Second Formant, Hz)** | Resonance frequency reflecting tongue advancement | Vowel-dependent | Compressed range — MOST affected | 0.8-1.2 | Orozco-Arroyave 2016 |
| AR6 | **F2 Range (Hz)** | Total range of F2 across connected speech | Large | REDUCED (restricted tongue movement) | 0.9-1.3 | Rusz 2013 |
| AR7 | **F2 Slope (Hz/ms)** | Rate of formant transition between vowels and consonants | Fast (> 20 Hz/ms) | REDUCED (slower transitions) | 0.8-1.1 | Rusz 2013 |
| AR8 | **F3 (Third Formant, Hz)** | Higher resonance reflecting lip rounding and pharyngeal shape | Vowel-dependent | Less affected than F1/F2 | 0.3-0.5 | Sakar 2013 |
| AR9 | **Voice Onset Time (VOT, ms)** | Time between plosive release and voicing onset | 20-80 ms (varies by consonant) | VARIABLE: may be shortened (imprecise) or lengthened (slow) | 0.5-0.9 | Rusz 2011 |
| AR10 | **Spirantization Index** | Degree to which stop consonants become fricative-like | Low | INCREASED (stops become "sloppy") | 0.8-1.2 | Rusz 2011 |
| AR11 | **Consonant Precision (%)** | Perceptual/acoustic accuracy of consonant production | > 95% | DECREASED (70-85%) | 1.0-1.5 | Rusz 2011 |
| AR12 | **Imprecise Consonant Ratio** | Proportion of consonants with reduced closure or frication | Low | INCREASED — HALLMARK feature | 1.0-1.4 | Hlavnicka 2017 |
| AR13 | **DDK Rate (syllables/sec)** | Speed of alternating motion rate (/pa-ta-ka/) | > 5.5 syll/sec | DECREASED (3.5-5.0 syll/sec) | 0.9-1.4 | Rusz 2011 |
| AR14 | **DDK Regularity (CV)** | Coefficient of variation of DDK intervals | < 5% | INCREASED (> 8%) — irregular rhythm | 0.8-1.2 | Galaz 2023 |
| AR15 | **Plosive Gap Duration (ms)** | Duration of silence during stop consonant closure | 50-100 ms | Often SHORTENED (incomplete closure) | 0.6-0.9 | Hlavnicka 2017 |
| AR16 | **MFCC 1-13** | Mel-Frequency Cepstral Coefficients — spectral envelope of vocal tract shape | Normal range | ALTERED pattern — lower MFCCs reduced, higher MFCCs more variable | 0.5-1.0 (varies by coefficient) | Benba 2016 |
| AR17 | **Lip Aperture Range** | Range of lip opening during speech (from video or acoustic proxy) | Wide | REDUCED (masked face / hypomimia) | 0.7-1.0 | Orozco-Arroyave 2016 |
| AR18 | **Tongue Movement Velocity** | Estimated from F2 transition rate | Fast | REDUCED (bradykinesia of tongue) | 0.8-1.2 | Rusz 2013 |

---

### 2.3 PROSODIC FEATURES

These reflect the suprasegmental properties: melody, stress, rhythm, and intonation.

| # | Feature Name | Definition | Normal | PD Abnormality | Effect Size | Key Reference |
|---|-------------|-----------|--------|----------------|-------------|---------------|
| P1 | **Monopitch (F0 SD reduction)** | Reduced variation in fundamental frequency | F0 SD > 15 Hz | F0 SD < 10 Hz — FLAT intonation | 0.9-1.4 | Skodda 2011, Harel 2004 |
| P2 | **Monoloudness (Intensity SD reduction)** | Reduced variation in vocal intensity | Intensity SD > 5 dB | Intensity SD < 3 dB | 0.8-1.3 | Harel 2004 |
| P3 | **Hypophonia (reduced SPL)** | Globally reduced sound pressure level | 72-76 dB SPL | 65-68 dB SPL | 1.2-1.8 | Ramig 2001 |
| P4 | **Intensity Range (dB)** | Dynamic range of speech loudness | > 20 dB | REDUCED (< 12 dB) | 0.9-1.3 | Harel 2004 |
| P5 | **Pitch Declination Slope** | Rate of F0 decline across an utterance | Moderate declination | REDUCED (flatter) or ABSENT | 0.5-0.8 | Galaz 2023 |
| P6 | **Stress Pattern Regularity** | Acoustic marking of stressed vs unstressed syllables | Clear contrast | REDUCED contrast — STRESS EQUALIZATION | 0.7-1.0 | Skodda 2011 |
| P7 | **Phrase-Final Lengthening** | Duration increase of final syllable in phrase | Present (20-30% longer) | REDUCED or ABSENT | 0.6-0.9 | Galaz 2023 |
| P8 | **Intonation Contour Variation** | Complexity of F0 contour shape | Complex contours (rises, falls, rise-falls) | FLATTENED — mostly flat or monotone declination | 0.8-1.2 | Skodda 2011 |
| P9 | **Alpha Ratio (dB)** | Energy ratio: (50-1000 Hz) / (1000-5000 Hz) | Varies | ALTERED — relatively more low-frequency energy (breathy quality) | 0.5-0.8 | Tracy 2020 |
| P10 | **Hammarberg Index (dB)** | Ratio of strongest energy peak in 0-2kHz to strongest in 2-5kHz | Varies | INCREASED (more energy concentrated in low frequencies) | 0.5-0.8 | Tracy 2020 |
| P11 | **Spectral Slope (dB/octave)** | Rate of spectral energy decrease with frequency | Moderate | STEEPER (less high-frequency energy — breathier) | 0.5-0.7 | Tracy 2020 |

---

### 2.4 TEMPORAL / FLUENCY FEATURES

These reflect timing, rhythm, and speech flow characteristics.

| # | Feature Name | Definition | Normal | PD Abnormality | Effect Size | Key Reference |
|---|-------------|-----------|--------|----------------|-------------|---------------|
| T1 | **Speech Rate (syllables/sec)** | Number of syllables per second including pauses | 3.5-5.5 syll/sec | VARIABLE: initially may be NORMAL, then DECREASED (2.5-4.0), OR paradoxically ACCELERATED (festination) | 0.5-1.0 | Skodda 2011 |
| T2 | **Articulation Rate (syllables/sec)** | Speech rate excluding pauses | 4.5-6.5 syll/sec | Often DECREASED (slower articulation) | 0.6-0.9 | Skodda 2011 |
| T3 | **Net Speech Rate** | Words per minute of actual speech time | 150-180 wpm | DECREASED (100-140 wpm) | 0.7-1.0 | Skodda 2011 |
| T4 | **Pause Frequency** | Number of pauses per utterance/minute | 4-6 pauses/min | INCREASED (8-15 pauses/min) | 0.8-1.2 | Hlavnicka 2017 |
| T5 | **Pause Duration (ms)** | Average length of silent pauses | 300-600 ms | INCREASED (600-1500 ms) | 0.7-1.1 | Hlavnicka 2017 |
| T6 | **Percent Pause Time (%)** | Proportion of total time spent in pauses | 20-30% | INCREASED (35-55%) | 0.8-1.2 | Skodda 2011 |
| T7 | **Speech-to-Pause Ratio** | Ratio of speech time to pause time | 2.5-4.0 | DECREASED (< 2.0) | 0.7-1.0 | Rusz 2011 |
| T8 | **Within-Word Pauses** | Inappropriate pauses WITHIN words | Rare/absent | PRESENT — hallmark of PD speech | 1.0-1.5 | Hlavnicka 2017 |
| T9 | **Inter-Word Intervals (ms)** | Duration of gaps between words | 100-250 ms | VARIABLE: may be prolonged OR shortened (festination) | 0.5-0.8 | Skodda 2011 |
| T10 | **Festination (speech acceleration)** | Progressive acceleration within an utterance, often ending in mumbling or freeze | Absent | PRESENT in 20-30% of PD patients | Categorical | Skodda 2011 |
| T11 | **Palilalia** | Involuntary repetition of words/phrases with increasing rate and decreasing loudness | Absent | PRESENT in 10-15% of PD patients (later stage) | Categorical | Brabenec 2017 |
| T12 | **Rhythm Metrics: PVI (Pairwise Variability Index)** | Variability of successive vowel/consonant durations | Moderate variability | REDUCED — "metronomic" rhythm | 0.7-1.0 | Galaz 2023 |
| T13 | **Rhythm Metrics: nPVI (normalized)** | Normalized PVI — controls for rate | Moderate | REDUCED | 0.7-1.0 | Galaz 2023 |
| T14 | **%V (Percentage Vocalic Intervals)** | Proportion of speech that is vowel | 40-50% | May INCREASE (consonant reduction) | 0.4-0.7 | Galaz 2023 |
| T15 | **Voiced/Unvoiced Segment Duration** | Mean and SD of continuous voiced and unvoiced stretches | Balanced | Shorter voiced segments, more frequent voicing breaks | 0.5-0.8 | Tracy 2020 |

---

### 2.5 MOTOR SPEECH CONTROL FEATURES

These are specific to the motor execution impairments underlying PD dysarthria.

| # | Feature Name | Definition | Normal | PD Abnormality | Mechanism | Key Reference |
|---|-------------|-----------|--------|----------------|-----------|---------------|
| M1 | **Voice Onset Time (VOT)** | Time from plosive release burst to vocal fold vibration onset | Precise, consistent (20-80 ms by phoneme) | REDUCED precision: higher variability, often shortened | Impaired laryngeal-oral coordination due to basal ganglia dysfunction | Rusz 2011 |
| M2 | **Diadochokinetic (DDK) Rate** | Speed of rapid alternating syllables (/pa-ta-ka/) | > 5.5 syll/sec | DECREASED to 3.5-5.0 syll/sec | Bradykinesia of articulators (lips, tongue, velum) | Rusz 2011 |
| M3 | **DDK Regularity (AMR/SMR)** | Consistency of rhythm in rapid repetition | CV < 5% | CV > 8% — increased irregularity | Impaired motor timing from basal ganglia circuit | Galaz 2023 |
| M4 | **Spirantization** | Stop consonants (/p,t,k,b,d,g/) produced as fricatives — incomplete oral closure | Absent | PRESENT — plosives become "sloppy", "slurred" | Reduced articulatory force and range of motion (hypokinesia) | Rusz 2011 |
| M5 | **Nasal Emission / Hypernasality** | Excessive nasal resonance from incomplete velopharyngeal closure | Absent/minimal | MILD-MODERATE hypernasality in 25-40% of PD | Velopharyngeal incompetence from reduced velum elevation | Brabenec 2017 |
| M6 | **Laryngeal Timing Deficits** | Coordination between respiratory, phonatory, and articulatory systems | Synchronized | DESYNCHRONIZED — voice onset may lag articulatory gesture | Impaired inter-subsystem coordination (basal ganglia motor planning) | Rusz 2011 |
| M7 | **Respiratory Support Deficits** | Subglottal pressure and airflow management during speech | Adequate pressure (5-10 cmH2O) | REDUCED subglottal pressure → hypophonia | Chest wall rigidity + reduced respiratory drive | Ramig 2001 |
| M8 | **Vocal Fold Bowing** | Shape of vocal folds during phonation (observed via laryngoscopy, inferred acoustically) | Straight medial edge | BOWED — incomplete closure → breathy voice, increased HNR | Thyroarytenoid muscle atrophy/rigidity | Godino-Llorente 2017 |
| M9 | **Glottal Incompetence** | Failure of vocal folds to fully close during phonation | Full closure | INCOMPLETE closure — air leakage → breathy, weak voice | Combination of rigidity and bowing | Godino-Llorente 2017 |
| M10 | **Motor Overflow / Dystonic Features** | Inappropriate co-contraction of laryngeal muscles | Absent | Occasional dystonic posturing, strained quality | Basal ganglia dysfunction affecting reciprocal inhibition | Brabenec 2017 |

---

## 3. DIFFERENTIAL DIAGNOSIS: PARKINSON'S vs ALZHEIMER'S vs DEPRESSION

### 3.1 Fundamental Mechanism Differences

| Dimension | Parkinson's Disease | Alzheimer's Disease | Depression |
|-----------|-------------------|--------------------| -----------|
| **Core Pathology** | Basal ganglia dopamine depletion → MOTOR execution deficit | Hippocampal/cortical degeneration → COGNITIVE-LINGUISTIC deficit | Frontal/limbic dysfunction → MOTIVATIONAL-AFFECTIVE deficit |
| **Dysarthria Type** | Hypokinetic dysarthria | NO primary dysarthria (articulation/phonation normal until very late) | NO primary dysarthria |
| **What is Impaired** | HOW the patient speaks (motor execution) | WHAT the patient says (content, coherence, word-finding) | WHETHER the patient speaks (initiative, prosodic affect) |

### 3.2 Feature-by-Feature Comparison

| Feature | Parkinson's | Alzheimer's | Depression |
|---------|------------|-------------|-----------|
| **Jitter** | INCREASED (1.5-3.0%) — vocal fold rigidity | NORMAL (< 1.0%) | NORMAL to mildly increased |
| **Shimmer** | INCREASED (4-8%) — amplitude instability | NORMAL | NORMAL to mildly increased |
| **HNR** | DECREASED (12-18 dB) — breathy/noisy voice | NORMAL (> 20 dB) | NORMAL to slightly decreased |
| **F0 Mean** | Variable (rigidity may raise or lower) | NORMAL for age | Often DECREASED (lower pitch) |
| **F0 Range** | MARKEDLY DECREASED — MONOPITCH (hallmark) | NORMAL or mildly reduced (late stage) | DECREASED — flat affect |
| **Intensity (SPL)** | DECREASED — HYPOPHONIA (hallmark) | NORMAL | DECREASED — low energy |
| **Intensity Range** | MARKEDLY DECREASED — MONOLOUDNESS | NORMAL | DECREASED — flat affect |
| **Speech Rate** | Variable: slow, normal, or FESTINATING | NORMAL to slightly slow (word-finding pauses) | SLOWED (psychomotor retardation) |
| **Pause Pattern** | Increased frequency, INCLUDING within-word pauses | Increased, but BETWEEN words (word-finding hesitations, not motor) | Increased, especially response latency |
| **Vowel Space Area** | REDUCED 25-40% (hypoarticulation) | NORMAL | NORMAL |
| **FCR** | INCREASED > 1.1 (centralized vowels) | NORMAL (~1.0) | NORMAL |
| **Consonant Precision** | IMPAIRED (spirantization, slurring) | NORMAL | NORMAL |
| **DDK Rate** | DECREASED and IRREGULAR | NORMAL | May be slightly slow (psychomotor) |
| **Vocal Tremor** | PRESENT (4-7 Hz) | ABSENT | ABSENT |
| **Word-Finding Pauses** | INFREQUENT (vocabulary intact) | FREQUENT (semantic memory loss) — hallmark | INFREQUENT (vocabulary intact) |
| **Type-Token Ratio** | NORMAL (vocabulary preserved) | DECREASED (reduced vocabulary) | NORMAL to slightly decreased |
| **Syntactic Complexity** | NORMAL (grammar preserved) | DECREASED (simplified structures) | NORMAL but may use shorter sentences |
| **Semantic Coherence** | NORMAL (topic maintenance intact) | IMPAIRED (tangential, perseverative) | May be slightly reduced (cognitive focus) |
| **Idea Density** | NORMAL | DECREASED (empty speech) | May be slightly reduced |
| **Discourse Organization** | NORMAL (logically organized) | IMPAIRED (disorganized, tangential) | Preserved but may be restricted |
| **Repetitions** | Palilalia (involuntary motor repetition) | Perseveration (stuck on same topic/word) | Rumination (repetitive content, not motor) |
| **Prosodic Affect** | REDUCED — monotone (MOTOR flat) | NORMAL until late stages | REDUCED — sad/flat (EMOTIONAL flat) |
| **Response Latency** | Normal to slightly increased (motor initiation delay) | Increased (cognitive processing delay) | INCREASED (psychomotor retardation) |
| **Intelligibility** | REDUCED (articulation + loudness deficit) | PRESERVED until very late | PRESERVED |

### 3.3 Diagnostic Decision Rules

```
IF (jitter INCREASED) AND (shimmer INCREASED) AND (HNR DECREASED)
   AND (VSA REDUCED) AND (FCR > 1.1)
   AND (F0 range MARKEDLY DECREASED)
   AND (hypophonia PRESENT)
   AND (consonant precision IMPAIRED)
   AND (vocal tremor 4-7 Hz PRESENT)
   AND (vocabulary NORMAL) AND (coherence NORMAL)
   → HIGH PROBABILITY: PARKINSON'S DISEASE

IF (jitter NORMAL) AND (shimmer NORMAL) AND (HNR NORMAL)
   AND (VSA NORMAL) AND (consonants NORMAL)
   AND (word-finding pauses INCREASED)
   AND (TTR DECREASED) AND (idea density DECREASED)
   AND (semantic coherence IMPAIRED)
   AND (syntactic complexity REDUCED)
   → HIGH PROBABILITY: ALZHEIMER'S DISEASE

IF (jitter NORMAL) AND (shimmer NORMAL)
   AND (VSA NORMAL) AND (consonants NORMAL)
   AND (F0 range DECREASED) AND (intensity DECREASED)
   AND (speech rate SLOWED) AND (response latency INCREASED)
   AND (vocabulary NORMAL) AND (coherence NORMAL)
   AND (vocal affect FLAT — sad prosody)
   → HIGH PROBABILITY: DEPRESSION
```

### 3.4 Key Differentiating Tests

| Test | PD Result | AD Result | Depression Result |
|------|-----------|-----------|-------------------|
| Sustained vowel /a/ 5 seconds | Jitter/shimmer HIGH, HNR LOW, tremor present | NORMAL | NORMAL |
| /pa-ta-ka/ repetition (DDK) | SLOW, IRREGULAR | NORMAL speed | May be slightly slow |
| Cookie Theft picture description | Short, quiet, slurred BUT ON-TOPIC | Wordy, imprecise, OFF-TOPIC, word-finding errors | Short, sparse, ON-TOPIC but minimal |
| Vowel /a/-/i/-/u/ triangle | COMPRESSED (small VSA) | NORMAL triangle | NORMAL triangle |
| Reading a passage aloud | Monotone, quiet, imprecise consonants | Normal pronunciation, possible word substitutions | Monotone but clear pronunciation |
| Spontaneous narrative | Motor-degraded but linguistically intact | Linguistically degraded but motor-intact | Motor-intact, linguistically restricted |

---

## 4. CLINICAL FEATURE REFERENCE TABLE

### 4.1 Feature Importance Rankings (Aggregated Across Studies)

| Rank | Feature | Discriminative Power (PD vs HC) | Best Extraction Method |
|------|---------|-------------------------------|----------------------|
| 1 | **Hypophonia (reduced SPL)** | d = 1.2-1.8 | Sustained vowel + connected speech, calibrated microphone |
| 2 | **Monopitch (F0 range reduction)** | d = 0.9-1.4 | Connected speech, read passage |
| 3 | **Vowel Space Area / FCR** | d = 1.0-1.6 | Corner vowels /a/, /i/, /u/ in words or isolated |
| 4 | **HNR / CPP** | d = 1.0-1.6 | Sustained vowel /a/ |
| 5 | **PPE (Pitch Period Entropy)** | d = 1.2-1.8 | Sustained vowel /a/ |
| 6 | **Shimmer (APQ11 or DDA)** | d = 0.9-1.5 | Sustained vowel /a/ |
| 7 | **Imprecise Consonants / Spirantization** | d = 1.0-1.4 | Connected speech, DDK |
| 8 | **DDK Rate and Regularity** | d = 0.9-1.4 | /pa-ta-ka/ rapid repetition |
| 9 | **Pause Patterns (including within-word)** | d = 0.8-1.2 | Connected speech |
| 10 | **Vocal Tremor (4-7 Hz)** | d = 1.0-1.5 | Sustained vowel, long duration |
| 11 | **Jitter (local %)** | d = 0.8-1.2 | Sustained vowel /a/ |
| 12 | **RPDE / DFA** | d = 0.8-1.5 | Sustained vowel /a/ |
| 13 | **Speech Rate Variability** | d = 0.5-1.0 | Connected speech |
| 14 | **Monoloudness (intensity range)** | d = 0.8-1.3 | Connected speech, read passage |
| 15 | **MFCC Pattern** | d = 0.5-1.0 | Any speech segment |

### 4.2 Recommended Recording Protocol for PD Detection

| Task | Duration | Primary Features Captured | Rationale |
|------|----------|--------------------------|-----------|
| Sustained vowel /a/ at comfortable pitch/loudness | 5 seconds x 3 | Jitter, shimmer, HNR, NHR, PPE, RPDE, DFA, CPP, GNE, vocal tremor | Isolates phonatory function without articulatory/prosodic confounds |
| Sustained vowel /a/ at maximum loudness | 3 seconds x 2 | Maximum SPL, dynamic range | Tests respiratory support and loudness capacity |
| Corner vowels /a/, /i/, /u/ | 3 seconds each x 2 | VSA, FCR, VAI, F1/F2 positions | Maps articulatory space |
| DDK: /pa-ta-ka/ rapid repetition | 10 seconds | DDK rate, DDK regularity, spirantization, VOT | Tests maximum articulatory speed and coordination |
| Read passage (e.g., Rainbow Passage or Grandfather Passage) | 60 seconds | All prosodic features, connected speech articulation, pause patterns, speech rate | Controlled linguistic content allows precise comparison |
| Picture description (e.g., Cookie Theft) | 60 seconds | Spontaneous speech features, language + motor simultaneously | Ecologically valid, captures cognitive-linguistic overlap |
| Spontaneous narrative ("Tell me about your day") | 60-90 seconds | Most natural speech, all features | Highest ecological validity |

---

## 5. DATASETS AND BENCHMARKS

### 5.1 Major PD Voice Datasets

| Dataset | Size | Language | Tasks | Access |
|---------|------|----------|-------|--------|
| **UCI Parkinson's Dataset** (Little 2008) | 195 recordings, 31 subjects | English | Sustained vowel /a/ | Public: UCI ML Repository |
| **UCI Parkinson's Telemonitoring** (Tsanas 2010) | 5,875 recordings, 42 PD patients | English | Sustained vowel /a/ | Public: UCI ML Repository |
| **mPower** (Sage Bionetworks 2015) | 65,000+ recordings, 10,000+ participants | English | Sustained /a/, counting, reading | Public: Synapse.org (with DUA) |
| **PC-GITA** (Orozco-Arroyave 2014) | 100 subjects (50 PD, 50 HC) | Colombian Spanish | Vowels, words, sentences, reading, spontaneous | Restricted access |
| **Italian PD Speech Dataset** (Dimauro 2017) | 68 subjects (34 PD, 34 HC) | Italian | Sustained vowels, words, sentences | By request |
| **Czech PD Dataset** (Rusz et al.) | ~100 subjects | Czech | Full protocol (vowels, DDK, reading, spontaneous) | By request |
| **German PD Dataset** (Skodda) | ~230 subjects | German | Reading, spontaneous speech | By request |
| **Istanbul PD Dataset** (Sakar 2013) | 40 subjects (20 PD, 20 HC) | Turkish | Multiple voice types | Public |
| **MDVP-based Parkinson's Dataset** (Sakar 2019, updated) | 252 subjects (188 PD, 64 HC) | Turkish | Sustained vowels | Public: UCI |

### 5.2 Benchmark Accuracies

| Dataset | Best Reported Accuracy | Method | Year |
|---------|----------------------|--------|------|
| UCI Parkinson's (sustained vowel) | 99.0% | SVM (Tsanas 2012) | 2012 |
| UCI Telemonitoring (UPDRS prediction) | MAE 5.8 | CART + regression | 2010 |
| mPower (PD vs HC) | 89% | XGBoost (Wroge 2018) | 2018 |
| PC-GITA (within-language) | 97% | SVM (Orozco-Arroyave 2016) | 2016 |
| PC-GITA (cross-language) | 85% | SVM transfer | 2016 |
| Prodromal PD (iRBD vs HC) | 78.7% | SVM (Hlavnicka 2017) | 2017 |
| Foundation models (Wav2Vec 2.0) | 95% | Fine-tuned transformer | 2024 |

---

## 6. SUMMARY: THE PARKINSON'S VOICE SIGNATURE

### The 10 Cardinal Voice Features of Parkinson's Disease

1. **HYPOPHONIA** — Reduced loudness (5-10 dB below normal), often the earliest symptom. Present in 70-89% of PD patients at diagnosis.

2. **MONOPITCH** — Reduced F0 range (<5 semitones vs >10 normal). Creates "flat", "robotic", "expressionless" speech. Reflects basal ganglia inability to modulate laryngeal tension.

3. **MONOLOUDNESS** — Reduced intensity variation. Speech loses its natural emphasis patterns.

4. **BREATHY/HOARSE VOICE QUALITY** — Reduced HNR/CPP, increased NHR. Caused by vocal fold bowing and incomplete glottal closure.

5. **IMPRECISE CONSONANTS** — Spirantization, reduced VOT precision. Plosives become "mushy". Reflects articulatory hypokinesia (reduced range and force of lip/tongue/jaw movement).

6. **VOWEL CENTRALIZATION** — Reduced VSA, elevated FCR. All vowels drift toward schwa /uh/. Reflects reduced excursion of articulators.

7. **VOCAL TREMOR** — 4-7 Hz modulation of pitch and/or amplitude. Distinct from essential tremor (5-12 Hz, more regular).

8. **ABNORMAL PAUSING** — Increased pause frequency and duration, including inappropriate within-word pauses. Reflects motor planning/execution delays.

9. **REDUCED SPEECH RATE WITH POSSIBLE FESTINATION** — Initial slowing (bradykinesia), but 20-30% of patients show paradoxical acceleration (festination) with progressive loss of intelligibility.

10. **REDUCED DDK RATE AND REGULARITY** — Slower and more irregular /pa-ta-ka/ repetition. One of the earliest detectable signs, present even in prodromal PD.

### What Makes PD Voice UNIQUE vs Other Conditions

- **vs Alzheimer's:** PD degrades the ACOUSTIC SIGNAL (motor output) while preserving LANGUAGE CONTENT. Alzheimer's degrades LANGUAGE CONTENT while preserving the ACOUSTIC SIGNAL. A PD patient says the right words poorly; an AD patient says the wrong words clearly.

- **vs Depression:** Both show reduced prosody (flat speech), but PD has MOTOR markers (jitter, shimmer, HNR, VSA changes, tremor, consonant imprecision) that are ABSENT in depression. Depression affects INITIATIVE and AFFECT but not motor execution.

- **vs Essential Tremor:** Both produce vocal tremor, but PD tremor is 4-7 Hz and irregular; ET tremor is 5-12 Hz and more regular. PD also has the full hypokinetic dysarthria profile (hypophonia, imprecise consonants, reduced VSA) which ET lacks.

- **vs Normal Aging:** Aging produces some voice changes (higher jitter/shimmer, slightly reduced F0 range), but the MAGNITUDE in PD is 2-5x greater, and features like vocal tremor, spirantization, and within-word pauses are pathological, not age-related.

---

## REFERENCES (Complete List)

1. Little MA, McSharry PE, Roberts SJ, Costello DAE, Moroz IM. Exploiting Nonlinear Recurrence and Fractal Scaling Properties for Voice Disorder Detection. BioMedical Engineering OnLine. 2007;6:23.

2. Little MA, McSharry PE, Hunter EJ, Spielman J, Ramig LO. Suitability of Dysphonia Measurements for Telemonitoring of Parkinson's Disease. IEEE Trans Biomed Eng. 2009;56(4):1015-1022.

3. Tsanas A, Little MA, McSharry PE, Ramig LO. Accurate Telemonitoring of Parkinson's Disease Progression by Noninvasive Speech Tests. IEEE Trans Biomed Eng. 2010;57(4):884-893.

4. Tsanas A, Little MA, McSharry PE, Spielman J, Ramig LO. Novel Speech Signal Processing Algorithms for High-Accuracy Classification of Parkinson's Disease. IEEE Trans Biomed Eng. 2012;59(5):1264-1271.

5. Sapir S, Ramig LO, Spielman JL, Fox C. Formant Centralization Ratio: A Proposal for a New Acoustic Measure of Dysarthric Speech. J Speech Lang Hear Res. 2010;53(1):114-125.

6. Rusz J, Cmejla R, Ruzickova H, Ruzicka E. Quantitative Acoustic Measurements for Characterization of Speech and Voice Disorders in Early Untreated Parkinson's Disease. J Acoust Soc Am. 2011;129(1):350-367.

7. Skodda S, Visser W, Schlegel U. Progression of Dysarthria and Dysphagia in Postmortem-confirmed Parkinsonian Disorders. J Neurol. 2011;258(1):81-86.

8. Rusz J, Cmejla R, Tykalova T, et al. Imprecise Vowel Articulation as a Potential Early Marker of Parkinson's Disease. J Acoust Soc Am. 2013;134(3):2171-2181.

9. Sakar BE, Isenkul ME, Sakar CO, et al. Collection and Analysis of a Parkinson Speech Dataset with Multiple Types of Sound Recordings. IEEE J Biomed Health Inform. 2013;17(4):828-834.

10. Harel BT, Cannizzaro MS, Cohen H, Reilly N, Snyder PJ. Acoustic Characteristics of Parkinsonian Speech: A Potential Biomarker of Early Disease Progression and Treatment. J Neurolinguistics. 2004;17(6):439-453.

11. Ramig LO, Sapir S, Countryman S, et al. Intensive Voice Treatment (LSVT) for Patients with Parkinson's Disease. J Neurol Neurosurg Psychiatry. 2001;71(4):493-498.

12. Orozco-Arroyave JR, Hoenig JC, Arias-Londono EA, et al. Automatic Detection of Parkinson's Disease in Running Speech Spoken in Three Different Languages. J Acoust Soc Am. 2016;139(1):481-500.

13. Hlavnicka J, Cmejla R, Tykalova T, et al. Automated Analysis of Connected Speech Reveals Early Biomarkers of Parkinson's Disease in Patients with REM Sleep Behaviour Disorder. Sci Rep. 2017;7:12.

14. Brabenec L, Mekyska J, Galaz Z, Rektorova I. Speech Disorders in Parkinson's Disease: Early Diagnostics and Effects of Medication and Brain Stimulation. J Neural Transm. 2017;124(3):303-334.

15. Vaiciukynas E, Verikas A, Gelzinis A, Bacauskiene M. Detecting Parkinson's Disease from Sustained Phonation and Speech Signals. Appl Math Comput. 2017;307:151-160.

16. Wroge TJ, Ozkanca Y, Demiroglu C, et al. Parkinson's Disease Diagnosis Using Machine Learning and Voice. IEEE SPMB. 2018.

17. Godino-Llorente JI, Alvarez-Marquina A, Gomez-Vilda P, et al. Towards the Identification of Idiopathic Parkinson's Disease from the Speech. PLoS ONE. 2017;12(12):e0189583.

18. Benba A, Jilbab A, Hammouch A. Analysis of Multiple Types of Voice Recordings in Cepstral Domain Using MFCC. Int J Speech Technol. 2016;19(3):449-456.

19. Tracy JM, Ozkanca Y, Atkins DC, Ghomi RH. Investigating Voice as a Biomarker. J Biomed Inform. 2020;104:103362.

20. Jeancolas L, Benali H, Benkelfat BE, et al. Automatic Detection of Early Stages of Parkinson's Disease through Acoustic Voice Analysis. ATSIP. 2021.

21. Galaz Z, Mekyska J, et al. Prosodic and Articulatory Features for Parkinson's Disease Detection from Connected Speech. Sensors. 2023;23(4):2186.

22. Moro-Velazquez L, Dehak N, et al. Phonation and Articulation Analysis for Differentiating Parkinson's Disease, Essential Tremor, and Healthy Speakers. Speech Commun. 2024.

23. Botelho C, et al. Cross-Lingual Pathological Speech Detection. INTERSPEECH. 2023.

24. Suppa A, Costantini G, et al. Voice Analysis as a Digital Biomarker for Parkinson's Disease. Mov Disord. 2024.

---

*Compiled from peer-reviewed literature through May 2025.*
*For integration with MemoVoice CVF Engine — Parkinson's disease extension module.*
