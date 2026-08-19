// ============================================================================
// 战斗表现层：战场 / 敌人意图 / 手牌扇形 / 双模出牌 / 飘字 / 职业挂件
// ============================================================================

import { el, clear, on, toast, modal, confirmModal } from './dom';
import { sfx } from './audio';import type { GameApp } from './main';
import type { Combat, CombatViewEvent } from '../core/combat';
import { getCardDef, upgradeCardDef } from '../core/cards';
import { getBuffDef } from '../core/buffs';
import type { Unit } from '../core/units';
import type { CardInstance } from '../core/cards';

interface CombatViewState {
  app: GameApp;
  combat: Combat;
  screen: HTMLElement;
  enemyEls: Map<string, HTMLElement>;
  cardEls: Map<string, HTMLElement>;
  selectedCard: CardInstance | null;
  /** 指针当前悬停的敌人（点击攻击牌时直接作为默认目标） */
  hoverEnemy: Unit | null;
  handField: HTMLElement;
  hand: HTMLElement;
  endBtn: HTMLButtonElement;
  hud: HTMLElement;
  widget: HTMLElement;
  logEl: HTMLElement;
  blockInput: boolean;
}

let view: CombatViewState | null = null;

export function renderCombatScreen(app: GameApp, ev: CombatViewEvent | null): void {
  const combat = app.combat;
  if (!combat) return;
  if (!view || view.combat !== combat || ev === null) {
    if (view && view.combat !== combat) view = null;
    if (!view) view = buildView(app, combat);
    if (ev === null) return;
  }
  handleEvent(view, ev);
}

function buildView(app: GameApp, combat: Combat): CombatViewState {
  const screen = el('div', 'screen combat-screen sts-battle-screen');
  screen.appendChild(el('div', 'combat-bg'));

  // HUD
  const hud = el('div', 'hud sts-topbar');
  const hudLeft = el('div', 'hud-left');
  hudLeft.appendChild(el('span', 'hud-chip', `第 ${combat.round} 回合`));
  hudLeft.appendChild(el('span', 'hud-chip', `📍 Act ${app.ctx?.run.state.act ?? 1}`));
  hudLeft.appendChild(el('span', 'hud-chip', `🪙 ${app.ctx?.run.state.gold ?? 0}`));
  const hudRight = el('div', 'hud-right');
  const btnMenu = el('button', 'btn', '☰');
  on(btnMenu, 'click', () => { openDeckOverlay(v); });
  hudRight.appendChild(btnMenu);
  hud.appendChild(hudLeft);
  hud.appendChild(hudRight);
  screen.appendChild(hud);

  // 职业挂件（紧贴玩家单位下方，标注专属资源）
  const widget = el('div', 'class-widget');

  // 战场
  const arena = el('div', 'arena sts-arena');
  const enemyRow = el('div', 'enemy-row');
  arena.appendChild(enemyRow);
  const playerZone = el('div', 'player-zone');
  arena.appendChild(playerZone);
  screen.appendChild(arena);

  // 出牌分割线 + 手牌区
  screen.appendChild(el('div', 'cast-line'));
  const handField = el('div', 'hand-field sts-hand-zone');
  const hand = el('div', 'hand');
  handField.appendChild(hand);
  screen.appendChild(handField);

  // 战斗日志
  const logEl = el('div', 'combat-log');
  logEl.style.cssText = 'position:absolute;right:10px;bottom:240px;max-width:26vw;font-size:11px;color:var(--text-dim);display:flex;flex-direction:column;gap:2px;align-items:flex-end;pointer-events:none;z-index:8;';
  screen.appendChild(logEl);

  const v: CombatViewState = {
    app, combat, screen,
    enemyEls: new Map(),
    cardEls: new Map(),
    selectedCard: null,
    hoverEnemy: null,
    handField, hand,
    endBtn: el('button') as HTMLButtonElement,
    hud, widget,
    logEl,
    blockInput: false,
  };

  renderEnemies(v);
  renderPlayer(v);
  // 挂件紧贴玩家单位下方（职业专属资源槽，居中展示）
  const zone = v.screen.querySelector('.player-zone') as HTMLElement;
  zone.appendChild(widget);
  renderAllies(v, zone);
  renderWidget(v);
  renderHand(v);
  maybeTutorial();
  showFlavor(v);

  app.show(screen);
  return v;
}

/** 战斗开场风味文本（参考星痕共鸣副本设定的 Boss 传说） */
function showFlavor(v: CombatViewState): void {
  const flavors = v.combat.enemies.map((e) => e.state['flavor'] as string | undefined).filter(Boolean) as string[];
  if (flavors.length === 0) return;
  const line = el('div', 'flavor-line', `📜 ${flavors[0]}`);
  v.screen.appendChild(line);
  window.setTimeout(() => line.remove(), 5200);
}

// ---------------------------------------------------------------------------
// 渲染：敌人 / 玩家 / 挂件 / 手牌
// ---------------------------------------------------------------------------

function renderEnemies(v: CombatViewState): void {
  const { combat } = v;
  const row = v.screen.querySelector('.enemy-row') as HTMLElement;
  clear(row);
  v.enemyEls.clear();
  for (const e of combat.enemies) {
    const node = el('div', 'enemy');
    node.dataset['unitId'] = e.id;
    if (e.hasTag('boss')) node.classList.add('type-boss');
    node.appendChild(el('div', 'portrait', enemyPortrait(e)));
    node.appendChild(el('div', 'name', e.name));
    const bar = el('div', 'hpbar');
    const fill = el('div');
    bar.appendChild(fill);
    node.appendChild(bar);
    // 血量数字（可精确读数的文本行）
    node.appendChild(el('div', 'ehp-text', `${Math.max(0, e.hp)}/${e.maxHp}${e.block > 0 ? ` 🛡${e.block}` : ''}`));
    const buffs = el('div', 'buffs');
    node.appendChild(buffs);
    // 点选出牌：选中指向性卡牌后点击敌人施放
    on(node, 'click', () => {
      // 无选牌时点击敌人 = 查看详情
      if (v.blockInput || !v.selectedCard || !e.isAlive()) {
        if (!v.blockInput && !v.selectedCard) showEnemyDetail(v, e);
        return;
      }
      const def = getCardDef(v.selectedCard.defId);
      if (def.targetType === 'SingleEnemy') {
        castCard(v, v.selectedCard, e);
      }
    });
    // 悬停追踪：PC 鼠标 / 移动端拖拽经过时记录，作为攻击牌默认目标
    const trackHover = (onIt: boolean): void => {
      v.hoverEnemy = onIt && e.isAlive() ? e : null;
    };
    on(node, 'pointerenter', () => trackHover(true));
    on(node, 'pointerleave', () => trackHover(false));
    on(node, 'pointerdown', () => trackHover(true));
    v.enemyEls.set(e.id, node);
    row.appendChild(node);
  }
  updateAllEnemyBars(v);
}

