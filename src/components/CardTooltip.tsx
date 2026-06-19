import { cn } from '@/lib/utils';
import type { Card } from '@/types';

// 把 CardEffect 翻译为可读的中文描述
function describeEffects(effects: Card['effects']): string[] {
  return effects.map((e) => {
    const v = e.value ?? 0;
    const h = e.hits ? `×${e.hits}段` : '';
    const sign = v >= 0 ? '' : '';
    switch (e.kind) {
      case 'damage': return `造成 ${v} 伤害${h}`;
      case 'damageAll': return `对所有敌人造成 ${v} 伤害`;
      case 'block': return `获得 ${v} 格挡`;
      case 'heal': return v >= 0 ? `回复 ${v} 生命` : `失去 ${-v} 生命`;
      case 'draw': return `抽 ${v} 张牌`;
      case 'energy': return `获得 ${v} 能量`;
      case 'maxHp': return `最大生命 +${v}`;
      case 'summon': return `召唤 ${e.summonId ?? '?'}`;
      case 'applyStatus': {
        const statusName: Record<string, string> = {
          strength: '力量', dexterity: '敏捷', vuln: '易伤', weak: '虚弱',
          freeze: '冰冻', burn: '燃烧', shock: '感电', regen: '再生', frail: '脆弱',
        };
        const s = statusName[e.status ?? ''] ?? e.status ?? '?';
        const target = e.all ? '全体' : e.statusTarget === 'self' ? '自身' : '敌人';
        return `给${target}施加 ${v} 层${s}`;
      }
      case 'upgradeRandom': return '随机升级一张手牌';
      default: return `${e.kind} ${v}`;
    }
  });
}

export default function CardTooltip({ card, className }: { card: Card; className?: string }) {
  const effects = describeEffects(card.effects);
  const rarityColor: Record<string, string> = {
    basic: 'text-slate-400', common: 'text-slate-300', rare: 'text-cyan-400',
    epic: 'text-purple-400', legendary: 'text-amber-400',
  };

  return (
    <div className={cn(
      'absolute z-[200] top-full left-1/2 -translate-x-1/2 mt-1',
      'bg-ink border border-mint/30 rounded-xl p-3 shadow-2xl',
      'w-56 pointer-events-none',
      'animate-[fadeIn_0.15s_ease-out]',
      className,
    )}>
      {/* 名称 + 稀有度 */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className={cn('font-display text-sm', rarityColor[card.rarity] ?? 'text-slate-300')}>
          {card.name}
        </span>
        {card.upgradeLevel ? (
          <span className="text-[10px] text-gold">{'★'.repeat(card.upgradeLevel)}</span>
        ) : null}
      </div>

      {/* 费用 + 类型 */}
      <div className="flex items-center gap-2 mb-2 text-[10px] text-slate-500 font-mono">
        <span>{card.cost === 0 ? '零费' : `${card.cost} 费`}</span>
        <span className="text-slate-600">|</span>
        <span>{card.type === 'attack' ? '攻击' : card.type === 'skill' ? '技能' : card.type === 'summon' ? '召唤' : card.type === 'curse' ? '诅咒' : card.type}</span>
        <span className="text-slate-600">|</span>
        <span>{card.rarity}</span>
      </div>

      {/* 效果 */}
      {effects.length > 0 && (
        <div className="mb-2">
          {effects.map((desc, i) => (
            <div key={i} className="text-[11px] text-slate-300 leading-relaxed">{desc}</div>
          ))}
        </div>
      )}

      {/* 描述文字 */}
      <div className="text-[10px] text-slate-500 leading-relaxed">{card.text}</div>

      {/* 风味 */}
      {card.flavor && (
        <div className="mt-1.5 pt-1.5 border-t border-mint/10 text-[9px] text-slate-600 italic">{card.flavor}</div>
      )}

      {/* 升级状态 */}
      {card.upgradeLevel ? (
        <div className="mt-1 text-[9px] text-gold/60">已升级 {card.upgradeLevel > 0 ? '★'.repeat(card.upgradeLevel) : ''} (伤害/格挡 +{card.upgradeLevel * 2})</div>
      ) : null}
    </div>
  );
}
