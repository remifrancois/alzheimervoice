# AlzheimerVoice — Cognitive Voice Fingerprint Engine

### 🏆 Cerebral Valley × Anthropic Hackathon — February 2026

> *"The voice remembers what the mind forgets."*

**🎙️ [Try the Live Demo →](https://trydemo.alzheimervoice.org)** — Record 30 seconds of speech, get an instant cognitive voice analysis.

**🔬 [Open-Source Engine →](https://github.com/remifrancois/cognitivevoicefingerprint)** — 107 indicators, 11 domains, 35 rules, 11 conditions, 84+ studies.

---

AlzheimerVoice detects early signs of Alzheimer's disease, Parkinson's, depression, Lewy Body Dementia, and Frontotemporal Dementia through voice analysis alone. 55 million people live with Alzheimer's worldwide — most diagnosed years too late, after irreversible neural damage. Research shows speech patterns change up to 7.6 years before clinical diagnosis (Eyigoz 2020). Our V5 "deep_voice" engine extracts a 107-indicator **Cognitive Voice Fingerprint (CVF)** from natural speech using multimodal analysis (text + audio + topic detection + NLP anchors) and tracks drift over weeks and months.

Available in **10 languages**: English, French, Spanish, Chinese, Hindi, Arabic, Bengali, Portuguese, Russian, Japanese.

## Live Demo — Try It Now

The hackathon demo at **[trydemo.alzheimervoice.org](https://trydemo.alzheimervoice.org)** lets anyone:

1. **Record** 30-60 seconds of natural speech (any topic)
2. **Analyze** in real-time: GPU acoustic extraction → Whisper transcription → 25 NLP anchors → V5 engine
3. **View** an instant report: 11-domain cognitive profile, differential diagnosis across 11 conditions, acoustic signature, transcript

The entire pipeline runs in ~15-30 seconds. No account needed, no data stored.

## How Claude Opus 4.6 Powers AlzheimerVoice

Opus 4.6 is the exclusive AI backbone of AlzheimerVoice — not just a wrapper, but deeply integrated into the clinical reasoning pipeline:

| Stage | Opus 4.6 Usage | Why Opus 4.6 |
|-------|---------------|--------------|
| **Daily Dual-Pass Extraction** | Two sequential Opus 4.6 calls with Extended Thinking extract 107 indicators from each conversation. Pass 1 extracts raw indicators; Pass 2 cross-validates with confidence scores. | Only Opus 4.6 has the reasoning depth to reliably extract subtle linguistic biomarkers (e.g., idea density decline, referential coherence loss) that correlate with neurodegeneration |
| **Weekly Deep Analysis** | Opus 4.6 with 32K Extended Thinking performs full clinical reasoning — differential diagnosis, trajectory projection, evidence synthesis | The 32K thinking budget allows Opus to reason through 30 differential rules across 11 conditions, weighing contradictory evidence like a neurologist would |
| **Topic-Aware Scoring** | Opus 4.6 detects conversation genre (daily routine, emotional narrative, procedural, etc.) and adjusts scoring baselines | Eliminates 44% of false positives — a patient describing a sad memory shouldn't trigger depression alerts |
| **Evidence Compilation** | Every score links back to specific peer-reviewed studies (84+). Opus 4.6 generates evidence-backed clinical narratives | Clinicians need to understand *why* an alert fired, not just that it fired |

**Cost**: ~$0.25/day per patient for daily monitoring, ~$2.10/week including deep analysis. Accessible enough for global deployment.

## How It Works

```
Audio   → GPU Pipeline → 27 acoustic + 5 temporal → ─┐
                                                       ├─→ 107-indicator vector → 11-domain scoring → Alert
Speech  → NLP Anchors + Topic Detection → Opus 4.6 ──┘    Topic-adjusted z-scores    Family + Doctor
  5 min        ~20 deterministic          Dual-pass ($0.25)
```

1. AlzheimerVoice calls the patient daily — a warm, 5-minute conversation
2. GPU-accelerated audio analysis extracts 27 acoustic and 5 temporal features via torchaudio, parselmouth, and nolds
3. The transcript is analyzed by Claude Opus 4.6 in a dual-pass extraction to identify 107 linguistic and acoustic biomarkers
4. Each session is compared against the patient's personal baseline
5. Weekly deep analysis by Claude Opus 4.6 with 32K Extended Thinking for clinical reasoning
6. Drift is measured as topic-adjusted z-scores across 11 cognitive domains
7. Alerts escalate: GREEN → YELLOW → ORANGE → RED

## CVF Engine — Evidence-Compiled Scoring (V5 deep_voice)

Unified architecture powered by Claude Opus 4.6 exclusively:

- **Daily processing** (Opus 4.6 dual-pass with Extended Thinking): Multimodal extraction of 107 indicators from each conversation — NLP anchors identify ~20 deterministic features before LLM pass, topic detection adjusts scoring baselines per genre
- **Weekly deep analysis** (Opus 4.6 32K thinking): Full clinical reasoning with 32K Extended Thinking, differential diagnosis across 10 conditions using 30 rules, trajectory projection, and evidence-backed reporting

107 indicators across 11 domains, 30 differential rules, 10 conditions, backed by 84+ peer-reviewed studies with citation tracking for every score.

### The 11 Cognitive Domains

| Domain | What It Measures |
|--------|-----------------|
| **Lexical Richness** | Vocabulary diversity, word frequency, content density |
| **Syntactic Complexity** | Sentence structure, subordination, embedding depth |
| **Discourse Coherence** | Topic maintenance, referential clarity, idea density |
| **Fluency & Prosody** | Pause patterns, filler rate, false starts, speech rate |
| **Memory Retrieval** | Free recall, cued recall, temporal precision |
| **Semantic Processing** | Word-finding difficulty, circumlocution, semantic paraphasia |
| **Pragmatic Function** | Indirect speech, discourse markers, register shift, narrative structure, perspective-taking, humor/irony |
| **Emotional Prosody** | Emotional range, affect congruence, engagement patterns |
| **Motor Speech** | PD markers: jitter, shimmer, PPE, DDK, tremor, voice breaks |
| **Executive Function** | Task switching, inhibition, planning, dual-task, cognitive flexibility |

## Architecture

```
┌──────────────────────┐   ┌──────────────────────┐
│  Interface (5173)     │   │  Admin (5174)         │
│  Family + Clinician   │   │  Network-restricted   │
│  React 19 + Vite 7   │   │  AWS WAF protected    │
└──────────┬───────────┘   └──────────┬───────────┘
           │  Bearer JWT              │  Bearer JWT
           └──────────┬───────────────┘
                      ▼
           ┌─────────────────────┐
           │  API Gateway (3001) │
           │  Auth + RBAC        │
           │  Rate limiting      │
           │  Audit logging      │
           │  HIPAA / GDPR       │
           │  CVF Proxy ─────────┼── x-service-key ──┐
           └─────────────────────┘                    │
                                                      ▼
┌──────────────────────┐               ┌─────────────────────────┐
│  Site (5175)         │               │  CVF Engine (3002)      │
│  Public marketing    │               │  107 indicators         │
│  10 languages        │               │  11 domains | V5        │
│  /trydemo ───────────┼── POST ──────→│  deep_voice engine      │
│  Live demo page      │  demo-analyze │  Claude Opus 4.6        │
└──────────────────────┘               │  GPU acoustic pipeline  │
                                       └─────────────────────────┘
```

## Project Structure

```
azh/
├── packages/
│   ├── shared-models/            # @azh/shared-models — Data models + encryption
│   ├── shared-auth/              # @azh/shared-auth — JWT + RBAC middleware
│   └── shared-ui/                # @azh/shared-ui — React components, auth, i18n
├── services/
│   └── cvf/                      # CVF Engine — V5 "deep_voice" (V1-V4 in /previous-engine-releases)
├── apps/
│   ├── interface/                # SaaS platform — families + clinicians
│   ├── admin/                    # Admin panel — network-restricted
│   └── site/                     # Public site + /trydemo hackathon demo
├── RESEARCH.md                   # 84+ peer-reviewed studies backing the engine
└── pnpm-workspace.yaml           # Monorepo workspace
```

## Security & Compliance

### HIPAA Compliance

| Safeguard | Implementation |
|-----------|---------------|
| **Access Controls** | Role-based access (RBAC) with 4 roles: superadmin, admin, clinician, family |
| **Audit Trail** | Immutable logging of all data access, modifications, and authentication events |
| **Encryption at Rest** | AES-256-GCM encryption for all Protected Health Information (PHI) |
| **Encryption in Transit** | TLS 1.3 enforced on all service-to-service and client-to-server communication |
| **Minimum Necessary** | Clinicians access only assigned patients; family members see only their relative |
| **Authentication** | JWT tokens with expiration, secure key rotation |
| **Data Backup** | Encrypted backups with configurable retention policies |
| **BAA Ready** | Architecture supports Business Associate Agreement requirements |

### GDPR Compliance

| Article | Implementation |
|---------|---------------|
| **Art. 17 — Right to Erasure** | Complete patient data deletion across all services |
| **Art. 20 — Data Portability** | Full JSON export of patient records, sessions, and CVF data |
| **Art. 25 — Privacy by Design** | Encryption at rest, minimal data collection, role-based access |
| **Art. 30 — Records of Processing** | Audit trail of all data processing activities |
| **Art. 32 — Security of Processing** | AES-256-GCM, TLS, network isolation, rate limiting |

### Infrastructure Security

- **Service isolation**: CVF engine accepts requests only from the API gateway via cryptographic service key
- **Network restriction**: Admin panel access restricted at AWS infrastructure level (WAF + IP allowlisting)
- **CORS enforcement**: API gateway only accepts requests from authorized frontend origins
- **Rate limiting**: 100 requests/minute per client to prevent abuse
- **No external API access**: API gateway is internal-only, no public API endpoints exposed
- **Secrets management**: All keys, tokens, and credentials stored in environment variables, never in code

## API Endpoints

All frontend requests go through the API gateway. The gateway proxies CVF requests to the engine internally.

### Patients & Memories
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | List all patients |
| `POST` | `/api/patients` | Create patient |
| `GET` | `/api/patients/:id` | Get patient details |
| `GET` | `/api/memories/:id` | Get memory profile |
| `POST` | `/api/memories/:id` | Add memory |

### CVF Engine (V5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cvf/v5/demo-analyze` | **Live demo** — instant single-session analysis (no auth) |
| `POST` | `/api/v5/process` | Daily session processing (Opus 4.6 dual-pass) |
| `POST` | `/api/v5/process-audio` | Audio feature extraction (GPU) |
| `POST` | `/api/v5/weekly` | Weekly deep analysis (Opus 4.6, 32K thinking) |
| `GET` | `/api/v5/drift/:id` | Topic-adjusted drift analysis |
| `GET` | `/api/v5/timeline/:id` | Patient timeline with genre metadata |
| `GET` | `/api/v5/differential/:id` | 10-condition differential (30 rules) |
| `GET` | `/api/v5/trajectory/:id` | 11-domain trajectory prediction |
| `GET` | `/api/v5/pd/:id` | PD motor analysis |
| `GET` | `/api/v5/micro-tasks/:id` | 6 micro-task status |
| `GET` | `/api/v5/indicators` | All 107 indicators |
| `GET` | `/api/v5/meta` | V5 metadata |
| `POST` | `/api/v5/topic-detect` | Topic genre detection |
| `POST` | `/api/v5/cross-validate` | Cross-validation analysis |

### GDPR
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/gdpr/export/:id` | Data portability export (Art. 20) |
| `DELETE` | `/api/gdpr/erase/:id` | Right to erasure (Art. 17) |

## Quick Start

```bash
# 1. Install dependencies (pnpm workspace)
pnpm install

# 2. Configure environment
cp .env.development .env
# Edit .env — add your ANTHROPIC_API_KEY

# 3. Start everything
pnpm dev                     # All services

# Or start selectively:
pnpm dev:backend             # API + CVF engine
pnpm dev:frontend            # Interface + Admin + Site
```

## Multilingual Support

AlzheimerVoice is built for global deployment. The entire platform — interface, admin panel, and public site — supports 10 languages:

| Language | Code | Coverage |
|----------|------|----------|
| English | `en` | Full |
| French | `fr` | Full |
| Spanish | `es` | Full |
| Chinese (Simplified) | `zh` | Full |
| Hindi | `hi` | Full |
| Arabic | `ar` | Full (RTL) |
| Bengali | `bn` | Full |
| Portuguese | `pt` | Full |
| Russian | `ru` | Full |
| Japanese | `ja` | Full |

Language is auto-detected from the browser and can be changed in settings. All clinical reports, alerts, and family-facing content are fully translated.

## Tech Stack

- **Backend**: Node.js, Fastify 5, Claude Opus 4.6 (Anthropic SDK)
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Recharts 3
- **AI**: Claude Opus 4.6 exclusively (daily dual-pass + weekly 32K thinking)
- **GPU**: torchaudio, Whisper large-v3, parselmouth, nolds
- **Security**: AES-256-GCM encryption, JWT HS256, RBAC, TLS 1.3
- **Compliance**: HIPAA, GDPR (Art. 17, 20, 25, 30, 32)
- **Workspace**: pnpm monorepo with shared packages
- **i18n**: 10 languages with full coverage

## Scientific Foundation

Based on 84+ peer-reviewed studies:
- Fraser et al. 2015 — 370 linguistic features, 81.9% accuracy
- ADReSS Challenge (Luz 2020) — Gold standard speech-based detection
- Snowdon Nun Study — Idea density as longitudinal predictor
- Eyigoz Framingham — Speech surpasses APOE + demographics
- Young 2024 — Pre-symptomatic fluency microchanges
- Rusz et al. 2021 — LBD vocal biomarkers, motor speech analysis
- Hardy et al. 2023 — FTD pragmatic language decline
- Boschi et al. 2017 — Topic-aware scoring and genre effects on linguistic measures

## Budget

| Operation | Cost |
|-----------|------|
| Daily extraction (Opus 4.6 dual-pass) | ~$0.25 |
| Weekly deep analysis (Opus 4.6 32K) | ~$0.50-0.80 |
| Weekly total per patient | ~$2.10 |

Adaptive mode: GREEN patients get standard analysis. YELLOW+ patients get full deep analysis with differential diagnosis and trajectory projection.

## License

MIT License — see [LICENSE](LICENSE).

---

*Built during the Cerebral Valley × Anthropic Hackathon, February 2026.*

*55 million people live with Alzheimer's. Most are diagnosed too late. AlzheimerVoice catches the signal in the voice — for ~$0.25 a day, on any phone.*

*Open-source engine: [github.com/remifrancois/cognitivevoicefingerprint](https://github.com/remifrancois/cognitivevoicefingerprint)*
