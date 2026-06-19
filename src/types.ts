// 《薄荷色氏族公约：星痕回响》核心类型定义

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
  | 'iaido' // 居合
  | 'twinaxe' // 双斧
  | 'lightshield' // 光盾
  | 'icepearl' // 冰矛
  | 'thunder' // 雷魔
  | 'flame'; // 炎角

export const CLASS_NAME: Record<ClassId, string> = {
  iaido: '居合',
  twinaxe: '双斧',
  lightshield: '光盾',
  icepearl: '冰矛',
  thunder: '雷魔',
  flame: '炎角',
};

// ===== 卡牌 =====
export type CardType = 'attack' | 'skill' | 'summon' | 'curse' | 'event_card';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type StatusType =
  | 'strength' // 力量：攻击+
  | 'dexterity' // 敏捷：格挡+
  | 'vuln' // 易伤：受伤×1.5
  | 'weak' // 虚弱：造成伤害×0.75
  | 'freeze' // 冰冻：攻击力-/层
  | 'burn' // 燃烧：回合末受伤害
  | 'shock' // 感电：回合末受伤害
  | 'regen'; // 回复：回合末回血

export interface CardEffect {
  kind:
    | 'damage'
    | 'damageAll'
    | 'block'
    | 'heal'
    | 'summon'
    | 'applyStatus'
    | 'draw'
    | 'energy'
    | 'maxHp'
    | 'upgradeRandom';
  value?: number;
  status?: StatusType;
  statusTarget?: 'enemy' | 'self';
  summonId?: string;
  hits?: number; // 多段伤害
  all?: boolean; // 状态作用于所有敌人
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  cost: number;
  text: string;
  flavor?: string;
  effects: CardEffect[];
  classId?: ClassId;
  upgraded?: boolean;
  upgradeLevel?: number; // 0=基础, 1=升级, 2=精通
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
  | 'firstAttackBoost' // 首张攻击牌伤害+
  | 'freezeReduceAtk' // 冰冻额外降攻
  | 'comboScale' // 连击越高伤害越高
  | 'firstCardDiscount' // 每回合首张牌-1耗能
  | 'turnBlock' // 每回合格挡
  | 'lowHpHealBoost' // 低血治疗翻倍
  | 'turnEndAoE' // 回合末AOE
  | 'burnDouble'; // 燃烧翻倍

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
  color: string; // 主色
  desc: string;
  handSize?: number; // 手牌上限，默认 5
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
export type Zone = 'strike' | 'doom' | 'punish';
export const ZONE_LIST: Zone[] = ['strike', 'doom', 'punish'];
export const ZONE_NAME: Record<Zone, string> = {
  strike: '强袭区',
  doom: '厄运区',
  punish: '惩戒区',
};

// ===== 敌人 =====
export type IntentKind = 'attack' | 'defend' | 'buff' | 'summon' | 'charge' | 'steal';

export interface Intent {
  kind: IntentKind;
  value: number;
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
  skill?: EnemySkill;
  // 召唤物定义
  summons?: string[];
}

export interface EnemySkill {
  id: string;
  trigger: 'everyTurn' | 'every3Turns' | 'onLowHp' | 'onTurnEven';
  desc: string;
  // 预定义行为
  effect:
    | 'gainStrength' // 获得力量
    | 'gainBlock' // 获得格挡
    | 'healSelf' // 自愈
    | 'summonAlly' // 召唤援军
    | 'stealEnergy' // 偷能量
    | 'rampAttack' // 攻击递增
    | 'split'; // 分裂
  value?: number;
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
}

// ===== 事件 =====
export type EventResultKind =
  | 'hp'
  | 'maxHp'
  | 'rope'
  | 'will'
  | 'amber'
  | 'addCard'
  | 'addCurse'
  | 'relic'
  | 'block'
  | 'energy'
  | 'casteUp'
  | 'skipNextBattle'
  | 'nextBattleHarder'
  | 'tempAlly'
  | 'randomCard'
  | 'randomRelic';

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
    chance: number; // 0-1 成功概率
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
  rampAttack?: number; // 攻击递增累计
  chargeTurns?: number; // 蓄力计数
  skillTriggered?: boolean; // 一次性技能是否已触发
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
  kind: 'player' | 'enemy' | 'system' | 'crit';
}

