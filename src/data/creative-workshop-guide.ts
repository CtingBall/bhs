// ============================================================
// 创意工坊内容指南 — 星痕回响 v3.0
// 
// 本文件展示了如何使用数据驱动的方式创建新游戏内容。
// 所有内容创作者只需编辑以下数据文件即可：
//   data/cards.ts     — 卡牌模板
//   data/enemies.ts   — 敌人
//   data/events.ts    — 事件
//   data/relics.ts    — 遗物
//   data/characters.ts — 角色
//   data/summons.ts   — 召唤物
//   data/effects.ts   — 效果模块
//   data/keywords.ts  — 词条
//   engine/hooks.ts   — 钩子/触发器（高级用法）
//
// 无需修改任何引擎代码即可添加新内容！
// ============================================================

// ===== 1. 如何添加一张新卡牌 =====
// 在 data/cards.ts 的 CARD_TEMPLATES 数组中添加：
/*
{
  id: 'my-custom-card',         // 唯一ID
  name: '我的卡牌',               // 显示名称
  type: 'attack',                // attack|skill|summon|curse
  rarity: 'rare',                // basic|common|rare|epic|legendary
  baseCost: 1,                   // 基础费用
  effectId: 'strike',            // 效果模块ID（见 data/effects.ts）
  classId: 'iaido',              // 可选：职业限定（不填=通用）
  innateKeywords: { sharp: 1 }, // 可选：自带词条
  flavor: '薄荷色的力量！',       // 可选：风味文字
  // 高级：自定义效果（优先于effectId）
  customEffects: [
    { kind: 'damage', value: 8, scale: 'strength' },
    { kind: 'draw', value: 1 },
  ],
  // 高级：打出时触发钩子
  onPlayHooks: [
    {
      id: 'my-custom-on-play',
      hook: 'onCardPlayed',
      effects: [{ kind: 'block', value: 3 }],
      priority: 50,
      description: '打出时获得3格挡',
    },
  ],
}
*/

// ===== 2. 如何创建一个新敌人 =====
// 在 data/enemies.ts 的 ENEMIES 数组中添加：
/*
{
  id: 'my-custom-enemy',
  name: '自定义怪物',
  emoji: '👾',
  hp: 50,
  zone: 'strike',          // 出现在哪个区域
  isElite: false,           // 是否为精英
  isBoss: false,            // 是否为Boss
  intents: [
    { kind: 'attack', value: 10, displayText: '重击 10' },
    { kind: 'defend', value: 8, displayText: '防御 8' },
    { kind: 'buff', value: 2, displayText: '力量+2' },
  ],
  desc: '一个自定义的怪物',
  // 高级：自定义技能
  skill: {
    id: 'my-skill',
    trigger: 'every3Turns',
    desc: '每3回合恢复生命',
    effect: 'healSelf',
    value: 5,
  },
  // 高级：自定义钩子
  hooks: [
    {
      id: 'my-enemy-on-spawn',
      hook: 'onEnemySpawned',
      effects: [{ kind: 'applyStatus', status: 'strength', statusTarget: 'self', value: 3 }],
      priority: 100,
      description: '登场时获得3力量',
    },
  ],
}
*/

// ===== 3. 如何创建一个新遗物 =====
// 在 data/relics.ts 的 RELICS 数组中添加：
/*
{
  id: 'my-custom-relic',
  name: '自定义遗物',
  rarity: 'rare',
  text: '每回合结束时获得1点能量',
  // 简单效果：使用内建 RelicKind
  effect: { kind: 'startEnergy', value: 1 },
  // 高级：使用钩子定义复杂行为
  hooks: [
    {
      id: 'my-relic-on-turn-end',
      hook: 'onTurnEnd',
      condition: { type: 'hpBelow', threshold: 0.5 },
      effects: [{ kind: 'heal', value: 3 }],
      priority: 80,
      maxTriggers: 3, // 整场最多触发3次
      description: '半血以下回合末回血',
    },
    {
      id: 'my-relic-on-kill',
      hook: 'onKill',
      effects: [
        { kind: 'gainStrength', value: 1 },
        { kind: 'draw', value: 1 },
      ],
      priority: 70,
      maxTriggers: 999, // 无限制
      description: '击杀获得1力量并抽1牌',
    },
  ],
}
*/

