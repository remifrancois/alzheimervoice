# Depression Voice Biomarkers — Research Synthesis

## Source Studies (15 papers)

### Foundational
1. **Cummins et al. 2015** — Speech Communication. Review of 50+ studies. F0 SD, speaking rate, pause duration are core markers. Sensitivity 72%, Specificity 68%.
2. **Low et al. 2020** — Laryngoscope IO. Review of 127 studies. F0 range, energy variability, pause ratio. AUC 0.78-0.91.
3. **Quatieri & Williamson 2012-2014** — INTERSPEECH/AVEC. Vocal coordination, glottal features. AUC 0.73-0.82.
4. **AVEC 2019 Challenge** — 275 participants. F1=0.71, RMSE=4.89. eGeMAPS, COVAREP, deep features.
5. **Rejaibi et al. 2022** — Biomed Signal Processing. 189 DAIC-WOZ participants. MFCCs + LSTM. 84.2% / AUC 0.87.

### Clinical
6. **Alghowinem et al. 2013** — ICASSP. 60 participants. 82% (spontaneous speech). F0 SD, energy range, speaking rate.
7. **Yamamoto et al. 2020** — PLOS ONE. 138 participants. AUC 0.79. Response time, speech-to-pause ratio.
8. **Scherer et al. 2014** — INTERSPEECH. 60 participants. r=0.58 depression severity correlation. Jitter, HNR, H1-H2.
9. **Mundt et al. 2007** — J Neurolinguistics. 35 longitudinal patients. r=0.56. Percent pause time, speaking rate. Changes precede self-reported mood by 1 week.
10. **Cohn et al. 2009** — ACII. 57 participants. 79% voice-only. Switch pause duration (2.1s vs 0.8s).

### NLP/Deep Learning
11. **Zhang et al. 2022** — Computational Linguistics. Scoping review of 399 NLP studies. First-person singular pronouns, absolutist words, negative emotion words. BERT AUC 0.85-0.92.
12. **Ma et al. 2016** (DepAudioNet) — AVEC Workshop. ~200 participants. RMSE 8.12. CNN/LSTM on spectrograms.
13. **Harati et al. 2018** — INTERSPEECH. 76% three-way (HC/Depression/AD). Pause location is key differentiator.
14. **Dinkel et al. 2020** — DAIC-WOZ. F1=0.77. BERT embeddings.
15. **De Angel et al. 2022** — NPJ Digital Medicine. Review of 51 studies. AUC 0.78-0.85.

---

## Core Depression Voice Indicators

### Acoustic (19 indicators)
| ID | Indicator | Direction | Effect Size |
|----|-----------|-----------|-------------|
| DEP-A1 | F0 Mean | Decreased (lower pitch) | d=0.3-0.5 |
| DEP-A2 | F0 SD | Decreased (monotone) | d=0.5-0.8 |
| DEP-A3 | F0 Range | Decreased (compressed) | d=0.6-0.9 |
| DEP-A4 | Energy Mean | Decreased (quieter) | d=0.3-0.5 |
| DEP-A5 | Energy Range | Decreased | d=0.4-0.6 |
| DEP-A6 | Speaking Rate | Decreased (slower) | d=0.5-0.7 |
| DEP-A7 | Jitter | Increased | d=0.3-0.5 |
| DEP-A8 | Shimmer | Increased | d=0.3-0.4 |
| DEP-A9 | HNR | Decreased (breathier) | d=0.4-0.6 |
| DEP-A10 | H1-H2 | Increased (breathy phonation) | d=0.3-0.5 |
| DEP-A11 | Spectral Centroid | Decreased | d=0.2-0.4 |
| DEP-A12 | Spectral Flux | Decreased | d=0.3-0.5 |

### Linguistic (15 indicators)
| ID | Indicator | Direction | Evidence |
|----|-----------|-----------|----------|
| DEP-L1 | First-person singular pronouns (I/me/my) | Increased 20-40% | Very Strong (30+ studies) |
| DEP-L2 | Absolutist words (always/never/nothing) | Increased 50%+ | Strong |
| DEP-L3 | Negative emotion words | Increased 30-60% | Very Strong |
| DEP-L4 | Positive emotion words | Decreased 20-40% | Strong |
| DEP-L5 | Total word count | Decreased 20-50% | Strong |
| DEP-L6 | Sentence length | Decreased | Moderate |
| DEP-L7 | Past tense verbs ratio | Increased | Moderate |
| DEP-L8 | Social words | Decreased | Moderate |
| DEP-L9 | Death/dying words | Increased (severe cases) | Strong |

### Temporal (11 indicators)
| ID | Indicator | Direction | Effect Size |
|----|-----------|-----------|-------------|
| DEP-T1 | Response Latency | Increased 500-2000ms | d=0.5-0.7 |
| DEP-T2 | Percent Pause Time | Increased (up to 70% severe) | d=0.5-0.8 |
| DEP-T3 | Switch Pause Duration | Increased (2.1s vs 0.8s) | d=0.6-0.8 |
| DEP-T4 | Vocal Activity Ratio | Decreased 20-40% | d=0.4-0.6 |
| DEP-T5 | Pause Distribution | UNIFORMLY distributed | Qualitative |

### Semantic/Discourse
| ID | Indicator | Direction | Evidence |
|----|-----------|-----------|----------|
| DEP-S1 | Topic Narrowing | Decreased diversity | Strong |
| DEP-S2 | Rumination Markers | Present (repetitive negative themes) | Very Strong |
| DEP-S3 | Future References | Decreased | Strong |
| DEP-S4 | Referential Coherence | PRESERVED | Strong (key differentiator from AD) |
| DEP-S5 | Cued Recall Response | RESPONSIVE | Strong (key differentiator from AD) |

---

## Three Definitive Depression vs AD Discriminators

1. **Cued Recall Response**: Depression = preserved (memory IS stored, retrieval impaired by motivation). AD = impaired (memory trace degraded).
2. **Referential Coherence**: Depression = preserved (pronouns have clear referents). AD = degraded (pronouns float without referents).
3. **Onset Pattern**: Depression = all domains simultaneously suppressed, episodic, recoverable. AD = sequential cascade, progressive, irreversible.

---

## Treatment Response Trajectory

Depression vocal features show V-shaped recovery with treatment (Mundt 2007):
- Changes in vocal features PRECEDE self-reported mood improvement by ~1 week
- Treatment responders show normalization trajectory
- Non-responders show flat trajectory
- AD features show monotonic decline regardless of intervention
