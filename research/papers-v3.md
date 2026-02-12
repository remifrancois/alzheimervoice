# MemoVoice — Complete Research Bibliography
## 84 Papers Across V1, V2, V3

> Every indicator, every threshold, every cascade stage is traceable to a specific study.
> This is not a black box — it's an auditable clinical reasoning engine.

---

## CROSS-VERSION FOUNDATIONS (V1 + V2 + V3) — 12 Papers

These papers are referenced across all three versions of the CVF engine. They form the scientific backbone of MemoVoice.

### 1. Grober, E. & Buschke, H. (1987)
- **Title:** "Genuine Memory Deficits in Dementia"
- **Journal:** Developmental Neuropsychology, 3(1), 13-36
- **Versions:** V1, V2, V3
- **Contribution:** Gold-standard memory testing protocol. The Free and Cued Selective Reminding Test (FCSRT / RL/RI-16) is the foundation for the CVF Memory domain (M1 free recall, M2 cued recall, M3 recognition). The cascade Free → Cued → Recognition provides clinical-grade memory assessment through natural conversation. Used by the International Workgroup (IWG) since 2007 to define the memory impairment phenotype of AD.

### 2. Snowdon, D.A., Kemper, S., Mortimer, J.A., Greiner, L.H., Wekstein, D.R. & Markesbery, W.R. (1996)
- **Title:** "Linguistic Ability in Early Life and Cognitive Function and Alzheimer's Disease in Late Life: Findings from the Nun Study"
- **Journal:** JAMA, 275(7), 528-532
- **Versions:** V1, V2, V3
- **Contribution:** Established idea density (SEM_IDEA_DENSITY) as the single most powerful predictor of AD, detectable 60+ years before onset. 678 nuns studied; 80% with low idea density developed AD vs 10% with high. Neuropathological confirmation at autopsy. Foundation for CVF idea density feature.

### 3. Fraser, K.C., Meltzer, J.A. & Rudzicz, F. (2015)
- **Title:** "Linguistic Features Identify Alzheimer's Disease in Narrative Speech"
- **Journal:** Journal of Alzheimer's Disease, 49(2), 407-422
- **Versions:** V1, V2, V3
- **Contribution:** THE foundational paper for the entire CVF system. 370 linguistic features analyzed on DementiaBank Pitt Corpus. 81.92% accuracy, AUC 0.86. Factor analysis identified 5 main factors that map directly to CVF domains. Top features: TTR, information units, idea density, pronoun-to-noun ratio, Brunet's Index. Established the AD cascade: semantic → syntactic → discourse → pragmatic.

### 4. Pistono, A., Jucla, M., Barbeau, E.J. et al. (2016/2019)
- **Title:** "Pauses During Autobiographical Discourse Reflect Episodic Memory Processes in Early Alzheimer's Disease" (2016) / "What Happens When Nothing Happens? An Investigation of Pauses as a Compensatory Mechanism in Early Alzheimer's Disease" (2019)
- **Journal:** Journal of Alzheimer's Disease, 50(3), 687-698 (2016) / Neuropsychologia, 124, 133-143 (2019)
- **Versions:** V1, V2, V3
- **Contribution:** Within-clause pauses (especially before nouns) significantly increased in early AD. Within-clause pause duration correlated with hippocampal volume (r=-0.489). Pauses are a compensatory mechanism for word-finding difficulty. Pause LOCATION is more discriminative than pause frequency. AD: mid-utterance before content words. Depression: at clause boundaries.

### 5. Mueller, K.D. et al. (2018)
- **Title:** "Connected Speech and Language in Mild Cognitive Impairment and Alzheimer's Disease: A Review of Picture Description Tasks"
- **Journal:** Journal of Clinical and Experimental Neuropsychology, 40(9), 917-939
- **Versions:** V1, V2, V3
- **Contribution:** Systematic review of 35 studies. Lexical-semantic measures (d=0.8-1.2) have larger effect sizes than syntactic measures (d=0.5-0.8). Confirms the cascade: semantic first, syntactic later. Critical for disease progression staging.

### 6. Eyigoz, E., Mathur, S., Santamaria, M., Cecchi, G. & Naylor, M. (2020)
- **Title:** "Linguistic Markers Predict Onset of Alzheimer's Disease"
- **Journal:** EClinicalMedicine (The Lancet), 28, 100583
- **Versions:** V1, V2, V3
- **Contribution:** Framingham Heart Study. AUC 0.74 for predicting AD onset up to 7 years pre-diagnosis. Linguistic features from a single cookie-theft description outperformed APOE4 genetic status, demographics, and neuropsychological tests. Speech is more predictive than genetics.

### 7. Luz, S., Haider, F., de la Fuente, S., Fromm, D. & MacWhinney, B. (2020)
- **Title:** "Alzheimer's Dementia Recognition through Spontaneous Speech: The ADReSS Challenge"
- **Journal:** Proceedings of INTERSPEECH 2020. arXiv:2004.06833
- **Versions:** V1, V2, V3
- **Contribution:** Established the gold-standard benchmark. 78 AD + 78 healthy controls, balanced for age and gender. Best accuracy 89.6%. Text-based features consistently outperform acoustic-only. 34 teams participated globally.

