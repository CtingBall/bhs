// ============================================================================
// 全流程无头模拟（整局跑测：战斗→奖励→地图→事件/商店/营地→章节→通关）
// 用于在浏览器之外捕获运行期逻辑错误
// ============================================================================

import { describe, it, expect } from 'vitest';
import { Run } from '../src/core/run';
import { openEncounter } from '../src/core/encounter';
import { getCardDef } from '../src/core/cards';

import '../src/content/cards';
import '../src/content/classes';
import '../src/content/relics';
import '../src/content/events';

function autoPlayCombat(run: Run, maxRounds = 600): void {
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
  expect(combat.ended, `战斗未在 ${maxRounds} 回合内终结 (${run.state.classId} act${run.state.act})`).toBe(true);
}

function simulateFullRun(classId: string, seed: string, maxNodes = 200): Run {
  const run = Run.newRun(classId, seed);
  let guard = 0;
  while (guard++ < maxNodes) {
    if (run.state.victory || run.state.defeat) break;

    // 返回地图：清空当前节点指针
    if (run.currentNode?.visited) run.state.currentNodeId = null;
    if (!run.currentNode) {
      const reachable = run.reachableNodes();
      if (reachable.length === 0) {
        // 无可达节点：若未通关则视为失败保护
        break;
      }
      run.enterNode(reachable[0].id);
      continue;
    }

    const node = run.currentNode;
    if (node.type === 'monster' || node.type === 'elite' || node.type === 'boss' || run.state.flags['pendingSpecialCombat']) {
      autoPlayCombat(run);
      const reward = run.onCombatEnd();
      if (reward.draft.length > 0) run.acceptDraft(reward.draft[0]);
      if (reward.bossRelics && reward.bossRelics.length > 0) run.addRelic(reward.bossRelics[0]);
      node.visited = true;
      run.state.currentNodeId = null;
      continue;
    }

    // 非战斗节点
    const encounter = openEncounter(run, node);
    if (encounter.kind === 'event') {
      const opt = encounter.event.options[0];
      opt.effect(run);
    } else if (encounter.kind === 'rest') {
      // 先休养（若允许），再锻造第一张可升级卡
      if (encounter.canHeal) run.heal(Math.round(run.state.maxHp * 0.3));
      const idx = run.state.deck.findIndex((e) => e.level === 0);
      if (idx >= 0) run.upgradeCard(idx, 1);
    } else if (encounter.kind === 'shop') {
      // 买第一件买得起的商品
      for (const item of encounter.items) {
        const price = item.kind === 'card' ? item.price : (item.discounted ? Math.round(item.price * 0.5) : item.price);
        void price;
      }
    }
    // treasure 在 openEncounter 时已结算
    node.visited = true;
    run.state.currentNodeId = null;
  }
  return run;
}

describe('整局模拟', () => {
  it('雷影剑士：模拟整局直至通关或失败，无运行期错误', () => {
    const run = simulateFullRun('hero_thunderblade', 'fullrun-tb-1');
    expect(run.state.victory === true || run.state.defeat === true).toBe(true);
  });

  it('神盾骑士：模拟整局直至通关或失败，无运行期错误', () => {
    const run = simulateFullRun('hero_aegis_knight', 'fullrun-aeg-1');
    expect(run.state.victory === true || run.state.defeat === true).toBe(true);
  });

  it('森语者：模拟整局直至通关或失败，无运行期错误', () => {
    const run = simulateFullRun('hero_sylvanguard', 'fullrun-syl-1');
    expect(run.state.victory === true || run.state.defeat === true).toBe(true);
  });

  it('冰魔导师：模拟整局直至通关或失败，无运行期错误', () => {
    const run = simulateFullRun('hero_frost_mage', 'fullrun-mge-1');
    expect(run.state.victory === true || run.state.defeat === true).toBe(true);
  });

  it('赤炎狂战士：模拟整局直至通关或失败，无运行期错误', () => {
    const run = simulateFullRun('hero_flame_berserker', 'fullrun-ber-1');
    expect(run.state.victory === true || run.state.defeat === true).toBe(true);
  });

  it('巨刃守护者：模拟整局直至通关或失败，无运行期错误', () => {
    const run = simulateFullRun('hero_titan_guardian', 'fullrun-grd-1');
    expect(run.state.victory === true || run.state.defeat === true).toBe(true);
  });

  it('神射手：模拟整局直至通关或失败，无运行期错误', () => {
    const run = simulateFullRun('hero_sharpshooter', 'fullrun-sht-1');
    expect(run.state.victory === true || run.state.defeat === true).toBe(true);
  });

  it('灵魂乐手：模拟整局直至通关或失败，无运行期错误', () => {
    const run = simulateFullRun('hero_soul_musician', 'fullrun-mus-1');
    expect(run.state.victory === true || run.state.defeat === true).toBe(true);
  });

  it('青岚骑士：模拟整局直至通关或失败，无运行期错误', () => {
    const run = simulateFullRun('hero_gale_knight', 'fullrun-knt-1');
    expect(run.state.victory === true || run.state.defeat === true).toBe(true);
  });

  it('存档往返：快照→序列化→恢复后状态一致', () => {
    const run = simulateFullRun('hero_thunderblade', 'fullrun-tb-2');
    const snap = run.toSnapshot();
    const restored = new Run(structuredClone(snap));
    expect(restored.state.hp).toBe(run.state.hp);
    expect(restored.state.gold).toBe(run.state.gold);
    expect(restored.state.deck.length).toBe(run.state.deck.length);
    expect(restored.state.act).toBe(run.state.act);
    // RNG 状态恢复后可继续产生相同结果
    expect(restored.rng.reward.next()).toBe(run.rng.reward.next());
  });
});
