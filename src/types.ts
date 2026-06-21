// ============================================================
// 薄荷色氏族公约：星痕回响 — 核心类型定义 v3.0
// 超级引擎大更新：完全数据驱动 + 创意工坊友好
// ============================================================

// ===== 场景 =====
export type Scene =
  | 'menu'
  | 'select'
  | 'map'
  | 'battle'
  | 'event'
  | 'shop'
  | 'reward'
  | 'rest'
  | 'death'
  | 'victory'
  | 'codex';

// ===== 职业 =====
export type ClassId =
  | 'iaido'       // 居合
  | 'twinaxe'     // 双斧
  | 'lightshield' // 光盾
  | 'icepearl'    // 冰矛
  | 'thunder'     // 雷魔
  | 'flame';      // 炎角

export const CLASS_NAME: Record<ClassId, string> = {
  iaido: '居合',
  twinaxe: '双斧',
  lightshield: '光盾',
  icepearl: '冰矛',
  thunder: '雷魔',
  flame: '炎角',
};

// ===== 游戏钩子（触发器系统） =====
// 任何卡牌/遗物/被动/因子都可以注册钩子，在特定时机触发效果
export type GameHook =
  | 'onBattleStart'        // 战斗开始时
  | 'onTurnStart'          // 回合开始时
  | 'onTurnEnd'            // 回合结束时
  | 'onCardPlayed'         // 卡牌打出后
  | 'onCardDrawn'          // 卡牌抽到时
  | 'onCardDiscarded'      // 卡牌弃掉时
  | 'onCardExhausted'      // 卡牌消耗时
  | 'onAttackDealt'        // 造成攻击伤害时
  | 'onDamageReceived'     // 受到伤害时
  | 'onKill'               // 击杀敌人时
  | 'onBlockGained'        // 获得格挡时
  | 'onHealReceived'       // 受到治疗时
  | 'onEnergyGained'       // 获得能量时
  | 'onStatusApplied'      // 施加状态时
  | 'onStatusReceived'     // 受到状态时
  | 'onEnemySpawned'       // 敌人登场时
  | 'onSummonSpawned'      // 召唤物登场时
  | 'onBattleEnd';         // 战斗结束时

// ===== 效果条件 =====
export type EffectCondition =
  | { type: 'always' }
  | { type: 'random'; chance: number }                              // 概率触发
  | { type: 'cardType'; value: CardType }                           // 卡牌类型为
  | { type: 'cardRarity'; value: Rarity }                           // 卡牌稀有度为
  | { type: 'hpBelow'; threshold: number }                          // 生命低于%
  | { type: 'hpAbove'; threshold: number }                          // 生命高于%
  | { type: 'hasStatus'; status: StatusType; minAmount?: number }   // 拥有某状态
  | { type: 'enemyCount'; min?: number; max?: number }              // 敌人数量
  | { type: 'comboCount'; interval: number }                        // 每N连击触发
  | { type: 'attackComboCount'; interval: number }                  // 每N次攻击牌
  | { type: 'cardsInHand'; min?: number; max?: number }             // 手牌数量
  | { type: 'energyAt'; value: number }                             // 能量为
  | { type: 'turnNumber'; value: number }                           // 指定回合
  | { type: 'firstTurn' }                                           // 第一回合
  | { type: 'firstBattleOfFloor' }                                  // 本层首战
  | { type: 'blockAbove'; value: number }                           // 格挡大于
  | { type: 'cardsPlayedThisTurn'; value: number };                 // 本回合已打出N张

// ===== 统一效果定义 =====
export type EffectKind =
  | 'damage'
  | 'damageAll'
  | 'block'
  | 'heal'
  | 'draw'
  | 'energy'
  | 'maxHp'
  | 'summon'
  | 'applyStatus'
  | 'applyStatusAll'
  | 'upgradeRandomCard'
  | 'gainStrength'
  | 'gainDexterity'
  | 'gainRope'
  | 'gainWill'
  | 'gainAmber'
  | 'loseHp'
  | 'modifyDamage'       // 伤害修正（百分比）
  | 'modifyBlock'        // 格挡修正（百分比）
  | 'modifyCost'         // 费用修正
  | 'modifyHandSize'     // 手牌上限修正
  | 'modifyMaxEnergy'    // 最大能量修正
  | 'exhaust'            // 消耗
  | 'kill';              // 即死

