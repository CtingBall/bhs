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
import { CARD_MAP, REWARD_POOL } from '@/data/cards';
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

function log(s: BattleState, text: string, kind: BattleState['log'][number]['kind'] = 'system') {
  s.log.push({ text, kind });
  if (s.log.length > 40) s.log.shift();
}

export function hasRelic(s: BattleState, id: string): boolean {
  return s.relics.some((r) => r.id === id);
}

function relicValue(s: BattleState, kind: Relic['effect']['kind']): number {
  let v = 0;
  for (const r of s.relics) if (r.effect.kind === kind) v += r.effect.value ?? 0;
  return v;
}

// 因子系统辅助
function hasFactorKind(s: BattleState, kind: Factor['kind']): boolean {
  return getFactorKinds(s.factors as Factor[]).has(kind);
}

// 因子伤害加成计算
function factorDamageBonus(s: BattleState, rawDamage: number): number {
  let bonus = rawDamage;
  // 寂灭：独立乘区 +15%~25%
  if (hasFactorKind(s, 'annihilation')) {
    const annihilationFactors = (s.factors as Factor[]).filter((f) => f.kind === 'annihilation');
    for (const f of annihilationFactors) {
      if (f.id === 'factor-annihilation-2') bonus += Math.floor(bonus * 0.25);
      else bonus += Math.floor(bonus * 0.15);
    }
  }
  // 裁定：必暴 +40%
  if (hasFactorKind(s, 'verdict')) {
    bonus += Math.floor(bonus * 0.4);
  }
  return bonus;
}

// 因子格挡加成
function factorBlockBonus(s: BattleState, block: number): number {
  if (hasFactorKind(s, 'thought')) {
    return Math.floor(block * 1.5);
  }
  return block;
}

// 因子额外手牌上限
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
    if (c) s.hand.push(c);
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
      // 击杀回血遗物
      const heal = relicValue(s, 'killHeal') + relicValue(s, 'healOnKill');
      if (heal > 0) {
        s.player.hp = Math.min(s.player.maxHp, s.player.hp + heal);
      }
      // 被动：击杀+力量（Ukinovo红怒）
      if (s.character.passive.kind === 'killStrength') {
        addStatus(s.player.statuses, 'strength', s.character.passive.value ?? 2);
      }
      // 战斗事件结算
      resolveBattleEventOnKill(s, e.name);
      s.enemies.splice(i, 1);
      killed++;
    }
  }
  return killed;
}

export function createBattle(
  run: RunState,
  enemyDefs: Enemy[],
  character: Character,
): BattleState {
  const maxEnergy = 3 + relicValue({ relics: run.relics } as BattleState, 'startEnergy') + (run.caste === 'brahmin' ? 1 : 0);
  const s: BattleState = {
    enemies: enemyDefs.map((d) => makeEnemy(d, { nextEnemyUid: 0 } as BattleState)),
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
    drawPile: shuffle(run.deck.map((c) => ({ ...c }))),
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
  };
  log(s, `战斗开始！遭遇 ${enemyDefs.map((e) => e.name).join('、')}`, 'system');
  return startPlayerTurn(s);
}

