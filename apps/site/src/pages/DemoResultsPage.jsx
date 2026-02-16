import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '../lib/router'

const DOMAIN_LABELS = {
  lexical: { name: 'Lexical', icon: '📝', desc: 'Word choice & vocabulary richness' },
  syntactic: { name: 'Syntactic', icon: '🔗', desc: 'Sentence structure complexity' },
  semantic: { name: 'Semantic', icon: '💡', desc: 'Meaning & idea density' },
  temporal: { name: 'Temporal', icon: '⏱️', desc: 'Speech timing & fluency' },
  memory: { name: 'Memory', icon: '🧠', desc: 'Recall & recognition markers' },
  discourse: { name: 'Discourse', icon: '💬', desc: 'Conversation coherence' },
  affective: { name: 'Affective', icon: '❤️', desc: 'Emotional language patterns' },
  acoustic: { name: 'Acoustic', icon: '🔊', desc: 'Voice quality & pitch' },
  pd_motor: { name: 'PD Motor', icon: '🏃', desc: 'Motor speech markers' },
  pragmatic: { name: 'Pragmatic', icon: '🤝', desc: 'Social language use' },
  executive: { name: 'Executive', icon: '🎯', desc: 'Planning & cognitive control' },
}

const ALERT_COLORS = {
  green: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', label: 'Normal', icon: '✅', desc: '"Normal" means no significant deviation was detected from the expected acoustic baseline in this single recording. This does not constitute a diagnosis — it simply indicates that the indicators analyzed fall within typical ranges.' },
  yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', label: 'Monitor', icon: '⚠️', desc: 'Some indicators show mild deviation. This may warrant monitoring over multiple sessions to determine if a pattern emerges.' },
  orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', label: 'Attention', icon: '🔶', desc: 'Multiple indicators show notable deviation. Further evaluation with a healthcare professional is recommended.' },
  red: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', label: 'Alert', icon: '🔴', desc: 'Significant deviations detected across multiple domains. Please consult a healthcare professional.' },
}

function DomainBar({ domain, score }) {
  const info = DOMAIN_LABELS[domain] || { name: domain, icon: '📊', desc: '' }
  if (score == null) return null
  const isExtreme = Math.abs(score) > 2.5
  const pct = Math.max(0, Math.min(100, (score + 2) * 25))
  const color = isExtreme ? 'bg-slate-500' : score > 0.3 ? 'bg-emerald-500' : score < -0.5 ? 'bg-red-500' : score < -0.3 ? 'bg-yellow-500' : 'bg-blue-500'
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-lg w-7">{info.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-300 font-medium">{info.name}</span>
          <span className={isExtreme ? 'text-slate-600' : 'text-slate-500'}>{score.toFixed(2)}</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-slate-600 mt-0.5">{info.desc}</p>
        {isExtreme && (
          <p className="text-[10px] text-yellow-500/70 mt-0.5">⚠️ Insufficient data for this domain in demo mode — score may not be reliable.</p>
        )}
      </div>
    </div>
  )
}

function ProbabilityBar({ condition, probability }) {
  const pct = Math.round(probability * 100)
  if (pct === 0) return null
  return (
    <div className="flex items-center gap-2 text-xs py-1">
      <span className="text-slate-400 w-32 text-right capitalize">{condition.replace(/_/g, ' ')}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-violet-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-500 w-10 font-mono">{pct}%</span>
    </div>
  )
}

// Compress result to a shareable URL hash
function encodeResult(result) {
  try {
    const json = JSON.stringify(result)
    return btoa(unescape(encodeURIComponent(json)))
  } catch { return null }
}
function decodeResult(hash) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(hash))))
  } catch { return null }
}

