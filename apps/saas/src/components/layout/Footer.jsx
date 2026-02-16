import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 py-4 mt-auto">
      <div className="px-6 flex items-center justify-between text-[11px] text-slate-600">
        <span>AlzheimerVoice CVF Engine V5</span>
        <div className="flex items-center gap-4">
          <Link to="/changelog" className="hover:text-slate-400 transition-colors">
            Changelog
          </Link>
          <Link to="/privacy" className="hover:text-slate-400 transition-colors">
            Privacy
          </Link>
          <span className="hidden sm:inline">&copy; 2026 AlzheimerVoice</span>
        </div>
      </div>
    </footer>
  )
}
