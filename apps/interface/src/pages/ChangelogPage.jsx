import Topbar from '../components/layout/Topbar'
import { Card, Badge } from '@azh/shared-ui'

const CHANGELOG = [
  {
    version: 'v5.0.0',
    date: 'February 2026',
    title: 'V5 — Family Interface & Hackathon Demo',
    items: [
      'Rebranded from MemoVoice to AlzheimerVoice',
      'CVF Engine upgraded to V5 architecture',
      'New Memories page — family can populate life memories for personalized AI conversations',
      'New Calls page — view upcoming call schedule and what the AI will discuss',
      'Family-only interface — each caregiver sees only their loved one\'s data',
      'Hardcoded demo data with 5 realistic patient profiles (green, yellow, orange, red statuses)',
      '20-30 rich life memories per patient for AI conversation context',
      '50-80 days of monitoring history per profile',
      'Demo banner with hackathon attribution and GitHub link',
      'Removed clinical/doctor profiles — focused entirely on family caregivers',
    ],
  },
  {
    version: 'v0.2.0',
    date: 'January 2026',
    title: 'V4 — 6-Layer Deep Analysis & Admin Dashboard',
    items: [
      'CVF Engine V4 with 6-layer deep analysis pipeline',
      'Differential Diagnosis — probability distribution across 6 conditions',
      'Cognitive Twin — patient trajectory vs personalized normal aging model',
      'Cohort Trajectory Matching — comparison against 100 synthetic reference trajectories',
      'Cognitive Archaeology — semantic network health mapping',
      'Admin dashboard with real-time engine metrics',
      'AWS Cognito authentication with enterprise security hardening',
      'Role-based access control: admin, clinician, family',
      'Cascade Tracker — 4-stage progressive AD linguistic cascade',
    ],
  },
  {
    version: 'v0.1.0',
    date: 'December 2025',
    title: 'V1 — Foundation & Core Monitoring',
    items: [
      'Initial CVF Engine with 25-feature extraction across 5 cognitive domains',
      'Personalized baseline calibration (14+ sessions)',
      'Z-score composite monitoring with 4-level alert system',
      'Composite Timeline chart with color-coded alert zones',
      'Domain breakdown visualization (lexical, syntactic, coherence, fluency, memory)',
      'Weekly report generation with family and clinical narratives',
      'Session history with expandable detail view',
      'Multi-language support (English, French)',
      'Encrypted local data storage',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <>
      <Topbar title="Changelog" subtitle="AlzheimerVoice release history" />

      <div className="p-6 space-y-6 max-w-3xl">
        {CHANGELOG.map(release => (
          <Card key={release.version}>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="brand">{release.version}</Badge>
              <span className="text-xs text-slate-500">{release.date}</span>
              {release.version === 'v5.0.0' && (
                <Badge variant="success">Latest</Badge>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              {release.title}
            </h3>
            <ul className="space-y-2">
              {release.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}

        {/* Coming Soon */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Coming Soon
          </h3>
          <ul className="space-y-2">
            {[
              'V5 Engine real-time audio transcription pipeline',
              'Voice recording integration from family interface',
              'Memory-aware AI conversation engine',
              'Family notification system for alert changes',
              'Multi-patient family dashboard',
              'Mobile-responsive interface',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                <span className="text-slate-600 mt-0.5 shrink-0">&#x25CB;</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
