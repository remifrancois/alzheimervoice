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

function CreatorCard({ name, role, bio, quote }) {
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="text-sm text-violet-300">{role}</p>
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-6">{bio}</p>
      <blockquote className="border-l-2 border-violet-500/30 pl-4">
        <p className="text-sm text-slate-300 italic leading-relaxed">"{quote}"</p>
      </blockquote>
    </div>
  )
}

export default function CreatorsPage() {
  const { t } = useT()
  const { navigate } = useRouter()

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('creators.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('creators.heroHighlight')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">{t('creators.heroSubtitle')}</p>
        </div>
      </Section>

      {/* Team */}
      <Section>
        <SectionHeader label={t('creators.teamLabel')} title={t('creators.teamTitle')} highlight={t('creators.teamHighlight')} />
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <CreatorCard
            name={t('creators.creator1Name')}
            role={t('creators.creator1Role')}
            bio={t('creators.creator1Bio')}
            quote={t('creators.creator1Quote')}
          />
          <CreatorCard
            name={t('creators.creator2Name')}
            role={t('creators.creator2Role')}
            bio={t('creators.creator2Bio')}
            quote={t('creators.creator2Quote')}
          />
        </div>
      </Section>

      {/* Vision */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('creators.visionLabel')} title={t('creators.visionTitle')} highlight={t('creators.visionHighlight')} desc={t('creators.visionDesc')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`creators.vision${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`creators.vision${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Hackathon */}
      <Section>
        <SectionHeader label={t('creators.hackathonLabel')} title={t('creators.hackathonTitle')} highlight={t('creators.hackathonHighlight')} desc={t('creators.hackathonDesc')} />
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {t(`creators.hackathon${i}`)}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Back */}
      <Section>
        <div className="text-center">
          <button onClick={() => navigate('home')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors">
            {t('creators.backToHome')}
          </button>
        </div>
      </Section>
    </div>
  )
}