function enemyPortrait(e: Unit): string {
  if (e.hasTag('boss') && e.name.includes('水仙')) return '🌺';
  if (e.hasTag('boss')) return '👹';
  if (e.hasTag('elite') && e.name.includes('石头人')) return '🗿';
  if (e.hasTag('elite')) return '💀';
  if (e.name.includes('哥布林')) return '👺';
  if (e.name.includes('毛球')) return '🧶';
  if (e.name.includes('卷心菜')) return '🥬';
  if (e.name.includes('蟹蛛') || e.name.includes('蜘蛛')) return '🕷️';
  if (e.name.includes('蜂巢') || e.name.includes('强袭虫')) return '🐝';
  if (e.name.includes('食人魔') || e.name.includes('巨魔')) return '👹';
  if (e.name.includes('蜥蜴')) return '🦎';
  if (e.name.includes('狼')) return '🐺';
  if (e.name.includes('灵') || e.name.includes('异影') || e.name.includes('监视者')) return '👻';
  if (e.name.includes('金牙') || e.name.includes('野犬')) return '🐕';
  return '👾';
}

function renderPlayer(v: CombatViewState): void {
  const { combat } = v;
  const zone = v.screen.querySelector('.player-zone') as HTMLElement;
  clear(zone);
  const unit = el('div', 'player-unit');
  unit.appendChild(el('div', 'player-portrait', '🧝'));
  const info = el('div', 'player-info');
  info.appendChild(el('div', 'player-name', `${combat.player.name}`));
  const hpRow = el('div', 'player-hp-row');
  hpRow.appendChild(el('span', 'res-label', '❤️'));
  hpRow.appendChild(el('span', 'hp-fill', `${combat.player.hp}/${combat.player.maxHp}`));
  const bar = el('div', 'hpbar hpbar-wide');
  const fill = el('div');
  bar.appendChild(fill);
  hpRow.appendChild(bar);
  info.appendChild(hpRow);
  const blockRow = el('div', 'player-hp-row');
  const blockText = el('span', '', `🛡️ ${combat.player.block}`);
  blockRow.appendChild(blockText);
  if (combat.player.barrier > 0) blockRow.appendChild(el('span', '', `✨屏障 ${combat.player.barrier}`));
  info.appendChild(blockRow);
  unit.appendChild(info);
  const buffs = el('div', 'buffs');
  unit.appendChild(buffs);
  zone.appendChild(unit);
  updatePlayerBuffs(v);
}

/** 友军随从渲染 */
function renderAllies(v: CombatViewState, zone: HTMLElement): void {
  const row = el('div', 'ally-row');
  for (const ally of v.combat.allies) {
    const node = el('div', 'ally-unit');
    node.dataset['allyId'] = ally.id;
    node.appendChild(el('div', 'portrait', (ally.state['portrait'] as string | undefined) ?? '🌳'));
    node.appendChild(el('div', 'name', ally.name));
    const bar = el('div', 'hpbar');
    const fill = el('div');
    fill.style.width = `${Math.max(0, (ally.hp / ally.maxHp) * 100)}%`;
    bar.appendChild(fill);
    node.appendChild(bar);
    node.appendChild(el('div', 'ally-hp', `${ally.hp}/${ally.maxHp}`));
    row.appendChild(node);
  }
  if (v.combat.allies.length > 0) zone.appendChild(row);
}

function updateAllies(v: CombatViewState): void {
  const zone = v.screen.querySelector('.player-zone') as HTMLElement | null;
  if (!zone) return;
  const row = zone.querySelector('.ally-row');
  if (row) row.remove();
  renderAllies(v, zone);
}

