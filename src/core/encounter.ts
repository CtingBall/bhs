// ============================================================================
// 非战斗节点引擎（Encounter Engine）
// 事件 / 商店 / 营地 / 宝箱 —— 统一由遭遇状态机管理
// ============================================================================

import type { Run } from './run';
import type { MapNode } from './map';
import type { EventDef } from '../content/events';
import { pickEvent } from '../content/events';
import { getRelicDef } from '../content/relics';
import { RELIC_REGISTRY } from '../content/relics';
import { getCardDef } from './cards';

export type EncounterScreen =
  | EventScreen | ShopScreen | RestScreen | TreasureScreen;

export interface EventScreen {
  kind: 'event';
  event: EventDef;
}

export interface ShopItem {
  kind: 'card' | 'relic';
  defId: string;
  price: number;
  discounted?: boolean;
}

export interface ShopScreen {
  kind: 'shop';
  items: ShopItem[];
  removePrice: number;
  removeCount: number;
}

export interface RestScreen {
  kind: 'rest';
  canHeal: boolean;
  ritualName: string;
  ritualDesc: string;
}

export interface TreasureScreen {
  kind: 'treasure';
  gold: number;
  relicId?: string;
  text: string;
}

/** 打开当前节点的非战斗遭遇 */
export function openEncounter(run: Run, node: MapNode): EncounterScreen {
  switch (node.type) {
    case 'event': {
      const event = pickEvent(run, run.state.act);
      return { kind: 'event', event };
    }
    case 'shop':
      return { kind: 'shop', ...generateShop(run) };
    case 'rest':
      return {
        kind: 'rest',
        canHeal: !run.hasRelic('relic_black_market'),
        ritualName: run.classDef.campRitual.name,
        ritualDesc: run.classDef.campRitual.desc,
      };
    case 'treasure':
      return openTreasure(run);
    default:
      throw new Error(`非战斗节点不应是类型: ${node.type}`);
  }
}

// ---------------------------------------------------------------------------
// 商店
// ---------------------------------------------------------------------------

function generateShop(run: Run): { items: ShopItem[]; removePrice: number; removeCount: number } {
  const cls = run.classDef;
  const items: ShopItem[] = [];
  const used = new Set<string>();

  // 卡牌货架：4 张（稀有度权重 + 1 张 50% 骨折折扣）
  for (let i = 0; i < 4; i++) {
    const rarity = pickRarity(run);
    const candidates = cls.cardPool.filter((id) => getCardDef(id).rarity === rarity && !used.has(id));
    if (candidates.length === 0) continue;
    const defId = candidates[run.rng.reward.int(0, candidates.length - 1)];
    used.add(defId);
    const price = run.shopCardPrice(defId);
    items.push({ kind: 'card', defId, price, discounted: i === 0 });
  }

  // 遗物货架：1~2 件（非 Boss 遗物）
  const relicPool = [...RELIC_REGISTRY.values()].filter((r) => r.rarity !== 'Boss');
  const relicCount = run.rng.reward.chance(0.6) ? 2 : 1;
  const usedRelics = new Set<string>();
  for (let i = 0; i < relicCount && i < relicPool.length; i++) {
    const relic = run.rng.reward.pick(relicPool);
    if (usedRelics.has(relic.id)) continue;
    usedRelics.add(relic.id);
    items.push({ kind: 'relic', defId: relic.id, price: run.shopRelicPrice(relic.id) });
  }

  return {
    items,
    removePrice: run.removeCardPrice(),
    removeCount: (run.state.flags['cardRemovals'] as number) ?? 0,
  };
}

function pickRarity(run: Run): 'Common' | 'Uncommon' | 'Rare' {
  const roll = run.rng.reward.next() * 100;
  if (roll < 60) return 'Common';
  if (roll < 90) return 'Uncommon';
  return 'Rare';
}

// ---------------------------------------------------------------------------
// 宝箱
// ---------------------------------------------------------------------------

function openTreasure(run: Run): TreasureScreen {
  // 小/中型宝箱：60% 遗物，40% 金币
  if (run.rng.reward.chance(0.6)) {
    const roll = run.rng.reward.next() * 100;
    const rarity = roll < 30 ? 'Common' : roll < 85 ? 'Uncommon' : 'Rare';
    const pool = [...RELIC_REGISTRY.values()].filter((r) => r.rarity === rarity);
    if (pool.length > 0) {
      const relic = run.rng.reward.pick(pool);
      run.addRelic(relic.id);
      return {
        kind: 'treasure', gold: 0, relicId: relic.id,
        text: `你打开了宝箱，里面静静躺着一件【${relic.name}】：${relic.desc}`,
      };
    }
  }
  const gold = run.rng.reward.int(30, 60);
  run.addGold(gold);
  return { kind: 'treasure', gold, text: `你打开了宝箱，里面是 ${gold} 枚金币。` };
}

export function getShopBuyPrice(item: ShopItem): number {
  if (item.kind === 'relic') return getRelicDef(item.defId).basePrice;
  return item.price;
}
