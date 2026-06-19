import { readFileSync, writeFileSync } from 'fs';

// ---- 数值范围（按稀有度+费用） ----
// 核心范围：每张卡的效果值必须在 [min, max] 之间
const RANGES = {
  basic:    { dmg: [6,8],   block: [5,7],   heal: [3,5]  },
  common:   { dmg: [8,14],  block: [6,10],  heal: [5,8]  },
  rare:     { dmg: [14,22], block: [8,14],  heal: [5,12] },
  epic:     { dmg: [22,38], block: [10,20], heal: [8,18] },
  legendary:{ dmg: [35,65], block: [15,30], heal: [10,25]},
};

const STATUS_RANGES = {
  basic:    [1,2],
  common:   [1,3],
  rare:     [2,5],
  epic:     [3,8],
  legendary:[4,14],
};

// 0费卡限制（所有0费攻击伤害≤8，0费技能效果≤对应范围50%）
const ZERO = { dmg: 8, block: 4, heal: 3, status: 2, energy: 1, draw: 1 };

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// 按稀有度+费用计算目标值：cost越高 → 值越接近范围上限
function targetValue(rarity, cost, kind) {
  const r = RANGES[rarity] || RANGES.common;
  let range;
  if (kind === 'damage' || kind === 'damageAll') range = r.dmg;
  else if (kind === 'block') range = r.block;
  else if (kind === 'heal') range = r.heal;
  else return 0;
  // cost 映射到 0-1 比例
  const maxCost = rarity === 'legendary' ? 5 : (rarity === 'epic' ? 3 : 2);
  const t = clamp(cost, 0, maxCost) / Math.max(1, maxCost);
  return Math.round(range[0] + (range[1] - range[0]) * t);
}

function targetStatus(rarity, cost) {
  const r = STATUS_RANGES[rarity] || STATUS_RANGES.common;
  const maxCost = rarity === 'legendary' ? 5 : (rarity === 'epic' ? 3 : 2);
  const t = clamp(cost, 0, maxCost) / Math.max(1, maxCost);
  return Math.round(r[0] + (r[1] - r[0]) * t * 0.6);
}

