/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NovaFinance Celestial Audio Engine
 * Lightweight Web Audio API synthesizer for soft, uplifting UI audio feedback
 * Zero external audio files, zero network dependencies, 0ms latency.
 * Master volume dynamically linked to user preferences.
 */

/**
 * Get the master volume ratio (0.0 to 1.0)
 * Respects 'novajournal_audio_feedback' (boolean enabled) and 'novajournal_audio_volume' (0-100)
 */
export function getMasterAudioVolume(): number {
  if (typeof window === "undefined") return 0.8;
  try {
    const enabled = localStorage.getItem("novajournal_audio_feedback");
    if (enabled === "false") return 0;
    const volStr = localStorage.getItem("novajournal_audio_volume");
    if (volStr !== null) {
      const parsed = Number(volStr);
      if (!isNaN(parsed) && parsed >= 0) {
        return Math.max(0, Math.min(100, parsed)) / 100;
      }
    }
  } catch {}
  return 0.8; // default 80%
}

/**
 * Realistic tactile haptic UI click synthesizer
 * Produces an authentic mechanical / crisp glass-tap click that scales realistically with volume.
 */
export function playRealisticClick(customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    
    // 1. High transient "snap" (crisp attack click)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = "sine";
    snapOsc.frequency.setValueAtTime(2400, now);
    snapOsc.frequency.exponentialRampToValueAtTime(320, now + 0.025);

    snapGain.gain.setValueAtTime(0.0001, now);
    snapGain.gain.linearRampToValueAtTime(0.12 * master, now + 0.002);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.04);

    // 2. Warm body tap (tactile wood/glass mechanical body)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = "triangle";
    bodyOsc.frequency.setValueAtTime(420, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.08 * master, now + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.07);
  } catch {}
}

