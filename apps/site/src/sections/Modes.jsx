import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'

function ModeCard({ mode, index }) {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-white/5 bg-slate-900/50 p-8 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Tag */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6 ${mode.tagStyle}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${mode.dotColor}`} />
        <span className="text-xs font-medium">{mode.tag}</span>
      </div>

      {/* Title & description */}
      <h3 className="text-xl font-bold text-white mb-3">{mode.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-6">{mode.desc}</p>

      {/* How it works */}
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">{mode.howLabel}</h4>
      <div className="space-y-3 mb-6">
        {mode.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${mode.stepStyle}`}>
              {i + 1}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      {/* Key insight */}
      <div className={`rounded-xl border p-4 ${mode.insightStyle}`}>
        <p className="text-sm text-slate-300 leading-relaxed">{mode.keyInsight}</p>
      </div>
    </div>
  )
}

export default function Modes() {
  const { t } = useT()
  const [ref, inView] = useInView()
  const [scienceRef, scienceInView] = useInView()

  const modes = [
    {
      tag: t('modes.preventionTag'),
      tagStyle: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
      dotColor: 'bg-emerald-400',
      title: t('modes.preventionTitle'),
      desc: t('modes.preventionDesc'),
      howLabel: t('modes.preventionHow'),
      steps: [
        t('modes.preventionStep1'),
        t('modes.preventionStep2'),
        t('modes.preventionStep3'),
        t('modes.preventionStep4'),
        t('modes.preventionStep5'),
      ],
      stepStyle: 'bg-emerald-500/20 text-emerald-400',
      keyInsight: t('modes.preventionKey'),
      insightStyle: 'border-emerald-500/10 bg-emerald-500/5',
    },
    {
      tag: t('modes.treatmentTag'),
      tagStyle: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
      dotColor: 'bg-blue-400',
      title: t('modes.treatmentTitle'),
      desc: t('modes.treatmentDesc'),
      howLabel: t('modes.treatmentHow'),
      steps: [
        t('modes.treatmentStep1'),
        t('modes.treatmentStep2'),
        t('modes.treatmentStep3'),
        t('modes.treatmentStep4'),
        t('modes.treatmentStep5'),
      ],
      stepStyle: 'bg-blue-500/20 text-blue-400',
      keyInsight: t('modes.treatmentKey'),
      insightStyle: 'border-blue-500/10 bg-blue-500/5',
    },
  ]

  const sciencePoints = [
    t('modes.sciencePoint1'),
    t('modes.sciencePoint2'),
    t('modes.sciencePoint3'),
  ]

  return (
    <section id="modes" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <span className={`inline-block text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            {t('modes.label')}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('modes.title')} <span className="gradient-text">{t('modes.titleHighlight')}</span>
          </h2>
          <p className={`text-lg text-slate-400 max-w-2xl mx-auto transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('modes.subtitle')}
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {modes.map((mode, i) => (
            <ModeCard key={i} mode={mode} index={i} />
          ))}
        </div>

        {/* Scientific basis */}
        <div
          ref={scienceRef}
          className={`max-w-3xl mx-auto rounded-2xl border border-white/5 bg-slate-900/50 p-8 transition-all duration-700 ${scienceInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h3 className="text-sm font-semibold text-white mb-4">{t('modes.scienceBasis')}</h3>
          <div className="space-y-3">
            {sciencePoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                <p
                  className="text-sm text-slate-400 leading-relaxed rich-text"
                  dangerouslySetInnerHTML={{ __html: point }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
