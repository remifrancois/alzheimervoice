# MEMOVOICE PROJECT GUIDE — SKILL.md
# Complete Application Architecture for Claude Code
# Version: 1.0 — Hackathon Cerebral Valley Feb 2026

---

## WHAT IS MEMOVOICE

MemoVoice is an open-source cognitive health companion that calls elderly patients on their existing phone (landline, basic mobile, any phone) and uses Claude Opus 4.6 to detect early signs of Alzheimer's disease through linguistic analysis — years before clinical diagnosis.

**The core insight:** 55 million people live with Alzheimer's worldwide. Most are diagnosed too late. Voice analysis detects cognitive decline with 78-94% accuracy (ADReSS Challenge, Nature 2025). But existing tools require smartphones, apps, and internet — excluding the most vulnerable populations. MemoVoice works on any phone. The phone rings, they answer, they talk. That's it.

**The scientific breakthrough:** Instead of comparing patients to population norms, MemoVoice creates a unique "Cognitive Voice Fingerprint" (CVF) for each patient — like Shazam creates a unique fingerprint per song. It then detects deviation from the patient's OWN baseline over time. A retired farmer and a university professor have different vocabularies — but both show measurable drift when Alzheimer's begins.

**The human breakthrough:** Family members enrich the patient's memory profile with personal stories ("Mom ran the NYC Marathon in 1998 with her sister Catherine"). The AI uses these memories to create natural conversations that are actually clinical-grade memory assessments — the patient thinks they're chatting with a friend while Claude implements the Grober & Buschke RL/RI-16 protocol invisibly.

---

## APPLICATION STRUCTURE

```
memovoice/
├── landing/                    # Public website (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Main landing page
│   │   │   ├── HowItWorks.jsx  # The science explained simply
│   │   │   ├── OpenSource.jsx  # GitHub, contribute, self-host
│   │   │   └── Pricing.jsx     # SaaS plans + free tier
│   │   ├── components/
│   │   │   ├── Hero.jsx
│   │   │   ├── PhoneDemo.jsx   # Animated phone ringing visual
│   │   │   ├── FingerprintViz.jsx # CVF visualization
│   │   │   ├── Timeline.jsx    # Before/after detection timeline
│   │   │   └── Testimonial.jsx
│   │   └── i18n/               # Internationalization from day 1
│   │       ├── en.json
│   │       └── fr.json
│   └── public/
│
├── app/                        # Family Dashboard (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Patient overview + scores
│   │   │   ├── Memories.jsx    # Add/edit memory profile
│   │   │   ├── Calls.jsx       # Call history + transcripts
│   │   │   ├── Reports.jsx     # Weekly reports + timeline
│   │   │   ├── Settings.jsx    # Call schedule, language, contacts
│   │   │   └── Onboarding.jsx  # First-time setup wizard
│   │   ├── components/
│   │   │   ├── CVFRadar.jsx    # 5-domain radar chart
│   │   │   ├── DriftTimeline.jsx # Longitudinal drift visualization
│   │   │   ├── MemoryCard.jsx  # Individual memory CRUD
│   │   │   ├── AlertBadge.jsx  # GREEN/YELLOW/ORANGE/RED
│   │   │   ├── CallPlayer.jsx  # Transcript viewer (no audio stored)
│   │   │   └── ReportCard.jsx  # Weekly analysis summary
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   └── fr.json
│   │   └── hooks/
│   │       ├── usePatient.js
│   │       ├── useMemories.js
│   │       └── useCVF.js
│   └── public/
│
├── admin/                      # Admin Panel (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # All patients overview
│   │   │   ├── Accounts.jsx    # Family account management
│   │   │   ├── APIUsage.jsx    # Claude API credit tracking
│   │   │   ├── SystemHealth.jsx # Call success rates, errors
│   │   │   └── DataExport.jsx  # Anonymized research export
│   │   └── components/
│   │       ├── UsageChart.jsx
│   │       ├── PatientTable.jsx
│   │       └── CreditMeter.jsx
│   └── public/
│
├── server/                     # Backend (Node.js + Fastify)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── twiml.js        # Twilio webhook handler
│   │   │   ├── websocket.js    # ConversationRelay WebSocket
│   │   │   ├── api/
│   │   │   │   ├── patients.js
│   │   │   │   ├── memories.js
│   │   │   │   ├── reports.js
│   │   │   │   ├── calls.js
│   │   │   │   └── auth.js
│   │   │   └── admin/
│   │   │       ├── accounts.js
│   │   │       └── usage.js
│   │   ├── services/
│   │   │   ├── claude.js       # Claude API integration
│   │   │   ├── cvf-engine.js   # Cognitive Voice Fingerprint engine
│   │   │   ├── memory-selector.js # Memory selection algorithm
│   │   │   ├── drift-detector.js  # Drift analysis + alerting
│   │   │   ├── report-generator.js # Family + medical reports
│   │   │   └── scheduler.js    # Daily call scheduler (cron)
│   │   ├── models/             # Data schemas (JSON files on disk for hackathon)
│   │   │   ├── patient.js
│   │   │   ├── memory.js
│   │   │   ├── session.js
│   │   │   ├── cvf.js
│   │   │   └── account.js
│   │   ├── prompts/
│   │   │   ├── conversation-system.md   # Main conversation prompt
│   │   │   ├── feature-extraction.md    # Post-call analysis prompt
│   │   │   ├── weekly-analysis.md       # Extended thinking prompt
│   │   │   └── report-generation.md     # Family/medical report prompt
│   │   └── i18n/
│   │       ├── conversation-en.json     # Conversation templates EN
│   │       └── conversation-fr.json     # Conversation templates FR
│   └── data/                   # File-based storage (hackathon)
│       ├── patients/
│       ├── sessions/
│       ├── cvf/
│       └── reports/
│
├── docs/                       # Documentation
│   ├── SKILL-cognitive-voice-fingerprint.md  # The CVF science skill
│   ├── SKILL-project-guide.md               # This file
│   ├── API.md                               # API documentation
│   ├── SELF-HOST.md                         # Self-hosting guide
│   └── RESEARCH.md                          # Scientific references
│
├── .env.example                # Environment variables template
├── package.json
├── LICENSE                     # MIT License
└── README.md
```

