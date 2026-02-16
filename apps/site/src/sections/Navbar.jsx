import { useState, useEffect, useRef } from 'react'
import { useT } from '../lib/i18n'
import { useRouter, buildPath } from '../lib/router'

export default function Navbar() {
  const { t, lang, changeLang, languages } = useT()
  const { navigate } = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const currentLang = languages.find(l => l.code === lang)

  const pageLinks = [
    { label: t('nav.scientific'), page: 'science' },
    { label: t('nav.cvf'), page: 'cognitivevoicefingerprint' },
    { label: t('nav.family'), page: 'family' },
    { label: t('nav.opensource'), page: 'opensource' },
  ]

  function handleNav(e, page) {
    e.preventDefault()
    navigate(page)
    setMobileOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/5' : ''}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href={buildPath(lang, 'home')} onClick={(e) => handleNav(e, 'home')} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M8 6v12M4 10v4M16 6v12M20 10v4" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white hidden sm:inline">AlzheimerVoice.org</span>
          <span className="text-lg font-bold text-white sm:hidden">AV</span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-5 flex-1 justify-center">
          {pageLinks.map(link => (
            <a key={link.page} href={buildPath(lang, link.page)} onClick={(e) => handleNav(e, link.page)} className="text-sm text-slate-400 hover:text-white transition-colors whitespace-nowrap">{link.label}</a>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <div className="relative" ref={langRef}>
            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <span className="font-medium">{currentLang?.native || 'EN'}</span>
              <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 glass border border-white/10 rounded-lg shadow-xl py-1 z-50 max-h-80 overflow-y-auto">
                {languages.map(l => (
                  <button key={l.code} onClick={() => { changeLang(l.code); setLangOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${l.code === lang ? 'text-violet-300 bg-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <span className="font-medium w-16">{l.native}</span>
                    <span className="text-slate-600">{l.name}</span>
                    {l.code === lang && (
                      <svg className="ml-auto w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <a href="https://demo.alzheimervoice.org" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-colors">{t('nav.cta')}</a>
          <a href={buildPath(lang, 'demo')} onClick={(e) => handleNav(e, 'demo')} className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400 text-sm font-medium text-white transition-colors">Hackathon Demo</a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors" aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-slate-950/95 backdrop-blur-lg overflow-y-auto">
          <div className="px-6 py-6 space-y-2">
            {pageLinks.map(link => (
              <a key={link.page} href={buildPath(lang, link.page)} onClick={(e) => handleNav(e, link.page)}
                className="block px-4 py-3 rounded-lg text-base text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                {link.label}
              </a>
            ))}

            <div className="border-t border-white/10 my-4" />

            <a href="https://demo.alzheimervoice.org" target="_blank" rel="noopener noreferrer"
              className="block px-4 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-base font-medium text-white text-center transition-colors">
              {t('nav.cta')}
            </a>
            <a href={buildPath(lang, 'demo')} onClick={(e) => handleNav(e, 'demo')}
              className="block px-4 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400 text-base font-medium text-white text-center transition-colors">
              Hackathon Demo
            </a>

            <div className="border-t border-white/10 my-4" />

            <p className="px-4 text-xs text-slate-500 mb-2">Language</p>
            <div className="grid grid-cols-3 gap-2 px-4">
              {languages.map(l => (
                <button key={l.code} onClick={() => { changeLang(l.code); setMobileOpen(false) }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${l.code === lang ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-white/5'}`}>
                  {l.native}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
