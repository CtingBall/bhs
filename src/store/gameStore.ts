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
import { CASTE_ORDER, CASTE_NAME } from '@/types';
import { CHARACTERS, CHARACTER_MAP } from '@/data/characters';
import { ENEMIES, ENEMY_MAP } from '@/data/enemies';
import { RELICS, RELIC_MAP } from '@/data/relics';
import { EVENTS } from '@/data/events';
import { FACTOR_MAP, FACTORS } from '@/data/factors';
import { SUMMON_RECIPE_MAP } from '@/data/summonRecipes';
import { SUMMON_MAP } from '@/data/summons';
import { CARD_MAP, REWARD_POOL } from '@/data/cards';
import {
  createBattle,
  enemyTurn,
  endPlayerTurn,
  getCard,
  playCard,
  rollRewardCard,
  startPlayerTurn,
} from '@/engine/battle';
import { buildDeck, generateMap, getReachableIds } from '@/engine/map';
import { useMetaStore } from './metaStore';

type BattleKind = 'normal' | 'elite' | 'boss' | 'prison';

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
  resolveRest: (choice: 'heal' | 'prison') => void;
  enterShop: () => void;
  buyShopCard: (i: number) => void;
  buyShopRelic: () => void;
  buyShopRelic2: (i: number) => void;
  removeShopCard: (cardId: string) => void;
  reforgeCard: (cardId: string) => void;       // 卡牌升级（重铸）
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
const ZONE_LIST: Zone[] = ['strike', 'doom', 'punish', 'abyss', 'mirage', 'armageddon', 'astral'];

function hasRareChance(run: { relics: Relic[] }): boolean {
  return run.relics.some((r) => r.effect.kind === 'rareChance');
}
function shopDiscount(run: { relics: Relic[] }): number {
  return run.relics.reduce((sum, r) => sum + (r.effect.kind === 'shopDiscount' ? (r.effect.value ?? 0) : 0), 0);
}

function cardPrice(c: Card): number {
  return { basic: 15, common: 25, rare: 50, epic: 75, legendary: 120 }[c.rarity];
}
function relicPrice(r: Relic): number {
  return { common: 4, rare: 6, boss: 8 }[r.rarity];
}

