import { useGameStore } from '@/store/gameStore';
import ParticleBg from '@/components/ParticleBg';
import { MapPinned, Swords, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZONE_NAME, ZONE_LIST } from '@/types';

export default function Dimension() {
  const run = useGameStore((s) => s.run);
  const startDimensionFloor = useGameStore((s) => s.startDimensionFloor);
  const retreatDimension = useGameStore((s) => s.retreatDimension);
  const battle = useGameStore((s) => s.battle);

  if (!run || !run.dimensionState) return null;
  const ds = run.dimensionState;
  const zone = ZONE_LIST[run.zoneIndex];
  const zoneName = ZONE_NAME[zone] ?? zone;

  // 战斗中状态：显示战斗结果
  if (battle) {
    const lastFloor = ds.currentFloor;
    const cleared = ds.clearedFloors[lastFloor - 1];
    if (cleared) {
      return (
        <div className="grid-bg relative min-h-screen flex items-center justify-center px-6 py-8">
          <ParticleBg density={50} />
          <div className="relative z-10 w-full max-w-md text-center animate-slideUp">
            <div className="text-5xl mb-3">🌀</div>
            <h2 className="font-display text-3xl text-purple-300 text-glow mb-2">层数突破！</h2>
            <p className="text-slate-300 mb-4">
              维度第 {lastFloor} / {ds.totalFloors} 层已征服
              {lastFloor < ds.totalFloors ? '，前方还有更深的维度……' : '，维度空间已完全征服！'}
            </p>
            {lastFloor < ds.totalFloors && (
              <button className="btn-mint mb-3" onClick={startDimensionFloor}>
                继续深入（第 {lastFloor + 1} 层）
              </button>
            )}
            <button className="btn-ghost block mx-auto" onClick={retreatDimension}>
              <LogOut className="w-4 h-4 inline mr-1" />
              撤离维度
            </button>
          </div>
        </div>
      );
    }
    // 战斗中但clearance还没设置 = 正在战斗（由 Battle 场景接管）
    return null;
  }

  // 入口状态
  return (
    <div className="grid-bg relative min-h-screen flex items-center justify-center px-6 py-8">
      <ParticleBg density={60} />
      <div className="relative z-10 w-full max-w-md text-center animate-slideUp">
        <div className="text-6xl mb-4 animate-pulseGlow">🌀</div>
        <h2 className="font-display text-4xl text-purple-300 text-glow mb-2">维度裂隙</h2>
        <p className="text-sm text-slate-300 mb-2">
          你发现了一个通往 {zoneName} 异次元的裂隙
        </p>
        <p className="text-xs text-slate-500 mb-6">
          内含 {ds.totalFloors} 层随机强度的遭遇。越深层奖励越丰厚，但风险也越大。
          <br />
          你可以随时撤退，保留已获得的战利品。
        </p>

        {/* 层数预览 */}
        <div className="glass rounded-xl p-4 mb-6 text-left">
          <div className="text-xs text-purple-300/70 font-mono mb-3 flex items-center gap-1">
            <MapPinned className="w-3 h-3" /> 维度层数预览
          </div>
          <div className="flex gap-2 justify-center">
            {ds.floorTypes.map((t, i) => (
              <div
                key={i}
                className={cn(
                  'w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg',
                  t === 'boss' ? 'border-gold/60 bg-gold/10 text-gold' :
                  t === 'elite' ? 'border-danger/50 bg-danger/10 text-danger' :
                  'border-mint/50 bg-mint/10 text-mint',
                )}
                title={t === 'boss' ? 'BOSS' : t === 'elite' ? '精英' : '普通'}
              >
                {t === 'boss' ? '👹' : t === 'elite' ? '💀' : '⚔️'}
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-center mt-1">
            {ds.floorTypes.map((t, i) => (
              <span key={i} className="text-[8px] text-slate-500 w-12 text-center">
                {t === 'boss' ? 'BOSS' : t === 'elite' ? '精英' : '第' + (i + 1)}
              </span>
            ))}
          </div>
        </div>

        {/* 奖励预览 */}
        <div className="glass-light rounded-lg p-3 mb-6 text-xs text-left font-mono">
          <span className="text-purple-300/70">可能奖励：</span>
          <span className="text-slate-400 ml-2">遗物、因子、重铸石、琥珀（每层递增）</span>
        </div>

        <div className="flex gap-4 justify-center">
          <button className="btn-mint flex items-center gap-2" onClick={startDimensionFloor}>
            <Swords className="w-5 h-5" /> 踏入裂隙（第 1 层）
          </button>
          <button className="btn-ghost" onClick={retreatDimension}>
            <LogOut className="w-4 h-4 inline mr-1" />
            离开
          </button>
        </div>
      </div>
    </div>
  );
}
