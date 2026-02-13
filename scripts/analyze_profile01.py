#!/usr/bin/env python3
"""
Profile01 Voice Analysis — Full acoustic extraction + transcription pipeline.

Processes 10 WebM voice recordings through:
1. ffmpeg conversion (WebM → 16kHz mono WAV)
2. Whisper transcription (medium model)
3. Acoustic feature extraction (parselmouth + librosa + nolds)

Outputs JSON with per-session transcripts and acoustic features.
"""

import os, sys, json, subprocess, tempfile, math, warnings
import numpy as np
warnings.filterwarnings("ignore")

RECORDS_DIR = "/Users/code/azh/records/profile01"
OUTPUT_PATH = "/Users/code/azh/scripts/profile01_extracted.json"
PYTHON_EXTRACT = "/Users/code/azh/services/cvf/src/audio/extract_features.py"

# ─────────────────────────────────────────────────
# Step 1: Convert WebM to WAV
# ─────────────────────────────────────────────────
def convert_to_wav(webm_path, wav_path):
    """Convert WebM to 16kHz mono WAV via ffmpeg."""
    result = subprocess.run(
        ["ffmpeg", "-y", "-i", webm_path, "-ar", "16000", "-ac", "1",
         "-sample_fmt", "s16", "-f", "wav", wav_path],
        capture_output=True, timeout=60
    )
    return result.returncode == 0

# ─────────────────────────────────────────────────
# Step 2: Transcribe with Whisper
# ─────────────────────────────────────────────────
def transcribe(wav_path, model):
    """Transcribe WAV using Whisper. Returns { text, language, segments }."""
    result = model.transcribe(wav_path, language=None, verbose=False)
    return {
        "text": result["text"].strip(),
        "language": result["language"],
        "segments": [
            {"start": s["start"], "end": s["end"], "text": s["text"].strip()}
            for s in result["segments"]
        ]
    }

