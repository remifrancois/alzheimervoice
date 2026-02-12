import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'

export default function Stats() {
  const { t } = useT()
  const [ref, inView] = useInView()

  const stats = [
    { value: '55M+', label: t('stats.dementiaLabel'), source: t('stats.dementiaSource') },
    { value: '~10yr', label: t('stats.markersLabel'), source: t('stats.markersSource') },
    { value: '25', label: t('stats.dimensionsLabel'), source: t('stats.dimensionsSource') },
    { value: '5', label: t('stats.domainsLabel'), source: t('stats.domainsSource') },
  ]

  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-600/5 to-transparent" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`text-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className="text-xs text-slate-600">{stat.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
