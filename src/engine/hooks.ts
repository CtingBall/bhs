// ============================================================
// 钩子/触发器系统 — 超级引擎核心模块
// 创意工坊：内容创作者通过 HookHandler 定义所有交互逻辑
// ============================================================

import type {
  BattleState,
  Card,
  EffectCondition,
  GameHook,
  HookHandler,
  Modifier,
  Relic,
  UnifiedEffect,
} from '@/types';
import { addStatus, damageEnemy, damagePlayer } from './status';

// ===== 条件判断引擎 =====
export function checkCondition(
  st: BattleState,
  condition: EffectCondition | undefined,
  context?: { card?: Card; targetIndex?: number },
): boolean {
  if (!condition || condition.type === 'always') return true;
  const p = st.player;

  switch (condition.type) {
    case 'random':
      return Math.random() < condition.chance;
    case 'cardType':
      return context?.card?.type === condition.value;
    case 'cardRarity':
      return context?.card?.rarity === condition.value;
    case 'hpBelow':
      return p.hp < p.maxHp * condition.threshold;
    case 'hpAbove':
      return p.hp > p.maxHp * condition.threshold;
    case 'hasStatus':
      return p.statuses.some((s) => s.type === condition.status && s.amount >= (condition.minAmount ?? 1));
    case 'enemyCount': {
      const c = st.enemies.length;
      if (condition.min !== undefined && c < condition.min) return false;
      if (condition.max !== undefined && c > condition.max) return false;
      return true;
    }
    case 'comboCount':
      return st.combo > 0 && st.combo % condition.interval === 0;
    case 'attackComboCount':
      return st.attackCombo > 0 && st.attackCombo % condition.interval === 0;
    case 'cardsInHand': {
      const c = st.hand.length;
      if (condition.min !== undefined && c < condition.min) return false;
      if (condition.max !== undefined && c > condition.max) return false;
      return true;
    }
    case 'energyAt':
      return p.energy === condition.value;
    case 'turnNumber':
      return st.turn === condition.value;
    case 'firstTurn':
      return st.turn === 1;
    case 'firstBattleOfFloor':
      return st.firstBattleOfFloor;
    case 'blockAbove':
      return p.block > condition.value;
    case 'cardsPlayedThisTurn':
      return st.cardsPlayedThisTurn >= condition.value;
    default:
      return false;
  }
}

// ===== 修饰器应用引擎 =====
export function applyModifiers(
  value: number,
  target: Modifier['target'],
  st: BattleState,
  context?: { card?: Card },
): number {
  let result = value;
  const relevant = st.modifiers.filter((m) => {
    if (m.target !== target) return false;
    if (!checkCondition(st, m.condition, context)) return false;
    return true;
  });

  for (const m of relevant) {
    switch (m.kind) {
      case 'add':
        result += m.value;
        break;
      case 'multiply':
        result = Math.floor(result * m.value);
        break;
      case 'set':
        result = m.value;
        break;
    }
  }
  return Math.max(0, result);
}

// ===== 修饰器管理 =====
export function addModifier(st: BattleState, modifier: Modifier): void {
  // 同 ID 替换（叠加型用不同 ID 或加法）
  const existing = st.modifiers.findIndex((m) => m.id === modifier.id);
  if (existing >= 0) {
    st.modifiers[existing] = modifier;
  } else {
    st.modifiers.push(modifier);
  }
}

export function removeModifier(st: BattleState, id: string): void {
  st.modifiers = st.modifiers.filter((m) => m.id !== id);
}

export function cleanExpiredModifiers(st: BattleState): void {
  st.modifiers = st.modifiers.filter(
    (m) => m.duration === 'permanent' || m.duration === 'battle',
  );
}

