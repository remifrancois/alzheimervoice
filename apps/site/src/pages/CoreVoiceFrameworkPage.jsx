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

const DOMAINS = [
  { key: 'lexical', prefix: 'lex', count: 17 },
  { key: 'syntactic', prefix: 'syn', count: 8 },
  { key: 'semantic', prefix: 'sem', count: 9 },
  { key: 'temporal', prefix: 'tmp', count: 11 },
  { key: 'memory', prefix: 'mem', count: 6 },
  { key: 'discourse', prefix: 'dis', count: 5 },
  { key: 'affective', prefix: 'aff', count: 6 },
  { key: 'acoustic', prefix: 'acu', count: 11 },
  { key: 'pdMotor', prefix: 'pdm', count: 12 },
]

const DOMAIN_COLORS = [
  'from-violet-500 to-violet-600',
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
  'from-pink-500 to-pink-600',
  'from-orange-500 to-orange-600',
  'from-red-500 to-red-600',
]

const COMPARISON = [
  { label: 'Modality', v4: 'Text + Audio (two-stream)', v5: 'Dual-pass: Text + Audio + Deep Reasoning' },
  { label: 'Indicators', v4: '85', v5: '85 (refined weights + dual-pass validation)' },
  { label: 'Domains', v4: '9', v5: '9 (enhanced acoustic + PD motor)' },
  { label: 'Conditions', v4: '8', v5: '8 (improved differential accuracy)' },
  { label: 'Differential rules', v4: '23', v5: '35' },
  { label: 'Analysis passes', v4: '1 (real-time)', v5: '2 (real-time + weekly deep reasoning)' },
  { label: 'Pass 1 model', v4: 'Sonnet 4.5', v5: 'Sonnet 4.5 + acoustic pipeline' },
  { label: 'Pass 2 model', v4: 'Opus (basic)', v5: 'Opus 4.6 extended thinking (16K tokens)' },
  { label: 'Cascade types', v4: '3 (AD, PD, Depression)', v5: '3 (refined detection thresholds)' },
  { label: 'Micro-tasks', v4: '4 embedded', v5: '4 embedded + adaptive scheduling' },
  { label: 'Research base', v4: '80 papers', v5: '80 papers (74 PDFs + 6 summaries)' },
]