function renderWidget(v: CombatViewState): void {
  const { combat } = v;
  const w = v.widget;
  clear(w);
  const clsId = v.app.ctx?.run.state.classId;
  const playerHasState = (c: Combat, key: string): unknown => c.player.state[key];
  if (clsId === 'hero_thunderblade') {
    const form = (combat.player.state['form'] as string) ?? 'katana';
    w.appendChild(el('div', 'widget-row', form === 'katana' ? '⚔️ 长刀形态' : '🔪 镰刀形态'));
    const seals = combat.getResource(combat.player, 'thunder_seal');
    const cap = combat.player.resourceCaps['thunder_seal'] ?? 5;
    const row = el('div', 'widget-row');
    row.appendChild(el('span', '', '⚡雷印'));
    const dots = el('div', 'seal-dots');
    for (let i = 0; i < cap; i++) {
      const d = el('div', `seal-dot${i < seals ? ' on' : ''}`);
      dots.appendChild(d);
    }
    row.appendChild(dots);
    w.appendChild(row);
  } else if (clsId === 'hero_sylvanguard') {
    const seeds = combat.getResource(combat.player, 'seed');
    const tier = (combat.player.state['auraTier'] as number | undefined) ?? 0;
    const tierName = ['萌芽', '生花', '绽放形态', '森之觉醒', '万物神化'][tier - 1] ?? '';
    const row1 = el('div', 'widget-row');
    row1.appendChild(el('span', '', `🌱 自然之种 ${seeds}`));
    const bar = el('div', 'mana-bar');
    const fill = el('div');
    fill.style.width = `${Math.min(100, seeds)}%`;
    bar.appendChild(fill);
    row1.appendChild(bar);
    w.appendChild(row1);
    if (tier > 0) {
      w.appendChild(el('div', 'widget-row', `✨ ${tier}阶·${tierName}`));
    }
  } else if (clsId === 'hero_frost_mage') {
    const shards = combat.getResource(combat.player, 'frost_shard');
    const cap = combat.player.resourceCaps['frost_shard'] ?? 4;
    const energy = combat.getResource(combat.player, 'frost_energy');
    const dots = el('div', 'seal-dots');
    for (let i = 0; i < cap; i++) {
      const d = el('div', `seal-dot${i < shards ? ' on' : ''}`);
      d.style.background = i < shards ? 'radial-gradient(circle at 35% 30%, #b8e4ff, #3f7fc9)' : '';
      dots.appendChild(d);
    }
    const row1 = el('div', 'widget-row');
    row1.appendChild(el('span', '', '❄️玄冰'));
    row1.appendChild(dots);
    w.appendChild(row1);
    if (energy > 0 || combat.player.resourceCaps['frost_energy'] > 0) {
      const manaRow = el('div', 'widget-row');
      manaRow.appendChild(el('span', '', '💧寒冰能量'));
      const bar = el('div', 'mana-bar');
      const fill = el('div');
      fill.style.width = `${Math.min(100, energy)}%`;
      bar.appendChild(fill);
      manaRow.appendChild(bar);
      w.appendChild(manaRow);
    }
    const chant = combat.player.state['chantDamage'] as number | undefined;
    if (chant) w.appendChild(el('div', 'widget-row', `🎶 吟唱中：下回合造成 ${chant} 点伤害`));
  } else if (clsId === 'hero_flame_berserker') {
    const soul = combat.getResource(combat.player, 'crimson_soul');
    const cap = combat.player.resourceCaps['crimson_soul'] ?? 100;
    const rank = (combat.player.state['formlessRank'] as number | undefined) ?? 0;
    const rankRow = el('div', 'widget-row');
    rankRow.appendChild(el('span', '', '🌀 无相'));
    for (let i = 0; i < 5; i++) {
      const d = el('div', `seal-dot${i < rank ? ' on' : ''}`);
      d.style.background = i < rank ? 'radial-gradient(circle at 35% 30%, #ffd166, #e78a2b)' : '';
      rankRow.appendChild(d);
    }
    w.appendChild(rankRow);
    const soulRow = el('div', 'widget-row');
    soulRow.appendChild(el('span', '', '🔥 赤红魂槽'));
    const bar = el('div', 'mana-bar');
    const fill = el('div');
    fill.style.width = `${Math.min(100, (soul / cap) * 100)}%`;
    fill.style.background = 'linear-gradient(90deg, #ff5f6d, #ffb36b)';
    bar.appendChild(fill);
    soulRow.appendChild(bar);
    soulRow.appendChild(el('span', '', `${soul}`));
    w.appendChild(soulRow);
    if (combat.player.state['soulFiend'] === true) {
      w.appendChild(el('div', 'widget-row', '👹 炎魔形态'));
    }
  } else if (clsId === 'hero_titan_guardian') {
    const rageNow = combat.getResource(combat.player, 'rage');
    const sandNow = combat.getResource(combat.player, 'sand_crystal');
    const dots = el('div', 'seal-dots');
    for (let i = 0; i < 5; i++) {
      const d = el('div', `seal-dot${i < sandNow ? ' on' : ''}`);
      d.style.background = i < sandNow ? 'radial-gradient(circle at 35% 30%, #ffe9a8, #d39a2f)' : '';
      dots.appendChild(d);
    }
    const row1 = el('div', 'widget-row');
    row1.appendChild(el('span', '', '✦ 沙晶石'));
    row1.appendChild(dots);
    w.appendChild(row1);
    const rageRow = el('div', 'widget-row');
    rageRow.appendChild(el('span', '', '😡 怒气'));
    const bar = el('div', 'mana-bar');
    const fill = el('div');
    fill.style.width = `${Math.min(100, rageNow)}%`;
    fill.style.background = 'linear-gradient(90deg, #ff8a5c, #ff5f6d)';
    bar.appendChild(fill);
    rageRow.appendChild(bar);
    rageRow.appendChild(el('span', '', `${rageNow}`));
    w.appendChild(rageRow);
  } else if (clsId === 'hero_sharpshooter') {
    const energy = combat.getResource(combat.player, 'light_energy');
    const reforged = combat.player.state['reforged'] === true || combat.player.state['reforgedPermanent'] === true;
    const bar = el('div', 'widget-row');
    bar.appendChild(el('span', '', reforged ? '✨ 光能重铸' : '💡 光能'));
    const b = el('div', 'mana-bar');
    const f = el('div');
    f.style.width = `${Math.min(100, energy)}%`;
    f.style.background = reforged ? 'linear-gradient(90deg, #ffd166, #fff0b0)' : 'linear-gradient(90deg, #6ec3ff, #b8e0ff)';
    b.appendChild(f);
    bar.appendChild(b);
    bar.appendChild(el('span', '', `${energy}/50`));
    w.appendChild(bar);
    const companions = combat.allies.filter((a) => a.isAlive());
    if (companions.length > 0) {
      w.appendChild(el('div', 'widget-row', `🐾 伙伴 ×${companions.length}`));
    }
    if (combat.player.state['falcon'] === true) {
      w.appendChild(el('div', 'widget-row', '🦅 战隼盘旋'));
    }
  } else if (clsId === 'hero_soul_musician') {
    const note = combat.getResource(combat.player, 'musical_note');
    const cap = combat.player.resourceCaps['musical_note'] ?? 5;
    const dots = el('div', 'seal-dots');
    for (let i = 0; i < cap; i++) {
      const d = el('div', `seal-dot${i < note ? ' on' : ''}`);
      d.style.background = i < note ? 'radial-gradient(circle at 35% 30%, #ff9df5, #c95fd0)' : '';
      dots.appendChild(d);
    }
    const row1 = el('div', 'widget-row');
    row1.appendChild(el('span', '', '🎵 音符'));
    row1.appendChild(dots);
    w.appendChild(row1);
    if ((playerHasState(combat, 'heroicSonata') as number) > 0) w.appendChild(el('div', 'widget-row', '🎸 英勇乐章'));
    if (playerHasState(combat, 'healingSonata') === true) w.appendChild(el('div', 'widget-row', '💚 愈合乐章'));
    if (playerHasState(combat, 'speaker') === true) w.appendChild(el('div', 'widget-row', '🔊 舞台音箱'));
  } else if (clsId === 'hero_gale_knight') {
    const courageNow = combat.getResource(combat.player, 'courage');
    const sharpNow = combat.player.getBuffStacks('sharpness');
    const courageRow = el('div', 'widget-row');
    courageRow.appendChild(el('span', '', '💨 勇气'));
    const bar = el('div', 'mana-bar');
    const fill = el('div');
    fill.style.width = `${Math.min(100, courageNow)}%`;
    fill.style.background = 'linear-gradient(90deg, #6ef7b2, #b8ffe0)';
    bar.appendChild(fill);
    courageRow.appendChild(bar);
    courageRow.appendChild(el('span', '', `${courageNow}`));
    w.appendChild(courageRow);
    if (sharpNow > 0) w.appendChild(el('div', 'widget-row', `🗡️ 锐利 ×${sharpNow}`));
    if (combat.player.state['aerial'] === true) w.appendChild(el('div', 'widget-row', '🌪️ 滞空'));
    if (combat.player.state['peerless'] === true) w.appendChild(el('div', 'widget-row', '✨ 风姿卓绝'));
  } else if (clsId === 'hero_aegis_knight') {
    const orders = combat.getResource(combat.player, 'holy_order');
    const radiant = combat.getResource(combat.player, 'radiant_energy');
    const lightforged = combat.player.state['lightforged'] === true;
    const dots = el('div', 'seal-dots');
    for (let i = 0; i < 5; i++) {
      const d = el('div', `seal-dot${i < orders ? ' on' : ''}`);
      dots.appendChild(d);
    }
    const row1 = el('div', 'widget-row');
    row1.appendChild(el('span', '', '⚜️圣令'));
    row1.appendChild(dots);
    w.appendChild(row1);
    const manaRow = el('div', 'widget-row');
    manaRow.appendChild(el('span', '', lightforged ? '✨光铸身躯' : '💡光明能量'));
    const bar = el('div', 'mana-bar');
    const fill = el('div');
    fill.style.width = `${Math.min(100, radiant)}%`;
    bar.appendChild(fill);
    manaRow.appendChild(bar);
    manaRow.appendChild(el('span', '', `${radiant}`));
    w.appendChild(manaRow);
  }
}

