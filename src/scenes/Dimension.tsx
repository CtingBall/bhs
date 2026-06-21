import { useGameStore } from '@/store/gameStore';
import ParticleBg from '@/components/ParticleBg';
import { MapPinned, Swords, LogOut, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZONE_NAME, ZONE_LIST } from '@/types';

export default function Dimension() {
  const run = useGameStore((s) => s.run);
  const startDimensionFloor = useGameStore((s) => s.startDimensionFloor);
  const retreatDimension = useGameStore((s) => s.retreatDimension);

  if (!run || !run.dimensionState) return null;
  const ds = run.dimensionState;
  const zone = ZONE_LIST[run.zoneIndex];
  const zoneName = ZONE_NAME[zone] ?? zone;

  const clearedCount = ds.clearedFloors.filter(Boolean).length;
  const allCleared = clearedCount >= ds.totalFloors;
  const nextFloor = allCleared ? ds.totalFloors : ds.clearedFloors.findIndex((c) => !c) + 1;
  const isFirstEntry = clearedCount === 0;

  // 全部清完 → 自动结算
  if (allCleared) {
    return (
      <div className="grid-bg relative min-h-screen flex items-center justify-center px-6 py-8">
        <ParticleBg density={60} />
        <div className="relative z-10 w-full max-w-md text-center animate-slideUp">
          <div className="text-6xl mb-3">👑</div>
          <h2 className="font-display text-3xl text-purple-300 text-glow mb-2">维度空间已征服！</h2>
          <p className="text-slate-300 mb-6">
            你征服了维度裂隙的每一层——共 {ds.totalFloors} 层。
          </p>
          <button className="btn-mint" onClick={retreatDimension}>
            领取奖励并离开
          </button>
        </div>
      </div>
    );
  }

  // 层数突破 → 前一战的结果
  if (clearedCount > 0 && ds.currentFloor > 0) {
    const lastFloor = ds.currentFloor;
    return (
      <div className="grid-bg relative min-h-screen flex items-center justify-center px-6 py-8">
        <ParticleBg density={50} />
        <div className="relative z-10 w-full max-w-md text-center animate-slideUp">
          <div className="text-5xl mb-3">🌀</div>
          <h2 className="font-display text-3xl text-purple-300 text-glow mb-2">第 {lastFloor} 层突破！</h2>
          <p className="text-slate-300 mb-4">
            进度：{clearedCount} / {ds.totalFloors} 层已征服
          </p>
          <div className="glass rounded-xl p-3 mb-6">
            <div className="text-xs text-purple-300/70 font-mono mb-2">剩余层数</div>
            <div className="flex gap-2 justify-center">
              {ds.floorTypes.map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all',
                    ds.clearedFloors[i]
                      ? 'border-green-500/60 bg-green-500/20 opacity-70'
                      : t === 'boss' ? 'border-gold/60 bg-gold/10 text-gold' :
                        t === 'elite' ? 'border-danger/50 bg-danger/10 text-danger' :
                        'border-mint/50 bg-mint/10 text-mint',
                  )}
                  title={
                    ds.clearedFloors[i] ? `已突破` :
                    t === 'boss' ? 'BOSS' : t === 'elite' ? '精英' : `第${i + 1}层`
                  }
                >
                  {ds.clearedFloors[i] ? <Check className="w-4 h-4 text-green-400" /> :
                   t === 'boss' ? '👹' : t === 'elite' ? '💀' : '⚔️'}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button className="btn-mint flex items-center gap-2" onClick={startDimensionFloor}>
              <Swords className="w-5 h-5" /> 深入第 {nextFloor} 层
            </button>
            <button className="btn-ghost" onClick={retreatDimension}>
              <LogOut className="w-4 h-4 inline mr-1" />
              带着战利品撤离
            </button>
          </div>
        </div>
      </div>
    );
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
          内含 {ds.totalFloors} 层随机强度的遭遇，越深层奖励越丰厚。
          <br />
          每清一层自动获得奖励，可随时撤退保留已得战利品。
        </p>

        {/* 层数预览 */}
        <div className="glass rounded-xl p-4 mb-6 text-left">
          <div className="text-xs text-purple-300/70 font-mono mb-3 flex items-center gap-1">
            <MapPinned className="w-3 h-3" /> 维度层数预览（共 {ds.totalFloors} 层）
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {ds.floorTypes.map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
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
                <span className="text-[8px] text-slate-500">
                  第{i + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-slate-500 mt-2 text-center">
            {ds.floorTypes.map((t, i) => (
              <span key={i} className={i < ds.floorTypes.length - 1 ? 'mr-1' : ''}>
                {t === 'boss' ? 'BOSS' : t === 'elite' ? '精英' : '普通'}
                {i < ds.floorTypes.length - 1 ? ' → ' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* 奖励说明 */}
        <div className="glass-light rounded-lg p-3 mb-6 text-xs text-left font-mono space-y-1">
          <div className="text-purple-300/70">维度奖励（累计撤离时发放）：</div>
          <div className="text-slate-400">每清 1 层：+1 重铸石 +2 琥珀</div>
          <div className="text-slate-400">全清 {ds.totalFloors} 层：额外 + 随机遗物 + 随机因子 +2 石头</div>
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