export interface BattleState {
  enemies: BattleEnemy[];
  player: PlayerState;
  summons: BattleSummon[];
  hand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  exhaustedPile: Card[]; // 召唤牌消耗：本场战斗不可再用
  turn: number;
  cardsPlayedThisTurn: number;
  combo: number;
  isPlayerTurn: boolean;
  over: 'win' | 'lose' | null;
  relics: Relic[];
  character: Character;
  log: LogEntry[];
  nextEnemyUid: number;
  tempAlly: boolean; // 末班车临时盟友：每回合帮打
  animating: boolean;
  battleEvent: BattleEventState; // 战斗内随机事件
  factors: Factor[]; // 因子系统
  eventRewards: { rope?: number; amber?: number; will?: number }; // 战斗事件奖励缓存
}

// ===== 地图 =====
export type NodeType = 'battle' | 'elite' | 'boss' | 'event' | 'shop' | 'rest';

export interface MapNode {
  id: number;          // 区域内唯一 id
  type: NodeType;
  visited: boolean;
  floor: number;       // 0 = 底层（入口），最大值 = boss 层
  col: number;          // 0-3，渲染时的 x 位置
  next: number[];      // 下一层连接的节点 id 列表
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
  factors: Factor[];          // 因子系统：寂灭/裁定/思维
  caste: Caste;
  castePoints: number;
  zoneIndex: number; // 0-2
  currentNodeId: number | null; // 当前所在节点 id，null = 区域入口未选路
  mapNodes: MapNode[][];
  tempAlly: boolean;
  nextBattleHarder: boolean;
  skipNextBattle: boolean;
  battlesWon: number;
  enemiesDefeated: string[];
  pityCounter: number;        // 抽卡保底计数器
  reforgeStones: number;      // 重铸石数量
}

// ===== 因子系统 =====
export type FactorKind = 'annihilation' | 'verdict' | 'thought';
// 寂灭 annihilation: 独立乘区，造成伤害时额外+10%
// 裁定 verdict: 必暴，所有伤害额外+50%但不再受易伤加成
// 思维 thought: 减CD（每回合多抽1张），格挡+50%

export interface Factor {
  id: string;
  kind: FactorKind;
  name: string;
  emoji: string;
  desc: string;
  flavor?: string;
}

export const FACTOR_NAME: Record<FactorKind, string> = {
  annihilation: '寂灭',
  verdict: '裁定',
  thought: '思维',
};

// ===== 召唤物融合配方 =====
export interface SummonRecipe {
  id: string;
  resultSummonId: string;    // 融合产出的召唤物 id
  materials: string[];        // 所需材料召唤物 id 列表（2个）
  name: string;
  desc: string;
  flavor?: string;
}

// ===== 战斗内随机事件 =====
export type BattleEventKind = 'noteField' | 'shinyGoblin' | 'sacrificeDance' | null;
// noteField 音符场：该回合击杀敌人额外获得绳子
// shinyGoblin 闪耀哥布林：召唤限时敌人，击杀获琥珀
// sacrificeDance 奉献之舞：召唤友方单位，治疗它获意志

export interface BattleEventState {
  kind: BattleEventKind;
  data?: number; // 通用数据（如哥布林uid、音符场奖励等）
}

// ===== 卡牌升级 =====
// Card.upgradeLevel: 0=基础, 1=升级, 2=精通


// ===== meta 持久化 =====
export interface MetaProgress {
  sediment: number;
  unlockedCards: string[];
  unlockedEnemies: string[];
  bestZone: number;
  runs: number;
  totalWins: number;
}
