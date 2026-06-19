import { useGameStore } from '@/store/gameStore';
import { useMetaStore } from '@/store/metaStore';
import ParticleBg from '@/components/ParticleBg';

export default function End() {
  const scene = useGameStore((s) => s.scene);
  const run = useGameStore((s) => s.run);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const meta = useMetaStore();

  if (!run) return null;
  const isWin = scene === 'victory';
  const gainedSediment = isWin
    ? 40 + run.battlesWon * 2
    : run.zoneIndex * 6 + run.battlesWon;

  return (
    <div className="grid-bg relative min-h-screen flex items-center justify-center px-6 py-8">
      <ParticleBg density={isWin ? 100 : 30} />
      <div className="relative z-10 w-full max-w-lg text-center animate-slideUp">
        {isWin ? (
          <>
            <div className="text-6xl mb-3 animate-pulseGlow">👑</div>
            <h1 className="font-display text-4xl text-gold text-glow-gold mb-2">
              惩击王朝覆灭
            </h1>
            <p className="text-mint-light mb-6">薄荷色氏族公约，名震星痕大陆！</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-3">⛓️</div>
            <h1 className="font-display text-4xl text-danger mb-2">那你还是牢</h1>
            <p className="text-slate-400 mb-6">「无所谓反正我打不过」——你坐牢了。</p>
          </>
        )}

        <div className="glass rounded-2xl p-5 mb-6 text-left">
          <div className="text-xs text-mint/60 font-mono mb-3">本局战绩</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="推进大区" value={`${run.zoneIndex + (isWin ? 1 : 0)} / 3`} />
            <Stat label="战斗胜利" value={`${run.battlesWon} 场`} />
            <Stat label="击败敌人" value={`${run.enemiesDefeated.length} 个`} />
            <Stat label="牌组规模" value={`${run.deck.length} 张`} />
            <Stat label="持有遗物" value={`${run.relics.length} 件`} />
            <Stat label="最终阶级" value={run.caste} />
          </div>
        </div>

        <div className="glass-light rounded-xl p-4 mb-6">
          <span className="text-sm text-gold">
            获得沉淀点数 <span className="font-mono text-2xl text-glow-gold">+{gainedSediment}</span>
          </span>
          <span className="text-xs text-slate-400 ml-2">（累计 {meta.sediment}）</span>
          <p className="text-[10px] text-slate-500 mt-1">
            沉淀点数见证你的坐牢史，未来将用于永久解锁。
          </p>
        </div>

        <button className="btn-mint" onClick={returnToMenu}>
          返回主菜单
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-mint/10 pb-1">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className="font-mono text-mint-light">{value}</span>
    </div>
  );
}
