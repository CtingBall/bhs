// ============================================================================
// 遗物内容（Relic Registry）
// 遗物本质是「监听 Hook 并派发动作」的效果实例；局外效果由 Run 层处理
// ============================================================================

import type { Combat } from '../core/combat';
import type { Unit } from '../core/units';
import { HOOK_PRIORITY } from '../core/hooks';
import { getCardDef, type CardInstance } from '../core/cards';

export type RelicRarity = 'Common' | 'Uncommon' | 'Rare' | 'Boss' | 'Special';

export interface RelicDef {
  id: string;
  name: string;
  desc: string;
  rarity: RelicRarity;
  icon: string;
  basePrice: number;
  /** 战斗内安装（注册 Hook） */
  install?: (combat: Combat) => void;
  /** 局外效果（Run 层读取） */
  runEffect?: {
    /** 战后金币百分比修正（+/-） */
    goldBonusPct?: number;
    /** 禁止营地休养回血 */
    disableRestHeal?: boolean;
    /** 隐藏敌人意图 */
    hideIntents?: boolean;
    /** 战斗开始直接抽满 N 张 */
    combatStartDrawTo?: number;
    /** 开局最大生命加成 */
    maxHpBonus?: number;
    /** 每次战斗胜利后回血百分比 */
    healOnVictoryPct?: number;
    /** 立即获得金币 */
    instantGold?: number;
  };
}

export const RELIC_REGISTRY = new Map<string, RelicDef>();

export function registerRelic(def: RelicDef): void {
  RELIC_REGISTRY.set(def.id, def);
}

// ---- 通用遗物 ----

registerRelic({
  id: 'relic_whetstone',
  name: '磨刀石',
  desc: '战斗开始时获得 2 层【力量】。',
  rarity: 'Common', icon: '🪨', basePrice: 90,
  install: (combat) => {
    combat.hooks.on('OnCombatStart', HOOK_PRIORITY.Relic, () => {
      combat.applyBuff(combat.player, 'strength', 2);
    });
  },
});

registerRelic({
  id: 'relic_medicine',
  name: '治疗药膏',
  desc: '每场战斗胜利后，恢复最大生命 10% 的生命。',
  rarity: 'Common', icon: '🧴', basePrice: 110,
  runEffect: { healOnVictoryPct: 0.1 },
});

registerRelic({
  id: 'relic_lucky_coin',
  name: '幸运铜币',
  desc: '战斗胜利后获得的金币 +25%。',
  rarity: 'Uncommon', icon: '🪙', basePrice: 140,
  runEffect: { goldBonusPct: 25 },
});

registerRelic({
  id: 'relic_thorn_seed',
  name: '荆棘种子',
  desc: '战斗开始时，所有敌人获得 1 层【易伤】。',
  rarity: 'Uncommon', icon: '🌱', basePrice: 150,
  install: (combat) => {
    combat.hooks.on('OnCombatStart', HOOK_PRIORITY.Relic, () => {
      for (const e of combat.enemies) combat.applyBuff(e, 'vulnerable', 1);
    });
  },
});

registerRelic({
  id: 'relic_battle_rattle',
  name: '战吼骨哨',
  desc: '战斗开始时获得 1 点临时能量。',
  rarity: 'Rare', icon: '📯', basePrice: 210,
  install: (combat) => {
    combat.hooks.on('OnCombatStart', HOOK_PRIORITY.Relic, () => {
      combat.modifyEnergy(combat.player, 1);
    });
  },
});

// ---- 首领遗物（双刃剑） ----

registerRelic({
  id: 'relic_energy_converter',
  name: '能量转换器',
  desc: '每回合初始能量 +1；代价：无法再看到敌人的攻击意图。',
  rarity: 'Boss', icon: '⚙️', basePrice: 0,
  runEffect: { hideIntents: true },
  install: (combat) => {
    combat.maxEnergy += 1;
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Relic, () => {
      combat.energy = combat.maxEnergy;
    });
  },
});

