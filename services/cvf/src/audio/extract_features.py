#!/usr/bin/env python3
"""
extract_features.py -- Acoustic feature extraction for MemoVoice CVF Engine.

Extracts vocal biomarkers from WAV files using parselmouth (Praat), librosa,
and nolds. Outputs JSON to stdout for the Node.js CVF bridge.

Usage:
    python extract_features.py --audio-path rec.wav --task-type conversation --gender female

References:
    Little et al. (2009) - PPE algorithm, IEEE TBME.
    Tsanas et al. (2011) - Nonlinear speech signal features for PD classification.
"""

import argparse, json, sys, math
import numpy as np

# ---------------------------------------------------------------------------
# Tier 1: Core acoustic features (F0, jitter, shimmer, HNR, MFCC)
# ---------------------------------------------------------------------------

def extract_tier1(sound, y, sr):
    """Core features using parselmouth Sound + librosa arrays."""
    from parselmouth.praat import call
    import librosa
    features = {}

    # F0 via Praat pitch tracking (75-500 Hz)
    try:
        pitch = call(sound, "To Pitch", 0.0, 75, 500)
        f0 = pitch.selected_array["frequency"]
        f0v = f0[f0 > 0]
        if len(f0v) > 0:
            features["f0_mean"] = float(np.mean(f0v))
            features["f0_sd"] = float(np.std(f0v))
            features["f0_range"] = float(np.max(f0v) - np.min(f0v))
        else:
            features["f0_mean"] = features["f0_sd"] = features["f0_range"] = None
    except Exception:
        features["f0_mean"] = features["f0_sd"] = features["f0_range"] = None

    # Jitter local
    try:
        pp = call(sound, "To PointProcess (periodic, cc)", 75, 500)
        features["jitter_local"] = float(call(pp, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3))
    except Exception:
        features["jitter_local"] = None

    # Shimmer local
    try:
        pp = call(sound, "To PointProcess (periodic, cc)", 75, 500)
        features["shimmer_local"] = float(call(
            [sound, pp], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6))
    except Exception:
        features["shimmer_local"] = None

    # HNR
    try:
        harm = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
        features["hnr"] = float(call(harm, "Get mean", 0, 0))
    except Exception:
        features["hnr"] = None

    # MFCC coefficient 2 mean
    try:
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        features["mfcc2_mean"] = float(np.mean(mfccs[1]))
    except Exception:
        features["mfcc2_mean"] = None

    return features

# ---------------------------------------------------------------------------
# Tier 2: Advanced features (nonlinear dynamics, cepstral, formants)
# ---------------------------------------------------------------------------

