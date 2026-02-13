import { useEffect } from 'react'
import { updateSEO } from '../lib/seo'
import { getSchemas } from '../lib/structured-data'

const SCRIPT_ID = 'ld-json-seo'

export function useSEO(page, lang) {
  useEffect(() => {
    updateSEO(page, lang)

    // Inject JSON-LD
    let script = document.getElementById(SCRIPT_ID)
    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(getSchemas(page))

    return () => {
      const el = document.getElementById(SCRIPT_ID)
      if (el) el.remove()
    }
  }, [page, lang])
}
