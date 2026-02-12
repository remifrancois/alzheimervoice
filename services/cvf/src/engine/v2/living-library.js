/**
 * LAYER 1 — Living Library (~300K tokens)
 *
 * Loads complete scientific research papers into the 1M token context window.
 * Uses Anthropic prompt caching for 90% cost reduction on subsequent calls.
 *
 * Instead of summarizing literature into a 4K token prompt, we load FULL papers
 * so Opus can reason like a trained neuropsychologist with complete knowledge.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const RESEARCH_DIR = path.join(PROJECT_ROOT, 'docs', 'research');

// Research paper sources — loaded in priority order
const LIBRARY_SOURCES = [
  { file: 'fraser-2015-features.md',    label: 'Fraser et al. 2015 — 370 Linguistic Features for AD Detection', tokens: 15000 },
  { file: 'adress-2020-challenge.md',    label: 'Luz et al. 2020 — ADReSS Challenge Methodology', tokens: 10000 },
  { file: 'adresso-2021-challenge.md',   label: 'Luz et al. 2021 — ADReSSo Spontaneous Speech', tokens: 12000 },
  { file: 'robin-2023-composite.md',     label: 'Robin et al. 2023 — Composite 9-Variable Score', tokens: 8000 },
  { file: 'eyigoz-framingham.md',        label: 'Eyigoz et al. — Framingham Heart Study Speech Analysis', tokens: 8000 },
  { file: 'snowdon-nun-study.md',        label: 'Snowdon — Nun Study Idea Density', tokens: 6000 },
  { file: 'shakeri-2025-review.md',      label: 'Shakeri et al. 2025 — NLP in AD Research Review', tokens: 12000 },
  { file: 'dsm5-neurocognitive.md',      label: 'DSM-5 Neurocognitive Disorder Criteria', tokens: 5000 },
  { file: 'ad-cascade-progression.md',   label: 'AD Linguistic Cascade — Semantic to Pragmatic', tokens: 8000 },
  { file: 'confounder-science.md',       label: 'Confounders — Sleep, Illness, Medication, Emotion', tokens: 6000 },
];

// Cache the assembled library context in memory
let libraryCache = null;
let libraryCacheTime = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Build the complete Living Library context from research papers.
 * Returns structured XML-tagged content ready for the 1M context window.
 */
export async function buildLivingLibraryContext() {
  // Return cached version if recent
  if (libraryCache && libraryCacheTime && (Date.now() - libraryCacheTime < CACHE_TTL_MS)) {
    return libraryCache;
  }

  const sections = [];
  let totalTokensEstimate = 0;

  // Load the main RESEARCH.md as foundation
  try {
    const mainResearch = await fs.readFile(path.join(PROJECT_ROOT, 'docs', 'RESEARCH.md'), 'utf-8');
    sections.push(`<research_foundation source="RESEARCH.md" role="core_knowledge_base">
${mainResearch}
</research_foundation>`);
    totalTokensEstimate += estimateTokens(mainResearch);
  } catch {
    // RESEARCH.md not found, continue with individual papers
  }

  // Load individual research papers
  await fs.mkdir(RESEARCH_DIR, { recursive: true });

  for (const source of LIBRARY_SOURCES) {
    try {
      const content = await fs.readFile(path.join(RESEARCH_DIR, source.file), 'utf-8');
      sections.push(`<research_paper source="${source.file}" title="${source.label}" estimated_tokens="${source.tokens}">
${content}
</research_paper>`);
      totalTokensEstimate += estimateTokens(content);
    } catch {
      // Paper not available, create a synthesis placeholder
      sections.push(`<research_paper source="${source.file}" title="${source.label}" status="synthesis_pending">
[Paper not yet loaded — use synthesis from core knowledge base]
</research_paper>`);
    }
  }

  // Load the CVF skill document
  try {
    const skill = await fs.readFile(path.join(PROJECT_ROOT, 'claude', 'SKILL-cognitive-voice-fingerprint.md'), 'utf-8');
    sections.push(`<cvf_skill_definition source="SKILL-cognitive-voice-fingerprint.md">
${skill}
</cvf_skill_definition>`);
    totalTokensEstimate += estimateTokens(skill);
  } catch {
    // Skill doc not found
  }

  const assembledLibrary = `<living_library total_estimated_tokens="${totalTokensEstimate}" papers_loaded="${sections.length}">

## ROLE
You are a clinical neuropsychologist with access to the complete scientific literature on speech-based cognitive assessment. The research papers below are your training — you have read and internalized every finding, every methodology, every clinical insight.

## HOW TO USE THIS KNOWLEDGE
- Reference specific studies when making clinical judgments
- Use the exact feature definitions from Fraser et al. 2015
- Apply the diagnostic accuracy benchmarks from ADReSS/ADReSSo
- Follow the AD progression cascade documented in the literature
- Apply confounder science rigorously

${sections.join('\n\n')}

</living_library>`;

  libraryCache = assembledLibrary;
  libraryCacheTime = Date.now();

  return assembledLibrary;
}

/**
 * Get a lightweight summary of loaded library status.
 */
export async function getLibraryStatus() {
  const status = { papers: [], totalEstimatedTokens: 0, papersLoaded: 0, papersMissing: 0 };

  for (const source of LIBRARY_SOURCES) {
    try {
      await fs.access(path.join(RESEARCH_DIR, source.file));
      status.papers.push({ ...source, loaded: true });
      status.papersLoaded++;
      status.totalEstimatedTokens += source.tokens;
    } catch {
      status.papers.push({ ...source, loaded: false });
      status.papersMissing++;
    }
  }

  return status;
}

/**
 * Build Anthropic prompt caching structure.
 * The Living Library is a perfect cache candidate — static content, reused across patients.
 */
export function buildCacheableMessages(libraryContext, patientContext) {
  return [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: libraryContext,
          cache_control: { type: 'ephemeral' }  // Cache this block
        },
        {
          type: 'text',
          text: patientContext  // Dynamic per-patient content (not cached)
        }
      ]
    }
  ];
}

/**
 * Rough token estimation (1 token ~ 4 chars for English, ~3 for mixed).
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 3.5);
}

export { LIBRARY_SOURCES, RESEARCH_DIR };