### 8. Robin, J. et al. (2023)
- **Title:** "Automated Detection of Progressive Speech Changes in Early Alzheimer's Disease"
- **Journal:** Alzheimer's & Dementia: Diagnosis, Assessment & Disease Monitoring
- **Versions:** V1, V2, V3
- **Contribution:** The architectural blueprint for the weekly composite score. 9-variable speech composite (speech rate, articulation rate, pause-to-word ratio, mean pause duration, TTR, information units/min, pronoun ratio, MLU, semantic coherence). Correlated r=0.71 with MMSE change over 18 months. Remote phone-based assessment comparable to in-clinic.

### 9. Kurtz, A. et al. (2023)
- **Title:** "Early Detection of Cognitive Decline Using Voice Assistant Commands"
- **Journal:** ICASSP 2023 — IEEE International Conference on Acoustics, Speech and Signal Processing
- **Versions:** V1, V2, V3
- **Contribution:** 74.7% three-way classification (DM/MCI/HC). Longitudinal 18 months. Validated remote voice interaction as assessment modality. Longitudinal data improves F1 by 12-13%. Interaction failure rate was a novel predictive feature.

### 10. Young, A.L. et al. (2024)
- **Title:** "Speech Patterns During Memory Recall Relates to Early Tau Burden Across Adulthood"
- **Journal:** Alzheimer's & Dementia, 20(4), 2552-2563
- **Versions:** V1, V2, V3
- **Contribution:** 238 cognitively normal adults from Framingham Heart Study. Speech changes (slower speaking, longer/more frequent pauses) correlate with tau protein BEFORE cognitive symptoms. Memory test scores were NOT associated with tau — but speech patterns WERE. Detectable in people in their 40s. Validates 10-20 year pre-symptomatic detection window.

### 11. Amini, S. et al. (2024)
- **Title:** "Prediction of Alzheimer's Disease Progression Within 6 Years Using Speech"
- **Journal:** Alzheimer's & Dementia. DOI: 10.1002/alz.13886
- **Versions:** V1, V2, V3
- **Contribution:** Framingham Heart Study. 78.5% accuracy, 81.1% sensitivity predicting MCI-to-AD progression within 6 years. Pause frequency strongest acoustic predictor; idea density strongest linguistic predictor. Used only language structure from transcripts, NOT acoustic properties.

### 12. Chou, C.-J., Chang, C.-T., Chang, Y.-N. et al. (2024)
- **Title:** "Screening for Early Alzheimer's Disease: Enhancing Diagnosis with Linguistic Features and Biomarkers"
- **Journal:** Frontiers in Aging Neuroscience, 16, 1451326
- **Versions:** V1, V2, V3
- **Contribution:** Up to 88% accuracy with just 2 features: MLU + LPR (Long Pause Ratio). LPR correlates with hippocampal volume (r=-0.489). Demonstrates that even minimal feature sets achieve clinical-grade accuracy.

---

## ALZHEIMER'S / MCI DETECTION — 30 Additional Papers

### 13. Becker, J.T., Boller, F., Lopez, O., Saxton, J. & McGonigle, K. (1994)
- **Title:** "The Natural History of Alzheimer's Disease: Description of Study Cohort and Accuracy of Diagnosis"
- **Journal:** Archives of Neurology, 51(6), 585-594
- **Versions:** V2
- **Contribution:** Created the DementiaBank Pitt Corpus (Cookie Theft picture description) — the foundation dataset for virtually all speech-based AD detection research.

### 14. Kemper, S., Greiner, L.H., Marquis, J.G., Prenovost, K. & Mitzner, T.L. (2001)
- **Title:** "Longitudinal Change in Language Production: Effects of Aging and Dementia on Grammatical Complexity and Propositional Content"
- **Journal:** Psychology and Aging, 16(4), 600-614
- **Versions:** V2
- **Contribution:** Nun Study follow-up. Idea density declines faster in AD (-0.21/year vs -0.06 in healthy aging). Validated MLU, TTR, and embedding depth as longitudinal tracking features.

### 15. Garrard, P., Maloney, L.M., Hodges, J.R. & Patterson, K. (2005)
- **Title:** "The Effects of Very Early Alzheimer's Disease on the Characteristics of Writing by a Renowned Author"
- **Journal:** Brain, 128(2), 250-260
- **Versions:** V2
- **Contribution:** Analyzed Iris Murdoch's novels. Final novel (3 years before diagnosis) showed reduced TTR and increased word frequency while syntax remained intact. Confirmed lexical decline precedes syntactic decline.

### 16. Lopez-de-Ipina, K., Alonso, J.B., Travieso, C.M. et al. (2013)
- **Title:** "On the Selection of Non-Invasive Methods Based on Speech Analysis Oriented to Automatic Alzheimer Disease Diagnosis"
- **Journal:** Sensors, 13(5), 6730-6745
- **Versions:** V2
- **Contribution:** Introduced "Emotional Temperature" composite measure. 84.8% AD vs HC, 72% MCI vs HC.

