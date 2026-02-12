import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'

function StepCard({ step, index, total }) {
  const [ref, inView] = useInView()

  return (
    <div className="relative">
      {/* Connector line (desktop only) */}
      {index < total - 1 && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px bg-gradient-to-r from-violet-500/30 to-blue-500/30" />
      )}

      <div
        ref={ref}
        className={`relative rounded-2xl border border-white/5 bg-slate-900/50 p-6 text-center transition-all duration-700 hover:border-violet-500/20 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        {/* Step number */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 mb-4">
          <span className="text-sm font-bold gradient-text">{step.number}</span>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {step.icon}
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const { t } = useT()
  const [ref, inView] = useInView()

  const steps = [
    {
      number: '01',
      title: t('howItWorks.step1Title'),
      desc: t('howItWorks.step1Desc'),
      icon: (
        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: t('howItWorks.step2Title'),
      desc: t('howItWorks.step2Desc'),
      icon: (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
    },
    {
      number: '03',
      title: t('howItWorks.step3Title'),
      desc: t('howItWorks.step3Desc'),
      icon: (
        <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
      ),
    },
    {
      number: '04',
      title: t('howItWorks.step4Title'),
      desc: t('howItWorks.step4Desc'),
      icon: (
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
    },
  ]

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <span className={`inline-block text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            {t('howItWorks.label')}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('howItWorks.title')} <span className="gradient-text">{t('howItWorks.titleHighlight')}</span>
          </h2>
          <p className={`text-lg text-slate-400 max-w-2xl mx-auto transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} total={steps.length} />
          ))}
        </div>
      </div>
    </section>
  )
}
