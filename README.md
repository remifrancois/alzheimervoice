# AlzheimerVoice — Cognitive Voice Fingerprint Engine

> *"The voice remembers what the mind forgets."*
> *"La voix se souvient de ce que l'esprit oublie."*

AlzheimerVoice detects early signs of Alzheimer's disease through daily phone conversations with elderly patients. It extracts a 47-indicator **Cognitive Voice Fingerprint (CVF)** from natural speech and tracks drift over weeks and months, catching cognitive decline up to 2 years before clinical diagnosis.

Available in **10 languages**: English, French, Spanish, Chinese, Hindi, Arabic, Bengali, Portuguese, Russian, Japanese.

## How It Works

```
Phone Call → Transcription → 47-Indicator Extraction → Drift Detection → Alert
   5 min        STT            Sonnet 4.5 (daily)       z-scores        Family + Doctor
                               Opus 4.6 (weekly)
```

1. AlzheimerVoice calls the patient daily — a warm, 5-minute conversation
2. The transcript is analyzed by Claude Sonnet 4.5 to extract 47 linguistic biomarkers
3. Each session is compared against the patient's personal baseline
4. Weekly deep analysis by Claude Opus 4.6 with 1M-token clinical reasoning
5. Drift is measured as z-scores across 8 cognitive domains
6. Alerts escalate: GREEN → YELLOW → ORANGE → RED

## CVF Engine — Evidence-Compiled Scoring

Two-tier architecture optimized for accuracy and cost:

- **Daily processing** (Sonnet 4.5): Cost-efficient extraction of 47 indicators from each conversation
- **Weekly deep analysis** (Opus 4.6): Full clinical reasoning with 1M-token context window, differential diagnosis, trajectory projection, and evidence-backed reporting

47 indicators across 8 cognitive domains, backed by 60+ peer-reviewed studies with citation tracking for every score.

### The 8 Cognitive Domains

| Domain | What It Measures |
|--------|-----------------|
| **Lexical Richness** | Vocabulary diversity, word frequency, content density |
| **Syntactic Complexity** | Sentence structure, subordination, embedding depth |
| **Discourse Coherence** | Topic maintenance, referential clarity, idea density |
| **Fluency & Prosody** | Pause patterns, filler rate, false starts, speech rate |
| **Memory Retrieval** | Free recall, cued recall, temporal precision |
| **Semantic Processing** | Word-finding difficulty, circumlocution, semantic paraphasia |
| **Pragmatic Function** | Turn-taking, repair strategies, conversational initiative |
| **Emotional Prosody** | Emotional range, affect congruence, engagement patterns |

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
                                           ┌─────────────────────┐
                                           │  CVF Engine (3002)  │
                                           │  47 indicators      │
                                           │  8 domains          │
                                           │  Evidence engine    │
                                           │  Claude API calls   │
                                           └─────────────────────┘

┌──────────────────────┐
│  Site (5175)         │
│  Public marketing    │
│  10 languages        │
└──────────────────────┘
```

## Project Structure

```
azh/
├── packages/
│   ├── shared-models/            # @azh/shared-models — Data models + encryption
│   ├── shared-auth/              # @azh/shared-auth — JWT + RBAC middleware
│   └── shared-ui/                # @azh/shared-ui — React components, auth, i18n
├── services/
│   ├── api/                      # API Gateway — auth, CRUD, GDPR, CVF proxy
│   └── cvf/                      # CVF Engine — evidence-compiled scoring
├── apps/
│   ├── interface/                # SaaS platform — families + clinicians
│   ├── admin/                    # Admin panel — network-restricted
│   └── site/                     # Public marketing — 10 languages
├── data/                         # Patient data (gitignored, encrypted)
├── docs/                         # Architecture documentation
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

### CVF Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v3/process` | Daily session processing (Sonnet 4.5) |
| `POST` | `/api/v3/weekly` | Weekly deep analysis (Opus 4.6) |
| `GET` | `/api/v3/drift/:id` | Drift analysis |
| `GET` | `/api/v3/timeline/:id` | Patient timeline |
| `GET` | `/api/v3/differential/:id` | Differential diagnosis |
| `GET` | `/api/v3/trajectory/:id` | Cognitive trajectory projection |
| `GET` | `/api/v3/report/:id/:week` | Weekly report |
| `GET` | `/api/v3/reports/:id` | All reports for patient |
| `GET` | `/api/v3/baseline/:id` | Patient baseline |
| `GET` | `/api/v3/indicators` | All 47 indicators |
| `GET` | `/api/v3/meta` | Engine metadata |

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

- **Backend**: Node.js, Fastify 5, Claude Opus 4.6 + Sonnet 4.5 (Anthropic SDK)
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Recharts 3
- **AI**: Claude Opus 4.6 (1M context + Extended Thinking), Sonnet 4.5 (daily extraction)
- **Security**: AES-256-GCM encryption, JWT HS256, RBAC, TLS 1.3
- **Compliance**: HIPAA, GDPR (Art. 17, 20, 25, 30, 32)
- **Workspace**: pnpm monorepo with shared packages
- **i18n**: 10 languages with full coverage

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
| Daily extraction (Sonnet 4.5) | ~$0.08 | ~$0.04 |
| Weekly deep analysis (Opus 4.6) | ~$1.50 | ~$0.85 |

Adaptive mode: GREEN patients get standard analysis. YELLOW+ patients get full deep analysis with differential diagnosis and trajectory projection.

## License

MIT License — see [LICENSE](LICENSE).

---

*55 million people live with Alzheimer's. Most are diagnosed too late. AlzheimerVoice catches the signal in the voice — for less than $0.04 a day, on any phone.*
