import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from '../lib/router'

const CVF_URL = import.meta.env.VITE_CVF_URL || 'https://cvf.alzheimervoice.org'

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

const STATE = { IDLE: 'idle', RECORDING: 'recording', QUEUED: 'queued', PROCESSING: 'processing', ERROR: 'error' }

export default function DemoPage() {
  const { navigate } = useRouter()
  const [state, setState] = useState(STATE.IDLE)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('fr')
  const [queuePosition, setQueuePosition] = useState(0)
  const [queueTotal, setQueueTotal] = useState(0)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const pollRef = useRef(null)

  // Check queue status before recording
  const checkQueue = useCallback(async () => {
    try {
      const resp = await fetch(`${CVF_URL}/cvf/v5/demo-queue`, { signal: AbortSignal.timeout(5000) })
      if (resp.ok) {
        const data = await resp.json()
        return data
      }
    } catch {}
    return { active: 0, queued: 0, position: 0 }
  }, [])

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
    await new Promise(resolve => { recorder.onstop = resolve; recorder.stop() })
    stream.getTracks().forEach(t => t.stop())
    mediaRef.current = null

    // Check queue before submitting
    const queueStatus = await checkQueue()
    if (queueStatus.active > 0) {
      setState(STATE.QUEUED)
      setQueuePosition(queueStatus.queued + 1)
      setQueueTotal(queueStatus.active + queueStatus.queued + 1)
      // Poll queue until our turn
      pollRef.current = setInterval(async () => {
        const status = await checkQueue()
        if (status.active === 0) {
          clearInterval(pollRef.current)
          submitAudio()
        } else {
          setQueuePosition(Math.max(1, status.queued))
          setQueueTotal(status.active + status.queued)
        }
      }, 3000)
      return
    }

    submitAudio()
  }, [language, checkQueue])

  const submitAudio = useCallback(async () => {
    setState(STATE.PROCESSING)
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
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
        signal: AbortSignal.timeout(180000),
      })
      base64 = null

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${resp.status}`)
      }
      const data = await resp.json()
      // Remove transcript from stored results for privacy
      const { transcript, nlp_anchors, ...safeResult } = data
      // Store in sessionStorage and navigate to results page
      sessionStorage.setItem('cvf_demo_result', JSON.stringify(safeResult))
      navigate('demoresults')
    } catch (err) {
      setError(err.message)
      setState(STATE.ERROR)
      chunksRef.current = []
    }
  }, [language, navigate])

  const reset = useCallback(() => {
    setState(STATE.IDLE)
    setError(null)
    setSeconds(0)
    setQueuePosition(0)
    chunksRef.current = []
    clearInterval(pollRef.current)
  }, [])

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(pollRef.current); chunksRef.current = [] }, [])
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300 mb-4">Hackathon Demo — V5 Engine</span>
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
            {state === STATE.QUEUED && (
              <div className="py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center mb-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <p className="text-sm text-white font-medium mb-1">In Queue — Position {queuePosition}</p>
                <p className="text-xs text-slate-500 mb-3">Another analysis is in progress on our server. Your recording is ready and will be processed automatically.</p>
                <div className="w-48 mx-auto h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-yellow-500/50 animate-pulse" style={{ width: '100%' }} />
                </div>
                <p className="text-[11px] text-slate-600 mt-3">The CVF engine processes one recording at a time on our Graviton server. Estimated wait: {queuePosition * 30}-{queuePosition * 45}s</p>
              </div>
            )}
            {state === STATE.PROCESSING && (
              <div className="py-8">
                <div className="w-12 h-12 mx-auto border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
                <p className="text-sm text-slate-400">Analyzing your voice...</p>
                <p className="text-xs text-slate-600 mt-1">Acoustic extraction + Whisper transcription + NLP analysis</p>
                <p className="text-xs text-slate-600 mt-1">This may take 20-40 seconds on our Graviton server.</p>
                <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-600">
                  <span>🔊 Acoustic</span><span>→</span>
                  <span>🗣️ Whisper</span><span>→</span>
                  <span>🧠 NLP</span><span>→</span>
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
      </div>

      {/* ── CLOUD ARCHITECTURE ── */}
      <section className="py-20 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-300 mb-4">Hackathon Architecture</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              How the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Cloud Backend</span> Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The demo runs on a real AWS infrastructure — a single ARM64 Graviton instance processing your voice through a full V5 analysis pipeline.
            </p>
          </div>

          {/* Architecture diagram */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 mb-8">
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-violet-500/5 border border-violet-500/10">
                <p className="text-2xl mb-2">🌐</p>
                <p className="text-xs font-semibold text-white">Your Browser</p>
                <p className="text-[11px] text-slate-500 mt-1">alzheimervoice.org</p>
                <p className="text-[10px] text-slate-600 mt-1">Records audio via WebRTC, encodes to base64, sends via HTTPS POST</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-2xl mb-2">☁️</p>
                <p className="text-xs font-semibold text-white">AWS EC2 Graviton</p>
                <p className="text-[11px] text-slate-500 mt-1">cvf.alzheimervoice.org</p>
                <p className="text-[10px] text-slate-600 mt-1">t4g.small ARM64 · Ubuntu 22.04 · Caddy auto-SSL · Node.js 20</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-2xl mb-2">📊</p>
                <p className="text-xs font-semibold text-white">Results Page</p>
                <p className="text-[11px] text-slate-500 mt-1">/demoresults</p>
                <p className="text-[10px] text-slate-600 mt-1">11-domain profile, differential diagnosis, acoustic signature — no transcript stored</p>
              </div>
            </div>
          </div>

          {/* Pipeline detail */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3">🔊 Audio Pipeline (on server)</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">1.</span> ffmpeg converts WebM → 16kHz WAV</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">2.</span> Python parselmouth (Praat) extracts F0, jitter, shimmer, HNR, CPP, formants</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">3.</span> nolds computes nonlinear dynamics (PPE, RPDE, DFA, D2)</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">4.</span> OpenAI Whisper transcribes with word-level timestamps</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">5.</span> 27 acoustic + 5 temporal indicators extracted</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3">🧠 NLP + Scoring Pipeline</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2"><span className="text-violet-400 mt-0.5">1.</span> 25 deterministic NLP anchors computed (regex + word lists, no LLM)</li>
                <li className="flex items-start gap-2"><span className="text-violet-400 mt-0.5">2.</span> Topic genre detected (6 profiles: daily, emotional, procedural...)</li>
                <li className="flex items-start gap-2"><span className="text-violet-400 mt-0.5">3.</span> 107-indicator vector assembled from acoustic + NLP</li>
                <li className="flex items-start gap-2"><span className="text-violet-400 mt-0.5">4.</span> Topic-adjusted z-scores → 11 domain scores → composite</li>
                <li className="flex items-start gap-2"><span className="text-violet-400 mt-0.5">5.</span> 35-rule differential engine → 11-condition diagnosis</li>
              </ul>
            </div>
          </div>

          {/* Privacy flow */}
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { icon: '🎤', title: 'Record', desc: 'Audio captured in your browser via WebRTC. Never leaves until you click Analyze.' },
              { icon: '📡', title: 'Send', desc: 'Base64-encoded audio sent via HTTPS directly to our Graviton server. No S3, no intermediary storage.' },
              { icon: '🧠', title: 'Analyze', desc: 'Whisper transcribes, Praat extracts acoustics, NLP scores 107 indicators. All in-memory on the server.' },
              { icon: '🗑️', title: 'Delete', desc: 'Audio buffer and transcript deleted from server memory immediately. Only computed scores returned.' },
            ].map(s => (
              <div key={s.title} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-xs font-semibold text-white mt-2">{s.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYSIS PROTOCOL ── */}
      <section className="py-20">
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

          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💜</span>
                <h3 className="text-sm font-semibold text-white">Family Memories Power the Conversation</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Families can add personal memories — childhood stories, favorite holidays, career milestones, family traditions. The AI weaves them into warm, natural conversations so your loved one never feels tested. They simply enjoy reminiscing about their own life while the CVF Engine silently monitors 107 cognitive indicators.
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

      {/* ── DASHBOARD CTA ── */}
      <section className="py-20 bg-white/[0.01]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Explore the Interactive Dashboard</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              See how families and clinicians monitor cognitive health over time. The demo dashboard includes sample patient data, weekly reports, timeline views, and the full 11-domain cognitive profile.
            </p>
            <a
              href="https://demo.alzheimervoice.org"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
            >
              Family Access Demo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
            <p className="text-xs text-slate-600 mt-4">demo.alzheimervoice.org</p>
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
