import type { CardEffect, CardTemplate, EffectId } from '@/types';

export interface EffectModule {
  id: EffectId;
  name: string;
  build: (template: CardTemplate, nurtureLevel: number) => CardEffect[];
}

function n(base: number, nurture: number) { return base + nurture; }
function extra(base: number, nurture: number) { return base + Math.floor(nurture / 2); }

export const EFFECT_MODULES: Record<EffectId, EffectModule> = {
  // ===== 通用基础 =====
  strike: {
    id: 'strike',
    name: '打击',
    build: (_t, nurture) => [{ kind: 'damage', value: n(6, nurture) }],
  },
  heavy: {
    id: 'heavy',
    name: '重击',
    build: (_t, nurture) => [{ kind: 'damage', value: n(12, nurture) }],
  },
  flurry: {
    id: 'flurry',
    name: '连斩',
    build: (_t, nurture) => [{ kind: 'damage', value: n(4, nurture), hits: 2 }],
  },
  cleave: {
    id: 'cleave',
    name: '横扫',
    build: (_t, nurture) => [{ kind: 'damageAll', value: n(7, nurture) }],
  },
  guard: {
    id: 'guard',
    name: '格挡',
    build: (_t, nurture) => [{ kind: 'block', value: n(5, nurture) }],
  },
  heal: {
    id: 'heal',
    name: '回复',
    build: (_t, nurture) => [{ kind: 'heal', value: n(5, nurture) }],
  },
  draw: {
    id: 'draw',
    name: '过牌',
    build: (_t, nurture) => [{ kind: 'draw', value: n(2, nurture) }],
  },
  empower: {
    id: 'empower',
    name: '强化',
    build: (_t, nurture) => [
      { kind: 'applyStatus', value: n(2, nurture), status: 'strength', statusTarget: 'self' },
    ],
  },
  'vuln-wave': {
    id: 'vuln-wave',
    name: '威慑',
    build: (_t, nurture) => [
      { kind: 'applyStatus', value: n(2, nurture), status: 'vuln', statusTarget: 'enemy', all: true },
    ],
  },
  'shield-bash': {
    id: 'shield-bash',
    name: '盾击',
    build: (_t, nurture) => [
      { kind: 'block', value: n(4, nurture) },
      { kind: 'damage', value: n(6, nurture) },
    ],
  },
  'frost-lunge': {
    id: 'frost-lunge',
    name: '冰矛',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(6, nurture) },
      { kind: 'applyStatus', value: n(1, nurture), status: 'freeze', statusTarget: 'enemy' },
    ],
  },
  'burn-charge': {
    id: 'burn-charge',
    name: '炎冲',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(6, nurture) },
      { kind: 'applyStatus', value: n(2, nurture), status: 'burn', statusTarget: 'enemy' },
    ],
  },
  'thunder-hit': {
    id: 'thunder-hit',
    name: '雷击',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(6, nurture) },
      { kind: 'applyStatus', value: n(1, nurture), status: 'shock', statusTarget: 'enemy' },
    ],
  },
  channel: {
    id: 'channel',
    name: '通道',
    build: (_t, nurture) => [{ kind: 'draw', value: n(3, nurture) }],
  },
  finisher: {
    id: 'finisher',
    name: '终结',
    build: (_t, nurture) => [{ kind: 'damage', value: n(18, nurture) }],
  },
  summon: {
    id: 'summon',
    name: '召唤',
    build: (t, _n) => [{ kind: 'summon', summonId: t.summonId ?? 'mum-head' }],
  },
  curse: {
    id: 'curse',
    name: '诅咒',
    build: () => [],
  },

  // ===== 深度构筑：连击依存 =====
  'combo-slash': {
    id: 'combo-slash',
    name: '连击斩',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: n(5, nurture),
      scaleBy: 'combo',
      scaleMultiplier: 2,
    }],
  },
  momentum: {
    id: 'momentum',
    name: '势能',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: 0,
      scaleBy: 'cardsPlayedThisTurn',
      scaleMultiplier: n(3, nurture),
    }],
  },

  // ===== 深度构筑：格挡依存 =====
  'block-crash': {
    id: 'block-crash',
    name: '盾击崩',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: n(3, nurture),
      scaleBy: 'block',
      scaleMultiplier: 1,
    }],
  },
  'iron-wall': {
    id: 'iron-wall',
    name: '铁壁',
    build: (_t, nurture) => [
      { kind: 'block', value: n(8, nurture) },
      { kind: 'damage', value: 0, scaleBy: 'block', scaleMultiplier: 1 },
    ],
  },
  'shield-double': {
    id: 'shield-double',
    name: '盾翻倍',
    build: (_t, nurture) => [
      { kind: 'block', value: n(5, nurture) },
      { kind: 'block', value: 0, scaleBy: 'block', scaleMultiplier: 1 },
    ],
  },

  // ===== 深度构筑：生命依存 =====
  desperation: {
    id: 'desperation',
    name: '绝境',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: n(4, nurture),
      scaleBy: 'missingHpDiv',
      scaleMultiplier: extra(4, nurture),
    }],
  },
  'pain-trade': {
    id: 'pain-trade',
    name: '苦痛交易',
    build: (_t, nurture) => [
      { kind: 'heal', value: -extra(3, nurture) },
      { kind: 'applyStatus', value: n(2, nurture), status: 'strength', statusTarget: 'self' },
    ],
  },
  'vital-drain': {
    id: 'vital-drain',
    name: '生命汲取',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(6, nurture) },
      { kind: 'heal', value: 0, scaleBy: 'missingHpDiv', scaleMultiplier: n(6, nurture) },
    ],
    // 注：吸血在战斗引擎特殊处理
  },

  // ===== 深度构筑：敌人状态依存 =====
  'status-burst': {
    id: 'status-burst',
    name: '状态爆发',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: n(4, nurture),
      scaleBy: 'enemyBurn',
      scaleMultiplier: 2,
    }],
  },
  ignite: {
    id: 'ignite',
    name: '燃爆',
    build: (_t, nurture) => [
      { kind: 'applyStatus', value: extra(3, nurture), status: 'burn', statusTarget: 'enemy' },
      { kind: 'damage', value: n(3, nurture), scaleBy: 'enemyBurn', scaleMultiplier: 2 },
    ],
  },
  'burn-detonate': {
    id: 'burn-detonate',
    name: '引爆',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: 0,
      scaleBy: 'enemyBurn',
      scaleMultiplier: extra(4, nurture),
    }],
    // 注：不消耗燃烧层数（在战斗引擎中会提示）
  },
  shatter: {
    id: 'shatter',
    name: '碎冰',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: n(5, nurture),
      scaleBy: 'enemyFreeze',
      scaleMultiplier: 3,
    }],
  },
  'static-shock': {
    id: 'static-shock',
    name: '静电',
    build: (_t, nurture) => [
      { kind: 'applyStatus', value: extra(2, nurture), status: 'shock', statusTarget: 'enemy' },
      { kind: 'damage', value: n(4, nurture), scaleBy: 'enemyShock', scaleMultiplier: 2 },
    ],
  },
  'weak-exploit': {
    id: 'weak-exploit',
    name: '乘虚',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: n(7, nurture),
      conditionalBonus: { condition: 'enemyHasWeak', bonusKind: 'doubleDamage' },
    }],
  },

  // ===== 深度构筑：弹射与连锁 =====
  bounce: {
    id: 'bounce',
    name: '弹射',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: n(8, nurture),
      hits: extra(2, nurture),
      scaleBy: 'enemyShock',
      scaleMultiplier: 1,
    }],
  },

  // ===== 深度构筑：击杀增益 =====
  'blood-hunt': {
    id: 'blood-hunt',
    name: '血猎',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(9, nurture) },
      { kind: 'applyStatus', value: extra(1, nurture), status: 'strength', statusTarget: 'self' },
    ],
    // 注：实际击杀触发由 passive 处理，这里只是附带力量
  },
  execute: {
    id: 'execute',
    name: '处决',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(12, nurture) },
      { kind: 'damage', value: extra(8, nurture), conditionalBonus: { condition: 'enemyHpBelow50', bonusKind: 'doubleDamage' } },
    ],
  },

  // ===== 深度构筑：手牌依存 =====
  overdraw: {
    id: 'overdraw',
    name: '超抽',
    build: (_t, nurture) => [
      { kind: 'draw', value: n(2, nurture) },
      { kind: 'damage', value: 0, scaleBy: 'handSize', scaleMultiplier: extra(2, nurture) },
    ],
  },

  // ===== 深度构筑：成长依存 =====
  'ramp-strike': {
    id: 'ramp-strike',
    name: '蓄势',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: n(5, nurture),
      scaleBy: 'strength',
      scaleMultiplier: extra(3, nurture),
    }],
  },
  'strength-burst': {
    id: 'strength-burst',
    name: '力爆',
    build: (_t, nurture) => [{
      kind: 'damage',
      value: n(3, nurture),
      scaleBy: 'strength',
      scaleMultiplier: extra(4, nurture),
    }],
  },
  'dexterity-flurry': {
    id: 'dexterity-flurry',
    name: '敏舞',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(3, nurture), hits: 1, scaleHitsBy: 'dexterity' },
    ],
  },

  // ===== 深度构筑：格挡递增 =====
  fortify: {
    id: 'fortify',
    name: '筑垒',
    build: (_t, nurture) => [
      { kind: 'block', value: n(3, nurture), scaleBy: 'cardsPlayedThisTurn', scaleMultiplier: extra(2, nurture) },
    ],
  },

  // ===== 超级内容更新：跨构筑与双效组合 =====
  'drain-slash': {
    id: 'drain-slash',
    name: '吸血斩',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(7, nurture) },
      { kind: 'heal', value: extra(3, nurture), scaleBy: 'missingHpDiv', scaleMultiplier: n(8, nurture) },
    ],
  },
  'thorns-wall': {
    id: 'thorns-wall',
    name: '荆棘壁垒',
    build: (_t, nurture) => [
      { kind: 'block', value: n(7, nurture) },
      { kind: 'damage', value: 0, scaleBy: 'block', scaleMultiplier: 1, conditionalBonus: { condition: 'blockAbove0', bonusKind: 'doubleDamage' } },
    ],
  },
  'chain-bolt': {
    id: 'chain-bolt',
    name: '连锁闪电',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(7, nurture), hits: extra(3, nurture), scaleBy: 'enemyCount', scaleMultiplier: 1, sideEffect: { kind: 'applyStatus', value: 1, status: 'shock', statusTarget: 'enemy' } },
    ],
  },
  'frost-armor': {
    id: 'frost-armor',
    name: '冰霜护甲',
    build: (_t, nurture) => [
      { kind: 'block', value: n(8, nurture), sideEffect: { kind: 'applyStatus', value: extra(2, nurture), status: 'freeze', statusTarget: 'enemy' } },
    ],
  },
  enrage: {
    id: 'enrage',
    name: '狂怒',
    build: (_t, nurture) => [
      { kind: 'heal', value: -extra(2, nurture) },
      { kind: 'damage', value: n(7, nurture), scaleBy: 'missingHpDiv', scaleMultiplier: extra(3, nurture) },
      { kind: 'applyStatus', value: 1, status: 'strength', statusTarget: 'self' },
    ],
  },
  'purge-blessing': {
    id: 'purge-blessing',
    name: '净化祝福',
    build: (_t, nurture) => [
      { kind: 'heal', value: n(4, nurture), sideEffect: { kind: 'energy', value: 1 } },
    ],
  },
  adapt: {
    id: 'adapt',
    name: '适应',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(4, nurture), scaleBy: 'energyRemaining', scaleMultiplier: extra(3, nurture) },
      { kind: 'block', value: n(4, nurture), scaleBy: 'energyRemaining', scaleMultiplier: extra(2, nurture) },
    ],
  },
  'cyclic-strike': {
    id: 'cyclic-strike',
    name: '循环打击',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(5, nurture), sideEffect: { kind: 'draw', value: 1 } },
    ],
  },
  siphon: {
    id: 'siphon',
    name: '吸取',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(6, nurture) },
      { kind: 'block', value: 0, scaleBy: 'block', scaleMultiplier: 1 },
    ],
  },
  overwhelm: {
    id: 'overwhelm',
    name: '压倒',
    build: (_t, nurture) => [
      { kind: 'damageAll', value: n(5, nurture), scaleBy: 'strength', scaleMultiplier: extra(3, nurture) },
    ],
  },
  'will-strike': {
    id: 'will-strike',
    name: '意志打击',
    build: (_t, nurture) => [
      { kind: 'heal', value: -extra(3, nurture) },
      { kind: 'damage', value: n(14, nurture) },
    ],
  },
  marked: {
    id: 'marked',
    name: '标记',
    build: (_t, nurture) => [
      { kind: 'applyStatus', value: n(2, nurture), status: 'vuln', statusTarget: 'enemy' },
      { kind: 'damage', value: n(8, nurture), conditionalBonus: { condition: 'enemyHasVuln', bonusKind: 'doubleDamage' } },
    ],
  },
  assault: {
    id: 'assault',
    name: '突击',
    build: (_t, nurture) => [
      { kind: 'damage', value: n(3, nurture), hits: extra(4, nurture) },
    ],
  },
  guardian: {
    id: 'guardian',
    name: '守护',
    build: (_t, nurture) => [
      { kind: 'block', value: 0, scaleBy: 'enemyCount', scaleMultiplier: extra(5, nurture) },
      { kind: 'block', value: n(3, nurture) },
    ],
  },
  cascade: {
    id: 'cascade',
    name: '连锁',
    build: (_t, nurture) => [
      { kind: 'damageAll', value: n(10, nurture), scaleBy: 'enemyCount', scaleMultiplier: extra(2, nurture) },
    ],
  },
};

// 模块列表（创意工坊查询用）
export const EFFECT_MODULE_LIST: EffectModule[] = Object.values(EFFECT_MODULES);
