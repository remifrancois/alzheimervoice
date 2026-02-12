import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import en from './locales/en.json'

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
]

const LANG_CODES = new Set(LANGUAGES.map(l => l.code))

const loaders = {
  hi: () => import('./locales/hi.json'),
  es: () => import('./locales/es.json'),
  fr: () => import('./locales/fr.json'),
  ar: () => import('./locales/ar.json'),
  bn: () => import('./locales/bn.json'),
  pt: () => import('./locales/pt.json'),
  ru: () => import('./locales/ru.json'),
  ja: () => import('./locales/ja.json'),
}

const I18nContext = createContext()

const PAGE_SLUGS = new Set(['scientific', 'family', 'opensource', 'demo', 'privacy', 'legal'])

function getLangFromPath() {
  const seg = window.location.pathname.split('/')[1]
  if (PAGE_SLUGS.has(seg)) return 'en'
  return LANG_CODES.has(seg) && seg !== 'en' ? seg : 'en'
}

function getCurrentPage() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  for (const p of parts) {
    if (PAGE_SLUGS.has(p)) return p
  }
  return null
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

export function I18nProvider({ children }) {
  const [lang] = useState(getLangFromPath)
  const [messages, setMessages] = useState(lang === 'en' ? en : null)

  useEffect(() => {
    if (lang === 'en') return
    loaders[lang]().then(mod => setMessages(mod.default))
  }, [lang])

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const changeLang = useCallback((code) => {
    const page = getCurrentPage()
    const langPrefix = code === 'en' ? '' : `/${code}`
    const pageSuffix = page ? `/${page}` : ''
    window.location.href = langPrefix + pageSuffix || '/'
  }, [])

  const t = useCallback((key, params) => {
    const val = getNestedValue(messages, key) ?? getNestedValue(en, key) ?? key
    if (!params) return val
    return val.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] ?? '')
  }, [messages])

  if (!messages) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <I18nContext.Provider value={{ t, lang, changeLang, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useT must be used within I18nProvider')
  return ctx
}
