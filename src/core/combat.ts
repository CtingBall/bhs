// ============================================================================
// 对战引擎（Combat Engine & Battle Timeline）
// 分相确定性状态机：BattleInit → RoundStart → PlayerTurnStart → PlayerAction
//   → AllyAction → EnemyAction → RoundEnd → (Victory / Defeat)
// 动作队列：原子动作 FIFO 结算 + 防递归熔断（由 actions.ts 解释器保证）
// 全部随机判定绑定 RNG_Deck / RNG_Combat，支持种子级复现
// ============================================================================

import { RngBank } from './rng';
import { Unit, EnemyIntent } from './units';
import { HookBus } from './hooks';
import type { DamageRequest, DamageResult, DamageType } from './valuePipeline';
import { resolveDamage } from './valuePipeline';
import type { ActionNode, ActionFilter, ResourceOperation, TargetSelector } from './actions';
import { executeActions } from './actions';
import type { CardInstance, CardDef } from './cards';
import { getCardDef, upgradeCardDef } from './cards';
import { getBuffDef } from './buffs';
import { PileManager } from './piles';

export type CombatPhase =
  | 'BattleInit' | 'RoundStart' | 'PlayerTurnStart' | 'PlayerAction'
  | 'AllyAction' | 'EnemyAction' | 'RoundEnd' | 'Victory' | 'Defeat';

export interface IntentStep {
  intent: EnemyIntent;
  action: ActionNode;
}

/** 怪物行为树（v1：固定循环 + 可选血量分支） */
export interface BehaviorDef {
  type: 'loop';
  loop: IntentStep[];
  /** 血量低于该比例时切换到 alternateLoop（Boss 二阶段） */
  hpThreshold?: number;
  alternateLoop?: IntentStep[];
}

export interface CombatViewEvent {
  type: 'phase' | 'cardPlayed' | 'damage' | 'heal' | 'block' | 'buff' | 'resource'
    | 'draw' | 'discard' | 'log' | 'intent' | 'victory' | 'defeat' | 'kill' | 'vfx'
    | 'allySummon' | 'allyActed';
  data?: Record<string, unknown>;
}

export interface CombatOptions {
  rng: RngBank;
  player: Unit;
  enemies: Unit[];
  /** 敌人行为表（与 enemies 一一对应，或按 unitId 匹配） */
  behaviors: Record<string, BehaviorDef>;
  softEnrageFrom?: number;
  bossDamageCapRatio?: number;
  onEvent?: (ev: CombatViewEvent) => void;
}

export class Combat {
  rng: RngBank;
  hooks = new HookBus();
  piles: PileManager;
  player: Unit;
  enemies: Unit[] = [];
  behaviors: Record<string, BehaviorDef>;
  /** 友军随从（森语者树人/神射手野狼等） */
  allies: Unit[] = [];
  /** 召唤物序号（保证 id 唯一，避免死亡移除后 id 回落复用） */
  summonSeq = 0;
  phase: CombatPhase = 'BattleInit';
  round = 0;
  energy: number;
  maxEnergy: number;
  /** 每回合发牌数（杀戮尖塔规则：固定抽 N 张，手牌持有无上限） */
  handLimit: number;
  noDrawThisTurn = false;
  /** 每回合初始抽牌惩罚（进阶难度） */
  drawPenalty = 0;
  /** 本回合已打出卡牌数（K5-4 不动明王限制） */
  cardsPlayedThisTurn = 0;
  ended = false;
  victory = false;
  /** 最近一次出牌失败的原因（UI 提示用） */
  lastPlayError = '';
  softEnrageFrom: number;
  bossDamageCapRatio: number;
  logLines: string[] = [];
  onEvent?: (ev: CombatViewEvent) => void;
  private suppressProcs = false;

