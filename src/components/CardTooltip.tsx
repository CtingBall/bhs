import { cn } from '@/lib/utils';
import type { Card } from '@/types';
import { formatKeywordLine } from '@/data/keywords';
import { useState, useRef, useEffect } from 'react';

function describeEffects(effects: Card['effects']): string[] {
  return effects.map((e) => {
    const v = e.value ?? 0;
    const h = e.hits && e.hits > 1 ? `×${e.hits}段` : '';
    const pureScale = e.scaleBy && v === 0;
    const scaleLabel: Record<string, string> = {
      combo: `连击数×${e.scaleMultiplier ?? 1}`,
      block: `当前格挡值${e.scaleMultiplier && e.scaleMultiplier !== 1 ? `×${e.scaleMultiplier}` : ''}`,
      missingHp: `缺失生命×${e.scaleMultiplier ?? 1}`,
      missingHpDiv: `缺失生命÷${e.scaleMultiplier ?? 4}`,
      strength: `力量层数×${e.scaleMultiplier ?? 1}`,
      dexterity: `敏捷层数×${e.scaleMultiplier ?? 1}`,
      enemyBurn: `目标燃烧×${e.scaleMultiplier ?? 1}`,
      enemyFreeze: `目标冰冻×${e.scaleMultiplier ?? 1}`,
      enemyShock: `目标感电×${e.scaleMultiplier ?? 1}`,
      enemyWeak: `目标虚弱×${e.scaleMultiplier ?? 1}`,
      enemyVuln: `目标易伤×${e.scaleMultiplier ?? 1}`,
      handSize: `手牌数×${e.scaleMultiplier ?? 1}`,
      cardsPlayedThisTurn: `已出牌数×${e.scaleMultiplier ?? 1}`,
      attackCombo: `攻击累计×${e.scaleMultiplier ?? 1}`,
      killsThisCombat: `击杀数×${e.scaleMultiplier ?? 1}`,
      energyRemaining: `剩余能量×${e.scaleMultiplier ?? 1}`,
      enemyCount: `敌人数×${e.scaleMultiplier ?? 1}`,
    };
    const scaleAdd = e.scaleBy && !pureScale ? ` +${scaleLabel[e.scaleBy] ?? ''}` : '';
    const condLabel: Record<string, string> = {
      enemyHpBelow50: '目标半血以下时伤害翻倍',
      enemyHasWeak: '目标虚弱时伤害翻倍',
      enemyHasFreeze: '目标冰冻时伤害翻倍',
      enemyHasBurn: '目标燃烧时伤害翻倍',
      enemyHasVuln: '目标易伤时伤害翻倍',
      hpBelow50: '半血以下时费用为0',
      blockAbove0: '格挡>0时额外命中',
      firstCardThisTurn: '本回合第一张牌时伤害翻倍',
      handSizeAbove4: '手牌≥5时伤害翻倍',
      enemyIsBoss: 'Boss战时伤害翻倍',
      energyAtZero: '能量为0时抽牌',
    };
    const sideLabel = e.sideEffect ? ` 附加${e.sideEffect.kind === 'draw' ? '抽牌' : e.sideEffect.kind === 'block' ? '格挡' : e.sideEffect.kind === 'heal' ? '回复' : e.sideEffect.kind === 'energy' ? '能量' : '效果'}` : '';
    const cond = e.conditionalBonus ? `（${condLabel[e.conditionalBonus.condition] ?? '条件效果'}）` : '';
    switch (e.kind) {
      case 'damage':
        return pureScale
          ? `造成等同于${scaleLabel[e.scaleBy!] ?? ''}的伤害${h}${cond}`
          : `造成 ${v} 伤害${h}${scaleAdd}${cond}`;
      case 'damageAll':
        return pureScale
          ? `对所有敌人造成等同于${scaleLabel[e.scaleBy!] ?? ''}的伤害${cond}`
          : `对所有敌人造成 ${v} 伤害${scaleAdd}${cond}`;
      case 'block':
        return pureScale
          ? `获得等同于${scaleLabel[e.scaleBy!] ?? ''}的格挡${cond}`
          : `获得 ${v} 格挡${scaleAdd}${cond}`;
      case 'heal':
        if (v < 0) return `失去 ${-v} 生命`;
        return pureScale
          ? `回复等同于${scaleLabel[e.scaleBy!] ?? ''}的生命${cond}`
          : `回复 ${v} 生命${scaleAdd}`;
      case 'draw': return `抽 ${v} 张牌`;
      case 'energy': return `获得 ${v} 能量`;
      case 'maxHp': return `最大生命 +${v}`;
      case 'summon': return `召唤星痕`;
      case 'applyStatus': {
        const statusName: Record<string, string> = {
          strength: '力量', dexterity: '敏捷', vuln: '易伤', weak: '虚弱',
          freeze: '冰冻', burn: '燃烧', shock: '感电', regen: '再生', frail: '脆弱',
        };
        const s = statusName[e.status ?? ''] ?? e.status ?? '?';
        const target = e.all ? '全体' : e.statusTarget === 'self' ? '自身' : '敌人';
        return `给${target}施加 ${v} 层${s}`;
      }
      case 'upgradeRandom': return `随机升级一张非诅咒牌`;
      default: return `${e.kind} ${v}`;
    }
  });
}

