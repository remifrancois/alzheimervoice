# AlzheimerVoice

### 🏆 Cerebral Valley × Anthropic Hackathon — February 2026

> *"The voice remembers what the mind forgets."*

**[alzheimervoice.org](https://alzheimervoice.org)** — Public site, live demo, science, open source

**[Try the Live Demo →](https://alzheimervoice.org/demo)** — Record 30 seconds of speech, get an instant 11-domain cognitive voice analysis.

**[CVF Engine (open source) →](https://github.com/remifrancois/cognitivevoicefingerprint)** — 107 indicators, 11 domains, 35 rules, 11 conditions, 84+ studies.

---

55 million people live with Alzheimer's worldwide — most diagnosed years too late, after irreversible neural damage. Research shows speech patterns change up to 7.6 years before clinical diagnosis (Eyigoz 2020). AlzheimerVoice detects early signs of Alzheimer's disease, Parkinson's, depression, Lewy Body Dementia, Frontotemporal Dementia, and 6 other conditions through voice analysis alone.

The V5 "deep_voice" engine extracts a 107-indicator **Cognitive Voice Fingerprint (CVF)** from natural speech using multimodal analysis (acoustic + Whisper transcription + NLP anchors + topic detection) and tracks cognitive drift over weeks and months.

Built by **Rémi F.** during a 6-day hackathon with $500 in Claude Opus 4.6 API tokens.

## Live Demo

The demo at **[alzheimervoice.org/demo](https://alzheimervoice.org/demo)** lets anyone:

1. **Record** 30-60 seconds of natural speech (French or English)
2. **Analyze** in real-time: GPU acoustic extraction → Whisper transcription → 25 NLP anchors → V5 scoring
3. **View** an instant report: 11-domain cognitive profile, 11-condition differential, acoustic signature, transcript

The entire pipeline runs in ~20-40 seconds on a Graviton ARM64 server. No account needed. No data stored — audio is processed in memory and deleted immediately after analysis.

## How It Works

```
Audio   → GPU Pipeline → 27 acoustic + 5 temporal → ─┐
                                                       ├─→ 107-indicator vector → 11-domain scoring → Alert
Speech  → NLP Anchors + Topic Detection → Opus 4.6 ──┘    Topic-adjusted z-scores    Family + Doctor
  5 min        ~25 deterministic          Dual-pass ($0.25)
```

1. AlzheimerVoice calls the patient daily — a warm, 5-minute conversation guided by family-provided memories
2. GPU-accelerated audio analysis extracts 27 acoustic and 5 temporal features via parselmouth, torchaudio, nolds, and Whisper
3. 25 deterministic NLP anchors are computed from the transcript (regex + word lists, no LLM, $0.00)
4. Claude Opus 4.6 dual-pass extraction identifies the remaining indicators with Extended Thinking
5. Each session is compared against the patient's personal baseline with topic-adjusted z-scores
6. Weekly deep analysis by Claude Opus 4.6 with 32K Extended Thinking for clinical reasoning
7. Alerts escalate: GREEN → YELLOW → ORANGE → RED

## What It Detects

| # | Condition | Key Voice Markers | Detection Approach |
|---|-----------|-------------------|-------------------|
| 1 | Alzheimer's Disease | Semantic cascade, referential coherence loss, idea density decline, pre-noun pauses | 9-indicator sentinel set, 4-stage cascade, cued recall failure |
| 2 | Parkinson's Disease | PPE, RPDE, DFA nonlinear dynamics, monopitch, articulatory decline | 11-indicator sentinel set, 4-stage cascade, UPDRS estimation |
| 3 | Major Depression | Affective markers, MFCC-2 changes, response latency, self-pronoun elevation | 7-indicator sentinel set, 3-stage cascade, episodic variability |
| 4 | Lewy Body Dementia | Fluctuating cognition, erratic pause patterns, concurrent motor + cognitive decline | 8-indicator sentinel set, 3-stage cascade, fluctuation scoring |
| 5 | Frontotemporal Dementia (3 variants) | Pragmatic collapse, semantic dissolution, disinhibition, humor/irony loss | 9-indicator sentinel set, 3-stage cascade per variant |
| 6 | Multiple System Atrophy | Hypokinetic-ataxic pattern, excessive F0 fluctuation, vocal tremor (4-7 Hz) | PD differential rule 17, tremor frequency analysis |
| 7 | Progressive Supranuclear Palsy | Hypokinetic-spastic pattern, stuttering, severe articulatory decay | PD differential rule 18, DDK analysis |
| 8 | Vascular Cognitive Impairment | Executive dysfunction, processing speed decline, preserved memory, step-wise drops | Rules 34-35: executive+speed+memory profile |
| 9 | Normal Aging | Stable baseline across all domains, expected age trajectories | Rule 13: all domains within noise |
| 10 | Medication Effects | Acute onset, global pattern across domains, recovery expected | Rule 11: temporal onset analysis |
| 11 | Grief / Emotional Distress | Event-linked changes, topic-dependent affective shift | Rule 12: topic-adjusted, life-event correlation |

## The 11 Cognitive Domains

| Domain | Code | Indicators | Weight | What It Measures |
|--------|------|-----------|--------|-----------------|
| Semantic | SEM | 9 | 0.18 | Idea density, referential coherence, embedding coherence, topic maintenance |
| Lexical | LEX | 17 | 0.13 | Vocabulary diversity (TTR, MATTR), word frequency shifts, content density, pronoun-noun ratio |
| Temporal | TMP | 16 | 0.11 | Pause patterns, speech rate, filler rate, pre-noun pauses (Whisper-measured), syllable decay |
| Acoustic | ACU | 17 | 0.11 | F0, jitter, shimmer, HNR, CPP, MFCCs, spectral tilt, formant bandwidth, breathiness |
| Syntactic | SYN | 8 | 0.09 | Mean length of utterance, subordination ratio, embedding depth, fragment rate |
| Memory | MEM | 6 | 0.09 | Free recall accuracy, cued recall (the AD differentiator), semantic fluency |
| PD Motor | PDM | 12 | 0.09 | PPE, RPDE, DFA, D2, DDK rate/regularity, voice onset time, monopitch, vocal tremor |
| Pragmatic | PRA | 6 | 0.06 | Indirect speech acts, discourse markers, narrative structure, perspective-taking, humor/irony |
| Executive | EXE | 5 | 0.05 | Task switching, response inhibition, planning language, cognitive flexibility |
| Discourse | DIS | 5 | 0.05 | Topic maintenance, perseveration, repair strategies, coherence breaks |
| Affective | AFF | 6 | 0.04 | Emotional valence, self-pronoun density, hedonic markers, absolutist language |

When audio is unavailable, acoustic (0.11) and PD motor (0.09) weights redistribute proportionally across the 9 text domains. The engine always produces valid results from text alone.

## How Claude Opus 4.6 Powers AlzheimerVoice

Opus 4.6 is the exclusive AI backbone — not a wrapper, but deeply integrated into the clinical reasoning pipeline:

| Stage | Opus 4.6 Usage | Why Opus 4.6 |
|-------|---------------|--------------|
| **Daily Dual-Pass Extraction** | Two sequential calls with Extended Thinking (8K + 4K) extract 107 indicators. Pass 1 extracts raw indicators; Pass 2 cross-validates outliers against NLP anchors. | Only Opus 4.6 has the reasoning depth to reliably extract subtle linguistic biomarkers (idea density decline, referential coherence loss) that correlate with neurodegeneration |
| **Weekly Deep Analysis** | 32K Extended Thinking performs full clinical reasoning — differential diagnosis, trajectory projection, evidence synthesis | The 32K thinking budget allows Opus to reason through 35 differential rules across 11 conditions, weighing contradictory evidence like a neurologist would |
| **Topic-Aware Scoring** | Detects conversation genre (daily routine, emotional narrative, procedural, etc.) and adjusts scoring baselines | Eliminates 44% of false positives — a patient describing a sad memory shouldn't trigger depression alerts |
| **Evidence Compilation** | Every score links back to specific peer-reviewed studies (84+). Generates evidence-backed clinical narratives | Clinicians need to understand *why* an alert fired, not just that it fired |

**Cost**: ~$0.25/day per patient for daily monitoring, ~$2.10/week including deep analysis.
