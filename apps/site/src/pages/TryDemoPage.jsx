import { useState, useRef, useCallback, useEffect } from 'react'

const CVF_URL = import.meta.env.VITE_CVF_URL || 'http://localhost:3002'

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
  green: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', label: 'Normal' },
  yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', label: 'Monitor' },
  orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', label: 'Attention' },
  red: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', label: 'Alert' },
}

function DomainBar({ domain, score }) {
  const info = DOMAIN_LABELS[domain] || { name: domain, icon: '📊', desc: '' }
  if (score == null) return null
  const pct = Math.max(0, Math.min(100, (score + 2) * 25))
  const color = score > 0.3 ? 'bg-emerald-500' : score < -0.5 ? 'bg-red-500' : score < -0.3 ? 'bg-yellow-500' : 'bg-blue-500'
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-lg w-7">{info.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-300 font-medium">{info.name}</span>
          <span className="text-slate-500">{score.toFixed(2)}</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

function ProbabilityBar({ condition, probability }) {
  const pct = Math.round(probability * 100)
  if (pct === 0) return null
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400 w-28 text-right capitalize">{condition.replace('_', ' ')}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-violet-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-500 w-10">{pct}%</span>
    </div>
  )
}

// ── Recording states ──
const STATE = { IDLE: 'idle', RECORDING: 'recording', PROCESSING: 'processing', DONE: 'done', ERROR: 'error' }

export default function TryDemoPage() {
  const [state, setState] = useState(STATE.IDLE)
  const [seconds, setSeconds] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.start(1000)
      mediaRef.current = { recorder, stream }
      setState(STATE.RECORDING)
      setSeconds(0)
      setError(null)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.')
      setState(STATE.ERROR)
    }
  }, [])

  const stopAndAnalyze = useCallback(async () => {
    if (!mediaRef.current) return
    const { recorder, stream } = mediaRef.current
    clearInterval(timerRef.current)

    await new Promise(resolve => {
      recorder.onstop = resolve
      recorder.stop()
    })
    stream.getTracks().forEach(t => t.stop())

    setState(STATE.PROCESSING)

    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const buffer = await blob.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

      const resp = await fetch(`${CVF_URL}/cvf/v5/demo-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64, audioFormat: 'webm', language: 'fr' }),
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.error || `Server error ${resp.status}`)
      }

      const data = await resp.json()
      setResult(data)
      setState(STATE.DONE)
    } catch (err) {
      setError(err.message)
      setState(STATE.ERROR)
    }
  }, [])

  const reset = useCallback(() => {
    setState(STATE.IDLE)
    setResult(null)
    setError(null)
    setSeconds(0)
  }, [])

  useEffect(() => { return () => clearInterval(timerRef.current) }, [])

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300 mb-4">Live Demo — V5 Engine</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Test Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Voice Fingerprint</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Record yourself speaking for 30-60 seconds. Our V5 engine analyzes 107 cognitive indicators across 11 domains in real-time.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* ── RECORDER ── */}
        {state !== STATE.DONE && (
          <div className="max-w-lg mx-auto">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              {state === STATE.IDLE && (
                <>
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-violet-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">Speak naturally for 30-60 seconds</p>
                    <p className="text-xs text-slate-600">Describe your day, a memory, or anything on your mind</p>
                  </div>
                  <button onClick={startRecording} className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors">
                    Start Recording
                  </button>
                </>
              )}

              {state === STATE.RECORDING && (
                <>
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mb-4 animate-pulse">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                    </div>
                    <p className="text-2xl font-mono text-white mb-1">{formatTime(seconds)}</p>
                    <p className="text-xs text-slate-500">{seconds < 20 ? 'Keep speaking...' : seconds < 45 ? 'Good length — you can stop when ready' : 'Great recording length'}</p>
                  </div>
                  <button onClick={stopAndAnalyze} disabled={seconds < 5} className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-colors">
                    Stop & Analyze
                  </button>
                </>
              )}

              {state === STATE.PROCESSING && (
                <div className="py-8">
                  <div className="w-12 h-12 mx-auto border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
                  <p className="text-sm text-slate-400">Analyzing your voice...</p>
                  <p className="text-xs text-slate-600 mt-1">Acoustic extraction + Whisper transcription + NLP analysis</p>
                </div>
              )}

              {state === STATE.ERROR && (
                <div className="py-4">
                  <p className="text-sm text-red-400 mb-4">{error}</p>
                  <button onClick={reset} className="px-6 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors">
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {state === STATE.DONE && result && (
          <div className="space-y-6 animate-in fade-in">
            {/* Alert Banner */}
            {(() => {
              const a = ALERT_COLORS[result.alert_level] || ALERT_COLORS.green
              return (
                <div className={`p-6 rounded-2xl ${a.bg} border ${a.border} text-center`}>
                  <p className={`text-3xl font-bold ${a.text} mb-1`}>{a.label}</p>
                  <p className="text-sm text-slate-400">Composite Score: {result.composite?.toFixed(3)}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {result.indicators?.total} indicators analyzed in {(result.processing_ms / 1000).toFixed(1)}s
                  </p>
                </div>
              )
            })()}

            {/* Two-column layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Domain Scores */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">11-Domain Cognitive Profile</h3>
                <div className="space-y-1">
                  {Object.entries(result.domain_scores || {}).map(([d, s]) => (
                    <DomainBar key={d} domain={d} score={s} />
                  ))}
                </div>
              </div>

              {/* Differential Diagnosis */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">Differential Analysis</h3>
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">Primary Hypothesis</p>
                  <p className="text-lg font-semibold text-white capitalize">{result.differential?.primary?.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-500">Confidence: {Math.round((result.differential?.confidence || 0) * 100)}%</p>
                </div>
                <div className="space-y-2">
                  {Object.entries(result.differential?.probabilities || {})
                    .sort(([,a], [,b]) => b - a)
                    .map(([c, p]) => <ProbabilityBar key={c} condition={c} probability={p} />)}
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Transcript</h3>
              <p className="text-xs text-slate-500 mb-3">
                {result.word_count} words | {result.detected_gender} | topic: {result.topic_genre} ({Math.round((result.topic_confidence || 0) * 100)}%)
              </p>
              <p className="text-sm text-slate-400 leading-relaxed italic">"{result.transcript}"</p>
            </div>

            {/* Recommendations */}
            {result.differential?.recommendation && (
              <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <h3 className="text-sm font-semibold text-white mb-2">Recommendation</h3>
                <p className="text-sm text-slate-400">
                  {Array.isArray(result.differential.recommendation) ? result.differential.recommendation.join(' ') : result.differential.recommendation}
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
              <p className="text-xs text-yellow-400/80 text-center">{result.disclaimer}</p>
            </div>

            {/* Engine info + Try Again */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                MemoVoice CVF V5 "deep_voice" — {result.indicators?.max} indicators, 11 domains, 35 rules
              </p>
              <button onClick={reset} className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors">
                Record Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
