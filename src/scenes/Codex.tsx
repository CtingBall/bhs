import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useMetaStore } from '@/store/metaStore';
import { CARD_TEMPLATES, createCardInstance } from '@/data/cards';
import { KEYWORDS } from '@/data/keywords';
import { ENEMIES } from '@/data/enemies';
import { RELICS } from '@/data/relics';
import ParticleBg from '@/components/ParticleBg';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'card' | 'enemy' | 'relic';

export default function Codex() {
  const goScene = useGameStore((s) => s.goScene);
  const meta = useMetaStore();
  const [tab, setTab] = useState<Tab>('card');

  return (
    <div className="grid-bg relative min-h-screen overflow-y-auto px-6 py-6">
      <ParticleBg density={25} />
      <div className="relative z-10 mx-auto max-w-4xl">
        <button
          onClick={() => goScene('menu')}
          className="mb-4 inline-flex items-center gap-1 text-sm text-mint/70 hover:text-mint"
        >
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>

        <h2 className="font-display text-3xl text-mint text-glow mb-4">图鉴 · 梗百科</h2>

        <div className="flex gap-2 mb-5">
          {(['card', 'enemy', 'relic'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-display transition-all',
                tab === t ? 'bg-mint text-ink' : 'glass-light text-mint/70 hover:text-mint',
              )}
            >
              {t === 'card' ? `卡牌 (${meta.unlockedCards.length}/${CARD_TEMPLATES.length})` : t === 'enemy' ? `敌人 (${meta.unlockedEnemies.length}/${ENEMIES.length})` : `遗物 (${RELICS.length})`}
            </button>
          ))}
        </div>

        {tab === 'card' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CARD_TEMPLATES.map((t) => {
              const c = createCardInstance(t);
              const unlocked = meta.unlockedCards.includes(t.id);
              return (
                <div
                  key={t.id}
                  className={cn(
                    'glass-light rounded-lg p-2 border',
                    unlocked ? 'border-mint/30' : 'border-slate-700 opacity-40',
                  )}
                >
                  <div className="font-display text-sm text-mint-light">
                    {unlocked ? c.name : '？？？'}
                  </div>
                  {unlocked ? (
                    <>
                      <div className="text-[10px] text-slate-300 mt-0.5">{c.text}</div>
                      {c.flavor && (
                        <div className="text-[9px] text-mint/50 italic mt-1">{c.flavor}</div>
                      )}
                    </>
                  ) : (
                    <div className="text-[10px] text-slate-500 mt-0.5">未解锁</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'card' && (
          <div className="mt-4 glass-light rounded-lg p-3 border border-cyan-400/20">
            <div className="text-xs text-cyan-300 font-mono mb-2">词条图鉴（模块化修饰）</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {KEYWORDS.map((k) => (
                <div key={k.id} className="text-[10px] text-slate-300">
                  <span className="text-cyan-300">{k.name}</span> — {k.desc}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'enemy' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ENEMIES.map((e) => {
              const unlocked = meta.unlockedEnemies.includes(e.id);
              return (
                <div
                  key={e.id}
                  className={cn(
                    'glass-light rounded-lg p-2 border flex items-center gap-2',
                    unlocked ? 'border-danger/30' : 'border-slate-700 opacity-40',
                  )}
                >
                  <span className="text-2xl">{unlocked ? e.emoji : '❔'}</span>
                  <div>
                    <div className="font-display text-sm text-mint-light">
                      {unlocked ? e.name : '？？？'}
                    </div>
                    {unlocked && <div className="text-[9px] text-slate-400">{e.desc}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'relic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {RELICS.map((r) => (
              <div key={r.id} className="glass-light rounded-lg p-2 border border-gold/30">
                <div className="font-display text-sm text-gold">✦ {r.name}</div>
                <div className="text-[10px] text-slate-300 mt-0.5">{r.text}</div>
                {r.flavor && (
                  <div className="text-[9px] text-gold/50 italic mt-1">{r.flavor}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-[10px] text-slate-500">
          图鉴随你遭遇的敌人和获得的卡牌自动解锁。沉淀点数：{meta.sediment}
        </div>
      </div>
    </div>
  );
}
