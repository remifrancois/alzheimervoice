import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

/**
 * RegisterPage — Two-step registration: sign up → verify code.
 *
 * Props:
 *   appName, appColor, logoLetter — branding
 *   onNavigate — ({ to }) => navigate to /login
 */
export function RegisterPage({ appName = 'MemoVoice', appColor = 'from-violet-500 to-blue-600', logoLetter = 'M', onNavigate }) {
  const { register, confirmRegistration, login } = useAuth()
  const [step, setStep] = useState('register') // 'register' | 'verify'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, password, name)
      setStep('verify')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await confirmRegistration(email, code)
      // Auto-login after verification
      await login(email, password)
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${appColor} flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
            {logoLetter}
          </div>
          <h1 className="text-xl font-semibold text-white">{appName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === 'register' ? 'Create your account' : 'Verify your email'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="Dr. Jane Smith"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="Min. 8 characters"
              />
              <p className="text-[11px] text-slate-600 mt-1">Must include uppercase, lowercase, number, and special character</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg bg-gradient-to-r ${appColor} text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
              We sent a verification code to <span className="font-medium">{email}</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                maxLength={6}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-center tracking-[0.5em] text-lg font-mono"
                placeholder="000000"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg bg-gradient-to-r ${appColor} text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        )}

        {/* Back to login */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate?.({ to: '/login' })}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