// ===== 4. 如何创建事件 =====
// 在 data/events.ts 的 EVENTS 数组中添加：
// 支持的新事件种类：
//   hp, maxHp, healPercent, rope, will, amber
//   addCard, addCurse, removeCard, upgradeRandomCard
//   relic, randomRelic, randomCard
//   casteUp, skipNextBattle, nextBattleHarder, tempAlly
/*
{
  id: 'my-event',
  title: '神秘商人',
  emoji: '🧙',
  text: '一个神秘商人出现在你面前……',
  options: [
    {
      label: '购买商品（消耗20绳）',
      resultText: '你用绳子换了一张稀有卡牌。',
      effects: [
        { kind: 'rope', value: -20 },
        { kind: 'randomCard' },
      ],
    },
    {
      label: '赌博（50%概率）',
      resultText: '',
      effects: [],
      gamble: {
        chance: 0.5,
        winText: '获得一件稀有遗物！',
        loseText: '失去一张牌……',
        win: [{ kind: 'randomRelic' }],
        lose: [{ kind: 'removeCard' }],
      },
    },
    {
      label: '放弃（回复30%最大生命）',
      resultText: '你选择放弃交易，休息了一下。',
      effects: [{ kind: 'healPercent', value: 0.3 }],
    },
  ],
}
*/

// ===== 5. 钩子/触发器完整列表 =====
// onBattleStart      — 战斗开始时
// onTurnStart        — 每回合开始时
// onTurnEnd          — 每回合结束时
// onCardPlayed       — 打出卡牌后
// onCardDrawn        — 抽到卡牌时
// onCardDiscarded    — 卡牌被弃掉时
// onCardExhausted    — 卡牌被消耗时
// onAttackDealt      — 造成伤害时
// onDamageReceived   — 受到伤害时
// onKill             — 击杀敌人时
// onBlockGained      — 获得格挡时
// onHealReceived     — 受到治疗时
// onEnergyGained     — 获得能量时
// onStatusApplied    — 施加状态时
// onStatusReceived   — 受到状态时
// onEnemySpawned     — 敌人登场时
// onSummonSpawned    — 召唤物登场时
// onBattleEnd        — 战斗结束时

// ===== 6. 效果条件完整列表 =====
// { type: 'always' }                    — 总是触发
// { type: 'random', chance: 0.5 }       — 50%概率
// { type: 'cardType', value: 'attack' } — 卡牌类型为攻击
// { type: 'cardRarity', value: 'rare' } — 卡牌稀有度为稀有
// { type: 'hpBelow', threshold: 0.5 }   — 生命低于50%
// { type: 'hpAbove', threshold: 0.3 }   — 生命高于30%
// { type: 'hasStatus', status: 'strength', minAmount: 3 } — 拥有3层力量
// { type: 'enemyCount', min: 2, max: 4 }— 敌人数量2-4
// { type: 'comboCount', interval: 3 }   — 每3连击触发
// { type: 'attackComboCount', interval: 3 } — 每3次攻击牌
// { type: 'cardsInHand', min: 5 }       — 手牌≥5张
// { type: 'firstTurn' }                 — 第一回合
// { type: 'firstBattleOfFloor' }        — 本层首战
// { type: 'blockAbove', value: 10 }     — 格挡>10
// { type: 'cardsPlayedThisTurn', value: 1 } — 本回合已打出≥1张
// { type: 'turnNumber', value: 5 }      — 第5回合
// { type: 'energyAt', value: 3 }        — 能量为3

// ===== 7. 统一效果完整列表 =====
// damage          — 造成伤害（scale: 'strength'随力量成长）
// damageAll       — 对全体造成伤害
// block           — 获得格挡（scale: 'dexterity'随敏捷成长）
// heal            — 回复生命
// loseHp          — 失去生命
// draw            — 抽牌
// energy          — 获得能量
// maxHp           — 最大生命增加
// summon          — 召唤星痕（需搭配summonId）
// applyStatus     — 施加状态
// applyStatusAll  — 对全体施加状态
// gainStrength    — 获得力量
// gainDexterity   — 获得敏捷
// upgradeRandomCard — 随机升级一张卡
// kill            — 即死
// modifyDamage    — 伤害百分比修正
// modifyBlock     — 格挡百分比修正
// modifyCost      — 费用修正
// modifyHandSize  — 手牌上限修正
// modifyMaxEnergy — 最大能量修正
// gainRope        — 获得绳子
// gainWill        — 获得意志
// gainAmber       — 获得琥珀

export const CREATIVE_WORKSHOP_VERSION = '3.0';
