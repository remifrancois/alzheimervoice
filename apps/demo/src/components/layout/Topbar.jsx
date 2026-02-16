import { useState, useRef, useEffect } from 'react'
import { Icon, useT, useAuth, ROLES, api } from '@azh/shared-ui'

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function Topbar({ title, subtitle }) {
  const { t, lang, changeLang, languages } = useT()
  const { currentUser, logout, mode } = useAuth()
  const [langOpen, setLangOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const dropRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setLangOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (api.getNotifications) {
      api.getNotifications().then(setNotifications)
    }
  }, [])

  const currentLang = languages.find(l => l.code === lang)
  const role = currentUser ? ROLES[currentUser.role] : null
  const unread = notifications.filter(n => !n.read).length

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <header className="h-[var(--topbar-height)] border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-baseline gap-2.5">
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        {subtitle && <>
          <span className="text-slate-700">&mdash;</span>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </>}
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
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Icon name="bell" size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <span className="text-sm font-semibold text-white">{t('notifications.title')}</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-violet-400 hover:text-violet-300">
                    {t('notifications.markAllRead')}
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    {t('notifications.noNotifications')}
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${!notif.read ? 'bg-slate-800/20' : ''}`}
                    >
                      <div className={`mt-0.5 shrink-0 ${notif.color}`}>
                        <Icon name={notif.icon} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>{notif.title}</span>
                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-600">{notif.patient_name}</span>
                          <span className="text-[10px] text-slate-700">&middot;</span>
                          <span className="text-[10px] text-slate-600">{timeAgo(notif.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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

        {/* Logout (Cognito mode only) */}
        {mode === 'cognito' && (
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Sign out"
          >
            <Icon name="log-out" size={16} />
          </button>
        )}
      </div>
    </header>
  )
}
