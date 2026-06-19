import { useGameStore } from '@/store/gameStore';
import CardView from '@/components/CardView';
import ParticleBg from '@/components/ParticleBg';
import { Coins, Sparkles } from 'lucide-react';

export default function Reward() {
  const reward = useGameStore((s) => s.reward);
  const pick = useGameStore((s) => s.pickReward);

  if (!reward) return null;
  return (
    <div className="grid-bg relative min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <ParticleBg density={40} />
      <div className="relative z-10 w-full max-w-3xl animate-slideUp text-center">
        <h2 className="font-display text-3xl text-mint text-glow mb-1">战斗胜利</h2>
        <p className="text-sm text-slate-400 mb-4">从战利品中选择一张加入牌组</p>

        <div className="flex justify-center gap-4 mb-4 font-mono text-sm">
          <span className="flex items-center gap-1 text-gold">
            <Coins className="w-4 h-4" /> +{reward.rope} 绳子
          </span>
          <span className="flex items-center gap-1 text-willow">
            <Sparkles className="w-4 h-4" /> +{reward.will} 意志
          </span>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {reward.cards.map((c, i) => (
            <CardView key={i} card={c} size="lg" onClick={() => pick(c)} />
          ))}
        </div>

        <button className="btn-ghost" onClick={() => pick(null)}>
          跳过奖励
        </button>
      </div>
    </div>
  );
}
