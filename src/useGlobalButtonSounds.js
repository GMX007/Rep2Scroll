import { useEffect } from 'react';

let _ctx = null;

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// ---------------------------------------------------------------------------
// Five distinct 80s laser sounds, played in rotation
// ---------------------------------------------------------------------------

function playZap() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 4;
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playBlip() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
  gain.gain.setValueAtTime(0.38, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
  osc.start(now);
  osc.stop(now + 0.08);
}

function playConfirm() {
  const ctx = getCtx();
  [[523, 0], [784, 0.1]].forEach(([freq, delay]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    const t = ctx.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

function playPowerUp() {
  const ctx = getCtx();
  [330, 440, 550, 660, 880].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    const t = ctx.currentTime + i * 0.07;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.063);
    osc.start(t);
    osc.stop(t + 0.07);
  });
}

function playWobble() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.value = 440;
  lfo.type = 'sine';
  lfo.frequency.value = 8;
  lfoGain.gain.value = 60;
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.38, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  lfo.start(now); osc.start(now);
  lfo.stop(now + 0.4); osc.stop(now + 0.4);
}

const SOUNDS = [playZap, playBlip, playZap, playBlip, playConfirm];
let soundIndex = 0;

function playNext() {
  SOUNDS[soundIndex % SOUNDS.length]();
  soundIndex++;
}

// Specific sounds you can assign to certain buttons by data attribute:
// <button data-sound="powerup">Start Workout</button>
// <button data-sound="wobble">Begin</button>
const DATA_SOUNDS = {
  zap: playZap,
  blip: playBlip,
  confirm: playConfirm,
  powerup: playPowerUp,
  wobble: playWobble,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useGlobalButtonSounds() {
  useEffect(() => {
    function handleClick(e) {
      const el = e.target.closest('button, [role="button"], a[href]');
      if (!el) return;

      // Respect an explicit data-sound="none" opt-out
      if (el.dataset.sound === 'none') return;

      // Use a named sound if specified, else cycle through defaults
      const named = DATA_SOUNDS[el.dataset.sound];
      if (named) {
        named();
      } else {
        playNext();
      }
    }

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);
}