### 17. Ahmed, S., de Jager, A.-M., Haigh, A.-F. & Garrard, P. (2013)
- **Title:** "Connected Speech as a Marker of Disease Progression in Autopsy-Proven Alzheimer's Disease"
- **Journal:** Brain, 136(12), 3727-3737
- **Versions:** V2
- **Contribution:** 15 autopsy-confirmed AD patients. Linguistic measures correlated with tau burden in temporal lobe. Confirmed the cascade: semantic → lexical → syntactic → discourse.

### 18. Konig, A., Satt, A., Sorin, A. et al. (2015)
- **Title:** "Automatic Speech Analysis for the Assessment of Patients with Predementia and Alzheimer's Disease"
- **Journal:** Alzheimer's & Dementia: DADM, 1(1), 112-124
- **Versions:** V2
- **Contribution:** 87% AD vs HC, 79% MCI vs HC. Detailed acoustic feature taxonomy (jitter, shimmer, HNR, formants, MFCCs). Temporal features most discriminative.

### 19. Szatloczki, G., Hoffmann, I., Vincze, V. & Kalman, J. (2015)
- **Title:** "Speaking in Alzheimer's Disease, Is That an Early Sign?"
- **Journal:** Frontiers in Aging Neuroscience, 7, 195
- **Versions:** V2
- **Contribution:** Review of 40+ studies. Established feature sensitivity hierarchy: early (semantic fluency, word-finding pauses, idea density), moderate (TTR, MLU, fillers), late (syntactic errors, echolalia).

### 20. Yancheva, M. & Rudzicz, F. (2016)
- **Title:** "Vector-Space Topic Models for Detecting Alzheimer's Disease"
- **Journal:** Proceedings of ACL 2016
- **Versions:** V2
- **Contribution:** 80% accuracy. AD patients show higher topic entropy (disorganized) and lower topic coherence.

### 21. Orimaye, S.O., Wong, J.S.M. & Golden, K.J. (2017)
- **Title:** "Predicting Probable Alzheimer's Disease Using Linguistic Deficits and Biomarkers"
- **Journal:** BMC Bioinformatics, 18(34)
- **Versions:** V2
- **Contribution:** 79.3% accuracy. POS tag distribution (lower nouns, higher pronouns) strongly predictive.

### 22. Toth, L., Gosztolya, G., Vincze, V. et al. (2018)
- **Title:** "A Speech Recognition-based Solution for the Automatic Detection of Mild Cognitive Impairment from Spontaneous Speech"
- **Journal:** Current Alzheimer Research, 15(2), 130-138
- **Versions:** V2
- **Contribution:** Hungarian language. 82% AD vs HC, 72% MCI vs HC. Features generalize across languages when normalized.

### 23. Voleti, R., Liss, J.M. & Berisha, V. (2019)
- **Title:** "A Review of Automated Speech and Language Features for Assessment of Cognitive and Thought Disorders"
- **Journal:** IEEE Journal of Selected Topics in Signal Processing, 14(2), 282-298
- **Versions:** V2
- **Contribution:** Established 5-level feature taxonomy: acoustic → disfluency → lexical → syntactic → discourse.

### 24. Balagopalan, A., Eyre, B., Rudzicz, F. & Novikova, J. (2020)
- **Title:** "To BERT or Not to BERT: Comparing Speech and Language-Based Approaches for Alzheimer's Disease Detection"
- **Journal:** Proceedings of Interspeech 2020
- **Versions:** V2
- **Contribution:** 89.6% (BERT + traditional), 83.3% (BERT alone), 81.3% (traditional alone). BERT captures contextual patterns traditional features miss.

### 25. Yuan, J., Bian, Y., Cai, X., Huang, J., Ye, Z. & Church, K. (2020)
- **Title:** "Disfluencies and Fine-Tuning Pre-Trained Language Models for Detection of Alzheimer's Disease"
- **Journal:** Proceedings of Interspeech 2020
- **Versions:** V2
- **Contribution:** 89.6% accuracy. Inserting pause/disfluency markers into text before BERT encoding improves performance.

### 26. Haider, F., de la Fuente, S. & Luz, S. (2020)
- **Title:** "An Assessment of Paralinguistic Acoustic Features for Detection of Alzheimer's Dementia in Spontaneous Speech"
- **Journal:** Journal of Alzheimer's Disease, 78(4), 1523-1538
- **Versions:** V2
- **Contribution:** 76% acoustic-only. eGeMAPS (88 features) analysis. Temporal features most discriminative. Recommended eGeMAPS as standardized set.

### 27. de la Fuente Garcia, S., Ritchie, C.W. & Luz, S. (2020)
- **Title:** "Artificial Intelligence, Speech, and Language Processing Approaches to Monitoring Alzheimer's Disease: A Systematic Review"
- **Journal:** Journal of Alzheimer's Disease, 78(4), 1547-1574
- **Versions:** V2
- **Contribution:** Reviewed 51 studies. Most frequently used features: speech rate (42/51), pauses (38/51), POS distribution (35/51), TTR (33/51).

