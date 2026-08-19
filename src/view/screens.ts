// ============================================================================
// 非战斗屏幕：事件 / 商店 / 营地 / 宝箱 / 战利品 / 结算
// ============================================================================

import { el, on, modal, closeModal } from './dom';
import { sfx } from './audio';
import type { GameApp } from './main';
import type { EncounterScreen, ShopItem } from '../core/encounter';
import type { CombatReward } from '../core/run';
import { getCardDef, upgradeCardDef } from '../core/cards';
import { getRelicDef } from '../content/relics';
import { getCharacterDef } from '../content/characters';

// ============================================================================
// 非战斗遭遇
// ============================================================================

export function renderEncounterScreen(app: GameApp, encounter: EncounterScreen): void {
  const run = app.ctx!.run;
  const s = el('div', 'screen');
  const panel = el('div', 'panel');

  if (encounter.kind === 'event') {
    renderEvent(app, s, panel, encounter.event);
  } else if (encounter.kind === 'shop') {
    renderShop(app, panel, encounter);
  } else if (encounter.kind === 'rest') {
    renderRest(app, panel, encounter);
  } else if (encounter.kind === 'treasure') {
    run.currentNode!.visited = true;
    app.save();
    panel.appendChild(el('div', 'panel-icon', '🎁'));
    panel.appendChild(el('div', 'panel-title', '宝箱'));
    panel.appendChild(el('div', 'panel-text', encounter.text));
    panel.appendChild(leaveButton(app, '离开'));
  }

  s.appendChild(panel);
  app.show(s);
}

function leaveButton(app: GameApp, label: string): HTMLElement {
  const btn = el('button', 'btn btn-primary', label);
  on(btn, 'click', () => {
    sfx.click();
    const node = app.ctx?.run.currentNode;
    if (node) node.visited = true;
    app.goMap();
  });
  return btn;
}

// ---------------------------------------------------------------------------
// 事件
// ---------------------------------------------------------------------------

function renderEvent(app: GameApp, s: HTMLElement, panel: HTMLElement, event: { name: string; icon: string; text: string; options: Array<{ id: string; label: string; detail?: string; effect: (run: import('../core/run').Run) => string }> }): void {
  panel.appendChild(el('div', 'panel-icon', event.icon));
  panel.appendChild(el('div', 'panel-title', event.name));
  panel.appendChild(el('div', 'panel-text', event.text));
  const list = el('div', 'option-list');
  for (const opt of event.options) {
    const btn = el('button', 'option-btn');
    btn.appendChild(el('div', 'o-label', opt.label));
    if (opt.detail) btn.appendChild(el('div', 'o-detail', opt.detail));
    on(btn, 'click', () => {
      sfx.click();
      const run = app.ctx!.run;
      const result = opt.effect(run);
      app.save();
      // 特殊战斗事件（触发战斗）：立即进入战斗，兑现「准备战斗」的描述；
      // 此时不标记节点完成——战斗胜利后由 onCombatEnd 标记，读档可确定性重打
      const isSpecialCombat = run.state.flags['pendingSpecialCombat'] !== undefined;
      if (isSpecialCombat) {
        app.startCombatFlow();
        return;
      }
      // 事件一次性：执行后立即标记节点完成，防止读档重刷奖励
      const node = app.ctx?.run.currentNode;
      if (node) node.visited = true;
      // 显示结果
      clearPanel(panel);
      panel.appendChild(el('div', 'panel-icon', '📜'));
      panel.appendChild(el('div', 'panel-title', event.name));
      panel.appendChild(el('div', 'result-text', result));
      panel.appendChild(leaveButton(app, '继续前进'));
    });
    list.appendChild(btn);
  }
  panel.appendChild(list);
  void s;
}

// ---------------------------------------------------------------------------
// 商店
// ---------------------------------------------------------------------------