export default function DemoResultsPage() {
  const { navigate } = useRouter()
  const [shareUrl, setShareUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  // Load result: try sessionStorage first, then URL hash, then localStorage
  let result = null
  try {
    const raw = sessionStorage.getItem('cvf_demo_result')
    if (raw) result = JSON.parse(raw)
  } catch {}
  if (!result) {
    const hash = window.location.hash?.slice(1)
    if (hash) result = decodeResult(hash)
  }
  if (!result) {
    try {
      const raw = localStorage.getItem('cvf_demo_result_persist')
      if (raw) result = JSON.parse(raw)
    } catch {}
  }

  // Persist result to localStorage so it survives refresh
  useEffect(() => {
    if (result) {
      localStorage.setItem('cvf_demo_result_persist', JSON.stringify(result))
    }
  }, [result])

  const generateShareUrl = useCallback(() => {
    if (!result) return
    const encoded = encodeResult(result)
    if (!encoded) return
    const url = `${window.location.origin}/demoresults#${encoded}`
    setShareUrl(url)
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [result])

  const clearResults = useCallback(() => {
    sessionStorage.removeItem('cvf_demo_result')
    localStorage.removeItem('cvf_demo_result_persist')
    navigate('demo')
  }, [navigate])

  // No result — redirect back to demo
  if (!result) {
    return (
      <div className="pt-20 min-h-screen">
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="text-2xl mb-4">📊</p>
            <h1 className="text-2xl font-bold text-white mb-3">No Analysis Results</h1>
            <p className="text-slate-400 mb-8">Record a voice sample first to see your cognitive voice fingerprint analysis.</p>
            <button onClick={() => navigate('demo')} className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors">
              Go to Demo
            </button>
          </div>
        </section>
      </div>
    )
  }

  const a = ALERT_COLORS[result.alert_level] || ALERT_COLORS.green
  const sortedProbs = Object.entries(result.differential?.probabilities || {}).sort(([,a], [,b]) => b - a)

  return (
    <div className="pt-20 min-h-screen">
      {/* Medical disclaimer — top of page */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-center gap-2">
          <span className="text-sm">⚕️</span>
          <p className="text-xs text-yellow-400 text-center">This is a research demonstration only. Results are not a medical diagnosis. Consult a healthcare professional for any health concerns.</p>
        </div>
      </div>

      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300">CVF V5 Analysis Results</span>
            <div className="flex items-center gap-2">
              <button onClick={generateShareUrl} className="px-4 py-2 rounded-lg border border-white/10 hover:border-violet-500/30 text-xs text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1.5">
                {copied ? '✓ Copied' : '🔗 Share'}
              </button>
              <button onClick={clearResults} className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-xs text-slate-400 transition-colors">
                ← New Recording
              </button>
            </div>
          </div>

          {shareUrl && (
            <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 mb-4 flex items-center gap-2">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent text-xs text-slate-400 font-mono outline-none truncate" onClick={e => e.target.select()} />
              <button onClick={() => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="px-3 py-1 rounded text-xs bg-violet-600 text-white shrink-0">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}

          {/* Privacy banner */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 mb-4">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <p className="text-xs text-emerald-400">Your audio has been deleted from server memory. Results are stored locally in your browser only.</p>
          </div>

          {/* Persistence notice */}
          <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center gap-2 mb-8">
            <span className="text-xs">💾</span>
            <p className="text-[11px] text-blue-400/80">Results are saved in your browser. You can refresh or come back later — they will persist until you click "New Recording".</p>
          </div>

          {/* Alert level hero */}
          <div className={`p-8 rounded-2xl ${a.bg} border ${a.border} text-center`}>
            <p className="text-4xl mb-2">{a.icon}</p>
            <p className={`text-4xl font-bold ${a.text} mb-2`}>{a.label}</p>
            <p className="text-lg text-slate-300">Composite Score: <span className="font-mono">{result.composite?.toFixed(3)}</span></p>
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500">
              <span>{result.indicators?.total} of {result.indicators?.max} indicators</span>
              <span>•</span>
              <span>{(result.processing_ms / 1000).toFixed(1)}s processing</span>
              <span>•</span>
              <span>{result.detected_gender}</span>
            </div>
            {/* Explain what the alert level means */}
            <p className="text-xs text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed">{a.desc}</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-12 space-y-8">
        {/* Demo limitations notice */}
        <div className="p-5 rounded-xl bg-orange-500/5 border border-orange-500/10">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">🔬</span>
            <div>
              <p className="text-sm text-white font-medium mb-2">Demo Mode — Limited Analysis</p>
              <p className="text-xs text-slate-400 leading-relaxed">This demo runs on a minimal AWS Graviton instance without GPU acceleration or Anthropic Claude API integration. Only acoustic indicators are extracted from your voice recording. The full 107-indicator analysis — including NLP anchors, Claude-powered transcription, semantic analysis, and temporal dynamics — requires production-grade infrastructure with GPU capacity and Claude API tokens.</p>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">For accurate cognitive profiling, long-term monitoring is recommended with a minimum learning baseline of 90 minutes of recorded speech (approximately 18 sessions of 5 minutes each). A single recording provides only a snapshot — the CVF engine becomes significantly more precise as it builds a personalized baseline over time.</p>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">To support the infrastructure costs (AWS compute, Claude API) and run the full model, paid SaaS subscriptions are required. This is a core part of the AlzheimerVoice business model — enabling sustainable, production-grade cognitive monitoring.</p>
              <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/10">
                <span className="text-sm">🚀</span>
                <p className="text-[11px] text-violet-300">Engine V6 is currently in development — featuring improved acoustic models, expanded language support, and enhanced differential diagnosis capabilities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 11-Domain Profile */}
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-1">11-Domain Cognitive Profile</h2>
          <p className="text-xs text-slate-500 mb-5">Each domain is scored relative to a single-session snapshot baseline. Scores near 0 indicate no deviation detected. In demo mode with limited indicators, many domains may show neutral scores.</p>
          <div className="grid md:grid-cols-2 gap-x-8">
            {Object.entries(result.domain_scores || {}).map(([d, s]) => <DomainBar key={d} domain={d} score={s} />)}
          </div>
        </div>

        {/* Differential + Acoustic side by side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Differential */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-1">Differential Analysis</h2>
            <p className="text-xs text-slate-500 mb-5">35-rule engine across 11 conditions</p>
            <div className="mb-5 p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-xs text-slate-500 mb-1">Primary Hypothesis</p>
              <p className="text-xl font-semibold text-white capitalize">{(result.differential?.primary || '').replace(/_/g, ' ')}</p>
              {result.differential?.secondary && (
                <p className="text-xs text-slate-500 mt-1">Secondary: <span className="text-slate-400 capitalize">{result.differential.secondary.replace(/_/g, ' ')}</span></p>
              )}
              <p className="text-xs text-slate-500 mt-1">Confidence: <span className="text-white font-mono">{Math.round((result.differential?.confidence || 0) * 100)}%</span></p>
            </div>
            <div className="space-y-1">
              {sortedProbs.map(([c, p]) => <ProbabilityBar key={c} condition={c} probability={p} />)}
            </div>
          </div>

          {/* Acoustic + Meta */}
          <div className="space-y-6">
            {result.acoustic_summary && (
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h2 className="text-lg font-semibold text-white mb-1">🔊 Acoustic Signature</h2>
                <p className="text-xs text-slate-500 mb-5">Voice quality metrics extracted from your recording</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Fundamental Frequency (F0)', value: result.acoustic_summary.f0_mean, desc: 'Average pitch' },
                    { label: 'F0 Variability', value: result.acoustic_summary.f0_sd, desc: 'Pitch variation' },
                    { label: 'Jitter', value: result.acoustic_summary.jitter, desc: 'Pitch perturbation' },
                    { label: 'Shimmer', value: result.acoustic_summary.shimmer, desc: 'Amplitude perturbation' },
                    { label: 'HNR', value: result.acoustic_summary.hnr, desc: 'Harmonics-to-noise ratio' },
                  ].filter(i => i.value != null).map(i => (
                    <div key={i.label} className="p-3 rounded-lg bg-white/[0.02]">
                      <p className="text-lg font-mono text-white">{typeof i.value === 'number' ? i.value.toFixed(3) : i.value}</p>
                      <p className="text-[11px] text-slate-400">{i.label}</p>
                      <p className="text-[10px] text-slate-600">{i.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h2 className="text-lg font-semibold text-white mb-4">📋 Session Metadata</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] text-slate-500">Topic Genre</p>
                  <p className="text-slate-300 capitalize">{(result.topic_genre || 'unknown').replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Topic Confidence</p>
                  <p className="text-slate-300 font-mono">{Math.round((result.topic_confidence || 0) * 100)}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Language</p>
                  <p className="text-slate-300">{result.language === 'fr' ? '🇫🇷 French' : '🇬🇧 English'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Engine</p>
                  <p className="text-slate-300">V5 "deep_voice"</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Indicators (text)</p>
                  <p className="text-slate-300 font-mono">{result.indicators?.text}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Indicators (audio)</p>
                  <p className="text-slate-300 font-mono">{result.indicators?.audio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {result.differential?.recommendation && (
          <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/10">
            <h2 className="text-lg font-semibold text-white mb-2">💡 Recommendation</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{Array.isArray(result.differential.recommendation) ? result.differential.recommendation.join(' ') : result.differential.recommendation}</p>
          </div>
        )}

        {/* Evidence */}
        {result.differential?.evidence && Object.keys(result.differential.evidence).length > 0 && (
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">🔬 Evidence Chains</h2>
            <div className="space-y-3">
              {Object.entries(result.differential.evidence).filter(([, v]) => v && v.length > 0).map(([condition, items]) => (
                <div key={condition}>
                  <p className="text-xs font-medium text-slate-300 capitalize mb-1">{condition.replace(/_/g, ' ')}</p>
                  <ul className="space-y-0.5">
                    {(Array.isArray(items) ? items : [items]).map((item, i) => (
                      <li key={i} className="text-[11px] text-slate-500 pl-3 border-l border-white/5">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
          <p className="text-xs text-yellow-400/80 text-center">⚕️ This is a research demonstration only. Results are not a medical diagnosis. Consult a healthcare professional for any health concerns.</p>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-xs text-slate-600">AlzheimerVoice CVF V5 — {result.indicators?.max} indicators, 11 domains, 35 rules</p>
          <div className="flex items-center gap-3">
            <button onClick={generateShareUrl} className="px-6 py-2.5 rounded-lg border border-white/10 hover:border-violet-500/30 text-sm text-slate-300 font-medium transition-colors flex items-center gap-1.5">
              🔗 Share Results
            </button>
            <button onClick={clearResults} className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors">
              Record Again
            </button>
            <a href="https://demo.alzheimervoice.org" className="px-6 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-sm text-slate-300 font-medium transition-colors">
              Family Access Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
