/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NovaJournal Celestial Audio Engine
 * Lightweight Web Audio API synthesizer for soft, uplifting UI audio feedback
 * Zero external audio files, zero network dependencies, 0ms latency.
 */

export function playNovaThemeSound(toDark: boolean) {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (toDark) {
      // 🌌 Celestial Nova Deep Chime (Dark mode)
      // Soothing, cosmic, serene harmonic progression: D4 (293.66Hz) -> F#4 (369.99Hz) -> A4 (440Hz) -> D5 (587.33Hz)
      const notes = [
        { freq: 293.66, delay: 0.0, duration: 0.8, gain: 0.04 },
        { freq: 369.99, delay: 0.06, duration: 0.85, gain: 0.035 },
        { freq: 440.0, delay: 0.12, duration: 0.9, gain: 0.03 },
        { freq: 587.33, delay: 0.18, duration: 1.1, gain: 0.025 },
      ];

      notes.forEach(({ freq, delay, duration, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + delay);

        gainNode.gain.setValueAtTime(0.0001, now + delay);
        gainNode.gain.exponentialRampToValueAtTime(gain, now + delay + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.05);
      });
    } else {
      // ☀️ Nova Uplifting Dawn Shimmer (Light mode)
      // Delicate, airy, sparkling harmonic chord: E5 (659.25Hz) -> G#5 (830.61Hz) -> B5 (987.77Hz) -> E6 (1318.51Hz)
      const notes = [
        { freq: 659.25, delay: 0.0, duration: 0.6, gain: 0.03 },
        { freq: 830.61, delay: 0.05, duration: 0.65, gain: 0.025 },
        { freq: 987.77, delay: 0.1, duration: 0.7, gain: 0.022 },
        { freq: 1318.51, delay: 0.15, duration: 0.85, gain: 0.018 },
      ];

      notes.forEach(({ freq, delay, duration, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + delay);

        gainNode.gain.setValueAtTime(0.0001, now + delay);
        gainNode.gain.exponentialRampToValueAtTime(gain, now + delay + 0.025);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.05);
      });
    }
  } catch {
    // Graceful fallback if user policy or browser blocks auto audio
  }
}

/**
 * Soft haptic / action click chime
 */
export function playSoftChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.02, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch {
    // ignore
  }
}

/**
 * 🌟 Cosmic Nova Login Sound
 * Rich, ethereal, soft flowing chord swell with shimmering celestial harmonics
 * Used upon successful authentication and fluid wave transition
 */
export function playNovaLoginSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Harmonic celestial triad swell: C4 (261.63) -> G4 (392.00) -> C5 (523.25) -> E5 (659.25) -> B5 (987.77)
    const chord = [
      { freq: 261.63, delay: 0.0, duration: 1.8, peak: 0.035, type: "sine" as OscillatorType },
      { freq: 392.0, delay: 0.08, duration: 2.0, peak: 0.03, type: "sine" as OscillatorType },
      { freq: 523.25, delay: 0.16, duration: 2.2, peak: 0.025, type: "sine" as OscillatorType },
      { freq: 659.25, delay: 0.26, duration: 2.4, peak: 0.02, type: "triangle" as OscillatorType },
      { freq: 987.77, delay: 0.38, duration: 2.6, peak: 0.015, type: "sine" as OscillatorType },
      { freq: 1318.51, delay: 0.52, duration: 2.8, peak: 0.01, type: "sine" as OscillatorType },
    ];

    chord.forEach(({ freq, delay, duration, peak, type }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + delay);

      // Smooth attack and long gentle ethereal tail
      gainNode.gain.setValueAtTime(0.00001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(peak, now + delay + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.1);
    });
  } catch {
    // Audio policies fallback
  }
}

/**
 * ⚡ Nova AI Message Send Sound
 * Crisp, subtle futuristic transmit blip (soft sine 950Hz -> 1400Hz)
 */
export function playNovaAiSendSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.025, now + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch {
    // audio fallback
  }
}

/**
 * 🌌 Nova AI Message Receive Sound
 * Soft celestial chime with warm harmonic tail (F#5 739.99Hz -> C#6 1108.73Hz)
 */
export function playNovaAiReceiveSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const notes = [
      { freq: 739.99, delay: 0.0, duration: 0.45, gain: 0.025 },
      { freq: 1108.73, delay: 0.06, duration: 0.6, gain: 0.02 },
      { freq: 1479.98, delay: 0.12, duration: 0.75, gain: 0.015 },
    ];

    notes.forEach(({ freq, delay, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      gainNode.gain.setValueAtTime(0.0001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.05);
    });
  } catch {
    // audio fallback
  }
}

/**
 * 📎 Nova Document / RAG Upload Sound
 * Ascending pleasant confirmation tone (D5 587.33Hz -> A5 880Hz)
 */
export function playNovaUploadSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.09);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.028, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // audio fallback
  }
}

/**
 * 🌌 Uplifting Nova Space Sound
 * Ambient cosmic sweep with crystalline harmonic shimmer
 * Used during route transitions, initial system loading, and sync operations
 */
export function playNovaSpaceSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Deep warm foundation + rising harmonics
    const tones = [
      { freq: 174.61, delay: 0.0, duration: 2.2, peak: 0.03, type: "sine" as OscillatorType },   // F3 warm root
      { freq: 261.63, delay: 0.08, duration: 2.4, peak: 0.025, type: "sine" as OscillatorType }, // C4 perfect 5th
      { freq: 349.23, delay: 0.16, duration: 2.5, peak: 0.02, type: "sine" as OscillatorType },  // F4 octave
      { freq: 523.25, delay: 0.28, duration: 2.6, peak: 0.015, type: "triangle" as OscillatorType }, // C5
      { freq: 783.99, delay: 0.42, duration: 2.8, peak: 0.012, type: "sine" as OscillatorType },  // G5
      { freq: 1046.50, delay: 0.58, duration: 3.0, peak: 0.008, type: "sine" as OscillatorType }, // C6 celestial shimmer
    ];

    tones.forEach(({ freq, delay, duration, peak, type }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + delay);

      // Gentle, uplifting swell
      gainNode.gain.setValueAtTime(0.00001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(peak, now + delay + 0.35);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.1);
    });
  } catch {
    // browser auto-play policy fallback
  }
}

