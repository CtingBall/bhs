// ============================================================================
// 天枢星盘：大天赋注册表与实现（首期：雷影剑士 ×8 + 神盾骑士 ×8）
// 每个大天赋本质是「向战斗 Hook 总线挂载规则改写」的安装器，
// 战斗结束时自动回滚对卡牌定义的临时补丁。
// ============================================================================

import type { Combat } from '../core/combat';
import { HOOK_PRIORITY } from '../core/hooks';
import type { HookName, HookEvent } from '../core/hooks';
import type { CardDef } from '../core/cards';
import { getCardDef } from '../core/cards';
import type { ActionNode } from '../core/actions';
import type { Unit } from '../core/units';

export type KeystoneCategory = 'Universal' | 'SpecA' | 'SpecB';

export interface KeystoneDef {
  id: string;
  classId: string;
  category: KeystoneCategory;
  name: string;
  desc: string;
  unlockCost: number;
  install: (combat: Combat) => void;
}

export const KEYSTONE_REGISTRY = new Map<string, KeystoneDef>();

export function registerKeystone(def: KeystoneDef): void {
  KEYSTONE_REGISTRY.set(def.id, def);
}

export function getKeystoneDef(id: string): KeystoneDef {
  const def = KEYSTONE_REGISTRY.get(id);
  if (!def) throw new Error(`未知大天赋: ${id}`);
  return def;
}

export function keystonesForClass(classId: string): KeystoneDef[] {
  return [...KEYSTONE_REGISTRY.values()].filter((k) => k.classId === classId);
}

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

const on = <T>(combat: Combat, hook: HookName, fn: (ev: HookEvent<T>) => void): void => {
  combat.hooks.on<T>(hook, HOOK_PRIORITY.Keystone, fn);
};

/** 遍历动作树（含子节点），对每个节点调用 fn */
function walkTree(node: ActionNode, fn: (n: ActionNode) => void): void {
  fn(node);
  if (node.actions) for (const n of node.actions) walkTree(n, fn);
  if (node.on_true) for (const n of node.on_true) walkTree(n, fn);
  if (node.on_failure) for (const n of node.on_failure) walkTree(n, fn);
}

function cloneDef(def: CardDef): CardDef {
  return { ...def, actionTree: JSON.parse(JSON.stringify(def.actionTree)) as ActionNode };
}

function restoreDef(def: CardDef, orig: CardDef): void {
  def.baseCost = orig.baseCost;
  def.requires = orig.requires;
  def.exhaust = orig.exhaust;
  def.description = orig.description;
  def.actionTree = orig.actionTree;
}

/** 临时补丁卡牌定义，战斗结束自动回滚 */
function patchDef(combat: Combat, defId: string, patch: (def: CardDef) => void): void {
  const def = getCardDef(defId);
  const orig = cloneDef(def);
  patch(def);
  combat.hooks.on('OnCombatEnd', HOOK_PRIORITY.Keystone, () => restoreDef(def, orig));
}

function enemiesOf(combat: Combat): Unit[] {
  return combat.enemies.filter((e) => e.isAlive());
}

// ============================================================================
// 森语者（K1-1 ~ K1-8）
// ============================================================================

registerKeystone({
  id: 'k1_1_tree_world',
  classId: 'hero_sylvanguard',
  category: 'Universal',
  name: '万物共生·树界降临',
  desc: '战斗开始时召唤 1 远古树人 + 2 林精花仙；所有治疗卡数值提升 150%；每打出一张攻击牌额外召唤 1 只花仙。',
  unlockCost: 100,
  install: (combat) => {
    combat.player.state['healBoost'] = 2.5;
    const summonFairy = (): void => {
      combat.summonAlly({ unitId: 'fairy-ks', name: '林精花仙', maxHp: 16, autoAttack: 5, portrait: '🧚', allowMultiple: true });
    };
    combat.hooks.on('OnCombatStart', HOOK_PRIORITY.Keystone, () => {
      combat.summonAlly({ unitId: 'treant-ks', name: '远古树人', maxHp: 34, autoAttack: 8, portrait: '🌳' });
      summonFairy();
      summonFairy();
    });
    combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      if (getCardDef(ev.payload.card.defId).cardType === 'Attack') summonFairy();
    });
  },
});

registerKeystone({
  id: 'k1_2_wither_bloom',
  classId: 'hero_sylvanguard',
  category: 'Universal',
  name: '死生逆转·枯萎绽放',
  desc: '你造成的所有治疗量，同时以 100% 转化为对随机敌人的穿透真实伤害。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ amount: number }>('OnHealed', HOOK_PRIORITY.Keystone, (ev) => {
      const amt = Math.round(ev.payload.amount);
      if (amt > 0) {
        const enemies = combat.aliveEnemies();
        if (enemies.length > 0) combat.procDamage(player, combat.rngCombat.pick(enemies), amt, 'true');
      }
    });
  },
});

registerKeystone({
  id: 'k1_3_overgrowth',
  classId: 'hero_sylvanguard',
  category: 'SpecA',
  name: '过量天灾·狂野激荡',
  desc: '溢出治疗量 100% 化为【狂野飞叶】轰击随机敌人；【狂野绽放】只消耗半数种子。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ overhealed: number }>('OnOverheal', HOOK_PRIORITY.Keystone, (ev) => {
      const o = Math.round(ev.payload.overhealed);
      if (o > 0) {
        const enemies = combat.aliveEnemies();
        if (enemies.length > 0) combat.procDamage(player, combat.rngCombat.pick(enemies), o, 'true');
      }
    });
    patchDef(combat, 'card_syl_wild_bloom', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'ModifyResource' && n.params?.resource_id === 'seed' && n.params.operation === 'Consume') {
          n.params.amount = 50; // 只耗半数（伤害由下方补偿）
        }
      });
    });
    combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && player.state['lastPlayedCardId'] === 'card_syl_wild_bloom') {
        p.request.base *= 2; // 半数种子 = 全额伤害
      }
    });
  },
});

