// ============================================================================
// 怪物 / 精英 / Boss 内容（4 章）
// 名称取材自《星痕共鸣》真实怪物（玩家提供的怪物名字截图 OCR 提取）
// 行为绝对明牌：固定循环行为树，意图在玩家回合开始前推导展示
// ============================================================================

import type { ActionNode } from '../core/actions';
import type { BehaviorDef } from '../core/combat';
import type { UnitTag } from '../core/units';

export interface MonsterDef {
  id: string;
  name: string;
  maxHp: number;
  tags: UnitTag[];
  /** 进场被动（荆棘等） */
  innateBuffs?: Array<{ id: string; stacks: number }>;
  damageType?: 'physical' | 'magic' | 'true';
  reductionRatio?: number;
  behavior: BehaviorDef;
  /** 战后金币 */
  goldReward: number;
  /** 风味文本（战斗开场展示，参考星痕共鸣副本设定） */
  flavor?: string;
}

// 动作树简写
const atk = (base: number, extra: Partial<ActionNode['params']> = {}): ActionNode => ({
  action_type: 'DealDamage', target_selector: 'SingleEnemy', params: { base, ...extra },
});
const atkAll = (base: number): ActionNode => ({
  action_type: 'DealDamage', target_selector: 'AllEnemies', params: { base },
});
const def = (base: number): ActionNode => ({
  action_type: 'GainBlock', target_selector: 'Self', params: { base },
});
const selfBuff = (buff_id: string, stacks: number): ActionNode => ({
  action_type: 'ApplyBuff', target_selector: 'Self', params: { buff_id, stacks },
});
const playerDebuff = (buff_id: string, stacks: number): ActionNode => ({
  action_type: 'ApplyBuff', target_selector: 'SingleEnemy', params: { buff_id, stacks },
});
const seq = (actions: ActionNode[]): ActionNode => ({ action_type: 'Sequence', params: { actions } });

// ============================================================================
// 第一章：阿斯特里斯·王都（山贼 / 黑石军团 / 讨马贼）
// ============================================================================

export const ACT1_POOL: MonsterDef[] = [
  {
    id: 'm1_bandit_scout', name: '山贼斥候', maxHp: 30, tags: ['enemy', 'human'], goldReward: 12,
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '突刺', damage: 7 }, action: atk(7) },
      { intent: { kind: 'block', displayText: '架盾', blockValue: 6 }, action: seq([def(6), selfBuff('strength', 1)]) },
      { intent: { kind: 'attack_debuff', displayText: '戳伤（易伤）', damage: 5, debuffId: 'vulnerable', debuffStacks: 1 }, action: seq([atk(5), playerDebuff('vulnerable', 1)]) },
    ] },
  },
  {
    id: 'm1_fierce_fang', name: '凶猛金牙', maxHp: 24, tags: ['enemy', 'beast'], goldReward: 10,
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '撕咬', damage: 6 }, action: atk(6) },
      { intent: { kind: 'attack', displayText: '撕咬', damage: 6 }, action: atk(6) },
      { intent: { kind: 'block', displayText: '龇牙戒备', blockValue: 5 }, action: def(5) },
    ] },
  },
  {
    id: 'm1_phantom_spider', name: '幻妖蟹蛛', maxHp: 34, tags: ['enemy', 'beast'], goldReward: 11,
    damageType: 'magic',
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '毒牙撕咬', damage: 5, note: '法术' }, action: atk(5, { type: 'magic' }) },
      { intent: { kind: 'attack_debuff', displayText: '蛛丝缠绕（虚弱）', damage: 5, debuffId: 'weak', debuffStacks: 1 }, action: seq([atk(5), playerDebuff('weak', 1)]) },
      { intent: { kind: 'block', displayText: '结网防御', blockValue: 8 }, action: def(8) },
    ] },
  },
  {
    id: 'm1_legion_guard', name: '黑石军团卫队长', maxHp: 38, tags: ['enemy', 'human'], goldReward: 13,
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'block', displayText: '列阵防御', blockValue: 8 }, action: def(8) },
      { intent: { kind: 'attack', displayText: '军刀劈砍', damage: 9 }, action: atk(9) },
      { intent: { kind: 'attack', displayText: '战吼冲锋', damage: 7, note: '×2' }, action: seq([atk(7), atk(7)]) },
    ] },
  },
];