---

## LANDING PAGE — KEY CONTENT

### Hero Section

**Headline (EN):** "The voice remembers what the mind forgets."
**Headline (FR):** "La voix se souvient de ce que l'esprit oublie."

**Sub-headline:** MemoVoice calls your loved one every day for a warm, friendly chat. Behind the scenes, AI detects the earliest signs of cognitive decline — years before a diagnosis. No app. No internet. Just a phone call.

**CTA:** "Protect someone you love" → Onboarding

### Visual: Animated Phone Sequence

```
1. [Ringing phone animation] "Every morning, grandma's phone rings."
2. [Warm voice wave] "A caring voice asks about her day."
3. [5-minute conversation visualization] "She talks for 5 minutes. She thinks it's just a friendly chat."
4. [Invisible fingerprint forming] "Behind the scenes, AI creates her unique Cognitive Voice Fingerprint."
5. [SMS notification on son's phone] "Her son gets a 3-line update. Peace of mind, every day."
6. [Timeline showing early detection] "If something changes, families know first. Years before a diagnosis."
```

### Key Sections

**"How It Works"** — 4 steps with illustrations:
1. **Family signs up** — Add patient's first name, phone number, preferred language, call time. Add personal memories to enrich conversations.
2. **MemoVoice calls daily** — A warm AI companion calls on their existing phone. No setup needed. The phone rings, they answer, they talk.
3. **AI creates a voice fingerprint** — 25 linguistic biomarkers build a unique cognitive map, calibrated to THEIR normal — not population averages.
4. **Family stays informed** — Daily 3-line SMS. Weekly detailed report. If drift is detected, a medical visit is recommended.

**"The Science"** — Credibility section:
- 78-94% detection accuracy (cite: ADReSS Challenge, Nature 2025)
- Based on 50+ peer-reviewed studies
- Implements Grober & Buschke clinical gold standard through natural conversation
- Longitudinal tracking: 365 data points/year vs 1 annual checkup
- Validated in English, French, Spanish, Chinese, Greek (MultiConAD 2025)