function transformCard(card) {
  const c = { ...card };
  const effects = c.effects.map(e => ({ ...e }));

  // -- Curse: cost=0, 负面效果 --
  if (c.type === 'curse') {
    c.rarity = 'common';
    c.cost = 0;
    c.effects = effects;
    c.text = genText(c);
    return c;
  }

  // -- 重新分级：保留已有稀有度，仅提升明显越界的 common --
  const oldRarity = c.rarity;
  let newRarity = c.rarity;
  if (oldRarity === 'common') {
    const totalDmg = effects.reduce((s, e) => {
      if (e.kind === 'damage' || e.kind === 'damageAll') return s + Math.abs(e.value || 0) * (e.hits || 1);
      return s;
    }, 0);
    if (totalDmg > 16) newRarity = 'rare';
  }
  c.rarity = newRarity;
  const rarity = newRarity;

  // -- 调整 cost --
  let cost = c.cost;
  if (rarity === 'basic') cost = clamp(cost, 0, 1);
  else if (rarity === 'common') cost = clamp(cost, 0, 2);
  else if (rarity === 'rare') cost = clamp(cost, 1, 2);
  else if (rarity === 'epic') cost = clamp(cost, 1, 3);
  else cost = clamp(cost, 2, 5); // legendary
  c.cost = cost;

  const isZero = cost === 0;
  const isSkill = c.type === 'skill';
  const isAttack = c.type === 'attack';

  // -- 调整效果值 --
  for (const e of effects) {
    const kind = e.kind;

    if (kind === 'damage' || kind === 'damageAll') {
      const rng = (RANGES[rarity] || RANGES.common).dmg;
      if (isZero && isAttack) {
        // 0费攻击卡：伤害≤8
        e.value = clamp(e.value || 0, Math.round(rng[0] * 0.3), ZERO.dmg);
      } else if (isZero && isSkill) {
        e.value = clamp(e.value || 0, Math.round(rng[0] * 0.2), ZERO.dmg);
      } else {
        const target = targetValue(rarity, cost, kind);
        e.value = clamp(e.value || target, rng[0], target);
      }
      // 多段攻击：每段值均衡
      if (e.hits && !isZero) {
        e.value = clamp(e.value, Math.round(rng[0] * 0.3), Math.round(rng[1] * 0.6));
      }
    }
    else if (kind === 'block') {
      const rng = (RANGES[rarity] || RANGES.common).block;
      if (isZero && isSkill) {
        e.value = clamp(e.value || 0, 1, ZERO.block);
      } else {
        const target = targetValue(rarity, cost, 'block');
        e.value = clamp(e.value || target, rng[0], target);
      }
    }
    else if (kind === 'heal') {
      const rng = (RANGES[rarity] || RANGES.common).heal;
      if (e.value < 0) {
        // 自伤：保持负值，不超过治疗上限的1.5倍
        e.value = Math.max(e.value, -Math.round(rng[1] * 1.5));
      } else {
        if (isZero && isSkill) {
          e.value = clamp(e.value || 0, 1, ZERO.heal);
        } else {
          const target = targetValue(rarity, cost, 'heal');
          e.value = clamp(e.value || target, rng[0], target);
        }
      }
    }
    else if (kind === 'applyStatus') {
      const rng = STATUS_RANGES[rarity] || STATUS_RANGES.common;
      if (isZero && isSkill) {
        e.value = clamp(e.value || 1, 1, ZERO.status);
      } else {
        const tgt = targetStatus(rarity, cost);
        e.value = clamp(e.value || tgt, rng[0], tgt);
      }
    }
    else if (kind === 'draw') {
      if (isZero) e.value = clamp(e.value || 1, 1, ZERO.draw);
      else e.value = clamp(e.value || 1, 1, 5);
    }
    else if (kind === 'energy') {
      if (isZero) e.value = clamp(e.value || 1, 1, ZERO.energy);
      else e.value = clamp(e.value || 1, 1, 4);
    }
    else if (kind === 'maxHp') {
      e.value = clamp(e.value || 1, 2, 12);
    }
  }

  c.effects = effects;
  c.text = genText(c);
  return c;
}

function genText(card) {
  const parts = [];
  for (const e of card.effects) {
    if (e.kind === 'damage') {
      parts.push(e.hits ? `造成 ${e.value} 点伤害 ${e.hits} 次` : `造成 ${e.value} 点伤害`);
    } else if (e.kind === 'damageAll') {
      parts.push(e.hits ? `对所有敌人造成 ${e.value} 点伤害 ${e.hits} 次` : `对所有敌人造成 ${e.value} 点伤害`);
    } else if (e.kind === 'block') {
      parts.push(`获得 ${e.value} 点格挡`);
    } else if (e.kind === 'heal') {
      parts.push(e.value < 0 ? `失去 ${-e.value} 点生命` : `回复 ${e.value} 点生命`);
    } else if (e.kind === 'applyStatus') {
      const sn = statusCN(e.status);
      const tgt = e.all ? '所有敌人' : (e.statusTarget === 'self' ? '自己' : '敌人');
      const layers = e.value === 1 ? ' 1 层' : ` ${e.value} 层`;
      if (e.statusTarget === 'self') {
        parts.push(`获得${layers}${sn}`);
      } else {
        parts.push(`对${tgt}施加${layers}${sn}`);
      }
    } else if (e.kind === 'draw') {
      parts.push(`抽 ${e.value} 张牌`);
    } else if (e.kind === 'energy') {
      parts.push(`获得 ${e.value} 点能量`);
    } else if (e.kind === 'maxHp') {
      parts.push(`最大生命 +${e.value}`);
    } else if (e.kind === 'summon') {
      const names = {
        'mum-head': '姆头（每回合获得 1 点能量）',
        'spider': '蜘蛛（每回合全体易伤 2）',
        'flyfish': '飞鱼（每回合获得 4 点格挡）',
        'boyce': '博伊斯（每回合对随机敌人造成 5 伤害）',
        'amber': '琥珀（每回合回复 3 点生命）',
      };
      parts.push(`召唤${names[e.summonId] || e.summonId}`);
    }
  }
  if (card.type === 'curse' && parts.length === 0) return '不可打出。占据你的手牌。';
  return parts.join('，') + '。';
}

