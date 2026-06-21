import { create } from 'zustand';
import type {
  BattleState,
  Card,
  Character,
  Enemy,
  GameEvent,
  Relic,
  RunState,
  Scene,
  Zone,
} from '@/types';
import { CASTE_ORDER, CASTE_NAME, ZONE_LIST, ZONE_NAME } from '@/types';
import { CHARACTERS, CHARACTER_MAP } from '@/data/characters';
import { ENEMIES, ENEMY_MAP } from '@/data/enemies';
import { RELICS, RELIC_MAP } from '@/data/relics';
import { EVENTS } from '@/data/events';
import { FACTOR_MAP, FACTORS } from '@/data/factors';
import { SUMMON_RECIPE_MAP } from '@/data/summonRecipes';
import { SUMMON_MAP } from '@/data/summons';
import { getCard, getTemplate } from '@/data/cards';
import {
  createCardInstance,
  inscribeKeyword,
  inscribeWillCost,
  nurtureCard,
  nurtureStoneCost,
} from '@/engine/cardResolver';
import { KEYWORD_MAP, INSCRIBABLE_KEYWORDS } from '@/data/keywords';
import type { KeywordId } from '@/types';
import {
  createBattle,
  enemyTurn,
  endPlayerTurn,
  getCardById,
  playCard,
  rollRewardCard,
  startPlayerTurn,
} from '@/engine/battle';
import { buildDeck, generateMap, getReachableIds } from '@/engine/map';
import { useMetaStore } from './metaStore';

type BattleKind = 'normal' | 'elite' | 'boss' | 'prison' | 'dimension';

interface ShopStock {
  cards: { card: Card; price: number }[];
  relics: (Relic | null)[];
  relicPrices: number[];
  removePrice: number;
  boughtCards: number[];
  boughtRelics: boolean[];
  removed: boolean;
}

interface Reward {
  cards: Card[];
  rope: number;
  will: number;
  isPrison: boolean;
}

interface GameStore {
  scene: Scene;
  run: RunState | null;
  battle: BattleState | null;
  character: Character | null;
  reward: Reward | null;
  pendingEvent: GameEvent | null;
  shop: ShopStock | null;
  toast: string | null;
  selectedCharacterId: string;
  targetEnemyUid: string | null;
  battleKind: BattleKind;
  currentEnemyDefIds: string[];

  setToast: (t: string | null) => void;
  setSelectedCharacter: (id: string) => void;
  goScene: (s: Scene) => void;
  startNewRun: (characterId: string) => void;
  enterNode: (nodeId: number) => void;
  setTarget: (uid: string | null) => void;
  playCardAction: (handIndex: number) => void;
  endTurnAction: () => void;
  pickReward: (card: Card | null) => void;
  resolveEvent: (optionIndex: number) => void;
  resolveRest: (choice: { kind: 'heal' | 'prison' | 'remove' | 'nurture'; instanceId: string }) => void;
  enterShop: () => void;
  buyShopCard: (i: number) => void;
  buyShopRelic: () => void;
  buyShopRelic2: (i: number) => void;
  removeShopCard: (instanceId: string) => void;
  reforgeCard: (instanceId: string) => void;
  inscribeCard: (instanceId: string, keywordId: KeywordId) => void;
  fuseSummons: (recipeId: string) => void;      // 召唤物融合
  acquireFactor: (factorId: string) => void;    // 获取因子
  leaveShop: () => void;
  returnToMenu: () => void;
}

const ZONE_BOSS: Record<Zone, string> = {
  strike: 'tina',
  doom: 'giant-tower',
  punish: 'punish-dynasty',
  abyss: 'void-lord',
  mirage: 'dream-weaver',
  armageddon: 'final-judge',
  astral: 'star-eater',
};
// ZONE_LIST 从 types 导入

function rareChanceValue(run: { relics: Relic[] }): number {
  return run.relics.reduce(
    (sum, r) => sum + (r.effect.kind === 'rareChance' && r.id !== 'n20-clear-cert' ? (r.effect.value ?? 0) : 0),
    0,
  );
}
function shopDiscount(run: { relics: Relic[] }): number {
  return run.relics.reduce(
    (sum, r) => sum + (r.effect.kind === 'shopDiscount' && r.id !== 'overtime-lantern' ? (r.effect.value ?? 0) : 0),
    0,
  );
}

function hasRelic(run: { relics: Relic[] }, relicId: string): boolean {
  return run.relics.some((r) => r.id === relicId);
}

function applyRelicGain(run: RunState, relic: Relic): RunState {
  const next: RunState = { ...run, relics: [...run.relics, relic] };
  if (relic.id === 'desperate-pact') {
    next.maxHp = Math.max(1, next.maxHp - 6);
    next.hp = Math.min(next.hp, next.maxHp);
  }
  return next;
}

