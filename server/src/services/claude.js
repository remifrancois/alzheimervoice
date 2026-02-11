import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const client = new Anthropic();

// Load the scientific research knowledge base for context
let researchContext = null;
async function getResearchContext() {
  if (researchContext) return researchContext;
  try {
    researchContext = await fs.readFile(path.join(PROJECT_ROOT, 'docs', 'RESEARCH.md'), 'utf-8');
  } catch {
    researchContext = '';
  }
  return researchContext;
}

// Load the CVF skill document
let skillContext = null;
async function getSkillContext() {
  if (skillContext) return skillContext;
  try {
    skillContext = await fs.readFile(path.join(PROJECT_ROOT, 'claude', 'SKILL-cognitive-voice-fingerprint.md'), 'utf-8');
  } catch {
    skillContext = '';
  }
  return skillContext;
}

/**
 * Extract 25-dimension CVF feature vector from a conversation transcript.
 * Uses Claude Opus 4.6 with full scientific context.
 */
export async function extractFeatures(transcript, { language, patientProfile, baselineInfo }) {
  const research = await getResearchContext();
  const skill = await getSkillContext();

  const transcriptText = transcript.map(turn =>
    `[${turn.role === 'assistant' ? 'MemoVoice' : 'Patient'}] ${turn.text}`
  ).join('\n');

  const systemPrompt = `You are a clinical neuro-linguistic analyst implementing the MemoVoice Cognitive Voice Fingerprint (CVF) system.

Your task is to extract 25 linguistic biomarkers from a conversation transcript between MemoVoice (AI companion) and an elderly patient.

SCIENTIFIC FOUNDATION:
${research}

CVF FEATURE DEFINITIONS:
${skill}

PATIENT CONTEXT:
Language: ${language}
${patientProfile ? `Profile: ${JSON.stringify(patientProfile)}` : 'No profile yet (calibration phase)'}
${baselineInfo ? `Baseline established: Yes. Reference values available.` : 'Baseline: CALIBRATION IN PROGRESS — extract raw values, not deltas.'}

IMPORTANT EXTRACTION RULES:
1. Score each feature as a raw value between 0.0 and 1.0
2. 0.5 represents a neutral/average value for the general population
3. Higher values = better performance for that feature
4. Lower values = worse performance
5. Be precise — use the exact formulas defined in the research (TTR, Brunet's W, Honore's R, etc.)
6. For features requiring timestamps (F1, F5), estimate from transcript markers like "..." or "[pause]"
7. For memory features (M1-M5), only score if a memory probe was attempted in the conversation. Use null if not tested.
8. Language-specific rules: Apply ${language === 'fr' ? 'French' : 'English'} extraction rules as defined in the skill document.

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure, no other text:
{
  "L1_ttr": <number 0-1>,
  "L2_brunet": <number 0-1>,
  "L3_honore": <number 0-1>,
  "L4_content_density": <number 0-1>,
  "L5_word_frequency": <number 0-1>,
  "S1_mlu": <number 0-1>,
  "S2_subordination": <number 0-1>,
  "S3_completeness": <number 0-1>,
  "S4_passive_ratio": <number 0-1>,
  "S5_embedding_depth": <number 0-1>,
  "C1_idea_density": <number 0-1>,
  "C2_topic_maintenance": <number 0-1>,
  "C3_referential_coherence": <number 0-1>,
  "C4_temporal_sequencing": <number 0-1>,
  "C5_information_units": <number 0-1>,
  "F1_long_pause_ratio": <number 0-1>,
  "F2_filler_rate": <number 0-1>,
  "F3_false_starts": <number 0-1>,
  "F4_repetition_rate": <number 0-1>,
  "F5_response_latency": <number 0-1>,
  "M1_free_recall": <number 0-1 or null>,
  "M2_cued_recall": <number 0-1 or null>,
  "M3_recognition": <number 0-1 or null>,
  "M4_temporal_precision": <number 0-1 or null>,
  "M5_emotional_engagement": <number 0-1 or null>,
  "extraction_notes": "<brief clinical observations about this session>"
}`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Extract the 25-dimension CVF feature vector from this transcript:\n\n${transcriptText}`
    }]
  });

  const text = response.content[0].text.trim();

  // Parse JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse feature vector from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Perform weekly deep analysis using Extended Thinking.
 * Analyzes 7 session vectors against baseline and produces clinical narrative.
 */
export async function weeklyAnalysis({ patient, baseline, sessionVectors, confounders, previousAnalysis, memoryProfile }) {
  const research = await getResearchContext();

  const systemPrompt = `You are performing a weekly deep neuro-linguistic analysis for the MemoVoice CVF system.

SCIENTIFIC FOUNDATION:
${research}

You must produce a comprehensive clinical analysis. Use extended thinking to reason deeply about the data.`;

  const userPrompt = `Perform deep neuro-linguistic analysis for this patient.

PATIENT: ${patient.first_name}, language: ${patient.language}
BASELINE ESTABLISHED: ${baseline.created_at}, over ${baseline.sessions_used} sessions
CURRENT ALERT LEVEL: ${patient.alert_level}

LAST 7 SESSION VECTORS:
${JSON.stringify(sessionVectors, null, 2)}

BASELINE REFERENCE:
${JSON.stringify(baseline.baseline_vector, null, 2)}

CONFOUNDER LOG THIS WEEK:
${JSON.stringify(confounders, null, 2)}

FAMILY MEMORY PROFILE:
${JSON.stringify(memoryProfile?.memories?.slice(0, 10) || [], null, 2)}

PREVIOUS WEEKLY ANALYSIS:
${previousAnalysis ? JSON.stringify(previousAnalysis, null, 2) : 'None (first weekly analysis)'}

TASK:
1. Compute the 25-feature delta from baseline for each session
2. Identify which domains show consistent drift vs noise
3. Cross-correlate domains (lexical decline + coherence decline = semantic memory issue)
4. Compare to known AD progression cascade (semantic → syntactic → discourse → pragmatic)
5. Account for confounders with weighted adjustment
6. Produce weekly composite score with confidence interval
7. Generate clinical narrative for family (plain language, warm, 3-5 sentences)
8. Generate clinical narrative for medical professional (clinical terminology, domain scores)
9. Determine alert level with justification
10. Suggest conversation adaptations for next week

Return ONLY valid JSON:
{
  "week_number": <number>,
  "composite_score": <number>,
  "confidence": <number 0-1>,
  "alert_level": "green|yellow|orange|red",
  "domain_scores": { "lexical": <z>, "syntactic": <z>, "coherence": <z>, "fluency": <z>, "memory": <z> },
  "clinical_narrative_family": "<warm, plain language, 3-5 sentences in patient's language>",
  "clinical_narrative_medical": "<clinical terminology, domain scores, trends>",
  "conversation_adaptations": ["<suggestion 1>", "<suggestion 2>"],
  "next_week_focus": "<what to monitor>",
  "flags": ["<any specific concerns>"]
}`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 16000,
    temperature: 1,  // Required for extended thinking
    thinking: {
      type: 'enabled',
      budget_tokens: 10000
    },
    messages: [{
      role: 'user',
      content: `${systemPrompt}\n\n${userPrompt}`
    }]
  });

  // Extract text from response (skip thinking blocks)
  const textBlock = response.content.find(b => b.type === 'text');
  const text = textBlock?.text?.trim() || '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse weekly analysis from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate a simulated conversation transcript.
 * Used for testing and demo purposes.
 */
export async function generateConversation({ patient, memoryProfile, sessionNumber, declineLevel, language }) {
  const memoryToProbe = memoryProfile?.memories?.[0] || null;

  const systemPrompt = `You are simulating a 5-minute phone conversation between MemoVoice (warm AI companion) and ${patient.first_name}, a ${language === 'fr' ? 'French' : 'English'}-speaking elderly patient.

SESSION NUMBER: ${sessionNumber}
DECLINE LEVEL: ${declineLevel} (0.0 = perfectly healthy baseline, 1.0 = severe cognitive decline)

${memoryToProbe ? `MEMORY TO PROBE: "${memoryToProbe.content}" (Category: ${memoryToProbe.category})` : 'No specific memory to probe.'}

CONVERSATION RULES:
- MemoVoice speaks in short, warm sentences in ${language === 'fr' ? 'French' : 'English'}
- Follow the 5-minute flow: warm-up → free narrative → memory probe → structured topic → warm close
- The patient's speech should REALISTICALLY reflect the decline level:
  - At 0.0: Rich vocabulary, complex sentences, clear memories, fluent speech
  - At 0.3: Slightly simpler sentences, occasional word-finding pauses ("..."), mostly coherent
  - At 0.6: Notably simpler language, more fillers ("euh", "comment dire"), topic drift, imprecise memories
  - At 0.9: Very simple sentences, frequent repetition, confused temporal references, vague pronouns

IMPORTANT: Make the conversation feel NATURAL. The patient should sound like a real person, not a medical case study.
Include speech markers: "..." for pauses, [pause] for long pauses, fillers like "euh" or "um".

Return the conversation as a JSON array of turns:
[
  { "role": "assistant", "text": "MemoVoice's line" },
  { "role": "patient", "text": "Patient's response with realistic speech patterns" }
]`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Generate the conversation transcript for session ${sessionNumber}. Decline level: ${declineLevel}. Language: ${language}.`
    }]
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse conversation from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}