registerKeystone({
  id: 'k1_4_dual_pulse',
  classId: 'hero_sylvanguard',
  category: 'SpecA',
  name: '双重脉冲·生机共振',
  desc: '【再生脉冲】双重震荡：第一段全队恢复伤害 50% 生命；第二段对全场敌人施加 2 层易伤并造成等额真实伤害。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['pulseEnhanced'] = true;
    combat.hooks.on<{ source: unknown; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && player.state['infusedAttackJust'] === true && p.result.remaining > 0) {
        player.state['infusedAttackJust'] = false;
        const dmg = Math.round(p.result.remaining * 0.5);
        for (const e of combat.aliveEnemies()) {
          combat.applyBuff(e, 'vulnerable', 2);
          combat.procDamage(player, e, dmg, 'true');
        }
      }
    });
  },
});

registerKeystone({
  id: 'k1_5_crimson_infusion',
  classId: 'hero_sylvanguard',
  category: 'SpecA',
  name: '极意灌注·血色绽放',
  desc: '【自然灌注】消耗翻倍为 2 颗种子；灌注伤害提升至 350%；灌注造成的伤害 100% 转化为全队护甲。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['infusionMultiplier'] = 3.5;
    player.state['infusionToBlock'] = true;
    patchDef(combat, 'card_syl_infusion', (def) => {
      def.requires = { resourceId: 'seed', min: 2 };
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'ModifyResource' && n.params?.resource_id === 'seed' && n.params.operation === 'Consume') {
          n.params.amount = 2;
        }
      });
    });
  },
});

registerKeystone({
  id: 'k1_6_root_eternal',
  classId: 'hero_sylvanguard',
  category: 'SpecB',
  name: '开局生花·恒古根系',
  desc: '每场战斗开局直接激活二阶生花：法环预装 7 颗自然之种。',
  unlockCost: 120,
  install: (combat) => {
    combat.hooks.on('OnCombatStart', HOOK_PRIORITY.Keystone, () => {
      combat.modifyResource(combat.player, 'seed', 'Set', 7);
    });
  },
});

registerKeystone({
  id: 'k1_7_host_parasite',
  classId: 'hero_sylvanguard',
  category: 'SpecB',
  name: '宿主寄生·灵气反哺',
  desc: '本体化作灵体附身：受到的一切伤害降为 0（无敌态）；所有卡牌费用 -1（最低 0）。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['sylInvincible'] = true;
    combat.hooks.on<{ target: Unit; request: { defenderMults: number[] } }>('BeforeDamageReceived', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.target === player) p.request.defenderMults.push(0);
    });
    combat.costModifier = () => -1;
  },
});

registerKeystone({
  id: 'k1_8_thorn_resonance',
  classId: 'hero_sylvanguard',
  category: 'SpecB',
  name: '神圣反噬·荆棘共鸣',
  desc: '友军受到攻击时，攻击者承受该友军滋养层数×4 的神圣反噬；滋养层数不再自然衰减。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['nourishNoDecay'] = true;
    combat.hooks.on<{ target: Unit; source: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.target.hasTag('ally') && p.result.remaining > 0 && p.source && p.source !== player) {
        const stacks = p.target.getBuffStacks('nourish');
        if (stacks > 0) combat.procDamage(p.target, p.source, stacks * 4, 'true');
      }
    });
    // 滋养不衰减：衰减发生在回合开始结算后，此处补回 1 层抵消
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Keystone, () => {
      if (player.hasBuff('nourish')) player.applyBuff('nourish', 1);
    });
  },
});

// ============================================================================
// 冰魔导师（K3-1 ~ K3-8）
// ============================================================================

registerKeystone({
  id: 'k3_1_prism_tower',
  classId: 'hero_frost_mage',
  category: 'Universal',
  name: '万象潮汐·极寒棱镜',
  desc: '打出【寒冰射线】后凝聚极寒光棱塔：每回合自动对全场轰击 3 道穿透光束，伤害随回合数递增 50%。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    player.state['prism'] = true;
    let prismPower = 4;
    combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.card.defId === 'card_mage_frost_ray') player.state['prism'] = true;
    });
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Keystone, () => {
      if (player.state['prism'] === true) {
        for (let i = 0; i < 3; i++) {
          const targets = combat.aliveEnemies();
          if (targets.length === 0) break;
          combat.procDamage(player, combat.rngCombat.pick(targets), Math.round(prismPower), 'magic');
        }
        prismPower = Math.round(prismPower * 1.5);
      }
    });
  },
});

registerKeystone({
  id: 'k3_2_frost_rebirth',
  classId: 'hero_frost_mage',
  category: 'Universal',
  name: '玄冰替身·极寒涅槃',
  desc: '受到致死伤害时，若持有 ≥4 颗玄冰：碎裂全部玄冰免疫死亡并回满生命，对全场敌人施加绝对冻结。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ target: Unit; save: (hp: number) => void }>('OnFatalDamageTaken', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.target === player && combat.getResource(player, 'frost_shard') >= 4) {
        combat.modifyResource(player, 'frost_shard', 'Set', 0);
        p.save(player.maxHp);
        for (const e of combat.aliveEnemies()) combat.applyBuff(e, 'stun', 1);
      }
    });
  },
});

registerKeystone({
  id: 'k3_3_zero_spear',
  classId: 'hero_frost_mage',
  category: 'SpecA',
  name: '瞬华天降·零度冰枪',
  desc: '牌库中所有【冰霜之矛】变为 0 费瞬发，伤害提升 50%。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_mage_frost_spear', (def) => {
      def.baseCost = 0;
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'DealDamage' && n.params?.base === 16) n.params.base = 24;
        if (n.action_type === 'DealDamage' && n.params?.base === 10) n.params.base = 15;
      });
    });
    combat.costModifier = () => 0;
  },
});

registerKeystone({
  id: 'k3_4_meteor_doom',
  classId: 'hero_frost_mage',
  category: 'SpecA',
  name: '陨星风暴·冰魄碎击',
  desc: '【冰霜之矛】触发陨星风暴几率提升至 100%，陨星命中时粉碎目标全部护甲。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_mage_frost_spear', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'ConditionalBranch') {
          const c = n.conditions?.[0];
          if (c?.condition_type === 'Chance') c.chance = 1;
          if (n.on_true) {
            const dmg = n.on_true.find((x) => x.action_type === 'DealDamage');
            if (dmg) {
              n.on_true.push({ action_type: 'ClearBlock', target_selector: 'AllEnemies' });
            }
          }
        }
      });
    });
  },
});

