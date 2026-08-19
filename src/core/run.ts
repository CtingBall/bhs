// ============================================================================
// 单局运行状态机（Run State Machine）
// 负责：开局的职业实例化 / 地图推进 / 战斗创建 / 战后奖励 / 章节流转 / 结算
// ============================================================================

import { RngBank, randomMasterSeed } from './rng';
import type { RngStreamName } from './rng';
import type { MapGraph, MapNode } from './map';
import { generateMap, computeReachability } from './map';
import type { Combat, CombatViewEvent, BehaviorDef } from './combat';
import { Combat as CombatImpl } from './combat';
import { Unit } from './units';
import { getClassDef } from '../content/classes';
import { installClassRuntime, CLASS_IDS } from '../content/classRuntime';
import { getRelicDef } from '../content/relics';
import { getActContent, findMonsterDef } from '../content/monsters';
import type { MonsterDef } from '../content/monsters';
import { getKeystoneDef } from '../content/keystones';
import { getAscension } from '../content/ascension';
import { getCharacterDef } from '../content/characters';
import { getCardDef } from './cards';
import type { UpgradeLevel } from './cards';

export interface DeckEntry {
  defId: string;
  level: UpgradeLevel;
}

export interface RunStats {
  combatsWon: number;
  elitesKilled: number;
  cardsAdded: number;
  maxCombatDamage: number;
}

export interface RunSnapshot {
  seed: string;
  classId: string;
  hp: number;
  maxHp: number;
  gold: number;
  deck: DeckEntry[];
  relics: string[];
  act: number;
  currentNodeId: string | null;
  map: MapGraph;
  flags: Record<string, unknown>;
  stats: RunStats;
  victory?: boolean;
  defeat?: boolean;
  /** PRNG 子流内部状态（读档恢复确定性） */
  rngStates?: Partial<Record<RngStreamName, number>>;
}

export interface CombatReward {
  gold: number;
  draft: string[];
  bossRelics: string[] | null;
  cardUpgradeSource?: never;
}

export class Run {
  rng: RngBank;
  state: RunSnapshot;
  activeCombat: Combat | null = null;

  constructor(state: RunSnapshot) {
    this.state = state;
    this.rng = new RngBank(state.seed);
    if (state.rngStates) this.rng.restoreStates(state.rngStates);
  }

  /** 新开一局 */
  static newRun(classId: string, seed?: string, opts?: { keystones?: string[]; ascension?: number; character?: string }): Run {
    const seedStr = seed ?? randomMasterSeed();
    const rng = new RngBank(seedStr);
    const cls = getClassDef(classId);
    const map = generateMap(rng.map);
    computeReachability(map, null);
    // 人物模块：开局自动装配角色专属遗物
    const startRelics: string[] = [];
    if (opts?.character) {
      startRelics.push(getCharacterDef(opts.character).relicId);
    }
    const state: RunSnapshot = {
      seed: seedStr,
      classId,
      hp: cls.maxHp,
      maxHp: cls.maxHp,
      gold: 99,
      deck: cls.starterDeck.map((d) => ({ defId: d, level: 0 as UpgradeLevel })),
      relics: startRelics,
      act: 1,
      currentNodeId: null,
      map,
      flags: {
        keystones: opts?.keystones ?? [],
        ascension: opts?.ascension ?? 0,
        character: opts?.character ?? '',
      },
      stats: { combatsWon: 0, elitesKilled: 0, cardsAdded: 0, maxCombatDamage: 0 },
      rngStates: rng.getStates(),
    };
    // 局外遗物：开局立即金币（如「幸运星·溪谷全家福」富婆赞助）
    const instantGold = startRelics.reduce((s, id) => s + (getRelicDef(id).runEffect?.instantGold ?? 0), 0);
    state.gold += instantGold;
    return new Run(state);
  }

  /** 本局人物 */
  get characterId(): string {
    return (this.state.flags['character'] as string | undefined) ?? '';
  }

  /** 本局装配的大天赋 */
  get keystoneIds(): string[] {
    return (this.state.flags['keystones'] as string[] | undefined) ?? [];
  }

  /** 本局进阶等级 */
  get ascensionLevel(): number {
    return (this.state.flags['ascension'] as number | undefined) ?? 0;
  }

  get classDef() {
    return getClassDef(this.state.classId);
  }

  get currentNode(): MapNode | null {
    return this.state.currentNodeId ? (this.state.map.nodesById.get(this.state.currentNodeId) ?? null) : null;
  }