// ===== 统一效果执行引擎 =====
export function executeUnifiedEffect(
  st: BattleState,
  eff: UnifiedEffect,
  context?: { card?: Card; targetIndex?: number },
): void {
  if (!checkCondition(st, eff.condition, context)) return;

  const v = eff.value ?? 0;

  switch (eff.kind) {
    case 'damage': {
      const target = st.enemies[context?.targetIndex ?? 0];
      if (!target) break;
      let raw = v;
      if (eff.scale === 'strength') {
        raw += st.player.statuses.find((s) => s.type === 'strength')?.amount ?? 0;
      }
      raw = applyModifiers(raw, 'damageOut', st, context);
      damageEnemy(target, raw);
      break;
    }
    case 'damageAll': {
      let raw = v;
      if (eff.scale === 'strength') {
        raw += st.player.statuses.find((s) => s.type === 'strength')?.amount ?? 0;
      }
      raw = applyModifiers(raw, 'damageOut', st, context);
      for (const t of st.enemies) damageEnemy(t, raw);
      break;
    }
    case 'block': {
      let raw = v;
      if (eff.scale === 'dexterity') {
        raw += st.player.statuses.find((s) => s.type === 'dexterity')?.amount ?? 0;
      }
      raw = applyModifiers(raw, 'blockOut', st, context);
      st.player.block += raw;
      break;
    }
    case 'heal': {
      let raw = v;
      raw = applyModifiers(raw, 'healOut', st, context);
      st.player.hp = Math.min(st.player.maxHp, st.player.hp + raw);
      break;
    }
    case 'loseHp':
      st.player.hp = Math.max(0, st.player.hp - v);
      break;
    case 'draw':
      drawCards(st, v);
      break;
    case 'energy':
      st.player.energy += v;
      break;
    case 'maxHp':
      st.player.maxHp += v;
      st.player.hp = Math.min(st.player.hp + Math.max(0, v), st.player.maxHp);
      break;
    case 'summon':
      if (eff.summonId) addSummon(st, eff.summonId);
      break;
    case 'applyStatus': {
      const amt = v;
      const targets = eff.statusTarget === 'allEnemies'
        ? st.enemies
        : eff.statusTarget === 'self'
          ? undefined
          : [st.enemies[context?.targetIndex ?? 0]].filter(Boolean);
      if (eff.statusTarget === 'self') {
        addStatus(st.player.statuses, eff.status!, amt);
      } else if (targets) {
        for (const t of targets) addStatus(t.statuses, eff.status!, amt);
      }
      break;
    }
    case 'applyStatusAll':
      for (const t of st.enemies) addStatus(t.statuses, eff.status!, v);
      break;
    case 'gainStrength':
      addStatus(st.player.statuses, 'strength', v);
      break;
    case 'gainDexterity':
      addStatus(st.player.statuses, 'dexterity', v);
      break;
    case 'kill': {
      const target = st.enemies[context?.targetIndex ?? 0];
      if (target) target.hp = 0;
      break;
    }
    default:
      break;
  }
}

// ===== 钩子触发引擎 =====
export interface HookContext {
  card?: Card;
  targetIndex?: number;
  damageDealt?: number;
  damageReceived?: number;
  healAmount?: number;
  blockAmount?: number;
  killedEnemyName?: string;
}

// 收集所有来源的钩子
export function collectAllHooks(st: BattleState): HookHandler[] {
  const hooks: HookHandler[] = [];

  // 遗物钩子
  for (const r of st.relics) {
    if (r.hooks) hooks.push(...r.hooks);
  }

  // 角色被动钩子（创意工坊）
  if (st.character.passiveHooks) {
    hooks.push(...st.character.passiveHooks);
  }

  // 因子钩子
  for (const f of st.factors) {
    if (f.hooks) hooks.push(...f.hooks);
  }

  return hooks;
}

// 触发指定钩子
export function fireHooks(
  st: BattleState,
  hook: GameHook,
  context?: HookContext,
): void {
  const all = collectAllHooks(st);

  // 同时收集手牌中每张卡片的钩子
  for (const c of st.hand) {
    if (c.hooks) all.push(...c.hooks);
  }

  const matched = all
    .filter((h) => h.hook === hook)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const h of matched) {
    // 检查触发次数限制
    if (h.maxTriggers !== undefined) {
      const count = (st.hookTriggers[h.id] ?? 0);
      if (count >= h.maxTriggers) continue;
      st.hookTriggers[h.id] = count + 1;
      const turnCount = (st.hookTriggersThisTurn[h.id] ?? 0);
      st.hookTriggersThisTurn[h.id] = turnCount + 1;
    }

    // 检查条件
    if (!checkCondition(st, h.condition, { card: context?.card, targetIndex: context?.targetIndex })) {
      continue;
    }

    // 执行效果
    for (const eff of h.effects) {
      executeUnifiedEffect(st, eff, { card: context?.card, targetIndex: context?.targetIndex });
    }

    // 注册修饰器
    if (h.modifiers) {
      for (const m of h.modifiers) {
        addModifier(st, { ...m });
      }
    }
  }
}

// ===== 兼容层：从旧版被动/遗物创建钩子 =====
// 此函数在 createBattle 时调用，将旧版硬编码逻辑转为钩子
import { SUMMON_MAP } from '@/data/summons';

function log(st: BattleState, text: string, kind: BattleState['log'][number]['kind'] = 'system') {
  st.log.push({ text, kind });
  if (st.log.length > 40) st.log.shift();
}