function pickNormal(zone: Zone): Enemy[] {
  let pool = ENEMIES.filter((e) => !e.isElite && !e.isBoss);
  if (zone !== 'punish') pool = pool.filter((e) => e.zone === zone || e.roaming);
  const count = Math.random() < 0.4 ? 2 : 1;
  const out: Enemy[] = [];
  for (let i = 0; i < count; i++) {
    const e = pool[Math.floor(Math.random() * pool.length)];
    out.push({ ...e });
  }
  return out;
}
function pickElite(): Enemy[] {
  const pool = ENEMIES.filter((e) => e.isElite);
  const e = pool[Math.floor(Math.random() * pool.length)];
  return [{ ...e }];
}
function pickBoss(zone: Zone): Enemy[] {
  return [{ ...ENEMY_MAP[ZONE_BOSS[zone]] }];
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
      set({
        run: { ...newRun, skipNextBattle: false },
        toast: '「无所谓我会选择不打等削弱」——跳过了这场战斗。',
      });
      return;
    }
    if (node.type === 'battle') return startCombat(get, set, pickNormal(zone), 'normal');
    if (node.type === 'elite') return startCombat(get, set, pickElite(), 'elite');
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
    // 诅咒转绳子遗物（虫罐等）
    if (isCurse) {
      const ctr = next.relics.reduce((sum, r) => sum + (r.effect.kind === 'curseToRope' ? (r.effect.value ?? 0) : 0), 0);
      if (ctr > 0) set({ run: { ...run, rope: run.rope + ctr } });
    }
    set({ battle: next });
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
    if (choice === 'heal') {
      const heal = Math.floor(run.maxHp * 0.3);
      set({ run: { ...run, hp: Math.min(run.maxHp, run.hp + heal) }, scene: 'map', toast: `等削弱……回复了 ${heal} 点生命。` });
    } else {
      startCombat(get, set, pickElite(), 'prison');
    }
  },

  enterShop: () => {
    const { run } = get();
    if (!run) return;
    const rareBoost = hasRareChance(run);
    const cards: { card: Card; price: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const c = rollRewardCard(rareBoost);
      cards.push({ card: c, price: cardPrice(c) });
    }
    const availRelics = RELICS.filter((r) => !run.relics.some((rr) => rr.id === r.id));
    // 随机选3件（打乱取前3）
    const shuffled = [...availRelics].sort(() => Math.random() - 0.5);
    const relics = shuffled.slice(0, 3);
    while (relics.length < 3) relics.push(null);
    set({
      shop: {
        cards,
        relics,
        relicPrices: relics.map((r) => r ? relicPrice(r) : 0),
        removePrice: 2,
        boughtCards: [],
        boughtRelics: [false, false, false],
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
    const newRun = { ...run, amber: run.amber - finalPrice, relics: [...run.relics, relic] };
    set({ run: newRun, shop: { ...shop, boughtRelics: newBought }, toast: `获得遗物：${relic.name}` });
  },

  removeShopCard: (cardId) => {
    const { run, shop } = get();
    if (!run || !shop || shop.removed) return;
    const discount = shopDiscount(run);
    const finalPrice = Math.max(1, shop.removePrice - discount);
    if (run.will < finalPrice) {
      set({ toast: '意志不够。' });
      return;
    }
    const idx = run.deck.findIndex((c) => c.id === cardId);
    if (idx < 0) return;
    const newDeck = [...run.deck];
    newDeck.splice(idx, 1);
    set({ run: { ...run, will: run.will - finalPrice, deck: newDeck }, shop: { ...shop, removed: true }, toast: '移除了一张牌。' });
  },

  // ===== 卡牌升级（重铸） =====
  reforgeCard: (cardId) => {
    const run = get().run;
    if (!run) return;
    const card = run.deck.find((c) => c.id === cardId);
    if (!card) return;
    const currentLevel = card.upgradeLevel ?? 0;
    if (currentLevel >= 2) {
      set({ toast: '该卡牌已精通，无法继续重铸。' });
      return;
    }
    const cost = currentLevel === 0 ? 2 : 4;
    if ((run.reforgeStones ?? 0) < cost) {
      set({ toast: `重铸石不足！需要 ${cost} 个，当前 ${run.reforgeStones ?? 0} 个。` });
      return;
    }
    const newRun = {
      ...run,
      reforgeStones: (run.reforgeStones ?? 0) - cost,
      deck: run.deck.map((c) =>
        c.id === cardId
          ? { ...c, upgradeLevel: currentLevel + 1, upgraded: true }
          : c,
      ),
    };
    set({ run: newRun, toast: `「重铸石」使用成功！${card.name} 提升至 ${currentLevel === 0 ? '升级' : '精通'}！` });
  },

  // ===== 召唤物融合 =====
  fuseSummons: (recipeId) => {
    const run = get().run;
    if (!run) return;
    const recipe = SUMMON_RECIPE_MAP[recipeId];
    if (!recipe) return;
    const hasAllMaterials = recipe.materials.every((matId) =>
      run.deck.some((c) => c.id === `summon-${matId}` || c.id === matId),
    );
    if (!hasAllMaterials) {
      set({ toast: '材料不足！需要对应的召唤牌。' });
      return;
    }
    const consumed = new Array(recipe.materials.length).fill(false);
    const newDeck = run.deck.filter((c) => {
      for (let mi = 0; mi < recipe.materials.length; mi++) {
        if (consumed[mi]) continue;
        const matId = recipe.materials[mi];
        if (c.id === `summon-${matId}` || c.id === matId) {
          consumed[mi] = true;
          return false;
        }
      }
      return true;
    });
    const resultCard: Card = {
      id: `summon-${recipe.resultSummonId}`,
      name: SUMMON_MAP[recipe.resultSummonId]?.name ?? recipe.name,
      type: 'summon',
      rarity: 'epic',
      cost: 1,
      text: SUMMON_MAP[recipe.resultSummonId]?.desc ?? recipe.desc,
      flavor: recipe.flavor,
      effects: [{ kind: 'summon', summonId: recipe.resultSummonId }],
      upgradeLevel: 0,
    };
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
    newRun.castePoints = run.castePoints + (battleKind === 'elite' || battleKind === 'prison' || battleKind === 'boss' ? 2 : 1);
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
        meta.recordRun(true, 3);
        meta.addSediment(40 + newRun.battlesWon * 2);
        set({ run: newRun, scene: 'victory', toast });
        return;
      }
      newRun.zoneIndex = run.zoneIndex + 1;
      newRun.currentNodeId = null;
      newRun.hp = Math.min(newRun.maxHp, newRun.hp + Math.floor(newRun.maxHp * 0.25));
      newRun.reforgeStones = (newRun.reforgeStones ?? 0) + 3; // Boss掉落重铸石
      set({ run: newRun, scene: 'map', toast: toast + ` 进入${ZONE_LIST[newRun.zoneIndex] === 'doom' ? '厄运区' : '惩戒区'}！获得 3 重铸石！` });
      return;
    }

    // 普通战/精英/prison → 奖励
    const rareBoost = newRun.relics.some((r) => r.id === 'dalit-liberation');
    const cards: Card[] = [];
    for (let i = 0; i < 5; i++) cards.push(rollRewardCard(rareBoost));
    // 保底系统：每3场战斗必出一张稀有以上
    newRun.pityCounter = (newRun.pityCounter ?? 0) + 1;
    if (newRun.pityCounter >= 3) {
      const rarePool = REWARD_POOL.filter((c) => c.rarity === 'rare' || c.rarity === 'epic' || c.rarity === 'legendary');
      if (rarePool.length > 0) {
        cards[0] = rarePool[Math.floor(Math.random() * rarePool.length)];
        newRun.pityCounter = 0;
      }
    }
    if (battleKind === 'prison') cards[0] = getCard('punish-dynasty-card');
    const isElite = battleKind === 'elite' || battleKind === 'prison';
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
  set({ run: { ...run, hp: 0 }, scene: 'death', toast: '「那你还是牢。」' });
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
      case 'rope': r.rope += e.value ?? 0; break;
      case 'will': r.will += e.value ?? 0; break;
      case 'amber': r.amber += e.value ?? 0; break;
      case 'addCard':
      case 'addCurse':
        if (e.cardId && CARD_MAP[e.cardId]) r.deck = [...r.deck, { ...CARD_MAP[e.cardId] }];
        break;
      case 'relic':
        if (e.cardId && RELIC_MAP[e.cardId]) r.relics = [...r.relics, RELIC_MAP[e.cardId]];
        break;
      case 'randomRelic': {
        const avail = RELICS.filter((x) => !r.relics.some((rr) => rr.id === x.id));
        if (avail.length > 0) r.relics = [...r.relics, avail[Math.floor(Math.random() * avail.length)]];
        break;
      }
      case 'randomCard':
        r.deck = [...r.deck, rollRewardCard(hasRareChance(r))];
        break;
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
