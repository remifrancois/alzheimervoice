import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'

function DomainCard({ domain, index }) {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-white/5 bg-slate-900/50 p-6 transition-all duration-700 hover:border-violet-500/20 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${domain.bgColor}`}>
        {domain.icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{domain.name}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{domain.desc}</p>
      <div className="mt-4 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${domain.barColor}`} />
        ))}
      </div>
      <p className="text-xs text-slate-600 mt-1.5">5 features per domain</p>
    </div>
  )
}

export default function Domains() {
  const { t } = useT()
  const [ref, inView] = useInView()
  const [compositeRef, compositeInView] = useInView()

  const domains = [
    {
      name: t('domains.lexicalName'),
      desc: t('domains.lexicalDesc'),
      bgColor: 'bg-violet-500/20',
      barColor: 'bg-violet-500/40',
      icon: (
        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    {
      name: t('domains.syntacticName'),
      desc: t('domains.syntacticDesc'),
      bgColor: 'bg-blue-500/20',
      barColor: 'bg-blue-500/40',
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
    {
      name: t('domains.coherenceName'),
      desc: t('domains.coherenceDesc'),
      bgColor: 'bg-cyan-500/20',
      barColor: 'bg-cyan-500/40',
      icon: (
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      ),
    },
    {
      name: t('domains.fluencyName'),
      desc: t('domains.fluencyDesc'),
      bgColor: 'bg-emerald-500/20',
      barColor: 'bg-emerald-500/40',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      name: t('domains.memoryName'),
      desc: t('domains.memoryDesc'),
      bgColor: 'bg-amber-500/20',
      barColor: 'bg-amber-500/40',
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <span className={`inline-block text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            {t('domains.label')}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('domains.title')} <span className="gradient-text">{t('domains.titleHighlight')}</span>
          </h2>
          <p className={`text-lg text-slate-400 max-w-2xl mx-auto transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('domains.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {domains.map((domain, i) => (
            <DomainCard key={i} domain={domain} index={i} />
          ))}
        </div>

        {/* Composite Z-Score card */}
        <div
          ref={compositeRef}
          className={`rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-blue-500/5 p-8 text-center max-w-2xl mx-auto transition-all duration-700 ${compositeInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-400 to-blue-400" />
            <h3 className="text-lg font-bold gradient-text">{t('domains.compositeTitle')}</h3>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">{t('domains.compositeDesc')}</p>
          <div className="mt-4 flex justify-center gap-1">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-6 rounded-full bg-gradient-to-t from-violet-500/40 to-blue-500/40"
                style={{ height: `${12 + Math.sin(i * 0.5) * 8}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
