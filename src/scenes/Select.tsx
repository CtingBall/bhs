import { useGameStore } from '@/store/gameStore';
import { CHARACTERS } from '@/data/characters';
import { CLASS_NAME } from '@/types';
import { buildDeckFromIds } from '@/data/cards';
import ParticleBg from '@/components/ParticleBg';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default function Select() {
  const selectedId = useGameStore((s) => s.selectedCharacterId);
  const setSelected = useGameStore((s) => s.setSelectedCharacter);
  const startNewRun = useGameStore((s) => s.startNewRun);
  const goScene = useGameStore((s) => s.goScene);

  const ch = CHARACTERS.find((c) => c.id === selectedId) ?? CHARACTERS[0];
  const deck = buildDeckFromIds(ch.initialDeck);

  return (
    <div className="grid-bg relative min-h-screen overflow-y-auto px-6 py-8">
      <ParticleBg density={40} />
      <div className="relative z-10 mx-auto max-w-5xl">
        <button
          onClick={() => goScene('menu')}
          className="mb-4 inline-flex items-center gap-1 text-sm text-mint/70 hover:text-mint"
        >
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
        <h2 className="font-display text-3xl text-mint text-glow mb-1">选择你的化身</h2>
        <p className="text-xs text-slate-400 mb-6">薄荷色氏族的成员们已就位，选一位踏上星痕大陆</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={cn(
                'glass-light card-hover rounded-xl p-3 text-center border-2',
                selectedId === c.id ? 'border-mint ring-2 ring-mint/50' : 'border-transparent',
              )}
              style={{ borderColor: selectedId === c.id ? c.color : undefined }}
            >
              <div className="text-4xl mb-1" style={{ filter: `drop-shadow(0 0 8px ${c.color})` }}>
                {c.emoji}
              </div>
              <div className="font-display text-sm" style={{ color: c.color }}>
                {c.name}
              </div>
              <div className="text-[10px] text-slate-400">{CLASS_NAME[c.classId]}</div>
            </button>
          ))}
        </div>

        {/* 详情 */}
        <div className="glass rounded-2xl p-5" style={{ borderColor: `${ch.color}55` }}>
          <div className="flex items-start gap-4">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl text-5xl"
              style={{ background: `${ch.color}22`, border: `2px solid ${ch.color}` }}
            >
              {ch.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-2xl" style={{ color: ch.color }}>
                  {ch.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-ink border border-mint/30 text-mint">
                  {CLASS_NAME[ch.classId]}
                </span>
                <span className="text-xs text-slate-400">「{ch.title}」</span>
              </div>
              <p className="text-sm text-slate-300 mt-1">{ch.desc}</p>
              <div className="mt-3 rounded-lg bg-ink/60 border border-mint/20 p-3">
                <div className="text-xs font-bold text-gold mb-0.5">
                  被动 · {ch.passiveName}
                </div>
                <div className="text-sm text-mint-light">{ch.passiveDesc}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-slate-400 mb-1.5">初始牌组（{deck.length} 张）</div>
            <div className="flex flex-wrap gap-1.5">
              {deck.map((c, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-ink-lighter border border-mint/20 text-slate-300"
                  title={c.text}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button className="btn-mint text-lg" onClick={() => startNewRun(ch.id)}>
            进入星痕大陆
          </button>
        </div>
      </div>
    </div>
  );
}
