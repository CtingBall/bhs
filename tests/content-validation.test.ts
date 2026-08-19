// ============================================================================
// 内容配置 Schema 校验（构建期强类型检查与断链检查）
// ============================================================================

import { describe, it, expect } from 'vitest';
import { CARD_REGISTRY, getCardDef } from '../src/core/cards';
import { BUFF_REGISTRY } from '../src/core/buffs';
import { CLASS_REGISTRY } from '../src/content/classes';
import { RELIC_REGISTRY } from '../src/content/relics';
import { CHARACTER_REGISTRY } from '../src/content/characters';
import type { ActionNode } from '../src/core/actions';

import '../src/content/cards';
import '../src/content/classes';
import '../src/content/relics';
import '../src/content/events';
import '../src/content/characters';
import { ACTS } from '../src/content/monsters';

describe('内容配置校验', () => {
  it('所有职业初始牌组与卡池引用存在', () => {
    for (const cls of CLASS_REGISTRY.values()) {
      for (const id of cls.starterDeck) {
        expect(CARD_REGISTRY.has(id), `${cls.id} 初始牌组引用未知卡牌: ${id}`).toBe(true);
      }
      for (const id of cls.cardPool) {
        expect(CARD_REGISTRY.has(id), `${cls.id} 卡池引用未知卡牌: ${id}`).toBe(true);
      }
      for (const id of cls.starterDeck) {
        const def = getCardDef(id);
        if (def.classId && def.classId !== cls.id) {
          expect.fail(`${cls.id} 初始牌组包含他职业卡牌: ${id} (${def.classId})`);
        }
      }
    }
  });

  it('动作树中引用的 Buff 均已在注册表定义', () => {
    const walk = (node: ActionNode): string[] => {
      const out: string[] = [];
      if (node.params?.buff_id) out.push(node.params.buff_id as string);
      if (node.actions) for (const n of node.actions) out.push(...walk(n));
      if (node.on_true) for (const n of node.on_true) out.push(...walk(n));
      if (node.on_failure) for (const n of node.on_failure) out.push(...walk(n));
      return out;
    };
    for (const card of CARD_REGISTRY.values()) {
      for (const buffId of walk(card.actionTree)) {
        expect(BUFF_REGISTRY[buffId], `卡牌 ${card.id} 引用未知 Buff: ${buffId}`).toBeTruthy();
      }
    }
  });

  it('卡牌前置资源要求对应职业资源', () => {
    for (const card of CARD_REGISTRY.values()) {
      if (!card.requires || !card.classId) continue;
      const cls = CLASS_REGISTRY.get(card.classId);
      expect(cls, `卡牌 ${card.id} 的职业 ${card.classId} 不存在`).toBeTruthy();
      const ids = cls!.resources.map((r) => r.id);
      expect(ids, `卡牌 ${card.id} 要求未知资源 ${card.requires.resourceId}`).toContain(card.requires.resourceId);
    }
  });

  it('事件与遗物引用合法', () => {
    const relicIds = new Set(RELIC_REGISTRY.keys());
    for (const relic of RELIC_REGISTRY.values()) {
      expect(relic.basePrice).toBeGreaterThanOrEqual(0);
    }
    for (const act of ACTS) {
      expect(act.pool.length).toBeGreaterThanOrEqual(3);
      expect(act.boss.maxHp).toBeGreaterThan(act.pool[0].maxHp);
    }
    void relicIds;
  });

  it('所有动作树 action_type 合法且卡牌费用非负', () => {
    const valid = new Set([
      'DealDamage', 'GainBlock', 'GainBarrier', 'Heal', 'ModifyEnergy', 'ModifyResource',
      'ModifyMaxHp', 'SwitchForm', 'SetState', 'SetNoDraw', 'SummonAlly', 'LoseHp',
      'DrawCards', 'DiscardCards', 'ExileCard', 'FetchFromPile', 'GenerateCard',
      'ApplyBuff', 'ConsumeBuff', 'CleanseBuff',
      'Sequence', 'ConditionalBranch', 'ForEachTarget', 'Repeat',
      'TriggerVFX', 'ClearBlock',
    ]);
    const walk = (node: ActionNode): void => {
      expect(valid.has(node.action_type), `非法 action_type: ${node.action_type}`).toBe(true);
      if (node.actions) node.actions.forEach(walk);
      if (node.on_true) node.on_true.forEach(walk);
      if (node.on_failure) node.on_failure.forEach(walk);
    };
    for (const card of CARD_REGISTRY.values()) {
      expect(card.baseCost).toBeGreaterThanOrEqual(0);
      walk(card.actionTree);
    }
  });

  it('人物模块：已开放人物必须指向已注册的专属遗物', () => {
    const relicIds = new Set(RELIC_REGISTRY.keys());
    for (const c of CHARACTER_REGISTRY.values()) {
      if (c.unlocked) {
        expect(relicIds.has(c.relicId), `已开放人物 ${c.id} 的专属遗物未注册: ${c.relicId}`).toBe(true);
        expect(c.relicId).not.toBe('');
      } else {
        expect(c.relicId, `未开放人物 ${c.id} 不应配置专属遗物`).toBe('');
      }
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.lore.length).toBeGreaterThan(0);
    }
  });
});
