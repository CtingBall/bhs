import type { Card, CardEffect, CardInstance, CardTemplate, KeywordId } from '@/types';
import { EFFECT_MODULES } from '@/data/effects';
import {
  applyKeywordsToEffects,
  formatKeywordLine,
  hasExhaustKeyword,
  keywordCostModifier,
} from '@/data/keywords';

let instanceSeq = 0;

export function nextInstanceId(templateId: string): string {
  instanceSeq += 1;
  return `ci-${instanceSeq}-${templateId}`;
}

function mergeKeywords(
  innate?: Partial<Record<KeywordId, number>>,
  extra?: Partial<Record<KeywordId, number>>,
): Partial<Record<KeywordId, number>> {
  const out: Partial<Record<KeywordId, number>> = { ...innate };
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      const id = k as KeywordId;
      out[id] = (out[id] ?? 0) + (v ?? 0);
    }
  }
  return out;
}

function describeEffect(e: CardEffect): string {
  const v = e.value ?? 0;
  const hits = e.hits && e.hits > 1 ? ` ${e.hits} 次` : '';
  const pureScale = e.scaleBy && v === 0;
  const scaleLabel: Record<string, string> = {
    combo: `连击数×${e.scaleMultiplier ?? 1}`,
    block: `当前格挡值${e.scaleMultiplier && e.scaleMultiplier !== 1 ? `×${e.scaleMultiplier}` : ''}`,
    missingHp: `缺失生命×${e.scaleMultiplier ?? 1}`,
    missingHpDiv: `缺失生命÷${e.scaleMultiplier ?? 4}`,
    strength: `力量层数×${e.scaleMultiplier ?? 1}`,
    dexterity: `敏捷层数×${e.scaleMultiplier ?? 1}`,
    enemyBurn: `目标燃烧×${e.scaleMultiplier ?? 1}`,
    enemyFreeze: `目标冰冻×${e.scaleMultiplier ?? 1}`,
    enemyShock: `目标感电×${e.scaleMultiplier ?? 1}`,
    enemyWeak: `目标虚弱×${e.scaleMultiplier ?? 1}`,
    enemyVuln: `目标易伤×${e.scaleMultiplier ?? 1}`,
    handSize: `手牌数×${e.scaleMultiplier ?? 1}`,
    cardsPlayedThisTurn: `已出牌数×${e.scaleMultiplier ?? 1}`,
    attackCombo: `攻击累计×${e.scaleMultiplier ?? 1}`,
    killsThisCombat: `击杀数×${e.scaleMultiplier ?? 1}`,
    energyRemaining: `剩余能量×${e.scaleMultiplier ?? 1}`,
    enemyCount: `敌人数×${e.scaleMultiplier ?? 1}`,
  };
  const scaleText = e.scaleBy ? ` (${scaleLabel[e.scaleBy] ?? ''})` : '';
  const scaleAdd = e.scaleBy && !pureScale ? ` +${scaleLabel[e.scaleBy] ?? ''}` : '';
  const scaleHits = e.scaleHitsBy ? ` 额外段数依${e.scaleHitsBy === 'strength' ? '力量' : '敏捷'}` : '';
  const condLabel: Record<string, string> = {
    enemyHpBelow50: '目标半血以下时伤害翻倍',
    enemyHasWeak: '目标虚弱时伤害翻倍',
    enemyHasFreeze: '目标冰冻时伤害翻倍',
    enemyHasBurn: '目标燃烧时伤害翻倍',
    enemyHasVuln: '目标易伤时伤害翻倍',
    hpBelow50: '半血以下时费用为0',
    blockAbove0: '格挡>0时额外命中',
    firstCardThisTurn: '本回合第一张牌时伤害翻倍',
    handSizeAbove4: '手牌≥5时伤害翻倍',
  };
  const cond = e.conditionalBonus ? `。${condLabel[e.conditionalBonus.condition] ?? ''}` : '';
  switch (e.kind) {
    case 'damage':
      return pureScale
        ? `造成等同于${scaleLabel[e.scaleBy!] ?? ''}的伤害${hits}${scaleHits}${cond}`
        : `造成 ${v} 点伤害${hits}${scaleHits}${scaleAdd}${cond}`;
    case 'damageAll':
      return pureScale
        ? `对所有敌人造成等同于${scaleLabel[e.scaleBy!] ?? ''}的伤害${hits}${scaleHits}${cond}`
        : `对所有敌人造成 ${v} 点伤害${hits}${scaleHits}${scaleAdd}${cond}`;
    case 'block':
      return pureScale
        ? `获得等同于${scaleLabel[e.scaleBy!] ?? ''}的格挡${cond}`
        : `获得 ${v} 点格挡${scaleAdd}${cond}`;
    case 'heal':
      if (v < 0) return `失去 ${-v} 点生命`;
      return pureScale
        ? `回复等同于${scaleLabel[e.scaleBy!] ?? ''}的生命${cond}`
        : `回复 ${v} 点生命${scaleAdd}`;
    case 'draw':
      return `抽 ${v} 张牌`;
    case 'energy':
      return `获得 ${v} 点能量`;
    case 'summon':
      return `召唤星痕`;
    case 'applyStatus': {
      const sn: Record<string, string> = {
        strength: '力量', dexterity: '敏捷', vuln: '易伤', weak: '虚弱',
        freeze: '冰冻', burn: '燃烧', shock: '感电', regen: '再生', frail: '脆弱',
      };
      const s = sn[e.status ?? ''] ?? e.status ?? '?';
      const tgt = e.all ? '所有敌人' : e.statusTarget === 'self' ? '自身' : '敌人';
      return `对${tgt}施加 ${v} 层${s}`;
    }
    default:
      return '';
  }
}

