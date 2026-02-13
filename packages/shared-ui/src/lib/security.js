/**
 * Security utilities for input sanitization and rate limiting.
 *
 * sanitizeText  — strips HTML tags, trims, enforces max length
 * sanitizeName  — letters, spaces, hyphens, apostrophes only; max 100 chars
 * sanitizePhone — digits, +, spaces, hyphens, parens only; max 20 chars
 * createRateLimiter — simple in-memory rate limiter for form submissions
 */

export function sanitizeText(str, maxLen = 1000) {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLen)
}

export function sanitizeName(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '').trim().slice(0, 100)
}

export function sanitizePhone(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/[^\d+\s\-()]/g, '').trim().slice(0, 20)
}

export function createRateLimiter(maxAttempts = 5, windowMs = 60000) {
  const attempts = []

  return {
    check() {
      const now = Date.now()
      // Remove expired entries
      while (attempts.length > 0 && attempts[0] <= now - windowMs) {
        attempts.shift()
      }
      if (attempts.length >= maxAttempts) return false
      attempts.push(now)
      return true
    },
    reset() {
      attempts.length = 0
    },
  }
}