### 28. Petti, U., Baker, S. & Korhonen, A. (2020)
- **Title:** "A Systematic Literature Review of Automatic Alzheimer's Disease Detection from Speech and Language"
- **Journal:** JAMIA, 27(11), 1784-1797
- **Versions:** V2
- **Contribution:** Reviewed 30 studies. Most discriminative: information units, pause rate, TTR, idea density.

### 29. Martinc, M. et al. (2021)
- **Title:** (Temporal integration for ADReSS — best follow-up result)
- **Versions:** V1, V2
- **Contribution:** Achieved 93.8% accuracy on ADReSS challenge using temporal integration.

### 30. Luz, S. et al. (2021)
- **Title:** "Detecting Cognitive Decline Using Speech Only: The ADReSSo Challenge"
- **Journal:** Proceedings of Interspeech 2021
- **Versions:** V2
- **Contribution:** 237 samples, speech-only (no manual transcripts). Best 78.9%. wav2vec 2.0 and HuBERT showed promise.

### 31. Pappagari, R., Cho, J., Moro-Velazquez, L. & Dehak, N. (2021)
- **Title:** "Automatic Detection and Assessment of Alzheimer Disease Using Speech and Language Technologies"
- **Journal:** Proceedings of Interspeech 2021
- **Versions:** V2
- **Contribution:** 85.4% accuracy using ensemble of acoustic + linguistic. x-vector speaker embeddings carried cognitive status information.

### 32. Gauder, L., Pepino, L., Ferrer, L. & Riera, P. (2021)
- **Title:** "Alzheimer Disease Recognition Using Speech-Based Embeddings From Pre-Trained Models"
- **Journal:** Proceedings of Interspeech 2021
- **Versions:** V2
- **Contribution:** 83.1% using wav2vec 2.0 embeddings without explicit feature engineering.

### 33. Agbavor, F. & Liang, H. (2022)
- **Title:** "Predicting Dementia from Spontaneous Speech Using Large Language Models"
- **Journal:** PLOS Digital Health
- **Versions:** V2
- **Contribution:** 84.4% text-only, 85.6% fusion. GPT-3 embeddings capture almost as much as hand-crafted features.

### 34. Kavanaugh, K. et al. (2022)
- **Title:** "Natural Language Processing in the Assessment of Alzheimer's Disease"
- **Versions:** V2
- **Contribution:** Identified 10 most discriminative features consistently across DementiaBank studies.

### 35. Nagumo, R. et al. (2022)
- **Title:** "Automatic Detection of Cognitive Decline in Alzheimer's Disease Using Telephone Speech"
- **Versions:** V2
- **Contribution:** Telephone assessment retains enough signal for screening. Linguistic features unaffected by phone codec.

### 36. Bertini, F. et al. (2022)
- **Title:** "Automatic Speech Analysis for the Assessment of Patients with Alzheimer's Disease in the Italian Language"
- **Versions:** V2
- **Contribution:** Validated cross-linguistic applicability in Italian.

### 37. Li, R. et al. (2023)
- **Title:** "GPT-Based Detection of Alzheimer's Disease from Clinical Conversations"
- **Versions:** V2
- **Contribution:** LLMs achieve ~80% accuracy in zero-shot AD detection from transcripts.

### 38. Vrahatis, A.G. et al. (2023)
- **Title:** "Machine Learning Approaches for Alzheimer's Disease Detection from Speech"
- **Versions:** V2
- **Contribution:** SVM 80-89%; Transformer-based 83-93%; Ensemble 85-93%.

### 39. SpeechDx — Alzheimer's Drug Discovery Foundation (2023-ongoing)
- **Title:** "SpeechDx: A Gold-Standard Speech-and-Language Dataset for Prognostic AD Biomarker Development"
- **Versions:** V1, V2
- **Contribution:** 2,650 participants, 5 sites, 3 countries. 3-year longitudinal. Paired with MRI, blood-biomarker amyloid status. Largest ongoing speech-biomarker study.

### 40. SIDE-AD — University of Edinburgh & Sony Research (2024)
- **Title:** "SIDE-AD: Longitudinal Observational Cohort Study"
- **Journal:** PMC10982798
- **Versions:** V1, V2
- **Contribution:** 450 participants. Validates remote longitudinal collection. 88%+ AD accuracy, 80%+ MCI.

### 41. Shakeri, A., Farmanbar, M. & Balog, K. (2025)
- **Title:** "MultiConAD: A Unified Multilingual Conversational Dataset for Early Alzheimer's Detection"
- **Journal:** arXiv:2502.19208. University of Stavanger.
- **Versions:** V1, V2
- **Contribution:** 16 datasets unified, 4 languages. Core biomarkers (TTR, pause rate, idea density) consistent cross-linguistically.

---

## DEPRESSION VOICE BIOMARKERS — 15 Papers