function renderHand(v: CombatViewState): void {
  const { combat } = v;
  const hand = v.hand;
  clear(hand);
  v.cardEls.clear();
  v.selectedCard = null;
  const cards = combat.piles.hand;
  const n = cards.length;
  const spacing = n <= 4 ? 8 : Math.max(-34, 100 - n * 24);
  cards.forEach((card, i) => {
    const node = buildCardNode(v, card);
    node.style.marginLeft = i === 0 ? '0px' : `${spacing}px`;
    node.style.zIndex = String(10 + i);
    hand.appendChild(node);
    v.cardEls.set(card.uid, node);
  });
  updateEnergy(v);
  updateEndBtn(v);
}

function buildCardNode(v: CombatViewState, card: CardInstance): HTMLElement {
  const def = upgradeCardDef(getCardDef(card.defId), card.upgradeLevel);
  const node = el('div', `card ${def.cardType.toLowerCase()}`);
  node.dataset['uid'] = card.uid;
  const cost = v.combat.effectiveCost(card);
  const costEl = el('div', `cost${cost === 0 ? ' zero' : ''}`, String(cost));
  node.appendChild(costEl);
  const ctype = def.cardType === 'Attack' ? '🗡️' : def.cardType === 'Skill' ? '🛡️' : def.cardType === 'Power' ? '✨' : '☠️';
  node.appendChild(el('div', 'ctype', ctype));
  node.appendChild(el('div', 'cname', def.name));
  const desc = el('div', 'cdesc');
  desc.innerHTML = highlightNumbers(def.description);
  node.appendChild(desc);
  if (card.upgradeLevel > 0) node.appendChild(el('div', 'upgraded', card.upgradeLevel === 1 ? '✦A' : '✦B'));
  if (card.temporary) node.appendChild(el('div', 'card-keyword temporary-keyword', '临时'));
  if (card.exhaust || def.cardType === 'Power') node.appendChild(el('div', 'card-keyword exhaust-keyword', '消耗'));
  else if (card.retain) node.appendChild(el('div', 'card-keyword retain-keyword', '保留'));
  if (def.unplayable || (def.requires && v.combat.getResource(v.combat.player, def.requires.resourceId) < def.requires.min) || cost > v.combat.energy) {
    node.classList.add('disabled');
  }
  node.title = `单击出牌（唯一敌人自动选定/悬停敌人指定目标）· 长按查看【${def.name}】完整介绍`;

  bindCardInput(v, node, card);
  return node;
}

// ---------------------------------------------------------------------------
// 双模出牌：点选 + 拖拽
// ---------------------------------------------------------------------------

function bindCardInput(v: CombatViewState, node: HTMLElement, card: CardInstance): void {
  const def = upgradeCardDef(getCardDef(card.defId), card.upgradeLevel);
  // 实时判定可打出性（不依赖渲染时的 disabled 类）：
  // 本回合内资源变化（如攒够 5 音符）后应立即变为可打出
  const isDisabled = (): boolean => {
    const cur = upgradeCardDef(getCardDef(card.defId), card.upgradeLevel);
    if (cur.unplayable) return true;
    if (cur.requires && v.combat.getResource(v.combat.player, cur.requires.resourceId) < cur.requires.min) return true;
    return v.combat.effectiveCost(card) > v.combat.energy;
  };
  let dragging = false;
  let startY = 0;
  let longPress = false;
  let pressTimer = 0;

  on(node, 'pointerdown', (e) => {
    e.stopPropagation();
    sfx.hover();
    if (v.blockInput) return;
    dragging = false;
    longPress = false;
    startY = (e as PointerEvent).clientY;
    const target = e.target as HTMLElement;
    target.setPointerCapture?.((e as PointerEvent).pointerId);
    // 长按 400ms 查看卡牌详情
    pressTimer = window.setTimeout(() => {
      longPress = true;
      showCardDetail(v, card);
    }, 400);
  });

  on(node, 'pointermove', (e) => {
    if (v.blockInput || longPress) return;
    const y = (e as PointerEvent).clientY;
    if (startY - y > 40) {
      dragging = true;
      window.clearTimeout(pressTimer);
    }
    if (dragging) {
      node.style.transform = `translateY(${-Math.min(120, Math.max(0, startY - y))}px) scale(1.08)`;
      node.style.zIndex = '40';
    }
  });

  const finishPress = (e: Event): void => {
    window.clearTimeout(pressTimer);
    if (longPress) {
      // 长按查看详情后不执行出牌
      node.style.transform = '';
      longPress = false;
      return;
    }
    if (v.blockInput) return;
    const y = (e as PointerEvent).clientY;
    node.style.transform = '';
    if (dragging) {
      const threshold = window.innerHeight * 0.45;
      if (y < threshold) castCard(v, card, pickNearestEnemy(v, (e as PointerEvent).clientX));
      dragging = false;
      return;
    }
    // 禁用卡牌（能量不足/条件不满足）点击只看详情
    if (isDisabled()) {
      showCardDetail(v, card);
      return;
    }
    if (def.targetType === 'SingleEnemy') {
      const alive = v.combat.aliveEnemies();
      if (alive.length === 1) {
        // 仅一个敌人：直接打出，无需选目标
        castCard(v, card, alive[0]);
      } else if (v.hoverEnemy) {
        // 手指/鼠标正悬停在某敌人上：对它打出
        castCard(v, card, v.hoverEnemy);
      } else {
        // 多敌人未指定：进入选目标模式（再点敌人出牌）
        v.selectedCard = v.selectedCard?.uid === card.uid ? null : card;
        highlightTargets(v);
      }
    } else {
      castCard(v, card, null);
    }
  };
  on(node, 'pointerup', finishPress);
  on(node, 'pointercancel', () => {
    window.clearTimeout(pressTimer);
    node.style.transform = '';
  });
}

