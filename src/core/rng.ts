// ============================================================================
// 确定性随机数：Master Seed 派生 4 条互不干扰的子流
//  - RNG_Map    地图生成与事件分支
//  - RNG_Deck   战斗内洗牌与抽卡顺序
//  - RNG_Combat 暴击、随机目标、卡牌随机衍生
//  - RNG_Reward 战后三选一卡池、商店货物
// ============================================================================

/** mulberry32 —— 快速、确定性的 32 位种子 PRNG */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** cyrb53 —— 字符串哈希（用于把 Master Seed 字符串转成数值种子） */
export function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export type RngStreamName = 'map' | 'deck' | 'combat' | 'reward';

/** 单条随机数流（含常用便捷方法；内部状态可序列化，保证重开后确定性一致） */
export class RngStream {
  private a: number;

  constructor(seed: number) {
    this.a = seed >>> 0;
  }

  /** [0,1) */
  next(): number {
    this.a |= 0;
    this.a = (this.a + 0x6d2b79f5) | 0;
    let t = Math.imul(this.a ^ (this.a >>> 15), 1 | this.a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** 序列化内部状态 */
  getState(): number {
    return this.a >>> 0;
  }

  /** 恢复内部状态（存档读档用） */
  restore(state: number): void {
    this.a = state >>> 0;
  }

  /** [min, max] 闭区间整数 */
  int(min: number, max: number): number {
    if (max < min) [min, max] = [max, min];
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** 随机抽取数组中的一个元素 */
  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('RngStream.pick: empty array');
    return arr[this.int(0, arr.length - 1)];
  }

  /** 概率判定（p ∈ [0,1]） */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Fisher-Yates 原地洗牌（确定性） */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

/** 由 Master Seed 字符串派生全部子流 */
export class RngBank {
  readonly masterSeed: string;
  readonly map: RngStream;
  readonly deck: RngStream;
  readonly combat: RngStream;
  readonly reward: RngStream;

  constructor(masterSeed: string) {
    this.masterSeed = masterSeed;
    const base = cyrb53(masterSeed);
    this.map = new RngStream(cyrb53('map', base));
    this.deck = new RngStream(cyrb53('deck', base));
    this.combat = new RngStream(cyrb53('combat', base));
    this.reward = new RngStream(cyrb53('reward', base));
  }

  stream(name: RngStreamName): RngStream {
    return this[name];
  }

  /** 序列化全部子流状态 */
  getStates(): Record<RngStreamName, number> {
    return {
      map: this.map.getState(),
      deck: this.deck.getState(),
      combat: this.combat.getState(),
      reward: this.reward.getState(),
    };
  }

  /** 恢复全部子流状态（读档） */
  restoreStates(states: Partial<Record<RngStreamName, number>>): void {
    if (states.map !== undefined) this.map.restore(states.map);
    if (states.deck !== undefined) this.deck.restore(states.deck);
    if (states.combat !== undefined) this.combat.restore(states.combat);
    if (states.reward !== undefined) this.reward.restore(states.reward);
  }
}

/** 生成一个随机的 Master Seed 字符串（新开一局用） */
export function randomMasterSeed(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  const rng = mulberry32((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
  for (let i = 0; i < 12; i++) s += chars[Math.floor(rng() * chars.length)];
  return s;
}
