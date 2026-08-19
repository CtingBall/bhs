// ============================================================================
// 全局响应式钩子总线（Global Hook Matrix）
// 遗物、能力牌、大天赋、Boss 被动均以「监听 Hook 并派发动作」的方式解耦挂载。
// 优先级：大天赋 100 > 遗物 80 > 能力牌 60 > 卡牌自身 40 > 怪物被动 20
// 递归深度熔断：单条触发链嵌套深度 ≤ 16，超出强制中断并锁定结果。
// ============================================================================

export type HookName =
  | 'OnCombatStart'
  | 'OnPlayerTurnStart'
  | 'OnPlayerTurnEnd'
  | 'OnRoundStart'
  | 'OnRoundEnd'
  | 'OnCombatEnd'
  | 'OnCardDrawn'
  | 'OnCardPlayed'
  | 'OnCardDiscarded'
  | 'OnCardExiled'
  | 'OnDeckShuffled'
  | 'BeforeDamageCalculated'
  | 'BeforeDamageReceived'
  | 'AfterDamageDealt'
  | 'OnBlockGained'
  | 'OnHealed'
  | 'OnOverheal'
  | 'OnFatalDamageTaken'
  | 'OnUnitKilled'
  | 'OnPlayerDefeat'
  | 'OnAllyActed'
  | 'OnResourceChanged'
  | 'OnPhaseChange';

export const HOOK_PRIORITY = {
  Keystone: 100,
  Relic: 80,
  Power: 60,
  Card: 40,
  Monster: 20,
} as const;

export interface HookEvent<T = unknown> {
  name: HookName;
  payload: T;
  /** 触发链深度（熔断用） */
  depth: number;
}

export type HookHandler<T = unknown> = (ev: HookEvent<T>) => void;

interface Listener {
  name: HookName;
  priority: number;
  fn: HookHandler;
  id: number;
}

export const MAX_HOOK_DEPTH = 16;

export class HookBus {
  private listeners: Listener[] = [];
  private nextId = 1;
  private depth = 0;

  /** 注册监听，返回取消函数 */
  on<T = unknown>(name: HookName, priority: number, fn: (ev: HookEvent<T>) => void): () => void {
    const id = this.nextId++;
    this.listeners.push({ name, priority, fn: fn as HookHandler, id });
    return () => {
      this.listeners = this.listeners.filter((l) => l.id !== id);
    };
  }

  /** 触发事件：按优先级降序执行，深度熔断 */
  trigger<T>(name: HookName, payload: T): void {
    if (this.depth >= MAX_HOOK_DEPTH) {
      console.warn(`[HookBus] 触发链深度超过 ${MAX_HOOK_DEPTH}，已熔断（${name}）`);
      return;
    }
    this.depth++;
    try {
      // 使用快照：回调内注销/新增监听器只影响下一次触发，不改变本次事件遍历。
      const listeners = this.listeners
        .filter((l) => l.name === name)
        .slice()
        .sort((a, b) => b.priority - a.priority);
      const ev: HookEvent<T> = { name, payload, depth: this.depth };
      for (const l of listeners) {
        l.fn(ev);
      }
    } finally {
      this.depth--;
    }
  }

  clear(): void {
    this.listeners = [];
    this.depth = 0;
  }
}