function renderShop(app: GameApp, panel: HTMLElement, shop: Extract<EncounterScreen, { kind: 'shop' }>): void {
  clearPanel(panel); // 购买后重绘：先清空，避免内容叠加
  const run = app.ctx!.run;
  panel.appendChild(el('div', 'panel-icon', '🛒'));
  panel.appendChild(el('div', 'panel-title', '黑市商店'));
  panel.appendChild(el('div', 'panel-text', `「阿斯特里斯黑市，童叟无欺——大概。」 你的金币：🪙 ${run.state.gold}`));

  const grid = el('div', 'shop-grid');
  for (const item of shop.items) {
    const price = itemPrice(item);
    const box = el('div', `shop-item${item.discounted ? ' discounted' : ''}`);
    if (item.kind === 'card') {
      const def = getCardDef(item.defId);
      box.appendChild(el('div', '', `🃏 ${def.name}`));
      box.appendChild(el('div', '', `${def.description.slice(0, 28)}`));
    } else {
      const relic = getRelicDef(item.defId);
      box.appendChild(el('div', '', `${relic.icon} ${relic.name}`));
      box.appendChild(el('div', '', relic.desc.slice(0, 30)));
    }
    box.appendChild(el('div', 'price', `🪙 ${price}`));
    const affordable = run.state.gold >= price && !(item.kind === 'relic' && run.hasRelic(item.defId));
    if (!affordable) box.style.opacity = '0.45';
    on(box, 'click', () => {
      if (!affordable) { return; }
      sfx.coin();
      if (item.kind === 'card') {
        run.addGold(-price);
        run.addCard(item.defId);
      } else {
        run.addGold(-price);
        run.addRelic(item.defId);
      }
      app.save();
      renderShop(app, panel, shop); // 重绘
    });
    grid.appendChild(box);
  }
  panel.appendChild(grid);

  // 删卡服务
  const rm = el('button', 'option-btn');
  rm.appendChild(el('div', 'o-label', `🗑️ 阿斯特里斯遗忘仪式（删卡 · 🪙 ${shop.removePrice}）`));
  rm.appendChild(el('div', 'o-detail', `已删 ${shop.removeCount} 次，下次价格 +25`));
  const rmAffordable = run.state.gold >= shop.removePrice && run.state.deck.length > 0;
  if (!rmAffordable) rm.style.opacity = '0.45';
  on(rm, 'click', () => {
    if (!rmAffordable) return;
    openRemoveCardPicker(app, shop.removePrice, () => renderShop(app, panel, shop));
  });
  panel.appendChild(rm);

  panel.appendChild(leaveButton(app, '离开商店'));
}

function itemPrice(item: ShopItem): number {
  let price = item.kind === 'card' ? item.price : getRelicDef(item.defId).basePrice;
  if (item.discounted) price = Math.round(price * 0.5);
  return Math.max(1, price);
}

function openRemoveCardPicker(app: GameApp, price: number, after: () => void): void {
  const run = app.ctx!.run;
  const body = el('div', 'deck-grid');
  run.state.deck.forEach((entry, i) => {
    const def = upgradeCardDef(getCardDef(entry.defId), entry.level);
    const node = el('div', `card large ${def.cardType.toLowerCase()}`);
    node.appendChild(el('div', `cost${def.baseCost === 0 ? ' zero' : ''}`, String(def.baseCost)));
    node.appendChild(el('div', 'cname', def.name));
    node.appendChild(el('div', 'cdesc', def.description.slice(0, 40)));
    on(node, 'click', () => {
      if (run.buyRemoveCard(i)) {
        sfx.coin();
        app.save();
        closeModal();
        after();
      }
    });
    body.appendChild(node);
  });
  modal(`选择要删除的卡牌（🪙 ${price}）`, body, [{ label: '取消' }]);
}

// ---------------------------------------------------------------------------
// 营地
// ---------------------------------------------------------------------------