**"Why a Phone Call?"** — The accessibility argument:
- 861 million landlines worldwide
- 70% of people 80+ don't use smartphones
- 100% of elderly know how to answer a phone
- $13/month vs $300 blood test vs $1000+ brain scan
- Works for your grandmother in Paris, Bogotá, Tokyo, or rural Wisconsin

**"Open Source"** — The mission:
- 100% MIT license. Free forever for personal use.
- Pharma won't build this — there's no pill to sell.
- Insurance won't pay — prevention doesn't have a billing code yet.
- Only open source makes universal cognitive screening possible.
- GitHub link, contribution guide, self-hosting instructions.
- "Add your language in one weekend. Deploy for your community."

**"SaaS" (Optional Managed Service):**
- Free tier: 1 patient, daily calls, basic reports
- Family plan: $13/month, up to 3 patients, full reports, SMS alerts
- Care facility: $400/month, up to 80 residents, admin dashboard, medical reports
- Research: Contact us for anonymized data partnerships

### Footer
- Open source: GitHub, MIT License, Contributors
- Research: Academic papers, dataset references
- Legal: Privacy policy, Terms of service, GDPR/HIPAA compliance notes
- Contact: email, community Discord

---

## FAMILY DASHBOARD — DETAILED SPECIFICATIONS

### Onboarding Wizard (First-time Setup)

**Philosophy: Collect minimum data. Ask no personal information we don't need.**

```
STEP 1: "Who are you?"
  - Your first name (not last name — we don't need it)
  - Your email (for login only)
  - Password
  - Your preferred language (EN/FR)
  - Your phone number (for SMS reports)

STEP 2: "Who would you like MemoVoice to call?"
  - Patient's first name (ONLY first name)
  - Patient's preferred language (EN/FR)
  - Patient's phone number (the one MemoVoice will call)
  - Preferred call time (morning/afternoon/evening + timezone)
  - "Does [name] know about MemoVoice?"
    → Yes: "Great! We'll introduce ourselves warmly."
    → No: "We recommend telling them a friend signed them up for daily check-in calls.
           MemoVoice will never mention health monitoring to the patient."

STEP 3: "Share some memories" (the enrichment engine)
  - "The more memories you share, the more meaningful the conversations will be."
  - "These memories help MemoVoice have natural, personalized conversations."
  - Add 3-5 memories to start. Each memory has:
    → A short description (free text, max 280 chars)
    → Category: Achievement | Family | Travel | Work | Hobby | Food | Other
    → People involved (first names only)
    → Approximate date/period
    → Emotional tone: Happy | Proud | Nostalgic | Funny | Bittersweet
  - Examples shown: "Mom ran the NYC Marathon in 1998 with her sister Catherine"
  - "You can always add more memories later."

STEP 4: Confirmation
  - Summary of setup
  - "MemoVoice will start calling [name] tomorrow at [time]."
  - "The first 2 weeks are calibration — MemoVoice is learning [name]'s unique voice pattern."
  - "You'll start receiving daily SMS updates and weekly reports after calibration."
```

### Dashboard (Main Screen)

```
┌─────────────────────────────────────────────┐
│  MemoVoice — [Patient First Name]           │
│  Status: ● GREEN — All within normal range  │
├─────────────────────────────────────────────┤
│                                             │
│  TODAY'S CALL                               │
│  ✅ Called at 9:15am · Duration: 4m 32s     │
│  "Marie was cheerful today. She talked      │
│  about her garden and remembered details    │
│  about the rose bushes she planted with     │
│  her husband. Suggestion: ask her about     │
│  the roses next time you visit."            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  COGNITIVE VOICE FINGERPRINT                │
│  [5-axis radar chart]                       │
│  Lexical ████████░░ 82%                     │
│  Syntax  ███████░░░ 75%                     │
│  Coherence ████████░░ 79%                   │
│  Fluency ███████░░░ 71%                     │
│  Memory  █████████░ 88%                     │
│                                             │
│  vs baseline: ▼2% avg (normal fluctuation)  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  WEEKLY TREND                               │
│  [Line chart: 25 features over 4 weeks]     │
│  All domains stable. No alerts.             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  QUICK ACTIONS                              │
│  [+ Add Memory] [📞 Call History]           │
│  [📊 Full Report] [⚙️ Settings]            │
│                                             │
└─────────────────────────────────────────────┘
```

