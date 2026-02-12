import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

/**
 * ForgotPasswordPage — Two-step: request code → reset password.
 *
 * Props:
 *   appName, appColor, logoLetter — branding
 *   onNavigate — ({ to }) => navigate to /login
 */
export function ForgotPasswordPage({ appName = 'MemoVoice', appColor = 'from-violet-500 to-blue-600', logoLetter = 'M', onNavigate }) {
  const { resetPassword, confirmResetPassword } = useAuth()
  const [step, setStep] = useState('email') // 'email' | 'reset'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleRequestCode(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email)
      setStep('reset')
    } catch (err) {
      setError(err.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await confirmResetPassword(email, code, newPassword)
      onNavigate?.({ to: '/login' })
    } catch (err) {
      setError(err.message || 'Failed to reset password')
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
            {step === 'email' ? 'Reset your password' : 'Enter your new password'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg bg-gradient-to-r ${appColor} text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Sending code...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
              We sent a reset code to <span className="font-medium">{email}</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Reset Code</label>
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
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg bg-gradient-to-r ${appColor} text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Back to login */}
        <p className="text-center text-xs text-slate-500 mt-6">
          <button
            onClick={() => onNavigate?.({ to: '/login' })}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  )
}