registerKeystone({
  id: 'k3_5_absolute_zero',
  classId: 'hero_frost_mage',
  category: 'SpecA',
  name: '绝对零度·破甲深渊',
  desc: '处于【冻结/眩晕】状态的敌人，受到的冰霜攻击伤害提升至 300%。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ source: unknown; target: Unit; request: { base: number; type: string } }>('BeforeDamageCalculated', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && p.request.type === 'magic' && p.target.hasBuff('stun')) {
        p.request.base *= 3;
      }
    });
  },
});

registerKeystone({
  id: 'k3_6_twin_storm',
  classId: 'hero_frost_mage',
  category: 'SpecB',
  name: '双生风暴·极寒天灾',
  desc: '暴风雪与水龙卷合体为灭世冰龙卷：每回合结束对全体敌人造成 30 点混合伤害，并强制冻结攻击力最高的敌人。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['twinStorm'] = true;
    combat.hooks.on('OnRoundEnd', HOOK_PRIORITY.Keystone, () => {
      if (player.state['twinStorm'] === true) {
        for (const e of combat.aliveEnemies()) {
          combat.procDamage(player, e, 30, 'magic');
        }
        const strongest = [...combat.aliveEnemies()].sort((a, b) => ((b.intent?.damage ?? 0) - (a.intent?.damage ?? 0)))[0];
        if (strongest) combat.applyBuff(strongest, 'stun', 1);
      }
    });
  },
});

registerKeystone({
  id: 'k3_7_mana_flood',
  classId: 'hero_frost_mage',
  category: 'SpecB',
  name: '潮汐永动·法力洪流',
  desc: '寒冰能量上限扩至 200；每消耗 20 点寒冰能量，自动从抽牌堆抽 1 张牌。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.resourceCaps['frost_energy'] = 200;
    combat.hooks.on<{ resourceId: string; before: number; after: number }>('OnResourceChanged', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.resourceId === 'frost_energy' && p.after < p.before) {
        const spent = p.before - p.after;
        const draws = Math.floor(spent / 20);
        if (draws > 0) combat.drawCards(draws);
      }
    });
  },
});

registerKeystone({
  id: 'k3_8_glacier_ray',
  classId: 'hero_frost_mage',
  category: 'SpecB',
  name: '极寒光瀑·冰川贯穿',
  desc: '【寒冰射线】费用降为 1；射线每命中 1 个敌人，立即返还 1 颗玄冰。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['rayRefund'] = true;
    patchDef(combat, 'card_mage_frost_ray', (def) => {
      def.baseCost = 1;
    });
    combat.hooks.on<{ source: unknown; target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && player.state['lastPlayedCardId'] === 'card_mage_frost_ray' && p.result.remaining > 0) {
        combat.modifyResource(player, 'frost_shard', 'Add', 1);
      }
    });
  },
});

// ============================================================================
// 赤炎狂战士（K4-1 ~ K4-8）
// ============================================================================

registerKeystone({
  id: 'k4_1_backwater_arena',
  classId: 'hero_flame_berserker',
  category: 'Universal',
  name: '浴血修罗·背水死境',
  desc: '最大生命永久砍半（降至 40）；造成的所有攻击伤害 ×3，且所有攻击自带 50% 吸血。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    player.maxHp = 40;
    player.hp = Math.min(player.hp, 40);
    player.state['bloodMult'] = true;
    player.state['bloodLifesteal'] = 0.5;
    combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.source === player) ev.payload.request.base *= 3;
    });
    combat.hooks.on<{ source: unknown; target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && p.target !== player && p.result.remaining > 0) {
        combat.heal(player, Math.round(p.result.remaining * 0.5));
      }
    });
  },
});

registerKeystone({
  id: 'k4_2_cleave_storm',
  classId: 'hero_flame_berserker',
  category: 'Universal',
  name: '顺劈风暴·狂怒回流',
  desc: '双斧顺劈溅射比例提升至 80%；对 ≥2 个敌人造成伤害时返还 1 点能量并抽 1 张牌。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    player.state['cleave'] = 0.8;
    combat.hooks.on<{ source: unknown; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && p.result.remaining > 0 && combat.aliveEnemies().length >= 2) {
        combat.modifyEnergy(player, 1);
        combat.drawCards(1);
      }
    });
  },
});

registerKeystone({
  id: 'k4_3_formless_eternal',
  classId: 'hero_flame_berserker',
  category: 'SpecA',
  name: '无相永劫·极境不息',
  desc: 'Lv.5 极境一击打出后不再归零，而是重置至 Lv.3 快速循环。',
  unlockCost: 120,
  install: (combat) => {
    combat.player.state['keystoneFormless5'] = true;
  },
});

registerKeystone({
  id: 'k4_4_arakawa_zero',
  classId: 'hero_flame_berserker',
  category: 'SpecA',
  name: '荒川真意·零费狂澜',
  desc: '【荒川之寂灭】抽牌数提升至 6 张（手牌无上限）。',
  unlockCost: 120,
  install: (combat) => {
    combat.player.state['arakawaSix'] = true;
    combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.card.defId === 'card_ber_arakawa_desolation') {
        combat.drawCards(3); // 额外 3 张（原 3 张 + 3）
      }
    });
  },
});

registerKeystone({
  id: 'k4_5_divine_fire_slash',
  classId: 'hero_flame_berserker',
  category: 'SpecA',
  name: '神火连斩·天火燎原',
  desc: '【无相火斩】追加伤害提升至 等级×12，并附加 1 回合【灼热致盲】（虚弱）。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['formlessSlashMult'] = 12;
    combat.hooks.on<{ source: unknown; target: Unit }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && p.target !== player) combat.applyBuff(p.target, 'weak', 1);
    });
  },
});

registerKeystone({
  id: 'k4_6_self_immolation',
  classId: 'hero_flame_berserker',
  category: 'SpecB',
  name: '自焚地狱·焚躯成灰',
  desc: '每回合初自损 10 点生命；全场【燃烧】永不衰减且每回合双倍结算。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['burnEternal'] = true;
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Keystone, () => {
      combat.loseHpSelf(10);
    });
  },
});

registerKeystone({
  id: 'k4_7_flame_blood_marrow',
  classId: 'hero_flame_berserker',
  category: 'SpecB',
  name: '狂炎血髓·无限魔躯',
  desc: '赤红魂槽上限扩至 200；累计达到 100 点后永久保持地狱炎魔形态，免疫一切负面状态。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.resourceCaps['crimson_soul'] = 200;
    combat.hooks.on<{ resourceId: string; after: number }>('OnResourceChanged', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.resourceId === 'crimson_soul' && ev.payload.after >= 100) {
        player.state['soulFiend'] = true;
      }
    });
  },
});

