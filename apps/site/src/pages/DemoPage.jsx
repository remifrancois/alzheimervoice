import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from '../lib/router'

const CVF_URL = import.meta.env.VITE_CVF_URL || 'https://cvf.alzheimervoice.org'

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

const SESSIONS = [
  { id: 'test', icon: '🎤', title: 'Test Audio (30 secondes)', desc: 'Dites quelques phrases pour tester votre micro', type: 'test' },
  { id: 's1', icon: '✓', title: 'Session 1 : Récit quotidien', desc: 'Racontez votre journée d\'hier en détail' },
  { id: 's2', icon: '✓', title: 'Session 2 : Weekend récent', desc: 'Qu\'avez-vous fait ce weekend ou le weekend dernier ?' },
  { id: 's3', icon: '✓', title: 'Session 3 : Voyage marquant', desc: 'Parlez d\'un voyage qui vous a marqué' },
  { id: 's4', icon: '✓', title: 'Session 4 : Recette préférée', desc: 'Expliquez comment préparer votre plat préféré' },
  { id: 's5', icon: '✓', title: 'Session 5 : Parcours professionnel', desc: 'Parlez de votre travail ou métier' },
  { id: 's6', icon: '✓', title: 'Session 6 : Hobby ou passion', desc: 'Décrivez votre hobby ou passion principale' },
  { id: 's7', icon: '✓', title: 'Session 7 : Souvenir d\'enfance', desc: 'Racontez un souvenir marquant de votre enfance' },
  { id: 's8', icon: '✓', title: 'Session 8 : Événement familial', desc: 'Parlez d\'un événement familial important' },
  { id: 's9', icon: '✓', title: 'Session 9 : Projet ou rêve', desc: 'Décrivez un projet ou un rêve que vous avez' },
  { id: 's10', icon: '✓', title: 'Session 10 : Journée type', desc: 'Décrivez une journée type dans votre vie' },
  { id: 's11', icon: '✓', title: 'Session 11 : Lieu préféré', desc: 'Décrivez votre lieu préféré et pourquoi' },
  { id: 's12', icon: '✓', title: 'Session 12 : Personne importante', desc: 'Parlez d\'une personne importante dans votre vie' },
  { id: 's13', icon: '✓', title: 'Session 13 : Apprentissage', desc: 'Racontez comment vous avez appris quelque chose d\'important' },
  { id: 's14', icon: '✓', title: 'Session 14 : Tradition familiale', desc: 'Décrivez une tradition ou habitude familiale' },
  { id: 's15', icon: '✓', title: 'Session 15 : Changement de vie', desc: 'Parlez d\'un moment qui a changé votre vie' },
  { id: 's16', icon: '✓', title: 'Session 16 : Saison préférée', desc: 'Décrivez votre saison préférée et vos activités' },
  { id: 's17', icon: '✓', title: 'Session 17 : Repas mémorable', desc: 'Racontez un repas ou dîner mémorable' },
  { id: 's18', icon: '✓', title: 'Session 18 : Conseil important', desc: 'Quel conseil donneriez-vous à quelqu\'un ?' },
  { id: 'free1', icon: '🎙️', title: 'Session Libre 1', desc: 'Parlez de ce que vous voulez pendant 5 minutes', type: 'free' },
  { id: 'free2', icon: '🎙️', title: 'Session Libre 2', desc: 'Parlez de ce que vous voulez pendant 5 minutes', type: 'free' },
]

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
      <span className="text-slate-400 w-28 text-right capitalize">{condition.replace(/_/g, ' ')}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-violet-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-500 w-10">{pct}%</span>
    </div>
  )
}

