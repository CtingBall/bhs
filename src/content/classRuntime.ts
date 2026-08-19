// ============================================================================
// 职业运行时（Class Runtime）
// 雷影剑士 / 神盾骑士 的专属机制全部以「监听 Hook 总线」的方式挂载到战斗，
// 保持 Combat 引擎完全职业无关。
// ============================================================================

import type { Combat } from '../core/combat';
import { HOOK_PRIORITY } from '../core/hooks';
import type { CardInstance } from '../core/cards';
import { getCardDef } from '../core/cards';
import type { Unit } from '../core/units';

export const CLASS_IDS = {
  THUNDERBLADE: 'hero_thunderblade',
  AEGIS_KNIGHT: 'hero_aegis_knight',
  SYLVANGUARD: 'hero_sylvanguard',
  FROST_MAGE: 'hero_frost_mage',
  FLAME_BERSERKER: 'hero_flame_berserker',
  TITAN_GUARDIAN: 'hero_titan_guardian',
  SHARPSHOOTER: 'hero_sharpshooter',
  SOUL_MUSICIAN: 'hero_soul_musician',
  GALE_KNIGHT: 'hero_gale_knight',
} as const;

/** 在战斗开始前为玩家职业安装专属运行时 */
export function installClassRuntime(combat: Combat, classId: string): void {
  switch (classId) {
    case CLASS_IDS.THUNDERBLADE:
      installThunderblade(combat);
      break;
    case CLASS_IDS.AEGIS_KNIGHT:
      installAegisKnight(combat);
      break;
    case CLASS_IDS.SYLVANGUARD:
      installSylvanguard(combat);
      break;
    case CLASS_IDS.FROST_MAGE:
      installFrostMage(combat);
      break;
    case CLASS_IDS.FLAME_BERSERKER:
      installFlameBerserker(combat);
      break;
    case CLASS_IDS.TITAN_GUARDIAN:
      installTitanGuardian(combat);
      break;
    case CLASS_IDS.SHARPSHOOTER:
      installSharpshooter(combat);
      break;
    case CLASS_IDS.SOUL_MUSICIAN:
      installSoulMusician(combat);
      break;
    case CLASS_IDS.GALE_KNIGHT:
      installGaleKnight(combat);
      break;
    default:
      throw new Error(`未实现的职业运行时: ${classId}`);
  }
}

// ============================================================================
// 森语者：自然之种 / 灌注 / 再生脉冲 / 五阶生机光环 / 种子再生
// ============================================================================

function installSylvanguard(combat: Combat): void {
  const player = combat.player;
  player.resourceCaps['seed'] = 99;
  // 营地祭仪【古树深根祈愿】：开局预装 15 颗种子
  const campSeeds = player.state['campSeeds'] as number | undefined;
  if (campSeeds) player.resources['seed'] = campSeeds;

  const tierOf = (): number => {
    const seeds = combat.getResource(player, 'seed');
    if (seeds >= 63) return 5;
    if (seeds >= 31) return 4;
    if (seeds >= 15) return 3;
    if (seeds >= 7) return 2;
    if (seeds >= 3) return 1;
    return 0;
  };

  // 自然灌注：下一张攻击牌伤害翻倍 + 再生脉冲（40% 回血）
  let infusedAttack = false;
  combat.hooks.on<{ source: unknown; target: Unit; request: { base: number } }>(
    'BeforeDamageCalculated', HOOK_PRIORITY.Power, (ev) => {
      const p = ev.payload;
      if (p.source === player && player.state['infusion'] === true) {
        const lastCard = player.state['lastPlayedCardId'] as string | undefined;
        if (lastCard && getCardDef(lastCard).cardType === 'Attack') {
          // K1-5 血色绽放：灌注倍率 3.5
          const mult = (player.state['infusionMultiplier'] as number | undefined) ?? 2;
          p.request.base *= mult;
          player.state['infusion'] = false;
          infusedAttack = true;
          player.state['infusedAttackJust'] = true;
        }
      }
    },
  );
  combat.hooks.on<{ source: unknown; result: { remaining: number } }>(
    'AfterDamageDealt', HOOK_PRIORITY.Power, (ev) => {
      const p = ev.payload;
      if (p.source === player && infusedAttack && p.result.remaining > 0) {
        infusedAttack = false;
        player.state['infusedAttackJust'] = false;
        // K1-4 生机共振：回血比例 50%；K1-5 血色绽放：转为护甲
        const ratio = player.state['pulseEnhanced'] === true ? 0.5 : 0.4;
        const amount = Math.round(p.result.remaining * ratio);
        if (player.state['infusionToBlock'] === true) {
          combat.gainBlock(player, amount);
        } else {
          combat.heal(player, amount);
        }
      }
    },
  );

  // 五阶生机光环
  const playerSide = (u: Unit): boolean => u.isPlayer || u.hasTag('ally');
  combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Power, () => {
    const tier = tierOf();
    player.state['auraTier'] = tier;
    // 一阶：全队回合开始回复 2 点生命
    if (tier >= 1) {
      for (const u of combat.allUnits()) {
        if (playerSide(u) && u.isAlive()) combat.heal(u, 2);
      }
    }
    // 三阶：回合开始自产 2 颗种子；四阶：自产 5 颗
    if (tier >= 3) combat.modifyResource(player, 'seed', 'Add', 2);
    if (tier >= 4) combat.modifyResource(player, 'seed', 'Add', 5);
    // 森林之怒：每回合播种
    const regen = player.state['seedRegen'] as number | undefined;
    if (regen) combat.modifyResource(player, 'seed', 'Add', regen);
  });
  combat.hooks.on<{ target: Unit; request: { type: string; reduction: number; defenderMults: number[] } }>(
    'BeforeDamageReceived', HOOK_PRIORITY.Power, (ev) => {
      const p = ev.payload;
      if (!playerSide(p.target) || p.request.type === 'true') return;
      const tier = tierOf();
      if (tier >= 1) p.request.reduction += 1;
      if (tier >= 2) p.request.defenderMults.push(0.85);
      if (tier >= 3) p.request.defenderMults.push(0.7 / 0.85); // 累计 -30%
      if (tier >= 4) p.request.defenderMults.push(0.5 / 0.7); // 累计 -50%
    },
  );
  // 四阶：友军受治疗时对随机敌人追击
  combat.hooks.on<{ target: Unit; amount: number }>('OnHealed', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (tierOf() >= 4 && p.target !== player && p.target.hasTag('ally') && p.amount > 0) {
      const enemies = combat.aliveEnemies();
      if (enemies.length > 0) combat.procDamage(player, combat.rngCombat.pick(enemies), 3, 'true');
    }
    // 五阶：全队治疗量 100% 转化为对敌方全场的真实神圣伤害
    if (tierOf() >= 5 && p.amount > 0) {
      for (const e of combat.aliveEnemies()) {
        combat.procDamage(player, e, p.amount, 'true');
      }
    }
  });
  // 五阶：友军免死（锁 1 血并回满）
  combat.hooks.on<{ target: Unit; save: (hp: number) => void }>('OnFatalDamageTaken', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (tierOf() >= 5 && p.target.hasTag('ally')) {
      p.save(p.target.maxHp);
    }
  });
}