export function startPlayerTurn(s: BattleState): BattleState {
  const st = clone(s);
  st.turn += 1;
  st.isPlayerTurn = true;
  st.combo = 0;
  st.cardsPlayedThisTurn = 0;
  st.player.block = 0;
  st.player.energy = st.player.maxEnergy;
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
  // 因子：思维额外手牌上限
  let handSize = (st.character.handSize ?? 5) + factorHandSizeBonus(st);
  if (st.turn === 1) {
    handSize += relicValue(st, 'firstBattleDraw');
    handSize += relicValue(st, 'battleStartDraw');
    if (st.character.passive.kind === 'initialHand') handSize += st.character.passive.value ?? 0;
  }
  const toDraw = Math.max(0, handSize - st.hand.length);
  drawCards(st, toDraw);
  // 战斗内随机事件：每2回合30%概率触发
  if (st.turn > 1 && st.turn % 2 === 0 && Math.random() < 0.3 && !st.battleEvent.kind) {
    rollBattleEvent(st);
  }
  log(st, `—— 第 ${st.turn} 回合 ——`, 'system');
  if (st.enemies.length === 0 && !st.over) st.over = 'win';
  return st;
}

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
      const hits = eff.hits ?? 1;
      for (let h = 0; h < hits; h++) {
        const target = st.enemies[targetIndex];
        if (!target) break;
        let raw = eff.value ?? 0;
        raw += getStatus(st.player.statuses, 'strength');
        if (getStatus(st.player.statuses, 'weak') > 0) raw = Math.floor(raw * 0.75);
        // 裁定因子：不再受易伤加成（必暴已替代）
        if (!hasFactorKind(st, 'verdict') && getStatus(target.statuses, 'vuln') > 0) raw = Math.floor(raw * 1.5);
        if (firstAttack && p.kind === 'firstAttackBoost') raw += p.value ?? 0;
        if (p.kind === 'comboScale') raw += (st.combo - 1) * (p.value ?? 0);
        if (st.hand.length >= 6) raw += relicValue(st, 'fullHandDamage');
        if (hasRelic(st, 'demon-core')) raw += 1;
        // 遗物：首攻额外伤害
        if (firstAttack) raw += relicValue(st, 'firstAttackDamage');
        // 卡牌升级加成
        if (card.upgradeLevel) raw += card.upgradeLevel * 2;
        // 因子伤害加成
        raw = factorDamageBonus(st, raw);
        const dealt = damageEnemy(target, raw);
        log(st, `${card.name} → ${target.name}：${dealt} 伤害`, 'player');
        // fander被动：首攻施加虚弱
        if (firstAttack && st.character.passive.kind === 'firstAttackWeak') {
          addStatus(target.statuses, 'weak', st.character.passive.value ?? 1);
        }
      }
      break;
    }
    case 'damageAll': {
      for (const target of st.enemies) {
        let raw = eff.value ?? 0;
        raw += getStatus(st.player.statuses, 'strength');
        if (getStatus(st.player.statuses, 'weak') > 0) raw = Math.floor(raw * 0.75);
        if (!hasFactorKind(st, 'verdict') && getStatus(target.statuses, 'vuln') > 0) raw = Math.floor(raw * 1.5);
        if (st.hand.length >= 6) raw += relicValue(st, 'fullHandDamage');
        if (hasRelic(st, 'demon-core')) raw += 1;
        if (card.upgradeLevel) raw += card.upgradeLevel * 2;
        raw = factorDamageBonus(st, raw);
        const dealt = damageEnemy(target, raw);
        log(st, `${card.name} → ${target.name}：${dealt} 伤害`, 'player');
      }
      break;
    }
    case 'block': {
      let v = (eff.value ?? 0) + getStatus(st.player.statuses, 'dexterity');
      if (getStatus(st.player.statuses, 'frail') > 0) v = Math.floor(v * 0.75);
      if (card.upgradeLevel) v += card.upgradeLevel * 2;
      v = factorBlockBonus(st, v);
      // 星落被动：首张格挡牌额外格挡
      if (st.cardsPlayedThisTurn === 0 && st.character.passive.kind === 'firstBlockBoost') v += st.character.passive.value ?? 0;
      st.player.block += v;
      break;
    }
    case 'heal': {
      let v = eff.value ?? 0;
      if (v < 0) {
        st.player.hp = Math.max(0, st.player.hp + v);
        log(st, `${card.name}：失去 ${-v} 生命`, 'enemy');
      } else {
        if (p.kind === 'lowHpHealBoost' && st.player.hp < st.player.maxHp * 0.3) v *= p.value ?? 2;
        st.player.hp = Math.min(st.player.maxHp, st.player.hp + v);
        log(st, `${card.name}：回复 ${v} 生命`, 'player');
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
        // fander被动：施加虚弱时额外+1层
        if (eff.status === 'weak' && st.character.passive.kind === 'weakBoost') amtActual += st.character.passive.value ?? 1;
        for (const t of targets) addStatus(t.statuses, eff.status!, amtActual);
      }
      break;
    }
    case 'draw':
      drawCards(st, eff.value ?? 0);
      break;
    case 'energy':
      st.player.energy += eff.value ?? 0;
      break;
    case 'maxHp': {
      st.player.maxHp += eff.value ?? 0;
      st.player.hp = Math.min(st.player.hp + (eff.value ?? 0), st.player.maxHp);
      break;
    }
  }
}

