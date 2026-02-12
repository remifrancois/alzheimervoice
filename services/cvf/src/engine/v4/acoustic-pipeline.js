/**
 * V4 ACOUSTIC PIPELINE
 *
 * Node.js bridge to the Python audio extraction script (extract_features.py).
 * Handles audio format conversion via ffmpeg, Python invocation, and
 * normalization of raw acoustic values to the 0.0-1.0 indicator scale
 * using sigmoid mapping against population norms.
 *
 * Graceful degradation: if Python or ffmpeg are unavailable, all audio
 * indicators return null rather than throwing.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { AUDIO_INDICATORS, ACOUSTIC_NORMS, INDICATORS } from './indicators.js';

const execFileAsync = promisify(execFile);

const PYTHON_SCRIPT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../audio/extract_features.py'
);

// Map Python output feature keys -> indicator IDs
const PYTHON_KEY_TO_INDICATOR = {
  f0_mean:               'ACU_F0_MEAN',
  f0_sd:                 'ACU_F0_SD',
  f0_range:              'ACU_F0_RANGE',
  jitter_local:          'ACU_JITTER',
  shimmer_local:         'ACU_SHIMMER',
  hnr:                   'ACU_HNR',
  mfcc2_mean:            'ACU_MFCC2',
  cpp:                   'ACU_CPP',
  spectral_harmonicity:  'ACU_SPECTRAL_HARM',
  energy_range:          'ACU_ENERGY_RANGE',
  f1f2_ratio:            'ACU_F1F2_RATIO',
  ppe:                   'PDM_PPE',
  rpde:                  'PDM_RPDE',
  dfa:                   'PDM_DFA',
  d2:                    'PDM_D2',
  ddk_rate:              'PDM_DDK_RATE',
  ddk_regularity_cv:     'PDM_DDK_REG',
  vot:                   'PDM_VOT',
  monopitch:             'PDM_MONOPITCH',
  articulation_rate:     'TMP_ARTIC_RATE',
};

// Features where HIGHER raw value = WORSE cognitive/motor health.
// These use inverted sigmoid: score = 0.5 - 0.5 * tanh(...)
const HIGHER_IS_WORSE = new Set([
  'ACU_JITTER',
  'ACU_SHIMMER',
  'ACU_F1F2_RATIO',
  'PDM_PPE',
  'PDM_RPDE',
  'PDM_DFA',
  'PDM_D2',
  'PDM_VOT',
]);

/**
 * Build a null vector — all AUDIO_INDICATORS set to null.
 * Used for graceful degradation when Python/ffmpeg fails.
 */
function buildNullVector() {
  const vector = {};
  for (const id of AUDIO_INDICATORS) {
    vector[id] = null;
  }
  return vector;
}

/**
 * Generate a unique temp file path within os.tmpdir().
 */
