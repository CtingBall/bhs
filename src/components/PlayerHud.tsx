import { Heart, Zap, Shield } from 'lucide-react';
import type { Character, Caste, PlayerState } from '@/types';
import { CASTE_NAME } from '@/types';
import StatusIcons from './StatusIcons';

const CASTE_COLOR: Record<Caste, string> = {
  dalit: 'text-slate-400 border-slate-400/40',
  vaishya: 'text-mint border-mint/40',
  kshatriya: 'text-gold border-gold/40',
  brahmin: 'text-willow border-willow/60',
};

export default function PlayerHud({
  player,
  character,
  caste,
}: {
  player: PlayerState;
  character: Character;
  caste: Caste;
}) {
  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);

  return (
    <div className="glass flex items-center gap-4 rounded-2xl px-4 py-3">
      {/* 头像 */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-xl border-2 border-mint/50 bg-ink text-4xl">
        {character.emoji}
        <span
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border bg-ink px-1.5 py-0.5 text-[9px] font-bold ${CASTE_COLOR[caste]}`}
        >
          {CASTE_NAME[caste]}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-display text-mint-light truncate text-glow">{character.name}</div>

        {/* HP */}
        <div className="mt-1 flex items-center gap-2">
          <Heart className="w-4 h-4 text-danger" />
          <div className="flex-1 h-3 rounded-full bg-ink-lighter overflow-hidden border border-danger/30">
            <div
              className="h-full bg-gradient-to-r from-danger to-[#c93655] transition-all duration-300"
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="font-mono text-xs text-slate-300 w-16 text-right">
            {Math.max(0, player.hp)}/{player.maxHp}
          </span>
        </div>

        {/* 能量 + 格挡 */}
        <div className="mt-1 flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-sm">
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-gold font-bold">{player.energy}</span>
            <span className="text-slate-500">/{player.maxEnergy}</span>
          </span>
          {player.block > 0 && (
            <span className="flex items-center gap-1 font-mono text-sm">
              <Shield className="w-4 h-4 text-mint" />
              <span className="text-mint font-bold">{player.block}</span>
            </span>
          )}
        </div>

        <div className="mt-1 min-h-[16px]">
          <StatusIcons statuses={player.statuses} />
        </div>
      </div>
    </div>
  );
}

export { CASTE_COLOR };