### 42. Mundt, J.C., Snyder, P.J., Cannizzaro, M.S., Chappie, K. & Geralts, D.S. (2007)
- **Title:** "Voice Acoustic Measures of Depression Severity and Treatment Response"
- **Journal:** Journal of Neurolinguistics, 20(1), 50-64
- **Versions:** V3
- **Contribution:** 35 longitudinal patients. Vocal features PRECEDE self-reported mood improvement by ~1 week. Percent pause time r=0.56. Treatment responders show normalization trajectory; non-responders show flat trajectory.

### 43. Cohn, J.F., Kruez, T.S., Matthews, I. et al. (2009)
- **Title:** "Detecting Depression from Facial Actions and Vocal Prosody"
- **Journal:** ACII 2009
- **Versions:** V3
- **Contribution:** 57 participants, 79% voice-only. Switch pause duration (2.1s vs 0.8s) key depression indicator.

### 44. Quatieri, T.F. & Williamson, J.R. (2012-2014)
- **Title:** "Vocal-Source Biomarkers for Depression: A Link to Psychomotor Activity"
- **Journal:** INTERSPEECH / AVEC Workshops
- **Versions:** V3
- **Contribution:** AUC 0.73-0.82. Depression linked to psychomotor retardation: reduced articulatory coordination, increased glottal open quotient.

### 45. Alghowinem, S., Goecke, R., Wagner, M. et al. (2013)
- **Title:** "Detecting Depression: A Comparison Between Spontaneous and Read Speech"
- **Journal:** ICASSP 2013
- **Versions:** V3
- **Contribution:** 60 participants, 82% spontaneous speech. Spontaneous speech more informative than read speech for depression.

### 46. Scherer, S., Stratou, G., Gratch, J. & Morency, L.-P. (2014)
- **Title:** "Investigating Voice Quality as a Speaker-Independent Indicator of Depression and PTSD"
- **Journal:** INTERSPEECH 2014
- **Versions:** V3
- **Contribution:** 60 participants. Voice quality features (jitter, HNR, H1-H2) are speaker-independent depression markers, r=0.58.

### 47. Cummins, N., Scherer, S., Krajewski, J., Schnieder, S., Epps, J. & Quatieri, T.F. (2015)
- **Title:** "A Review of Depression and Suicide Risk Assessment Using Speech Analysis"
- **Journal:** Speech Communication, 71, 10-49
- **Versions:** V3
- **Contribution:** Review of 50+ studies. Core markers: reduced F0 variability, slower speaking rate, increased pause duration. Sensitivity 72%, Specificity 68%.

### 48. Ma, X., Yang, H., Chen, Q., Huang, D. & Wang, Y. (2016) — DepAudioNet
- **Title:** "DepAudioNet: An Efficient Deep Model for Audio Based Depression Classification"
- **Journal:** AVEC Workshop 2016
- **Versions:** V3
- **Contribution:** ~200 participants, RMSE 8.12. CNN/LSTM on raw spectrograms. Attention focuses on low-energy segments and pause transitions.

### 49. Harati, A., Gollapalli, S. & Satt, A. (2018)
- **Title:** "Speech-Based Depression and Neurodegenerative Disease Classification"
- **Journal:** INTERSPEECH 2018
- **Versions:** V3
- **Contribution:** 76% three-way (HC/Depression/AD). Key: pause location differentiates depression (uniform) from AD (before content words). Content quality: depression = coherent but reduced volume; AD = increased volume but reduced quality.

### 50. AVEC 2019 Challenge (2019)
- **Title:** "AVEC 2019 Workshop and Challenge"
- **Journal:** AVEC Workshop 2019
- **Versions:** V3
- **Contribution:** 275 participants. F1=0.71, RMSE=4.89. eGeMAPS, COVAREP, deep features.

### 51. Low, D.M., Bentley, K.H. & Ghosh, S.S. (2020)
- **Title:** "Automated Assessment of Psychiatric Disorders Using Speech: A Systematic Review"
- **Journal:** Laryngoscope Investigative Otolaryngology, 5(1), 96-116
- **Versions:** V3
- **Contribution:** Review of 127 studies. Depression accuracies 60-91%. Most consistent: reduced F0 range, reduced energy variability, increased pause-to-speech ratio.

### 52. Yamamoto, M., Takamiya, A., Sawada, K. et al. (2020)
- **Title:** "Using Speech Recognition Technology to Investigate the Association Between Timing-Related Speech Features and Depression Severity"
- **Journal:** PLOS ONE, 15(9), e0238726
- **Versions:** V3
- **Contribution:** 138 participants, AUC 0.79. Response time r=0.42 with depression severity. After 8 weeks SSRI treatment, timing features normalized.

### 53. Dinkel, H., Wu, M. & Yu, K. (2020)
- **Title:** "Text-Based Depression Detection on Sparse Data"
- **Journal:** arXiv (DAIC-WOZ analysis)
- **Versions:** V3
- **Contribution:** 275 DAIC-WOZ participants. F1=0.77. BERT embeddings, attention-weighted features.

