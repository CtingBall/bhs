// ============================================================================
// 卡牌内容配置（首版：雷影剑士 + 神盾骑士 + 通用状态牌）
// 全部由【效果 DSL】动作树拼装，引擎零硬编码
// ============================================================================

import type { ActionNode, ActionCondition } from '../core/actions';
import { registerCard } from '../core/cards';

// ---------------------------------------------------------------------------
// 工具：动作树构建帮助
// ---------------------------------------------------------------------------

const seq = (actions: ActionNode[]): ActionNode => ({ action_type: 'Sequence', params: { actions } });

const dmg = (base: number, extra: Partial<ActionNode['params']> = {}): ActionNode => ({
  action_type: 'DealDamage',
  target_selector: 'SingleEnemy',
  params: { base, ...extra },
});

const dmgAll = (base: number, extra: Partial<ActionNode['params']> = {}): ActionNode => ({
  action_type: 'DealDamage',
  target_selector: 'AllEnemies',
  params: { base, ...extra },
});

const block = (base: number, extra: Partial<ActionNode['params']> = {}): ActionNode => ({
  action_type: 'GainBlock',
  target_selector: 'Self',
  params: { base, ...extra },
});

const barrier = (base: number, extra: Partial<ActionNode['params']> = {}): ActionNode => ({
  action_type: 'GainBarrier',
  target_selector: 'Self',
  params: { base, ...extra },
});

const heal = (base: number, extra: Partial<ActionNode['params']> = {}): ActionNode => ({
  action_type: 'Heal',
  target_selector: 'Self',
  params: { base, ...extra },
});

const draw = (amount: number): ActionNode => ({ action_type: 'DrawCards', params: { amount } });

const resource = (resource_id: string, operation: string, amount: number, extra: Partial<ActionNode['params']> = {}): ActionNode => ({
  action_type: 'ModifyResource',
  target_selector: 'Self',
  params: { resource_id, operation, amount, ...extra },
});

const buff = (buff_id: string, stacks: number, extra: Partial<ActionNode['params']> = {}): ActionNode => ({
  action_type: 'ApplyBuff',
  target_selector: 'Self',
  params: { buff_id, stacks, ...extra },
});

const cond = (condition_type: ActionCondition['condition_type'], extra: Partial<ActionNode['params']> & Record<string, unknown> = {}): ActionCondition => ({
  condition_type,
  ...extra,
} as ActionCondition);

const branch = (conditions: ActionCondition[], on_true: ActionNode[], on_failure: ActionNode[] = []): ActionNode => ({
  action_type: 'ConditionalBranch',
  conditions,
  on_true,
  on_failure,
});

// ---------------------------------------------------------------------------
// 通用状态牌
// ---------------------------------------------------------------------------

registerCard({
  id: 'card_slash_combo',
  name: '连斩',
  cardType: 'Status',
  rarity: 'Special',
  baseCost: 0,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Combo'],
  exhaust: true,
  description: '0 费 · 造成 4 点伤害。使用后消耗。',
  actionTree: dmg(4),
});

// ============================================================================
// 森语者（hero_sylvanguard）
// ============================================================================

const SYL = 'hero_sylvanguard';

registerCard({
  id: 'card_syl_light_tap',
  name: '自然轻击',
  classId: SYL,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Smite'],
  description: '造成 6 点伤害；[播种 1]。',
  actionTree: seq([dmg(6), resource('seed', 'Add', 1)]),
  upgradeA: { label: '强化·轻击', damageBonus: 3 },
  upgradeB: { label: '繁茂·轻击', descOverride: '播种 2' },
});

registerCard({
  id: 'card_syl_vine_tangle',
  name: '藤蔓缠绕',
  classId: SYL,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 5 点护甲；若手牌数 ≤ 3，[播种 1]。',
  actionTree: seq([
    block(5),
    branch(
      [cond('HandSizeLessThanEq', { value: 3 })],
      [resource('seed', 'Add', 1)],
    ),
  ]),
  upgradeA: { label: '强化·藤蔓', blockBonus: 3 },
  upgradeB: { label: '盘根·藤蔓', descOverride: '手牌 ≤ 5 时播种 1' },
});

registerCard({
  id: 'card_syl_life_bloom',
  name: '生命绽放',
  classId: SYL,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'Restoration'],
  description: '恢复 4 点生命；若自身携带【滋养】，治疗翻倍至 8 点。',
  actionTree: seq([
    heal(4),
    branch(
      [cond('UnitHasBuff', { buff_id: 'nourish', operator: '>=', value: 1 })],
      [heal(4)],
    ),
  ]),
  upgradeA: { label: '强化·绽放', healBonus: 2 },
  upgradeB: { label: '盛放·绽放', descOverride: '自身无滋养时也翻倍' },
});

registerCard({
  id: 'card_syl_infusion',
  name: '自然灌注',
  classId: SYL,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'Smite', 'Infusion'],
  requires: { resourceId: 'seed', min: 1 },
  description: '消耗 1 颗种子：本回合下一张攻击牌伤害翻倍，并触发【再生脉冲】（恢复该次伤害 40% 的生命）。',
  actionTree: seq([
    resource('seed', 'Consume', 1),
    { action_type: 'SetState', params: { key: 'infusion', value: true } },
  ]),
  upgradeA: { label: '强化·灌注', descOverride: '下两张攻击牌翻倍' },
  upgradeB: { label: '回流·灌注', cost: 0, descOverride: '0 费；消耗 1 种子' },
});

registerCard({
  id: 'card_syl_nourish',
  name: '初生滋养',
  classId: SYL,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'Restoration'],
  description: '为自身施加 3 层【滋养】（回合开始时恢复等同层数生命，随后衰减 1）。',
  actionTree: buff('nourish', 3),
  upgradeA: { label: '强化·滋养', descOverride: '施加 5 层滋养' },
  upgradeB: { label: '共荣·滋养', descOverride: '施加 3 层并抽 1 张牌' },
});

// ---- 惩戒流 ----

registerCard({
  id: 'card_syl_wild_bloom',
  name: '狂野绽放',
  classId: SYL,
  cardType: 'Attack',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'AllEnemies',
  tags: ['Attack', 'Smite', 'Finisher'],
  description: '消耗当前所有自然之种：对全体敌人造成 消耗种子数×8 点灌注伤害，并释放全队【再生脉冲】（恢复 6 点生命）。',
  actionTree: seq([
    resource('seed', 'Consume', 99, { store_to: 'seeds_bloom' }),
    dmgAll(0, { scaling: [{ variable_name: 'seeds_bloom', multiplier: 8 }], type: 'magic' }),
    { action_type: 'Heal', target_selector: 'AllAllies', params: { base: 6 } },
  ]),
  upgradeA: { label: '极意·绽放', descOverride: '每颗种子伤害 ×10' },
  upgradeB: { label: '狂澜·绽放', cost: 1, descOverride: '费用 1；再抽 1 张牌' },
});

registerCard({
  id: 'card_syl_thorn_strike',
  name: '荆棘突刺',
  classId: SYL,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Smite'],
  description: '造成 5 点伤害；[播种 1]。若手牌有【自然灌注】，费用视为 0。',
  actionTree: seq([dmg(5), resource('seed', 'Add', 1)]),
  upgradeA: { label: '强化·突刺', damageBonus: 3 },
  upgradeB: { label: '缠绕·突刺', descOverride: '命中施加 1 层虚弱' },
});

registerCard({
  id: 'card_syl_regenerative_pulse',
  name: '再生脉冲',
  classId: SYL,
  cardType: 'Skill',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'Smite'],
  description: '全队恢复 6 点生命；若自身满血，对随机敌人施加 2 层易伤。',
  actionTree: seq([
    { action_type: 'Heal', target_selector: 'AllAllies', params: { base: 6 } },
    branch(
      [cond('Always')],
      [{ action_type: 'ApplyBuff', target_selector: 'RandomEnemy', params: { buff_id: 'vulnerable', stacks: 2 } }],
    ),
  ]),
  upgradeA: { label: '强化·脉冲', descOverride: '回复 9 点生命' },
  upgradeB: { label: '震荡·脉冲', cost: 0, descOverride: '0 费；易伤 3 层' },
});

// ---- 愈合流 ----

registerCard({
  id: 'card_syl_healing_ring',
  name: '治愈之环',
  classId: SYL,
  cardType: 'Skill',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'AllAllies',
  tags: ['Skill', 'Restoration'],
  description: '为全队恢复 6 点生命，并施加 1 层【滋养】。',
  actionTree: seq([
    { action_type: 'Heal', target_selector: 'AllAllies', params: { base: 6 } },
    { action_type: 'ApplyBuff', target_selector: 'AllAllies', params: { buff_id: 'nourish', stacks: 1 } },
  ]),
  upgradeA: { label: '强化·治愈', descOverride: '回复 9 点生命' },
  upgradeB: { label: '环抱·治愈', descOverride: '滋养 2 层' },
});

registerCard({
  id: 'card_syl_ancient_treant',
  name: '远古树人',
  classId: SYL,
  cardType: 'Skill',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Skill', 'Restoration', 'Summon'],
  description: '召唤远古树人（30 生命，同类唯一）：每回合结束自动撕咬血量最低的敌人，造成 8 点伤害。',
  actionTree: { action_type: 'SummonAlly', params: { unitId: 'treant', name: '远古树人', maxHp: 30, autoAttack: 8, portrait: '🌳' } },
  upgradeA: { label: '古树·树人', descOverride: '召唤生命 40，攻击 10（同类唯一）' },
  upgradeB: { label: '繁育·树人', descOverride: '额外召唤 1 只林精花仙', summonExtra: 1 },
});

registerCard({
  id: 'card_syl_fairy_sprout',
  name: '林精花仙',
  classId: SYL,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'Restoration', 'Summon'],
  description: '召唤林精花仙（18 生命，同类唯一）：每回合结束造成 5 点撕裂伤害。',
  actionTree: { action_type: 'SummonAlly', params: { unitId: 'fairy', name: '林精花仙', maxHp: 18, autoAttack: 5, portrait: '🧚' } },
  upgradeA: { label: '强化·花仙', descOverride: '召唤生命 24，攻击 7（同类唯一）' },
  upgradeB: { label: '双生·花仙', descOverride: '同时召唤 2 只', summonExtra: 1 },
});

