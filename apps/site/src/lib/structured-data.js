const SITE = 'https://alzheimervoice.org'

function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AlzheimerVoice',
    url: SITE,
    logo: `${SITE}/icon-512.png`,
    sameAs: [
      'https://github.com/remifrancois/cognitivevoicefingerprint',
    ],
    description: 'The world\'s first Cognitive Voice Fingerprint engine for early Alzheimer\'s detection through natural conversation analysis. Open source, powered by Claude AI.',
  }
}

function webSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AlzheimerVoice.org',
    url: SITE,
    description: 'AlzheimerVoice identifies subtle linguistic drift years before clinical diagnosis — through natural conversation analysis powered by Claude AI.',
    inLanguage: ['en', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ja'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

function faqPage() {
  const faqs = [
    {
      q: 'What is AlzheimerVoice?',
      a: 'AlzheimerVoice is the world\'s first Cognitive Voice Fingerprint (CVF) engine. It detects early signs of Alzheimer\'s disease by analyzing 85 vocal and linguistic indicators across 9 cognitive domains during natural conversations. It is fully open source under the MIT license and powered by Claude AI.',
    },
    {
      q: 'How does the Cognitive Voice Fingerprint work?',
      a: 'The Cognitive Voice Fingerprint analyzes natural speech across 9 domains: memory recall, temporal orientation, semantic fluency, syntactic complexity, pragmatic coherence, phonemic stability, lexical diversity, prosodic patterns, and discourse organization. Each conversation produces scores for 85 indicators that track cognitive health over time.',
    },
    {
      q: 'Is AlzheimerVoice open source?',
      a: 'Yes. AlzheimerVoice is fully open source under the MIT license. All source code including the CVF engine, Core Voice Framework, family interface, and admin tools is available on GitHub at github.com/remifrancois/cognitivevoicefingerprint.',
    },
    {
      q: 'Can AlzheimerVoice detect Alzheimer\'s early?',
      a: 'AlzheimerVoice is designed to identify subtle linguistic drift that research shows can appear 5-10 years before clinical diagnosis. It is a screening and monitoring tool, not a diagnostic device. Results should be discussed with healthcare providers.',
    },
    {
      q: 'What languages does AlzheimerVoice support?',
      a: 'AlzheimerVoice supports 9 languages: English, Hindi, Spanish, French, Arabic, Bengali, Portuguese, Russian, and Japanese. The voice analysis engine and all interfaces are available in each language.',
    },
    {
      q: 'How does AlzheimerVoice protect voice data privacy?',
      a: 'AlzheimerVoice is designed with privacy-by-default. Voice data can be processed entirely locally without transmission to external servers. When cloud processing is used, data is encrypted in transit and at rest and deleted after analysis. No recordings are retained without explicit consent.',
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }
}

function softwareSourceCode() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'AlzheimerVoice — Cognitive Voice Fingerprint Engine',
    description: 'Open source engine for early Alzheimer\'s detection through voice analysis. 85 indicators, 9 cognitive domains.',
    codeRepository: 'https://github.com/remifrancois/cognitivevoicefingerprint',
    programmingLanguage: ['JavaScript', 'Python'],
    license: 'https://opensource.org/licenses/MIT',
    runtimePlatform: 'Node.js',
    url: `${SITE}/opensource`,
  }
}

function webApplication() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AlzheimerVoice',
    url: SITE,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    description: 'Real-time cognitive voice analysis using the Cognitive Voice Fingerprint engine. Analyze 85 indicators across 9 cognitive domains.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}

function medicalWebPage(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: page === 'cognitivevoicefingerprint'
      ? 'Cognitive Voice Fingerprint — Scientific Foundation'
      : 'Healthcare Compliance — AlzheimerVoice',
    url: `${SITE}/${page}`,
    about: {
      '@type': 'MedicalCondition',
      name: 'Alzheimer\'s Disease',
      alternateName: 'Alzheimer Disease',
    },
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Clinician',
    },
    lastReviewed: '2025-06-01',
  }
}

export function getSchemas(page) {
  const schemas = [organization()]

  switch (page) {
    case 'home':
      schemas.push(webSite(), faqPage())
      break
    case 'cognitivevoicefingerprint':
      schemas.push(medicalWebPage('cognitivevoicefingerprint'))
      break
    case 'corevoiceframework':
      schemas.push(webApplication())
      break
    case 'family':
      schemas.push(faqPage())
      break
    case 'opensource':
      schemas.push(softwareSourceCode())
      break
    case 'demo':
      schemas.push(webApplication())
      break
    case 'compliance':
      schemas.push(medicalWebPage('compliance'))
      break
    default:
      break
  }

  return schemas
}
