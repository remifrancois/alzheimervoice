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

export default function LegalPage() {
  const { t } = useT()
  const { navigate } = useRouter()

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('legal.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('legal.heroHighlight')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">{t('legal.heroSubtitle')}</p>
        </div>
      </Section>

      {/* MIT License */}
      <Section>
        <SectionHeader label={t('legal.mitLabel')} title={t('legal.mitTitle')} highlight={t('legal.mitHighlight')} desc={t('legal.mitDesc')} />
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm text-slate-300">{t(`legal.mitPermit${i}`)}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 leading-relaxed text-center">{t('legal.mitCondition')}</p>
        </div>
      </Section>

      {/* Hackathon */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('legal.hackathonLabel')} title={t('legal.hackathonTitle')} highlight={t('legal.hackathonHighlight')} desc={t('legal.hackathonDesc')} />
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {t(`legal.hackathonCredit${i}`)}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* NGO Future */}
      <Section>
        <SectionHeader label={t('legal.ngoLabel')} title={t('legal.ngoTitle')} highlight={t('legal.ngoHighlight')} desc={t('legal.ngoDesc')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`legal.ngo${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`legal.ngo${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Disclaimer */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('legal.disclaimerLabel')} title={t('legal.disclaimerTitle')} highlight={t('legal.disclaimerHighlight')} />
        <div className="max-w-3xl mx-auto p-6 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm text-slate-400 leading-relaxed">{t('legal.disclaimerText')}</p>
        </div>
      </Section>

      {/* Back */}
      <Section>
        <div className="text-center">
          <button onClick={() => navigate('home')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors">
            {t('legal.backToHome')}
          </button>
        </div>
      </Section>
    </div>
  )
}