export default function CoreVoiceFrameworkPage() {
  const { t } = useT()
  const { navigate } = useRouter()

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('cvf.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('cvf.heroHighlight')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">{t('cvf.heroSubtitle')}</p>
        </div>
      </Section>

      {/* V4 → V5 Comparison */}
      <Section>
        <SectionHeader label="V4 → V5" title="The Dual-Pass" highlight="Evolution" desc="V4's single-pass approach left deep clinical reasoning on the table. V5 adds a second pass with Claude Opus 4.6 extended thinking for weekly deep analysis." />
        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-3 bg-white/[0.05] px-4 py-3 border-b border-white/5">
              <span className="text-xs font-semibold text-slate-400 uppercase"></span>
              <span className="text-xs font-semibold text-slate-500 uppercase text-center">V4</span>
              <span className="text-xs font-semibold text-violet-400 uppercase text-center">V5</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-4 py-3 ${i % 2 === 0 ? 'bg-white/[0.01]' : 'bg-white/[0.03]'}`}>
                <span className="text-xs font-medium text-slate-300">{row.label}</span>
                <span className="text-xs text-slate-500 text-center">{row.v4}</span>
                <span className="text-xs text-violet-300 text-center font-medium">{row.v5}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Architecture */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('cvf.archLabel')} title={t('cvf.archTitle')} highlight={t('cvf.archHighlight')} desc={t('cvf.archDesc')} />
        <div className="space-y-4 max-w-3xl mx-auto">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${i <= 2 ? 'bg-blue-500/10 border border-blue-500/20' : i === 3 ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                <span className={`text-sm font-bold ${i <= 2 ? 'text-blue-400' : i === 3 ? 'text-violet-400' : 'text-emerald-400'}`}>{i}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{t(`cvf.tier${i}Title`)}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{t(`cvf.tier${i}Desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 9 Domains Overview */}
      <Section>
        <SectionHeader label={t('cvf.domainsLabel')} title={t('cvf.domainsTitle')} highlight={t('cvf.domainsHighlight')} desc={t('cvf.domainsDesc')} />
        <div className="space-y-12">
          {DOMAINS.map((domain, idx) => (
            <div key={domain.key}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${DOMAIN_COLORS[idx]}`} />
                <h3 className="text-lg font-semibold text-white">{t(`cvf.${domain.key}Name`)}</h3>
                <span className="text-xs text-slate-500 ml-auto">{t(`cvf.${domain.key}Weight`)} &middot; {t(`cvf.${domain.key}Count`)}</span>
              </div>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{t(`cvf.${domain.key}Desc`)}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: domain.count }, (_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                    <p className="text-sm font-semibold text-violet-300 mb-1">{t(`cvf.${domain.prefix}${i + 1}`)}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{t(`cvf.${domain.prefix}${i + 1}D`)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Scoring Algorithm */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('cvf.scoringLabel')} title={t('cvf.scoringTitle')} highlight={t('cvf.scoringHighlight')} desc={t('cvf.scoringDesc')} />
        <div className="space-y-4 max-w-3xl mx-auto">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-emerald-400">{i}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{t(`cvf.score${i}Title`)}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{t(`cvf.score${i}Desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Differential Diagnosis */}
      <Section>
        <SectionHeader label={t('cvf.diffLabel')} title={t('cvf.diffTitle')} highlight={t('cvf.diffHighlight')} desc={t('cvf.diffDesc')} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`cvf.cond${i}`)}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t(`cvf.cond${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 3 Cascade Types */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('cvf.cascadeLabel')} title={t('cvf.cascadeTitle')} highlight={t('cvf.cascadeHighlight')} desc={t('cvf.cascadeDesc')} />
        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* AD Cascade */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 mb-4">{t('cvf.adCascadeTitle')}</h3>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500 via-amber-500 to-red-500" />
              <div className="space-y-4">
                {[0, 1, 2, 3].map(i => {
                  const colors = ['emerald', 'yellow', 'orange', 'red']
                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[17px] top-1.5 w-3 h-3 rounded-full bg-${colors[i]}-500 border-2 border-slate-950`} />
                      <p className="text-xs font-semibold text-white mb-0.5">{t(`cvf.stage${i}`)}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{t(`cvf.stage${i}Desc`)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* PD Cascade */}
          <div>
            <h3 className="text-sm font-semibold text-orange-400 mb-4">{t('cvf.pdCascadeTitle')}</h3>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500 via-red-500 to-rose-500" />
              <div className="space-y-4">
                {[0, 1, 2, 3].map(i => {
                  const colors = ['orange', 'red', 'rose', 'pink']
                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[17px] top-1.5 w-3 h-3 rounded-full bg-${colors[i]}-500 border-2 border-slate-950`} />
                      <p className="text-xs font-semibold text-white mb-0.5">{t(`cvf.pdStage${i}`)}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{t(`cvf.pdStage${i}Desc`)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Depression Cascade */}
          <div>
            <h3 className="text-sm font-semibold text-blue-400 mb-4">{t('cvf.depCascadeTitle')}</h3>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500" />
              <div className="space-y-4">
                {[0, 1, 2].map(i => {
                  const colors = ['blue', 'indigo', 'violet']
                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[17px] top-1.5 w-3 h-3 rounded-full bg-${colors[i]}-500 border-2 border-slate-950`} />
                      <p className="text-xs font-semibold text-white mb-0.5">{t(`cvf.depStage${i}`)}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{t(`cvf.depStage${i}Desc`)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Micro-Tasks */}
      <Section>
        <SectionHeader label={t('cvf.microLabel')} title={t('cvf.microTitle')} highlight={t('cvf.microHighlight')} desc={t('cvf.microDesc')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-400">{i}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{t(`cvf.micro${i}Title`)}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{t(`cvf.micro${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Weekly Deep Analysis */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('cvf.weeklyLabel')} title={t('cvf.weeklyTitle')} highlight={t('cvf.weeklyHighlight')} desc={t('cvf.weeklyDesc')} />
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {t(`cvf.weekly${i}`)}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Security Hardening */}
      <Section>
        <SectionHeader label={t('cvf.securityLabel')} title={t('cvf.securityTitle')} highlight={t('cvf.securityHighlight')} desc={t('cvf.securityDesc')} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                <h3 className="text-sm font-semibold text-white">{t(`cvf.sec${i}Title`)}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{t(`cvf.sec${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Evidence */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('cvf.evidenceLabel')} title={t('cvf.evidenceTitle')} highlight={t('cvf.evidenceHighlight')} desc={t('cvf.evidenceDesc')} />
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-sm text-slate-300 leading-relaxed">{t(`cvf.evidence${i}`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Back */}
      <Section>
        <div className="text-center">
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate('cognitivevoicefingerprint')} className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-colors">
              {t('nav.scientific')}
            </button>
            <button onClick={() => navigate('home')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors">
              {t('cvf.backToHome')}
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}
