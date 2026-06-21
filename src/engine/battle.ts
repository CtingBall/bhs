// ============================================================
// 薄荷色氏族公约：星痕回响 — 战斗引擎 v3.0
// 超级引擎大更新：钩子系统 + 意图预览 + 修饰器堆栈 + 职业过滤
// 创意工坊：content/ 下的数据文件驱动所有战斗行为
// ============================================================

import type {
  BattleState,
  Card,
  CardEffect,
  Character,
  Enemy,
  Factor,
  Relic,
  RunState,
} from '@/types';
import { REWARD_POOL, getCard, createCardInstance } from '@/data/cards';
import { ENEMY_MAP } from '@/data/enemies';
import { SUMMON_MAP } from '@/data/summons';
import { getFactorKinds } from '@/data/factors';
import {
  addStatus,
  clone,
  damageEnemy,
  damagePlayer,
  decayStatuses,
  getStatus,
} from './status';
import { fireHooks, buildLegacyRelicHooks } from './hooks';

// ===== 辅助函数 =====
function log(s: BattleState, text: string, kind: BattleState['log'][number]['kind'] = 'system') {
  s.log.push({ text, kind });
  if (s.log.length > 40) s.log.shift();
}

export function hasRelic(s: BattleState, id: string): boolean {
  return s.relics.some((r) => r.id === id);
}

function relicAppliesToKind(r: Relic, kind: Relic['effect']['kind']): boolean {
  if (r.effect.kind !== kind) return false;
  switch (kind) {
    case 'startEnergy':
      return r.id !== 'zero-commander' && r.id !== 'jk-xhgm-start';
    case 'damageReduction':
      return r.id !== 'demon-core' && r.id !== 'final-star-scar';
    case 'turnEndDamage':
      return r.id !== 'uk-red-fury';
    case 'thorns':
      return r.id !== 'uk-feelings';
    case 'turnEndHeal':
      return r.id !== 'xingluo-resolve';
    case 'killHeal':
      return r.id !== 'jk-moonblade';
    case 'rareChance':
      return r.id !== 'n20-clear-cert';
    case 'shopDiscount':
      return r.id !== 'overtime-lantern';
    case 'curseToRope':
      return r.id !== 'xingluo-slack';
    case 'firstAttackDamage':
      return r.id !== 'zero-sec-kill';
    default:
      return true;
  }
}

function relicValue(s: BattleState, kind: Relic['effect']['kind']): number {
  let v = 0;
  for (const r of s.relics) if (relicAppliesToKind(r, kind)) v += r.effect.value ?? 0;
  return v;
}

function hasFactorKind(s: BattleState, kind: Factor['kind']): boolean {
  return getFactorKinds(s.factors as Factor[]).has(kind);
}

function factorDamageBonus(s: BattleState, rawDamage: number): number {
  let bonus = rawDamage;
  if (hasFactorKind(s, 'annihilation')) {
    const annihilationFactors = (s.factors as Factor[]).filter((f) => f.kind === 'annihilation');
    for (const f of annihilationFactors) {
      if (f.id === 'factor-annihilation-2') bonus += Math.floor(bonus * 0.25);
      else bonus += Math.floor(bonus * 0.15);
    }
  }
  if (hasFactorKind(s, 'verdict')) {
    bonus += Math.floor(bonus * 0.4);
  }
  return bonus;
}

function factorBlockBonus(s: BattleState, block: number): number {
  if (hasFactorKind(s, 'thought')) return Math.floor(block * 1.5);
  return block;
}

function factorHandSizeBonus(s: BattleState): number {
  let bonus = 0;
  if (hasFactorKind(s, 'thought')) {
    const thoughtFactors = (s.factors as Factor[]).filter((f) => f.kind === 'thought');
    for (const f of thoughtFactors) {
      if (f.id === 'factor-thought-2') bonus += 2;
      else bonus += 1;
    }
  }
  return bonus;
}

