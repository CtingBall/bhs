import type { Card, MapNode, NodeType } from '@/types';
import { buildDeckFromIds } from '@/data/cards';

export function buildDeck(ids: string[]): Card[] {
  return buildDeckFromIds(ids);
}

const FLOORS = 14;

function rollNodeType(floor: number): NodeType {
  if (floor === 0) return 'battle';
  if (floor === FLOORS - 2) return 'rest';
  if (floor === FLOORS - 1) return 'boss';
  const r = Math.random();
  if (r < 0.30) return 'battle';
  if (r < 0.42) return 'event';
  if (r < 0.52) return 'elite';
  if (r < 0.64) return 'shop';
  if (r < 0.74) return 'rest';
  if (r < 0.82) return 'mystery';
  if (r < 0.88) return 'treasure';
  return 'dimension';
}

function generateZone(): MapNode[] {
  let nextId = 0;
  const floors: MapNode[][] = [];

  for (let f = 0; f < FLOORS; f++) {
    const floorNodes: MapNode[] = [];
    if (f === FLOORS - 1) {
      floorNodes.push({
        id: nextId++, type: 'boss', visited: false, floor: f, col: 1, next: [],
      });
    } else if (f === 0) {
      floorNodes.push({ id: nextId++, type: 'battle', visited: false, floor: f, col: 0, next: [] });
      floorNodes.push({ id: nextId++, type: 'battle', visited: false, floor: f, col: 2, next: [] });
    } else if (f === FLOORS - 2) {
      const leftType = Math.random() < 0.5 ? 'rest' : 'shop';
      const rightType = leftType === 'rest' ? 'shop' : 'rest';
      floorNodes.push({ id: nextId++, type: leftType, visited: false, floor: f, col: 0, next: [] });
      floorNodes.push({ id: nextId++, type: rightType, visited: false, floor: f, col: 2, next: [] });
    } else {
      const count = Math.random() < 0.4 ? 3 : 2;
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

  for (let f = 0; f < FLOORS - 1; f++) {
    const currentFloor = floors[f];
    const nextFloor = floors[f + 1];

    for (const node of currentFloor) {
      const sorted = [...nextFloor].sort(
        (a, b) => Math.abs(a.col - node.col) - Math.abs(b.col - node.col),
      );
      const conns: number[] = [sorted[0].id];
      if (sorted.length > 1 && Math.random() < 0.4) {
        if (!conns.includes(sorted[1].id)) conns.push(sorted[1].id);
      }
      node.next = conns;
    }

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

  return floors.flat();
}

export function generateMap(): MapNode[][] {
  const zones: MapNode[][] = [];
  for (let i = 0; i < 7; i++) zones.push(generateZone());
  return zones;
}

export function getReachableIds(zoneNodes: MapNode[], currentNodeId: number | null): Set<number> {
  if (currentNodeId === null) {
    return new Set(zoneNodes.filter((n) => n.floor === 0 && !n.visited).map((n) => n.id));
  }
  const current = zoneNodes.find((n) => n.id === currentNodeId);
  if (!current) return new Set();
  return new Set(current.next.filter((id) => !zoneNodes.find((n) => n.id === id)?.visited));
}
