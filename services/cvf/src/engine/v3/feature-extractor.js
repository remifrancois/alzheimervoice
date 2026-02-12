/**
 * V3 FEATURE EXTRACTOR
 *
 * Extracts 47 indicators from a conversation transcript using Claude.
 * This is the ONLY LLM call in V3 — everything else is computed.
 *
 * Cost: ~$0.08 per session (Sonnet for extraction, not Opus)
 * vs V2: ~$3.00/week for 900K token inference
 *
 * The extraction prompt is compiled from the evidence matrix —
 * Claude is given exact definitions and extraction rules, not
 * asked to reason about the science.
 */

import Anthropic from '@anthropic-ai/sdk';
import { INDICATORS, ALL_INDICATOR_IDS, DOMAINS } from './indicators.js';

const client = new Anthropic();

/**
 * Build the extraction prompt from indicator definitions.
 * This prompt is static and can be cached.
 */
function buildExtractionPrompt(language) {
  const indicatorDefs = ALL_INDICATOR_IDS
    .filter(id => INDICATORS[id].extractable !== 'audio') // Skip audio-only
    .map(id => {
      const ind = INDICATORS[id];
      return `- **${id}** (${ind.name}): ${ind.formula || 'see description'}. Score 0.0-1.0 (0.5=average, higher=better performance, lower=decline).`;
    })
    .join('\n');

  return `You are a clinical neuro-linguistic feature extractor for the MemoVoice CVF V3 system.

TASK: Extract ${ALL_INDICATOR_IDS.length} indicators from the conversation transcript below.

LANGUAGE: ${language === 'fr' ? 'French' : 'English'}

INDICATORS TO EXTRACT:
${indicatorDefs}

RULES:
1. Score each indicator as a value between 0.0 and 1.0
2. 0.5 = average/neutral for the general population
3. Higher = better performance (richer vocabulary, better coherence, etc.)
4. Lower = worse performance (simpler words, poor coherence, etc.)
5. For memory indicators (MEM_*): only score if a memory prompt was present in conversation. Use null if not tested.
6. For affective indicators (AFF_*): extract from the patient's language patterns.
7. For temporal indicators (TMP_*): estimate from transcript markers ("...", "[pause]", "[long pause]", response timing cues).
8. For discourse indicators (DIS_*): analyze across the full conversation, not per-utterance.
9. ${language === 'fr' ? 'French fillers: "euh", "ben", "voilà", "quoi", "tu vois", "en fait"' : 'English fillers: "um", "uh", "like", "you know"'} are baseline markers, not automatically pathological.

OUTPUT: Return ONLY valid JSON with indicator IDs as keys, values as numbers (0.0-1.0) or null. No other text.`;
}

/**
 * Extract V3 feature vector from a conversation transcript.
 *
 * @param {Array} transcript — [{role: 'patient'|'assistant', text: string}]
 * @param {Object} options — { language, model }
 * @returns {Object} — { [indicator_id]: number|null }
 */
export async function extractFeatures(transcript, { language = 'fr', model = 'claude-sonnet-4-5-20250929' } = {}) {
  const transcriptText = transcript.map(turn =>
    `[${turn.role === 'assistant' ? 'MemoVoice' : 'Patient'}] ${turn.text}`
  ).join('\n');

  const systemPrompt = buildExtractionPrompt(language);

  const response = await client.messages.create({
    model,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Extract all indicators from this transcript:\n\n${transcriptText}`
    }]
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('V3 feature extraction: failed to parse JSON response');
  }

  const extracted = JSON.parse(jsonMatch[0]);

  // Validate and fill missing indicators
  const vector = {};
  for (const id of ALL_INDICATOR_IDS) {
    if (INDICATORS[id].extractable === 'audio') {
      vector[id] = null; // Audio features not extractable from text
      continue;
    }
    const value = extracted[id];
    if (value === null || value === undefined) {
      vector[id] = null;
    } else {
      vector[id] = Math.max(0, Math.min(1, Number(value) || 0.5));
    }
  }

  return vector;
}

/**
 * Lightweight extraction using only the top 15 early-detection indicators.
 * Even cheaper: ~$0.03 per session.
 */
export async function extractEarlyDetection(transcript, { language = 'fr' } = {}) {
  const earlyIds = [
    'LEX_TTR', 'LEX_CONTENT_DENSITY', 'LEX_WORD_FREQ', 'LEX_PRONOUN_NOUN',
    'SYN_MLU',
    'SEM_IDEA_DENSITY', 'SEM_REF_COHERENCE', 'SEM_INFO_UNITS',
    'TMP_LPR', 'TMP_RESPONSE_LATENCY', 'TMP_SPEECH_RATE',
    'MEM_FREE_RECALL', 'MEM_CUED_RECALL',
    'AFF_SELF_PRONOUN', 'AFF_NEG_VALENCE'
  ];

  const defs = earlyIds.map(id => {
    const ind = INDICATORS[id];
    return `- **${id}** (${ind.name}): Score 0.0-1.0`;
  }).join('\n');

  const transcriptText = transcript.map(turn =>
    `[${turn.role === 'assistant' ? 'MemoVoice' : 'Patient'}] ${turn.text}`
  ).join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1000,
    system: `Extract these 15 early-detection indicators (0.0-1.0, 0.5=average, higher=better). Language: ${language}. Return ONLY JSON.\n${defs}`,
    messages: [{ role: 'user', content: transcriptText }]
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('V3 early detection extraction failed');

  return JSON.parse(jsonMatch[0]);
}
