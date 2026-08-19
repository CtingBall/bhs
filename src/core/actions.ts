// ============================================================================
// 效果 DSL 与动作解释器（Composite Action Tree Interpreter）
// 所有卡牌 / 遗物 / 怪物意图底层统一为原子动作树，由本解释器执行。
// 动作原语集：
//   数值类   DealDamage / GainBlock / Heal / ModifyEnergy / ModifyResource
//   牌堆类   DrawCards / DiscardCards / ExileCard / FetchFromPile / GenerateCard
//   状态类   ApplyBuff / ConsumeBuff / CleanseBuff
//   流程类   Sequence / ConditionalBranch / ForEachTarget / Repeat
// ============================================================================

import type { Unit } from './units';
import type { RngStream } from './rng';
import type { DamageRequest, DamageResult } from './valuePipeline';

export type TargetSelector =
  | 'Self' | 'SingleEnemy' | 'AllEnemies' | 'RandomEnemy'
  | 'AllAllies' | 'SingleAlly' | 'LowestHpUnit' | 'HighestAttackUnit'
  | 'AdjacentEnemies';

export type ActionType =
  | 'DealDamage' | 'GainBlock' | 'GainBarrier' | 'Heal' | 'ModifyEnergy' | 'ModifyResource'
  | 'ModifyMaxHp' | 'SwitchForm' | 'SetState' | 'SetNoDraw'
  | 'SummonAlly' | 'LoseHp'
  | 'DrawCards' | 'DiscardCards' | 'ExileCard' | 'FetchFromPile' | 'GenerateCard'
  | 'ApplyBuff' | 'ConsumeBuff' | 'CleanseBuff'
  | 'Sequence' | 'ConditionalBranch' | 'ForEachTarget' | 'Repeat'
  | 'TriggerVFX' | 'ClearBlock';

export type ResourceOperation = 'Add' | 'Consume' | 'Set' | 'Multiply';

export interface ActionCondition {
  condition_type:
    | 'ResourceCheck' | 'TargetHasBuff' | 'UnitHasBuff' | 'UnitState' | 'VarCheck'
    | 'HpPercentLessThan' | 'Chance' | 'HandSizeLessThanEq' | 'Always';
  resource_id?: string;
  buff_id?: string;
  state_key?: string;
  state_value?: unknown;
  var_name?: string;
  operator?: '>=' | '<=' | '>' | '<' | '==' | '!=';
  value?: number;
  chance?: number;
}

export interface ActionFilter {
  filter_type: 'ExcludeSelf' | 'HasBuff' | 'HpPercentLessThan' | 'HasTag';
  buff_id?: string;
  tag?: string;
  value?: number;
}

export interface ActionNode {
  action_type: ActionType;
  target_selector?: TargetSelector;
  filters?: ActionFilter[];
  /** 各类动作参数（见各分支） */
  params?: Record<string, unknown>;
  conditions?: ActionCondition[];
  on_true?: ActionNode[];
  on_failure?: ActionNode[];
  /** 子动作（Sequence / ForEachTarget / Repeat 用） */
  actions?: ActionNode[];
}

// ---------------------------------------------------------------------------
// 执行环境（由 Combat 实现）
// ---------------------------------------------------------------------------

export interface ScalingRule {
  variable_name?: string;
  /** 属性缩放：MaxHp / LostHp / Block / Barrier / AbsorbedTotal / Sharpness */
  attribute?: 'MaxHp' | 'LostHp' | 'Block' | 'Barrier' | 'AbsorbedTotal' | 'Sharpness';
  /** 属性先除以 divisor（如 圣剑：MaxHp/10 取整） */
  divisor?: number;
  multiplier?: number;
}