registerKeystone({
  id: 'k4_8_inverse_falling_star',
  classId: 'hero_flame_berserker',
  category: 'SpecB',
  name: '逆血坠星·灭世轰砸',
  desc: '【无羁坠星】改为消耗当前全部赤红魂槽，每消耗 1 点对敌方全场追加 2 点神圣火焰真伤。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_ber_falling_star', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'ConditionalBranch') {
          n.conditions = [];
          n.on_true = [
            { action_type: 'ModifyResource', target_selector: 'Self', params: { resource_id: 'crimson_soul', operation: 'Consume', amount: 99, store_to: 'soul_burst' } },
            { action_type: 'DealDamage', target_selector: 'AllEnemies', params: { base: 0, scaling: [{ variable_name: 'soul_burst', multiplier: 2 }], type: 'true' } },
          ];
        }
      });
    });
  },
});

// ============================================================================
// 巨刃守护者（K5-1 ~ K5-8）
// ============================================================================

registerKeystone({
  id: 'k5_1_eternal_wall',
  classId: 'hero_titan_guardian',
  category: 'Universal',
  name: '磐石不磨·永恒之壁',
  desc: '护盾与格挡在回合结束时 100% 永久保留，永不衰减清零。',
  unlockCost: 100,
  install: (combat) => {
    combat.player.state['retainBlockPct'] = 1;
  },
});

registerKeystone({
  id: 'k5_2_rage_armor',
  classId: 'hero_titan_guardian',
  category: 'Universal',
  name: '怒火重装·以暴制暴',
  desc: '受到伤害时优先扣除怒气进行全额抵扣（1 点怒气抵 1 点伤害）。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.target === player && p.result.remaining > 0) {
        const rageNow = combat.getResource(player, 'rage');
        if (rageNow > 0) {
          const absorb = Math.min(rageNow, p.result.remaining);
          combat.modifyResource(player, 'rage', 'Consume', absorb);
          player.hp = Math.min(player.maxHp, player.hp + absorb);
        }
      }
    });
  },
});

registerKeystone({
  id: 'k5_3_shield_is_blade',
  classId: 'hero_titan_guardian',
  category: 'SpecA',
  name: '盾即是刃·万钧反震',
  desc: '牌库中所有基础攻击牌自动替换为【护盾猛击】；护盾转化率提升至 120%，并有 35% 几率击晕目标。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_grd_shield_slam', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'DealDamage' && n.params) {
          const s = (n.params.scaling as Array<{ attribute?: string; multiplier?: number }> | undefined);
          const block = s?.find((x) => x.attribute === 'Block');
          if (block) block.multiplier = 1.2;
        }
      });
      // 追加 35% 击晕
      def.actionTree = {
        action_type: 'Sequence',
        params: {
          actions: [
            def.actionTree,
            { action_type: 'ConditionalBranch', conditions: [{ condition_type: 'Chance', chance: 0.35 }], on_true: [{ action_type: 'ApplyBuff', target_selector: 'SingleEnemy', params: { buff_id: 'stun', stacks: 1 } }] },
          ],
        },
      };
    });
    combat.hooks.on('OnCombatStart', HOOK_PRIORITY.Keystone, () => {
      for (const c of combat.piles.draw) {
        if (c.defId === 'card_grd_blade_strike') c.defId = 'card_grd_shield_slam';
      }
      for (const c of combat.piles.hand) {
        if (c.defId === 'card_grd_blade_strike') c.defId = 'card_grd_shield_slam';
      }
    });
  },
});

registerKeystone({
  id: 'k5_4_mountain_quake',
  classId: 'hero_titan_guardian',
  category: 'SpecA',
  name: '不动明王·天崩地裂',
  desc: '每回合限出 3 张牌；护甲获取翻 3 倍；【护盾猛击】升级为打击全场的【天崩地裂】。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['cardLimitPerTurn'] = 3;
    player.state['blockMult'] = 3;
    patchDef(combat, 'card_grd_shield_slam', (def) => {
      def.targetType = 'AllEnemies';
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'DealDamage') n.target_selector = 'AllEnemies';
      });
    });
  },
});

registerKeystone({
  id: 'k5_5_rage_rock',
  classId: 'hero_titan_guardian',
  category: 'SpecA',
  name: '巨岩崩塌·怒爆飞石',
  desc: '【怒爆】不再消耗护盾，只消耗怒气；每消耗 10 点怒气向全场抛射巨石造成 15 点范围伤害。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_grd_rage_eruption', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'DealDamage' && n.params) {
          n.params.scaling = [{ variable_name: 'rage_spent', multiplier: 1.5 }];
        }
      });
    });
  },
});

registerKeystone({
  id: 'k5_6_parry_counter',
  classId: 'hero_titan_guardian',
  category: 'SpecB',
  name: '绝对招架·弹刀断罪',
  desc: '【格挡冲击】一回合内可无限响应；成功招架时将攻击 100% 面板伤害原样反弹。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['parryReflectFull'] = true;
    // 无限响应：招架成功不清除状态（运行时改为由 K5-6 保留）
    combat.hooks.on<{ target: Unit; request: { type: string; base: number } }>('BeforeDamageReceived', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.target === player && player.state['parry'] === true && p.request.type === 'physical') {
        p.request.base = 0;
        player.state['parried'] = true;
        player.state['parry'] = true; // 不消耗，可无限响应
      }
    });
  },
});

registerKeystone({
  id: 'k5_7_sand_rebirth',
  classId: 'hero_titan_guardian',
  category: 'SpecB',
  name: '大地母脉·沙晶重构',
  desc: '沙晶石上限扩至 10 颗；受到致死伤害时消耗 3 颗沙晶石抵消死亡，进入 1 回合【大地金身（绝对无敌）】。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.resourceCaps['sand_crystal'] = 10;
    combat.hooks.on<{ target: Unit; save: (hp: number) => void }>('OnFatalDamageTaken', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.target === player && combat.getResource(player, 'sand_crystal') >= 3) {
        combat.modifyResource(player, 'sand_crystal', 'Consume', 3);
        p.save(1);
        player.state['goldenBody'] = 1;
      }
    });
  },
});