// ============================================================================
// 冰魔导师：玄冰 / 吟唱瞬发 / 寒冰灌注 / 暴风雪 / 水龙卷
// ============================================================================

function installFrostMage(combat: Combat): void {
  const player = combat.player;
  player.resourceCaps['frost_shard'] = 4;
  player.resourceCaps['frost_energy'] = 100;
  // 营地祭仪【凝霜冥想】：开局满额 4 颗玄冰
  if (player.state['campShards']) player.resources['frost_shard'] = player.state['campShards'] as number;

  // 费用修正：有玄冰或寒冰灌注时，冰霜之矛减 1 费
  combat.costModifier = (card): number => {
    if (card.defId === 'card_mage_frost_spear') {
      const shards = combat.getResource(player, 'frost_shard');
      const infusion = (player.state['frostInfusion'] as number | undefined) ?? 0;
      if (shards >= 1 || infusion > 0) return -1;
    }
    return 0;
  };

  // 寒冰灌注：冰矛无玄冰时也瞬发 16 伤（替换吟唱）
  combat.hooks.on<{ card: { defId: string }; target: Unit | null }>('OnCardPlayed', HOOK_PRIORITY.Power, (ev) => {
    if (ev.payload.card.defId === 'card_mage_frost_spear') {
      const infusion = (player.state['frostInfusion'] as number | undefined) ?? 0;
      const chantSet = (player.state['chantDamage'] as number | undefined) ?? 0;
      if (infusion > 0 && chantSet > 0 && ev.payload.target) {
        player.state['chantDamage'] = 0; // 取消吟唱
        combat.dealDamage(player, ev.payload.target, { base: 16, type: 'physical', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1, singleTarget: true });
        if (combat.rngCombat.chance(0.35)) {
          for (const e of combat.aliveEnemies()) combat.dealDamage(player, e, { base: 4, type: 'magic', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 });
        }
      }
    }
  });

  // 回合开始：吟唱结算 / 灌注计时 / 寒冰能量自然补充预留
  combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Power, () => {
    // 吟唱结算（延迟 1 回合生效的冰矛）
    const chant = player.state['chantDamage'] as number | undefined;
    if (chant) {
      player.state['chantDamage'] = 0;
      const targets = combat.aliveEnemies();
      if (targets.length > 0) {
        combat.dealDamage(player, targets[0], { base: chant, type: 'physical', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1, singleTarget: true });
      }
    }
    // 寒冰灌注倒计时
    const infusion = (player.state['frostInfusion'] as number | undefined) ?? 0;
    if (infusion > 0) player.state['frostInfusion'] = infusion - 1;
    // 冰盾失效
    player.state['frostShield'] = false;
  });

  // 寒冰护盾：受击使攻击者虚弱
  combat.hooks.on<{ target: Unit; source: Unit }>('AfterDamageDealt', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.target === player && p.source && p.source !== player && player.state['frostShield'] === true) {
      combat.applyBuff(p.source, 'weak', 1);
    }
  });

  // 寒冰风暴：回合结束全场冰霜伤害 + 虚弱
  combat.hooks.on('OnRoundEnd', HOOK_PRIORITY.Power, () => {
    if (player.state['blizzard'] === true) {
      const dmg = (player.state['blizzardDmg'] as number | undefined) ?? 5;
      for (const e of combat.aliveEnemies()) {
        combat.dealDamage(player, e, { base: dmg, type: 'magic', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 });
        combat.applyBuff(e, 'weak', 1);
      }
    }
    // 水龙卷维持：每回合消耗 15 寒冰能量，不足则消散
    for (const ally of [...combat.allies]) {
      const upkeep = ally.state['energyCost'] as number | undefined;
      if (upkeep) {
        const energy = combat.getResource(player, 'frost_energy');
        if (energy >= upkeep) {
          combat.modifyResource(player, 'frost_energy', 'Consume', upkeep);
        } else {
          combat.removeAlly(ally);
          combat.logText(`${ally.name} 因能量不足消散了`);
        }
      }
    }
  });
}

