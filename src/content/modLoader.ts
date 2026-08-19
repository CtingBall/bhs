// ============================================================================
// Mod 热加载：外部 JSON Schema 导入接口（设计文档 6.3）
// 玩家导入合规 JSON 文件（或从内容注册表热注册）即可扩充卡牌池
// ============================================================================

import type { CardDef } from '../core/cards';
import { registerCard, getCardDef } from '../core/cards';
import { validateCardDef } from '../core/validate';
import { CLASS_REGISTRY } from './classes';

export interface ModImportResult {
  ok: boolean;
  added: number;
  errors: string[];
}

export interface ModFile {
  modName?: string;
  version?: string;
  cards: unknown[];
}

/** 导入 Mod JSON：校验 → 注册卡牌 → 加入全部职业卡池 */
export function importModJson(json: unknown): ModImportResult {
  const errors: string[] = [];
  let added = 0;
  if (!json || typeof json !== 'object') {
    return { ok: false, added: 0, errors: ['Mod 文件必须是 JSON 对象'] };
  }
  const mod = json as ModFile;
  if (!Array.isArray(mod.cards) || mod.cards.length === 0) {
    return { ok: false, added: 0, errors: ['Mod 缺少 cards 数组'] };
  }
  for (const raw of mod.cards) {
    if (!raw || typeof raw !== 'object') {
      errors.push('存在非对象卡牌条目');
      continue;
    }
    const def = raw as CardDef;
    const errs = validateCardDef(def);
    if (errs.length > 0) {
      errors.push(...errs.map((e) => `[${def.id ?? '?'}] ${e}`));
      continue;
    }
    // 防重名：已存在则拒绝
    if (hasCard(def.id)) {
      errors.push(`[${def.id}] 已存在同名卡牌`);
      continue;
    }
    try {
      registerCard(def);
      // 加入所有职业卡池（保证可抓取）
      for (const cls of CLASS_REGISTRY.values()) {
        if (!cls.cardPool.includes(def.id)) cls.cardPool.push(def.id);
      }
      added++;
    } catch (e) {
      errors.push(`[${def.id}] 注册失败: ${(e as Error).message}`);
    }
  }
  return { ok: errors.length === 0, added, errors };
}

function hasCard(id: string): boolean {
  try {
    getCardDef(id);
    return true;
  } catch {
    return false;
  }
}

/** 从文件导入 */
export async function importModFromFile(file: File): Promise<ModImportResult> {
  const text = await file.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, added: 0, errors: ['JSON 解析失败'] };
  }
  return importModJson(json);
}