registerKeystone({
  id: 'k5_8_sand_prison',
  classId: 'hero_titan_guardian',
  category: 'SpecB',
  name: '砂岩囚牢·重力碾碎',
  desc: '【砂岩之握】可抓取全场所有敌人，禁锢 2 回合并剥除全部护甲。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_grd_sandstone_grip', (def) => {
      def.targetType = 'AllEnemies';
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'DealDamage') n.target_selector = 'AllEnemies';
        if (n.action_type === 'ApplyBuff' && n.params?.buff_id === 'stun') n.params.stacks = 2;
        if (n.action_type === 'ClearBlock') n.target_selector = 'AllEnemies';
      });
    });
  },
});

// ============================================================================
// 神射手（K6-1 ~ K6-8）
// ============================================================================

registerKeystone({
  id: 'k6_1_dual_beast',
  classId: 'hero_sharpshooter',
  category: 'Universal',
  name: '双生兽王·万兽奔腾',
  desc: '野狼与战隼可同时出战；野狼每次撕咬必定引动战隼一次协同俯冲。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    player.state['dualBeast'] = true;
    player.state['falcon'] = true; // 战隼常驻
    combat.hooks.on<{ source: Unit | null; target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source && p.source.hasTag('ally') && p.source.name.includes('狼') && p.result.remaining > 0) {
        combat.procDamage(player, p.target, 6, 'true');
      }
    });
  },
});

registerKeystone({
  id: 'k6_2_infinite_string',
  classId: 'hero_sharpshooter',
  category: 'Universal',
  name: '无限光弦·极光天幕',
  desc: '光能重铸激活后整场常驻不退；所有弓箭技能的攻击段数 +2。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    player.state['reforgedPermanent'] = true;
    player.state['stormExtraHits'] = 5; // 3 + 2
    combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.source === player) ev.payload.request.base *= 1.3;
    });
  },
});

registerKeystone({
  id: 'k6_3_wolf_frenzy',
  classId: 'hero_sharpshooter',
  category: 'SpecA',
  name: '狼群狂潮·幻影军团',
  desc: '幻影魔狼无在场数量上限；每打出一张【箭雨】或【暴风箭矢】，立即额外召唤 1 匹幻影魔狼。',
  unlockCost: 120,
  install: (combat) => {
    combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      const id = ev.payload.card.defId;
      if (id === 'card_sht_rain_of_arrows' || id === 'card_sht_storm_arrows') {
        combat.summonAlly({ unitId: 'phantom', name: '幻影魔狼', maxHp: 18, autoAttack: 4, portrait: '🐺', targetLowest: true, lifesteal: 0.3, allowMultiple: true });
      }
    });
  },
});

registerKeystone({
  id: 'k6_4_storm_rage',
  classId: 'hero_sharpshooter',
  category: 'SpecA',
  name: '暴风怒涛·多重速射',
  desc: '重铸态下【暴风箭矢】光矢增至 12 支；全场野狼撕咬攻击力 +100%。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['stormExtraHits'] = 9; // 3 + 9 = 12
    combat.hooks.on<{ source: Unit | null; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source && p.source.hasTag('ally') && p.source.name.includes('狼')) p.request.base *= 2;
    });
  },
});

registerKeystone({
  id: 'k6_5_wolf_symbiote',
  classId: 'hero_sharpshooter',
  category: 'SpecA',
  name: '人狼合一·野性共鸣',
  desc: '野狼受到的伤害 100% 由光能抵扣；野狼造成的撕咬伤害 100% 转化为自身生命吸血。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ source: Unit | null; target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source && p.source.hasTag('ally') && p.source.name.includes('狼') && p.result.remaining > 0) {
        combat.heal(player, p.result.remaining);
      }
    });
  },
});

registerKeystone({
  id: 'k6_6_shadow_snipe',
  classId: 'hero_sharpshooter',
  category: 'SpecB',
  name: '暗影狙击·孤狼死线',
  desc: '放弃所有宠物：本体单体狙击伤害 +150%、射击必定穿透护甲；击杀目标立即返还卡牌费用并摸 1 张牌。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['noPets'] = true;
    player.state['snipeBoost'] = true;
    combat.hooks.on<{ source: unknown; request: { base: number; type: string; singleTarget?: boolean } }>('BeforeDamageCalculated', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && p.request.singleTarget) {
        p.request.base *= 2.5;
        p.request.type = 'true'; // 穿透护甲
      }
    });
    combat.hooks.on<{ source: unknown; victim: unknown }>('OnUnitKilled', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.source === player) {
        combat.modifyEnergy(player, 1);
        combat.drawCards(1);
      }
    });
  },
});

registerKeystone({
  id: 'k6_7_overflow_crit',
  classId: 'hero_sharpshooter',
  category: 'SpecB',
  name: '超限暴击·鹰眼死神',
  desc: '暴击率允许突破 100%；超过 100% 的部分按 1:2 直接转化为暴击伤害倍率。',
  unlockCost: 120,
  install: () => {
    // 引擎已在 dealDamage 处理溢出转化（critChance>1 → critMult + overflow×2）
  },
});

registerKeystone({
  id: 'k6_8_sky_bombardment',
  classId: 'hero_sharpshooter',
  category: 'SpecB',
  name: '天基轰炸·流星神箭',
  desc: '【光能轰炸】由次轮生效改为当回合立即结算；战隼对全场每个存活敌人连续俯冲 2 次。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['falconDive'] = 12;
    player.state['bombNow'] = true;
    combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.card.defId === 'card_sht_radiant_bombardment') {
        for (const e of [...combat.aliveEnemies()]) {
          combat.procDamage(player, e, 12, 'true');
          combat.procDamage(player, e, 12, 'true');
        }
      }
    });
  },
});

// ============================================================================
// 灵魂乐手（K7-1 ~ K7-8）
// ============================================================================

registerKeystone({
  id: 'k7_1_deadly_symphony',
  classId: 'hero_soul_musician',
  category: 'Universal',
  name: '致命交响·声波湮灭',
  desc: '全队满血时受到的所有治疗量，100% 转化为对全场的震荡音波真实伤害。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ target: Unit; amount: number }>('OnHealed', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if ((p.target.isPlayer || p.target.hasTag('ally')) && p.target.hp >= p.target.maxHp && p.amount > 0) {
        for (const e of combat.aliveEnemies()) combat.procDamage(player, e, p.amount, 'true');
      }
    });
  },
});