// ============================================================================
// 赤炎狂战士：双斧顺劈 / 无相等级交替 / 赤红魂槽 / 燃烧引爆 / 炎魔形态
// ============================================================================

function installFlameBerserker(combat: Combat): void {
  const player = combat.player;
  player.resourceCaps['crimson_soul'] = 100;
  player.state['cleave'] = 0.3;
  let prevFormless = 'none';

  // 营地祭仪【沸血战痕烙印】：失去 10 血，开局炎魔形态 3 回合
  if (player.state['campFiendTurns']) {
    combat.loseHpSelf(10);
    player.state['soulFiend'] = true;
    player.state['fiendTurns'] = player.state['campFiendTurns'] as number;
  }

  // ---- 无相等级 ----
  const getRank = (): number => (player.state['formlessRank'] as number | undefined) ?? 0;
  const setRank = (r: number): void => { player.state['formlessRank'] = Math.max(0, Math.min(5, r)); };

  combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Power, (ev) => {
    const def = getCardDef(ev.payload.card.defId);
    const isAscension = def.id === 'card_ber_blazing_ascension';
    const isFormless = def.tags.includes('Formless');
    // Lv5 极境结算后归零
    if (getRank() === 5) {
      setRank(player.state['keystoneFormless5'] === true ? 3 : 0);
    }
    // 交替连携：炽烈升腾 ↔ 专精技能
    if (isFormless) {
      if ((isAscension && prevFormless === 'non-ascension') || (!isAscension && prevFormless === 'ascension')) {
        const next = getRank() + 1;
        setRank(next);
        if (next === 3) combat.drawCards(1); // Lv3 升级瞬间抽 1
      }
      prevFormless = isAscension ? 'ascension' : 'non-ascension';
    }
    // 点燃之刃：攻击牌附带燃烧
    if (def.cardType === 'Attack' && player.state['igniteBlade']) {
      const t = combat.aliveEnemies()[0];
      if (t) combat.applyBuff(t, 'burn', player.state['igniteBlade'] as number);
      player.state['igniteBlade'] = 0;
    }
  });

  // 无相等级增伤 + 极境一击
  combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source !== player) return;
    const rank = getRank();
    if (rank > 0) p.request.base *= 1 + 0.15 * rank;
    if (rank === 5) p.request.base *= 1.8; // 极境一击 +80%
    // 魂槽被动：每 20 点攻击 +10%
    const soul = combat.getResource(player, 'crimson_soul');
    if (soul >= 20) p.request.base *= 1 + Math.floor(soul / 20) * 0.1;
  });

  // 无相火斩：攻击命中 40%（Lv5 100%）追加 等级×5 火焰伤害 + 燃烧
  combat.hooks.on<{ source: unknown; target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    const lastCard = player.state['lastPlayedCardId'] as string | undefined;
    const isAttackCard = lastCard ? getCardDef(lastCard).cardType === 'Attack' : false;
    if (p.source === player && isAttackCard && p.result.remaining > 0 && p.target !== player) {
      const rank = getRank();
      if (rank > 0 && combat.rngCombat.chance(rank >= 5 ? 1 : 0.4)) {
        const slashDmg = Math.round(rank * (player.state['formlessSlashMult'] as number | undefined ?? 5));
        combat.procDamage(player, p.target, slashDmg, 'magic');
        const burnStacks = rank >= 5 ? 5 : rank >= 4 ? 3 : 1;
        combat.applyBuff(p.target, 'burn', burnStacks);
      }
      // 魂槽被动吸血：每 20 点吸血 +5%
      const soul = combat.getResource(player, 'crimson_soul');
      if (soul >= 20) {
        combat.heal(player, Math.round(p.result.remaining * 0.05 * Math.floor(soul / 20)));
      }
    }
  });

  // ---- 赤红魂槽积累（ΔHP）----
  const catalystMult = (): number => {
    const c = (player.state['soulCatalyst'] as number | undefined) ?? 0;
    return c > 0 ? 2 : 1;
  };
  combat.hooks.on<{ source: unknown; target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.target === player && p.result.remaining > 0) {
      const ratio = p.source === player ? 3 : 2; // 自残 3 / 受击 2
      combat.modifyResource(player, 'crimson_soul', 'Add', Math.round(p.result.remaining * ratio * catalystMult()));
      // 怒气格挡破盾
      if (player.state['rageGuard'] === true && player.block === 0) {
        combat.modifyResource(player, 'crimson_soul', 'Add', 5);
        player.state['rageGuard'] = false;
      }
    }
  });
  combat.hooks.on<{ target: Unit; amount: number }>('OnHealed', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.target === player && p.amount > 0) {
      combat.modifyResource(player, 'crimson_soul', 'Add', Math.round(p.amount * catalystMult()));
    }
  });

  // ---- 荒川零费 / 催化剂倒计时 / 炎魔计时 ----
  combat.hooks.on<{ card: { tempCostOverride: number | null } }>('OnCardDrawn', HOOK_PRIORITY.Power, (ev) => {
    if (player.state['zeroCostDrawn'] === true) ev.payload.card.tempCostOverride = 0;
  });
  combat.hooks.on('OnPlayerTurnEnd', HOOK_PRIORITY.Power, () => {
    player.state['zeroCostDrawn'] = false;
  });
  combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Power, () => {
    const c = (player.state['soulCatalyst'] as number | undefined) ?? 0;
    if (c > 0) player.state['soulCatalyst'] = c - 1;
    const ft = (player.state['fiendTurns'] as number | undefined) ?? 0;
    if (ft > 1) player.state['fiendTurns'] = ft - 1;
    else if (ft === 1) {
      player.state['fiendTurns'] = 0;
      player.state['soulFiend'] = false;
    }
  });

  // ---- 无尽之炎魔：魂槽满额炼狱冲击 + 免死 ----
  combat.hooks.on<{ resourceId: string; after: number }>('OnResourceChanged', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.resourceId === 'crimson_soul' && p.after >= 100 && player.state['flameFiend'] === true) {
      for (const e of combat.aliveEnemies()) combat.procDamage(player, e, 20, 'true');
      player.state['undying'] = true;
    }
  });
  combat.hooks.on<{ target: Unit; save: (hp: number) => void }>('OnFatalDamageTaken', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.target === player && player.state['undying'] === true) {
      player.state['undying'] = false;
      p.save(1);
    }
  });
}