// ===== 修饰器目标 =====
export type ModifierTarget =
  | 'damageOut'      // 造成的伤害
  | 'damageIn'       // 受到的伤害
  | 'blockOut'       // 获得的格挡
  | 'healOut'        // 治疗量
  | 'healIn'         // 受到的治疗
  | 'cardCost';      // 卡牌费用

// ===== 修饰器 =====
export interface Modifier {
  id: string;                    // 唯一ID（用于叠加/替换）
  target: ModifierTarget;
  kind: 'add' | 'multiply' | 'set';  // 加法 | 乘法 | 固定值
  value: number;                 // 加法=绝对值，乘法=倍率(1.5=+50%)
  source: string;                // 来源描述
  duration: 'permanent' | 'battle' | 'turn'; // 持续时间
  condition?: EffectCondition;   // 生效条件
}

// ===== 钩子处理器 =====
export interface HookHandler {
  id: string;                    // 唯一ID
  hook: GameHook;                // 触发时机
  condition?: EffectCondition;   // 触发条件
  effects: UnifiedEffect[];      // 触发的效果列表
  modifiers?: Modifier[];        // 触发的修饰器列表
  priority: number;              // 优先级（越大越先执行）
  maxTriggers?: number;          // 每回合/每场最多触发次数（未设=无限）
  description?: string;          // 创意工坊：效果描述
}

// ===== 统一效果 =====
export interface UnifiedEffect {
  kind: EffectKind;
  value?: number;
  status?: StatusType;
  statusTarget?: 'enemy' | 'self' | 'allEnemies' | 'all';
  summonId?: string;
  hits?: number;                 // 段数
  condition?: EffectCondition;   // 生效条件
  scale?: 'strength' | 'dexterity' | 'none'; // 随属性成长
  modifiers?: Modifier[];        // 额外修饰器
}

// ===== 卡牌 =====
export type CardType = 'attack' | 'skill' | 'summon' | 'curse' | 'event_card';
export type Rarity = 'basic' | 'common' | 'rare' | 'epic' | 'legendary';

export type StatusType =
  | 'strength'    // 力量：攻击+
  | 'dexterity'   // 敏捷：格挡+
  | 'vuln'        // 易伤：受伤×1.5
  | 'weak'        // 虚弱：造成伤害×0.75
  | 'frail'       // 脆弱：获得格挡×0.75
  | 'freeze'      // 冰冻：攻击力-/层
  | 'burn'        // 燃烧：回合末受伤害
  | 'shock'       // 感电：回合末受伤害
  | 'regen';      // 回复：回合末回血

// 兼容旧版 CardEffect（卡牌数据文件中使用）
// scaleBy: 动态数值依存 — 核心深度构筑系统
export type ScaleByKind =
  | 'combo'                // 本回合连击数 ×N
  | 'block'                // 当前格挡值 ×N
  | 'missingHp'            // 缺失生命每 N 点 +1
  | 'strength'             // 力量层数 ×N
  | 'dexterity'            // 敏捷层数 ×N
  | 'enemyBurn'            // 目标燃烧层数 ×N
  | 'enemyFreeze'          // 目标冰冻层数 ×N
  | 'enemyShock'           // 目标感电层数 ×N
  | 'enemyWeak'            // 目标虚弱层数 ×N
  | 'enemyVuln'            // 目标易伤层数 ×N
  | 'handSize'             // 当前手牌数 ×N
  | 'cardsPlayedThisTurn'  // 本回合已出牌数 ×N
  | 'attackCombo'          // 本场攻击牌累计数 ×N
  | 'killsThisCombat'      // 本场击杀数 ×N
  | 'missingHpDiv'         // 缺失生命 / N 点 = 额外伤害
  | 'energyRemaining'      // 当前剩余能量 ×N
  | 'enemyCount';          // 敌人数 ×N

export interface CardEffect {
  kind: 'damage' | 'damageAll' | 'block' | 'heal' | 'summon' | 'applyStatus' | 'draw' | 'energy' | 'maxHp' | 'upgradeRandom';
  value?: number;
  status?: StatusType;
  statusTarget?: 'enemy' | 'self';
  summonId?: string;
  hits?: number;
  all?: boolean;
  scaleBy?: ScaleByKind;       // 动态数值依存
  scaleMultiplier?: number;    // 依存倍率（默认1）
  scaleHitsBy?: 'strength' | 'dexterity'; // 动态段数（力量/敏捷 /3 额外段）
  conditionalBonus?: {
    condition: 'enemyHpBelow50' | 'enemyHasWeak' | 'enemyHasFreeze' | 'enemyHasBurn' | 'enemyHasVuln' | 'hpBelow50' | 'hpAbove50' | 'blockAbove0' | 'firstCardThisTurn' | 'handSizeAbove4' | 'enemyIsBoss' | 'energyAtZero';
    bonusKind: 'doubleDamage' | 'costZero' | 'extraHit' | 'applyStatus' | 'drawExtra';
    bonusStatus?: StatusType;
    bonusValue?: number;
  };
  sideEffect?: {
    kind: 'draw' | 'energy' | 'block' | 'heal' | 'applyStatus' | 'damageAll';
    value?: number;
    status?: StatusType;
    statusTarget?: 'enemy' | 'self';
  };
}