registerCard({
  id: 'card_syl_forest_fury',
  name: '森林之怒',
  classId: SYL,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power', 'Restoration'],
  description: '能力 · 每回合开始时自动 [播种 2]；你造成的所有治疗量提升 50%。',
  actionTree: { action_type: 'SetState', params: { key: 'seedRegen', value: 2 } },
  upgradeA: { label: '森怒·极', cost: 1, descOverride: '费用 1' },
});

// ============================================================================
// 冰魔导师（hero_frost_mage）
// ============================================================================

const MGE = 'hero_frost_mage';

const shard = (n: number): ActionNode => resource('frost_shard', 'Add', n);

registerCard({
  id: 'card_mage_tide_strike',
  name: '兩打潮生',
  classId: MGE,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 4 点伤害 ×2 次；每次命中 30% 几率凝结 1 颗玄冰。',
  actionTree: seq([
    dmg(4),
    branch([cond('Chance', { chance: 0.3 })], [shard(1)]),
    dmg(4),
    branch([cond('Chance', { chance: 0.3 })], [shard(1)]),
  ]),
  upgradeA: { label: '强化·潮生', damageBonus: 1, descOverride: '每段伤害 +1' },
  upgradeB: { label: '凝华·潮生', descOverride: '命中凝结几率提升至 50%' },
});

registerCard({
  id: 'card_mage_frost_spear',
  name: '冰霜之矛',
  classId: MGE,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 2,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'FrostSpear'],
  description: '持有玄冰：1 费瞬发，消耗 1 颗玄冰造成 16 点伤害（35% 触发陨星风暴全场 4 点）；无玄冰：需吟唱 1 回合，下回合造成 10 点伤害。',
  actionTree: seq([
    branch(
      [cond('ResourceCheck', { resource_id: 'frost_shard', operator: '>=', value: 1 })],
      [
        resource('frost_shard', 'Consume', 1),
        dmg(16),
        branch([cond('Chance', { chance: 0.35 })], [dmgAll(4, { type: 'magic' })]),
      ],
      [
        { action_type: 'SetState', params: { key: 'chantDamage', value: 10 } },
      ],
    ),
  ]),
  upgradeA: { label: '刺骨·冰矛', damageBonus: 4, descOverride: '瞬发伤害 16→20' },
  upgradeB: { label: '裂变·冰矛', descOverride: '命中额外凝结 1 颗玄冰' },
});

registerCard({
  id: 'card_mage_waterfall_beads',
  name: '清滝绕珠',
  classId: MGE,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 5 点护甲；凝结 2 颗玄冰。',
  actionTree: seq([block(5), shard(2)]),
  upgradeA: { label: '强化·绕珠', blockBonus: 3 },
  upgradeB: { label: '凝晶·绕珠', descOverride: '凝结 3 颗玄冰' },
});

registerCard({
  id: 'card_mage_ice_shield',
  name: '寒冰护盾',
  classId: MGE,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 7 点护甲；本回合受击时使攻击者获得 1 层虚弱。',
  actionTree: seq([block(7), { action_type: 'SetState', params: { key: 'frostShield', value: true } }]),
  upgradeA: { label: '强化·冰盾', blockBonus: 4 },
  upgradeB: { label: '冰棘·冰盾', descOverride: '虚弱改为 2 层' },
});

registerCard({
  id: 'card_mage_freezing_gale',
  name: '冻结寒风',
  classId: MGE,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'AllEnemies',
  tags: ['Attack'],
  description: '对全体敌人造成 8 点伤害；消耗当前所有玄冰，每颗额外 +6 点；若消耗满额（4 颗），追加群体【冻结】。',
  actionTree: seq([
    resource('frost_shard', 'Consume', 99, { store_to: 'shards_spent' }),
    dmgAll(8, { scaling: [{ variable_name: 'shards_spent', multiplier: 6 }], type: 'magic' }),
    branch(
      [cond('VarCheck', { var_name: 'shards_spent', operator: '>=', value: 4 })],
      [{ action_type: 'ApplyBuff', target_selector: 'AllEnemies', params: { buff_id: 'stun', stacks: 1 } }],
    ),
  ]),
  upgradeA: { label: '凛冽·寒风', damageBonus: 3 },
  upgradeB: { label: '永冻·寒风', descOverride: '满 3 颗玄冰即可群体冻结' },
});

registerCard({
  id: 'card_mage_tide_draw',
  name: '潮汐引动',
  classId: MGE,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '抽 2 张牌；若当前玄冰为 0，立即凝结 1 颗。',
  actionTree: seq([
    draw(2),
    branch([cond('ResourceCheck', { resource_id: 'frost_shard', operator: '==', value: 0 })], [shard(1)]),
  ]),
  upgradeA: { label: '强化·引动', descOverride: '玄冰为 0 时凝结 2 颗' },
  upgradeB: { label: '潮汐·引动', cost: 0, descOverride: '0 费' },
});

// ---- 全职业共享核心 ----

registerCard({
  id: 'card_mage_frost_infusion',
  name: '寒冰灌注',
  classId: MGE,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power'],
  description: '能力 · 持续 2 回合：冰霜之矛 1 费瞬发且不消耗玄冰。',
  actionTree: { action_type: 'SetState', params: { key: 'frostInfusion', value: 2 } },
  upgradeA: { label: '神意·灌注', cost: 1, descOverride: '费用 1' },
});

// ---- 冰矛流 ----

registerCard({
  id: 'card_mage_glacial_blizzard',
  name: '寒冰风暴',
  classId: MGE,
  cardType: 'Power',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Power', 'Blizzard'],
  description: '能力 · 召唤永恒暴风雪：每回合结束对全体敌人造成 5 点冰霜伤害，并施加 1 层虚弱。',
  actionTree: { action_type: 'SetState', params: { key: 'blizzard', value: true } },
  upgradeA: { label: '极寒·风暴', descOverride: '每回合伤害提升至 8 点' },
  upgradeB: { label: '永冬·风暴', cost: 0, descOverride: '0 费' },
});

// ---- 射线流 ----

registerCard({
  id: 'card_mage_frost_ray',
  name: '寒冰射线',
  classId: MGE,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 2,
  targetType: 'AllEnemies',
  tags: ['Attack', 'FrostBeam'],
  description: '对全体敌人造成 6 点贯穿伤害；每颗玄冰使伤害 +30%；消耗全部玄冰，每颗恢复 20 点寒冰能量。',
  actionTree: seq([
    resource('frost_shard', 'Consume', 99, { store_to: 'shards_ray' }),
    dmgAll(6, { scaling: [{ variable_name: 'shards_ray', multiplier: 1.8 }], type: 'magic' }),
    resource('frost_energy', 'Add', 0, { scaling: [{ variable_name: 'shards_ray', multiplier: 20 }] }),
  ]),
  upgradeA: { label: '贯穿·射线', damageBonus: 3 },
  upgradeB: { label: '凝华·射线', cost: 1, descOverride: '费用 1' },
});

registerCard({
  id: 'card_mage_hydro_vortex',
  name: '水之涡流',
  classId: MGE,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'FrostBeam'],
  description: '获得 8 点护甲；回复 2 颗玄冰与 30 点寒冰能量。',
  actionTree: seq([block(8), shard(2), resource('frost_energy', 'Add', 30)]),
  upgradeA: { label: '强化·涡流', blockBonus: 3 },
  upgradeB: { label: '激流·涡流', descOverride: '寒冰能量 +50' },
});

registerCard({
  id: 'card_mage_converging_tides',
  name: '浪潮汇聚',
  classId: MGE,
  cardType: 'Skill',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Skill', 'FrostBeam', 'Summon'],
  description: '召唤水龙卷（同类唯一）：每回合开始对随机敌人卷击 3 次（每次 5 点伤害）；每回合结束消耗 15 点寒冰能量维持，能量不足则消散。',
  actionTree: { action_type: 'SummonAlly', params: { unitId: 'waterspout', name: '水龙卷', maxHp: 9999, autoAttack: 5, hits: 3, portrait: '🌪️', energyCost: 15 } },
  upgradeA: { label: '狂暴·龙卷', descOverride: '每次卷击 8 点伤害' },
  upgradeB: { label: '永续·龙卷', cost: 1, descOverride: '费用 1' },
});

// ============================================================================
// 赤炎狂战士（hero_flame_berserker）
// ============================================================================

const BER = 'hero_flame_berserker';

const loseHp = (amount: number): ActionNode => ({ action_type: 'LoseHp', params: { amount } });

registerCard({
  id: 'card_ber_flame_strike',
  name: '烈炎劈砍',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 6 点伤害（双斧顺劈对相邻敌人溅射 30%）。',
  actionTree: dmg(6),
  upgradeA: { label: '强化·劈砍', damageBonus: 3 },
  upgradeB: { label: '燎原·劈砍', descOverride: '溅射比例提升至 50%' },
});

registerCard({
  id: 'card_ber_blazing_ascension',
  name: '炽烈升腾',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Formless'],
  description: '造成 7 点伤害与 3 点溅射，施加 2 层【燃烧】；无相流交替连携的支点。',
  actionTree: seq([dmg(7, { splash: 0.3 }), { action_type: 'ApplyBuff', target_selector: 'SingleEnemy', params: { buff_id: 'burn', stacks: 2 } }]),
  upgradeA: { label: '强化·升腾', damageBonus: 3 },
  upgradeB: { label: '狂燃·升腾', descOverride: '燃烧 3 层' },
});

registerCard({
  id: 'card_ber_frenzied_slash',
  name: '狂热斩击',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'CrimsonSoul'],
  description: '自身失去 3 点生命；造成 11 点火焰伤害，赤红魂槽 +15。',
  actionTree: seq([loseHp(3), dmg(11, { type: 'magic' }), resource('crimson_soul', 'Add', 15)]),
  upgradeA: { label: '强化·斩击', damageBonus: 4 },
  upgradeB: { label: '嗜血·斩击', descOverride: '魂槽 +25' },
});