export function playCard(
  s: BattleState,
  handIndex: number,
  targetIndex: number,
): BattleState {
  if (s.over) return s;
  const card = s.hand[handIndex];
  if (!card) return s;
  if (card.type === 'curse' && card.effects.length === 0) return s; // 没用的虫不可打出
  let cost = card.cost;
  if (s.character.passive.kind === 'firstCardDiscount' && s.cardsPlayedThisTurn === 0) {
    cost = Math.max(0, cost - (s.character.passive.value ?? 1));
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
  for (const eff of c.effects) applyEffect(st, eff, c, targetIndex, firstAttack);
  // 召唤牌消耗：本场战斗不可再用，进入消耗堆
  if (c.type === 'summon') {
    st.exhaustedPile.push(c);
  } else {
    st.discardPile.push(c);
  }
  st.cardsPlayedThisTurn += 1;

  killDeadEnemies(st);
  if (st.enemies.length === 0 && !st.over) st.over = 'win';
  if (st.player.hp <= 0) st.over = 'lose';
  return st;
}

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
  // 85w 自动遗物：回合末随机敌人 8 伤害
  const ted = relicValue(st, 'turnEndDamage');
  if (ted > 0 && st.enemies.length > 0) {
    const t = st.enemies[Math.floor(Math.random() * st.enemies.length)];
    damageEnemy(t, ted);
    log(st, `85w 自动 → ${t.name}：${ted} 伤害`, 'player');
  }
  // 入魔核心：回合末 -1 血
  if (hasRelic(st, 'demon-core')) st.player.hp = Math.max(0, st.player.hp - 1);
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
    log(st, '🎵 音符场消散……', 'system');
    st.battleEvent = { kind: null };
  }
  if (st.battleEvent.kind === 'sacrificeDance') {
    log(st, '💃 奉献之舞结束……', 'system');
    st.battleEvent = { kind: null };
  }
  decayStatuses(st.player.statuses, true);
  // 遗物：回合结束回复
  const teHeal = relicValue(st, 'turnEndHeal');
  if (teHeal > 0) st.player.hp = Math.min(st.player.maxHp, st.player.hp + teHeal);
  // 被动：回合末格挡>0回血（星落）
  if (st.character.passive.kind === 'blockLife' && st.player.block > 0) {
    st.player.hp = Math.min(st.player.maxHp, st.player.hp + (st.character.passive.value ?? 3));
  }
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

