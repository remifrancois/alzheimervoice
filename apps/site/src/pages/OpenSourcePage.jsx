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
        <div className="max-w-lg mx-auto p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <p className="text-sm text-slate-400 mb-4 font-mono">{t('opensource.repoUrl')}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-500/30 text-sm font-medium text-violet-300">{t('opensource.repoStars')}</span>
            <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300">{t('opensource.repoFork')}</span>
            <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300">{t('opensource.repoDocs')}</span>
          </div>
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