function drawCards(s: BattleState, n: number) {
  for (let i = 0; i < n; i++) {
    if (s.drawPile.length === 0) {
      if (s.discardPile.length === 0) return;
      s.drawPile = shuffle(s.discardPile);
      s.discardPile = [];
    }
    const c = s.drawPile.pop();
    if (c) {
      s.hand.push(c);
      // 触发器：抽到卡牌
      fireHooks(s, 'onCardDrawn', { card: c });
    }
  }
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addSummon(s: BattleState, summonId: string) {
  const def = SUMMON_MAP[summonId];
  if (!def) return;
  s.summons.push({
    uid: `sum-${s.nextEnemyUid++}`,
    defId: def.id,
    name: def.name,
    emoji: def.emoji,
    perTurn: def.perTurn,
  });
  log(s, `召唤 ${def.name} ${def.emoji}`);
}

function addEnemy(s: BattleState, defId: string) {
  const def = ENEMY_MAP[defId];
  if (!def) return;
  s.enemies.push(makeEnemy(def, s));
  log(s, `${def.name} ${def.emoji} 登场！`, 'enemy');
}

function makeEnemy(def: Enemy, s: BattleState) {
  return {
    uid: `e${s.nextEnemyUid++}`,
    defId: def.id,
    name: def.name,
    emoji: def.emoji,
    hp: def.hp,
    maxHp: def.hp,
    block: 0,
    statuses: [],
    intentIndex: Math.floor(Math.random() * def.intents.length),
    intents: def.intents,
    isBoss: def.isBoss,
    isElite: def.isElite,
    skill: def.skill,
    summons: def.summons,
  };
}

function killDeadEnemies(s: BattleState): number {
  let killed = 0;
  for (let i = s.enemies.length - 1; i >= 0; i--) {
    if (s.enemies[i].hp <= 0) {
      const e = s.enemies[i];
      log(s, `击败 ${e.name} ${e.emoji}！`, 'crit');
      // 击杀回血遗物（旧逻辑）
      const heal = relicValue(s, 'killHeal') + relicValue(s, 'healOnKill');
      if (heal > 0) {
        s.player.hp = Math.min(s.player.maxHp, s.player.hp + heal);
      }
      // 被动：击杀+力量（Ukinovo红怒）
      if (s.character.passive.kind === 'killStrength') {
        addStatus(s.player.statuses, 'strength', s.character.passive.value ?? 2);
      }
      if (hasRelic(s, 'jk-moonblade')) {
        addStatus(s.player.statuses, 'strength', 1);
        addStatus(s.player.statuses, 'dexterity', 1);
      }
      if (hasRelic(s, 'uk-red-fury')) {
        for (const other of s.enemies) {
          if (other.uid !== e.uid) damageEnemy(other, 5);
        }
      }
      // 触发器：击杀敌人
      fireHooks(s, 'onKill', { killedEnemyName: e.name });
      // 战斗事件结算
      resolveBattleEventOnKill(s, e.name);
      s.enemies.splice(i, 1);
      killed++;
    }
  }
  return killed;
}

// ===== 战斗创建（核心入口） =====
export function createBattle(
  run: RunState,
  enemyDefs: Enemy[],
  character: Character,
): BattleState {
  const energyPenalty = run.relics.some((r) => r.id === 'heavy-armor') ? 1 : 0;
  const extraEnergy = run.relics.some((r) => r.id === 'final-star-scar') ? 1 : 0;
  const maxEnergy = Math.max(
    0,
    3
      + relicValue({ relics: run.relics } as BattleState, 'startEnergy')
      + extraEnergy
      - energyPenalty
      + (run.caste === 'brahmin' ? 1 : 0),
  );
  const zoneNodes = run.mapNodes[run.zoneIndex] ?? [];
  const currentNode = zoneNodes.find((n) => n.id === run.currentNodeId);
  const firstBattleOfFloor = currentNode
    ? zoneNodes.filter((n) => n.floor === currentNode.floor && (n.type === 'battle' || n.type === 'elite' || n.type === 'boss') && n.visited).length === 1
    : false;

  const s: BattleState = {
    enemies: [],
    player: {
      hp: run.hp,
      maxHp: run.maxHp,
      block: 0,
      energy: maxEnergy,
      maxEnergy,
      statuses: [],
    },
    summons: [],
    hand: [],
    drawPile: shuffle(run.deck.map((c) => ({ ...c, effects: c.effects.map((e) => ({ ...e })) }))),
    discardPile: [],
    exhaustedPile: [],
    turn: 0,
    cardsPlayedThisTurn: 0,
    combo: 0,
    attackCombo: 0,
    isPlayerTurn: true,
    over: null,
    relics: run.relics,
    character,
    log: [],
    nextEnemyUid: enemyDefs.length,
    tempAlly: run.tempAlly,
    animating: false,
    battleEvent: { kind: null },
    factors: run.factors ?? [],
    eventRewards: {},
    firstBattleOfFloor,
    hookTriggers: {},
    hookTriggersThisTurn: {},
    modifiers: [],
  };

  // 注册遗物修饰器（新引擎钩子系统）
  const relicHooks = buildLegacyRelicHooks(run.relics);
  for (const h of relicHooks) {
    if (h.modifiers) {
      for (const m of h.modifiers) {
        s.modifiers.push({ ...m });
      }
    }
  }

  s.enemies = enemyDefs.map((d) => makeEnemy(d, s));
  if (hasRelic(s, 'n20-clear-cert')) {
    for (const enemy of s.enemies) addStatus(enemy.statuses, 'vuln', 3);
  }
  log(s, `战斗开始！遭遇 ${enemyDefs.map((e) => e.name).join('、')}`, 'system');
  return startPlayerTurn(s);
}

// ===== 玩家回合开始 =====
export function startPlayerTurn(s: BattleState): BattleState {
  const st = clone(s);
  st.turn += 1;
  st.isPlayerTurn = true;
  st.combo = 0;
  st.cardsPlayedThisTurn = 0;
  st.player.block = 0;
  st.player.energy = st.player.maxEnergy;
  // 重置回合钩子计数
  st.hookTriggersThisTurn = {};

  // 召唤物回合开始被动
  for (const sum of st.summons) {
    const e = sum.perTurn;
    if (e.kind === 'energy') st.player.energy += e.value ?? 0;
    else if (e.kind === 'block') st.player.block += e.value ?? 0;
    else if (e.kind === 'applyStatus' && e.statusTarget === 'enemy') {
      const amt = e.value ?? 0;
      const targets = e.all ? st.enemies : st.enemies.slice(0, 1);
      for (const t of targets) addStatus(t.statuses, e.status!, amt);
    } else if (e.kind === 'damage' && st.enemies.length > 0) {
      const t = st.enemies[Math.floor(Math.random() * st.enemies.length)];
      damageEnemy(t, e.value ?? 0);
    }
  }
  killDeadEnemies(st);

  // 被动：每回合格挡（哎呦喂）
  if (st.character.passive.kind === 'turnBlock') st.player.block += st.character.passive.value ?? 0;
  // 被动：每回合多抽牌（答辩）
  if (st.character.passive.kind === 'turnDraw') drawCards(st, st.character.passive.value ?? 0);
  // 被动：回合开始全敌燃烧（莫妮卡）
  if (st.character.passive.kind === 'burnAll') {
    for (const e of st.enemies) addStatus(e.statuses, 'burn', st.character.passive.value ?? 3);
  }
  // 被动：每回合永久力量+1（夕）
  if (st.character.passive.kind === 'rampStrength') addStatus(st.player.statuses, 'strength', st.character.passive.value ?? 1);

  // 遗物：每回合格挡
  st.player.block += relicValue(st, 'turnBlock');

  // 手牌上限计算
  let handSize = (st.character.handSize ?? 5) + factorHandSizeBonus(st);
  if (hasRelic(st, 'cursed-blade')) handSize -= 1;
  if (st.turn === 1) {
    if (st.firstBattleOfFloor) handSize += relicValue(st, 'firstBattleDraw');
    handSize += relicValue(st, 'battleStartDraw');
    if (hasRelic(st, 'gamblers-luck')) handSize -= 1;
    if (st.character.passive.kind === 'initialHand') handSize += st.character.passive.value ?? 0;
    if (hasRelic(st, 'jk-xhgm-start')) st.player.energy += 2;
  }
  const toDraw = Math.max(0, handSize - st.hand.length);
  drawCards(st, toDraw);

  // 清理上回合的临时修饰器
  st.modifiers = st.modifiers.filter(
    (m) => m.duration === 'permanent' || m.duration === 'battle',
  );

  // ===== 新引擎：回合开始钩子 =====
  fireHooks(st, 'onTurnStart');

  // 战斗内随机事件
  if (st.turn > 1 && st.turn % 2 === 0 && Math.random() < 0.3 && !st.battleEvent.kind) {
    rollBattleEvent(st);
  }

  log(st, `—— 第 ${st.turn} 回合 ——`, 'system');
  if (st.enemies.length === 0 && !st.over) st.over = 'win';
  return st;
}

// ===== 深度构筑：动态数值计算 =====
function computeScaleBonus(st: BattleState, eff: CardEffect, target?: BattleState['enemies'][number]): number {
  if (!eff.scaleBy) return 0;
  const mult = eff.scaleMultiplier ?? 1;
  switch (eff.scaleBy) {
    case 'combo': return st.combo * mult;
    case 'block': return st.player.block * mult;
    case 'missingHp': return (st.player.maxHp - st.player.hp) * mult;
    case 'missingHpDiv': return Math.floor((st.player.maxHp - st.player.hp) / Math.max(1, mult));
    case 'strength': return getStatus(st.player.statuses, 'strength') * mult;
    case 'dexterity': return getStatus(st.player.statuses, 'dexterity') * mult;
    case 'enemyBurn': return target ? getStatus(target.statuses, 'burn') * mult : 0;
    case 'enemyFreeze': return target ? getStatus(target.statuses, 'freeze') * mult : 0;
    case 'enemyShock': return target ? getStatus(target.statuses, 'shock') * mult : 0;
    case 'enemyWeak': return target ? getStatus(target.statuses, 'weak') * mult : 0;
    case 'enemyVuln': return target ? getStatus(target.statuses, 'vuln') * mult : 0;
    case 'handSize': return st.hand.length * mult;
    case 'cardsPlayedThisTurn': return st.cardsPlayedThisTurn * mult;
    case 'attackCombo': return st.attackCombo * mult;
    case 'killsThisCombat': return 0;
    case 'energyRemaining': return st.player.energy * mult;
    case 'enemyCount': return st.enemies.length * mult;
    default: return 0;
  }
}

function computeExtraHits(st: BattleState, eff: CardEffect): number {
  if (!eff.scaleHitsBy) return 0;
  const stat = eff.scaleHitsBy === 'strength' ? 'strength' : 'dexterity';
  return Math.floor(getStatus(st.player.statuses, stat) / 3);
}

function checkConditionalBonus(st: BattleState, eff: CardEffect, target?: BattleState['enemies'][number]): number {
  if (!eff.conditionalBonus) return 1;
  const c = eff.conditionalBonus;
  let active = false;
  switch (c.condition) {
    case 'enemyHpBelow50': active = target ? target.hp < target.maxHp * 0.5 : false; break;
    case 'enemyHasWeak': active = target ? target.statuses.some((s) => s.type === 'weak' && s.amount > 0) : false; break;
    case 'enemyHasFreeze': active = target ? target.statuses.some((s) => s.type === 'freeze' && s.amount > 0) : false; break;
    case 'enemyHasBurn': active = target ? target.statuses.some((s) => s.type === 'burn' && s.amount > 0) : false; break;
    case 'enemyHasVuln': active = target ? target.statuses.some((s) => s.type === 'vuln' && s.amount > 0) : false; break;
    case 'hpBelow50': active = st.player.hp < st.player.maxHp * 0.5; break;
    case 'hpAbove50': active = st.player.hp > st.player.maxHp * 0.5; break;
    case 'blockAbove0': active = st.player.block > 0; break;
    case 'firstCardThisTurn': active = st.cardsPlayedThisTurn === 0; break;
    case 'handSizeAbove4': active = st.hand.length >= 5; break;
    case 'enemyIsBoss': active = target ? !!target.isBoss : false; break;
    case 'energyAtZero': active = st.player.energy === 0; break;
    default: break;
  }
  if (!active) return 1;
  switch (c.bonusKind) {
    case 'doubleDamage': return 2;
    case 'extraHit': return 1;
    case 'drawExtra': return 1; // handled separately
    default: return 1;
  }
}

function applyScaleToDamage(raw: number, eff: CardEffect, st: BattleState, target?: BattleState['enemies'][number]): number {
  let v = raw + computeScaleBonus(st, eff, target);
  const condMultiplier = checkConditionalBonus(st, eff, target);
  if (condMultiplier > 1) v *= condMultiplier;
  return v;
}

// ===== 附加效果执行 =====
function applySideEffect(st: BattleState, se: NonNullable<CardEffect['sideEffect']>, cardName: string, targetIndex: number) {
  switch (se.kind) {
    case 'draw':
      drawCards(st, se.value ?? 1);
      break;
    case 'energy':
      st.player.energy += se.value ?? 1;
      break;
    case 'block':
      st.player.block += se.value ?? 0;
      break;
    case 'heal':
      st.player.hp = Math.min(st.player.maxHp, st.player.hp + (se.value ?? 0));
      break;
    case 'applyStatus':
      if (se.statusTarget === 'self') addStatus(st.player.statuses, se.status!, se.value ?? 1);
      else if (st.enemies[targetIndex]) addStatus(st.enemies[targetIndex].statuses, se.status!, se.value ?? 1);
      break;
    case 'damageAll':
      for (const t of st.enemies) damageEnemy(t, se.value ?? 0);
      log(st, `${cardName}附加：全场 ${se.value ?? 0} 伤害`, 'player');
      break;
  }
}

// ===== 效果应用引擎 =====
function applyEffect(
  st: BattleState,
  eff: CardEffect,
  card: Card,
  targetIndex: number,
  firstAttack: boolean,
) {
  const p = st.character.passive;
  switch (eff.kind) {
    case 'damage': {
      const extraHits = computeExtraHits(st, eff);
      // 条件额外段数
      let condExtraHit = 0;
      if (eff.conditionalBonus?.bonusKind === 'extraHit') {
        const target = st.enemies[targetIndex];
        if (target) {
          const c = eff.conditionalBonus;
          let active = false;
          switch (c.condition) {
            case 'blockAbove0': active = st.player.block > 0; break;
            case 'enemyHasWeak': active = target.statuses.some((s) => s.type === 'weak'); break;
            case 'enemyHasVuln': active = target.statuses.some((s) => s.type === 'vuln'); break;
            default: break;
          }
          if (active) condExtraHit = 1;
        }
      }
      const hits = (eff.hits ?? 1) + extraHits + condExtraHit;
      for (let h = 0; h < hits; h++) {
        const target = st.enemies[targetIndex];
        if (!target) break;
        let raw = applyScaleToDamage(eff.value ?? 0, eff, st, target);
        raw += getStatus(st.player.statuses, 'strength');
        if (getStatus(st.player.statuses, 'weak') > 0) raw = Math.floor(raw * 0.75);
        if (!hasFactorKind(st, 'verdict') && getStatus(target.statuses, 'vuln') > 0) raw = Math.floor(raw * 1.5);
        if (firstAttack && p.kind === 'firstAttackBoost') raw += p.value ?? 0;
        if (p.kind === 'comboScale') raw += (st.combo - 1) * (p.value ?? 0);
        if (st.hand.length >= 6) raw += relicValue(st, 'fullHandDamage');
        if (hasRelic(st, 'demon-core')) raw += 1;
        if (hasRelic(st, 'final-star-scar')) raw += 2;
        if (hasRelic(st, 'zero-sec-kill') && target.hp <= Math.max(1, Math.floor(target.maxHp * 0.2))) raw += 8;
        if (firstAttack) raw += relicValue(st, 'firstAttackDamage');
        if (firstAttack && hasRelic(st, 'double-edged')) raw -= 4;
        raw = factorDamageBonus(st, raw);
        const dealt = damageEnemy(target, raw);
        log(st, `${card.name} → ${target.name}：${dealt} 伤害`, 'player');
        fireHooks(st, 'onAttackDealt', { card, targetIndex, damageDealt: dealt });
        if (firstAttack && st.character.passive.kind === 'firstAttackWeak') {
          addStatus(target.statuses, 'weak', st.character.passive.value ?? 1);
        }
      }
      break;
    }
    case 'damageAll': {
      for (const target of st.enemies) {
        let raw = applyScaleToDamage(eff.value ?? 0, eff, st, target);
        raw += getStatus(st.player.statuses, 'strength');
        if (getStatus(st.player.statuses, 'weak') > 0) raw = Math.floor(raw * 0.75);
        if (!hasFactorKind(st, 'verdict') && getStatus(target.statuses, 'vuln') > 0) raw = Math.floor(raw * 1.5);
        if (st.hand.length >= 6) raw += relicValue(st, 'fullHandDamage');
        if (hasRelic(st, 'demon-core')) raw += 1;
        if (hasRelic(st, 'final-star-scar')) raw += 2;
        if (hasRelic(st, 'zero-sec-kill') && target.hp <= Math.max(1, Math.floor(target.maxHp * 0.2))) raw += 8;
        if (firstAttack && hasRelic(st, 'double-edged')) raw -= 4;
        raw = factorDamageBonus(st, raw);
        const dealt = damageEnemy(target, raw);
        log(st, `${card.name} → ${target.name}：${dealt} 伤害`, 'player');
        fireHooks(st, 'onAttackDealt', { card, damageDealt: dealt });
      }
      break;
    }
    case 'block': {
      let v = (eff.value ?? 0) + computeScaleBonus(st, eff) + getStatus(st.player.statuses, 'dexterity');
      if (getStatus(st.player.statuses, 'frail') > 0) v = Math.floor(v * 0.75);
      v = factorBlockBonus(st, v);
      if (st.cardsPlayedThisTurn === 0 && st.character.passive.kind === 'firstBlockBoost') v += st.character.passive.value ?? 0;
      st.player.block += v;
      fireHooks(st, 'onBlockGained', { card, blockAmount: v });
      break;
    }
    case 'heal': {
      let v = eff.value ?? 0;
      v += computeScaleBonus(st, eff);
      if (v < 0) {
        st.player.hp = Math.max(0, st.player.hp + v);
        log(st, `${card.name}：失去 ${-v} 生命`, 'enemy');
      } else {
        if (p.kind === 'lowHpHealBoost' && st.player.hp < st.player.maxHp * 0.3) v *= p.value ?? 2;
        st.player.hp = Math.min(st.player.maxHp, st.player.hp + v);
        log(st, `${card.name}：回复 ${v} 生命`, 'player');
        fireHooks(st, 'onHealReceived', { card, healAmount: v });
      }
      break;
    }
    case 'summon':
      addSummon(st, eff.summonId!);
      break;
    case 'applyStatus': {
      let amt = eff.value ?? 0;
      if (eff.status === 'burn' && p.kind === 'burnDouble') amt *= p.value ?? 2;
      if (eff.statusTarget === 'self') {
        addStatus(st.player.statuses, eff.status!, amt);
      } else {
        let amtActual = amt;
        const targets = eff.all ? st.enemies : [st.enemies[targetIndex]].filter(Boolean);
        if (eff.status === 'weak' && st.character.passive.kind === 'weakBoost') amtActual += st.character.passive.value ?? 1;
        for (const t of targets) addStatus(t.statuses, eff.status!, amtActual);
      }
      fireHooks(st, 'onStatusApplied', { card });
      break;
    }
    case 'draw':
      drawCards(st, eff.value ?? 0);
      break;
    case 'energy':
      st.player.energy += eff.value ?? 0;
      fireHooks(st, 'onEnergyGained', { card });
      break;
    case 'maxHp':
      st.player.maxHp += eff.value ?? 0;
      st.player.hp = Math.min(st.player.hp + Math.max(0, eff.value ?? 0), st.player.maxHp);
      break;
    case 'upgradeRandom': {
      const upgradeable = st.drawPile.concat(st.discardPile, st.hand).filter((c) => c.type !== 'curse');
      if (upgradeable.length > 0) {
        const pick = upgradeable[Math.floor(Math.random() * upgradeable.length)];
        pick.nurtureLevel += 1;
        log(st, `${card.name}：${pick.name} 养成 Lv.${pick.nurtureLevel}！`, 'crit');
      }
      break;
    }
  }
}

// ===== 打出卡牌 =====
export function playCard(
  s: BattleState,
  handIndex: number,
  targetIndex: number,
): BattleState {
  if (s.over) return s;
  const card = s.hand[handIndex];
  if (!card) return s;
  if (card.type === 'curse' && card.effects.length === 0) return s;

  let cost = card.cost;
  if (s.character.passive.kind === 'firstCardDiscount' && s.cardsPlayedThisTurn === 0) {
    cost = Math.max(0, cost - (s.character.passive.value ?? 1));
  }
  if (hasRelic(s, 'zero-commander') && s.cardsPlayedThisTurn === 0) {
    cost = Math.max(0, cost - 1);
  }
  if (s.player.energy < cost) return s;

  const st = clone(s);
  const c = st.hand[handIndex];
  st.player.energy -= cost;
  st.hand.splice(handIndex, 1);
  st.combo += 1;

  // 被动：打出第X张牌+1能量（Ephyra卷王）
  if (st.character.passive.kind === 'comboEnergy' && st.combo % (st.character.passive.value ?? 3) === 0) {
    st.player.energy += 1;
  }

  // 被动：每X次攻击牌+1力量（维）
  if (c.type === 'attack') {
    st.attackCombo += 1;
    if (st.character.passive.kind === 'attackStrength' && st.attackCombo % (st.character.passive.value ?? 3) === 0) {
      addStatus(st.player.statuses, 'strength', 1);
    }
  }

  const firstAttack = st.cardsPlayedThisTurn === 0 && c.type === 'attack';

  // 执行卡牌效果
  for (const eff of c.effects) applyEffect(st, eff, c, targetIndex, firstAttack);

  // ===== 附加效果执行 =====
  for (const eff of c.effects) {
    if (eff.sideEffect) applySideEffect(st, eff.sideEffect, card.name, targetIndex);
  }

  // ===== 新引擎：打出卡牌钩子 =====
  fireHooks(st, 'onCardPlayed', { card: c, targetIndex });

  // 消耗/弃牌
  if (c.exhaust || c.type === 'summon') {
    st.exhaustedPile.push(c);
    fireHooks(st, 'onCardExhausted', { card: c });
  } else {
    st.discardPile.push(c);
    fireHooks(st, 'onCardDiscarded', { card: c });
  }
  st.cardsPlayedThisTurn += 1;

  killDeadEnemies(st);
  if (st.enemies.length === 0 && !st.over) st.over = 'win';
  if (st.player.hp <= 0) st.over = 'lose';
  return st;
}

// ===== 玩家回合结束 =====
export function endPlayerTurn(s: BattleState): BattleState {
  if (s.over) return s;
  const st = clone(s);
  st.isPlayerTurn = false;

  // 琥珀召唤物：回合结束治疗
  for (const sum of st.summons) {
    if (sum.perTurn.kind === 'heal') {
      const v = sum.perTurn.value ?? 0;
      st.player.hp = Math.min(st.player.maxHp, st.player.hp + v);
    }
  }

  // 85w 自动遗物
  const ted = relicValue(st, 'turnEndDamage');
  if (ted > 0 && st.enemies.length > 0) {
    const t = st.enemies[Math.floor(Math.random() * st.enemies.length)];
    damageEnemy(t, ted);
    log(st, `85w 自动 → ${t.name}：${ted} 伤害`, 'player');
  }

  // 遗物扣血
  if (hasRelic(st, 'demon-core')) st.player.hp = Math.max(0, st.player.hp - 1);
  if (hasRelic(st, 'blood-pact')) st.player.hp = Math.max(0, st.player.hp - 1);

  // Infinity 被动：回合末 AOE
  if (st.character.passive.kind === 'turnEndAoE') {
    const v = st.character.passive.value ?? 0;
    for (const t of st.enemies) damageEnemy(t, v);
    log(st, `圣域雷击全场：${v} 伤害`, 'player');
  }

  // 末班车临时盟友
  if (st.tempAlly && st.enemies.length > 0) {
    const t = st.enemies[Math.floor(Math.random() * st.enemies.length)];
    damageEnemy(t, 5);
    log(st, `末班车盟友 → ${t.name}：5 伤害`, 'player');
  }

  // 玩家 burn/shock 结算
  const pb = getStatus(st.player.statuses, 'burn');
  const ps = getStatus(st.player.statuses, 'shock');
  if (pb + ps > 0) {
    st.player.hp = Math.max(0, st.player.hp - pb - ps);
    log(st, `你受到 ${pb + ps} 持续伤害`, 'enemy');
  }

  // 玩家 regen
  const pr = getStatus(st.player.statuses, 'regen');
  if (pr > 0) st.player.hp = Math.min(st.player.maxHp, st.player.hp + pr);

  // 因子：思维·深 回合末回复
  if (hasFactorKind(st, 'thought')) {
    const thoughtFactors = (st.factors as Factor[]).filter((f) => f.kind === 'thought');
    for (const f of thoughtFactors) {
      if (f.id === 'factor-thought-2') {
        st.player.hp = Math.min(st.player.maxHp, st.player.hp + 2);
        log(st, '思维·深：回复 2 生命', 'player');
      }
    }
  }

  // 清除单回合格斗事件
  if (st.battleEvent.kind === 'noteField') {
    log(st, '音符场消散……', 'system');
    st.battleEvent = { kind: null };
  }
  if (st.battleEvent.kind === 'sacrificeDance') {
    log(st, '奉献之舞结束……', 'system');
    st.battleEvent = { kind: null };
  }

  decayStatuses(st.player.statuses, true);

  // 遗物：回合结束回复
  const teHeal = relicValue(st, 'turnEndHeal');
  if (teHeal > 0) st.player.hp = Math.min(st.player.maxHp, st.player.hp + teHeal);
  if (hasRelic(st, 't-lords-badge')) st.player.hp = Math.min(st.player.maxHp, st.player.hp + 1);
  if (hasRelic(st, 'star-monument')) st.player.hp = Math.min(st.player.maxHp, st.player.hp + 1);
  if (hasRelic(st, 'xingluo-resolve') && st.player.block > 0) {
    st.player.hp = Math.min(st.player.maxHp, st.player.hp + 3);
  }

  // 被动：回合末格挡>0回血（星落）
  if (st.character.passive.kind === 'blockLife' && st.player.block > 0) {
    st.player.hp = Math.min(st.player.maxHp, st.player.hp + (st.character.passive.value ?? 3));
  }

  // ===== 新引擎：回合结束钩子 =====
  fireHooks(st, 'onTurnEnd');

  // StS 机制：弃掉所有手牌 → 预抽下回合手牌
  st.discardPile.push(...st.hand);
  st.hand = [];
  const handSize = (st.character.handSize ?? 5) + factorHandSizeBonus(st);
  drawCards(st, handSize);

  killDeadEnemies(st);
  if (st.enemies.length === 0 && !st.over) st.over = 'win';
  if (st.player.hp <= 0) st.over = 'lose';
  return st;
}

// ===== 敌人技能应用 =====
function applyEnemySkill(st: BattleState, enemy: BattleState['enemies'][number]) {
  const sk = enemy.skill;
  if (!sk) return;
  const turn = st.turn;
  let trigger = false;
  if (sk.trigger === 'everyTurn') trigger = true;
  else if (sk.trigger === 'every3Turns') trigger = turn % 3 === 0;
  else if (sk.trigger === 'onTurnEven') trigger = turn % 2 === 0;
  else if (sk.trigger === 'onLowHp' && !enemy.skillTriggered && enemy.hp < enemy.maxHp * 0.5) {
    trigger = true;
    enemy.skillTriggered = true;
  }
  if (!trigger) return;
  switch (sk.effect) {
    case 'gainStrength':
      addStatus(enemy.statuses, 'strength', sk.value ?? 0);
      log(st, `${enemy.name} 获得力量`, 'enemy');
      break;
    case 'gainBlock':
      enemy.block += sk.value ?? 0;
      break;
    case 'healSelf':
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + (sk.value ?? 0));
      break;
    case 'summonAlly':
      if (enemy.summons && enemy.summons.length > 0) addEnemy(st, enemy.summons[0]);
      break;
    case 'stealEnergy': {
      const stolen = Math.min(sk.value ?? 1, st.player.energy);
      st.player.energy -= stolen;
      addStatus(enemy.statuses, 'strength', 1);
      log(st, `${enemy.name} 偷走 ${stolen} 能量`, 'enemy');
      break;
    }
    case 'rampAttack':
      enemy.rampAttack = (enemy.rampAttack ?? 0) + (sk.value ?? 0);
      break;
    case 'applyVuln':
      addStatus(st.player.statuses, 'vuln', sk.value ?? 0);
      log(st, `${enemy.name} 给你施加了易伤`, 'enemy');
      break;
    case 'applyWeak':
      addStatus(st.player.statuses, 'weak', sk.value ?? 0);
      log(st, `${enemy.name} 给你施加了虚弱`, 'enemy');
      break;
    case 'applyFrail':
      addStatus(st.player.statuses, 'frail', sk.value ?? 0);
      log(st, `${enemy.name} 给你施加了脆弱`, 'enemy');
      break;
    case 'blockShield':
      enemy.blockShield = (enemy.blockShield ?? 0) + (sk.value ?? 0);
      log(st, `${enemy.name} 展开次数盾（${enemy.blockShield}层）`, 'enemy');
      break;
    default:
      break;
  }
}