function renderRest(app: GameApp, panel: HTMLElement, rest: Extract<EncounterScreen, { kind: 'rest' }>): void {
  const run = app.ctx!.run;
  panel.appendChild(el('div', 'panel-icon', '🏕️'));
  panel.appendChild(el('div', 'panel-title', '休息营地'));
  panel.appendChild(el('div', 'panel-text', '篝火噼啪作响，你终于可以喘口气了。'));
  const list = el('div', 'option-list');

  const finishRestNode = (): void => {
    const node = app.ctx?.run.currentNode;
    if (node) node.visited = true;
  };

  const restBtn = el('button', 'option-btn');
  restBtn.appendChild(el('div', 'o-label', '🛏️ 休养（回复 30% 最大生命）'));
  if (!rest.canHeal) {
    restBtn.appendChild(el('div', 'o-detail', '「黑市契约」禁止你在营地休养'));
    restBtn.disabled = true;
  }
  on(restBtn, 'click', () => {
    sfx.heal();
    const heal = run.restHealAmount();
    run.heal(heal);
    finishRestNode();
    app.save();
    showRestResult(app, panel, `你躺进温暖的睡袋，醒来时恢复了 ${heal} 点生命。`);
  });
  list.appendChild(restBtn);

  const smithBtn = el('button', 'option-btn');
  smithBtn.appendChild(el('div', 'o-label', '⚒️ 锻造（升级一张卡牌）'));
  smithBtn.appendChild(el('div', 'o-detail', '选择一张卡牌与升级分支（A：数值强化 / B：机制质变）'));
  on(smithBtn, 'click', () => {
    sfx.click();
    openUpgradePicker(app, () => {
      finishRestNode();
      app.save();
      showRestResult(app, panel, '叮叮当当，卡牌升级完成！');
    });
  });
  list.appendChild(smithBtn);

  const ritualBtn = el('button', 'option-btn');
  ritualBtn.appendChild(el('div', 'o-label', `🔥 ${rest.ritualName}`));
  ritualBtn.appendChild(el('div', 'o-detail', rest.ritualDesc));
  on(ritualBtn, 'click', () => {
    sfx.upgrade();
    run.performCampRitual();
    finishRestNode();
    app.save();
    showRestResult(app, panel, `你完成了【${rest.ritualName}】仪式，为下一场战斗积蓄了力量。`);
  });
  list.appendChild(ritualBtn);

  panel.appendChild(list);
  panel.appendChild(leaveButton(app, '离开营地'));
}

function showRestResult(app: GameApp, panel: HTMLElement, text: string): void {
  clearPanel(panel);
  panel.appendChild(el('div', 'panel-icon', '🔥'));
  panel.appendChild(el('div', 'panel-title', '营地'));
  panel.appendChild(el('div', 'result-text', text));
  panel.appendChild(leaveButton(app, '继续前进'));
}

function openUpgradePicker(app: GameApp, after: () => void): void {
  const run = app.ctx!.run;
  const body = el('div', 'deck-grid');
  run.state.deck.forEach((entry, i) => {
    if (entry.level !== 0) return;
    const def = upgradeCardDef(getCardDef(entry.defId), entry.level);
    const node = el('div', `card large ${def.cardType.toLowerCase()}`);
    node.appendChild(el('div', `cost${def.baseCost === 0 ? ' zero' : ''}`, String(def.baseCost)));
    node.appendChild(el('div', 'cname', def.name));
    node.appendChild(el('div', 'cdesc', def.description.slice(0, 40)));
    on(node, 'click', () => {
      sfx.upgrade();
      openBranchPicker(app, i, after);
    });
    body.appendChild(node);
  });
  modal('选择要升级的卡牌', body, [{ label: '取消' }]);
}

function openBranchPicker(app: GameApp, index: number, after: () => void): void {
  const run = app.ctx!.run;
  const entry = run.state.deck[index];
  const def = getCardDef(entry.defId);
  const body = el('div', 'option-list');
  const mk = (label: string, detail: string | undefined, level: 1 | 2): HTMLElement => {
    const b = el('button', 'option-btn');
    b.appendChild(el('div', 'o-label', label));
    if (detail) b.appendChild(el('div', 'o-detail', detail));
    on(b, 'click', () => {
      run.upgradeCard(index, level);
      app.save();
      closeModal();
      after();
    });
    return b;
  };
  body.appendChild(mk('分支 A：数值强化', def.upgradeA?.descOverride ?? '基础数值提升', 1));
  body.appendChild(mk('分支 B：机制质变', def.upgradeB?.descOverride ?? '费用/机制变化', 2));
  modal(`升级【${def.name}】`, body, [{ label: '取消' }]);
}

// ============================================================================
// 战利品（金币 + 卡牌三选一 + 首领遗物）
// ============================================================================