export interface CombatApi {
  rngCombat: RngStream;
  /** 按选择器解析目标（含过滤器） */
  resolveTargets(selector: TargetSelector, source: Unit, primary: Unit | null, filters?: ActionFilter[]): Unit[];
  /** 对 target 造成一次伤害（走五阶段管道 + Hook + 附加机制）。splash: 顺劈比例（0-1），对其它敌人造成该比例伤害 */
  dealDamage(source: Unit, target: Unit, req: DamageRequest, splash?: number): DamageResult;
  gainBlock(target: Unit, amount: number): number;
  gainBarrier(target: Unit, amount: number): number;
  heal(target: Unit, amount: number): number;
  modifyEnergy(source: Unit, amount: number): void;
  modifyResource(unit: Unit, resourceId: string, op: ResourceOperation, amount: number): void;
  modifyMaxHp(target: Unit, amount: number, heal: boolean): void;
  switchForm(form: string): void;
  setState(key: string, value: unknown): void;
  loseHpSelf(amount: number): void;
  summonAlly(params: { unitId: string; name: string; maxHp: number; autoAttack: number; portrait?: string; hits?: number; energyCost?: number; targetLowest?: boolean; lifesteal?: number; allowMultiple?: boolean }): void;
  getResource(unit: Unit, resourceId: string): number;
  drawCards(amount: number): void;
  discardHand(): void;
  exileCard(uid: string): void;
  fetchFromPile(cardId: string, fromPile: 'draw' | 'discard' | 'exhaust', costOverride: number | null): boolean;
  generateCard(cardId: string, destination: 'hand' | 'drawTop' | 'discard'): void;
  applyBuff(target: Unit, buffId: string, stacks: number): void;
  consumeBuff(target: Unit, buffId: string, amount: number): number;
  clearBlock(target: Unit): void;
  setNoDrawThisTurn(flag: boolean): void;
  getHandSize(): number;
  triggerVFX(vfxId: string): void;
  log(text: string): void;
}

export interface ActionEnv {
  api: CombatApi;
  source: Unit;
  primary: Unit | null;
  variables: Record<string, number>;
  depth: number;
}

export const MAX_ACTION_DEPTH = 16;

// ---------------------------------------------------------------------------
// 解释器
// ---------------------------------------------------------------------------

export function executeActions(nodes: ActionNode[], env: ActionEnv): void {
  for (const node of nodes) executeAction(node, env);
}