// ============================================================================
// 巨刃守护者：怒气 / 沙晶石 / 岩盾转伤 / 格挡招架 / 壁垒
// ============================================================================

function installTitanGuardian(combat: Combat): void {
  const player = combat.player;
  player.resourceCaps['rage'] = 100;
  player.resourceCaps['sand_crystal'] = 5;
  // 营地祭仪【重装砂岩加固】：30 护盾 + 3 沙晶
  if (player.state['campBlock']) player.block = player.state['campBlock'] as number;
  if (player.state['campSand']) combat.modifyResource(player, 'sand_crystal', 'Add', player.state['campSand'] as number);

  // 怒气回合结束衰减 20%
  combat.hooks.on('OnRoundEnd', HOOK_PRIORITY.Power, () => {
    const rageNow = combat.getResource(player, 'rage');
    if (rageNow > 0) combat.modifyResource(player, 'rage', 'Set', Math.floor(rageNow * 0.8));
  });

  // 岩怒之击：借力打力（本回合减免量转伤害）
  combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source === player && player.state['lastPlayedCardId'] === 'card_grd_rock_rage_strike') {
      const mitigated = (player.state['mitigatedThisTurn'] as number | undefined) ?? 0;
      const mult = (player.state['rockRageMult'] as number | undefined) ?? 1;
      p.request.base += Math.round(mitigated * mult);
    }
    // 巨岩躯体：持有护盾增伤 35%
    if (p.source === player && player.state['colossus'] === true && player.block > 0) {
      p.request.base *= 1.35;
    }
  });

  // 格挡冲击：招架抵消物理攻击并反震
  let parryOriginalBase = 0;
  combat.hooks.on<{ target: Unit; request: { type: string; base: number; defenderMults: number[] } }>('BeforeDamageReceived', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.target === player && player.state['parry'] === true && p.request.type === 'physical') {
      parryOriginalBase = p.request.base;
      p.request.base = 0; // 完全抵消
      player.state['parry'] = false;
      player.state['parried'] = true;
    }
    // 勇者壁垒：物理减伤 50%
    const bulwark = (player.state['bulwark'] as number | undefined) ?? 0;
    if (p.target === player && bulwark > 0 && p.request.type === 'physical') {
      p.request.defenderMults.push(0.5);
    }
  });
  combat.hooks.on<{ source: Unit | null; target: Unit; result: { remaining: number }; request: { type: string } }>(
    'AfterDamageDealt', HOOK_PRIORITY.Power, (ev) => {
      const p = ev.payload;
      if (p.target === player && player.state['parried'] === true && p.source && p.source !== player) {
        player.state['parried'] = false;
        const reflect = player.state['parryReflectFull'] === true ? Math.max(1, Math.round(parryOriginalBase)) : 14;
        combat.procDamage(player, p.source, reflect, 'true');
      }
      // 勇者壁垒受击收益
      const bulwark = (player.state['bulwark'] as number | undefined) ?? 0;
      if (p.target === player && bulwark > 0 && p.request.type === 'physical') {
        combat.modifyResource(player, 'sand_crystal', 'Add', 1);
        combat.modifyResource(player, 'rage', 'Add', 10);
      }
    },
  );

  // 壁垒/金身计时
  combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Power, () => {
    const b = (player.state['bulwark'] as number | undefined) ?? 0;
    if (b > 0) player.state['bulwark'] = b - 1;
    const g = (player.state['goldenBody'] as number | undefined) ?? 0;
    if (g > 0) player.state['goldenBody'] = g - 1;
    player.state['parry'] = false;
  });
  // 大地金身：绝对无敌
  combat.hooks.on<{ target: Unit; request: { defenderMults: number[] } }>('BeforeDamageReceived', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.target === player && ((player.state['goldenBody'] as number | undefined) ?? 0) > 0) {
      p.request.defenderMults.push(0);
    }
  });
}