function statusCN(s) {
  const m = {strength:'力量',dexterity:'敏捷',vuln:'易伤',weak:'虚弱',frail:'脆弱',freeze:'冰冻',burn:'燃烧',shock:'感电',regen:'再生'};
  return m[s] || s;
}

// ---- 解析 ----
function parse(content) {
  const mk = 'export const CARDS: Card[] = [';
  const st = content.indexOf(mk);
  if (st === -1) throw new Error('找不到 CARDS');
  const bodyStart = st + mk.length;
  let pos = bodyStart, depth = 1, inS = false, sc = '';
  while (depth > 0 && pos < content.length) {
    const ch = content[pos];
    if (inS) { if (ch === '\\') pos++; else if (ch === sc) inS = false; }
    else { if (ch === "'"||ch==='"'||ch==='`') { inS=true; sc=ch; } else if (ch==='[') depth++; else if (ch===']') depth--; }
    pos++;
  }
  const e = pos; // 包含 ]
  return {
    prefix: content.slice(0, bodyStart),
    suffix: content.slice(e),
    body: content.slice(bodyStart, e - 1),
  };
}

function main() {
  let content;
  try { content = readFileSync('src/data/cards.ts','utf-8'); }
  catch { content = readFileSync('d:/xhgm/bhs/src/data/cards.ts','utf-8'); }

  const { prefix, suffix, body } = parse(content);

  // 清理注释
  const clean = body.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const cleanF = clean.endsWith(',') ? clean.slice(0, -1) : clean;

  let cards;
  try { cards = new Function('return [' + cleanF + ']')(); }
  catch (e) {
    console.error('解析失败:', e.message);
    const m = e.message.match(/position (\d+)/);
    if (m) console.error('附近:', JSON.stringify(clean.slice(Math.max(0, +m[1]-80), +m[1]+80)));
    throw e;
  }
  console.log(`解析到 ${cards.length} 张卡牌`);

  const out = cards.map((c, i) => {
    try { return transformCard(c); }
    catch (e) { console.error(`#${i} ${c.id} 失败:`, e.message); return c; }
  });

  // 生成输出
  const SEC = {
    'iaido-strike': '  // ===== 通用基础攻击（各职业起手牌） =====',
    'mint-shield': '  // ===== 通用防御 / 辅助 =====',
    'iaido-flash': '  // ===== 进阶职业牌（稀有） =====',
    'summon-mum': '  // ===== 星痕召唤牌 =====',
    'red-bite': '  // ===== 群梗攻击牌 =====',
    'punish-dynasty-card': '  // ===== 传说卡 =====',
    'iaido-moonshadow': '  // ===== 进阶职业牌（稀有/史诗）·扩展 =====',
    'whetstone': '  // ===== 通用技能牌·扩展 =====',
    'hana-demon-atk': '  // ===== 群梗攻击牌·扩展 =====',
    'punish-dynasty-end': '  // ===== 传说/史诗卡·扩展 =====',
    'summon-amber-guard': '  // ===== 召唤牌·扩展 =====',
    'burn-out': '  // ===== 生命值体系（燃尽·血战·残血·不死） =====',
    'charge-up': '  // ===== 能量主题（充能·循环·爆发期） =====',
    'one-kick-kill': '  // ===== 强力单卡（一脚踢死·秒天秒地·不可战胜） =====',
    'light-resolve': '  // ===== 格挡主题（光盾·岩盾·防盾·决心循环） =====',
    'burn-art': '  // ===== 燃烧扩充（焚诀·星火·炎角·地火·无相火斩） =====',
    'useless-bug': '  // ===== 诅咒 =====',
    'icepearl-frost-spear': '  // ===== 冰矛·冰冻控制（50张） =====',
    'iaido-slash-plus': '  // ===== 居合·快速过牌（50张） =====',
    'twinaxe-chop': '  // ===== 双斧·连击体系（50张） =====',
    'thunder-bolt': '  // ===== 雷魔·电击爆发（50张） =====',
    'concerto-draw': '  // ===== 协奏·支援辅助（50张） =====',
    'light-guard': '  // ===== 主题1：光盾·防御反击（50张） =====',
    'flame-strike': '  // ===== 主题2：炎角·火焰爆发（50张） =====',
    'no-phase-fist': '  // ===== 主题3：无相·变身适应（50张） =====',
    'crimson-slash-common': '  // ===== 主题4：赤红·浴血奋战（50张） =====',
    'universal-block': '  // ===== 主题5：通用·灵活万用（50张） =====',
  };

  const lines = [prefix];
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (SEC[c.id]) { lines.push(''); lines.push(SEC[c.id]); }
    lines.push(fmtCard(c, i === out.length - 1));
  }
  lines.push('];');
  // 去掉后缀开头的多余分号
  const cleanSuffix = suffix.replace(/^[\s;]+/, '\n\n');
  lines.push(cleanSuffix);

  let op = 'src/data/cards.ts';
  try { writeFileSync(op, lines.join('\n'), 'utf-8'); }
  catch { op = 'd:/xhgm/bhs/src/data/cards.ts'; writeFileSync(op, lines.join('\n'), 'utf-8'); }

  console.log(`已生成 ${op}，共 ${out.length} 张`);

  const br = {};
  for (const c of out) br[c.rarity] = (br[c.rarity] || 0) + 1;
  console.log('稀有度分布:', br);
}