### Memories Page

```
┌─────────────────────────────────────────────┐
│  Memories — Marie's Life Stories            │
│  "These memories power personalized         │
│  conversations. Add as many as you'd like." │
├─────────────────────────────────────────────┤
│                                             │
│  🏃 Marathon de New York (1998)             │
│  "Ran the NYC Marathon with sister Catherine"│
│  People: Catherine · Category: Achievement  │
│  Last tested: Feb 15 · Recall: Free ✅      │
│  [Edit] [Remove]                            │
│                                             │
│  🍳 Gratin Dauphinois de Maman Jeanne      │
│  "Her mother Jeanne's recipe, makes it      │
│  every Sunday for family lunch"             │
│  People: Jeanne · Category: Food            │
│  Last tested: Feb 12 · Recall: Cued ⚠️     │
│  [Edit] [Remove]                            │
│                                             │
│  🏫 École Jules Ferry (1965-1995)           │
│  "Was a teacher at Jules Ferry school for   │
│  30 years, taught CM1-CM2"                  │
│  People: — · Category: Work                 │
│  Last tested: Feb 18 · Recall: Free ✅      │
│  [Edit] [Remove]                            │
│                                             │
│  [+ Add New Memory]                         │
│                                             │
└─────────────────────────────────────────────┘
```

### Reports Page

Weekly report view showing:
- Composite score trend (line chart, 12 weeks)
- Domain-by-domain breakdown (radar chart comparison: this week vs baseline)
- Notable observations in plain language
- Suggestions for family engagement
- Medical summary (toggleable, more clinical language)
- PDF export for doctor appointments

### Alert States — Visual Design

```
GREEN:  Soft green background, checkmark icon
  "All within normal range. [Name] is doing well."

YELLOW: Soft amber background, eye icon
  "Some features trending below baseline. We're monitoring more closely."
  (No action required from family yet)

ORANGE: Orange background, alert icon
  "Consistent changes detected over [X] weeks. We recommend scheduling
  a cognitive screening with your family doctor."
  [Button: "Learn about cognitive screening"]
  [Button: "Share report with doctor (PDF)"]

RED:    Red background, urgent icon
  "Significant changes detected. Please schedule a medical evaluation."
  [Button: "Find a neurologist near you"]
  [Button: "Download medical report"]
  [Button: "Call emergency contact"]
```

---

## ADMIN PANEL — SPECIFICATIONS

### Dashboard

```
┌─────────────────────────────────────────────┐
│  MemoVoice Admin                            │
├─────────────────────────────────────────────┤
│                                             │
│  OVERVIEW                                   │
│  Active patients: 47                        │
│  Calls today: 42/47 (89% success rate)      │
│  Failed calls: 5 (3 no answer, 2 busy)      │
│  Alerts: 🟢 38 🟡 6 🟠 3 🔴 0              │
│                                             │
│  API USAGE (this month)                     │
│  Claude Opus 4.6:  $142.30 / $500.00        │
│  ████████████░░░░░  28.5%                   │
│  Projected end of month: $380                │
│  Calls remaining at current rate: ~1,200     │
│                                             │
│  COST BREAKDOWN                             │
│  Conversations: $98.40 (69%)                │
│  Feature extraction: $22.10 (16%)           │
│  Weekly analysis: $15.80 (11%)              │
│  Reports: $6.00 (4%)                        │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  RECENT ALERTS                              │
│  🟠 Patient "Henri" — Week 8: Coherence     │
│     domain z=-1.2. Medical visit recommended.│
│  🟡 Patient "Suzanne" — Week 5: Lexical     │
│     drift z=-0.7. Monitoring increased.      │
│                                             │
└─────────────────────────────────────────────┘
```