// ============================================================================
// 神射手：光能重铸 / 暴击体系 / 野狼战隼伙伴 / 嗜血
// ============================================================================

function installSharpshooter(combat: Combat): void {
  const player = combat.player;
  player.resourceCaps['light_energy'] = 100;
  // 营地祭仪【鹰眼校准与喂食】：伙伴伤害翻倍
  if (player.state['campCompanionBoost']) {
    player.state['companionBoost'] = true;
  }

  const isReforged = (): boolean => {
    if (player.state['reforgedPermanent'] === true) return true;
    return combat.getResource(player, 'light_energy') >= 50;
  };

  // 光能重铸状态同步 + 回合末衰减 15
  combat.hooks.on<{ resourceId: string }>('OnResourceChanged', HOOK_PRIORITY.Power, (ev) => {
    if (ev.payload.resourceId === 'light_energy') player.state['reforged'] = isReforged();
  });
  combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Power, () => {
    player.state['reforged'] = isReforged();
  });
  combat.hooks.on('OnRoundEnd', HOOK_PRIORITY.Power, () => {
    if (player.state['reforgedPermanent'] !== true) {
      combat.modifyResource(player, 'light_energy', 'Add', -15);
    }
  });

  // 重铸态：箭矢伤害 +30%
  combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source === player && isReforged()) p.request.base *= 1.3;
  });

  // 聚能射击：暴击伤害 200%
  combat.hooks.on<{ source: unknown }>('BeforeDamageCalculated', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source === player && player.state['snipeCrit'] === true) {
      player.state['critMult'] = 2;
      player.state['snipeCrit'] = false;
    } else {
      player.state['critMult'] = 1.5;
    }
  });

  // 暴风箭矢：重铸态额外段数 + 激励野狼
  combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Power, (ev) => {
    const id = ev.payload.card.defId;
    if (id === 'card_sht_storm_arrows' && isReforged()) {
      const extra = (player.state['stormExtraHits'] as number | undefined) ?? 3;
      for (let i = 0; i < extra; i++) {
        const targets = combat.aliveEnemies();
        if (targets.length === 0) break;
        combat.procDamage(player, combat.rngCombat.pick(targets), 4, 'physical');
      }
      // 激励在场野狼撕咬
      for (const ally of combat.allies) {
        if (ally.isAlive() && ally.name.includes('狼')) {
          const bite = Math.round((ally.state['autoAttack'] as number) * (player.state['companionBoost'] === true ? 2 : 1));
          const t = combat.aliveEnemies().sort((a, b) => a.hp - b.hp)[0];
          if (t) combat.procDamage(ally, t, bite, 'physical');
        }
      }
    }
  });

  // 战隼：暴击 → 俯冲 8 真伤 + 碎甲
  combat.hooks.on<{ source: unknown; target: Unit; isCrit?: boolean }>('AfterDamageDealt', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source === player && p.isCrit === true && player.state['falcon'] === true) {
      const dive = (player.state['falconDive'] as number | undefined) ?? 8;
      combat.procDamage(player, p.target, dive, 'true');
      combat.clearBlock(p.target);
    }
  });

  // 嗜血：伙伴攻击 +50%
  combat.hooks.on<{ source: Unit | null; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source && p.source.hasTag('ally') && p.source.hasBuff('bloodlust')) {
      const boost = (p.source.state['bloodlustMult'] as number | undefined) ?? 1.5;
      p.request.base *= boost;
    }
  });

  // 伙伴伤害翻倍（营地祭仪/天赋）
  combat.hooks.on<{ source: Unit | null; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source && p.source.hasTag('ally') && player.state['companionBoost'] === true) {
      p.request.base *= 2;
    }
  });
}

