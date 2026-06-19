import type { Summon } from '@/types';

// 星痕召唤物：召唤后持续在场，每回合提供被动
export const SUMMONS: Summon[] = [
  {
    id: 'mum-head',
    name: '姆头',
    emoji: '🫧',
    desc: '每回合开始时获得 1 点能量',
    perTurn: { kind: 'energy', value: 1 },
  },
  {
    id: 'spider',
    name: '蜘蛛',
    emoji: '🕷️',
    desc: '每回合给所有敌人挂 2 层易伤',
    perTurn: { kind: 'applyStatus', status: 'vuln', statusTarget: 'enemy', value: 2, all: true },
  },
  {
    id: 'flyfish',
    name: '飞鱼',
    emoji: '🐟',
    desc: '每回合开始时获得 4 点格挡',
    perTurn: { kind: 'block', value: 4 },
  },
  {
    id: 'boyce',
    name: '博伊斯',
    emoji: '🐺',
    desc: '每回合对随机敌人造成 5 伤害',
    perTurn: { kind: 'damage', value: 5 },
  },
  {
    id: 'amber',
    name: '琥珀',
    emoji: '🟡',
    desc: '每回合结束时回复 3 点生命',
    perTurn: { kind: 'heal', value: 3 },
  },
  // ===== 召唤物·扩展 =====
  {
    id: 'mini-fish',
    name: '小飞鱼',
    emoji: '🐠',
    desc: '每回合开始时获得 2 点格挡',
    perTurn: { kind: 'block', value: 2 },
  },
  {
    id: 'fire-sprite',
    name: '火精灵',
    emoji: '🔥',
    desc: '每回合给敌人 3 层燃烧',
    perTurn: { kind: 'applyStatus', status: 'burn', statusTarget: 'enemy', value: 3 },
  },
  {
    id: 'ice-crystal',
    name: '冰晶',
    emoji: '❄️',
    desc: '每回合给敌人 1 层冰冻',
    perTurn: { kind: 'applyStatus', status: 'freeze', statusTarget: 'enemy', value: 1 },
  },
  {
    id: 'thunder-orb',
    name: '雷球',
    emoji: '⚡',
    desc: '每回合对随机敌人造成 3 点伤害',
    perTurn: { kind: 'damage', value: 3 },
  },
  {
    id: 'heal-orb',
    name: '治愈球',
    emoji: '💚',
    desc: '每回合结束时回复 2 点生命',
    perTurn: { kind: 'heal', value: 2 },
  },
  // ===== 融合召唤物（通过融合配方获得） =====
  {
    id: 'guardian-mum',
    name: '守护姆头',
    emoji: '🛡️',
    desc: '每回合+2能量（姆头+飞鱼融合）',
    perTurn: { kind: 'energy', value: 2 },
  },
  {
    id: 'web-amber',
    name: '蛛网琥珀',
    emoji: '🕸️',
    desc: '每回合全体易伤3层（蜘蛛+琥珀融合）',
    perTurn: { kind: 'applyStatus', status: 'vuln', statusTarget: 'enemy', value: 3, all: true },
  },
  {
    id: 'berserker-boyce',
    name: '狂战博伊斯',
    emoji: '⚔️',
    desc: '每回合对随机敌人造成10伤害（博伊斯+姆头融合）',
    perTurn: { kind: 'damage', value: 10 },
  },
  {
    id: 'saint-flyfish',
    name: '圣域飞鱼',
    emoji: '🌊',
    desc: '每回合格挡8（飞鱼+琥珀融合）',
    perTurn: { kind: 'block', value: 8 },
  },
  {
    id: 'phantom-weaver',
    name: '幻影织者',
    emoji: '👁️',
    desc: '每回合对随机敌人造成8伤害（蜘蛛+博伊斯融合）',
    perTurn: { kind: 'damage', value: 8 },
  },
];

export const SUMMON_MAP: Record<string, Summon> = Object.fromEntries(
  SUMMONS.map((s) => [s.id, s]),
);