function pickNearestEnemy(v: CombatViewState, x: number): Unit | null {
  let best: Unit | null = null;
  let bestDist = Infinity;
  for (const e of v.combat.aliveEnemies()) {
    const node = v.enemyEls.get(e.id);
    if (!node) continue;
    const rect = node.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const d = Math.abs(cx - x);
    if (d < bestDist) { bestDist = d; best = e; }
  }
  return best;
}

/** 目标高亮：统一 class 管理，杜绝内联样式残留 */
function highlightTargets(v: CombatViewState): void {
  const selected = v.selectedCard;
  const showTargets = selected && upgradeCardDef(getCardDef(selected.defId), selected.upgradeLevel).targetType === 'SingleEnemy';
  for (const [id, node] of v.enemyEls) {
    const alive = v.combat.aliveEnemies().some((e) => e.id === id);
    node.classList.toggle('targetable', !!showTargets && alive);
    node.classList.toggle('target-highlight', !!showTargets && alive);
  }
  v.screen.onpointerdown = (e) => {
    const t = e.target as HTMLElement;
    if (t === v.screen || t.classList.contains('arena') || t.classList.contains('combat-bg')) {
      v.selectedCard = null;
      highlightTargets(v);
    }
  };
}

/** 打出卡牌：先逻辑后动画；失败不销毁卡牌并给出原因 */
function castCard(v: CombatViewState, card: CardInstance, target: Unit | null): void {
  if (v.blockInput) return;
  const combat = v.combat;
  const def = getCardDef(card.defId);
  const node = v.cardEls.get(card.uid);

  const ok = combat.playCard(card.uid, def.targetType === 'SingleEnemy' ? target?.id : undefined);
  if (ok) {
    sfx.playCard();
    v.selectedCard = null;
    highlightTargets(v);
    if (node) {
      node.classList.add('playing');
      window.setTimeout(() => node.remove(), 200);
    }
  } else {
    if (node) node.classList.remove('focus');
    const err = combat.lastPlayError || '无法打出这张牌';
    toast(err);
    v.selectedCard = null;
    highlightTargets(v);
  }
}

/** 卡牌详情弹窗（长按/点击禁用卡触发） */
function showCardDetail(v: CombatViewState, card: CardInstance): void {
  const combat = v.combat;
  const def = upgradeCardDef(getCardDef(card.defId), card.upgradeLevel);
  const body = el('div');
  const big = el('div', `card large ${def.cardType.toLowerCase()}`);
  const detailCost = combat.effectiveCost(card);
  big.appendChild(el('div', `cost${detailCost === 0 ? ' zero' : ''}`, String(detailCost)));
  const ctype = def.cardType === 'Attack' ? '🗡️' : def.cardType === 'Skill' ? '🛡️' : def.cardType === 'Power' ? '✨' : '☠️';
  big.appendChild(el('div', 'ctype', ctype));
  big.appendChild(el('div', 'cname', def.name));
  const desc = el('div', 'cdesc');
  desc.innerHTML = highlightNumbers(def.description);
  big.appendChild(desc);
  if (card.upgradeLevel > 0) big.appendChild(el('div', 'upgraded', card.upgradeLevel === 1 ? '✦A' : '✦B'));
  if (card.temporary) big.appendChild(el('div', 'card-keyword temporary-keyword', '临时'));
  if (card.exhaust || def.cardType === 'Power') big.appendChild(el('div', 'card-keyword exhaust-keyword', '消耗'));
  else if (card.retain) big.appendChild(el('div', 'card-keyword retain-keyword', '保留'));
  body.appendChild(big);
  // 稀有度/类型说明
  const meta = el('div', 'card-meta');
  meta.innerHTML = `${def.cardType === 'Attack' ? '攻击牌' : def.cardType === 'Skill' ? '技能牌' : def.cardType === 'Power' ? '能力牌' : def.cardType === 'Curse' ? '诅咒牌' : '状态牌'} · ${def.rarity === 'Common' ? '普通' : def.rarity === 'Uncommon' ? '罕见' : def.rarity === 'Rare' ? '稀有' : '特殊'}`;
  if (def.requires) meta.innerHTML += `<br>⚡ 前置：需要 ${resourceName(def.requires.resourceId, combat)} ${def.requires.min} 点`;
  body.appendChild(meta);
  // 升级分支预览（营地锻造前也能查看）
  if (def.upgradeA || def.upgradeB) {
    const ups = el('div', 'upgrade-preview');
    ups.appendChild(el('div', 'ed-h', '🔨 升级分支（营地锻造二选一）'));
    if (def.upgradeA) {
      const r = el('div', 'ed-row');
      r.appendChild(el('span', 'ed-k', `✦A ${def.upgradeA.label}`));
      r.appendChild(el('span', 'ed-v ed-desc', def.upgradeA.descOverride ?? def.description));
      ups.appendChild(r);
    }
    if (def.upgradeB) {
      const r = el('div', 'ed-row');
      r.appendChild(el('span', 'ed-k', `✦B ${def.upgradeB.label}`));
      r.appendChild(el('span', 'ed-v ed-desc', def.upgradeB.descOverride ?? def.description));
      ups.appendChild(r);
    }
    body.appendChild(ups);
  }
  // 出牌操作提示
  body.appendChild(el('div', 'ed-note', '💡 单击快速出牌（唯一敌人自动选定）；拖拽可指定目标；长按查看本页。'));
  modal(def.name, body, [{ label: '关闭' }]);
}

function resourceName(resourceId: string, combat: Combat): string {
  const caps = combat.player.resourceCaps;
  void caps;
  const names: Record<string, string> = {
    thunder_seal: '雷之印',
    holy_order: '圣令',
    radiant_energy: '光明能量',
  };
  return names[resourceId] ?? resourceId;
}

/** 描述文本中的数字高亮（便于数值计算） */
function highlightNumbers(text: string): string {
  return text.replace(/(\d+(?:\.\d+)?)/g, '<span class="num">$1</span>');
}

// ---------------------------------------------------------------------------
// 事件驱动更新
// ---------------------------------------------------------------------------

