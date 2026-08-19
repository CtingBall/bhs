// ============================================================================
// 核心引擎测试（无头跑测）
// ============================================================================

import { describe, it, expect } from 'vitest';
import { RngBank } from '../src/core/rng';
import { resolveDamage, emptyDamageRequest } from '../src/core/valuePipeline';
import { generateMap } from '../src/core/map';
import { Run } from '../src/core/run';
import { getCardDef } from '../src/core/cards';
import { PileManager } from '../src/core/piles';

// 注册全部内容（副作用导入）
import '../src/content/cards';
import '../src/content/classes';
import '../src/content/relics';
import '../src/content/events';

describe('五阶段数值管道', () => {
  it('易伤 ×1.5 后正确放大，护甲抵扣由战斗层执行', () => {
    const result = resolveDamage(
      { base: 10, type: 'physical', flat: 0, percents: [], defenderMults: [1.5], reduction: 0, globalMod: 1 },
      { reductionRatio: 0, fixedReduction: 0, maxHp: 100 },
    );
    expect(result.raw).toBeCloseTo(15);
    expect(result.remaining).toBeCloseTo(15);
  });

  it('真实伤害跳过防御倍率与减伤', () => {
    const result = resolveDamage(
      { base: 10, type: 'true', flat: 0, percents: [], defenderMults: [1.5], reduction: 0, globalMod: 1 },
      { reductionRatio: 0.5, fixedReduction: 3, maxHp: 100 },
    );
    expect(result.remaining).toBeCloseTo(10);
  });

  it('比例吸收 + 固定免伤叠加', () => {
    const result = resolveDamage(
      { base: 20, type: 'physical', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 },
      { reductionRatio: 0.5, fixedReduction: 3, maxHp: 100 },
    );
    expect(result.absorbedByRatio).toBeCloseTo(10);
    expect(result.fixed).toBeCloseTo(3);
    expect(result.remaining).toBeCloseTo(7);
  });
});

describe('确定性 PRNG', () => {
  it('同种子产生相同序列，异种子不同', () => {
    const a = new RngBank('seed-1');
    const b = new RngBank('seed-1');
    const c = new RngBank('seed-2');
    const seqA = [a.combat.next(), a.combat.next(), a.combat.next()];
    const seqB = [b.combat.next(), b.combat.next(), b.combat.next()];
    const seqC = [c.combat.next(), c.combat.next(), c.combat.next()];
    expect(seqA).toEqual(seqB);
    expect(seqA).not.toEqual(seqC);
  });

  it('状态可序列化恢复', () => {
    const a = new RngBank('seed-x');
    a.map.next(); a.map.next();
    const state = a.getStates();
    const b = new RngBank('seed-x');
    b.restoreStates(state);
    expect(b.map.next()).toBe(a.map.next());
  });
});

describe('DAG 地图生成', () => {
  it('满足核心约束', () => {
    const rng = new RngBank('map-seed').map;
    const map = generateMap(rng);
    expect(map.layers.length).toBe(16);
    // Layer 0 全部起点，Layer 15 单 Boss，Layer 14 全休息，Layer 9 全宝箱，Layer 1 全普通战斗
    for (const n of map.layers[0]) expect(n.type).toBe('start');
    expect(map.layers[15].length).toBe(1);
    expect(map.layers[15][0].type).toBe('boss');
    for (const n of map.layers[14]) expect(n.type).toBe('rest');
    for (const n of map.layers[9]) expect(n.type).toBe('treasure');
    for (const n of map.layers[1]) expect(n.type).toBe('monster');
    // 除起点外每个节点至少一条入边
    for (const layer of map.layers.slice(1)) {
      for (const n of layer) expect(n.incoming.length).toBeGreaterThan(0);
    }
    // 精英不出现在第 5 层前
    for (const layer of map.layers.slice(1, 5)) {
      for (const n of layer) expect(n.type).not.toBe('elite');
    }
  });

  it('不同种子地图不同', () => {
    const m1 = generateMap(new RngBank('m1').map);
    const m2 = generateMap(new RngBank('m2').map);
    const sig1 = JSON.stringify(m1.layers.map((l) => l.map((n) => n.type + '@' + n.col)));
    const sig2 = JSON.stringify(m2.layers.map((l) => l.map((n) => n.type + '@' + n.col)));
    expect(sig1).not.toBe(sig2);
  });
});

describe('牌堆精确检索', () => {
  it('ExileCard 可按 uid 从弃牌堆放逐指定副本，defId 检索仍兼容', () => {
    const rng = new RngBank('pile-test').deck;
    const piles = new PileManager(rng);
    piles.initDeck([
      { defId: 'card_syl_light_tap' },
      { defId: 'card_syl_light_tap' },
    ]);
    const first = piles.draw.pop()!;
    const second = piles.draw.pop()!;
    piles.moveToDiscard(first);
    piles.moveToDiscard(second);
    expect(piles.fetchFromPile(first.uid, 'discard')?.uid).toBe(first.uid);
    expect(piles.fetchFromPile('card_syl_light_tap', 'discard')?.uid).toBe(second.uid);
  });
});

