#!/usr/bin/env python3
"""Offline music analysis for the Hong MV.

This is a build-time helper, not part of the player.  It decodes the user's
local MP3 with ffmpeg, then estimates tempo, onset strength and section-level
energy so the edit can be checked against the actual recording rather than a
guess.  It writes a small JSON report next to this script.

Run:
    python -I tools/analyze_audio.py
"""

from __future__ import annotations

import json
import os
import subprocess
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MP3 = os.path.join(ROOT, "assets", "audio", "罗言 - 红.mp3")
WAV = os.path.join(ROOT, "tools", "_hong_analysis.wav")
OUT = os.path.join(ROOT, "tools", "audio_analysis.json")

FFMPEG = r"D:\剪映\JianyingPro\10.5.0.13988\ffmpeg.exe"
SR = 22050
FRAME = 1024
HOP = 512


def decode() -> None:
    cmd = [
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-i", MP3, "-ac", "1", "-ar", str(SR), "-sample_fmt", "s16", WAV,
    ]
    subprocess.run(cmd, check=True)


def read_wav(path: str) -> np.ndarray:
    with wave.open(path, "rb") as f:
        if f.getnchannels() != 1 or f.getsampwidth() != 2:
            raise RuntimeError("expected mono 16-bit wav")
        data = f.readframes(f.getnframes())
    return np.frombuffer(data, dtype="<i2").astype(np.float32) / 32768.0


def main() -> None:
    decode()
    audio = read_wav(WAV)
    if len(audio) < SR * 2:
        raise RuntimeError("audio too short")

    # Frame-wise RMS and spectrum.
    pad = FRAME // 2
    padded = np.pad(audio, (pad, pad), mode="constant")
    frames = np.lib.stride_tricks.sliding_window_view(padded, FRAME)[::HOP]
    window = np.hanning(FRAME).astype(np.float32)
    spec = np.abs(np.fft.rfft(frames * window, axis=1))
    logspec = np.log1p(spec * 20.0)
    flux = np.maximum(0.0, np.diff(logspec, axis=0)).sum(axis=1)
    rms = np.sqrt(np.mean(frames * frames, axis=1))
    freqs = np.fft.rfftfreq(FRAME, 1.0 / SR)
    centroid = (spec * freqs).sum(axis=1) / np.maximum(1e-8, spec.sum(axis=1))

    times = np.arange(len(rms)) * HOP / SR
    onset = np.maximum(0.0, flux - np.percentile(flux, 30))
    onset = onset / max(1e-8, onset.max())

    # Tempo by autocorrelation of the onset envelope over 60-190 BPM.
    osr = SR / HOP
    ac = np.correlate(onset, onset, mode="full")[len(onset) - 1:]
    ac = ac / max(1e-8, ac[0])
    lags = np.arange(len(ac))
    bpm_candidates = np.arange(60, 190, 0.25)
    lag_for = osr * 60.0 / bpm_candidates
    score = np.interp(lag_for, lags, ac)
    # Prefer a musically common range: lightly favour 76-96 and 120-150.
    common = np.exp(-0.5 * ((bpm_candidates - 90) / 42) ** 2)
    score = score * (0.7 + 0.3 * common)
    bpm = float(bpm_candidates[int(np.argmax(score))])

    # Peak pick on the onset envelope for a rough beat grid.
    peaks = []
    last = -999
    for i in range(1, len(onset) - 1):
        if onset[i] >= 0.10 and onset[i] >= onset[i - 1] and onset[i] > onset[i + 1]:
            t = float(times[i])
            if t - last > 0.22:
                peaks.append(round(t, 3))
                last = t

    # 1 s energy summary (mean / max / brightness) for section checks.
    per_sec = []
    for s in range(int(np.ceil(len(audio) / SR))):
        a = int(s * SR)
        b = min(len(audio), a + SR)
        i0 = int(a / HOP)
        i1 = max(i0 + 1, min(len(rms), int(b / HOP)))
        per_sec.append({
            "t": s,
            "rms": round(float(rms[i0:i1].mean()), 4),
            "peak": round(float(rms[i0:i1].max()), 4),
            "centroid": round(float(centroid[i0:i1].mean()), 1),
        })

    # Change points: compare 4 s windows on a 1 s grid.
    changes = []
    for s in range(4, len(per_sec) - 4):
        before = np.mean([x["rms"] for x in per_sec[s - 4:s]])
        after = np.mean([x["rms"] for x in per_sec[s:s + 4]])
        if abs(after - before) > 0.035:
            changes.append({"t": s, "delta": round(float(after - before), 3)})

    report = {
        "file": os.path.basename(MP3),
        "duration": round(len(audio) / SR, 3),
        "tempo_bpm": bpm,
        "tempo_confidence": round(float(np.max(score)), 3),
        "beat_count": len(peaks),
        "beats": peaks,
        "section_change_candidates": changes,
        "per_second": per_sec,
        "notes": "粗略分析：用于核对剪辑点，不是乐谱级节拍检测。",
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    os.remove(WAV)
    print(f"duration={report['duration']}s bpm={bpm:.2f} confidence={report['tempo_confidence']}")
    print(f"wrote {OUT}")
    print("change candidates:", [c["t"] for c in changes if c["t"] < 165][:40])


if __name__ == "__main__":
    main()
