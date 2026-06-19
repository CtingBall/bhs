import { useGameStore } from '@/store/gameStore';
import CardView from '@/components/CardView';
import { cn } from '@/lib/utils';
import { X, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function DeckViewer() {
  const run = useGameStore((s) => s.run);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'attack' | 'skill' | 'summon' | 'curse'>('all');

  if (!run) return null;

  const deck = filter === 'all' ? run.deck : run.deck.filter((c) => c.type === filter);
  const counts = {
    all: run.deck.length,
    attack: run.deck.filter((c) => c.type === 'attack').length,
    skill: run.deck.filter((c) => c.type === 'skill').length,
    summon: run.deck.filter((c) => c.type === 'summon').length,
    curse: run.deck.filter((c) => c.type === 'curse').length,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-50 flex items-center gap-1 rounded-lg bg-ink-lighter border border-mint/30 px-3 py-1.5 text-xs text-mint/80 hover:bg-mint/10 transition-colors font-mono"
        title="查看牌组"
      >
        <BookOpen className="w-3.5 h-3.5" />
        牌组 {run.deck.length}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-ink/95 flex flex-col overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-mint/20">
            <span className="font-display text-mint text-lg">你的牌组</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 过滤器 */}
          <div className="flex gap-1 px-4 py-2 border-b border-mint/10">
            {(['all', 'attack', 'skill', 'summon', 'curse'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-mono transition-colors',
                  filter === f
                    ? 'bg-mint/20 text-mint border border-mint/40'
                    : 'bg-ink-lighter text-slate-400 border border-transparent hover:text-slate-200',
                )}
              >
                {f === 'all' ? '全部' : f === 'attack' ? '攻击' : f === 'skill' ? '技能' : f === 'summon' ? '召唤' : '诅咒'}
                <span className="ml-1 opacity-50">{counts[f]}</span>
              </button>
            ))}
          </div>

          {/* 卡牌列表 */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-wrap gap-2 justify-center content-start">
              {deck.map((card, i) => (
                <CardView key={`${card.id}-${i}`} card={card} size="sm" playable={false} />
              ))}
            </div>
            {deck.length === 0 && (
              <div className="text-slate-500 text-sm py-12 text-center">暂无此类卡牌</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