function currentCombatNode(run: RunState) {
  const zoneNodes = run.mapNodes[run.zoneIndex] ?? [];
  const node = zoneNodes.find((n) => n.id === run.currentNodeId);
  if (!node || (node.type !== 'battle' && node.type !== 'elite' && node.type !== 'boss')) return null;
  return { zoneNodes, node };
}

function isFirstCombatOfFloor(run: RunState): boolean {
  const current = currentCombatNode(run);
  if (!current) return false;
  return current.zoneNodes.filter(
    (n) => n.floor === current.node.floor && (n.type === 'battle' || n.type === 'elite' || n.type === 'boss') && n.visited,
  ).length === 1;
}

function cardPrice(c: Card): number {
  return { basic: 15, common: 25, rare: 50, epic: 75, legendary: 120 }[c.rarity];
}
function relicPrice(r: Relic): number {
  return { common: 4, rare: 6, boss: 8 }[r.rarity];
}

// ===== 区域难度分级系统 =====
// 每高一层区域，怪物数值全面提升，确保「越往深处走越强」
// zoneLevel 用于敌人按强度筛选；floorScale 用于进一步按当前楼层微调
function zoneLevel(zone: Zone): number {
  return ZONE_LIST.indexOf(zone);
}

/** 按区域强度筛选适合的敌人：只在该区域及更低强度区域出现，且优先本区专属怪 */
function pickNormal(zone: Zone, floor = 0): Enemy[] {
  const lvl = zoneLevel(zone);
  const roaming = ENEMIES.filter((e) => e.roaming && !e.isElite && !e.isBoss);
  // 本区专属普通怪
  let zonePool = ENEMIES.filter((e) => !e.isElite && !e.isBoss && !e.roaming && e.zone === zone);
  // 本区没怪则用该区及更早强度区兜底，绝不放后期强怪到前区
  if (zonePool.length === 0) {
    zonePool = ENEMIES.filter((e) => {
      if (e.isElite || e.isBoss || e.roaming) return false;
      return zoneLevel(e.zone) <= lvl;
    });
  }
  // 高层区域（深渊之后）额外掺入少量游荡怪作为变化，但游荡怪数值也随楼层放大
  const pool = zonePool.slice();
  if (lvl >= 3 && Math.random() < 0.35) {
    const r = roaming[Math.floor(Math.random() * roaming.length)];
    if (r) pool.push(r);
  }
  const count = Math.random() < 0.4 ? 2 : 1;
  const out: Enemy[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const picks = pool.filter((e) => !used.has(e.id) || pool.length === 1);
    const e = picks[Math.floor(Math.random() * picks.length)] ?? pool[0];
    if (!e) continue;
    used.add(e.id);
    out.push(scaleEnemy(e, lvl, floor));
  }
  return out;
}

function pickElite(zone: Zone, floor = 0): Enemy[] {
  const lvl = zoneLevel(zone);
  // 精英优先本区与更早强度区，绝不让前期精英出现在后期（数值太低）
  let pool = ENEMIES.filter((e) => e.isElite && zoneLevel(e.zone) <= lvl);
  if (pool.length === 0) pool = ENEMIES.filter((e) => e.isElite);
  // 偏向当前/邻近区域：先取同区，没有则取最近的几个
  const sameZone = pool.filter((e) => e.zone === zone);
  const candidates = sameZone.length > 0 ? sameZone : pool;
  const e = candidates[Math.floor(Math.random() * candidates.length)];
  return [scaleEnemy(e, lvl, floor)];
}

function pickBoss(zone: Zone): Enemy[] {
  const lvl = zoneLevel(zone);
  const e = ENEMY_MAP[ZONE_BOSS[zone]];
  return [scaleEnemy(e, lvl, 0, true)];
}

/**
 * 怪物数值放大器：每高一层区域，HP/攻击/格挡按比例成长
 * 同时叠加楼层微调（每爬 3 层节点 +3%），让单一区域内也越打越强
 */
function scaleEnemy(def: Enemy, zoneLvl: number, floor: number, isBoss = false): Enemy {
  // 区域基础倍率：strike=1.0 → astral≈2.8，平滑递增
  const zoneMult = 1 + zoneLvl * 0.25;
  // 楼层微调（floor 0~11）
  const floorMult = 1 + Math.floor(floor / 3) * 0.03;
  const hpMult = zoneMult * floorMult;
  const atkMult = zoneMult * floorMult;
  const blockMult = 1 + zoneLvl * 0.1;

  const scaled: Enemy = {
    ...def,
    hp: Math.round(def.hp * hpMult),
    intents: def.intents.map((intent) => ({
      ...intent,
      value: Math.round(intent.value * (intent.kind === 'attack' || intent.kind === 'charge' ? atkMult : blockMult)),
    })),
  };
  // Boss 仅靠区域倍率成长已足够，不再叠加楼层；但保留 hp 略升
  if (isBoss) {
    scaled.hp = Math.round(def.hp * (1 + zoneLvl * 0.15));
  }
  void scaled; // 保持引用
  return scaled;
}

