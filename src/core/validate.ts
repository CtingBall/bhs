// ============================================================================
// 内容 Schema 强校验（卡牌/动作树合法性检查）
// 供 Mod 热加载与测试共用
// ============================================================================

import type { ActionNode } from './actions';
import { CARD_REGISTRY } from './cards';
import type { CardDef } from './cards';
import { BUFF_REGISTRY } from './buffs';

export const VALID_ACTION_TYPES = new Set([
  'DealDamage', 'GainBlock', 'GainBarrier', 'Heal', 'ModifyEnergy', 'ModifyResource',
  'ModifyMaxHp', 'SwitchForm', 'SetState', 'SetNoDraw', 'SummonAlly', 'LoseHp',
  'DrawCards', 'DiscardCards', 'ExileCard', 'FetchFromPile', 'GenerateCard',
  'ApplyBuff', 'ConsumeBuff', 'CleanseBuff',
  'Sequence', 'ConditionalBranch', 'ForEachTarget', 'Repeat',
  'TriggerVFX', 'ClearBlock',
]);

export const VALID_TARGET_SELECTORS = new Set([
  'Self', 'SingleEnemy', 'AllEnemies', 'RandomEnemy',
  'AllAllies', 'SingleAlly', 'LowestHpUnit', 'HighestAttackUnit', 'AdjacentEnemies',
]);

export function validateActionTree(node: ActionNode, errors: string[], path = 'root'): void {
  if (!node || typeof node.action_type !== 'string') {
    errors.push(`${path}: 缺少 action_type`);
    return;
  }
  if (!VALID_ACTION_TYPES.has(node.action_type)) {
    errors.push(`${path}: 非法 action_type「${node.action_type}」`);
  }
  if (node.target_selector && !VALID_TARGET_SELECTORS.has(node.target_selector)) {
    errors.push(`${path}: 非法 target_selector「${node.target_selector}」`);
  }
  if (node.params && typeof node.params.buff_id === 'string' && !BUFF_REGISTRY[node.params.buff_id]) {
    errors.push(`${path}: 引用未知 Buff「${node.params.buff_id}」`);
  }
  if (node.action_type === 'GenerateCard' || node.action_type === 'FetchFromPile') {
    const cardId = node.params?.card_id;
    if (typeof cardId === 'string' && !CARD_REGISTRY.has(cardId)) {
      errors.push(`${path}: 引用未知卡牌「${cardId}」`);
    }
  }
  if (node.actions) node.actions.forEach((n, i) => validateActionTree(n, errors, `${path}.actions[${i}]`));
  if (node.on_true) node.on_true.forEach((n, i) => validateActionTree(n, errors, `${path}.on_true[${i}]`));
  if (node.on_failure) node.on_failure.forEach((n, i) => validateActionTree(n, errors, `${path}.on_failure[${i}]`));
  if (node.action_type === 'Sequence' && node.params && Array.isArray(node.params.actions)) {
    (node.params.actions as ActionNode[]).forEach((n, i) => validateActionTree(n, errors, `${path}.params.actions[${i}]`));
  }
}

export function validateCardDef(def: CardDef): string[] {
  const errors: string[] = [];
  if (!def.id || !def.name) errors.push('卡牌缺少 id/name');
  if (typeof def.baseCost !== 'number' || def.baseCost < 0) errors.push('费用必须为非负数字');
  if (!['Attack', 'Skill', 'Power', 'Status', 'Curse'].includes(def.cardType)) errors.push('非法 cardType');
  if (!['Common', 'Uncommon', 'Rare', 'Special'].includes(def.rarity)) errors.push('非法 rarity');
  if (def.requires && !def.requires.resourceId) errors.push('requires 缺少 resourceId');
  validateActionTree(def.actionTree, errors, `card[${def.id}]`);
  return errors;
}