function tempPath(extension) {
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return path.join(os.tmpdir(), `memovoice-${stamp}.${extension}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// convertToWav
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert an audio buffer to 16kHz mono WAV using ffmpeg.
 *
 * @param {Buffer} inputBuffer — Raw audio bytes in any ffmpeg-supported format.
 * @param {string} inputFormat — File extension hint (e.g. 'mp3', 'ogg', 'webm').
 * @returns {Promise<string>} — Path to the converted WAV temp file.
 */
export async function convertToWav(inputBuffer, inputFormat = 'wav') {
  const inputPath = tempPath(inputFormat);
  const outputPath = tempPath('wav');

  await fs.writeFile(inputPath, inputBuffer);

  try {
    await execFileAsync('ffmpeg', [
      '-y',
      '-i', inputPath,
      '-ar', '16000',
      '-ac', '1',
      '-sample_fmt', 's16',
      '-f', 'wav',
      outputPath,
    ], { timeout: 30_000 });

    return outputPath;
  } finally {
    // Always clean up the input temp file; output is caller's responsibility
    await cleanup([inputPath]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// normalizeAcousticValue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize a raw acoustic value to the 0.0-1.0 indicator scale using
 * a sigmoid (tanh) curve centered on population norms.
 *
 * For features where decline = lower raw value (HNR, CPP, F0_SD, etc.):
 *   score = 0.5 + 0.5 * tanh((raw - mean) / (2 * std))
 *   Higher raw -> higher score (healthier).
 *
 * For features where decline = higher raw value (jitter, shimmer, PPE, etc.):
 *   score = 0.5 - 0.5 * tanh((raw - mean) / (2 * std))
 *   Higher raw -> lower score (worse health).
 *
 * Gender-specific norms are used when available (F0 features).
 *
 * @param {string} featureId — Indicator ID (e.g. 'ACU_HNR').
 * @param {number} rawValue — Raw measurement from Python.
 * @param {string} gender — 'male', 'female', or 'unknown'.
 * @returns {number|null} — Normalized score in [0.0, 1.0], or null if norms are missing.
 */
export function normalizeAcousticValue(featureId, rawValue, gender = 'unknown') {
  if (rawValue === null || rawValue === undefined || !Number.isFinite(rawValue)) {
    return null;
  }

  const norms = ACOUSTIC_NORMS[featureId];
  if (!norms) {
    return null;
  }

  // Resolve gender-specific vs flat norms
  let mean, std;
  if (norms.male && norms.female) {
    // Gender-specific norms available
    const genderKey = (gender === 'male' || gender === 'female') ? gender : 'female';
    mean = norms[genderKey].mean;
    std = norms[genderKey].std;
  } else {
    mean = norms.mean;
    std = norms.std;
  }

  if (!std || std === 0) {
    return 0.5;
  }

  const z = (rawValue - mean) / (2 * std);

  if (HIGHER_IS_WORSE.has(featureId)) {
    // Higher raw = worse: invert the sigmoid
    return 0.5 - 0.5 * Math.tanh(z);
  } else {
    // Higher raw = better (or neutral): standard sigmoid
    return 0.5 + 0.5 * Math.tanh(z);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// extractAcousticFeatures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main entry point: extract and normalize acoustic features from an audio buffer.
 *
 * @param {Buffer} audioBuffer — Audio data.
 * @param {Object} options
 * @param {string} options.format — Input format (default 'wav').
 * @param {string} options.taskType — Python task type (default 'conversation').
 * @param {string} options.gender — Speaker gender (default 'unknown').
 * @returns {Promise<Object>} — { [indicatorId]: number|null } for all AUDIO_INDICATORS.
 */
export async function extractAcousticFeatures(audioBuffer, {
  format = 'wav',
  taskType = 'conversation',
  gender = 'unknown',
} = {}) {
  const tempFiles = [];

  try {
    // Convert to 16kHz mono WAV if not already WAV
    let wavPath;
    if (format === 'wav') {
      wavPath = tempPath('wav');
      await fs.writeFile(wavPath, audioBuffer);
      tempFiles.push(wavPath);
    } else {
      wavPath = await convertToWav(audioBuffer, format);
      tempFiles.push(wavPath);
    }

    // Invoke Python extraction script
    const { stdout } = await execFileAsync('python3', [
      PYTHON_SCRIPT,
      '--audio-path', wavPath,
      '--task-type', taskType,
      '--gender', gender === 'unknown' ? 'female' : gender,
    ], { timeout: 60_000 });

    // Parse Python output
    const result = JSON.parse(stdout.trim());

    if (result.status !== 'ok' || !result.features) {
      console.warn(
        `[acoustic-pipeline] Python returned non-ok status: ${result.status}`,
        result.error || ''
      );
      return buildNullVector();
    }

    // Map raw Python features to indicator IDs and normalize
    const rawFeatures = result.features;
    const vector = {};

    // Compute derived features not directly in Python output
    if (rawFeatures.f1_mean != null && rawFeatures.f2_mean != null && rawFeatures.f2_mean > 0) {
      rawFeatures.f1f2_ratio = rawFeatures.f1_mean / rawFeatures.f2_mean;
    }
    if (rawFeatures.f0_sd != null && rawFeatures.f0_mean != null && rawFeatures.f0_mean > 0) {
      rawFeatures.monopitch = rawFeatures.f0_sd / rawFeatures.f0_mean;
    }

    // Convert DDK regularity CV to regularity score (1 - CV)
    if (rawFeatures.ddk_regularity_cv != null) {
      rawFeatures.ddk_regularity_cv = 1.0 - rawFeatures.ddk_regularity_cv;
    }

    for (const id of AUDIO_INDICATORS) {
      // Find the Python key that maps to this indicator
      const pythonKey = Object.entries(PYTHON_KEY_TO_INDICATOR)
        .find(([, indId]) => indId === id)?.[0];

      if (!pythonKey || rawFeatures[pythonKey] == null) {
        vector[id] = null;
        continue;
      }

      vector[id] = normalizeAcousticValue(id, rawFeatures[pythonKey], gender);
    }

    return vector;

  } catch (err) {
    // Graceful degradation: Python not available, ffmpeg missing, etc.
    console.warn(
      `[acoustic-pipeline] Feature extraction failed, returning null vector:`,
      err.message || err
    );
    return buildNullVector();
  } finally {
    await cleanup(tempFiles);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// extractMicroTaskAudio
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract acoustic features for a specific micro-task (sustained vowel, DDK, fluency).
 * Routes to the Python script with the appropriate task type.
 *
 * @param {Buffer} audioBuffer — Audio data for the micro-task recording.
 * @param {string} taskType — 'sustained_vowel' | 'ddk' | 'fluency'.
 * @param {Object} options
 * @param {string} options.format — Input format (default 'wav').
 * @param {string} options.gender — Speaker gender (default 'unknown').
 * @returns {Promise<Object>} — { [indicatorId]: number|null } for all AUDIO_INDICATORS.
 */
export async function extractMicroTaskAudio(audioBuffer, taskType, {
  format = 'wav',
  gender = 'unknown',
} = {}) {
  return extractAcousticFeatures(audioBuffer, {
    format,
    taskType,
    gender,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// cleanup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Remove temp files, ignoring errors for files that may already be deleted.
 *
 * @param {string[]} tempFiles — Array of absolute paths to remove.
 */
export async function cleanup(tempFiles) {
  await Promise.allSettled(
    tempFiles.map(f => fs.unlink(f).catch(() => {}))
  );
}