// ===== 模块化卡牌：效果 + 词条 + 养成 =====
export type EffectId =
  | 'strike'
  | 'heavy'
  | 'flurry'
  | 'cleave'
  | 'guard'
  | 'heal'
  | 'draw'
  | 'empower'
  | 'vuln-wave'
  | 'shield-bash'
  | 'frost-lunge'
  | 'burn-charge'
  | 'thunder-hit'
  | 'channel'
  | 'finisher'
  | 'summon'
  | 'curse'
  // 深度构筑：属性依存与条件效果
  | 'combo-slash'       // 连击依存伤害
  | 'block-crash'       // 格挡依存伤害
  | 'desperation'       // 缺失生命依存
  | 'status-burst'      // 敌人状态依存爆发
  | 'iron-wall'         // 格挡后反击
  | 'momentum'          // 0费出牌数依存
  | 'execute'           // 斩杀
  | 'bounce'            // 弹射
  | 'blood-hunt'        // 击杀增益
  | 'overdraw'          // 过牌手牌依存
  | 'ignite'            // 燃烧爆发
  | 'shatter'           // 冰冻碎冰
  | 'static-shock'      // 感电连锁
  | 'pain-trade'        // 自伤换力
  | 'vital-drain'       // 吸血
  | 'fortify'           // 格挡递增
  | 'ramp-strike'       // 成长依存
  | 'weak-exploit'      // 虚弱利用
  | 'shield-double'     // 格挡翻倍
  | 'burn-detonate'     // 引爆燃烧
  | 'dexterity-flurry'  // 敏捷依存多段
  | 'strength-burst'   // 力量依存爆发
  // 超级内容更新：跨构筑与双效组合
  | 'drain-slash'      // 吸血打击
  | 'thorns-wall'      // 荆棘壁垒
  | 'chain-bolt'       // 连锁闪电（多敌分段）
  | 'frost-armor'      // 冰霜护甲
  | 'enrage'           // 狂怒（缺失生命依存）
  | 'purge-blessing'   // 净化祝福
  | 'adapt'            // 适应（剩余能量依存）
  | 'cyclic-strike'    // 循环打击（伤害+抽牌）
  | 'siphon'           // 吸取（敌人格挡转自盾）
  | 'overwhelm'        // 压倒（力量依存全体）
  | 'will-strike'      // 意志打击（自伤换强力伤害）
  | 'marked'           // 标记（易伤+条件翻倍）
  | 'assault'          // 突击（多段小伤害）
  | 'guardian'         // 守护（每敌一格挡）
  | 'cascade';         // 连锁伤害（依次衰减）

export type KeywordId =
  | 'sharp'       // 锐化：伤害+2/级
  | 'sturdy'      // 固盾：格挡+2/级
  | 'multi'       // 多段：+1段/级
  | 'spread'      // 扩散：单体→全体
  | 'burn'        // 燃触：附加燃烧
  | 'freeze'      // 霜触：附加冰冻
  | 'shock'       // 雷触：附加感电
  | 'vuln'        // 易伤印：附加易伤
  | 'spring'      // 泉涌：打出后抽牌
  | 'exhaust'     // 消耗
  | 'efficient';  // 节能：-1费/级

export interface CardTemplate {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  baseCost: number;
  flavor?: string;
  classId?: ClassId;              // 职业限定（null=通用）
  effectId: EffectId;
  innateKeywords?: Partial<Record<KeywordId, number>>;
  summonId?: string;
  // 创意工坊：自定义效果（优先于effectId）
  customEffects?: UnifiedEffect[];
  // 创意工坊：打出时触发的钩子
  onPlayHooks?: HookHandler[];
}

export interface CardInstance {
  templateId: string;
  instanceId: string;
  nurtureLevel: number;
  keywords: Partial<Record<KeywordId, number>>;
}

