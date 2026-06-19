import { useGameStore } from '@/store/gameStore';
import { ZONE_LIST, ZONE_NAME, CASTE_NAME } from '@/types';
import type { MapNode, NodeType } from '@/types';
import { getReachableIds } from '@/engine/map';
import ParticleBg from '@/components/ParticleBg';
import { Heart, Coins, Gem, Sparkles, ArrowLeft, Hammer } from 'lucide-react';
import { cn } from '@/lib/utils';

const NODE_ICON: Record<NodeType, string> = {
  battle: '⚔️',
  elite: '💀',
  boss: '👹',
  event: '❓',
  shop: '🛒',
  rest: '🏕️',
};
const NODE_LABEL: Record<NodeType, string> = {
  battle: '战斗',
  elite: '精英',
  boss: 'BOSS',
  event: '事件',
  shop: '商店',
  rest: '休息',
};
const NODE_COLOR: Record<NodeType, string> = {
  battle: 'border-mint/50 text-mint',
  elite: 'border-danger/50 text-danger',
  boss: 'border-gold/60 text-gold',
  event: 'border-willow/50 text-willow',
  shop: 'border-amber/50 text-amber',
  rest: 'border-cyan-400/50 text-cyan-300',
};

// 节点尺寸 & 布局参数
const NODE_SIZE = 52;
const FLOOR_HEIGHT = 80;
const COL_WIDTH = 90;
const MAP_PADDING_X = 40;
const MAP_PADDING_Y = 30;