// ============================================================================
// 灵魂乐手：音符 / 生机旋律 / 安可 / 乐章 / 舞台音箱共鸣
// ============================================================================

function installSoulMusician(combat: Combat): void {
  const player = combat.player;
  player.resourceCaps['musical_note'] = 5;
  // 营地祭仪【全套吉他调音】：开局满 5 音符
  if (player.state['campNotes']) combat.modifyResource(player, 'musical_note', 'Add', player.state['campNotes'] as number);

  let lastSonata = '';
  // 打牌生成音符 + 记录乐章 + 聚合必暴击
  combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Power, (ev) => {
    const id = ev.payload.card.defId;
    const def = getCardDef(id);
    combat.modifyResource(player, 'musical_note', 'Add', 1);
    if (def.tags.includes('Sonata')) lastSonata = id;
    if (id === 'card_mus_converging_movement') player.state['attackCritBonus'] = 1;
  });

  // 生机旋律：攻击伤害 25% 反哺全队
  // 英勇乐章：全队攻击 +25% + 吸血 100%
  combat.hooks.on<{ source: unknown; target: Unit; result: { remaining: number } }>('AfterDamageDealt', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source === player && p.target !== player && p.result.remaining > 0) {
      const heroic = (player.state['heroicSonata'] as number | undefined) ?? 0;
      // 吸血转化：英勇 100% / 增幅 150% / 生机 25%
      let ratio = 0.25;
      if (heroic > 0) ratio = (player.state['heroicLifesteal'] as number | undefined) ?? 1;
      if (player.state['ampBeat'] === true) {
        ratio = 1.5;
        player.state['ampBeat'] = false;
      }
      if (ratio > 0) {
        const healAmt = Math.round(p.result.remaining * ratio);
        if (healAmt > 0) {
          for (const u of combat.allUnits()) {
            if ((u.isPlayer || u.hasTag('ally')) && u.isAlive()) combat.heal(u, healAmt);
          }
        }
      }
    }
  });

  // 英勇乐章增伤 + 愈合乐章减伤 + 声波护罩
  combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source === player && ((player.state['heroicSonata'] as number | undefined) ?? 0) > 0) {
      p.request.base *= 1.25;
    }
  });
  combat.hooks.on<{ target: Unit; request: { type: string; defenderMults: number[] }; source: Unit | null }>('BeforeDamageReceived', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if ((p.target.isPlayer || p.target.hasTag('ally')) && player.state['healingSonata'] === true && p.request.type !== 'true') {
      p.request.defenderMults.push(0.8);
    }
    if ((p.target.isPlayer || p.target.hasTag('ally')) && player.state['soundShield'] === true) {
      p.request.defenderMults.push(0);
    }
    // 声波护壁反弹
    if (p.target === player && player.state['soundBarrier'] === true && p.source && p.source !== player) {
      combat.procDamage(player, p.source, 3, 'magic');
    }
  });

  // 回合开始：愈合乐章 HOT + 计时衰减
  combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Power, () => {
    const heroic = (player.state['heroicSonata'] as number | undefined) ?? 0;
    if (heroic > 0) player.state['heroicSonata'] = heroic - 1;
    const passion = (player.state['passion'] as number | undefined) ?? 0;
    if (passion > 0) player.state['passion'] = passion - 1;
    player.state['soundShield'] = false;
    player.state['soundBarrier'] = false;
    if (player.state['healingSonata'] === true) {
      const hot = (player.state['healingHot'] as number | undefined) ?? 6;
      for (const u of combat.allUnits()) {
        if ((u.isPlayer || u.hasTag('ally')) && u.isAlive()) combat.heal(u, player.state['speaker'] === true ? hot + 4 : hot);
      }
    }
  });

  // 安可：重复上一张乐章
  combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Power, (ev) => {
    if (ev.payload.card.defId === 'card_mus_encore' && lastSonata) {
      if (lastSonata === 'card_mus_heroic_sonata') {
        player.state['heroicSonata'] = Math.max(player.state['heroicSonata'] as number ?? 0, 3);
      } else if (lastSonata === 'card_mus_healing_sonata') {
        player.state['healingSonata'] = true;
      }
    }
  });
}

// ============================================================================
// 青岚骑士：勇气 / 锐利 / 技能回流 / 滞空空战 / 风姿
// ============================================================================

