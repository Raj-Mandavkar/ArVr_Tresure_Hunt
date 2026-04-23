// Procedural audio engine using Web Audio API

// Ensures the AudioContext is created on demand to follow browser interaction policies
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    
    // Create an oscillator for a pleasant chime
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine'; // Smooth tone
    
    // Arpeggio frequencies: C5 - E5 - G5 - C6
    osc.frequency.setValueAtTime(523.25, t);
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.1);
    osc.frequency.setValueAtTime(659.25, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(783.99, t + 0.2);
    osc.frequency.setValueAtTime(783.99, t + 0.2);
    osc.frequency.exponentialRampToValueAtTime(1046.50, t + 0.3);
    
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.5, t + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.8);
  } catch (e) {
    console.error("Audio playback error:", e);
  }
}

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, t);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.1);
  } catch (e) {
    console.error("Audio playback error:", e);
  }
}

export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, t);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.3);
  } catch (e) {
    console.error("Audio playback error:", e);
  }
}