registerRelic({
  id: 'relic_black_market',
  name: '黑市契约',
  desc: '立即获得 400 金币；代价：无法再在营地执行【休养（回血）】。',
  rarity: 'Boss', icon: '📜', basePrice: 0,
  runEffect: { instantGold: 400, disableRestHeal: true },
});

registerRelic({
  id: 'relic_holy_scepter',
  name: '神圣权杖',
  desc: '每回合打出的第一张攻击牌，对目标追加 3 点神圣真实伤害；代价：战斗中获得的金币减少 50%。',
  rarity: 'Boss', icon: '🪄', basePrice: 0,
  runEffect: { goldBonusPct: -50 },
  install: (combat) => {
    let attackCount = 0;
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Relic, () => { attackCount = 0; });
    combat.hooks.on<{ card: { defId: string }; target: { id: string } | null }>('OnCardPlayed', HOOK_PRIORITY.Relic, (ev) => {
      const card = ev.payload.card;
      const target = ev.payload.target;
      const t = target ? combat.findUnit(target.id) : null;
      const def = getCardDef(card.defId);
      if (def.cardType === 'Attack' && t && attackCount === 0) {
        combat.procDamage(combat.player, t, 3, 'true');
      }
      if (def.cardType === 'Attack') attackCount++;
    });
  },
});

// ---- 事件专属遗物 ----

registerRelic({
  id: 'relic_void_eye',
  name: '虚空之眼',
  desc: '每回合初始能量 +1；代价：牌组被永久塞入 2 张【虚空寄生虫】。',
  rarity: 'Rare', icon: '👁️', basePrice: 0,
  install: (combat) => {
    combat.maxEnergy += 1;
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Relic, () => {
      combat.energy = combat.maxEnergy;
    });
  },
});

// ============================================================================
// 人物专属遗物（人物模块：选择角色获得的固定效果）
// ============================================================================

// 水千夏：不死魔王 / 守身如玉 / 阿斯特里斯人口普查发言人
registerRelic({
  id: 'relic_qianxia_undying',
  name: '不死魔王·守身如玉',
  desc: '每场战斗首次受到致死伤害时，以 1 点生命存活（不死魔王）；战斗胜利金币 +15%（阿斯特里斯人口普查增收）。',
  rarity: 'Special', icon: '💖', basePrice: 0,
  runEffect: { goldBonusPct: 15 },
  install: (combat) => {
    let saved = false;
    combat.hooks.on<{ target: Unit; save: (hp: number) => void }>('OnFatalDamageTaken', HOOK_PRIORITY.Relic, (ev) => {
      const p = ev.payload;
      if (p.target === combat.player && !saved) {
        saved = true;
        p.save(1);
        combat.logText('「不死魔王」锁住了最后 1 点生命！');
        combat.logText('水千夏：我是不死的！');
      }
    });
  },
});

// 伏月十三：线虫 = 24/7 在线、从不下线（「十三线虫故事1/1」五连复读名场面）
registerRelic({
  id: 'relic_shisan_online',
  name: '线虫·二十四小时在线',
  desc: '每场战斗第 1 回合额外抽 2 张牌（线虫永远抢先上线）。',
  rarity: 'Special', icon: '🐛', basePrice: 0,
  install: (combat) => {
    let firstTurn = true;
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Relic, () => {
      if (firstTurn) {
        firstTurn = false;
        combat.drawCards(2);
        combat.logText('「线虫」抢先上线，额外抽 2 张牌！');
      }
    });
  },
});

