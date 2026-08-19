// ============================================================================
// WebAudio 程序合成音效（零资源文件，离线可用）
// 移动端浏览器要求首次触摸后解锁 AudioContext
// ============================================================================

let ctx: AudioContext | null = null;
let unlocked = false;

export function unlockAudio(): void {
  if (unlocked) return;
  try {
    ctx = ctx ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    unlocked = true;
  } catch {
    // 静默失败
  }
}

function getCtx(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface ToneOpts {
  freq: number;
  end?: number;
  type?: OscillatorType;
  dur?: number;
  gain?: number;
  delay?: number;
}

function tone(o: ToneOpts): void {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.end) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.end), t0 + (o.dur ?? 0.15));
  const dur = o.dur ?? 0.15;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.12, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  click(): void { tone({ freq: 520, dur: 0.06, gain: 0.06, type: 'triangle' }); },
  hover(): void { tone({ freq: 700, dur: 0.04, gain: 0.03, type: 'sine' }); },
  playCard(): void { tone({ freq: 660, end: 990, dur: 0.12, gain: 0.1, type: 'triangle' }); },
  hit(): void { tone({ freq: 180, end: 90, dur: 0.12, gain: 0.16, type: 'square' }); },
  crit(): void { tone({ freq: 220, end: 60, dur: 0.2, gain: 0.2, type: 'sawtooth' }); tone({ freq: 1100, dur: 0.08, gain: 0.1, type: 'sine', delay: 0.02 }); },
  block(): void { tone({ freq: 480, end: 320, dur: 0.08, gain: 0.08, type: 'triangle' }); },
  heal(): void { tone({ freq: 620, end: 940, dur: 0.18, gain: 0.08, type: 'sine' }); },
  buff(): void { tone({ freq: 880, dur: 0.1, gain: 0.07, type: 'triangle' }); },
  draw(): void { tone({ freq: 780, end: 620, dur: 0.07, gain: 0.06, type: 'sine' }); },
  energy(): void { tone({ freq: 440, end: 880, dur: 0.1, gain: 0.08, type: 'triangle' }); },
  seal(): void { tone({ freq: 1100, end: 1500, dur: 0.08, gain: 0.09, type: 'sine' }); },
  thunder(): void { tone({ freq: 1400, end: 180, dur: 0.22, gain: 0.14, type: 'sawtooth' }); tone({ freq: 90, dur: 0.25, gain: 0.12, type: 'square', delay: 0.02 }); },
  victory(): void {
    tone({ freq: 523, dur: 0.15, gain: 0.12, type: 'triangle' });
    tone({ freq: 659, dur: 0.15, gain: 0.12, type: 'triangle', delay: 0.12 });
    tone({ freq: 784, dur: 0.3, gain: 0.14, type: 'triangle', delay: 0.24 });
  },
  defeat(): void {
    tone({ freq: 392, end: 196, dur: 0.4, gain: 0.14, type: 'sawtooth' });
    tone({ freq: 130, end: 65, dur: 0.6, gain: 0.12, type: 'square', delay: 0.2 });
  },
  upgrade(): void { tone({ freq: 500, end: 1000, dur: 0.15, gain: 0.1, type: 'triangle' }); tone({ freq: 1200, dur: 0.1, gain: 0.08, type: 'sine', delay: 0.1 }); },
  coin(): void { tone({ freq: 1200, dur: 0.06, gain: 0.1, type: 'square' }); tone({ freq: 1600, dur: 0.08, gain: 0.1, type: 'square', delay: 0.06 }); },
};
