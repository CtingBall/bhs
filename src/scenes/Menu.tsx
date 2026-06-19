import { useGameStore } from '@/store/gameStore';
import { useMetaStore } from '@/store/metaStore';
import ParticleBg from '@/components/ParticleBg';

export default function Menu() {
  const goScene = useGameStore((s) => s.goScene);
  const meta = useMetaStore();

  return (
    <div className="grid-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <ParticleBg density={80} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-2 font-mono text-xs tracking-[0.5em] text-mint/60 animate-pulseGlow">
          MINT-CLAN COVENANT
        </div>
        <h1 className="font-display text-5xl md:text-7xl text-mint text-glow leading-tight">
          薄荷色氏族公约
        </h1>
        <h2 className="font-display text-3xl md:text-5xl text-gold text-glow-gold mt-1">
          星痕回响
        </h2>
        <p className="mt-4 max-w-md font-body text-sm text-slate-300/80 leading-relaxed">
          一款以「薄荷色氏族公约」群聊记录为蓝本的肉鸽卡牌爬塔。
          <br />
          化身公会成员，携职业卡组深入星痕大陆，
          <br />
          在坐牢、末班车与等削弱之间，挑战惩击王朝。
        </p>

        <div className="mt-8 flex flex-col gap-3 w-64">
          <button className="btn-mint" onClick={() => goScene('select')}>
            开始冒险
          </button>
          <button className="btn-ghost" onClick={() => goScene('codex')}>
            图鉴 · 梗百科
          </button>
        </div>

        {/* meta 进度 */}
        <div className="mt-8 flex gap-6 font-mono text-xs text-slate-400">
          <span>沉淀 <span className="text-mint">{meta.sediment}</span></span>
          <span>
            最佳 <span className="text-gold">{meta.bestZone === 0 ? '强袭区' : meta.bestZone === 1 ? '厄运区' : meta.bestZone >= 2 ? '惩戒区' : '—'}</span>
          </span>
          <span>胜场 <span className="text-willow">{meta.totalWins}</span></span>
          <span>出征 <span className="text-slate-300">{meta.runs}</span></span>
        </div>

        <div className="mt-10 max-w-md text-[10px] leading-relaxed text-slate-500">
          致敬「薄荷色氏族公约」群与《星痕共鸣》。本作为社区二创，所有卡牌/事件文案均为群聊梗化用，仅供娱乐。
        </div>
      </div>
    </div>
  );
}
