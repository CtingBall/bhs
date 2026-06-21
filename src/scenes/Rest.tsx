import { useGameStore } from '@/store/gameStore';
import ParticleBg from '@/components/ParticleBg';
import CardView from '@/components/CardView';
import { Heart, Skull, Scissors, Hammer } from 'lucide-react';
import { useState } from 'react';

export default function Rest() {
  const run = useGameStore((s) => s.run);
  const resolveRest = useGameStore((s) => s.resolveRest);
  const [pickRemove, setPickRemove] = useState(false);
  const [pickReforge, setPickReforge] = useState(false);
  if (!run) return null;
  const heal = Math.floor(run.maxHp * 0.3);

  return (
    <div className="grid-bg relative min-h-screen overflow-y-auto px-6 py-6">
      <ParticleBg density={30} />
      <div className="relative z-10 w-full max-w-2xl mx-auto animate-slideUp">
        <h2 className="font-display text-3xl text-mint text-glow text-center mb-6">休息点</h2>
        <p className="text-xs text-slate-400 text-center -mt-4 mb-6">每次休息可免费执行一项操作（不可反悔）</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 等削弱：回血 */}
          <button
            onClick={() => resolveRest({ kind: 'heal', instanceId: '' })}
            className="glass rounded-2xl p-6 border-2 border-mint/30 hover:border-mint hover:-translate-y-1 transition-all text-center"
          >
            <Heart className="w-10 h-10 mx-auto text-danger mb-2" />
            <div className="font-display text-xl text-mint-light mb-1">等削弱</div>
            <p className="text-xs text-slate-400">
              「无所谓我会选择不打等削弱」<br />
              回复 {heal} 点生命
            </p>
          </button>

          {/* 免费删卡 */}
          <button
            onClick={() => { setPickRemove(true); setPickReforge(false); }}
            className="glass rounded-2xl p-6 border-2 border-willow/30 hover:border-willow hover:-translate-y-1 transition-all text-center"
          >
            <Scissors className="w-10 h-10 mx-auto text-willow mb-2" />
            <div className="font-display text-xl text-willow mb-1">精简牌组</div>
            <p className="text-xs text-slate-400">
              「去掉没用的卡」<br />
              免费移除一张牌
            </p>
          </button>

          {/* 免费养成 */}
          <button
            onClick={() => { setPickReforge(true); setPickRemove(false); }}
            className="glass rounded-2xl p-6 border-2 border-cyan-400/30 hover:border-cyan-400 hover:-translate-y-1 transition-all text-center"
          >
            <Hammer className="w-10 h-10 mx-auto text-cyan-400 mb-2" />
            <div className="font-display text-xl text-cyan-300 mb-1">打磨装备</div>
            <p className="text-xs text-slate-400">
              「磨刀不误砍柴工」<br />
              免费养成一张牌（数值+1）
            </p>
          </button>

          {/* 坐牢 */}
          <button
            onClick={() => resolveRest({ kind: 'prison', instanceId: '' })}
            className="glass rounded-2xl p-6 border-2 border-danger/30 hover:border-danger hover:-translate-y-1 transition-all text-center"
          >
            <Skull className="w-10 h-10 mx-auto text-danger mb-2" />
            <div className="font-display text-xl text-danger mb-1">坐牢</div>
            <p className="text-xs text-slate-400">
              「来坐牢」进入精英战<br />
              胜利必得史诗卡
            </p>
          </button>
        </div>

        {/* 删卡模式 */}
        {pickRemove && (
          <div className="glass rounded-2xl p-4 mb-4 animate-slideUp">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-willow">选择一张牌移除</span>
              <button onClick={() => setPickRemove(false)} className="text-xs text-slate-400 hover:text-white">取消</button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {run.deck.map((c) => (
                <button
                  key={c.instanceId}
                  onClick={() => resolveRest({ kind: 'remove', instanceId: c.instanceId })}
                  disabled={run.deck.length <= 5}
                  className="text-[10px] px-2 py-1 rounded bg-ink-lighter border border-willow/20 text-slate-300 hover:border-willow hover:text-willow transition-all"
                  title={c.text}
                >
                  {c.name}
                </button>
              ))}
            </div>
            {run.deck.length <= 5 && (
              <div className="text-xs text-slate-500 mt-2">牌组最少保留 5 张</div>
            )}
          </div>
        )}

        {/* 免费养成模式 */}
        {pickReforge && (
          <div className="glass rounded-2xl p-4 mb-4 animate-slideUp">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-cyan-300">选择一张牌免费养成</span>
              <button onClick={() => setPickReforge(false)} className="text-xs text-slate-400 hover:text-white">取消</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {run.deck.filter((c) => c.type !== 'curse').map((c) => (
                <button
                  key={c.instanceId}
                  onClick={() => resolveRest({ kind: 'nurture', instanceId: c.instanceId })}
                  className="text-left rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-2 py-1.5 hover:border-cyan-400 transition-all"
                >
                  <div className="text-[11px] text-slate-200">{c.name}</div>
                  <div className="text-[8px] text-gold font-mono">Lv.{c.nurtureLevel} → Lv.{c.nurtureLevel + 1}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