registerCard({
  id: 'card_ber_rage_guard',
  name: '怒气格挡',
  classId: BER,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 6 点护甲；若本回合护甲被击破，获得 5 点赤红魂槽。',
  actionTree: seq([block(6), { action_type: 'SetState', params: { key: 'rageGuard', value: true } }]),
  upgradeA: { label: '强化·格挡', blockBonus: 3 },
  upgradeB: { label: '余怒·格挡', descOverride: '破盾时魂槽 +10' },
});

registerCard({
  id: 'card_ber_dual_parry',
  name: '双斧招架',
  classId: BER,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 8 点护甲。',
  actionTree: block(8),
  upgradeA: { label: '强化·招架', blockBonus: 4 },
  upgradeB: { label: '反击·招架', descOverride: '护甲 +2；受击反震 4 点' },
});

registerCard({
  id: 'card_ber_axe_wind',
  name: '斧风·初型',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'AllEnemies',
  tags: ['Attack'],
  description: '对全体敌人造成 5 点火焰顺劈伤害。',
  actionTree: dmgAll(5, { type: 'magic' }),
  upgradeA: { label: '强化·斧风', damageBonus: 3 },
  upgradeB: { label: '炽风·斧风', descOverride: '对燃烧目标伤害 +50%' },
});

registerCard({
  id: 'card_ber_blood_draw',
  name: '浴血战意',
  classId: BER,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '失去 4 点生命；抽 2 张牌，获得 1 点临时能量。',
  actionTree: seq([loseHp(4), draw(2), { action_type: 'ModifyEnergy', params: { amount: 1 } }]),
  upgradeA: { label: '浴血·战意', descOverride: '抽 3 张牌' },
  upgradeB: { label: '狂血·战意', cost: 0, descOverride: '0 费' },
});

registerCard({
  id: 'card_ber_ignite_blade',
  name: '点燃之刃',
  classId: BER,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '本回合打出的下一张攻击牌额外附带 4 层【燃烧】。',
  actionTree: { action_type: 'SetState', params: { key: 'igniteBlade', value: 4 } },
  upgradeA: { label: '纵火·之刃', descOverride: '燃烧 6 层' },
  upgradeB: { label: '炽刃·之刃', cost: 0, descOverride: '0 费' },
});

// ---- 无相流 ----

registerCard({
  id: 'card_ber_flame_assault',
  name: '炽焰突袭',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Formless'],
  description: '造成 6 点伤害；若上一张打出的是【炽烈升腾】，无相等级额外 +1 并获得 6 点护甲。',
  actionTree: seq([dmg(6), block(6)]),
  upgradeA: { label: '强化·突袭', damageBonus: 3 },
  upgradeB: { label: '疾袭·突袭', cost: 0, descOverride: '0 费' },
});

registerCard({
  id: 'card_ber_rage_smash',
  name: '暴怒劈斩',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 2,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Formless'],
  description: '造成 18 点高额单体伤害；无相等级每有 1 级，暴击率 +20%（首选的极境载体）。',
  actionTree: dmg(18),
  upgradeA: { label: '狂怒·劈斩', damageBonus: 6 },
  upgradeB: { label: '烈焰·劈斩', descOverride: '命中施加 3 层燃烧' },
});

registerCard({
  id: 'card_ber_axe_storm',
  name: '斧风',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'AllEnemies',
  tags: ['Attack', 'Formless'],
  description: '对全体敌人造成 8 点范围伤害；对处于【燃烧】的目标伤害 +50%。',
  actionTree: dmgAll(8, { type: 'magic' }),
  upgradeA: { label: '强化·斧风', damageBonus: 4 },
  upgradeB: { label: '焚风·斧风', descOverride: '燃烧目标伤害 +100%' },
});

registerCard({
  id: 'card_ber_arakawa_desolation',
  name: '荒川之寂灭',
  classId: BER,
  cardType: 'Skill',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Skill', 'Formless'],
  description: '清空心神进入无相寂灭：抽取 3 张牌，被本技能抽到的卡牌本回合打出费用变为 0。',
  actionTree: seq([
    { action_type: 'SetState', params: { key: 'zeroCostDrawn', value: true } },
    draw(3),
  ]),
  upgradeA: { label: '荒川·真意', descOverride: '抽 4 张牌' },
  upgradeB: { label: '寂灭·无相', cost: 1, descOverride: '费用 1' },
});

// ---- 赤红流 ----

registerCard({
  id: 'card_ber_flame_dance',
  name: '迷狂炎舞',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'CrimsonSoul'],
  description: '双斧残影乱舞：造成 4 点伤害 ×3 次；获得【魂槽催化】（2 回合内魂槽获取效率翻倍）。',
  actionTree: seq([
    { action_type: 'Repeat', params: { count: 3 }, actions: [dmg(4, { type: 'magic' })] },
    { action_type: 'SetState', params: { key: 'soulCatalyst', value: 2 } },
  ]),
  upgradeA: { label: '狂舞·炎舞', damageBonus: 1, descOverride: '每段伤害 +1' },
  upgradeB: { label: '极炎·炎舞', descOverride: '催化持续 3 回合' },
});

registerCard({
  id: 'card_ber_falling_star',
  name: '无羁坠星',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'CrimsonSoul', 'Finisher'],
  description: '造成 16 点基础伤害；可消耗 50 点赤红魂槽，使伤害提升 150% 并对全场其他敌人等量溅射。',
  actionTree: seq([
    dmg(16),
    branch(
      [cond('ResourceCheck', { resource_id: 'crimson_soul', operator: '>=', value: 50 })],
      [resource('crimson_soul', 'Consume', 50), dmg(24, { splash: 1, type: 'magic' })],
    ),
  ]),
  upgradeA: { label: '坠星·灭世', descOverride: '消耗 40 魂槽即可触发' },
  upgradeB: { label: '坠星·天火', cost: 1, descOverride: '费用 1' },
});

registerCard({
  id: 'card_ber_flowing_slash',
  name: '如川流华斩',
  classId: BER,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'CrimsonSoul'],
  description: '造成 9 点伤害；造成伤害的 100% 转化为自身生命恢复（回血同时反哺魂槽）。',
  actionTree: dmg(9, { lifesteal: 1 }),
  upgradeA: { label: '川流·华斩', damageBonus: 3 },
  upgradeB: { label: '血河·华斩', descOverride: '吸血 120%' },
});

registerCard({
  id: 'card_ber_flame_fiend',
  name: '无尽之炎魔',
  classId: BER,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power', 'CrimsonSoul'],
  description: '能力 · 化身为地狱炎魔：魂槽永不衰减；每当魂槽达到 100 满额，对全场敌人释放炼狱冲击（20 点真伤）并获得 1 回合免死锁血。',
  actionTree: { action_type: 'SetState', params: { key: 'flameFiend', value: true } },
  upgradeA: { label: '魔焰·炎魔', cost: 1, descOverride: '费用 1' },
});

// ============================================================================
// 巨刃守护者（hero_titan_guardian）
// ============================================================================

const GRD = 'hero_titan_guardian';

const rage = (n: number): ActionNode => resource('rage', 'Add', n);
const sand = (n: number): ActionNode => resource('sand_crystal', 'Add', n);

registerCard({
  id: 'card_grd_blade_strike',
  name: '卫刃重劈',
  classId: GRD,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 7 点伤害；获得 10 点怒气。',
  actionTree: seq([dmg(7), rage(10)]),
  upgradeA: { label: '强化·重劈', damageBonus: 3 },
  upgradeB: { label: '蓄怒·重劈', descOverride: '怒气 +20' },
});

registerCard({
  id: 'card_grd_shield_slam',
  name: '护盾猛击',
  classId: GRD,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'RockShield'],
  description: '造成 6 点伤害，并附加当前护盾值 80% 的额外伤害（以盾为刃）。',
  actionTree: dmg(6, { scaling: [{ attribute: 'Block', multiplier: 0.8 }] }),
  upgradeA: { label: '强化·猛击', damageBonus: 3 },
  upgradeB: { label: '万钧·猛击', descOverride: '护盾转化率提升至 100%' },
});

registerCard({
  id: 'card_grd_parry_impact',
  name: '格挡冲击',
  classId: GRD,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'ParryBlock'],
  description: '造成 8 点伤害，进入【招架姿态】：本回合下一次物理攻击被完全抵消并反震 14 点。',
  actionTree: seq([dmg(8), { action_type: 'SetState', params: { key: 'parry', value: true } }]),
  upgradeA: { label: '强化·冲击', damageBonus: 4 },
  upgradeB: { label: '弹刀·冲击', descOverride: '反震提升至 20 点' },
});

registerCard({
  id: 'card_grd_sandstone_cloak',
  name: '砂石斗篷',
  classId: GRD,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 8 点护甲并凝结 1 颗沙晶石；可消耗 1 颗沙晶石使护甲翻倍。',
  actionTree: seq([
    block(8),
    sand(1),
    branch([cond('ResourceCheck', { resource_id: 'sand_crystal', operator: '>=', value: 1 })], [
      resource('sand_crystal', 'Consume', 1),
      block(8),
    ]),
  ]),
  upgradeA: { label: '强化·斗篷', blockBonus: 3 },
  upgradeB: { label: '凝晶·斗篷', descOverride: '翻倍后追加 1 层震颤' },
});

registerCard({
  id: 'card_grd_rock_guard',
  name: '坚岩盾挡',
  classId: GRD,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 7 点护甲；获得 5 点怒气。',
  actionTree: seq([block(7), rage(5)]),
  upgradeA: { label: '强化·盾挡', blockBonus: 3 },
  upgradeB: { label: '蓄岩·盾挡', descOverride: '怒气 +10' },
});

registerCard({
  id: 'card_grd_sand_throw',
  name: '砂石投掷',
  classId: GRD,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 5 点伤害；施加 1 层虚弱。',
  actionTree: seq([dmg(5), { action_type: 'ApplyBuff', target_selector: 'SingleEnemy', params: { buff_id: 'weak', stacks: 1 } }]),
  upgradeA: { label: '强化·投掷', damageBonus: 3 },
  upgradeB: { label: '迷眼·投掷', descOverride: '虚弱 2 层' },
});

