import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from '../lib/router'
import { useT } from '../lib/i18n'

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
const ACCEPTED_FORMATS = { 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/wave': 'wav', 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/ogg': 'ogg', 'audio/webm': 'webm', 'audio/flac': 'flac', 'audio/x-flac': 'flac' }
const ACCEPTED_EXTENSIONS = { wav: 'wav', mp3: 'mp3', ogg: 'ogg', webm: 'webm', flac: 'flac' }
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const PROGRESS_STAGES = [
  { at: 0, label: 'Uploading audio...' },
  { at: 8, label: 'Converting audio format...' },
  { at: 15, label: 'Extracting acoustic features (F0, jitter, shimmer)...' },
  { at: 30, label: 'Computing nonlinear dynamics (PPE, RPDE, DFA)...' },
  { at: 45, label: 'Transcribing speech with Claude...' },
  { at: 62, label: 'Running 25 NLP anchors...' },
  { at: 75, label: 'Assembling 107-indicator vector...' },
  { at: 85, label: 'Scoring 11 cognitive domains...' },
  { at: 92, label: 'Running 35-rule differential engine...' },
  { at: 97, label: 'Finalizing results...' },
]

export default function DemoPage() {
  const { navigate } = useRouter()
  const { lang } = useT()
  const [state, setState] = useState(STATE.IDLE)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState(lang === 'fr' ? 'fr' : 'en')
  const [queuePosition, setQueuePosition] = useState(0)
  const [queueTotal, setQueueTotal] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressStage, setProgressStage] = useState('')
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const pollRef = useRef(null)
  const fileInputRef = useRef(null)
  const progressRef = useRef(null)

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

  // Simulated progress bar — models the real pipeline timing
  const startProgress = useCallback(() => {
    setProgress(0)
    setProgressStage(PROGRESS_STAGES[0].label)
    let elapsed = 0
    clearInterval(progressRef.current)
    progressRef.current = setInterval(() => {
      elapsed += 0.5
      const pct = Math.min(98, Math.round(100 * (1 - Math.exp(-elapsed / 18))))
      setProgress(pct)
      for (let i = PROGRESS_STAGES.length - 1; i >= 0; i--) {
        if (pct >= PROGRESS_STAGES[i].at) { setProgressStage(PROGRESS_STAGES[i].label); break }
      }
    }, 500)
  }, [])
  const stopProgress = useCallback(() => {
    clearInterval(progressRef.current)
    setProgress(100)
    setProgressStage('Done!')
  }, [])

  const reset = useCallback(() => {
    setState(STATE.IDLE)
    setError(null)
    setSeconds(0)
    setQueuePosition(0)
    setUploadedFile(null)
    setProgress(0)
    setProgressStage('')
    chunksRef.current = []
    clearInterval(pollRef.current)
    clearInterval(progressRef.current)
  }, [])

  const submitAudio = useCallback(async () => {
    setState(STATE.PROCESSING)
    startProgress()
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
      const { transcript, nlp_anchors, ...safeResult } = data
      sessionStorage.setItem('cvf_demo_result', JSON.stringify(safeResult))
      stopProgress()
      navigate('demoresults')
    } catch (err) {
      stopProgress()
      setError(err.message)
      setState(STATE.ERROR)
      chunksRef.current = []
    }
  }, [language, navigate, startProgress, stopProgress])

  const doSubmitFile = useCallback(async () => {
    if (!uploadedFile) return
    setState(STATE.PROCESSING)
    startProgress()
    try {
      const { file, format } = uploadedFile
      const buffer = await file.arrayBuffer()
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
        body: JSON.stringify({ audioBase64: base64, audioFormat: format, language }),
        signal: AbortSignal.timeout(180000),
      })
      base64 = null

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${resp.status}`)
      }
      const data = await resp.json()
      const { transcript, nlp_anchors, ...safeResult } = data
      sessionStorage.setItem('cvf_demo_result', JSON.stringify(safeResult))
      stopProgress()
      setUploadedFile(null)
      navigate('demoresults')
    } catch (err) {
      stopProgress()
      setError(err.message)
      setState(STATE.ERROR)
      setUploadedFile(null)
    }
  }, [uploadedFile, language, navigate, startProgress, stopProgress])

  const stopAndAnalyze = useCallback(async () => {
    if (!mediaRef.current) return
    const { recorder, stream } = mediaRef.current
    clearInterval(timerRef.current)
    await new Promise(resolve => { recorder.onstop = resolve; recorder.stop() })
    stream.getTracks().forEach(t => t.stop())
    mediaRef.current = null

    const queueStatus = await checkQueue()
    if (queueStatus.active > 0) {
      setState(STATE.QUEUED)
      setQueuePosition(queueStatus.queued + 1)
      setQueueTotal(queueStatus.active + queueStatus.queued + 1)
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
  }, [language, checkQueue, submitAudio])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`)
      setState(STATE.ERROR)
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase()
    const format = ACCEPTED_FORMATS[file.type] || ACCEPTED_EXTENSIONS[ext]
    if (!format) {
      setError(`Unsupported format. Please use WAV, MP3, OGG, WebM, or FLAC.`)
      setState(STATE.ERROR)
      return
    }
    setUploadedFile({ file, format })
    setError(null)
  }, [])

  const submitUploadedFile = useCallback(async () => {
    if (!uploadedFile) return
    const queueStatus = await checkQueue()
    if (queueStatus.active > 0) {
      setState(STATE.QUEUED)
      setQueuePosition(queueStatus.queued + 1)
      setQueueTotal(queueStatus.active + queueStatus.queued + 1)
      pollRef.current = setInterval(async () => {
        const status = await checkQueue()
        if (status.active === 0) {
          clearInterval(pollRef.current)
          doSubmitFile()
        } else {
          setQueuePosition(Math.max(1, status.queued))
          setQueueTotal(status.active + status.queued)
        }
      }, 3000)
      return
    }
    doSubmitFile()
  }, [uploadedFile, language, checkQueue, doSubmitFile])

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(pollRef.current); clearInterval(progressRef.current); chunksRef.current = [] }, [])
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
          <p className="text-xs text-yellow-500/70 mt-2">⚠️ Demo mode — acoustic analysis only. Full 107-indicator analysis with Claude AI transcription available on the SaaS platform.</p>
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
                {/* Divider */}
                <div className="flex items-center gap-3 mt-6 mb-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-slate-600">or upload an audio file</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                {/* File upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav,.mp3,.ogg,.webm,.flac"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload audio file"
                />
                {!uploadedFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 rounded-xl border border-dashed border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 text-sm text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                    Choose File
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">📎</span>
                        <span className="text-xs text-slate-300 truncate">{uploadedFile.file.name}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">{(uploadedFile.file.size / 1024 / 1024).toFixed(1)}MB · {uploadedFile.format.toUpperCase()}</span>
                      </div>
                      <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="text-slate-500 hover:text-slate-300 text-xs shrink-0">✕</button>
                    </div>
                    <button onClick={submitUploadedFile} className="mt-3 w-full px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
                      Analyze File
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-600 mt-3">WAV, MP3, OGG, WebM, or FLAC · Max 10MB · 30 seconds minimum of speech</p>
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
                <p className="text-sm font-medium text-white mb-4">Analyzing your voice...</p>
                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-slate-400">{progressStage}</p>
                  <span className="text-xs font-mono text-slate-500">{progress}%</span>
                </div>
                {/* Pipeline steps */}
                <div className="flex items-center justify-center gap-2 text-[11px]">
                  {[
                    { icon: '🔊', label: 'Acoustic', at: 8 },
                    { icon: '🗣️', label: 'Transcribe', at: 45 },
                    { icon: '🧠', label: 'NLP', at: 62 },
                    { icon: '📊', label: 'Scoring', at: 85 },
                  ].map((step, i) => (
                    <span key={step.label} className="flex items-center gap-1">
                      {i > 0 && <span className="text-slate-700 mx-1">→</span>}
                      <span className={progress >= step.at ? 'text-slate-300' : 'text-slate-600'}>{step.icon} {step.label}</span>
                      {progress >= step.at + 10 && <span className="text-emerald-500">✓</span>}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-4">Processing on our Graviton ARM64 server. Typically 20-40 seconds.</p>
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
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">4.</span> Claude transcribes with word-level timestamps</li>
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

          {/* Serverless note */}
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-3 mb-8">
            <span className="text-lg mt-0.5">⚡</span>
            <div>
              <p className="text-sm text-white font-medium">Serverless Lambda Version in Development</p>
              <p className="text-xs text-slate-400 mt-1">A fully serverless architecture using AWS Lambda + Lambda Layers (ffmpeg, Claude, Python audio stack) is currently in development. This will enable auto-scaling, zero idle cost, and sub-second cold starts — removing the single-server bottleneck of the current Graviton deployment.</p>
            </div>
          </div>

          {/* Demo limitation notice */}
          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-3 mb-8">
            <span className="text-lg mt-0.5">⚠️</span>
            <div>
              <p className="text-sm text-white font-medium">Demo Limitations</p>
              <p className="text-xs text-slate-400 mt-1">This demo runs on a minimal AWS Graviton instance (t4g.small, 2 vCPU, 2GB RAM) without GPU acceleration or Anthropic API integration. As a result, only acoustic indicators are extracted — the full 107-indicator analysis (including NLP anchors and Claude-powered transcription) requires production-grade infrastructure.</p>
              <p className="text-xs text-slate-400 mt-2">The full V5 engine with Claude API transcription, GPU-accelerated feature extraction, and real-time NLP analysis is available through the SaaS platform. Paid subscriptions fund the AWS infrastructure and Anthropic API costs required to run the complete cognitive analysis pipeline.</p>
            </div>
          </div>

          {/* Privacy flow */}
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { icon: '🎤', title: 'Record', desc: 'Audio captured in your browser via WebRTC. Never leaves until you click Analyze.' },
              { icon: '📡', title: 'Send', desc: 'Base64-encoded audio sent via HTTPS directly to our Graviton server. No S3, no intermediary storage.' },
              { icon: '🧠', title: 'Analyze', desc: 'Claude transcribes, Praat extracts acoustics, NLP scores 107 indicators. All in-memory on the server.' },
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
