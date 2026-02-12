import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'

export default function Families() {
  const { t } = useT()
  const [ref, inView] = useInView()
  const [quoteRef, quoteInView] = useInView()

  const benefits = [
    { title: t('families.benefit1Title'), desc: t('families.benefit1Desc') },
    { title: t('families.benefit2Title'), desc: t('families.benefit2Desc') },
    { title: t('families.benefit3Title'), desc: t('families.benefit3Desc') },
    { title: t('families.benefit4Title'), desc: t('families.benefit4Desc') },
  ]

  return (
    <section id="families" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <span className={`inline-block text-xs font-semibold text-rose-400 uppercase tracking-widest mb-4 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            {t('families.label')}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('families.title')} <span className="gradient-text">{t('families.titleHighlight')}</span>
          </h2>
          <p className={`text-lg text-slate-400 max-w-2xl mx-auto transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {t('families.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {benefits.map((b, i) => (
            <BenefitCard key={i} benefit={b} index={i} />
          ))}
        </div>

        <div ref={quoteRef} className={`mt-16 max-w-3xl mx-auto text-center transition-all duration-700 ${quoteInView ? 'opacity-100' : 'opacity-0'}`}>
          <blockquote
            className="text-xl sm:text-2xl text-slate-300 font-light italic leading-relaxed rich-text"
            dangerouslySetInnerHTML={{ __html: t('families.quote') }}
          />
          <p className="mt-4 text-sm text-slate-600">{t('families.quoteAttribution')}</p>
        </div>
      </div>
    </section>
  )
}

function BenefitCard({ benefit, index }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-white/5 bg-slate-900/50 p-6 transition-all duration-700 hover:border-rose-500/20 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{benefit.desc}</p>
    </div>
  )
}
