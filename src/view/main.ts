// ============================================================================
// 应用入口与屏幕路由（App Shell）
// ============================================================================

import './styles.css';
import { el, clear, on, modal } from './dom';
import { sfx, unlockAudio } from './audio';
import '../content/index';
import { Run } from '../core/run';
import { CLASS_REGISTRY, getClassDef } from '../content/classes';
import { getCardDef } from '../core/cards';
import { saveRun, loadRun, hasSave, clearSave } from '../core/save';
import { renderMapScreen } from './mapView';
import { renderCombatScreen } from './combatView';
import type { Combat } from '../core/combat';
import { openEncounter } from '../core/encounter';
import { renderEncounterScreen } from './screens';
import { renderRewardScreen, renderSummaryScreen } from './screens';
import { toast } from './dom';
import { renderKeystoneScreen, equippedKeystones, currentAscension } from './keystoneScreen';
import { ASCENSION_NAMES } from '../content/ascension';
import { loadProfile, saveProfile, awardEmbers, recordRunResult } from '../core/profile';
import { importModFromFile } from '../content/modLoader';
import { CHARACTER_REGISTRY, getCharacterDef, type CharacterDef } from '../content/characters';
import { getRelicDef } from '../content/relics';
import qianxiaArt from '../assets/qianxia.png';

/** 人物立绘映射（charId → 图片 URL；占位人物用图标兜底） */
const CHARACTER_ART: Record<string, string> = {
  char_qianxia: qianxiaArt,
};

export type Difficulty = 'normal' | 'ascension';

