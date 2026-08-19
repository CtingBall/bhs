// ============================================================================
// 局外档案（Meta Profile）：星魂碎片经济 / 大天赋解锁与装配 / 进阶等级
// 持久化于 localStorage（独立于单局存档）
// ============================================================================

export interface ProfileState {
  /** 星魂碎片（单局结算产出） */
  soulEmbers: number;
  /** 已解锁的大天赋 id */
  unlockedKeystones: string[];
  /** 各职业当前装配的大天赋（受槽位数限制） */
  equipped: Record<string, string[]>;
  /** 进阶等级 0~10 */
  ascensionLevel: number;
  stats: {
    victories: number;
    act1BossKills: number;
    ascension5Cleared: boolean;
    ascension10Cleared: boolean;
    runsPlayed: number;
  };
}

const KEY = 'bhs_clan_profile_v1';

export const DEFAULT_PROFILE: ProfileState = {
  soulEmbers: 0,
  unlockedKeystones: [],
  equipped: {},
  ascensionLevel: 0,
  stats: { victories: 0, act1BossKills: 0, ascension5Cleared: false, ascension10Cleared: false, runsPlayed: 0 },
};

export function loadProfile(): ProfileState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw) as Partial<ProfileState>;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      stats: { ...DEFAULT_PROFILE.stats, ...(parsed.stats ?? {}) },
      equipped: parsed.equipped ?? {},
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: ProfileState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // file:// 下可能不可用
  }
}

/** 槽位阶梯：初始 1 → 击败第 1 章 Boss +1 → 首次通关 +1 → 进阶 5 +1 → 进阶 10 +1 */
export function maxKeystoneSlots(profile: ProfileState): number {
  let slots = 1;
  if (profile.stats.act1BossKills > 0) slots++;
  if (profile.stats.victories > 0) slots++;
  if (profile.stats.ascension5Cleared) slots++;
  if (profile.stats.ascension10Cleared) slots++;
  return slots;
}

export function isKeystoneUnlocked(profile: ProfileState, id: string): boolean {
  return profile.unlockedKeystones.includes(id);
}

/** 装配/卸下（0 成本自由加点）；超出槽位时按装配顺序截断 */
export function toggleEquip(profile: ProfileState, classId: string, keystoneId: string, slots: number): boolean {
  const list = profile.equipped[classId] ?? [];
  if (list.includes(keystoneId)) {
    profile.equipped[classId] = list.filter((k) => k !== keystoneId);
    return false;
  }
  if (list.length >= slots) return false; // 槽位已满
  profile.equipped[classId] = [...list, keystoneId];
  return true;
}

/** 单局结算产出星魂碎片：通关 + 进阶加成；失败保底 */
export function awardEmbers(profile: ProfileState, victory: boolean, actReached: number, ascension: number): number {
  let embers = victory ? 30 + actReached * 10 : 8 + actReached * 2;
  if (ascension >= 1) embers += ascension * 2; // 高进阶更多
  profile.soulEmbers += embers;
  return embers;
}

/** 结算统计（调用方在跑局结束后调用） */
export function recordRunResult(profile: ProfileState, victory: boolean, ascension: number): void {
  profile.stats.runsPlayed++;
  if (victory) {
    profile.stats.victories++;
    if (ascension >= 5) profile.stats.ascension5Cleared = true;
    if (ascension >= 10) profile.stats.ascension10Cleared = true;
  }
}