export const ACT1_ELITE: MonsterDef = {
  id: 'e1_thorn_commander', name: '精英·黑石军团执令官', maxHp: 64, tags: ['enemy', 'elite', 'human'], goldReward: 35,
  innateBuffs: [{ id: 'thorns', stacks: 3 }],
  flavor: '黑石军团的执令官立于城门之前：铠甲上长满倒刺，传闻中胆敢还手的人，都先被自己的剑刃割伤。',
  behavior: { type: 'loop', loop: [
    { intent: { kind: 'attack', displayText: '荆棘重剑', damage: 10 }, action: atk(10) },
    { intent: { kind: 'block', displayText: '甲胄坚守', blockValue: 10 }, action: def(10) },
    { intent: { kind: 'attack', displayText: '处刑斩击', damage: 16 }, action: atk(16) },
  ] },
};

export const ACT1_BOSS: MonsterDef = {
  id: 'b1_steel_crow', name: '钟楼守夜人·格雷温', maxHp: 78, tags: ['enemy', 'boss', 'human'], goldReward: 60,
  flavor: '阿斯特里斯旧谣：午夜钟声敲满十二下时，守夜人将化身钢鸦俯瞰全城——「守身如玉」的老钟楼，从不让任何入侵者活着离开。',
  behavior: {
    type: 'loop',
    loop: [
      { intent: { kind: 'attack', displayText: '夜巡斩', damage: 9 }, action: atk(9) },
      { intent: { kind: 'block', displayText: '坚壁防守', blockValue: 9 }, action: seq([def(9), selfBuff('strength', 1)]) },
      { intent: { kind: 'attack', displayText: '钟鸣重击', damage: 12 }, action: atk(12) },
    ],
    hpThreshold: 0.5,
    alternateLoop: [
      { intent: { kind: 'attack', displayText: '狂乱斩击', damage: 13 }, action: atk(13) },
      { intent: { kind: 'attack', displayText: '夜巡斩', damage: 9, note: '×2' }, action: seq([atk(9), atk(9)]) },
      { intent: { kind: 'attack_debuff', displayText: '慑魂怒吼（虚弱）', damage: 7, debuffId: 'weak', debuffStacks: 1 }, action: seq([atk(7), playerDebuff('weak', 1)]) },
    ],
  },
};

// ============================================================================
// 第二章：阿斯特里斯平原（麦田 / 卷心菜 / 梦境 / 蟹蛛）
// ============================================================================

export const ACT2_POOL: MonsterDef[] = [
  {
    id: 'm2_cabbage_king', name: '天才卷心菜大王', maxHp: 38, tags: ['enemy', 'plant'], goldReward: 16,
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '菜叶重锤', damage: 9 }, action: atk(9) },
      { intent: { kind: 'attack', displayText: '卷心风暴', damage: 6, note: '全体' }, action: atkAll(6) },
      { intent: { kind: 'block', displayText: '菜叶裹身', blockValue: 8 }, action: def(8) },
    ] },
  },
  {
    id: 'm2_sad_cabbage', name: '忧郁卷心菜', maxHp: 42, tags: ['enemy', 'plant'], goldReward: 17,
    damageType: 'magic',
    flavor: '它总是一副不开心的样子。据说它梦见自己被做成了一道菜，从此整片麦田都跟着它一起忧郁。',
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack_debuff', displayText: '忧郁孢子（易伤）', damage: 5, debuffId: 'vulnerable', debuffStacks: 1 }, action: seq([atk(5), playerDebuff('vulnerable', 1)]) },
      { intent: { kind: 'attack', displayText: '泪滴飞射', damage: 8, note: '法术' }, action: atk(8, { type: 'magic' }) },
      { intent: { kind: 'block', displayText: '抱紧自己', blockValue: 10 }, action: seq([def(10), selfBuff('strength', 1)]) },
    ] },
  },
  {
    id: 'm2_wolfpack', name: '野狼群', maxHp: 30, tags: ['enemy', 'beast'], goldReward: 15,
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '狼群撕咬', damage: 5, note: '×2' }, action: seq([atk(5), atk(5)]) },
      { intent: { kind: 'attack', displayText: '头狼扑击', damage: 10 }, action: atk(10) },
      { intent: { kind: 'block', displayText: '集群戒备', blockValue: 6 }, action: def(6) },
    ] },
  },
  {
    id: 'm2_poison_hive', name: '剧毒蜂巢', maxHp: 44, tags: ['enemy', 'beast'], goldReward: 18,
    damageType: 'magic',
    flavor: '蜂巢深处嗡嗡作响。被蛰过的人都说：它的毒不是最可怕的，可怕的是你根本不知道蜂群什么时候会再来。',
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '蜂群轰炸', damage: 4, note: '×3 随机' }, action: { action_type: 'Repeat', params: { count: 3 }, actions: [{ action_type: 'DealDamage', target_selector: 'RandomEnemy', params: { base: 4, type: 'magic' } }] } },
      { intent: { kind: 'attack_debuff', displayText: '毒刺（中毒 3）', damage: 5, debuffId: 'poison', debuffStacks: 3 }, action: seq([atk(5), playerDebuff('poison', 3)]) },
      { intent: { kind: 'block', displayText: '蜂群聚拢', blockValue: 8 }, action: def(8) },
    ] },
  },
];