export default function CardTooltip({ card, className }: { card: Card; className?: string }) {
  const effects = describeEffects(card.effects);
  const kwLine = formatKeywordLine(card.keywords);
  const rarityColor: Record<string, string> = {
    basic: 'text-slate-400', common: 'text-slate-300', rare: 'text-cyan-400',
    epic: 'text-purple-400', legendary: 'text-amber-400',
  };
  const ref = useRef<HTMLDivElement>(null);
  const [flipX, setFlipX] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.right > window.innerWidth - 10) setFlipX(true);
    else setFlipX(false);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-[200] top-full mt-1',
        flipX ? 'right-0' : 'left-1/2 -translate-x-1/2',
        'bg-ink border border-mint/30 rounded-xl p-3 shadow-2xl',
        'w-56 pointer-events-none',
        'animate-[fadeIn_0.15s_ease-out]',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={cn('font-display text-sm', rarityColor[card.rarity] ?? 'text-slate-300')}>
          {card.name}
        </span>
        {card.nurtureLevel > 0 && (
          <span className="text-[10px] text-gold font-mono">Lv.{card.nurtureLevel}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2 text-[10px] text-slate-500 font-mono">
        <span>{card.cost === 0 ? '零费' : `${card.cost} 费`}</span>
        <span className="text-slate-600">|</span>
        <span>
          {card.type === 'attack' ? '攻击' : card.type === 'skill' ? '技能' : card.type === 'summon' ? '召唤' : card.type === 'curse' ? '诅咒' : card.type}
        </span>
        {card.exhaust && <span className="text-slate-600">|</span>}
        {card.exhaust && <span className="text-gold/60">消耗</span>}
      </div>

      {effects.length > 0 && (
        <div className="mb-2">
          {effects.map((desc, i) => (
            <div key={i} className="text-[11px] text-slate-300 leading-relaxed">{desc}</div>
          ))}
        </div>
      )}

      {kwLine && (
        <div className="mb-2 text-[10px] text-cyan-300/90 leading-relaxed">
          词条：{kwLine}
        </div>
      )}

      {card.flavor && (
        <div className="mt-1.5 pt-1.5 border-t border-mint/10 text-[9px] text-slate-600 italic">{card.flavor}</div>
      )}

      {card.nurtureLevel > 0 && (
        <div className="mt-1 text-[9px] text-gold/60">
          养成 Lv.{card.nurtureLevel} · 核心数值随等级成长
        </div>
      )}
    </div>
  );
}