/** 按当前战斗状态刷新手牌禁用态（能量/前置资源变化后调用） */
function updateCardStates(v: CombatViewState): void {
  for (const [uid, node] of v.cardEls) {
    const card = v.combat.piles.hand.find((c) => c.uid === uid);
    if (!card) continue;
    const cur = upgradeCardDef(getCardDef(card.defId), card.upgradeLevel);
    const disabled = cur.unplayable
      || (cur.requires && v.combat.getResource(v.combat.player, cur.requires.resourceId) < cur.requires.min)
      || v.combat.effectiveCost(card) > v.combat.energy;
    node.classList.toggle('disabled', disabled);
  }
}

function handleEvent(v: CombatViewState, ev: CombatViewEvent): void {
  const { combat } = v;
  switch (ev.type) {
    case 'phase': {
      const roundChip = v.screen.querySelector('.hud-left .hud-chip:first-child');
      if (roundChip) roundChip.textContent = `第 ${combat.round} 回合`;
      if (combat.phase === 'PlayerAction') {
        v.blockInput = false;
        renderHand(v);
        updateAllEnemyBars(v);
        updateIntents(v);
        renderWidget(v);
      }
      break;
    }
    case 'damage': {
      const target = combat.findUnit(ev.data?.['targetId'] as string);
      const amount = ev.data?.['amount'] as number;
      if (target && amount > 0) {
        float(v, target, `-${amount}`, 'dmg');
        if (target === combat.player) shakePlayer(v);
        sfx.hit();
      }
      updateAllEnemyBars(v);
      break;
    }
    case 'heal': {
      const target = combat.findUnit(ev.data?.['unitId'] as string);
      const amount = ev.data?.['amount'] as number;
      if (target && amount > 0) { float(v, target, `+${amount}`, 'heal'); sfx.heal(); }
      updateAllEnemyBars(v);
      break;
    }
    case 'block': {
      updateAllEnemyBars(v);
      break;
    }
    case 'buff': {
      updatePlayerBuffs(v);
      updateAllEnemyBars(v);
      break;
    }
    case 'resource': {
      renderWidget(v);
      updateEnergy(v);
      updateEndBtn(v);
      updateCardStates(v);
      updateAllEnemyBars(v);
      if (ev.data?.['id'] === 'thunder_seal') sfx.seal();
      break;
    }
    case 'allySummon':
    case 'allyActed': {
      updateAllies(v);
      break;
    }
    case 'cardPlayed': {
      updateEnergy(v);
      updateEndBtn(v);
      updateCardStates(v);
      break;
    }
    case 'draw': {
      // 回合中抽牌/生成牌 → 刷新一次手牌区
      sfx.draw();
      renderHand(v);
      break;
    }
    case 'vfx': {
      const vfxId = ev.data?.['vfxId'] as string;
      if (vfxId === 'thunder_bolt') sfx.thunder();
      else if (vfxId === 'issen_kill') { sfx.thunder(); flash('雷光一闪！'); }
      else if (vfxId === 'moonblade_followup') { sfx.thunder(); }
      break;
    }
    case 'log': {
      const text = ev.data?.['text'] as string;
      if (text) {
        const item = el('div', '', text);
        v.logEl.appendChild(item);
        while (v.logEl.children.length > 5) v.logEl.removeChild(v.logEl.firstChild!);
      }
      break;
    }
    case 'kill': {
      const id = ev.data?.['unitId'] as string;
      if (id) {
        const node = v.enemyEls.get(id);
        if (node) node.classList.add('dead');
      }
      break;
    }
    case 'victory': {
      v.blockInput = true;
      v.endBtn.disabled = true;
      sfx.victory();
      flash('⚔️ 战斗胜利！');
      setTimeout(() => v.app.onCombatEnded(), 900);
      break;
    }
    case 'defeat': {
      v.blockInput = true;
      v.endBtn.disabled = true;
      sfx.defeat();
      flash('💀 你倒下了……');
      setTimeout(() => v.app.onCombatEnded(), 1400);
      break;
    }
    default:
      break;
  }
}

// ---------------------------------------------------------------------------
// 更新辅助
// ---------------------------------------------------------------------------

function updateAllEnemyBars(v: CombatViewState): void {
  for (const e of v.combat.enemies) {
    const node = v.enemyEls.get(e.id);
    if (!node) continue;
    const bar = node.querySelector('.hpbar > div') as HTMLElement;
    if (bar) {
      const pct = Math.max(0, (e.hp / e.maxHp) * 100);
      bar.style.width = `${pct}%`;
    }
    if (e.block > 0) node.querySelector('.hpbar')?.classList.add('block');
    else node.querySelector('.hpbar')?.classList.remove('block');
    // 血量数字实时刷新
    const hpText = node.querySelector('.ehp-text') as HTMLElement | null;
    if (hpText) hpText.textContent = `${Math.max(0, e.hp)}/${e.maxHp}${e.block > 0 ? ` 🛡${e.block}` : ''}`;
    updateUnitBuffs(node, e);
    updateIntents(v);
  }
  // 玩家
  const hpText = v.screen.querySelector('.player-info .hp-fill');
  if (hpText) hpText.textContent = `${v.combat.player.hp}/${v.combat.player.maxHp}`;
  const pbar = v.screen.querySelector('.player-unit .hpbar > div') as HTMLElement | null;
  if (pbar) pbar.style.width = `${Math.max(0, (v.combat.player.hp / v.combat.player.maxHp) * 100)}%`;
  const blockRow = v.screen.querySelector('.player-hp-row:last-child');
  if (blockRow) {
    blockRow.textContent = '';
    blockRow.appendChild(el('span', '', `🛡️ ${v.combat.player.block}`));
    if (v.combat.player.barrier > 0) blockRow.appendChild(el('span', '', `✨屏障 ${v.combat.player.barrier}`));
  }
}

function updateUnitBuffs(node: HTMLElement, unit: Unit): void {
  const box = node.querySelector('.buffs') as HTMLElement;
  if (!box) return;
  clear(box);
  for (const [id, inst] of unit.buffs) {
    const def = getBuffDef(id);
    const chip = el('div', 'buff-chip', `${def.icon}${inst.stacks}`);
    chip.title = `${def.name}：${def.desc}`;
    // 点击词条弹详情（战斗中随时可查）
    on(chip, 'click', (ev) => {
      ev.stopPropagation();
      showBuffDetail(def.id);
    });
    box.appendChild(chip);
  }
}

function updatePlayerBuffs(v: CombatViewState): void {
  const box = v.screen.querySelector('.player-unit .buffs') as HTMLElement;
  if (!box) return;
  clear(box);
  for (const [id, inst] of v.combat.player.buffs) {
    const def = getBuffDef(id);
    const chip = el('div', 'buff-chip', `${def.icon}${inst.stacks}`);
    chip.title = `${def.name}：${def.desc}`;
    on(chip, 'click', (ev) => {
      ev.stopPropagation();
      showBuffDetail(def.id);
    });
    box.appendChild(chip);
  }
}