export const ACT2_ELITE: MonsterDef = {
  id: 'e2_poison_spider', name: '精英·污染蟹蛛', maxHp: 86, tags: ['enemy', 'elite', 'beast'], goldReward: 40,
  damageType: 'magic',
  flavor: '被遗忘幻梦之野的梦境浸染后，蟹蛛的毒液变成了紫色的。它织的网，每一根丝都带着记忆的倒刺。',
  behavior: { type: 'loop', loop: [
    { intent: { kind: 'attack', displayText: '梦毒撕咬', damage: 9, note: '法术' }, action: atk(9, { type: 'magic' }) },
    { intent: { kind: 'attack_debuff', displayText: '梦魇之网（中毒 4）', damage: 6, debuffId: 'poison', debuffStacks: 4 }, action: seq([atk(6), playerDebuff('poison', 4)]) },
    { intent: { kind: 'block', displayText: '织影护体', blockValue: 12 }, action: seq([def(12), selfBuff('strength', 1)]) },
  ] },
};

export const ACT2_BOSS: MonsterDef = {
  id: 'b2_grim_reaper', name: '麦田灾厄·巨镰刈割者', maxHp: 105, tags: ['enemy', 'boss', 'construct'], goldReward: 75,
  flavor: '平原的麦浪开始倒流。有人梦见自己被困在「遗忘幻梦之野」：在这里，每个被收割的梦都会化作新的一茬麦穗。',
  behavior: {
    type: 'loop',
    loop: [
      { intent: { kind: 'attack', displayText: '巨镰横扫', damage: 8, note: '全体' }, action: atkAll(8) },
      { intent: { kind: 'attack', displayText: '刈割重斩', damage: 14 }, action: atk(14) },
      { intent: { kind: 'block', displayText: '麦浪风暴', blockValue: 12 }, action: seq([def(12), selfBuff('strength', 1)]) },
    ],
    hpThreshold: 0.5,
    alternateLoop: [
      { intent: { kind: 'attack', displayText: '死亡回旋', damage: 9, note: '全体' }, action: atkAll(9) },
      { intent: { kind: 'attack', displayText: '终末一刈', damage: 20 }, action: atk(20) },
      { intent: { kind: 'attack_debuff', displayText: '收割恐惧（虚弱+易伤）', damage: 6, debuffId: 'weak', debuffStacks: 1 }, action: seq([atk(6), playerDebuff('weak', 1), playerDebuff('vulnerable', 1)]) },
    ],
  },
};

// ============================================================================
// 第三章：巴哈马尔高原（哥布林洞穴 / 毛球 / 食人魔 / 强袭虫 / 虚空）
// ============================================================================

