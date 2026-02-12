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

export default function PrivacyPage() {
  const { t } = useT()
  const { navigate } = useRouter()

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('privacy.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('privacy.heroHighlight')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">{t('privacy.heroSubtitle')}</p>
        </div>
      </Section>

      {/* Zero Data Collection */}
      <Section>
        <SectionHeader label={t('privacy.policyLabel')} title={t('privacy.policyTitle')} highlight={t('privacy.policyHighlight')} desc={t('privacy.policyDesc')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`privacy.policy${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`privacy.policy${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* HIPAA */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('privacy.hipaaLabel')} title={t('privacy.hipaaTitle')} highlight={t('privacy.hipaaHighlight')} desc={t('privacy.hipaaDesc')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`privacy.hipaa${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`privacy.hipaa${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Encryption */}
      <Section>
        <SectionHeader label={t('privacy.encryptionLabel')} title={t('privacy.encryptionTitle')} highlight={t('privacy.encryptionHighlight')} desc={t('privacy.encryptionDesc')} />
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                {t(`privacy.encrypt${i}`)}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Back */}
      <Section>
        <div className="text-center">
          <button onClick={() => navigate('home')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors">
            {t('privacy.backToHome')}
          </button>
        </div>
      </Section>
    </div>
  )
}