/** 词条（Buff/Debuff）说明弹窗 */
function showBuffDetail(buffId: string): void {
  const def = getBuffDef(buffId);
  const body = el('div', 'enemy-detail');
  const head = el('div', 'ed-head');
  head.appendChild(el('div', 'ed-portrait', def.icon));
  const headInfo = el('div');
  headInfo.appendChild(el('div', 'ed-name', def.name));
  const modelText = def.model === 'intensity' ? '强度堆叠（每层独立生效）'
    : def.model === 'duration' ? '持续回合（每回合结束 -1）'
    : def.model === 'threshold' ? `计数引爆（满 ${def.threshold ?? '?'} 层触发）`
    : '永久光环（不衰减）';
  headInfo.appendChild(el('div', 'ed-kind', `${def.isDebuff ? '🔻 负面状态' : '🔺 正面状态'} · ${modelText}`));
  head.appendChild(headInfo);
  body.appendChild(head);
  const row = el('div', 'ed-row');
  row.appendChild(el('span', 'ed-k', '效果'));
  row.appendChild(el('span', 'ed-v', def.desc));
  body.appendChild(row);
  modal(def.name, body, [{ label: '关闭' }]);
}

function updateIntents(v: CombatViewState): void {
  const show = v.combat.player.state['showIntents'] !== false;
  for (const e of v.combat.enemies) {
    const node = v.enemyEls.get(e.id);
    if (!node) continue;
    node.querySelector('.intent')?.remove();
    if (!show || !e.intent) continue;
    const intent = e.intent;
    const chip = el('div', `intent kind-${intent.kind}`);
    const parts: string[] = [];
    if (intent.kind === 'attack' || intent.kind === 'attack_multihit' || intent.kind === 'attack_debuff') {
      parts.push(`⚔️ ${intent.damage ?? 0}${(intent.hits ?? 1) > 1 ? `×${intent.hits}` : ''}`);
    } else if (intent.blockValue !== undefined) {
      parts.push(`🛡️ ${intent.blockValue}`);
    }
    if (intent.buffId) {
      try {
        const bd = getBuffDef(intent.buffId);
        parts.push(`${bd.icon}${intent.buffStacks ?? 1}`);
      } catch { /* ignore */ }
    }
    if (intent.debuffId) {
      try {
        const bd = getBuffDef(intent.debuffId);
        parts.push(`${bd.icon}${intent.debuffStacks ?? 1}`);
      } catch { /* ignore */ }
    }
    if (parts.length === 0) parts.push(intent.displayText);
    chip.innerHTML = parts.map((p) => `<b>${p}</b>`).join(' ');
    if (intent.note) chip.appendChild(el('span', 'intent-note', intent.note));
    // 点击意图查看文字解读
    on(chip, 'click', (ev) => {
      ev.stopPropagation();
      showEnemyDetail(v, e);
    });
    node.appendChild(chip);
  }
}

function updateEnergy(v: CombatViewState): void {
  const bar = v.screen.querySelector('.bottom-bar');
  if (!bar) {
    const b = el('div', 'bottom-bar sts-command-bar');
    const orbs = el('div', 'energy-orbs');
    b.appendChild(orbs);
    const piles = el('div', 'pile-indicators');
    piles.appendChild(el('div', 'pile-indicator', ''));
    b.appendChild(piles);
    const end = el('button', 'end-turn-btn', '结束回合');
    on(end, 'click', () => {
      if (v.blockInput) return;
      // 仍有真正可打的牌（费用 + 前置资源都满足）时做二级确认
      const hasPlayable = v.combat.piles.hand.some((c) => {
        const cur = upgradeCardDef(getCardDef(c.defId), c.upgradeLevel);
        if (cur.unplayable) return false;
        if (cur.requires && v.combat.getResource(v.combat.player, cur.requires.resourceId) < cur.requires.min) return false;
        return v.combat.effectiveCost(c) <= v.combat.energy;
      });
      if (v.combat.energy > 0 && hasPlayable) {
        confirmModal('还有可用的能量与手牌，确定结束回合吗？', () => {
          v.blockInput = true;
          v.combat.endTurn();
        });
      } else {
        v.blockInput = true;
        v.combat.endTurn();
      }
    });
    b.appendChild(end);
    v.screen.appendChild(b);
  }
  const orbs = v.screen.querySelector('.bottom-bar .energy-orbs') as HTMLElement;
  clear(orbs);
  const energy = v.combat.energy;
  const max = v.combat.maxEnergy;
  orbs.appendChild(el('span', 'energy-label', '⚡'));
  for (let i = 0; i < max; i++) {
    orbs.appendChild(el('div', `orb${i < energy ? '' : ' spent'}`));
  }
  const energyText = el('span', 'energy-text', `${energy}/${max}`);
  orbs.appendChild(energyText);
  const piles = v.screen.querySelector('.bottom-bar .pile-indicators') as HTMLElement;
  clear(piles);
  const mkPile = (icon: string, n: number): HTMLElement => {
    const p = el('div', 'pile-indicator');
    p.appendChild(el('span', '', icon));
    p.appendChild(el('span', 'num', String(n)));
    return p;
  };
  piles.appendChild(mkPile('🂠', v.combat.piles.draw.length));
  piles.appendChild(mkPile('♻', v.combat.piles.discard.length));
  const end = v.screen.querySelector('.bottom-bar .end-turn-btn') as HTMLButtonElement | null;
  if (end && v.endBtn !== end) {
    v.endBtn = end;
  }
}

function updateEndBtn(v: CombatViewState): void {
  const end = v.screen.querySelector('.bottom-bar .end-turn-btn') as HTMLButtonElement | null;
  if (end) {
    end.disabled = v.blockInput;
    v.endBtn = end;
  }
}

// ---------------------------------------------------------------------------
// 特效
// ---------------------------------------------------------------------------

function float(v: CombatViewState, unit: Unit, text: string, cls: string): void {
  const node = unit === v.combat.player
    ? v.screen.querySelector('.player-unit')
    : v.enemyEls.get(unit.id);
  if (!node) return;
  const rect = node.getBoundingClientRect();
  const f = el('div', `float-text ${cls}`, text);
  f.style.left = `${rect.left + rect.width / 2 - 20}px`;
  f.style.top = `${rect.top + 6}px`;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 950);
}

