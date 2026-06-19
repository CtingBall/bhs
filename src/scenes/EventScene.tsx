import { useGameStore } from '@/store/gameStore';
import ParticleBg from '@/components/ParticleBg';
import { Dices } from 'lucide-react';

export default function EventScene() {
  const ev = useGameStore((s) => s.pendingEvent);
  const resolve = useGameStore((s) => s.resolveEvent);

  if (!ev) return null;
  return (
    <div className="grid-bg relative min-h-screen flex items-center justify-center px-6 py-8">
      <ParticleBg density={30} />
      <div className="relative z-10 w-full max-w-lg animate-slideUp">
        <div className="glass rounded-2xl p-6 border-2 border-mint/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{ev.emoji}</span>
            <h2 className="font-display text-2xl text-mint text-glow">{ev.title}</h2>
          </div>

          {/* 群聊引用块 */}
          <blockquote className="border-l-2 border-mint/60 pl-3 my-4 text-sm italic text-mint-light/80 leading-relaxed bg-ink/40 py-2 rounded-r">
            {ev.text}
          </blockquote>

          <div className="space-y-2 mt-5">
            {ev.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => resolve(i)}
                className="w-full text-left rounded-xl border border-mint/25 bg-ink/60 px-4 py-3 hover:border-mint hover:bg-ink-light transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-mint-light group-hover:text-glow">
                    {opt.label}
                  </span>
                  {opt.gamble && (
                    <span className="flex items-center gap-1 text-[10px] text-gold font-mono">
                      <Dices className="w-3 h-3" /> {Math.round(opt.gamble.chance * 100)}%
                    </span>
                  )}
                </div>
                {opt.resultText && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{opt.resultText}</p>
                )}
                {opt.gamble && (
                  <p className="text-[10px] text-gold/60 mt-0.5">
                    成功：{opt.gamble.winText}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
