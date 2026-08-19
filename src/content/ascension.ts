// ============================================================================
// 进阶难度（Ascension 1~10）：全局词缀阶梯（设计文档：进阶试炼 V / 神圣混沌 X）
// ============================================================================

export interface AscensionModifiers {
  /** 怪物最大生命倍率 */
  enemyHpPct: number;
  /** 怪物攻击伤害倍率 */
  enemyDmgPct: number;
  /** 每回合初始抽牌 -N（下限 3） */
  drawMinus: number;
  /** 商店价格倍率 */
  shopPricePct: number;
  /** 精英战金币倍率 */
  eliteGoldPct: number;
  /** Boss 最大生命倍率 */
  bossHpPct: number;
  /** 玩家最大生命倍率 */
  playerHpPct: number;
  /** 营地休养回复比例 */
  restHealPct: number;
  /** 事件负面代价倍率（受伤/掉血选项） */
  eventCostPct: number;
  /** Boss 软狂暴提前至第 N 回合 */
  enrageFrom: number;
  /** 天赋槽位加成（5→4 槽，10→5 槽由 profile 计算） */
  keystoneSlotBonus: number;
}

export function getAscension(level: number): AscensionModifiers {
  const l = Math.max(0, Math.min(10, level));
  return {
    enemyHpPct: 1 + 0.08 * l,
    enemyDmgPct: 1 + 0.05 * Math.max(0, l - 1),
    drawMinus: l >= 3 ? 1 : 0,
    shopPricePct: 1 + 0.2 * (l >= 4 ? 1 : 0),
    eliteGoldPct: l >= 5 ? 0.75 : 1,
    bossHpPct: 1 + 0.2 * (l >= 6 ? 1 : 0),
    playerHpPct: 1 - 0.1 * (l >= 7 ? 1 : 0),
    restHealPct: l >= 8 ? 0.5 : 1,
    eventCostPct: l >= 9 ? 1.5 : 1,
    enrageFrom: l >= 10 ? 10 : 12,
    keystoneSlotBonus: l >= 5 ? 1 : l >= 10 ? 1 : 0,
  };
}

export const ASCENSION_NAMES: Record<number, string> = {
  0: '普通',
  1: '进阶 I',
  2: '进阶 II',
  3: '进阶 III',
  4: '进阶 IV',
  5: '进阶 V',
  6: '进阶 VI',
  7: '进阶 VII',
  8: '进阶 VIII',
  9: '进阶 IX',
  10: '进阶 X',
};

export const ASCENSION_DESCS: Record<number, string> = {
  0: '标准体验',
  1: '怪物生命 +8%',
  2: '怪物攻击 +5%',
  3: '每回合少抽 1 张牌',
  4: '商店价格 +20%',
  5: '精英战金币 -25%（解锁第 4 天赋槽）',
  6: 'Boss 生命 +20%',
  7: '最大生命 -10%',
  8: '营地休养效果减半',
  9: '事件负面代价 +50%',
  10: 'Boss 提前狂暴（第 10 回合）（解锁第 5 天赋槽）',
};
