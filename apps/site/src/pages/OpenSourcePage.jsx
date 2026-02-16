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

export default function OpenSourcePage() {
  const { t } = useT()
  const { navigate } = useRouter()

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('opensource.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('opensource.heroHighlight')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">{t('opensource.heroSubtitle')}</p>
        </div>
      </Section>

      {/* Repository */}
      <Section>
        <SectionHeader label={t('opensource.repoLabel')} title={t('opensource.repoTitle')} highlight={t('opensource.repoHighlight')} desc={t('opensource.repoDesc')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Full Hackathon Source */}
          <a href="https://github.com/remifrancois/alzheimervoice" target="_blank" rel="noopener noreferrer" className="group p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">Full Hackathon Source Code</p>
                <p className="text-xs text-slate-500">Complete AlzheimerVoice platform</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4">github.com/remifrancois/alzheimervoice</p>
            <p className="text-xs text-slate-500 leading-relaxed">All apps (site, demo, SaaS, admin), shared UI, data models, deployment configs, and documentation. The full monorepo built at the Cerebral Valley x Anthropic Hackathon.</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-violet-400 group-hover:text-violet-300 transition-colors">
              <span>View on GitHub</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            </div>
          </a>

          {/* Core CVF Engine */}
          <a href="https://github.com/remifrancois/cognitivevoicefingerprint" target="_blank" rel="noopener noreferrer" className="group p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">CVF Engine V5 — Core Engine</p>
                <p className="text-xs text-slate-500">Cognitive Voice Fingerprint engine</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4">github.com/remifrancois/cognitivevoicefingerprint</p>
            <p className="text-xs text-slate-500 leading-relaxed">The standalone dual-pass analysis engine. 85 indicators, 9 domains, 35 differential rules, 3 cascade types. Acoustic pipeline + LLM linguistic analysis. MIT licensed.</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-violet-400 group-hover:text-violet-300 transition-colors">
              <span>View on GitHub</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            </div>
          </a>
        </div>
      </Section>

      {/* Core Engine */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('opensource.coreLabel')} title={t('opensource.coreTitle')} highlight={t('opensource.coreHighlight')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`opensource.core${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`opensource.core${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Customization */}
      <Section>
        <SectionHeader label={t('opensource.customLabel')} title={t('opensource.customTitle')} highlight={t('opensource.customHighlight')} desc={t('opensource.customDesc')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`opensource.custom${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`opensource.custom${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SaaS */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('opensource.saasLabel')} title={t('opensource.saasTitle')} highlight={t('opensource.saasHighlight')} desc={t('opensource.saasDesc')} />
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-3 mb-8">
            {[1, 2, 3, 4].map(i => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {t(`opensource.saasFeature${i}`)}
              </li>
            ))}
          </ul>
          <div className="text-center">
            <button onClick={() => navigate('demo')} className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-colors">
              {t('opensource.saasButton')}
            </button>
          </div>
        </div>
      </Section>

      {/* Back */}
      <Section>
        <div className="text-center">
          <button onClick={() => navigate('home')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors">
            {t('opensource.backToHome')}
          </button>
        </div>
      </Section>
    </div>
  )
}
