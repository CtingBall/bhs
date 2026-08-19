// ============================================================================
// 召唤物唯一性测试：同类召唤物在场时不重复召唤；升级分支可突破限制
// ============================================================================

import { describe, it, expect, beforeAll } from 'vitest';
import { Run } from '../src/core/run';
import '../src/content/index';
import { upgradeCardDef, getCardDef } from '../src/core/cards';

beforeAll(() => {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
});

describe('召唤牌一次性与召唤物唯一性', () => {
  function makeCombat() {
    const run = Run.newRun('hero_sylvanguard', 'summon-uniq-1');
    run.enterNode(run.reachableNodes()[0].id);
    return { run, combat: run.startCombat() };
  }

  it('动作树召唤牌自动标记为消耗牌', () => {
    expect(getCardDef('card_syl_ancient_treant').exhaust).toBe(true);
    expect(getCardDef('card_sht_beast_whistle').exhaust).toBe(true);
    expect(getCardDef('card_sht_wild_call').exhaust).toBe(true);
    // 镰车只操作月刃 Buff，不含 SummonAlly，不应被误判为消耗牌
    expect(getCardDef('card_tb_scythe_wheel').exhaust ?? false).toBe(false);
  });

  it('同类召唤物在场时，再次直接召唤被拒绝', () => {
    const { combat } = makeCombat();
    combat.summonAlly({ unitId: 'treant', name: '远古树人', maxHp: 30, autoAttack: 8 });
    expect(combat.allies.filter((a) => a.state['summonKey'] === 'treant').length).toBe(1);
    combat.summonAlly({ unitId: 'treant', name: '远古树人', maxHp: 30, autoAttack: 8 });
    expect(combat.allies.filter((a) => a.state['summonKey'] === 'treant').length).toBe(1); // 仍是 1
  });

  it('召唤物死亡后可再次召唤', () => {
    const { combat } = makeCombat();
    combat.summonAlly({ unitId: 'treant', name: '远古树人', maxHp: 30, autoAttack: 8 });
    const first = combat.allies.find((a) => a.state['summonKey'] === 'treant')!;
    combat.removeAlly(first);
    combat.summonAlly({ unitId: 'treant', name: '远古树人', maxHp: 30, autoAttack: 8 });
    expect(combat.allies.filter((a) => a.state['summonKey'] === 'treant').length).toBe(1);
    // id 不复用（死亡移除后序号继续递增）
    const ids = combat.allies.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('allowMultiple 显式声明时不受唯一限制', () => {
    const { combat } = makeCombat();
    combat.summonAlly({ unitId: 'fairy-ks', name: '林精花仙', maxHp: 16, autoAttack: 5, allowMultiple: true });
    combat.summonAlly({ unitId: 'fairy-ks', name: '林精花仙', maxHp: 16, autoAttack: 5, allowMultiple: true });
    expect(combat.allies.filter((a) => a.state['summonKey'] === 'fairy-ks').length).toBe(2);
  });

  it('升级分支 summonExtra 使动作树 allowMultiple=true', () => {
    // 幻影魔狼升级A：狼群（召唤 2 匹）
    const base = getCardDef('card_sht_phantom_wolf');
    const upgraded = upgradeCardDef(base, 1);
    const params = (upgraded.actionTree as { params?: { allowMultiple?: boolean } }).params;
    expect(params?.allowMultiple).toBe(true);
    // 基础版不允许多只
    const baseParams = (base.actionTree as { params?: { allowMultiple?: boolean } }).params;
    expect(baseParams?.allowMultiple).toBeUndefined();
  });
});
