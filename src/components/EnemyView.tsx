import { Sword, Shield, TrendingUp, Plus, Zap, Hand } from 'lucide-react';
import type { BattleEnemy, IntentKind } from '@/types';
import StatusIcons from './StatusIcons';
import { cn } from '@/lib/utils';

function IntentIcon({ kind, value }: { kind: IntentKind; value: number }) {
  const common = 'w-4 h-4';
  switch (kind) {
    case 'attack':
    case 'charge':
      return (
        <span className="intent-attack flex items-center gap-0.5 font-mono text-sm font-bold">
          <Sword className={common} /> {value}
        </span>
      );
    case 'defend':
      return (
        <span className="intent-defend flex items-center gap-0.5 font-mono text-sm font-bold">
          <Shield className={common} /> {value}
        </span>
      );
    case 'buff':
      return (
        <span className="intent-buff flex items-center gap-0.5 font-mono text-sm font-bold">
          <TrendingUp className={common} /> {value}
        </span>
      );
    case 'summon':
      return (
        <span className="flex items-center gap-0.5 font-mono text-sm font-bold text-gold">
          <Plus className={common} />
        </span>
      );
    case 'steal':
      return (
        <span className="flex items-center gap-0.5 font-mono text-sm font-bold text-willow">
          <Hand className={common} /> {value}
        </span>
      );
    default:
      return <Zap className={common} />;
  }
}

export default function EnemyView({
  enemy,
  selected,
  onSelect,
  selectable,
}: {
  enemy: BattleEnemy;
  selected: boolean;
  onSelect: () => void;
  selectable: boolean;
}) {
  const intent = enemy.intents[enemy.intentIndex % enemy.intents.length];
  const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const isBoss = enemy.isBoss;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!selectable}
      className={cn(
        'relative flex w-44 flex-col items-center rounded-2xl border-2 p-3 transition-all',
        isBoss ? 'border-gold/50 bg-ink/80' : 'border-mint/25 bg-ink/60',
        selected && 'ring-4 ring-mint ring-offset-2 ring-offset-ink scale-105',
        selectable && 'hover:border-mint/70 hover:-translate-y-1 cursor-pointer',
        !selectable && 'cursor-default',
      )}
    >
      {/* 意图 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2 py-0.5 border border-mint/30">
        <IntentIcon kind={intent.kind} value={intent.value} />
      </div>

      {/* emoji */}
      <div className={cn('mb-1 mt-2 text-5xl', isBoss && 'animate-pulseGlow')}>
        {enemy.emoji}
      </div>
      <div className="font-display text-sm text-mint-light truncate w-full text-center">
        {enemy.name}
      </div>
      {isBoss && (
        <span className="text-[9px] text-gold font-bold tracking-widest">BOSS</span>
      )}
      {enemy.isElite && !isBoss && (
        <span className="text-[9px] text-danger font-bold tracking-widest">精英</span>
      )}

      {/* 格挡 */}
      {enemy.block > 0 && (
        <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded bg-mint/20 px-1 text-xs font-mono text-mint">
          <Shield className="w-3 h-3" /> {enemy.block}
        </span>
      )}

      {/* 血条 */}
      <div className="mt-1.5 w-full h-3 rounded-full bg-ink-lighter overflow-hidden border border-mint/20">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${hpPct}%`,
            background: isBoss
              ? 'linear-gradient(90deg,#FFD66B,#FF8C42)'
              : 'linear-gradient(90deg,#FF5C7A,#c93655)',
          }}
        />
      </div>
      <div className="mt-0.5 font-mono text-xs text-slate-300">
        {Math.max(0, enemy.hp)} / {enemy.maxHp}
      </div>

      {/* 状态 */}
      <div className="mt-1.5 min-h-[16px]">
        <StatusIcons statuses={enemy.statuses} />
      </div>
    </button>
  );
}