function installGaleKnight(combat: Combat): void {
  const player = combat.player;
  player.resourceCaps['courage'] = 100;
  // 营地祭仪【擦拭枪尖·风之誓言】：50 勇气 + 4 锐利
  if (player.state['campCourage']) combat.modifyResource(player, 'courage', 'Add', player.state['campCourage'] as number);
  if (player.state['campSharp']) player.applyBuff('sharpness', player.state['campSharp'] as number);

  // 锐利：回合末衰减（风姿卓绝不衰减）
  combat.hooks.on('OnRoundEnd', HOOK_PRIORITY.Power, () => {
    if (player.state['peerless'] !== true) player.consumeBuff('sharpness', 1);
  });

  // 锐利：每层 +8% 穿刺伤害、+4% 暴击
  combat.hooks.on<{ source: unknown; request: { base: number } }>('BeforeDamageCalculated', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.source === player) {
      const s = player.getBuffStacks('sharpness');
      if (s > 0) {
        p.request.base *= 1 + 0.08 * s;
        player.state['critChance'] = 0.04 * s;
      } else {
        player.state['critChance'] = 0;
      }
    }
  });

  // 疾风刺：下一张长枪技能 0 费
  combat.costModifier = (card): number => {
    if (player.state['lanceFree'] === true && getCardDef(card.defId).tags.includes('Lance')) return -99;
    return 0;
  };
  combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Power, () => {
    player.state['lanceFree'] = false;
    player.state['aerial'] = false;
    player.state['setsunaPierce'] = false;
  });
  combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Power, (ev) => {
    const def = getCardDef(ev.payload.card.defId);
    if (def.tags.includes('Lance')) player.state['lanceFree'] = false;
  });

  // 螺旋击刺回流：消耗勇气后回到手牌
  combat.hooks.on<{ card: { defId: string; uid: string } }>('OnCardPlayed', HOOK_PRIORITY.Power, (ev) => {
    if (ev.payload.card.defId === 'card_knt_spiral_thrust' && player.state['spiralReturn'] === true) {
      player.state['spiralReturn'] = false;
      const idx = combat.piles.discard.findIndex((c) => c.uid === ev.payload.card.uid);
      if (idx >= 0) {
        const card = combat.piles.discard.splice(idx, 1)[0];
        combat.piles.addToHand(card);
      }
    }
  });

  // 破追击杀：回满勇气
  combat.hooks.on<{ killer: unknown }>('OnUnitKilled', HOOK_PRIORITY.Power, (ev) => {
    if (ev.payload.killer === player && player.state['lastPlayedCardId'] === 'card_knt_break_pursuit') {
      combat.modifyResource(player, 'courage', 'Set', 100);
    }
  });

  // 刹那贯穿：翔返后下一发刹那打击全场
  combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Power, (ev) => {
    if (ev.payload.card.defId === 'card_knt_setsuna' && player.state['setsunaPierce'] === true) {
      player.state['setsunaPierce'] = false;
      for (const e of combat.aliveEnemies()) {
        if (e !== combat.aliveEnemies()[0]) combat.procDamage(player, e, 14, 'true');
      }
    }
  });

  // 风姿卓绝：攻击牌额外勇气+锐利
  combat.hooks.on<{ card: { defId: string } }>('OnCardPlayed', HOOK_PRIORITY.Power, (ev) => {
    if (player.state['peerless'] === true) {
      const def = getCardDef(ev.payload.card.defId);
      if (def.cardType === 'Attack') {
        combat.modifyResource(player, 'courage', 'Add', (player.state['peerlessCourage'] as number | undefined) ?? 10);
        player.applyBuff('sharpness', 1);
      }
    }
  });
}

// ============================================================================
// 雷影剑士：双形态 / 超高出力 / 雷之印 / 月刃 / 千雷闪影
// ============================================================================

function installThunderblade(combat: Combat): void {
  const player = combat.player;

  // 初始形态：长刀
  player.state['form'] = 'katana';
  player.resourceCaps['thunder_seal'] = 5;

  // 打牌触发形态切换（带 [长刀]/[镰刀] 标签）
  combat.hooks.on<{ card: CardInstance; target: { id: string } | null }>('OnCardPlayed', HOOK_PRIORITY.Card, (ev) => {
    const card = ev.payload.card;
    const def = getCardDef(card.defId);
    if (def.tags.includes('Form:Katana')) {
      const prev = player.state['form'];
      if (prev !== 'katana') {
        player.state['form'] = 'katana';
        combat.modifyResource(player, 'thunder_seal', 'Add', 1); // 形态切换过载电弧
      }
    } else if (def.tags.includes('Form:Scythe')) {
      const prev = player.state['form'];
      if (prev !== 'scythe') {
        player.state['form'] = 'scythe';
        combat.modifyResource(player, 'thunder_seal', 'Add', 1);
      }
    }
    // 一闪：登记击杀返还
    if (def.id === 'card_tb_issen') {
      player.state['pendingIssen'] = true;
    }
    // 月刃追击：打出一张攻击牌 → 月刃协同攻击（K2-6 万剑归宗可多段追击）
    if (player.hasBuff('moonblade') && def.cardType === 'Attack') {
      const target = ev.payload.target;
      const t = target ? combat.findUnit(target.id) : null;
      if (t) {
        const hits = (player.state['moonbladeHits'] as number | undefined) ?? 1;
        for (let h = 0; h < hits; h++) {
          combat.procDamage(player, t, 4, 'magic');
        }
        combat.triggerVFX('moonblade_followup');
      }
    }
  });

  // 无穷雷霆之力：获得雷之印时直接补满至上限
  combat.hooks.on<{ unit: Unit; resourceId: string; op: string; before: number; after: number }>(
    'OnResourceChanged', HOOK_PRIORITY.Power, (ev) => {
      const p = ev.payload;
      if (p.unit === player && p.resourceId === 'thunder_seal' && p.op === 'Add' && p.after > p.before && player.hasBuff('infinite_thunder')) {
        combat.modifyResource(player, 'thunder_seal', 'Set', player.resourceCaps['thunder_seal']);
      }
    },
  );

  // 千雷闪影之意：每次造成伤害追加雷电真伤（K2-8 千雷轰顶可提升）+ 1 层感电
  combat.hooks.on<{ source: unknown; target: Unit; result: { remaining: number } }>(
    'AfterDamageDealt', HOOK_PRIORITY.Power, (ev) => {
      const p = ev.payload;
      if (p.source === player && player.hasBuff('thousand_flashes') && p.result.remaining > 0 && p.target !== player) {
        const dmg = (player.state['flashDamage'] as number | undefined) ?? 2;
        combat.procDamage(player, p.target, dmg, 'true');
        combat.applyBuff(p.target, 'electrified', 1);
        combat.triggerVFX('thunder_bolt');
      }
    },
  );

  // 一闪击杀返还：返还 2 印并抽 1
  combat.hooks.on<{ killer: unknown; victim: unknown }>('OnUnitKilled', HOOK_PRIORITY.Card, (ev) => {
    const p = ev.payload;
    if (p.killer === player && player.state['pendingIssen']) {
      combat.modifyResource(player, 'thunder_seal', 'Add', 2);
      combat.drawCards(1);
      combat.triggerVFX('issen_kill');
    }
  });

  // 回合结束清空一闪标记
  combat.hooks.on('OnPlayerTurnEnd', HOOK_PRIORITY.Card, () => {
    player.state['pendingIssen'] = false;
  });
}

