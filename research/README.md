# MemoVoice Research Corpus

## Purpose

This directory contains the scientific knowledge base for the CVF V3 algorithm.

**V2 approach**: Load 900K tokens of research per inference call ($3/patient/week).
**V3 approach**: Ingest all research ONCE, build a knowledge graph, train an algorithm. Inference becomes cheap.

## Structure

```
research/
├── papers/                    # Structured paper summaries by condition
│   ├── alzheimer/             # AD-specific voice/speech studies
│   ├── depression/            # Depression voice biomarker studies
│   ├── parkinson/             # PD voice/speech studies
│   ├── aging/                 # Normal aging + longitudinal studies
│   └── differential/          # Cross-condition differential studies
├── knowledge-graph/           # JSON knowledge graph database
│   ├── graph.json             # Main knowledge graph
│   ├── indicators.json        # All 40+ indicators with evidence
│   ├── conditions.json        # Condition profiles
│   └── evidence-matrix.json   # Indicator × Condition evidence strength
├── indicators/                # Indicator specifications
│   ├── acoustic.json          # Acoustic/prosodic indicators
│   ├── linguistic.json        # Linguistic/lexical indicators
│   ├── temporal.json          # Temporal/fluency indicators
│   ├── semantic.json          # Semantic/coherence indicators
│   └── memory.json            # Memory/recall indicators
└── raw/                       # Raw downloaded content
```

## Indicator Categories

1. **Acoustic** (pitch, jitter, shimmer, HNR, formants, MFCCs)
2. **Linguistic** (TTR, Brunet's W, Honore's R, content density, POS ratios)
3. **Temporal** (pause duration, speech rate, response latency, silence ratio)
4. **Semantic** (coherence, idea density, topic drift, referential clarity)
5. **Syntactic** (MLU, subordination, embedding depth, completeness)
6. **Prosodic** (pitch range, energy variation, rhythm, stress patterns)
7. **Memory/Recall** (free recall, cued recall, recognition, temporal precision)
8. **Motor Speech** (articulation rate, VOT, diadochokinesis, vowel space)

## Target: 40+ Indicators

Each indicator must have:
- Scientific definition and extraction method
- Evidence strength (number of studies, sample sizes, accuracies)
- Condition specificity (which conditions it discriminates)
- Sensitivity and specificity when known
- Longitudinal trajectory (how it changes over time per condition)