describe('无头战斗跑测', () => {
  function autoPlay(classId: string, seed: string, rounds: number) {
    const run = Run.newRun(classId, seed);
    // 进入第一个可达节点
    const reachable = run.reachableNodes();
    expect(reachable.length).toBeGreaterThan(0);
    run.enterNode(reachable[0].id);
    const combat = run.startCombat();
    let guard = 0;
    while (!combat.ended && guard++ < rounds) {
      if (combat.phase === 'PlayerAction') {
        const playable = combat.piles.hand.filter((c) => {
          if (combat.effectiveCost(c) > combat.energy) return false;
          const def = getCardDef(c.defId);
          if (def.unplayable) return false;
          if (def.requires && combat.getResource(combat.player, def.requires.resourceId) < def.requires.min) return false;
          return true;
        });
        if (playable.length > 0) {
          const card = playable[0];
          const def = getCardDef(card.defId);
          const target = combat.aliveEnemies()[0];
          combat.playCard(card.uid, def.targetType === 'SingleEnemy' ? target?.id : undefined);
        } else {
          combat.endTurn();
        }
      } else {
        combat.endTurn();
      }
    }
    return combat;
  }

  it('雷影剑士：同种子可复现且战斗必然终结', () => {
    const c1 = autoPlay('hero_thunderblade', 'thunder-test-1', 300);
    expect(c1.ended).toBe(true);
    const c2 = autoPlay('hero_thunderblade', 'thunder-test-1', 300);
    expect(c2.ended).toBe(true);
    expect(c1.victory).toBe(c2.victory);
    expect(c1.logLines.length).toBe(c2.logLines.length);
  });

  it('神盾骑士：同种子可复现且战斗必然终结', () => {
    const c1 = autoPlay('hero_aegis_knight', 'aegis-test-1', 300);
    expect(c1.ended).toBe(true);
    const c2 = autoPlay('hero_aegis_knight', 'aegis-test-1', 300);
    expect(c2.ended).toBe(true);
    expect(c1.victory).toBe(c2.victory);
  });

  it('不同种子产生不同战局', () => {
    const c1 = autoPlay('hero_thunderblade', 'seed-a', 300);
    const c2 = autoPlay('hero_thunderblade', 'seed-b', 300);
    // 至少有一处不同（抽牌/意图序列）
    expect(c1.piles.hand.map((h) => h.defId).join(',') === c2.piles.hand.map((h) => h.defId).join(',') &&
      c1.victory === c2.victory).toBe(false);
  });
});

describe('杀戮尖塔手牌规则（发牌 5 张 / 手牌无上限）', () => {
  it('回合开始固定抽 5 张', () => {
    const run = Run.newRun('hero_thunderblade', 'draw5-1');
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    expect(combat.piles.hand.length).toBe(5);
    // 打空手牌 → 结束回合 → 下回合仍固定抽 5 张（不因手牌减少而少抽）
    combat.discardHand();
    combat.endTurn();
    expect(combat.phase).toBe('PlayerAction');
    expect(combat.piles.hand.length).toBe(5);
  });

  it('手牌持有无上限：抽牌/生成牌不再因手牌数溢出', () => {
    const run = Run.newRun('hero_thunderblade', 'nolimit-1');
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    const before = combat.piles.hand.length; // 5
    // 生成 6 张直接入手牌（旧版在 handLimit=5 时溢出进弃牌堆）
    for (let i = 0; i < 6; i++) combat.generateCard('card_tb_thrust', 'hand');
    expect(combat.piles.hand.length).toBe(before + 6);
    // 往抽牌堆预填 5 张，再抽：全部进手牌，无一溢出
    for (let i = 0; i < 5; i++) combat.generateCard('card_tb_thrust', 'drawTop');
    const before2 = combat.piles.hand.length;
    combat.drawCards(5);
    expect(combat.piles.hand.length).toBe(before2 + 5);
  });

  it('生成/检索卡牌不再因手牌数丢弃', () => {
    const run = Run.newRun('hero_thunderblade', 'nolimit-2');
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    for (let i = 0; i < 8; i++) combat.drawCards(3);
    const before = combat.piles.hand.length;
    combat.generateCard('card_tb_thrust', 'hand');
    expect(combat.piles.hand.length).toBe(before + 1);
    combat.fetchFromPile('card_tb_thrust', 'discard', null);
    // 若弃牌堆有同名牌则回到手牌；无则静默（不抛错）
    expect(combat.piles.hand.length).toBeGreaterThanOrEqual(before + 1);
  });
});

describe('事件特殊战斗（pendingSpecialCombat）', () => {
  it('支持逗号分隔的多只怪物（强袭虫群）', () => {
    const run = Run.newRun('hero_thunderblade', 'swarm-1');
    run.state.flags['pendingSpecialCombat'] = 'm3_assault_bug,m3_assault_bug';
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    expect(combat.enemies.length).toBe(2);
    expect(combat.enemies.every((e) => e.name === '强袭虫')).toBe(true);
    // 标志已被消费，防读档重复触发
    expect(run.state.flags['pendingSpecialCombat']).toBeUndefined();
  });

  it('单体特殊战斗仍可用（旧格式兼容）', () => {
    const run = Run.newRun('hero_thunderblade', 'single-pending-1');
    run.state.flags['pendingSpecialCombat'] = 'm3_void_watcher';
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    expect(combat.enemies.length).toBe(1);
    expect(combat.enemies[0].name).toBe('空洞监视者');
  });

  it('虚空契约：特殊战斗胜利后回满生命并额外获得 75 金币', () => {
    const run = Run.newRun('hero_thunderblade', 'void-reward-1');
    run.state.flags['pendingSpecialCombat'] = 'm3_void_watcher';
    run.state.flags['voidContractReward'] = true;
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    // 玩家残血 → 胜利
    combat.player.hp = 10;
    for (const e of [...combat.enemies]) {
      combat.dealDamage(combat.player, e, emptyDamageRequest(9999));
    }
    expect(combat.victory).toBe(true);
    const goldBefore = run.state.gold;
    run.onCombatEnd();
    expect(run.state.hp).toBe(run.state.maxHp); // 回满生命
    expect(run.state.gold).toBe(goldBefore + 75 + 20); // 虚空监视者 20 金 + 契约奖励 75 金
    expect(run.state.flags['voidContractReward']).toBeUndefined(); // 奖励一次性
  });
});