function buildCardText(effects: CardEffect[], keywords: Partial<Record<KeywordId, number>>, nurture: number): string {
  const parts = effects.map(describeEffect).filter(Boolean);
  // 附加效果描述
  const sideEffects = effects
    .filter((e) => e.sideEffect)
    .map((e) => {
      const se = e.sideEffect!;
      switch (se.kind) {
        case 'draw': return `附加抽 ${se.value ?? 1} 牌`;
        case 'energy': return `附加获得 ${se.value ?? 1} 能量`;
        case 'block': return `附加获得 ${se.value ?? 0} 格挡`;
        case 'heal': return `附加回复 ${se.value ?? 0} 生命`;
        case 'applyStatus': return se.statusTarget === 'self' ? `附加获得 ${se.value ?? 1} 层${se.status ?? ''}` : `附加施加 ${se.value ?? 1} 层${se.status ?? ''}`;
        case 'damageAll': return `附加全场 ${se.value ?? 0} 伤害`;
        default: return '';
      }
    })
    .filter(Boolean);
  const allParts = [...parts, ...sideEffects];
  const kwLine = formatKeywordLine(keywords);
  let text = allParts.join('，');
  if (text && !text.endsWith('。')) text += '。';
  if (nurture > 0) text += ` 养成 Lv.${nurture}。`;
  if (kwLine) text += ` 词条：${kwLine}。`;
  if (!text) text = '不可打出。占据你的手牌。';
  return text;
}

/** 从模板 + 实例数据解析完整卡牌 */
export function resolveCard(template: CardTemplate, instance: CardInstance): Card {
  const keywords = mergeKeywords(template.innateKeywords, instance.keywords);
  const mod = EFFECT_MODULES[template.effectId];
  const baseEffects = mod.build(template, instance.nurtureLevel);
  const effects = applyKeywordsToEffects(baseEffects, keywords);
  const cost = Math.max(0, template.baseCost + keywordCostModifier(keywords));
  const exhaust = hasExhaustKeyword(keywords) || template.effectId === 'channel';

  return {
    id: template.id,
    instanceId: instance.instanceId,
    name: template.name,
    type: template.type,
    rarity: template.rarity,
    cost,
    text: buildCardText(effects, keywords, instance.nurtureLevel),
    flavor: template.flavor,
    effects,
    classId: template.classId,
    exhaust: exhaust || undefined,
    nurtureLevel: instance.nurtureLevel,
    keywords,
  };
}

export function createCardInstance(
  template: CardTemplate,
  partial?: Partial<Pick<CardInstance, 'nurtureLevel' | 'keywords' | 'instanceId'>>,
): Card {
  const instance: CardInstance = {
    templateId: template.id,
    instanceId: partial?.instanceId ?? nextInstanceId(template.id),
    nurtureLevel: partial?.nurtureLevel ?? 0,
    keywords: { ...partial?.keywords },
  };
  return resolveCard(template, instance);
}

export function cardInstanceFromResolved(card: Card): CardInstance {
  return {
    templateId: card.id,
    instanceId: card.instanceId,
    nurtureLevel: card.nurtureLevel,
    keywords: { ...card.keywords },
  };
}

export function reResolveInstance(template: CardTemplate, instance: CardInstance): Card {
  return resolveCard(template, instance);
}

/** 养成：提升 nurtureLevel 并重算 */
export function nurtureCard(template: CardTemplate, card: Card): Card {
  const inst = cardInstanceFromResolved(card);
  inst.nurtureLevel += 1;
  return resolveCard(template, inst);
}

/** 铭刻词条：提升或新增词条等级 */
export function inscribeKeyword(template: CardTemplate, card: Card, keywordId: KeywordId): Card {
  const inst = cardInstanceFromResolved(card);
  inst.keywords[keywordId] = (inst.keywords[keywordId] ?? 0) + 1;
  return resolveCard(template, inst);
}

/** 重铸石消耗：随养成等级递增 */
export function nurtureStoneCost(nurtureLevel: number): number {
  return 1 + Math.floor(nurtureLevel / 3);
}

/** 铭刻消耗（意志） */
export function inscribeWillCost(keywordLevel: number): number {
  return 2 + keywordLevel;
}