registerCard({
  id: 'card_grd_rage_surge',
  name: '怒意激荡',
  classId: GRD,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 30 点怒气；抽 1 张牌。',
  actionTree: seq([rage(30), draw(1)]),
  upgradeA: { label: '狂怒·激荡', descOverride: '怒气 +45' },
  upgradeB: { label: '怒涌·激荡', cost: 0, descOverride: '0 费' },
});

// ---- 岩盾流 ----

registerCard({
  id: 'card_grd_star_shatter',
  name: '碎星冲',
  classId: GRD,
  cardType: 'Attack',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'AllEnemies',
  tags: ['Attack', 'RockShield'],
  requires: { resourceId: 'rage', min: 30 },
  description: '消耗 30 点怒气与 1 颗沙晶石冲锋：造成 15 点伤害并附加当前护盾 100% 的群体粉碎伤害，命中者眩晕 1 回合。',
  actionTree: seq([
    resource('rage', 'Consume', 30),
    resource('sand_crystal', 'Consume', 1),
    dmgAll(15, { scaling: [{ attribute: 'Block', multiplier: 1 }] }),
    { action_type: 'ApplyBuff', target_selector: 'AllEnemies', params: { buff_id: 'stun', stacks: 1 } },
  ]),
  upgradeA: { label: '碎星·灭世', damageBonus: 5 },
  upgradeB: { label: '陨星·冲', descOverride: '眩晕 2 回合' },
});

registerCard({
  id: 'card_grd_colossus_body',
  name: '巨岩躯体',
  classId: GRD,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power', 'RockShield'],
  description: '能力 · 身躯化为花岗巨岩：回合结束未被击破的护盾 50% 保留至下回合；持有护盾时所有攻击伤害 +35%。',
  actionTree: { action_type: 'SetState', params: { key: 'colossus', value: true } },
  upgradeA: { label: '磐石·躯体', descOverride: '保留比例提升至 75%' },
  upgradeB: { label: '泰坦·躯体', cost: 1, descOverride: '费用 1' },
});

registerCard({
  id: 'card_grd_rage_eruption',
  name: '怒爆',
  classId: GRD,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'AllEnemies',
  tags: ['Attack', 'RockShield'],
  description: '消耗当前所有怒气与护盾：每 10 点怒气或 5 点护甲，对全场释放一次岩石冲击波（8 点范围伤害）。',
  actionTree: seq([
    resource('rage', 'Consume', 99, { store_to: 'rage_spent' }),
    dmgAll(0, { scaling: [{ variable_name: 'rage_spent', multiplier: 0.8 }, { attribute: 'Block', divisor: 5, multiplier: 8 }], type: 'magic' }),
  ]),
  upgradeA: { label: '狂暴·怒爆', descOverride: '每 10 怒气造成 12 点伤害' },
  upgradeB: { label: '撼地·怒爆', cost: 0, descOverride: '0 费' },
});

// ---- 格挡流 ----

registerCard({
  id: 'card_grd_heroic_bulwark',
  name: '勇者壁垒',
  classId: GRD,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power', 'ParryBlock'],
  description: '能力 · 持续 2 回合：受到的一切物理伤害降低 50%；受到物理攻击时必定获得 1 颗沙晶石与 10 点怒气。',
  actionTree: { action_type: 'SetState', params: { key: 'bulwark', value: 2 } },
  upgradeA: { label: '圣壁·壁垒', descOverride: '持续 3 回合' },
  upgradeB: { label: '铁壁·壁垒', cost: 1, descOverride: '费用 1' },
});

registerCard({
  id: 'card_grd_rock_rage_strike',
  name: '岩怒之击',
  classId: GRD,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'ParryBlock'],
  description: '造成 9 点伤害；本回合每格挡/减免 1 点物理伤害，本技能伤害额外 +1（借力打力）。',
  actionTree: dmg(9),
  upgradeA: { label: '强化·岩怒', damageBonus: 3 },
  upgradeB: { label: '借力·岩怒', descOverride: '每减免 1 点伤害 +2' },
});

registerCard({
  id: 'card_grd_sandstone_grip',
  name: '砂岩之握',
  classId: GRD,
  cardType: 'Skill',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Skill', 'ParryBlock'],
  description: '凝结砂岩巨手抓取目标：造成 6 点伤害，使其禁锢 1 回合并剥除全部护甲。',
  actionTree: seq([
    dmg(6),
    { action_type: 'ApplyBuff', target_selector: 'SingleEnemy', params: { buff_id: 'stun', stacks: 1 } },
    { action_type: 'ClearBlock', target_selector: 'SingleEnemy' },
  ]),
  upgradeA: { label: '强化·之握', damageBonus: 3 },
  upgradeB: { label: '囚牢·之握', descOverride: '禁锢 2 回合' },
});

// ============================================================================
// 神射手（hero_sharpshooter）
// ============================================================================

const SHT = 'hero_sharpshooter';

const light = (n: number): ActionNode => resource('light_energy', 'Add', n);
const critBonus = (pct: number): ActionNode => ({ action_type: 'SetState', params: { key: 'attackCritBonus', value: pct } });

registerCard({
  id: 'card_sht_precise_shot',
  name: '精准射击',
  classId: SHT,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 7 点伤害；本次攻击暴击率 +15%。',
  actionTree: seq([critBonus(0.15), dmg(7)]),
  upgradeA: { label: '强化·精准', damageBonus: 3 },
  upgradeB: { label: '鹰眼·精准', descOverride: '暴击率 +30%' },
});

registerCard({
  id: 'card_sht_storm_arrows',
  name: '暴风箭矢',
  classId: SHT,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'RandomEnemy',
  tags: ['Attack', 'BeastMastery'],
  description: '对随机敌人快速射出 3 支光矢（每支 4 点）；光能重铸态下箭矢增至 6 支并激励野狼撕咬。',
  actionTree: { action_type: 'Repeat', params: { count: 3 }, actions: [{ action_type: 'DealDamage', target_selector: 'RandomEnemy', params: { base: 4 } }] },
  upgradeA: { label: '强袭·暴风', descOverride: '每支 6 点伤害' },
  upgradeB: { label: '极速·暴风', descOverride: '重铸态箭矢 8 支' },
});

registerCard({
  id: 'card_sht_double_shot',
  name: '二连矢',
  classId: SHT,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Falconry'],
  description: '连续射出两支迅捷箭（各 6 点伤害），分别独立判定暴击。',
  actionTree: seq([dmg(6), dmg(6)]),
  upgradeA: { label: '强化·二连', damageBonus: 2, descOverride: '每支 +2' },
  upgradeB: { label: '三连·二连', descOverride: '改为三支箭' },
});

registerCard({
  id: 'card_sht_rain_of_arrows',
  name: '箭雨',
  classId: SHT,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'AllEnemies',
  tags: ['Attack'],
  description: '对全体敌人造成 6 点穿透伤害；回复 25 点光能。',
  actionTree: seq([dmgAll(6), light(25)]),
  upgradeA: { label: '强化·箭雨', damageBonus: 3 },
  upgradeB: { label: '聚光·箭雨', descOverride: '回复 40 点光能' },
});

registerCard({
  id: 'card_sht_backflip_dodge',
  name: '后跃闪避',
  classId: SHT,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 6 点护甲；抽 1 张牌。',
  actionTree: seq([block(6), draw(1)]),
  upgradeA: { label: '强化·闪避', blockBonus: 3 },
  upgradeB: { label: '灵动·闪避', descOverride: '抽 2 张牌' },
});

registerCard({
  id: 'card_sht_mental_focus',
  name: '精神凝聚',
  classId: SHT,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 6 点护甲；回复 30 点光能；本回合所有攻击暴击率 +25%。',
  actionTree: seq([block(6), light(30), critBonus(0.25)]),
  upgradeA: { label: '凝神·专注', descOverride: '光能 +45' },
  upgradeB: { label: '锐目·专注', descOverride: '暴击率 +40%' },
});

registerCard({
  id: 'card_sht_beast_whistle',
  name: '野兽哨音',
  classId: SHT,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '召唤森林野狼（30 生命，同类唯一，回合末撕咬血量最低的敌人 6 点）；回复 10 点光能。',
  actionTree: seq([
    { action_type: 'SummonAlly', params: { unitId: 'wolf', name: '森林野狼', maxHp: 30, autoAttack: 6, portrait: '🐺', targetLowest: true } },
    light(10),
  ]),
  upgradeA: { label: '驯养·哨音', descOverride: '野狼生命 40、撕咬 8 点' },
  upgradeB: { label: '共鸣·哨音', descOverride: '光能 +20' },
});

// ---- 驭兽流 ----

registerCard({
  id: 'card_sht_phantom_wolf',
  name: '幻影魔狼',
  classId: SHT,
  cardType: 'Skill',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'BeastMastery'],
  description: '召唤幻影魔狼（18 生命，同类唯一，撕咬 4 点）；其造成伤害 30% 反哺自身生命。',
  actionTree: { action_type: 'SummonAlly', params: { unitId: 'phantom', name: '幻影魔狼', maxHp: 18, autoAttack: 4, portrait: '🐺', targetLowest: true, lifesteal: 0.3 } },
  upgradeA: { label: '狼群·幻影', descOverride: '同时召唤 2 匹（突破同类唯一）', summonExtra: 1 },
  upgradeB: { label: '凶噬·幻影', descOverride: '撕咬 6 点' },
});

registerCard({
  id: 'card_sht_wild_call',
  name: '狂野呼唤',
  classId: SHT,
  cardType: 'Skill',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Skill', 'BeastMastery'],
  description: '吹响狂野骨哨：召唤 1 匹幻影魔狼；所有在场野狼与魔狼获得【嗜血】（攻击 +50%，持续 2 回合）；回复 20 点光能。',
  actionTree: seq([
    { action_type: 'SummonAlly', params: { unitId: 'phantom', name: '幻影魔狼', maxHp: 18, autoAttack: 4, portrait: '🐺', targetLowest: true } },
    { action_type: 'ApplyBuff', target_selector: 'AllAllies', params: { buff_id: 'bloodlust', stacks: 2 } },
    light(20),
  ]),
  upgradeA: { label: '兽潮·呼唤', descOverride: '额外召唤 1 匹（突破同类唯一）', summonExtra: 1 },
  upgradeB: { label: '狂怒·呼唤', descOverride: '嗜血攻击 +80%' },
});

