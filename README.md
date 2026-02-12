# AlzheimerVoice — Cognitive Voice Fingerprint Engine

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

## Architecture

```
┌──────────────────────┐   ┌──────────────────────┐
│  interface (5173)     │   │  admin / rk2 (5174)  │
│  Family + Clinician   │   │  Admin + Superadmin   │
│  React 19 + Vite 7   │   │  Network-restricted   │
└──────────┬───────────┘   └──────────┬───────────┘
           │  Bearer JWT              │  Bearer JWT
           └──────────┬───────────────┘
                      ▼
           ┌─────────────────────┐
           │  API Gateway (3001) │
           │  Auth + RBAC        │
           │  Patient CRUD       │
           │  GDPR + Admin       │
           │  CVF Proxy ─────────┼── x-service-key ──┐
           └─────────────────────┘                    │
                                                      ▼
                                           ┌─────────────────────┐
                                           │  CVF Engine (3002)  │
                                           │  V1 pipeline        │
                                           │  V2 6-layer         │
                                           │  V3 evidence engine │
                                           │  Claude API calls   │
                                           └─────────────────────┘

┌──────────────────────┐
│  site (5175)         │
│  Public marketing    │
│  No API dependency   │
└──────────────────────┘
```

## Subdomains

| Subdomain | Service | Purpose |
|---|---|---|
| `alzheimervoice.com` | apps/site | Public marketing page |
| `interface.alzheimervoice.com` | apps/interface | Family/clinician SaaS platform |
| `devinterface.alzheimervoice.com` | apps/interface (dev) | Development environment |
| `rk2.alzheimervoice.com` | apps/admin | Admin panel (network-restricted) |
| `api.alzheimervoice.com` | services/api | Internal API gateway |
| `cvf.alzheimervoice.com` | services/cvf | CVF computation engine (internal) |
| `cdn.alzheimervoice.com` | — | S3 + CloudFront (planned) |

## Project Structure

```
azh/
├── packages/
│   ├── shared-models/            # @azh/shared-models
│   │   └── src/
│   │       ├── patient.js        # Patient CRUD + encryption
│   │       ├── session.js        # Session persistence
│   │       ├── cvf.js            # CVF features, baselines, V3 data
│   │       ├── memory.js         # Memory profiles + selection
│   │       ├── crypto.js         # AES-256-GCM encryption
│   │       ├── secure-fs.js      # Encrypted file I/O
│   │       └── users.js          # User store + roles
│   ├── shared-auth/              # @azh/shared-auth
│   │   └── src/
│   │       ├── jwt.js            # HS256 sign/verify
│   │       └── rbac.js           # requireRole, requirePatientAccess
│   └── shared-ui/                # @azh/shared-ui
│       └── src/
│           ├── components/       # Badge, Button, Card, EmptyState, Icon, Stat
│           ├── guards/           # RoleGuard (PatientDataGuard, AdminGuard)
│           └── lib/              # api.js, auth.jsx, constants.js, i18n.jsx, 10 locales
├── services/
│   ├── api/                      # api.alzheimervoice.com — API Gateway
│   │   └── src/
│   │       ├── index.js          # Fastify app, CORS, rate limiting
│   │       ├── plugins/          # auth.js (JWT login), audit.js
│   │       ├── routes/           # patients, memories, gdpr, admin, cvf-proxy
│   │       └── lib/              # cvf-client.js (HTTP client → CVF service)
│   └── cvf/                      # cvf.alzheimervoice.com — CVF Engine
│       └── src/
│           ├── index.js          # Fastify app, service-key auth
│           ├── plugins/          # internal-auth.js (x-service-key validation)
│           ├── routes/           # v1.js, v2.js, v3.js
│           ├── engine/
│           │   ├── v1/           # cvf-engine.js, drift-detector.js
│           │   ├── v2/           # 6-layer deep analysis services
│           │   └── v3/           # Evidence-compiled scoring engine
│           ├── lib/              # claude.js (Anthropic SDK client)
│           └── scripts/          # Demo data generation, validation
├── apps/
│   ├── interface/                # interface.alzheimervoice.com — SaaS
│   │   └── src/
│   │       ├── components/       # Charts (8), layout, standalone
│   │       └── pages/            # Dashboard, Patients, Analysis, Reports, Settings
│   ├── admin/                    # rk2.alzheimervoice.com — Admin
│   │   └── src/
│   │       └── pages/            # 13 admin pages (Users, Audit, Security, GDPR...)
│   └── site/                     # alzheimervoice.com — Marketing
│       └── src/
│           ├── sections/         # Hero, Science, HowItWorks, Domains, CTA...
│           └── pages/            # Demo, Family, Scientific, Legal, Privacy
├── data/                         # Shared data directory (gitignored)
├── research/                     # 84 papers, knowledge graph, bibliographies
├── docs/                         # Architecture docs, research summaries
└── pnpm-workspace.yaml           # Workspace: packages/*, services/*, apps/*
```