export function enemyTurn(s: BattleState): BattleState {
  if (s.over) return s;
  const st = clone(s);
  const p = st.character.passive;
  for (const enemy of st.enemies) {
    if (st.over) break;
    enemy.block = 0; // 敌人回合开始清格挡
    const intent = enemy.intents[enemy.intentIndex % enemy.intents.length];
    switch (intent.kind) {
      case 'attack':
      case 'charge': {
        let raw = intent.value + getStatus(enemy.statuses, 'strength') + (enemy.rampAttack ?? 0);
        const freezeLayers = getStatus(enemy.statuses, 'freeze');
        raw -= freezeLayers * (2 + (p.kind === 'freezeReduceAtk' ? p.value ?? 0 : 0));
        if (getStatus(enemy.statuses, 'weak') > 0) raw = Math.floor(raw * 0.75);
        if (getStatus(st.player.statuses, 'vuln') > 0) raw = Math.floor(raw * 1.5);
        // 遗物：减伤
        raw = Math.max(0, raw - relicValue(st, 'damageReduction'));
        const dealt = damagePlayer(st.player, Math.max(0, raw));
        log(st, `${enemy.name} 攻击你：${dealt} 伤害`, 'enemy');
        // 遗物：荆棘反伤
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

// ===== 战斗内随机事件 =====
function rollBattleEvent(st: BattleState) {
  const events: BattleState['battleEvent']['kind'][] = ['noteField', 'shinyGoblin', 'sacrificeDance'];
  const pick = events[Math.floor(Math.random() * events.length)];
  st.battleEvent = { kind: pick };
  switch (pick) {
    case 'noteField':
      st.battleEvent.data = 15; // 击杀奖励绳子数
      log(st, '🎵 音符场出现！本回合击杀敌人将额外获得绳子！', 'crit');
      break;
    case 'shinyGoblin': {
      // 召唤一只闪耀哥布林（低血高奖）
      const goblinDef: Enemy = {
        id: 'shiny-goblin',
        name: '闪耀哥布林',
        emoji: '👺',
        hp: 20,
        zone: 'strike',
        intents: [{ kind: 'attack', value: 6 }],
        desc: '限时敌人，击杀获3琥珀！头灯闪烁时注意背对！',
        flavor: '「焦点时刻：击杀闪耀哥布林获得回响余音」',
      };
      const goblin = makeEnemy(goblinDef, st);
      st.enemies.push(goblin);
      st.battleEvent.data = goblin.uid.length; // 标记
      log(st, '👺 闪耀哥布林出现！击杀它获得 3 琥珀！', 'crit');
      break;
    }
    case 'sacrificeDance':
      st.battleEvent.data = 8; // 治疗奖励意志数
      log(st, '💃 奉献之舞！本回合每回复1HP，战斗结束获得1意志（最多8）', 'crit');
      break;
  }
}

// 处理战斗事件结算（在击杀敌人或回合结束时调用）
export function resolveBattleEventOnKill(st: BattleState, enemyName: string): void {
  if (!st.battleEvent.kind) return;
  if (st.battleEvent.kind === 'noteField') {
    const rope = st.battleEvent.data ?? 15;
    log(st, `🎵 音符场：击杀 ${enemyName}，获得 ${rope} 绳子！`, 'crit');
    st.eventRewards.rope = (st.eventRewards.rope ?? 0) + rope;
    st.battleEvent = { kind: null };
    return;
  }
  if (st.battleEvent.kind === 'shinyGoblin' && enemyName === '闪耀哥布林') {
    log(st, '👺 击杀闪耀哥布林！获得 3 琥珀！', 'crit');
    st.eventRewards.amber = (st.eventRewards.amber ?? 0) + 3;
    st.battleEvent = { kind: null };
    return;
  }
}

// 随机抽一张奖励卡（按稀有度权重，受达利特解放令影响）
export function rollRewardCard(rareBoost: boolean): Card {
  const r = Math.random();
  let rarity: Card['rarity'];
  if (rareBoost) {
    if (r < 0.35) rarity = 'rare';
    else if (r < 0.65) rarity = 'epic';
    else if (r < 0.90) rarity = 'legendary';
    else rarity = 'common';
  } else {
    // 5级品质：basic(15%) common(35%) rare(28%) epic(15%) legendary(7%)
    if (r < 0.15) rarity = 'basic';
    else if (r < 0.50) rarity = 'common';
    else if (r < 0.78) rarity = 'rare';
    else if (r < 0.93) rarity = 'epic';
    else rarity = 'legendary';
  }
  let pool = REWARD_POOL.filter((c) => c.rarity === rarity);
  if (pool.length === 0) pool = REWARD_POOL.filter((c) => c.rarity === 'common');
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

export function getCard(id: string): Card {
  return CARD_MAP[id];
}