export interface Card {
  id: string;
  instanceId: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  cost: number;
  text: string;
  flavor?: string;
  effects: CardEffect[];
  classId?: ClassId;
  exhaust?: boolean;
  nurtureLevel: number;
  keywords: Partial<Record<KeywordId, number>>;
  upgradeLevel?: number; // @deprecated
  // 创意工坊：运行时钩子
  hooks?: HookHandler[];
}

// ===== 星痕召唤物 =====
export interface Summon {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  perTurn: CardEffect;
}

// ===== 主角 =====
export type PassiveKind =
  | 'firstAttackBoost'
  | 'freezeReduceAtk'
  | 'comboScale'
  | 'firstCardDiscount'
  | 'turnBlock'
  | 'lowHpHealBoost'
  | 'turnEndAoE'
  | 'burnDouble'
  | 'turnDraw'
  | 'comboEnergy'
  | 'initialHand'
  | 'burnExtraDamage'
  | 'firstAttackWeak'
  | 'killStrength'
  | 'firstBlockBoost'
  | 'weakBoost'
  | 'burnAll'
  | 'blockLife'
  | 'rampStrength'
  | 'attackStrength';

export interface PassiveEffect {
  kind: PassiveKind;
  value?: number;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  classId: ClassId;
  emoji: string;
  passiveName: string;
  passiveDesc: string;
  passive: PassiveEffect;
  initialDeck: string[];
  color: string;
  desc: string;
  handSize?: number;
  // 创意工坊：自定义被动钩子（优先于passive.kind的硬编码逻辑）
  passiveHooks?: HookHandler[];
}

// ===== 阶级 =====
export type Caste = 'dalit' | 'vaishya' | 'kshatriya' | 'brahmin';
export const CASTE_NAME: Record<Caste, string> = {
  dalit: '达利特',
  vaishya: '吠舍',
  kshatriya: '刹帝利',
  brahmin: '婆罗门',
};
export const CASTE_ORDER: Caste[] = ['dalit', 'vaishya', 'kshatriya', 'brahmin'];

// ===== 大区 =====
export type Zone = 'strike' | 'doom' | 'punish' | 'abyss' | 'mirage' | 'armageddon' | 'astral';
export const ZONE_LIST: Zone[] = ['strike', 'doom', 'punish', 'abyss', 'mirage', 'armageddon', 'astral'];
export const ZONE_NAME: Record<Zone, string> = {
  strike: '强袭区',
  doom: '厄运区',
  punish: '惩戒区',
  abyss: '深渊区',
  mirage: '幻境区',
  armageddon: '终末区',
  astral: '星界区',
};

// ===== 敌人 =====
export type IntentKind = 'attack' | 'defend' | 'buff' | 'summon' | 'charge' | 'steal';

export interface Intent {
  kind: IntentKind;
  value: number;
  // 创意工坊：自定义意图效果
  customEffects?: UnifiedEffect[];
  // 意图显示文本
  displayText?: string;
}

export interface EnemySkill {
  id: string;
  trigger: 'everyTurn' | 'every3Turns' | 'onLowHp' | 'onTurnEven';
  desc: string;
  effect:
    | 'gainStrength'
    | 'gainBlock'
    | 'healSelf'
    | 'summonAlly'
    | 'stealEnergy'
    | 'rampAttack'
    | 'split'
    | 'applyVuln'
    | 'applyWeak'
    | 'applyFrail'
    | 'blockShield';
  value?: number;
}

export interface Enemy {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  zone: Zone;
  isBoss?: boolean;
  isElite?: boolean;
  intents: Intent[];
  desc: string;
  flavor?: string;
  roaming?: boolean;
  skill?: EnemySkill;
  summons?: string[];
  // 创意工坊：自定义钩子
  hooks?: HookHandler[];
}

// ===== 遗物 =====
export type RelicKind =
  | 'turnBlock'
  | 'turnEndDamage'
  | 'firstBattleDraw'
  | 'fullHandDamage'
  | 'curseToRope'
  | 'startEnergy'
  | 'healOnKill'
  | 'battleStartDraw'
  | 'damageReduction'
  | 'rareChance'
  | 'shopDiscount'
  | 'thorns'
  | 'killHeal'
  | 'turnEndHeal'
  | 'firstAttackDamage';

export interface RelicEffect {
  kind: RelicKind;
  value?: number;
}

export interface Relic {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'boss';
  text: string;
  flavor?: string;
  effect: RelicEffect;
  // 创意工坊：自定义钩子（优先于effect.kind的硬编码逻辑）
  hooks?: HookHandler[];
}