function shakePlayer(v: CombatViewState): void {
  const node = v.screen.querySelector('.player-unit') as HTMLElement | null;
  if (!node) return;
  node.classList.remove('shake');
  void node.offsetWidth;
  node.classList.add('shake');
}

function flash(text: string): void {
  const f = el('div', 'float-text crit', text);
  f.style.cssText += ';position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);font-size:34px;animation:none;z-index:80;';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1100);
}

// ---------------------------------------------------------------------------
// 新手引导
// ---------------------------------------------------------------------------

function maybeTutorial(): void {
  try {
    if (localStorage.getItem('bhs_tutorial_done') === '1') return;
  } catch { return; }
  const steps = [
    '👆 单击手牌直接出牌：唯一敌人自动选定；多敌人时先点敌人（或拖拽指定目标）。',
    '👁️ 敌人头顶明牌展示下回合意图；点击敌人或意图可查看详解（血量/词条/风味）。',
    '🖱️ 悬停敌人时点攻击牌 = 对它出牌；点击身上词条图标可随时查效果说明。',
  ];
  let i = 0;
  const bubble = el('div', 'tutorial-bubble', steps[0]);
  bubble.style.cssText += ';left:50%;top:24%;transform:translateX(-50%);text-align:center;';
  document.body.appendChild(bubble);
  on(bubble, 'click', () => {
    i++;
    if (i < steps.length) {
      bubble.textContent = steps[i];
    } else {
      bubble.remove();
      try { localStorage.setItem('bhs_tutorial_done', '1'); } catch { /* ignore */ }
    }
  });
}

/** 意图的可读描述（明牌推导的文字化） */
function intentText(intent: NonNullable<Unit['intent']>): string {
  switch (intent.kind) {
    case 'attack': return `攻击：造成 ${intent.damage ?? 0} 点伤害`;
    case 'attack_multihit': return `多段攻击：${intent.damage ?? 0} 点 × ${intent.hits ?? 1} 段（共 ${(intent.damage ?? 0) * (intent.hits ?? 1)} 点）`;
    case 'attack_debuff': return `攻击附带削弱：${intent.damage ?? 0} 点伤害${intent.debuffId ? ` + 施加【${getBuffDef(intent.debuffId).name}】${intent.debuffStacks ?? 1} 层` : ''}`;
    case 'block': return `防御：获得 ${intent.blockValue ?? 0} 点护甲`;
    case 'buff': return `强化自身${intent.buffId ? `：【${getBuffDef(intent.buffId).name}】${intent.buffStacks ?? 1} 层` : ''}`;
    case 'debuff': return `削弱你${intent.debuffId ? `：【${getBuffDef(intent.debuffId).name}】${intent.debuffStacks ?? 1} 层` : ''}`;
    case 'stun': return '眩晕：本回合无法行动';
    case 'special': return intent.displayText || '特殊行动';
    default: return intent.displayText || '未知';
  }
}

/** 怪物详情弹窗：血量/护甲/当前词条/意图解读/风味文本 */
function showEnemyDetail(v: CombatViewState, e: Unit): void {
  const body = el('div', 'enemy-detail');
  // 头部：头像 + 名称 + 类别
  const head = el('div', 'ed-head');
  head.appendChild(el('div', 'ed-portrait', enemyPortrait(e)));
  const headInfo = el('div');
  headInfo.appendChild(el('div', 'ed-name', e.name));
  const kindText = e.hasTag('boss') ? '👑 首领' : e.hasTag('elite') ? '💀 精英' : '👾 普通敌人';
  headInfo.appendChild(el('div', 'ed-kind', kindText));
  head.appendChild(headInfo);
  body.appendChild(head);
  // 血量/护甲
  const hpRow = el('div', 'ed-row');
  hpRow.appendChild(el('span', 'ed-k', '❤️ 生命'));
  hpRow.appendChild(el('span', 'ed-v', `${Math.max(0, e.hp)} / ${e.maxHp}`));
  body.appendChild(hpRow);
  if (e.block > 0) {
    const bRow = el('div', 'ed-row');
    bRow.appendChild(el('span', 'ed-k', '🛡️ 护甲'));
    bRow.appendChild(el('span', 'ed-v', String(e.block)));
    body.appendChild(bRow);
  }
  // 当前意图解读
  if (e.intent && v.combat.player.state['showIntents'] !== false) {
    const itRow = el('div', 'ed-row');
    itRow.appendChild(el('span', 'ed-k', '👁️ 下一步'));
    itRow.appendChild(el('span', 'ed-v', intentText(e.intent)));
    body.appendChild(itRow);
    if (e.intent.note) {
      body.appendChild(el('div', 'ed-note', `※ ${e.intent.note}`));
    }
  }
  // 身上词条（Buff/Debuff）
  if (e.buffs.size > 0) {
    body.appendChild(el('div', 'ed-h', '📜 身上词条'));
    for (const [id, inst] of e.buffs) {
      const def = getBuffDef(id);
      const row = el('div', 'ed-row');
      row.appendChild(el('span', 'ed-k', `${def.icon} ${def.name} ×${inst.stacks}`));
      row.appendChild(el('span', 'ed-v ed-desc', def.desc));
      body.appendChild(row);
    }
  }
  // 风味文本
  const flavor = e.state['flavor'] as string | undefined;
  if (flavor) body.appendChild(el('div', 'ed-flavor', `📖 ${flavor}`));
  modal(e.name, body, [{ label: '关闭' }]);
}

// ---------------------------------------------------------------------------
// 牌组查看（战斗内图鉴）
// ---------------------------------------------------------------------------

function openDeckOverlay(v: CombatViewState): void {
  const deck = v.app.ctx?.run.state.deck ?? [];
  const body = el('div', 'deck-grid');
  for (const entry of deck) {
    const def = getCardDef(entry.defId);
    const node = el('div', `card large ${def.cardType.toLowerCase()}`);
    const costEl = el('div', `cost${def.baseCost === 0 ? ' zero' : ''}`, String(def.baseCost));
    node.appendChild(costEl);
    const ctype = def.cardType === 'Attack' ? '🗡️' : def.cardType === 'Skill' ? '🛡️' : def.cardType === 'Power' ? '✨' : '☠️';
    node.appendChild(el('div', 'ctype', ctype));
    node.appendChild(el('div', 'cname', def.name));
    node.appendChild(el('div', 'cdesc', def.description));
    if (entry.level > 0) node.appendChild(el('div', 'upgraded', entry.level === 1 ? '✦A' : '✦B'));
    body.appendChild(node);
  }
  modal('牌组（卡牌图鉴）', body, [{ label: '关闭' }]);
}