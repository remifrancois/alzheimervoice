import { useState, useRef, useEffect } from 'react'
import { Icon } from '@azh/shared-ui'
import { useT } from '@azh/shared-ui'
import { useAuth, ROLES } from '@azh/shared-ui'

export default function Topbar({ title, subtitle }) {
  const { t, lang, changeLang, languages } = useT()
  const { currentUser } = useAuth()
  const [langOpen, setLangOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentLang = languages.find(l => l.code === lang)
  const role = currentUser ? ROLES[currentUser.role] : null

  return (
    <header className="h-[var(--topbar-height)] border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-500 hover:border-slate-700 transition-colors w-48">
          <Icon name="search" size={14} />
          <span>{t('topbar.search')}</span>
          <kbd className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">&#8984;K</kbd>
        </button>

        {/* Language Switcher */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
          >
            <span className="text-[11px] font-medium">{currentLang?.native || lang.toUpperCase()}</span>
            <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 max-h-80 overflow-y-auto">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => { changeLang(l.code); setLangOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                    l.code === lang
                      ? 'bg-violet-500/10 text-violet-300'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="font-medium w-16">{l.native}</span>
                  <span className="text-slate-600">{l.name}</span>
                  {l.code === lang && <span className="ml-auto text-violet-400">&#10003;</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <Icon name="bell" size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar + role */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            {currentUser?.avatar || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-slate-200">{currentUser?.name || 'User'}</div>
            {role && (
              <div className={`text-[10px] ${role.color}`}>{role.label}</div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