export const ACT3_POOL: MonsterDef[] = [
  {
    id: 'm3_assault_bug', name: '强袭虫', maxHp: 46, tags: ['enemy', 'beast'], goldReward: 20,
    flavor: '「昨天号称不死魔王的水千夏，被强袭虫一直炸。」——氏族编年史，第 14106 条。',
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '连续轰炸', damage: 5, note: '×3 随机' }, action: { action_type: 'Repeat', params: { count: 3 }, actions: [{ action_type: 'DealDamage', target_selector: 'RandomEnemy', params: { base: 5 } }] } },
      { intent: { kind: 'attack', displayText: '俯冲轰炸', damage: 12 }, action: atk(12) },
      { intent: { kind: 'block', displayText: '虫群聚拢', blockValue: 8 }, action: def(8) },
    ] },
  },
  {
    id: 'm3_blood_furball', name: '嗜血毛球', maxHp: 58, tags: ['enemy', 'beast'], goldReward: 22,
    flavor: '哥布林洞穴深处的毛球正在蠕动。据说在某个平行故事线里，掌握毛球之力的人归来复仇了。',
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'block', displayText: '毛球蓄力', blockValue: 12 }, action: def(12) },
      { intent: { kind: 'attack', displayText: '毛刺飞射', damage: 12 }, action: atk(12) },
      { intent: { kind: 'attack_debuff', displayText: '吸血啃咬（易伤）', damage: 8, debuffId: 'vulnerable', debuffStacks: 1 }, action: seq([atk(8), playerDebuff('vulnerable', 1)]) },
    ] },
  },
  {
    id: 'm3_flame_ogre', name: '火焰食人魔', maxHp: 54, tags: ['enemy', 'human'], goldReward: 21,
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '火焰重拳', damage: 11 }, action: atk(11) },
      { intent: { kind: 'attack', displayText: '连击锤砸', damage: 7, note: '×2' }, action: seq([atk(7), atk(7)]) },
      { intent: { kind: 'block', displayText: '壮汉防守', blockValue: 10 }, action: seq([def(10), selfBuff('strength', 1)]) },
    ] },
  },
  {
    id: 'm3_void_watcher', name: '空洞监视者', maxHp: 44, tags: ['enemy', 'spirit'], goldReward: 20,
    damageType: 'magic',
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '虚空冲击', damage: 10, note: '法术' }, action: atk(10, { type: 'magic' }) },
      { intent: { kind: 'attack', displayText: '虚空冲击', damage: 10, note: '法术' }, action: atk(10, { type: 'magic' }) },
      { intent: { kind: 'attack_debuff', displayText: '空洞凝视（虚弱）', damage: 6, debuffId: 'weak', debuffStacks: 1 }, action: seq([atk(6), playerDebuff('weak', 1)]) },
    ] },
  },
];

export const ACT3_ELITE: MonsterDef = {
  id: 'e3_troll', name: '精英·巨魔', maxHp: 98, tags: ['enemy', 'elite', 'human'], goldReward: 45,
  damageType: 'magic',
  flavor: '高原巨魔从不疲劳。它受伤越重，狂性越盛——老练的氏族人知道，和它比拼消耗是最蠢的选择。',
  behavior: { type: 'loop', loop: [
    { intent: { kind: 'attack_debuff', displayText: '碎骨重击（虚弱）', damage: 11, debuffId: 'weak', debuffStacks: 2 }, action: seq([atk(11), playerDebuff('weak', 2)]) },
    { intent: { kind: 'attack', displayText: '狂乱连击', damage: 13, note: '法术' }, action: atk(13, { type: 'magic' }) },
    { intent: { kind: 'block', displayText: '皮糙肉厚', blockValue: 14 }, action: seq([def(14), selfBuff('strength', 1)]) },
    { intent: { kind: 'attack', displayText: '山崩锤击', damage: 18 }, action: atk(18) },
  ] },
};

export const ACT3_BOSS: MonsterDef = {
  id: 'b3_void_observer', name: '风暴裂隙·虚空观察者', maxHp: 130, tags: ['enemy', 'boss', 'spirit'], goldReward: 90,
  damageType: 'magic',
  flavor: '裂隙深处传来齿轮与低语咬合的声音。老练的氏族人知道：这是「悖与灾的机骸」在 S3 留下的回响，机化之躯不惧疼痛。',
  behavior: {
    type: 'loop',
    loop: [
      { intent: { kind: 'attack', displayText: '裂隙脉冲', damage: 11, note: '全体' }, action: atkAll(11) },
      { intent: { kind: 'attack_debuff', displayText: '深渊低语（虚弱）', damage: 8, debuffId: 'weak', debuffStacks: 1 }, action: seq([atk(8), playerDebuff('weak', 1)]) },
      { intent: { kind: 'block', displayText: '虚空屏障', blockValue: 15 }, action: seq([def(15), selfBuff('strength', 1)]) },
    ],
    hpThreshold: 0.5,
    alternateLoop: [
      { intent: { kind: 'attack', displayText: '湮灭射线', damage: 22, note: '法术' }, action: atk(22, { type: 'magic' }) },
      { intent: { kind: 'attack_debuff', displayText: '虚空风暴（易伤）', damage: 8, note: '全体', debuffId: 'vulnerable', debuffStacks: 1 }, action: seq([atkAll(8), playerDebuff('vulnerable', 1)]) },
      { intent: { kind: 'block', displayText: '凝视深渊', blockValue: 18 }, action: seq([def(18), selfBuff('strength', 2)]) },
    ],
  },
};

