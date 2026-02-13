import { useT } from '../lib/i18n'
import { useRouter } from '../lib/router'
import { sanitizeHTML } from '../lib/sanitize'

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

export default function FamilyPage() {
  const { t } = useT()
  const { navigate } = useRouter()

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('familyPage.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('familyPage.heroHighlight')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">{t('familyPage.heroSubtitle')}</p>
        </div>
      </Section>

      {/* Story */}
      <Section>
        <SectionHeader label={t('familyPage.storyLabel')} title={t('familyPage.storyTitle')} highlight={t('familyPage.storyHighlight')} />
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-slate-400 leading-relaxed">{t('familyPage.storyP1')}</p>
          <p className="text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('familyPage.storyP2')) }} />
          <p className="text-slate-400 leading-relaxed">{t('familyPage.storyP3')}</p>
        </div>
      </Section>

      {/* Dignity */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('familyPage.dignityLabel')} title={t('familyPage.dignityTitle')} highlight={t('familyPage.dignityHighlight')} desc={t('familyPage.dignityDesc')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`familyPage.dignity${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`familyPage.dignity${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Peace of Mind */}
      <Section>
        <SectionHeader label={t('familyPage.peaceMindLabel')} title={t('familyPage.peaceMindTitle')} highlight={t('familyPage.peaceMindHighlight')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`familyPage.peace${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`familyPage.peace${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Quote */}
      <Section className="bg-white/[0.01]">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl md:text-2xl text-slate-300 italic leading-relaxed mb-4">
            "{t('familyPage.quoteText')}"
          </blockquote>
          <p className="text-sm text-slate-500">— {t('familyPage.quoteAttribution')}</p>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('familyPage.ctaTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('familyPage.ctaHighlight')}</span></h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">{t('familyPage.ctaDesc')}</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate('demo')} className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-colors">
              {t('familyPage.ctaButton')}
            </button>
            <button onClick={() => navigate('home')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors">
              {t('familyPage.backToHome')}
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}
