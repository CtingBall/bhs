// ============================================================================
// 卡牌模型（静态配置原型 CardDef + 运行时实例 CardInstance 分离）
// ============================================================================

import type { ActionNode, ActionType } from './actions';

export type CardType = 'Attack' | 'Skill' | 'Power' | 'Status' | 'Curse';
export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Special';
export type TargetType =
  | 'SingleEnemy' | 'AllEnemies' | 'Self' | 'None'
  | 'RandomEnemy' | 'SingleAlly' | 'AllAllies';

export interface CardUpgradeBranch {
  label: string;
  /** 覆盖描述 */
  descOverride?: string;
  cost?: number;
  /** 通用数值增幅（实现层按卡处理） */
  damageBonus?: number;
  blockBonus?: number;
  healBonus?: number;
  /** 召唤物额外召唤次数（升级后突破同类唯一限制） */
  summonExtra?: number;
}

export interface CardDef {
  id: string;
  name: string;
  classId?: string;
  cardType: CardType;
  rarity: CardRarity;
  baseCost: number;
  targetType: TargetType;
  tags: string[];
  exhaust?: boolean;
  retain?: boolean;
  /** 无法打出（诅咒牌等） */
  unplayable?: boolean;
  /** 打出前置资源要求（如一闪需 2 雷之印） */
  requires?: { resourceId: string; min: number };
  description: string;
  actionTree: ActionNode;
  /** 双分支升级：分支A数值极化 / 分支B机制质变 */
  upgradeA?: CardUpgradeBranch;
  upgradeB?: CardUpgradeBranch;
  /** 升级后实际生效的动作树（由升级分支生成，或运行时按 level 修正） */
  upgradedTree?: ActionNode;
}

export type UpgradeLevel = 0 | 1 | 2;

export interface CardInstance {
  uid: string;
  defId: string;
  /** 当前动态费用（基础费用 + 修正） */
  cost: number;
  /** 本回合强制费用覆盖（0 费类） */
  tempCostOverride: number | null;
  upgradeLevel: UpgradeLevel;
  exhaust: boolean;
  retain: boolean;
  temporary?: boolean;
}

export const CARD_REGISTRY = new Map<string, CardDef>();

export function registerCard(def: CardDef): void {
  if (CARD_REGISTRY.has(def.id)) {
    console.warn(`[Card] 重复注册卡牌: ${def.id}`);
  }
  // 杀戮尖塔式召唤牌：真正包含 SummonAlly 动作的卡牌打出后消耗，
  // 不依赖手写标签，避免漏配（Sequence/分支/Repeat 内嵌也能识别）。
  if (!def.exhaust && containsAction(def.actionTree, 'SummonAlly')) {
    def = { ...def, exhaust: true };
  }
  CARD_REGISTRY.set(def.id, def);
}

function containsAction(node: ActionNode | ActionNode[], actionType: ActionType): boolean {
  const nodes = Array.isArray(node) ? node : [node];
  return nodes.some((current) => {
    if (current.action_type === actionType) return true;
    const params = current.params ?? {};
    return containsAction(current.actions ?? [], actionType)
      || containsAction(current.on_true ?? [], actionType)
      || containsAction(current.on_failure ?? [], actionType)
      || (Array.isArray(params.actions) && containsAction(params.actions as ActionNode[], actionType));
  });
}

export function getCardDef(id: string): CardDef {
  const def = CARD_REGISTRY.get(id);
  if (!def) throw new Error(`未知卡牌: ${id}`);
  return def;
}

export function cardInstance(defId: string, uid: string, upgradeLevel: UpgradeLevel = 0): CardInstance {
  const def = upgradeCardDef(getCardDef(defId), upgradeLevel);
  return {
    uid,
    defId,
    cost: def.baseCost,
    tempCostOverride: null,
    upgradeLevel,
    exhaust: def.exhaust ?? false,
    retain: def.retain ?? false,
  };
}

export function isCardUnplayable(defId: string): boolean {
  return getCardDef(defId).unplayable === true;
}

// ---------------------------------------------------------------------------
// 卡牌升级：克隆动作树并按分支注入数值加成（分支A数值极化 / 分支B机制质变）
// ---------------------------------------------------------------------------

export function upgradeCardDef(def: CardDef, level: UpgradeLevel): CardDef {
  if (level === 0) return def;
  const branchDef: CardUpgradeBranch | undefined = level === 1 ? def.upgradeA : def.upgradeB;
  if (!branchDef) return def;
  const clone: CardDef = { ...def };
  if (branchDef.cost !== undefined) clone.baseCost = branchDef.cost;
  if (branchDef.descOverride) clone.description = branchDef.descOverride;
  clone.actionTree = patchTree(def.actionTree, branchDef);
  return clone;
}

function patchTree(node: ActionNode, branch: CardUpgradeBranch): ActionNode {
  const out: ActionNode = { ...node };
  const p0: Record<string, unknown> = out.params ? { ...out.params } : {};
  switch (node.action_type) {
    case 'DealDamage':
      if (branch.damageBonus) out.params = { ...p0, base: ((p0.base as number | undefined) ?? 0) + branch.damageBonus };
      break;
    case 'GainBlock':
      if (branch.blockBonus) out.params = { ...p0, base: ((p0.base as number | undefined) ?? 0) + branch.blockBonus };
      break;
    case 'Heal':
      if (branch.healBonus) out.params = { ...p0, base: ((p0.base as number | undefined) ?? 0) + branch.healBonus };
      break;
    case 'SummonAlly':
      // 升级分支可突破同类召唤物唯一限制（狼群/双生/繁育等多召唤质变）
      if (branch.summonExtra) out.params = { ...p0, allowMultiple: true };
      break;
    case 'Sequence':
      // 序列子动作位于 params.actions（与内容构建器一致）
      if (out.params && Array.isArray(out.params.actions)) {
        out.params = { ...out.params, actions: (out.params.actions as ActionNode[]).map((n) => patchTree(n, branch)) };
      }
      out.actions = ((out.actions as ActionNode[] | undefined) ?? []).map((n) => patchTree(n, branch));
      break;
    case 'ConditionalBranch':
      out.on_true = ((out.on_true as ActionNode[] | undefined) ?? []).map((n) => patchTree(n, branch));
      out.on_failure = ((out.on_failure as ActionNode[] | undefined) ?? []).map((n) => patchTree(n, branch));
      break;
    case 'Repeat':
      out.actions = ((out.actions as ActionNode[] | undefined) ?? []).map((n) => patchTree(n, branch));
      break;
    case 'ForEachTarget':
      out.actions = ((out.actions as ActionNode[] | undefined) ?? []).map((n) => patchTree(n, branch));
      break;
    default:
      break;
  }
  return out;
}