## CVF V3 — Evidence-Compiled Scoring

Two-tier architecture: daily Sonnet 4.5 for cost-efficient extraction + weekly Opus 4.6 for deep clinical reasoning. 47 indicators across 8 cognitive domains, backed by 60+ peer-reviewed studies with citation tracking.

## CVF V2 — 6-Layer Deep Analysis

Leverages the full **1 million token context window** of Opus 4.6 for clinical reasoning. See [docs/CVF-V2-ARCHITECTURE.md](docs/CVF-V2-ARCHITECTURE.md).

| Layer | Name | Tokens | Purpose |
|-------|------|--------|---------|
| 1 | Living Library | ~300K | Full research papers loaded as context |
| 2 | Differential Diagnosis | ~100K | 6-condition linguistic profiles |
| 3 | Cognitive Archaeology | ~200K | Complete conversation history + semantic mapping |
| 4 | Cognitive Twin | ~150K | Personalized normal aging model |
| 5 | Synthetic Cohort | ~150K | 100 reference trajectories for matching |
| 6 | Temporal Hologram | Extended Thinking | Master orchestrator, 5-phase clinical reasoning |

## The 5 Cognitive Domains

| Domain | Features | What It Measures |
|--------|----------|-----------------|
| **Lexical** | TTR, Brunet's W, Honore's R, content density, word frequency | Vocabulary richness and diversity |
| **Syntactic** | MLU, subordination, completeness, passive ratio, embedding depth | Sentence complexity and grammar |
| **Coherence** | Idea density, topic maintenance, referential coherence, temporal sequencing, information units | Discourse organization and clarity |
| **Fluency** | Long pause ratio, filler rate, false starts, repetition rate, response latency | Speech production smoothness |
| **Memory** | Free recall, cued recall, recognition, temporal precision, emotional engagement | Memory retrieval through conversation |

## Quick Start

```bash
# 1. Install dependencies (pnpm workspace)
pnpm install

# 2. Configure environment
cp .env.development .env
# Edit .env — add your ANTHROPIC_API_KEY

# 3. Start everything
pnpm dev                     # All 5 services

# Or start selectively:
pnpm dev:backend             # API (3001) + CVF (3002)
pnpm dev:frontend            # Interface (5173) + Admin (5174) + Site (5175)
```

### Dev Ports

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 3001 | http://localhost:3001 |
| CVF Engine | 3002 | http://localhost:3002 |
| Interface | 5173 | http://localhost:5173 |
| Admin | 5174 | http://localhost:5174 |
| Site | 5175 | http://localhost:5175 |

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

### CVF V1 — Core Pipeline
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cvf/process` | Process conversation + extract features |
| `GET` | `/api/cvf/timeline/:id` | Get full CVF timeline |
| `POST` | `/api/cvf/weekly-analysis` | Run weekly drift analysis |
| `GET` | `/api/cvf/weekly-report/:id/:week` | Get weekly report |

### CVF V2 — 6-Layer Deep Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/deep-analysis/:id` | Run full 6-layer hologram analysis |
| `GET` | `/api/v2/differential/:id` | Get differential diagnosis scores |
| `GET` | `/api/v2/semantic-map/:id` | Get cognitive archaeology map |
| `GET` | `/api/v2/twin/:id` | Get cognitive twin divergence |
| `GET` | `/api/v2/cohort-match/:id` | Match against synthetic cohort |
| `GET` | `/api/v2/library/status` | Living Library loading status |