registerCard({
  id: 'card_sht_surging_shot',
  name: '怒涛射击',
  classId: SHT,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 2,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'BeastMastery'],
  description: '蓄力射出重型巨矢：造成 20 点穿透伤害；若目标已被野狼挂上撕裂（易伤），伤害提升至 32 点。',
  actionTree: seq([
    dmg(20),
    branch([cond('TargetHasBuff', { buff_id: 'vulnerable', operator: '>=', value: 1 })], [dmg(12)]),
  ]),
  upgradeA: { label: '怒涛·贯通', damageBonus: 5 },
  upgradeB: { label: '追击·怒涛', descOverride: '命中后目标下回合伤害 -50%' },
});

// ---- 驯鹰流 ----

registerCard({
  id: 'card_sht_falcon_pact',
  name: '战隼契约',
  classId: SHT,
  cardType: 'Power',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Power', 'Falconry'],
  description: '能力 · 与空中战隼缔结契约：本场战斗中，任何攻击产生【暴击】时，战隼俯冲追加 8 点真实伤害并粉碎目标护甲。',
  actionTree: { action_type: 'SetState', params: { key: 'falcon', value: true } },
  upgradeA: { label: '神鹰·契约', cost: 0, descOverride: '0 费' },
  upgradeB: { label: '凶隼·契约', descOverride: '俯冲伤害提升至 12 点' },
});

registerCard({
  id: 'card_sht_charged_snipe',
  name: '聚能射击',
  classId: SHT,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 2,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Falconry'],
  description: '沉稳拉满弓弦：造成 16 点伤害，本次攻击暴击率 +60%，暴击伤害提升至 200%。',
  actionTree: seq([critBonus(0.6), { action_type: 'SetState', params: { key: 'snipeCrit', value: true } }, dmg(16)]),
  upgradeA: { label: '聚能·破空', damageBonus: 5 },
  upgradeB: { label: '聚能·夺命', cost: 1, descOverride: '费用 1' },
});

registerCard({
  id: 'card_sht_explosive_shot',
  name: '爆炸射击',
  classId: SHT,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Falconry'],
  description: '命中单体造成 8 点伤害，并对全场其他敌人造成 6 点爆炸伤害；主目标暴击时爆炸伤害同步暴击。',
  actionTree: seq([dmg(8), dmgAll(6, { splashBypass: true })]),
  upgradeA: { label: '强化·爆炸', damageBonus: 3 },
  upgradeB: { label: '烈焰·爆炸', descOverride: '爆炸伤害 8 点' },
});

registerCard({
  id: 'card_sht_radiant_bombardment',
  name: '光能轰炸',
  classId: SHT,
  cardType: 'Attack',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'AllEnemies',
  tags: ['Attack', 'Falconry', 'Finisher'],
  requires: { resourceId: 'light_energy', min: 50 },
  description: '消耗 50 点光能射出耀斑箭：对全场敌人造成 25 点神圣暴击伤害，战隼对每个存活目标俯冲一次。',
  actionTree: seq([
    resource('light_energy', 'Consume', 50),
    dmgAll(25, { type: 'true' }),
  ]),
  upgradeA: { label: '天基·轰炸', descOverride: '伤害提升至 32 点' },
  upgradeB: { label: '连珠·轰炸', cost: 1, descOverride: '费用 1' },
});

// ============================================================================
// 灵魂乐手（hero_soul_musician）
// ============================================================================

const MUS = 'hero_soul_musician';

const notes = (n: number): ActionNode => resource('musical_note', 'Add', n);

registerCard({
  id: 'card_mus_sonic_strike',
  name: '音爆扫弦',
  classId: MUS,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 6 点伤害；生成 1 个狂音符；吸血 2 点。',
  actionTree: seq([dmg(6), notes(1), heal(2)]),
  upgradeA: { label: '强化·扫弦', damageBonus: 3 },
  upgradeB: { label: '回响·扫弦', descOverride: '吸血 4 点' },
});

registerCard({
  id: 'card_mus_amplified_beat',
  name: '增幅节拍',
  classId: MUS,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'FuriousRhythm'],
  description: '造成 8 点伤害；若音符 ≥3，伤害 +50% 且吸血转化率提升至 150%。',
  actionTree: seq([
    dmg(8),
    branch([cond('ResourceCheck', { resource_id: 'musical_note', operator: '>=', value: 3 })], [
      dmg(4),
      { action_type: 'SetState', params: { key: 'ampBeat', value: true } },
    ]),
  ]),
  upgradeA: { label: '强化·节拍', damageBonus: 3 },
  upgradeB: { label: '爆音·节拍', descOverride: '音符 ≥2 即可增幅' },
});

registerCard({
  id: 'card_mus_healing_beat',
  name: '愈合节拍',
  classId: MUS,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'HarmonicConcerto'],
  description: '造成 6 点音波伤害；为全队恢复 5 点生命，并放置【舞台音箱】。',
  actionTree: seq([
    dmg(6),
    { action_type: 'Heal', target_selector: 'AllAllies', params: { base: 5 } },
    { action_type: 'SetState', params: { key: 'speaker', value: true } },
  ]),
  upgradeA: { label: '强化·节拍', damageBonus: 3 },
  upgradeB: { label: '共鸣·节拍', descOverride: '治疗 8 点' },
});

registerCard({
  id: 'card_mus_chord_rhythm',
  name: '和弦律动',
  classId: MUS,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 6 点护甲；生成 2 个协奏符。',
  actionTree: seq([block(6), notes(2)]),
  upgradeA: { label: '强化·律动', blockBonus: 3 },
  upgradeB: { label: '和声·律动', descOverride: '音符 +3' },
});

registerCard({
  id: 'card_mus_sound_barrier',
  name: '声波护壁',
  classId: MUS,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 7 点护甲；本回合受击时反弹 3 点音波伤害。',
  actionTree: seq([block(7), { action_type: 'SetState', params: { key: 'soundBarrier', value: true } }]),
  upgradeA: { label: '强化·护壁', blockBonus: 4 },
  upgradeB: { label: '反震·护壁', descOverride: '反弹 6 点' },
});

registerCard({
  id: 'card_mus_encore',
  name: '安可',
  classId: MUS,
  cardType: 'Skill',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'Encore'],
  description: '免费重复施放上一张乐章技能；补充 2 个音符并抽 1 张牌。',
  actionTree: seq([notes(2), draw(1)]),
  upgradeA: { label: '返场·安可', cost: 0, descOverride: '0 费' },
  upgradeB: { label: '加演·安可', descOverride: '音符 +3' },
});

registerCard({
  id: 'card_mus_tuning_slide',
  name: '调音滑音',
  classId: MUS,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '抽 2 张牌；生成 1 个音符。',
  actionTree: seq([draw(2), notes(1)]),
  upgradeA: { label: '强化·滑音', descOverride: '抽 3 张牌' },
  upgradeB: { label: '速调·滑音', cost: 0, descOverride: '0 费' },
});

// ---- 狂音流 ----

registerCard({
  id: 'card_mus_heroic_sonata',
  name: '鸣奏·英勇乐章',
  classId: MUS,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power', 'Sonata'],
  description: '乐章 · 持续 3 回合：全队攻击伤害 +25%；自身攻击造成的吸血转化率提升至 100%。',
  actionTree: { action_type: 'SetState', params: { key: 'heroicSonata', value: 3 } },
  upgradeA: { label: '神勇·乐章', cost: 1, descOverride: '费用 1' },
  upgradeB: { label: '狂澜·乐章', descOverride: '持续 4 回合' },
});

registerCard({
  id: 'card_mus_flame_rhapsody',
  name: '烈焰狂想',
  classId: MUS,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'RandomEnemy',
  tags: ['Attack', 'FuriousRhythm'],
  description: '高速速弹 4 次（每次 3 点火焰伤害）；每次 60% 幸运几率追加 4 点真伤并施加 2 层燃烧。',
  actionTree: {
    action_type: 'Repeat', params: { count: 4 },
    actions: [
      { action_type: 'DealDamage', target_selector: 'RandomEnemy', params: { base: 3, type: 'magic' } },
      { action_type: 'ConditionalBranch', conditions: [{ condition_type: 'Chance', chance: 0.6 }], on_true: [
        { action_type: 'DealDamage', target_selector: 'RandomEnemy', params: { base: 4, type: 'true' } },
        { action_type: 'ApplyBuff', target_selector: 'RandomEnemy', params: { buff_id: 'burn', stacks: 2 } },
      ] },
    ],
  },
  upgradeA: { label: '狂飙·狂想', descOverride: '每次速弹 5 点伤害' },
  upgradeB: { label: '幸运·狂想', descOverride: '幸运几率提升至 80%' },
});

registerCard({
  id: 'card_mus_converging_movement',
  name: '聚合乐章',
  classId: MUS,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'FuriousRhythm'],
  description: '造成 7 点伤害；将音符谱表填满 5 个狂音符，并使下一张攻击牌必定暴击。',
  actionTree: seq([dmg(7), { action_type: 'SetState', params: { key: 'forceCrit', value: true } }, notes(5)]),
  upgradeA: { label: '强袭·聚合', damageBonus: 3 },
  upgradeB: { label: '齐奏·聚合', cost: 0, descOverride: '0 费' },
});

// ---- 协奏流 ----

registerCard({
  id: 'card_mus_healing_sonata',
  name: '鸣奏·愈合乐章',
  classId: MUS,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power', 'Sonata'],
  description: '乐章 · 持续整场：全队受到的伤害降低 20%；每回合开始全队获得 6 点持续回复（音箱在场时 10 点）。',
  actionTree: { action_type: 'SetState', params: { key: 'healingSonata', value: true } },
  upgradeA: { label: '治愈·乐章', cost: 1, descOverride: '费用 1' },
  upgradeB: { label: '安魂·乐章', descOverride: '回复提升至 8 点' },
});