  reachableNodes(): MapNode[] {
    const out: MapNode[] = [];
    for (const layer of this.state.map.layers) {
      for (const n of layer) if (n.reachable && !n.visited) out.push(n);
    }
    return out;
  }

  hasRelic(id: string): boolean {
    return this.state.relics.includes(id);
  }

  addRelic(id: string): void {
    if (!this.state.relics.includes(id)) this.state.relics.push(id);
  }

  addCard(defId: string, level: UpgradeLevel = 0): void {
    this.state.deck.push({ defId, level });
    this.state.stats.cardsAdded++;
  }

  removeCard(index: number): void {
    this.state.deck.splice(index, 1);
  }

  upgradeCard(index: number, level: 1 | 2): void {
    const entry = this.state.deck[index];
    if (entry) entry.level = level;
  }

  heal(amount: number): void {
    this.state.hp = Math.min(this.state.maxHp, this.state.hp + amount);
  }

  addGold(amount: number): void {
    this.state.gold = Math.max(0, this.state.gold + amount);
  }

  /** 进入节点（须可达）。起点节点自动通过（标记为已完成）。 */
  enterNode(id: string): MapNode | null {
    const node = this.state.map.nodesById.get(id);
    if (!node || !node.reachable || node.visited) return null;
    this.state.currentNodeId = id;
    if (node.type === 'start') node.visited = true;
    computeReachability(this.state.map, id);
    return node;
  }

  // ---------------------------------------------------------------------------
  // 战斗
  // ---------------------------------------------------------------------------

  /** 为当前节点创建并启动战斗 */
  startCombat(onEvent?: (ev: CombatViewEvent) => void): Combat {
    const node = this.currentNode;
    if (!node) throw new Error('无当前节点');
    const cls = this.classDef;
    const relics = this.state.relics.map((id) => getRelicDef(id));
    const maxHpBonus = relics.reduce((s, r) => s + (r.runEffect?.maxHpBonus ?? 0), 0);
    const maxHp = this.state.maxHp + maxHpBonus;

    const player = new Unit({
      id: 'player',
      name: cls.name,
      maxHp,
      hp: Math.min(this.state.hp, maxHp),
      tags: ['player', 'frontline'],
      isPlayer: true,
    });
    player.state['maxEnergy'] = cls.maxEnergy;
    player.state['handLimit'] = cls.handLimit;
    player.state['showIntents'] = !relics.some((r) => r.runEffect?.hideIntents);
    for (const res of cls.resources) {
      player.resources[res.id] = 0;
      player.resourceCaps[res.id] = res.max;
    }
    // 营地祭仪增益
    const camp = this.state.flags['nextCombatBonus'] as { attackPct?: number; rounds?: number; seeds?: number; shards?: number; fiendTurns?: number; block?: number; sand?: number; companionBoost?: boolean; notes?: number; courage?: number; sharp?: number } | undefined;
    if (camp) {
      if (camp.attackPct) {
        player.state['campAttackPct'] = camp.attackPct;
        player.state['campAttackRounds'] = camp.rounds ?? 3;
      }
      if (camp.seeds) player.state['campSeeds'] = camp.seeds;
      if (camp.shards) player.state['campShards'] = camp.shards;
      if (camp.fiendTurns) player.state['campFiendTurns'] = camp.fiendTurns;
      if (camp.block) player.state['campBlock'] = camp.block;
      if (camp.sand) player.state['campSand'] = camp.sand;
      if (camp.companionBoost) player.state['campCompanionBoost'] = true;
      if (camp.notes) player.state['campNotes'] = camp.notes;
      if (camp.courage) player.state['campCourage'] = camp.courage;
      if (camp.sharp) player.state['campSharp'] = camp.sharp;
      delete this.state.flags['nextCombatBonus'];
    }

    // 敌人组建
    const actContent = getActContent(this.state.act);
    const enemies: Unit[] = [];
    const behaviors: Record<string, BehaviorDef> = {};
    const addEnemy = (def: MonsterDef, slot: number): void => {
      const unit = new Unit({
        id: def.id, name: def.name, maxHp: def.maxHp,
        tags: def.tags,
        damageType: def.damageType,
        reductionRatio: def.reductionRatio,
        slot,
      });
      unit.state['goldReward'] = def.goldReward;
      if (def.flavor) unit.state['flavor'] = def.flavor;
      for (const b of def.innateBuffs ?? []) unit.applyBuff(b.id, b.stacks);
      behaviors[def.id] = def.behavior;
      enemies.push(unit);
    };

    if (node.type === 'boss') {
      addEnemy(actContent.boss, 0);
    } else if (node.type === 'elite') {
      addEnemy(actContent.elite, 0);
    } else {
      // 事件触发的特殊战斗优先（支持逗号分隔的多只怪物，如"强袭虫群"）
      const pending = this.state.flags['pendingSpecialCombat'] as string | undefined;
      if (pending) {
        delete this.state.flags['pendingSpecialCombat'];
        const ids = pending.split(',').map((s) => s.trim()).filter(Boolean);
        ids.forEach((mid, i) => addEnemy(findMonsterDef(mid), i));
      } else {
        const pool = actContent.pool;
        const count = this.rng.combat.chance(0.55) ? 2 : 1;
        const picked = new Set<number>();
        for (let i = 0; i < count && i < pool.length; i++) {
          let idx = this.rng.combat.int(0, pool.length - 1);
          while (picked.has(idx)) idx = this.rng.combat.int(0, pool.length - 1);
          picked.add(idx);
          addEnemy(pool[idx], i);
        }
      }
    }

    const combat = new CombatImpl({
      rng: this.rng,
      player,
      enemies,
      behaviors,
      onEvent,
    });
    // 进阶难度修正
    const mods = getAscension(this.ascensionLevel);
    if (mods.drawMinus > 0) combat.drawPenalty = mods.drawMinus;
    combat.softEnrageFrom = mods.enrageFrom;
    for (const e of enemies) {
      e.maxHp = Math.round(e.maxHp * (e.hasTag('boss') ? mods.bossHpPct : mods.enemyHpPct));
      e.hp = e.maxHp;
      e.state['ascDmg'] = mods.enemyDmgPct;
    }
    // 安装职业运行时 → 遗物 → 大天赋
    installClassRuntime(combat, cls.id);
    for (const relic of relics) relic.install?.(combat);
    for (const kid of this.keystoneIds) {
      getKeystoneDef(kid).install(combat);
    }
    this.activeCombat = combat;
    combat.start(this.state.deck);
    return combat;
  }

