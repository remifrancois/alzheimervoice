import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'

export default function CTA() {
  const { t } = useT()
  const [ref, inView] = useInView()

  return (
    <section id="cta" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-blue-600/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

      <div ref={ref} className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className={`text-3xl sm:text-5xl font-bold mb-6 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t('cta.title1')}
          <br />
          <span className="gradient-text">{t('cta.title2')}</span>
        </h2>
        <p className={`text-lg text-slate-400 mb-10 leading-relaxed transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t('cta.subtitle')}
        </p>
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <a href="#" className="px-10 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-base font-semibold text-white transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40">
            {t('cta.primary')}
          </a>
          <a href="#science" className="px-10 py-4 rounded-xl border border-slate-700 hover:border-slate-600 text-base font-medium text-slate-300 hover:text-white transition-all">
            {t('cta.secondary')}
          </a>
        </div>
      </div>
    </section>
  )
}