### 54. De Angel, V., Lewis, S., White, K. et al. (2022)
- **Title:** "Digital Health Tools for the Passive Monitoring of Depression: A Systematic Review of Methods"
- **Journal:** NPJ Digital Medicine, 5(1), 3
- **Versions:** V3
- **Contribution:** Review of 51 studies. Voice features detect depression onset 2-4 weeks before self-report. Combined voice + behavioral: AUC 0.78-0.85.

### 55. Rejaibi, E., Komaty, A., Meriaudeau, F., Agrebi, S. & Othmani, A. (2022)
- **Title:** "MFCC-based Recurrent Neural Network for Automatic Clinical Depression Recognition"
- **Journal:** Biomedical Signal Processing and Control, 73, 103372
- **Versions:** V3
- **Contribution:** 189 DAIC-WOZ participants. 84.2% accuracy, AUC 0.87 using MFCCs + bidirectional LSTM.

### 56. Zhang, T., Schoene, A.M., Ji, S. & Ananiadou, S. (2022)
- **Title:** "Natural Language Processing Applied to Mental Health: A Recent Scoping Review"
- **Journal:** Computational Linguistics, 48(4), 781-816
- **Versions:** V3
- **Contribution:** Scoping review of 399 NLP studies. First-person singular pronouns (increased 20-40%), absolutist words (increased 50%+), negative emotion words (increased 30-60%). BERT AUC 0.85-0.92. Topic narrowing consistent marker.

---

## PARKINSON'S DISEASE VOICE BIOMARKERS — 25 Papers

### 57. Ramig, L.O., Sapir, S., Countryman, S. et al. (2001)
- **Title:** "Intensive Voice Treatment (LSVT) for Patients with Parkinson's Disease"
- **Journal:** Journal of Neurology, Neurosurgery & Psychiatry, 71(4), 493-498
- **Versions:** V3
- **Contribution:** Established hypophonia (65-68 dB SPL vs 72-76 dB normal) as the cardinal PD voice feature. Present in 70-89% at diagnosis. Patients often UNAWARE of reduced loudness.

### 58. Harel, B.T., Cannizzaro, M.S., Cohen, H., Reilly, N. & Snyder, P.J. (2004)
- **Title:** "Acoustic Characteristics of Parkinsonian Speech: A Potential Biomarker of Early Disease Progression"
- **Journal:** Journal of Neurolinguistics, 17(6), 439-453
- **Versions:** V3
- **Contribution:** Reduced intensity range (monoloudness) most discriminative single feature. 82.1% accuracy.

### 59. Little, M.A., McSharry, P.E., Moroz, I.M. & Roberts, S.J. (2007)
- **Title:** "Exploiting Nonlinear Recurrence and Fractal Scaling Properties for Voice Disorder Detection"
- **Journal:** BioMedical Engineering OnLine, 6:23
- **Versions:** V3
- **Contribution:** Introduced RPDE and DFA. RPDE 91.8% alone; combined 94.2%.

### 60. Little, M.A., McSharry, P.E., Roberts, S.J., Costello, D.A.E. & Moroz, I.M. (2009)
- **Title:** "Suitability of Dysphonia Measurements for Telemonitoring of Parkinson's Disease"
- **Journal:** IEEE Transactions on Biomedical Engineering, 56(4), 1015-1022
- **Versions:** V3
- **Contribution:** Oxford Parkinson's Voice Study. 91.4% SVM. Introduced PPE (Pitch Period Entropy) as the most discriminative single PD feature. Remote telemonitoring feasible.

### 61. Sapir, S., Ramig, L.O., Spielman, J.L. & Fox, C. (2010)
- **Title:** "Formant Centralization Ratio: A Proposal for a New Acoustic Measure of Dysarthric Speech"
- **Journal:** JSLHR, 53(1), 114-125
- **Versions:** V3
- **Contribution:** Introduced FCR. 90.5% from single measure. PD FCR 1.18 vs 1.01 controls. VSA reduced 30-40%.

### 62. Tsanas, A., Little, M.A., McSharry, P.E. & Ramig, L.O. (2010)
- **Title:** "Accurate Telemonitoring of Parkinson's Disease Progression by Noninvasive Speech Tests"
- **Journal:** IEEE Transactions on Biomedical Engineering, 57(4), 884-893
- **Versions:** V3
- **Contribution:** 42 patients, 5,875 recordings. Voice predicts UPDRS motor scores (R-squared=0.70). Daily telemonitoring.

### 63. Rusz, J., Cmejla, R., Ruzickova, H. & Ruzicka, E. (2011)
- **Title:** "Quantitative Acoustic Measurements for Characterization of Speech and Voice Disorders in Early Untreated Parkinson's Disease"
- **Journal:** Journal of the Acoustical Society of America, 129(1), 350-367
- **Versions:** V3
- **Contribution:** 85.9% in early untreated PD (H&Y 1-2). Articulatory deficits appear BEFORE phonation deficits.

### 64. Skodda, S., Visser, W. & Schlegel, U. (2011)
- **Title:** "Progression of Dysarthria and Dysphagia in Postmortem-confirmed Parkinsonian Disorders"
- **Journal:** Journal of Neurology, 258(1), 81-86
- **Versions:** V3
- **Contribution:** 168 PD patients, longitudinal. Speech rate declines 3-5%/year. Changes preceded motor milestones by 6-12 months.

