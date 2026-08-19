// ============================================================================
// 状态与 Buff 运行引擎（Status & Buff Lifecycle Engine）
// 四大堆叠模型：强度堆叠 / 持续回合 / 计数引爆 / 永久光环
// ============================================================================

export type StackingModel = 'intensity' | 'duration' | 'threshold' | 'aura';

export interface BuffDef {
  id: string;
  name: string;
  icon: string;
  model: StackingModel;
  desc: string;
  isDebuff?: boolean;
  /** threshold 型达到该层数自动引爆 */
  threshold?: number;
  /** 每层上限 */
  maxStacks?: number;
}

export const BUFF_REGISTRY: Record<string, BuffDef> = {
  // ---------- 通用基础状态 ----------
  strength: {
    id: 'strength', name: '力量', icon: '💪', model: 'intensity',
    desc: '每层使攻击伤害 +1（固定加成阶段）',
  },
  vulnerable: {
    id: 'vulnerable', name: '易伤', icon: '🩸', model: 'duration', isDebuff: true,
    desc: '受到的伤害 ×1.5，回合结束持续时间 -1',
  },
  weak: {
    id: 'weak', name: '虚弱', icon: '😵', model: 'duration', isDebuff: true,
    desc: '造成的攻击伤害 ×0.75，回合结束持续时间 -1',
  },
  dexterity: {
    id: 'dexterity', name: '敏捷', icon: '🍃', model: 'intensity',
    desc: '每层使防御卡牌获得的护甲 +1',
  },
  nourish: {
    id: 'nourish', name: '滋养', icon: '🌱', model: 'intensity',
    desc: '回合开始时恢复等同层数的生命，随后层数 -1',
    maxStacks: 99,
  },
  frail: {
    id: 'frail', name: '脆弱', icon: '🕸️', model: 'duration', isDebuff: true,
    desc: '防御卡牌获得的护甲 -25%，回合结束持续时间 -1',
  },
  stun: {
    id: 'stun', name: '冻结/眩晕', icon: '❄️', model: 'aura', isDebuff: true,
    desc: '跳过下一个行动回合，结算后销毁',
  },
  burn: {
    id: 'burn', name: '燃烧', icon: '🔥', model: 'intensity', isDebuff: true,
    desc: '回合结束时受到等同层数的火焰真实伤害，随后层数 -1',
    maxStacks: 99,
  },
  poison: {
    id: 'poison', name: '中毒', icon: '☠️', model: 'intensity', isDebuff: true,
    desc: '回合开始时受到等同层数的毒素真实伤害，随后层数 -1',
    maxStacks: 99,
  },
  thorns: {
    id: 'thorns', name: '荆棘反震', icon: '🌵', model: 'intensity',
    desc: '受到攻击时，立即反震攻击者等同层数的真实伤害',
  },
  sharpness: {
    id: 'sharpness', name: '锐利', icon: '🗡️', model: 'intensity',
    desc: '每层穿刺攻击伤害 +8%、暴击率 +4%；回合结束衰减 1 层',
    maxStacks: 99,
  },
  bloodlust: {
    id: 'bloodlust', name: '嗜血', icon: '🩸', model: 'duration',
    desc: '攻击伤害 +50%，持续 2 回合',
  },
  // ---------- 雷影剑士专属 ----------
  electrified: {
    id: 'electrified', name: '感电', icon: '⚡', model: 'intensity', isDebuff: true,
    desc: '受到攻击时，向全场溅射等同层数的雷电伤害，随后层数 -1',
    maxStacks: 99,
  },
  moonblade: {
    id: 'moonblade', name: '月刃', icon: '🌙', model: 'duration',
    desc: '悬浮月刃在场：每打出一张攻击牌，对目标追加一次 4 点追击',
  },
  thousand_flashes: {
    id: 'thousand_flashes', name: '千雷闪影之意', icon: '⚡', model: 'aura',
    desc: '每次造成伤害追加 2 点雷电真实伤害并施加 1 层感电',
  },
  infinite_thunder: {
    id: 'infinite_thunder', name: '无穷雷霆之力', icon: '🌩️', model: 'aura',
    desc: '获得雷之印时直接补满至上限',
  },
  // ---------- 神盾骑士专属 ----------
  holy_barrier: {
    id: 'holy_barrier', name: '光铸屏障', icon: '🛡️', model: 'intensity',
    desc: '临时血条，优先于护甲被扣除',
    maxStacks: 9999,
  },
  shield_boost: {
    id: 'shield_boost', name: '坚盾', icon: '🛡️', model: 'duration',
    desc: '本回合打出的所有防御技能护甲值 +50%',
  },
  holy_guardian: {
    id: 'holy_guardian', name: '圣光守卫', icon: '😇', model: 'aura',
    desc: '光铸身躯吸收率提升至 65%；每次触发吸收获得 1 枚圣令',
  },
  crusade: {
    id: 'crusade', name: '冷酷征伐', icon: '⚔️', model: 'duration',
    desc: '回合开始补满圣令；圣剑/裁决费用 -1；造成伤害 50% 转化为光铸屏障',
  },
};

export interface BuffInstance {
  defId: string;
  /** intensity/threshold: 层数；duration: 剩余回合；aura: 1 */
  stacks: number;
  sourceId?: string;
}

export function getBuffDef(id: string): BuffDef {
  const def = BUFF_REGISTRY[id];
  if (!def) throw new Error(`未知 Buff: ${id}`);
  return def;
}