// ===== 敌人回合 =====
export function enemyTurn(s: BattleState): BattleState {
  if (s.over) return s;
  const st = clone(s);
  const p = st.character.passive;
  for (const enemy of st.enemies) {
    if (st.over) break;
    enemy.block = 0;
    const intent = enemy.intents[enemy.intentIndex % enemy.intents.length];
    switch (intent.kind) {
      case 'attack':
      case 'charge': {
        let raw = intent.value + getStatus(enemy.statuses, 'strength') + (enemy.rampAttack ?? 0);
        const freezeLayers = getStatus(enemy.statuses, 'freeze');
        raw -= freezeLayers * (2 + (p.kind === 'freezeReduceAtk' ? p.value ?? 0 : 0));
        if (getStatus(enemy.statuses, 'weak') > 0) raw = Math.floor(raw * 0.75);
        if (getStatus(st.player.statuses, 'vuln') > 0) raw = Math.floor(raw * 1.5);
        raw = Math.max(0, raw - relicValue(st, 'damageReduction'));
        if (hasRelic(st, 'glass-cannon')) raw += 3;
        const dealt = damagePlayer(st.player, Math.max(0, raw));
        log(st, `${enemy.name} 攻击你：${dealt} 伤害`, 'enemy');
        // 触发器：受到伤害
        fireHooks(st, 'onDamageReceived', { damageReceived: dealt });
        if (dealt > 0 && hasRelic(st, 'uk-feelings')) {
          st.player.hp = Math.min(st.player.maxHp, st.player.hp + 2);
        }
        const thorns = relicValue(st, 'thorns');
        if (thorns > 0) {
          enemy.hp = Math.max(0, enemy.hp - thorns);
          log(st, `荆棘反伤 → ${enemy.name}：${thorns} 伤害`, 'player');
        }
        break;
      }
      case 'defend':
        enemy.block += intent.value;
        log(st, `${enemy.name} 格挡`, 'enemy');
        break;
      case 'buff':
        addStatus(enemy.statuses, 'strength', intent.value);
        log(st, `${enemy.name} 获得力量`, 'enemy');
        break;
      case 'summon':
        if (enemy.summons && enemy.summons.length > 0) addEnemy(st, enemy.summons[0]);
        break;
      case 'steal': {
        const stolen = Math.min(intent.value, st.player.energy);
        st.player.energy -= stolen;
        log(st, `${enemy.name} 偷走 ${stolen} 能量`, 'enemy');
        break;
      }
      default:
        break;
    }
    applyEnemySkill(st, enemy);
    enemy.intentIndex = (enemy.intentIndex + 1) % enemy.intents.length;
    if (st.player.hp <= 0) {
      st.over = 'lose';
      break;
    }
  }

  // 敌人 burn/shock 结算
  for (const enemy of st.enemies) {
    const b = getStatus(enemy.statuses, 'burn');
    const sh = getStatus(enemy.statuses, 'shock');
    if (b + sh > 0) {
      let burnDmg = b;
      if (st.character.passive.kind === 'burnExtraDamage') burnDmg += b * (st.character.passive.value ?? 1);
      enemy.hp -= burnDmg + sh;
      log(st, `${enemy.name} 受 ${burnDmg + sh} 持续伤害`, 'player');
    }
    decayStatuses(enemy.statuses);
  }
  killDeadEnemies(st);
  if (st.enemies.length === 0 && !st.over) st.over = 'win';
  if (st.player.hp <= 0) st.over = 'lose';
  return st;
}