### 65. Tsanas, A., Little, M.A., McSharry, P.E., Spielman, J. & Ramig, L.O. (2012)
- **Title:** "Novel Speech Signal Processing Algorithms for High-Accuracy Classification of Parkinson's Disease"
- **Journal:** IEEE Transactions on Biomedical Engineering, 59(5), 1264-1271
- **Versions:** V3
- **Contribution:** 99.0% accuracy on UCI dataset, AUC=0.99. The 22-feature MDVP set became the standard. Feature importance: PPE > spread1 > RPDE > DFA > shimmer > jitter.

### 66. Rusz, J. et al. (2013)
- **Title:** "Imprecise Vowel Articulation as a Potential Early Marker of Parkinson's Disease"
- **Journal:** JASA, 134(3), 2171-2181
- **Versions:** V3
- **Contribution:** VSA reduced 25-30% in early PD. Proposed as pre-clinical screening marker.

### 67. Sakar, B.E. et al. (2013)
- **Title:** "Collection and Analysis of a Parkinson Speech Dataset with Multiple Types of Sound Recordings"
- **Journal:** IEEE JBHI, 17(4), 828-834
- **Versions:** V3
- **Contribution:** Istanbul PD Dataset. 86% from sustained vowels; 92% combined.

### 68. Benba, A., Jilbab, A. & Hammouch, A. (2016)
- **Title:** "Analysis of Multiple Types of Voice Recordings in Cepstral Domain Using MFCC"
- **Journal:** International Journal of Speech Technology, 19(3), 449-456
- **Versions:** V3
- **Contribution:** MFCC analysis. 91.3% from running speech. Low-order MFCCs capture vocal tract resonance.

### 69. Orozco-Arroyave, J.R. et al. (2016)
- **Title:** "Automatic Detection of Parkinson's Disease in Running Speech Spoken in Three Different Languages"
- **Journal:** JASA, 139(1), 481-500
- **Versions:** V3
- **Contribution:** Cross-language (Spanish/German/Czech). Up to 97% within-language. VSA, FCR highly discriminative cross-linguistically.

### 70. Brabenec, L., Mekyska, J., Galaz, Z. & Rektorova, I. (2017)
- **Title:** "Speech Disorders in Parkinson's Disease: Early Diagnostics and Effects of Medication and Brain Stimulation"
- **Journal:** Journal of Neural Transmission, 124(3), 303-334
- **Versions:** V3
- **Contribution:** Review of 100+ studies. Hypokinetic dysarthria affects 70-90% of PD. Speech changes may precede motor symptoms by 5+ years.

### 71. Godino-Llorente, J.I. et al. (2017)
- **Title:** "Towards the Identification of Idiopathic Parkinson's Disease from the Speech"
- **Journal:** PLoS ONE, 12(12): e0189583
- **Versions:** V3
- **Contribution:** Glottal-level kinetic features: OQ, NAQ. 94.3% combined. OQ elevated in PD.

### 72. Hlavnicka, J., Cmejla, R., Tykalova, T. et al. (2017)
- **Title:** "Automated Analysis of Connected Speech Reveals Early Biomarkers of Parkinson's Disease in Patients with Rapid Eye Movement Sleep Behaviour Disorder"
- **Journal:** Scientific Reports, 7:12
- **Versions:** V3
- **Contribution:** PRODROMAL detection. iRBD patients show speech changes 5-10 years before motor diagnosis. AUC=0.85 prodromal; 0.93 early PD. Strongest evidence for speech as pre-motor PD marker.

### 73. Vaiciukynas, E. et al. (2017)
- **Title:** "Detecting Parkinson's Disease from Sustained Phonation and Speech Signals"
- **Journal:** Applied Mathematics and Computation, 307, 151-160
- **Versions:** V3
- **Contribution:** CNN features 92.3%; ensemble 94.1%. Deep learning on raw spectrograms captures beyond hand-crafted features.

### 74. Wroge, T.J. et al. (2018)
- **Title:** "Parkinson's Disease Diagnosis Using Machine Learning and Voice"
- **Journal:** IEEE SPMB
- **Versions:** V3
- **Contribution:** mPower dataset, 5,826 participants. 85.3%, AUC 0.89. CPP (Cepstral Peak Prominence) as strong marker. Smartphone recordings sufficient.

### 75. Tracy, J.M., Ozkanca, Y., Atkins, D.C. & Ghomi, R.H. (2020)
- **Title:** "Investigating Voice as a Biomarker: Deep Phenotyping Methods for Early Detection of Parkinson's Disease"
- **Journal:** Journal of Biomedical Informatics, 104, 103362
- **Versions:** V3
- **Contribution:** mPower, 1,800 participants. AUC 0.87. eGeMAPS as efficient standardized PD feature set.

