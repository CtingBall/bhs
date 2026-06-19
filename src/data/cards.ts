import type { Card } from '@/types';

// 卡牌池：每张卡的文案均化用「薄荷色氏族公约」群聊梗
export const CARDS: Card[] = [

  // ===== 通用基础攻击（各职业起手牌） =====
  {
    id: 'iaido-strike',
    name: '居合斩',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害。',
    flavor: '「居合看技改」',
    effects: [{ kind: 'damage', value: 8 }],
    classId: 'iaido'
  },
  {
    id: 'twinaxe-spin',
    name: '双斧旋风',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害。',
    flavor: '「追幻想也太贵了」',
    effects: [{ kind: 'damage', value: 8 }],
    classId: 'twinaxe'
  },
  {
    id: 'icepearl-thrust',
    name: '冰矛刺',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 1 层冰冻。',
    flavor: '「星痕共鸣最忧郁的冰矛魔丸」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 1, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'thunder-strike',
    name: '雷魔击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害。',
    flavor: '「圣域飞鱼娘」',
    effects: [{ kind: 'damage', value: 8 }],
    classId: 'thunder'
  },
  {
    id: 'flame-charge',
    name: '炎角冲',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 2 层燃烧。',
    flavor: '「炎角」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'shield-bash',
    name: '光盾击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，造成 8 点伤害。',
    flavor: '「你是个光盾啊，你上 5.4 干什么」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'damage', value: 8 },
    ],
    classId: 'lightshield'
  },

  // ===== 通用防御 / 辅助 =====
  {
    id: 'mint-shield',
    name: '薄荷盾',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡。',
    flavor: '「薄荷色氏族公约」',
    effects: [{ kind: 'block', value: 6 }]
  },
  {
    id: 'team-heal',
    name: '团本 cos 奶',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '回复 6 点生命。',
    flavor: '「团本 cos 奶就是了」——沫',
    effects: [{ kind: 'heal', value: 6 }]
  },
  {
    id: 'intimidate',
    name: '激化带威慑',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '对所有敌人施加 2 层易伤。',
    flavor: '「激化带威慑，难度降一半」——fander',
    effects: [{ kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy', all: true }]
  },
  {
    id: 'chase-fantasy',
    name: '追幻想',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '抽 2 张牌。',
    flavor: '「追精炼不如追幻想」',
    effects: [{ kind: 'draw', value: 2 }]
  },
  {
    id: 'will-transfer',
    name: '意志转换',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '抽 1 张牌，获得 1 层力量。',
    flavor: '「意志转换」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'applyStatus', value: 1, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'consolidate',
    name: '化零为整',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 3 张牌。',
    flavor: '「化零为整」',
    effects: [{ kind: 'draw', value: 3 }],
    exhaust: true,
  },
  {
    id: 'sharpen',
    name: '磨刀',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 2 层力量。',
    flavor: '「弱的是职业不是玩家」——三百一十页',
    effects: [{ kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' }]
  },
  {
    id: 'evade',
    name: '闪避',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，抽 1 张牌。',
    flavor: '「爱玩啥玩啥」——夕',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'draw', value: 1 },
    ]
  },

  // ===== 进阶职业牌（稀有） =====
  {
    id: 'iaido-flash',
    name: '居合·一闪',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害。',
    flavor: '「5.6 居合」——维',
    effects: [{ kind: 'damage', value: 14 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-multislash',
    name: '居合·连斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 2 次。',
    flavor: '「拔刀再拔刀」',
    effects: [{ kind: 'damage', value: 13, hits: 2 }],
    classId: 'iaido'
  },
  {
    id: 'twinaxe-heavysplit',
    name: '双斧·重劈',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害。',
    flavor: '「一斧子下去」',
    effects: [{ kind: 'damage', value: 14 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-whirl',
    name: '双斧·旋风斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害。',
    flavor: '「抡起来转圈」',
    effects: [{ kind: 'damageAll', value: 14 }],
    classId: 'twinaxe'
  },
  {
    id: 'icepearl-freeze',
    name: '冰矛·冰封',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 2 层冰冻。',
    flavor: '「冻成冰雕」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-shard',
    name: '冰矛·冰锥',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层易伤，对敌人施加 2 层冰冻。',
    flavor: '「碎冰」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'thunder-storm',
    name: '雷魔·雷暴',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害。',
    flavor: '「雷击全场」',
    effects: [{ kind: 'damageAll', value: 14 }],
    classId: 'thunder'
  },
  {
    id: 'thunder-chain',
    name: '雷魔·连锁',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层感电。',
    flavor: '「连锁闪电」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'flame-burst',
    name: '炎角·烈焰',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对敌人施加 4 层燃烧。',
    flavor: '「烧烧烧」',
    effects: [{ kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' }],
    classId: 'flame'
  },
  {
    id: 'flame-ember',
    name: '炎角·余烬',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 3 层燃烧。',
    flavor: '「余烬不灭」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'shield-counter',
    name: '光盾·反震',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡。',
    flavor: '「永远的坦克」——哎呦喂',
    effects: [{ kind: 'block', value: 8 }],
    classId: 'lightshield'
  },
  {
    id: 'shield-slam',
    name: '光盾·盾击',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，造成 14 点伤害。',
    flavor: '「盾砸脸」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'damage', value: 14 },
    ],
    classId: 'lightshield'
  },

  // ===== 星痕召唤牌 =====
  {
    id: 'summon-mum',
    name: '召唤·姆头',
    type: 'summon',
    rarity: 'rare',
    cost: 1,
    text: '召唤姆头（每回合获得 1 点能量）。',
    flavor: '「姆头」',
    effects: [{ kind: 'summon', summonId: 'mum-head' }]
  },
  {
    id: 'summon-spider',
    name: '召唤·蜘蛛',
    type: 'summon',
    rarity: 'rare',
    cost: 1,
    text: '召唤蜘蛛（每回合全体易伤 2）。',
    flavor: '「蜘蛛」',
    effects: [{ kind: 'summon', summonId: 'spider' }]
  },
  {
    id: 'summon-flyfish',
    name: '召唤·飞鱼',
    type: 'summon',
    rarity: 'rare',
    cost: 1,
    text: '召唤飞鱼（每回合获得 4 点格挡）。',
    flavor: '「飞鱼」',
    effects: [{ kind: 'summon', summonId: 'flyfish' }]
  },
  {
    id: 'summon-boyce',
    name: '召唤·博伊斯',
    type: 'summon',
    rarity: 'rare',
    cost: 1,
    text: '召唤博伊斯（每回合对随机敌人造成 5 伤害）。',
    flavor: '「博伊斯（博）」',
    effects: [{ kind: 'summon', summonId: 'boyce' }]
  },
  {
    id: 'summon-amber',
    name: '召唤·琥珀',
    type: 'summon',
    rarity: 'rare',
    cost: 1,
    text: '召唤琥珀（每回合回复 3 点生命）。',
    flavor: '「琥珀」',
    effects: [{ kind: 'summon', summonId: 'amber' }]
  },

  // ===== 群梗攻击牌 =====
  {
    id: 'red-bite',
    name: '红怒咬住',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 1 层易伤。',
    flavor: '「@Ephyra 红怒咬住你」——Ukinovo',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 1, status: 'vuln', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'red-q',
    name: '接红怒 q',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害。',
    flavor: '「接红怒 q」——Ukinovo',
    effects: [{ kind: 'damage', value: 8 }]
  },
  {
    id: 'death-coil',
    name: '死亡缠绕',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 2 层虚弱。',
    flavor: '「死亡缠绕你了」——Ukinovo',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'weak', statusTarget: 'enemy' },
    ]
  },

  // ===== 传说卡 =====
  {
    id: 'punish-dynasty-card',
    name: '惩击王朝',
    type: 'attack',
    rarity: 'legendary',
    cost: 3,
    text: '造成 35 点伤害。',
    flavor: '当前 meta：惩击王朝',
    effects: [{ kind: 'damage', value: 35 }],
    exhaust: true,
  },
  {
    id: 'hana-auto-card',
    name: '85w 自动',
    type: 'attack',
    rarity: 'legendary',
    cost: 2,
    text: '造成 35 点伤害。',
    flavor: '「哈娜的自动就有 85w 了」',
    effects: [{ kind: 'damage', value: 35 }],
    exhaust: true,
  },
  {
    id: 'last-train-card',
    name: '末班车',
    type: 'event_card',
    rarity: 'epic',
    cost: 1,
    text: '抽 2 张牌，获得 10 点格挡。',
    flavor: '「八点团本末班车！@全体成员」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'block', value: 10 },
    ]
  },
  {
    id: 'wait-nerf-card',
    name: '等削弱',
    type: 'event_card',
    rarity: 'epic',
    cost: 1,
    text: '回复 8 点生命，抽 1 张牌。',
    flavor: '「无所谓我会选择不打等削弱」',
    effects: [
      { kind: 'heal', value: 8 },
      { kind: 'draw', value: 1 },
    ]
  },

  // ===== 进阶职业牌（稀有/史诗）·扩展 =====
  {
    id: 'iaido-moonshadow',
    name: '居合·月影',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害 3 次。',
    flavor: '「月下拔刀，居合看技改」',
    effects: [{ kind: 'damage', value: 22, hits: 3 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-armorbreak',
    name: '居合·破甲斩',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层易伤。',
    flavor: '「破甲再一刀，居合看技改」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-focus',
    name: '居合·凝神',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层力量，抽 2 张牌。',
    flavor: '「凝神一瞬，5.6 居合」——维',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 2 },
    ],
    classId: 'iaido'
  },
  {
    id: 'twinaxe-storm',
    name: '双斧·风暴',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人造成 22 点伤害。',
    flavor: '「抡起来转圈，追幻想也太贵了」',
    effects: [{ kind: 'damageAll', value: 22 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-berserk',
    name: '双斧·狂战',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，失去 2 点生命。',
    flavor: '「一斧子下去，自己也疼」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'heal', value: -2 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-combo',
    name: '双斧·连斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 3 次。',
    flavor: '「拔刀再拔刀，连斩不停」',
    effects: [{ kind: 'damage', value: 13, hits: 3 }],
    classId: 'twinaxe'
  },
  {
    id: 'shield-mountain',
    name: '光盾·不动如山',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 16 点格挡，抽 1 张牌。',
    flavor: '「你是个光盾啊，你上 5.4 干什么」',
    effects: [
      { kind: 'block', value: 16 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-taunt',
    name: '光盾·嘲讽',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 10 点格挡，获得 2 层力量。',
    flavor: '「永远的坦克拉住仇恨」——哎呦喂',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-wall',
    name: '光盾·盾墙',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 11 点格挡。',
    flavor: '「立起盾墙，谁也打不动」',
    effects: [{ kind: 'block', value: 11 }],
    classId: 'lightshield'
  },
  {
    id: 'icepearl-blizzard',
    name: '冰矛·极寒',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害，对敌人施加 3 层冰冻。',
    flavor: '「星痕共鸣最忧郁的冰矛魔丸」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frostarmor',
    name: '冰矛·霜甲',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，对敌人施加 2 层冰冻。',
    flavor: '「霜甲覆体，冻成冰雕」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-shatter',
    name: '冰矛·碎冰',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 13 点伤害 2 次，对敌人施加 2 层冰冻。',
    flavor: '「碎冰，一敲就裂」',
    effects: [
      { kind: 'damage', value: 13, hits: 2 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'thunder-myriad',
    name: '雷魔·万雷',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 3 层感电。',
    flavor: '「圣域飞鱼娘，雷击全场」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-spear',
    name: '雷魔·雷矛',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 3 层感电。',
    flavor: '「雷矛贯穿，连锁闪电」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-static',
    name: '雷魔·静电',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，获得 2 层力量。',
    flavor: '「静电蓄能，蓄势待发」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'thunder'
  },
  {
    id: 'flame-detonate',
    name: '炎角·炎爆',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害，对敌人施加 5 层燃烧。',
    flavor: '「炎角一爆，烧烧烧」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'applyStatus', value: 5, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-scorch',
    name: '炎角·灼烧',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '对敌人施加 3 层燃烧，抽 1 张牌。',
    flavor: '「灼烧不止，余烬不灭」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-emberheat',
    name: '炎角·余热',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '对敌人施加 3 层燃烧，获得 2 层力量。',
    flavor: '「弱的是职业不是玩家，烧就完了」——三百一十页',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'flame'
  },

  // ===== 通用技能牌·扩展 =====
  {
    id: 'whetstone',
    name: '磨刀石',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 1 层力量。',
    flavor: '「磨刀不误砍柴工」',
    effects: [{ kind: 'applyStatus', value: 1, status: 'strength', statusTarget: 'self' }]
  },
  {
    id: 'group-repeat',
    name: '群聊复读',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '抽 2 张牌。',
    flavor: '「十三线虫故事 1/1」——群友复读中',
    effects: [{ kind: 'draw', value: 2 }]
  },
  {
    id: 'raid-assemble',
    name: '团本集合',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，抽 1 张牌。',
    flavor: '「八点团本末班车！@全体成员」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'bailan',
    name: '摆烂',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '回复 3 点生命。',
    flavor: '「无所谓我会选择不打等削弱」',
    effects: [{ kind: 'heal', value: 3 }]
  },
  {
    id: 'sediment-power',
    name: '沉淀之力',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 3 层力量。',
    flavor: '「还在沉淀还在沉淀」',
    effects: [{ kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' }]
  },
  {
    id: 'overtime-train',
    name: '加班车',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 2 张牌，获得 1 点能量。',
    flavor: '「末班车没赶上，加班车也行」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'energy', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'covenant-guard',
    name: '公约守护',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 10 点格挡。',
    flavor: '「薄荷色氏族公约，共同防御」',
    effects: [{ kind: 'block', value: 10 }]
  },
  {
    id: 'starlight-resonance',
    name: '星痕共鸣',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层敏捷，抽 1 张牌。',
    flavor: '「星痕共鸣，蓝色协议国服」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'gacha-pity',
    name: '抽卡保底',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '抽 1 张牌，获得 1 点能量。',
    flavor: '「保底了，追幻想也太贵了」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'gear-graduate',
    name: '装备毕业',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 2 层力量，获得 2 层敏捷。',
    flavor: '「等我六件套，毕业了」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ]
  },

  // ===== 群梗攻击牌·扩展 =====
  {
    id: 'hana-demon-atk',
    name: '哈娜入魔',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，失去 2 点生命。',
    flavor: '「哈娜入魔了，开桂了」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'heal', value: -2 },
    ]
  },
  {
    id: 'leech-boss-atk',
    name: '蹭 BOSS 一击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，抽 1 张牌。',
    flavor: '「我是蹭 BOSS 大王」——伏月十三',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'death-coil-plus',
    name: '死亡缠绕·极',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 3 层虚弱。',
    flavor: '「死亡缠绕你了，缠绕到底」——Ukinovo',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'weak', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'red-combo',
    name: '红怒连击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害 2 次。',
    flavor: '「红怒咬住，接红怒 q」——Ukinovo',
    effects: [{ kind: 'damage', value: 8, hits: 2 }]
  },
  {
    id: 'red-q-finish',
    name: '接红怒 q·终结',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害。',
    flavor: '「接红怒 q，一击终结」——Ukinovo',
    effects: [{ kind: 'damage', value: 14 }]
  },
  {
    id: 'dragon-rage',
    name: '龙性恋之怒',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，获得 2 层力量。',
    flavor: '「我是龙性恋」——莫妮卡',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'nematode-strike',
    name: '十三线虫突',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害 3 次。',
    flavor: '「十三线虫故事 1/1」——复读嘲讽',
    effects: [{ kind: 'damage', value: 8, hits: 3 }]
  },
  {
    id: 'tina-rightline',
    name: '蒂娜右线',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层易伤。',
    flavor: '「蒂娜右线斧哥秒不掉人」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ]
  },

  // ===== 传说/史诗卡·扩展 =====
  {
    id: 'punish-dynasty-end',
    name: '惩击王朝·终焉',
    type: 'attack',
    rarity: 'legendary',
    cost: 3,
    text: '造成 35 点伤害。',
    flavor: '当前 meta：惩击王朝的终焉',
    effects: [{ kind: 'damage', value: 35 }],
    exhaust: true,
  },
  {
    id: 'starlight-apex',
    name: '星痕·至高共鸣',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '获得 4 层力量，抽 3 张牌。',
    flavor: '「星痕共鸣的至高境界」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 3 },
    ],
    exhaust: true,
  },
  {
    id: 'mist-buff-card',
    name: '雾隐猎场·加强',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人造成 22 点伤害。',
    flavor: '「加强 boss 也就你游策划做得出来惹」——菲雅',
    effects: [{ kind: 'damageAll', value: 22 }]
  },
  {
    id: 'lasttrain-crush-card',
    name: '末班车·碾过去',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害，获得 10 点格挡。',
    flavor: '「希望末班车碾过去」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'block', value: 10 },
    ]
  },

  // ===== 召唤牌·扩展 =====
  {
    id: 'summon-amber-guard',
    name: '召唤·琥珀守护',
    type: 'summon',
    rarity: 'rare',
    cost: 2,
    text: '召唤琥珀（每回合回复 3 点生命），获得 8 点格挡。',
    flavor: '「琥珀守护，团本 cos 奶」',
    effects: [
      { kind: 'summon', summonId: 'amber' },
      { kind: 'block', value: 8 },
    ]
  },
  {
    id: 'summon-spider-web',
    name: '召唤·蛛网束缚',
    type: 'summon',
    rarity: 'rare',
    cost: 2,
    text: '召唤蜘蛛（每回合全体易伤 2），对所有敌人施加 2 层易伤。',
    flavor: '「蛛网束缚，无处可逃」',
    effects: [
      { kind: 'summon', summonId: 'spider' },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy', all: true },
    ]
  },

  // ===== 生命值体系（燃尽·血战·残血·不死） =====
  {
    id: 'burn-out',
    name: '燃尽',
    type: 'attack',
    rarity: 'epic',
    cost: 1,
    text: '失去 5 点生命，造成 22 点伤害。',
    flavor: '「燃尽了」——全群名场面',
    effects: [
      { kind: 'heal', value: -5 },
      { kind: 'damage', value: 22 },
    ]
  },
  {
    id: 'blood-battle',
    name: '血战',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '失去 2 点生命，获得 2 层力量。',
    flavor: '「血战救了我！」——Ephyra',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'all-in',
    name: '梭哈',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '失去 8 点生命，造成 28 点伤害，获得 3 层力量。',
    flavor: '「梭哈是种智慧」',
    effects: [
      { kind: 'heal', value: -8 },
      { kind: 'damage', value: 28 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'desperate-struggle',
    name: '拼尽全力',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 11 点伤害，失去 3 点生命。',
    flavor: '「拼尽全力无法战胜」',
    effects: [
      { kind: 'damage', value: 11 },
      { kind: 'heal', value: -3 },
    ]
  },
  {
    id: 'hp-pressure',
    name: '压血量',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 4 点生命，对所有敌人施加 2 层易伤。',
    flavor: '「第二回合压血量可以不被彗星秒」',
    effects: [
      { kind: 'heal', value: -4 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy', all: true },
    ]
  },
  {
    id: 'milk-one',
    name: '奶一口',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '回复 7 点生命。',
    flavor: '「奶妈奶一口」',
    effects: [{ kind: 'heal', value: 7 }]
  },
  {
    id: 'resolve',
    name: '决心',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，回复 5 点生命。',
    flavor: '「光盾光明决心一开就不会死」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'punish-heal',
    name: '惩戒之愈',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，回复 8 点生命。',
    flavor: '「惩击和狂音一样，靠打伤害出奶量的」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'encore-heal',
    name: '安可流',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '回复 5 点生命，抽 2 张牌。',
    flavor: '「协奏还早就被开发出裁定玩法」',
    effects: [
      { kind: 'heal', value: 5 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'heal-wave',
    name: '愈合波动',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '回复 5 点生命，回复 5 点生命。',
    flavor: '「愈合波动血上限触发波动改了吗」',
    effects: [
      { kind: 'heal', value: 5 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'vitality',
    name: '生命力',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '最大生命 +6，回复 6 点生命。',
    flavor: '「这就是虫的生命力吗」',
    effects: [
      { kind: 'maxHp', value: 6 },
      { kind: 'heal', value: 6 },
    ]
  },
  {
    id: 'body-tank',
    name: '肉身硬抗',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '失去 3 点生命，获得 8 点格挡。',
    flavor: '「我打的时候原来一直都是在拿肉身硬抗」',
    effects: [
      { kind: 'heal', value: -3 },
      { kind: 'block', value: 8 },
    ]
  },
  {
    id: 'shield-bash-hp',
    name: '护盾猛击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，造成 14 点伤害。',
    flavor: '「护盾量额外附加自身生命值的5%~8%」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'damage', value: 14 },
    ]
  },
  {
    id: 'shield-body',
    name: '盾兵体质',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，最大生命 +3。',
    flavor: '「盾兵有生命上限扩容呀」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'maxHp', value: 3 },
    ]
  },
  {
    id: 'last-stand',
    name: '绝地反击',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害，造成 22 点伤害。',
    flavor: '「残血对面吸不起来」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'damage', value: 22 },
    ]
  },
  {
    id: 'low-hp-rage',
    name: '残血暴怒',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 2 点生命，获得 3 层力量。',
    flavor: '「残血对面吸不起来」',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'death-lock',
    name: '锁血',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 10 点格挡，回复 8 点生命，获得 3 层再生。',
    flavor: '「小名刀不算锁血那种锁血，输出太高会直接碎掉」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'heal', value: 8 },
      { kind: 'applyStatus', value: 3, status: 'regen', statusTarget: 'self' },
    ]
  },
  {
    id: 'gamble-heal',
    name: '赌一把',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '回复 8 点生命，失去 2 点生命。',
    flavor: '「晚上该赌一波了」',
    effects: [
      { kind: 'heal', value: 8 },
      { kind: 'heal', value: -2 },
    ]
  },
  {
    id: 'burn-out-extreme',
    name: '燃尽·极',
    type: 'attack',
    rarity: 'legendary',
    cost: 3,
    text: '失去 12 点生命，造成 45 点伤害，获得 4 层力量。',
    flavor: '「我真的燃尽了」',
    effects: [
      { kind: 'heal', value: -12 },
      { kind: 'damage', value: 45 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'ming-dao',
    name: '名刀',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 10 点格挡，回复 5 点生命，获得 2 层敏捷。',
    flavor: '「有名刀」「没名刀是什么意思」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'heal', value: 5 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'cant-tank-run',
    name: '扛不住就跑',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '失去 3 点生命。',
    flavor: '「扛不住我就跑路」',
    effects: [{ kind: 'heal', value: -3 }]
  },
  {
    id: 'off-work',
    name: '下班',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 10 点生命。',
    flavor: '「等inf下班一脚踢死N5煌墓了」',
    effects: [{ kind: 'heal', value: 10 }]
  },
  {
    id: 'half-dead',
    name: '半死不活',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '回复 8 点生命。',
    flavor: '「半死不活了啊」',
    effects: [{ kind: 'heal', value: 8 }]
  },
  {
    id: 'mint-immortal',
    name: '薄荷色不会死的',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '最大生命 +10，回复 15 点生命，获得 15 点格挡。',
    flavor: '「薄荷色不会死的」——坠明',
    effects: [
      { kind: 'maxHp', value: 10 },
      { kind: 'heal', value: 15 },
      { kind: 'block', value: 15 },
    ],
    exhaust: true,
  },

  // ===== 能量主题（充能·循环·爆发期） =====
  {
    id: 'charge-up',
    name: '充能',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 1 点能量。',
    flavor: '「丹佛不是充能雷魔吗」',
    effects: [{ kind: 'draw', value: 1 }]
  },
  {
    id: 'overload',
    name: '能量过载',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 3 点能量，失去 3 点生命。',
    flavor: '「300能量涨得飞快」——Ephyra',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'heal', value: -3 },
    ]
  },
  {
    id: 'energy-surge',
    name: '300能量',
    type: 'skill',
    rarity: 'epic',
    cost: 1,
    text: '获得 2 点能量，抽 2 张牌。',
    flavor: '「3秒就满300能量了」',
    effects: [
      { kind: 'energy', value: 2 },
      { kind: 'draw', value: 2 },
    ],
    exhaust: true,
  },
  {
    id: 'denver-charge',
    name: '丹佛充能',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 1 点能量，对所有敌人施加 1 层感电。',
    flavor: '「丹佛不是充能雷魔吗」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'applyStatus', value: 1, status: 'shock', statusTarget: 'enemy', all: true },
    ]
  },
  {
    id: 'wild-call',
    name: '狂野呼唤',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 点能量。',
    flavor: '「狂野呼唤现在可充能2层」',
    effects: [{ kind: 'energy', value: 2 }],
    exhaust: true,
  },
  {
    id: 'cd-reduce',
    name: '思维减CD',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 2 张牌，获得 1 点能量。',
    flavor: '「奶妈吃思维那个减cd吧」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'energy', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'cascade-cd',
    name: '决心常驻',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 2 点能量，获得 10 点格挡。',
    flavor: '「思维减技能cd加上光自身打循环刷cd可以做到决心常驻的」',
    effects: [
      { kind: 'energy', value: 2 },
      { kind: 'block', value: 10 },
    ],
    exhaust: true,
  },
  {
    id: 'quick-cd',
    name: '缩减冷却',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '抽 1 张牌，获得 1 点能量。',
    flavor: '「我记得就一个缩减冷却能看看」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'burst-phase',
    name: '爆发期',
    type: 'skill',
    rarity: 'epic',
    cost: 1,
    text: '获得 2 点能量，获得 3 层力量。',
    flavor: '「爆发期100暴击了」——Ephyra',
    effects: [
      { kind: 'energy', value: 2 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'blade-return',
    name: '回刀意',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，获得 2 点能量。',
    flavor: '「施放后立即回满刀意值」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'energy', value: 2 },
    ],
    exhaust: true,
  },
  {
    id: 'no-cd-boost',
    name: '无CD增伤',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 1 点能量，对所有敌人施加 2 层易伤。',
    flavor: '「没内置CD一直触发炎舞增伤」',
    effects: [
      { kind: 'energy', value: 1 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy', all: true },
    ],
    exhaust: true,
  },
  {
    id: 'energy-gate',
    name: '能量门槛',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '获得 2 点能量，造成 22 点伤害。',
    flavor: '「1200能量就来一条废物狼」',
    effects: [
      { kind: 'energy', value: 2 },
      { kind: 'damage', value: 22 },
    ],
    exhaust: true,
  },
  {
    id: 'double-charge',
    name: '双倍充能',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 点能量。',
    flavor: '「狂野呼唤现在可充能2层」',
    effects: [{ kind: 'energy', value: 2 }],
    exhaust: true,
  },
  {
    id: 'echo-energy',
    name: '回响余音',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 1 点能量，回复 5 点生命。',
    flavor: '「回响余音」收集机制',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'energy-cycle',
    name: '能量循环',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 1 点能量，抽 1 张牌。',
    flavor: '「这不就是经典的循环了吗」',
    effects: [
      { kind: 'energy', value: 1 },
      { kind: 'draw', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'thunder-charge',
    name: '充能雷魔',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '获得 1 点能量，造成 14 点伤害。',
    flavor: '「丹佛不是充能雷魔吗」',
    effects: [
      { kind: 'energy', value: 1 },
      { kind: 'damage', value: 14 },
    ],
    exhaust: true,
  },
  {
    id: 'energy-drain',
    name: '吸能',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，获得 1 点能量。',
    flavor: '「岩蛆给的能量我已经懒得喷了」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'energy', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'nuclear-burst',
    name: '核能爆发',
    type: 'skill',
    rarity: 'legendary',
    cost: 2,
    text: '获得 3 点能量，抽 3 张牌，失去 5 点生命。',
    flavor: '「一套技能放完能不能有50能量」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 3 },
      { kind: 'heal', value: -5 },
    ],
    exhaust: true,
  },
  {
    id: 'audio-energy',
    name: '音响能量',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 1 点能量，抽 1 张牌。',
    flavor: '「不知道给的音响能量消耗情况」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'energy-full',
    name: '3秒满能',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 3 点能量。',
    flavor: '「基本3秒就满300能量了」',
    effects: [{ kind: 'draw', value: 1 }]
  },

  // ===== 强力单卡（一脚踢死·秒天秒地·不可战胜） =====
  {
    id: 'one-kick-kill',
    name: '一脚踢死',
    type: 'attack',
    rarity: 'legendary',
    cost: 3,
    text: '造成 50 点伤害。',
    flavor: '「等inf下班一脚踢死N5煌墓了」',
    effects: [{ kind: 'damage', value: 50 }],
    exhaust: true,
  },
  {
    id: 'heaven-earth',
    name: '秒天秒地',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 30 点伤害。',
    flavor: '「小吱秒天秒地」',
    effects: [{ kind: 'damageAll', value: 30 }],
    exhaust: true,
  },
  {
    id: 'one-punch',
    name: '一拳',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 22 点伤害。',
    flavor: '「我一拳打死你」——Ephyra',
    effects: [{ kind: 'damage', value: 22 }]
  },
  {
    id: 'great-calamity',
    name: '极诣·大破灭连斩',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 55 点伤害，获得 2 点能量。',
    flavor: '「终极技能：施放后立即回满刀意值」',
    effects: [
      { kind: 'damage', value: 55 },
      { kind: 'block', value: 5 },
    ],
    exhaust: true,
  },
  {
    id: 'million-dps',
    name: '110万秒伤',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 38 点伤害，获得 3 层力量。',
    flavor: '「海武冰矛110万秒伤」',
    effects: [
      { kind: 'damage', value: 38 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'unbeatable',
    name: '不可战胜',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 28 点伤害，获得 12 点格挡。',
    flavor: '「t大人不可战胜的」',
    effects: [
      { kind: 'damage', value: 28 },
      { kind: 'block', value: 12 },
    ]
  },
  {
    id: 'no-logic',
    name: '不讲道理',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 20 点伤害，对敌人施加 2 层易伤。',
    flavor: '「从来不讲道理」——零',
    effects: [
      { kind: 'damage', value: 20 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'overpowered',
    name: '超模',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 18 点伤害，获得 1 点能量。',
    flavor: '「尖兵还是太超模了」——夕',
    effects: [
      { kind: 'damage', value: 18 },
      { kind: 'block', value: 5 },
    ]
  },
  {
    id: 'peak-era',
    name: '巅峰期',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 32 点伤害，获得 3 层力量。',
    flavor: '「巅峰期冰矛与射线的故事」',
    effects: [
      { kind: 'damage', value: 32 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'finale',
    name: '终焉',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 65 点伤害，失去 8 点生命。',
    flavor: '「惩击王朝·终焉」',
    effects: [
      { kind: 'damage', value: 65 },
      { kind: 'heal', value: -8 },
    ],
    exhaust: true,
  },
  {
    id: 'god-throne',
    name: '神坛之上',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 28 点伤害，回复 8 点生命。',
    flavor: '「跌落神坛」',
    effects: [
      { kind: 'damage', value: 28 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'verdict-chase',
    name: '裁决追击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，获得 8 点格挡。',
    flavor: '「固定伤害:300%生命值上限」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'block', value: 8 },
    ]
  },
  {
    id: 'star-crush',
    name: '碎星冲',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，对敌人施加 2 层易伤。',
    flavor: '「开boss是直接碎星冲接闪避」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'first-wave',
    name: '第一波爆发',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 22 点伤害。',
    flavor: '「第一波爆发无限接近5lll」',
    effects: [{ kind: 'damage', value: 22 }]
  },
  {
    id: 'kill-all',
    name: '秒杀一切',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 35 点伤害，对敌人施加 3 层易伤。',
    flavor: '「秒杀一切」——零',
    effects: [
      { kind: 'damage', value: 35 },
      { kind: 'applyStatus', value: 3, status: 'vuln', statusTarget: 'enemy' },
    ],
    exhaust: true,
  },
  {
    id: 'crush',
    name: '碾压',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 18 点伤害。',
    flavor: '「n20都是一脚踢死」',
    effects: [{ kind: 'damage', value: 18 }]
  },
  {
    id: 'full-crit-burst',
    name: '爆发满暴',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 28 点伤害，获得 3 层力量，获得 3 层敏捷。',
    flavor: '「270套装爆发期100暴击了」',
    effects: [
      { kind: 'damage', value: 28 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 3, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'one-kick-n20',
    name: '一脚踢死N20',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 59 点伤害。',
    flavor: '「n20都是一脚踢死」——坠明',
    effects: [{ kind: 'damage', value: 59 }],
    exhaust: true,
  },
  {
    id: 'seven-sec-burst',
    name: '7s爆发',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 15 点伤害，获得 1 点能量。',
    flavor: '「水千夏是7s爆发打完跑路的」',
    effects: [
      { kind: 'damage', value: 15 },
      { kind: 'block', value: 5 },
    ]
  },
  {
    id: 'tina-right-line',
    name: '蒂娜右线',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 22 点伤害，对敌人施加 2 层易伤。',
    flavor: '「蒂娜右线斧哥秒不掉人了」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'inverse-supermodel',
    name: '逆天',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 38 点伤害，获得 3 层力量。',
    flavor: '「太逆天了」',
    effects: [
      { kind: 'damage', value: 38 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    exhaust: true,
  },

  // ===== 格挡主题（光盾·岩盾·防盾·决心循环） =====
  {
    id: 'light-resolve',
    name: '光明决心',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 15 点格挡。',
    flavor: '「光盾光明决心一开就不会死」——星落',
    effects: [{ kind: 'block', value: 15 }]
  },
  {
    id: 'rock-shield',
    name: '岩盾',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 12 点格挡，获得 2 层敏捷。',
    flavor: '「岩盾虐菜挺舒服的，盾都破不了」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'def-shield',
    name: '防盾',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 10 点格挡，对所有敌人施加 2 层虚弱。',
    flavor: '「防盾抗压比光盾平滑多了」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'applyStatus', value: 2, status: 'weak', statusTarget: 'enemy', all: true },
    ]
  },
  {
    id: 'shield-gym',
    name: '光盾体操',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，抽 1 张牌。',
    flavor: '「其实就光盾要做体操」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'light-shield-basic',
    name: '光盾',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 8 点格挡。',
    flavor: '「光已经比格挡硬了」',
    effects: [{ kind: 'block', value: 8 }]
  },
  {
    id: 'duty-shoulder',
    name: '职责担当',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 12 点格挡，回复 5 点生命。',
    flavor: '「决心没了就开职责+R」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'rock-solid',
    name: '坚如磐石',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 7 点格挡。',
    flavor: '「岩盾的几个岩盾神」',
    effects: [{ kind: 'block', value: 7 }]
  },
  {
    id: 'iron-wall',
    name: '铁壁',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 14 点格挡。',
    flavor: '「防盾真的就是丢个盾牌开H」',
    effects: [{ kind: 'block', value: 14 }]
  },
  {
    id: 'barrier-build',
    name: '屏障构筑',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 10 点格挡，最大生命 +2。',
    flavor: '「我屏障直接被打干了哈哈」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'maxHp', value: 2 },
    ]
  },
  {
    id: 'shield-wall',
    name: '盾墙',
    type: 'skill',
    rarity: 'common',
    cost: 2,
    text: '获得 10 点格挡。',
    flavor: '「防盾能扛住了吗？」',
    effects: [{ kind: 'block', value: 10 }]
  },
  {
    id: 'smooth-tank',
    name: '抗压平滑',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，获得 2 层敏捷，获得 2 层力量。',
    flavor: '「防盾抗压比光盾平滑多了」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'def-hegemony',
    name: '防盾霸权',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '获得 15 点格挡，造成 22 点伤害。',
    flavor: '「防盾没有弱势期啊」',
    effects: [
      { kind: 'block', value: 15 },
      { kind: 'damage', value: 22 },
    ]
  },
  {
    id: 'no-weakness',
    name: '无弱势期',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，获得 1 点能量。',
    flavor: '「防盾没有弱势期啊」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'eat-all',
    name: '硬吃一切',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 12 点格挡，回复 5 点生命。',
    flavor: '「就是硬吃输出啊」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'bronze-wall',
    name: '铜墙铁壁',
    type: 'skill',
    rarity: 'common',
    cost: 2,
    text: '获得 9 点格挡，获得 1 层敏捷。',
    flavor: '「防盾对boss抗伤也很强」',
    effects: [
      { kind: 'block', value: 9 },
      { kind: 'applyStatus', value: 1, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'god-shield',
    name: '神盾骑士',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 20 点格挡，回复 8 点生命。',
    flavor: '「好消息：我是神盾骑士」',
    effects: [
      { kind: 'block', value: 20 },
      { kind: 'heal', value: 8 },
    ],
    exhaust: true,
  },
  {
    id: 'stand-firm',
    name: '坚定',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 8 点格挡。',
    flavor: '「扛不住我就跑路」反面：坚定不跑',
    effects: [{ kind: 'block', value: 8 }]
  },
  {
    id: 'limit-guard',
    name: '极限防御',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 3 点生命，获得 11 点格挡。',
    flavor: '「改物防改生命也不一定能顶住」',
    effects: [
      { kind: 'heal', value: -3 },
      { kind: 'block', value: 11 },
    ]
  },
  {
    id: 'shield-vitality-x2',
    name: '盾兵体质+',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，最大生命 +2。',
    flavor: '「盾兵有生命上限扩容呀」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'maxHp', value: 2 },
    ]
  },
  {
    id: 'nature-shelter',
    name: '自然庇护',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 10 点格挡，回复 5 点生命。',
    flavor: '「护盾量附加目标生命值12%~18%」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'resolve-cycle',
    name: '决心循环',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 12 点格挡，抽 1 张牌，获得 1 点能量。',
    flavor: '「光明决心→职责+R→继续决心」——星落',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },

  // ===== 燃烧扩充（焚诀·星火·炎角·地火·无相火斩） =====
  {
    id: 'burn-art',
    name: '焚诀',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '对所有敌人施加 3 层燃烧。',
    flavor: '「现在狂音焚诀」',
    effects: [{ kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy', all: true }]
  },
  {
    id: 'burn-extreme',
    name: '焚绝',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害，对敌人施加 5 层燃烧，对敌人施加 3 层易伤。',
    flavor: '「巨塔不是出焚绝了吗」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'applyStatus', value: 5, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 3, status: 'vuln', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'burn-atk',
    name: '焚攻',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 2 层燃烧。',
    flavor: '「焚攻星火赤红破斩谁强」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'star-fire',
    name: '星火',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 3 层燃烧。',
    flavor: '「星火220」「220火攻星火天赋」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'no-phase-fire',
    name: '无相火斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 4 层燃烧。',
    flavor: '「无相火斩：技能倍率x(20%+精通%)」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'ground-fire',
    name: '地火',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人施加 4 层燃烧，获得 8 点格挡。',
    flavor: '「地火只有赤红能硬吃了」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy', all: true },
      { kind: 'block', value: 8 },
    ]
  },
  {
    id: 'flame-horn-power',
    name: '炎角之力',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '对敌人施加 2 层燃烧，获得 1 点能量。',
    flavor: '「做个炎角就是惩击」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'fireball-boom',
    name: '火球秒炸',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 22 点伤害，对敌人施加 6 层燃烧。',
    flavor: '「转阶段火球秒炸」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'sixty-fire',
    name: '60%火伤',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 22 点伤害，对敌人施加 6 层燃烧，获得 3 层力量。',
    flavor: '「直接60%火伤 这么哈人」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'million-dot',
    name: '百万DOT',
    type: 'skill',
    rarity: 'legendary',
    cost: 2,
    text: '对所有敌人施加 6 层燃烧。',
    flavor: '「百万秒伤的dot」——Ephyra',
    effects: [{ kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy', all: true }]
  },
  {
    id: 'burn-oath',
    name: '灼烧宣言',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '对敌人施加 2 层燃烧，获得 2 层力量。',
    flavor: '「我已灼烧」——地上答辩',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'flame-rhapsody',
    name: '烈焰狂想',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害，回复 8 点生命。',
    flavor: '「烈焰狂想：攻击力=0.6x急速%」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'burn-earth',
    name: '燃尽大地',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人施加 4 层燃烧，对所有敌人造成 14 点伤害。',
    flavor: '「燃烧大地」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy', all: true },
      { kind: 'damageAll', value: 14 },
    ]
  },
  {
    id: 'fire-demon',
    name: '火魔附体',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对敌人施加 4 层燃烧，获得 8 点格挡。',
    flavor: '「火魔需要母头天菜狐狸炎角」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
      { kind: 'block', value: 8 },
    ]
  },
  {
    id: 'star-fire-spread',
    name: '星火燎原',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对所有敌人施加 3 层燃烧。',
    flavor: '「星火加坠星宿命」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy', all: true },
    ]
  },
  {
    id: 'crimson-slash',
    name: '赤红破斩',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 3 层燃烧。',
    flavor: '「焚攻星火赤红破斩谁强」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'cross-fire',
    name: '十字地火',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 2 次，对敌人施加 2 层燃烧，对敌人施加 2 层燃烧。',
    flavor: '「打个十字打个地火然后开砍」',
    effects: [
      { kind: 'damage', value: 13, hits: 2 },
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'burn-finish',
    name: '焚尽',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，对敌人施加 4 层燃烧。',
    flavor: '「焚尽一切」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'flame-dance',
    name: '焰舞',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人施加 5 层燃烧，获得 2 点能量。',
    flavor: '「一直触发10秒的炎舞增伤」',
    effects: [
      { kind: 'applyStatus', value: 5, status: 'burn', statusTarget: 'enemy', all: true },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'crimson-awaken',
    name: '赤红觉醒',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '对所有敌人施加 9 层燃烧，对所有敌人造成 35 点伤害，失去 6 点生命。',
    flavor: '「赤红太变态了」——Ephyra',
    effects: [
      { kind: 'applyStatus', value: 9, status: 'burn', statusTarget: 'enemy', all: true },
      { kind: 'damageAll', value: 35 },
      { kind: 'heal', value: -6 },
    ],
    exhaust: true,
  },

  // ===== 诅咒 =====
  {
    id: 'useless-bug',
    name: '没用的虫',
    type: 'curse',
    rarity: 'common',
    cost: 0,
    text: '不可打出。占据你的手牌。',
    flavor: '「没用的虫」',
    effects: []
  },
  {
    id: 'golden-poop',
    name: '金色大便',
    type: 'curse',
    rarity: 'common',
    cost: 0,
    text: '失去 3 点生命。',
    flavor: '「金色大便」',
    effects: [{ kind: 'heal', value: -3 }]
  },
  {
    id: 'thirteens-grudge',
    name: '十三的怨念',
    type: 'curse',
    rarity: 'common',
    cost: 0,
    text: '不可打出。占据你的手牌。',
    flavor: '「和日本人哪来的线虫故事」——十三委屈道',
    effects: []
  },
  {
    id: 'sprout-curse',
    name: '抽风苗的诅咒',
    type: 'curse',
    rarity: 'common',
    cost: 0,
    text: '失去 4 点生命。',
    flavor: '「傻逼向日葵不知道抽什么风」',
    effects: [{ kind: 'heal', value: -4 }]
  },
  {
    id: 'devils-malice',
    name: '策划的恶意',
    type: 'curse',
    rarity: 'common',
    cost: 0,
    text: '不可打出。占据你的手牌。',
    flavor: '「加强 boss 也就你游策划做得出来惹」',
    effects: []
  },

  // ===== 冰矛·冰冻控制（50张） =====
  {
    id: 'icepearl-frost-spear',
    name: '冰矛投掷',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 1 层冰冻。',
    flavor: '「星痕共鸣最忧郁的冰矛魔丸」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 1, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-shield',
    name: '冰盾',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 7 点格挡，对敌人施加 1 层冰冻。',
    flavor: '「冰盾反冻」',
    effects: [
      { kind: 'block', value: 7 },
      { kind: 'applyStatus', value: 1, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-chill',
    name: '寒意',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '对所有敌人施加 1 层冰冻。',
    flavor: '「冰矛的寒意」',
    effects: [{ kind: 'applyStatus', value: 1, status: 'freeze', statusTarget: 'enemy', all: true }],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frost-shard',
    name: '冰片飞溅',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 1 层冰冻。',
    flavor: '「碎冰飞溅」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 1, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-cold-wind',
    name: '寒风',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '对敌人施加 2 层冰冻，抽 1 张牌。',
    flavor: '「冷风过境」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frost-bite',
    name: '霜咬',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 2 层冰冻。',
    flavor: '「冻成冰雕」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-wall',
    name: '冰墙',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 8 点格挡。',
    flavor: '「冰矛的壁垒」',
    effects: [{ kind: 'block', value: 8 }],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-bolt',
    name: '冰箭',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 10 点伤害。',
    flavor: '「一箭穿心，冻住不许走」',
    effects: [{ kind: 'damage', value: 10 }],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frozen-ground',
    name: '冻土',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，对所有敌人施加 1 层冰冻。',
    flavor: '「冰区冻土」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'applyStatus', value: 1, status: 'freeze', statusTarget: 'enemy', all: true },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frost-slash',
    name: '冰斩',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 1 层冰冻。',
    flavor: '「一斩冰封」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 1, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-deep-freeze',
    name: '深寒',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对敌人施加 4 层冰冻。',
    flavor: '「深寒入骨」',
    effects: [{ kind: 'applyStatus', value: 4, status: 'freeze', statusTarget: 'enemy' }],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-blizzard',
    name: '暴风雪',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害，对所有敌人施加 2 层冰冻。',
    flavor: '「暴风雪来袭，冰区降临」',
    effects: [
      { kind: 'damageAll', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy', all: true },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frost-lance',
    name: '霜矛突刺',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层冰冻。',
    flavor: '「海武冰矛110万秒伤」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-prison',
    name: '冰狱',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对敌人施加 3 层冰冻，对敌人施加 2 层易伤。',
    flavor: '「冰狱囚禁」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-hail',
    name: '冰雹',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 3 次，对敌人施加 2 层冰冻。',
    flavor: '「冰雹砸脸」',
    effects: [
      { kind: 'damage', value: 13, hits: 3 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frozen-heart',
    name: '冰心',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，对敌人施加 2 层冰冻。',
    flavor: '「冰心不化」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-cold-embrace',
    name: '寒冰拥抱',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，对敌人施加 3 层冰冻。',
    flavor: '「寒冰拥抱，冻住一切」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-rain',
    name: '冰矛雨',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 4 次，对敌人施加 2 层冰冻。',
    flavor: '「冰矛如雨下」',
    effects: [
      { kind: 'damage', value: 13, hits: 4 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frost-burst',
    name: '霜爆',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层冰冻。',
    flavor: '「霜爆裂开」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-arctic-gale',
    name: '极寒狂风',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人施加 3 层冰冻，抽 1 张牌。',
    flavor: '「极寒过境，冰魔之怒」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy', all: true },
      { kind: 'draw', value: 1 },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-spike',
    name: '冰刺',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层冰冻。',
    flavor: '「冰刺穿骨」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frozen-shell',
    name: '冰壳护体',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 11 点格挡。',
    flavor: '「冰壳包裹，坚不可摧」',
    effects: [{ kind: 'block', value: 11 }],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-cold-rush',
    name: '寒流冲击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，对敌人施加 2 层冰冻。',
    flavor: '「寒流一冲」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-lance',
    name: '冰枪',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 18 点伤害。',
    flavor: '「巅峰期冰矛与射线的故事」',
    effects: [{ kind: 'damage', value: 18 }],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-permafrost-touch',
    name: '永冻之触',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对敌人施加 4 层冰冻，回复 5 点生命。',
    flavor: '「触碰即永冻」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'freeze', statusTarget: 'enemy' },
      { kind: 'heal', value: 5 },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-absolute-zero',
    name: '绝对零度',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 3 层冰冻。',
    flavor: '「零度之下，万物冻结」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy', all: true },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-glacial-spike',
    name: '冰川尖刺',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 28 点伤害，对敌人施加 3 层冰冻。',
    flavor: '「冰川突刺」',
    effects: [
      { kind: 'damage', value: 28 },
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-permafrost',
    name: '永冻领域',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人施加 5 层冰冻，对所有敌人造成 22 点伤害。',
    flavor: '「永冻领域，冰矛的终极控场」',
    effects: [
      { kind: 'applyStatus', value: 5, status: 'freeze', statusTarget: 'enemy', all: true },
      { kind: 'damageAll', value: 22 },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-age',
    name: '冰河时代',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 24 点伤害。',
    flavor: '「冰河降临」',
    effects: [{ kind: 'damageAll', value: 24 }],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frost-dragon',
    name: '霜龙之息',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害，对所有敌人施加 3 层冰冻。',
    flavor: '「霜龙吐息，冻结全场」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy', all: true },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-cryo-blast',
    name: '冰爆',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 30 点伤害，对敌人施加 4 层冰冻。',
    flavor: '「冰爆！冰矛魔丸狂喜」',
    effects: [
      { kind: 'damage', value: 30 },
      { kind: 'applyStatus', value: 4, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-deep-freeze-zone',
    name: '深寒领域',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 12 点格挡，对所有敌人施加 4 层冰冻。',
    flavor: '「深寒笼罩冰区」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'applyStatus', value: 4, status: 'freeze', statusTarget: 'enemy', all: true },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-lord',
    name: '冰之领主',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '对敌人施加 5 层冰冻，获得 1 点能量。',
    flavor: '「冰魔领主降临」',
    effects: [
      { kind: 'applyStatus', value: 5, status: 'freeze', statusTarget: 'enemy' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frozen-judgment',
    name: '冻结裁决',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 32 点伤害，对所有敌人施加 3 层冰冻。',
    flavor: '「冻结，裁决」',
    effects: [
      { kind: 'damage', value: 32 },
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy', all: true },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-subzero',
    name: '零下',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '对敌人施加 5 层冰冻，抽 2 张牌。',
    flavor: '「零下冻结，冰魔的领域」',
    effects: [
      { kind: 'applyStatus', value: 5, status: 'freeze', statusTarget: 'enemy' },
      { kind: 'draw', value: 2 },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-comet',
    name: '冰彗星',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 34 点伤害。',
    flavor: '「冰彗星撞地球」',
    effects: [{ kind: 'damage', value: 34 }],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-cold-soul',
    name: '寒冰之魂',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 10 点格挡，对敌人施加 3 层冰冻，回复 8 点生命。',
    flavor: '「冰矛不灭之魂」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy' },
      { kind: 'heal', value: 8 },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-crystal',
    name: '冰晶',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 16 点格挡，对敌人施加 3 层冰冻。',
    flavor: '「冰晶护体」',
    effects: [
      { kind: 'block', value: 16 },
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frozen-sky',
    name: '冰封天空',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 3 层冰冻。',
    flavor: '「天空也被冰封」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'freeze', statusTarget: 'enemy', all: true },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-storm',
    name: '冰风暴',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 26 点伤害。',
    flavor: '「冰风暴席卷一切」',
    effects: [{ kind: 'damageAll', value: 26 }],
    classId: 'icepearl',
    exhaust: true,
  },
  {
    id: 'icepearl-eternal-winter',
    name: '永恒寒冬',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '对所有敌人造成 42 点伤害，对所有敌人施加 5 层冰冻。',
    flavor: '「星痕共鸣最忧郁的冰矛魔丸，永恒寒冬降临」',
    effects: [
      { kind: 'damageAll', value: 42 },
      { kind: 'applyStatus', value: 5, status: 'freeze', statusTarget: 'enemy', all: true },
    ],
    classId: 'icepearl',
    exhaust: true,
  },
  {
    id: 'icepearl-ice-god',
    name: '冰魔之怒',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 52 点伤害，对敌人施加 6 层冰冻。',
    flavor: '「冰魔怒了，万物冰封」',
    effects: [
      { kind: 'damage', value: 52 },
      { kind: 'applyStatus', value: 6, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl',
    exhaust: true,
  },
  {
    id: 'icepearl-zero-domain',
    name: '零域',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '对所有敌人施加 8 层冰冻，抽 3 张牌。',
    flavor: '「零域展开，冰矛至高境界」',
    effects: [
      { kind: 'applyStatus', value: 8, status: 'freeze', statusTarget: 'enemy', all: true },
      { kind: 'draw', value: 3 },
    ],
    classId: 'icepearl',
    exhaust: true,
  },
  {
    id: 'icepearl-frozen-time',
    name: '冰冻时空',
    type: 'skill',
    rarity: 'legendary',
    cost: 4,
    text: '获得 20 点格挡，对所有敌人施加 5 层冰冻，获得 2 点能量。',
    flavor: '「时空冻结，冰矛支配」',
    effects: [
      { kind: 'block', value: 20 },
      { kind: 'applyStatus', value: 5, status: 'freeze', statusTarget: 'enemy', all: true },
      { kind: 'draw', value: 1 },
    ],
    classId: 'icepearl',
    exhaust: true,
  },
  {
    id: 'icepearl-ice-descend',
    name: '冰矛神降',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 60 点伤害，对所有敌人施加 6 层冰冻。',
    flavor: '「冰矛神降，海武冰矛110万秒伤」',
    effects: [
      { kind: 'damage', value: 60 },
      { kind: 'applyStatus', value: 6, status: 'freeze', statusTarget: 'enemy', all: true },
    ],
    classId: 'icepearl',
    exhaust: true,
  },
  {
    id: 'icepearl-frost-step',
    name: '冰舞步',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，获得 2 层敏捷。',
    flavor: '「冰上起舞」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-cold-mirror',
    name: '寒冰镜',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 10 点格挡，对敌人施加 2 层冰冻。',
    flavor: '「冰镜反射」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-ice-thorn',
    name: '冰棘',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 2 层易伤。',
    flavor: '「冰棘刺骨」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-melt',
    name: '融冰愈',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '回复 6 点生命，抽 1 张牌。',
    flavor: '「冰雪消融，生机重现」',
    effects: [
      { kind: 'heal', value: 6 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'icepearl'
  },
  {
    id: 'icepearl-frozen-star',
    name: '冰星充能',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '对敌人施加 4 层冰冻，获得 2 点能量。',
    flavor: '「冰矛之星，充能完毕」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'freeze', statusTarget: 'enemy' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'icepearl'
  },

  // ===== 居合·快速过牌（50张） =====
  {
    id: 'iaido-slash-plus',
    name: '居合斩·改',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，抽 1 张牌。',
    flavor: '「居合看技改」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-quick-draw',
    name: '快速拔刀',
    type: 'attack',
    rarity: 'common',
    cost: 0,
    text: '造成 4 点伤害。',
    flavor: '「拔刀即斩，秒了」',
    effects: [{ kind: 'damage', value: 4 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-focus',
    name: '刀意专注',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '抽 2 张牌。',
    flavor: '「5.6居合，专注一刀」——维',
    effects: [{ kind: 'draw', value: 2 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-step-slash',
    name: '步斩',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害。',
    flavor: '「一步一斩」',
    effects: [{ kind: 'damage', value: 8 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-call',
    name: '刀意呼唤',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '抽 1 张牌，获得 1 点能量。',
    flavor: '「刀意归来」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-flash-cut',
    name: '一闪',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害 2 次。',
    flavor: '「一闪而过」',
    effects: [{ kind: 'damage', value: 8, hits: 2 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-sheath',
    name: '纳刀',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，抽 1 张牌。',
    flavor: '「纳刀入鞘」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-sprint-slash',
    name: '疾走斩',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，抽 1 张牌。',
    flavor: '「疾走拔刀」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-mind',
    name: '刀意凝心',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 1 点能量。',
    flavor: '「凝神一瞬，5.6居合」',
    effects: [{ kind: 'draw', value: 1 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-cross-cut',
    name: '十字斩',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 9 点伤害。',
    flavor: '「十字一斩」',
    effects: [{ kind: 'damage', value: 9 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-five-slash',
    name: '五段斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 5 次。',
    flavor: '「五段连斩，一刀秒了」',
    effects: [{ kind: 'damage', value: 13, hits: 5 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-draw-slash',
    name: '拔刀斩',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害。',
    flavor: '「拔刀再拔刀」',
    effects: [{ kind: 'damage', value: 14 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-return-plus',
    name: '回刀意·改',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，获得 2 点能量。',
    flavor: '「施放后立即回满刀意值」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'block', value: 5 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-void-cut',
    name: '虚空斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，抽 1 张牌。',
    flavor: '「虚空一刀」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-shadow-draw',
    name: '影拔刀',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，抽 1 张牌。',
    flavor: '「影中拔刀」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-dance',
    name: '刀舞',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 13 点伤害 3 次，抽 1 张牌。',
    flavor: '「刀舞翩翩」',
    effects: [
      { kind: 'damage', value: 13, hits: 3 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-mind-cleanse',
    name: '意清',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 3 张牌。',
    flavor: '「意清则刀快」',
    effects: [{ kind: 'draw', value: 3 }],
    classId: 'iaido',
    exhaust: true,
  },
  {
    id: 'iaido-break-slash',
    name: '破斩',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层易伤。',
    flavor: '「破甲再一刀」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-twin-draw',
    name: '双拔',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 2 次。',
    flavor: '「双刀齐出」',
    effects: [{ kind: 'damage', value: 13, hits: 2 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-cycle-cut',
    name: '循环斩',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，抽 1 张牌，获得 1 点能量。',
    flavor: '「一刀循环」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'draw', value: 1 },
      { kind: 'block', value: 5 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-afterimage',
    name: '残影斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，获得 8 点格挡。',
    flavor: '「残影护体」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'block', value: 8 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-storm',
    name: '刀岚',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害。',
    flavor: '「刀岚过境」',
    effects: [{ kind: 'damageAll', value: 14 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-precision',
    name: '精准一击',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 15 点伤害。',
    flavor: '「精准一刀，秒了」',
    effects: [{ kind: 'damage', value: 15 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-flow',
    name: '流水',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层敏捷，抽 1 张牌。',
    flavor: '「流水不争先」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-edge',
    name: '刃意',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层力量，抽 1 张牌。',
    flavor: '「刃意锋芒」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-one-slash-two',
    name: '一刀两断',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 28 点伤害。',
    flavor: '「一刀两断，秒了」',
    effects: [{ kind: 'damage', value: 28 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-instant',
    name: '刹那',
    type: 'skill',
    rarity: 'epic',
    cost: 1,
    text: '获得 3 点能量，抽 3 张牌。',
    flavor: '「刹那永恒」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 3 },
    ],
    classId: 'iaido',
    exhaust: true,
  },
  {
    id: 'iaido-god-speed',
    name: '神速',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害 5 次。',
    flavor: '「神速连斩，5.6居合」',
    effects: [{ kind: 'damage', value: 22, hits: 5 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-mugen',
    name: '无限斩',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 22 点伤害，抽 2 张牌，获得 1 点能量。',
    flavor: '「无限循环」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'draw', value: 2 },
      { kind: 'block', value: 5 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-soul',
    name: '刀魂',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 3 层力量，抽 2 张牌。',
    flavor: '「刀魂觉醒」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 2 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-heaven-cut',
    name: '天斩',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 32 点伤害，抽 1 张牌。',
    flavor: '「天之一斩」',
    effects: [
      { kind: 'damage', value: 32 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-moon-blade',
    name: '月华斩',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 24 点伤害，抽 1 张牌。',
    flavor: '「月下拔刀，居合看技改」',
    effects: [
      { kind: 'damage', value: 24 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-rain',
    name: '刀雨',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人造成 22 点伤害，抽 1 张牌。',
    flavor: '「刀雨倾盆」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-empty-mind',
    name: '空明',
    type: 'skill',
    rarity: 'epic',
    cost: 1,
    text: '抽 3 张牌，获得 1 点能量。',
    flavor: '「空明之境」',
    effects: [
      { kind: 'draw', value: 3 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido',
    exhaust: true,
  },
  {
    id: 'iaido-batto',
    name: '拔刀术·极',
    type: 'attack',
    rarity: 'epic',
    cost: 1,
    text: '造成 22 点伤害。',
    flavor: '「拔刀即斩，n20一脚踢死」',
    effects: [{ kind: 'damage', value: 22 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-cycle-master',
    name: '循环大师',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '抽 2 张牌，获得 2 点能量。',
    flavor: '「这不就是经典的循环了吗」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-god-cut',
    name: '神之一刀',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 35 点伤害。',
    flavor: '「一刀入神」',
    effects: [{ kind: 'damage', value: 35 }],
    classId: 'iaido',
    exhaust: true,
  },
  {
    id: 'iaido-shadowless',
    name: '无影斩',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害 3 次，抽 1 张牌。',
    flavor: '「无影无踪」',
    effects: [
      { kind: 'damage', value: 22, hits: 3 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-zenith',
    name: '刀之极意',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 3 层力量，获得 3 层敏捷，抽 1 张牌。',
    flavor: '「刀之极致」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 3, status: 'dexterity', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-storm-slash',
    name: '风暴斩',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 26 点伤害，抽 2 张牌。',
    flavor: '「风暴连斩」',
    effects: [
      { kind: 'damage', value: 26 },
      { kind: 'draw', value: 2 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-final-slash',
    name: '终焉居合',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 50 点伤害，抽 3 张牌。',
    flavor: '「终极技能：一刀终结」',
    effects: [
      { kind: 'damage', value: 50 },
      { kind: 'draw', value: 3 },
    ],
    classId: 'iaido',
    exhaust: true,
  },
  {
    id: 'iaido-god-blade',
    name: '神刀·刹那',
    type: 'attack',
    rarity: 'legendary',
    cost: 2,
    text: '造成 40 点伤害，获得 2 点能量。',
    flavor: '「神之一刀，刹那永恒」',
    effects: [
      { kind: 'damage', value: 40 },
      { kind: 'block', value: 5 },
    ],
    classId: 'iaido',
    exhaust: true,
  },
  {
    id: 'iaido-zenith',
    name: '居合·极意',
    type: 'skill',
    rarity: 'legendary',
    cost: 2,
    text: '抽 5 张牌，获得 3 点能量。',
    flavor: '「居合的至高境界」',
    effects: [
      { kind: 'draw', value: 5 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido',
    exhaust: true,
  },
  {
    id: 'iaido-one-kick-n20',
    name: '一脚踢死N20',
    type: 'attack',
    rarity: 'legendary',
    cost: 3,
    text: '造成 53 点伤害。',
    flavor: '「n20都是一脚踢死」——坠明',
    effects: [{ kind: 'damage', value: 53 }],
    classId: 'iaido',
    exhaust: true,
  },
  {
    id: 'iaido-blade-god',
    name: '刀神降临',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 60 点伤害，抽 3 张牌，获得 2 点能量。',
    flavor: '「刀神降临，毁天灭地」',
    effects: [
      { kind: 'damage', value: 60 },
      { kind: 'draw', value: 3 },
      { kind: 'block', value: 5 },
    ],
    classId: 'iaido',
    exhaust: true,
  },
  {
    id: 'iaido-parry',
    name: '见切',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，抽 1 张牌。',
    flavor: '「见招拆招」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-dodge-cut',
    name: '闪斩',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，获得 6 点格挡。',
    flavor: '「闪避反击」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'block', value: 6 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-meditate',
    name: '冥想',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '回复 3 点生命，抽 1 张牌。',
    flavor: '「冥想回刀意」',
    effects: [
      { kind: 'heal', value: 3 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },
  {
    id: 'iaido-last-blade',
    name: '最后一刀',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 20 点伤害。',
    flavor: '「一刀终结！」',
    effects: [{ kind: 'damage', value: 20 }],
    classId: 'iaido'
  },
  {
    id: 'iaido-blade-circle',
    name: '刀环',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，获得 1 点能量。',
    flavor: '「刀环护体」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'iaido'
  },

  // ===== 双斧·连击体系（50张） =====
  {
    id: 'twinaxe-chop',
    name: '斧击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 9 点伤害。',
    flavor: '「斧哥一斧」',
    effects: [{ kind: 'damage', value: 9 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-double-cut',
    name: '双斧连斩',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害 2 次。',
    flavor: '「双斧连斩不停」',
    effects: [{ kind: 'damage', value: 8, hits: 2 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-roar',
    name: '战吼',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 1 层力量。',
    flavor: '「红怒咆哮」',
    effects: [{ kind: 'applyStatus', value: 1, status: 'strength', statusTarget: 'self' }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-heavy',
    name: '重斧',
    type: 'attack',
    rarity: 'common',
    cost: 2,
    text: '造成 12 点伤害。',
    flavor: '「一斧子下去」',
    effects: [{ kind: 'damage', value: 12 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-fury',
    name: '怒斧',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，获得 1 层力量。',
    flavor: '「红怒咬住你」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 1, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-spin-small',
    name: '旋转斧',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '对所有敌人造成 8 点伤害。',
    flavor: '「抡起来转圈」',
    effects: [{ kind: 'damageAll', value: 8 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-reckless',
    name: '莽撞',
    type: 'attack',
    rarity: 'common',
    cost: 0,
    text: '造成 8 点伤害，失去 2 点生命。',
    flavor: '「莽就完了」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'heal', value: -2 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-rage',
    name: '暴怒',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 2 层力量，失去 1 点生命。',
    flavor: '「暴怒的斧哥」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'heal', value: -1 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-sweep',
    name: '横扫',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 1 层易伤。',
    flavor: '「横扫千军」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 1, status: 'vuln', statusTarget: 'enemy' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-battle-cry',
    name: '战斗怒吼',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 1 层力量，抽 1 张牌。',
    flavor: '「战吼」',
    effects: [
      { kind: 'applyStatus', value: 1, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-berserk-fury',
    name: '狂战之怒',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 3 层力量。',
    flavor: '「红怒爆发，连击暴击」',
    effects: [{ kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-mortal-strike',
    name: '致死打击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 22 点伤害。',
    flavor: '「致命一击」',
    effects: [{ kind: 'damage', value: 22 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-triple-chop',
    name: '三连斧',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 3 次。',
    flavor: '「三斧连斩」',
    effects: [{ kind: 'damage', value: 13, hits: 3 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-blood-rage',
    name: '血怒',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层力量，失去 3 点生命。',
    flavor: '「血怒战斧」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'heal', value: -3 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-axe-hurricane',
    name: '斧刃风暴',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害。',
    flavor: '「斧刃旋风斩」',
    effects: [{ kind: 'damageAll', value: 14 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-cleave',
    name: '顺劈',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害。',
    flavor: '「一斧顺劈」',
    effects: [{ kind: 'damage', value: 14 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-savage',
    name: '野蛮冲撞',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，获得 8 点格挡。',
    flavor: '「野蛮之力」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'block', value: 8 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-crit-axe',
    name: '暴击之斧',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 18 点伤害。',
    flavor: '「暴击！斧哥连斩」',
    effects: [{ kind: 'damage', value: 18 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-red-fury',
    name: '红怒',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层力量，抽 1 张牌。',
    flavor: '「红怒咬住！连击不停」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-execute',
    name: '处决',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 20 点伤害。',
    flavor: '「处决一击」',
    effects: [{ kind: 'damage', value: 20 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-chain-chop',
    name: '连斩不息',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 3 次，获得 2 层力量。',
    flavor: '「连斩连斩再连斩」',
    effects: [
      { kind: 'damage', value: 13, hits: 3 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-brutal',
    name: '凶暴',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 15 点伤害，对敌人施加 2 层易伤。',
    flavor: '「凶暴一斧」',
    effects: [
      { kind: 'damage', value: 15 },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-overpower',
    name: '压制',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 2 层虚弱。',
    flavor: '「压制打击」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'weak', statusTarget: 'enemy' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-iron-skin',
    name: '铁皮',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 10 点格挡，获得 2 层力量。',
    flavor: '「铁皮斧哥」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-sky-earth',
    name: '毁天灭地',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 30 点伤害，获得 3 层力量。',
    flavor: '「蒂娜右线斧哥秒不掉人了？毁天灭地！」',
    effects: [
      { kind: 'damage', value: 30 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-rage-mode',
    name: '狂战模式',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 4 层力量，抽 1 张牌。',
    flavor: '「狂战模式启动」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-carnage',
    name: '大屠杀',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害。',
    flavor: '「大杀四方」',
    effects: [{ kind: 'damageAll', value: 22 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-doom',
    name: '毁灭打击',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 28 点伤害。',
    flavor: '「一斧毁灭」',
    effects: [{ kind: 'damage', value: 28 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-bloodthirst',
    name: '嗜血',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 3 层力量，回复 8 点生命。',
    flavor: '「嗜血狂战」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'heal', value: 8 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-war-god',
    name: '战神',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 3 层力量，获得 3 层敏捷，获得 10 点格挡。',
    flavor: '「战神附体」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 3, status: 'dexterity', statusTarget: 'self' },
      { kind: 'block', value: 10 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-hell-cleaver',
    name: '地狱裂斧',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 32 点伤害，对敌人施加 3 层易伤。',
    flavor: '「地狱裂开」',
    effects: [
      { kind: 'damage', value: 32 },
      { kind: 'applyStatus', value: 3, status: 'vuln', statusTarget: 'enemy' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-unstoppable',
    name: '势不可挡',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 24 点伤害，获得 3 层力量。',
    flavor: '「势不可挡的斧哥」',
    effects: [
      { kind: 'damage', value: 24 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-rage-storm',
    name: '怒风暴',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害，获得 3 层力量。',
    flavor: '「怒风暴连斩」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-six-hit',
    name: '六连斩',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 22 点伤害 6 次。',
    flavor: '「六连暴击」',
    effects: [{ kind: 'damage', value: 22, hits: 6 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-crit-fury',
    name: '暴怒连击',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 26 点伤害，获得 3 层力量。',
    flavor: '「暴怒暴击连击」',
    effects: [
      { kind: 'damage', value: 26 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-juggernaut',
    name: '主宰',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 14 点格挡，获得 3 层力量。',
    flavor: '「主宰战场」',
    effects: [
      { kind: 'block', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-apocalypse',
    name: '天启',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 34 点伤害。',
    flavor: '「天启降临」',
    effects: [{ kind: 'damage', value: 34 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-axe-dance',
    name: '斧舞',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人造成 22 点伤害，获得 3 层力量。',
    flavor: '「斧舞旋风」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-war-path',
    name: '战途',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 3 层力量，获得 1 点能量。',
    flavor: '「战途漫漫」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-ragnarok',
    name: '诸神黄昏',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 58 点伤害，获得 4 层力量。',
    flavor: '「诸神黄昏，斧哥终焉」',
    effects: [
      { kind: 'damage', value: 58 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe',
    exhaust: true,
  },
  {
    id: 'twinaxe-berserk-god',
    name: '狂战神',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 48 点伤害，获得 4 层力量。',
    flavor: '「狂战神降临」',
    effects: [
      { kind: 'damage', value: 48 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe',
    exhaust: true,
  },
  {
    id: 'twinaxe-endless-rage',
    name: '无尽狂怒',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '获得 6 层力量，抽 2 张牌。',
    flavor: '「追幻想也太贵了，但狂怒无穷」',
    effects: [
      { kind: 'applyStatus', value: 6, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 2 },
    ],
    classId: 'twinaxe',
    exhaust: true,
  },
  {
    id: 'twinaxe-world-breaker',
    name: '碎界',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '对所有敌人造成 35 点伤害，获得 4 层力量。',
    flavor: '「一斧碎界」',
    effects: [
      { kind: 'damageAll', value: 35 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe',
    exhaust: true,
  },
  {
    id: 'twinaxe-blood-god',
    name: '血神',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 55 点伤害，回复 12 点生命。',
    flavor: '「血神一斧」',
    effects: [
      { kind: 'damage', value: 55 },
      { kind: 'heal', value: 12 },
    ],
    classId: 'twinaxe',
    exhaust: true,
  },
  {
    id: 'twinaxe-shout',
    name: '怒吼',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '对所有敌人施加 2 层易伤。',
    flavor: '「怒吼威慑」',
    effects: [{ kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy', all: true }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-iron-will',
    name: '铁血意志',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，获得 2 层力量。',
    flavor: '「铁血不屈」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-throw',
    name: '飞斧',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 18 点伤害。',
    flavor: '「飞斧投掷」',
    effects: [{ kind: 'damage', value: 18 }],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-reckless-charge',
    name: '舍身冲',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 16 点伤害，失去 4 点生命。',
    flavor: '「舍身一击」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'heal', value: -4 },
    ],
    classId: 'twinaxe'
  },
  {
    id: 'twinaxe-endless',
    name: '无穷',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 2 张牌，获得 2 层力量。',
    flavor: '「无穷连斩」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'twinaxe'
  },

  // ===== 雷魔·电击爆发（50张） =====
  {
    id: 'thunder-bolt',
    name: '雷击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 1 层感电。',
    flavor: '「圣域飞鱼娘」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 1, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-spark',
    name: '电火花',
    type: 'attack',
    rarity: 'common',
    cost: 0,
    text: '造成 3 点伤害，对敌人施加 1 层感电。',
    flavor: '「丹佛不是充能雷魔吗」',
    effects: [
      { kind: 'damage', value: 3 },
      { kind: 'applyStatus', value: 1, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-static-charge',
    name: '静电充能',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 1 点能量，对所有敌人施加 1 层感电。',
    flavor: '「充能雷魔」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'applyStatus', value: 1, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-zap',
    name: '电击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害。',
    flavor: '「电疗开始」',
    effects: [{ kind: 'damage', value: 8 }],
    classId: 'thunder'
  },
  {
    id: 'thunder-surge',
    name: '电流涌动',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 1 点能量。',
    flavor: '「3秒就满300能量了」',
    effects: [{ kind: 'draw', value: 1 }],
    classId: 'thunder'
  },
  {
    id: 'thunder-arc',
    name: '电弧',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 2 层感电。',
    flavor: '「电弧闪烁」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-pulse',
    name: '电脉冲',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对所有敌人施加 1 层感电。',
    flavor: '「电磁脉冲」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 1, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-charge-strike',
    name: '充能击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，获得 1 点能量。',
    flavor: '「丹佛充能一击」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'block', value: 3 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-spark-shield',
    name: '电盾',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，对敌人施加 1 层感电。',
    flavor: '「电盾反伤」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'applyStatus', value: 1, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-jolt',
    name: '震击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 9 点伤害。',
    flavor: '「雷魔震击」',
    effects: [{ kind: 'damage', value: 9 }],
    classId: 'thunder'
  },
  {
    id: 'thunder-lightning-storm',
    name: '闪电风暴',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害，对所有敌人施加 2 层感电。',
    flavor: '「雷击全场」',
    effects: [
      { kind: 'damageAll', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-chain-lightning',
    name: '连锁闪电',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 13 点伤害 2 次，对所有敌人施加 2 层感电。',
    flavor: '「连锁闪电，一传三」',
    effects: [
      { kind: 'damageAll', value: 13, hits: 2 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-overcharge',
    name: '过载充能',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 点能量，对敌人施加 2 层感电。',
    flavor: '「300能量涨得飞快」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-lightning-spear',
    name: '雷矛',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层感电。',
    flavor: '「雷矛贯穿」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-static-field',
    name: '静电场',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人施加 3 层感电，抽 1 张牌。',
    flavor: '「静电蓄能」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy', all: true },
      { kind: 'draw', value: 1 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-discharge',
    name: '放电',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 3 层感电。',
    flavor: '「放电啦」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-volt-rush',
    name: '伏特冲击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，获得 1 点能量。',
    flavor: '「伏特冲锋」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'block', value: 5 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-shock-therapy',
    name: '电疗',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '回复 5 点生命，对敌人施加 2 层感电。',
    flavor: '「电疗一下就好了」',
    effects: [
      { kind: 'heal', value: 5 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-lightning-burst',
    name: '雷电爆发',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 18 点伤害。',
    flavor: '「雷电一秒爆发」',
    effects: [{ kind: 'damage', value: 18 }],
    classId: 'thunder'
  },
  {
    id: 'thunder-denver-style',
    name: '丹佛式',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 1 点能量，对敌人施加 3 层感电。',
    flavor: '「丹佛不是充能雷魔吗」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-spark-rain',
    name: '电雨',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害，对所有敌人施加 2 层感电。',
    flavor: '「电雨倾盆」',
    effects: [
      { kind: 'damageAll', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-thunder-clap',
    name: '雷鸣',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，对敌人施加 2 层感电。',
    flavor: '「雷鸣电闪」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-volt-armor',
    name: '电甲',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，对敌人施加 2 层感电。',
    flavor: '「电甲护体」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-high-volt',
    name: '高压电',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 20 点伤害。',
    flavor: '「高压电击」',
    effects: [{ kind: 'damage', value: 20 }],
    classId: 'thunder'
  },
  {
    id: 'thunder-energy-surge',
    name: '能量涌动',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 点能量，抽 1 张牌。',
    flavor: '「能量涌动」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-mighty-storm',
    name: '雷霆万钧',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 3 层感电。',
    flavor: '「雷霆万钧，雷魔降临」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-emp-blast',
    name: '电磁脉冲',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人施加 5 层感电，获得 1 点能量。',
    flavor: '「EMP全屏感电」',
    effects: [
      { kind: 'applyStatus', value: 5, status: 'shock', statusTarget: 'enemy', all: true },
      { kind: 'draw', value: 1 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-storm-fury',
    name: '雷暴之怒',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 30 点伤害，对敌人施加 3 层感电。',
    flavor: '「雷暴狂怒」',
    effects: [
      { kind: 'damage', value: 30 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-denver-charge-plus',
    name: '丹佛充能·极',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 2 点能量，对所有敌人施加 4 层感电。',
    flavor: '「丹佛不是充能雷魔吗，充到极」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'applyStatus', value: 4, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-tempest',
    name: '雷暴肆虐',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 3 层感电。',
    flavor: '「雷暴肆虐全场」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-plasma-bolt',
    name: '等离子雷',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 26 点伤害，对敌人施加 3 层感电。',
    flavor: '「等离子体，超高温雷击」',
    effects: [
      { kind: 'damage', value: 26 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-energy-bomb',
    name: '能量炸弹',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 32 点伤害，获得 1 点能量。',
    flavor: '「能量炸弹，炸了」',
    effects: [
      { kind: 'damage', value: 32 },
      { kind: 'block', value: 5 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-shock-net',
    name: '电网',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人施加 4 层感电，抽 1 张牌。',
    flavor: '「电网笼罩」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'shock', statusTarget: 'enemy', all: true },
      { kind: 'draw', value: 1 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-lightning-god',
    name: '雷神之击',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 34 点伤害，对敌人施加 3 层感电。',
    flavor: '「雷神一击」',
    effects: [
      { kind: 'damage', value: 34 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-storm-surge',
    name: '暴风充能',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 2 点能量，抽 2 张牌。',
    flavor: '「暴风充能，能量爆表」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 2 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-volt-cannon',
    name: '电炮',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '造成 28 点伤害。',
    flavor: '「电炮轰击」',
    effects: [{ kind: 'damage', value: 28 }],
    classId: 'thunder'
  },
  {
    id: 'thunder-shockwave',
    name: '震波',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 3 层感电。',
    flavor: '「震波全场」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-overload-burst',
    name: '过载爆发',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 25 点伤害，获得 2 点能量。',
    flavor: '「过载爆发充能」',
    effects: [
      { kind: 'damage', value: 25 },
      { kind: 'block', value: 5 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-lightning-field',
    name: '雷电场',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人施加 5 层感电，获得 1 点能量。',
    flavor: '「雷电场域」',
    effects: [
      { kind: 'applyStatus', value: 5, status: 'shock', statusTarget: 'enemy', all: true },
      { kind: 'draw', value: 1 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-crackling',
    name: '霹雳',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 30 点伤害，对所有敌人施加 3 层感电。',
    flavor: '「晴天霹雳」',
    effects: [
      { kind: 'damage', value: 30 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-raging-storm',
    name: '狂雷天牢',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '对所有敌人造成 40 点伤害，对所有敌人施加 5 层感电。',
    flavor: '「狂雷天牢，雷魔终焉」',
    effects: [
      { kind: 'damageAll', value: 40 },
      { kind: 'applyStatus', value: 5, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder',
    exhaust: true,
  },
  {
    id: 'thunder-god-spear',
    name: '雷神之矛',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 48 点伤害，对敌人施加 4 层感电。',
    flavor: '「雷神之矛贯穿」',
    effects: [
      { kind: 'damage', value: 48 },
      { kind: 'applyStatus', value: 4, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder',
    exhaust: true,
  },
  {
    id: 'thunder-overload-god',
    name: '过载之神',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '获得 4 点能量，对所有敌人施加 6 层感电。',
    flavor: '「基本3秒就满300能量了」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'applyStatus', value: 6, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder',
    exhaust: true,
  },
  {
    id: 'thunder-storm-king',
    name: '雷暴之王',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 56 点伤害，对所有敌人施加 5 层感电。',
    flavor: '「雷暴之王，万雷归宗」',
    effects: [
      { kind: 'damage', value: 56 },
      { kind: 'applyStatus', value: 5, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder',
    exhaust: true,
  },
  {
    id: 'thunder-apocalypse',
    name: '雷劫',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '对所有敌人造成 35 点伤害，对所有敌人施加 4 层感电。',
    flavor: '「雷劫降临，电疗全场」',
    effects: [
      { kind: 'damageAll', value: 35 },
      { kind: 'applyStatus', value: 4, status: 'shock', statusTarget: 'enemy', all: true },
    ],
    classId: 'thunder',
    exhaust: true,
  },
  {
    id: 'thunder-flash',
    name: '电光一闪',
    type: 'attack',
    rarity: 'common',
    cost: 0,
    text: '造成 5 点伤害。',
    flavor: '「电光石火」',
    effects: [{ kind: 'damage', value: 5 }],
    classId: 'thunder'
  },
  {
    id: 'thunder-energy-shield',
    name: '能量护盾',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，获得 1 点能量。',
    flavor: '「护盾充能」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-spark-heal',
    name: '电疗愈',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 8 点生命，对敌人施加 2 层感电。',
    flavor: '「电疗回血」',
    effects: [
      { kind: 'heal', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-thunder-step',
    name: '雷步',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层敏捷，对敌人施加 2 层感电。',
    flavor: '「雷步瞬移」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ],
    classId: 'thunder'
  },
  {
    id: 'thunder-storm-cloud',
    name: '雷云',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '对所有敌人施加 3 层感电，获得 1 点能量，抽 1 张牌。',
    flavor: '「雷云密布，丹佛充能」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy', all: true },
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'thunder'
  },

  // ===== 协奏·支援辅助（50张） =====
  {
    id: 'concerto-draw',
    name: '协奏曲',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '抽 2 张牌，获得 1 点能量。',
    flavor: '「协奏还早就被开发出裁定玩法」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'inspire',
    name: '激励',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 1 层力量，抽 1 张牌。',
    flavor: '「激励队友」',
    effects: [
      { kind: 'applyStatus', value: 1, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'harmony',
    name: '和音',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '回复 5 点生命，抽 1 张牌。',
    flavor: '「和音共鸣」',
    effects: [
      { kind: 'heal', value: 5 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'rest',
    name: '休止符',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，回复 5 点生命。',
    flavor: '「休止片刻」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'passion',
    name: '热情挥洒',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 1 点能量。',
    flavor: '「热情挥洒，安可！」',
    effects: [{ kind: 'draw', value: 1 }]
  },
  {
    id: 'rhythm',
    name: '节拍',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '抽 2 张牌。',
    flavor: '「跟着节拍走」',
    effects: [{ kind: 'draw', value: 2 }]
  },
  {
    id: 'chord',
    name: '和弦',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，抽 1 张牌。',
    flavor: '「和弦共鸣」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'prelude',
    name: '前奏',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '抽 1 张牌。',
    flavor: '「协奏的前奏」',
    effects: [{ kind: 'draw', value: 1 }]
  },
  {
    id: 'tune',
    name: '调音',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '回复 5 点生命，获得 1 点能量。',
    flavor: '「调音准备」',
    effects: [
      { kind: 'heal', value: 5 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'sustain',
    name: '延音',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，获得 1 点能量。',
    flavor: '「延音不止」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'crescendo',
    name: '渐强',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层力量，抽 1 张牌。',
    flavor: '「渐强渐强再渐强」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'wild-song',
    name: '狂音',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 2 点能量，抽 2 张牌。',
    flavor: '「惩击和狂音一样，靠打伤害出奶量的」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'encore',
    name: '安可',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 2 张牌，获得 1 点能量，回复 5 点生命。',
    flavor: '「安可流」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'draw', value: 1 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'harmony-wave',
    name: '和音波动',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '回复 6 点生命，抽 1 张牌。',
    flavor: '「和音波动治愈」',
    effects: [
      { kind: 'heal', value: 6 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'passion-surge',
    name: '激昂',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 点能量，抽 1 张牌。',
    flavor: '「激昂的协奏曲」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'rest-zone',
    name: '休止领域',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 10 点格挡，回复 5 点生命。',
    flavor: '「休止领域，全员回血」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'duo',
    name: '二重奏',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '抽 3 张牌。',
    flavor: '「二重奏，双倍快乐」',
    effects: [{ kind: 'draw', value: 3 }],
    exhaust: true,
  },
  {
    id: 'chorus',
    name: '合唱',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，抽 2 张牌。',
    flavor: '「全群合唱」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'tempo',
    name: '节奏',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层敏捷，抽 1 张牌。',
    flavor: '「掌握节奏」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'refrain',
    name: '副歌',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 8 点生命，获得 8 点格挡。',
    flavor: '「副歌响起」',
    effects: [
      { kind: 'heal', value: 8 },
      { kind: 'block', value: 8 },
    ]
  },
  {
    id: 'adagio',
    name: '柔板',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，回复 5 点生命。',
    flavor: '「柔板和音」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'forte',
    name: '强音',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 1 点能量，抽 2 张牌。',
    flavor: '「强音出击」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'cadenza',
    name: '华彩',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '抽 2 张牌，获得 1 点能量，获得 8 点格挡。',
    flavor: '「华彩乐章」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'draw', value: 1 },
      { kind: 'block', value: 8 },
    ]
  },
  {
    id: 'allegro',
    name: '快板',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 2 张牌，获得 2 层敏捷。',
    flavor: '「快板节奏」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'harmony-field',
    name: '和音领域',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 6 点生命，获得 1 点能量。',
    flavor: '「和音笼罩」',
    effects: [
      { kind: 'heal', value: 6 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'grand-concerto',
    name: '大协奏曲',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '抽 3 张牌，获得 2 点能量。',
    flavor: '「大协奏曲，安可！」',
    effects: [
      { kind: 'draw', value: 3 },
      { kind: 'energy', value: 2 },
    ],
    exhaust: true,
  },
  {
    id: 'wild-rhapsody',
    name: '狂想曲',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 3 点能量，抽 2 张牌。',
    flavor: '「现在狂音焚诀」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'eternal-encore',
    name: '永恒安可',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '抽 3 张牌，回复 8 点生命。',
    flavor: '「安可！安可！再来一次」',
    effects: [
      { kind: 'draw', value: 3 },
      { kind: 'heal', value: 8 },
    ],
    exhaust: true,
  },
  {
    id: 'passion-burst',
    name: '激昂爆发',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 2 点能量，获得 3 层力量，抽 1 张牌。',
    flavor: '「激昂爆发，协奏的最强音」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'restful-soul',
    name: '休憩之魂',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 14 点格挡，回复 8 点生命。',
    flavor: '「休止符的终极形态」',
    effects: [
      { kind: 'block', value: 14 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'harmony-crown',
    name: '和音之冠',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '回复 10 点生命，抽 2 张牌。',
    flavor: '「和音之冠，最强治愈」',
    effects: [
      { kind: 'heal', value: 10 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'mad-song',
    name: '狂音·极',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 3 点能量，抽 1 张牌。',
    flavor: '「狂音的极致」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'concerto-field',
    name: '协奏领域',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '抽 2 张牌，获得 2 点能量，获得 10 点格挡。',
    flavor: '「协奏领域展开」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'draw', value: 1 },
      { kind: 'block', value: 10 },
    ]
  },
  {
    id: 'crescendo-max',
    name: '渐强·极',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 3 层力量，抽 2 张牌。',
    flavor: '「渐强到极致」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'soul-chorus',
    name: '灵魂合唱',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '回复 12 点生命，获得 1 点能量。',
    flavor: '「灵魂都在合唱」',
    effects: [
      { kind: 'heal', value: 12 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'tempo-master',
    name: '节奏大师',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '抽 3 张牌，获得 1 点能量。',
    flavor: '「掌握节奏，掌控全局」',
    effects: [
      { kind: 'draw', value: 3 },
      { kind: 'draw', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'passion-field',
    name: '热情领域',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 2 点能量，回复 8 点生命，抽 1 张牌。',
    flavor: '「热情挥洒的领域」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'heal', value: 8 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'finale-song',
    name: '终曲',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '抽 4 张牌。',
    flavor: '「终曲响起，安可！」',
    effects: [{ kind: 'draw', value: 4 }],
    exhaust: true,
  },
  {
    id: 'encore-plus',
    name: '安可·plus',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '抽 3 张牌，获得 1 点能量。',
    flavor: '「安可plus，能量拉满」',
    effects: [
      { kind: 'draw', value: 3 },
      { kind: 'draw', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'harmony-god',
    name: '和音之神',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '回复 8 点生命，抽 3 张牌。',
    flavor: '「和音之神降临」',
    effects: [
      { kind: 'heal', value: 8 },
      { kind: 'draw', value: 3 },
    ],
    exhaust: true,
  },
  {
    id: 'concerto-god',
    name: '协奏之神',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '抽 5 张牌，获得 3 点能量。',
    flavor: '「协奏之神的至高境界」',
    effects: [
      { kind: 'draw', value: 5 },
      { kind: 'draw', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'mad-song-god',
    name: '狂音之神',
    type: 'skill',
    rarity: 'legendary',
    cost: 4,
    text: '获得 4 点能量，抽 3 张牌。',
    flavor: '「狂音之神，安可永不停歇」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 3 },
    ],
    exhaust: true,
  },
  {
    id: 'eternal-harmony',
    name: '永恒和音',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '回复 19 点生命，获得 15 点格挡。',
    flavor: '「永恒和音，死不了」',
    effects: [
      { kind: 'heal', value: 19 },
      { kind: 'block', value: 15 },
    ],
    exhaust: true,
  },
  {
    id: 'passion-ultimate',
    name: '激昂·终焉',
    type: 'skill',
    rarity: 'legendary',
    cost: 4,
    text: '获得 3 点能量，获得 4 层力量，抽 3 张牌。',
    flavor: '「激昂的终焉，热情挥洒到极限」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 3 },
    ],
    exhaust: true,
  },
  {
    id: 'encore-eternal',
    name: '安可·永恒',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '抽 5 张牌，回复 10 点生命。',
    flavor: '「安可永恒，协奏永不停歇」',
    effects: [
      { kind: 'draw', value: 5 },
      { kind: 'heal', value: 10 },
    ],
    exhaust: true,
  },
  {
    id: 'song-strike',
    name: '音击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，抽 1 张牌。',
    flavor: '「音波打击」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'hymn',
    name: '圣歌',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 10 点生命。',
    flavor: '「圣歌治愈一切」',
    effects: [{ kind: 'heal', value: 10 }]
  },
  {
    id: 'lullaby',
    name: '摇篮曲',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，回复 5 点生命。',
    flavor: '「摇篮曲，安心入眠」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'fanfare',
    name: '号角',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 1 点能量，抽 1 张牌。',
    flavor: '「号角吹响，安可！」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'overture',
    name: '序曲',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 2 张牌，获得 8 点格挡。',
    flavor: '「序曲开场」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'block', value: 8 },
    ]
  },

  // ===== 主题1：光盾·防御反击（50张） =====
  {
    id: 'light-guard',
    name: '光盾守护',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 7 点格挡，造成 8 点伤害。',
    flavor: '「你是个光盾啊，守护队友」',
    effects: [
      { kind: 'block', value: 7 },
      { kind: 'damage', value: 8 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-wall',
    name: '光之壁',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 8 点格挡。',
    flavor: '「光已经比格挡硬了」',
    effects: [{ kind: 'block', value: 8 }],
    classId: 'lightshield'
  },
  {
    id: 'shield-strike',
    name: '盾击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，获得 6 点格挡。',
    flavor: '「盾砸脸不商量」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'block', value: 6 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'steadfast',
    name: '坚守',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 4 点格挡。',
    flavor: '「扛不住也要守」',
    effects: [{ kind: 'block', value: 4 }],
    classId: 'lightshield'
  },
  {
    id: 'light-repel',
    name: '光之反斥',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，造成 8 点伤害。',
    flavor: '「反震一下」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'damage', value: 8 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-step',
    name: '盾步',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，抽 1 张牌。',
    flavor: '「光盾体操基本步」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-fortify',
    name: '光明加护',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 8 点格挡。',
    flavor: '「光盾一开就不会死」——星落',
    effects: [{ kind: 'block', value: 8 }],
    classId: 'lightshield'
  },
  {
    id: 'shield-brace',
    name: '持盾',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 3 点格挡，抽 1 张牌。',
    flavor: '「持盾等待反击时机」',
    effects: [
      { kind: 'block', value: 3 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-bash',
    name: '光盾冲撞',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 10 点伤害，获得 6 点格挡。',
    flavor: '「光盾也能冲」',
    effects: [
      { kind: 'damage', value: 10 },
      { kind: 'block', value: 6 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'stand-guard',
    name: '站定护卫',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 7 点格挡，获得 1 层敏捷。',
    flavor: '「站定了就不动」',
    effects: [
      { kind: 'block', value: 7 },
      { kind: 'applyStatus', value: 1, status: 'dexterity', statusTarget: 'self' },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-resolve-strike',
    name: '光明决意·击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，造成 14 点伤害。',
    flavor: '「光明决心+职责+R」——星落',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'damage', value: 14 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'duty-shield',
    name: '职责之盾',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 14 点格挡，回复 5 点生命。',
    flavor: '「决心没了就开职责+R」',
    effects: [
      { kind: 'block', value: 14 },
      { kind: 'heal', value: 5 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-slam-heavy',
    name: '盾猛',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，造成 16 点伤害。',
    flavor: '「盾猛一击，防盾霸权」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'damage', value: 16 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'resolve-cycle-skill',
    name: '决心循环',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 10 点格挡，抽 1 张牌，获得 1 点能量。',
    flavor: '「光盾做体操，决心常驻」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-fortress',
    name: '光之堡垒',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 14 点格挡。',
    flavor: '「光盾比格挡硬多了」',
    effects: [{ kind: 'block', value: 14 }],
    classId: 'lightshield'
  },
  {
    id: 'parry-riposte',
    name: '格挡反击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，造成 15 点伤害。',
    flavor: '「扛住了就反打」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'damage', value: 15 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-dex',
    name: '光之灵动',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，获得 2 层敏捷。',
    flavor: '「光盾不笨重」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-energize',
    name: '盾能转换',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，获得 1 点能量。',
    flavor: '「盾也能充能」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'defensive-stance',
    name: '防御姿态',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 10 点格挡，抽 1 张牌。',
    flavor: '「光盾体操第一式」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-heal',
    name: '盾愈',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，回复 6 点生命。',
    flavor: '「盾也能奶」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'heal', value: 6 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-bulwark',
    name: '光之壁垒',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 12 点格挡，获得 2 层再生。',
    flavor: '「壁垒稳固，持续回复」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'applyStatus', value: 2, status: 'regen', statusTarget: 'self' },
    ],
    classId: 'lightshield'
  },
  {
    id: 'counter-blow',
    name: '反震猛击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，造成 17 点伤害。',
    flavor: '「反震一下，很疼」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'damage', value: 17 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-mastery',
    name: '盾术精通',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 9 点格挡，获得 2 层敏捷。',
    flavor: '「光盾精修中」',
    effects: [
      { kind: 'block', value: 9 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ],
    classId: 'lightshield'
  },
  {
    id: 'resolve-draw',
    name: '决心抽牌',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，抽 2 张牌。',
    flavor: '「做操抽牌两不误」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 2 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-shield-cant-break',
    name: '光盾不破',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 14 点格挡。',
    flavor: '「光盾开了就破不了」',
    effects: [{ kind: 'block', value: 14 }],
    classId: 'lightshield'
  },
  {
    id: 'light-judgment',
    name: '光之审判',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '获得 12 点格挡，造成 22 点伤害，回复 8 点生命。',
    flavor: '「光之审判，一举三得」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'damage', value: 22 },
      { kind: 'heal', value: 8 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'resolve-permanent',
    name: '决心常驻',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 14 点格挡，获得 1 点能量，抽 1 张牌。',
    flavor: '「思维减CD做到决心常驻」——星落',
    effects: [
      { kind: 'block', value: 14 },
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-avenger',
    name: '盾之复仇',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 28 点伤害，获得 10 点格挡。',
    flavor: '「你打我盾，我砸你脸」',
    effects: [
      { kind: 'damage', value: 28 },
      { kind: 'block', value: 10 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-immortal',
    name: '光明不灭',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 18 点格挡，获得 3 层敏捷。',
    flavor: '「光盾不会死的」——坠明',
    effects: [
      { kind: 'block', value: 18 },
      { kind: 'applyStatus', value: 3, status: 'dexterity', statusTarget: 'self' },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-barrage',
    name: '盾阵连击',
    type: 'attack',
    rarity: 'epic',
    cost: 2,
    text: '获得 10 点格挡，造成 22 点伤害 2 次。',
    flavor: '「盾猛连连」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'damage', value: 22, hits: 2 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'resolve-grand',
    name: '大决心',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 20 点格挡，回复 8 点生命。',
    flavor: '「光盾光明决心一开就不会死」',
    effects: [
      { kind: 'block', value: 20 },
      { kind: 'heal', value: 8 },
    ],
    classId: 'lightshield',
    exhaust: true,
  },
  {
    id: 'light-counter-all',
    name: '光反全场',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '获得 10 点格挡，对所有敌人造成 22 点伤害。',
    flavor: '「光盾反全场」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'damageAll', value: 22 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-vitality-grand',
    name: '盾体大成',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 12 点格挡，最大生命 +6，回复 8 点生命。',
    flavor: '「盾兵有生命上限扩容呀」——哎呦喂',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'maxHp', value: 6 },
      { kind: 'heal', value: 8 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'resolve-flow',
    name: '决心流转',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 10 点格挡，获得 2 点能量。',
    flavor: '「决心循环不止」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-explosion',
    name: '盾爆',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '获得 10 点格挡，造成 32 点伤害。',
    flavor: '「盾牌炸裂，一击必杀」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'damage', value: 32 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-dex-wall',
    name: '光敏壁垒',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 10 点格挡，获得 3 层敏捷。',
    flavor: '「光盾叠敏捷更硬」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'applyStatus', value: 3, status: 'dexterity', statusTarget: 'self' },
    ],
    classId: 'lightshield'
  },
  {
    id: 'resolve-draw-cycle',
    name: '决心抽牌循环',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 10 点格挡，抽 3 张牌。',
    flavor: '「做操抽牌循环帝」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'draw', value: 3 },
    ],
    classId: 'lightshield',
    exhaust: true,
  },
  {
    id: 'shield-thunder',
    name: '盾雷',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '获得 12 点格挡，造成 26 点伤害。',
    flavor: '「盾也能打雷」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'damage', value: 26 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-barrier-all',
    name: '光罩全场',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 12 点格挡，回复 8 点生命，抽 1 张牌。',
    flavor: '「光罩打开，无所畏惧」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'heal', value: 8 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'ultimate-guard',
    name: '终极守护',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 20 点格挡。',
    flavor: '「我就是终极坦克」——哎呦喂',
    effects: [{ kind: 'block', value: 20 }],
    classId: 'lightshield',
    exhaust: true,
  },
  {
    id: 'light-sanctuary',
    name: '光之圣所',
    type: 'skill',
    rarity: 'legendary',
    cost: 4,
    text: '获得 24 点格挡，回复 12 点生命，获得 4 层再生。',
    flavor: '「光盾不死圣所」——坠明',
    effects: [
      { kind: 'block', value: 24 },
      { kind: 'heal', value: 12 },
      { kind: 'applyStatus', value: 4, status: 'regen', statusTarget: 'self' },
    ],
    classId: 'lightshield',
    exhaust: true,
  },
  {
    id: 'shield-apocalypse',
    name: '盾之终焉',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '获得 16 点格挡，造成 50 点伤害。',
    flavor: '「盾之终焉，一击终结」',
    effects: [
      { kind: 'block', value: 16 },
      { kind: 'damage', value: 50 },
    ],
    classId: 'lightshield',
    exhaust: true,
  },
  {
    id: 'eternal-resolve',
    name: '永恒决心',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '获得 18 点格挡，获得 2 点能量，抽 2 张牌。',
    flavor: '「永恒决心，循环不止」',
    effects: [
      { kind: 'block', value: 18 },
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 2 },
    ],
    classId: 'lightshield',
    exhaust: true,
  },
  {
    id: 'light-annihilation',
    name: '光之寂灭',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '获得 15 点格挡，造成 45 点伤害，回复 10 点生命。',
    flavor: '「光之寂灭，盾中王者」',
    effects: [
      { kind: 'block', value: 15 },
      { kind: 'damage', value: 45 },
      { kind: 'heal', value: 10 },
    ],
    classId: 'lightshield',
    exhaust: true,
  },
  {
    id: 'shield-god-descend',
    name: '盾神降临',
    type: 'skill',
    rarity: 'legendary',
    cost: 5,
    text: '获得 28 点格挡，最大生命 +8。',
    flavor: '「盾神降世，百战不殆」',
    effects: [
      { kind: 'block', value: 28 },
      { kind: 'maxHp', value: 8 },
    ],
    classId: 'lightshield',
    exhaust: true,
  },
  {
    id: 'light-emergency',
    name: '紧急光盾',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 4 点格挡。',
    flavor: '「紧急时刻开盾保命」',
    effects: [{ kind: 'block', value: 4 }],
    classId: 'lightshield'
  },
  {
    id: 'shield-oath',
    name: '盾之誓约',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，失去 2 点生命。',
    flavor: '「誓约之盾，以血为契」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'heal', value: -2 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'light-gym-master',
    name: '光盾体操大师',
    type: 'skill',
    rarity: 'epic',
    cost: 1,
    text: '获得 10 点格挡，抽 2 张牌，获得 1 点能量。',
    flavor: '「光盾体操做到极致」——星落',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'draw', value: 2 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'last-stand-shield',
    name: '绝地光盾',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 10 点格挡，失去 3 点生命。',
    flavor: '「绝境中光盾升起」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'heal', value: -3 },
    ],
    classId: 'lightshield'
  },
  {
    id: 'shield-gym-combo',
    name: '光盾连操',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，抽 1 张牌。',
    flavor: '「起手体操不能停」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 1 },
    ],
    classId: 'lightshield'
  },

  // ===== 主题2：炎角·火焰爆发（50张） =====
  {
    id: 'flame-strike',
    name: '炎击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 10 点伤害。',
    flavor: '「炎角一击」',
    effects: [{ kind: 'damage', value: 10 }],
    classId: 'flame'
  },
  {
    id: 'flame-spark',
    name: '炎星',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 2 层燃烧。',
    flavor: '「星火220」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-ignite',
    name: '点燃',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '对敌人施加 2 层燃烧。',
    flavor: '「点燃一切」',
    effects: [{ kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' }],
    classId: 'flame'
  },
  {
    id: 'flame-claw',
    name: '炎爪',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 9 点伤害，对敌人施加 1 层燃烧。',
    flavor: '「炎角一爪」',
    effects: [
      { kind: 'damage', value: 9 },
      { kind: 'applyStatus', value: 1, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-breath',
    name: '炎息',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 2 层燃烧。',
    flavor: '「炎息吐纳」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-touch',
    name: '灼烧之触',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '对敌人施加 2 层燃烧。',
    flavor: '「触之即燃」',
    effects: [{ kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' }],
    classId: 'flame'
  },
  {
    id: 'flame-kick',
    name: '炎踢',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 11 点伤害。',
    flavor: '「炎角一踢」',
    effects: [{ kind: 'damage', value: 11 }],
    classId: 'flame'
  },
  {
    id: 'ember-blast',
    name: '余烬爆',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，对敌人施加 2 层燃烧。',
    flavor: '「余烬不灭」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-core',
    name: '炎核',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '对敌人施加 2 层燃烧，获得 1 层力量。',
    flavor: '「炎角核心」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 1, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-blast',
    name: '燃爆',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 10 点伤害，对敌人施加 1 层燃烧。',
    flavor: '「燃爆出声响」',
    effects: [
      { kind: 'damage', value: 10 },
      { kind: 'applyStatus', value: 1, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-burst-storm',
    name: '爆炎',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害，对所有敌人施加 2 层燃烧。',
    flavor: '「爆炎全场」',
    effects: [
      { kind: 'damageAll', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy', all: true },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-slash',
    name: '炎斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，对敌人施加 3 层燃烧。',
    flavor: '「炎斩一刀切」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-art-rare',
    name: '焚诀·真',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 4 层燃烧。',
    flavor: '「现在狂音焚诀」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-demon-fury',
    name: '火魔之怒',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 18 点伤害，失去 3 点生命。',
    flavor: '「火魔需要母头天菜狐狸炎角」',
    effects: [
      { kind: 'damage', value: 18 },
      { kind: 'heal', value: -3 },
    ],
    classId: 'flame'
  },
  {
    id: 'ground-fire-rare',
    name: '地火·炎',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人施加 4 层燃烧，获得 8 点格挡。',
    flavor: '「地火只有赤红能硬吃」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy', all: true },
      { kind: 'block', value: 8 },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-dance-rare',
    name: '炎舞',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害，对所有敌人施加 4 层燃烧。',
    flavor: '「一直触发10秒的炎舞增伤」',
    effects: [
      { kind: 'damageAll', value: 14 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy', all: true },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-through',
    name: '烧穿',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 4 层燃烧，对敌人施加 2 层易伤。',
    flavor: '「烧穿一切防御」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-horn-strength',
    name: '炎角力量',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '对敌人施加 3 层燃烧，获得 3 层力量。',
    flavor: '「做个炎角就是惩击」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'flame'
  },
  {
    id: 'fire-demon-possession',
    name: '火魔附体',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对敌人施加 4 层燃烧，获得 8 点格挡。',
    flavor: '「火魔附体，燃烧不止」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
      { kind: 'block', value: 8 },
    ],
    classId: 'flame'
  },
  {
    id: 'star-fire-spread-rare',
    name: '星火燎原',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对所有敌人施加 3 层燃烧。',
    flavor: '「星火加坠星宿命」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy', all: true },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-cross-slash',
    name: '十字炎斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 2 次，对敌人施加 3 层燃烧。',
    flavor: '「打个十字打个地火然后开砍」',
    effects: [
      { kind: 'damage', value: 13, hits: 2 },
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-pact',
    name: '灼烧契约',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '对敌人施加 3 层燃烧，抽 1 张牌。',
    flavor: '「我已灼烧」——地上答辩',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-energy',
    name: '炎能',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '对敌人施加 3 层燃烧，获得 2 点能量。',
    flavor: '「炎角的能量」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-finish-rare',
    name: '焚尽',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 4 层燃烧。',
    flavor: '「焚尽一切余烬」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-rush',
    name: '炎冲',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 20 点伤害，对敌人施加 2 层燃烧。',
    flavor: '「炎角冲锋」',
    effects: [
      { kind: 'damage', value: 20 },
      { kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-blade',
    name: '烈焰斩',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 24 点伤害，对敌人施加 5 层燃烧。',
    flavor: '「烈焰斩一刀封喉」',
    effects: [
      { kind: 'damage', value: 24 },
      { kind: 'applyStatus', value: 5, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'volcano-burst',
    name: '火山爆发',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 4 层燃烧。',
    flavor: '「火山爆发，熔岩四溅」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy', all: true },
    ],
    classId: 'flame'
  },
  {
    id: 'hellfire',
    name: '地狱火',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 30 点伤害，失去 6 点生命。',
    flavor: '「地狱火焚烧自身」',
    effects: [
      { kind: 'damage', value: 30 },
      { kind: 'heal', value: -6 },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-dance-epic',
    name: '炎舞·极',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人施加 6 层燃烧，获得 2 点能量。',
    flavor: '「炎舞增伤没有内置CD」',
    effects: [
      { kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy', all: true },
      { kind: 'block', value: 5 },
    ],
    classId: 'flame'
  },
  {
    id: 'sixty-fire-damage',
    name: '60%火伤',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 22 点伤害，对敌人施加 5 层燃烧，获得 3 层力量。',
    flavor: '「直接60%火伤 这么哈人」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'applyStatus', value: 5, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'flame'
  },
  {
    id: 'fireball-boom-epic',
    name: '火球秒炸',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 26 点伤害，对敌人施加 4 层燃烧。',
    flavor: '「转阶段火球秒炸」',
    effects: [
      { kind: 'damage', value: 26 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-apocalypse',
    name: '焚绝',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 22 点伤害，对敌人施加 6 层燃烧，对敌人施加 3 层易伤。',
    flavor: '「巨塔不是出焚绝了吗」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 3, status: 'vuln', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-storm',
    name: '炎角风暴',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 6 层燃烧。',
    flavor: '「炎角掀起火焰风暴」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy', all: true },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-rhapsody-epic',
    name: '烈焰狂想',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 28 点伤害，回复 8 点生命。',
    flavor: '「烈焰狂想：攻击力=0.6x急速%」',
    effects: [
      { kind: 'damage', value: 28 },
      { kind: 'heal', value: 8 },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-dragon',
    name: '炎龙',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 32 点伤害，对敌人施加 4 层燃烧。',
    flavor: '「炎龙咆哮」',
    effects: [
      { kind: 'damage', value: 32 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-strength-combo',
    name: '炎角·力燃',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '对敌人施加 5 层燃烧，获得 3 层力量。',
    flavor: '「燃烧即力量」',
    effects: [
      { kind: 'applyStatus', value: 5, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-annihilation',
    name: '炎之寂灭',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 34 点伤害，对敌人施加 6 层燃烧，失去 4 点生命。',
    flavor: '「寂灭之火」',
    effects: [
      { kind: 'damage', value: 34 },
      { kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy' },
      { kind: 'heal', value: -4 },
    ],
    classId: 'flame'
  },
  {
    id: 'million-dot-burn',
    name: '百万DOT',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人施加 6 层燃烧。',
    flavor: '「百万秒伤的dot」——Ephyra',
    effects: [{ kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy', all: true }],
    classId: 'flame'
  },
  {
    id: 'flame-phoenix',
    name: '炎凰',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 24 点伤害，回复 10 点生命，获得 3 层力量。',
    flavor: '「炎凰涅槃」',
    effects: [
      { kind: 'damage', value: 24 },
      { kind: 'heal', value: 10 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-earth-epic',
    name: '燃尽大地',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 6 层燃烧，获得 1 点能量。',
    flavor: '「燃尽大地，寸草不生」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy', all: true },
      { kind: 'block', value: 5 },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-dance-legend',
    name: '炎舞·终极',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '对所有敌人施加 9 层燃烧，对所有敌人造成 35 点伤害，获得 3 点能量。',
    flavor: '「炎舞终极：烧尽全场」',
    effects: [
      { kind: 'applyStatus', value: 9, status: 'burn', statusTarget: 'enemy', all: true },
      { kind: 'damageAll', value: 35 },
      { kind: 'block', value: 5 },
    ],
    classId: 'flame',
    exhaust: true,
  },
  {
    id: 'hellfire-legend',
    name: '地狱火·终极',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 55 点伤害，失去 10 点生命，对敌人施加 8 层燃烧。',
    flavor: '「地狱业火，焚尽自身」',
    effects: [
      { kind: 'damage', value: 55 },
      { kind: 'heal', value: -10 },
      { kind: 'applyStatus', value: 8, status: 'burn', statusTarget: 'enemy' },
    ],
    classId: 'flame',
    exhaust: true,
  },
  {
    id: 'flame-god-descend',
    name: '炎神降临',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 60 点伤害，对所有敌人施加 6 层燃烧。',
    flavor: '「炎神降临，万火焚天」',
    effects: [
      { kind: 'damage', value: 60 },
      { kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy', all: true },
    ],
    classId: 'flame',
    exhaust: true,
  },
  {
    id: 'eternal-burn',
    name: '永恒燃烧',
    type: 'skill',
    rarity: 'legendary',
    cost: 4,
    text: '对所有敌人施加 9 层燃烧，获得 4 层力量。',
    flavor: '「永恒不灭的火焰」',
    effects: [
      { kind: 'applyStatus', value: 9, status: 'burn', statusTarget: 'enemy', all: true },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    classId: 'flame',
    exhaust: true,
  },
  {
    id: 'flame-apocalypse',
    name: '炎之终焉',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 65 点伤害，对敌人施加 8 层燃烧，回复 10 点生命。',
    flavor: '「炎之终焉，万象焚尽」',
    effects: [
      { kind: 'damage', value: 65 },
      { kind: 'applyStatus', value: 8, status: 'burn', statusTarget: 'enemy' },
      { kind: 'heal', value: 10 },
    ],
    classId: 'flame',
    exhaust: true,
  },
  {
    id: 'flame-spark-zero',
    name: '火种',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '对敌人施加 2 层燃烧。',
    flavor: '「星星之火」',
    effects: [{ kind: 'applyStatus', value: 2, status: 'burn', statusTarget: 'enemy' }],
    classId: 'flame'
  },
  {
    id: 'burn-oath-zero',
    name: '灼烧誓约',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '对敌人施加 3 层燃烧，失去 2 点生命。',
    flavor: '「以血为薪」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
      { kind: 'heal', value: -2 },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-horn-power-zero',
    name: '炎角之力',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '对敌人施加 1 层燃烧，获得 1 点能量。',
    flavor: '「做个炎角就是惩击」',
    effects: [
      { kind: 'applyStatus', value: 1, status: 'burn', statusTarget: 'enemy' },
      { kind: 'draw', value: 1 },
    ],
    classId: 'flame'
  },
  {
    id: 'burn-finish-zero',
    name: '焚尽·残火',
    type: 'skill',
    rarity: 'epic',
    cost: 1,
    text: '对敌人施加 4 层燃烧，失去 4 点生命。',
    flavor: '「焚尽一切，不惜自身」',
    effects: [
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
      { kind: 'heal', value: -4 },
    ],
    classId: 'flame'
  },
  {
    id: 'flame-demon-mark',
    name: '火魔印记',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '对敌人施加 3 层燃烧，获得 2 层力量，失去 2 点生命。',
    flavor: '「火魔印记烙下」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'heal', value: -2 },
    ],
    classId: 'flame'
  },

  // ===== 主题3：无相·变身适应（50张） =====
  {
    id: 'no-phase-fist',
    name: '无相拳',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 9 点伤害。',
    flavor: '「无相一拳」',
    effects: [{ kind: 'damage', value: 9 }]
  },
  {
    id: 'no-phase-kick',
    name: '无相踢',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 10 点伤害。',
    flavor: '「无相一踢」',
    effects: [{ kind: 'damage', value: 10 }]
  },
  {
    id: 'no-phase-block',
    name: '无相格挡',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡。',
    flavor: '「无相防御」',
    effects: [{ kind: 'block', value: 6 }]
  },
  {
    id: 'no-phase-strike',
    name: '无相击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，获得 6 点格挡。',
    flavor: '「攻守一体」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'block', value: 6 },
    ]
  },
  {
    id: 'no-phase-draw',
    name: '无相感知',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '抽 2 张牌。',
    flavor: '「无相觉知」',
    effects: [{ kind: 'draw', value: 2 }]
  },
  {
    id: 'no-phase-heal',
    name: '无相愈合',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '回复 6 点生命。',
    flavor: '「无相自愈」',
    effects: [{ kind: 'heal', value: 6 }]
  },
  {
    id: 'no-phase-dodge',
    name: '无相闪避',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 6 点格挡，抽 1 张牌。',
    flavor: '「闪避即攻击」',
    effects: [
      { kind: 'block', value: 6 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'no-phase-energy',
    name: '无相聚气',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 1 点能量。',
    flavor: '「聚气于无形」',
    effects: [{ kind: 'draw', value: 1 }]
  },
  {
    id: 'no-phase-dual',
    name: '无相二段',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害 2 次。',
    flavor: '「二段无相」',
    effects: [{ kind: 'damage', value: 8, hits: 2 }]
  },
  {
    id: 'no-phase-buff',
    name: '无相强化',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 1 层力量。',
    flavor: '「强化自身」',
    effects: [{ kind: 'applyStatus', value: 1, status: 'strength', statusTarget: 'self' }]
  },
  {
    id: 'no-phase-slash',
    name: '无相斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害。',
    flavor: '「无相一刀斩」',
    effects: [{ kind: 'damage', value: 16 }]
  },
  {
    id: 'form-shift',
    name: '形态切换',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，获得 2 层力量。',
    flavor: '「切换形态，攻守兼备」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'no-phase-fire-slash',
    name: '无相火斩',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 3 层燃烧。',
    flavor: '「无相火斩：技能倍率x(20%+精通%)」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'void-step',
    name: '虚空步',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，抽 1 张牌。',
    flavor: '「虚空中漫步」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'no-phase-freeze',
    name: '无相冰封',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 2 层冰冻。',
    flavor: '「无相化冰」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'freeze', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'no-phase-shock',
    name: '无相雷击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 2 层感电。',
    flavor: '「无相化雷」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 2, status: 'shock', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'form-adapt',
    name: '形态适应',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，获得 2 层敏捷，抽 1 张牌。',
    flavor: '「适应一切形态」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'no-phase-burn',
    name: '无相灼烧',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 3 层燃烧。',
    flavor: '「无相之火」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'burn', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'no-phase-vuln',
    name: '无相破绽',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '对敌人施加 2 层易伤，抽 1 张牌。',
    flavor: '「无相见破绽」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'no-phase-regen',
    name: '无相再生',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 8 点生命，获得 2 层再生。',
    flavor: '「无相不息」',
    effects: [
      { kind: 'heal', value: 8 },
      { kind: 'applyStatus', value: 2, status: 'regen', statusTarget: 'self' },
    ]
  },
  {
    id: 'no-phase-weak',
    name: '无相虚弱',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '对敌人施加 3 层虚弱，获得 2 层敏捷。',
    flavor: '「无相弱化」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'weak', statusTarget: 'enemy' },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'no-phase-combo',
    name: '无相连击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 13 点伤害 3 次。',
    flavor: '「无相三段击」',
    effects: [{ kind: 'damage', value: 13, hits: 3 }]
  },
  {
    id: 'void-energy',
    name: '虚空能量',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 点能量，回复 5 点生命。',
    flavor: '「虚空中汲取能量」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'no-phase-multi',
    name: '无相多重',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害。',
    flavor: '「无相化身万千」',
    effects: [{ kind: 'damageAll', value: 14 }]
  },
  {
    id: 'no-phase-strength',
    name: '无相增力',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层力量，获得 2 层敏捷。',
    flavor: '「无相强化全身」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'no-phase-storm',
    name: '无相风暴',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害。',
    flavor: '「无相风暴席卷」',
    effects: [{ kind: 'damageAll', value: 22 }]
  },
  {
    id: 'ego-less',
    name: '无我境界',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 26 点伤害，获得 10 点格挡。',
    flavor: '「无我之境，万象皆空」',
    effects: [
      { kind: 'damage', value: 26 },
      { kind: 'block', value: 10 },
    ]
  },
  {
    id: 'no-phase-incarnation',
    name: '无相化身',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 12 点格挡，造成 22 点伤害，抽 1 张牌。',
    flavor: '「无相化身千万」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'damage', value: 22 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'void-blade',
    name: '虚空之刃',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 30 点伤害，对敌人施加 3 层易伤。',
    flavor: '「虚空刃斩破一切」',
    effects: [
      { kind: 'damage', value: 30 },
      { kind: 'applyStatus', value: 3, status: 'vuln', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'form-master',
    name: '形态大师',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 10 点格挡，获得 3 层力量，抽 1 张牌。',
    flavor: '「形态切换自如」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'no-phase-all-burn',
    name: '无相业火',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害，对所有敌人施加 5 层燃烧。',
    flavor: '「无相之火燃遍」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'applyStatus', value: 5, status: 'burn', statusTarget: 'enemy', all: true },
    ]
  },
  {
    id: 'void-shield',
    name: '虚空之盾',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 16 点格挡，回复 8 点生命。',
    flavor: '「虚空护体」',
    effects: [
      { kind: 'block', value: 16 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'no-phase-omni',
    name: '无相万象',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 24 点伤害，获得 10 点格挡，抽 1 张牌。',
    flavor: '「万象归一」',
    effects: [
      { kind: 'damage', value: 24 },
      { kind: 'block', value: 10 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'ego-less-strike',
    name: '无我之击',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 32 点伤害，获得 3 层力量。',
    flavor: '「无我击，粉碎一切」',
    effects: [
      { kind: 'damage', value: 32 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'no-phase-flow',
    name: '无相流转',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 2 点能量，抽 2 张牌，获得 10 点格挡。',
    flavor: '「流转万象」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 2 },
      { kind: 'block', value: 10 },
    ]
  },
  {
    id: 'void-step-master',
    name: '虚空步·极',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 12 点格挡，抽 2 张牌。',
    flavor: '「虚空中漫步自如」',
    effects: [
      { kind: 'block', value: 12 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'no-phase-thunder',
    name: '无相天雷',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 28 点伤害，对敌人施加 3 层感电。',
    flavor: '「天雷无相」',
    effects: [
      { kind: 'damage', value: 28 },
      { kind: 'applyStatus', value: 3, status: 'shock', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'no-phase-heal-all',
    name: '无相全愈',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '回复 14 点生命，获得 3 层再生。',
    flavor: '「万象愈合」',
    effects: [
      { kind: 'heal', value: 14 },
      { kind: 'applyStatus', value: 3, status: 'regen', statusTarget: 'self' },
    ]
  },
  {
    id: 'no-phase-storm-dual',
    name: '无相暴风',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 22 点伤害，获得 10 点格挡。',
    flavor: '「暴风中的无相」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'block', value: 10 },
    ]
  },
  {
    id: 'form-ultimate',
    name: '终极形态',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 3 层力量，获得 3 层敏捷，获得 10 点格挡。',
    flavor: '「究极形态切换」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 3, status: 'dexterity', statusTarget: 'self' },
      { kind: 'block', value: 10 },
    ]
  },
  {
    id: 'no-phase-god',
    name: '无相神化',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 45 点伤害，获得 15 点格挡，抽 1 张牌。',
    flavor: '「无相神化，万象归一」',
    effects: [
      { kind: 'damage', value: 45 },
      { kind: 'block', value: 15 },
      { kind: 'draw', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'void-annihilation',
    name: '虚空寂灭',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 60 点伤害，失去 8 点生命。',
    flavor: '「虚空寂灭，无我无相」',
    effects: [
      { kind: 'damage', value: 60 },
      { kind: 'heal', value: -8 },
    ],
    exhaust: true,
  },
  {
    id: 'ego-less-ultimate',
    name: '无我终极',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 48 点伤害，回复 12 点生命，获得 4 层力量。',
    flavor: '「无我之境，至高一击」',
    effects: [
      { kind: 'damage', value: 48 },
      { kind: 'heal', value: 12 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'no-phase-eternal',
    name: '无相永恒',
    type: 'skill',
    rarity: 'legendary',
    cost: 4,
    text: '获得 18 点格挡，抽 3 张牌，获得 2 点能量。',
    flavor: '「永恒的无相流转」',
    effects: [
      { kind: 'block', value: 18 },
      { kind: 'draw', value: 3 },
      { kind: 'draw', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'form-apotheosis',
    name: '形态封神',
    type: 'skill',
    rarity: 'legendary',
    cost: 5,
    text: '获得 22 点格挡，获得 4 层力量，获得 4 层敏捷。',
    flavor: '「形态封神，万物臣服」',
    effects: [
      { kind: 'block', value: 22 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 4, status: 'dexterity', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'no-phase-instant',
    name: '无相瞬动',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 3 点格挡，抽 1 张牌。',
    flavor: '「瞬发无相」',
    effects: [
      { kind: 'block', value: 3 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'void-touch',
    name: '虚空触',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 8 点格挡，失去 2 点生命。',
    flavor: '「虚空之触」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'heal', value: -2 },
    ]
  },
  {
    id: 'no-phase-sacrifice',
    name: '无相献祭',
    type: 'skill',
    rarity: 'epic',
    cost: 1,
    text: '失去 4 点生命，获得 3 点能量。',
    flavor: '「献祭以获能量」',
    effects: [
      { kind: 'heal', value: -4 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'no-phase-quick',
    name: '无相疾走',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层敏捷，抽 1 张牌。',
    flavor: '「疾走无形」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'no-phase-burst',
    name: '无相爆发',
    type: 'attack',
    rarity: 'rare',
    cost: 1,
    text: '造成 14 点伤害，失去 3 点生命。',
    flavor: '「无相瞬间爆发」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'heal', value: -3 },
    ]
  },

  // ===== 主题4：赤红·浴血奋战（50张） =====
  {
    id: 'crimson-slash-common',
    name: '赤斩',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 11 点伤害，失去 2 点生命。',
    flavor: '「赤斩出血」',
    effects: [
      { kind: 'damage', value: 11 },
      { kind: 'heal', value: -2 },
    ]
  },
  {
    id: 'crimson-bite',
    name: '赤咬',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 10 点伤害，回复 5 点生命。',
    flavor: '「赤红咬住吸血」',
    effects: [
      { kind: 'damage', value: 10 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'blood-price',
    name: '血之代价',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '失去 2 点生命，获得 2 层力量。',
    flavor: '「血战救了我！」——Ephyra',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'crimson-strike',
    name: '赤击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 9 点伤害，失去 1 点生命。',
    flavor: '「赤红一击」',
    effects: [
      { kind: 'damage', value: 9 },
      { kind: 'heal', value: -1 },
    ]
  },
  {
    id: 'blood-drain',
    name: '吸血',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 8 点伤害，回复 5 点生命。',
    flavor: '「赤红吸血」',
    effects: [
      { kind: 'damage', value: 8 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'crimson-pain',
    name: '赤痛',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '失去 3 点生命，获得 1 点能量。',
    flavor: '「痛苦即力量」',
    effects: [
      { kind: 'heal', value: -3 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'blood-fury',
    name: '血怒',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '失去 2 点生命，获得 2 层力量。',
    flavor: '「血怒冲天」',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'crimson-regen',
    name: '赤愈',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '回复 7 点生命。',
    flavor: '「赤红自愈」',
    effects: [{ kind: 'heal', value: 7 }]
  },
  {
    id: 'blood-rage',
    name: '浴血',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 11 点伤害，回复 5 点生命。',
    flavor: '「浴血奋战」',
    effects: [
      { kind: 'damage', value: 11 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'crimson-scar',
    name: '赤痕',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '失去 2 点生命，抽 2 张牌。',
    flavor: '「伤痕累累仍向前」',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'crimson-fury',
    name: '赤红之怒',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 18 点伤害，失去 4 点生命，获得 2 层力量。',
    flavor: '「赤红太变态了」——Ephyra',
    effects: [
      { kind: 'damage', value: 18 },
      { kind: 'heal', value: -4 },
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'blood-feast',
    name: '鲜血盛宴',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，回复 8 点生命。',
    flavor: '「鲜血即盛宴」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'crimson-pact',
    name: '赤之契约',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 4 点生命，获得 3 层力量。',
    flavor: '「以血为契，换取力量」',
    effects: [
      { kind: 'heal', value: -4 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'blood-storm',
    name: '赤红风暴',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害，失去 3 点生命。',
    flavor: '「血色风暴席卷」',
    effects: [
      { kind: 'damageAll', value: 14 },
      { kind: 'heal', value: -3 },
    ]
  },
  {
    id: 'crimson-memory',
    name: '鲜血记忆',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 3 点生命，获得 2 点能量，抽 1 张牌。',
    flavor: '「血之记忆永不灭」',
    effects: [
      { kind: 'heal', value: -3 },
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'crimson-drain',
    name: '赤吸',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，回复 7 点生命。',
    flavor: '「赤红汲取生命」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'heal', value: 7 },
    ]
  },
  {
    id: 'blood-berserk',
    name: '血狂',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 22 点伤害，失去 5 点生命。',
    flavor: '「血狂之力」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'heal', value: -5 },
    ]
  },
  {
    id: 'crimson-vitality',
    name: '赤红生命',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '最大生命 +4，回复 6 点生命，失去 3 点生命。',
    flavor: '「赤红的生命力」',
    effects: [
      { kind: 'maxHp', value: 4 },
      { kind: 'heal', value: 6 },
      { kind: 'heal', value: -3 },
    ]
  },
  {
    id: 'blood-shield',
    name: '血盾',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '失去 3 点生命，获得 12 点格挡。',
    flavor: '「以血铸盾」',
    effects: [
      { kind: 'heal', value: -3 },
      { kind: 'block', value: 12 },
    ]
  },
  {
    id: 'crimson-burn',
    name: '赤炎',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，对敌人施加 4 层燃烧，失去 2 点生命。',
    flavor: '「赤红之火」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'applyStatus', value: 4, status: 'burn', statusTarget: 'enemy' },
      { kind: 'heal', value: -2 },
    ]
  },
  {
    id: 'blood-surge',
    name: '血涌',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 2 点生命，获得 2 点能量，抽 1 张牌。',
    flavor: '「血液涌动」',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'crimson-revenge',
    name: '赤红复仇',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害，回复 5 点生命，失去 1 点生命。',
    flavor: '「赤红复仇，有来有回」',
    effects: [
      { kind: 'damage', value: 16 },
      { kind: 'heal', value: 5 },
      { kind: 'heal', value: -1 },
    ]
  },
  {
    id: 'blood-dex',
    name: '血敏',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 2 点生命，获得 2 层敏捷。',
    flavor: '「血中敏捷」',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'crimson-sweep',
    name: '赤扫',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害，失去 2 点生命，回复 5 点生命。',
    flavor: '「赤红横扫」',
    effects: [
      { kind: 'damageAll', value: 14 },
      { kind: 'heal', value: -2 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'blood-price-draw',
    name: '血价抽牌',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 2 点生命，抽 3 张牌。',
    flavor: '「以血换取手牌」',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'draw', value: 3 },
    ],
    exhaust: true,
  },
  {
    id: 'crimson-apotheosis',
    name: '赤红封神',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 30 点伤害，失去 6 点生命，获得 3 层力量。',
    flavor: '「赤红太变态了」——Ephyra',
    effects: [
      { kind: 'damage', value: 30 },
      { kind: 'heal', value: -6 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'blood-contract',
    name: '血之契约',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 28 点伤害，失去 8 点生命，回复 8 点生命，获得 3 层力量。',
    flavor: '「血契·生死与共」',
    effects: [
      { kind: 'damage', value: 28 },
      { kind: 'heal', value: -8 },
      { kind: 'heal', value: 8 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'crimson-armageddon',
    name: '赤红终焉',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害，失去 5 点生命，获得 3 层力量。',
    flavor: '「赤红的终焉风暴」',
    effects: [
      { kind: 'damageAll', value: 22 },
      { kind: 'heal', value: -5 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'blood-vortex',
    name: '血旋',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 26 点伤害，回复 12 点生命。',
    flavor: '「血之漩涡吸干一切」',
    effects: [
      { kind: 'damage', value: 26 },
      { kind: 'heal', value: 12 },
    ]
  },
  {
    id: 'crimson-sacrifice',
    name: '赤红献祭',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '失去 6 点生命，获得 4 层力量，获得 2 点能量。',
    flavor: '「献祭自己换取力量」',
    effects: [
      { kind: 'heal', value: -6 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'blood-moon',
    name: '血月',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 34 点伤害，失去 6 点生命，回复 8 点生命。',
    flavor: '「血红之月下」',
    effects: [
      { kind: 'damage', value: 34 },
      { kind: 'heal', value: -6 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'crimson-immortal',
    name: '赤红不死',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '回复 16 点生命，获得 10 点格挡，失去 3 点生命。',
    flavor: '「赤红不会死的」',
    effects: [
      { kind: 'heal', value: 16 },
      { kind: 'block', value: 10 },
      { kind: 'heal', value: -3 },
    ],
    exhaust: true,
  },
  {
    id: 'blood-scorch',
    name: '血焚',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 24 点伤害，对敌人施加 6 层燃烧，失去 4 点生命。',
    flavor: '「以血为薪，焚尽万物」',
    effects: [
      { kind: 'damage', value: 24 },
      { kind: 'applyStatus', value: 6, status: 'burn', statusTarget: 'enemy' },
      { kind: 'heal', value: -4 },
    ]
  },
  {
    id: 'crimson-avalanche',
    name: '赤红崩',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 32 点伤害，失去 5 点生命。',
    flavor: '「赤红崩塌一击」',
    effects: [
      { kind: 'damage', value: 32 },
      { kind: 'heal', value: -5 },
    ]
  },
  {
    id: 'blood-awakening',
    name: '血之觉醒',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '失去 4 点生命，获得 3 层力量，获得 3 层敏捷。',
    flavor: '「觉醒的血液」',
    effects: [
      { kind: 'heal', value: -4 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 3, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'crimson-glutton',
    name: '赤红暴食',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 22 点伤害，回复 14 点生命。',
    flavor: '「暴食一切生命」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'heal', value: 14 },
    ]
  },
  {
    id: 'blood-chain',
    name: '血链',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 28 点伤害，失去 4 点生命，回复 8 点生命。',
    flavor: '「血之连锁」',
    effects: [
      { kind: 'damage', value: 28 },
      { kind: 'heal', value: -4 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'crimson-punish',
    name: '赤红惩戒',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 36 点伤害，失去 8 点生命。',
    flavor: '「赤红的惩戒」',
    effects: [
      { kind: 'damage', value: 36 },
      { kind: 'heal', value: -8 },
    ],
    exhaust: true,
  },
  {
    id: 'blood-fortress',
    name: '血之堡垒',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '失去 3 点生命，获得 16 点格挡，回复 8 点生命。',
    flavor: '「血铸堡垒」',
    effects: [
      { kind: 'heal', value: -3 },
      { kind: 'block', value: 16 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'crimson-rebirth',
    name: '赤红重生',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '回复 18 点生命，获得 3 层再生。',
    flavor: '「赤红浴血重生」',
    effects: [
      { kind: 'heal', value: 18 },
      { kind: 'applyStatus', value: 3, status: 'regen', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'crimson-legend',
    name: '赤红传说',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 50 点伤害，失去 10 点生命，获得 4 层力量。',
    flavor: '「赤红太变态了」——Ephyra',
    effects: [
      { kind: 'damage', value: 50 },
      { kind: 'heal', value: -10 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'blood-apocalypse',
    name: '血之终焉',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 60 点伤害，回复 15 点生命。',
    flavor: '「血终焉，吞噬一切」',
    effects: [
      { kind: 'damage', value: 60 },
      { kind: 'heal', value: 15 },
    ],
    exhaust: true,
  },
  {
    id: 'crimson-god',
    name: '赤红神',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 45 点伤害，失去 8 点生命，回复 12 点生命，获得 4 层力量。',
    flavor: '「赤红成神」',
    effects: [
      { kind: 'damage', value: 45 },
      { kind: 'heal', value: -8 },
      { kind: 'heal', value: 12 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'blood-eternal',
    name: '永恒之血',
    type: 'skill',
    rarity: 'legendary',
    cost: 4,
    text: '最大生命 +10，回复 18 点生命，失去 6 点生命。',
    flavor: '「永恒血液流淌」',
    effects: [
      { kind: 'maxHp', value: 10 },
      { kind: 'heal', value: 18 },
      { kind: 'heal', value: -6 },
    ],
    exhaust: true,
  },
  {
    id: 'crimson-sacrifice-ultimate',
    name: '赤红献祭·终',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '造成 65 点伤害，失去 12 点生命，获得 4 层力量。',
    flavor: '「献祭一切，终极一击」',
    effects: [
      { kind: 'damage', value: 65 },
      { kind: 'heal', value: -12 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'crimson-bloodlet',
    name: '赤红放血',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '失去 2 点生命，获得 1 点能量，抽 1 张牌。',
    flavor: '「放血换取资源」',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'blood-eco',
    name: '血之经济',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 3 点生命，获得 2 点能量。',
    flavor: '「血液即货币」',
    effects: [
      { kind: 'heal', value: -3 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'crimson-quick',
    name: '赤红疾走',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '失去 2 点生命，获得 2 层敏捷，抽 1 张牌。',
    flavor: '「以血换速」',
    effects: [
      { kind: 'heal', value: -2 },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'blood-surge-zero',
    name: '血涌·零',
    type: 'skill',
    rarity: 'epic',
    cost: 1,
    text: '失去 5 点生命，获得 3 点能量。',
    flavor: '「血涌如潮」',
    effects: [
      { kind: 'heal', value: -5 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'crimson-last-breath',
    name: '赤红绝息',
    type: 'attack',
    rarity: 'epic',
    cost: 1,
    text: '造成 22 点伤害，失去 6 点生命。',
    flavor: '「最后一息」',
    effects: [
      { kind: 'damage', value: 22 },
      { kind: 'heal', value: -6 },
    ]
  },

  // ===== 主题5：通用·灵活万用（50张） =====
  {
    id: 'universal-block',
    name: '通用格挡',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 7 点格挡。',
    flavor: '「万金油格挡」',
    effects: [{ kind: 'block', value: 7 }]
  },
  {
    id: 'universal-draw',
    name: '通用抽牌',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '抽 2 张牌。',
    flavor: '「工具人抽牌」',
    effects: [{ kind: 'draw', value: 2 }]
  },
  {
    id: 'universal-energy',
    name: '通用能量',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 1 点能量。',
    flavor: '「百搭充能」',
    effects: [{ kind: 'draw', value: 1 }]
  },
  {
    id: 'universal-strength',
    name: '通用力量',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 2 层力量。',
    flavor: '「万物皆可力量」',
    effects: [{ kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' }]
  },
  {
    id: 'universal-dex',
    name: '通用敏捷',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '获得 2 层敏捷。',
    flavor: '「万物皆可敏捷」',
    effects: [{ kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' }]
  },
  {
    id: 'universal-vuln',
    name: '通用易伤',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '对敌人施加 2 层易伤。',
    flavor: '「通用破甲」',
    effects: [{ kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy' }]
  },
  {
    id: 'universal-weak',
    name: '通用虚弱',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '对敌人施加 2 层虚弱。',
    flavor: '「通用减攻」',
    effects: [{ kind: 'applyStatus', value: 2, status: 'weak', statusTarget: 'enemy' }]
  },
  {
    id: 'universal-heal',
    name: '通用治疗',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    text: '回复 7 点生命。',
    flavor: '「万金油治疗」',
    effects: [{ kind: 'heal', value: 7 }]
  },
  {
    id: 'universal-strike',
    name: '通用攻击',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    text: '造成 9 点伤害。',
    flavor: '「百搭攻击」',
    effects: [{ kind: 'damage', value: 9 }]
  },
  {
    id: 'universal-zero',
    name: '通用零费',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 4 点格挡。',
    flavor: '「零费万金油」',
    effects: [{ kind: 'block', value: 4 }]
  },
  {
    id: 'universal-purge',
    name: '通用净化',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 8 点生命，抽 1 张牌。',
    flavor: '「万金油净化」',
    effects: [
      { kind: 'heal', value: 8 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'universal-discard',
    name: '通用弃牌',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 3 张牌。',
    flavor: '「工具人弃牌抽牌」',
    effects: [{ kind: 'draw', value: 3 }],
    exhaust: true,
  },
  {
    id: 'universal-search',
    name: '通用检索',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '抽 2 张牌，获得 1 点能量。',
    flavor: '「检索一切」',
    effects: [
      { kind: 'draw', value: 2 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'universal-block-plus',
    name: '通用格挡+',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 12 点格挡。',
    flavor: '「强化格挡」',
    effects: [{ kind: 'block', value: 12 }]
  },
  {
    id: 'universal-heal-plus',
    name: '通用治疗+',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 10 点生命。',
    flavor: '「强化治疗」',
    effects: [{ kind: 'heal', value: 10 }]
  },
  {
    id: 'universal-damage-plus',
    name: '通用攻击+',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 16 点伤害。',
    flavor: '「强化攻击」',
    effects: [{ kind: 'damage', value: 16 }]
  },
  {
    id: 'universal-all-vuln',
    name: '通用全体易伤',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人施加 2 层易伤。',
    flavor: '「全场易伤」',
    effects: [{ kind: 'applyStatus', value: 2, status: 'vuln', statusTarget: 'enemy', all: true }]
  },
  {
    id: 'universal-buff',
    name: '通用双强化',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 2 层力量，获得 2 层敏捷。',
    flavor: '「万金油双强化」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'universal-block-draw',
    name: '通用盾抽',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '获得 8 点格挡，抽 2 张牌。',
    flavor: '「格挡加抽牌」',
    effects: [
      { kind: 'block', value: 8 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'universal-heal-block',
    name: '通用治疗盾',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 6 点生命，获得 8 点格挡。',
    flavor: '「治疗加盾」',
    effects: [
      { kind: 'heal', value: 6 },
      { kind: 'block', value: 8 },
    ]
  },
  {
    id: 'universal-damage-draw',
    name: '通用攻抽',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '造成 14 点伤害，抽 1 张牌。',
    flavor: '「攻击带抽牌」',
    effects: [
      { kind: 'damage', value: 14 },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'universal-energy-draw',
    name: '通用能抽',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 1 点能量，抽 2 张牌。',
    flavor: '「能量加抽牌」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 2 },
    ]
  },
  {
    id: 'universal-regen',
    name: '通用再生',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '回复 5 点生命，获得 2 层再生。',
    flavor: '「持续回复」',
    effects: [
      { kind: 'heal', value: 5 },
      { kind: 'applyStatus', value: 2, status: 'regen', statusTarget: 'self' },
    ]
  },
  {
    id: 'universal-damage-all',
    name: '通用全体攻击',
    type: 'attack',
    rarity: 'rare',
    cost: 2,
    text: '对所有敌人造成 14 点伤害。',
    flavor: '「万金油AOE」',
    effects: [{ kind: 'damageAll', value: 14 }]
  },
  {
    id: 'universal-max-hp',
    name: '通用生命上限',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    text: '最大生命 +5，回复 5 点生命。',
    flavor: '「扩容生命」',
    effects: [
      { kind: 'maxHp', value: 5 },
      { kind: 'heal', value: 5 },
    ]
  },
  {
    id: 'universal-triple',
    name: '通用三合一',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 10 点格挡，抽 2 张牌，回复 8 点生命。',
    flavor: '「万金油三合一」',
    effects: [
      { kind: 'block', value: 10 },
      { kind: 'draw', value: 2 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'universal-bombard',
    name: '通用轰炸',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人造成 22 点伤害。',
    flavor: '「轰炸全场」',
    effects: [{ kind: 'damageAll', value: 22 }]
  },
  {
    id: 'universal-cannon',
    name: '通用巨炮',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 28 点伤害。',
    flavor: '「万金油重击」',
    effects: [{ kind: 'damage', value: 28 }]
  },
  {
    id: 'universal-fortress',
    name: '通用堡垒',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 18 点格挡，回复 8 点生命。',
    flavor: '「坚固堡垒」',
    effects: [
      { kind: 'block', value: 18 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'universal-full-buff',
    name: '通用全强化',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 3 层力量，获得 3 层敏捷。',
    flavor: '「万金油全强化」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 3, status: 'dexterity', statusTarget: 'self' },
    ]
  },
  {
    id: 'universal-cycle',
    name: '通用循环',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 1 点能量，抽 3 张牌，获得 10 点格挡。',
    flavor: '「万金油循环」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 3 },
      { kind: 'block', value: 10 },
    ],
    exhaust: true,
  },
  {
    id: 'universal-spike',
    name: '通用尖刺',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 32 点伤害，对敌人施加 3 层易伤。',
    flavor: '「尖刺贯穿」',
    effects: [
      { kind: 'damage', value: 32 },
      { kind: 'applyStatus', value: 3, status: 'vuln', statusTarget: 'enemy' },
    ]
  },
  {
    id: 'universal-heal-wave',
    name: '通用治疗波',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '回复 12 点生命，获得 3 层再生。',
    flavor: '「治疗波动」',
    effects: [
      { kind: 'heal', value: 12 },
      { kind: 'applyStatus', value: 3, status: 'regen', statusTarget: 'self' },
    ]
  },
  {
    id: 'universal-all-debuff',
    name: '通用全削弱',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '对所有敌人施加 3 层易伤，对所有敌人施加 3 层虚弱。',
    flavor: '「万能削弱」',
    effects: [
      { kind: 'applyStatus', value: 3, status: 'vuln', statusTarget: 'enemy', all: true },
      { kind: 'applyStatus', value: 3, status: 'weak', statusTarget: 'enemy', all: true },
    ]
  },
  {
    id: 'universal-mega-block',
    name: '通用巨盾',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '获得 20 点格挡。',
    flavor: '「万金油巨盾」',
    effects: [{ kind: 'block', value: 20 }],
    exhaust: true,
  },
  {
    id: 'universal-double-hit',
    name: '通用二连',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 22 点伤害 2 次。',
    flavor: '「二连猛击」',
    effects: [{ kind: 'damage', value: 22, hits: 2 }]
  },
  {
    id: 'universal-triple-hit',
    name: '通用三连',
    type: 'attack',
    rarity: 'epic',
    cost: 3,
    text: '造成 22 点伤害 3 次。',
    flavor: '「三连击」',
    effects: [{ kind: 'damage', value: 22, hits: 3 }]
  },
  {
    id: 'universal-energy-bomb',
    name: '通用能量爆',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '获得 3 点能量，回复 8 点生命。',
    flavor: '「能量爆炸」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'heal', value: 8 },
    ]
  },
  {
    id: 'universal-draw-bomb',
    name: '通用抽牌爆',
    type: 'skill',
    rarity: 'epic',
    cost: 2,
    text: '抽 4 张牌，获得 2 点能量。',
    flavor: '「疯狂抽牌」',
    effects: [
      { kind: 'draw', value: 4 },
      { kind: 'draw', value: 1 },
    ],
    exhaust: true,
  },
  {
    id: 'universal-max-buff',
    name: '通用上限强化',
    type: 'skill',
    rarity: 'epic',
    cost: 3,
    text: '最大生命 +8，获得 3 层力量。',
    flavor: '「生命上限加力量」',
    effects: [
      { kind: 'maxHp', value: 8 },
      { kind: 'applyStatus', value: 3, status: 'strength', statusTarget: 'self' },
    ]
  },
  {
    id: 'universal-ultimate',
    name: '万能终极',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 40 点伤害，回复 12 点生命，抽 2 张牌。',
    flavor: '「万金油终极技」',
    effects: [
      { kind: 'damage', value: 40 },
      { kind: 'heal', value: 12 },
      { kind: 'draw', value: 2 },
    ],
    exhaust: true,
  },
  {
    id: 'universal-calamity',
    name: '万能灾厄',
    type: 'attack',
    rarity: 'legendary',
    cost: 5,
    text: '对所有敌人造成 35 点伤害，获得 15 点格挡。',
    flavor: '「万金油灾厄」',
    effects: [
      { kind: 'damageAll', value: 35 },
      { kind: 'block', value: 15 },
    ],
    exhaust: true,
  },
  {
    id: 'universal-overdraft',
    name: '万能透支',
    type: 'skill',
    rarity: 'legendary',
    cost: 3,
    text: '获得 4 点能量，抽 4 张牌。',
    flavor: '「透支一切」',
    effects: [
      { kind: 'draw', value: 1 },
      { kind: 'draw', value: 4 },
    ],
    exhaust: true,
  },
  {
    id: 'universal-apotheosis',
    name: '万能封神',
    type: 'skill',
    rarity: 'legendary',
    cost: 5,
    text: '最大生命 +12，回复 20 点生命，获得 4 层敏捷。',
    flavor: '「万金油封神」',
    effects: [
      { kind: 'maxHp', value: 12 },
      { kind: 'heal', value: 20 },
      { kind: 'applyStatus', value: 4, status: 'dexterity', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'universal-nova',
    name: '万能新星',
    type: 'attack',
    rarity: 'legendary',
    cost: 4,
    text: '造成 50 点伤害，获得 4 层力量。',
    flavor: '「万能超新星爆发」',
    effects: [
      { kind: 'damage', value: 50 },
      { kind: 'applyStatus', value: 4, status: 'strength', statusTarget: 'self' },
    ],
    exhaust: true,
  },
  {
    id: 'universal-quick-block',
    name: '通用速盾',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '获得 3 点格挡。',
    flavor: '「零费速盾」',
    effects: [{ kind: 'block', value: 3 }]
  },
  {
    id: 'universal-quick-draw',
    name: '通用速抽',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '抽 1 张牌。',
    flavor: '「零费速抽」',
    effects: [{ kind: 'draw', value: 1 }]
  },
  {
    id: 'universal-quick-heal',
    name: '通用速疗',
    type: 'skill',
    rarity: 'common',
    cost: 0,
    text: '回复 3 点生命。',
    flavor: '「零费速疗」',
    effects: [{ kind: 'heal', value: 3 }]
  },
  {
    id: 'universal-tool',
    name: '万能工具人',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    text: '获得 2 层力量，获得 2 层敏捷，抽 1 张牌。',
    flavor: '「万能工具人出击」',
    effects: [
      { kind: 'applyStatus', value: 2, status: 'strength', statusTarget: 'self' },
      { kind: 'applyStatus', value: 2, status: 'dexterity', statusTarget: 'self' },
      { kind: 'draw', value: 1 },
    ]
  },
  {
    id: 'universal-last-resort',
    name: '万能底牌',
    type: 'attack',
    rarity: 'epic',
    cost: 1,
    text: '造成 22 点伤害。',
    flavor: '「最后的底牌」',
    effects: [{ kind: 'damage', value: 22 }]
  }
];


export const CARD_MAP: Record<string, Card> = Object.fromEntries(
  CARDS.map((c) => [c.id, c]),
);

// 奖励池：按稀有度过滤（供战斗奖励 / 商店抽卡用）
export function cardsByRarity(rarity: Card['rarity']): Card[] {
  return CARDS.filter((c) => c.rarity === rarity && c.type !== 'curse');
}

// 可作为奖励的卡（排除诅咒、事件牌）
export const REWARD_POOL: Card[] = CARDS.filter(
  (c) => c.type !== 'curse' && c.type !== 'event_card',
);