// 哥布林王——事件「哥布林洞穴」深处的洞穴之主
export const GOBLIN_KING: MonsterDef = {
  id: 'm3_goblin_king', name: '哥布林王', maxHp: 120, tags: ['enemy', 'human', 'boss'], goldReward: 50,
  flavor: '洞穴尽头的王座上坐着哥布林王，王冠歪斜，却无人敢笑。老练的氏族人压低声音：「别吵醒他——他梦游时也会挥棒。」',
  behavior: { type: 'loop', loop: [
    { intent: { kind: 'attack', displayText: '王权重砸', damage: 14 }, action: atk(14) },
    { intent: { kind: 'block', displayText: '号令洞窟', blockValue: 12 }, action: seq([def(12), selfBuff('strength', 1)]) },
    { intent: { kind: 'attack', displayText: '哥布林之怒', damage: 9, note: '全体' }, action: atkAll(9) },
  ] },
};

// ============================================================================
// 第四章：蒙特诺尔溪谷（垂钓者 / 蜥蜴人 / 寒霜 / 晶化深渊）
// ============================================================================

export const ACT4_POOL: MonsterDef[] = [
  {
    id: 'm4_valley_vanguard', name: '溪谷尖兵', maxHp: 50, tags: ['enemy', 'human'], goldReward: 25,
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '尖刺突刺', damage: 12 }, action: atk(12) },
      { intent: { kind: 'block', displayText: '溪石防御', blockValue: 10 }, action: def(10) },
      { intent: { kind: 'attack', displayText: '二连突刺', damage: 8, note: '×2' }, action: seq([atk(8), atk(8)]) },
    ] },
  },
  {
    id: 'm4_shell_cultist', name: '拾贝异教徒', maxHp: 58, tags: ['enemy', 'human'], goldReward: 26,
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '骨贝投掷', damage: 13 }, action: atk(13) },
      { intent: { kind: 'block', displayText: '贝壳护身', blockValue: 10 }, action: def(10) },
      { intent: { kind: 'attack', displayText: '双贝连掷', damage: 8, note: '×2' }, action: seq([atk(8), atk(8)]) },
    ] },
  },
  {
    id: 'm4_stream_shade', name: '涧流的异影', maxHp: 50, tags: ['enemy', 'spirit'], goldReward: 25,
    damageType: 'magic',
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '水影冲击', damage: 12, note: '法术' }, action: atk(12, { type: 'magic' }) },
      { intent: { kind: 'block', displayText: '水镜折射', blockValue: 12 }, action: seq([def(12), selfBuff('strength', 1)]) },
      { intent: { kind: 'attack_debuff', displayText: '寒潭之触（易伤）', damage: 8, debuffId: 'vulnerable', debuffStacks: 1 }, action: seq([atk(8), playerDebuff('vulnerable', 1)]) },
    ] },
  },
  {
    id: 'm4_lizard_hunter', name: '蜥蜴人猎手', maxHp: 56, tags: ['enemy', 'human'], goldReward: 27,
    behavior: { type: 'loop', loop: [
      { intent: { kind: 'attack', displayText: '标枪投射', damage: 13 }, action: atk(13) },
      { intent: { kind: 'attack_debuff', displayText: '捕猎夹击（易伤）', damage: 8, debuffId: 'vulnerable', debuffStacks: 1 }, action: seq([atk(8), playerDebuff('vulnerable', 1)]) },
      { intent: { kind: 'block', displayText: '鳞甲蜷缩', blockValue: 12 }, action: def(12) },
    ] },
  },
];