export function playNovaThemeSound(toDark: boolean, customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    if (toDark) {
      // 🌌 Celestial Nova Deep Chime (Dark mode)
      const notes = [
        { freq: 293.66, delay: 0.0, duration: 0.8, gain: 0.08 * master },
        { freq: 369.99, delay: 0.06, duration: 0.85, gain: 0.07 * master },
        { freq: 440.0, delay: 0.12, duration: 0.9, gain: 0.06 * master },
        { freq: 587.33, delay: 0.18, duration: 1.1, gain: 0.05 * master },
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
      const notes = [
        { freq: 659.25, delay: 0.0, duration: 0.6, gain: 0.06 * master },
        { freq: 830.61, delay: 0.05, duration: 0.65, gain: 0.05 * master },
        { freq: 987.77, delay: 0.1, duration: 0.7, gain: 0.045 * master },
        { freq: 1318.51, delay: 0.15, duration: 0.85, gain: 0.036 * master },
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
  } catch {}
}

/**
 * Soft haptic / action click chime
 */
export function playSoftChime(customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

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
    gainNode.gain.exponentialRampToValueAtTime(0.055 * master, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch {}
}

/**
 * 🌟 Cosmic Nova Login Sound
 */
export function playNovaLoginSound(customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    const chord = [
      { freq: 261.63, delay: 0.0, duration: 1.8, peak: 0.07 * master, type: "sine" as OscillatorType },
      { freq: 392.0, delay: 0.08, duration: 2.0, peak: 0.06 * master, type: "sine" as OscillatorType },
      { freq: 523.25, delay: 0.16, duration: 2.2, peak: 0.05 * master, type: "sine" as OscillatorType },
      { freq: 659.25, delay: 0.26, duration: 2.4, peak: 0.04 * master, type: "triangle" as OscillatorType },
      { freq: 987.77, delay: 0.38, duration: 2.6, peak: 0.03 * master, type: "sine" as OscillatorType },
      { freq: 1318.51, delay: 0.52, duration: 2.8, peak: 0.02 * master, type: "sine" as OscillatorType },
    ];

    chord.forEach(({ freq, delay, duration, peak, type }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + delay);

      gainNode.gain.setValueAtTime(0.00001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(peak, now + delay + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.1);
    });
  } catch {}
}

/**
 * ⚡ Nova AI Message Send Sound
 */
export function playNovaAiSendSound(customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

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
    gainNode.gain.exponentialRampToValueAtTime(0.055 * master, now + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch {}
}

/**
 * 🌌 Nova AI Message Receive Sound
 */
export function playNovaAiReceiveSound(customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const notes = [
      { freq: 739.99, delay: 0.0, duration: 0.45, gain: 0.05 * master },
      { freq: 1108.73, delay: 0.06, duration: 0.6, gain: 0.04 * master },
      { freq: 1479.98, delay: 0.12, duration: 0.75, gain: 0.03 * master },
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
  } catch {}
}

/**
 * 📎 Nova Document / RAG Upload Sound
 */
export function playNovaUploadSound(customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

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
    gainNode.gain.exponentialRampToValueAtTime(0.06 * master, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch {}
}

/**
 * 🌌 Uplifting Nova Space Sound
 * Ambient cosmic sweep with crystalline harmonic shimmer
 */
export function playNovaSpaceSound(customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    const tones = [
      { freq: 174.61, delay: 0.0, duration: 2.2, peak: 0.06 * master, type: "sine" as OscillatorType },
      { freq: 261.63, delay: 0.08, duration: 2.4, peak: 0.05 * master, type: "sine" as OscillatorType },
      { freq: 349.23, delay: 0.16, duration: 2.5, peak: 0.04 * master, type: "sine" as OscillatorType },
      { freq: 523.25, delay: 0.28, duration: 2.6, peak: 0.03 * master, type: "triangle" as OscillatorType },
      { freq: 783.99, delay: 0.42, duration: 2.8, peak: 0.025 * master, type: "sine" as OscillatorType },
      { freq: 1046.50, delay: 0.58, duration: 3.0, peak: 0.018 * master, type: "sine" as OscillatorType },
    ];

    tones.forEach(({ freq, delay, duration, peak, type }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + delay);

      gainNode.gain.setValueAtTime(0.00001, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(peak, now + delay + 0.35);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.1);
    });
  } catch {}
}

/**
 * ✨ Nova Smooth Status Success Sound
 * Fluid, uplifting harmonic chime confirming successful database commit & state persistence.
 */
export function playNovaSuccessSound(customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, delay: 0.0, duration: 0.5, peak: 0.05 * master },   // C5
      { freq: 659.25, delay: 0.05, duration: 0.6, peak: 0.06 * master },  // E5
      { freq: 783.99, delay: 0.10, duration: 0.7, peak: 0.07 * master },  // G5
      { freq: 1046.50, delay: 0.15, duration: 0.9, peak: 0.08 * master }, // C6
    ];

    notes.forEach(({ freq, delay, duration, peak }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      gainNode.gain.setValueAtTime(0.0001, now + delay);
      gainNode.gain.linearRampToValueAtTime(peak, now + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.05);
    });
  } catch {}
}

/**
 * ⚠️ Nova Smooth Status Error Sound
 * Soft, low-frequency damped chime signalling failure or validation issue without being harsh.
 */
export function playNovaErrorSound(customVolume?: number) {
  if (typeof window === "undefined") return;
  const master = customVolume !== undefined ? customVolume : getMasterAudioVolume();
  if (master <= 0.001) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const notes = [
      { freq: 329.63, delay: 0.0, duration: 0.28, peak: 0.07 * master },  // E4
      { freq: 261.63, delay: 0.12, duration: 0.38, peak: 0.06 * master }, // C4
    ];

    notes.forEach(({ freq, delay, duration, peak }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);

      gainNode.gain.setValueAtTime(0.0001, now + delay);
      gainNode.gain.linearRampToValueAtTime(peak, now + delay + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.05);
    });
  } catch {}
}