registerCard({
  id: 'card_mus_surging_quintet',
  name: '激涌五重奏',
  classId: MUS,
  cardType: 'Attack',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'AllEnemies',
  tags: ['Attack', 'HarmonicConcerto', 'Finisher'],
  requires: { resourceId: 'musical_note', min: 5 },
  description: '消耗全部 5 个音符奏响终曲：对全体敌人造成 18 点穿透伤害；全队恢复 15 点生命，下回合获得 1 次完全免伤护罩。',
  actionTree: seq([
    resource('musical_note', 'Consume', 5),
    dmgAll(18, { type: 'magic' }),
    { action_type: 'Heal', target_selector: 'AllAllies', params: { base: 15 } },
    { action_type: 'SetState', params: { key: 'soundShield', value: true } },
  ]),
  upgradeA: { label: '终章·五重奏', descOverride: '伤害提升至 24 点' },
  upgradeB: { label: '加演·五重奏', cost: 1, descOverride: '费用 1' },
});

registerCard({
  id: 'card_mus_passionate_flourish',
  name: '热情挥洒',
  classId: MUS,
  cardType: 'Skill',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'HarmonicConcerto'],
  description: '甩动琴颈激荡全场：使所有友军获得 2 点能量；音箱共鸣效率在接下来 2 回合提升至 100%。',
  actionTree: seq([
    { action_type: 'ModifyEnergy', params: { amount: 2 } },
    { action_type: 'SetState', params: { key: 'passion', value: 2 } },
  ]),
  upgradeA: { label: '狂热·挥洒', descOverride: '能量 +3' },
  upgradeB: { label: '余韵·挥洒', descOverride: '共鸣持续 3 回合' },
});

// ============================================================================
// 青岚骑士（hero_gale_knight）
// ============================================================================

const KNT = 'hero_gale_knight';

const courage = (n: number): ActionNode => resource('courage', 'Add', n);
const sharp = (n: number): ActionNode => ({ action_type: 'ApplyBuff', target_selector: 'Self', params: { buff_id: 'sharpness', stacks: n } });

registerCard({
  id: 'card_knt_wind_strike',
  name: '破风直刺',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Lance'],
  description: '造成 7 点伤害；获得 10 点勇气。',
  actionTree: seq([dmg(7), courage(10)]),
  upgradeA: { label: '强化·直刺', damageBonus: 3 },
  upgradeB: { label: '蓄勇·直刺', descOverride: '勇气 +20' },
});

registerCard({
  id: 'card_knt_gale_thrust',
  name: '疾风刺',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Lance'],
  description: '造成 7 点伤害；获得 25 点勇气与 2 层锐利；下一张长枪技能不消耗费用。',
  actionTree: seq([dmg(7), courage(25), sharp(2), { action_type: 'SetState', params: { key: 'lanceFree', value: true } }]),
  upgradeA: { label: '强化·疾风', damageBonus: 3 },
  upgradeB: { label: '烈风·疾风', descOverride: '勇气 +35' },
});

registerCard({
  id: 'card_knt_vaulting_leap',
  name: '翔返',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Lance', 'Aerial'],
  description: '造成 6 点伤害并获得 6 点空中回避护甲；消耗 20 点勇气：凝结 4 层锐利并进入滞空态，下一张【刹那】贯穿全场。',
  actionTree: seq([
    dmg(6),
    block(6),
    branch([cond('ResourceCheck', { resource_id: 'courage', operator: '>=', value: 20 })], [
      resource('courage', 'Consume', 20),
      sharp(4),
      { action_type: 'SetState', params: { key: 'aerial', value: true } },
      { action_type: 'SetState', params: { key: 'setsunaPierce', value: true } },
    ]),
  ]),
  upgradeA: { label: '强化·翔返', damageBonus: 3 },
  upgradeB: { label: '御风·翔返', descOverride: '空中回避护甲 10 点' },
});

registerCard({
  id: 'card_knt_spear_parry',
  name: '长枪招架',
  classId: KNT,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 6 点护甲；获得 10 点勇气。',
  actionTree: seq([block(6), courage(10)]),
  upgradeA: { label: '强化·招架', blockBonus: 3 },
  upgradeB: { label: '借势·招架', descOverride: '勇气 +15' },
});

registerCard({
  id: 'card_knt_wind_wall',
  name: '风壁御守',
  classId: KNT,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 8 点护甲；若持有锐利，护甲值提升 50%。',
  actionTree: seq([
    block(8),
    branch([cond('UnitHasBuff', { buff_id: 'sharpness', operator: '>=', value: 1 })], [block(4)]),
  ]),
  upgradeA: { label: '强化·风壁', blockBonus: 3 },
  upgradeB: { label: '风墙·风壁', descOverride: '有锐利时护甲翻倍' },
});

registerCard({
  id: 'card_knt_wind_footwork',
  name: '风之步法',
  classId: KNT,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 15 点勇气与 1 层锐利；抽 1 张牌。',
  actionTree: seq([courage(15), sharp(1), draw(1)]),
  upgradeA: { label: '迅风·步法', descOverride: '勇气 +25' },
  upgradeB: { label: '轻身·步法', cost: 0, descOverride: '0 费' },
});

registerCard({
  id: 'card_knt_spiral_thrust_basic',
  name: '螺旋击刺·初型',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Lance'],
  description: '长枪高速旋转突刺 3 次（每次 4 点）；每层锐利使每次打击 +2 点真实伤害。',
  actionTree: seq([
    dmg(4, { scaling: [{ attribute: 'Sharpness', multiplier: 2 }], type: 'true' }),
    dmg(4, { scaling: [{ attribute: 'Sharpness', multiplier: 2 }], type: 'true' }),
    dmg(4, { scaling: [{ attribute: 'Sharpness', multiplier: 2 }], type: 'true' }),
  ]),
  upgradeA: { label: '强化·螺旋', descOverride: '每次打击 5 点' },
  upgradeB: { label: '风钻·螺旋', descOverride: '每层锐利 +3 真伤' },
});

registerCard({
  id: 'card_knt_setsuna_basic',
  name: '刹那·破空',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Lance', 'Aerial'],
  description: '化作青光贯刺：造成 10 点伤害；消耗所有锐利每层 +40%；命中返还 20 点勇气。',
  actionTree: seq([
    { action_type: 'ConsumeBuff', target_selector: 'Self', params: { buff_id: 'sharpness', consume_all: true, store_consumed_stacks_to: 'sharp_spent' } },
    dmg(10, { scaling: [{ variable_name: 'sharp_spent', multiplier: 4 }], type: 'true' }),
    courage(20),
  ]),
  upgradeA: { label: '强化·刹那', descOverride: '基础伤害 13 点' },
  upgradeB: { label: '瞬影·刹那', descOverride: '返还 30 点勇气' },
});

// ---- 重装流 ----

registerCard({
  id: 'card_knt_spiral_thrust',
  name: '螺旋击刺',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Lance'],
  description: '3 次 5 点穿透伤害；每层锐利 +2 真伤；若拥有 ≥30 点勇气，消耗 30 点使本技能结算后回到手牌。',
  actionTree: seq([
    dmg(5, { scaling: [{ attribute: 'Sharpness', multiplier: 2 }], type: 'true' }),
    dmg(5, { scaling: [{ attribute: 'Sharpness', multiplier: 2 }], type: 'true' }),
    dmg(5, { scaling: [{ attribute: 'Sharpness', multiplier: 2 }], type: 'true' }),
    branch([cond('ResourceCheck', { resource_id: 'courage', operator: '>=', value: 30 })], [
      resource('courage', 'Consume', 30),
      { action_type: 'SetState', params: { key: 'spiralReturn', value: true } },
    ]),
  ]),
  upgradeA: { label: '风钻·螺旋', descOverride: '每次打击 7 点' },
  upgradeB: { label: '疾钻·螺旋', descOverride: '勇气消耗降至 20' },
});

registerCard({
  id: 'card_knt_break_pursuit',
  name: '破追',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Lance'],
  description: '对刚被【螺旋击刺】命中的敌人发动追击：造成 12 点伤害并粉碎其全部护甲；若击杀目标，立即回满 100 点勇气。',
  actionTree: seq([dmg(12), { action_type: 'ClearBlock', target_selector: 'SingleEnemy' }]),
  upgradeA: { label: '处决·破追', damageBonus: 4 },
  upgradeB: { label: '死线·破追', descOverride: '对 <40% 生命目标伤害 ×3' },
});

registerCard({
  id: 'card_knt_ring_of_valor',
  name: '勇气风环',
  classId: KNT,
  cardType: 'Skill',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'AllEnemies',
  tags: ['Skill', 'Lance'],
  requires: { resourceId: 'courage', min: 40 },
  description: '消耗当前所有勇气（至少 40 点）：每消耗 10 点，获得 4 点护甲并对全场造成 6 点风刃伤害。',
  actionTree: seq([
    resource('courage', 'Consume', 99, { store_to: 'courage_spent' }),
    { action_type: 'GainBlock', target_selector: 'Self', params: { base: 0, scaling: [{ variable_name: 'courage_spent', multiplier: 0.4 }] } },
    dmgAll(0, { scaling: [{ variable_name: 'courage_spent', multiplier: 0.6 }], type: 'magic' }),
  ]),
  upgradeA: { label: '风环·毁灭', descOverride: '每 10 点造成 9 点伤害' },
  upgradeB: { label: '风环·壁垒', descOverride: '每 10 点获得 6 点护甲' },
});

// ---- 空战流 ----

registerCard({
  id: 'card_knt_setsuna',
  name: '刹那',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Lance', 'Aerial'],
  description: '自半空垂直贯刺：造成 14 点穿透伤害；消耗所有锐利每层 +40%；命中后返还 30 点勇气并抽 1 张牌。',
  actionTree: seq([
    { action_type: 'ConsumeBuff', target_selector: 'Self', params: { buff_id: 'sharpness', consume_all: true, store_consumed_stacks_to: 'sharp_spent' } },
    dmg(14, { scaling: [{ variable_name: 'sharp_spent', multiplier: 5.6 }], type: 'true' }),
    courage(30),
    draw(1),
  ]),
  upgradeA: { label: '极意·刹那', descOverride: '基础伤害 18 点' },
  upgradeB: { label: '流转·刹那', descOverride: '返还 45 点勇气' },
});