def extract_tier2(sound, y, sr):
    """Advanced features: RPDE, DFA, PPE, CPP, articulation rate, formants, spectral harmonicity."""
    from parselmouth.praat import call
    import nolds
    features = {}

    # RPDE (Recurrence Period Density Entropy) via sample entropy proxy
    try:
        step = max(1, len(y) // 5000)
        rpde = nolds.sampen(y[::step].astype(np.float64), emb_dim=2)
        features["rpde"] = float(rpde) if np.isfinite(rpde) else None
    except Exception:
        features["rpde"] = None

    # DFA (Detrended Fluctuation Analysis)
    try:
        step = max(1, len(y) // 5000)
        dfa_val = nolds.dfa(y[::step].astype(np.float64))
        features["dfa"] = float(dfa_val) if np.isfinite(dfa_val) else None
    except Exception:
        features["dfa"] = None

    # PPE (Pitch Period Entropy) -- Little 2009 algorithm
    try:
        pitch = call(sound, "To Pitch", 0.0, 75, 500)
        f0v = pitch.selected_array["frequency"]
        f0v = f0v[f0v > 0]
        if len(f0v) > 2:
            st_diffs = 12.0 * np.log2(f0v[1:] / f0v[:-1])
            hist, _ = np.histogram(st_diffs, bins=30, density=True)
            hist = hist[hist > 0]
            hist = hist / hist.sum()
            features["ppe"] = float(-np.sum(hist * np.log2(hist)))
        else:
            features["ppe"] = None
    except Exception:
        features["ppe"] = None

    # CPP (Cepstral Peak Prominence)
    try:
        features["cpp"] = _compute_cpp(y, sr)
    except Exception:
        features["cpp"] = None

    # Articulation rate (voiced frames / total as proxy)
    try:
        pitch = call(sound, "To Pitch", 0.0, 75, 500)
        f0 = pitch.selected_array["frequency"]
        features["articulation_rate"] = float(np.sum(f0 > 0) / len(f0)) if len(f0) > 0 else None
    except Exception:
        features["articulation_rate"] = None

    # Formants F1, F2 mean via Praat
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
        features["f1_mean"] = float(np.mean(f1s)) if f1s else None
        features["f2_mean"] = float(np.mean(f2s)) if f2s else None
    except Exception:
        features["f1_mean"] = features["f2_mean"] = None

    # Spectral harmonicity (harmonic-to-total energy ratio)
    try:
        features["spectral_harmonicity"] = _compute_spectral_harmonicity(y, sr)
    except Exception:
        features["spectral_harmonicity"] = None

    return features

# ---------------------------------------------------------------------------
# Sustained vowel (/aaa/ micro-task): full jitter/shimmer/nonlinear suite
# ---------------------------------------------------------------------------

def extract_sustained_vowel(sound, y, sr):
    """Full jitter, shimmer, HNR, NHR, CPP, F0 stats, RPDE, DFA, PPE, D2."""
    from parselmouth.praat import call
    import nolds
    features = {}

    # Point process (shared for jitter + shimmer)
    try:
        pp = call(sound, "To PointProcess (periodic, cc)", 75, 500)
    except Exception:
        pp = None

    # Full jitter suite
    jitter_defs = {
        "jitter_local": "Get jitter (local)", "jitter_local_abs": "Get jitter (local, absolute)",
        "jitter_rap": "Get jitter (rap)", "jitter_ppq5": "Get jitter (ppq5)",
        "jitter_ddp": "Get jitter (ddp)",
    }
    for key, cmd in jitter_defs.items():
        try:
            val = call(pp, cmd, 0, 0, 0.0001, 0.02, 1.3) if pp else None
            features[key] = float(val) if val is not None and np.isfinite(val) else None
        except Exception:
            features[key] = None

    # Full shimmer suite
    shimmer_defs = {
        "shimmer_local": "Get shimmer (local)", "shimmer_local_db": "Get shimmer (local, dB)",
        "shimmer_apq3": "Get shimmer (apq3)", "shimmer_apq5": "Get shimmer (apq5)",
        "shimmer_apq11": "Get shimmer (apq11)", "shimmer_dda": "Get shimmer (dda)",
    }
    for key, cmd in shimmer_defs.items():
        try:
            val = call([sound, pp], cmd, 0, 0, 0.0001, 0.02, 1.3, 1.6) if pp else None
            features[key] = float(val) if val is not None and np.isfinite(val) else None
        except Exception:
            features[key] = None

    # HNR
    try:
        harm = call(sound, "To Harmonicity (cc)", 0.01, 75, 0.1, 1.0)
        features["hnr"] = float(call(harm, "Get mean", 0, 0))
    except Exception:
        features["hnr"] = None

    # NHR (noise-to-harmonics = 1 / HNR_linear)
    try:
        if features.get("hnr") is not None and features["hnr"] != 0:
            features["nhr"] = float(1.0 / (10 ** (features["hnr"] / 10)))
        else:
            features["nhr"] = None
    except Exception:
        features["nhr"] = None

    # CPP
    try:
        features["cpp"] = _compute_cpp(y, sr)
    except Exception:
        features["cpp"] = None

    # F0 statistics
    try:
        pitch = call(sound, "To Pitch", 0.0, 75, 500)
        f0v = pitch.selected_array["frequency"]
        f0v = f0v[f0v > 0]
        if len(f0v) > 0:
            features.update({"f0_mean": float(np.mean(f0v)), "f0_sd": float(np.std(f0v)),
                "f0_min": float(np.min(f0v)), "f0_max": float(np.max(f0v)),
                "f0_range": float(np.max(f0v) - np.min(f0v))})
        else:
            for k in ("f0_mean", "f0_sd", "f0_min", "f0_max", "f0_range"):
                features[k] = None
    except Exception:
        for k in ("f0_mean", "f0_sd", "f0_min", "f0_max", "f0_range"):
            features[k] = None

    # RPDE
    try:
        step = max(1, len(y) // 5000)
        rpde = nolds.sampen(y[::step].astype(np.float64), emb_dim=2)
        features["rpde"] = float(rpde) if np.isfinite(rpde) else None
    except Exception:
        features["rpde"] = None

    # DFA
    try:
        step = max(1, len(y) // 5000)
        features["dfa"] = float(nolds.dfa(y[::step].astype(np.float64)))
    except Exception:
        features["dfa"] = None

    # PPE (Pitch Period Entropy)
    try:
        pitch = call(sound, "To Pitch", 0.0, 75, 500)
        f0v = pitch.selected_array["frequency"]
        f0v = f0v[f0v > 0]
        if len(f0v) > 2:
            st = 12.0 * np.log2(f0v[1:] / f0v[:-1])
            h, _ = np.histogram(st, bins=30, density=True)
            h = h[h > 0]; h = h / h.sum()
            features["ppe"] = float(-np.sum(h * np.log2(h)))
        else:
            features["ppe"] = None
    except Exception:
        features["ppe"] = None

    # D2 (correlation dimension)
    try:
        step = max(1, len(y) // 3000)
        d2 = nolds.corr_dim(y[::step].astype(np.float64), emb_dim=10)
        features["d2"] = float(d2) if np.isfinite(d2) else None
    except Exception:
        features["d2"] = None

    return features

# ---------------------------------------------------------------------------
# DDK (/pataka/ micro-task): syllable onset detection + rate analysis
# ---------------------------------------------------------------------------

def extract_ddk(y, sr):
    """DDK rate, regularity (CV of IOIs), festination detection."""
    import librosa
    features = {}

    # Detect syllable onsets
    try:
        frames = librosa.onset.onset_detect(
            y=y, sr=sr, units="frames", hop_length=512, backtrack=True,
            pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.07, wait=4)
        times = librosa.frames_to_time(frames, sr=sr, hop_length=512)
        features["onset_count"] = int(len(times))
    except Exception:
        for k in ("onset_count", "ddk_rate", "ddk_regularity_cv", "ddk_mean_ioi", "ddk_sd_ioi", "festination"):
            features[k] = None
        return features

    # DDK rate (syllables/second)
    try:
        dur = times[-1] - times[0] if len(times) >= 2 else 0
        features["ddk_rate"] = float(len(times) / dur) if dur > 0 else None
    except Exception:
        features["ddk_rate"] = None

    # Inter-onset intervals + regularity CV
    try:
        if len(times) >= 3:
            ioi = np.diff(times); ioi = ioi[ioi > 0]
            features["ddk_mean_ioi"] = float(np.mean(ioi))
            features["ddk_sd_ioi"] = float(np.std(ioi))
            features["ddk_regularity_cv"] = float(np.std(ioi) / np.mean(ioi)) if np.mean(ioi) > 0 else None
        else:
            features["ddk_mean_ioi"] = features["ddk_sd_ioi"] = features["ddk_regularity_cv"] = None
    except Exception:
        features["ddk_mean_ioi"] = features["ddk_sd_ioi"] = features["ddk_regularity_cv"] = None

    # Festination: later intervals systematically shorter (PD marker)
    try:
        if len(times) >= 6:
            ioi = np.diff(times); ioi = ioi[ioi > 0]
            if len(ioi) >= 4:
                mid = len(ioi) // 2
                ratio = np.mean(ioi[mid:]) / np.mean(ioi[:mid]) if np.mean(ioi[:mid]) > 0 else 1.0
                features["festination"] = bool(ratio < 0.85)  # >=15% acceleration
            else:
                features["festination"] = None
        else:
            features["festination"] = None
    except Exception:
        features["festination"] = None

    return features

# ---------------------------------------------------------------------------
# Vowel space: formant-based articulation metrics
# ---------------------------------------------------------------------------

def extract_vowel_space(sound):
    """F1/F2 tracking, VSA (if multiple vowels), VAI proxy."""
    from parselmouth.praat import call
    features = {}

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

        features["f1_mean"] = float(np.mean(f1s)) if f1s else None
        features["f2_mean"] = float(np.mean(f2s)) if f2s else None
        # VSA requires corner vowels /a/, /i/, /u/ -- not computable from single vowel
        features["vsa"] = None
        # VAI single-vowel proxy: F2/F1 ratio as articulatory spread
        # Full VAI = (F2_i + F1_a) / (F1_i + F1_u + F2_u + F2_a)
        if features["f1_mean"] and features["f2_mean"] and features["f1_mean"] > 0:
            features["vai"] = float(features["f2_mean"] / features["f1_mean"])
        else:
            features["vai"] = None
    except Exception:
        features["f1_mean"] = features["f2_mean"] = features["vsa"] = features["vai"] = None

    return features

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _compute_cpp(y, sr):
    """Cepstral Peak Prominence: peak-to-regression difference in cepstrum."""
    from scipy.signal import get_window
    frame_len = int(0.04 * sr)  # 40ms
    hop = int(0.01 * sr)        # 10ms
    cpp_vals = []

    for start in range(0, len(y) - frame_len, hop):
        w = y[start:start + frame_len] * get_window("hann", frame_len)
        power = np.maximum(np.abs(np.fft.rfft(w)) ** 2, 1e-12)
        cep = np.fft.irfft(10 * np.log10(power))

        lo, hi = int(sr / 500), min(int(sr / 75), len(cep) - 1)  # 75-500 Hz
        if lo >= hi: continue
        region = cep[lo:hi]
        if len(region) == 0: continue

        x = np.arange(lo, lo + len(region))
        reg = np.polyval(np.polyfit(x, region, 1), x)
        peak = np.argmax(region)
        cpp_vals.append(region[peak] - reg[peak])

    return float(np.mean(cpp_vals)) if cpp_vals else None


def _compute_spectral_harmonicity(y, sr):
    """Harmonic-to-total energy ratio via librosa HPSS."""
    import librosa
    y_h, _ = librosa.effects.hpss(y)
    total = np.sum(y ** 2)
    return float(np.sum(y_h ** 2) / total) if total > 0 else None

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="MemoVoice CVF acoustic feature extraction")
    parser.add_argument("--audio-path", required=True, help="Path to input WAV file")
    parser.add_argument("--task-type", required=True,
        choices=["conversation", "sustained_vowel", "ddk", "fluency"])
    parser.add_argument("--gender", default="female", choices=["male", "female"],
        help="Speaker gender for F0 normalization")
    args = parser.parse_args()

    try:
        import librosa, parselmouth

        y, sr = librosa.load(args.audio_path, sr=16000, mono=True)
        sound = parselmouth.Sound(args.audio_path)

        f0_norms = {"male": {"mean": 120, "sd": 20}, "female": {"mean": 210, "sd": 30}}
        result = {
            "task_type": args.task_type, "gender": args.gender,
            "duration_s": float(len(y) / sr), "sample_rate": sr,
            "f0_norm_ref": f0_norms[args.gender],
        }

        if args.task_type == "conversation":
            result["features"] = {**extract_tier1(sound, y, sr), **extract_tier2(sound, y, sr)}
        elif args.task_type == "sustained_vowel":
            result["features"] = {**extract_sustained_vowel(sound, y, sr), **extract_vowel_space(sound)}
        elif args.task_type == "ddk":
            result["features"] = extract_ddk(y, sr)
        elif args.task_type == "fluency":
            result["features"] = extract_tier1(sound, y, sr)
        else:
            result["features"] = {}

        result["status"] = "ok"
        print(json.dumps(result))

    except Exception as exc:
        print(json.dumps({"status": "error", "error": str(exc), "task_type": getattr(args, "task_type", None)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
