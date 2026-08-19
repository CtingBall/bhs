// Verify SW behavior: dev must NOT register SW; built over http MUST register the network-first SW
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// 1. Dev mode: no SW registration, image fresh
{
  const page = await browser.newPage({ viewport: { width: 1000, height: 820 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  const regs = await page.evaluate(() => navigator.serviceWorker.getRegistrations().then((rs) => rs.length));
  console.log('[dev] SW registrations:', regs, 'console errors:', errors.length);
  await page.getByText('开始新旅程', { exact: false }).first().click();
  await page.waitForTimeout(600);
  const img = page.locator('img.char-portrait').first();
  const ok = await img.evaluate((el) => el.complete && el.naturalWidth > 0);
  console.log('[dev] portrait loaded:', ok);
  await page.close();
}

// 2. Build over http (vite preview on 4173): SW must register (network-first)
{
  const page = await browser.newPage({ viewport: { width: 1000, height: 820 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://localhost:4173/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const regs = await page.evaluate(() => navigator.serviceWorker.getRegistrations().then((rs) => rs.map((r) => ({ scope: r.scope, active: !!r.active, scriptURL: r.active?.scriptURL ?? '' }))));
  console.log('[preview] SW:', JSON.stringify(regs), 'console errors:', errors.length);
  const controller = await page.evaluate(() => !!navigator.serviceWorker.controller);
  console.log('[preview] page controlled by SW:', controller);
  await page.close();
}

await browser.close();
