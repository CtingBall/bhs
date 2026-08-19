// ============================================================================
// Mod 热加载测试（外部 JSON Schema 导入）
// ============================================================================

// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import '../src/content/index';
import { importModJson } from '../src/content/modLoader';
import { getCardDef } from '../src/core/cards';
import { CLASS_REGISTRY } from '../src/content/classes';

beforeAll(() => {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
});

describe('Mod 热加载', () => {
  it('合法 Mod 注册卡牌并加入全职业卡池', () => {
    const result = importModJson({
      modName: '测试扩展包',
      cards: [
        {
          id: 'mod_test_spark',
          name: '测试·电火花',
          cardType: 'Attack',
          rarity: 'Common',
          baseCost: 1,
          targetType: 'SingleEnemy',
          tags: ['Attack'],
          description: '造成 5 点伤害。',
          actionTree: { action_type: 'DealDamage', target_selector: 'SingleEnemy', params: { base: 5 } },
        },
      ],
    });
    expect(result.ok).toBe(true);
    expect(result.added).toBe(1);
    expect(getCardDef('mod_test_spark').name).toBe('测试·电火花');
    for (const cls of CLASS_REGISTRY.values()) {
      expect(cls.cardPool).toContain('mod_test_spark');
    }
  });

  it('非法 Mod（未知动作类型/未知 Buff）被拒绝', () => {
    const result = importModJson({
      cards: [
        {
          id: 'mod_bad_1', name: '坏卡1', cardType: 'Attack', rarity: 'Common', baseCost: 1,
          targetType: 'SingleEnemy', tags: [], description: 'x',
          actionTree: { action_type: 'ExplodeEverything' },
        },
        {
          id: 'mod_bad_2', name: '坏卡2', cardType: 'Skill', rarity: 'Common', baseCost: 1,
          targetType: 'Self', tags: [], description: 'x',
          actionTree: { action_type: 'ApplyBuff', params: { buff_id: 'no_such_buff', stacks: 1 } },
        },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.added).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('重复 id 被拒绝', () => {
    const result = importModJson({
      cards: [
        {
          id: 'card_tb_thrust', name: '重复卡', cardType: 'Attack', rarity: 'Common', baseCost: 1,
          targetType: 'SingleEnemy', tags: [], description: 'x',
          actionTree: { action_type: 'DealDamage', params: { base: 1 } },
        },
      ],
    });
    expect(result.ok).toBe(false);
  });
});
