import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'

function PaperCard({ paper, index }) {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-white/5 bg-slate-900/50 p-6 transition-all duration-700 hover:border-violet-500/20 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-600 mb-1">{paper.authors}</p>
          <h3 className="text-sm font-semibold text-white leading-snug">{paper.title}</h3>
        </div>
        <span className="shrink-0 text-xs text-slate-600 font-mono">{paper.year}</span>
      </div>
      <p className="text-xs text-slate-500 mb-4 italic">{paper.journal}</p>
      <div className="rounded-lg bg-violet-500/5 border border-violet-500/10 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="text-xs font-semibold text-violet-300">{paper.highlight}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{paper.finding}</p>
      </div>
    </div>
  )
}

function CascadeStage({ stage, index, total }) {
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

      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${stage.bgColor} ${stage.textColor}`}>
        {index + 1}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">{stage.name}</h4>
        <p className="text-xs text-slate-500">{stage.desc}</p>
      </div>
    </div>
  )
}

export default function Science() {
  const { t } = useT()
  const [ref, inView] = useInView()
  const [cascadeRef, cascadeInView] = useInView()

  const papers = [
    {
      authors: 'Fraser, K.C., Meltzer, J.A., & Rudzicz, F.',
      year: '2016',
      title: 'Linguistic Features Identify Alzheimer\'s Disease in Narrative Speech',
      journal: 'Journal of Alzheimer\'s Disease, 49(2), 407-422',
      highlight: t('science.paper1Highlight'),
      finding: t('science.paper1Finding'),
    },
    {
      authors: 'Ahmed, S., Haigh, A.M., de Jager, C.A., & Garrard, P.',
      year: '2013',
      title: 'Connected speech as a marker of disease progression in autopsy-proven Alzheimer\'s disease',
      journal: 'Brain, 136(12), 3727-3737',
      highlight: t('science.paper2Highlight'),
      finding: t('science.paper2Finding'),
    },
    {
      authors: 'K\u00f6nig, A., Satt, A., Sorin, A., et al.',
      year: '2015',
      title: 'Automatic speech analysis for the assessment of patients with predementia and Alzheimer\'s disease',
      journal: 'Alzheimer\'s & Dementia: Diagnosis, Assessment & Disease Monitoring, 1(1), 112-124',
      highlight: t('science.paper3Highlight'),
      finding: t('science.paper3Finding'),
    },
    {
      authors: 'Luz, S., Haider, F., de la Fuente, S., Fromm, D., & MacWhinney, B.',
      year: '2020',
      title: 'Alzheimer\'s Dementia Recognition through Spontaneous Speech: The ADReSS Challenge',
      journal: 'Proceedings of INTERSPEECH 2020',
      highlight: t('science.paper4Highlight'),
      finding: t('science.paper4Finding'),
    },
  ]

  const cascadeStages = [
    {
      name: t('science.cascade1Name'),
      desc: t('science.cascade1Desc'),
      bgColor: 'bg-emerald-500/20',
      textColor: 'text-emerald-400',
    },
    {
      name: t('science.cascade2Name'),
      desc: t('science.cascade2Desc'),
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-400',
    },
    {
      name: t('science.cascade3Name'),
      desc: t('science.cascade3Desc'),
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400',
    },
    {
      name: t('science.cascade4Name'),
      desc: t('science.cascade4Desc'),
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
    },
  ]

  return (
    <section id="science" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <span className={`inline-block text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            {t('science.label')}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('science.title')} <span className="gradient-text">{t('science.titleHighlight')}</span>
          </h2>
          <p className={`text-lg text-slate-400 max-w-2xl mx-auto transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('science.subtitle')}
          </p>
        </div>

        {/* Paper cards grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {papers.map((paper, i) => (
            <PaperCard key={i} paper={paper} index={i} />
          ))}
        </div>

        {/* AD Linguistic Cascade Model */}
        <div
          ref={cascadeRef}
          className={`rounded-2xl border border-white/5 bg-slate-900/50 p-8 max-w-2xl mx-auto transition-all duration-700 ${cascadeInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h3 className="text-lg font-bold text-white mb-1">{t('science.cascadeTitle')}</h3>
          <p className="text-xs text-slate-500 mb-8">{t('science.cascadeSubtitle')}</p>

          <div className="space-y-8">
            {cascadeStages.map((stage, i) => (
              <CascadeStage key={i} stage={stage} index={i} total={cascadeStages.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
