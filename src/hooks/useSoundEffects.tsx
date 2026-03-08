import { useCallback, useRef } from "react";

type SoundType =
  | "click"
  | "success"
  | "essencia"
  | "levelUp"
  | "achievement"
  | "error"
  | "navigation"
  | "complete";

const audioContextRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext();
  }
  if (audioContextRef.current.state === "suspended") {
    audioContextRef.current.resume();
  }
  return audioContextRef.current;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.15,
  detune: number = 0
) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc.detune.setValueAtTime(detune, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume: number = 0.03) {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "highpass";
  filter.frequency.setValueAtTime(4000, ctx.currentTime);

  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, ctx.currentTime);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start();
}

const sounds: Record<SoundType, () => void> = {
  click: () => {
    playTone(800, 0.08, "sine", 0.08);
    playNoise(0.04, 0.02);
  },

  navigation: () => {
    playTone(600, 0.06, "sine", 0.06);
    setTimeout(() => playTone(900, 0.06, "sine", 0.06), 40);
  },

  success: () => {
    playTone(523, 0.15, "sine", 0.12);
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 100);
    setTimeout(() => playTone(784, 0.2, "sine", 0.12), 200);
  },

  essencia: () => {
    playTone(880, 0.1, "triangle", 0.1);
    setTimeout(() => playTone(1100, 0.12, "triangle", 0.1), 60);
    setTimeout(() => playTone(1320, 0.15, "triangle", 0.08), 120);
  },

  levelUp: () => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, "sine", 0.12), i * 120);
      setTimeout(() => playTone(freq * 1.5, 0.25, "triangle", 0.06), i * 120 + 30);
    });
  },

  achievement: () => {
    playTone(660, 0.15, "sine", 0.1);
    setTimeout(() => playTone(880, 0.15, "sine", 0.1), 80);
    setTimeout(() => playTone(1100, 0.2, "sine", 0.1), 160);
    setTimeout(() => {
      playTone(1320, 0.3, "sine", 0.12);
      playTone(660, 0.3, "triangle", 0.06);
    }, 250);
  },

  complete: () => {
    playTone(440, 0.12, "sine", 0.1);
    setTimeout(() => playTone(554, 0.12, "sine", 0.1), 100);
    setTimeout(() => playTone(659, 0.18, "sine", 0.12), 200);
  },

  error: () => {
    playTone(300, 0.15, "square", 0.06);
    setTimeout(() => playTone(250, 0.2, "square", 0.06), 120);
  },
};

let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  localStorage.setItem("bookquest-sound-enabled", JSON.stringify(enabled));
}

export function isSoundEnabled(): boolean {
  const stored = localStorage.getItem("bookquest-sound-enabled");
  if (stored !== null) {
    soundEnabled = JSON.parse(stored);
  }
  return soundEnabled;
}

export function playSound(type: SoundType) {
  if (!isSoundEnabled()) return;
  try {
    sounds[type]();
  } catch (e) {
    // Audio context not available
  }
}

export function useSoundEffects() {
  const play = useCallback((type: SoundType) => {
    playSound(type);
  }, []);

  return { play, setSoundEnabled, isSoundEnabled };
}

export default useSoundEffects;
