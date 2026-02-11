import { createContext, useContext, useState, useCallback } from 'react'

import en from './locales/en.json'
import zh from './locales/zh.json'
import hi from './locales/hi.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'
import bn from './locales/bn.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import ja from './locales/ja.json'

const locales = { en, zh, hi, es, fr, ar, bn, pt, ru, ja }

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
]

const I18nContext = createContext()

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('memovoice-lang') || 'en' }
    catch { return 'en' }
  })

  const changeLang = useCallback((code) => {
    setLang(code)
    try { localStorage.setItem('memovoice-lang', code) } catch {}
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }, [])

  const t = useCallback((key, params) => {
    const val = getNestedValue(locales[lang], key) ?? getNestedValue(locales.en, key) ?? key
    if (!params) return val
    return val.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] ?? '')
  }, [lang])

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