  /** 战斗结束后的结算（胜利：奖励 / 失败：记录） */
  onCombatEnd(): CombatReward {
    const combat = this.activeCombat;
    const node = this.currentNode;
    if (!combat || !node) throw new Error('无进行中的战斗');

    if (combat.victory) {
      node.visited = true;
      const relics = this.state.relics.map((id) => getRelicDef(id));
      // 金币（进阶难度：精英战金币削减）
      let gold = 0;
      for (const e of combat.enemies) gold += (e.state['goldReward'] as number) ?? 0;
      const goldPct = relics.reduce((s, r) => s + (r.runEffect?.goldBonusPct ?? 0), 0);
      let goldMult = 1 + goldPct / 100;
      if (node.type === 'elite') goldMult *= getAscension(this.ascensionLevel).eliteGoldPct;
      gold = Math.max(0, Math.round(gold * goldMult));
      this.state.gold += gold;
      this.state.hp = combat.player.hp;
      // 治疗遗物
      const healPct = relics.reduce((s, r) => s + (r.runEffect?.healOnVictoryPct ?? 0), 0);
      if (healPct > 0) this.heal(Math.round(this.state.maxHp * healPct));
      // 事件承诺的特殊战斗奖励（虚空契约：大量金币并回满生命）
      if (this.state.flags['voidContractReward'] === true) {
        delete this.state.flags['voidContractReward'];
        this.state.gold += 75;
        this.heal(this.state.maxHp);
      }
      // 统计
      this.state.stats.combatsWon++;
      if (node.type === 'elite') this.state.stats.elitesKilled++;

      // 章节推进
      let bossRelics: string[] | null = null;
      if (node.type === 'boss') {
        if (this.state.act >= 4) {
          this.state.victory = true;
        } else {
          this.state.act += 1;
          this.state.map = generateMap(this.rng.map);
          computeReachability(this.state.map, null);
          this.state.currentNodeId = null;
        }
        bossRelics = ['relic_energy_converter', 'relic_black_market', 'relic_holy_scepter'];
      }

      return { gold, draft: this.rollCardDraft(3), bossRelics };
    }

    // 失败
    this.state.defeat = true;
    this.state.hp = 0;
    return { gold: 0, draft: [], bossRelics: null };
  }

