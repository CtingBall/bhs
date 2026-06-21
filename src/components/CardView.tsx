import type { Card } from '@/types';
import { cn } from '@/lib/utils';
import CardTooltip from '@/components/CardTooltip';
import { formatKeywordLine } from '@/data/keywords';
import { useState } from 'react';

const TYPE_STYLE: Record<Card['type'], { ring: string; tag: string; label: string }> = {
  attack: { ring: 'border-danger/60', tag: 'bg-danger/20 text-danger', label: '攻击' },
  skill: { ring: 'border-mint/60', tag: 'bg-mint/20 text-mint', label: '技能' },
  summon: { ring: 'border-gold/60', tag: 'bg-gold/20 text-gold', label: '星痕' },
  curse: { ring: 'border-willow/60', tag: 'bg-willow/20 text-willow', label: '诅咒' },
  event_card: { ring: 'border-amber/60', tag: 'bg-amber/20 text-amber', label: '事件' },
};

const RARITY_GLOW: Record<Card['rarity'], string> = {
  basic: 'shadow-[0_0_8px_rgba(150,150,160,0.15)]',
  common: 'shadow-[0_0_12px_rgba(180,200,210,0.25)]',
  rare: 'shadow-[0_0_16px_rgba(91,200,255,0.4)]',
  epic: 'shadow-[0_0_18px_rgba(176,124,255,0.45)]',
  legendary: 'shadow-[0_0_22px_rgba(255,214,107,0.55)]',
};

export default function CardView({
  card,
  onClick,
  disabled,
  selected,
  size = 'md',
  playable,
}: {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  playable?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const ts = TYPE_STYLE[card.type];
  const dims =
    size === 'sm'
      ? 'w-28 h-40 text-[10px]'
      : size === 'lg'
        ? 'w-48 h-72 text-sm'
        : 'w-36 h-52 text-xs';

  const unplayable = disabled || (playable === false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
    <button
      type="button"
      onClick={onClick}
      disabled={unplayable}
      className={cn(
        'card-hover relative flex flex-col rounded-xl border-2 bg-gradient-to-b from-ink-light to-ink p-2 text-left font-body',
        ts.ring,
        RARITY_GLOW[card.rarity],
        dims,
        selected && 'ring-4 ring-mint ring-offset-2 ring-offset-ink',
        unplayable ? 'opacity-45 grayscale cursor-not-allowed' : 'cursor-pointer',
        card.rarity === 'legendary' && 'border-gold',
      )}
    >
      {/* 耗能角标 */}
      <div
        className={cn(
          'absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono font-bold text-white',
          card.type === 'curse'
            ? 'border-willow bg-willow/30'
            : 'border-mint bg-ink text-mint',
        )}
        style={{ minWidth: 32 }}
      >
        {card.cost}
      </div>

      {/* 卡名 */}
      <div className="mt-3 mb-1 flex items-center justify-between gap-1">
        <span className="font-display leading-tight text-mint-light text-glow truncate">
          {card.name}
        </span>
      </div>

      {/* 类型标签 + 养成等级 */}
      <div className="mb-1.5 flex flex-wrap items-center gap-1">
        <span className={cn('inline-block w-fit rounded px-1.5 py-0.5 text-[9px] font-bold', ts.tag)}>
          {ts.label}
        </span>
        {card.nurtureLevel > 0 && (
          <span className="rounded bg-gold/15 px-1 py-0.5 text-[8px] font-mono text-gold">
            Lv.{card.nurtureLevel}
          </span>
        )}
      </div>

      {/* 词条摘要 */}
      {formatKeywordLine(card.keywords) && (
        <p className="mb-1 text-[8px] text-cyan-300/80 line-clamp-2">
          {formatKeywordLine(card.keywords)}
        </p>
      )}

      {/* 描述 */}
      <p className="flex-1 overflow-hidden text-slate-200/90 leading-snug">{card.text}</p>

      {/* flavor */}
      {card.flavor && size !== 'sm' && (
        <p className="mt-1 border-t border-mint/10 pt-1 text-[9px] italic text-mint/50 leading-tight line-clamp-2">
          {card.flavor}
        </p>
      )}
    </button>
      {hover && <CardTooltip card={card} />}
    </div>
  );
}
