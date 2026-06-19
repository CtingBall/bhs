import { create } from 'zustand';
import type { MetaProgress } from '@/types';

const KEY = 'bhs-meta-v1';

const DEFAULT_META: MetaProgress = {
  sediment: 0,
  unlockedCards: [],
  unlockedEnemies: [],
  bestZone: 0,
  runs: 0,
  totalWins: 0,
};

function load(): MetaProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_META };
    return { ...DEFAULT_META, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_META };
  }
}

interface MetaStore extends MetaProgress {
  unlockCard: (id: string) => void;
  unlockEnemy: (id: string) => void;
  addSediment: (n: number) => void;
  recordRun: (won: boolean, bestZone: number) => void;
  reset: () => void;
}

export const useMetaStore = create<MetaStore>((set) => ({
  ...load(),
  unlockCard: (id) =>
    set((s) =>
      s.unlockedCards.includes(id)
        ? s
        : { unlockedCards: [...s.unlockedCards, id] },
    ),
  unlockEnemy: (id) =>
    set((s) =>
      s.unlockedEnemies.includes(id)
        ? s
        : { unlockedEnemies: [...s.unlockedEnemies, id] },
    ),
  addSediment: (n) => set((s) => ({ sediment: s.sediment + n })),
  recordRun: (won, bestZone) =>
    set((s) => ({
      runs: s.runs + 1,
      totalWins: s.totalWins + (won ? 1 : 0),
      bestZone: Math.max(s.bestZone, bestZone),
    })),
  reset: () => set({ ...DEFAULT_META }),
}));

// 持久化
useMetaStore.subscribe((state) => {
  try {
    const { unlockedCards, unlockedEnemies, sediment, bestZone, runs, totalWins } = state;
    localStorage.setItem(
      KEY,
      JSON.stringify({ unlockedCards, unlockedEnemies, sediment, bestZone, runs, totalWins }),
    );
  } catch {
    // ignore
  }
});