  constructor(opts: CombatOptions) {
    this.rng = opts.rng;
    this.player = opts.player;
    this.enemies = opts.enemies;
    this.behaviors = opts.behaviors;
    this.maxEnergy = opts.player.state['maxEnergy'] as number ?? 3;
    this.energy = this.maxEnergy;
    this.handLimit = opts.player.state['handLimit'] as number ?? 5;
    this.softEnrageFrom = opts.softEnrageFrom ?? 12;
    this.bossDamageCapRatio = opts.bossDamageCapRatio ?? 0.25;
    this.onEvent = opts.onEvent;
    this.piles = new PileManager(this.rng.deck);
    // Boss 阶段锁血阈值（一阶段内单次伤害不可突破该血线）
    for (const e of this.enemies) {
      const behavior = this.behaviors[e.id];
      if (behavior?.hpThreshold !== undefined) {
        e.state['phaseGate'] = behavior.hpThreshold;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 事件与日志
  // ---------------------------------------------------------------------------

  private emit(type: CombatViewEvent['type'], data?: Record<string, unknown>): void {
    this.onEvent?.({ type, data });
  }

  logText(text: string): void {
    this.logLines.push(text);
    this.emit('log', { text });
  }

  // ---------------------------------------------------------------------------
  // 战斗生命周期
  // ---------------------------------------------------------------------------

  /** 用玩家牌组初始化并开始战斗 */
  start(deckEntries: Array<{ defId: string; level?: 0 | 1 | 2 }>): void {
    this.piles.initDeck(deckEntries);
    this.phase = 'BattleInit';
    this.hooks.trigger('OnCombatStart', { combat: this });
    this.beginRound();
  }

  private beginRound(): void {
    this.round++;
    this.phase = 'RoundStart';
    this.hooks.trigger('OnRoundStart', { combat: this });
    this.startPlayerTurn();
  }

  private startPlayerTurn(): void {
    this.phase = 'PlayerTurnStart';
    // 护甲清零（巨岩躯体/永恒之壁等可保留部分）
    const retain = this.player.state['retainBlockPct'] as number | undefined;
    this.player.block = retain ? Math.floor(this.player.block * retain) : 0;
    this.energy = this.maxEnergy;
    this.noDrawThisTurn = false;
    this.cardsPlayedThisTurn = 0;
    // 本回合格挡/减免量追踪（岩怒之击）
    this.player.state['mitigatedThisTurn'] = 0;
    // HOT 跳字（滋养等）
    this.tickTurnStartBuffs();
    // 职业自产与回合开始逻辑
    this.hooks.trigger('OnPlayerTurnStart', { combat: this });
    // 明牌意图推导
    this.deriveIntents();
    // 每回合固定抽取 handLimit 张（杀戮尖塔规则：发牌 5 张，手牌无上限；进阶难度可减少初始抽牌）
    const toDraw = this.handLimit - this.drawPenalty;
    if (toDraw > 0) this.drawCards(toDraw);
    this.phase = 'PlayerAction';
    this.emit('phase', { phase: this.phase, round: this.round });
  }

  private tickTurnStartBuffs(): void {
    for (const u of this.allUnits()) {
      const nourish = u.getBuffStacks('nourish');
      if (nourish > 0) {
        this.healRaw(u, nourish);
        u.consumeBuff('nourish', 1);
      }
      // 中毒：回合开始真伤（星痕共鸣「娜宝」毒系机制）
      const poison = u.getBuffStacks('poison');
      if (poison > 0) {
        this.applyRawDamage(null, u, { base: poison, type: 'true', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 });
        u.consumeBuff('poison', 1);
      }
    }
  }

  /** 推导全场敌人下一动意图（明牌） */
  private deriveIntents(): void {
    for (const e of this.enemies) {
      if (e.isDead()) continue;
      if (e.hasBuff('stun')) {
        e.intent = { kind: 'stun', displayText: '被冻结，跳过行动' };
        continue;
      }
      const behavior = this.behaviors[e.id];
      if (!behavior) { e.intent = null; continue; }
      const loop = this.pickLoop(behavior, e);
      const idx = (e.state['aiIndex'] as number) ?? 0;
      const step = loop[((idx % loop.length) + loop.length) % loop.length];
      e.intent = step.intent;
      e.state['aiIndex'] = idx + 1;
      e.state['pendingAction'] = step.action;
    }
    this.emit('intent', {});
  }

  private pickLoop(behavior: BehaviorDef, enemy: Unit): IntentStep[] {
    if (behavior.hpThreshold !== undefined && behavior.alternateLoop) {
      const ratio = enemy.hp / enemy.maxHp;
      if (ratio <= behavior.hpThreshold) {
        // 触发阶段转换（一次性）
        if (!enemy.state['phaseShifted']) {
          enemy.state['phaseShifted'] = true;
          this.emit('log', { text: `${enemy.name} 进入了第二阶段！` });
        }
        return behavior.alternateLoop;
      }
    }
    return behavior.loop;
  }

  // ---------------------------------------------------------------------------
  // 玩家操作
  // ---------------------------------------------------------------------------

  /** 卡牌实际费用（基础费用 + 职业修正 + 临时覆盖） */
  effectiveCost(card: CardInstance): number {
    let cost = card.cost;
    if (this.costModifier) cost += this.costModifier(card);
    if (card.tempCostOverride !== null) cost = card.tempCostOverride;
    return Math.max(0, cost);
  }

  costModifier: ((card: CardInstance) => number) | null = null;

  /** 打出卡牌。targetId 为指向性目标 uid（可空）。返回是否成功打出。 */
  playCard(uid: string, targetUid?: string): boolean {
    this.lastPlayError = '';
    if (this.phase !== 'PlayerAction') { this.lastPlayError = '现在不能出牌'; return false; }
    const card = this.piles.findInHand(uid);
    if (!card) { this.lastPlayError = '卡牌不存在'; return false; }
    const def: CardDef = upgradeCardDef(getCardDef(card.defId), card.upgradeLevel);
    if (def.unplayable) { this.lastPlayError = '这张牌无法打出'; return false; }
    const cost = this.effectiveCost(card);
    if (this.energy < cost) { this.lastPlayError = `能量不足（需要 ${cost} 点）`; return false; }
    // 每回合出牌上限（K5-4 不动明王·天崩地裂）
    const cardLimit = this.player.state['cardLimitPerTurn'] as number | undefined;
    if (cardLimit && this.cardsPlayedThisTurn >= cardLimit) {
      this.lastPlayError = `本回合最多打出 ${cardLimit} 张牌`;
      return false;
    }
    // 目标合法性
    const target = targetUid ? this.findUnit(targetUid) : null;
    if (def.targetType === 'SingleEnemy' && !(target && !target.isDead() && target.hasTag('enemy'))) {
      this.lastPlayError = '请先选择目标敌人';
      return false;
    }
    // 前置资源要求（一闪等）
    const req = def.requires;
    if (req && this.getResource(this.player, req.resourceId) < req.min) {
      this.lastPlayError = '需要的资源不足';
      return false;
    }
    // 召唤牌由 CardDef.exhaust 负责一次性规则；允许不同卡牌/升级分支继续召唤。
    // 扣费 / 移出手牌
    this.energy -= cost;
    this.piles.removeFromHand(uid);
    this.player.state['lastPlayedCardId'] = card.defId;
    this.cardsPlayedThisTurn++;
    this.emit('cardPlayed', { uid, cost });

    // 执行动作树
    executeActions(Array.isArray(def.actionTree) ? def.actionTree : [def.actionTree], {
      api: this,
      source: this.player,
      primary: target,
      variables: {},
      depth: 0,
    });

    // OnCardPlayed 钩子（月刃追击、形态切换等）
    this.hooks.trigger('OnCardPlayed', { combat: this, card, target });

    // 去向
    if (def.cardType === 'Power') {
      this.piles.moveToExhaust(card);
    } else if (card.exhaust) {
      this.piles.moveToExhaust(card);
    } else {
      this.piles.moveToDiscard(card);
    }
    this.emit('discard', { uid, to: def.cardType === 'Power' || card.exhaust ? 'exhaust' : 'discard' });

    this.checkEnd();
    return true;
  }

  /** 结束回合 → 友军行动 → 敌人行动 → 回合结算 */
  endTurn(): void {
    if (this.phase !== 'PlayerAction' || this.ended) return;
    this.hooks.trigger('OnPlayerTurnEnd', { combat: this });
    if (this.ended) return;
    this.phase = 'AllyAction';
    this.emit('phase', { phase: this.phase });
    this.alliesAct();
    if (this.ended) return;
    this.hooks.trigger('OnAllyActed', { combat: this });
    if (this.ended) return;
    this.enemyAct();
  }

  // ---------------------------------------------------------------------------
  // 敌人行动
  // ---------------------------------------------------------------------------

  private enemyAct(): void {
    this.phase = 'EnemyAction';
    this.emit('phase', { phase: this.phase });
    const alive = this.enemies.filter((e) => e.isAlive()).sort((a, b) => a.slot - b.slot);
    for (const e of alive) {
      if (this.ended) return;
      if (e.hasBuff('stun')) {
        e.removeBuff('stun');
        this.logText(`${e.name} 被冻结，无法行动`);
        continue;
      }
      e.clearBlock();
      const action = e.state['pendingAction'] as ActionNode | undefined;
      if (!action) continue;
      executeActions(Array.isArray(action) ? action : [action], {
        api: this,
        source: e,
        primary: this.player,
        variables: {},
        depth: 0,
      });
    }
    if (!this.ended) this.finishRound();
  }

  // ---------------------------------------------------------------------------
  // 回合结算
  // ---------------------------------------------------------------------------

  private finishRound(): void {
    this.phase = 'RoundEnd';
    this.emit('phase', { phase: this.phase, round: this.round });
    // DOT：燃烧（回合结束真实伤害，层数 -1；K4-6 自焚地狱可双倍结算且不衰减）
    const burnEternal = this.player.state['burnEternal'] === true;
    const burnTicks = burnEternal ? 2 : 1;
    for (const u of this.allUnits()) {
      const burn = u.getBuffStacks('burn');
      if (burn > 0 && !u.isDead()) {
        for (let t = 0; t < burnTicks; t++) {
          this.applyRawDamage(null, u, { base: burn, type: 'true', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 });
        }
        if (!burnEternal) u.consumeBuff('burn', 1);
      }
    }
    // 持续回合型 Buff 衰减
    for (const u of this.allUnits()) u.decayTurnTimers();
    // 光铸身躯光明能量自然衰减（由职业运行时 OnRoundEnd 处理）
    this.hooks.trigger('OnRoundEnd', { combat: this });
    // 营地祭仪回合数递减
    const campRounds = this.player.state['campAttackRounds'] as number | undefined;
    if (campRounds !== undefined && campRounds > 0) this.player.state['campAttackRounds'] = campRounds - 1;
    // 手牌清理：保留牌留下，其余逐张触发弃牌钩子，确保弃牌联动不漏算。
    const discardedAtTurnEnd = this.piles.hand.filter((card) => !card.retain);
    this.piles.discardHandAtTurnEnd();
    for (const card of discardedAtTurnEnd) {
      this.hooks.trigger('OnCardDiscarded', { combat: this, card, reason: 'TurnEnd' });
    }
    this.emit('discard', { to: 'discard', allHand: true, count: discardedAtTurnEnd.length });

    this.checkEnd();
    if (!this.ended) this.beginRound();
  }

  // ---------------------------------------------------------------------------
  // 胜负判定
  // ---------------------------------------------------------------------------

  private checkEnd(): void {
    if (this.ended) return;
    const allDead = this.enemies.every((e) => e.isDead());
    if (allDead) {
      this.ended = true;
      this.victory = true;
      this.phase = 'Victory';
      this.hooks.trigger('OnCombatEnd', { combat: this, victory: true });
      this.emit('victory', {});
      return;
    }
    if (this.player.isDead()) {
      this.ended = true;
      this.victory = false;
      this.phase = 'Defeat';
      this.hooks.trigger('OnPlayerDefeat', { combat: this });
      this.hooks.trigger('OnCombatEnd', { combat: this, victory: false });
      this.emit('defeat', {});
    }
  }

  // ---------------------------------------------------------------------------
  // CombatApi 实现
  // ---------------------------------------------------------------------------

  get rngCombat() {
    return this.rng.combat;
  }

  resolveTargets(selector: TargetSelector, source: Unit, primary: Unit | null, filters?: ActionFilter[]): Unit[] {
    let pool: Unit[];
    const isPlayerSide = source.isPlayer || source.hasTag('ally');
    switch (selector) {
      case 'Self': pool = [source]; break;
      case 'SingleEnemy': {
        if (isPlayerSide) {
          // 玩家攻击：优先选中目标，否则第一个存活敌人
          const candidates = this.enemies.filter((e) => e.isAlive());
          pool = primary && primary.hasTag('enemy') && primary.isAlive()
            ? [primary]
            : candidates.length ? [candidates[0]] : [];
        } else {
          // 敌人攻击：目标永远是玩家（v1 无前排随从承伤）
          pool = primary && primary.isPlayer && primary.isAlive() ? [primary] : this.player.isAlive() ? [this.player] : [];
        }
        break;
      }
      case 'AllEnemies': pool = this.enemies.filter((e) => e.isAlive()); break;
      case 'RandomEnemy': {
        if (isPlayerSide) {
          const candidates = this.enemies.filter((e) => e.isAlive());
          pool = candidates.length ? [this.rng.combat.pick(candidates)] : [];
        } else {
          pool = this.player.isAlive() ? [this.player] : [];
        }
        break;
      }
      case 'AllAllies': pool = this.allUnits().filter((u) => (u.isPlayer || u.hasTag('ally')) && u.isAlive()); break;
      case 'SingleAlly': pool = (primary && (primary.isPlayer || primary.hasTag('ally')) && primary.isAlive()) ? [primary] : [this.player]; break;
      case 'LowestHpUnit': {
        const candidates = isPlayerSide ? this.enemies.filter((e) => e.isAlive()) : [this.player];
        pool = candidates.length ? [candidates.reduce((a, b) => (a.hp <= b.hp ? a : b))] : [];
        break;
      }
      case 'HighestAttackUnit': {
        const candidates = this.enemies.filter((e) => e.isAlive());
        pool = candidates.length ? [candidates.reduce((a, b) => ((a.intent?.damage ?? 0) >= (b.intent?.damage ?? 0) ? a : b))] : [];
        break;
      }
      case 'AdjacentEnemies': {
        const alive = this.enemies.filter((e) => e.isAlive());
        const base = primary && primary.hasTag('enemy') ? primary : alive[0];
        if (!base) { pool = []; break; }
        pool = alive.filter((e) => Math.abs(e.slot - base.slot) === 1);
        break;
      }
      default: pool = [];
    }
    // 过滤器
    if (filters && filters.length) {
      pool = pool.filter((u) => {
        for (const f of filters) {
          switch (f.filter_type) {
            case 'ExcludeSelf': if (u.id === source.id) return false; break;
            case 'HasBuff': if (!u.hasBuff(f.buff_id!)) return false; break;
            case 'HasTag': if (!u.hasTag(f.tag as never)) return false; break;
            case 'HpPercentLessThan': if ((u.hp / u.maxHp) * 100 >= (f.value ?? 50)) return false; break;
            default: return false;
          }
        }
        return true;
      });
    }
    return pool;
  }

  dealDamage(source: Unit | null, target: Unit, req: DamageRequest, splash?: number): DamageResult {
    if (target.isDead()) return { raw: 0, absorbedByRatio: 0, fixed: 0, remaining: 0 };
    // 雷影剑士双形态：长刀 +2 锋锐（单体）；镰刀 40% 顺劈溅射（单体）
    if (source === this.player && req.singleTarget) {
      const form = this.player.state['form'] as string | undefined;
      // K2-1 无形雷域：双形态同时常驻
      if (this.player.state['dualForm'] === true) {
        req.flat += 2;
        if (splash === undefined) splash = 0.4;
      } else {
        if (form === 'katana') req.flat += 2;
        if (form === 'scythe' && splash === undefined) splash = 0.4;
      }
      // 赤炎狂战士双斧顺劈：单体攻击对相邻敌人溅射 30%
      const cleave = this.player.state['cleave'] as number | undefined;
      if (cleave && splash === undefined) splash = cleave;
    }
    // 营地祭仪：前 N 回合攻击伤害加成（雷影剑士·雷纹开刃）
    if (source === this.player) {
      const campPct = this.player.state['campAttackPct'] as number | undefined;
      const campRounds = (this.player.state['campAttackRounds'] as number | undefined) ?? 0;
      if (campPct && campRounds > 0) req.percents.push(campPct);
    }
    // Boss 软狂暴：伤害每回合 +50%
    if (source?.hasTag('boss') && this.round >= this.softEnrageFrom) {
      req.base *= 1 + 0.5 * (this.round - this.softEnrageFrom);
    }
    // 进阶难度：怪物攻击倍率
    const ascDmg = source?.state['ascDmg'] as number | undefined;
    if (source?.hasTag('enemy') && ascDmg) {
      req.base *= ascDmg;
    }
    // 受击前 Hook（大天赋/遗物可改写数值；光铸身躯调整减伤参数）
    this.hooks.trigger('BeforeDamageCalculated', { combat: this, source, target, request: req });
    this.hooks.trigger('BeforeDamageReceived', { combat: this, source, target, request: req });

    // 暴击判定（神射手体系）：施法者暴击率 × 一次性加成
    let isCrit = false;
    if (source === this.player && req.type !== 'true') {
      const critChance = ((this.player.state['critChance'] as number | undefined) ?? 0) + ((this.player.state['attackCritBonus'] as number | undefined) ?? 0);
      if (critChance > 0 && this.rng.combat.chance(Math.min(1, critChance))) {
        isCrit = true;
        const overflow = critChance - 1;
        // K6-7 超限暴击：溢出部分按 1:2 转暴伤
        const critMult = (this.player.state['critMult'] as number | undefined) ?? 1.5;
        req.defenderMults.push(critMult + (overflow > 0 ? overflow * 2 : 0));
      }
      this.player.state['attackCritBonus'] = 0; // 一次性加成消耗
    }

    const def = {
      reductionRatio: target.reductionRatio,
      fixedReduction: target.fixedReduction,
      maxHp: target.maxHp,
    };
    let result = resolveDamage(req, def);

    // Boss 单次伤害上限（最大生命 25%）
    if (target.hasTag('boss') && result.remaining > 0) {
      const cap = Math.floor(target.maxHp * this.bossDamageCapRatio);
      result = { ...result, remaining: Math.min(result.remaining, cap) };
    }
    // Boss 阶段锁血（一阶段内不可低于阈值线）
    if (target.hasTag('boss')) {
      const threshold = target.state['phaseGate'] as number | undefined;
      if (threshold !== undefined && !target.state['phaseShifted'] && result.remaining > 0) {
        const minHp = Math.floor(target.maxHp * threshold);
        const maxRemaining = Math.max(0, target.hp - minHp);
        result = { ...result, remaining: Math.min(result.remaining, maxRemaining) };
      }
    }

    // 屏障 → 护甲 → 生命
    let remaining = result.remaining;
    let barrierAbsorb = 0;
    let blockAbsorb = 0;
    if (remaining > 0 && target.barrier > 0) {
      barrierAbsorb = Math.min(target.barrier, remaining);
      target.barrier -= barrierAbsorb;
      remaining -= barrierAbsorb;
    }
    if (remaining > 0 && target.block > 0) {
      blockAbsorb = Math.min(target.block, remaining);
      target.block -= blockAbsorb;
      remaining -= blockAbsorb;
    }
    const hpDamage = remaining;
    if (hpDamage > 0) {
      target.hp = Math.max(0, target.hp - hpDamage);
      target.state['absorbedTotal'] = ((target.state['absorbedTotal'] as number) ?? 0) + result.absorbedByRatio;
    }
    // 格挡/减免量追踪（巨刃守护者·岩怒之击）
    if (target === this.player) {
      const mitigated = (this.player.state['mitigatedThisTurn'] as number | undefined) ?? 0;
      this.player.state['mitigatedThisTurn'] = mitigated + result.absorbedByRatio + result.fixed + barrierAbsorb + blockAbsorb;
    }

    const final: DamageResult = { ...result, remaining: hpDamage };

    // 荆棘反震：受击方反击攻击者（每层 1 点真实伤害，文档：荆棘狂暴巨兽 3 层反震 3 点）
    if (hpDamage > 0 && target.hasBuff('thorns') && source && !this.suppressProcs) {
      this.procDamage(target, source, target.getBuffStacks('thorns'), 'true');
    }

    // 感电溅射（受击方）
    if (hpDamage > 0 && target.hasBuff('electrified') && !this.suppressProcs) {
      const stacks = target.getBuffStacks('electrified');
      const others = this.enemies.filter((e) => e.isAlive() && e.id !== target.id);
      for (const o of others) {
        this.applyRawDamage(source, o, { base: stacks, type: 'true', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 });
      }
      target.consumeBuff('electrified', 1);
    }

    // 受击后 Hook（千雷闪影、冷酷征伐、吸血反哺等）
    this.hooks.trigger('AfterDamageDealt', { combat: this, source, target, result: final, request: req, isCrit });
    this.emit('damage', { targetId: target.id, amount: hpDamage, raw: final.raw, type: req.type, isCrit });

    // 击杀判定
    if (target.isDead() && !this.suppressProcs) {
      this.handleUnitDeath(target, source);
    }
    this.checkEnd();

    // 顺劈溅射（镰刀形态等）
    if (splash !== undefined && splash > 0 && !this.suppressProcs) {
      const others = this.enemies.filter((e) => e.isAlive() && e.id !== target.id);
      for (const o of others) {
        this.applyRawDamage(source, o, { ...req, base: req.base * splash });
      }
    }
    return final;
  }

  /** 免死判定：返回 true 表示已拦截 */
  private handleUnitDeath(target: Unit, killer: Unit | null): void {
    // OnFatalDamageTaken：拦截器可将 hp 拉回（免死）
    let saved = false;
    this.hooks.trigger('OnFatalDamageTaken', { combat: this, target, source: killer, save: (hp: number) => { target.hp = Math.max(1, Math.min(target.maxHp, hp)); saved = true; } });
    if (saved) {
      this.logText(`${target.name} 触发了免死！`);
      this.emit('log', { text: `${target.name} 触发了免死！` });
      return;
    }
    this.emit('kill', { unitId: target.id, killerId: killer?.id ?? null });
    this.hooks.trigger('OnUnitKilled', { combat: this, victim: target, killer });
  }

  /** 无钩子的裸伤害应用（DOT、感电溅射、顺劈等，避免递归） */
  private applyRawDamage(source: Unit | null, target: Unit, req: DamageRequest): number {
    if (target.isDead()) return 0;
    const def = { reductionRatio: target.reductionRatio, fixedReduction: target.fixedReduction, maxHp: target.maxHp };
    const result = resolveDamage(req, def);
    let remaining = result.remaining;
    if (remaining > 0 && target.barrier > 0) {
      const absorb = Math.min(target.barrier, remaining);
      target.barrier -= absorb;
      remaining -= absorb;
    }
    if (remaining > 0 && target.block > 0) {
      const absorb = Math.min(target.block, remaining);
      target.block -= absorb;
      remaining -= absorb;
    }
    if (remaining > 0) {
      target.hp = Math.max(0, target.hp - remaining);
      if (target.isDead()) this.handleUnitDeath(target, source);
    }
    this.emit('damage', { targetId: target.id, amount: remaining, type: req.type });
    return remaining;
  }

  /** 职业被动/能力触发的程序化伤害（触发 AfterDamageDealt 等 Hook 前先走裸伤害，避免无限递归） */
  procDamage(source: Unit, target: Unit, base: number, type: DamageType = 'true'): number {
    if (this.suppressProcs) return 0;
    this.suppressProcs = true;
    try {
      const dmg = this.applyRawDamage(source, target, { base, type, flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 });
      return dmg;
    } finally {
      this.suppressProcs = false;
    }
  }

  gainBlock(target: Unit, amount: number): number {
    const gained = target.gainBlock(amount);
    this.hooks.trigger('OnBlockGained', { combat: this, target, amount: gained });
    this.emit('block', { unitId: target.id, amount: gained });
    return gained;
  }

  heal(target: Unit, amount: number): number {
    const healed = target.heal(amount);
    this.hooks.trigger('OnHealed', { combat: this, target, amount: healed });
    if (healed < amount) {
      this.hooks.trigger('OnOverheal', { combat: this, target, overhealed: amount - healed });
    }
    this.emit('heal', { unitId: target.id, amount: healed });
    return healed;
  }

  private healRaw(target: Unit, amount: number): number {
    return target.heal(amount);
  }

  modifyEnergy(_source: Unit, amount: number): void {
    this.energy = Math.max(0, this.energy + amount);
    this.emit('resource', { id: 'energy', value: this.energy });
  }

  getResource(unit: Unit, resourceId: string): number {
    return unit.resources[resourceId] ?? 0;
  }

  modifyResource(unit: Unit, resourceId: string, op: ResourceOperation, amount: number): void {
    const current = unit.resources[resourceId] ?? 0;
    const cap = unit.resourceCaps[resourceId] ?? Infinity;
    let next = current;
    switch (op) {
      case 'Add': next = Math.min(cap, current + amount); break;
      case 'Consume': next = Math.max(0, current - amount); break;
      case 'Set': next = Math.max(0, Math.min(cap, amount)); break;
      case 'Multiply': next = Math.max(0, Math.min(cap, current * amount)); break;
    }
    unit.resources[resourceId] = next;
    this.hooks.trigger('OnResourceChanged', { combat: this, unit, resourceId, before: current, after: next, op });
    this.emit('resource', { id: resourceId, value: next, unitId: unit.id });
  }

  drawCards(amount: number): void {
    if (this.noDrawThisTurn) {
      this.logText('本回合无法再抽牌（超高出力·蓄雷）');
      return;
    }
    const drawn = this.piles.drawCards(amount, () => {
      this.hooks.trigger('OnDeckShuffled', { combat: this });
    });
    for (const card of drawn) {
      // 临时费用只对本次抽牌生效；进入弃牌堆后不能把旧回合减费带回下一轮。
      card.tempCostOverride = null;
      this.piles.addToHand(card);
      // 诅咒牌：抽到即扣血
      if (getCardDef(card.defId).cardType === 'Curse') {
        this.applyRawDamage(this.player, this.player, { base: 3, type: 'true', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 });
        this.logText('虚空寄生虫啃噬了你（-3 生命）');
      }
      this.hooks.trigger('OnCardDrawn', { combat: this, card });
    }
    this.emit('draw', { count: drawn.length });
  }

  discardHand(): void {
    for (const card of [...this.piles.hand]) {
      this.piles.removeFromHand(card.uid);
      this.piles.moveToDiscard(card);
      this.hooks.trigger('OnCardDiscarded', { combat: this, card, reason: 'Manual' });
    }
    this.emit('discard', { to: 'discard' });
  }

  exileCard(uid: string): void {
    const card = this.piles.removeFromHand(uid) ?? this.piles.fetchFromPile(uid, 'discard');
    if (card) {
      this.piles.moveToExhaust(card);
      this.hooks.trigger('OnCardExiled', { combat: this, card });
      this.emit('discard', { uid, to: 'exhaust' });
    }
  }

  fetchFromPile(cardId: string, from: 'draw' | 'discard' | 'exhaust', costOverride: number | null): boolean {
    const card = this.piles.fetchFromPile(cardId, from);
    if (!card) return false;
    // 检索是新的牌堆流转事件：没有显式覆盖时，不继承旧回合临时费用。
    card.tempCostOverride = costOverride;
    this.piles.addToHand(card);
    this.emit('draw', { count: 1 });
    return true;
  }

  generateCard(cardId: string, destination: 'hand' | 'drawTop' | 'discard'): void {
    const card = this.piles.createCard(cardId);
    if (destination === 'hand') {
      this.piles.addToHand(card);
    } else if (destination === 'drawTop') {
      this.piles.addToDrawTop(card);
    } else {
      this.piles.addToDiscard(card);
    }
    this.emit('draw', { count: 1 });
  }

  applyBuff(target: Unit, buffId: string, stacks: number): void {
    // K4-7 狂炎血髓：炎魔形态免疫负面状态
    if (target === this.player && this.player.state['soulFiend'] === true) {
      try {
        const def = getBuffDef(buffId);
        if (def.isDebuff) return;
      } catch { /* 未知 buff 直接放行 */ }
    }
    target.applyBuff(buffId, stacks);
    this.emit('buff', { unitId: target.id, buffId, stacks });
  }

  consumeBuff(target: Unit, buffId: string, amount: number): number {
    const consumed = target.consumeBuff(buffId, amount);
    this.emit('buff', { unitId: target.id, buffId, stacks: -consumed });
    return consumed;
  }

  clearBlock(target: Unit): void {
    target.clearBlock();
  }

  gainBarrier(target: Unit, amount: number): number {
    const gained = Math.max(0, Math.round(amount));
    target.barrier += gained;
    this.emit('block', { unitId: target.id, amount: gained, barrier: true });
    return gained;
  }

  modifyMaxHp(target: Unit, amount: number, heal: boolean): void {
    target.maxHp = Math.max(1, target.maxHp + amount);
    if (heal) target.hp = Math.min(target.maxHp, target.hp + amount);
    this.emit('resource', { id: 'maxhp', value: target.maxHp, unitId: target.id });
  }

  switchForm(form: string): void {
    const prev = (this.player.state['form'] as string | undefined) ?? 'katana';
    let next = form;
    if (form === 'toggle') next = prev === 'katana' ? 'scythe' : 'katana';
    if (prev !== next) {
      this.player.state['form'] = next;
      this.emit('resource', { id: 'form', value: next, unitId: this.player.id });
    }
  }

  setState(key: string, value: unknown): void {
    this.player.state[key] = value;
  }

  /** 自伤（赤炎狂战士卖血卡），触发魂槽积累等 Hook */
  loseHpSelf(amount: number): void {
    const dmg = Math.min(amount, this.player.hp - 1); // 不致死
    const hpLost = this.applyRawDamage(this.player, this.player, { base: dmg, type: 'true', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 });
    if (hpLost > 0) {
      this.hooks.trigger('AfterDamageDealt', { combat: this, source: this.player, target: this.player, result: { remaining: hpLost, absorbedByRatio: 0, raw: hpLost, fixed: 0 }, request: { base: dmg, type: 'true' as const, flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1 } });
    }
  }

  summonAlly(params: { unitId: string; name: string; maxHp: number; autoAttack: number; portrait?: string; hits?: number; energyCost?: number; targetLowest?: boolean; lifesteal?: number; allowMultiple?: boolean }): void {
    // 唯一性约束：同 unitId 的召唤物在场（存活）时不再重复召唤（大天赋显式声明 allowMultiple 的除外）
    if (!params.allowMultiple && this.allies.some((a) => a.isAlive() && a.state['summonKey'] === params.unitId)) {
      this.logText(`${params.name} 已在战场上（同类召唤物唯一）`);
      return;
    }
    const ally = new Unit({
      id: params.unitId + '-' + this.summonSeq,
      name: params.name,
      maxHp: params.maxHp,
      hp: params.maxHp,
      tags: ['ally', 'summon', 'frontline'],
      slot: this.allies.length,
    });
    this.summonSeq++;
    ally.state['summonKey'] = params.unitId;
    ally.state['autoAttack'] = params.autoAttack;
    if (params.portrait) ally.state['portrait'] = params.portrait;
    if (params.hits) ally.state['hits'] = params.hits;
    if (params.energyCost) ally.state['energyCost'] = params.energyCost;
    if (params.targetLowest) ally.state['targetLowest'] = true;
    if (params.lifesteal) ally.state['lifesteal'] = params.lifesteal;
    this.addAlly(ally);
    this.logText(`${params.name} 加入了战场！`);
    this.emit('log', { text: `${params.name} 加入了战场！` });
  }

  /** 某类召唤物是否已在场（供卡牌描述/UI 判定） */
  hasSummon(unitId: string): boolean {
    return this.allies.some((a) => a.isAlive() && a.state['summonKey'] === unitId);
  }

  /** 返回卡牌被现存召唤物阻止的名称；升级分支 allowMultiple 不阻止。 */
  cardSummonConflict(card: CardInstance): string | null {
    const def = upgradeCardDef(getCardDef(card.defId), card.upgradeLevel);
    const walk = (node: ActionNode): string | null => {
      const p = (node.params ?? {}) as Record<string, unknown>;
      if (node.action_type === 'SummonAlly' && p['allowMultiple'] !== true) {
        const unitId = p['unitId'] as string | undefined;
        if (unitId && this.hasSummon(unitId)) return (p['name'] as string | undefined) ?? unitId;
      }
      const children: ActionNode[] = [
        ...(Array.isArray(node.actions) ? node.actions : []),
        ...(Array.isArray(node.on_true) ? node.on_true : []),
        ...(Array.isArray(node.on_failure) ? node.on_failure : []),
        ...(Array.isArray(p['actions']) ? p['actions'] as ActionNode[] : []),
      ];
      for (const child of children) {
        const hit = walk(child);
        if (hit) return hit;
      }
      return null;
    };
    const roots = Array.isArray(def.actionTree) ? def.actionTree : [def.actionTree];
    for (const root of roots) {
      const hit = walk(root);
      if (hit) return hit;
    }
    return null;
  }

  setNoDrawThisTurn(flag: boolean): void {
    this.noDrawThisTurn = flag;
  }

  getHandSize(): number {
    return this.piles.hand.length;
  }

  triggerVFX(vfxId: string): void {
    this.emit('vfx', { vfxId });
  }

  log(text: string): void {
    this.logText(text);
  }

  // ---------------------------------------------------------------------------
  // 工具
  // ---------------------------------------------------------------------------

  allUnits(): Unit[] {
    return [this.player, ...this.allies, ...this.enemies];
  }

  /** 召唤友军随从（森语者树人/神射手野狼等） */
  addAlly(unit: Unit): void {
    unit.slot = this.allies.length;
    this.allies.push(unit);
    this.emit('allySummon', { unitId: unit.id });
  }

  /** 友军自动行动：随从按 autoAttack 攻击（hits 段数随机目标） */
  private alliesAct(): void {
    for (const ally of [...this.allies]) {
      if (!ally.isAlive()) continue;
      const atk = ally.state['autoAttack'] as number | undefined;
      if (!atk || atk <= 0) continue;
      const hits = (ally.state['hits'] as number | undefined) ?? 1;
      for (let h = 0; h < hits; h++) {
        const targets = this.enemies.filter((e) => e.isAlive());
        if (targets.length === 0) break;
        // targetLowest：撕咬血量最低敌人（野狼）
        const target = ally.state['targetLowest'] === true
          ? targets.reduce((a, b) => (a.hp <= b.hp ? a : b))
          : this.rng.combat.pick(targets);
        const dmg = this.dealDamage(ally, target, { base: atk, type: 'physical', flat: 0, percents: [], defenderMults: [], reduction: 0, globalMod: 1, singleTarget: true });
        // 幻影魔狼吸血反哺
        const ls = ally.state['lifesteal'] as number | undefined;
        if (ls && dmg.remaining > 0) this.heal(this.player, Math.round(dmg.remaining * ls));
      }
      this.emit('allyActed', { unitId: ally.id });
    }
  }

  /** 移除友军（能量耗尽消散等） */
  removeAlly(unit: Unit): void {
    this.allies = this.allies.filter((a) => a.id !== unit.id);
    this.emit('allySummon', { unitId: unit.id, removed: true });
  }

  findUnit(uid: string): Unit | null {
    if (this.player.id === uid) return this.player;
    return this.enemies.find((e) => e.id === uid) ?? null;
  }

  aliveEnemies(): Unit[] {
    return this.enemies.filter((e) => e.isAlive());
  }

  /** 死亡单位从战场移除（由表现层在动画后调用；逻辑层以 isDead 判定） */
  removeDeadEnemies(): void {
    this.enemies = this.enemies.filter((e) => e.isAlive());
  }
}
