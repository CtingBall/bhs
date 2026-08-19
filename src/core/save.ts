// ============================================================================
// 事务级双槽快照存档（Double-Buffer Transactional Save）
// 主槽与备份槽轮替写入 + 校验码；仅保存 RunSnapshot（RNG 由 Master Seed 复现，
// 无需持久化内部状态即可保证确定性防 SL）
// ============================================================================

import type { RunSnapshot } from './run';
import type { SerializedMap } from './map';
import { mapFromJSON } from './map';

const KEY_A = 'bhs_clan_save_a';
const KEY_B = 'bhs_clan_save_b';
const KEY_PTR = 'bhs_clan_save_ptr';
const VERSION = 1;

interface SaveEnvelope {
  version: number;
  savedAt: number;
  checksum: number;
  data: SerializedRun;
}

interface SerializedRun {
  seed: string;
  classId: string;
  hp: number;
  maxHp: number;
  gold: number;
  deck: Array<{ defId: string; level: number }>;
  relics: string[];
  act: number;
  currentNodeId: string | null;
  map: SerializedMap;
  flags: Record<string, unknown>;
  stats: RunSnapshot['stats'];
  victory?: boolean;
  defeat?: boolean;
  rngStates?: RunSnapshot['rngStates'];
}

function crc32(str: string): number {
  let crc = 0xffffffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function serialize(snapshot: RunSnapshot): SerializedRun {
  return {
    seed: snapshot.seed,
    classId: snapshot.classId,
    hp: snapshot.hp,
    maxHp: snapshot.maxHp,
    gold: snapshot.gold,
    deck: snapshot.deck,
    relics: snapshot.relics,
    act: snapshot.act,
    currentNodeId: snapshot.currentNodeId,
    map: snapshot.map as unknown as SerializedMap, // 存档时剥离 nodesById
    flags: snapshot.flags,
    stats: snapshot.stats,
    victory: snapshot.victory,
    defeat: snapshot.defeat,
    rngStates: snapshot.rngStates,
  };
}

function deserialize(data: SerializedRun): RunSnapshot {
  return {
    ...data,
    deck: data.deck.map((d) => ({ defId: d.defId, level: d.level as 0 | 1 | 2 })),
    map: mapFromJSON(data.map),
  };
}

function storageAvailable(): boolean {
  try {
    const k = '__bhs_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function saveRun(snapshot: RunSnapshot): boolean {
  if (!storageAvailable()) return false;
  try {
    const ser = serialize(snapshot);
    const json = JSON.stringify(ser);
    const envelope: SaveEnvelope = {
      version: VERSION,
      savedAt: Date.now(),
      checksum: crc32(json),
      data: ser,
    };
    // 写入备用槽
    const ptr = localStorage.getItem(KEY_PTR);
    const target = ptr === KEY_A ? KEY_B : KEY_A;
    localStorage.setItem(target, JSON.stringify(envelope));
    // 校验后切换指针
    const raw = localStorage.getItem(target);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as SaveEnvelope;
    if (parsed.checksum !== crc32(JSON.stringify(parsed.data))) {
      localStorage.removeItem(target);
      return false;
    }
    localStorage.setItem(KEY_PTR, target);
    return true;
  } catch {
    return false;
  }
}

export function loadRun(): RunSnapshot | null {
  if (!storageAvailable()) return null;
  try {
    const ptr = localStorage.getItem(KEY_PTR);
    const candidates = [ptr, ptr === KEY_A ? KEY_B : KEY_A].filter(Boolean) as string[];
    for (const key of candidates) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as SaveEnvelope;
        if (parsed.version !== VERSION) continue;
        if (parsed.checksum !== crc32(JSON.stringify(parsed.data))) continue;
        return deserialize(parsed.data);
      } catch {
        // 槽损坏，尝试下一槽
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  try {
    const ptr = localStorage.getItem(KEY_PTR);
    return ptr === KEY_A || ptr === KEY_B;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY_A);
    localStorage.removeItem(KEY_B);
    localStorage.removeItem(KEY_PTR);
  } catch {
    // file:// 下 localStorage 可能不可用
  }
}
