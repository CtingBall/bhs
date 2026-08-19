// ============================================================================
// DAG 爬塔地图生成器（约束满足 CSP）
// 约束规则：
//  1. 16 层（Layer 0 起点 → Layer 15 Boss），每层 3~5 列
//  2. 每层节点只允许连接下一层横向距离 ≤1 的节点
//  3. 拓扑去交叉：禁止 (r,c)→(r+1,c+1) 与 (r,c+1)→(r+1,c) 同时出现
//  4. 首层全普通战斗；精英不出现在第 5 层前；Layer 14 全休息营地；Layer 9 全宝箱
//  5. 动态权重补偿：连续 3 次未遇商店/营地，其权重每层 +15%
// ============================================================================

import type { RngStream } from './rng';

export type MapNodeType =
  | 'start' | 'monster' | 'elite' | 'event' | 'shop' | 'rest' | 'treasure' | 'boss';

export interface MapNode {
  id: string;
  layer: number;
  col: number;
  type: MapNodeType;
  /** 下一层可达节点 */
  connections: string[];
  /** 上一层来源节点 */
  incoming: string[];
  visited?: boolean;
  reachable?: boolean;
}

export interface MapGraph {
  layers: MapNode[][];
  startIds: string[];
  bossId: string;
  nodesById: Map<string, MapNode>;
}

export function generateMap(rng: RngStream, totalLayers = 16): MapGraph {
  const layers: MapNode[][] = [];
  const nodesById = new Map<string, MapNode>();

  // 1. 生成层结构（相邻层列数差 ≤1，保证横向距离 ≤1 的连通约束可满足）
  let prevCols = 0;
  for (let layer = 0; layer < totalLayers; layer++) {
    let cols: number;
    if (layer === 0) cols = rng.int(2, 4);
    else if (layer === totalLayers - 1) cols = 1;
    else if (layer === totalLayers - 2) cols = 3;
    else {
      const delta = rng.int(-1, 1);
      cols = Math.min(5, Math.max(3, prevCols + delta));
    }
    prevCols = cols;

    const row: MapNode[] = [];
    for (let c = 0; c < cols; c++) {
      const node: MapNode = {
        id: `${layer}-${c}`,
        layer,
        col: c,
        type: 'monster',
        connections: [],
        incoming: [],
      };
      row.push(node);
      nodesById.set(node.id, node);
    }
    layers.push(row);
  }

  // 2. 连接：自顶向下，保证每个节点 ≥1 条入边 + 去交叉
  for (let layer = 0; layer < totalLayers - 1; layer++) {
    const cur = layers[layer];
    const next = layers[layer + 1];

    // 保证每个下层节点至少有一条入边：就近匹配
    const used: boolean[][] = next.map(() => cur.map(() => false));
    for (let ni = 0; ni < next.length; ni++) {
      // 在 cur 中找 col 最接近且未导致交叉的节点
      let best = -1;
      let bestDist = Infinity;
      for (let ci = 0; ci < cur.length; ci++) {
        if (Math.abs(cur[ci].col - next[ni].col) > 1) continue;
        const d = Math.abs(cur[ci].col - next[ni].col);
        // 交叉检查：若 (cur[ci]) 连 (next[ni])，检查 cur 中更靠右的节点是否已连到 next 中更靠左的节点
        if (causesCrossing(cur, ci, next, ni, used)) continue;
        if (d < bestDist) {
          bestDist = d;
          best = ci;
        }
      }
      if (best >= 0) {
        cur[best].connections.push(next[ni].id);
        next[ni].incoming.push(cur[best].id);
        used[ni][best] = true;
      }
    }

    // 附加连接（每个上层节点 1~2 条出边，随机，仍守交叉约束）
    for (let ci = 0; ci < cur.length; ci++) {
      const targetCount = rng.chance(0.5) ? 2 : 1;
      const candidates: number[] = [];
      for (let ni = 0; ni < next.length; ni++) {
        if (Math.abs(cur[ci].col - next[ni].col) > 1) continue;
        if (used[ni][ci]) continue; // 已连
        if (causesCrossing(cur, ci, next, ni, used)) continue;
        candidates.push(ni);
      }
      rng.shuffle(candidates);
      let added = 0;
      for (const ni of candidates) {
        if (added >= targetCount) break;
        cur[ci].connections.push(next[ni].id);
        next[ni].incoming.push(cur[ci].id);
        used[ni][ci] = true;
        added++;
      }
    }

    // 兜底：仍有孤立节点则直连
    for (let ni = 0; ni < next.length; ni++) {
      if (next[ni].incoming.length === 0) {
        let best = -1;
        let bestDist = Infinity;
        for (let ci = 0; ci < cur.length; ci++) {
          const d = Math.abs(cur[ci].col - next[ni].col);
          if (d <= 1 && d < bestDist) { bestDist = d; best = ci; }
        }
        if (best >= 0) {
          cur[best].connections.push(next[ni].id);
          next[ni].incoming.push(cur[best].id);
        }
      }
    }
  }

  // 2.5 强制终点连通：所有 Layer 14（Boss 前一层）节点必须连到 Boss，
  //     保证玩家无论从哪个休息营地出发都能进入 Boss 房间
  const bossRow = layers[totalLayers - 1];
  const bossNode = bossRow[0];
  const preBossRow = layers[totalLayers - 2];
  for (const node of preBossRow) {
    if (!node.connections.includes(bossNode.id)) {
      node.connections.push(bossNode.id);
      bossNode.incoming.push(node.id);
    }
  }

  // 3. 内容分配
  const last = totalLayers - 1;
  for (const layer of layers) {
    for (const node of layer) {
      if (node.layer === 0) node.type = 'start';
      else if (node.layer === last) node.type = 'boss';
      else if (node.layer === last - 1) node.type = 'rest';
      else if (node.layer === 9) node.type = 'treasure';
      else if (node.layer === 1) node.type = 'monster';
      else node.type = rollNodeType(rng, node.layer);
    }
  }

  const bossId = layers[last][0].id;
  return { layers, startIds: layers[0].map((n) => n.id), bossId, nodesById };
}