function checkCasteUp(run: RunState): string | null {
  const order = CASTE_ORDER;
  const idx = order.indexOf(run.caste);
  const thresholds = [3, 6, 10];
  if (idx < 3 && run.castePoints >= thresholds[idx]) {
    run.caste = order[idx + 1];
    return CASTE_NAME[run.caste];
  }
  return null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  scene: 'menu',
  run: null,
  battle: null,
  character: null,
  reward: null,
  pendingEvent: null,
  shop: null,
  toast: null,
  selectedCharacterId: CHARACTERS[0].id,
  targetEnemyUid: null,
  battleKind: 'normal',
  currentEnemyDefIds: [],

  setToast: (t) => set({ toast: t }),
  setSelectedCharacter: (id) => set({ selectedCharacterId: id }),
  goScene: (s) => set({ scene: s }),

  startNewRun: (characterId) => {
    const ch = CHARACTER_MAP[characterId];
    const run: RunState = {
      characterId,
      classId: ch.classId,
      hp: 72,
      maxHp: 72,
      rope: 30,
      will: 1,
      amber: 0,
      deck: buildDeck(ch.initialDeck),
      relics: [RELIC_MAP['clan-emblem']],
      factors: [],
      caste: 'dalit',
      castePoints: 0,
      zoneIndex: 0,
      currentNodeId: null,
      mapNodes: generateMap(),
      tempAlly: false,
      nextBattleHarder: false,
      skipNextBattle: false,
      battlesWon: 0,
      enemiesDefeated: [],
      pityCounter: 0,
      reforgeStones: 0,
    };
    set({ run, character: ch, scene: 'map', battle: null, reward: null, toast: '欢迎来到星痕大陆，薄荷色氏族的家伙。' });
  },

  enterNode: (nodeId) => {
    const { run } = get();
    if (!run) return;
    const zoneNodes = run.mapNodes[run.zoneIndex];
    const node = zoneNodes.find((n) => n.id === nodeId);
    if (!node || node.visited) return;
    // 检查可达性
    const reachable = getReachableIds(zoneNodes, run.currentNodeId);
    if (!reachable.has(nodeId)) return;

    const zone = ZONE_LIST[run.zoneIndex];
    const newRun = { ...run, currentNodeId: nodeId };
    newRun.mapNodes = run.mapNodes.map((z, zi) =>
      zi === run.zoneIndex ? z.map((n) => (n.id === nodeId ? { ...n, visited: true } : n)) : z,
    );
    set({ run: newRun });

    // 跳过战斗
    if (run.skipNextBattle && (node.type === 'battle' || node.type === 'elite')) {
      const skipRope = hasRelic(run, 'xingluo-slack') ? 5 : 0;
      set({
        run: { ...newRun, skipNextBattle: false, rope: newRun.rope + skipRope },
        toast: skipRope > 0
          ? '「无所谓我会选择不打等削弱」——跳过了这场战斗，并获得 5 根绳子。'
          : '「无所谓我会选择不打等削弱」——跳过了这场战斗。',
      });
      return;
    }
    if (node.type === 'battle') return startCombat(get, set, pickNormal(zone, node.floor), 'normal');
    if (node.type === 'elite') return startCombat(get, set, pickElite(zone, node.floor), 'elite');
    if (node.type === 'boss') return startCombat(get, set, pickBoss(zone), 'boss');
    if (node.type === 'event') {
      const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      set({ pendingEvent: ev, scene: 'event' });
      return;
    }
    if (node.type === 'shop') return get().enterShop();
    if (node.type === 'rest') {
      set({ scene: 'rest' });
      return;
    }
    if (node.type === 'dimension') {
      // 独立维度：一场特殊战斗，胜利获得稀有遗物+因子
      const dimEnemies = pickElite(zone, node.floor);
      dimEnemies.forEach((e) => { e.isBoss = true; e.hp = Math.floor(e.hp * 0.8); }); // 略弱于真Boss
      return startCombat(get, set, dimEnemies, 'dimension');
    }
    if (node.type === 'treasure') {
      // 宝箱：免费获得一件遗物或一张稀有卡
      if (Math.random() < 0.5) {
        const avail = RELICS.filter((r) => !newRun.relics.some((rr) => rr.id === r.id));
        if (avail.length > 0) {
          const relic = avail[Math.floor(Math.random() * avail.length)];
          const updated = applyRelicGain(newRun, relic);
          set({ run: updated, scene: 'map', toast: `宝箱开出遗物：${relic.name}！` });
        } else {
          set({ run: newRun, scene: 'map', toast: '宝箱打开了，但你已经拥有所有遗物……' });
        }
      } else {
        const c = rollRewardCard(newRun.zoneIndex, rareChanceValue(newRun), 'rare', run.classId);
        set({ run: { ...newRun, deck: [...newRun.deck, c] }, scene: 'map', toast: `宝箱开出卡牌：${c.name}！` });
      }
      return;
    }
    if (node.type === 'mystery') {
      // 秘闻：随机好/坏结果
      const roll = Math.random();
      if (roll < 0.35) {
        // 好事：免费遗物
        const avail = RELICS.filter((r) => !newRun.relics.some((rr) => rr.id === r.id));
        if (avail.length > 0) {
          const relic = avail[Math.floor(Math.random() * avail.length)];
          const updated = applyRelicGain(newRun, relic);
          set({ run: updated, scene: 'map', toast: `秘闻揭示：获得遗物「${relic.name}」！` });
        } else {
          set({ run: newRun, scene: 'map', toast: '秘闻揭示：一段古老的记忆……但你已经无所不知。' });
        }
      } else if (roll < 0.65) {
        // 中性：获得绳子和意志
        set({ run: { ...newRun, rope: newRun.rope + 15, will: newRun.will + 2 }, scene: 'map', toast: '秘闻揭示：一段被遗忘的历史……获得了绳子和意志。' });
      } else {
        // 坏事：失去HP
        const loss = Math.floor(newRun.maxHp * 0.15);
        set({ run: { ...newRun, hp: Math.max(1, newRun.hp - loss) }, scene: 'map', toast: `秘闻揭示：一段可怕的真相……失去了 ${loss} 点生命。` });
      }
      return;
    }
  },

  setTarget: (uid) => set({ targetEnemyUid: uid }),

  playCardAction: (handIndex) => {
    const { battle, targetEnemyUid, run } = get();
    if (!battle || !run) return;
    const card = battle.hand[handIndex];
    if (!card) return;
    let targetIndex = 0;
    if (targetEnemyUid) {
      const i = battle.enemies.findIndex((e) => e.uid === targetEnemyUid);
      if (i >= 0) targetIndex = i;
    }
    const needsTarget = card.effects.some(
      (e) => e.kind === 'damage' || (e.kind === 'applyStatus' && e.statusTarget === 'enemy' && !e.all),
    );
    if (needsTarget && battle.enemies.length > 1 && !targetEnemyUid) {
      set({ toast: '请先选择一个敌人作为目标。' });
      return;
    }
    const isCurse = card.type === 'curse';
    const next = playCard(battle, handIndex, targetIndex);
    if (next === battle) return; // 无法打出
    const stillAlive = targetEnemyUid && next.enemies.some((e) => e.uid === targetEnemyUid);
    const nextTargetEnemyUid = stillAlive ? targetEnemyUid : (next.enemies.length === 1 ? (next.enemies[0]?.uid ?? null) : null);
    let nextRun = run;
    // 诅咒转绳子遗物（虫罐等）
    if (isCurse) {
      const ctr = next.relics.reduce((sum, r) => sum + (r.effect.kind === 'curseToRope' ? (r.effect.value ?? 0) : 0), 0);
      if (ctr > 0) nextRun = { ...run, rope: run.rope + ctr };
    }
    set({ battle: next, run: nextRun, targetEnemyUid: nextTargetEnemyUid });
    if (next.over) handleBattleEnd(get, set);
  },

  endTurnAction: () => {
    const { battle, targetEnemyUid } = get();
    if (!battle || battle.over) return;
    let next = endPlayerTurn(battle);
    set({ battle: next });
    if (next.over) return handleBattleEnd(get, set);
    next = enemyTurn(next);
    set({ battle: next });
    if (next.over) return handleBattleEnd(get, set);
    next = startPlayerTurn(next);
    // 保留已有目标（若存活），否则自动选第一个敌人
    const stillAlive = targetEnemyUid && next.enemies.some(e => e.uid === targetEnemyUid);
    set({ battle: next, targetEnemyUid: stillAlive ? targetEnemyUid : (next.enemies[0]?.uid ?? null) });
    if (next.over) return handleBattleEnd(get, set);
  },

  pickReward: (card) => {
    const { run, reward, character } = get();
    if (!run || !reward) return;
    const newRun = { ...run };
    const meta = useMetaStore.getState();
    if (card) {
      newRun.deck = [...run.deck, card];
      meta.unlockCard(card.id);
    }
    newRun.rope = run.rope + reward.rope;
    newRun.will = run.will + reward.will;
    set({ run: newRun, reward: null, scene: 'map', toast: card ? `获得卡牌：${card.name}` : '你跳过了奖励。' });
    void character;
  },

  resolveEvent: (optionIndex) => {
    const { run, pendingEvent } = get();
    if (!run || !pendingEvent) return;
    const opt = pendingEvent.options[optionIndex];
    let effects = opt.effects;
    let resultText = opt.resultText;
    if (opt.gamble) {
      const win = Math.random() < opt.gamble.chance;
      effects = win ? opt.gamble.win : opt.gamble.lose;
      resultText = win ? opt.gamble.winText : opt.gamble.loseText;
    }
    const newRun = applyEventEffects({ ...run }, effects);
    set({ run: newRun, pendingEvent: null, scene: 'map', toast: resultText });
  },

  resolveRest: (choice) => {
    const { run } = get();
    if (!run) return;
    if (choice.kind === 'heal') {
      const heal = Math.floor(run.maxHp * 0.3);
      set({ run: { ...run, hp: Math.min(run.maxHp, run.hp + heal) }, scene: 'map', toast: `等削弱……回复了 ${heal} 点生命。` });
    } else if (choice.kind === 'remove') {
      if (run.deck.length <= 5) {
        set({ toast: '牌组至少需要保留 5 张牌。' });
        return;
      }
      const idx = run.deck.findIndex((c) => c.instanceId === choice.instanceId);
      if (idx < 0) return;
      const newDeck = [...run.deck];
      newDeck.splice(idx, 1);
      set({ run: { ...run, deck: newDeck }, scene: 'map', toast: '移除了一张牌。' });
    } else if (choice.kind === 'nurture') {
      const card = run.deck.find((c) => c.instanceId === choice.instanceId);
      if (!card) return;
      const template = getTemplate(card.id);
      if (!template || template.type === 'curse') {
        set({ toast: '诅咒牌无法养成。' });
        return;
      }
      const nurtured = nurtureCard(template, card);
      set({
        run: {
          ...run,
          deck: run.deck.map((c) => (c.instanceId === choice.instanceId ? nurtured : c)),
        },
        scene: 'map',
        toast: `打磨完成！${card.name} 养成 Lv.${nurtured.nurtureLevel}`,
      });
    } else {
      startCombat(get, set, pickElite(ZONE_LIST[run.zoneIndex], 11), 'prison');
    }
  },

  enterShop: () => {
    const { run } = get();
    if (!run) return;
    const rareBoost = rareChanceValue(run);
    const cardSlots = hasRelic(run, 'overtime-lantern') ? 6 : 5;
    const cards: { card: Card; price: number }[] = [];
    for (let i = 0; i < cardSlots; i++) {
      const c = rollRewardCard(run.zoneIndex, rareBoost, 'basic', run.classId);
      cards.push({ card: c, price: cardPrice(c) });
    }
    const availRelics = RELICS.filter((r) => !run.relics.some((rr) => rr.id === r.id));
    // 随机选5件
    const shuffled = [...availRelics].sort(() => Math.random() - 0.5);
    const relics = shuffled.slice(0, 5);
    while (relics.length < 5) relics.push(null);
    set({
      shop: {
        cards,
        relics,
        relicPrices: relics.map((r) => r ? relicPrice(r) : 0),
        removePrice: 2,
        boughtCards: [],
        boughtRelics: relics.map(() => false),
        removed: false,
      },
      scene: 'shop',
    });
  },

  buyShopCard: (i) => {
    const { run, shop } = get();
    if (!run || !shop) return;
    if (shop.boughtCards.includes(i)) return;
    const item = shop.cards[i];
    const discount = shopDiscount(run);
    const finalPrice = Math.max(1, item.price - discount);
    if (run.rope < finalPrice) {
      set({ toast: '绳子不够。' });
      return;
    }
    const newRun = { ...run, rope: run.rope - finalPrice, deck: [...run.deck, item.card] };
    useMetaStore.getState().unlockCard(item.card.id);
    set({ run: newRun, shop: { ...shop, boughtCards: [...shop.boughtCards, i] }, toast: `购入：${item.card.name}` });
  },

  buyShopRelic: () => {}, // 兼容旧调用，使用 buyShopRelic2
  buyShopRelic2: (i) => {
    const { run, shop } = get();
    if (!run || !shop || i < 0 || i >= shop.relics.length || shop.boughtRelics[i]) return;
    const relic = shop.relics[i];
    if (!relic) return;
    const discount = shopDiscount(run);
    const finalPrice = Math.max(1, shop.relicPrices[i] - discount);
    if (run.amber < finalPrice) {
      set({ toast: '琥珀不够。' });
      return;
    }
    const newBought = [...shop.boughtRelics];
    newBought[i] = true;
    const newRun = applyRelicGain({ ...run, amber: run.amber - finalPrice }, relic);
    set({ run: newRun, shop: { ...shop, boughtRelics: newBought }, toast: `获得遗物：${relic.name}` });
  },

  removeShopCard: (instanceId) => {
    const { run, shop } = get();
    if (!run || !shop || shop.removed) return;
    const discount = shopDiscount(run);
    const finalPrice = Math.max(1, shop.removePrice - discount);
    if (run.will < finalPrice) {
      set({ toast: '意志不够。' });
      return;
    }
    const idx = run.deck.findIndex((c) => c.instanceId === instanceId);
    if (idx < 0) return;
    const newDeck = [...run.deck];
    newDeck.splice(idx, 1);
    set({ run: { ...run, will: run.will - finalPrice, deck: newDeck }, shop: { ...shop, removed: true }, toast: '移除了一张牌。' });
  },

  reforgeCard: (instanceId) => {
    const run = get().run;
    if (!run) return;
    const card = run.deck.find((c) => c.instanceId === instanceId);
    if (!card) return;
    const template = getTemplate(card.id);
    if (!template || template.type === 'curse') return;
    const cost = nurtureStoneCost(card.nurtureLevel);
    if ((run.reforgeStones ?? 0) < cost) {
      set({ toast: `重铸石不足！需要 ${cost} 个，当前 ${run.reforgeStones ?? 0} 个。` });
      return;
    }
    let nurtured = nurtureCard(template, card);
    let extraToast = '';
    // 里程碑奖励：Lv.5/10/15 自动获得随机词条
    const milestoneLevels = [5, 10, 15];
    if (milestoneLevels.includes(nurtured.nurtureLevel)) {
      const availKw = INSCRIBABLE_KEYWORDS.filter((kwId) => !nurtured.keywords[kwId] || (nurtured.keywords[kwId] ?? 0) < (KEYWORD_MAP[kwId]?.maxLevel ?? 5));
      if (availKw.length > 0) {
        const pickKw = availKw[Math.floor(Math.random() * availKw.length)];
        nurtured = inscribeKeyword(template, nurtured, pickKw);
        extraToast = ` 里程碑奖励：获得词条「${KEYWORD_MAP[pickKw]?.name ?? pickKw}」！`;
      }
    }
    set({
      run: {
        ...run,
        reforgeStones: (run.reforgeStones ?? 0) - cost,
        deck: run.deck.map((c) => (c.instanceId === instanceId ? nurtured : c)),
      },
      toast: `重铸成功！${nurtured.name} 养成 Lv.${nurtured.nurtureLevel}${extraToast}`,
    });
  },

  inscribeCard: (instanceId, keywordId) => {
    const run = get().run;
    if (!run) return;
    const card = run.deck.find((c) => c.instanceId === instanceId);
    if (!card) return;
    const template = getTemplate(card.id);
    if (!template || template.type === 'curse') return;
    const def = KEYWORD_MAP[keywordId];
    if (!def) return;
    const currentLv = card.keywords[keywordId] ?? 0;
    const maxLv = def.maxLevel ?? 5;
    if (currentLv >= maxLv) {
      set({ toast: `「${def.name}」已达上限 Lv.${maxLv}。` });
      return;
    }
    const cost = inscribeWillCost(currentLv);
    if (run.will < cost) {
      set({ toast: `意志不足！铭刻需要 ${cost} 点意志。` });
      return;
    }
    const inscribed = inscribeKeyword(template, card, keywordId);
    set({
      run: {
        ...run,
        will: run.will - cost,
        deck: run.deck.map((c) => (c.instanceId === instanceId ? inscribed : c)),
      },
      toast: `铭刻成功！${card.name} 获得词条「${def.name}」Lv.${inscribed.keywords[keywordId]}`,
    });
  },

  // ===== 召唤物融合 =====
  fuseSummons: (recipeId) => {
    const run = get().run;
    if (!run) return;
    const recipe = SUMMON_RECIPE_MAP[recipeId];
    if (!recipe) return;
    const matchesMaterial = (c: Card, matId: string) => {
      const t = getTemplate(c.id);
      return t?.effectId === 'summon' && t.summonId === matId;
    };
    const hasAllMaterials = recipe.materials.every((matId) =>
      run.deck.some((c) => matchesMaterial(c, matId)),
    );
    if (!hasAllMaterials) {
      set({ toast: '材料不足！需要对应的召唤牌。' });
      return;
    }
    const consumed = new Array(recipe.materials.length).fill(false);
    const newDeck = run.deck.filter((c) => {
      for (let mi = 0; mi < recipe.materials.length; mi++) {
        if (consumed[mi]) continue;
        if (matchesMaterial(c, recipe.materials[mi])) {
          consumed[mi] = true;
          return false;
        }
      }
      return true;
    });
    const resultCard = createCardInstance({
      id: `summon-fused-${recipe.resultSummonId}`,
      name: `召唤·${SUMMON_MAP[recipe.resultSummonId]?.name ?? recipe.name}`,
      type: 'summon',
      rarity: 'epic',
      baseCost: 1,
      effectId: 'summon',
      summonId: recipe.resultSummonId,
      flavor: recipe.flavor,
    });
    set({ run: { ...run, deck: [...newDeck, resultCard] }, toast: `融合成功！获得 ${resultCard.name}！` });
  },

  // ===== 获取因子 =====
  acquireFactor: (factorId) => {
    const run = get().run;
    if (!run) return;
    const factor = FACTOR_MAP[factorId];
    if (!factor) return;
    if (run.factors.some((f) => f.id === factorId)) {
      set({ toast: '已拥有该因子！' });
      return;
    }
    const newFactors = [...run.factors.filter((f) => f.kind !== factor.kind), factor];
    set({
      run: { ...run, factors: newFactors },
      toast: `获得因子：${factor.name}！${factor.desc}`,
    });
  },

  leaveShop: () => set({ shop: null, scene: 'map' }),
  returnToMenu: () => set({ scene: 'menu', run: null, battle: null, reward: null, pendingEvent: null, shop: null }),
}));