### 76. Jeancolas, L. et al. (2021)
- **Title:** "Automatic Detection of Early Stages of Parkinson's Disease through Acoustic Voice Analysis"
- **Versions:** V3
- **Contribution:** Prodromal (RBD) vs controls: 74.2% (AUC 0.80); Early PD: 89.1% (AUC 0.94). MFCC from spontaneous speech most informative for prodromal detection.

### 77. Botelho, C. et al. (2023)
- **Title:** "Cross-Lingual Pathological Speech Detection"
- **Journal:** INTERSPEECH 2023
- **Versions:** V3
- **Contribution:** 400+ subjects, 4 languages. Within-language 85-92%; cross-language 75-82%. Multilingual self-supervised models enable cross-lingual PD detection.

### 78. Galaz, Z., Mekyska, J. et al. (2023)
- **Title:** "Prosodic and Articulatory Features for Parkinson's Disease Detection from Connected Speech"
- **Journal:** Sensors, 23(4), 2186
- **Versions:** V3
- **Contribution:** 89.3% (AUC 0.93). PVI rhythm metrics show PD produces "metronomic" speech. DDK regularity highly discriminative.

### 79. Moro-Velazquez, L., Dehak, N. et al. (2024)
- **Title:** "Phonation and Articulation Analysis for Differentiating Parkinson's Disease, Essential Tremor, and Healthy Speakers"
- **Journal:** Speech Communication
- **Versions:** V3
- **Contribution:** PD vs HC: 91%; PD vs ET: 83%. PD tremor 4-7 Hz vs ET tremor 5-12 Hz.

### 80. Suppa, A., Costantini, G. et al. (2024)
- **Title:** "Voice Analysis as a Digital Biomarker for Parkinson's Disease"
- **Journal:** Movement Disorders (review)
- **Versions:** V3
- **Contribution:** Voice classified as Tier 1 digital biomarker by the Movement Disorder Society. Smartphone-based 80-90% accuracy.

### 81. Tong, Z. et al. / Various Groups (2024)
- **Title:** "Leveraging Pre-trained Speech Models for Parkinson's Disease Detection"
- **Journal:** Various (IEEE, INTERSPEECH)
- **Versions:** V3
- **Contribution:** 88-95% accuracy using Wav2Vec 2.0, HuBERT, Whisper. Self-supervised representations reduce need for domain-specific feature engineering.

---

## NORMS DATABASES — 3 References

### 82. Covington, M.A. & McFall, J.D. (2010)
- **Contribution:** MATTR (Moving Average Type-Token Ratio) — robust vocabulary diversity measure.

### 83. Kuperman, V. et al. (2012)
- **Contribution:** Word Age of Acquisition norms used for lexical indicators.

### 84. Brysbaert, M. et al. (2014)
- **Contribution:** Word concreteness norms (1-5 scale) for the word concreteness indicator.

---

## SUMMARY

| Category | Papers | Key Accuracy Range |
|----------|--------|--------------------|
| **Cross-version foundations** | 12 | 78-93.8% |
| **Alzheimer's / MCI** | 30 | 72-93.8% (AD), 62-85% (MCI) |
| **Depression** | 15 | 60-91% (AUC 0.73-0.92) |
| **Parkinson's** | 25 | 80-99% (acoustic), 74-94% (prodromal) |
| **Norms databases** | 3 | — |
| **TOTAL** | **84 + 3 = 87** | |

### Detection Timelines

| Study | Condition | How Far Before Diagnosis |
|-------|-----------|-------------------------|
| Snowdon 1996 | AD | **60+ years** (idea density from age 22) |
| Young 2024 | AD (tau) | **10-20 years** (speech changes in 40-year-olds) |
| Eyigoz 2020 | AD | **7-10 years** |
| Amini 2024 | MCI→AD | **6 years** |
| Pistono 2016 | AD | **2-5 years** |
| Hlavnicka 2017 | PD | **5-10 years** (iRBD → PD conversion) |
| Rusz 2011 | PD | **Early untreated** (H&Y 1-2) |
| Mundt 2007 | Depression | **1 week** (vocal changes precede self-report) |

### The Three-Way Differential (AD vs Depression vs PD)

| Feature | Alzheimer's | Depression | Parkinson's |
|---------|------------|------------|-------------|
| **What degrades** | WHAT they say (language) | WHETHER they speak (motivation) | HOW they say it (motor) |
| **Coherence** | Degraded | Preserved | Preserved |
| **Cued recall** | Fails | Responds | Responds |
| **Vocabulary** | Shrinks | Narrowed but intact | Preserved |
| **Pitch variation** | Preserved early | Monotone (affect) | Monotone (motor) |
| **Jitter/Shimmer** | Normal | Slightly elevated | Significantly elevated |
| **Pause location** | Mid-utterance (word-finding) | At boundaries (psychomotor) | Pre-utterance (initiation) |
| **Course** | Progressive cascade | Episodic, treatable | Gradual motor |
| **Self-correction** | Declining | Preserved | Preserved |

---

*"Every indicator, every threshold, every cascade stage — traceable to a specific study."*

*La voix se souvient de ce que l'esprit oublie.*
