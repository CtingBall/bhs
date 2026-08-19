// ============================================================================
// 五阶段数值修正管道（Universal Value Pipeline）
// FinalValue = max(0, ((Base + ΣFlat_Atk) × ∏(1 + Percent_Atk) × ∏Multiply_Def
//                      − Reduction_Def) × GlobalMod)
//   Stage 0: Base          基础面板
//   Stage 1: Attacker Flat 攻击方固定加成（力量、锋锐等）
//   Stage 2: Attacker %    攻击方百分比放大（狂暴、光能重铸、无相等级等）
//   Stage 3: Defender ×    受击方倍率（易伤 ×1.5、虚弱 ×0.75、暴击倍率）
//   Stage 4: Reduction    受击方比例吸收 / 绝对减免（屏障/护甲/生命由 Combat 依次扣减）
//   Stage 5: Clamp & Lock  保底 0、真实伤害跳级、免死锁血
// ============================================================================

export type DamageType = 'physical' | 'magic' | 'true';

export interface DamageRequest {
  base: number;
  type: DamageType;
  /** Stage1 攻击方固定加成（已求和） */
  flat: number;
  /** Stage2 攻击方百分比加成（数组，每个按 ×(1+v) 累乘） */
  percents: number[];
  /** Stage3 受击方倍率（如易伤 1.5） */
  defenderMults: number[];
  /** Stage4 受击方绝对减免（固定免伤） */
  reduction: number;
  /** Stage5 全局修正（默认 1） */
  globalMod: number;
  /** 是否为单体攻击（形态加成/顺劈判定用） */
  singleTarget?: boolean;
}

export interface DefenderView {
  /** Stage4 吸收比例（如光铸身躯 0.5，仅对非真实伤害生效） */
  reductionRatio: number;
  /** Stage4 固定免伤（神圣庇护类） */
  fixedReduction: number;
  maxHp: number;
}

export interface DamageResult {
  /** Stage3 之后的值（易伤/虚弱/暴击已结算） */
  raw: number;
  /** Stage4 被比例吸收的数值（光铸身躯等） */
  absorbedByRatio: number;
  /** Stage4 被固定免伤吸收的数值 */
  fixed: number;
  /** 经过 Stage4 吸收后、护甲/屏障抵扣前的剩余伤害 */
  remaining: number;
}

export function emptyDamageRequest(base = 0): DamageRequest {
  return { base, type: 'physical', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 };
}

/**
 * 结算一次伤害（纯函数）。
 * 真实伤害（type === 'true'）跳过 Stage 3/4 直接扣减生命（仍受全局修正与保底约束）。
 * 屏障 → 护甲 → 生命的实际扣减顺序由 Combat.dealDamage 执行。
 */
export function resolveDamage(req: DamageRequest, def: DefenderView): DamageResult {
  // Stage 0-2
  let value = (req.base + req.flat) * req.percents.reduce((acc, p) => acc * (1 + p), 1);
  // Stage 3
  if (req.type !== 'true') {
    value *= req.defenderMults.reduce((acc, m) => acc * m, 1);
  }
  // Stage 5 全局修正
  value *= req.globalMod;
  const raw = value;

  let absorbedByRatio = 0;
  let fixed = 0;
  let remaining = value;

  if (req.type !== 'true') {
    // Stage 4 比例吸收
    if (def.reductionRatio > 0 && remaining > 0) {
      absorbedByRatio = remaining * def.reductionRatio;
      remaining -= absorbedByRatio;
    }
    // Stage 4 固定免伤
    fixed = Math.min(def.fixedReduction, remaining);
    remaining -= fixed;
  }

  // Stage 5 保底
  if (remaining < 0) remaining = 0;
  if (Number.isNaN(remaining)) remaining = 0;

  return { raw, absorbedByRatio, fixed, remaining };
}

/** 治疗/护甲类基础值解析（支持固定加成与百分比） */
export function resolveBuffValue(base: number, flat = 0, percents: number[] = []): number {
  const v = (base + flat) * percents.reduce((acc, p) => acc * (1 + p), 1);
  return Math.max(0, Math.round(v));
}
