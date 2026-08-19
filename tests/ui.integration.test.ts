// ============================================================================
// UI 集成测试（jsdom）：不依赖浏览器，模拟真实点击流程
// 标题 → 选人 → 地图 → 进入战斗 → 选牌点选敌人 → 结束回合
// 事件处理器内的任何运行时异常都会让 .click() 抛错，从而被测试捕获
// ============================================================================

// @vitest-environment jsdom

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { computeReachability } from '../src/core/map';

const tick = () => new Promise<void>((r) => setTimeout(r, 20));

// 内存版 localStorage 替身（当前 vitest 环境下 jsdom localStorage 不可用）
beforeAll(() => {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
});

describe('UI 集成（jsdom）', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    try { localStorage.clear(); } catch { /* ignore */ }
  });

  it('完整流程：标题→选人→地图→战斗→出牌→结束回合', async () => {
    await import('../src/view/main');

    // 1. 标题画面
    const logo = document.querySelector('.title-logo');
    expect(logo?.textContent).toContain('薄荷色氏族公约');

    // 2. 开始新旅程 → 选人物（水千夏）→ 选职业
    const startBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('开始新旅程'));
    expect(startBtn).toBeTruthy();
    startBtn!.click();
    await tick();
    const charCard = document.querySelector('.class-card') as HTMLElement | null;
    expect(charCard, '人物卡片应存在').toBeTruthy();
    charCard!.click();
    await tick();
    const classCard = document.querySelector('.class-card') as HTMLElement | null;
    expect(classCard).toBeTruthy();
    classCard!.click();
    await tick();
    const goBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('出发'));
    expect(goBtn).toBeTruthy();
    goBtn!.click();
    await tick();

    // 3. 地图 → 点击可达节点直到进入战斗
    expect(document.querySelector('.map-screen')).toBeTruthy();
    let enteredCombat = false;
    for (let i = 0; i < 6; i++) {
      const node = document.querySelector('.map-node.reachable') as HTMLElement | null;
      if (!node) break;
      node.click();
      await tick();
      if (document.querySelector('.combat-screen')) { enteredCombat = true; break; }
    }
    expect(enteredCombat, '应能进入战斗画面').toBe(true);
    expect(document.querySelectorAll('.card').length).toBeGreaterThan(0);
    expect(document.querySelector('.sts-battle-screen')).toBeTruthy();
    expect(document.querySelector('.sts-topbar')).toBeTruthy();
    expect(document.querySelector('.sts-arena')).toBeTruthy();
    expect(document.querySelector('.sts-hand-zone')).toBeTruthy();
    expect(document.querySelector('.sts-command-bar')).toBeTruthy();
    expect(document.querySelectorAll('.enemy').length).toBeGreaterThan(0);

    // 4. 点选一张攻击牌，再点击敌人施放（点选模式）
    const attackCard = [...document.querySelectorAll('.card')].find(
      (c) => c.className.includes('attack') && !c.className.includes('disabled'),
    ) as HTMLElement | undefined;
    if (attackCard) {
      attackCard.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      attackCard.dispatchEvent(new Event('pointerup', { bubbles: true }));
      await tick();
      const enemy = document.querySelector('.enemy') as HTMLElement | null;
      expect(enemy).toBeTruthy();
      enemy!.click();
      await tick();
    }

    // 5. 结束回合（若有二级确认弹窗则点确定）
    const endBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('结束回合'));
    expect(endBtn).toBeTruthy();
    endBtn!.click();
    await tick();
    const confirmBtn = [...document.querySelectorAll('.modal-actions button')].find((b) => b.textContent === '确定') as HTMLElement | undefined;
    if (confirmBtn) confirmBtn.click();
    await tick();
    // 手牌仍正常渲染，无崩溃
    expect(document.querySelector('.combat-screen')).toBeTruthy();
  });

  it('人物模块：选人物后出发，携带专属遗物与同行者标签', async () => {
    const { initGameApp } = await import('../src/view/main');
    const app = initGameApp();
    // 标题 → 开始新旅程 → 人物选择
    const startBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('开始新旅程'))!;
    startBtn.click();
    await tick();
    // 人物选择画面：出现人物卡片 + 专属遗物提示
    const charCards = [...document.querySelectorAll('.class-card')];
    expect(charCards.length).toBeGreaterThanOrEqual(6);
    const qianxiaCard = charCards[0] as HTMLElement;
    expect(qianxiaCard.textContent).toContain('水千夏');
    expect(qianxiaCard.textContent).toContain('不死魔王·守身如玉');
    // 人物小传弹窗
    const loreBtn = [...qianxiaCard.querySelectorAll('button')].find((b) => b.textContent?.includes('人物小传'))!;
    loreBtn.click();
    await tick();
    expect(document.querySelector('.modal-overlay')).toBeTruthy();
    expect(document.querySelector('.modal-overlay')?.textContent).toContain('强袭虫');
    const closeBtn = [...document.querySelectorAll('.modal-actions button')].find((b) => b.textContent === '关闭') as HTMLElement | undefined;
    if (closeBtn) closeBtn.click();
    await tick();
    // 选择水千夏 → 职业选择画面出现同行者标签
    qianxiaCard.click();
    await tick();
    const chip = [...document.querySelectorAll('.stat-pill')].find((p) => p.textContent?.includes('同行者'));
    expect(chip, '职业选择画面应显示同行者标签').toBeTruthy();
    // 选择职业并出发
    (document.querySelector('.class-card') as HTMLElement).click();
    await tick();
    [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('出发'))!.click();
    await tick();
    // 本局携带人物：专属遗物自动装配
    expect(app.ctx?.run.characterId).toBe('char_qianxia');
    expect(app.ctx?.run.hasRelic('relic_qianxia_undying')).toBe(true);
  });

  it('人物模块：六位人物全部开放，专属遗物各就各位', async () => {
    const { initGameApp } = await import('../src/view/main');
    const app = initGameApp();
    const startBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('开始新旅程'))!;
    startBtn.click();
    await tick();
    const charCards = [...document.querySelectorAll('.class-card')];
    expect(charCards.length).toBe(6);
    // 全部开放：无锁定卡片，均展示专属遗物名而非「敬请期待」
    expect(charCards.every((c) => !c.className.includes('locked'))).toBe(true);
    expect(charCards.every((c) => !c.textContent!.includes('敬请期待'))).toBe(true);
    const names = ['伏月十三', '薄荷色小溪', '星落', '薄荷色第二栅栏', '奶蛙'];
    for (const name of names) {
      expect(charCards.some((c) => c.textContent!.includes(name)), `应有人物卡：${name}`).toBe(true);
    }
    // 选择伏月十三 → 装配线虫专属遗物
    (charCards.find((c) => c.textContent!.includes('伏月十三')) as HTMLElement).click();
    await tick();
    (document.querySelector('.class-card') as HTMLElement).click();
    await tick();
    [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('出发'))!.click();
    await tick();
    expect(app.ctx?.run.characterId).toBe('char_shisan');
    expect(app.ctx?.run.hasRelic('relic_shisan_online')).toBe(true);
  });

  it('手牌禁用态实时刷新：回合内攒够 5 音符后「激涌五重奏」立即可用', async () => {
    const { initGameApp } = await import('../src/view/main');
    const app = initGameApp();
    // 开始新旅程 → 水千夏 → 灵魂乐手（职业卡第 6 张）
    const startBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('开始新旅程'))!;
    startBtn.click();
    await tick();
    (document.querySelectorAll('.class-card')[0] as HTMLElement).click(); // 人物：水千夏
    await tick();
    (document.querySelectorAll('.class-card')[5] as HTMLElement).click(); // 灵魂乐手
    await tick();
    [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('出发'))!.click();
    await tick();
    for (let i = 0; i < 6; i++) {
      const node = document.querySelector('.map-node.reachable') as HTMLElement | null;
      if (!node) break;
      node.click();
      await tick();
      if (document.querySelector('.combat-screen')) break;
    }
    expect(document.querySelector('.combat-screen')).toBeTruthy();
    const combat = app.combat!;
    // 直接给手牌加入「激涌五重奏」（消耗 5 音符的终结技）
    combat.generateCard('card_mus_surging_quintet', 'hand');
    await tick();
    // 初始无音符 → 应为禁用态
    const quintet = [...document.querySelectorAll('.card')].find((c) => c.textContent?.includes('激涌五重奏')) as HTMLElement | undefined;
    expect(quintet, '激涌五重奏应在手牌').toBeTruthy();
    expect(quintet!.className).toContain('disabled');
    // 本回合内攒满 5 音符 → resource 事件 → 禁用态实时移除
    combat.modifyResource(combat.player, 'musical_note', 'Add', 5);
    await tick();
    expect(quintet!.className).not.toContain('disabled');
    // 点击即可打出（全体目标终结技，点选即施放）
    const energyBefore = combat.energy;
    quintet!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    quintet!.dispatchEvent(new Event('pointerup', { bubbles: true }));
    await tick();
    expect(combat.piles.hand.some((c) => c.defId === 'card_mus_surging_quintet')).toBe(false); // 已打出
    expect(combat.energy).toBe(energyBefore - 2);
    // 音符被消耗（灵魂乐手打牌会回 1 音符，故断言 < 5）
    expect(combat.getResource(combat.player, 'musical_note')).toBeLessThan(5);
  });

  it('战斗内点选模式：选择非指向性卡牌可直接施放（防御牌）', async () => {
    const { initGameApp } = await import('../src/view/main');
    initGameApp();
    const startBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('开始新旅程'))!;
    startBtn.click();
    await tick();
    (document.querySelector('.class-card') as HTMLElement).click(); // 人物：水千夏
    await tick();
    (document.querySelector('.class-card') as HTMLElement).click(); // 职业
    await tick();
    [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('出发'))!.click();
    await tick();
    for (let i = 0; i < 6; i++) {
      const node = document.querySelector('.map-node.reachable') as HTMLElement | null;
      if (!node) break;
      node.click();
      await tick();
      if (document.querySelector('.combat-screen')) break;
    }
    expect(document.querySelector('.combat-screen')).toBeTruthy();
    const skillCard = [...document.querySelectorAll('.card')].find(
      (c) => c.className.includes('skill') && !c.className.includes('disabled'),
    ) as HTMLElement | undefined;
    if (skillCard) {
      skillCard.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      skillCard.dispatchEvent(new Event('pointerup', { bubbles: true }));
      await tick();
    }
    expect(document.querySelector('.combat-screen')).toBeTruthy();
  });

  it('禁用卡牌（能量不足）点击只弹详情，不消失', async () => {
    const { initGameApp } = await import('../src/view/main');
    initGameApp();
    const startBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('开始新旅程'))!;
    startBtn.click();
    await tick();
    (document.querySelector('.class-card') as HTMLElement).click(); // 人物：水千夏
    await tick();
    (document.querySelector('.class-card') as HTMLElement).click(); // 职业
    await tick();
    [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('出发'))!.click();
    await tick();
    for (let i = 0; i < 6; i++) {
      const node = document.querySelector('.map-node.reachable') as HTMLElement | null;
      if (!node) break;
      node.click();
      await tick();
      if (document.querySelector('.combat-screen')) break;
    }
    expect(document.querySelector('.combat-screen')).toBeTruthy();
    // 找一个费用高于当前能量的禁用卡（若有）
    const disabledCard = [...document.querySelectorAll('.card.disabled')].find((c) => c.className.includes('card')) as HTMLElement | undefined;
    if (disabledCard) {
      const countBefore = document.querySelectorAll('.hand .card').length;
      disabledCard.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      await tick(); // 长按超时阈值 400ms
      disabledCard.dispatchEvent(new Event('pointerup', { bubbles: true }));
      await tick();
      // 弹出了详情弹窗
      expect(document.querySelector('.modal-overlay')).toBeTruthy();
      expect(document.querySelectorAll('.hand .card').length).toBe(countBefore); // 手牌仍在
    }
  });

  it('天枢星盘：解锁并装配大天赋', async () => {
    // 预置星魂碎片
    const { saveProfile, loadProfile, DEFAULT_PROFILE } = await import('../src/core/profile');
    const p = { ...DEFAULT_PROFILE, soulEmbers: 500 };
    saveProfile(p);
    const { initGameApp } = await import('../src/view/main');
    initGameApp();
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('天枢星盘'));
    expect(btn).toBeTruthy();
    btn!.click();
    await tick();
    expect(document.querySelector('.keystone-grid')).toBeTruthy();
    // 点击第一个大天赋解锁
    const card = document.querySelector('.keystone-card') as HTMLElement | null;
    expect(card).toBeTruthy();
    card!.click();
    await tick();
    const after = loadProfile();
    expect(after.unlockedKeystones.length).toBe(1);
    // 装配它
    const equippedCard = document.querySelector('.keystone-card.unlocked') as HTMLElement | null;
    expect(equippedCard).toBeTruthy();
    equippedCard!.click();
    await tick();
    const after2 = loadProfile();
    expect((after2.equipped[aferClass(after2.unlockedKeystones[0])] ?? []).length).toBeGreaterThan(0);
  });

  it('Boss 节点可点击进入战斗', async () => {
    const { initGameApp } = await import('../src/view/main');
    const app = initGameApp();
    const startBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('开始新旅程'))!;
    startBtn.click();
    await tick();
    (document.querySelector('.class-card') as HTMLElement).click(); // 人物：水千夏
    await tick();
    (document.querySelector('.class-card') as HTMLElement).click(); // 职业
    await tick();
    [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('出发'))!.click();
    await tick();
    expect(document.querySelector('.map-screen')).toBeTruthy();
    // 直接操纵状态：模拟玩家已到达第 14 层营地（Boss 前一层，必连 Boss）
    const run = app.ctx!.run;
    const map = run.state.map;
    const parent = map.layers[14][0];
    map.nodesById.get(parent.id)!.visited = true;
    run.state.currentNodeId = parent.id;
    computeReachability(map, parent.id);
    app.save();
    app.routeToRun();
    await tick();
    // 回到地图后 Boss 应可达
    expect(document.querySelector('.map-screen')).toBeTruthy();
    const bossNode = [...document.querySelectorAll('.map-node')].find((n) => n.className.includes('type-boss')) as HTMLElement | undefined;
    expect(bossNode, 'Boss 节点应存在').toBeTruthy();
    expect(bossNode!.className).toContain('reachable');
    bossNode!.click();
    await tick();
    expect(document.querySelector('.combat-screen'), '点击 Boss 应进入战斗').toBeTruthy();
  });
});

function aferClass(keystoneId: string): string {
  if (keystoneId.startsWith('k1_')) return 'hero_sylvanguard';
  if (keystoneId.startsWith('k2_')) return 'hero_thunderblade';
  return 'hero_aegis_knight';
}