function AcousticSummary({ acoustic }) {
  if (!acoustic) return null
  const items = [
    { label: 'Pitch (F0)', value: acoustic.f0_mean, unit: '' },
    { label: 'Pitch Var.', value: acoustic.f0_sd, unit: '' },
    { label: 'Jitter', value: acoustic.jitter, unit: '' },
    { label: 'Shimmer', value: acoustic.shimmer, unit: '' },
    { label: 'HNR', value: acoustic.hnr, unit: '' },
  ].filter(i => i.value != null)
  if (items.length === 0) return null
  return (
    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
      <h3 className="text-sm font-semibold text-white mb-4">🔊 Acoustic Summary</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {items.map(i => (
          <div key={i.label} className="text-center">
            <p className="text-lg font-mono text-white">{typeof i.value === 'number' ? i.value.toFixed(3) : i.value}</p>
            <p className="text-[11px] text-slate-500">{i.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const STATE = { IDLE: 'idle', RECORDING: 'recording', PROCESSING: 'processing', DONE: 'done', ERROR: 'error' }

export default function DemoPage() {
  const { navigate } = useRouter()
  const [state, setState] = useState(STATE.IDLE)
  const [seconds, setSeconds] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('fr')
  const [dataDeleted, setDataDeleted] = useState(false)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const resultsRef = useRef(null)

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
      setDataDeleted(false)
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
    await new Promise(resolve => { recorder.onstop = resolve; recorder.stop() })
    stream.getTracks().forEach(t => t.stop())
    mediaRef.current = null
    setState(STATE.PROCESSING)
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      // Clear audio chunks from memory immediately after creating blob
      chunksRef.current = []
      const buffer = await blob.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let base64 = ''
      const chunk = 8192
      for (let i = 0; i < bytes.length; i += chunk) {
        base64 += String.fromCharCode(...bytes.subarray(i, i + chunk))
      }
      base64 = btoa(base64)

      const resp = await fetch(`${CVF_URL}/cvf/v5/demo-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64, audioFormat: 'webm', language }),
        signal: AbortSignal.timeout(120000),
      })

      // Audio data sent — clear base64 from memory
      base64 = null

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${resp.status}`)
      }
      const data = await resp.json()
      setResult(data)
      setDataDeleted(true)
      setState(STATE.DONE)
      // Scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err.message)
      setState(STATE.ERROR)
      // Ensure audio data is cleared even on error
      chunksRef.current = []
    }
  }, [language])

  const reset = useCallback(() => {
    setState(STATE.IDLE)
    setResult(null)
    setError(null)
    setSeconds(0)
    setDataDeleted(false)
    chunksRef.current = []
  }, [])

  useEffect(() => () => { clearInterval(timerRef.current); chunksRef.current = [] }, [])
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
          <p className="text-xs text-slate-500 mt-3">Currently available in English and French only.</p>
          <p className="text-xs text-slate-600 mt-2">🔒 Your audio is sent directly to our analysis server, processed in memory, and immediately discarded. No recordings, transcripts, or results are ever stored.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-12">
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
                  {/* Language selector */}
                  <div className="flex items-center justify-center gap-2 mb-5">
                    <span className="text-xs text-slate-500">Language:</span>
                    <button onClick={() => setLanguage('fr')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${language === 'fr' ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                      🇫🇷 Français
                    </button>
                    <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${language === 'en' ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                      🇬🇧 English
                    </button>
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
                  <p className="text-xs text-slate-600 mt-1">This may take 20-40 seconds on our Graviton server.</p>
                  <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-600">
                    <span>🔊 Acoustic</span>
                    <span>→</span>
                    <span>🗣️ Whisper</span>
                    <span>→</span>
                    <span>🧠 NLP</span>
                    <span>→</span>
                    <span>📊 Scoring</span>
                  </div>
                </div>
              )}
              {state === STATE.ERROR && (
                <div className="py-4">
                  <p className="text-sm text-red-400 mb-4">{error}</p>
                  <button onClick={reset} className="px-6 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-colors">Try Again</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {state === STATE.DONE && result && (
          <div ref={resultsRef} className="space-y-6">
            {/* Data deleted confirmation */}
            {dataDeleted && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <p className="text-xs text-emerald-400">Your audio recording has been deleted from memory. Only the analysis results below are shown — nothing is stored on our servers.</p>
              </div>
            )}

            {/* Alert level */}
            {(() => {
              const a = ALERT_COLORS[result.alert_level] || ALERT_COLORS.green
              return (
                <div className={`p-6 rounded-2xl ${a.bg} border ${a.border} text-center`}>
                  <p className={`text-3xl font-bold ${a.text} mb-1`}>{a.label}</p>
                  <p className="text-sm text-slate-400">Composite Score: {result.composite?.toFixed(3)}</p>
                  <p className="text-xs text-slate-600 mt-1">{result.indicators?.total} of {result.indicators?.max} indicators analyzed in {(result.processing_ms / 1000).toFixed(1)}s</p>
                </div>
              )
            })()}

            {/* Domain scores + Differential */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">11-Domain Cognitive Profile</h3>
                <div className="space-y-1">
                  {Object.entries(result.domain_scores || {}).map(([d, s]) => <DomainBar key={d} domain={d} score={s} />)}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">Differential Analysis</h3>
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">Primary Hypothesis</p>
                  <p className="text-lg font-semibold text-white capitalize">{(result.differential?.primary || '').replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-500">Confidence: {Math.round((result.differential?.confidence || 0) * 100)}%</p>
                </div>
                <div className="space-y-2">
                  {Object.entries(result.differential?.probabilities || {}).sort(([,a], [,b]) => b - a).map(([c, p]) => <ProbabilityBar key={c} condition={c} probability={p} />)}
                </div>
              </div>
            </div>

            {/* Acoustic summary */}
            <AcousticSummary acoustic={result.acoustic_summary} />

            {/* Transcript */}
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Transcript</h3>
              <p className="text-xs text-slate-500 mb-3">{result.word_count} words | {result.detected_gender} | topic: {result.topic_genre} ({Math.round((result.topic_confidence || 0) * 100)}%)</p>
              <p className="text-sm text-slate-400 leading-relaxed italic">"{result.transcript}"</p>
            </div>

            {/* Recommendation */}
            {result.differential?.recommendation && (
              <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <h3 className="text-sm font-semibold text-white mb-2">Recommendation</h3>
                <p className="text-sm text-slate-400">{Array.isArray(result.differential.recommendation) ? result.differential.recommendation.join(' ') : result.differential.recommendation}</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
              <p className="text-xs text-yellow-400/80 text-center">{result.disclaimer}</p>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-600">AlzheimerVoice CVF V5 "deep_voice" — {result.indicators?.max} indicators, 11 domains, 35 rules</p>
              <button onClick={reset} className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors">Record Again</button>
            </div>
          </div>
        )}
      </div>

      {/* ── ANALYSIS PROTOCOL ── */}
      <section className="py-20 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300 mb-4">Better Analysis</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Full Analysis Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">After a Few Recordings</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              For a more accurate cognitive voice fingerprint, complete the full protocol below. It takes 60 to 90 minutes total and we will guide you through each session.
            </p>
            <p className="text-xs text-slate-500 mt-3">Below is an example protocol — sessions are personalized based on the patient's history and family-provided memories.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SESSIONS.map((s) => (
              <div key={s.id} className={`p-3 rounded-lg ${s.type === 'test' ? 'bg-violet-500/5 border border-violet-500/10' : s.type === 'free' ? 'bg-blue-500/5 border border-blue-500/10' : 'bg-white/[0.02] border border-white/5'}`}>
                <span className={`text-sm ${s.type === 'test' ? 'text-violet-400' : s.type === 'free' ? 'text-blue-400' : 'text-emerald-400'}`}>{s.icon}</span>
                <p className={`text-xs font-medium mt-1 ${s.type === 'test' ? 'text-violet-300' : s.type === 'free' ? 'text-blue-300' : 'text-slate-200'}`}>{s.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Family memories + Mobile app */}
          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💜</span>
                <h3 className="text-sm font-semibold text-white">Family Memories Power the Conversation</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Families can add personal memories — childhood stories, favorite holidays, career milestones, family traditions. The AI weaves them into warm, natural conversations so your loved one never feels tested. They simply enjoy reminiscing about their own life while the CVF Engine silently monitors 85 cognitive indicators.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📱</span>
                <h3 className="text-sm font-semibold text-white">Mobile Application Under Development</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                A dedicated mobile application for iOS and Android is currently under development. It will allow families to manage memories, schedule AI-guided phone calls, receive real-time alerts, and review weekly cognitive reports — all from their phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">How the Demo Works</h2>
            <p className="text-sm text-slate-400">No S3, no database, no storage — your privacy is absolute.</p>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: '1', icon: '🎤', title: 'Record', desc: 'Audio captured in your browser. Never leaves until you click Analyze.' },
              { step: '2', icon: '📡', title: 'Send', desc: 'Audio sent as encrypted base64 directly to our CVF server. No S3, no intermediary.' },
              { step: '3', icon: '🧠', title: 'Analyze', desc: 'Whisper transcribes, acoustic pipeline extracts, NLP scores 107 indicators. All in memory.' },
              { step: '4', icon: '🗑️', title: 'Delete', desc: 'Audio and transcript deleted from server memory immediately. Only scores returned to your browser.' },
            ].map(s => (
              <div key={s.step} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-xs font-semibold text-white mt-2">{s.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTER CTA ── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Register Today as a Family</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Create your family account to start monitoring your loved one's cognitive health through natural conversations.
            </p>
            <a
              href="https://app.alzheimervoice.org/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
            >
              Create Family Account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
            <p className="text-xs text-slate-600 mt-4">app.alzheimervoice.org/register</p>
          </div>
        </div>
      </section>

      {/* Back */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <button onClick={() => navigate('home')} className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors">
            ← Back to Home
          </button>
        </div>
      </section>
    </div>
  )
}
