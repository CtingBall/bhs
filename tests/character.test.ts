// @vitest-environment jsdom
// ============================================================================
// 人物模块测试：注册表 / 开局自动装配专属遗物 / 水千夏免死遗物行为
// ============================================================================

import { describe, it, expect, beforeAll } from 'vitest';
import { Run } from '../src/core/run';
import { emptyDamageRequest } from '../src/core/valuePipeline';

import '../src/content/index';
import { CHARACTER_REGISTRY, getCharacterDef } from '../src/content/characters';
import { getRelicDef, RELIC_REGISTRY } from '../src/content/relics';
import { CARD_REGISTRY, getCardDef } from '../src/core/cards';

// 内存版 localStorage 替身
beforeAll(() => {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
});

describe('人物注册表', () => {
  it('当前开放人物：水千夏', () => {
    const def = getCharacterDef('char_qianxia');
    expect(def.name).toBe('水千夏');
    expect(def.unlocked).toBe(true);
    expect(def.relicId).toBe('relic_qianxia_undying');
  });

  it('六位人物全部开放，专属遗物均已在遗物注册表注册', () => {
    expect(CHARACTER_REGISTRY.size).toBe(6);
    for (const c of CHARACTER_REGISTRY.values()) {
      expect(c.unlocked, `${c.name} 应已开放`).toBe(true);
      expect(RELIC_REGISTRY.has(c.relicId), `${c.name} 专属遗物未注册: ${c.relicId}`).toBe(true);
    }
  });
});

describe('新人物专属遗物行为', () => {
  function makeCombat(charId: string) {
    const run = Run.newRun('hero_thunderblade', `char-${charId}-1`, { character: charId });
    const reachable = run.reachableNodes();
    run.enterNode(reachable[0].id);
    const combat = run.startCombat();
    return { run, combat };
  }

  it('伏月十三：第 1 回合额外抽 2 张牌', () => {
    const { combat } = makeCombat('char_shisan');
    // startCombat 已完成首回合抽牌：基础 5 张 + 线虫 2 张
    expect(combat.piles.hand.length).toBeGreaterThanOrEqual(7);
  });

  it('薄荷色小溪：战斗开始获得 8 格挡与 1 层力量', () => {
    const { combat } = makeCombat('char_xiaoxi');
    expect(combat.player.block).toBeGreaterThanOrEqual(8);
    expect(combat.player.buffs.get('strength')?.stacks ?? 0).toBeGreaterThanOrEqual(1);
  });

  it('星落：开局 +60 金币（富婆赞助）', () => {
    const run = Run.newRun('hero_thunderblade', 'char-xingluo-gold', { character: 'char_xingluo' });
    expect(run.state.gold).toBe(99 + 60);
  });

  it('奶蛙：每回合首张攻击牌 +3 真实伤害；击杀敌人回 3 生命', () => {
    const { combat } = makeCombat('char_naiwa');
    const enemy = combat.enemies[0];
    const hp0 = enemy.hp;
    // 直接通过 Hook 触发路径：打出一张攻击牌（借 OnCardPlayed 事件手动触发，避免依赖手牌）
    combat.hooks.trigger('OnCardPlayed', { combat, card: { defId: findAttackCard(), upgradeLevel: 0, cost: 1, exhaust: false, retain: false }, target: { id: enemy.id } });
    expect(enemy.hp).toBeLessThan(hp0); // 拳头造成了伤害
    // 击杀回血
    combat.player.hp = 10;
    combat.dealDamage(combat.player, enemy, emptyDamageRequest(9999));
    expect(combat.player.hp).toBe(13);
  });

  function findAttackCard(): string {
    for (const id of CARD_REGISTRY.keys()) {
      if (getCardDef(id).cardType === 'Attack') return id;
    }
    throw new Error('无攻击牌');
  }
});

describe('开局装配人物遗物', () => {
  it('newRun 传入 character 时自动把专属遗物加入 relics', () => {
    const run = Run.newRun('hero_thunderblade', 'char-wire-1', { character: 'char_qianxia' });
    expect(run.characterId).toBe('char_qianxia');
    expect(run.state.relics).toContain('relic_qianxia_undying');
    expect(run.hasRelic('relic_qianxia_undying')).toBe(true);
  });

  it('未选择人物时为空', () => {
    const run = Run.newRun('hero_thunderblade', 'char-wire-2');
    expect(run.characterId).toBe('');
    expect(run.state.relics).not.toContain('relic_qianxia_undying');
  });

  it('遗物带局外金币加成（阿斯特里斯人口普查增收）', () => {
    const relic = getRelicDef('relic_qianxia_undying');
    expect(relic.runEffect?.goldBonusPct).toBe(15);
  });
});

describe('水千夏：不死魔王（每场战斗免死一次）', () => {
  function makeCombat() {
    const run = Run.newRun('hero_thunderblade', 'char-save-1', { character: 'char_qianxia' });
    const reachable = run.reachableNodes();
    run.enterNode(reachable[0].id);
    const combat = run.startCombat();
    return { run, combat };
  }

  it('首次致死伤害被锁到 1 点生命，战斗继续', () => {
    const { combat } = makeCombat();
    combat.player.hp = 3;
    combat.dealDamage(null, combat.player, emptyDamageRequest(999));
    expect(combat.player.hp).toBe(1);
    expect(combat.ended).toBe(false);
  });

  it('第二次致死伤害不再免死（一局战斗仅一次）', () => {
    const { run, combat } = makeCombat();
    combat.player.hp = 3;
    combat.dealDamage(null, combat.player, emptyDamageRequest(999));
    expect(combat.player.hp).toBe(1);
    combat.dealDamage(null, combat.player, emptyDamageRequest(999));
    expect(combat.player.isDead()).toBe(true);
    expect(combat.ended).toBe(true);
    expect(combat.victory).toBe(false);
    expect(run.state.hp).toBe(run.state.maxHp); // 结算前 run 层生命未同步
  });

  it('每场战斗重置免死次数', () => {
    const run = Run.newRun('hero_thunderblade', 'char-save-3', { character: 'char_qianxia' });

    // 第一场：获胜（打完敌人），免死尚未触发
    let reachable = run.reachableNodes();
    run.enterNode(reachable[0].id);
    let combat = run.startCombat();
    for (const e of [...combat.enemies]) {
      combat.dealDamage(combat.player, e, emptyDamageRequest(9999));
    }
    expect(combat.victory).toBe(true);
    run.onCombatEnd();
    expect(run.state.defeat).not.toBe(true);

    // 第二场：免死应已重置，可再次生效
    run.state.hp = 3;
    run.state.currentNodeId = null;
    reachable = run.reachableNodes();
    run.enterNode(reachable[0].id);
    combat = run.startCombat();
    combat.player.hp = 3;
    combat.dealDamage(null, combat.player, emptyDamageRequest(999));
    expect(combat.player.hp).toBe(1);
    expect(combat.ended).toBe(false);
  });
});