export const ACT4_ELITE: MonsterDef = {
  id: 'e4_stone_man', name: '噩梦石头人·幻花的陈骸', maxHp: 118, tags: ['enemy', 'elite', 'construct'], goldReward: 52,
  reductionRatio: 0.2,
  innateBuffs: [{ id: 'thorns', stacks: 2 }],
  flavor: '「为什么那个 BOSS 要叫做石头人？」——「是不是因为神奇四侠？」它不语，只是沉默地举起了一整座山。',
  behavior: { type: 'loop', loop: [
    { intent: { kind: 'block', displayText: '岩石重铸', blockValue: 16 }, action: seq([def(16), selfBuff('strength', 1)]) },
    { intent: { kind: 'attack', displayText: '碎石横扫', damage: 11, note: '全体' }, action: atkAll(11) },
    { intent: { kind: 'attack', displayText: '幻花重压', damage: 18 }, action: atk(18) },
  ] },
};

export const ACT4_BOSS: MonsterDef = {
  id: 'b4_narcissus', name: '晶化深渊·幽冥水仙', maxHp: 165, tags: ['enemy', 'boss', 'spirit'], goldReward: 120,
  damageType: 'magic',
  flavor: '溪谷深渊的晶化水仙静静绽放。据说它是「噩梦石头人」与「娜宝」交战的残骸里长出的花——连蜘蛛的毒都不过是它的一点露水。',
  behavior: {
    type: 'loop',
    loop: [
      { intent: { kind: 'attack', displayText: '水仙之刺', damage: 12, note: '法术' }, action: atk(12, { type: 'magic' }) },
      { intent: { kind: 'attack_debuff', displayText: '晶化凝视（易伤）', damage: 8, debuffId: 'vulnerable', debuffStacks: 2 }, action: seq([atk(8), playerDebuff('vulnerable', 2)]) },
      { intent: { kind: 'block', displayText: '深渊回涌', blockValue: 14 }, action: seq([def(14), selfBuff('strength', 1)]) },
    ],
    hpThreshold: 0.66,
    alternateLoop: [
      { intent: { kind: 'attack', displayText: '幽冥绽放', damage: 9, note: '全体' }, action: atkAll(9) },
      { intent: { kind: 'attack', displayText: '深渊重刺', damage: 20, note: '法术' }, action: atk(20, { type: 'magic' }) },
      { intent: { kind: 'attack_debuff', displayText: '蛛毒之吻（中毒 4）', damage: 8, debuffId: 'poison', debuffStacks: 4 }, action: seq([atk(8), playerDebuff('poison', 4)]) },
    ],
  },
};

// ---------------------------------------------------------------------------
// 查询接口
// ---------------------------------------------------------------------------

export interface ActContent {
  act: number;
  name: string;
  subtitle: string;
  pool: MonsterDef[];
  elite: MonsterDef;
  boss: MonsterDef;
}

export const ACTS: ActContent[] = [
  { act: 1, name: '阿斯特里斯·王都', subtitle: '钟楼下的守夜人', pool: ACT1_POOL, elite: ACT1_ELITE, boss: ACT1_BOSS },
  { act: 2, name: '阿斯特里斯平原', subtitle: '麦田中的刈割者', pool: ACT2_POOL, elite: ACT2_ELITE, boss: ACT2_BOSS },
  { act: 3, name: '巴哈马尔高原', subtitle: '风暴裂隙的观察者', pool: ACT3_POOL, elite: ACT3_ELITE, boss: ACT3_BOSS },
  { act: 4, name: '蒙特诺尔溪谷', subtitle: '晶化深渊的幽冥水仙', pool: ACT4_POOL, elite: ACT4_ELITE, boss: ACT4_BOSS },
];

export function getActContent(act: number): ActContent {
  const c = ACTS.find((a) => a.act === act);
  if (!c) throw new Error(`未知章节: Act ${act}`);
  return c;
}

// ---------------------------------------------------------------------------
// 全怪物注册表（事件触发的特殊战斗按 id 查询）
// ---------------------------------------------------------------------------

const ALL_MONSTERS: Record<string, MonsterDef> = {};
for (const def of [
  ...ACT1_POOL, ACT1_ELITE, ACT1_BOSS,
  ...ACT2_POOL, ACT2_ELITE, ACT2_BOSS,
  ...ACT3_POOL, ACT3_ELITE, ACT3_BOSS, GOBLIN_KING,
  ...ACT4_POOL, ACT4_ELITE, ACT4_BOSS,
]) {
  ALL_MONSTERS[def.id] = def;
}

export function findMonsterDef(id: string): MonsterDef {
  const def = ALL_MONSTERS[id];
  if (!def) throw new Error(`未知怪物: ${id}`);
  return def;
}