// ===== 敌人意图预览 =====
const INTENT_ICON: Record<string, string> = {
  attack: '⚔️',
  charge: '💥',
  defend: '🛡️',
  buff: '⬆️',
  summon: '📢',
  steal: '💰',
};

const INTENT_LABEL: Record<string, string> = {
  attack: '攻击',
  charge: '蓄力',
  defend: '防御',
  buff: '强化',
  summon: '召唤',
  steal: '偷取',
};

export function getIntentDisplay(intent: { kind: string; value: number; displayText?: string }) {
  return {
    icon: INTENT_ICON[intent.kind] ?? '❓',
    label: intent.displayText ?? `${INTENT_LABEL[intent.kind] ?? intent.kind} ${intent.value}`,
  };
}

// ===== 战斗内随机事件 =====
function rollBattleEvent(st: BattleState) {
  const events: BattleState['battleEvent']['kind'][] = ['noteField', 'shinyGoblin', 'sacrificeDance'];
  const pick = events[Math.floor(Math.random() * events.length)];
  st.battleEvent = { kind: pick };
  switch (pick) {
    case 'noteField':
      st.battleEvent.data = 15;
      log(st, '音符场出现！本回合击杀敌人将额外获得绳子！', 'crit');
      break;
    case 'shinyGoblin': {
      const goblinDef: Enemy = {
        id: 'shiny-goblin',
        name: '闪耀哥布林',
        emoji: '👺',
        hp: 20,
        zone: 'strike',
        intents: [{ kind: 'attack', value: 6 }],
        desc: '限时敌人，击杀获3琥珀！',
        flavor: '焦点时刻：击杀闪耀哥布林获得回响余音',
      };
      const goblin = makeEnemy(goblinDef, st);
      st.enemies.push(goblin);
      st.battleEvent.data = goblin.uid.length;
      log(st, '闪耀哥布林出现！击杀它获得 3 琥珀！', 'crit');
      break;
    }
    case 'sacrificeDance':
      st.battleEvent.data = 8;
      log(st, '奉献之舞！本回合每回复1HP，战斗结束获得1意志（最多8）', 'crit');
      break;
  }
}

