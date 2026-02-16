# AlzheimerVoice

### 🏆 Cerebral Valley × Anthropic Hackathon — February 2026

> *"The voice remembers what the mind forgets."*

**[alzheimervoice.org](https://alzheimervoice.org)** — Public site, live demo, science, open source

**[Try the Live Demo →](https://alzheimervoice.org/demo)** — Record 30 seconds of speech, get an instant 11-domain cognitive voice analysis.

**[CVF Engine (open source) →](https://github.com/remifrancois/cognitivevoicefingerprint)** — 107 indicators, 11 domains, 35 rules, 11 conditions, 84+ studies.

---

55 million people live with Alzheimer's worldwide — most diagnosed years too late, after irreversible neural damage. Research shows speech patterns change up to 7.6 years before clinical diagnosis (Eyigoz 2020). AlzheimerVoice detects early signs of Alzheimer's disease, Parkinson's, depression, Lewy Body Dementia, Frontotemporal Dementia, and 6 other conditions through voice analysis alone.

The V5 "deep_voice" engine extracts a 107-indicator **Cognitive Voice Fingerprint (CVF)** from natural speech using multimodal analysis (acoustic + Claude transcription + NLP anchors + topic detection) and tracks cognitive drift over weeks and months.

Built by **Rémi F.** during a 6-day hackathon with $500 in Claude Opus 4.6 API tokens.

## Live Demo

The demo at **[alzheimervoice.org/demo](https://alzheimervoice.org/demo)** lets anyone:

1. **Record** 30-60 seconds of natural speech (French or English)
2. **Analyze** in real-time: GPU acoustic extraction → Claude transcription → 25 NLP anchors → V5 scoring
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
2. GPU-accelerated audio analysis extracts 27 acoustic and 5 temporal features via parselmouth, torchaudio, nolds, and Claude
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
| Temporal | TMP | 16 | 0.11 | Pause patterns, speech rate, filler rate, pre-noun pauses (Claude-measured), syllable decay |
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

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  alzheimervoice.org (Vercel)                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ apps/site │  │apps/demo │  │apps/saas │  │apps/admin│       │
│  │  (public) │  │(dashboard│  │ (SaaS    │  │ (admin   │       │
│  │   site)   │  │  demo)   │  │  app)    │  │  panel)  │       │
│  └─────┬─────┘  └──────────┘  └──────────┘  └──────────┘       │
│        │ /demo page records audio via WebRTC                    │
│        │ POST base64 audio to CVF engine                        │
└────────┼────────────────────────────────────────────────────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  cvf.alzheimervoice.org (AWS EC2 Graviton t4g.small)           │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Caddy (auto-SSL reverse proxy)                      │      │
│  │  → Node.js 20 + Fastify                              │      │
│  │    ├─ /cvf/v5/demo-analyze (public, no auth)         │      │
│  │    ├─ /cvf/v5/process (internal, auth required)      │      │
│  │    ├─ /cvf/v5/weekly (Opus deep analysis)            │      │
│  │    └─ 14 more V5 endpoints                           │      │
│  │  ┌────────────────────────────────────────────┐      │      │
│  │  │  V5 Engine Pipeline                        │      │      │
│  │  │  1. ffmpeg: WebM → 16kHz WAV               │      │      │
│  │  │  2. parselmouth: F0, jitter, shimmer, HNR  │      │      │
│  │  │  3. nolds: PPE, RPDE, DFA, D2              │      │      │
│  │  │  4. Claude: transcription + timestamps      │      │      │
│  │  │  5. NLP anchors: 25 deterministic features  │      │      │
│  │  │  6. V5 scoring: 107 → 11 domains → alert   │      │      │
│  │  └────────────────────────────────────────────┘      │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment URLs

| App | URL | Hosting |
|-----|-----|---------|
| Public site | [alzheimervoice.org](https://alzheimervoice.org) | Vercel |
| Demo dashboard | [demo.alzheimervoice.org](https://demo.alzheimervoice.org) | Vercel |
| SaaS app | [app.alzheimervoice.org](https://app.alzheimervoice.org) | Vercel |
| Admin panel | [admin.alzheimervoice.org](https://admin.alzheimervoice.org) | Vercel |
| CVF Engine API | [cvf.alzheimervoice.org](https://cvf.alzheimervoice.org) | AWS EC2 Graviton |

## Project Structure

```
alzheimervoice/
├── apps/
│   ├── site/          # Public website — science, demo, families, open source
│   ├── demo/          # Interactive dashboard with sample patient data
│   ├── saas/          # SaaS application (Cognito auth)
│   └── admin/         # Admin panel — users, billing, compliance, audit
├── packages/
│   └── shared-ui/     # Shared React components, i18n, theme
├── services/
│   └── cvf/           # CVF Engine V5 — Fastify API + analysis pipeline
│       └── src/
│           ├── index.js              # Server entry, CORS, health check
│           ├── engine/v5/
│           │   ├── index.js          # 107 indicators, scoring, differential
│           │   └── api.js            # 17 REST endpoints
│           └── plugins/
│               └── internal-auth.js  # API key authentication
├── scripts/           # Deployment scripts, research profiles
├── data/              # Sample patient data, CVF baselines, reports
├── claude/            # Claude skill files
├── CHANGELOG.md
├── README.md
└── RESEARCH.md
```

## Security & Privacy

- **Zero data retention**: Audio is processed in memory and deleted immediately after analysis. No recordings, transcripts, or results are stored on the server.
- **HTTPS everywhere**: Caddy auto-provisions SSL certificates for all endpoints.
- **CORS restricted**: Only `alzheimervoice.org`, `www.alzheimervoice.org`, and `alzheimervoice.vercel.app` can call the CVF API.
- **Rate limiting**: 200 requests/minute per IP via `@fastify/rate-limit`.
- **Helmet**: Security headers via `@fastify/helmet`.
- **Internal auth**: Production endpoints require API key authentication. The `/demo-analyze` endpoint is public but rate-limited.
- **No PII in logs**: Patient IDs are SHA-256 hashed before logging.
- **Audio size limit**: 10MB max per request. Python pipeline rejects files > 500MB.
- **Input validation**: All endpoints use JSON Schema validation via Fastify.

## API Endpoints (CVF V5)

All endpoints are prefixed with `/cvf/v5`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/demo-analyze` | Public | Single-session analysis from raw audio (hackathon demo) |
| GET | `/demo-queue` | Public | Queue status for demo page |
| POST | `/process` | Key | Daily session processing (text + optional audio) |
| POST | `/process-audio` | Key | Audio-only micro-task processing |
| POST | `/weekly` | Key | Weekly Opus deep analysis |
| GET | `/drift/:patientId` | Key | Latest drift analysis |
| GET | `/timeline/:patientId` | Key | Full session timeline |
| GET | `/differential/:patientId` | Key | 11-condition differential diagnosis |
| GET | `/trajectory/:patientId` | Key | 12-week trajectory prediction |
| GET | `/pd/:patientId` | Key | Parkinson's-specific analysis |
| GET | `/micro-tasks/:patientId` | Key | Scheduled micro-task recommendations |
| GET | `/report/:patientId/:week` | Key | Weekly report |
| GET | `/reports/:patientId` | Key | All weekly reports |
| GET | `/indicators` | Key | Full indicator catalog (107+) |
| GET | `/baseline/:patientId` | Key | Baseline status |
| GET | `/meta` | Public | Engine metadata |
| GET | `/metrics` | Key | Performance metrics |

## Quick Start

```bash
# Clone
git clone https://github.com/remifrancois/alzheimervoice.git
cd alzheimervoice

# Install dependencies
pnpm install

# Run the public site locally
cd apps/site && pnpm dev

# Run the demo dashboard locally
cd apps/demo && pnpm dev

# Run the CVF engine locally (requires ANTHROPIC_API_KEY)
cd services/cvf
echo "ANTHROPIC_API_KEY=your-key" > .env
node src/index.js
```

## Multilingual Support

The public site is available in 10 languages:

🇬🇧 English · 🇫🇷 French · 🇪🇸 Spanish · 🇵🇹 Portuguese · 🇸🇦 Arabic · 🇮🇳 Hindi · 🇯🇵 Japanese · 🇧🇩 Bengali · 🇷🇺 Russian · 🇨🇳 Chinese

The CVF engine currently supports French and English for voice analysis. Additional languages can be added by providing language-specific NLP anchor patterns and word lists.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js 20, Fastify |
| AI | Claude Opus 4.6 (Anthropic API) |
| Audio | parselmouth (Praat), torchaudio, nolds, ffmpeg |
| Infrastructure | AWS EC2 Graviton (ARM64), Caddy, systemd |
| Hosting | Vercel (frontend apps) |
| Auth | Amazon Cognito (SaaS app only) |
| Monorepo | pnpm workspaces, `@azh/` package namespace |

## Scientific Foundation

The CVF engine is built on 84+ peer-reviewed studies. Key references:

- **Fraser et al. (2016)** — 81.92% AD classification accuracy from speech transcripts (DementiaBank Pitt corpus)
- **Eyigoz et al. (2020)** — Linguistic markers predict AD onset 7.6 years before clinical diagnosis
- **Little et al. (2009)** — {HNR, RPDE, DFA, PPE} quartet achieves 91.4% PD detection accuracy
- **Snowdon et al. (2000)** — Nun Study: low idea density at age 22 predicted AD 60 years later
- **Luz et al. (2020)** — ADReSS Challenge: speech-only cognitive assessment benchmarks
- **Young et al. (2024)** — Response latency correlates with tau protein burden

Full research documentation: [RESEARCH.md](RESEARCH.md) and [CVF Engine repo](https://github.com/remifrancois/cognitivevoicefingerprint)

## Budget

This project was built during a 6-day hackathon with a total budget of $500 in Claude Opus 4.6 API tokens.

| Item | Cost |
|------|------|
| Claude Opus 4.6 API tokens | $500 (hackathon grant) |
| AWS EC2 t4g.small (Graviton) | ~$12/month |
| Vercel hosting | Free tier |
| Domain (alzheimervoice.org) | ~$12/year |
| **Total infrastructure** | **~$24/month** |

Per-patient cost in production: ~$0.25/day for daily monitoring, ~$2.10/week including weekly deep analysis.

## Open Source

- **AlzheimerVoice** (this repo): [github.com/remifrancois/alzheimervoice](https://github.com/remifrancois/alzheimervoice) — Full platform: site, demo, SaaS, admin, CVF engine
- **CVF Engine**: [github.com/remifrancois/cognitivevoicefingerprint](https://github.com/remifrancois/cognitivevoicefingerprint) — Standalone engine with research documentation

## License

MIT — See [LICENSE](LICENSE) for details.

---

Built with 💜 at the **Cerebral Valley × Anthropic Hackathon**, February 2026.

*"55 million people deserve better than a diagnosis that comes too late."*
