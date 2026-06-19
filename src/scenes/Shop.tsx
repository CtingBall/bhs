import { useGameStore } from '@/store/gameStore';
import CardView from '@/components/CardView';
import ParticleBg from '@/components/ParticleBg';
import { SUMMON_RECIPES } from '@/data/summonRecipes';
import { SUMMON_MAP } from '@/data/summons';
import { Coins, Sparkles, Gem, LogOut, Scissors, Hammer, Dna, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function Shop() {
  const run = useGameStore((s) => s.run);
  const shop = useGameStore((s) => s.shop);
  const buyCard = useGameStore((s) => s.buyShopCard);
  const buyRelic = useGameStore((s) => s.buyShopRelic);
  const removeCard = useGameStore((s) => s.removeShopCard);
  const reforgeCard = useGameStore((s) => s.reforgeCard);
  const fuseSummons = useGameStore((s) => s.fuseSummons);
  const leave = useGameStore((s) => s.leaveShop);
  const [tab, setTab] = useState<'cards' | 'relic' | 'reforge' | 'fuse'>('cards');

  if (!run || !shop) return null;

  return (
    <div className="grid-bg relative min-h-screen overflow-y-auto px-6 py-6">
      <ParticleBg density={25} />
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* 顶栏 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-3xl text-gold text-glow-gold">星痕商店</h2>
          <div className="flex gap-4 font-mono text-sm">
            <span className="flex items-center gap-1 text-gold"><Coins className="w-4 h-4" /> {run.rope}</span>
            <span className="flex items-center gap-1 text-willow"><Sparkles className="w-4 h-4" /> {run.will}</span>
            <span className="flex items-center gap-1 text-amber"><Gem className="w-4 h-4" /> {run.amber}</span>
            <span className="flex items-center gap-1 text-cyan-300"><Hammer className="w-4 h-4" /> {run.reforgeStones ?? 0}</span>
          </div>
        </div>

        {/* 因子展示 */}
        {run.factors.length > 0 && (
          <div className="glass-light rounded-lg px-3 py-2 mb-4 flex items-center gap-3">
            <span className="text-xs text-mint/60 font-mono">已装备因子：</span>
            {run.factors.map((f) => (
              <span key={f.id} title={f.desc} className="text-sm text-gold border border-gold/30 rounded px-2 py-0.5">
                {f.emoji} {f.name}
              </span>
            ))}
          </div>
        )}

        {/* 标签栏 */}
        <div className="flex gap-1 mb-4">
          {[
            { id: 'cards' as const, label: '抽卡台', icon: Coins },
            { id: 'relic' as const, label: '遗物/删卡', icon: Gem },
            { id: 'reforge' as const, label: '重铸台', icon: Hammer },
            { id: 'fuse' as const, label: '融合台', icon: Dna },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-3 py-1.5 rounded-t-lg text-xs font-mono transition-all',
                tab === t.id ? 'bg-mint/15 text-mint border-b-2 border-mint' : 'text-slate-400 hover:text-mint',
              )}
            >
              <t.icon className="w-3 h-3 inline mr-1" />{t.label}
            </button>
          ))}
        </div>

        {/* 抽卡台 */}
        {tab === 'cards' && (
          <div className="mb-6">
            <div className="text-xs text-mint/60 mb-2 font-mono">抽卡台（用绳子购买）· 保底 {3 - ((run.pityCounter ?? 0) % 3)}/3</div>
            <div className="flex justify-center gap-4">
              {shop.cards.map((item, i) => {
                const bought = shop.boughtCards.includes(i);
                const afford = run.rope >= item.price;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <CardView
                      card={item.card}
                      size="md"
                      playable={!bought && afford}
                      onClick={() => buyCard(i)}
                    />
                    <span
                      className={cn(
                        'font-mono text-xs',
                        bought ? 'text-slate-500 line-through' : afford ? 'text-gold' : 'text-danger',
                      )}
                    >
                      {bought ? '已售' : `${item.price} 绳`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 遗物 + 删卡 */}
        {tab === 'relic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-amber/70 mb-2 font-mono">遗物（用琥珀购买）</div>
              {shop.relic && !shop.relicBought ? (
                <button
                  onClick={buyRelic}
                  disabled={run.amber < shop.relicPrice}
                  className="w-full text-left rounded-lg border border-amber/40 bg-amber/5 p-3 hover:border-amber transition-all disabled:opacity-40"
                >
                  <div className="font-display text-amber">✦ {shop.relic.name}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{shop.relic.text}</div>
                  <div className="text-xs text-amber font-mono mt-1">{shop.relicPrice} 琥珀</div>
                </button>
              ) : (
                <div className="text-slate-500 text-sm py-4 text-center">
                  {shop.relicBought ? '已购买' : '今日无货'}
                </div>
              )}
            </div>

            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-willow/70 font-mono flex items-center gap-1">
                  <Scissors className="w-3 h-3" /> 删卡台（{shop.removePrice} 意志/次，仅一次）
                </span>
              </div>
              {shop.removed ? (
                <div className="text-slate-500 text-sm py-4 text-center">已使用</div>
              ) : (
                <div className="max-h-40 overflow-y-auto flex flex-wrap gap-1">
                  {run.deck.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => removeCard(c.id)}
                      disabled={run.will < shop.removePrice}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-ink-lighter border border-willow/20 text-slate-300 hover:border-willow hover:text-willow disabled:opacity-30"
                      title={c.text}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 重铸台 */}
        {tab === 'reforge' && (
          <div className="glass rounded-xl p-4">
            <div className="text-xs text-cyan-300/70 mb-3 font-mono flex items-center gap-1">
              <Hammer className="w-3 h-3" /> 重铸台（消耗重铸石升级卡牌）
              <span className="ml-auto">当前重铸石：{run.reforgeStones ?? 0}</span>
            </div>
            <div className="max-h-60 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
              {run.deck.filter((c) => c.type !== 'curse').map((c, i) => {
                const level = c.upgradeLevel ?? 0;
                const cost = level === 0 ? 2 : 4;
                const maxed = level >= 2;
                const afford = (run.reforgeStones ?? 0) >= cost;
                return (
                  <button
                    key={i}
                    onClick={() => !maxed && afford && reforgeCard(c.id)}
                    disabled={maxed || !afford}
                    className={cn(
                      'text-left rounded-lg border p-2 transition-all',
                      maxed
                        ? 'border-gold/40 bg-gold/5 opacity-60'
                        : afford
                          ? 'border-cyan-400/30 bg-cyan-400/5 hover:border-cyan-400'
                          : 'border-slate-700 opacity-40',
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-200 font-body">{c.name}</span>
                      {level > 0 && (
                        <span className="text-[8px] text-gold flex">
                          {Array(level).fill('★').map((s, j) => <Star key={j} className="w-2 h-2" />)}
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {maxed ? '已精通' : `升级需 ${cost} 石头`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 融合台 */}
        {tab === 'fuse' && (
          <div className="glass rounded-xl p-4">
            <div className="text-xs text-purple-300/70 mb-3 font-mono flex items-center gap-1">
              <Dna className="w-3 h-3" /> 召唤物融合台（消耗2张召唤牌合成更强的召唤物）
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUMMON_RECIPES.map((recipe) => {
                const hasMaterials = recipe.materials.every((matId) =>
                  run.deck.some((c) => c.id === `summon-${matId}` || c.id === matId),
                );
                const result = SUMMON_MAP[recipe.resultSummonId];
                return (
                  <button
                    key={recipe.id}
                    onClick={() => hasMaterials && fuseSummons(recipe.id)}
                    disabled={!hasMaterials}
                    className={cn(
                      'text-left rounded-lg border p-3 transition-all',
                      hasMaterials
                        ? 'border-purple-400/40 bg-purple-400/5 hover:border-purple-400 cursor-pointer'
                        : 'border-slate-700 opacity-40 cursor-not-allowed',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{result?.emoji ?? '🔮'}</span>
                      <div>
                        <div className="font-display text-sm text-purple-300">{recipe.name}</div>
                        <div className="text-[10px] text-slate-400">{recipe.desc}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-500">
                      <span>材料：</span>
                      {recipe.materials.map((matId) => {
                        const mat = SUMMON_MAP[matId];
                        const has = run.deck.some((c) => c.id === `summon-${matId}` || c.id === matId);
                        return (
                          <span key={matId} className={has ? 'text-mint' : 'text-danger'}>
                            {mat?.emoji ?? matId} {mat?.name ?? matId}
                          </span>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button className="btn-ghost" onClick={leave}>
            <span className="inline-flex items-center gap-1">
              <LogOut className="w-4 h-4" /> 离开商店
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
