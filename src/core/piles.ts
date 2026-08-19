// ============================================================================
// 牌区流转管理器（Pile Manager）
// 抽牌堆 / 手牌 / 弃牌堆 / 放逐堆 —— 绑定 RNG_Deck 确定性洗牌
// ============================================================================

import type { CardInstance } from './cards';
import { cardInstance } from './cards';
import type { RngStream } from './rng';

export class PileManager {
  draw: CardInstance[] = [];
  hand: CardInstance[] = [];
  discard: CardInstance[] = [];
  exhaust: CardInstance[] = [];

  private deckRng: RngStream;
  private uidCounter = 0;

  constructor(deckRng: RngStream) {
    this.deckRng = deckRng;
  }

  /** 用卡牌条目初始化抽牌堆（构造玩家牌组：defId + 升级等级） */
  initDeck(entries: Array<{ defId: string; level?: 0 | 1 | 2 }>): void {
    this.draw = entries.map((e) => cardInstance(e.defId, this.nextUid(), e.level ?? 0));
    this.discard = [];
    this.exhaust = [];
    this.hand = [];
    this.shuffleDraw();
  }

  private nextUid(): string {
    return `c${++this.uidCounter}`;
  }

  /** Fisher-Yates 确定性洗牌（绑定 RNG_Deck） */
  shuffleDraw(): void {
    const arr = this.draw;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.deckRng.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  /** 抽牌；抽牌堆耗尽时把弃牌堆洗入。返回抽到的牌（溢出由调用方处理）。 */
  drawCards(amount: number): CardInstance[] {
    const drawn: CardInstance[] = [];
    for (let i = 0; i < amount; i++) {
      if (this.draw.length === 0) {
        if (this.discard.length === 0) break;
        this.draw = this.discard;
        this.discard = [];
        this.shuffleDraw();
      }
      const card = this.draw.pop()!;
      drawn.push(card);
    }
    return drawn;
  }

  /** 创建一张新卡（衍生卡/生成卡） */
  createCard(defId: string): CardInstance {
    return cardInstance(defId, this.nextUid());
  }

  findInHand(uid: string): CardInstance | undefined {
    return this.hand.find((c) => c.uid === uid);
  }

  removeFromHand(uid: string): CardInstance | undefined {
    const idx = this.hand.findIndex((c) => c.uid === uid);
    if (idx < 0) return undefined;
    return this.hand.splice(idx, 1)[0];
  }

  moveToDiscard(card: CardInstance): void {
    this.discard.push(card);
  }

  moveToExhaust(card: CardInstance): void {
    this.exhaust.push(card);
  }

  addToHand(card: CardInstance): void {
    this.hand.push(card);
  }

  addToDrawTop(card: CardInstance): void {
    this.draw.push(card);
  }

  addToDiscard(card: CardInstance): void {
    this.discard.push(card);
  }

  /**
   * 从指定牌堆检索一张卡：优先按运行时 uid，兼容按定义 defId 检索。
   * uid 用于 ExileCard 精确操作某张牌；defId 用于“找一张指定卡”的效果。
   */
  fetchFromPile(cardId: string, from: 'draw' | 'discard' | 'exhaust'): CardInstance | undefined {
    const pile = this[from];
    const idx = pile.findIndex((c) => c.uid === cardId || c.defId === cardId);
    if (idx < 0) return undefined;
    return pile.splice(idx, 1)[0];
  }

  /** 回合结束：手牌移入弃牌堆（保留词条除外） */
  discardHandAtTurnEnd(): void {
    const kept = this.hand.filter((c) => c.retain);
    const dropped = this.hand.filter((c) => !c.retain);
    this.discard.push(...dropped);
    this.hand = kept;
  }
}
