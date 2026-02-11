# MemoVoice Dashboard

Clinical monitoring dashboard for the MemoVoice Cognitive Voice Fingerprint (CVF) Engine.

## Stack

- React 19 + Vite 7
- Tailwind CSS 4
- Recharts 3
- React Router DOM 7

## Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/` | Patient monitoring with composite timeline, domain scores, V2 deep analysis |
| Patients | `/patients` | Patient roster with alert levels and session counts |
| Analysis | `/analysis` | 25-feature matrix, AD cascade tracker, differential diagnosis, semantic map |
| Reports | `/reports` | Weekly clinical reports with family + medical narratives |
| Settings | `/settings` | System configuration, alert thresholds, domain weights |

## V2 Components

- **DifferentialDiagnosis** — Probability distribution across 6 conditions
- **CognitiveTwinChart** — Real vs expected normal aging trajectory
- **CohortMatching** — Synthetic cohort trajectory matching with outcome prediction
- **SemanticMap** — Cognitive archaeology network health visualization

## Development

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # Production build to dist/
```

Expects the MemoVoice server running on `localhost:3001` (proxied via Vite config).
