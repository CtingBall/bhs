import { useGameStore } from '@/store/gameStore';
import CardView from '@/components/CardView';
import EnemyView from '@/components/EnemyView';
import PlayerHud from '@/components/PlayerHud';
import { cn } from '@/lib/utils';
import { Layers, Trash2, Swords, ScrollText, Hand } from 'lucide-react';
import { useEffect, useRef } from 'react';
import DeckViewer from '@/components/DeckViewer';

export default function Battle() {
  const battle = useGameStore((s) => s.battle);
  const character = useGameStore((s) => s.character);
  const run = useGameStore((s) => s.run);
  const targetUid = useGameStore((s) => s.targetEnemyUid);
  const setTarget = useGameStore((s) => s.setTarget);
  const playCardAction = useGameStore((s) => s.playCardAction);
  const endTurnAction = useGameStore((s) => s.endTurnAction);

  const logEndRef = useRef<HTMLDivElement>(null);

  // 日志自动滚动到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battle?.log.length]);

  if (!battle || !character || !run) return null;

  const log = battle.log.slice(-30);

  return (
    <div className="grid-bg relative flex min-h-screen flex-col overflow-hidden px-4 py-3">
      {/* 顶部：回合信息 */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-mint/60">
          第 {battle.turn} 回合 · {battle.isPlayerTurn ? '你的回合' : '敌人回合'}
        </span>
        {battle.battleEvent?.kind && (
          <span className="font-mono text-xs text-gold animate-pulseGlow px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
            {battle.battleEvent.kind === 'noteField' && '🎵 音符场'}
            {battle.battleEvent.kind === 'shinyGoblin' && '👺 闪耀哥布林'}
            {battle.battleEvent.kind === 'sacrificeDance' && '💃 奉献之舞'}
          </span>
        )}
        <span className="font-mono text-xs text-slate-400">
          连击 {battle.combo}
        </span>
      </div>

      {/* 主战斗区 + 侧边日志 */}
      <div className="flex flex-1 gap-3 min-h-0">
        {/* 左侧：战斗区域 */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* 敌人区 */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {battle.enemies.map((e) => (
                <EnemyView
                  key={e.uid}
                  enemy={e}
                  selected={targetUid === e.uid}
                  selectable={battle.isPlayerTurn && !battle.over}
                  onSelect={() => setTarget(e.uid)}
                />
              ))}
            </div>
            {battle.enemies.length > 1 && battle.isPlayerTurn && !battle.over && (
              <p className="text-[10px] text-mint/50 mt-1">点击敌人选择目标</p>
            )}
          </div>

          {/* 召唤物 */}
          {battle.summons.length > 0 && (
            <div className="flex justify-center gap-2 my-2">
              {battle.summons.map((s) => (
                <div
                  key={s.uid}
                  title={s.name}
                  className="flex items-center gap-1 rounded-lg bg-gold/10 border border-gold/40 px-2 py-1 text-sm"
                >
                  <span className="text-lg">{s.emoji}</span>
                  <span className="text-[10px] text-gold">{s.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* 牌堆信息 */}
          <div className="flex justify-center gap-4 mb-2 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" /> 抽牌堆 {battle.drawPile.length}
              {battle.drawPile.length === 0 && battle.discardPile.length > 0 && (
                <span className="text-gold">→洗入</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> 弃牌堆 {battle.discardPile.length}
            </span>
            {battle.exhaustedPile.length > 0 && (
              <span className="flex items-center gap-1 text-gold/60">
                消耗 {battle.exhaustedPile.length}
              </span>
            )}
          </div>
        </div>

        {/* 右侧：战斗日志面板 */}
        <div className="w-72 shrink-0 flex flex-col">
          <div className="glass rounded-xl flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-mint/20">
              <ScrollText className="w-3.5 h-3.5 text-mint/70" />
              <span className="text-xs font-mono text-mint/70 font-bold tracking-wide">战斗日志</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0">
              {log.map((l, i) => (
                <div
                  key={i}
                  className={cn(
                    'text-xs leading-relaxed rounded px-1.5 py-0.5',
                    l.kind === 'player' && 'text-mint-light bg-mint/5',
                    l.kind === 'enemy' && 'text-danger bg-danger/5',
                    l.kind === 'crit' && 'text-gold font-bold bg-gold/10',
                    l.kind === 'system' && 'text-slate-400',
                  )}
                >
                  {l.text}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* 底部：玩家 + 手牌 + 结束回合 */}
      <div className="flex items-end gap-3 mt-2">
        <div className="w-72 shrink-0">
          <PlayerHud player={battle.player} character={character} caste={run.caste} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-0.5">
            <span className="font-mono text-xs text-mint/70 flex items-center gap-1">
              <Hand className="w-3 h-3" />
              手牌 {battle.hand.length}/{character.handSize ?? 5}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 px-1">
            {battle.hand.map((card, i) => {
              const unplayable =
                (card.type === 'curse' && card.effects.length === 0) ||
                battle.player.energy < card.cost;
              return (
                <CardView
                  key={card.instanceId}
                  card={card}
                  size="md"
                  playable={!unplayable && battle.isPlayerTurn && !battle.over}
                  onClick={() => playCardAction(i)}
                />
              );
            })}
            {battle.hand.length === 0 && (
              <div className="text-slate-500 text-sm py-8 px-4">手牌为空</div>
            )}
          </div>
        </div>

        <button
          onClick={endTurnAction}
          disabled={!battle.isPlayerTurn || !!battle.over}
          className="btn-mint shrink-0 flex flex-col items-center gap-0.5"
        >
          <Swords className="w-5 h-5" />
          <span className="text-sm">结束回合</span>
        </button>
      </div>
      <DeckViewer />
    </div>
  );
}
