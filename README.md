# MemoVoice — Cognitive Voice Fingerprint Engine

> *"The voice remembers what the mind forgets."*
> *"La voix se souvient de ce que l'esprit oublie."*

MemoVoice detects early signs of Alzheimer's disease through daily phone conversations with elderly patients. It extracts a 25-dimension **Cognitive Voice Fingerprint (CVF)** from natural speech and tracks drift over weeks and months, catching cognitive decline up to 2 years before clinical diagnosis.

**Built for the Cerebral Valley x Anthropic Hackathon, February 2026.**

## How It Works

```
Phone Call → Transcription → 25-Feature Extraction → Drift Detection → Alert
   5 min        STT             Claude Opus 4.6         z-scores        Family + Doctor
```

1. MemoVoice calls the patient daily — a warm, 5-minute conversation
2. The transcript is analyzed by Claude Opus 4.6 to extract 25 linguistic biomarkers
3. Each session is compared against the patient's personal baseline (14 sessions)
4. Drift is measured as z-scores across 5 cognitive domains
5. Alerts escalate: GREEN → YELLOW → ORANGE → RED

## CVF V2 — 6-Layer Deep Analysis

V2 leverages the full **1 million token context window** of Opus 4.6 to perform clinical reasoning at a depth no AI system has ever achieved. See [docs/CVF-V2-ARCHITECTURE.md](docs/CVF-V2-ARCHITECTURE.md) for the complete technical documentation.

| Layer | Name | Tokens | Purpose |
|-------|------|--------|---------|
| 1 | Living Library | ~300K | Full research papers loaded as context |
| 2 | Differential Diagnosis | ~100K | 6-condition linguistic profiles |
| 3 | Cognitive Archaeology | ~200K | Complete conversation history + semantic mapping |
| 4 | Cognitive Twin | ~150K | Personalized normal aging model |
| 5 | Synthetic Cohort | ~150K | 100 reference trajectories for matching |
| 6 | Temporal Hologram | Extended Thinking | Master orchestrator, 5-phase clinical reasoning |

**Cost**: ~$2.97/patient/week with prompt caching (vs $16.65 without).

## The 5 Cognitive Domains

| Domain | Features | What It Measures |
|--------|----------|-----------------|
| **Lexical** | TTR, Brunet's W, Honore's R, content density, word frequency | Vocabulary richness and diversity |
| **Syntactic** | MLU, subordination, completeness, passive ratio, embedding depth | Sentence complexity and grammar |
| **Coherence** | Idea density, topic maintenance, referential coherence, temporal sequencing, information units | Discourse organization and clarity |
| **Fluency** | Long pause ratio, filler rate, false starts, repetition rate, response latency | Speech production smoothness |
| **Memory** | Free recall, cued recall, recognition, temporal precision, emotional engagement | Memory retrieval through conversation |

## Project Structure

```
azh/
├── server/                    # Fastify API + CVF Engine
│   ├── src/
│   │   ├── index.js           # API routes (V1 + V2)
│   │   ├── models/            # Patient, Session, CVF, Memory
│   │   ├── services/
│   │   │   ├── claude.js              # Feature extraction + weekly analysis
│   │   │   ├── cvf-engine.js          # Pipeline: process → baseline → drift
│   │   │   ├── drift-detector.js      # Weekly drift + cascade detection
│   │   │   ├── living-library.js      # Layer 1: Research paper context
│   │   │   ├── differential-diagnosis.js  # Layer 2: 6-condition profiles
│   │   │   ├── cognitive-archaeology.js   # Layer 3: Semantic mapping
│   │   │   ├── cognitive-twin.js          # Layer 4: Normal aging model
│   │   │   ├── synthetic-cohort.js        # Layer 5: 100 trajectories
│   │   │   └── temporal-hologram.js       # Layer 6: Master orchestrator
│   │   └── scripts/           # Demo data generation, validation
│   └── data/                  # Patient data (gitignored)
├── dashboard/                 # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── charts/        # Timeline, Domain, Differential, Twin, Cohort, SemanticMap
│       │   ├── layout/        # Sidebar, Topbar, AppLayout
│       │   └── ui/            # Card, Button, Badge, Stat, Icon
│       ├── pages/             # Dashboard, Patients, Analysis, Reports, Settings
│       └── lib/               # API client, constants, i18n
├── docs/                      # Research papers, architecture docs
└── SECURITY.md                # Security checklist
```

## Quick Start

```bash
# 1. Install dependencies
cd server && npm install
cd ../dashboard && npm install

# 2. Configure API key
cp server/.env.example server/.env
# Edit server/.env and add your ANTHROPIC_API_KEY

# 3. Generate demo data (no API key needed)
cd server && npm run demo:data

# 4. Start the server
npm run dev                    # http://localhost:3001

# 5. Start the dashboard (in another terminal)
cd dashboard && npm run dev    # http://localhost:5173
```

## API Endpoints

### V1 — Core CVF
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | List all patients |
| `POST` | `/api/patients` | Create patient |
| `POST` | `/api/cvf/process` | Process conversation + extract features |
| `GET` | `/api/cvf/timeline/:id` | Get full CVF timeline |
| `POST` | `/api/cvf/weekly-analysis` | Run weekly drift analysis |
| `GET` | `/api/cvf/weekly-report/:id/:week` | Get weekly report |

### V2 — 6-Layer Deep Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/deep-analysis/:id` | Run full 6-layer hologram analysis |
| `GET` | `/api/v2/differential/:id` | Get differential diagnosis scores |
| `GET` | `/api/v2/semantic-map/:id` | Get cognitive archaeology map |
| `GET` | `/api/v2/twin/:id` | Get cognitive twin divergence |
| `GET` | `/api/v2/cohort-match/:id` | Match against synthetic cohort |
| `GET` | `/api/v2/library/status` | Living Library loading status |

## Tech Stack

- **Backend**: Node.js, Fastify 5, Claude Opus 4.6 (Anthropic SDK)
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Recharts 3
- **AI**: Claude Opus 4.6 with 1M context window + Extended Thinking
- **Data**: JSON file storage (production: encrypt at rest)

## Scientific Foundation

Based on 50+ peer-reviewed studies:
- Fraser et al. 2015 — 370 linguistic features, 81.9% accuracy
- ADReSS Challenge (Luz 2020) — Gold standard speech-based detection
- Snowdon Nun Study — Idea density as longitudinal predictor
- Eyigoz Framingham — Speech surpasses APOE + demographics
- Young 2024 — Pre-symptomatic fluency microchanges

## Budget

| Operation | Standard | With Caching |
|-----------|----------|-------------|
| Daily conversation + extraction | $0.29 | $0.16 |
| Weekly standard analysis | $0.30 | $0.18 |
| Weekly deep analysis (6-layer) | $16.65 | **$2.97** |

Adaptive mode: GREEN patients get standard analysis only. YELLOW+ patients get full 6-layer deep analysis.

## License

Private — Cerebral Valley x Anthropic Hackathon 2026

---

*55 million people live with Alzheimer's. Most are diagnosed too late. MemoVoice catches the signal in the voice — for $0.16 a day, on any phone.*