export default function MapView() {
  const run = useGameStore((s) => s.run);
  const character = useGameStore((s) => s.character);
  const enterNode = useGameStore((s) => s.enterNode);
  const returnToMenu = useGameStore((s) => s.returnToMenu);

  if (!run || !character) return null;
  const zone = ZONE_LIST[run.zoneIndex];
  const zoneNodes = run.mapNodes[run.zoneIndex];
  const visitedCount = zoneNodes.filter((n) => n.visited).length;
  const reachable = getReachableIds(zoneNodes, run.currentNodeId);

  // 按层分组，从上（boss）到下（入口）渲染
  const maxFloor = Math.max(...zoneNodes.map((n) => n.floor));
  const floors: MapNode[][] = [];
  for (let f = maxFloor; f >= 0; f--) {
    floors.push(zoneNodes.filter((n) => n.floor === f).sort((a, b) => a.col - b.col));
  }

  const mapHeight = (maxFloor + 1) * FLOOR_HEIGHT + MAP_PADDING_Y * 2;
  const maxCol = Math.max(...zoneNodes.map((n) => n.col));
  const mapWidth = (maxCol + 1) * COL_WIDTH + MAP_PADDING_X * 2;

  // 计算节点像素坐标
  function nodeX(n: MapNode): number {
    return MAP_PADDING_X + n.col * COL_WIDTH + NODE_SIZE / 2;
  }
  function nodeY(n: MapNode): number {
    // floor 0 在底部，boss 在顶部
    return MAP_PADDING_Y + (maxFloor - n.floor) * FLOOR_HEIGHT + NODE_SIZE / 2;
  }

  // 构建连线
  const edges: { from: MapNode; to: MapNode }[] = [];
  for (const n of zoneNodes) {
    for (const nextId of n.next) {
      const target = zoneNodes.find((x) => x.id === nextId);
      if (target) edges.push({ from: n, to: target });
    }
  }

  return (
    <div className="grid-bg relative min-h-screen flex flex-col px-6 py-6 overflow-hidden">
      <ParticleBg density={30} />
      <div className="relative z-10 flex-1 flex flex-col">
        {/* 顶栏 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={returnToMenu}
            className="inline-flex items-center gap-1 text-xs text-mint/60 hover:text-mint"
          >
            <ArrowLeft className="w-4 h-4" /> 放弃本局
          </button>
          <div className="text-center">
            <div className="font-display text-xl text-gold text-glow-gold">
              {ZONE_NAME[zone]}
            </div>
            <div className="text-[10px] text-slate-400">
              第 {run.zoneIndex + 1} / 3 区 · 探索 {visitedCount}/{zoneNodes.length}
            </div>
          </div>
          <div className="w-20" />
        </div>

        {/* 资源栏 */}
        <div className="glass rounded-xl px-4 py-2 mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-mono">
          <span className="flex items-center gap-1">
            <span className="text-2xl">{character.emoji}</span>
            <span className="text-mint-light font-body">{character.name}</span>
          </span>
          <span className="flex items-center gap-1 text-danger">
            <Heart className="w-4 h-4" /> {run.hp}/{run.maxHp}
          </span>
          <span className="flex items-center gap-1 text-gold">
            <Coins className="w-4 h-4" /> {run.rope}
          </span>
          <span className="flex items-center gap-1 text-willow">
            <Sparkles className="w-4 h-4" /> {run.will}
          </span>
          <span className="flex items-center gap-1 text-amber">
            <Gem className="w-4 h-4" /> {run.amber}
          </span>
          <span className="text-slate-300">阶级：{CASTE_NAME[run.caste]}</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <Hammer className="w-4 h-4" /> {run.reforgeStones ?? 0}
          </span>
          <span className="text-slate-400">遗物 {run.relics.length}</span>
          {run.factors.length > 0 && (
            <span className="text-gold text-xs">
              {run.factors.map((f) => `${f.emoji}${f.name}`).join(' ')}
            </span>
          )}
        </div>

        {/* 地图区域 */}
        <div className="flex-1 overflow-auto rounded-xl glass-light p-2">
          <div className="relative mx-auto" style={{ width: mapWidth, height: mapHeight, minWidth: mapWidth }}>
            {/* SVG 连线层 */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={mapWidth}
              height={mapHeight}
            >
              {edges.map((e, i) => {
                const x1 = nodeX(e.from);
                const y1 = nodeY(e.from);
                const x2 = nodeX(e.to);
                const y2 = nodeY(e.to);
                const isActive = reachable.has(e.to.id);
                const isPath = e.from.visited && !e.to.visited;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className={cn(
                      'transition-all',
                      isPath
                        ? 'stroke-mint stroke-2 opacity-80'
                        : e.from.visited
                          ? 'stroke-mint/40 stroke-1.5'
                          : 'stroke-slate-700 stroke-1',
                      isActive && 'animate-pulseGlow',
                    )}
                    strokeDasharray={isPath ? '0' : '4 3'}
                  />
                );
              })}
            </svg>

            {/* 节点层 */}
            {zoneNodes.map((n) => {
              const isReachable = reachable.has(n.id);
              const isCurrent = run.currentNodeId === n.id;
              const isBoss = n.type === 'boss';
              const canClick = isReachable;
              const size = isBoss ? 64 : NODE_SIZE;
              return (
                <button
                  key={n.id}
                  onClick={() => canClick && enterNode(n.id)}
                  disabled={!canClick}
                  className={cn(
                    'absolute flex flex-col items-center justify-center rounded-full border-2 transition-all',
                    isBoss ? 'text-3xl' : 'text-xl',
                    n.visited && !isCurrent
                      ? 'border-slate-700 bg-ink/60 opacity-35'
                      : isCurrent
                        ? cn(NODE_COLOR[n.type], 'bg-ink/80 ring-2 ring-mint/50 scale-110')
                        : isReachable
                          ? cn(NODE_COLOR[n.type], 'bg-ink/70 hover:scale-125 cursor-pointer animate-pulseGlow shadow-mint-glow')
                          : cn(NODE_COLOR[n.type], 'bg-ink/40 opacity-40'),
                  )}
                  style={{
                    width: size,
                    height: size,
                    left: nodeX(n) - size / 2,
                    top: nodeY(n) - size / 2,
                  }}
                >
                  <span>{n.visited && !isCurrent ? '✓' : NODE_ICON[n.type]}</span>
                  {isCurrent && (
                    <span className="absolute -top-5 text-[8px] text-mint whitespace-nowrap font-bold">
                      你在这里
                    </span>
                  )}
                  <span className="absolute -bottom-4 text-[8px] text-slate-400 whitespace-nowrap">
                    {NODE_LABEL[n.type]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 遗物 */}
        {run.relics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {run.relics.map((r) => (
              <span
                key={r.id}
                title={`${r.name}：${r.text}`}
                className="glass-light rounded-lg px-2 py-1 text-[10px] text-gold border-gold/30"
              >
                ✦ {r.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
