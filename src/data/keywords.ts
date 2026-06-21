import type { CardEffect, KeywordId } from '@/types';

export interface KeywordDef {
  id: KeywordId;
  name: string;
  desc: string;
  maxLevel?: number;
}

export const KEYWORDS: KeywordDef[] = [
  { id: 'sharp', name: '锐化', desc: '伤害 +2/级' },
  { id: 'sturdy', name: '固盾', desc: '格挡 +2/级' },
  { id: 'multi', name: '多段', desc: '伤害段数 +1/级', maxLevel: 3 },
  { id: 'spread', name: '扩散', desc: '单体伤害变为全体', maxLevel: 1 },
  { id: 'burn', name: '燃触', desc: '命中附加燃烧 +2/级' },
  { id: 'freeze', name: '霜触', desc: '命中附加冰冻 +1/级' },
  { id: 'shock', name: '雷触', desc: '命中附加感电 +1/级' },
  { id: 'vuln', name: '易伤印', desc: '命中附加易伤 +1/级' },
  { id: 'spring', name: '泉涌', desc: '打出后抽 1 张/级' },
  { id: 'exhaust', name: '消耗', desc: '打出后移出本场战斗', maxLevel: 1 },
  { id: 'efficient', name: '节能', desc: '费用 -1/级', maxLevel: 2 },
];

export const KEYWORD_MAP: Record<KeywordId, KeywordDef> = Object.fromEntries(
  KEYWORDS.map((k) => [k.id, k]),
) as Record<KeywordId, KeywordDef>;

/** 可随机铭刻的词条（不含 innate-only 如 exhaust 通常通过 channel 自带） */
export const INSCRIBABLE_KEYWORDS: KeywordId[] = [
  'sharp', 'sturdy', 'multi', 'spread', 'burn', 'freeze', 'shock', 'vuln', 'spring', 'efficient',
];

function bumpDamageEffects(effects: CardEffect[], delta: number, hitsDelta: number) {
  for (const e of effects) {
    if (e.kind === 'damage' || e.kind === 'damageAll') {
      e.value = (e.value ?? 0) + delta;
      if (hitsDelta > 0) e.hits = (e.hits ?? 1) + hitsDelta;
    }
  }
}

function bumpBlockEffects(effects: CardEffect[], delta: number) {
  for (const e of effects) {
    if (e.kind === 'block') e.value = (e.value ?? 0) + delta;
  }
}

function addOnHitStatus(
  effects: CardEffect[],
  status: NonNullable<CardEffect['status']>,
  amount: number,
  all = false,
) {
  if (amount <= 0) return;
  const hasDamage = effects.some((e) => e.kind === 'damage' || e.kind === 'damageAll');
  if (!hasDamage) return;
  effects.push({
    kind: 'applyStatus',
    value: amount,
    status,
    statusTarget: 'enemy',
    all,
  });
}

/** 将词条叠加到基础效果上 */
export function applyKeywordsToEffects(
  effects: CardEffect[],
  keywords: Partial<Record<KeywordId, number>>,
): CardEffect[] {
  const out = effects.map((e) => ({ ...e }));
  const kw = keywords;

  if (kw.sharp) bumpDamageEffects(out, kw.sharp * 2, 0);
  if (kw.sturdy) bumpBlockEffects(out, kw.sturdy * 2);
  if (kw.multi) bumpDamageEffects(out, 0, kw.multi);

  if (kw.spread && kw.spread > 0) {
    for (let i = 0; i < out.length; i++) {
      if (out[i].kind === 'damage') {
        out[i] = { ...out[i], kind: 'damageAll' };
      }
    }
  }

  const hitAll = (kw.spread ?? 0) > 0;
  if (kw.burn) addOnHitStatus(out, 'burn', kw.burn * 2, hitAll);
  if (kw.freeze) addOnHitStatus(out, 'freeze', kw.freeze, hitAll);
  if (kw.shock) addOnHitStatus(out, 'shock', kw.shock, hitAll);
  if (kw.vuln) addOnHitStatus(out, 'vuln', kw.vuln, hitAll);

  if (kw.spring && kw.spring > 0) {
    out.push({ kind: 'draw', value: kw.spring });
  }

  return out;
}

export function keywordCostModifier(keywords: Partial<Record<KeywordId, number>>): number {
  return (keywords.efficient ?? 0) * -1;
}

export function hasExhaustKeyword(keywords: Partial<Record<KeywordId, number>>): boolean {
  return (keywords.exhaust ?? 0) > 0;
}

export function formatKeywordLine(keywords: Partial<Record<KeywordId, number>>): string {
  return Object.entries(keywords)
    .filter(([, lv]) => (lv ?? 0) > 0)
    .map(([id, lv]) => {
      const def = KEYWORD_MAP[id as KeywordId];
      return def ? `${def.name}${(lv ?? 0) > 1 ? `·${lv}` : ''}` : id;
    })
    .join(' · ');
}