// ===== 事件 =====
export type EventResultKind =
  | 'hp' | 'maxHp' | 'rope' | 'will' | 'amber'
  | 'addCard' | 'addCurse' | 'relic' | 'randomCard' | 'randomRelic'
  | 'removeCard' | 'upgradeRandomCard' | 'healPercent'
  | 'casteUp' | 'skipNextBattle' | 'nextBattleHarder' | 'tempAlly';

export interface EventEffect {
  kind: EventResultKind;
  value?: number;
  cardId?: string;
}

export interface EventOption {
  label: string;
  resultText: string;
  effects: EventEffect[];
  gamble?: {
    chance: number;
    winText: string;
    loseText: string;
    win: EventEffect[];
    lose: EventEffect[];
  };
}

export interface GameEvent {
  id: string;
  title: string;
  emoji: string;
  text: string;
  options: EventOption[];
}

// ===== 战斗实例 =====
export interface StatusInstance {
  type: StatusType;
  amount: number;
}

export interface BattleEnemy {
  uid: string;
  defId: string;
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  block: number;
  statuses: StatusInstance[];
  intentIndex: number;
  intents: Intent[];
  isBoss?: boolean;
  isElite?: boolean;
  skill?: EnemySkill;
  summons?: string[];
  rampAttack?: number;
  chargeTurns?: number;
  skillTriggered?: boolean;
  blockShield?: number;
}

export interface BattleSummon {
  uid: string;
  defId: string;
  name: string;
  emoji: string;
  perTurn: CardEffect;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  statuses: StatusInstance[];
}

export interface LogEntry {
  text: string;
  kind: 'player' | 'enemy' | 'system' | 'crit' | 'hook' | 'intent';
}

export interface BattleEventState {
  kind: 'noteField' | 'shinyGoblin' | 'sacrificeDance' | null;
  data?: number;
}

export interface BattleState {
  enemies: BattleEnemy[];
  player: PlayerState;
  summons: BattleSummon[];
  hand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  exhaustedPile: Card[];
  turn: number;
  cardsPlayedThisTurn: number;
  combo: number;
  attackCombo: number;
  isPlayerTurn: boolean;
  over: 'win' | 'lose' | null;
  relics: Relic[];
  character: Character;
  log: LogEntry[];
  nextEnemyUid: number;
  tempAlly: boolean;
  animating: boolean;
  battleEvent: BattleEventState;
  factors: Factor[];
  eventRewards: { rope?: number; amber?: number; will?: number };
  firstBattleOfFloor: boolean;
  // 新引擎：每回合/每场钩子触发计数
  hookTriggers: Record<string, number>;
  hookTriggersThisTurn: Record<string, number>;
  // 新引擎：全局修饰器堆栈
  modifiers: Modifier[];
}

// ===== 地图 =====
export type NodeType = 'battle' | 'elite' | 'boss' | 'event' | 'shop' | 'rest' | 'dimension' | 'treasure' | 'mystery';

export interface MapNode {
  id: number;
  type: NodeType;
  visited: boolean;
  floor: number;
  col: number;
  next: number[];
}

// ===== 局内运行状态 =====
export interface RunState {
  characterId: string;
  classId: ClassId;
  hp: number;
  maxHp: number;
  rope: number;
  will: number;
  amber: number;
  deck: Card[];
  relics: Relic[];
  factors: Factor[];
  caste: Caste;
  castePoints: number;
  zoneIndex: number;
  currentNodeId: number | null;
  mapNodes: MapNode[][];
  tempAlly: boolean;
  nextBattleHarder: boolean;
  skipNextBattle: boolean;
  battlesWon: number;
  enemiesDefeated: string[];
  pityCounter: number;
  reforgeStones: number;
}

// ===== 因子系统 =====
export type FactorKind = 'annihilation' | 'verdict' | 'thought';

export interface Factor {
  id: string;
  kind: FactorKind;
  name: string;
  emoji: string;
  desc: string;
  flavor?: string;
  // 创意工坊：自定义钩子
  hooks?: HookHandler[];
}

export const FACTOR_NAME: Record<FactorKind, string> = {
  annihilation: '寂灭',
  verdict: '裁定',
  thought: '思维',
};

// ===== 召唤物融合配方 =====
export interface SummonRecipe {
  id: string;
  resultSummonId: string;
  materials: string[];
  name: string;
  desc: string;
  flavor?: string;
}

// ===== meta 持久化 =====
export interface MetaProgress {
  sediment: number;
  unlockedCards: string[];
  unlockedEnemies: string[];
  bestZone: number;
  runs: number;
  totalWins: number;
}