registerCard({
  id: 'card_knt_soaring_javelin',
  name: '飞鸟投',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Lance', 'Aerial'],
  description: '滞空时将长枪如标枪掷出：造成 10 点远程伤害；若处于滞空态，暴击率 100% 并使目标定身 1 回合。',
  actionTree: seq([
    { action_type: 'SetState', params: { key: 'javelin', value: true } },
    dmg(10),
    branch([cond('UnitState', { state_key: 'aerial', state_value: true })], [
      { action_type: 'SetState', params: { key: 'attackCritBonus', value: 1 } },
      { action_type: 'ApplyBuff', target_selector: 'SingleEnemy', params: { buff_id: 'stun', stacks: 1 } },
    ]),
  ]),
  upgradeA: { label: '强化·飞鸟', damageBonus: 4 },
  upgradeB: { label: '猎空·飞鸟', descOverride: '非滞空也获得 50% 暴击' },
});

registerCard({
  id: 'card_knt_keen_burst',
  name: '锐利冲击',
  classId: KNT,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'AllEnemies',
  tags: ['Attack', 'Lance', 'Aerial'],
  description: '将枪尖风刃横扫释放：对敌方前排造成 锐利层数×6 的风压伤害，并施加群体虚弱。',
  actionTree: seq([
    dmgAll(0, { scaling: [{ attribute: 'Sharpness', multiplier: 6 }], type: 'magic' }),
    { action_type: 'ApplyBuff', target_selector: 'AllEnemies', params: { buff_id: 'weak', stacks: 1 } },
  ]),
  upgradeA: { label: '风刃·冲击', descOverride: '每层锐利 ×8' },
  upgradeB: { label: '裂空·冲击', descOverride: '虚弱 2 层' },
});

registerCard({
  id: 'card_knt_peerless_grace',
  name: '风姿卓绝',
  classId: KNT,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Power', 'Lance'],
  description: '能力 · 步入风之枪术：每打出一张攻击牌额外获得 10 点勇气并凝结 1 层锐利；锐利层数不再自然衰减。',
  actionTree: { action_type: 'SetState', params: { key: 'peerless', value: true } },
  upgradeA: { label: '极境·风姿', cost: 0, descOverride: '0 费' },
  upgradeB: { label: '风神·风姿', descOverride: '攻击牌额外 +15 勇气' },
});

const TB = 'hero_thunderblade';

registerCard({
  id: 'card_tb_thrust',
  name: '雷闪·直刺',
  classId: TB,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Form:Katana'],
  description: '长刀 · 造成 7 点伤害。',
  actionTree: dmg(7),
  upgradeA: { label: '强化·直刺', damageBonus: 4 },
  upgradeB: { label: '迅捷·直刺', cost: 0, damageBonus: 2 },
});

registerCard({
  id: 'card_tb_scythe_sweep',
  name: '镰舞·横扫',
  classId: TB,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'AllEnemies',
  tags: ['Attack', 'Form:Scythe'],
  description: '镰刀 · 对全体敌人造成 5 点顺劈伤害。',
  actionTree: dmgAll(5),
  upgradeA: { label: '强化·横扫', damageBonus: 3 },
  upgradeB: { label: '撕裂·横扫', damageBonus: 2, descOverride: '伤害+2；命中附加 1 层易伤' },
});

registerCard({
  id: 'card_tb_shadow_step',
  name: '雷影步',
  classId: TB,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 5 点护甲，切换至相反形态。',
  actionTree: seq([block(5), { action_type: 'SwitchForm', params: { form: 'toggle' } }]),
  upgradeA: { label: '强化·雷影步', blockBonus: 4 },
  upgradeB: { label: '迅影·雷影步', cost: 0, blockBonus: 2 },
});

registerCard({
  id: 'card_tb_blade_parry',
  name: '刃甲招架',
  classId: TB,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 7 点护甲。',
  actionTree: block(7),
  upgradeA: { label: '强化·招架', blockBonus: 4 },
  upgradeB: { label: '反击·招架', blockBonus: 2, descOverride: '护甲+2；本回合下一次受击反震 5 点' },
});

registerCard({
  id: 'card_tb_overcharge',
  name: '超高出力·蓄雷',
  classId: TB,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill', 'Overdrive'],
  description: '本回合无法再抽牌；立即获得 2 枚【雷之印】。',
  actionTree: seq([
    resource('thunder_seal', 'Add', 2),
    { action_type: 'SetState', params: { key: 'noDrawFlag', value: true } },
    { action_type: 'SetNoDraw', params: {} },
  ]),
  upgradeA: { label: '强化·蓄雷', descOverride: '获得 3 枚雷之印' },
  upgradeB: { label: '过载·蓄雷', cost: 0, descOverride: '0 费；获得 1 枚雷之印' },
});

registerCard({
  id: 'card_tb_overdrive_slash',
  name: '超高出力·过载斩',
  classId: TB,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 2,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Form:Katana', 'Overdrive'],
  description: '长刀 · 造成 14 点重击伤害；[超高出力]：获得 1 枚雷之印。',
  actionTree: seq([dmg(14), resource('thunder_seal', 'Add', 1)]),
  upgradeA: { label: '强化·过载斩', damageBonus: 6 },
  upgradeB: { label: '聚雷·过载斩', damageBonus: 2, descOverride: '伤害+2；雷之印 +2' },
});

registerCard({
  id: 'card_tb_draw_begin',
  name: '拔刀·初型',
  classId: TB,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Form:Katana'],
  description: '长刀 · 造成 6 点伤害；消耗 1 枚雷之印使其额外造成 10 点伤害。',
  actionTree: seq([
    dmg(6),
    branch(
      [cond('ResourceCheck', { resource_id: 'thunder_seal', operator: '>=', value: 1 })],
      [resource('thunder_seal', 'Consume', 1), dmg(10, { type: 'true' })],
    ),
  ]),
  upgradeA: { label: '强化·拔刀', damageBonus: 4 },
  upgradeB: { label: '锐锋·拔刀', descOverride: '消耗 1 印额外伤害提升至 14' },
});

registerCard({
  id: 'card_tb_shadow_assault',
  name: '镰引·影袭',
  classId: TB,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Form:Scythe'],
  description: '镰刀 · 造成 4 点伤害；若有雷之印，生成 1 张【0费·连斩】。',
  actionTree: seq([
    dmg(4),
    branch(
      [cond('ResourceCheck', { resource_id: 'thunder_seal', operator: '>=', value: 1 })],
      [{ action_type: 'GenerateCard', params: { card_id: 'card_slash_combo', destination: 'hand' } }],
    ),
  ]),
  upgradeA: { label: '强化·影袭', damageBonus: 3 },
  upgradeB: { label: '连斩·影袭', damageBonus: 1, descOverride: '伤害+1；无印也能生成连斩' },
});

// ---- 居合流 ----

registerCard({
  id: 'card_tb_iai_slash',
  name: '居合斩',
  classId: TB,
  cardType: 'Attack',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Form:Katana', 'Finisher'],
  description: '长刀 · 造成 12 点伤害。消耗当前所有【雷之印】，每枚伤害 +150%，并附加 1 回合眩晕。',
  actionTree: seq([
    resource('thunder_seal', 'Consume', 99, { store_to: 'seals_consumed' }),
    dmg(12, { scaling: [{ variable_name: 'seals_consumed', multiplier: 18 }] }),
    { action_type: 'ApplyBuff', target_selector: 'SingleEnemy', params: { buff_id: 'stun', stacks: 1 } },
  ]),
  upgradeA: { label: '极意·居合', damageBonus: 6 },
  upgradeB: { label: '灭却·居合', damageBonus: 2, descOverride: '伤害+2；每枚雷印增伤提升至 200%' },
});

registerCard({
  id: 'card_tb_issen',
  name: '一闪',
  classId: TB,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'AllEnemies',
  tags: ['Attack', 'Form:Katana'],
  requires: { resourceId: 'thunder_seal', min: 2 },
  description: '长刀 · 消耗 2 枚雷之印，化作雷光穿透全体敌人造成 16 点雷电伤害。击杀任意目标返还 2 印并抽 1 张。',
  actionTree: seq([resource('thunder_seal', 'Consume', 2), dmgAll(16, { type: 'magic' })]),
  upgradeA: { label: '强化·一闪', damageBonus: 6 },
  upgradeB: { label: '雷闪·一闪', damageBonus: 2, descOverride: '伤害+2；击杀返还 3 印' },
});

registerCard({
  id: 'card_tb_infinite_thunder',
  name: '无穷雷霆之力',
  classId: TB,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power'],
  description: '能力 · 进入雷神过载状态：本场战斗中获得【雷之印】时直接补满至上限。',
  actionTree: buff('infinite_thunder', 1),
  upgradeA: { label: '神威·雷霆', cost: 1, descOverride: '费用 1' },
});

// ---- 月刃流 ----

registerCard({
  id: 'card_tb_scythe_wheel',
  name: '镰车',
  classId: TB,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 2,
  targetType: 'AllEnemies',
  tags: ['Attack', 'Form:Scythe', 'Summon'],
  description: '镰刀 · 对全体敌人造成 10 点回旋镰刃伤害。若无月刃，免费召唤一柄【月刃】（3 回合）；已有则延长 2 回合。',
  actionTree: seq([
    dmgAll(10),
    branch(
      [cond('UnitHasBuff', { buff_id: 'moonblade', operator: '>=', value: 1 })],
      [buff('moonblade', 2, { mode: 'extend' })],
      [buff('moonblade', 3)],
    ),
  ]),
  upgradeA: { label: '强化·镰车', damageBonus: 5 },
  upgradeB: { label: '永动·镰车', damageBonus: 2, descOverride: '伤害+2；月刃持续回合 +1' },
});

registerCard({
  id: 'card_tb_rapid_slashes',
  name: '霹雳连斩',
  classId: TB,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 6 点伤害。将 3 张【0费·连斩】加入手牌。',
  actionTree: seq([
    dmg(6),
    { action_type: 'Repeat', params: { count: 3 }, actions: [{ action_type: 'GenerateCard', params: { card_id: 'card_slash_combo', destination: 'hand' } }] },
  ]),
  upgradeA: { label: '强化·连斩', damageBonus: 4 },
  upgradeB: { label: '雷暴·连斩', damageBonus: 2, descOverride: '伤害+2；连斩改为附带 1 层感电' },
});

