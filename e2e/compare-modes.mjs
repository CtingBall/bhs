// Compare dev-mode vs built-mode character card rendering
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(__dirname, 'shots'), { recursive: true });

async function launchBrowser() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const exe of candidates) {
    try { if (existsSync(exe)) return await chromium.launch({ headless: true, executablePath: exe }); } catch { }
  }
  return await chromium.launch({ headless: true });
}

async function inspect(url, tag) {
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1000, height: 820 } });
  const errors = [];
  const failed = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', (r) => failed.push(r.url() + ' :: ' + (r.failure()?.errorText ?? '')));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  await page.getByText('开始新旅程', { exact: false }).first().click();
  await page.waitForTimeout(600);

  const card = page.locator('.class-card').first();
  await card.screenshot({ path: path.join(__dirname, 'shots', `char-card-${tag}.png`), animations: 'disabled' });

  const portrait = card.locator('img.char-portrait').first();
  const info = await portrait.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      srcPrefix: (el.src || '').slice(0, 60),
      srcIsData: (el.src || '').startsWith('data:'),
      naturalW: el.naturalWidth, naturalH: el.naturalHeight,
      complete: el.complete,
      cssW: r.width, cssH: r.height,
      objectFit: getComputedStyle(el).objectFit,
      displayW: el.width, displayH: el.height,
    };
  });
  const imgCount = await page.locator('img.char-portrait').count();
  console.log(`[${tag}] img count=${imgCount}`, JSON.stringify(info));
  if (errors.length) console.log(`[${tag}] console errors:`, errors.slice(0, 5));
  if (failed.length) console.log(`[${tag}] failed requests:`, failed.slice(0, 5));
  await browser.close();
}

await inspect('http://localhost:5173/', 'dev');
const DIST = 'file:///' + path.resolve(__dirname, '../dist/index.html').replace(/\\/g, '/');
await inspect(DIST, 'build');