export function executeAction(node: ActionNode, env: ActionEnv): void {
  if (env.depth > MAX_ACTION_DEPTH) {
    console.warn('[Action] 动作树深度超过上限，已熔断:', node.action_type);
    return;
  }
  const api = env.api;

  switch (node.action_type) {
    // ---------------- 数值类 ----------------
    case 'DealDamage': {
      const p = node.params ?? {};
      const targets = pickTargets(api, node, env);
      const repeat = asNum(p.repeat, 1);
      const type = (p.type as 'physical' | 'magic' | 'true') ?? 'physical';
      const lifesteal = asNum(p.lifesteal, 0);
      const flat = asNum(p.flat, 0);
      const percents = (p.percents as number[] | undefined) ?? [];
      const defenderMults = (p.defenderMults as number[] | undefined) ?? [];
      const reduction = asNum(p.reduction, 0);
      const scaling = (p.scaling as ScalingRule[] | undefined) ?? [];
      for (let r = 0; r < repeat; r++) {
        for (const t of targets) {
          let base = asNum(p.base, 0);
          for (const s of scaling) {
            // 属性缩放一律读取施法者（护盾猛击读自身护盾、圣剑读自身血上限等）
            base += scaleValue(s, env.source, env) * asNum(s.multiplier, 1);
          }
          const req: DamageRequest = {
            base, type,
            flat: flat + buffFlatDamage(env.source),
            percents: [...percents, ...buffPercentDamage(env.source)],
            defenderMults: [...defenderMults, ...buffDefenderMults(t)],
            reduction,
            globalMod: 1,
            singleTarget: node.target_selector === 'SingleEnemy',
          };
          const splash = p.splash !== undefined ? asNum(p.splash, 0) : undefined;
          const result = api.dealDamage(env.source, t, req, splash);
          if (lifesteal > 0) {
            const healAmt = Math.round(result.remaining * lifesteal);
            if (healAmt > 0) api.heal(env.source, healAmt);
          }
          env.variables['LastDamageDealt'] = result.remaining;
        }
      }
      break;
    }

    case 'GainBlock': {
      const p = node.params ?? {};
      const targets = pickTargets(api, node, env);
      let base = asNum(p.base, 0);
      const scaling = (p.scaling as ScalingRule[] | undefined) ?? [];
      for (const s of scaling) {
        base += scaleValue(s, env.source, env) * asNum(s.multiplier, 1);
      }
      let amount = base + buffFlatBlock(env.source);
      const pcts = [...((p.percents as number[] | undefined) ?? [])];
      if (env.source.hasBuff('frail')) amount *= 0.75;
      if (env.source.hasBuff('shield_boost')) amount *= 1.5; // 神盾骑士【坚盾】
      // K5-4 不动明王：护甲获取 ×3
      const blockMult = env.source.state['blockMult'] as number | undefined;
      if (blockMult) amount *= blockMult;
      // 灵魂乐手·舞台音箱共鸣
      const speakerBoost = speakerMult(env.source);
      if (speakerBoost) amount *= speakerBoost;
      amount *= pcts.reduce((acc, x) => acc * (1 + x), 1);
      for (const t of targets) api.gainBlock(t, Math.round(amount));
      break;
    }

    case 'GainBarrier': {
      const p = node.params ?? {};
      const targets = pickTargets(api, node, env);
      let base = asNum(p.base, 0);
      const scaling = (p.scaling as ScalingRule[] | undefined) ?? [];
      for (const s of scaling) {
        base += scaleValue(s, env.source, env) * asNum(s.multiplier, 1);
      }
      for (const t of targets) api.gainBarrier(t, Math.round(base));
      break;
    }

    case 'ModifyMaxHp': {
      const p = node.params ?? {};
      const targets = pickTargets(api, node, env);
      const amount = asNum(p.amount, 0);
      const heal = p.heal === true;
      for (const t of targets) api.modifyMaxHp(t, amount, heal);
      break;
    }

    case 'SwitchForm': {
      const p = node.params ?? {};
      api.switchForm(p.form as string);
      break;
    }

    case 'LoseHp': {
      const p = node.params ?? {};
      api.loseHpSelf(asNum(p.amount, 0));
      break;
    }

    case 'SummonAlly': {
      const p = (node.params ?? {}) as { unitId: string; name: string; maxHp: number; autoAttack: number; portrait?: string };
      api.summonAlly(p);
      break;
    }

    case 'SetState': {
      const p = node.params ?? {};
      api.setState(p.key as string, p.value);
      break;
    }

    case 'SetNoDraw': {
      api.setNoDrawThisTurn(true);
      break;
    }

    case 'Heal': {
      const p = node.params ?? {};
      const targets = pickTargets(api, node, env);
      let base = asNum(p.base, 0) + buffFlatHeal();
      const scaling = (p.scaling as ScalingRule[] | undefined) ?? [];
      for (const s of scaling) {
        base += scaleValue(s, env.source, env) * asNum(s.multiplier, 1);
      }
      // 治疗增幅（森语者·森林之怒等）
      const healBoost = env.source.state['healBoost'] as number | undefined;
      if (healBoost) base *= healBoost;
      // 灵魂乐手·舞台音箱共鸣（60%→100%）
      const speakerBoost = speakerMult(env.source);
      if (speakerBoost) base *= speakerBoost;
      for (const t of targets) api.heal(t, Math.round(base));
      break;
    }

    case 'ModifyEnergy': {
      const p = node.params ?? {};
      api.modifyEnergy(env.source, asNum(p.amount, 0));
      break;
    }

    case 'ModifyResource': {
      const p = node.params ?? {};
      const targets = pickTargets(api, node, env);
      const op = (p.operation as ResourceOperation) ?? 'Add';
      let amount = asNum(p.amount, 0);
      const scaling = (p.scaling as ScalingRule[] | undefined) ?? [];
      for (const s of scaling) {
        amount += scaleValue(s, env.source, env) * asNum(s.multiplier, 1);
      }
      for (const t of targets) {
        const before = api.getResource(t, p.resource_id as string);
        api.modifyResource(t, p.resource_id as string, op, amount);
        // 支持将「变更量」存入变量（居合斩消耗全部雷印按消耗量增伤）
        if (p.store_to) {
          const after = api.getResource(t, p.resource_id as string);
          env.variables[p.store_to as string] = op === 'Consume' ? before - after : after - before;
        }
      }
      break;
    }

    // ---------------- 牌堆类 ----------------
    case 'DrawCards': {
      const p = node.params ?? {};
      api.drawCards(asNum(p.amount, 1));
      break;
    }

    case 'DiscardCards': {
      api.discardHand();
      break;
    }

    case 'ExileCard': {
      const p = node.params ?? {};
      api.exileCard(p.uid as string);
      break;
    }

    case 'FetchFromPile': {
      const p = node.params ?? {};
      const co = p.cost_override !== undefined ? asNum(p.cost_override, 0) : null;
      api.fetchFromPile(
        p.card_id as string,
        (p.from_pile as 'draw' | 'discard' | 'exhaust') ?? 'discard',
        co,
      );
      break;
    }

    case 'GenerateCard': {
      const p = node.params ?? {};
      api.generateCard(p.card_id as string, (p.destination as 'hand' | 'drawTop' | 'discard') ?? 'hand');
      break;
    }

    // ---------------- 状态类 ----------------
    case 'ApplyBuff': {
      const p = node.params ?? {};
      const targets = pickTargets(api, node, env);
      const stacks = asNum(p.stacks, 1);
      for (const t of targets) {
        if (p.mode === 'extend' && t.hasBuff(p.buff_id as string)) {
          api.applyBuff(t, p.buff_id as string, t.getBuffStacks(p.buff_id as string) + stacks);
        } else {
          api.applyBuff(t, p.buff_id as string, stacks);
        }
      }
      break;
    }

    case 'ConsumeBuff': {
      const p = node.params ?? {};
      const targets = pickTargets(api, node, env);
      const consumedAll = p.consume_all === true;
      const varName = p.store_consumed_stacks_to as string | undefined;
      for (const t of targets) {
        const stacks = t.getBuffStacks(p.buff_id as string);
        const amount = consumedAll ? stacks : Math.min(stacks, asNum(p.amount, stacks));
        const consumed = api.consumeBuff(t, p.buff_id as string, amount);
        if (varName) env.variables[varName] = (env.variables[varName] ?? 0) + consumed;
      }
      break;
    }

    case 'CleanseBuff': {
      const p = node.params ?? {};
      const targets = pickTargets(api, node, env);
      const buffId = p.buff_id as string | undefined;
      for (const t of targets) {
        if (buffId) t.removeBuff(buffId);
      }
      break;
    }

    // ---------------- 流程类 ----------------
    case 'Sequence': {
      // 兼容两种子动作存放位置：node.actions（Repeat/ForEach 约定）与 params.actions（seq 构建器约定）
      const children = (node.actions ?? ((node.params?.actions as ActionNode[] | undefined) ?? [])) ?? [];
      if (children.length > 0) executeActions(children, { ...env, depth: env.depth + 1 });
      break;
    }

    case 'ConditionalBranch': {
      const pass = evaluateConditions(node.conditions ?? [], env);
      if (pass) {
        if (node.on_true) executeActions(node.on_true, { ...env, depth: env.depth + 1 });
      } else if (node.on_failure) {
        executeActions(node.on_failure, { ...env, depth: env.depth + 1 });
      }
      break;
    }

    case 'ForEachTarget': {
      const targets = pickTargets(api, node, env);
      if (node.actions) {
        for (const t of targets) {
          executeActions(node.actions, { ...env, primary: t, depth: env.depth + 1 });
        }
      }
      break;
    }

    case 'Repeat': {
      const p = node.params ?? {};
      const count = asNum(p.count, 1);
      if (node.actions) {
        for (let i = 0; i < count; i++) {
          executeActions(node.actions, { ...env, depth: env.depth + 1 });
        }
      }
      break;
    }

    case 'TriggerVFX': {
      const p = node.params ?? {};
      api.triggerVFX(p.vfx_id as string);
      break;
    }

    case 'ClearBlock': {
      const targets = pickTargets(api, node, env);
      for (const t of targets) api.clearBlock(t);
      break;
    }

    default:
      api.log(`[Action] 未实现的动作类型: ${node.action_type}`);
  }
}

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

