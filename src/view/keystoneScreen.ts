// ============================================================================
// 天枢星盘（局外大天赋配置界面）
// 星魂碎片经济 / 槽位阶梯 / 大天赋解锁与自由装配
// ============================================================================

import { el, on } from './dom';
import { sfx } from './audio';
import type { GameApp } from './main';
import {
  loadProfile, saveProfile, maxKeystoneSlots, toggleEquip,
} from '../core/profile';
import { keystonesForClass } from '../content/keystones';
import { CLASS_REGISTRY, getClassDef } from '../content/classes';
import { ASCENSION_NAMES, ASCENSION_DESCS } from '../content/ascension';
import { toast } from './dom';

export function renderKeystoneScreen(app: GameApp, back: () => void): void {
  const profile = loadProfile();
  let selectedClass = [...CLASS_REGISTRY.keys()][0];

  const s = el('div', 'screen');
  const panel = el('div', 'panel');
  panel.style.width = 'min(720px, 96vw)';

  const rerender = (): void => {
    clearPanel(panel);

    // 顶部：碎片 + 槽位
    const slots = maxKeystoneSlots(profile);
    const header = el('div');
    header.appendChild(el('div', 'panel-title', '天枢星盘'));
    const embers = el('div', 'class-stats', '');
    embers.style.justifyContent = 'center';
    embers.appendChild(el('span', 'stat-pill', `✨ 星魂碎片：${profile.soulEmbers}`));
    embers.appendChild(el('span', 'stat-pill', `🔓 天赋槽位：${slots} / 5`));
    header.appendChild(embers);
    // 槽位解锁说明
    const slotHint = el('div', 'detail-v', '槽位：初始 1 → 击败第 1 章 Boss +1 → 首次通关 +1 → 进阶 V +1 → 进阶 X +1');
    slotHint.style.textAlign = 'center';
    header.appendChild(slotHint);
    panel.appendChild(header);

    // 职业切换
    const classRow = el('div', 'class-stats', '');
    classRow.style.justifyContent = 'center';
    for (const id of CLASS_REGISTRY.keys()) {
      const cls = getClassDef(id);
      const b = el('button', 'btn', cls.name);
      if (id === selectedClass) b.classList.add('btn-primary');
      on(b, 'click', () => { sfx.click(); selectedClass = id; rerender(); });
      classRow.appendChild(b);
    }
    panel.appendChild(classRow);

    // 大天赋网格
    const keystones = keystonesForClass(selectedClass);
    const equipped = profile.equipped[selectedClass] ?? [];
    const grid = el('div', 'keystone-grid');
    for (const ks of keystones) {
      const unlocked = profile.unlockedKeystones.includes(ks.id);
      const isEquipped = equipped.includes(ks.id);
      const box = el('div', `keystone-card ${unlocked ? 'unlocked' : 'locked'}${isEquipped ? ' equipped' : ''}`);
      const catName = ks.category === 'Universal' ? '通用' : ks.category === 'SpecA' ? '流派 A' : '流派 B';
      box.appendChild(el('div', 'ks-cat', catName));
      box.appendChild(el('div', 'ks-name', ks.name));
      box.appendChild(el('div', 'ks-desc', ks.desc));
      if (!unlocked) {
        box.appendChild(el('div', 'ks-cost', `✨ ${ks.unlockCost} 解锁`));
      } else {
        box.appendChild(el('div', 'ks-status', isEquipped ? '✔ 已装配' : '未装配'));
      }
      on(box, 'click', () => {
        sfx.click();
        if (!unlocked) {
          if (profile.soulEmbers >= ks.unlockCost) {
            profile.soulEmbers -= ks.unlockCost;
            profile.unlockedKeystones.push(ks.id);
            saveProfile(profile);
            toast(`解锁【${ks.name}】`);
          } else {
            toast('星魂碎片不足');
          }
        } else {
          const ok = toggleEquip(profile, selectedClass, ks.id, slots);
          saveProfile(profile);
          toast(ok ? `装配【${ks.name}】` : equipped.includes(ks.id) ? `卸下【${ks.name}】` : '槽位已满');
        }
        rerender();
      });
      grid.appendChild(box);
    }
    panel.appendChild(grid);

    // 进阶难度选择
    const ascTitle = el('div', 'detail-h', '⚙️ 进阶难度（出发前选择，影响整局）');
    panel.appendChild(ascTitle);
    const ascRow = el('div', 'class-stats', '');
    ascRow.style.justifyContent = 'center';
    ascRow.style.flexWrap = 'wrap';
    for (let lv = 0; lv <= 10; lv++) {
      const b = el('button', 'btn', ASCENSION_NAMES[lv]);
      if (lv === profile.ascensionLevel) b.classList.add('btn-gold');
      if (lv > 0 && lv % 2 === 1) b.style.marginTop = '4px';
      on(b, 'click', () => { sfx.click(); profile.ascensionLevel = lv; saveProfile(profile); toast(ASCENSION_DESCS[lv]); rerender(); });
      ascRow.appendChild(b);
    }
    panel.appendChild(ascRow);
    const ascDesc = el('div', 'detail-v', ASCENSION_DESCS[profile.ascensionLevel]);
    ascDesc.style.textAlign = 'center';
    panel.appendChild(ascDesc);

    // 底部按钮
    const actions = el('div', 'modal-actions');
    const btnBack = el('button', 'btn', '← 返回');
    on(btnBack, 'click', () => { sfx.click(); back(); });
    actions.appendChild(btnBack);
    const btnGo = el('button', 'btn btn-primary', '⚔️ 出发（应用装配）');
    on(btnGo, 'click', () => {
      sfx.click();
      saveProfile(profile);
      back();
    });
    actions.appendChild(btnGo);
    panel.appendChild(actions);
  };

  rerender();
  s.appendChild(panel);
  app.show(s);
}

function clearPanel(panel: HTMLElement): void {
  while (panel.firstChild) panel.removeChild(panel.firstChild);
}

/** 供其他界面读取当前装配（每局开始时调用） */
export function equippedKeystones(classId: string): string[] {
  const profile = loadProfile();
  return profile.equipped[classId] ?? [];
}

export function currentAscension(): number {
  return loadProfile().ascensionLevel;
}