registerKeystone({
  id: 'k7_2_eternal_encore',
  classId: 'hero_soul_musician',
  category: 'Universal',
  name: '永恒返场·无限安可',
  desc: '【安可】额外生成 1 张 0 费自身复制；单回合可连续复刻乐章 3 次。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.card.defId === 'card_mus_encore') {
        const count = (player.state['encoreCount'] as number | undefined) ?? 0;
        if (count < 2) {
          player.state['encoreCount'] = count + 1;
          combat.generateCard('card_mus_encore', 'hand');
        }
      }
    });
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Keystone, () => {
      player.state['encoreCount'] = 0;
    });
  },
});

registerKeystone({
  id: 'k7_3_absolute_rock',
  classId: 'hero_soul_musician',
  category: 'SpecA',
  name: '绝对摇滚·重金属神',
  desc: '【烈焰狂想】幸运几率锁死为 100%，每次速弹必定追加烈焰真伤。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_mus_flame_rhapsody', (def) => {
      walkTree(def.actionTree, (n) => {
        const c = n.conditions?.[0];
        if (c?.condition_type === 'Chance') c.chance = 1;
      });
    });
  },
});

registerKeystone({
  id: 'k7_4_heroic_tide',
  classId: 'hero_soul_musician',
  category: 'SpecA',
  name: '英勇狂澜·生机虹吸',
  desc: '【英勇乐章】吸血转化率提升至 150%；溢出吸血量按 1:1 转化为全队下一回合暴击率。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['heroicLifesteal'] = 1.5;
    combat.hooks.on<{ target: Unit; amount: number }>('OnHealed', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if ((p.target.isPlayer || p.target.hasTag('ally')) && p.target.hp >= p.target.maxHp) {
        player.state['attackCritBonus'] = ((player.state['attackCritBonus'] as number | undefined) ?? 0) + p.amount / 100;
      }
    });
  },
});

registerKeystone({
  id: 'k7_5_distortion_beat',
  classId: 'hero_soul_musician',
  category: 'SpecA',
  name: '失真重音·灵魂震荡',
  desc: '【增幅节拍】命中时立即引爆目标身上所有燃烧层数，造成 5 倍火伤。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ source: unknown; target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && player.state['lastPlayedCardId'] === 'card_mus_amplified_beat' && p.target !== player) {
        const burn = p.target.getBuffStacks('burn');
        if (burn > 0) {
          p.target.removeBuff('burn');
          combat.procDamage(player, p.target, burn * 5, 'true');
        }
      }
    });
  },
});

registerKeystone({
  id: 'k7_6_stereo_field',
  classId: 'hero_soul_musician',
  category: 'SpecB',
  name: '立体声场·双子低音',
  desc: '在战场左右放置 2 座舞台音箱：所有技能触发 2.4 倍三维共鸣。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['speaker'] = true;
    player.state['speakerMult'] = 2.4;
    // speakerMult 由 actions 读取（覆写默认 1.6）
    combat.hooks.on<{ source: unknown }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      void ev;
      player.state['speaker'] = true;
    });
  },
});

registerKeystone({
  id: 'k7_7_octave_field',
  classId: 'hero_soul_musician',
  category: 'SpecB',
  name: '八音神谱·交响领域',
  desc: '音符谱表扩至 8 槽；凑齐 8 音符满溢时，赋予全队 1 回合全伤害免疫护罩并使全队下一次攻击伤害翻倍。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.resourceCaps['musical_note'] = 8;
    combat.hooks.on<{ resourceId: string; after: number }>('OnResourceChanged', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.resourceId === 'musical_note' && ev.payload.after >= 8) {
        player.state['soundShield'] = true;
        player.state['noteOverdrive'] = true;
      }
    });
    combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && player.state['noteOverdrive'] === true) {
        p.request.base *= 2;
        player.state['noteOverdrive'] = false;
      }
    });
  },
});

registerKeystone({
  id: 'k7_8_tour_mania',
  classId: 'hero_soul_musician',
  category: 'SpecB',
  name: '狂热巡演·热情浪潮',
  desc: '【热情挥洒】使全队能量 +3；音箱共鸣波纹命中敌人时附带 1 回合声波震慑。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['passionEnergy'] = 3;
    patchDef(combat, 'card_mus_passionate_flourish', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'ModifyEnergy' && n.params) n.params.amount = 3;
      });
    });
    combat.hooks.on<{ source: unknown; target: Unit }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && p.target !== player && player.state['passion'] === true) {
        combat.applyBuff(p.target, 'stun', 1);
      }
    });
  },
});

// ============================================================================
// 青岚骑士（K8-1 ~ K8-8）
// ============================================================================

registerKeystone({
  id: 'k8_1_infinite_hover',
  classId: 'hero_gale_knight',
  category: 'Universal',
  name: '无限滞空·天穹龙骑',
  desc: '打出【刹那】或【翔返】后永久滞空不落地：免疫敌方地面近战攻击，攻击牌自动化为天基投矛（远程）。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    player.state['hoverPermanent'] = true;
    combat.hooks.on<{ target: Unit; request: { type: string; defenderMults: number[] } }>('BeforeDamageReceived', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.target === player && player.state['aerial'] === true && p.request.type === 'physical') {
        p.request.defenderMults.push(0);
      }
    });
    combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      const id = ev.payload.card.defId;
      if (id === 'card_knt_setsuna' || id === 'card_knt_vaulting_leap') player.state['aerial'] = true;
    });
    combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Keystone, () => {
      if (player.state['hoverPermanent'] === true) player.state['aerial'] = true;
    });
  },
});

registerKeystone({
  id: 'k8_2_peerless_start',
  classId: 'hero_gale_knight',
  category: 'Universal',
  name: '风姿极境·不动如风',
  desc: '战斗开始时自动常驻激活【风姿卓绝】：全程不占费用与手牌。',
  unlockCost: 100,
  install: (combat) => {
    combat.player.state['peerless'] = true;
  },
});

registerKeystone({
  id: 'k8_3_courage_machine',
  classId: 'hero_gale_knight',
  category: 'SpecA',
  name: '勇气永动机·极速重装',
  desc: '刷新【螺旋击刺】所需勇气消耗降至 15 点；单回合可连续打出 4 次。',
  unlockCost: 120,
  install: (combat) => {
    combat.player.state['spiralCost'] = 15;
    patchDef(combat, 'card_knt_spiral_thrust', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'ModifyResource' && n.params?.resource_id === 'courage' && n.params.operation === 'Consume') {
          n.params.amount = 15;
        }
      });
    });
  },
});

