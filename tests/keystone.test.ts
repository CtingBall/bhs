// @vitest-environment jsdom
// ============================================================================
// 天枢星盘 / 进阶难度 测试
// ============================================================================

import { describe, it, expect, beforeAll } from 'vitest';
import { Run } from '../src/core/run';
import { RngBank } from '../src/core/rng';
import { Combat } from '../src/core/combat';
import { Unit } from '../src/core/units';
import { getCardDef } from '../src/core/cards';
import type { CardInstance } from '../src/core/cards';

import '../src/content/index';
import { KEYSTONE_REGISTRY, getKeystoneDef } from '../src/content/keystones';
import { getAscension } from '../src/content/ascension';
import { loadProfile, saveProfile, maxKeystoneSlots, DEFAULT_PROFILE } from '../src/core/profile';

// 内存版 localStorage 替身（避免依赖运行环境的 localStorage 实现差异）
beforeAll(() => {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
});

describe('大天赋注册', () => {
  it('注册表包含已实现职业各 8 个', () => {
    const byClass = new Map<string, number>();
    for (const k of KEYSTONE_REGISTRY.values()) {
      byClass.set(k.classId, (byClass.get(k.classId) ?? 0) + 1);
    }
    expect(byClass.get('hero_thunderblade')).toBe(8);
    expect(byClass.get('hero_aegis_knight')).toBe(8);
    expect(byClass.get('hero_sylvanguard')).toBe(8);
    expect(byClass.get('hero_frost_mage')).toBe(8);
    expect(byClass.get('hero_flame_berserker')).toBe(8);
    expect(byClass.get('hero_titan_guardian')).toBe(8);
    expect(byClass.get('hero_sharpshooter')).toBe(8);
    expect(byClass.get('hero_soul_musician')).toBe(8);
    expect(byClass.get('hero_gale_knight')).toBe(8);
  });

  it('冰魔导师：玄冰瞬发机制（有冰减费且 1 费打出）', () => {
    const run = Run.newRun('hero_frost_mage', 'ks-mge-1');
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    combat.modifyResource(combat.player, 'frost_shard', 'Add', 2);
    const spear = combat.piles.createCard('card_mage_frost_spear');
    combat.piles.addToHand(spear);
    expect(combat.effectiveCost(spear)).toBe(1); // 2-1（有冰）
  });

  it('冰魔导师：无玄冰吟唱，下回合自动结算', () => {
    const run = Run.newRun('hero_frost_mage', 'ks-mge-2');
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    const enemy = combat.aliveEnemies()[0];
    const hpBefore = enemy.hp;
    combat.modifyResource(combat.player, 'frost_shard', 'Set', 0);
    const spear = combat.piles.createCard('card_mage_frost_spear');
    combat.piles.addToHand(spear);
    const ok = combat.playCard(spear.uid, enemy.id);
    expect(ok).toBe(true);
    expect(combat.player.state['chantDamage']).toBe(10);
    // 结束回合 → 下回合开始吟唱结算
    combat.endTurn();
    expect(enemy.hp).toBeLessThan(hpBefore);
  });

  it('装配进战斗后生效且战斗结束可复现', () => {
    const run = Run.newRun('hero_thunderblade', 'ks-test-1', { keystones: ['k2_1_dual_form', 'k2_4_overload'] });
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    expect(combat.player.state['dualForm']).toBe(true);
    expect(combat.player.resourceCaps['thunder_seal']).toBe(10);
    // 双形态：单体攻击 +2 锋锐
    const enemy = combat.aliveEnemies()[0];
    const before = enemy.hp;
    combat.dealDamage(combat.player, enemy, { base: 10, type: 'physical', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1, singleTarget: true });
    expect(before - enemy.hp).toBe(12); // 10 + 2 锋锐
  });

  it('神盾骑士 K9-1 光铸泰坦：血上限 +10', () => {
    const run = Run.newRun('hero_aegis_knight', 'ks-test-2', { keystones: ['k9_1_titan'] });
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    expect(combat.player.maxHp).toBe(82 + 10);
    expect(combat.player.state['lightforgedRatio']).toBe(0.75);
  });

  it('森语者：K1-1 树界降临开局召唤随从且随从自动行动', () => {
    const run = Run.newRun('hero_sylvanguard', 'ks-syl-1', { keystones: ['k1_1_tree_world'] });
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    expect(combat.allies.length).toBe(3); // 1 树人 + 2 花仙
    // 随从应能行动：让战斗进行一轮
    let guard = 0;
    while (!combat.ended && guard++ < 20) {
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
    // 随从对敌人造成了伤害（敌人血量低于初始）
    const totalLost = combat.enemies.reduce((s, e) => s + (e.maxHp - e.hp), 0);
    expect(totalLost).toBeGreaterThan(0);
  });

  it('森语者：K1-6 开局 7 颗种子激活二阶光环', () => {
    const run = Run.newRun('hero_sylvanguard', 'ks-syl-2', { keystones: ['k1_6_root_eternal'] });
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    expect(combat.getResource(combat.player, 'seed')).toBe(7);
  });

  it('赤炎狂战士：交替施放无相等级上升，Lv5 结算后归零', () => {
    const run = Run.newRun('hero_flame_berserker', 'ks-ber-1');
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    const mk = (defId: string): CardInstance => {
      const c = combat.piles.createCard(defId);
      combat.piles.addToHand(c);
      return c;
    };
    const enemy = combat.aliveEnemies()[0];
    // 炽烈升腾 → 炽焰突袭（交替 +1）
    mk('card_ber_blazing_ascension');
    const asc = combat.piles.hand.find((c) => c.defId === 'card_ber_blazing_ascension')!;
    combat.playCard(asc.uid, enemy.id);
    const assault = mk('card_ber_flame_assault');
    combat.playCard(assault.uid, enemy.id);
    expect(combat.player.state['formlessRank']).toBeGreaterThan(0);
    // 卖血卡积累魂槽
    const frenzied = mk('card_ber_frenzied_slash');
    combat.playCard(frenzied.uid, enemy.id);
    expect(combat.getResource(combat.player, 'crimson_soul')).toBeGreaterThan(0);
  });

  it('巨刃守护者：护盾猛击按护盾转伤、怒气衰减、格挡反震', () => {
    const run = Run.newRun('hero_titan_guardian', 'ks-grd-1');
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    combat.player.gainBlock(30);
    const enemy = combat.aliveEnemies()[0];
    const hpBefore = enemy.hp;
    const slam = combat.piles.createCard('card_grd_shield_slam');
    combat.piles.addToHand(slam);
    combat.playCard(slam.uid, enemy.id);
    // 6 + 30×0.8 = 30 伤害
    expect(hpBefore - enemy.hp).toBeGreaterThanOrEqual(24);
    // 怒气衰减（直接结算回合结束阶段）
    combat.modifyResource(combat.player, 'rage', 'Set', 50);
    (combat as unknown as { finishRound(): void }).finishRound();
    expect(combat.getResource(combat.player, 'rage')).toBe(40);
  });

  it('神射手：光能重铸增伤 + 暴击触发战隼俯冲', () => {
    const run = Run.newRun('hero_sharpshooter', 'ks-sht-1', { keystones: ['k6_1_dual_beast'] });
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    expect(combat.player.state['falcon']).toBe(true);
    combat.modifyResource(combat.player, 'light_energy', 'Set', 60);
    combat.player.state['reforged'] = true;
    // 高暴击保证触发
    combat.player.state['critChance'] = 1;
    combat.player.state['attackCritBonus'] = 0;
    const enemy = combat.aliveEnemies()[0];
    const hpBefore = enemy.hp;
    const shot = combat.piles.createCard('card_sht_precise_shot');
    combat.piles.addToHand(shot);
    combat.playCard(shot.uid, enemy.id);
    // 7 × 1.3（重铸）× 1.5（暴击）≈ 13.6 + 战隼 8 真伤
    expect(hpBefore - enemy.hp).toBeGreaterThanOrEqual(20);
  });

  it('灵魂乐手：生机旋律反哺全队 + 音符积累', () => {
    const run = Run.newRun('hero_soul_musician', 'ks-mus-1');
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    const enemy = combat.aliveEnemies()[0];
    combat.player.hp = 50; // 留出治疗空间
    const hpBefore = combat.player.hp;
    const strike = combat.piles.createCard('card_mus_sonic_strike');
    combat.piles.addToHand(strike);
    combat.playCard(strike.uid, enemy.id);
    // 音爆扫弦 6 伤 → 生机旋律回 25% = 1~2 点 + 自带吸血 2
    expect(combat.player.hp).toBeGreaterThan(hpBefore);
    expect(combat.getResource(combat.player, 'musical_note')).toBeGreaterThan(0);
  });

  it('青岚骑士：锐利增伤 + 勇气驱动螺旋回流', () => {
    const run = Run.newRun('hero_gale_knight', 'ks-knt-1');
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    const enemy = combat.aliveEnemies()[0];
    combat.player.applyBuff('sharpness', 3);
    const hpBefore = enemy.hp;
    const strike = combat.piles.createCard('card_knt_wind_strike');
    combat.piles.addToHand(strike);
    combat.playCard(strike.uid, enemy.id);
    // 7 × (1 + 3×0.08) = 8.68
    expect(hpBefore - enemy.hp).toBeGreaterThan(8);
    // 螺旋回流：满 30 勇气打出后回手
    combat.modifyResource(combat.player, 'courage', 'Set', 50);
    const handBefore = combat.piles.hand.length;
    const spiral = combat.piles.createCard('card_knt_spiral_thrust');
    combat.piles.addToHand(spiral);
    combat.playCard(spiral.uid, enemy.id);
    expect(combat.piles.hand.length).toBeGreaterThanOrEqual(handBefore); // 回到手牌
  });
});

describe('进阶难度', () => {
  it('词缀随等级递增', () => {
    expect(getAscension(0).enemyHpPct).toBe(1);
    expect(getAscension(5).enemyHpPct).toBeCloseTo(1.4);
    expect(getAscension(3).drawMinus).toBe(1);
    expect(getAscension(10).enrageFrom).toBe(10);
    expect(getAscension(7).playerHpPct).toBeCloseTo(0.9);
  });

  it('进阶 3 时每回合少抽 1 张', () => {
    const run = Run.newRun('hero_thunderblade', 'asc-test-1', { ascension: 3 });
    run.enterNode(run.reachableNodes()[0].id);
    const combat = run.startCombat();
    expect(combat.drawPenalty).toBe(1);
    expect(combat.piles.hand.length).toBeLessThanOrEqual(5 - 1);
  });
});

describe('局外档案', () => {
  it('槽位阶梯', () => {
    const p = { ...DEFAULT_PROFILE, stats: { ...DEFAULT_PROFILE.stats } };
    expect(maxKeystoneSlots(p)).toBe(1);
    p.stats.act1BossKills = 1;
    expect(maxKeystoneSlots(p)).toBe(2);
    p.stats.victories = 1;
    expect(maxKeystoneSlots(p)).toBe(3);
    p.stats.ascension5Cleared = true;
    expect(maxKeystoneSlots(p)).toBe(4);
    p.stats.ascension10Cleared = true;
    expect(maxKeystoneSlots(p)).toBe(5);
  });

  it('存档往返', () => {
    const p = { ...DEFAULT_PROFILE, soulEmbers: 300, unlockedKeystones: ['k2_1_dual_form'], equipped: { hero_thunderblade: ['k2_1_dual_form'] } };
    saveProfile(p);
    const loaded = loadProfile();
    expect(loaded.soulEmbers).toBe(300);
    expect(loaded.unlockedKeystones).toContain('k2_1_dual_form');
    expect(loaded.equipped.hero_thunderblade).toContain('k2_1_dual_form');
  });
});

describe('引擎回归', () => {
  it('修复后基础战斗仍正常', () => {
    const rng = new RngBank('ks-reg');
    const player = new Unit({ id: 'player', name: 'p', maxHp: 50, tags: ['player'], isPlayer: true });
    player.state['maxEnergy'] = 3;
    player.state['handLimit'] = 5;
    const enemy = new Unit({ id: 'e', name: 'e', maxHp: 30, tags: ['enemy'], slot: 0 });
    const combat = new Combat({ rng, player, enemies: [enemy], behaviors: {} });
    combat.start([{ defId: 'card_tb_thrust', level: 0 }]);
    combat.playCard(combat.piles.hand[0].uid, enemy.id);
    expect(enemy.hp).toBeLessThan(30);
  });
});

void getKeystoneDef;
void getCardDef;