### Account Management

- Create/edit/deactivate family accounts
- Assign API credit limits per account
- View usage per patient (cost breakdown)
- Manage call schedules (bulk operations)
- Export anonymized research datasets

### System Health

- Call success/failure rates with reasons
- API response times (Claude, Twilio)
- Transcription quality metrics
- Error logs and retry queue

---

## SECURITY ARCHITECTURE — NON-NEGOTIABLE

### Data Minimization

```
WE COLLECT:
  ✅ Patient first name (no last name)
  ✅ Phone number (for calling)
  ✅ Language preference
  ✅ Call schedule preference
  ✅ Family-provided memories (voluntary)
  ✅ Conversation transcripts (text only)
  ✅ CVF vectors and scores (derived data)

WE NEVER COLLECT:
  ❌ Last name, address, date of birth
  ❌ Social security / national ID
  ❌ Medical records or diagnosis
  ❌ Audio recordings (deleted after transcription)
  ❌ GPS location
  ❌ Photos
  ❌ Financial information (payment via Stripe, we never see card numbers)
```

### Data Segregation Architecture

```
┌─────────────────────────────────────────┐
│  Account Layer (encrypted at rest)       │
│  ┌──────────────────────────────────┐   │
│  │ Family Account                    │   │
│  │ email, password_hash, preferences │   │
│  └──────────┬───────────────────────┘   │
│             │ account_id (UUID)          │
│  ┌──────────▼───────────────────────┐   │
│  │ Patient Profile                   │   │
│  │ first_name, phone_hash, language  │   │
│  │ call_schedule, patient_id (UUID)  │   │
│  └──────────┬───────────────────────┘   │
│             │ patient_id                 │
│  ┌──────────▼──────────┐ ┌────────────┐│
│  │ Memory Profiles      │ │ CVF Data   ││
│  │ Stored separately    │ │ Vectors    ││
│  │ from analysis data   │ │ Scores     ││
│  │ family_content only  │ │ Drift data ││
│  └─────────────────────┘ └────────────┘│
│             │                    │       │
│  ┌──────────▼────────────────────▼────┐ │
│  │ Session Transcripts                 │ │
│  │ Encrypted, auto-purge after 90 days │ │
│  │ (configurable retention policy)     │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Encryption

- All data encrypted at rest (AES-256)
- All API calls over TLS 1.3
- Phone numbers stored as salted hashes (unhashable for display, original needed only for Twilio call initiation — stored in separate encrypted vault)
- Transcripts encrypted with per-patient key
- Self-hosted deployments: families control their own encryption keys

### Authentication

- Family dashboard: email + password (bcrypt hashed)
- Admin panel: email + password + TOTP 2FA
- API: JWT tokens with 24h expiry
- No social login (privacy: no Facebook/Google data sharing)

### GDPR / Privacy Compliance

- Right to access: family can export all data (JSON)
- Right to deletion: one-click delete all patient data
- Data portability: export CVF vectors + memories in open format
- No data selling. Ever. Written in the license.
- Open source = auditable by anyone

---

## MULTI-LANGUAGE ARCHITECTURE — FROM DAY 1

### Principle: Language is a First-Class Entity

Every component is designed multilingual from the start. Adding a language is adding a JSON file + calibrating the CVF extraction rules.

### i18n Structure

```json
// en.json (example)
{
  "landing": {
    "hero_title": "The voice remembers what the mind forgets.",
    "hero_subtitle": "MemoVoice calls your loved one every day...",
    "cta": "Protect someone you love"
  },
  "dashboard": {
    "status_green": "All within normal range",
    "status_yellow": "Some features trending below baseline",
    "status_orange": "Consistent changes detected",
    "status_red": "Significant changes detected",
    "today_call": "Today's Call",
    "cvf_title": "Cognitive Voice Fingerprint"
  },
  "onboarding": {
    "step1_title": "Who are you?",
    "step2_title": "Who would you like MemoVoice to call?",
    "step3_title": "Share some memories",
    "first_name_only": "First name only — we don't need anything else"
  }
}
```

```json
// fr.json (example)
{
  "landing": {
    "hero_title": "La voix se souvient de ce que l'esprit oublie.",
    "hero_subtitle": "MemoVoice appelle votre proche chaque jour...",
    "cta": "Protégez quelqu'un que vous aimez"
  },
  "dashboard": {
    "status_green": "Tout est dans la normale",
    "status_yellow": "Certains indicateurs évoluent légèrement",
    "status_orange": "Des changements consistants ont été détectés",
    "status_red": "Des changements significatifs ont été détectés",
    "today_call": "L'appel d'aujourd'hui",
    "cvf_title": "Empreinte Vocale Cognitive"
  },
  "onboarding": {
    "step1_title": "Qui êtes-vous ?",
    "step2_title": "Qui aimeriez-vous que MemoVoice appelle ?",
    "step3_title": "Partagez des souvenirs",
    "first_name_only": "Prénom uniquement — nous n'avons besoin de rien d'autre"
  }
}
```

### Adding a New Language Checklist

1. [ ] Add `{lang}.json` for landing, app, and admin
2. [ ] Add conversation templates in `server/i18n/conversation-{lang}.json`
3. [ ] Add language-specific CVF extraction rules (see SKILL-cognitive-voice-fingerprint.md)
4. [ ] Configure Twilio ConversationRelay language parameter
5. [ ] Test with native speaker (14-session calibration)

---

## TECH STACK — FINAL

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend (all 3 apps) | React 18 + Vite | Fast, modern, familiar |
| Styling | Tailwind CSS | Utility-first, responsive, fast to build |
| Backend | Node.js + Fastify | Fast WebSocket support for ConversationRelay |
| AI Engine | Claude Opus 4.6 API | Extended thinking, 1M context, multilingual empathy |
| Voice Infra | Twilio ConversationRelay | STT + TTS + WebSocket orchestration (swappable) |
| TTS Voice | ElevenLabs (via Twilio) | Human-like warmth, 75ms latency, 1000+ voices |
| Storage (hackathon) | JSON files on disk | Simple, no DB setup, export-friendly |
| Storage (production) | PostgreSQL + encrypted volumes | Scalable, ACID, encrypted at rest |
| Hosting (hackathon) | Fly.io free tier | Global edge, WebSocket support |
| Auth | Custom JWT | No third-party auth dependency |
| SMS | Twilio SMS API | Same platform as voice |
| i18n | react-i18next | Industry standard, lazy loading |
| Charts | Recharts | React-native charts, radar + line support |
| License | MIT | Maximum openness |

### Voice Infrastructure Note

The voice pipeline (Twilio + ConversationRelay) is **modular and swappable**. The core of MemoVoice is the CVF engine (Claude prompts + analysis logic). Any voice provider can plug in:
- Twilio (current)
- Amazon Connect
- Vonage
- FreeSWITCH (open source)
- WhatsApp Voice API
- Even a simple phone recording uploaded manually

The interface between voice and CVF is a simple contract:

```typescript
interface ConversationTranscript {
  patient_id: string;
  session_id: string;
  language: "en" | "fr";
  timestamp: string;
  duration_seconds: number;
  turns: {
    role: "assistant" | "patient";
    text: string;
    timestamp: string;
    // optional: word-level timestamps for pause analysis
    word_timestamps?: { word: string; start: number; end: number }[];
  }[];
}
```

Any voice system that produces this format works with MemoVoice.

---

## ENVIRONMENT VARIABLES

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-opus-4-6

# Twilio (swappable)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_TTS_PROVIDER=ElevenLabs
TWILIO_TTS_VOICE=Sarah  # warm, friendly female voice

# Application
APP_URL=https://memovoice.app
API_URL=https://api.memovoice.app
ADMIN_URL=https://admin.memovoice.app

# Security
JWT_SECRET=...
ENCRYPTION_KEY=...  # AES-256 key for data at rest
ADMIN_2FA_SECRET=...

# Storage
DATA_DIR=./data
TRANSCRIPT_RETENTION_DAYS=90

# Alerts
SMS_ALERT_ENABLED=true
EMAIL_ALERT_ENABLED=true

# i18n
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,fr
```