registerKeystone({
  id: 'k8_4_spiral_crit',
  classId: 'hero_gale_knight',
  category: 'SpecA',
  name: '极意风钻·重装破甲',
  desc: '【螺旋击刺】暴击率提升至 100%；每次命中剥除目标 10 点护甲并使其易伤。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['spiralCrit'] = true;
    combat.hooks.on<{ card: { defId: string }; target: Unit | null }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.card.defId === 'card_knt_spiral_thrust' && ev.payload.target) {
        player.state['attackCritBonus'] = 1;
        const t = ev.payload.target;
        combat.clearBlock(t);
        combat.applyBuff(t, 'vulnerable', 1);
      }
    });
  },
});

registerKeystone({
  id: 'k8_5_execution_line',
  classId: 'hero_gale_knight',
  category: 'SpecA',
  name: '破追死线·处决追击',
  desc: '【破追】可对任意目标打出；目标生命低于 40% 时伤害提升 300%。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ source: unknown; target: Unit; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && player.state['lastPlayedCardId'] === 'card_knt_break_pursuit' && p.target.hp / p.target.maxHp < 0.4) {
        p.request.base *= 4;
      }
    });
  },
});

registerKeystone({
  id: 'k8_6_keen_blade',
  classId: 'hero_gale_knight',
  category: 'SpecB',
  name: '极致风刃·千层锐利',
  desc: '锐利层数解除上限（可叠至 50 层）；每层提供的穿刺增伤提升至 15%，且命中根据锐利层数反哺护甲。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.state['sharpMult'] = 0.15;
    player.state['sharpNoDecay'] = true;
    combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player) {
        const s = player.getBuffStacks('sharpness');
        if (s > 0) p.request.base *= 1 + 0.15 * s;
      }
    });
    combat.hooks.on('OnRoundEnd', HOOK_PRIORITY.Keystone, () => {
      // 锐利不衰减
    });
  },
});

registerKeystone({
  id: 'k8_7_wind_afterimage',
  classId: 'hero_gale_knight',
  category: 'SpecB',
  name: '破风连环·残影突进',
  desc: '任何长枪突刺攻击都会留下风影残影：立即以 80% 伤害对相同目标二次追击。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ source: unknown; target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Keystone, (ev) => {
      const p = ev.payload;
      if (p.source === player && p.target !== player && p.result.remaining > 0) {
        combat.procDamage(player, p.target, Math.round(p.result.remaining * 0.8), 'physical');
      }
    });
  },
});

registerKeystone({
  id: 'k8_8_setsuna_flow',
  classId: 'hero_gale_knight',
  category: 'SpecB',
  name: '流转瞬杀·刹那狂澜',
  desc: '【刹那】命中后返还的勇气提升至 50 点，并额外抽 2 张牌，实现无限空地连击。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Keystone, (ev) => {
      if (ev.payload.card.defId === 'card_knt_setsuna') {
        combat.modifyResource(player, 'courage', 'Add', 20);
        combat.drawCards(2);
      }
    });
  },
});

// ============================================================================
// 雷影剑士（K2-1 ~ K2-8）
// ============================================================================

registerKeystone({
  id: 'k2_1_dual_form',
  classId: 'hero_thunderblade',
  category: 'Universal',
  name: '无形雷域·双刃同谐',
  desc: '双形态融合：同时常驻长刀的 +2 单体锋锐与镰刀的 40% 全屏顺劈溅射。',
  unlockCost: 100,
  install: (combat) => {
    combat.player.state['dualForm'] = true;
  },
});

registerKeystone({
  id: 'k2_2_body_of_thunder',
  classId: 'hero_thunderblade',
  category: 'Universal',
  name: '以身化电·雷霆受生',
  desc: '护甲上限锁死为 0；每失去 4 点生命立即生成 1 枚雷之印，并向全场释放反震雷暴（8 点雷电真伤）。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    player.state['noBlock'] = true;
    on(combat, 'OnPlayerTurnStart', () => { player.block = 0; });
    on<{ target: Unit; result: { remaining: number } }>(combat, 'AfterDamageDealt', (ev) => {
      const p = ev.payload;
      if (p.target === player && p.result.remaining > 0) {
        const seals = Math.floor(p.result.remaining / 4);
        if (seals > 0) combat.modifyResource(player, 'thunder_seal', 'Add', seals);
        for (const e of enemiesOf(combat)) {
          combat.procDamage(player, e, 8, 'true');
        }
      }
    });
  },
});

registerKeystone({
  id: 'k2_3_auto_iai',
  classId: 'hero_thunderblade',
  category: 'SpecA',
  name: '神速拔刀·极意居合',
  desc: '居合斩无需在手：满 5 印时自动从抽牌堆/弃牌堆瞬发回收至手牌，且本回合 0 费。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    on(combat, 'OnPlayerTurnStart', () => {
      if (combat.getResource(player, 'thunder_seal') >= 5) {
        combat.fetchFromPile('card_tb_iai_slash', 'draw', 0) ||
        combat.fetchFromPile('card_tb_iai_slash', 'discard', 0);
      }
    });
  },
});

registerKeystone({
  id: 'k2_4_overload',
  classId: 'hero_thunderblade',
  category: 'SpecA',
  name: '极限过载·瞬步无间',
  desc: '雷之印上限扩至 10 枚；单回合能量耗尽时立即补满 10 印并抽 2 张牌。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    player.resourceCaps['thunder_seal'] = 10;
    let triggered = false;
    on(combat, 'OnPlayerTurnStart', () => { triggered = false; });
    on(combat, 'OnCardPlayed', () => {
      if (!triggered && combat.energy === 0) {
        triggered = true;
        combat.modifyResource(player, 'thunder_seal', 'Set', 10);
        combat.drawCards(2);
      }
    });
  },
});

registerKeystone({
  id: 'k2_5_issen_true',
  classId: 'hero_thunderblade',
  category: 'SpecA',
  name: '天雷一闪·断罪绝尘',
  desc: '【一闪】命中敌人必定返还 2 枚雷之印（无需击杀）。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    on<{ card: { defId: string } }>(combat, 'OnCardPlayed', (ev) => {
      if (ev.payload.card.defId === 'card_tb_issen') {
        combat.modifyResource(player, 'thunder_seal', 'Add', 2);
      }
    });
  },
});

