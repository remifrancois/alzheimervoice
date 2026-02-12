import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'

function FeatureCard({ feature, index }) {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-white/5 bg-slate-900/50 p-6 transition-all duration-700 hover:border-violet-500/20 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-4">
        {feature.icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
    </div>
  )
}

export default function Breakthrough() {
  const { t } = useT()
  const [ref, inView] = useInView()

  const features = [
    {
      title: t('breakthrough.feature1Title'),
      desc: t('breakthrough.feature1Desc'),
      icon: (
        <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.418 8.773 3.75 3.75 0 001.034 3.013l.107.107a3.75 3.75 0 005.13.163l.1-.09A49.437 49.437 0 0113.5 10.5a7.5 7.5 0 00-5.636-7.257" />
        </svg>
      ),
    },
    {
      title: t('breakthrough.feature2Title'),
      desc: t('breakthrough.feature2Desc'),
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      title: t('breakthrough.feature3Title'),
      desc: t('breakthrough.feature3Desc'),
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      title: t('breakthrough.feature4Title'),
      desc: t('breakthrough.feature4Desc'),
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <span className={`inline-block text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            {t('breakthrough.label')}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('breakthrough.title')} <span className="gradient-text">{t('breakthrough.titleHighlight')}</span>
          </h2>
          <p className={`text-lg text-slate-400 max-w-2xl mx-auto transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('breakthrough.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
