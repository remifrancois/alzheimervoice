import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'
import { sanitizeHTML } from '../lib/sanitize'

export default function Problem() {
  const { t } = useT()
  const [headerRef, headerInView] = useInView()
  const [contentRef, contentInView] = useInView()
  const [timelineRef, timelineInView] = useInView()

  const stages = [
    {
      color: 'bg-emerald-400',
      ringColor: 'ring-emerald-400/20',
      year: t('problem.stage1Year'),
      title: t('problem.stage1Title'),
      desc: t('problem.stage1Desc'),
      detection: true,
    },
    {
      color: 'bg-yellow-400',
      ringColor: 'ring-yellow-400/20',
      year: t('problem.stage2Year'),
      title: t('problem.stage2Title'),
      desc: t('problem.stage2Desc'),
      detection: false,
    },
    {
      color: 'bg-orange-400',
      ringColor: 'ring-orange-400/20',
      year: t('problem.stage3Year'),
      title: t('problem.stage3Title'),
      desc: t('problem.stage3Desc'),
      detection: false,
    },
    {
      color: 'bg-red-400',
      ringColor: 'ring-red-400/20',
      year: t('problem.stage4Year'),
      title: t('problem.stage4Title'),
      desc: t('problem.stage4Desc'),
      detection: false,
    },
  ]

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className={`inline-block text-xs font-semibold text-amber-400 uppercase tracking-widest mb-4 transition-all duration-700 ${headerInView ? 'opacity-100' : 'opacity-0'}`}>
            {t('problem.label')}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold transition-all duration-700 delay-100 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('problem.title')} <span className="gradient-text">{t('problem.titleHighlight')}</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - Text content */}
          <div ref={contentRef} className="space-y-6">
            <div
              className={`text-slate-400 leading-relaxed rich-text transition-all duration-700 ${contentInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('problem.p1')) }}
            />
            <div
              className={`text-slate-400 leading-relaxed rich-text transition-all duration-700 delay-100 ${contentInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('problem.p2')) }}
            />
            <div
              className={`text-slate-400 leading-relaxed rich-text transition-all duration-700 delay-200 ${contentInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('problem.p3')) }}
            />
          </div>

          {/* Right - Timeline */}
          <div ref={timelineRef} className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400/50 via-yellow-400/50 via-orange-400/50 to-red-400/50" />

            <div className="space-y-8">
              {stages.map((stage, i) => (
                <div
                  key={i}
                  className={`relative pl-12 transition-all duration-700 ${timelineInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {/* Dot */}
                  <div className={`absolute left-2 top-1 w-4 h-4 rounded-full ${stage.color} ring-4 ${stage.ringColor}`} />

                  {/* Detection badge */}
                  {stage.detection && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-400 font-medium">{t('problem.detection')}</span>
                    </div>
                  )}

                  <span className="text-xs text-slate-600 font-medium uppercase tracking-wider">{stage.year}</span>
                  <h3 className="text-lg font-semibold text-white mt-1 mb-2">{stage.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
