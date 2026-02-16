import { useT } from '../lib/i18n'
import { useRouter } from '../lib/router'

function Section({ children, className = '' }) {
  return <section className={`py-20 ${className}`}><div className="max-w-7xl mx-auto px-6">{children}</div></section>
}

function SectionHeader({ label, title, highlight, desc }) {
  return (
    <div className="text-center mb-16">
      {label && <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300 mb-4">{label}</span>}
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{highlight}</span></h2>
      {desc && <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">{desc}</p>}
    </div>
  )
}

function DimensionCard({ name, desc }) {
  return (
    <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
      <p className="text-sm font-semibold text-violet-300 mb-1">{name}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}

const DOMAINS = [
  { label: 'domainLexical', prefix: 'lexical', count: 8 },
  { label: 'domainSyntactic', prefix: 'syntactic', count: 5 },
  { label: 'domainCoherence', prefix: 'coherence', count: 7 },
  { label: 'domainFluency', prefix: 'fluency', count: 8 },
  { label: 'domainMemory', prefix: 'memory', count: 6 },
  { label: 'domainDiscourse', prefix: 'discourse', count: 5 },
  { label: 'domainAffective', prefix: 'affective', count: 6 },
  { label: 'domainAcoustic', prefix: 'acoustic', count: 3 },
  { label: 'domainPdMotor', prefix: 'pdMotor', count: 3 },
]

export default function ScientificPage() {
  const { t } = useT()
  const { navigate } = useRouter()

  const pipes = [1, 2, 3, 4, 5]

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('scientific.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('scientific.heroHighlight')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">{t('scientific.heroSubtitle')}</p>
        </div>
      </Section>

      {/* Engine Architecture */}
      <Section>
        <SectionHeader label={t('scientific.engineLabel')} title={t('scientific.engineTitle')} highlight={t('scientific.engineHighlight')} desc={t('scientific.engineDesc')} />
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-6">{t('scientific.pipelineTitle')}</h3>
          <div className="grid gap-4">
            {pipes.map((i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-violet-400">{i}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{t(`scientific.pipe${i}Title`)}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{t(`scientific.pipe${i}Desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Dual-Pass Algorithm */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label="V5 Algorithm" title="Dual-Pass" highlight="Analysis Architecture" desc="The V5 engine processes every conversation through two independent analysis passes that cross-validate each other, dramatically reducing false positives and enabling condition-specific pattern detection that single-pass systems miss." />
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald-400">P1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-300">Pass 1: Real-Time Extraction</p>
                <p className="text-xs text-slate-500">Claude Sonnet 4.5 + Acoustic Pipeline</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span>Audio stream processed by parselmouth + librosa + nolds (21 acoustic indicators)</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span>Transcript analyzed by Claude Sonnet 4.5 (64 linguistic indicators across 7 domains)</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span>Both streams merge into an 85-indicator cognitive vector</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span>Deterministic scoring engine: z-scores, 9 domain scores, composite, cascade detection</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span>35-rule differential diagnosis across 8 conditions runs in real-time</li>
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-violet-400">P2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-300">Pass 2: Deep Clinical Reasoning</p>
                <p className="text-xs text-slate-500">Claude Opus 4.6 — Extended Thinking</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0">→</span>Weekly analysis with 16,000-token thinking budget for deep reasoning</li>
              <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0">→</span>Cross-validates Pass 1 differential against multi-session trajectory</li>
              <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0">→</span>Discovers micro-patterns invisible to rule-based scoring</li>
              <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0">→</span>Generates family-friendly and clinical narrative reports</li>
              <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0">→</span>Designs next week's conversation probes targeting detected weaknesses</li>
            </ul>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 max-w-3xl mx-auto">
          <p className="text-sm text-slate-300 text-center leading-relaxed">
            The dual-pass architecture means no single analysis point determines a diagnosis. Pass 1 provides fast, deterministic scoring grounded in 80 research papers. Pass 2 applies deep clinical reasoning to validate, refine, and contextualize those scores across the patient's full history. When both passes agree, confidence is high. When they diverge, the system flags uncertainty rather than guessing.
          </p>
        </div>
      </Section>

      {/* 85 Indicators across 9 Domains */}
      <Section>
        <SectionHeader label={t('scientific.dimensionsLabel')} title={t('scientific.dimensionsTitle')} highlight={t('scientific.dimensionsHighlight')} desc={t('scientific.dimensionsDesc')} />
        <div className="space-y-10">
          {DOMAINS.map(({ label, prefix, count }) => (
            <div key={prefix}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                {t(`scientific.${label}`)}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: count }, (_, i) => (
                  <DimensionCard key={i} name={t(`scientific.${prefix}${i + 1}`)} desc={t(`scientific.${prefix}${i + 1}Desc`)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Claude Integration */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('scientific.claudeLabel')} title={t('scientific.claudeTitle')} highlight={t('scientific.claudeHighlight')} desc={t('scientific.claudeDesc')} />
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {t(`scientific.claudeFeature${i}`)}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Validation */}
      <Section>
        <SectionHeader label={t('scientific.validationLabel')} title={t('scientific.validationTitle')} highlight={t('scientific.validationHighlight')} desc={t('scientific.validationDesc')} />
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-6">{t('scientific.validationStudies')}</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed">{t(`scientific.study${i}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Back */}
      <Section>
        <div className="text-center">
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate('cognitivevoicefingerprint')} className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-colors">
              {t('nav.cvf')}
            </button>
            <button onClick={() => navigate('home')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors">
              {t('scientific.backToHome')}
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}
