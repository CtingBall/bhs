// ============================================================================
// E2E 冒烟测试：用 Playwright 打开构建产物，模拟真实玩家点击流程
// 覆盖：file:// 双击运行 / 选人 / 地图 / 进入战斗 / 出牌 / 结束回合
// 运行：node e2e/smoke.mjs
// ============================================================================

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = 'file:///' + path.resolve(__dirname, '../dist/index.html').replace(/\\/g, '/');
const SHOTS = path.join(__dirname, 'shots');
mkdirSync(SHOTS, { recursive: true });

const errors = [];
const log = (...a) => console.log('[e2e]', ...a);

function assert(cond, msg) {
  if (!cond) throw new Error('断言失败: ' + msg);
  log('  ✓', msg);
}

// 优先使用系统 Edge/Chrome（免下载），否则回退 playwright 自带 Chromium
async function launchBrowser() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const exe of candidates) {
    try {
      if (existsSync(exe)) {
        log(`使用系统浏览器: ${exe}`);
        return await chromium.launch({ headless: true, executablePath: exe });
      }
    } catch { /* try next */ }
  }
  log('使用 playwright 内置 Chromium');
  return await chromium.launch({ headless: true });
}

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 960, height: 760 } });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

async function shot(name) {
  await page.screenshot({ path: path.join(SHOTS, name + '.png') });
}

try {
  log('1. 打开 file:// 构建产物（双击场景）');
  await page.goto(DIST, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  assert(await page.locator('.title-logo').count() > 0, '标题画面渲染');
  assert((await page.locator('.title-logo').first().textContent())?.includes('薄荷色氏族公约'), '标题文案正确');
  await shot('01-title');

  log('2. 选择人物（水千夏）→ 选择职业 → 出发');
  await page.getByText('开始新旅程', { exact: false }).first().click();
  await page.waitForTimeout(400);
  // 人物选择画面
  assert(await page.getByText('选择你的同行者', { exact: false }).count() > 0, '人物选择画面渲染');
  assert((await page.locator('.class-card').first().textContent())?.includes('水千夏'), '第一位人物为水千夏');
  // 人物立绘已加载（data URI 内联，无需网络）
  const portrait = page.locator('.char-portrait').first();
  const pw = await portrait.evaluate((el) => (el).naturalWidth);
  assert(pw > 0, `人物立绘已加载（宽 ${pw}px）`);
  await shot('02-character');
  await page.locator('.class-card').first().click(); // 水千夏
  await page.waitForTimeout(300);
  assert(await page.locator('.class-card').count() >= 9, '职业选择画面渲染（9 职业）');
  await page.locator('.class-card').first().click(); // 第一个职业
  await page.waitForTimeout(200);
  await shot('03-class');
  await page.getByText('出发！', { exact: false }).first().click();
  await page.waitForTimeout(600);
  assert(await page.locator('.map-screen').count() > 0, '进入地图画面');
  await shot('04-map');

  log('3. 点击可达节点，进入战斗');
  // 起点节点自动通过，再点一次才是战斗节点
  for (let i = 0; i < 4; i++) {
    if (await page.locator('.combat-screen').count() > 0) break;
    const node = page.locator('.map-node.reachable').first();
    if (await node.count() === 0) break;
    await node.click({ force: true });
    await page.waitForTimeout(500);
  }
  assert(await page.locator('.combat-screen').count() > 0, '进入战斗画面');
  await page.waitForTimeout(500);
  assert(await page.locator('.card').count() > 0, '手牌已渲染');
  assert(await page.locator('.enemy').count() > 0, '敌人已渲染');
  // 核心资源标注：HP 标签 / 能量标签 / 职业专属资源槽贴玩家
  assert(await page.locator('.player-hp-row .res-label').count() > 0, '生命值已标注（❤️）');
  assert(await page.locator('.energy-label').count() > 0, '能量已标注（⚡）');
  assert(await page.locator('.player-zone .class-widget').count() > 0, '职业专属资源槽紧贴玩家单位');
  await shot('05-combat');

  log('4. 打出第一张可出的牌');
  // 找一张可点击（未 disabled）的卡牌
  const playable = page.locator('.card:not(.disabled)').first();
  await playable.click();
  await page.waitForTimeout(300);
  await shot('06-play');

  log('5. 结束回合，跑 3 个回合验证稳定');
  for (let r = 0; r < 3; r++) {
    const end = page.locator('.end-turn-btn').first();
    if (await end.count() > 0 && await end.isEnabled()) {
      await end.click();
      await page.waitForTimeout(300);
      // 二级确认弹窗
      const confirm = page.locator('.modal-actions button').filter({ hasText: '确定' });
      if (await confirm.count() > 0) await confirm.click();
      await page.waitForTimeout(600);
    }
    await shot('07-turn' + r);
  }

  log('6. 检查控制台错误');
  const realErrors = errors.filter((e) => !e.includes('favicon'));
  if (realErrors.length > 0) {
    log('  发现错误:');
    for (const e of realErrors) log('   ', e);
    throw new Error('存在控制台错误');
  }
  assert(realErrors.length === 0, '无 pageerror / console.error');

  log('');
  log('✅ E2E 冒烟测试全部通过');
  await browser.close();
  process.exit(0);
} catch (err) {
  await shot('99-failure');
  log('❌ 失败:', err.message);
  if (errors.length) { log('控制台错误汇总:'); errors.forEach((e) => log('  ', e)); }
  await browser.close();
  process.exit(1);
}
