import { useState, useEffect, useCallback } from 'react'
import { LANGUAGES } from './i18n'

const LANG_CODES = new Set(LANGUAGES.map(l => l.code))
const PAGE_SLUGS = new Set(['scientific', 'family', 'opensource', 'demo', 'privacy', 'legal', 'compliance', 'creators', 'corevoiceframework'])

function parseURL() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  let lang = 'en'
  let page = 'home'

  if (parts.length === 0) {
    return { lang, page }
  }

  if (parts.length === 1) {
    if (LANG_CODES.has(parts[0]) && parts[0] !== 'en') {
      lang = parts[0]
    } else if (PAGE_SLUGS.has(parts[0])) {
      page = parts[0]
    }
  } else if (parts.length >= 2) {
    if (LANG_CODES.has(parts[0]) && parts[0] !== 'en') {
      lang = parts[0]
    }
    if (PAGE_SLUGS.has(parts[parts.length === 1 ? 0 : 1])) {
      page = parts[parts.length === 1 ? 0 : 1]
    }
  }

  return { lang, page }
}

export function buildPath(lang, page) {
  const langPrefix = lang && lang !== 'en' ? `/${lang}` : ''
  const pageSuffix = page && page !== 'home' ? `/${page}` : ''
  return langPrefix + pageSuffix || '/'
}

export function useRouter() {
  const [state, setState] = useState(parseURL)

  useEffect(() => {
    const sync = () => setState(parseURL())
    window.addEventListener('popstate', sync)
    window.addEventListener('pushstate', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('pushstate', sync)
    }
  }, [])

  const navigate = useCallback((page) => {
    const { lang } = parseURL()
    const path = buildPath(lang, page)
    window.history.pushState({}, '', path)
    setState({ lang, page })
    window.dispatchEvent(new Event('pushstate'))
    window.scrollTo(0, 0)
  }, [])

  return { ...state, navigate }
}