export function resolveBattleEventOnKill(st: BattleState, enemyName: string): void {
  if (!st.battleEvent.kind) return;
  if (st.battleEvent.kind === 'noteField') {
    const rope = st.battleEvent.data ?? 15;
    log(st, `音符场：击杀 ${enemyName}，获得 ${rope} 绳子！`, 'crit');
    st.eventRewards.rope = (st.eventRewards.rope ?? 0) + rope;
    st.battleEvent = { kind: null };
    return;
  }
  if (st.battleEvent.kind === 'shinyGoblin' && enemyName === '闪耀哥布林') {
    log(st, '击杀闪耀哥布林！获得 3 琥珀！', 'crit');
    st.eventRewards.amber = (st.eventRewards.amber ?? 0) + 3;
    st.battleEvent = { kind: null };
    return;
  }
}

// ===== 奖励卡池系统（职业过滤 + 稀有度分区） =====
const RARITY_ORDER: Card['rarity'][] = ['basic', 'common', 'rare', 'epic', 'legendary'];

function rarityRank(rarity: Card['rarity']): number {
  return RARITY_ORDER.indexOf(rarity);
}

function rarityWeight(rarity: Card['rarity'], rareBoost: number): number {
  switch (rarity) {
    case 'basic': return Math.max(0, 25 - rareBoost * 4);
    case 'common': return Math.max(5, 35 - rareBoost * 5);
    case 'rare': return 22 + rareBoost * 5;
    case 'epic': return 12 + rareBoost * 3;
    case 'legendary': return 6 + rareBoost * 2;
  }
}