/** UTC 日期键（每日挑战种子） */
export function todayKey(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/** 遗物显示名（按 id 查注册表，找不到则回退为原始 id） */
function relicName(id: string): string {
  try {
    return getRelicDef(id).name;
  } catch {
    return id;
  }
}

export interface AppContext {
  run: Run;
  difficulty: Difficulty;
}

export class GameApp {
  root: HTMLElement;
  ctx: AppContext | null = null;
  combat: Combat | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    document.addEventListener('pointerdown', unlockAudio);
  }

  // ---------------------------------------------------------------------------
  // 屏幕渲染
  // ---------------------------------------------------------------------------

  show(screen: HTMLElement): void {
    clear(this.root);
    this.root.appendChild(screen);
  }

  titleScreen(): void {
    const s = el('div', 'screen title-screen');
    s.appendChild(el('div', 'title-logo', '薄荷色氏族公约'));
    s.appendChild(el('div', 'title-sub', '—— 聊天记录里长出来的肉鸽卡牌爬塔 ——'));
    const actions = el('div', 'title-actions');

    const btnNew = el('button', 'btn btn-primary', '✦ 开始新旅程');
    on(btnNew, 'click', () => {
      sfx.click();
      this.characterSelectScreen();
    });
    actions.appendChild(btnNew);

    // 每日挑战：以 UTC 日期为种子，全球玩家同一局（设计文档 6.3 静态确定性）
    const btnDaily = el('button', 'btn btn-gold', `🌞 每日挑战（${todayKey()}）`);
    on(btnDaily, 'click', () => {
      sfx.click();
      this.characterSelectScreen(`daily-${todayKey()}`);
    });
    actions.appendChild(btnDaily);

    // 天枢星盘（局外大天赋）
    const btnKeystone = el('button', 'btn', '🌀 天枢星盘');
    on(btnKeystone, 'click', () => {
      sfx.click();
      renderKeystoneScreen(this, () => this.titleScreen());
    });
    actions.appendChild(btnKeystone);

    // Mod 热加载
    const btnMod = el('button', 'btn', '🧩 导入 Mod');
    on(btnMod, 'click', () => {
      sfx.click();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const result = await importModFromFile(file);
        if (result.ok) {
          toast(`✅ Mod 导入成功：新增 ${result.added} 张卡牌（已加入各职业卡池）`);
        } else {
          toast(`❌ Mod 导入失败：${result.errors.slice(0, 3).join('；')}`);
        }
      };
      input.click();
    });
    actions.appendChild(btnMod);

    const btnContinue = el('button', 'btn', hasSave() ? '继续旅程' : '（无存档）');
    btnContinue.disabled = !hasSave();
    on(btnContinue, 'click', () => {
      sfx.click();
      const snap = loadRun();
      if (!snap) { toast('存档读取失败'); return; }
      const run = new Run(snap);
      this.ctx = { run, difficulty: (snap.flags['difficulty'] as Difficulty) ?? 'normal' };
      this.routeToRun();
    });
    actions.appendChild(btnContinue);

    const seedInput = el('input', 'title-seed') as HTMLInputElement;
    seedInput.placeholder = '输入种子字符串（可复现同一局）';
    seedInput.style.cssText = 'background:#121826;border:1px solid var(--line);border-radius:10px;padding:12px;color:var(--text);font-size:14px;text-align:center;';
    actions.appendChild(seedInput);
    const btnSeed = el('button', 'btn', '🎲 以种子开局');
    on(btnSeed, 'click', () => {
      sfx.click();
      const seed = seedInput.value.trim() || undefined;
      this.classSelectScreen(seed);
    });
    actions.appendChild(btnSeed);

    s.appendChild(actions);
    s.appendChild(el('div', 'title-sub', 'v0.1.0 · 首版垂直切片 · 数据驱动无头引擎'));
    this.show(s);
  }

  /** 人物选择（开局选角色获得固定效果/遗物） */
  characterSelectScreen(seed?: string): void {
    const s = el('div', 'screen');
    s.appendChild(el('div', 'title-logo', '选择你的同行者'));
    s.appendChild(el('div', 'title-sub', '每位人物都会带来一项固定的效果（专属遗物），并陪伴你整局爬塔'));
    const grid = el('div', 'class-grid');
    for (const def of CHARACTER_REGISTRY.values()) {
      const card = el('div', `class-card${def.unlocked ? '' : ' locked'}`);
      if (!def.unlocked) card.style.opacity = '0.45';
      // 人物立绘（占位人物无图时显示图标）
      const art = CHARACTER_ART[def.id];
      if (art) {
        const img = el('img', 'char-portrait') as HTMLImageElement;
        img.src = art;
        img.alt = def.name;
        card.appendChild(img);
      } else {
        card.appendChild(el('div', 'char-portrait char-portrait-fallback', def.icon));
      }
      card.appendChild(el('div', 'class-name', `${def.icon} ${def.name}`));
      card.appendChild(el('div', 'class-title', def.title));
      card.appendChild(el('div', 'class-desc', def.desc));
      const gift = el('div', 'stat-pill', `🎁 ${def.unlocked ? relicName(def.relicId) : '敬请期待'}`);
      gift.style.marginTop = '8px';
      card.appendChild(gift);
      const loreBtn = el('button', 'btn', '📖 人物小传');
      loreBtn.style.cssText = 'margin-top:10px;width:100%;font-size:13px;padding:8px;';
      on(loreBtn, 'click', (e) => {
        e.stopPropagation();
        sfx.click();
        this.openCharacterDetail(def);
      });
      card.appendChild(loreBtn);
      if (def.unlocked) {
        on(card, 'click', () => {
          sfx.click();
          this.classSelectScreen(seed, def.id);
        });
      }
      grid.appendChild(card);
    }
    s.appendChild(grid);
    const back = el('button', 'btn', '← 返回');
    back.style.width = 'min(300px, 80vw)';
    on(back, 'click', () => { sfx.click(); this.titleScreen(); });
    s.appendChild(back);
    this.show(s);
  }

  classSelectScreen(seed?: string, character?: string): void {
    const s = el('div', 'screen');
    s.appendChild(el('div', 'title-logo', '选择你的职业'));
    s.appendChild(el('div', 'title-sub', '每个职业拥有专属资源与两条流派路线'));
    if (character) {
      const chip = el('div', 'stat-pill', `同行者：${getCharacterDef(character).icon} ${getCharacterDef(character).name}（${getCharacterDef(character).title}）`);
      chip.style.cssText = 'margin:0 auto 14px;display:inline-block;padding:8px 14px;background:rgba(255,215,0,.12);border:1px solid rgba(255,215,0,.4);';
      s.appendChild(chip);
    }
    const grid = el('div', 'class-grid');
    let selected = '';
    const classIds = [...CLASS_REGISTRY.keys()];

    for (const id of classIds) {
      const cls = getClassDef(id);
      const card = el('div', 'class-card');
      card.appendChild(el('div', 'class-name', cls.name));
      card.appendChild(el('div', 'class-title', cls.title));
      card.appendChild(el('div', 'class-desc', cls.desc));
      const stats = el('div', 'class-stats');
      stats.appendChild(el('span', 'stat-pill', `❤️ ${cls.maxHp}`));
      stats.appendChild(el('span', 'stat-pill', `⚡ ${cls.maxEnergy} 能量`));
      stats.appendChild(el('span', 'stat-pill', `🃏 每回合抽 ${cls.handLimit} 张（手牌无上限）`));
      for (const res of cls.resources) {
        stats.appendChild(el('span', 'stat-pill', `${res.icon} ${res.name} ${res.max}`));
      }
      card.appendChild(stats);
      const detailBtn = el('button', 'btn', '📖 职业详情');
      detailBtn.style.cssText = 'margin-top:10px;width:100%;font-size:13px;padding:8px;';
      on(detailBtn, 'click', (e) => {
        e.stopPropagation();
        sfx.click();
        this.openClassDetail(id);
      });
      card.appendChild(detailBtn);
      on(card, 'click', () => {
        sfx.click();
        grid.querySelectorAll('.class-card').forEach((n) => n.classList.remove('selected'));
        card.classList.add('selected');
        selected = id;
      });
      grid.appendChild(card);
    }
    s.appendChild(grid);

    const startBtn = el('button', 'btn btn-primary', '⚔️ 出发！');
    startBtn.style.width = 'min(300px, 80vw)';
    const ascNow = currentAscension();
    if (ascNow > 0) startBtn.textContent = `⚔️ 出发（${ASCENSION_NAMES[ascNow]}）`;
    if (character) startBtn.textContent += ` · ${getCharacterDef(character).name}`;
    on(startBtn, 'click', () => {
      if (!selected) { toast('请先选择一个职业'); return; }
      sfx.click();
      const keystones = equippedKeystones(selected);
      const run = Run.newRun(selected, seed, { keystones, ascension: ascNow, character });
      run.state.flags['difficulty'] = 'normal';
      this.ctx = { run, difficulty: 'normal' };
      this.routeToRun();
    });
    s.appendChild(startBtn);
    this.show(s);
  }

  /** 职业详情面板：武器/资源/流派/初始牌组/营地祭仪 */
  openClassDetail(classId: string): void {
    const cls = getClassDef(classId);
    const body = el('div', 'class-detail');
    body.appendChild(el('div', 'panel-text', `武器：${cls.weapon}`));
    body.appendChild(el('div', 'panel-text', cls.desc));
    const resTitle = el('div', 'detail-h', '✨ 专属资源');
    body.appendChild(resTitle);
    for (const res of cls.resources) {
      const r = el('div', 'detail-row');
      r.appendChild(el('span', 'detail-k', `${res.icon} ${res.name}（上限 ${res.max}）`));
      r.appendChild(el('span', 'detail-v', res.desc));
      body.appendChild(r);
    }
    const deckTitle = el('div', 'detail-h', '🃏 初始牌组（10 张）');
    body.appendChild(deckTitle);
    const deckGrid = el('div', 'deck-grid');
    for (const defId of cls.starterDeck) {
      const def = getCardDef(defId);
      const node = el('div', `card large ${def.cardType.toLowerCase()}`);
      node.appendChild(el('div', `cost${def.baseCost === 0 ? ' zero' : ''}`, String(def.baseCost)));
      const ctype = def.cardType === 'Attack' ? '🗡️' : def.cardType === 'Skill' ? '🛡️' : def.cardType === 'Power' ? '✨' : '☠️';
      node.appendChild(el('div', 'ctype', ctype));
      node.appendChild(el('div', 'cname', def.name));
      const desc = el('div', 'cdesc');
      desc.innerHTML = def.description.replace(/(\d+(?:\.\d+)?)/g, '<span class="num">$1</span>');
      node.appendChild(desc);
      deckGrid.appendChild(node);
    }
    body.appendChild(deckGrid);
    const ritual = el('div', 'detail-row');
    ritual.appendChild(el('span', 'detail-k', `🔥 ${cls.campRitual.name}`));
    ritual.appendChild(el('span', 'detail-v', cls.campRitual.desc));
    body.appendChild(ritual);
    modal(`【${cls.name}】${cls.title}`, body, [{ label: '关闭' }]);
  }

  /** 人物详情面板：小传 + 专属遗物说明 */
  openCharacterDetail(def: CharacterDef): void {
    const body = el('div', 'class-detail');
    const art = CHARACTER_ART[def.id];
    if (art) {
      const img = el('img', 'char-portrait-large') as HTMLImageElement;
      img.src = art;
      img.alt = def.name;
      body.appendChild(img);
    }
    const head = el('div', 'detail-h', `${def.icon} ${def.name} — ${def.title}`);
    head.style.fontSize = '16px';
    body.appendChild(head);
    body.appendChild(el('div', 'panel-text', def.desc));
    const loreTitle = el('div', 'detail-h', '📜 人物小传');
    body.appendChild(loreTitle);
    body.appendChild(el('div', 'panel-text', def.lore));
    if (def.relicId) {
      const relicTitle = el('div', 'detail-h', `🎁 专属遗物：${relicName(def.relicId)}`);
      body.appendChild(relicTitle);
      const relic = getRelicDef(def.relicId);
      const r = el('div', 'detail-row');
      r.appendChild(el('span', 'detail-k', `${relic.icon} ${relic.rarity}`));
      r.appendChild(el('span', 'detail-v', relic.desc));
      body.appendChild(r);
    } else {
      body.appendChild(el('div', 'panel-text', '🎁 专属遗物：敬请期待（后续版本开放）'));
    }
    modal(`【${def.name}】`, body, [{ label: '关闭' }]);
  }

  /** 根据当前节点类型路由 */
  routeToRun(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const run = ctx.run;
    if (run.state.victory) { this.summaryScreen(); return; }
    if (run.state.defeat) { this.summaryScreen(); return; }

    const node = run.currentNode;
    if (!node || node.visited) {
      // 地图选择阶段（节点已完成或尚未选择）
      run.state.currentNodeId = null;
      renderMapScreen(this);
      return;
    }
    const pendingCombat = run.state.flags['pendingSpecialCombat'] !== undefined;
    if (node.type === 'monster' || node.type === 'elite' || node.type === 'boss' || pendingCombat) {
      this.startCombatFlow();
    } else {
      const encounter = openEncounter(run, node);
      renderEncounterScreen(this, encounter);
    }
  }

  startCombatFlow(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const run = ctx.run;
    // 进阶难度修正已在 run.startCombat 内应用（大天赋/遗物/词缀）
    const combat = run.startCombat((ev) => {
      renderCombatScreen(this, ev);
    });
    this.combat = combat;
    renderCombatScreen(this, null);
    this.save();
  }

  /** 战斗结束后的奖励流程 */
  onCombatEnded(): void {
    const ctx = this.ctx;
    if (!ctx || !this.combat) return;
    const reward = ctx.run.onCombatEnd();
    this.save();
    if (ctx.run.state.defeat) {
      this.summaryScreen();
      return;
    }
    renderRewardScreen(this, reward);
  }

  /** 返回地图 */
  goMap(): void {
    this.combat = null;
    this.save();
    this.routeToRun();
  }

  /** 接受卡牌三选一 */
  acceptDraft(cardId: string): void {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.run.acceptDraft(cardId);
    this.goMap();
  }

  skipDraft(): void {
    this.goMap();
  }

  /** 接受首领遗物三选一 */
  acceptBossRelic(relicId: string): void {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.run.addRelic(relicId);
    this.goMap();
  }

  /** 结算页（含星魂碎片结算） */
  summaryScreen(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    // 单局结算：产出星魂碎片 + 记录统计（每局一次）
    if (ctx.run.state.flags['embersAwarded'] !== true) {
      ctx.run.state.flags['embersAwarded'] = true;
      const profile = loadProfile();
      const victory = ctx.run.state.victory === true;
      const gained = awardEmbers(profile, victory, ctx.run.state.act, ctx.run.ascensionLevel);
      recordRunResult(profile, victory, ctx.run.ascensionLevel);
      saveProfile(profile);
      ctx.run.state.flags['embersGained'] = gained;
    }
    renderSummaryScreen(this);
  }

  save(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.run.state.flags['difficulty'] = ctx.difficulty;
    saveRun(ctx.run.toSnapshot());
  }

  /** 重开 */
  restart(): void {
    clearSave();
    this.titleScreen();
  }
}

/** 初始化并启动应用（可重复调用：测试用） */
export function initGameApp(): GameApp {
  const root = document.getElementById('app');
  if (!root) throw new Error('#app 元素不存在');
  const app = new GameApp(root);
  (window as unknown as { __app?: GameApp }).__app = app;
  app.titleScreen();
  // PWA 离线注册：仅生产构建注册（http 部署）；开发模式不注册，
  // 并注销可能残留的旧 Service Worker，避免缓存优先策略让 dev 显示陈旧内容
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register('./sw.js').catch(() => { /* 静默 */ });
    } else {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => { /* 静默 */ });
    }
  }
  return app;
}

// 生产入口：DOM 就绪后自动启动
if (document.getElementById('app')) {
  initGameApp();
}
