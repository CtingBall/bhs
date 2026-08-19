// ============================================================================
// 敌人目标选择回归测试：怪物必须攻击玩家，绝不能攻击自己人
// （曾出现 resolveTargets 对敌方施法者返回敌方自身导致"怪物互殴"的严重 bug）
// ============================================================================

import { describe, it, expect } from 'vitest';
import { RngBank } from '../src/core/rng';
import { Combat } from '../src/core/combat';
import type { BehaviorDef } from '../src/core/combat';
import { Unit } from '../src/core/units';
import { generateMap } from '../src/core/map';
import { Run } from '../src/core/run';
import { getCardDef } from '../src/core/cards';

import '../src/content/index';

function makePlayer(): Unit {
  const p = new Unit({ id: 'player', name: '玩家', maxHp: 80, tags: ['player', 'frontline'], isPlayer: true });
  p.state['maxEnergy'] = 3;
  p.state['handLimit'] = 5;
  p.resources['thunder_seal'] = 0;
  p.resourceCaps['thunder_seal'] = 5;
  return p;
}

function makeEnemy(id: string, hp: number): Unit {
  const e = new Unit({ id, name: id, maxHp: hp, tags: ['enemy'], slot: 0 });
  return e;
}

describe('敌人目标选择', () => {
  it('单体攻击必须命中玩家而非友军', () => {
    const rng = new RngBank('target-test');
    const player = makePlayer();
    const e1 = makeEnemy('e1', 30);
    const e2 = makeEnemy('e2', 30);
    const behaviors: Record<string, BehaviorDef> = {
      e1: {
        type: 'loop',
        loop: [{ intent: { kind: 'attack', displayText: '攻击', damage: 5 }, action: { action_type: 'DealDamage', target_selector: 'SingleEnemy', params: { base: 5 } } }],
      },
      e2: {
        type: 'loop',
        loop: [{ intent: { kind: 'attack', displayText: '攻击', damage: 5 }, action: { action_type: 'DealDamage', target_selector: 'SingleEnemy', params: { base: 5 } } }],
      },
    };
    const combat = new Combat({ rng, player, enemies: [e1, e2], behaviors });
    combat.start([]);
    combat.endTurn(); // 敌人行动
    expect(player.hp).toBeLessThan(80);
    expect(e1.hp).toBe(30);
    expect(e2.hp).toBe(30);
  });

  it('玩家单体攻击命中选中的敌人', () => {
    const rng = new RngBank('target-test-2');
    const player = makePlayer();
    const e1 = makeEnemy('e1', 30);
    const e2 = makeEnemy('e2', 30);
    const combat = new Combat({ rng, player, enemies: [e1, e2], behaviors: {} });
    const targets = combat.resolveTargets('SingleEnemy', player, e2);
    expect(targets[0]).toBe(e2);
  });

  it('整局模拟中敌人确实对玩家造成伤害（非互殴）', () => {
    const run = Run.newRun('hero_thunderblade', 'target-integ');
    const reachable = run.reachableNodes();
    run.enterNode(reachable[0].id);
    const combat = run.startCombat();
    // 纯攻击机器人：不防御，让敌人的伤害真实落到玩家身上
    let guard = 0;
    while (!combat.ended && guard++ < 40) {
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
        } else combat.endTurn();
      } else combat.endTurn();
    }
    const enemyDamagedPlayer = combat.player.maxHp - combat.player.hp > 0;
    expect(enemyDamagedPlayer).toBe(true);
  });
});

describe('地图起点可达', () => {
  it('起点节点可达且自动通过', () => {
    const rng = new RngBank('map-start').map;
    const map = generateMap(rng);
    expect(map.startIds.length).toBeGreaterThan(0);
    for (const id of map.startIds) {
      expect(map.nodesById.get(id)!.type).toBe('start');
      expect(map.nodesById.get(id)!.connections.length).toBeGreaterThan(0);
    }
  });
});