function drawCards(s: BattleState, n: number) {
  for (let i = 0; i < n; i++) {
    if (s.drawPile.length === 0) {
      if (s.discardPile.length === 0) return;
      s.drawPile = shuffle(s.discardPile);
      s.discardPile = [];
    }
    const c = s.drawPile.pop();
    if (c) s.hand.push(c);
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addSummon(s: BattleState, summonId: string) {
  const def = SUMMON_MAP[summonId];
  if (!def) return;
  s.summons.push({
    uid: `sum-${s.nextEnemyUid++}`,
    defId: def.id,
    name: def.name,
    emoji: def.emoji,
    perTurn: def.perTurn,
  });
  log(s, `召唤 ${def.name} ${def.emoji}`);
}

// ===== 向后兼容：将旧版 reliceffect/被动转为钩子 =====
export function buildLegacyRelicHooks(relics: Relic[]): HookHandler[] {
  const hooks: HookHandler[] = [];
  let hid = 0;

  for (const r of relics) {
    // 自定义钩子优先
    if (r.hooks && r.hooks.length > 0) {
      hooks.push(...r.hooks);
      continue;
    }

    const ef = r.effect;
    const v = ef.value ?? 0;

    // 排除由 explicit ID 逻辑处理的遗物
    const explicitIds = [
      'zero-commander', 'jk-xhgm-start', 'demon-core', 'final-star-scar',
      'uk-red-fury', 'uk-feelings', 'xingluo-resolve', 'jk-moonblade',
      'n20-clear-cert', 'overtime-lantern', 'xingluo-slack', 'zero-sec-kill',
      'desperate-pact', 'cursed-blade', 'blood-pact', 'gamblers-luck',
      'glass-cannon', 'heavy-armor', 'double-edged', 'merchant-bribe',
      't-lords-badge', 'star-monument',
    ];
    if (explicitIds.includes(r.id)) continue;

    const prefix = `relic-${r.id}-`;

    switch (ef.kind) {
      case 'startEnergy':
        hooks.push({
          id: `${prefix}startEnergy`,
          hook: 'onBattleStart',
          condition: { type: 'always' },
          effects: [{ kind: 'modifyMaxEnergy', value: v }],
          priority: 100,
          description: r.text,
        });
        break;
      case 'turnBlock':
        hooks.push({
          id: `${prefix}turnBlock`,
          hook: 'onTurnStart',
          condition: { type: 'always' },
          effects: [{ kind: 'block', value: v }],
          priority: 50,
          description: r.text,
        });
        break;
      case 'battleStartDraw':
        hooks.push({
          id: `${prefix}battleStartDraw`,
          hook: 'onTurnStart',
          condition: { type: 'firstTurn' },
          effects: [{ kind: 'draw', value: v }],
          priority: 90,
          description: r.text,
        });
        break;
      case 'firstBattleDraw':
        hooks.push({
          id: `${prefix}firstBattleDraw`,
          hook: 'onTurnStart',
          condition: { type: 'firstBattleOfFloor' },
          effects: [{ kind: 'draw', value: v }],
          priority: 90,
          description: r.text,
        });
        break;
      case 'healOnKill':
        hooks.push({
          id: `${prefix}healOnKill`,
          hook: 'onKill',
          condition: { type: 'always' },
          effects: [{ kind: 'heal', value: v }],
          priority: 70,
          description: r.text,
        });
        break;
      case 'killHeal':
        hooks.push({
          id: `${prefix}killHeal`,
          hook: 'onKill',
          condition: { type: 'always' },
          effects: [{ kind: 'heal', value: v }],
          priority: 71,
          description: r.text,
        });
        break;
      case 'turnEndHeal':
        hooks.push({
          id: `${prefix}turnEndHeal`,
          hook: 'onTurnEnd',
          condition: { type: 'always' },
          effects: [{ kind: 'heal', value: v }],
          priority: 80,
          description: r.text,
        });
        break;
      case 'damageReduction':
        hooks.push({
          id: `${prefix}damageReduction`,
          hook: 'onBattleStart',
          condition: { type: 'always' },
          effects: [],
          modifiers: [{ id: `${prefix}dmgr`, target: 'damageIn', kind: 'add', value: -v, source: r.name, duration: 'battle' }],
          priority: 100,
          description: r.text,
        });
        break;
      case 'thorns':
        hooks.push({
          id: `${prefix}thorns`,
          hook: 'onDamageReceived',
          condition: { type: 'always' },
          effects: [{ kind: 'damage', value: v, condition: { type: 'always' } }],
          priority: 60,
          description: r.text,
        });
        break;
      case 'fullHandDamage':
        hooks.push({
          id: `${prefix}fullHand`,
          hook: 'onBattleStart',
          condition: { type: 'always' },
          effects: [],
          modifiers: [{
            id: `${prefix}fullHand`, target: 'damageOut', kind: 'add',
            value: v, source: r.name, duration: 'battle',
            condition: { type: 'cardsInHand', min: 6 },
          }],
          priority: 100,
          description: r.text,
        });
        break;
      case 'curseToRope':
        // 在 gameStore 中处理（非战斗钩子）
        break;
      case 'rareChance':
      case 'shopDiscount':
        // 在 gameStore 中处理（非战斗钩子）
        break;
      case 'firstAttackDamage':
        hooks.push({
          id: `${prefix}firstAttack`,
          hook: 'onAttackDealt',
          condition: { type: 'cardsPlayedThisTurn', value: 1 },
          effects: [],
          modifiers: [{ id: `${prefix}fa`, target: 'damageOut', kind: 'add', value: v, source: r.name, duration: 'battle' }],
          priority: 110,
          description: r.text,
        });
        break;
      default:
        break;
    }
  }

  return hooks;
}

export default {
  checkCondition,
  applyModifiers,
  addModifier,
  removeModifier,
  cleanExpiredModifiers,
  executeUnifiedEffect,
  fireHooks,
  collectAllHooks,
  buildLegacyRelicHooks,
};