function fmtEff(e) {
  const p = [`kind: '${e.kind}'`];
  if (e.value !== undefined) p.push(`value: ${e.value}`);
  if (e.status) p.push(`status: '${e.status}'`);
  if (e.statusTarget) p.push(`statusTarget: '${e.statusTarget}'`);
  if (e.summonId) p.push(`summonId: '${e.summonId}'`);
  if (e.hits) p.push(`hits: ${e.hits}`);
  if (e.all) p.push(`all: true`);
  return `{ ${p.join(', ')} }`;
}

function fmtCard(c, isLast) {
  const ll = [];
  ll.push('  {');
  ll.push(`    id: '${c.id}',`);
  ll.push(`    name: '${c.name}',`);
  ll.push(`    type: '${c.type}',`);
  ll.push(`    rarity: '${c.rarity}',`);
  ll.push(`    cost: ${c.cost},`);
  ll.push(`    text: '${c.text}',`);
  if (c.flavor) ll.push(`    flavor: '${c.flavor}',`);

  if (c.effects.length === 0) {
    ll.push('    effects: [],');
  } else if (c.effects.length === 1) {
    ll.push(`    effects: [${fmtEff(c.effects[0])}],`);
  } else {
    ll.push('    effects: [');
    c.effects.forEach((e, i) => {
      ll.push(`      ${fmtEff(e)}${i < c.effects.length - 1 ? ',' : ','}`);
    });
    ll.push('    ],');
  }

  if (c.classId) ll.push(`    classId: '${c.classId}',`);

  // strip trailing comma on last property
  let last = ll[ll.length - 1];
  if (last.endsWith(',')) ll[ll.length - 1] = last.slice(0, -1);

  ll.push('  }' + (isLast ? '' : ','));
  return ll.join('\n');
}

main();