function pickTargets(api: CombatApi, node: ActionNode, env: ActionEnv): Unit[] {
  const selector = node.target_selector ?? 'SingleEnemy';
  return api.resolveTargets(selector, env.source, env.primary, node.filters);
}

export function evaluateConditions(conditions: ActionCondition[], env: ActionEnv): boolean {
  for (const c of conditions) {
    switch (c.condition_type) {
      case 'Always':
        break;
      case 'ResourceCheck': {
        const v = env.api.getResource(env.source, c.resource_id!);
        if (!compare(v, c.operator ?? '>=', c.value ?? 0)) return false;
        break;
      }
      case 'TargetHasBuff': {
        const t = env.primary;
        if (!t || !t.hasBuff(c.buff_id!)) return false;
        const stacks = t.getBuffStacks(c.buff_id!);
        if (!compare(stacks, c.operator ?? '>=', c.value ?? 1)) return false;
        break;
      }
      case 'UnitHasBuff': {
        if (!env.source.hasBuff(c.buff_id!)) return false;
        const stacks = env.source.getBuffStacks(c.buff_id!);
        if (!compare(stacks, c.operator ?? '>=', c.value ?? 1)) return false;
        break;
      }
      case 'UnitState': {
        if (env.source.state[c.state_key!] !== c.state_value) return false;
        break;
      }
      case 'VarCheck': {
        const v = env.variables[c.var_name!] ?? 0;
        if (!compare(v, c.operator ?? '>=', c.value ?? 1)) return false;
        break;
      }
      case 'HpPercentLessThan': {
        const t = env.primary ?? env.source;
        const pct = (t.hp / t.maxHp) * 100;
        if (!(pct < (c.value ?? 50))) return false;
        break;
      }
      case 'HandSizeLessThanEq': {
        if (!(env.api.getHandSize?.() <= (c.value ?? 3))) return false;
        break;
      }
      case 'Chance': {
        if (!env.api.rngCombat.chance(c.chance ?? 0.5)) return false;
        break;
      }
      default:
        return false;
    }
  }
  return true;
}

