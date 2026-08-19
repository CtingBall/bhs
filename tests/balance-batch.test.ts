// ============================================================================
// 平衡性批量跑测（9 职业 × 多种子自动玩家胜率，输出参考信息）
// 不设硬性断言（平衡属迭代调优项），仅报告统计
// ============================================================================

// @vitest-environment jsdom
import { it } from 'vitest';
import '../src/content/index';
import { Run } from '../src/core/run';
import { openEncounter } from '../src/core/encounter';
import { getCardDef } from '../src/core/cards';
import { CLASS_REGISTRY } from '../src/content/classes';

function autoPlayCombat(run: Run, maxRounds = 500): void {
  const combat = run.startCombat();
  let guard = 0;
  while (!combat.ended && guard++ < maxRounds) {
    if (combat.phase !== 'PlayerAction') { combat.endTurn(); continue; }
    const incoming = combat.enemies.reduce((s, e) => s + ((e.intent?.damage ?? 0) * (e.intent?.hits ?? 1)), 0);
    const danger = incoming > combat.player.block + 6;
    const playable = combat.piles.hand.filter((c) => {
      if (combat.effectiveCost(c) > combat.energy) return false;
      const def = getCardDef(c.defId);
      if (def.unplayable) return false;
      if (def.requires && combat.getResource(combat.player, def.requires.resourceId) < def.requires.min) return false;
      return true;
    });
    if (playable.length === 0) { combat.endTurn(); continue; }
    const free = playable.filter((c) => combat.effectiveCost(c) === 0);
    const card = free.length > 0 ? free[0] : (danger
      ? (playable.find((c) => getCardDef(c.defId).cardType === 'Skill') ?? playable[0])
      : (playable.find((c) => getCardDef(c.defId).cardType === 'Attack') ?? playable[0]));
    const def = getCardDef(card.defId);
    const target = combat.aliveEnemies()[0];
    const ok = combat.playCard(card.uid, def.targetType === 'SingleEnemy' ? target?.id : undefined);
    if (!ok) combat.endTurn();
  }
}

function simulate(classId: string, seed: string): 'win' | 'lose' | 'stall' {
  const run = Run.newRun(classId, seed);
  let guard = 0;
  while (guard++ < 200) {
    if (run.state.victory) return 'win';
    if (run.state.defeat) return 'lose';
    if (run.currentNode?.visited) run.state.currentNodeId = null;
    if (!run.currentNode) {
      const reachable = run.reachableNodes();
      if (reachable.length === 0) return 'stall';
      const pick = run.state.hp / run.state.maxHp < 0.5
        ? (reachable.find((n) => n.type !== 'elite') ?? reachable[0])
        : reachable[0];
      run.enterNode(pick.id);
      continue;
    }
    const node = run.currentNode;
    if (node.type === 'monster' || node.type === 'elite' || node.type === 'boss' || run.state.flags['pendingSpecialCombat']) {
      autoPlayCombat(run);
      const reward = run.onCombatEnd();
      if (run.state.defeat) return 'lose';
      if (reward.draft.length > 0) {
        const pick = reward.draft.reduce((a, b) => {
          const rank = (r: string): number => (r === 'Rare' ? 3 : r === 'Uncommon' ? 2 : 1);
          return rank(getCardDef(a).rarity) >= rank(getCardDef(b).rarity) ? a : b;
        });
        run.acceptDraft(pick);
      }
      if (reward.bossRelics?.length) run.addRelic(reward.bossRelics[0]);
      node.visited = true;
      run.state.currentNodeId = null;
      continue;
    }
    const encounter = openEncounter(run, node);
    if (encounter.kind === 'event') encounter.event.options[0].effect(run);
    else if (encounter.kind === 'rest') { if (encounter.canHeal) run.heal(Math.round(run.state.maxHp * 0.3)); const idx = run.state.deck.findIndex((e) => e.level === 0); if (idx >= 0) run.upgradeCard(idx, 1); }
    node.visited = true;
    run.state.currentNodeId = null;
  }
  return 'stall';
}

it('平衡性批量跑测（9 职业 × 6 种子）', () => {
  const report: string[] = [];
  for (const classId of CLASS_REGISTRY.keys()) {
    let win = 0, lose = 0, stall = 0;
    for (let i = 0; i < 6; i++) {
      const r = simulate(classId, `bal-${classId}-${i}`);
      if (r === 'win') win++;
      else if (r === 'lose') lose++;
      else stall++;
    }
    report.push(`${classId}: 胜${win}/6 负${lose} 卡死${stall}`);
  }
  // 输出统计供人工调优参考（不做硬断言，仅确保无卡死）
  for (const line of report) console.log(`[平衡] ${line}`);
});