---

## DEVELOPMENT PRIORITIES — HACKATHON WEEK

### Day 1 (Mon Feb 10): Foundation
- [ ] Project scaffolding (monorepo, all 3 React apps + server)
- [ ] Claude API integration: test conversation prompt
- [ ] Twilio ConversationRelay: basic inbound/outbound call working
- [ ] First end-to-end call: phone rings → Claude converses → transcript saved

### Day 2 (Tue Feb 11): CVF Engine
- [ ] Implement feature extraction prompt (25 features from transcript)
- [ ] Baseline calibration logic
- [ ] JSON storage for patient profiles, sessions, CVF vectors
- [ ] Test: run 3 simulated conversations, verify feature extraction

### Day 3 (Wed Feb 12): Drift Detection
- [ ] Delta computation from baseline
- [ ] Weekly composite score
- [ ] Alert threshold logic (GREEN → YELLOW → ORANGE → RED)
- [ ] Extended Thinking weekly analysis prompt
- [ ] Test: simulate 30-day timeline with progressive decline

### Day 4 (Thu Feb 13): Family Dashboard
- [ ] Onboarding wizard (4 steps)
- [ ] Dashboard with CVF radar chart + call summary
- [ ] Memories CRUD interface
- [ ] Reports page with weekly analysis display