  /** 战利品卡牌三选一（RNG_Reward 流，含稀有度权重与去重） */
  rollCardDraft(count: number): string[] {
    const cls = this.classDef;
    const pool = cls.cardPool;
    const out: string[] = [];
    const used = new Set<string>();
    const rarityWeights: Array<{ r: 'Common' | 'Uncommon' | 'Rare'; w: number }> = [
      { r: 'Common', w: 60 }, { r: 'Uncommon', w: 30 }, { r: 'Rare', w: 10 },
    ];
    for (let i = 0; i < count; i++) {
      const total = rarityWeights.reduce((s, x) => s + x.w, 0);
      let roll = this.rng.reward.next() * total;
      let rarity: 'Common' | 'Uncommon' | 'Rare' = 'Common';
      for (const item of rarityWeights) {
        roll -= item.w;
        if (roll <= 0) { rarity = item.r; break; }
      }
      const candidates = pool.filter((id) => getCardDef(id).rarity === rarity && !used.has(id));
      if (candidates.length === 0) {
        // 保底：任何未用卡
        const any = pool.filter((id) => !used.has(id));
        if (any.length === 0) continue;
        const picked = any[this.rng.reward.int(0, any.length - 1)];
        used.add(picked);
        out.push(picked);
      } else {
        const picked = candidates[this.rng.reward.int(0, candidates.length - 1)];
        used.add(picked);
        out.push(picked);
      }
    }
    return out;
  }

  /** 接受三选一 */
  acceptDraft(choice: string): void {
    this.addCard(choice);
  }

  /** 商店删卡价格（递增阶梯） */
  removeCardPrice(): number {
    const times = (this.state.flags['cardRemovals'] as number) ?? 0;
    return 75 + 25 * times;
  }

  buyRemoveCard(index: number): boolean {
    const price = this.removeCardPrice();
    if (this.state.gold < price) return false;
    if (index < 0 || index >= this.state.deck.length) return false;
    this.state.gold -= price;
    this.state.flags['cardRemovals'] = ((this.state.flags['cardRemovals'] as number) ?? 0) + 1;
    this.removeCard(index);
    return true;
  }

  /** 商店卡牌定价（含进阶难度溢价） */
  shopCardPrice(defId: string): number {
    const def = getCardDef(defId);
    const base: Record<string, number> = { Common: 50, Uncommon: 80, Rare: 145 };
    const price = base[def.rarity] ?? 60;
    const variance = 1 + (this.rng.reward.next() * 0.2 - 0.1);
    return Math.round(price * variance * getAscension(this.ascensionLevel).shopPricePct);
  }

  /** 商店遗物定价（含进阶难度溢价） */
  shopRelicPrice(id: string): number {
    return Math.round(getRelicDef(id).basePrice * getAscension(this.ascensionLevel).shopPricePct);
  }

  /** 营地休养回复量（进阶难度减半） */
  restHealAmount(): number {
    return Math.round(this.state.maxHp * 0.3 * getAscension(this.ascensionLevel).restHealPct);
  }

  /** 事件/非战斗伤害（进阶难度负面代价放大） */
  loseHp(amount: number): number {
    const scaled = Math.max(1, Math.round(amount * getAscension(this.ascensionLevel).eventCostPct));
    this.state.hp = Math.max(1, this.state.hp - scaled);
    return scaled;
  }

  /** 营地祭仪（职业专属） */
  performCampRitual(): void {
    const cls = this.classDef;
    switch (cls.id) {
      case CLASS_IDS.THUNDERBLADE:
        this.state.flags['nextCombatBonus'] = { attackPct: 0.35, rounds: 3 };
        break;
      case CLASS_IDS.AEGIS_KNIGHT:
        this.state.maxHp += 6;
        this.state.hp += 6;
        break;
      case CLASS_IDS.SYLVANGUARD:
        this.state.flags['nextCombatBonus'] = { seeds: 15 };
        break;
      case CLASS_IDS.FROST_MAGE:
        this.state.flags['nextCombatBonus'] = { shards: 4 };
        break;
      case CLASS_IDS.FLAME_BERSERKER:
        this.state.flags['nextCombatBonus'] = { fiendTurns: 3 };
        break;
      case CLASS_IDS.TITAN_GUARDIAN:
        this.state.flags['nextCombatBonus'] = { block: 30, sand: 3 };
        break;
      case CLASS_IDS.SHARPSHOOTER:
        this.state.flags['nextCombatBonus'] = { companionBoost: true };
        break;
      case CLASS_IDS.SOUL_MUSICIAN:
        this.state.flags['nextCombatBonus'] = { notes: 5 };
        break;
      case CLASS_IDS.GALE_KNIGHT:
        this.state.flags['nextCombatBonus'] = { courage: 50, sharp: 4 };
        break;
      default:
        break;
    }
  }

  /** 序列化快照（存档用，附带 PRNG 状态） */
  toSnapshot(): RunSnapshot {
    this.state.rngStates = this.rng.getStates();
    return this.state;
  }
}
