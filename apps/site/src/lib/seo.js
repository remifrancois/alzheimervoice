const SITE = 'https://alzheimervoice.org'
const SITE_NAME = 'AlzheimerVoice.org'
const OG_IMAGE = `${SITE}/og-image.png`

const LANGUAGES = ['en', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ja']

const OG_LOCALES = {
  en: 'en_US', hi: 'hi_IN', es: 'es_ES', fr: 'fr_FR',
  ar: 'ar_SA', bn: 'bn_BD', pt: 'pt_BR', ru: 'ru_RU', ja: 'ja_JP',
}

export const PAGE_SEO = {
  home: {
    title: 'AlzheimerVoice.org — The world\'s first Cognitive Voice Fingerprint engine',
    description: 'AlzheimerVoice identifies subtle linguistic drift years before clinical diagnosis — through natural conversation analysis powered by Claude AI. 85 indicators, 9 cognitive domains, fully open source.',
    ogType: 'website',
  },
  cognitivevoicefingerprint: {
    title: 'Cognitive Voice Fingerprint (CVF) — 85 Indicators, 9 Domains | AlzheimerVoice',
    description: 'The scientific foundation of AlzheimerVoice: 85 vocal and linguistic indicators across 9 cognitive domains that detect early Alzheimer\'s through natural conversation.',
    ogType: 'article',
  },
  corevoiceframework: {
    title: 'Core Voice Framework — Developer API & Pipeline | AlzheimerVoice',
    description: 'The open source technical framework powering the Cognitive Voice Fingerprint engine. APIs, data models, and real-time processing pipeline for voice-based cognitive analysis.',
    ogType: 'website',
  },
  family: {
    title: 'For Families — Monitor Loved Ones with Voice Check-Ins | AlzheimerVoice',
    description: 'Track cognitive health over time through natural voice conversations. Family dashboard, notifications, multi-language support. No clinical setting required.',
    ogType: 'website',
  },
  opensource: {
    title: 'Open Source — MIT License, Full Transparency | AlzheimerVoice',
    description: 'AlzheimerVoice is fully open source under the MIT license. Explore the code, contribute, and deploy on your own infrastructure.',
    ogType: 'website',
  },
  demo: {
    title: 'Live Demo — Try the Cognitive Voice Fingerprint | AlzheimerVoice',
    description: 'Experience real-time cognitive voice analysis. See how 85 indicators are extracted and scored across 9 domains during a natural conversation.',
    ogType: 'website',
  },
  privacy: {
    title: 'Privacy Policy — Data Protection & Voice Privacy | AlzheimerVoice',
    description: 'How AlzheimerVoice protects your voice data. Privacy-by-default, local processing, encryption, and no data retention without consent.',
    ogType: 'website',
  },
  legal: {
    title: 'Legal — Terms of Service & Disclaimers | AlzheimerVoice',
    description: 'Terms of service, disclaimers, and legal notices for AlzheimerVoice. Screening tool, not a diagnostic device.',
    ogType: 'website',
  },
  compliance: {
    title: 'Compliance — HIPAA, GDPR & Healthcare Standards | AlzheimerVoice',
    description: 'AlzheimerVoice compliance with HIPAA, GDPR, and healthcare data protection regulations. Technical and organizational measures detailed.',
    ogType: 'website',
  },
  creators: {
    title: 'Creators — The Team Behind AlzheimerVoice',
    description: 'Meet the team building open source tools for early Alzheimer\'s detection. Making cognitive screening accessible to everyone worldwide.',
    ogType: 'website',
  },
}

function buildURL(lang, page) {
  const langPrefix = lang && lang !== 'en' ? `/${lang}` : ''
  const pageSuffix = page && page !== 'home' ? `/${page}` : ''
  return `${SITE}${langPrefix}${pageSuffix}` || SITE
}

function setMeta(nameOrProp, content, isProperty) {
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, nameOrProp)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href, attrs) {
  const selector = attrs
    ? `link[rel="${rel}"][${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join('][')}]`
    : `link[rel="${rel}"]`
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function clearHreflangLinks() {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove())
}

export function updateSEO(page, lang) {
  const seo = PAGE_SEO[page] || PAGE_SEO.home
  const url = buildURL(lang, page)

  // Title
  document.title = seo.title

  // Meta
  setMeta('description', seo.description)
  setMeta('robots', 'index, follow')

  // Canonical
  setLink('canonical', url)

  // Open Graph
  setMeta('og:title', seo.title, true)
  setMeta('og:description', seo.description, true)
  setMeta('og:url', url, true)
  setMeta('og:type', seo.ogType, true)
  setMeta('og:site_name', SITE_NAME, true)
  setMeta('og:image', OG_IMAGE, true)
  setMeta('og:locale', OG_LOCALES[lang] || 'en_US', true)

  // Twitter Card
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', seo.title)
  setMeta('twitter:description', seo.description)
  setMeta('twitter:image', OG_IMAGE)
  setMeta('twitter:site', '@AlzheimerVoice')

  // Hreflang
  clearHreflangLinks()
  for (const code of LANGUAGES) {
    const altURL = buildURL(code, page)
    const link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', code)
    link.setAttribute('href', altURL)
    document.head.appendChild(link)
  }
  // x-default
  const xdef = document.createElement('link')
  xdef.setAttribute('rel', 'alternate')
  xdef.setAttribute('hreflang', 'x-default')
  xdef.setAttribute('href', buildURL('en', page))
  document.head.appendChild(xdef)
}