// ===== 内部 helper =====
function startCombat(
  get: () => GameStore,
  set: (p: Partial<GameStore>) => void,
  enemyDefs: Enemy[],
  kind: BattleKind,
) {
  const { run, character } = get();
  if (!run || !character) return;
  const harder = run.nextBattleHarder;
  const defs = harder ? enemyDefs.map((e) => ({ ...e, hp: Math.floor(e.hp * 1.3) })) : enemyDefs;
  const battle = createBattle(run, defs, character);
  set({
    battle,
    scene: 'battle',
    battleKind: kind,
    currentEnemyDefIds: defs.map((d) => d.id),
    targetEnemyUid: battle.enemies[0]?.uid ?? null,
    run: { ...run, nextBattleHarder: false },
  });
}

function handleBattleEnd(get: () => GameStore, set: (p: Partial<GameStore>) => void) {
  const { battle, run, battleKind, currentEnemyDefIds } = get();
  if (!battle || !run) return;
  const meta = useMetaStore.getState();
  currentEnemyDefIds.forEach((id) => meta.unlockEnemy(id));

  if (battle.over === 'win') {
    const newRun: RunState = { ...run, hp: Math.max(1, battle.player.hp), tempAlly: false, battlesWon: run.battlesWon + 1 };
    newRun.castePoints = run.castePoints + (battleKind === 'elite' || battleKind === 'prison' || battleKind === 'boss' || battleKind === 'dimension' ? 2 : 1);
    newRun.enemiesDefeated = [...run.enemiesDefeated, ...currentEnemyDefIds];
    // 战斗内事件奖励结算
    if (battle.eventRewards) {
      if (battle.eventRewards.rope) newRun.rope = (newRun.rope ?? 0) + battle.eventRewards.rope;
      if (battle.eventRewards.amber) newRun.amber = (newRun.amber ?? 0) + battle.eventRewards.amber;
      if (battle.eventRewards.will) newRun.will = (newRun.will ?? 0) + battle.eventRewards.will;
    }
    if (battle.battleEvent?.kind === 'sacrificeDance') {
      const willGain = battle.battleEvent.data ?? 8;
      newRun.will = (newRun.will ?? 0) + willGain;
    }
    const upCaste = checkCasteUp(newRun);
    let toast = '战斗胜利！';
    if (upCaste) toast += ` 阶级提升至「${upCaste}」！`;

    if (battleKind === 'boss') {
      if (newRun.zoneIndex >= 6) {
        meta.recordRun(true, 7);
        meta.addSediment(40 + newRun.battlesWon * 2);
        set({ run: newRun, scene: 'victory', toast, battle: null, targetEnemyUid: null });
        return;
      }
      newRun.zoneIndex = run.zoneIndex + 1;
      newRun.currentNodeId = null;
      newRun.hp = Math.min(newRun.maxHp, newRun.hp + Math.floor(newRun.maxHp * 0.25));
      newRun.reforgeStones = (newRun.reforgeStones ?? 0) + 3; // Boss掉落重铸石
      const nextZoneName = ZONE_NAME[ZONE_LIST[newRun.zoneIndex]] ?? '新区域';
      set({
        run: newRun,
        scene: 'map',
        toast: `${toast} 进入${nextZoneName}！获得 3 重铸石！`,
        battle: null,
        targetEnemyUid: null,
      });
      return;
    }

    // 维度战：胜利获得稀有遗物+因子+2重铸石+3琥珀
    if (battleKind === 'dimension') {
      newRun.reforgeStones = (newRun.reforgeStones ?? 0) + 2;
      newRun.amber = (newRun.amber ?? 0) + 3;
      const availDimRelics = RELICS.filter((r) => !newRun.relics.some((rr) => rr.id === r.id));
      if (availDimRelics.length > 0) {
        const relic = availDimRelics[Math.floor(Math.random() * availDimRelics.length)];
        Object.assign(newRun, applyRelicGain(newRun, relic));
        toast += ` 获得遗物：${relic.name}！`;
      }
      const factorDimDrop = FACTORS[Math.floor(Math.random() * FACTORS.length)];
      if (!newRun.factors.some((f) => f.id === factorDimDrop.id)) {
        newRun.factors = [...newRun.factors.filter((f) => f.kind !== factorDimDrop.kind), factorDimDrop];
        toast += ` 获得因子：${factorDimDrop.name}！`;
      }
      set({
        run: newRun,
        scene: 'map',
        toast: `${toast} 维度空间已征服！`,
        battle: null,
        targetEnemyUid: null,
      });
      return;
    }

    // 普通战/精英/prison → 奖励（职业过滤）
    const rareBoost = rareChanceValue(newRun);
    const cards: Card[] = [];
    for (let i = 0; i < 5; i++) cards.push(rollRewardCard(run.zoneIndex, rareBoost, 'basic', run.classId));
    // 保底系统：每3场战斗必出一张稀有以上
    newRun.pityCounter = (newRun.pityCounter ?? 0) + 1;
    if (newRun.pityCounter >= 3) {
      const pityCard = rollRewardCard(run.zoneIndex, rareBoost, 'rare', run.classId);
      cards[0] = pityCard;
      if (pityCard.rarity === 'rare' || pityCard.rarity === 'epic' || pityCard.rarity === 'legendary') {
        newRun.pityCounter = 0;
      } else {
        newRun.pityCounter = 2;
      }
    }
    if (battleKind === 'prison') cards[0] = getCardById('core-finisher');
    const isElite = battleKind === 'elite' || battleKind === 'prison';
    if (hasRelic(newRun, 'merchant-bribe') && isFirstCombatOfFloor(run)) {
      set({
        run: newRun,
        battle: null,
        targetEnemyUid: null,
        scene: 'map',
        toast: `${toast} 商人贿赂金生效，本层首战跳过了战斗奖励。`,
      });
      return;
    }
    // 精英战掉落重铸石和因子
    if (isElite) {
      newRun.reforgeStones = (newRun.reforgeStones ?? 0) + 1;
      // 30%概率掉落因子
      if (Math.random() < 0.3) {
        const factorDrop = FACTORS[Math.floor(Math.random() * FACTORS.length)];
        if (!newRun.factors.some((f) => f.id === factorDrop.id)) {
          newRun.factors = [...newRun.factors.filter((f) => f.kind !== factorDrop.kind), factorDrop];
          toast += ` 获得因子：${factorDrop.name}！`;
        }
      }
    }
    // 战斗奖励琥珀：普通1/精英2
    newRun.amber = (newRun.amber ?? 0) + (isElite ? 2 : 1);
    set({
      run: newRun,
      reward: {
        cards,
        rope: isElite ? 22 : 12,
        will: isElite ? 2 : 1,
        isPrison: battleKind === 'prison',
      },
      scene: 'reward',
      toast,
    });
    return;
  }

  // 失败
  meta.recordRun(false, run.zoneIndex);
  meta.addSediment(run.zoneIndex * 6 + run.battlesWon);
  set({ run: { ...run, hp: 0 }, scene: 'death', toast: '「那你还是牢。」', battle: null, targetEnemyUid: null });
}