# ─────────────────────────────────────────────────
# Step 3: Acoustic feature extraction (inline)
# Uses the same logic as extract_features.py
# ─────────────────────────────────────────────────
def extract_acoustic_features(wav_path, gender="male"):
    """Extract full acoustic feature set from WAV file."""
    import parselmouth
    from parselmouth.praat import call
    import librosa
    import nolds

    features = {}

    try:
        y, sr = librosa.load(wav_path, sr=16000, mono=True)
        sound = parselmouth.Sound(wav_path)
        duration = len(y) / sr
        features["duration_s"] = round(duration, 2)
    except Exception as e:
        return {"error": str(e), "duration_s": 0}

    # Skip very short files
    if duration < 1.0:
        return {"error": "too_short", "duration_s": round(duration, 2)}

    # ─── F0 (Fundamental Frequency) ───
    try:
        pitch = call(sound, "To Pitch", 0.0, 75, 500)
        f0 = pitch.selected_array["frequency"]
        f0v = f0[f0 > 0]
        if len(f0v) > 0:
            features["f0_mean"] = round(float(np.mean(f0v)), 2)
            features["f0_sd"] = round(float(np.std(f0v)), 2)
            features["f0_range"] = round(float(np.max(f0v) - np.min(f0v)), 2)
        else:
            features["f0_mean"] = features["f0_sd"] = features["f0_range"] = None
    except:
        features["f0_mean"] = features["f0_sd"] = features["f0_range"] = None

    # ─── Jitter ───
    try:
        pp = call(sound, "To PointProcess (periodic, cc)", 75, 500)
        features["jitter_local"] = round(float(
            call(pp, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)), 6)
    except:
        features["jitter_local"] = None

    # ─── Shimmer ───
    try:
        pp = call(sound, "To PointProcess (periodic, cc)", 75, 500)
        features["shimmer_local"] = round(float(
            call([sound, pp], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)), 6)
    except:
        features["shimmer_local"] = None

    # ─── HNR ───
    try:
        harm = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
        features["hnr"] = round(float(call(harm, "Get mean", 0, 0)), 2)
    except:
        features["hnr"] = None

    # ─── MFCC-2 ───
    try:
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        features["mfcc2_mean"] = round(float(np.mean(mfccs[1])), 2)
    except:
        features["mfcc2_mean"] = None

    # ─── CPP (Cepstral Peak Prominence) ───
    try:
        from scipy.signal import get_window
        frame_len = int(0.04 * sr)
        hop = int(0.01 * sr)
        cpp_vals = []
        for start in range(0, len(y) - frame_len, hop):
            w = y[start:start + frame_len] * get_window("hann", frame_len)
            power = np.maximum(np.abs(np.fft.rfft(w)) ** 2, 1e-12)
            cep = np.fft.irfft(10 * np.log10(power))
            lo, hi = int(sr / 500), min(int(sr / 75), len(cep) - 1)
            if lo >= hi:
                continue
            region = cep[lo:hi]
            if len(region) == 0:
                continue
            x = np.arange(lo, lo + len(region))
            reg = np.polyval(np.polyfit(x, region, 1), x)
            peak = np.argmax(region)
            cpp_vals.append(region[peak] - reg[peak])
        features["cpp"] = round(float(np.mean(cpp_vals)), 4) if cpp_vals else None
    except:
        features["cpp"] = None

    # ─── Formants (F1, F2) ───
    try:
        formant = call(sound, "To Formant (burg)", 0.0, 5, 5500, 0.025, 50)
        n = call(formant, "Get number of frames")
        f1s, f2s = [], []
        for i in range(1, n + 1):
            t = call(formant, "Get time from frame number", i)
            f1 = call(formant, "Get value at time", 1, t, "Hertz", "Linear")
            f2 = call(formant, "Get value at time", 2, t, "Hertz", "Linear")
            if not math.isnan(f1) and f1 > 0: f1s.append(f1)
            if not math.isnan(f2) and f2 > 0: f2s.append(f2)
        features["f1_mean"] = round(float(np.mean(f1s)), 2) if f1s else None
        features["f2_mean"] = round(float(np.mean(f2s)), 2) if f2s else None
    except:
        features["f1_mean"] = features["f2_mean"] = None

    # ─── Spectral Harmonicity ───
    try:
        y_h, _ = librosa.effects.hpss(y)
        total = np.sum(y ** 2)
        features["spectral_harmonicity"] = round(float(np.sum(y_h ** 2) / total), 4) if total > 0 else None
    except:
        features["spectral_harmonicity"] = None

    # ─── Energy Range ───
    try:
        rms = librosa.feature.rms(y=y)[0]
        rms_db = librosa.amplitude_to_db(rms)
        features["energy_range"] = round(float(np.max(rms_db) - np.min(rms_db)), 2)
    except:
        features["energy_range"] = None

    # ─── Articulation Rate (voiced proportion proxy) ───
    try:
        pitch = call(sound, "To Pitch", 0.0, 75, 500)
        f0 = pitch.selected_array["frequency"]
        features["articulation_rate"] = round(float(np.sum(f0 > 0) / len(f0)), 4) if len(f0) > 0 else None
    except:
        features["articulation_rate"] = None

    # ─── PPE (Pitch Period Entropy) — Little 2009 ───
    try:
        pitch = call(sound, "To Pitch", 0.0, 75, 500)
        f0v = pitch.selected_array["frequency"]
        f0v = f0v[f0v > 0]
        if len(f0v) > 2:
            st_diffs = 12.0 * np.log2(f0v[1:] / f0v[:-1])
            hist, _ = np.histogram(st_diffs, bins=30, density=True)
            hist = hist[hist > 0]
            hist = hist / hist.sum()
            features["ppe"] = round(float(-np.sum(hist * np.log2(hist))), 4)
        else:
            features["ppe"] = None
    except:
        features["ppe"] = None

    # ─── RPDE (via sample entropy proxy) ───
    try:
        step = max(1, len(y) // 5000)
        rpde = nolds.sampen(y[::step].astype(np.float64), emb_dim=2)
        features["rpde"] = round(float(rpde), 4) if np.isfinite(rpde) else None
    except:
        features["rpde"] = None

    # ─── DFA (Detrended Fluctuation Analysis) ───
    try:
        step = max(1, len(y) // 5000)
        dfa_val = nolds.dfa(y[::step].astype(np.float64))
        features["dfa"] = round(float(dfa_val), 4) if np.isfinite(dfa_val) else None
    except:
        features["dfa"] = None

    # ─── D2 (Correlation Dimension) ───
    try:
        step = max(1, len(y) // 3000)
        d2 = nolds.corr_dim(y[::step].astype(np.float64), emb_dim=10)
        features["d2"] = round(float(d2), 4) if np.isfinite(d2) else None
    except:
        features["d2"] = None

    # ─── VOT proxy (via onset detection) ───
    try:
        onsets = librosa.onset.onset_detect(y=y, sr=sr, units="time", hop_length=512)
        if len(onsets) >= 2:
            features["vot"] = round(float(np.mean(np.diff(onsets[:10])) * 1000), 2)  # ms
        else:
            features["vot"] = None
    except:
        features["vot"] = None

    # Sanitize
    sanitized = {}
    for k, v in features.items():
        if v is None:
            sanitized[k] = None
        elif isinstance(v, (int, float)) and math.isfinite(v):
            sanitized[k] = v
        else:
            sanitized[k] = None

    return sanitized


# ─────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────
def main():
    import whisper

    print("Loading Whisper model (medium)...")
    whisper_model = whisper.load_model("medium")
    print("Whisper model loaded.")

    sessions = []
    webm_files = sorted([
        f for f in os.listdir(RECORDS_DIR) if f.endswith(".webm")
    ])

    print(f"\nFound {len(webm_files)} recordings to process.\n")

    for i, filename in enumerate(webm_files):
        webm_path = os.path.join(RECORDS_DIR, filename)
        session_id = filename.replace(".webm", "")
        print(f"[{i+1}/{len(webm_files)}] Processing {filename}...")

        # Convert to WAV
        wav_path = os.path.join(tempfile.gettempdir(), f"profile01_{session_id}.wav")
        if not convert_to_wav(webm_path, wav_path):
            print(f"  ⚠ ffmpeg conversion failed for {filename}")
            sessions.append({
                "session_id": session_id, "filename": filename,
                "error": "conversion_failed"
            })
            continue

        file_size = os.path.getsize(webm_path)
        print(f"  Converted to WAV ({file_size / 1024 / 1024:.1f} MB source)")

        # Transcribe
        print(f"  Transcribing with Whisper...")
        try:
            transcript = transcribe(wav_path, whisper_model)
            print(f"  Transcript: {transcript['language']} | {len(transcript['text'])} chars | {len(transcript['segments'])} segments")
        except Exception as e:
            print(f"  ⚠ Transcription failed: {e}")
            transcript = {"text": "", "language": "unknown", "segments": []}

        # Acoustic extraction
        print(f"  Extracting acoustic features...")
        try:
            acoustic = extract_acoustic_features(wav_path, gender="male")
            feature_count = sum(1 for v in acoustic.values() if v is not None and v != "too_short")
            print(f"  Extracted {feature_count} acoustic features")
        except Exception as e:
            print(f"  ⚠ Acoustic extraction failed: {e}")
            acoustic = {"error": str(e)}

        sessions.append({
            "session_id": session_id,
            "filename": filename,
            "file_size_bytes": file_size,
            "transcript": transcript,
            "acoustic_features": acoustic
        })

        # Cleanup temp WAV
        try:
            os.unlink(wav_path)
        except:
            pass

        print(f"  ✓ Done\n")

    # Write output
    output = {
        "profile": "profile01",
        "sessions_count": len(sessions),
        "sessions": sessions
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'='*60}")
    print(f"Extraction complete. {len(sessions)} sessions processed.")
    print(f"Output written to: {OUTPUT_PATH}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
