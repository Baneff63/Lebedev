// Lightweight, dependency-free BPM & key estimation that runs entirely in the
// browser via the Web Audio API. Nothing here ever leaves the client — no
// upload, no server round-trip. It's a practical estimate (autocorrelation +
// Krumhansl-Schmuckler profile matching), not a lab-grade analysis, but it's
// accurate enough to be a genuinely useful pre-mix sanity check.

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type KeyMode = "major" | "minor";

export type AnalysisResult = {
  bpm: number;
  rootIndex: number;
  mode: KeyMode;
  keyConfidence: number;
};

const MAX_ANALYSIS_SECONDS = 60;
export const MAX_FILE_SIZE_BYTES = 60 * 1024 * 1024;

// Krumhansl-Kessler tonal profiles (relative perceived stability of each
// pitch class within a key), indexed from the tonic.
const MAJOR_PROFILE = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];
const MINOR_PROFILE = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];

function toMono(buffer: AudioBuffer, maxSamples: number): Float32Array {
  const length = Math.min(buffer.length, maxSamples);
  const out = new Float32Array(length);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) out[i] += data[i] / buffer.numberOfChannels;
  }
  return out;
}

/** Beat tracking via onset-envelope autocorrelation (60–200 BPM range). */
function estimateBpm(mono: Float32Array, sampleRate: number): number {
  const envelopeRate = 100; // envelope samples per second
  const hop = Math.max(1, Math.floor(sampleRate / envelopeRate));
  const frames = Math.floor(mono.length / hop);
  if (frames < 10) return 0;

  const envelope = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    const start = i * hop;
    const end = Math.min(start + hop, mono.length);
    for (let j = start; j < end; j++) sum += mono[j] * mono[j];
    envelope[i] = Math.sqrt(sum / Math.max(1, end - start));
  }

  // Half-wave rectified first difference = onset strength.
  const onset = new Float32Array(frames);
  for (let i = 1; i < frames; i++) {
    const d = envelope[i] - envelope[i - 1];
    onset[i] = d > 0 ? d : 0;
  }

  // Light smoothing so isolated transients don't dominate the autocorrelation.
  const smooth = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let s = 0;
    let c = 0;
    for (let k = -2; k <= 2; k++) {
      const idx = i + k;
      if (idx >= 0 && idx < frames) {
        s += onset[idx];
        c++;
      }
    }
    smooth[i] = s / c;
  }

  const minBpm = 60;
  const maxBpm = 200;
  const minLag = Math.max(1, Math.round((60 / maxBpm) * envelopeRate));
  const maxLag = Math.round((60 / minBpm) * envelopeRate);

  let bestLag = minLag;
  let bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let score = 0;
    for (let i = 0; i + lag < frames; i++) {
      score += smooth[i] * smooth[i + lag];
    }
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }

  return Math.round((60 * envelopeRate) / bestLag);
}

/** Iterative radix-2 Cooley-Tukey FFT, in place. `re`/`im` length must be a power of 2. */
function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curWr = 1;
      let curWi = 0;
      const half = len / 2;
      for (let j = 0; j < half; j++) {
        const uRe = re[i + j];
        const uIm = im[i + j];
        const vRe = re[i + j + half] * curWr - im[i + j + half] * curWi;
        const vIm = re[i + j + half] * curWi + im[i + j + half] * curWr;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[i + j + half] = uRe - vRe;
        im[i + j + half] = uIm - vIm;
        const nextWr = curWr * wr - curWi * wi;
        const nextWi = curWr * wi + curWi * wr;
        curWr = nextWr;
        curWi = nextWi;
      }
    }
  }
}

function rotateProfile(profile: number[], root: number): number[] {
  const out = new Array<number>(12);
  for (let p = 0; p < 12; p++) out[p] = profile[(p - root + 12) % 12];
  return out;
}

function correlate(a: number[], b: Float64Array): number {
  const meanA = a.reduce((x, y) => x + y, 0) / a.length;
  let meanB = 0;
  for (let i = 0; i < b.length; i++) meanB += b[i];
  meanB /= b.length;

  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < 12; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

/** Chroma profile (12-bin pitch-class energy) matched against KK key profiles. */
function estimateKey(
  mono: Float32Array,
  sampleRate: number,
): { rootIndex: number; mode: KeyMode; confidence: number } {
  const frameSize = 4096;
  const hop = 2048;
  const minFreq = 80;
  const maxFreq = 4000;

  const window = new Float64Array(frameSize);
  for (let i = 0; i < frameSize; i++) {
    window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (frameSize - 1));
  }

  const chroma = new Float64Array(12);
  const re = new Float64Array(frameSize);
  const im = new Float64Array(frameSize);

  for (let start = 0; start + frameSize <= mono.length; start += hop) {
    for (let i = 0; i < frameSize; i++) {
      re[i] = mono[start + i] * window[i];
      im[i] = 0;
    }
    fft(re, im);

    for (let bin = 1; bin < frameSize / 2; bin++) {
      const freq = (bin * sampleRate) / frameSize;
      if (freq < minFreq || freq > maxFreq) continue;
      const mag = Math.hypot(re[bin], im[bin]);
      if (mag < 1e-6) continue;
      const midi = 69 + 12 * Math.log2(freq / 440);
      const pc = ((Math.round(midi) % 12) + 12) % 12;
      chroma[pc] += mag;
    }
  }

  const total = chroma.reduce((a, b) => a + b, 0) || 1;
  for (let i = 0; i < 12; i++) chroma[i] /= total;

  let bestScore = -Infinity;
  let bestRoot = 0;
  let bestMode: KeyMode = "major";

  for (let root = 0; root < 12; root++) {
    const scoreMajor = correlate(rotateProfile(MAJOR_PROFILE, root), chroma);
    const scoreMinor = correlate(rotateProfile(MINOR_PROFILE, root), chroma);
    if (scoreMajor > bestScore) {
      bestScore = scoreMajor;
      bestRoot = root;
      bestMode = "major";
    }
    if (scoreMinor > bestScore) {
      bestScore = scoreMinor;
      bestRoot = root;
      bestMode = "minor";
    }
  }

  return {
    rootIndex: bestRoot,
    mode: bestMode,
    confidence: Math.max(0, Math.min(1, (bestScore + 1) / 2)),
  };
}

export async function analyzeAudioFile(file: File): Promise<AnalysisResult> {
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextCtor();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    const maxSamples = Math.floor(MAX_ANALYSIS_SECONDS * decoded.sampleRate);
    const mono = toMono(decoded, maxSamples);

    const bpm = estimateBpm(mono, decoded.sampleRate);
    const { rootIndex, mode, confidence } = estimateKey(mono, decoded.sampleRate);

    return { bpm, rootIndex, mode, keyConfidence: confidence };
  } finally {
    audioCtx.close().catch(() => {});
  }
}