function applyEventEffects(run: RunState, effects: { kind: string; value?: number; cardId?: string }[]): RunState {
  const r = { ...run };
  for (const e of effects) {
    switch (e.kind) {
      case 'hp': {
        const v = e.value ?? 0;
        r.hp = Math.max(0, Math.min(r.maxHp, r.hp + v));
        break;
      }
      case 'maxHp':
        r.maxHp += e.value ?? 0;
        r.hp = Math.min(r.maxHp, r.hp + (e.value ?? 0));
        break;
      case 'healPercent':
        r.hp = Math.min(r.maxHp, r.hp + Math.floor(r.maxHp * (e.value ?? 0.3)));
        break;
      case 'rope': r.rope += e.value ?? 0; break;
      case 'will': r.will += e.value ?? 0; break;
      case 'amber': r.amber += e.value ?? 0; break;
      case 'addCard':
      case 'addCurse':
        if (e.cardId) r.deck = [...r.deck, getCard(e.cardId)];
        break;
      case 'relic':
        if (e.cardId && RELIC_MAP[e.cardId]) Object.assign(r, applyRelicGain(r, RELIC_MAP[e.cardId]));
        break;
      case 'randomRelic': {
        const avail = RELICS.filter((x) => !r.relics.some((rr) => rr.id === x.id));
        if (avail.length > 0) Object.assign(r, applyRelicGain(r, avail[Math.floor(Math.random() * avail.length)]));
        break;
      }
      case 'randomCard':
        r.deck = [...r.deck, rollRewardCard(r.zoneIndex, rareChanceValue(r), 'basic', r.classId)];
        break;
      case 'removeCard': {
        if (r.deck.length > 0) {
          const idx = Math.floor(Math.random() * r.deck.length);
          r.deck = [...r.deck.slice(0, idx), ...r.deck.slice(idx + 1)];
        }
        break;
      }
      case 'upgradeRandomCard': {
        const upgradeable = r.deck.filter((c) => c.type !== 'curse');
        if (upgradeable.length > 0) {
          const pick = upgradeable[Math.floor(Math.random() * upgradeable.length)];
          pick.nurtureLevel += 1;
        }
        break;
      }
      case 'casteUp': {
        const idx = CASTE_ORDER.indexOf(r.caste);
        if (idx < 3) r.caste = CASTE_ORDER[idx + 1];
        break;
      }
      case 'skipNextBattle': r.skipNextBattle = true; break;
      case 'nextBattleHarder': r.nextBattleHarder = true; break;
      case 'tempAlly': r.tempAlly = true; break;
      default: break;
    }
  }
  return r;
}

export { CHARACTERS };