// 薄荷色小溪：会长，深夜仗剑讨马贼（三角洲行动讲故事名场面 + 光盾篡位逼宫）
registerRelic({
  id: 'relic_xiaoxi_president',
  name: '会长之誓·讨马贼',
  desc: '每场战斗第 1 回合开始时获得 8 点格挡与 1 层【力量】（「我乃薄荷色氏族会长薄荷色小溪，今日誓讨马贼！」）。',
  rarity: 'Special', icon: '👑', basePrice: 0,
  install: (combat) => {
    let firstTurn = true;
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Relic, () => {
      if (!firstTurn) return;
      firstTurn = false;
      combat.gainBlock(combat.player, 8);
      combat.applyBuff(combat.player, 'strength', 1);
      combat.logText('会长拔剑起誓：今日誓讨马贼！');
    });
  },
});

// 星落：幸运星 + 富婆 + 溪谷全家福总指挥（「溪谷的篝火氛围最好~」）
registerRelic({
  id: 'relic_xingluo_luckystar',
  name: '幸运星·溪谷全家福',
  desc: '开局立即获得 60 金币（富婆赞助）；每场战斗胜利后回复 8% 最大生命（篝火氛围最好~）。',
  rarity: 'Special', icon: '⭐', basePrice: 0,
  runEffect: { instantGold: 60, healOnVictoryPct: 8 },
});

// 薄荷色第二栅栏：脆皮鸽 + 群内第一活跃 + 复读文化推动者（「人的本质是一个复读机」）
registerRelic({
  id: 'relic_shanlan_repeat',
  name: '脆皮鸽·复读机',
  desc: '每回合你打出的第一张牌会被「复读」：复制一张同升级等级的该牌加入手牌。',
  rarity: 'Special', icon: '🕊️', basePrice: 0,
  install: (combat) => {
    let repeated = false;
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Relic, () => { repeated = false; });
    combat.hooks.on<{ card: CardInstance }>('OnCardPlayed', HOOK_PRIORITY.Relic, (ev) => {
      const card = ev.payload.card;
      if (repeated) return;
      repeated = true;
      const copy = combat.piles.createCard(card.defId);
      copy.upgradeLevel = card.upgradeLevel;
      copy.cost = card.cost;
      copy.exhaust = card.exhaust;
      copy.retain = card.retain;
      copy.temporary = true;
      combat.piles.addToHand(copy);
      combat.logText('复读机复读了一张牌（人的本质是一个复读机）');
    });
  },
});

// 奶蛙：🌻 暴躁奶妈（「我一拳打死你」+「复读的去紫砂」）
registerRelic({
  id: 'relic_naiwa_punch',
  name: '奶蛙之拳',
  desc: '每回合第一张攻击牌额外造成 3 点真实伤害（一拳）；每当有敌人被击杀，回复 3 点生命（暴躁奶妈的温柔）。',
  rarity: 'Special', icon: '🐸', basePrice: 0,
  install: (combat) => {
    let punched = false;
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Relic, () => { punched = false; });
    combat.hooks.on<{ card: { defId: string }; target: { id: string } | null }>('OnCardPlayed', HOOK_PRIORITY.Relic, (ev) => {
      const card = ev.payload.card;
      const target = ev.payload.target;
      if (punched) return;
      if (getCardDef(card.defId).cardType !== 'Attack') return;
      punched = true;
      const t = target ? combat.findUnit(target.id) : null;
      if (t) {
        combat.procDamage(combat.player, t, 3, 'true');
        combat.logText('奶蛙：我一拳打死你！（+3 真实伤害）');
      }
    });
    combat.hooks.on<{ victim: Unit; killer: unknown }>('OnUnitKilled', HOOK_PRIORITY.Relic, (ev) => {
      if (ev.payload.victim !== combat.player && ev.payload.victim.tags.includes('enemy')) {
        combat.heal(combat.player, 3);
        combat.logText('奶蛙给你递上一朵🌻（回复 3 生命）');
      }
    });
  },
});

export function getRelicDef(id: string): RelicDef {
  const def = RELIC_REGISTRY.get(id);
  if (!def) throw new Error(`未知遗物: ${id}`);
  return def;
}
