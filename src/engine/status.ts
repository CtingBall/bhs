import type { StatusInstance, StatusType } from '@/types';

// 深拷贝（state 均为纯数据）
export function clone<T>(x: T): T {
  return structuredClone(x);
}

export function getStatus(statuses: StatusInstance[], type: StatusType): number {
  return statuses.find((s) => s.type === type)?.amount ?? 0;
}

export function addStatus(
  statuses: StatusInstance[],
  type: StatusType,
  amount: number,
): void {
  if (amount === 0) return;
  const s = statuses.find((x) => x.type === type);
  if (s) {
    s.amount += amount;
    if (s.amount <= 0) {
      const i = statuses.indexOf(s);
      if (i >= 0) statuses.splice(i, 1);
    }
  } else if (amount > 0) {
    statuses.push({ type, amount });
  }
}

// 回合结束衰减：易伤/虚弱/冰冻/燃烧/感电/回复 各 -1
// 玩家力量/敏捷不衰减（正面永久buff）
export function decayStatuses(statuses: StatusInstance[], isPlayer?: boolean): void {
  for (let i = statuses.length - 1; i >= 0; i--) {
    if (isPlayer && (statuses[i].type === 'strength' || statuses[i].type === 'dexterity')) continue;
    statuses[i].amount -= 1;
    if (statuses[i].amount <= 0) statuses.splice(i, 1);
  }
}

// 对敌人造成伤害（先扣格挡，再扣次数盾）
export function damageEnemy(
  enemy: { hp: number; block: number; name: string; blockShield?: number },
  raw: number,
): number {
  let dmg = Math.max(0, raw);
  // 次数盾：受N次攻击后破盾，每次攻击减1层并完全吸收伤害
  if (enemy.blockShield && enemy.blockShield > 0) {
    enemy.blockShield -= 1;
    return 0;
  }
  if (enemy.block > 0) {
    const absorbed = Math.min(enemy.block, dmg);
    enemy.block -= absorbed;
    dmg -= absorbed;
  }
  enemy.hp -= dmg;
  return dmg;
}

// 对玩家造成伤害（先扣格挡）
export function damagePlayer(
  player: { hp: number; block: number },
  raw: number,
): number {
  let dmg = Math.max(0, raw);
  if (player.block > 0) {
    const absorbed = Math.min(player.block, dmg);
    player.block -= absorbed;
    dmg -= absorbed;
  }
  player.hp -= dmg;
  return dmg;
}

export const STATUS_LABEL: Record<StatusType, string> = {
  strength: '力量',
  dexterity: '敏捷',
  vuln: '易伤',
  weak: '虚弱',
  frail: '脆弱',
  freeze: '冰冻',
  burn: '燃烧',
  shock: '感电',
  regen: '回复',
};

export const STATUS_EMOJI: Record<StatusType, string> = {
  strength: '💪',
  dexterity: '💨',
  vuln: '🎯',
  weak: '😇',
  frail: '🪶',
  freeze: '❄️',
  burn: '🔥',
  shock: '⚡',
  regen: '💚',
};