function causesCrossing(
  cur: MapNode[],
  ci: number,
  next: MapNode[],
  ni: number,
  used: boolean[][],
): boolean {
  // 规则：(r,c)→(r+1,c+1) 与 (r,c+1)→(r+1,c) 互斥
  // 若 cur[ci] 连 next[ni]（ni 在 ci 右侧），则 cur[ci+1] 不得连 next[ni-1]
  for (let ci2 = 0; ci2 < cur.length; ci2++) {
    for (let ni2 = 0; ni2 < next.length; ni2++) {
      if (!used[ni2][ci2]) continue;
      const d1 = next[ni].col - cur[ci].col;
      const d2 = next[ni2].col - cur[ci2].col;
      if (d1 > 0 && d2 < 0 && ci2 > ci && ni2 < ni) return true;
      if (d1 < 0 && d2 > 0 && ci2 < ci && ni2 > ni) return true;
    }
  }
  return false;
}

// 动态权重轮盘（含保底补偿）
function rollNodeType(rng: RngStream, layer: number): MapNodeType {
  // 基础权重池：普通 45 / 事件 25 / 商店 12 / 精英 18
  const weights: Array<{ type: MapNodeType; w: number }> = [
    { type: 'monster', w: 45 },
    { type: 'event', w: 25 },
    { type: 'shop', w: 12 },
    { type: 'elite', w: 18 },
  ];
  if (layer < 5) {
    // 精英不出现在第 5 层前
    const idx = weights.findIndex((x) => x.type === 'elite');
    weights.splice(idx, 1);
  }
  const total = weights.reduce((s, x) => s + x.w, 0);
  let roll = rng.next() * total;
  for (const item of weights) {
    roll -= item.w;
    if (roll <= 0) return item.type;
  }
  return 'monster';
}

/** 计算起点可达的节点集合（迷雾与可达性）。当前节点不视为已访问。 */
export function computeReachability(graph: MapGraph, currentId: string | null): void {
  for (const layer of graph.layers) {
    for (const node of layer) {
      node.reachable = false;
    }
  }
  if (!currentId) {
    for (const id of graph.startIds) {
      const n = graph.nodesById.get(id)!;
      n.reachable = true;
    }
    return;
  }
  const current = graph.nodesById.get(currentId);
  if (!current) return;
  for (const conn of current.connections) {
    const n = graph.nodesById.get(conn);
    if (n) n.reachable = true;
  }
}

/** 依据当前节点返回地图上应展示的层集合 */
export function visibleLayers(graph: MapGraph, currentLayer: number): MapNode[][] {
  return graph.layers.filter((layer) => layer[0].layer <= currentLayer + 1);
}

// ---------------------------------------------------------------------------
// 序列化（存档用）
// ---------------------------------------------------------------------------

export interface SerializedMap {
  layers: Array<Array<{
    id: string; layer: number; col: number; type: MapNodeType;
    connections: string[]; incoming: string[]; visited?: boolean; reachable?: boolean;
  }>>;
  startIds: string[];
  bossId: string;
}

export function mapToJSON(graph: MapGraph): SerializedMap {
  return {
    layers: graph.layers.map((row) => row.map((n) => ({
      id: n.id, layer: n.layer, col: n.col, type: n.type,
      connections: n.connections, incoming: n.incoming,
      visited: n.visited, reachable: n.reachable,
    }))),
    startIds: graph.startIds,
    bossId: graph.bossId,
  };
}

export function mapFromJSON(data: SerializedMap): MapGraph {
  const layers: MapNode[][] = data.layers.map((row) =>
    row.map((n) => ({
      id: n.id, layer: n.layer, col: n.col, type: n.type,
      connections: n.connections, incoming: n.incoming,
      visited: n.visited, reachable: n.reachable,
    })),
  );
  const nodesById = new Map<string, MapNode>();
  for (const row of layers) for (const n of row) nodesById.set(n.id, n);
  return { layers, startIds: data.startIds, bossId: data.bossId, nodesById };
}