function compare(v: number, op: string, target: number): boolean {
  switch (op) {
    case '>=': return v >= target;
    case '<=': return v <= target;
    case '>': return v > target;
    case '<': return v < target;
    case '==': return v === target;
    case '!=': return v !== target;
    default: return false;
  }
}

function asNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return fallback;
}

/** 按规则计算属性缩放基值（圣剑/裁决/清算等） */
function scaleValue(rule: ScalingRule, target: Unit, env: ActionEnv): number {
  if (rule.variable_name) return env.variables[rule.variable_name] ?? 0;
  let v = 0;
  switch (rule.attribute) {
    case 'MaxHp': v = target.maxHp; break;
    case 'LostHp': v = target.maxHp - target.hp; break;
    case 'Block': v = target.block; break;
    case 'Barrier': v = target.barrier; break;
    case 'AbsorbedTotal': v = (target.state['absorbedTotal'] as number) ?? 0; break;
    case 'Sharpness': v = target.getBuffStacks('sharpness'); break;
    default: v = 0;
  }
  if (rule.divisor && rule.divisor > 0) v = Math.floor(v / rule.divisor);
  return v;
}

/** Stage1 攻击方固定加成（力量等） */
function buffFlatDamage(source: Unit): number {
  return source.getBuffStacks('strength');
}

/** Stage2 攻击方百分比加成（负向如虚弱 → 附加 -0.25） */
function buffPercentDamage(source: Unit): number[] {
  const out: number[] = [];
  if (source.hasBuff('weak')) out.push(-0.25);
  return out;
}

/** Stage3 受击方倍率（易伤 ×1.5） */
function buffDefenderMults(target: Unit): number[] {
  const out: number[] = [];
  if (target.hasBuff('vulnerable')) out.push(1.5);
  return out;
}

/** 防御固定加成（敏捷等，v1 未启用） */
function buffFlatBlock(source: Unit): number {
  return source.getBuffStacks('dexterity');
}

function buffFlatHeal(): number {
  return 0;
}

/** 舞台音箱共鸣倍率（60% / 热情挥洒后 100%） */
function speakerMult(source: Unit): number {
  if (source.state['speaker'] !== true) return 1;
  const passion = (source.state['passion'] as number | undefined) ?? 0;
  return passion > 0 ? 2 : 1.6;
}
