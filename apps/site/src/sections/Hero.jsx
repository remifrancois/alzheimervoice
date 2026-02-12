import { useState, useEffect, useRef } from 'react'
import { useInView } from '../hooks/useInView'
import { useT } from '../lib/i18n'

function VoiceVisualization({ t }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let width, height

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const bars = 32
    const phases = Array.from({ length: bars }, () => Math.random() * Math.PI * 2)
    const speeds = Array.from({ length: bars }, () => 0.3 + Math.random() * 0.5)

    // Shared gradient — reuse instead of creating per-bar per-frame
    let gradient = null
    let lastH = 0

    function draw(time) {
      const t = time / 1000
      ctx.clearRect(0, 0, width, height)
      const barWidth = width / bars
      const gap = 2

      for (let i = 0; i < bars; i++) {
        const phase = phases[i] + t * speeds[i]
        const amp = 0.3 + 0.7 * Math.sin(phase) * Math.sin(phase)
        const barH = amp * height * 0.8

        // Only recreate gradient when height changes meaningfully
        if (!gradient || Math.abs(barH - lastH) > 4) {
          gradient = ctx.createLinearGradient(0, height / 2 - barH / 2, 0, height / 2 + barH / 2)
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)')
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)')
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0.3)')
          lastH = barH
        }
        ctx.fillStyle = gradient

        const x = i * barWidth + gap / 2
        const w = barWidth - gap
        const y = (height - barH) / 2
        const r = Math.min(w / 2, 3)

        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.quadraticCurveTo(x + w, y, x + w, y + r)
        ctx.lineTo(x + w, y + barH - r)
        ctx.quadraticCurveTo(x + w, y + barH, x + w - r, y + barH)
        ctx.lineTo(x + r, y + barH)
        ctx.quadraticCurveTo(x, y + barH, x, y + barH - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const domains = [
    { label: t('hero.domainLexical'), color: 'from-violet-500 to-violet-400', value: 87 },
    { label: t('hero.domainSyntactic'), color: 'from-blue-500 to-blue-400', value: 92 },
    { label: t('hero.domainCoherence'), color: 'from-cyan-500 to-cyan-400', value: 78 },
    { label: t('hero.domainFluency'), color: 'from-emerald-500 to-emerald-400', value: 95 },
    { label: t('hero.domainMemory'), color: 'from-amber-500 to-amber-400', value: 84 },
  ]

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 glow-violet">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">{t('hero.vizStatus')}</span>
        </div>
        <canvas ref={canvasRef} className="w-full h-32 rounded-lg" />
        <div className="mt-4 grid grid-cols-5 gap-2">
          {domains.map((d, i) => (
            <div key={i} className="text-center">
              <div className="h-1.5 rounded-full bg-slate-800 mb-1.5 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${d.color}`} style={{ width: `${d.value}%` }} />
              </div>
              <span className="text-[10px] text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const { t } = useT()
  const [ref, inView] = useInView(0.05)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient orbs — radial gradients instead of blur filters for Safari perf */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[800px] h-[800px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }} />
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto px-6 py-20 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 mb-8 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs text-violet-300 font-medium">{t('hero.badge')}</span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 transition-all duration-700 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="text-white">{t('hero.title1')}</span>
              <br />
              <span className="gradient-text">{t('hero.title2')}</span>
            </h1>

            <p className={`text-lg text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 transition-all duration-700 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {t('hero.subtitle')}
            </p>

            <div className={`flex flex-col sm:flex-row items-center lg:items-start gap-4 transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <a href="#cta" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-base font-semibold text-white transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40">
                {t('hero.ctaPrimary')}
              </a>
              <a href="#science" className="px-8 py-3.5 rounded-xl border border-slate-700 hover:border-slate-600 text-base font-medium text-slate-300 hover:text-white transition-all">
                {t('hero.ctaSecondary')}
              </a>
            </div>
          </div>

          {/* Visualization */}
          <div className={`transition-all duration-1000 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <VoiceVisualization t={t} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 delay-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs text-slate-600">{t('hero.scroll')}</span>
          <svg className="w-4 h-4 text-slate-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
