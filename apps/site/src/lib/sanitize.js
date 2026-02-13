/**
 * Allowlist-based HTML sanitizer for dangerouslySetInnerHTML.
 * Strips all tags except a minimal set used in i18n locale strings.
 * Strips all attributes from allowed tags to prevent event-handler injection.
 */

const ALLOWED_TAGS = new Set(['strong', 'em', 'br', 'b', 'i'])

const TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g

export function sanitizeHTML(html) {
  if (typeof html !== 'string') return ''
  return html.replace(TAG_RE, (match, tagName) => {
    const tag = tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ''
    // Rebuild tag without attributes
    const isClosing = match[1] === '/'
    const isSelfClosing = tag === 'br'
    if (isClosing) return `</${tag}>`
    return isSelfClosing ? '<br />' : `<${tag}>`
  })
}