registerKeystone({
  id: 'k2_6_moon_frenzy',
  classId: 'hero_thunderblade',
  category: 'SpecB',
  name: '万剑归宗·月影狂潮',
  desc: '月刃追击次数提升至 4 段：每打出一张攻击牌，月刃连续协同斩击 4 次。',
  unlockCost: 120,
  install: (combat) => {
    combat.player.state['moonbladeHits'] = 4;
  },
});

registerKeystone({
  id: 'k2_7_combo_storm',
  classId: 'hero_thunderblade',
  category: 'SpecB',
  name: '连斩风暴·无限飞刃',
  desc: '由【霹雳连斩】生成的【0费·连斩】移除消耗词条，进入洗牌循环形成无限飞刃。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_slash_combo', (def) => {
      def.exhaust = false;
    });
  },
});

registerKeystone({
  id: 'k2_8_thunder_burst',
  classId: 'hero_thunderblade',
  category: 'SpecB',
  name: '千雷轰顶·雷鸣结界',
  desc: '【千雷闪影之意】的附加雷电伤害由 2 提升至 5 点；感电层数上限解锁至 99。',
  unlockCost: 120,
  install: (combat) => {
    combat.player.state['flashDamage'] = 5;
  },
});

// ============================================================================
// 神盾骑士（K9-1 ~ K9-8）
// ============================================================================

registerKeystone({
  id: 'k9_1_titan',
  classId: 'hero_aegis_knight',
  category: 'Universal',
  name: '光铸泰坦·血肉长城',
  desc: '每场战斗最大生命上限 +10；光铸身躯的伤害吸收率提升至 75%。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    player.maxHp += 10;
    player.hp = Math.min(player.maxHp, player.hp + 10);
    player.state['lightforgedRatio'] = 0.75;
  },
});

registerKeystone({
  id: 'k9_2_thorn_shield',
  classId: 'hero_aegis_knight',
  category: 'Universal',
  name: '反弹结界·荆棘圣盾',
  desc: '光铸身躯每吸收 1 点伤害，立即以 100% 比例向攻击者反弹神圣真实伤害。',
  unlockCost: 100,
  install: (combat) => {
    const player = combat.player;
    on<{ source: Unit; target: Unit; result: { absorbedByRatio: number } }>(combat, 'AfterDamageDealt', (ev) => {
      const p = ev.payload;
      if (p.target === player && p.result.absorbedByRatio > 0 && p.source && p.source !== player) {
        combat.procDamage(player, p.source, Math.round(p.result.absorbedByRatio), 'true');
      }
    });
  },
});

registerKeystone({
  id: 'k9_3_free_judgement',
  classId: 'hero_aegis_knight',
  category: 'SpecA',
  name: '极刑裁决·圣光逆流',
  desc: '【裁决】不再消耗圣令且费用为 0；生命恢复比例提升至已损生命的 60%。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_pal_judgement', (def) => {
      def.baseCost = 0;
      def.requires = undefined;
      def.description = def.description.replace('40%', '60%');
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'Heal' && n.params) {
          const s = (n.params.scaling as Array<{ attribute?: string; multiplier?: number }> | undefined);
          const lost = s?.find((x) => x.attribute === 'LostHp');
          if (lost) lost.multiplier = 0.6;
        }
      });
    });
  },
});

registerKeystone({
  id: 'k9_4_shield_toss_8',
  classId: 'hero_aegis_knight',
  category: 'SpecA',
  name: '神圣飞盾·无限连弹',
  desc: '【投掷盾牌】弹射次数由 3 次提升至 8 次。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_pal_shield_toss', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'Repeat' && n.params) n.params.count = 8;
      });
    });
  },
});

registerKeystone({
  id: 'k9_5_reckoning_150',
  classId: 'hero_aegis_knight',
  category: 'SpecA',
  name: '清算风暴·审判天平',
  desc: '【清算】的伤害转化率由 60% 提升至 150%。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_pal_reckoning', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'DealDamage' && n.params) {
          const s = (n.params.scaling as Array<{ attribute?: string; multiplier?: number }> | undefined);
          const abs = s?.find((x) => x.attribute === 'AbsorbedTotal');
          if (abs) abs.multiplier = 1.5;
        }
      });
    });
  },
});

registerKeystone({
  id: 'k9_6_barrier_sword',
  classId: 'hero_aegis_knight',
  category: 'SpecB',
  name: '无畏先锋·屏障永续',
  desc: '光铸屏障永不清零（已默认保留）；屏障 ≥ 100 时【圣剑】伤害 ×5。',
  unlockCost: 120,
  install: (combat) => {
    const player = combat.player;
    on<{ request: { base: number; singleTarget?: boolean }; target: Unit }>(combat, 'BeforeDamageCalculated', (ev) => {
      const p = ev.payload;
      const lastCard = player.state['lastPlayedCardId'] as string | undefined;
      if (p.target !== player && lastCard === 'card_pal_blade_of_light' && player.barrier >= 100) {
        p.request.base *= 5;
      }
    });
  },
});

registerKeystone({
  id: 'k9_7_holy_frenzy',
  classId: 'hero_aegis_knight',
  category: 'SpecB',
  name: '无限圣令·神圣狂热',
  desc: '圣令上限提升至 10 枚。',
  unlockCost: 120,
  install: (combat) => {
    combat.player.resourceCaps['holy_order'] = 10;
  },
});

registerKeystone({
  id: 'k9_8_sword_aoe',
  classId: 'hero_aegis_knight',
  category: 'SpecB',
  name: '圣剑降世·极光十字',
  desc: '【圣剑】由单体变为全屏十字圣光斩；伤害按最大生命 1:1 叠加。',
  unlockCost: 120,
  install: (combat) => {
    patchDef(combat, 'card_pal_blade_of_light', (def) => {
      walkTree(def.actionTree, (n) => {
        if (n.action_type === 'DealDamage' && n.params) {
          n.target_selector = 'AllEnemies';
          const s = (n.params.scaling as Array<{ attribute?: string; divisor?: number; multiplier?: number }> | undefined);
          const max = s?.find((x) => x.attribute === 'MaxHp');
          if (max) {
            max.divisor = 1;
            max.multiplier = 1;
          }
        }
      });
    });
  },
});
