// Render the real game, navigate to character select, capture the 水千夏 card
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = 'file:///' + path.resolve(__dirname, '../dist/index.html').replace(/\\/g, '/');
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

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1000, height: 820 } });
await page.goto(DIST, { waitUntil: 'load' });
await page.waitForTimeout(800);
await page.getByText('开始新旅程', { exact: false }).first().click();
await page.waitForTimeout(500);

// Full character select screen
await page.screenshot({ path: path.join(__dirname, 'shots', 'char-select-full.png') });

// The first card (水千夏)
const card = page.locator('.class-card').first();
await card.screenshot({ path: path.join(__dirname, 'shots', 'char-card-1.png') });

// The portrait image inside
const portrait = card.locator('img.char-portrait').first();
const info = await portrait.evaluate((el) => {
  const r = el.getBoundingClientRect();
  const img = el;
  return {
    cssW: r.width, cssH: r.height,
    naturalW: img.naturalWidth, naturalH: img.naturalHeight,
    objectFit: getComputedStyle(img).objectFit,
    objectPosition: getComputedStyle(img).objectPosition,
    displayW: img.width, displayH: img.height,
  };
});
console.log('PORTRAIT:', JSON.stringify(info));
await card.screenshot({ path: path.join(__dirname, 'shots', 'char-card-1.png'), animations: 'disabled' });
await browser.close();