### Day 5 (Fri Feb 14): Landing Page + Polish
- [ ] Landing page with all sections
- [ ] FR + EN translations for all interfaces
- [ ] Mobile responsive design
- [ ] SMS alert integration (daily + urgent alerts)

### Day 6 (Sat Feb 15): Admin + Demo Prep
- [ ] Admin panel (usage tracking, patient overview)
- [ ] Demo scenario: simulate "Marie, 75, French" — 3-month timeline
- [ ] Generate demo data showing baseline → green → yellow → orange progression
- [ ] Record demo video or prepare live demo

### Day 7 (Sun Feb 16): Submission
- [ ] GitHub repo: clean README, LICENSE, CONTRIBUTING.md
- [ ] Deploy landing + demo on Fly.io
- [ ] Final testing: full end-to-end flow
- [ ] Submit to hackathon
- [ ] Write submission narrative

---

## DESIGN PRINCIPLES

### Visual Identity
- **Primary color:** Deep teal (#0D9488) — medical trust, calm
- **Secondary color:** Warm amber (#F59E0B) — human warmth, care
- **Alert colors:** Standard semantic (green/yellow/orange/red)
- **Typography:** Inter (clean, accessible, multilingual support)
- **Tone:** Warm, professional, reassuring. Never clinical or cold.
- **Logo concept:** Sound wave forming a brain silhouette (or heart)

### UX Principles
1. **Family-first.** Every design decision serves the worried son or daughter, not the data scientist.
2. **Plain language.** "Marie is doing well" not "Composite z-score within normal distribution."
3. **Actionable.** Every report ends with something the family can DO. "Look at vacation photos together tonight."
4. **Never alarming without reason.** GREEN is the default state. Alerts are graduated and always accompanied by context.
5. **Respectful of dignity.** The patient is a person with a rich life story, not a dataset. Every screen reflects this.
6. **Fast onboarding.** Under 5 minutes from "I want to protect my parent" to "first call scheduled."

---

## IMPORTANT DISCLAIMERS (visible in the product)

```
MemoVoice is not a medical device. It does not diagnose any condition.
MemoVoice is a cognitive health monitoring companion that tracks linguistic
patterns over time and recommends professional consultation when changes
are detected. Always consult a qualified healthcare professional for
medical advice, diagnosis, or treatment.

MemoVoice is open source software provided under the MIT license.
It is provided "as is" without warranty of any kind.
```

---

*Grandma doesn't know how to use an app. But she knows how to answer the phone.*
*Mamie ne sait pas utiliser une app. Mais elle sait décrocher le téléphone.*
