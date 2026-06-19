import type { Card, MapNode, NodeType } from '@/types';
import { CARD_MAP } from '@/data/cards';

// 由卡牌 id 数组构造卡组
export function buildDeck(ids: string[]): Card[] {
  return ids.map((id) => CARD_MAP[id]).filter(Boolean);
}

const FLOORS = 12; // 0-10 普通层, 11 = boss 层

function rollNodeType(floor: number): NodeType {
  if (floor === 0) return 'battle'; // 首层必战斗
  if (floor === FLOORS - 2) return 'rest'; // boss 前必休息
  if (floor === FLOORS - 1) return 'boss';
  const r = Math.random();
  if (r < 0.42) return 'battle';
  if (r < 0.55) return 'event';
  if (r < 0.68) return 'elite';
  if (r < 0.80) return 'shop';
  return 'rest';
}

// 生成一个大区的分支节点图（杀戮尖塔式）
function generateZone(): MapNode[] {
  let nextId = 0;
  const floors: MapNode[][] = [];

  for (let f = 0; f < FLOORS; f++) {
    const floorNodes: MapNode[] = [];
    if (f === FLOORS - 1) {
      // Boss 层：1 个 boss 节点，居中
      floorNodes.push({
        id: nextId++, type: 'boss', visited: false, floor: f, col: 1, next: [],
      });
    } else if (f === 0) {
      // 入口层：2 个战斗节点
      floorNodes.push({ id: nextId++, type: 'battle', visited: false, floor: f, col: 0, next: [] });
      floorNodes.push({ id: nextId++, type: 'battle', visited: false, floor: f, col: 2, next: [] });
    } else if (f === FLOORS - 2) {
      // 休息层：2 个休息节点
      floorNodes.push({ id: nextId++, type: 'rest', visited: false, floor: f, col: 0, next: [] });
      floorNodes.push({ id: nextId++, type: 'rest', visited: false, floor: f, col: 2, next: [] });
    } else {
      // 中间层：2-3 个节点
      const count = Math.random() < 0.35 ? 3 : 2;
      if (count === 3) {
        floorNodes.push({ id: nextId++, type: rollNodeType(f), visited: false, floor: f, col: 0, next: [] });
        floorNodes.push({ id: nextId++, type: rollNodeType(f), visited: false, floor: f, col: 1, next: [] });
        floorNodes.push({ id: nextId++, type: rollNodeType(f), visited: false, floor: f, col: 2, next: [] });
      } else {
        const startCol = Math.random() < 0.5 ? 0 : 1;
        floorNodes.push({ id: nextId++, type: rollNodeType(f), visited: false, floor: f, col: startCol, next: [] });
        floorNodes.push({ id: nextId++, type: rollNodeType(f), visited: false, floor: f, col: startCol + 1, next: [] });
      }
    }
    floors.push(floorNodes);
  }

  // 生成路径连接（每层到下一层）
  for (let f = 0; f < FLOORS - 1; f++) {
    const currentFloor = floors[f];
    const nextFloor = floors[f + 1];

    for (const node of currentFloor) {
      // 按 col 距离排序下一层节点
      const sorted = [...nextFloor].sort(
        (a, b) => Math.abs(a.col - node.col) - Math.abs(b.col - node.col),
      );
      const conns: number[] = [sorted[0].id];
      // 35% 概率连到第二个最近的
      if (sorted.length > 1 && Math.random() < 0.35) {
        if (!conns.includes(sorted[1].id)) conns.push(sorted[1].id);
      }
      node.next = conns;
    }

    // 确保下一层每个节点至少有一个入边
    for (const nextNode of nextFloor) {
      const hasConn = currentFloor.some((n) => n.next.includes(nextNode.id));
      if (!hasConn) {
        const closest = [...currentFloor].sort(
          (a, b) => Math.abs(a.col - nextNode.col) - Math.abs(b.col - nextNode.col),
        )[0];
        closest.next.push(nextNode.id);
      }
    }
  }

  // 展平
  return floors.flat();
}

export function generateMap(): MapNode[][] {
  return [generateZone(), generateZone(), generateZone()];
}

// 判断哪些节点当前可点击（从 currentNodeId 出发可达的未访问节点）
export function getReachableIds(zoneNodes: MapNode[], currentNodeId: number | null): Set<number> {
  if (currentNodeId === null) {
    // 区域入口：第 0 层所有节点可选
    return new Set(zoneNodes.filter((n) => n.floor === 0 && !n.visited).map((n) => n.id));
  }
  const current = zoneNodes.find((n) => n.id === currentNodeId);
  if (!current) return new Set();
  return new Set(current.next.filter((id) => !zoneNodes.find((n) => n.id === id)?.visited));
}
