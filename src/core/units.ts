// ============================================================================
// 统一实体底座（UnitEntity Core）
// 玩家 / 友军随从 / 怪物 / 精英 / Boss 共用同一套属性容器与 Buff 仓库
// ============================================================================

import type { BuffInstance } from './buffs';
import { getBuffDef } from './buffs';

export type UnitTag =
  | 'player' | 'enemy' | 'ally' | 'summon' | 'construct'
  | 'elite' | 'boss' | 'frontline' | 'aerial' | 'untargetable'
  | 'beast' | 'human' | 'slime' | 'spirit' | 'demon' | 'plant';

export interface UnitInit {
  id: string;
  name: string;
  maxHp: number;
  hp?: number;
  tags: UnitTag[];
  /** 伤害类型修正：怪物的攻击可声明为法术/真实 */
  damageType?: 'physical' | 'magic' | 'true';
  /** 固定减免系数（光铸身躯 0.5 等） */
  reductionRatio?: number;
  fixedReduction?: number;
  /** 是否为玩家（拥有能量/牌堆/资源） */
  isPlayer?: boolean;
  slot?: number;
}

export class Unit {
  readonly id: string;
  name: string;
  hp: number;
  maxHp: number;
  block = 0;
  /** 光铸屏障（临时血条，先于护甲被扣） */
  barrier = 0;
  tags: UnitTag[];
  damageType: 'physical' | 'magic' | 'true' = 'physical';
  reductionRatio = 0;
  fixedReduction = 0;
  isPlayer: boolean;
  slot: number;
  buffs = new Map<string, BuffInstance>();
  /** 敌人意图（明牌展示用），由 AI 推导填充 */
  intent: EnemyIntent | null = null;
  /** 职业/战斗自定义状态（形态、累计吸收量等） */
  state: Record<string, unknown> = {};
  /** 职业专属资源（雷之印/圣令/光明能量等） */
  resources: Record<string, number> = {};
  resourceCaps: Record<string, number> = {};

  constructor(init: UnitInit) {
    this.id = init.id;
    this.name = init.name;
    this.maxHp = init.maxHp;
    this.hp = init.hp ?? init.maxHp;
    this.tags = [...init.tags];
    if (init.damageType) this.damageType = init.damageType;
    if (init.reductionRatio !== undefined) this.reductionRatio = init.reductionRatio;
    if (init.fixedReduction !== undefined) this.fixedReduction = init.fixedReduction;
    this.isPlayer = init.isPlayer ?? false;
    this.slot = init.slot ?? 0;
  }

  hasTag(tag: UnitTag): boolean {
    return this.tags.includes(tag);
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  isAlive(): boolean {
    return this.hp > 0;
  }

  // ---------- Buff ----------
  hasBuff(id: string): boolean {
    return this.buffs.has(id) && (this.buffs.get(id)?.stacks ?? 0) > 0;
  }

  getBuffStacks(id: string): number {
    const b = this.buffs.get(id);
    return b ? b.stacks : 0;
  }

  applyBuff(id: string, stacks: number, sourceId?: string): void {
    if (stacks <= 0) return;
    const def = getBuffDef(id);
    const existing = this.buffs.get(id);
    if (existing) {
      if (def.model === 'duration') {
        existing.stacks = Math.max(existing.stacks, stacks); // 刷新/取最大回合
      } else {
        existing.stacks = Math.min(
          def.maxStacks ?? Infinity,
          existing.stacks + stacks,
        );
      }
      if (sourceId) existing.sourceId = sourceId;
    } else {
      this.buffs.set(id, { defId: id, stacks, sourceId });
    }
  }

  /** 扣减层数，归零则移除；返回实际扣减量 */
  consumeBuff(id: string, amount: number): number {
    const b = this.buffs.get(id);
    if (!b) return 0;
    const consumed = Math.min(b.stacks, amount);
    b.stacks -= consumed;
    if (b.stacks <= 0) this.buffs.delete(id);
    return consumed;
  }

  removeBuff(id: string): void {
    this.buffs.delete(id);
  }

  /** 回合结束：持续回合型 -1，强度型按规则衰减（燃烧等由战斗结算） */
  decayTurnTimers(): void {
    for (const [id, b] of [...this.buffs]) {
      const def = getBuffDef(id);
      if (def.model === 'duration') {
        b.stacks -= 1;
        if (b.stacks <= 0) this.buffs.delete(id);
      }
    }
  }

  // ---------- 数值 ----------
  heal(amount: number): number {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - before;
  }

  gainBlock(amount: number): number {
    const gained = Math.max(0, Math.round(amount));
    this.block += gained;
    return gained;
  }

  /** 扣除伤害：屏障 → 护甲 → 生命（调用方已走完五阶段管道）。返回实际扣血。 */
  loseHp(damage: number): number {
    let remaining = damage;
    if (remaining > 0 && this.barrier > 0) {
      const absorb = Math.min(this.barrier, remaining);
      this.barrier -= absorb;
      remaining -= absorb;
    }
    if (remaining > 0 && this.block > 0) {
      const absorb = Math.min(this.block, remaining);
      this.block -= absorb;
      remaining -= absorb;
    }
    if (remaining > 0) {
      this.hp -= remaining;
    }
    return damage - remaining >= 0 ? damage : damage; // 返回造成的总扣减前的伤害量
  }

  /** 清空本回合护甲（回合开始） */
  clearBlock(): void {
    this.block = 0;
  }
}

// ============================================================================
// 怪物意图（Transparent Intent）—— 明牌展示协议
// ============================================================================

export type IntentKind = 'attack' | 'attack_multihit' | 'block' | 'buff' | 'debuff' | 'special' | 'stun' | 'attack_debuff';

export interface EnemyIntent {
  kind: IntentKind;
  displayText: string;
  damage?: number;
  hits?: number;
  blockValue?: number;
  buffId?: string;
  buffStacks?: number;
  debuffId?: string;
  debuffStacks?: number;
  /** 伤害是否真实 */
  trueDamage?: boolean;
  /** 附加说明（供 UI 显示） */
  note?: string;
}
