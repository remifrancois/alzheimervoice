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

export default function DemoPage() {
  const { t } = useT()
  const { navigate } = useRouter()

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('demo.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('demo.heroHighlight')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">{t('demo.heroSubtitle')}</p>
        </div>
      </Section>

      {/* Form */}
      <Section>
        <SectionHeader label={t('demo.formLabel')} title={t('demo.formTitle')} highlight={t('demo.formHighlight')} desc={t('demo.formDesc')} />
        <div className="max-w-xl mx-auto">
          <div className="space-y-5 p-8 rounded-xl bg-white/[0.02] border border-white/5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('demo.fieldName')}</label>
              <input type="text" placeholder={t('demo.fieldNamePlaceholder')} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('demo.fieldEmail')}</label>
              <input type="email" placeholder={t('demo.fieldEmailPlaceholder')} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('demo.fieldOrg')}</label>
              <input type="text" placeholder={t('demo.fieldOrgPlaceholder')} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('demo.fieldRole')}</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 focus:outline-none focus:border-violet-500/50">
                <option value="">{t('demo.fieldRolePlaceholder')}</option>
                <option value="researcher">{t('demo.roleResearcher')}</option>
                <option value="clinician">{t('demo.roleClinician')}</option>
                <option value="caregiver">{t('demo.roleCaregiver')}</option>
                <option value="developer">{t('demo.roleDeveloper')}</option>
                <option value="other">{t('demo.roleOther')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('demo.fieldMessage')}</label>
              <textarea rows={3} placeholder={t('demo.fieldMessagePlaceholder')} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 resize-none" />
            </div>
            <button className="w-full px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-colors">
              {t('demo.submitButton')}
            </button>
            <p className="text-xs text-slate-600 text-center">{t('demo.submitNote')}</p>
          </div>
        </div>
      </Section>

      {/* What to Expect */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('demo.expectLabel')} title={t('demo.expectTitle')} highlight={t('demo.expectHighlight')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`demo.expect${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`demo.expect${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Preview */}
      <Section>
        <SectionHeader label={t('demo.previewLabel')} title={t('demo.previewTitle')} highlight={t('demo.previewHighlight')} />
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <svg className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {t(`demo.preview${i}`)}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Back */}
      <Section>
        <div className="text-center">
          <button onClick={() => navigate('home')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors">
            {t('demo.backToHome')}
          </button>
        </div>
      </Section>
    </div>
  )
}