### CVF V3 — Evidence Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v3/process` | Daily session processing (Sonnet) |
| `POST` | `/api/v3/weekly` | Weekly deep analysis (Opus) |
| `GET` | `/api/v3/drift/:id` | Get drift analysis |
| `GET` | `/api/v3/timeline/:id` | Get V3 timeline |
| `GET` | `/api/v3/differential/:id` | Differential diagnosis |
| `GET` | `/api/v3/trajectory/:id` | Cognitive trajectory projection |
| `GET` | `/api/v3/report/:id/:week` | Get weekly report |
| `GET` | `/api/v3/reports/:id` | List all reports |
| `GET` | `/api/v3/baseline/:id` | Get patient baseline |
| `GET` | `/api/v3/indicators` | List all 47 indicators |
| `GET` | `/api/v3/meta` | Engine metadata |

### GDPR
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/gdpr/export/:id` | Data portability export (Art. 20) |
| `DELETE` | `/api/gdpr/erase/:id` | Right to erasure (Art. 17) |
| `DELETE` | `/api/gdpr/erase-all` | Full platform erasure (superadmin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/audit` | Audit trail |
| `GET` | `/api/admin/organizations` | Organization management |
| `GET` | `/api/admin/security/sessions` | Active sessions |
| `GET` | `/api/admin/clinical/assignments` | Clinical governance |
| `GET` | `/api/admin/billing/revenue` | Billing metrics |
| `GET` | `/api/admin/incidents` | Incident management |
| `GET` | `/api/admin/compliance` | GDPR compliance |

## Git Branches

| Branch | Purpose | Deploys to |
|--------|---------|------------|
| `main` | Source of truth | — |
| `production` | SaaS production | interface.alzheimervoice.com, rk2.alzheimervoice.com |
| `dev` | SaaS development | devinterface.alzheimervoice.com |
| `public` | Public site | alzheimervoice.com |
| `cvf` | CVF engine | cvf.alzheimervoice.com (AWS) |

## Deployment

**Vercel** (frontend apps):
- `apps/interface` → interface.alzheimervoice.com (branch: `production`)
- `apps/interface` → devinterface.alzheimervoice.com (branch: `dev`)
- `apps/admin` → rk2.alzheimervoice.com (branch: `production`)
- `apps/site` → alzheimervoice.com (branch: `public`)

**AWS** (backend services):
- `services/api` → api.alzheimervoice.com (ECS/Fargate, branch: `production`)
- `services/cvf` → cvf.alzheimervoice.com (ECS/Fargate, branch: `cvf`)

## Security

- **Service isolation**: CVF engine accepts requests only from the API gateway via `x-service-key`
- **JWT auth**: HS256 tokens issued by API, verified on every request
- **RBAC**: 4 roles — superadmin, admin, clinician, family
- **Encryption at rest**: AES-256-GCM for all patient data
- **CORS**: API only accepts interface + admin origins
- **Admin network restriction**: rk2 subdomain restricted via AWS infrastructure
- **GDPR**: Full Art. 17 erasure + Art. 20 data portability

## Tech Stack

- **Backend**: Node.js, Fastify 5, Claude Opus 4.6 (Anthropic SDK)
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Recharts 3
- **AI**: Claude Opus 4.6 (1M context + Extended Thinking), Sonnet 4.5 (daily extraction)
- **Data**: JSON file storage, AES-256-GCM encryption at rest
- **Workspace**: pnpm monorepo with shared packages
- **i18n**: 10 languages (en, fr, es, zh, hi, ar, bn, pt, ru, ja)

## Scientific Foundation

Based on 84 peer-reviewed studies:
- Fraser et al. 2015 — 370 linguistic features, 81.9% accuracy
- ADReSS Challenge (Luz 2020) — Gold standard speech-based detection
- Snowdon Nun Study — Idea density as longitudinal predictor
- Eyigoz Framingham — Speech surpasses APOE + demographics
- Young 2024 — Pre-symptomatic fluency microchanges

## Budget

| Operation | Standard | With Caching |
|-----------|----------|-------------|
| Daily conversation + extraction (V1) | $0.29 | $0.16 |
| Weekly standard analysis (V1) | $0.30 | $0.18 |
| Weekly deep analysis (V2, 6-layer) | $16.65 | **$2.97** |
| Daily extraction (V3, Sonnet) | ~$0.08 | ~$0.04 |
| Weekly deep analysis (V3, Opus) | ~$1.50 | ~$0.85 |

Adaptive mode: GREEN patients get standard analysis only. YELLOW+ patients get full deep analysis.

## License

Private — Cerebral Valley x Anthropic Hackathon 2026

---

*55 million people live with Alzheimer's. Most are diagnosed too late. MemoVoice catches the signal in the voice — for $0.16 a day, on any phone.*
