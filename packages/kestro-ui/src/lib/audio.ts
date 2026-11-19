import * as React from "react";

/** Request / release the microphone. */
export function useMicrophone() {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const start = React.useCallback(async () => {
    try {
      setError(null);
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      setStream(s);
      return s;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone unavailable");
      return null;
    }
  }, []);

  const stop = React.useCallback(() => {
    setStream((s) => {
      s?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  React.useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  return { stream, active: !!stream, error, start, stop };
}

export interface AudioAnalysis {
  /** Overall loudness 0–1 (smoothed). */
  level: number;
  /** Frequency bins 0–1, length = `bins`. */
  spectrum: number[];
}

/**
 * Live loudness + spectrum from a MediaStream (mic) or an <audio>/<video> element
 * (e.g. your agent's TTS output). Feed the result into <AgentCore/>, <VoiceOrb/> or <Waveform/>.
 */
export function useAudioAnalyser(
  source: MediaStream | HTMLMediaElement | null,
  { bins = 64, smoothing = 0.78 }: { bins?: number; smoothing?: number } = {},
): AudioAnalysis {
  const [analysis, setAnalysis] = React.useState<AudioAnalysis>({ level: 0, spectrum: new Array(bins).fill(0) });

  React.useEffect(() => {
    if (!source || typeof window === "undefined") {
      setAnalysis({ level: 0, spectrum: new Array(bins).fill(0) });
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = smoothing;
    const node =
      source instanceof MediaStream ? ctx.createMediaStreamSource(source) : ctx.createMediaElementSource(source);
    node.connect(analyser);
    if (!(source instanceof MediaStream)) analyser.connect(ctx.destination);

    const freq = new Uint8Array(analyser.frequencyBinCount);
    const time = new Uint8Array(analyser.fftSize);
    let raf = 0;
    let smoothLevel = 0;
    const usable = Math.floor(freq.length * 0.7); // skip near-silent top end

    const loop = () => {
      analyser.getByteFrequencyData(freq);
      analyser.getByteTimeDomainData(time);
      let sum = 0;
      for (let i = 0; i < time.length; i++) {
        const v = (time[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / time.length);
      smoothLevel = smoothLevel * 0.7 + Math.min(1, rms * 4) * 0.3;
      const spectrum = new Array(bins);
      for (let b = 0; b < bins; b++) {
        const from = Math.floor((b / bins) * usable);
        const to = Math.max(from + 1, Math.floor(((b + 1) / bins) * usable));
        let m = 0;
        for (let i = from; i < to; i++) m = Math.max(m, freq[i]);
        spectrum[b] = m / 255;
      }
      setAnalysis({ level: smoothLevel, spectrum });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      node.disconnect();
      ctx.close();
    };
  }, [source, bins, smoothing]);

  return analysis;
}

/** Re-render on every animation frame while `active` (returns elapsed seconds). */
export function useAnimationClock(active: boolean) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (!active || typeof window === "undefined") return;
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return t;
}