registerCard({
  id: 'card_tb_thousand_flashes',
  name: '千雷闪影之意',
  classId: TB,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power'],
  description: '能力 · 雷霆附体：每次造成伤害追加 2 点雷电真实伤害，并为目标施加 1 层【感电】。',
  actionTree: buff('thousand_flashes', 1),
  upgradeA: { label: '神意·千雷', cost: 1, descOverride: '费用 1' },
});

// ============================================================================
// 神盾骑士（hero_aegis_knight）
// ============================================================================

const AEG = 'hero_aegis_knight';

registerCard({
  id: 'card_pal_radiant_slash',
  name: '圣光斩击',
  classId: AEG,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 7 点伤害；获得 1 枚【圣令】。',
  actionTree: seq([dmg(7), resource('holy_order', 'Add', 1)]),
  upgradeA: { label: '强化·圣光', damageBonus: 4 },
  upgradeB: { label: '炽光·圣光', damageBonus: 2, descOverride: '伤害+2；圣令 +2' },
});

registerCard({
  id: 'card_pal_heroic_shield_slam',
  name: '英勇盾击',
  classId: AEG,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 8 点伤害；获得 10 点护甲、25 点光明能量与 1 枚圣令；获得 1 回合【坚盾】。',
  actionTree: seq([
    dmg(8),
    block(10),
    resource('radiant_energy', 'Add', 25),
    resource('holy_order', 'Add', 1),
    buff('shield_boost', 1),
  ]),
  upgradeA: { label: '强化·盾击', damageBonus: 4, blockBonus: 4 },
  upgradeB: { label: '壁垒·盾击', blockBonus: 6, descOverride: '护甲+6；坚盾改为 2 回合' },
});

registerCard({
  id: 'card_pal_vanguard_strike',
  name: '先锋打击',
  classId: AEG,
  cardType: 'Attack',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack'],
  description: '造成 9 点伤害；获得最大生命 15% 的光铸屏障；最大生命上限 +3；获得 1 圣令与 20 光明能量。',
  actionTree: seq([
    dmg(9),
    barrier(0, { scaling: [{ attribute: 'MaxHp', multiplier: 0.15 }] }),
    { action_type: 'ModifyMaxHp', params: { amount: 3, heal: false } },
    resource('holy_order', 'Add', 1),
    resource('radiant_energy', 'Add', 20),
  ]),
  upgradeA: { label: '强化·先锋', damageBonus: 4 },
  upgradeB: { label: '神愈·先锋', damageBonus: 2, descOverride: '伤害+2；血上限 +5' },
});

registerCard({
  id: 'card_pal_holy_parry',
  name: '神圣招架',
  classId: AEG,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 7 点护甲与 20 点光明能量。',
  actionTree: seq([block(7), resource('radiant_energy', 'Add', 20)]),
  upgradeA: { label: '强化·招架', blockBonus: 4 },
  upgradeB: { label: '凝聚·招架', blockBonus: 2, descOverride: '护甲+2；光明能量 +30' },
});

registerCard({
  id: 'card_pal_lightforged_armor',
  name: '光铸铠甲',
  classId: AEG,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 8 点护甲；若【光铸身躯】在场（光明能量 ≥ 30），获得 1 枚圣令。',
  actionTree: seq([
    block(8),
    branch(
      [cond('ResourceCheck', { resource_id: 'radiant_energy', operator: '>=', value: 30 })],
      [resource('holy_order', 'Add', 1)],
    ),
  ]),
  upgradeA: { label: '强化·铠甲', blockBonus: 4 },
  upgradeB: { label: '圣铸·铠甲', blockBonus: 2, descOverride: '护甲+2；坚盾 1 回合' },
});

registerCard({
  id: 'card_pal_radiant_infusion',
  name: '圣光灌注',
  classId: AEG,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '获得 35 点光明能量；抽 1 张牌。',
  actionTree: seq([resource('radiant_energy', 'Add', 35), draw(1)]),
  upgradeA: { label: '强化·灌注', descOverride: '光明能量 +50' },
  upgradeB: { label: '涌泉·灌注', cost: 0, descOverride: '0 费；光明能量 +25' },
});

registerCard({
  id: 'card_pal_judgement',
  name: '裁决',
  classId: AEG,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Finisher'],
  requires: { resourceId: 'holy_order', min: 2 },
  description: '消耗 2 枚圣令，造成 12 点神圣真实伤害；立即恢复已损失生命 40% 的生命。',
  actionTree: seq([
    resource('holy_order', 'Consume', 2),
    dmg(12, { type: 'true' }),
    heal(0, { scaling: [{ attribute: 'LostHp', multiplier: 0.4 }] }),
  ]),
  upgradeA: { label: '审判·裁决', damageBonus: 4, descOverride: '伤害+4；回血比例不变' },
  upgradeB: { label: '圣裁·裁决', descOverride: '回血比例提升至 60%' },
});

registerCard({
  id: 'card_pal_devout_prayer',
  name: '虔诚祈祷',
  classId: AEG,
  cardType: 'Skill',
  rarity: 'Common',
  baseCost: 1,
  targetType: 'AllAllies',
  tags: ['Skill'],
  description: '获得 2 枚圣令；为全队附加 5 点光铸屏障。',
  actionTree: seq([
    resource('holy_order', 'Add', 2),
    { action_type: 'GainBarrier', target_selector: 'AllAllies', params: { base: 5 } },
  ]),
  upgradeA: { label: '强化·祈祷', descOverride: '屏障提升至 8 点' },
  upgradeB: { label: '虔诚·祈祷', descOverride: '圣令 +3' },
});

// ---- 防护回复流 ----

registerCard({
  id: 'card_pal_shield_toss',
  name: '投掷盾牌',
  classId: AEG,
  cardType: 'Attack',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'AllEnemies',
  tags: ['Attack'],
  description: '光盾在敌人之间弹射 3 次，每次造成 6 点伤害；主目标眩晕 1 回合；获得 1 枚圣令。',
  actionTree: seq([
    { action_type: 'Repeat', params: { count: 3 }, actions: [dmgAll(6)] },
    { action_type: 'ApplyBuff', target_selector: 'SingleEnemy', params: { buff_id: 'stun', stacks: 1 } },
    resource('holy_order', 'Add', 1),
  ]),
  upgradeA: { label: '强化·飞盾', damageBonus: 2, descOverride: '每次弹射伤害 +2' },
  upgradeB: { label: '圣轮·飞盾', descOverride: '弹射 4 次；主目标致盲' },
});

registerCard({
  id: 'card_pal_reckoning',
  name: '清算',
  classId: AEG,
  cardType: 'Attack',
  rarity: 'Rare',
  baseCost: 1,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Finisher'],
  requires: { resourceId: 'holy_order', min: 2 },
  description: '消耗 2 枚圣令，造成 6 点基础伤害，并追加本场战斗光铸身躯累计吸收伤害 60% 的真实伤害。',
  actionTree: seq([
    resource('holy_order', 'Consume', 2),
    dmg(6, { scaling: [{ attribute: 'AbsorbedTotal', multiplier: 0.6 }], type: 'true' }),
  ]),
  upgradeA: { label: '审判·清算', damageBonus: 4 },
  upgradeB: { label: '终焉·清算', descOverride: '吸收转化率提升至 80%' },
});

registerCard({
  id: 'card_pal_holy_guardian',
  name: '圣光守卫',
  classId: AEG,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power'],
  description: '能力 · 光铸身躯吸收率提升至 65%；每次触发吸收额外获得 1 枚圣令。',
  actionTree: buff('holy_guardian', 1),
  upgradeA: { label: '神佑·守卫', cost: 1, descOverride: '费用 1' },
});

// ---- 光盾回复流 ----

registerCard({
  id: 'card_pal_blade_of_light',
  name: '圣剑',
  classId: AEG,
  cardType: 'Attack',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'SingleEnemy',
  tags: ['Attack', 'Finisher'],
  requires: { resourceId: 'holy_order', min: 3 },
  description: '消耗 3 枚圣令，凝聚巨型光剑：造成 15 点神圣伤害，且最大生命每有 10 点额外 +5 伤害。',
  actionTree: seq([
    resource('holy_order', 'Consume', 3),
    dmg(15, { scaling: [{ attribute: 'MaxHp', divisor: 10, multiplier: 5 }], type: 'true' }),
  ]),
  upgradeA: { label: '神威·圣剑', damageBonus: 6 },
  upgradeB: { label: '圣裁·圣剑', descOverride: '最大生命每 8 点额外 +5 伤害' },
});

registerCard({
  id: 'card_pal_radiant_resolve',
  name: '光明决心',
  classId: AEG,
  cardType: 'Skill',
  rarity: 'Uncommon',
  baseCost: 1,
  targetType: 'Self',
  tags: ['Skill'],
  description: '本场战斗最大生命上限 +20 并补满生命；获得 3 枚圣令与 40 点光明能量。',
  actionTree: seq([
    { action_type: 'ModifyMaxHp', params: { amount: 20, heal: true } },
    resource('holy_order', 'Add', 3),
    resource('radiant_energy', 'Add', 40),
  ]),
  upgradeA: { label: '强化·决心', descOverride: '最大生命 +25' },
  upgradeB: { label: '圣誓·决心', cost: 0, descOverride: '0 费；圣令 +2' },
});

registerCard({
  id: 'card_pal_crusade',
  name: '冷酷征伐',
  classId: AEG,
  cardType: 'Power',
  rarity: 'Rare',
  baseCost: 2,
  targetType: 'Self',
  tags: ['Power'],
  description: '能力 · 持续 2 回合：回合开始补满 5 枚圣令；圣剑/裁决费用 -1；造成伤害 50% 转化为光铸屏障。',
  actionTree: buff('crusade', 2),
  upgradeA: { label: '圣战·征伐', cost: 1, descOverride: '费用 1' },
});

// 卡牌升级逻辑已移至 core/cards.ts（upgradeCardDef）
export { upgradeCardDef } from '../core/cards';