/**
 * 按职业过滤奖励池
 * 创意工坊：classId 为 undefined 的卡牌对所有角色可见；
 * classId 有值的卡牌只有该职业的角色才能获取
 */
function getClassFilteredPool(classId?: string): typeof REWARD_POOL {
  if (!classId) return REWARD_POOL;
  return REWARD_POOL.filter(
    (c) => !c.classId || c.classId === classId,
  );
}

export function rollRewardCard(
  zoneIndex: number,
  rareBoost: number,
  minRarity: Card['rarity'] = 'basic',
  classId?: string,
): Card {
  const maxRarity = zoneIndex < 2 ? 'common' : zoneIndex < 4 ? 'rare' : zoneIndex < 5 ? 'epic' : 'legendary';
  const maxRank = rarityRank(maxRarity);
  const minRank = Math.min(rarityRank(minRarity), maxRank);
  const allowed = RARITY_ORDER.filter((rarity) => {
    const rank = rarityRank(rarity);
    return rank >= minRank && rank <= maxRank;
  });
  const weights = allowed.map((rarity) => rarityWeight(rarity, rareBoost));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = Math.random() * Math.max(1, total);
  let rarity = allowed[allowed.length - 1] ?? 'common';
  for (let i = 0; i < allowed.length; i++) {
    cursor -= weights[i];
    if (cursor <= 0) {
      rarity = allowed[i];
      break;
    }
  }
  let pool = getClassFilteredPool(classId).filter((c) => c.rarity === rarity);
  if (pool.length === 0) pool = getClassFilteredPool(classId).filter((c) => c.rarity === 'common');
  if (pool.length === 0) pool = REWARD_POOL.filter((c) => c.rarity === 'common');
  const template = pool[Math.floor(Math.random() * pool.length)];
  return createCardInstance(template);
}

export function getCardById(id: string): Card {
  return getCard(id);
}
