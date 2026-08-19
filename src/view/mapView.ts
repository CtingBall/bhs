// ============================================================================
// DAG 地图视图（借鉴杀戮尖塔：SVG 路线连线 + 可达节点高亮 + 可滚动）
// ============================================================================

import { el, on, modal, confirmModal } from './dom';
import { sfx } from './audio';
import type { GameApp } from './main';
import type { MapNode } from '../core/map';
import { getActContent } from '../content/monsters';
import { getCardDef } from '../core/cards';

const NODE_ICONS: Record<string, string> = {
  start: '🚪', monster: '👾', elite: '💀', event: '❓',
  shop: '🛒', rest: '🏕️', treasure: '🎁', boss: '👹',
};

const LAYER_H = 148;
const NODE_W = 96;
const NODE_GAP = 18;
const CANVAS_W = 960;

export function renderMapScreen(app: GameApp): void {
  const ctx = app.ctx;
  if (!ctx) return;
  const run = ctx.run;
  const act = getActContent(run.state.act);

  const s = el('div', 'screen map-screen');

  // 固定头部
  const header = el('div', 'map-header');
  header.appendChild(el('div', 'map-title', `第 ${act.act} 章 · ${act.name}`));
  header.appendChild(el('div', 'map-sub', act.subtitle));
  const meta = el('div', 'class-stats', '');
  meta.style.justifyContent = 'center';
  meta.appendChild(el('span', 'stat-pill', `❤️ ${run.state.hp}/${run.state.maxHp}`));
  meta.appendChild(el('span', 'stat-pill', `🪙 ${run.state.gold}`));
  meta.appendChild(el('span', 'stat-pill', `🃏 ${run.state.deck.length} 张牌`));
  meta.appendChild(el('span', 'stat-pill', `🏆 ${run.state.stats.combatsWon} 胜`));
  header.appendChild(meta);
  const acts = el('div', 'class-stats', '');
  acts.style.justifyContent = 'center';
  for (let i = 1; i <= 4; i++) {
    const pill = el('span', 'stat-pill', i === run.state.act ? `● 第${i}章` : `○ 第${i}章`);
    if (i === run.state.act) pill.style.color = 'var(--mint)';
    acts.appendChild(pill);
  }
  header.appendChild(acts);
  const btns = el('div', 'class-stats', '');
  btns.style.justifyContent = 'center';
  const btnDeck = el('button', 'btn', '🃏 牌组');
  on(btnDeck, 'click', () => { sfx.click(); openMapDeck(app); });
  btns.appendChild(btnDeck);
  const btnRestart = el('button', 'btn', '↻ 重开');
  on(btnRestart, 'click', () => { sfx.click(); confirmModal('放弃当前旅程并重新开始？', () => app.restart()); });
  btns.appendChild(btnRestart);
  header.appendChild(btns);
  s.appendChild(header);

  // 可滚动地图区
  const scroll = el('div', 'map-scroll');
  const canvas = el('div', 'map-canvas');
  const layers = run.state.map.layers;
  const height = layers.length * LAYER_H + 60;
  canvas.style.height = `${height}px`;
  canvas.style.width = '100%';
  canvas.style.position = 'relative';

  // 计算节点坐标（居中排列）
  const pos = new Map<string, { x: number; y: number }>();
  for (const layer of layers) {
    const y = layer[0].layer * LAYER_H + 30;
    const n = layer.length;
    const rowW = n * NODE_W + (n - 1) * NODE_GAP;
    const x0 = (CANVAS_W - rowW) / 2;
    layer.forEach((node, i) => {
      pos.set(node.id, { x: x0 + i * (NODE_W + NODE_GAP), y });
    });
  }

  // SVG 连线
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg') as unknown as SVGElement;
  svg.setAttribute('viewBox', `0 0 ${CANVAS_W} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', String(height));
  svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;';
  const defs = document.createElementNS(svgNS, 'defs');
  const grad = document.createElementNS(svgNS, 'linearGradient');
  grad.setAttribute('id', 'lineGrad');
  grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');
  const stop1 = document.createElementNS(svgNS, 'stop');
  stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', '#6ef7b2');
  const stop2 = document.createElementNS(svgNS, 'stop');
  stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', '#3a7a58');
  grad.appendChild(stop1); grad.appendChild(stop2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  for (const layer of layers) {
    for (const node of layer) {
      const from = pos.get(node.id);
      if (!from) continue;
      for (const conn of node.connections) {
        const to = pos.get(conn);
        if (!to) continue;
        const path = document.createElementNS(svgNS, 'path');
        const x1 = from.x + NODE_W / 2;
        const y1 = from.y + 78;
        const x2 = to.x + NODE_W / 2;
        const y2 = to.y + 6;
        const midY = (y1 + y2) / 2;
        const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', node.reachable && !node.visited ? 'url(#lineGrad)' : '#2a3a52');
        path.setAttribute('stroke-width', node.reachable && !node.visited ? '2.6' : '1.4');
        path.setAttribute('opacity', node.reachable && !node.visited ? '0.95' : '0.45');
        svg.appendChild(path);
      }
    }
  }
  canvas.appendChild(svg);

  // 节点
  for (const layer of layers) {
    for (const node of layer) {
      const p = pos.get(node.id);
      if (!p) continue;
      const nEl = el('div', `map-node type-${node.type}`);
      nEl.style.left = `${p.x}px`;
      nEl.style.top = `${p.y}px`;
      nEl.style.position = 'absolute';
      nEl.appendChild(el('div', 'icon', NODE_ICONS[node.type] ?? '?'));
      nEl.appendChild(el('div', 'name', nodeTypeName(node)));
      if (node.visited) nEl.classList.add('visited');
      if (node.reachable && !node.visited) nEl.classList.add('reachable');
      if (node.id === run.state.currentNodeId) nEl.classList.add('done-here');
      if (node.reachable && !node.visited) {
        on(nEl, 'click', () => {
          sfx.click();
          const entered = run.enterNode(node.id);
          if (entered) {
            app.save();
            app.routeToRun();
          }
        });
      }
      canvas.appendChild(nEl);
    }
  }

  // 层级标注（起点/终点）
  const startTag = el('div', 'map-layer-tag', '▲ 出发');
  startTag.style.top = `${pos.get(run.state.map.startIds[0])?.y ?? 10}px`;
  canvas.appendChild(startTag);
  const bossTag = el('div', 'map-layer-tag boss', '▼ 首领');
  bossTag.style.top = `${pos.get(run.state.map.bossId)?.y ?? 10}px`;
  canvas.appendChild(bossTag);

  scroll.appendChild(canvas);
  s.appendChild(scroll);
  app.show(s);
}

function nodeTypeName(node: MapNode): string {
  switch (node.type) {
    case 'monster': return '战斗';
    case 'elite': return '精英';
    case 'event': return '事件';
    case 'shop': return '商店';
    case 'rest': return '营地';
    case 'treasure': return '宝箱';
    case 'boss': return node.layer === 15 ? '首领' : 'Boss';
    case 'start': return '起点';
    default: return node.type;
  }
}

function openMapDeck(app: GameApp): void {
  const deck = app.ctx?.run.state.deck ?? [];
  const body = el('div', 'deck-grid');
  for (const entry of deck) {
    const def = getCardDef(entry.defId);
    const node = el('div', `card large ${def.cardType.toLowerCase()}`);
    node.appendChild(el('div', `cost${def.baseCost === 0 ? ' zero' : ''}`, String(def.baseCost)));
    const ctype = def.cardType === 'Attack' ? '🗡️' : def.cardType === 'Skill' ? '🛡️' : def.cardType === 'Power' ? '✨' : '☠️';
    node.appendChild(el('div', 'ctype', ctype));
    node.appendChild(el('div', 'cname', def.name));
    const desc = el('div', 'cdesc');
    desc.innerHTML = def.description.replace(/(\d+(?:\.\d+)?)/g, '<span class="num">$1</span>');
    node.appendChild(desc);
    if (entry.level > 0) node.appendChild(el('div', 'upgraded', entry.level === 1 ? '✦A' : '✦B'));
    body.appendChild(node);
  }
  modal('牌组', body, [{ label: '关闭' }]);
}
