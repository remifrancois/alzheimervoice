/**
 * LAYER 3 — Cognitive Archaeology (~200K tokens)
 *
 * Instead of reducing each conversation to a 25-feature vector, we preserve
 * the COMPLETE conversational fabric — every word, hesitation, digression,
 * and memory mentioned. Over 3-6 months, this builds a living semantic map.
 *
 * Detects patterns invisible to session-by-session analysis:
 * - Shrinking topic clusters
 * - Disconnecting semantic networks
 * - Simplifying procedures
 * - Increasing repetition
 * - Dissolving temporal anchors
 */

import fs from 'fs/promises';
import path from 'path';
import { readSecureJSONSafe, writeSecureJSON } from '../lib/secure-fs.js';
import { loadPatientSessions } from '../models/session.js';

const DATA_DIR = path.resolve('data/archaeology');

/**
 * Build the complete conversational history for the 1M token context.
 * Returns all transcripts formatted as a chronological archive.
 */
export async function buildConversationArchive(patientId) {
  const sessions = await loadPatientSessions(patientId);

  if (sessions.length === 0) {
    return { context: '', sessionCount: 0, estimatedTokens: 0 };
  }

  const formattedSessions = sessions
    .filter(s => s.transcript && s.transcript.length > 0)
    .map((session, index) => {
      const transcriptText = session.transcript.map(turn =>
        `[${turn.role === 'assistant' ? 'MemoVoice' : 'Patient'}] ${turn.text}`
      ).join('\n');

      const confounders = session.confounders && Object.keys(session.confounders).length > 0
        ? `\nConfounders: ${Object.entries(session.confounders).filter(([, v]) => v).map(([k]) => k).join(', ')}`
        : '';

      return `<session number="${index + 1}" date="${session.timestamp}" duration="${session.duration_seconds || 'unknown'}s"${confounders}>
${transcriptText}
</session>`;
    });

  const context = `<conversation_archive patient_id="${patientId}" total_sessions="${formattedSessions.length}" span="${getTimeSpan(sessions)}">

## COMPLETE CONVERSATIONAL HISTORY
Every word, pause, hesitation, and topic from ${formattedSessions.length} sessions.
Use this to build a semantic map of the patient's cognitive landscape.

${formattedSessions.join('\n\n')}

</conversation_archive>`;

  return {
    context,
    sessionCount: formattedSessions.length,
    estimatedTokens: Math.ceil(context.length / 3.5)
  };
}

/**
 * Build the archaeology analysis prompt.
 * Instructs Opus to perform deep semantic mapping.
 */
export function buildArchaeologyPrompt(patientName, sessionCount, weekSpan) {
  return `<cognitive_archaeology_task>

You are a cognitive archaeologist. You have the complete conversational history of
${patientName} over ${sessionCount} sessions spanning ${weekSpan}.

PERFORM THE FOLLOWING ANALYSIS:

## 1. SEMANTIC CLUSTERS
Identify every topic cluster (family, work, hobbies, routines, places, food, etc.).
For each cluster, list:
- All sub-nodes (specific people, events, places, memories)
- Mention frequency per node
- Temporal trend (increasing/stable/decreasing mentions over time)

## 2. TEMPORAL EVOLUTION
For each cluster and sub-node, track:
- First mention date
- Last mention date
- Mention frequency trend
- Detail richness trend (elaboration level over time)
- Emotional engagement trend (enthusiasm, affect)

## 3. NETWORK CONNECTIONS
Map how topics connect to each other.
- Which memories bridge multiple clusters?
- Are bridges weakening or strengthening?
- Are there isolated nodes (mentioned once, never connected)?

## 4. PROCEDURAL INTEGRITY
For any described processes (recipes, routines, directions, daily habits):
- Track step count over repeated mentions
- Note any omissions or simplifications
- Flag if critical steps are being forgotten

## 5. REPETITION PATTERNS
Identify stories told more than twice:
- Are repetitions verbatim (concerning — fixed narrative loop)?
- Or elaborated with new details (healthy — active memory)?
- Track repetition frequency trend

## 6. TEMPORAL ANCHORING
Track the patient's ability to place events in time:
- Are dates becoming vague ("it was... sometime")?
- Is there drift toward temporal confusion?
- Is there migration toward distant past vs recent events?

## 7. LEXICAL EVOLUTION
Track vocabulary changes:
- Are specific nouns being replaced by generic terms ("the thing", "that place")?
- Are proper nouns being forgotten (names, places)?
- Is circumlocution increasing?

## 8. ANOMALY DETECTION
Flag any pattern that doesn't fit standard categories but seems clinically significant.

OUTPUT FORMAT (JSON):
{
  "semantic_clusters": [
    {
      "name": "cluster_name",
      "nodes": [
        {
          "label": "node_label",
          "mention_count": N,
          "first_mention": "date",
          "last_mention": "date",
          "trend": "stable|increasing|decreasing",
          "detail_trend": "stable|enriching|simplifying",
          "flags": []
        }
      ],
      "cluster_health": "healthy|weakening|fragmenting",
      "connections_to": ["other_cluster_names"]
    }
  ],
  "procedural_checks": [
    {
      "procedure": "description",
      "mentions": N,
      "initial_steps": N,
      "current_steps": N,
      "omissions": ["list of omitted steps"],
      "status": "intact|simplifying|degrading"
    }
  ],
  "repetition_patterns": [
    {
      "story": "brief description",
      "times_told": N,
      "type": "verbatim|elaborated|confused",
      "concern_level": "none|low|moderate|high"
    }
  ],
  "temporal_anchoring": {
    "precision_trend": "stable|declining",
    "past_vs_recent_ratio": N,
    "temporal_vagueness_instances": N,
    "flags": []
  },
  "lexical_evolution": {
    "generic_substitutions": N,
    "proper_noun_failures": N,
    "circumlocution_instances": N,
    "trend": "stable|increasing"
  },
  "network_health": {
    "total_clusters": N,
    "active_clusters": N,
    "weakening_bridges": N,
    "isolated_nodes": N,
    "overall": "healthy|early_fragmentation|moderate_fragmentation|severe_fragmentation"
  },
  "anomalies": [],
  "clinical_summary": "2-3 sentence clinical interpretation"
}
</cognitive_archaeology_task>`;
}

/**
 * Save a semantic map analysis result.
 */
export async function saveSemanticMap(patientId, semanticMap) {
  const filePath = path.join(DATA_DIR, `semantic_map_${patientId}.json`);
  await writeSecureJSON(filePath, {
    patient_id: patientId,
    generated_at: new Date().toISOString(),
    ...semanticMap
  });
  return semanticMap;
}

/**
 * Load a previously generated semantic map.
 */
export async function loadSemanticMap(patientId) {
  const filePath = path.join(DATA_DIR, `semantic_map_${patientId}.json`);
  return await readSecureJSONSafe(filePath, null);
}

// Helper: compute time span between first and last session
function getTimeSpan(sessions) {
  if (sessions.length < 2) return '1 session';
  const first = new Date(sessions[0].timestamp);
  const last = new Date(sessions[sessions.length - 1].timestamp);
  const days = Math.round((last - first) / (1000 * 60 * 60 * 24));
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}