// ============================================================================
// 神盾骑士：圣令 / 光明能量 / 光铸身躯 / 裁决 / 冷酷征伐
// ============================================================================

function installAegisKnight(combat: Combat): void {
  const player = combat.player;
  player.resourceCaps['holy_order'] = 5;
  player.resourceCaps['radiant_energy'] = 100;

  const isLightforged = (): boolean => (player.resources['radiant_energy'] ?? 0) >= 30;
  const syncLightforged = (): void => {
    player.state['lightforged'] = isLightforged();
  };

  // 受击前：光明能量 >= 30 时激活光铸身躯（吸收 50% / 圣光守卫 65% / K9-1 光铸泰坦 75%）
  combat.hooks.on<{ target: Unit; request: { type: string } }>('BeforeDamageReceived', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.target === player && p.request.type !== 'true') {
      if (isLightforged()) {
        player.reductionRatio = (player.state['lightforgedRatio'] as number | undefined) ?? (player.hasBuff('holy_guardian') ? 0.65 : 0.5);
      } else {
        player.reductionRatio = 0;
      }
    }
  });

  // 受击后：吸收扣 5 光明能量；圣光守卫每次吸收 +1 圣令；冷酷征伐伤害 50% 转屏障
  combat.hooks.on<{ source: unknown; target: Unit; result: { remaining: number; absorbedByRatio: number } }>(
    'AfterDamageDealt', HOOK_PRIORITY.Power, (ev) => {
      const p = ev.payload;
      if (p.target === player && p.result.absorbedByRatio > 0) {
        combat.modifyResource(player, 'radiant_energy', 'Consume', 5);
        if (player.hasBuff('holy_guardian')) {
          combat.modifyResource(player, 'holy_order', 'Add', 1);
        }
        syncLightforged();
      }
      if (p.source === player && p.result.remaining > 0 && player.hasBuff('crusade')) {
        combat.gainBarrier(player, Math.round(p.result.remaining * 0.5));
      }
    },
  );

  // 回合结束：光明能量自然衰减 10
  combat.hooks.on('OnRoundEnd', HOOK_PRIORITY.Power, () => {
    combat.modifyResource(player, 'radiant_energy', 'Add', -10);
    syncLightforged();
  });

  // 冷酷征伐：回合开始补满 5 枚圣令
  combat.hooks.on('OnPlayerTurnStart', HOOK_PRIORITY.Power, () => {
    syncLightforged();
    if (player.hasBuff('crusade')) {
      combat.modifyResource(player, 'holy_order', 'Set', player.resourceCaps['holy_order']);
    }
  });

  // 冷酷征伐：圣剑 / 裁决费用 -1
  combat.costModifier = (card: CardInstance): number => {
    if (player.hasBuff('crusade')) {
      const def = getCardDef(card.defId);
      if (def.id === 'card_pal_blade_of_light' || def.id === 'card_pal_judgement') return -1;
    }
    return 0;
  };

  // 光铸身躯状态同步（资源变化时刷新 UI 标记）
  combat.hooks.on<{ unit: Unit; resourceId: string }>('OnResourceChanged', HOOK_PRIORITY.Power, (ev) => {
    const p = ev.payload;
    if (p.unit === player && p.resourceId === 'radiant_energy') syncLightforged();
  });
}
