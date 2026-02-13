import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'
import { sanitizeHTML } from '../lib/sanitize'

function PipelineStep({ step, index, total }) {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`relative flex items-center gap-4 transition-all duration-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Connector */}
      {index < total - 1 && (
        <div className="absolute left-5 top-10 bottom-[-2rem] w-px bg-gradient-to-b from-violet-500/30 to-blue-500/30" />
      )}

      <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
        <span className="text-xs font-bold gradient-text">{index + 1}</span>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">{step.label}</h4>
        <p className="text-xs text-slate-500">{step.sub}</p>
      </div>
    </div>
  )
}

export default function Technology() {
  const { t } = useT()
  const [ref, inView] = useInView()
  const [contentRef, contentInView] = useInView()
  const [pipelineRef, pipelineInView] = useInView()

  const specs = [
    { label: t('technology.specModel'), value: t('technology.specModelVal') },
    { label: t('technology.specThinking'), value: t('technology.specThinkingVal') },
    { label: t('technology.specFeatures'), value: t('technology.specFeaturesVal') },
    { label: t('technology.specProcessing'), value: t('technology.specProcessingVal') },
  ]

  const pipeline = [
    { label: t('technology.pipe1Label'), sub: t('technology.pipe1Sub') },
    { label: t('technology.pipe2Label'), sub: t('technology.pipe2Sub') },
    { label: t('technology.pipe3Label'), sub: t('technology.pipe3Sub') },
    { label: t('technology.pipe4Label'), sub: t('technology.pipe4Sub') },
    { label: t('technology.pipe5Label'), sub: t('technology.pipe5Sub') },
  ]

  return (
    <section id="technology" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <span className={`inline-block text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            {t('technology.label')}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('technology.title')} <span className="gradient-text">{t('technology.titleHighlight')}</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - Text + Specs */}
          <div ref={contentRef} className="space-y-6">
            <div
              className={`text-slate-400 leading-relaxed rich-text transition-all duration-700 ${contentInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('technology.p1')) }}
            />
            <div
              className={`text-slate-400 leading-relaxed rich-text transition-all duration-700 delay-100 ${contentInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('technology.p2')) }}
            />
            <p className={`text-slate-400 leading-relaxed transition-all duration-700 delay-200 ${contentInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {t('technology.p3')}
            </p>

            {/* Specs grid */}
            <div className={`grid grid-cols-2 gap-4 pt-4 transition-all duration-700 delay-300 ${contentInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {specs.map((spec, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
                  <p className="text-xs text-slate-600 mb-1">{spec.label}</p>
                  <p className="text-sm font-semibold gradient-text">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Pipeline */}
          <div
            ref={pipelineRef}
            className={`rounded-2xl border border-white/5 bg-slate-900/50 p-8 transition-all duration-700 ${pipelineInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <h3 className="text-lg font-bold text-white mb-1">{t('technology.pipelineTitle')}</h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 mb-8" />

            <div className="space-y-8">
              {pipeline.map((step, i) => (
                <PipelineStep key={i} step={step} index={i} total={pipeline.length} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
