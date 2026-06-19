import type { Factor, FactorKind } from '@/types';

// 因子系统：三大流派，化用群聊"寂灭/裁定/思维"因子讨论
export const FACTORS: Factor[] = [
  {
    id: 'factor-annihilation',
    kind: 'annihilation',
    name: '寂灭因子',
    emoji: '💀',
    desc: '独立乘区：所有造成的伤害额外 +15%',
    flavor: '「寂灭是独立乘区」——地上答辩',
  },
  {
    id: 'factor-verdict',
    kind: 'verdict',
    name: '裁定因子',
    emoji: '⚖️',
    desc: '必暴：所有伤害额外 +40%，但不再受易伤加成',
    flavor: '「裁定是必爆的」',
  },
  {
    id: 'factor-thought',
    kind: 'thought',
    name: '思维因子',
    emoji: '🧠',
    desc: '每回合多抽 1 张牌，格挡值 +50%',
    flavor: '「思维光盾硬啊」「奶妈吃思维那个减cd吧」',
  },
  {
    id: 'factor-annihilation-2',
    kind: 'annihilation',
    name: '寂灭·极',
    emoji: '☠️',
    desc: '独立乘区：所有造成的伤害额外 +25%，施加易伤+1层',
    flavor: '「我用寂灭，让你吃易伤」——水千夏',
  },
  {
    id: 'factor-thought-2',
    kind: 'thought',
    name: '思维·深',
    emoji: '🌀',
    desc: '每回合多抽 2 张牌，格挡值 +50%，回合末回复 2 HP',
    flavor: '「思维那个坦度高」「奶妈吃思维那个减cd」',
  },
];

export const FACTOR_MAP: Record<string, Factor> = Object.fromEntries(
  FACTORS.map((f) => [f.id, f]),
);

export function getFactorKinds(factors: Factor[]): Set<FactorKind> {
  return new Set(factors.map((f) => f.kind));
}
