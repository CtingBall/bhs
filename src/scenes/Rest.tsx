import { useGameStore } from '@/store/gameStore';
import ParticleBg from '@/components/ParticleBg';
import { Heart, Skull } from 'lucide-react';

export default function Rest() {
  const run = useGameStore((s) => s.run);
  const resolveRest = useGameStore((s) => s.resolveRest);
  if (!run) return null;
  const heal = Math.floor(run.maxHp * 0.3);

  return (
    <div className="grid-bg relative min-h-screen flex items-center justify-center px-6 py-8">
      <ParticleBg density={30} />
      <div className="relative z-10 w-full max-w-2xl animate-slideUp">
        <h2 className="font-display text-3xl text-mint text-glow text-center mb-6">休息点</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => resolveRest('heal')}
            className="glass rounded-2xl p-6 border-2 border-mint/30 hover:border-mint hover:-translate-y-1 transition-all text-center"
          >
            <Heart className="w-10 h-10 mx-auto text-danger mb-2" />
            <div className="font-display text-xl text-mint-light mb-1">等削弱</div>
            <p className="text-xs text-slate-400">
              「无所谓我会选择不打等削弱」
              <br />
              回复 {heal} 点生命
            </p>
          </button>

          <button
            onClick={() => resolveRest('prison')}
            className="glass rounded-2xl p-6 border-2 border-danger/30 hover:border-danger hover:-translate-y-1 transition-all text-center"
          >
            <Skull className="w-10 h-10 mx-auto text-danger mb-2" />
            <div className="font-display text-xl text-danger mb-1">坐牢</div>
            <p className="text-xs text-slate-400">
              「来坐牢」进入精英战
              <br />
              胜利必得传说卡
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
