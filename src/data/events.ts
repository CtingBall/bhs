import type { GameEvent } from '@/types';

// 群梗事件：以「群聊引用块」形式呈现，多分支选择
export const EVENTS: GameEvent[] = [
  {
    id: 'last-train',
    title: '末班车发车',
    emoji: '🚌',
    text: '「八点团本末班车！@全体成员」\n薄荷色小搞又在群里摇人了。末班车即将发车，上不上？',
    options: [
      {
        label: '上车，挤一挤',
        resultText: '你挤上了末班车，一位热心群友本层战斗帮你打架。',
        effects: [{ kind: 'tempAlly', value: 1 }],
      },
      {
        label: '错过就错过吧',
        resultText: '你没上车，但捡到了落下车的人掉的绳子。',
        effects: [
          { kind: 'hp', value: -5 },
          { kind: 'rope', value: 18 },
        ],
      },
    ],
  },
  {
    id: 'mist-buff',
    title: '雾隐猎场加强',
    emoji: '🌫️',
    text: '「听说雾隐猎场今晚要加强」\n「加强 boss 也就你游策划做得出来惹」——菲雅\n策划又作妖了，下一场精英战敌人要变强。',
    options: [
      {
        label: '硬刚，奖励翻倍我也要',
        resultText: '你选择直面加强版敌人，奖励将翻倍。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '等削弱，跳过这场',
        resultText: '「无所谓我会选择不打等削弱」——你跳过了下一场战斗。',
        effects: [{ kind: 'skipNextBattle', value: 1 }],
      },
    ],
  },
  {
    id: 'no-fight',
    title: '无所谓我会选择不打',
    emoji: '🛌',
    text: '「无所谓我会选择不打等削弱」\n「无所谓反正我打不过」\n摆烂神教在你耳边低语。',
    options: [
      {
        label: '等削弱（跳过下一战）',
        resultText: '你躺平了，下一场战斗直接跳过，但没有奖励。',
        effects: [{ kind: 'skipNextBattle', value: 1 }],
      },
      {
        label: '不，我要打（获得意志）',
        resultText: '你燃起斗志，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
    ],
  },
  {
    id: 'sediment',
    title: '还在沉淀',
    emoji: '⛏️',
    text: '「还在沉淀还在沉淀」——飞鱼娘\n你的装备还没毕业，要不要继续沉淀？',
    options: [
      {
        label: '沉淀！扣血换遗物',
        resultText: '你疯狂沉淀，掉了 20% 血，换来一件遗物。',
        effects: [
          { kind: 'hp', value: -20 },
          { kind: 'randomRelic', value: 1 },
        ],
      },
      {
        label: '摆了，不沉淀',
        resultText: '你拒绝内卷，回复 8 点血。',
        effects: [{ kind: 'hp', value: 8 }],
      },
    ],
  },
  {
    id: 'prison',
    title: '来坐牢',
    emoji: '⛓️',
    text: '「来坐牢」——飞鱼娘\n高难副本开组，赢了出狱拿传说卡，输了…那就真坐牢了。',
    options: [
      {
        label: '坐牢（进入高难精英战）',
        resultText: '你踏入牢房，一场硬仗在等着你。',
        effects: [],
      },
      {
        label: '溜了溜了',
        resultText: '「我不跑，我还留在那里干什么」你跑了，捡到 12 根绳子。',
        effects: [{ kind: 'rope', value: 12 }],
      },
    ],
  },
  {
    id: 'hana-demon',
    title: '哈娜入魔',
    emoji: '🌀',
    text: '「哈娜入魔了」「哈娜开桂了」「哈娜的自动就有 85w 了」\n一团不祥的力量向你涌来，拥抱还是远离？',
    options: [
      {
        label: '拥抱入魔（50% 大奖 / 50% 反噬）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '入魔成功！你获得了「85w 自动」遗物。',
          loseText: '入魔失控！你失去了 15 点生命。',
          win: [{ kind: 'relic', cardId: 'auto-85w' }],
          lose: [{ kind: 'hp', value: -15 }],
        },
      },
      {
        label: '远离，求稳',
        resultText: '你远离了入魔，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
    ],
  },
  {
    id: 'meetup',
    title: '来面基吧',
    emoji: '🍻',
    text: '「来面基吧」——薄荷色小搞\n「我是陪酒男😭」\n群友线下相聚，气氛热烈。',
    options: [
      {
        label: '去面基，回血',
        resultText: '面基愉快，你回复了 50% 生命。',
        effects: [{ kind: 'hp', value: 50 }],
      },
      {
        label: '社恐发作，不去',
        resultText: '你婉拒了，但收到群友送的 5 点琥珀。',
        effects: [{ kind: 'amber', value: 5 }],
      },
    ],
  },
  {
    id: 'nematode-story',
    title: '十三线虫故事',
    emoji: '🐛',
    text: '「十三线虫故事 1/1」\n群友又在复读嘲讽伏月十三。「和日本人哪来的线虫故事」——十三委屈道。',
    options: [
      {
        label: '跟着复读（+绳子）',
        resultText: '「十三线虫故事 1/1」你加入复读，获得 15 根绳子。',
        effects: [{ kind: 'rope', value: 15 }],
      },
      {
        label: '替十三说话（+意志，但被塞废牌）',
        resultText: '你仗义执言，获得 3 意志，但被群友塞了一张「没用的虫」。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'addCurse', cardId: 'useless-bug' },
        ],
      },
    ],
  },
  {
    id: 'caste-judge',
    title: '你是达利特还是婆罗门',
    emoji: '⚖️',
    text: '「你是达利特」——飞鱼娘\n种姓审判降临，认命还是反抗？',
    options: [
      {
        label: '认命（保阶级，+绳子）',
        resultText: '你接受了达利特身份，获得 20 根绳子。',
        effects: [{ kind: 'rope', value: 20 }],
      },
      {
        label: '反抗！提升阶级（-血）',
        resultText: '你反抗成功，阶级提升一级，但掉了 12 点血。',
        effects: [
          { kind: 'casteUp', value: 1 },
          { kind: 'hp', value: -12 },
        ],
      },
    ],
  },
  {
    id: 'bug-hunt',
    title: '没用的虫',
    emoji: '🐞',
    text: '「不会再出现 没用的虫，金色大便 的情况了」——水千夏\n角落里有个可疑的罐子，要不要翻翻？',
    options: [
      {
        label: '翻找（50% 好卡 / 50% 诅咒）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '翻到一张不错的卡！',
          loseText: '翻到一只「没用的虫」，塞进了你的牌组。',
          win: [{ kind: 'randomCard', value: 1 }],
          lose: [{ kind: 'addCurse', cardId: 'useless-bug' }],
        },
      },
      {
        label: '不碰，走开',
        resultText: '你谨慎离开，获得 6 根绳子。',
        effects: [{ kind: 'rope', value: 6 }],
      },
    ],
  },
  // ===== 事件·扩展 =====
  {
    id: 'gear-graduation',
    title: '装备毕业',
    emoji: '🎖️',
    text: '「等我六件套」「还在沉淀还在沉淀」\n一位群友刚凑齐六件套，正准备脱手旧装备，要不要接？',
    options: [
      {
        label: '接旧装备（获得随机卡）',
        resultText: '你接过了毕业群友淘汰的装备，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '继续沉淀（扣血换意志）',
        resultText: '「还在沉淀还在沉淀」你选择继续沉淀，掉了 8 点血但换来 4 点意志。',
        effects: [
          { kind: 'hp', value: -8 },
          { kind: 'will', value: 4 },
        ],
      },
    ],
  },
  {
    id: 'dragon-confession',
    title: '龙性恋告白',
    emoji: '🐉',
    text: '「我是龙性恋」——莫妮卡\n一股龙息扑面而来，接受这份炽热还是躲开？',
    options: [
      {
        label: '接受龙息（获得龙性恋之怒）',
        resultText: '你拥抱了龙息，习得「龙性恋之怒」。',
        effects: [{ kind: 'addCard', cardId: 'dragon-rage' }],
      },
      {
        label: '躲开，求稳（+意志）',
        resultText: '你灵巧躲开，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
    ],
  },
  {
    id: 'overtime-miss',
    title: '加班末班车',
    emoji: '🚕',
    text: '「末班车没赶上」\n「八点团本末班车！@全体成员」可你迟到了。加班车还在，上不上？',
    options: [
      {
        label: '坐加班车（扣血换绳子）',
        resultText: '加班车颠簸不堪，你掉了 6 点血，但捡到 16 根绳子。',
        effects: [
          { kind: 'hp', value: -6 },
          { kind: 'rope', value: 16 },
        ],
      },
      {
        label: '算了回家（回血）',
        resultText: '「无所谓我会选择不打」你回家睡了一觉，回复 10 点生命。',
        effects: [{ kind: 'hp', value: 10 }],
      },
    ],
  },
  {
    id: 'class-balance',
    title: '弱的是职业不是玩家',
    emoji: '⚖️',
    text: '「弱的是职业不是玩家」——三百一十页\n群友又在抱怨职业平衡，你选择附和还是接受？',
    options: [
      {
        label: '附和抱怨（获得磨刀石）',
        resultText: '你加入了抱怨大军，三百一十页塞给你一张「磨刀石」。',
        effects: [{ kind: 'addCard', cardId: 'whetstone' }],
      },
      {
        label: '接受现实（+意志，+琥珀）',
        resultText: '你接受职业不平衡的现实，获得 2 点意志与 3 点琥珀。',
        effects: [
          { kind: 'will', value: 2 },
          { kind: 'amber', value: 3 },
        ],
      },
    ],
  },
  {
    id: 'shady-shop',
    title: '黑心商店',
    emoji: '🏪',
    text: '「加强 boss 也就你游策划做得出来惹」——菲雅\n路边有个黑心商贩在卖遗物，价格离谱。买还是偷？',
    options: [
      {
        label: '买（花琥珀换遗物）',
        resultText: '你忍痛花了 6 点琥珀换了一件遗物。',
        effects: [
          { kind: 'amber', value: -6 },
          { kind: 'randomRelic', value: 1 },
        ],
      },
      {
        label: '偷！（60% 得手 / 40% 被抓）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.6,
          winText: '得手了！你白嫖了一件遗物。',
          loseText: '被抓个正着，挨了一顿打，失去 10 点生命。',
          win: [{ kind: 'randomRelic', value: 1 }],
          lose: [{ kind: 'hp', value: -10 }],
        },
      },
    ],
  },
  {
    id: 'gacha-draw',
    title: '抽卡保底',
    emoji: '🎰',
    text: '「保底了，追幻想也太贵了」\n一台可疑的抽卡机摆在面前，要不要赌一把？',
    options: [
      {
        label: '抽！（40% 传说 / 60% 诅咒）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.4,
          winText: '出货了！获得一张随机卡。',
          loseText: '保底了……被塞了一张「金色大便」。',
          win: [{ kind: 'randomCard', value: 1 }],
          lose: [{ kind: 'addCurse', cardId: 'golden-poop' }],
        },
      },
      {
        label: '不抽，攒绳子',
        resultText: '「追精炼不如追幻想」你转身离开，捡到 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
    ],
  },
  {
    id: 'mentor-guide',
    title: '师傅带带我',
    emoji: '🧙',
    text: '「带带我」\n一位老群友愿意带你飞，但拜师要交学费。学不学？',
    options: [
      {
        label: '拜师（花绳子换卡）',
        resultText: '你交了 15 根绳子学费，师傅传你一张随机卡。',
        effects: [
          { kind: 'rope', value: -15 },
          { kind: 'randomCard', value: 1 },
        ],
      },
      {
        label: '自学成才（+意志）',
        resultText: '「爱玩啥玩啥」——夕，你选择自学，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
    ],
  },
];

export const EVENT_MAP: Record<string, GameEvent> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);