export function renderRewardScreen(app: GameApp, reward: CombatReward): void {
  const run = app.ctx!.run;
  const s = el('div', 'screen');
  const panel = el('div', 'panel');
  panel.appendChild(el('div', 'panel-icon', '🏆'));
  panel.appendChild(el('div', 'panel-title', '战斗胜利'));
  panel.appendChild(el('div', 'panel-text', `获得 🪙 ${reward.gold} 金币（当前 ${run.state.gold}）`));

  let relicChosen: string | null = null;

  // 首领遗物三选一
  if (reward.bossRelics) {
    panel.appendChild(el('div', 'panel-text', '—— 首领遗物（三选一）——'));
    const relicRow = el('div', 'shop-grid');
    for (const id of reward.bossRelics) {
      const relic = getRelicDef(id);
      const box = el('div', 'shop-item');
      box.appendChild(el('div', '', `${relic.icon} ${relic.name}`));
      box.appendChild(el('div', '', relic.desc));
      on(box, 'click', () => {
        sfx.click();
        relicChosen = id;
        relicRow.querySelectorAll('.shop-item').forEach((n) => (n as HTMLElement).style.borderColor = '');
        box.style.borderColor = 'var(--mint)';
      });
      relicRow.appendChild(box);
    }
    panel.appendChild(relicRow);
  }

  // 卡牌三选一
  panel.appendChild(el('div', 'panel-text', '—— 选择一张卡牌加入牌组 ——'));
  const draftRow = el('div', 'draft-grid');
  for (const id of reward.draft) {
    const def = getCardDef(id);
    const node = el('div', `card large ${def.cardType.toLowerCase()}`);
    node.appendChild(el('div', `cost${def.baseCost === 0 ? ' zero' : ''}`, String(def.baseCost)));
    const ctype = def.cardType === 'Attack' ? '🗡️' : def.cardType === 'Skill' ? '🛡️' : def.cardType === 'Power' ? '✨' : '☠️';
    node.appendChild(el('div', 'ctype', ctype));
    node.appendChild(el('div', 'cname', def.name));
    node.appendChild(el('div', 'cdesc', def.description));
    on(node, 'click', () => {
      sfx.upgrade();
      if (relicChosen) run.addRelic(relicChosen);
      app.acceptDraft(id);
    });
    draftRow.appendChild(node);
  }
  panel.appendChild(draftRow);

  const skip = el('button', 'btn', '跳过卡牌奖励');
  on(skip, 'click', () => {
    sfx.click();
    if (relicChosen) run.addRelic(relicChosen);
    app.skipDraft();
  });
  panel.appendChild(skip);

  s.appendChild(panel);
  app.show(s);
}

// ============================================================================
// 结算
// ============================================================================

export function renderSummaryScreen(app: GameApp): void {
  const run = app.ctx!.run;
  const s = el('div', 'screen title-screen');
  const won = run.state.victory === true;
  s.appendChild(el('div', 'title-logo', won ? '🏆 通关！' : '💀 旅程结束'));
  s.appendChild(el('div', 'title-sub', won ? '「这个世界的卡牌，都是从聊天记录里提取的精华。」' : '你倒在了爬塔的途中，但氏族会记住你。'));

  const panel = el('div', 'panel');
  const stats = el('div', 'summary-stats');
  const row = (k: string, v: string): void => {
    const r = el('div', 'row');
    r.appendChild(el('span', 'k', k));
    r.appendChild(el('span', 'v', v));
    stats.appendChild(r);
  };
  row('职业', run.classDef.name);
  if (run.characterId) {
    row('同行者', `${getCharacterDef(run.characterId).icon} ${getCharacterDef(run.characterId).name}`);
  }
  row('到达章节', `第 ${run.state.act} 章`);
  row('战斗胜利', `${run.state.stats.combatsWon} 场`);
  row('精英讨伐', `${run.state.stats.elitesKilled} 只`);
  row('卡牌收藏', `${run.state.deck.length} 张`);
  row('遗物', `${run.state.relics.length} 件`);
  row('最终金币', `🪙 ${run.state.gold}`);
  const embers = run.state.flags['embersGained'] as number | undefined;
  if (embers !== undefined) {
    row('星魂碎片', `✨ +${embers}`);
  }
  panel.appendChild(stats);
  s.appendChild(panel);

  const actions = el('div', 'title-actions');
  const again = el('button', 'btn btn-primary', '↻ 再来一局');
  on(again, 'click', () => { sfx.click(); app.restart(); });
  actions.appendChild(again);
  s.appendChild(actions);
  app.show(s);
}

// ============================================================================
// 工具
// ============================================================================

function clearPanel(panel: HTMLElement): void {
  while (panel.firstChild) panel.removeChild(panel.firstChild);
}
