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
  // ===== 事件·扩展 v2（40 个新事件） =====
  {
    id: 'final-bus-panic',
    title: '八点团本末班车',
    emoji: '🚌',
    text: '「八点团本末班车！@全体成员」\n薄荷色小搞又在摇人了，群里瞬间沸腾。末班车上不上，错过可就没了。',
    options: [
      {
        label: '挤上去，蹭个位置',
        resultText: '你挤上了团本末班车，一位群友大号直接帮你清了一层。',
        effects: [{ kind: 'skipNextBattle', value: 1 }],
      },
      {
        label: '等人齐，先观望',
        resultText: '你等着等着，人满了。领队塞给你一根绳子说"下次请早"。',
        effects: [{ kind: 'rope', value: 14 }],
      },
      {
        label: '不去了，自己沉淀',
        resultText: '「还在沉淀还在沉淀」你选择自己练，获得 4 点意志和 2 点琥珀。',
        effects: [
          { kind: 'will', value: 4 },
          { kind: 'amber', value: 2 },
        ],
      },
    ],
  },
  {
    id: 'irl-drink-meetup',
    title: '我是陪酒男😭',
    emoji: '🍻',
    text: '「来面基吧」「我是陪酒男😭」——小搞\n群友线下聚餐，有人发起了面基邀请。去不去？',
    options: [
      {
        label: '去面基，回满血！',
        resultText: '面基愉快，你吃了顿好的，生命回满 50 点。',
        effects: [{ kind: 'hp', value: 50 }],
      },
      {
        label: '陪酒，强打精神',
        resultText: '你硬着头皮去陪酒，掉了 5 点血但获得 4 点意志。',
        effects: [
          { kind: 'hp', value: -5 },
          { kind: 'will', value: 4 },
        ],
      },
      {
        label: '社恐，鸽了',
        resultText: '你鸽了面基，但群友在群里发红包，你捡到 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
    ],
  },
  {
    id: 'hana-open-demon',
    title: '哈娜开桂了',
    emoji: '🌀',
    text: '「哈娜开桂了」「哈娜的自动就有85w了」\n群友纷纷围观，一股入魔的力量正在扩散。',
    options: [
      {
        label: '跟着开桂（50% 力量 / 50% 封号）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '开桂成功，获得哈娜手稿遗物！',
          loseText: '被系统检测到，扣 12 点血。',
          win: [{ kind: 'relic', cardId: 'hanas-script' }],
          lose: [{ kind: 'hp', value: -12 }],
        },
      },
      {
        label: '等冰区沉淀，不急',
        resultText: '「不要急hana冰区还在沉淀」——零，你选择等，获得 5 点琥珀。',
        effects: [{ kind: 'amber', value: 5 }],
      },
    ],
  },
  {
    id: 'wait-for-nerf-squad',
    title: '等削弱再打',
    emoji: '⏳',
    text: '「无所谓我会选择不打等削弱」\n策划刚刚发布了下周削弱预告，全群进入躺平模式。',
    options: [
      {
        label: '躺平跳过（跳过下一场战斗）',
        resultText: '你加入了躺平大军，跳过下一场战斗。',
        effects: [{ kind: 'skipNextBattle', value: 1 }],
      },
      {
        label: '趁削弱前冲刺（获得卡牌）',
        resultText: '「我不跑，我还留在那里干什么」你决定不等了，冲刺获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '先练别的（+意志）',
        resultText: '你转去练副职，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
    ],
  },
  {
    id: 'keep-sediment-harder',
    title: '沉淀个2.3年',
    emoji: '⛏️',
    text: '「沉淀个2.3年，确实可以做的」「我真的非常缺这几年沉淀时间」\n群友又在讨论要不要继续沉淀，你怎么办？',
    options: [
      {
        label: '疯狂沉淀（-血 +重沉淀遗物）',
        resultText: '你疯狂沉淀，掉了 15 点生命，获得了「重沉淀」。',
        effects: [
          { kind: 'hp', value: -15 },
          { kind: 'relic', cardId: 'heavy-sediment' },
        ],
      },
      {
        label: '轻松沉淀（-少量血 +意志）',
        resultText: '你适度沉淀，掉了 5 点血但获得 3 点意志。',
        effects: [
          { kind: 'hp', value: -5 },
          { kind: 'will', value: 3 },
        ],
      },
      {
        label: '摆了，不沉淀了',
        resultText: '「爱玩啥玩啥」你放下执念，回复 12 点生命。',
        effects: [{ kind: 'hp', value: 12 }],
      },
    ],
  },
  {
    id: 'chase-fantasy-over-refine',
    title: '追幻想还是追精炼',
    emoji: '🎯',
    text: '「追精炼不如追幻想」「精炼防御25了不用追了」\n群里老玩家正在激烈争论：装备到底该追幻想还是追精炼？',
    options: [
      {
        label: '追幻想（获得幻想卡）',
        resultText: '你选择追幻想，获得「追幻想」。',
        effects: [{ kind: 'addCard', cardId: 'chase-fantasy' }],
      },
      {
        label: '追精炼（获得精炼打印机遗物）',
        resultText: '「满精炼打印机」你选择追精炼，获得精炼打印机。',
        effects: [{ kind: 'relic', cardId: 'refined-printer' }],
      },
      {
        label: '全都要（扣血双收）',
        resultText: '你贪心全要，掉了 12 点血但获得一张随机卡和一件随机遗物。',
        effects: [
          { kind: 'hp', value: -12 },
          { kind: 'randomCard', value: 1 },
          { kind: 'randomRelic', value: 1 },
        ],
      },
      {
        label: '不追了，攒绳子',
        resultText: '你决定观望，捡到 12 根绳子。',
        effects: [{ kind: 'rope', value: 12 }],
      },
    ],
  },
  {
    id: 'draw-and-guess-night',
    title: '你画我猜之夜',
    emoji: '🎨',
    text: '群友发起了你画我猜，灵魂画手上线。\n「这画的是什么啊！」「奶龙！」「是狂音！」',
    options: [
      {
        label: '参加！灵魂画手上线',
        resultText: '你画得连自己都认不出来，但群友笑得很开心，获得 8 根绳子和 2 点意志。',
        effects: [
          { kind: 'rope', value: 8 },
          { kind: 'will', value: 2 },
        ],
      },
      {
        label: '猜中大奖（40% 得遗物）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.4,
          winText: '你猜中了！获得随机遗物。',
          loseText: '猜错了，什么都没发生。',
          win: [{ kind: 'randomRelic', value: 1 }],
          lose: [],
        },
      },
      {
        label: '潜水围观',
        resultText: '你在旁边看乐子，捡到 6 根绳子。',
        effects: [{ kind: 'rope', value: 6 }],
      },
    ],
  },
  {
    id: 'military-lord-management',
    title: '军事化领主管理',
    emoji: '🪖',
    text: '「军事化领主」「军事化管理是这样的」\n领主团的指挥非常严格，出勤表、站位图全部拉满。',
    options: [
      {
        label: '服从指挥（+意志 +琥珀）',
        resultText: '你服从军事化管理，获得 3 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'amber', value: 3 },
        ],
      },
      {
        label: '反抗！我不当兵',
        resultText: '你反抗了军事化，被踢出团但获得 15 根绳子。',
        effects: [{ kind: 'rope', value: 15 }],
      },
      {
        label: '假装服从，摸鱼',
        resultText: '你表面服从暗中摸鱼，掉了 3 点血但获得 2 点意志。',
        effects: [
          { kind: 'hp', value: -3 },
          { kind: 'will', value: 2 },
        ],
      },
    ],
  },
  {
    id: 'boss-leech-squad',
    title: '蹭BOSS末班车',
    emoji: '🎣',
    text: '「220先带我，240先带我」\n有人在群里求带，态度诚恳。带他一把还是无视？',
    options: [
      {
        label: '好心带他（+意志 获临时帮手）',
        resultText: '你带他打了一趟，获得 3 点意志和一层临时盟友。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'tempAlly', value: 1 },
        ],
      },
      {
        label: '不带，自己也要赶末班车',
        resultText: '你自顾不暇，捡了 8 根绳子匆匆上路。',
        effects: [{ kind: 'rope', value: 8 }],
      },
      {
        label: '反向蹭他（+琥珀）',
        resultText: '你假装带他，实则蹭了他的掉落，获得 5 点琥珀。',
        effects: [{ kind: 'amber', value: 5 }],
      },
    ],
  },
  {
    id: 'marathon-complete',
    title: '我夺舍了去打马拉松',
    emoji: '🏃',
    text: '「是我夺舍了去打马拉松的...」「只会变成马拉松」\n群友跑马拉松跑出了幻觉，身体仿佛被夺舍。',
    options: [
      {
        label: '跟着跑马拉松（-血 +大量绳子）',
        resultText: '你跑了场马拉松，掉了 20 点血但捡到 25 根绳子。',
        effects: [
          { kind: 'hp', value: -20 },
          { kind: 'rope', value: 25 },
        ],
      },
      {
        label: '买通行证偷懒（花琥珀+绳子）',
        resultText: '「买马拉松通行证不香么」你花 4 点琥珀换 16 根绳子。',
        effects: [
          { kind: 'amber', value: -4 },
          { kind: 'rope', value: 16 },
        ],
      },
      {
        label: '躺平不跑',
        resultText: '「只会变成马拉松」你拒绝参跑，回复 8 点血量。',
        effects: [{ kind: 'hp', value: 8 }],
      },
    ],
  },
  {
    id: 'reforge-stone-vein',
    title: '重铸石矿脉',
    emoji: '💎',
    text: '「买重铸石吗」「恐怖如斯」\n有人发现了重铸石矿脉，要不要去挖？',
    options: [
      {
        label: '全力开采（-血 +琥珀）',
        resultText: '你挖到了重铸石矿脉，掉了 8 点血但获得 8 点琥珀。',
        effects: [
          { kind: 'hp', value: -8 },
          { kind: 'amber', value: 8 },
        ],
      },
      {
        label: '买石头（花绳子）',
        resultText: '「买重铸石吗」你花了 12 根绳子买了石头，获得 4 点琥珀。',
        effects: [
          { kind: 'rope', value: -12 },
          { kind: 'amber', value: 4 },
        ],
      },
      {
        label: '不碰矿脉',
        resultText: '「恐怖如斯」你避开矿脉，获得 2 点意志。',
        effects: [{ kind: 'will', value: 2 }],
      },
    ],
  },
  {
    id: 'prison-visit-window',
    title: '牢房探监窗口',
    emoji: '🔍',
    text: '「你们仨赤红」「来坐牢」\n有人在高难副本里坐牢了，要不要去探监？',
    options: [
      {
        label: '送物资（-绳子 +意志）',
        resultText: '你给牢里的群友送了 8 根绳子，获得 4 点意志。',
        effects: [
          { kind: 'rope', value: -8 },
          { kind: 'will', value: 4 },
        ],
      },
      {
        label: '劫狱（进入高难战斗）',
        resultText: '你冲进牢房，下一场战斗难度提升但奖励也将翻倍。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '在外面等着',
        resultText: '你在牢外捡到牢友掉出来的 8 根绳子。',
        effects: [{ kind: 'rope', value: 8 }],
      },
    ],
  },
  {
    id: 'dalit-counter-strike',
    title: '达利特逆袭',
    emoji: '⚔️',
    text: '「你是达利特」——飞鱼娘\n但今天不一样，达利特也有逆袭的一天！',
    options: [
      {
        label: '逆袭成功（阶级+1 -血）',
        resultText: '你逆袭了！阶级提升一级，但掉了 15 点血。',
        effects: [
          { kind: 'casteUp', value: 1 },
          { kind: 'hp', value: -15 },
        ],
      },
      {
        label: '团结反抗（获得达利特解放遗物）',
        resultText: '你团结了所有达利特，获得「达利特解放」。',
        effects: [{ kind: 'relic', cardId: 'dalit-liberation' }],
      },
      {
        label: '接受命运（+绳子）',
        resultText: '你接受了命运，获得 20 根绳子。',
        effects: [{ kind: 'rope', value: 20 }],
      },
    ],
  },
  {
    id: 'balance-patch-freakout',
    title: '技改公告炸群',
    emoji: '📢',
    text: '「居合看技改」「技改完事要是和斧子差距不太大」\n官方发了新技改公告，群里瞬间炸锅。',
    options: [
      {
        label: '仔细研究技改（+意志 +琥珀）',
        resultText: '你连夜研究技改，获得 3 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'amber', value: 3 },
        ],
      },
      {
        label: '等技改给次数（跳过战斗）',
        resultText: '「等技改给次数」你决定等技改落实再打，跳过一场战斗。',
        effects: [{ kind: 'skipNextBattle', value: 1 }],
      },
      {
        label: '跟风骂策划（+绳子）',
        resultText: '你加入了骂策划的队伍，获得 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
    ],
  },
  {
    id: 'nematode-tales-reprise',
    title: '十三线虫故事1/1',
    emoji: '🐛',
    text: '「十三线虫故事1/1」「和日本人哪来的线虫故事」\n复读机再次启动，十三又躺枪了。',
    options: [
      {
        label: '加入复读（+绳子）',
        resultText: '「十三线虫故事1/1」你加入复读大军，获得 18 根绳子。',
        effects: [{ kind: 'rope', value: 18 }],
      },
      {
        label: '替十三出头（+意志 但被塞日记）',
        resultText: '你替十三说好话，获得 3 点意志，但被塞了「十三线虫日记」遗物。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'relic', cardId: 'thirteen-nematode-diary' },
        ],
      },
      {
        label: '讲一个线虫故事',
        resultText: '你编了个线虫故事，获得 5 点琥珀。',
        effects: [{ kind: 'amber', value: 5 }],
      },
    ],
  },
  {
    id: 'clock-out-ritual',
    title: '下班打卡仪式',
    emoji: '🕔',
    text: '「下班」「别下班」「我还没下班」「下班是什么滋味」\n群里开始了每日下班打卡互卷环节。',
    options: [
      {
        label: '准点下班（+血量）',
        resultText: '「下班」你光速打卡下班，回复 10 点生命。',
        effects: [{ kind: 'hp', value: 10 }],
      },
      {
        label: '加班卷一下（-血 +意志）',
        resultText: '「我还没下班」你加班卷了一波，掉 5 点血但获得 4 点意志。',
        effects: [
          { kind: 'hp', value: -5 },
          { kind: 'will', value: 4 },
        ],
      },
      {
        label: '夺舍同事代班（获得末班车票）',
        resultText: '「是我夺舍了去打马拉松的...」你夺舍同事代班，获得末班车票遗物。',
        effects: [{ kind: 'relic', cardId: 'last-shift-ticket' }],
      },
    ],
  },
  {
    id: 'job-change-advice',
    title: '转职咨询处',
    emoji: '🔄',
    text: '「技改完看居合强度直接做飞鱼了」「你是个光盾啊 你上5.4干什么」\n群里又有人想转职了，大家七嘴八舌。',
    options: [
      {
        label: '咨询大佬（+意志 获得卡牌）',
        resultText: '你虚心请教大佬，获得 2 点意志和一张随机卡。',
        effects: [
          { kind: 'will', value: 2 },
          { kind: 'randomCard', value: 1 },
        ],
      },
      {
        label: '盲转！50% 双倍收益 / 50% 血亏',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '盲转大成功！获得 2 张随机卡。',
          loseText: '盲转翻车，掉了 12 点血。',
          win: [
            { kind: 'randomCard', value: 1 },
            { kind: 'randomCard', value: 1 },
          ],
          lose: [{ kind: 'hp', value: -12 }],
        },
      },
      {
        label: '不转，坚守本命',
        resultText: '你坚守本职业，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
    ],
  },
  {
    id: 'forbidden-word-trigger',
    title: '禁忌词汇引爆',
    emoji: '🚫',
    text: '「都有禁忌词汇（f8fq，护盾强度）」「说了禁忌词汇后都会原地爆了」\n有人不小心说出了禁忌词汇，场面即将失控。',
    options: [
      {
        label: '说出禁忌词（触发高难战斗）',
        resultText: '「辣个是骂人的话，你不要念辣个」你说出了禁忌词，下一场战斗难度飙升。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '捂住嘴（+意志）',
        resultText: '你死死捂住自己的嘴，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
      {
        label: '念了就跑（+绳子）',
        resultText: '你念完禁忌词汇拔腿就跑，捡到 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
    ],
  },
  {
    id: 'tina-sweeping-cabinet',
    title: '蒂娜扫柜子',
    emoji: '🧹',
    text: '「蒂娜扫柜子：我管你这那的」「先瞬移晕住所有人」\n蒂娜又开始扫柜子了，整个战斗区域都被她扫荡一空。',
    options: [
      {
        label: '趁乱捡东西（+绳子 +琥珀）',
        resultText: '你趁蒂娜扫柜子时捡漏，获得 6 根绳子和 3 点琥珀。',
        effects: [
          { kind: 'rope', value: 6 },
          { kind: 'amber', value: 3 },
        ],
      },
      {
        label: '阻止蒂娜（-血 +意志）',
        resultText: '你试图阻止蒂娜，被柜子砸了一下，掉 8 点血但获得 5 点意志。',
        effects: [
          { kind: 'hp', value: -8 },
          { kind: 'will', value: 5 },
        ],
      },
      {
        label: '一起扫（获得仿制铃铛）',
        resultText: '你帮蒂娜一起扫柜子，获得「仿制铃铛」遗物。',
        effects: [{ kind: 'relic', cardId: 'knockoff-bell' }],
      },
    ],
  },
  {
    id: 'tower-cd-spreadsheet',
    title: '巨塔CD计算器',
    emoji: '🏗️',
    text: '「你支援我点，我做个4巨塔或者让5巨塔」——飞鱼娘\n有人在算巨塔CD，需要物资支援。',
    options: [
      {
        label: '支援物资（-绳子 获得塔主徽章）',
        resultText: '你支援了 15 根绳子，获得「塔主徽章」遗物。',
        effects: [
          { kind: 'rope', value: -15 },
          { kind: 'relic', cardId: 't-lord-badge' },
        ],
      },
      {
        label: '口头支援（+意志）',
        resultText: '「这样伤害不就有了」你只给了口头支援，获得 2 点意志。',
        effects: [{ kind: 'will', value: 2 }],
      },
      {
        label: '不支援，我自己也要做',
        resultText: '你也在做巨塔，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
    ],
  },
  {
    id: 'stone-man-fable',
    title: '石头人故事会',
    emoji: '🪨',
    text: '「喂，石头人吗，对，狠狠的电」「日本人问我：为什么那个BOSS要叫做石头人」\n关于石头人的故事在群里流传开来。',
    options: [
      {
        label: '听故事（+意志）',
        resultText: '你听完石头人故事，若有所思，获得 5 点意志。',
        effects: [{ kind: 'will', value: 5 }],
      },
      {
        label: '编故事（+琥珀）',
        resultText: '你现场编了个石头人外传，群友纷纷点赞，获得 6 点琥珀。',
        effects: [{ kind: 'amber', value: 6 }],
      },
      {
        label: '狠狠的电（下一战加强）',
        resultText: '「对，狠狠的电」你点亮了石头人，下一战变难但奖励翻倍。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
    ],
  },
  {
    id: 'sunflower-seizure',
    title: '向日葵抽风现场',
    emoji: '🌻',
    text: '「喜欢实战里吃蒂娜的时候」——Ephyra\n一向冷静的向日葵突然抽风，开始说些奇怪的话。',
    options: [
      {
        label: '跟着抽风（+绳子）',
        resultText: '你加入抽风行列，获得 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
      {
        label: '冷静旁观（+琥珀）',
        resultText: '你冷静地看向日葵抽风，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
      {
        label: '喂她一颗葵花籽（50% 得到祝福/50% 被诅咒）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '向日葵被你治愈了，获得随机遗物。',
          loseText: '向日葵暴走，你被塞了「向日葵诅咒」。',
          win: [{ kind: 'randomRelic', value: 1 }],
          lose: [{ kind: 'addCurse', cardId: 'sunflower-curse' }],
        },
      },
    ],
  },
  {
    id: 'mist-hunt-reinforce',
    title: '雾隐猎场又加强了',
    emoji: '🌫️',
    text: '「加强 boss 也就你游策划做得出来惹」——菲雅\n雾隐猎场的难度又一次提升了，这次还加了新机制。',
    options: [
      {
        label: '硬刚（下一战变难）',
        resultText: '你选择正面硬刚，下一场战斗难度提升。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '等削弱（跳过一战）',
        resultText: '「无所谓我会选择不打等削弱」你跳过这场。',
        effects: [{ kind: 'skipNextBattle', value: 1 }],
      },
      {
        label: '研究机制（+意志 +琥珀）',
        resultText: '你仔细研究了加强后的机制，获得 2 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 2 },
          { kind: 'amber', value: 3 },
        ],
      },
    ],
  },
  {
    id: 'n20-rock-snake-lair',
    title: 'N20岩蛇巢穴',
    emoji: '🐍',
    text: '「260这n20数值太高了」——水千夏\nN20岩蛇巢穴，数值令人窒息。打还是等？',
    options: [
      {
        label: '冲了！挑战N20（下一战加强）',
        resultText: '你冲向N20岩蛇巢穴，下一场战斗将非常艰难。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '等我260再去',
        resultText: '「你等我260」你决定等装备提升，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
      {
        label: '找人带（获得随机卡）',
        resultText: '「220先带我」你找到大佬带飞，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
    ],
  },
  {
    id: 'factory-turret-escort',
    title: '机化所炮台护送',
    emoji: '🏭',
    text: '「炮台跟着我！」\n机化所炮台在群友的护送下缓缓推进。你跟还是不跟？',
    options: [
      {
        label: '跟炮台推进（+意志 +绳子）',
        resultText: '你跟着炮台一路护送，获得 3 点意志和 8 根绳子。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'rope', value: 8 },
        ],
      },
      {
        label: '偷炮台零件（+琥珀）',
        resultText: '你趁乱偷了几个炮台零件卖掉，获得 6 点琥珀。',
        effects: [{ kind: 'amber', value: 6 }],
      },
      {
        label: '不管炮台',
        resultText: '你让炮台自生自灭，回复 6 点生命。',
        effects: [{ kind: 'hp', value: 6 }],
      },
    ],
  },
  {
    id: 'splendor-tomb-carry',
    title: '等inf一脚踢死煌墓',
    emoji: '💀',
    text: '「等inf下班一脚踢死N5煌墓了」——Ephyra\n群里都在等inf下班来带煌墓，你能蹭上车吗？',
    options: [
      {
        label: '等inf带（跳过战斗）',
        resultText: 'inf下班了一脚踢死煌墓，你躺着过了。',
        effects: [{ kind: 'skipNextBattle', value: 1 }],
      },
      {
        label: '自己先打打看（+意志）',
        resultText: '「没准我们晚上还会出个分」你决定自己先试试，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
      {
        label: '当后勤（-血 +琥珀）',
        resultText: '你帮inf扛了伤害，掉了 10 点血但获得 5 点琥珀。',
        effects: [
          { kind: 'hp', value: -10 },
          { kind: 'amber', value: 5 },
        ],
      },
    ],
  },
  {
    id: 'pvp-red-fury',
    title: 'PVP红怒连锁',
    emoji: '😡',
    text: '「带了双决心嘴角真的压得住吗」\nPVP场上一片红怒，有人带了双决心正在收割。',
    options: [
      {
        label: '加入红怒收割（获得赤红觉醒卡）',
        resultText: '你加入了红怒队伍，获得「赤红觉醒」。',
        effects: [{ kind: 'addCard', cardId: 'crimson-awaken' }],
      },
      {
        label: '理性冷静（+意志）',
        resultText: '「嘴角真的压得住吗」你冷静应对，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
      {
        label: '观战吃瓜（+绳子）',
        resultText: '你在旁边观战吃瓜，捡到 8 根绳子。',
        effects: [{ kind: 'rope', value: 8 }],
      },
    ],
  },
  {
    id: 'open-demon-finder',
    title: 'fander手动凹90w',
    emoji: '🔥',
    text: '「fander手动能凹接近90w」「开挂」「@星痕共鸣最忧郁的双斧魔龙 开挂」\n一群人在刷"开挂"，但fander真的只是手动操作。',
    options: [
      {
        label: '跟着喊开挂（+绳子）',
        resultText: '你跟着刷"开挂"弹幕，获得 12 根绳子。',
        effects: [{ kind: 'rope', value: 12 }],
      },
      {
        label: '请教手法（获得卡牌）',
        resultText: '你虚心请教fander的手法，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '入魔！50% 学会 50% 翻车',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '入魔成功！你习得「魔核」遗物。',
          loseText: '入魔反噬，掉了 14 点血。',
          win: [{ kind: 'relic', cardId: 'demon-core' }],
          lose: [{ kind: 'hp', value: -14 }],
        },
      },
    ],
  },
  {
    id: 'smite-dynasty-reign',
    title: '惩击王朝的荣光',
    emoji: '⚡',
    text: '「惩击区鬼魅十六夜」「铁血惩击森」\n惩击王朝的成员在群里展示实力，气场强大。',
    options: [
      {
        label: '加入惩击王朝（获得卡牌）',
        resultText: '你加入了惩击王朝，获得「惩击」卡。',
        effects: [{ kind: 'addCard', cardId: 'one-punch' }],
      },
      {
        label: '保持独立（+意志 +琥珀）',
        resultText: '你选择保持中立，获得 2 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 2 },
          { kind: 'amber', value: 3 },
        ],
      },
      {
        label: '挑战王朝（下一战加强）',
        resultText: '你挑战了惩击王朝，下一场战斗将更加激烈。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
    ],
  },
  {
    id: 'dragonlover-fury-unleash',
    title: '龙性恋之怒再临',
    emoji: '🐉',
    text: '「我是龙性恋」——莫妮卡\n龙息灼热，莫妮卡的龙性恋之力又一次暴走。',
    options: [
      {
        label: '接受龙之祝福（获得龙角碎片）',
        resultText: '你被龙息笼罩，获得「龙角碎片」遗物。',
        effects: [{ kind: 'relic', cardId: 'flame-horn-shard' }],
      },
      {
        label: '给龙性恋顺毛（+意志）',
        resultText: '你成功安抚了龙性恋，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
      {
        label: '被龙息灼伤（-血 +卡牌）',
        resultText: '你被龙息喷到了，掉 10 点血但获得「龙角之力」。',
        effects: [
          { kind: 'hp', value: -10 },
          { kind: 'addCard', cardId: 'flame-horn-power' },
        ],
      },
    ],
  },
  {
    id: 'six-piece-flex',
    title: '等我六件套毕业',
    emoji: '🎖️',
    text: '「等我冰矛毕业」「项链耳环毕业了」「这是250红武250套装毕业强度」\n群里掀起了晒毕业装的风潮。',
    options: [
      {
        label: '肝起来！冲刺毕业（-血 +遗物）',
        resultText: '你疯狂肝本，掉了 12 点血但获得一件随机遗物。',
        effects: [
          { kind: 'hp', value: -12 },
          { kind: 'randomRelic', value: 1 },
        ],
      },
      {
        label: '接朋友的旧装备（+随机卡）',
        resultText: '你从毕业群友那里接过了淘汰的装备，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '不慌，还在沉淀',
        resultText: '「还在沉淀还在沉淀」你不急，获得 3 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'amber', value: 3 },
        ],
      },
    ],
  },
  {
    id: 'raid-cosplay-healer',
    title: '就我一个奶吗哈哈',
    emoji: '💉',
    text: '「就我一个奶吗哈哈」「来个太刀奶龙啊」「奶呢？」\n团本开组，全队只有你一个奶，压力山大。',
    options: [
      {
        label: '硬着头皮奶全队（-血 +大量意志）',
        resultText: '你一个人奶了全团，掉了 10 点血但获得 6 点意志。',
        effects: [
          { kind: 'hp', value: -10 },
          { kind: 'will', value: 6 },
        ],
      },
      {
        label: '喊人切奶（+绳子）',
        resultText: '「再来个奶啊！」你喊来一个临时奶，获得 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
      {
        label: '摆烂切输出（下一战变难）',
        resultText: '「无所谓反正我打不过」你切了输出，下一战更棘手了。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
    ],
  },
  {
    id: 'sacred-flying-fish-tales',
    title: '圣域飞鱼娘的传说',
    emoji: '🐠',
    text: '「还在沉淀还在沉淀」「来坐牢」——圣域飞鱼娘\n飞鱼娘又开始了她的日常语录循环。',
    options: [
      {
        label: '跟飞鱼娘坐牢（进入高难战）',
        resultText: '「来坐牢」你跟飞鱼娘一起坐牢去了。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '学飞鱼娘沉淀（+意志 +琥珀）',
        resultText: '「还在沉淀还在沉淀」你跟飞鱼娘一起沉淀，获得 2 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 2 },
          { kind: 'amber', value: 3 },
        ],
      },
      {
        label: '复读飞鱼娘（+绳子）',
        resultText: '你开始复读飞鱼娘的金句，获得 12 根绳子。',
        effects: [{ kind: 'rope', value: 12 }],
      },
    ],
  },
  {
    id: 'its-the-class-not-me',
    title: '弱的是职业不是玩家',
    emoji: '📉',
    text: '「弱的是职业不是玩家」——三百一十页\n「xhgm要jb完蛋了」职业平衡让人绝望。',
    options: [
      {
        label: '认同，换职业（获得转职卡）',
        resultText: '你认同了三百一十页，换了职业，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '不服，硬玩（+意志）',
        resultText: '「xhgm要jb完蛋了」但你偏不服，获得 5 点意志。',
        effects: [{ kind: 'will', value: 5 }],
      },
      {
        label: '发帖抱怨（+绳子）',
        resultText: '你去论坛发帖抱怨职业平衡，获得 8 根绳子。',
        effects: [{ kind: 'rope', value: 8 }],
      },
    ],
  },
  {
    id: 'scrap-to-complete-gear',
    title: '化零为整拼装备',
    emoji: '🧩',
    text: '「220先带我，240先带我」\n你手头攒了一堆零散素材，要不要化零为整？',
    options: [
      {
        label: '合成为装备（-绳子 获得随机遗物）',
        resultText: '你花了 12 根绳子合成了装备，获得一件随机遗物。',
        effects: [
          { kind: 'rope', value: -12 },
          { kind: 'randomRelic', value: 1 },
        ],
      },
      {
        label: '继续攒素材（+琥珀）',
        resultText: '你觉得还没攒够，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
      {
        label: '卖掉换绳子（+绳子）',
        resultText: '你把零散素材全卖了，换到 16 根绳子。',
        effects: [{ kind: 'rope', value: 16 }],
      },
    ],
  },
  {
    id: 's2-prison-memories',
    title: 'S2坐牢回忆录',
    emoji: '🔒',
    text: '「S2初期不是有人测过」「s2的蛇，当时我用奶的罩子去挡」\n老玩家回忆起S2时期的坐牢时光，感慨万千。',
    options: [
      {
        label: '回忆S2艰辛（+意志）',
        resultText: '你回忆起S2的苦日子，更加珍惜现在，获得 5 点意志。',
        effects: [{ kind: 'will', value: 5 }],
      },
      {
        label: '嘲笑当年萌新（+琥珀）',
        resultText: '你嘲笑当年的萌新自己，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
      {
        label: '再坐一次牢（-血 +契约证明）',
        resultText: '你决定重温S2，掉了 10 点血但获得「契约证明」遗物。',
        effects: [
          { kind: 'hp', value: -10 },
          { kind: 'relic', cardId: 'covenant-proof' },
        ],
      },
    ],
  },
  {
    id: 'ilvl-gatekeeping',
    title: '装等门槛拦路',
    emoji: '📏',
    text: '「240装等」「这n20数值太高了」\n野队队长设了240装等门槛，你刚好差一点。',
    options: [
      {
        label: '强行凑装等（-绳子 +意志）',
        resultText: '你花了 15 根绳子硬凑装等，获得 3 点意志。',
        effects: [
          { kind: 'rope', value: -15 },
          { kind: 'will', value: 3 },
        ],
      },
      {
        label: '组亲友团绕过门槛',
        resultText: '你叫来了亲友团，跳过装等限制，获得 8 根绳子。',
        effects: [{ kind: 'rope', value: 8 }],
      },
      {
        label: '不打了，等提升',
        resultText: '「无所谓我会选择不打」你放弃挑战，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
    ],
  },
  {
    id: 'auction-house-snipe',
    title: '拍卖行捡漏王',
    emoji: '🛒',
    text: '「精炼便宜了」「买重铸石吗」\n拍卖行出现了一批低价装备，手慢无。',
    options: [
      {
        label: '秒杀！抢下装备（-绳子 +遗物）',
        resultText: '你手速惊人秒下一件装备，花了 10 根绳子获得随机遗物。',
        effects: [
          { kind: 'rope', value: -10 },
          { kind: 'randomRelic', value: 1 },
        ],
      },
      {
        label: '观望，看行情（+琥珀）',
        resultText: '你冷静分析了行情，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
      {
        label: '举报价格异常（+意志）',
        resultText: '你觉得价格有问题举报了，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
    ],
  },
  {
    id: 'refined-printer-jackpot',
    title: '精炼打印机启动',
    emoji: '🖨️',
    text: '「满精炼打印机」「三角洲满精炼本身就高很多了」\n你的精炼打印机终于攒满了，要不要启动？',
    options: [
      {
        label: '启动打印！（获得随机遗物）',
        resultText: '打印机轰轰作响，印出了一件随机遗物。',
        effects: [{ kind: 'randomRelic', value: 1 }],
      },
      {
        label: '再攒攒（+琥珀）',
        resultText: '你觉得还可以再攒攒，获得 3 点琥珀。',
        effects: [{ kind: 'amber', value: 3 }],
      },
      {
        label: '转手卖打印机（+大量绳子）',
        resultText: '你把打印机卖了个好价钱，获得 20 根绳子。',
        effects: [{ kind: 'rope', value: 20 }],
      },
    ],
  },
  {
    id: 'debt-repayment-cycle',
    title: '还债/接济轮回',
    emoji: '💸',
    text: '「bkl给s1还债的」「你支援我点，我做个4巨塔」\n群里永远有一套经济循环：大佬接济萌新，萌新长大了再还债。',
    options: [
      {
        label: '接济萌新（-绳子 +意志）',
        resultText: '你大方地接济了一个萌新，花了 10 根绳子获得 4 点意志。',
        effects: [
          { kind: 'rope', value: -10 },
          { kind: 'will', value: 4 },
        ],
      },
      {
        label: '请求还债（+绳子）',
        resultText: '「该换了」你向欠债的群友催收，获得 12 根绳子。',
        effects: [{ kind: 'rope', value: 12 }],
      },
      {
        label: '等着被接济（+琥珀）',
        resultText: '你等着大佬接济，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
    ],
  },
  {
    id: 'daily-routine-stone',
    title: '每日不稳定石头',
    emoji: '🪙',
    text: '「每日不稳定还是要做的，石头得拿」——三百一十页\n做完领主后每日还差一点，要不要补？',
    options: [
      {
        label: '做每日（-血 +琥珀）',
        resultText: '你老老实实做完每日，掉了 3 点血获得 4 点琥珀。',
        effects: [
          { kind: 'hp', value: -3 },
          { kind: 'amber', value: 4 },
        ],
      },
      {
        label: '摸了，这周不上线了',
        resultText: '「这周的xhgm已经没有上线的必要了」你下线，回复 8 点血。',
        effects: [{ kind: 'hp', value: 8 }],
      },
      {
        label: '双倍爆肝（-更多血 +更多琥珀）',
        resultText: '你连做两个号的每日，掉了 8 点血获得 8 点琥珀。',
        effects: [
          { kind: 'hp', value: -8 },
          { kind: 'amber', value: 8 },
        ],
      },
    ],
  },
  {
    id: 'monitor-vs-tower-debate',
    title: '监视者vs巨塔之争',
    emoji: '⚔️',
    text: '「2监控肘不过10d的」「那3塔呢」\n群里为了监视者和巨塔哪个更强吵了起来。',
    options: [
      {
        label: '站监视者（+意志）',
        resultText: '你力挺监视者，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
      {
        label: '站巨塔（+琥珀）',
        resultText: '「看t配置」你理性分析了巨塔优势，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
      {
        label: '全都要！（获得随机遗物）',
        resultText: '「一个蒂娜就差不多了」你决定双修，获得一件随机遗物。',
        effects: [{ kind: 'randomRelic', value: 1 }],
      },
    ],
  },
  {
    id: 'rock-shield-forbidden',
    title: '岩盾禁忌传说',
    emoji: '🛡️',
    text: '「岩盾就是网友张顺飞的证据：都是全能king、实际强度都是区、都有禁忌词汇」——三角洲行动\n岩盾的禁忌传说在群里流传。',
    options: [
      {
        label: '念禁忌词（触发高难战斗）',
        resultText: '「f8fq」你念出了禁忌词"护盾强度"，下一场战斗强度暴涨。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '敬而远之（+意志 +琥珀）',
        resultText: '「辣个是骂人的话，你不要念辣个」你小心避开，获得 2 点意志和 2 点琥珀。',
        effects: [
          { kind: 'will', value: 2 },
          { kind: 'amber', value: 2 },
        ],
      },
      {
        label: '传谣（+绳子）',
        resultText: '你添油加醋地传播岩盾传说，获得 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
    ],
  },
  {
    id: 'dps-race-beat-fander',
    title: '伤害榜争王',
    emoji: '📊',
    text: '「甚至没人伤害高过我的全自动」「已经把300打平了」\n群里大佬在展示伤害，你想挑战吗？',
    options: [
      {
        label: '挑战大佬（下一战加强）',
        resultText: '你向Ephyra发起了伤害挑战，下一场战斗难度提升。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '虚心请教（获得卡牌）',
        resultText: '「fander手动能凹接近90w」你向大佬学习，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '安于现状（+琥珀）',
        resultText: '「水千夏还在研究他那b无相和冰风呢」你继续研究自己那套，获得 3 点琥珀。',
        effects: [{ kind: 'amber', value: 3 }],
      },
    ],
  },
  {
    id: 'star-scar-final',
    title: '终末星痕',
    emoji: '⭐',
    text: '「这周的xhgm已经没有上线的必要了」\n但星痕还在共鸣，最终的光芒在召唤你。',
    options: [
      {
        label: '接受共鸣（获得终末星痕遗物）',
        resultText: '你与星痕产生了最终共鸣，获得「终末星痕」。',
        effects: [{ kind: 'relic', cardId: 'final-star-scar' }],
      },
      {
        label: '拒绝共鸣（+意志）',
        resultText: '「xhgm要jb完蛋了」你拒绝了，获得 6 点意志。',
        effects: [{ kind: 'will', value: 6 }],
      },
      {
        label: '分享共鸣（+血量）',
        resultText: '你把星痕之力分享给队友，回复 20 点生命。',
        effects: [{ kind: 'hp', value: 20 }],
      },
    ],
  },
  {
    id: 'deadline-before-patch',
    title: '更新前最后一搏',
    emoji: '⏰',
    text: '「这周的打完起飞是转二阶段，就是下周才开的那个」\n明天就要更新了，你还有事没做完。',
    options: [
      {
        label: '通宵赶工（-大量血 +随机卡+遗物）',
        resultText: '你通宵肝完了所有内容，掉了 18 点血但获得随机卡和随机遗物。',
        effects: [
          { kind: 'hp', value: -18 },
          { kind: 'randomCard', value: 1 },
          { kind: 'randomRelic', value: 1 },
        ],
      },
      {
        label: '只做关键部分（+意志 +琥珀）',
        resultText: '你选择性地肝了关键内容，获得 3 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'amber', value: 3 },
        ],
      },
      {
        label: '摆了，等新版本',
        resultText: '「bkl的所有产能都搞游星岛了」你放弃挣扎，回复 12 点生命。',
        effects: [{ kind: 'hp', value: 12 }],
      },
    ],
  },
  {
    id: 'wood-dragon-survey',
    title: '木头龙调研赤红',
    emoji: '🪵',
    text: '「直接一个木头龙调研赤红」——三百一十页\n木头龙在群里做职业调研，你的职业被点名了。',
    options: [
      {
        label: '配合调研（+琥珀）',
        resultText: '你如实填写了调研问卷，获得 5 点琥珀。',
        effects: [{ kind: 'amber', value: 5 }],
      },
      {
        label: '糊弄过去（+绳子）',
        resultText: '你随便填了些搞笑答案，获得 8 根绳子。',
        effects: [{ kind: 'rope', value: 8 }],
      },
      {
        label: '反向安利自己职业（+意志）',
        resultText: '你大力安利自己喜欢却弱势的职业，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
    ],
  },
  {
    id: 'grab-someone-over',
    title: '拐人过来打本',
    emoji: '🪝',
    text: '「我去看看能不能把仇人陷害拐过来打N5」\n群里缺人，要不去别的群拐一个来？',
    options: [
      {
        label: '去拐人（获得临时盟友）',
        resultText: '你成功拐来一个打手，获得一层临时盟友。',
        effects: [{ kind: 'tempAlly', value: 1 }],
      },
      {
        label: '没拐到（+绳子）',
        resultText: '「唉不带我」拐人失败，但路上捡到 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
      {
        label: '自己被拐走了（-绳子 +琥珀）',
        resultText: '你反被别的群拐去打工，花了 6 根绳子但获得 4 点琥珀。',
        effects: [
          { kind: 'rope', value: -6 },
          { kind: 'amber', value: 4 },
        ],
      },
    ],
  },
  {
    id: 'elite-battle-sweat',
    title: '精英战数值太高',
    emoji: '💢',
    text: '「我都没看过我现在能打多少了」「看看远处的神射手吧」\n精英战的数值让你怀疑人生。',
    options: [
      {
        label: '硬着头皮打（下一战加强）',
        resultText: '你硬着头皮上，下一场战斗数值更高了。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '算了打个桩（+意志）',
        resultText: '「打桩都不带动的类型」你先打木桩找自信，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
      {
        label: '喊群友救场（+绳子）',
        resultText: '你喊了群友来救场，获得 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
    ],
  },
  {
    id: 'burn-art-collector',
    title: '燃烧艺术的收藏家',
    emoji: '🔥',
    text: '「赤红是不是后面可以双暴击加急速词条」\n群里在讨论燃烧艺术词条，你也很感兴趣。',
    options: [
      {
        label: '追求极限词条（扣血换卡）',
        resultText: '你花重金洗词条，掉了 10 点血获得「燃烧艺术」。',
        effects: [
          { kind: 'hp', value: -10 },
          { kind: 'addCard', cardId: 'burn-art' },
        ],
      },
      {
        label: '随缘词条（+意志）',
        resultText: '你觉得词条随缘就好，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
      {
        label: '卖掉旧装换新（+绳子）',
        resultText: '你把旧装备卖了，获得 12 根绳子。',
        effects: [{ kind: 'rope', value: 12 }],
      },
    ],
  },
  {
    id: 'light-and-dark-shift',
    title: '光盾上5.4干什么',
    emoji: '💡',
    text: '「不是 你等等 你是个光盾啊 你上5.4干什么」——哎呦喂\n「你现在依然是光~我们都是光~」\n有人光盾误带了暗装，群友无语。',
    options: [
      {
        label: '将错就错（获得随机卡）',
        resultText: '「你现在依然是光~」你索性胡乱搭配，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '换回正装（+意志）',
        resultText: '你默默换回正经配装，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
      {
        label: '嘲笑自己（+绳子）',
        resultText: '「我们都是光~」你跟着群友一起笑，获得 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
    ],
  },
  {
    id: 'oil-island-roast',
    title: '游星岛吐槽大会',
    emoji: '🏝️',
    text: '「bkl的所有产能都搞游星岛了」「但是这游星岛也是逆天」\n群里开始了对游星岛的吐槽大会。',
    options: [
      {
        label: '加入吐槽（+绳子）',
        resultText: '「更新这点东西还没vrc几个地图多」你激情吐槽，获得 15 根绳子。',
        effects: [{ kind: 'rope', value: 15 }],
      },
      {
        label: '理性分析（+琥珀）',
        resultText: '你客观分析了游星岛的优缺点，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
      {
        label: '去看看游星岛（获得随机遗物）',
        resultText: '你决定亲自去看看，发现了个小惊喜，获得随机遗物。',
        effects: [{ kind: 'randomRelic', value: 1 }],
      },
    ],
  },
  {
    id: 'high-tailor-cosplay',
    title: '高定动作拍大片',
    emoji: '📸',
    text: '「说起来现在的高定动作是不是可以排出这个效果来」——圣域飞鱼娘\n飞鱼娘在研究高定时装动作，群里开始了时装秀。',
    options: [
      {
        label: '买高定时装（花琥珀 获得VIP卡）',
        resultText: '你花钱买了高定时装，获得「高级VIP卡」遗物。',
        effects: [
          { kind: 'amber', value: -6 },
          { kind: 'relic', cardId: 'premium-vip-card' },
        ],
      },
      {
        label: '蹭朋友的衣服拍照（+绳子）',
        resultText: '你借了群友的时装拍照，获得 8 根绳子。',
        effects: [{ kind: 'rope', value: 8 }],
      },
      {
        label: '不感兴趣',
        resultText: '你对时装无感，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
    ],
  },
  {
    id: 'carry-me-pls',
    title: '带带我带带我',
    emoji: '🙏',
    text: '「220先带我，240先带我」\n群里的萌新又在求带，态度非常诚恳。',
    options: [
      {
        label: '带萌新（+意志 获得随机卡）',
        resultText: '你带了萌新一趟，获得 2 点意志和一张随机卡。',
        effects: [
          { kind: 'will', value: 2 },
          { kind: 'randomCard', value: 1 },
        ],
      },
      {
        label: '给点绳子打发了',
        resultText: '你塞给萌新 5 根绳子打发了，获得 2 点意志。',
        effects: [
          { kind: 'rope', value: -5 },
          { kind: 'will', value: 2 },
        ],
      },
      {
        label: '让萌新带自己（反转）',
        resultText: '萌新居然是个隐藏大佬反过来带你，获得随机遗物。',
        effects: [{ kind: 'randomRelic', value: 1 }],
      },
    ],
  },
  // ===== 事件·群成员零、jk、UK、星落 =====
  {
    id: 'zero-revive-order',
    title: '零总下令复活',
    emoji: '📢',
    text: '「命你速速复活！你也复活！」\n零总在群里发号施令，气场拉满。怎么响应？',
    options: [
      {
        label: '排队复活（回复20HP）',
        resultText: '你乖乖排队复活，回复了 20 点生命。',
        effects: [{ kind: 'hp', value: 20 }],
      },
      {
        label: '装死等零总亲自来（+10HP +随机遗物，50%失败扣5HP）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '零总亲自来踹了你一脚，你弹起来顺手摸到一件遗物。',
          loseText: '零总没来……你装死太久血掉光了。',
          win: [
            { kind: 'hp', value: 10 },
            { kind: 'randomRelic', value: 1 },
          ],
          lose: [{ kind: 'hp', value: -5 }],
        },
      },
      {
        label: '自己站起来（+15HP +1力量）',
        resultText: '你一个鲤鱼打挺站了起来，获得 15 点生命和 1 点力量。',
        effects: [
          { kind: 'hp', value: 15 },
          { kind: 'will', value: 1 },
        ],
      },
    ],
  },
  {
    id: 'zero-sec-kill',
    title: '零总の秒杀流',
    emoji: '⚡',
    text: '你偶然发现了零的秒杀秘籍流，上面写着「一踢秒杀」。\n太诱人了，但总感觉身体吃不消……',
    options: [
      {
        label: '学秒杀流（获得「一踢秒杀」，扣5HP）',
        resultText: '你强行学了秒杀流，获得「一踢秒杀」，但太贪了身体扛不住，扣了 5 点血。',
        effects: [
          { kind: 'addCard', cardId: 'one-kick-kill' },
          { kind: 'hp', value: -5 },
        ],
      },
      {
        label: '保守观望（+8HP）',
        resultText: '你觉得小命要紧，乖乖缩回去，回复 8 点生命。',
        effects: [{ kind: 'hp', value: 8 }],
      },
      {
        label: '请零总亲自示范（获得临时盟友）',
        resultText: '零总亲自下场示范秒杀，顺带帮你清了一层。',
        effects: [{ kind: 'tempAlly', value: 1 }],
      },
    ],
  },
  {
    id: 'jk-xhgm-boot',
    title: 'jkのxhgm启动！（）',
    emoji: '🏃',
    text: '「xhgm启动！」\njk大喊一声冲进了副本，你甚至来不及反应。',
    options: [
      {
        label: '跟着jk冲（获得「血战」，+5HP）',
        resultText: '你热血上头跟着jk冲进副本，获得「血战」并回复 5 点血。',
        effects: [
          { kind: 'addCard', cardId: 'blood-battle' },
          { kind: 'hp', value: 5 },
        ],
      },
      {
        label: '给jk递鸡胸肉（+10HP）',
        resultText: '你递过去一块鸡胸肉，jk开心地接过去，你也觉得暖心，回复 10 点血。',
        effects: [{ kind: 'hp', value: 10 }],
      },
      {
        label: '提醒jk该减肥了（最大HP+4，+5HP）',
        resultText: '「jk你已经吃过几十袋鸡胸肉了，该减肥了」jk愣了一下，你趁机获得最大HP+4并回复 5 点血。',
        effects: [
          { kind: 'maxHp', value: 4 },
          { kind: 'hp', value: 5 },
        ],
      },
    ],
  },
  {
    id: 'moonblade-memory',
    title: '月刃的回忆',
    emoji: '🌙',
    text: '「月刃在洛克王国」\njk突然想起了旧爱月刃，语气有点低落。',
    options: [
      {
        label: '怀念月刃，精炼一把（获得「过载」）',
        resultText: '你和jk一起怀念月刃，精炼了一把旧装备，获得「过载」。',
        effects: [{ kind: 'addCard', cardId: 'overload' }],
      },
      {
        label: '劝jk回归月刃（获得遗物「jk月刃」）',
        resultText: '你劝jk回归月刃，jk送了你一把月刃作为谢礼。',
        effects: [{ kind: 'relic', cardId: 'jk-moonblade' }],
      },
      {
        label: '向前看，新的总比旧的好（获得「首波」）',
        resultText: '你劝jk向前看，自己也想通了，获得「首波」。',
        effects: [{ kind: 'addCard', cardId: 'first-wave' }],
      },
    ],
  },
  {
    id: 'uk-red-fury-bite',
    title: '红怒三连咬',
    emoji: '😡',
    text: 'UK突然对你使出连招：红怒咬住→红怒q→死亡缠绕！\n你被三连打得晕头转向。',
    options: [
      {
        label: '硬接三连（获得「全押」，扣8HP）',
        resultText: '你硬吃了UK的三连，不愧是好汉，获得「全押」但扣了 8 点血。',
        effects: [
          { kind: 'addCard', cardId: 'all-in' },
          { kind: 'hp', value: -8 },
        ],
      },
      {
        label: '赶紧@零总救命（获得临时盟友，+3HP）',
        resultText: '「@零总 救命！」零总出现帮你挡了UK，获得一层临时盟友和 3 点血。',
        effects: [
          { kind: 'tempAlly', value: 1 },
          { kind: 'hp', value: 3 },
        ],
      },
      {
        label: '反咬回去！（50%获得遗物「UK红怒」/50%失败扣5HP）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '你一口咬回去，UK反而服了，丢给你一件「UK红怒」遗物。',
          loseText: '你没咬到，被UK补了一脚，扣了 5 点血。',
          win: [{ kind: 'relic', cardId: 'uk-red-fury' }],
          lose: [{ kind: 'hp', value: -5 }],
        },
      },
    ],
  },
  {
    id: 'uk-feelings-zero',
    title: 'UK好感度清零',
    emoji: '💔',
    text: '因为你没理他，UK对你的好感度归零了！\n群里弥漫着一股尴尬的气息。',
    options: [
      {
        label: '赶紧哄（+5HP，获得「群疗」）',
        resultText: '你陪UK聊了半小时，好感度回暖，回复 5 点血并获得「群疗」。',
        effects: [
          { kind: 'hp', value: 5 },
          { kind: 'addCard', cardId: 'team-heal' },
        ],
      },
      {
        label: '不管（最大HP+3，但被塞「没用的虫」）',
        resultText: '「好感度归零就归零吧」你觉得无所谓，最大HP+3，但被UK塞了「没用的虫」。',
        effects: [
          { kind: 'maxHp', value: 3 },
          { kind: 'addCurse', cardId: 'useless-bug' },
        ],
      },
      {
        label: '我专卖家队友（随机遗物，扣5HP）',
        resultText: '你选择专卖家队友，获得随机遗物但被UK揍了一下，扣 5 点血。',
        effects: [
          { kind: 'randomRelic', value: 1 },
          { kind: 'hp', value: -5 },
        ],
      },
    ],
  },
  {
    id: 'xingluo-resolve-cycle',
    title: '星落の决心循环',
    emoji: '🛡️',
    text: '「光明决心一开就不会死→职责+R→继续决心」\n星落在群里教你光盾循环，看起来好复杂。',
    options: [
      {
        label: '认真学循环（获得「光明决心」，+8HP）',
        resultText: '你认真学完了光盾循环，获得「光明决心」并回复 8 点血。',
        effects: [
          { kind: 'addCard', cardId: 'light-resolve' },
          { kind: 'hp', value: 8 },
        ],
      },
      {
        label: '请星落当面演示（获得遗物「星落决心」，+3HP）',
        resultText: '星落当面给你演示了一遍，你拿到「星落决心」遗物并回了 3 点血。',
        effects: [
          { kind: 'relic', cardId: 'xingluo-resolve' },
          { kind: 'hp', value: 3 },
        ],
      },
      {
        label: '我是DPS，不需要学T的循环（随机遗物）',
        resultText: '你理直气壮地拒绝了，但星落还是丢了一件随机遗物给你。',
        effects: [{ kind: 'randomRelic', value: 1 }],
      },
    ],
  },
  {
    id: 'xingluo-slack-caught',
    title: '星落摸鱼被抓',
    emoji: '🐟',
    text: '星落上班摸鱼刚好被制作人路过看到，急喊「这是借鉴美术风格！」\n气氛一度非常微妙。',
    options: [
      {
        label: '帮星落圆谎（获得遗物「星落摸鱼」，+2HP）',
        resultText: '「对，他是在做风格调研」你帮忙圆谎成功，获得「星落摸鱼」遗物并回复 2 点血。',
        effects: [
          { kind: 'relic', cardId: 'xingluo-slack' },
          { kind: 'hp', value: 2 },
        ],
      },
      {
        label: '揭穿星落（获得「追幻想」，扣3HP）',
        resultText: '「他就是想打游戏！」星落被当场拆穿，你获得「追幻想」但被星落锤了一下扣 3 点血。',
        effects: [
          { kind: 'addCard', cardId: 'chase-fantasy' },
          { kind: 'hp', value: -3 },
        ],
      },
      {
        label: '一起摸鱼（被塞「没用的虫」，随机遗物）',
        resultText: '你和星落一起摸鱼，制作人也加入了，你获得随机遗物但被塞了「没用的虫」。',
        effects: [
          { kind: 'addCurse', cardId: 'useless-bug' },
          { kind: 'randomRelic', value: 1 },
        ],
      },
    ],
  },
  {
    id: 'jk-breakdown',
    title: 'jk破防时刻',
    emoji: '😢',
    text: 'jk在尖沙咀星光大道吹了3小时海风。\n「感觉最近人状态不太对劲」——jk',
    options: [
      {
        label: '陪jk聊天疗愈（+15HP，随机卡牌）',
        resultText: '你陪jk聊了很久，jk开心了，你回复 15 点血并获得一张随机卡。',
        effects: [
          { kind: 'hp', value: 15 },
          { kind: 'randomCard', value: 1 },
        ],
      },
      {
        label: '介绍新的鸡胸肉口味（+20HP）',
        resultText: '你掏出新口味的鸡胸肉，jk大喜，你回复 20 点血。',
        effects: [{ kind: 'hp', value: 20 }],
      },
      {
        label: '喊UK来咬jk转移注意力（遗物「jk启动」，被塞「金色大便」）',
        resultText: 'UK冲过来咬了jk，jk注意力转移了，你获得「jk-xhgm-start」遗物但被塞了「金色大便」。',
        effects: [
          { kind: 'relic', cardId: 'jk-xhgm-start' },
          { kind: 'addCurse', cardId: 'golden-poop' },
        ],
      },
    ],
  },
  {
    id: 'betray-moonblade',
    title: '背叛月刃之人',
    emoji: '⚖️',
    text: '「大家都背叛了月刃！」\n零总在群里公开指责，群内气氛凝重。',
    options: [
      {
        label: '公开承认：是的我是叛徒（阶级+1）',
        resultText: '你公开承认了背叛月刃，阶级提升一级。',
        effects: [{ kind: 'casteUp', value: 1 }],
      },
      {
        label: '保持沉默（随机遗物）',
        resultText: '你选择了沉默，零总叹了口气丢给你一件随机遗物。',
        effects: [{ kind: 'randomRelic', value: 1 }],
      },
      {
        label: '反驳零总：是月刃先背叛我的！（获得「一击」，扣3HP）',
        resultText: '你激烈反驳「是月刃先背叛我的！」，获得「一击」但情绪激动扣了 3 点血。',
        effects: [
          { kind: 'addCard', cardId: 'one-punch' },
          { kind: 'hp', value: -3 },
        ],
      },
    ],
  },
  // ===== 事件·扩展 v3（25 个群聊梗事件） =====
  {
    id: 'all-in-gamble-wave',
    title: '全群梭哈某因子',
    emoji: '🎲',
    text: '「全部梭哈幸运」「先梭哈五贼」「梭哈是种智慧」\n群里爆发了梭哈狂潮，所有人都在压注同一个因子。你跟不跟？',
    options: [
      {
        label: '跟了！梭哈全部身家（50% 大奖 / 50% 血亏）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '梭哈大成功！获得随机遗物和随机卡牌。',
          loseText: '梭哈血亏，掉 15 点血还被塞了「金色大便」。',
          win: [
            { kind: 'randomRelic', value: 1 },
            { kind: 'randomCard', value: 1 },
          ],
          lose: [
            { kind: 'hp', value: -15 },
            { kind: 'addCurse', cardId: 'golden-poop' },
          ],
        },
      },
      {
        label: '小赌怡情，压一半（+随机卡）',
        resultText: '你压了一半资源，出货了一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '不跟，等下一波',
        resultText: '「没存粮你拿什么梭哈」你冷静观望，获得 12 根绳子。',
        effects: [{ kind: 'rope', value: 12 }],
      },
    ],
  },
  {
    id: 'cd-spreadsheet-master',
    title: 'CD计算器大师',
    emoji: '📊',
    text: '「你支援我点，我做个4巨塔或者让5巨塔」——飞鱼娘\n飞鱼娘又开了她的CD计算器，精确到毫秒。你也想学这手艺。',
    options: [
      {
        label: '拜师飞鱼娘（-绳子 获得塔主徽章）',
        resultText: '你交了 12 根绳子当学费，飞鱼娘传你「塔主徽章」遗物。',
        effects: [
          { kind: 'rope', value: -12 },
          { kind: 'relic', cardId: 't-lords-badge' },
        ],
      },
      {
        label: '自己手算（+意志 +琥珀）',
        resultText: '你拿出纸笔自己推演，获得 3 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'amber', value: 3 },
        ],
      },
      {
        label: '懒得算，直接莽',
        resultText: '「这样伤害不就有了」你放弃计算，直接莽，获得 6 根绳子。',
        effects: [{ kind: 'rope', value: 6 }],
      },
    ],
  },
  {
    id: 'three-minute-cycle',
    title: '三分钟标准循环',
    emoji: '⏱️',
    text: '「光明决心一开就不会死→职责+R→继续决心」\n群里大佬在教标准三分钟输出循环，看着好复杂。学会能质变吗？',
    options: [
      {
        label: '苦练循环（-血 +光明决心卡）',
        resultText: '你木桩打到手抽筋，掉了 8 点血但习得「光明决心」。',
        effects: [
          { kind: 'hp', value: -8 },
          { kind: 'addCard', cardId: 'light-resolve' },
        ],
      },
      {
        label: '简化成两分钟循环（+意志）',
        resultText: '你自创了简化版循环，效果也不差，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
      {
        label: '循环是什么，我按技能就完事了',
        resultText: '你放弃循环选择了快乐脸滚键盘，回复 8 点生命。',
        effects: [{ kind: 'hp', value: 8 }],
      },
    ],
  },
  {
    id: 'full-crit-burst',
    title: '满暴击爆发期',
    emoji: '💥',
    text: '「赤红是不是后面可以双暴击加急速词条」\n你终于凑满了暴击词条，爆发期到了。怎么利用这段黄金窗口？',
    options: [
      {
        label: '全力爆发（下一战加强 奖励翻倍）',
        resultText: '你开启全部爆发技能，下一场战斗更艰难但奖励更丰厚。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '稳扎稳打（+琥珀 +意志）',
        resultText: '你不贪爆发，稳健输出，获得 3 点琥珀和 3 点意志。',
        effects: [
          { kind: 'amber', value: 3 },
          { kind: 'will', value: 3 },
        ],
      },
      {
        label: '截图发群炫耀（+绳子）',
        resultText: '你把暴击面板截图发群，群友一阵惊叹，获得 15 根绳子。',
        effects: [{ kind: 'rope', value: 15 }],
      },
    ],
  },
  {
    id: 'delta-force-squad',
    title: '三角洲行动集结',
    emoji: '🎖️',
    text: '「你们都不陪我三角洲」——夕\n「三角洲不是要刷吗」——沫\n群里有人喊组三角洲小队，跨游戏作战。去不去？',
    options: [
      {
        label: '响应号召，加入三角洲（+临时盟友 +意志）',
        resultText: '你加入三角洲行动小队，获得 1 层临时盟友和 2 点意志。',
        effects: [
          { kind: 'tempAlly', value: 1 },
          { kind: 'will', value: 2 },
        ],
      },
      {
        label: '不去，我要打本',
        resultText: '你婉拒了三角洲邀请，专心打本，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '假装去三角洲，实则摸鱼',
        resultText: '你嘴上答应，实际在钓鱼，获得 8 根绳子。',
        effects: [{ kind: 'rope', value: 8 }],
      },
    ],
  },
  {
    id: 'capsule-toy-frenzy',
    title: '扭蛋机狂热',
    emoji: '🔮',
    text: '「追精炼不如追幻想」「满精炼打印机」\n群友发现了一台新的扭蛋机，里面可能有极品。但扭一次好贵……',
    options: [
      {
        label: '扭三连！（40% 遗物 / 60% 诅咒）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.4,
          winText: '扭蛋出货！获得一件随机遗物。',
          loseText: '全沉了……被塞了一张「没用的虫」。',
          win: [{ kind: 'randomRelic', value: 1 }],
          lose: [{ kind: 'addCurse', cardId: 'useless-bug' }],
        },
      },
      {
        label: '只扭一发试试水（-绳子 +随机卡）',
        resultText: '你花 6 根绳子扭了一发，获得一张随机卡。',
        effects: [
          { kind: 'rope', value: -6 },
          { kind: 'randomCard', value: 1 },
        ],
      },
      {
        label: '不扭，攒着等保底',
        resultText: '「保底了，追幻想也太贵了」你决定攒保底，获得 5 点琥珀。',
        effects: [{ kind: 'amber', value: 5 }],
      },
    ],
  },
  {
    id: 'ah-price-war',
    title: '拍卖行价格大战',
    emoji: '📉',
    text: '「精炼便宜了」「买重铸石吗」\n拍卖行有人开始疯狂压价，价格战一触即发。是抄底还是观望？',
    options: [
      {
        label: '抄底扫货（-琥珀 获得两件随机遗物）',
        resultText: '你花 8 点琥珀扫了一批低价货，获得两件随机遗物。',
        effects: [
          { kind: 'amber', value: -8 },
          { kind: 'randomRelic', value: 1 },
          { kind: 'randomRelic', value: 1 },
        ],
      },
      {
        label: '跟着压价，清库存（+大量绳子）',
        resultText: '你把仓库清空低价抛售，换回 20 根绳子。',
        effects: [{ kind: 'rope', value: 20 }],
      },
      {
        label: '等价格触底（+琥珀）',
        resultText: '你耐心等待价格触底，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
      {
        label: '举报恶意压价（+意志）',
        resultText: '你举报了压价行为，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
    ],
  },
  {
    id: 'refine-25-grind',
    title: '精炼冲25',
    emoji: '🔨',
    text: '「精炼防御25了不用追了」「追精炼不如追幻想」\n你的装备停在+23，就差最后两步。冲不冲？失败可是会炸的。',
    options: [
      {
        label: '冲！炸了也认（50% 成功 / 50% 炸）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '+25成功！获得「N20通关证」遗物，这就是毕业的力量！',
          loseText: '炸了……装备归零，掉了 18 点血。',
          win: [{ kind: 'relic', cardId: 'n20-clear-cert' }],
          lose: [{ kind: 'hp', value: -18 }],
        },
      },
      {
        label: '用保护符（花琥珀 安全+24）',
        resultText: '你用了保护符花 5 点琥珀，稳妥升到+24，获得 3 点意志。',
        effects: [
          { kind: 'amber', value: -5 },
          { kind: 'will', value: 3 },
        ],
      },
      {
        label: '不冲了，+23够用',
        resultText: '「精炼防御25了不用追了」你选择收手，回复 10 点生命。',
        effects: [{ kind: 'hp', value: 10 }],
      },
    ],
  },
  {
    id: 'ilvl-entry-inspect',
    title: '装等入队审核',
    emoji: '📏',
    text: '「240装等」「这n20数值太高了」\n野队队长开组，设了严格的装等门槛。你刚好擦线。能不能混过去？',
    options: [
      {
        label: '强行凑到门槛（-绳子 获得随机卡）',
        resultText: '你花 14 根绳子临时凑了装等，混进队伍获得一张随机卡。',
        effects: [
          { kind: 'rope', value: -14 },
          { kind: 'randomCard', value: 1 },
        ],
      },
      {
        label: '找亲友开组无视门槛（获得遗物「氏族徽章」）',
        resultText: '你叫来亲友团开组，获得「氏族徽章」遗物。',
        effects: [{ kind: 'relic', cardId: 'clan-emblem' }],
      },
      {
        label: '不进了，继续沉淀',
        resultText: '「等我六件套」你决定自己沉淀提升，获得 4 点琥珀。',
        effects: [{ kind: 'amber', value: 4 }],
      },
    ],
  },
  {
    id: 'raid-wipe-finger-slip',
    title: '手滑灭团惨案',
    emoji: '💀',
    text: '「炮台跟着我！」——某群友手滑拉了一群怪\n全团就一个奶，有人手滑引到了不该引的……灭团了。',
    options: [
      {
        label: '背锅，扣血换意志',
        resultText: '你主动背锅，被群友骂了一顿掉 10 点血，但也赢得了尊重获得 5 点意志。',
        effects: [
          { kind: 'hp', value: -10 },
          { kind: 'will', value: 5 },
        ],
      },
      {
        label: '甩锅给奶妈',
        resultText: '「就我一个奶吗哈哈」你把锅甩给奶妈，获得 8 根绳子。',
        effects: [{ kind: 'rope', value: 8 }],
      },
      {
        label: '全员复盘，再来一次（下一战加强）',
        resultText: '「没准我们晚上还会出个分」你们重新整队，下一战更认真了。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
    ],
  },
  {
    id: 'producer-inspection',
    title: '制作人路过巡查',
    emoji: '👀',
    text: '群友上班摸鱼刚好被制作人路过看到，急喊「这是借鉴美术风格！」\n制作人在群里潜水看到了你们的聊天，气氛微妙。',
    options: [
      {
        label: '假装在讨论工作（+意志）',
        resultText: '「这是在搞风格调研」你反应极快，制作人满意地离开了，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
      {
        label: '趁机提建议（获得遗物「加班提灯」）',
        resultText: '你鼓起勇气向制作人提了合理建议，获得「加班提灯」遗物。',
        effects: [{ kind: 'relic', cardId: 'overtime-lantern' }],
      },
      {
        label: '继续摸鱼，爱咋咋地',
        resultText: '你无视制作人继续摸鱼，获得 6 根绳子和 2 点琥珀。',
        effects: [
          { kind: 'rope', value: 6 },
          { kind: 'amber', value: 2 },
        ],
      },
    ],
  },
  {
    id: 'last-seat-sprint',
    title: '团本末班车抢位',
    emoji: '🏃',
    text: '「八点团本末班车！@全体成员」\n薄荷色小搞发车了，但只剩最后一个位置。你和另一个群友同时申请了。',
    options: [
      {
        label: '手速抢位（50% 抢到 / 50% 被挤掉）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '你抢到了末班车！获得一层临时盟友。',
          loseText: '被挤掉了……掉了 5 点血，但捡到 10 根绳子。',
          win: [{ kind: 'tempAlly', value: 1 }],
          lose: [
            { kind: 'hp', value: -5 },
            { kind: 'rope', value: 10 },
          ],
        },
      },
      {
        label: '叫大佬来加车（-绳子 +意志）',
        resultText: '你花 8 根绳子请了个大佬来加开一车，获得 3 点意志。',
        effects: [
          { kind: 'rope', value: -8 },
          { kind: 'will', value: 3 },
        ],
      },
      {
        label: '算了，打下趟',
        resultText: '你佛系等下一班，回复 8 点生命。',
        effects: [{ kind: 'hp', value: 8 }],
      },
    ],
  },
  {
    id: 's3-season-kickoff',
    title: 'S3赛季揭幕',
    emoji: '🏁',
    text: '「刚刚在做S3的问卷」「S3初期不是有人测过」\n新赛季终于开了，排行榜清零，又是一轮新的冲分潮。你的策略？',
    options: [
      {
        label: '首日冲分！肝到天亮（-血 +大量琥珀和遗物）',
        resultText: '你连夜冲分，掉了 15 点血但获得 6 点琥珀和一件随机遗物。',
        effects: [
          { kind: 'hp', value: -15 },
          { kind: 'amber', value: 6 },
          { kind: 'randomRelic', value: 1 },
        ],
      },
      {
        label: '先观望meta再看（+意志）',
        resultText: '你没有盲目冲分而是研究S3新meta，获得 5 点意志。',
        effects: [{ kind: 'will', value: 5 }],
      },
      {
        label: '等第一波削弱再打（跳过一战）',
        resultText: '「无所谓我会选择不打等削弱」你跳过一场战斗等环境稳定。',
        effects: [{ kind: 'skipNextBattle', value: 1 }],
      },
    ],
  },
  {
    id: 'guild-war-declared',
    title: '工会战全面开启',
    emoji: '⚔️',
    text: '「军事化领主」「军事化管理是这样的」\n工会战公告已发，全群进入军事化管理。出勤表、配队图全部拉满。',
    options: [
      {
        label: '服从指挥（+意志 +琥珀 +获得「全押」）',
        resultText: '你严格服从工会指挥，获得 3 点意志、3 点琥珀和「全押」卡。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'amber', value: 3 },
          { kind: 'addCard', cardId: 'all-in' },
        ],
      },
      {
        label: '请战先锋（下一战加强）',
        resultText: '你主动申请打头阵，下一场战斗奖励翻倍。',
        effects: [{ kind: 'nextBattleHarder', value: 1 }],
      },
      {
        label: '摸鱼后勤（+绳子 +琥珀）',
        resultText: '你退到后勤摸鱼，获得 10 根绳子和 3 点琥珀。',
        effects: [
          { kind: 'rope', value: 10 },
          { kind: 'amber', value: 3 },
        ],
      },
    ],
  },
  {
    id: 'undersea-cable-down',
    title: '海底光缆断了',
    emoji: '🌊',
    text: '全员突然掉线，群里哀嚎一片。\n「我掉线了！」「我也掉线了！」「海底光缆被鲨鱼咬了？」',
    options: [
      {
        label: '疯狂重连（50% 连上 / 50% 继续掉）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '重连成功！队友都掉线你独享了掉落，获得随机遗物。',
          loseText: '怎么都连不上，心态爆炸掉了 8 点血。',
          win: [{ kind: 'randomRelic', value: 1 }],
          lose: [{ kind: 'hp', value: -8 }],
        },
      },
      {
        label: '趁机休息（回满血）',
        resultText: '你干脆关了游戏去休息，回复 20 点生命。',
        effects: [{ kind: 'hp', value: 20 }],
      },
      {
        label: '用手机热点硬撑（-血 +绳子）',
        resultText: '你开手机热点顶着高延迟打，掉了 6 点血但捡到 12 根绳子。',
        effects: [
          { kind: 'hp', value: -6 },
          { kind: 'rope', value: 12 },
        ],
      },
    ],
  },
  {
    id: 'optimized-out-of-raid',
    title: '被优化出队',
    emoji: '😞',
    text: '「弱的是职业不是玩家」——三百一十页\n「xhgm要jb完蛋了」\n团长说你的职业这版本不太行，把你移出了队伍。',
    options: [
      {
        label: '转职重新来过（阶级+1 -血）',
        resultText: '你一怒之下转了强势职业，阶级提升但掉了 12 点血。',
        effects: [
          { kind: 'casteUp', value: 1 },
          { kind: 'hp', value: -12 },
        ],
      },
      {
        label: '坚持本命职业（+意志 获得「磨刀石」）',
        resultText: '「弱的是职业不是玩家」你坚持本命，获得 5 点意志和「磨刀石」卡。',
        effects: [
          { kind: 'will', value: 5 },
          { kind: 'addCard', cardId: 'sharpen' },
        ],
      },
      {
        label: '发帖挂人（+绳子）',
        resultText: '你到论坛发帖吐槽团长歧视弱势职业，获得 15 根绳子。',
        effects: [{ kind: 'rope', value: 15 }],
      },
    ],
  },
  {
    id: 'midnight-ping-storm',
    title: '深夜炸群风暴',
    emoji: '🌙',
    text: '凌晨两点，群消息突然99+。\n「你们睡了没？」「还没睡？」「夜班打卡」——深夜炸群开始了。',
    options: [
      {
        label: '加入炸群聊天（+绳子 +意志）',
        resultText: '你加入深夜话题，聊到天亮，获得 8 根绳子和 2 点意志。',
        effects: [
          { kind: 'rope', value: 8 },
          { kind: 'will', value: 2 },
        ],
      },
      {
        label: '开免打扰睡觉（回血）',
        resultText: '你开了免打扰安心睡觉，回复 15 点生命。',
        effects: [{ kind: 'hp', value: 15 }],
      },
      {
        label: '半夜爬起来打本（获得随机卡）',
        resultText: '你被炸醒后干脆起来打本，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
    ],
  },
  {
    id: 'dps-check-wall',
    title: '卡DPS检查线',
    emoji: '📈',
    text: '「260这n20数值太高了」——水千夏\n「甚至没人伤害高过我的全自动」——Ephyra\nBOSS的DPS检查线卡住了所有人，你刚好差一点。',
    options: [
      {
        label: '吃药硬撸（-琥珀 +意志 挑战高难）',
        resultText: '你嗑药把DPS顶上去，花 3 点琥珀换来了下一场高难战。',
        effects: [
          { kind: 'amber', value: -3 },
          { kind: 'nextBattleHarder', value: 1 },
        ],
      },
      {
        label: '换装备优化手法（+意志）',
        resultText: '你花时间调整配装和循环，获得 4 点意志。',
        effects: [{ kind: 'will', value: 4 }],
      },
      {
        label: '放弃，等dps更高的来带',
        resultText: '「220先带我」你放弃了，等着被带，获得 8 根绳子。',
        effects: [{ kind: 'rope', value: 8 }],
      },
    ],
  },
  {
    id: 'guide-vs-homework',
    title: '看攻略还是抄作业',
    emoji: '📖',
    text: '「等inf下班一脚踢死N5煌墓了」——Ephyra\n群里大佬发了详细攻略，但也有人说「直接抄作业就行了」。你选哪个？',
    options: [
      {
        label: '认真看攻略（+意志 +琥珀）',
        resultText: '你仔细研读了攻略，获得了 3 点意志和 4 点琥珀。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'amber', value: 4 },
        ],
      },
      {
        label: '直接抄作业（获得随机卡）',
        resultText: '你直接复制了大佬的配装，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '不看也不抄，自己摸索',
        resultText: '「爱玩啥玩啥」你决定自己探索，获得 5 点意志。',
        effects: [{ kind: 'will', value: 5 }],
      },
    ],
  },
  {
    id: 'save-and-splurge',
    title: '攒资源终极梭哈',
    emoji: '💰',
    text: '「我的梭哈是无～5」\n你攒了好几个版本的资源，今天终于要全部梭哈了。all or nothing？',
    options: [
      {
        label: '梭哈！全压（50% 暴富 / 50% 归零）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.5,
          winText: '梭哈大获成功！获得两件随机遗物和一张随机卡。',
          loseText: '全沉了……获得「烧尽的余烬」遗物作为安慰奖，掉 10 点血。',
          win: [
            { kind: 'randomRelic', value: 1 },
            { kind: 'randomRelic', value: 1 },
            { kind: 'randomCard', value: 1 },
          ],
          lose: [
            { kind: 'relic', cardId: 'burned-out-ember' },
            { kind: 'hp', value: -10 },
          ],
        },
      },
      {
        label: '分批压注，稳一点（+琥珀 +意志）',
        resultText: '你分了三次压注，获得 4 点琥珀和 3 点意志。',
        effects: [
          { kind: 'amber', value: 4 },
          { kind: 'will', value: 3 },
        ],
      },
      {
        label: '不梭了，继续攒',
        resultText: '「无～0就是梭哈」你觉得资源还不够多，继续攒，获得 10 根绳子。',
        effects: [{ kind: 'rope', value: 10 }],
      },
    ],
  },
  {
    id: 'glamour-contest',
    title: '幻化大赛开赛',
    emoji: '👗',
    text: '「说起来现在的高定动作是不是可以排出这个效果来」——飞鱼娘\n「高定时装」群友发起了幻化大赛，比拼谁的装备最好看。',
    options: [
      {
        label: '认真参赛（花琥珀 获得VIP陪酒卡）',
        resultText: '你花 5 点琥珀精心搭配幻化，获得「高级VIP陪酒卡」遗物。',
        effects: [
          { kind: 'amber', value: -5 },
          { kind: 'relic', cardId: 'wine-companion-vip' },
        ],
      },
      {
        label: '蹭朋友的时装参赛（+绳子 +意志）',
        resultText: '你借了群友的时装参赛，居然还拿了奖，获得 8 根绳子和 2 点意志。',
        effects: [
          { kind: 'rope', value: 8 },
          { kind: 'will', value: 2 },
        ],
      },
      {
        label: '当评委吃瓜（+琥珀）',
        resultText: '你在旁边当评委打分，获得 3 点琥珀。',
        effects: [{ kind: 'amber', value: 3 }],
      },
    ],
  },
  {
    id: 'wipe-review-meeting',
    title: '翻车复盘大会',
    emoji: '📋',
    text: '「s2的蛇，当时我用奶的罩子去挡」\n昨晚副本翻车了，群主主持复盘大会。你全程录像了，要不要出来自首？',
    options: [
      {
        label: '主动复盘，承认失误（+意志 +琥珀）',
        resultText: '你坦诚复盘了自己的失误，获得 4 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 4 },
          { kind: 'amber', value: 3 },
        ],
      },
      {
        label: '甩锅给机制（+绳子）',
        resultText: '「加强 boss 也就你游策划做得出来惹」你把锅甩给策划，获得 12 根绳子。',
        effects: [{ kind: 'rope', value: 12 }],
      },
      {
        label: '装死等风头过去',
        resultText: '你全程沉默假装掉线，回复 8 点生命。',
        effects: [{ kind: 'hp', value: 8 }],
      },
    ],
  },
  {
    id: 'emergency-rescue-call',
    title: '群友紧急救场',
    emoji: '🆘',
    text: '「@零 救命！」「220先带我，240先带我」\n有人在副本里快团灭了，群里紧急呼叫救场。你去不去？',
    options: [
      {
        label: '立刻救场（+意志 +临时盟友）',
        resultText: '你火速赶去救场，获得 4 点意志和一层临时盟友。',
        effects: [
          { kind: 'will', value: 4 },
          { kind: 'tempAlly', value: 1 },
        ],
      },
      {
        label: '远程指导（+琥珀 +绳子）',
        resultText: '你在群里远程指挥，帮他们过了，获得 3 点琥珀和 6 根绳子。',
        effects: [
          { kind: 'amber', value: 3 },
          { kind: 'rope', value: 6 },
        ],
      },
      {
        label: '装没看到，自己打自己的',
        resultText: '「无所谓反正我打不过」你假装没看到消息，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
    ],
  },
  {
    id: 'lucky-drop-jackpot',
    title: '意外大出货',
    emoji: '🎉',
    text: '「我已经把300打平了」——Ephyra\n你在路边随手打了一只野怪，居然掉出了极品！群友都酸了。',
    options: [
      {
        label: '低调出货，闷声发大财（+琥珀 +意志）',
        resultText: '你低调地把装备穿上，获得 3 点琥珀和 3 点意志。',
        effects: [
          { kind: 'amber', value: 3 },
          { kind: 'will', value: 3 },
        ],
      },
      {
        label: '发群炫耀（+大量绳子）',
        resultText: '你截图发群里引来一片「？？？」，获得 20 根绳子。',
        effects: [{ kind: 'rope', value: 20 }],
      },
      {
        label: '趁欧气还在继续刷（获得随机遗物）',
        resultText: '你趁欧气正旺继续刷本，又出了一件随机遗物。',
        effects: [{ kind: 'randomRelic', value: 1 }],
      },
    ],
  },
  {
    id: 'server-maintenance-despair',
    title: '服务器维护中',
    emoji: '🚧',
    text: '「这周的xhgm已经没有上线的必要了」\n「bkl的所有产能都搞游星岛了」\n服务器突然宣布紧急维护，预计3小时。群友集体破防。',
    options: [
      {
        label: '耐心等维护结束（+意志 +琥珀）',
        resultText: '你放下游戏做了点别的事，获得 3 点意志和 3 点琥珀。',
        effects: [
          { kind: 'will', value: 3 },
          { kind: 'amber', value: 3 },
        ],
      },
      {
        label: '去别的游戏转转（获得随机卡）',
        resultText: '「你们都不陪我三角洲」你去玩了另一款游戏，获得一张随机卡。',
        effects: [{ kind: 'randomCard', value: 1 }],
      },
      {
        label: '怒骂运营（+绳子 被塞诅咒）',
        resultText: '你冲进论坛怒喷运营，获得 15 根绳子但被塞了「魔鬼契约」。',
        effects: [
          { kind: 'rope', value: 15 },
          { kind: 'addCurse', cardId: 'devil-curse' },
        ],
      },
    ],
  },

  // ===== 限制性事件·高风险高回报（8件） =====
  {
    id: 'desperate-gamble',
    title: '孤注一掷',
    emoji: '🎲',
    text: '「梭哈！再梭哈！」\n全群梭哈狂潮中，你面前出现了一张孤注一掷的契约。签下它你将获得强大力量，但代价惨重。',
    options: [
      {
        label: '签下契约（扣10HP，获得遗物「孤注一掷契约」）',
        resultText: '你咬牙签下契约，生命大幅下降，但获得了「孤注一掷契约」。',
        effects: [
          { kind: 'hp', value: -10 },
          { kind: 'relic', cardId: 'desperate-pact' },
        ],
      },
      {
        label: '稳健拒绝（扣 3HP，安全离开）',
        resultText: '你拒绝了这个危险的交易，但谈判时还是被坑了 3 点血。',
        effects: [{ kind: 'hp', value: -3 }],
      },
    ],
  },
  {
    id: 'rare-restriction',
    title: '稀有封印',
    emoji: '🔒',
    text: '「赌狗应有尽有」\n一位神秘商人提出交易：本层你只能获得普通品质的卡牌，但给你一件强力遗物和一张随机卡。你敢接吗？',
    options: [
      {
        label: '接受封印（获得「赌狗の运」+随机卡）',
        resultText: '你接受了封印，获得了「赌狗の运」遗物和一张随机卡。本层稀有卡与你无缘了。',
        effects: [
          { kind: 'relic', cardId: 'gamblers-luck' },
          { kind: 'randomCard', value: 1 },
        ],
      },
      {
        label: '拒绝封印',
        resultText: '你拒绝了这个奇怪的交易，商人悻悻离开，你获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
    ],
  },
  {
    id: 'blood-ceremony',
    title: '血之仪式',
    emoji: '🩸',
    text: '「烧血打输出，刺激」——赤红浴血流的传说\n古老的赤红浴血仪式在你面前展开：献祭最大生命，换取血之契约与禁忌之力。',
    options: [
      {
        label: '举行仪式（最大HP -5，获得「血之契约」+「血战」）',
        resultText: '你割开了手腕献祭，最大生命永久减少 5 点，但获得了「血之契约」遗物和「血战」卡。',
        effects: [
          { kind: 'maxHp', value: -5 },
          { kind: 'relic', cardId: 'blood-pact' },
          { kind: 'addCard', cardId: 'blood-battle' },
        ],
      },
      {
        label: '拒绝献祭',
        resultText: '你拒绝了这个血腥的仪式，回复 5 点生命作为自我安慰。',
        effects: [{ kind: 'hp', value: 5 }],
      },
    ],
  },
  {
    id: 'cursed-blade-find',
    title: '诅咒之刃',
    emoji: '🗡️',
    text: '「诅咒之刃，用就完事了」\n你在废墟中发现了一把散发着不祥气息的利刃。握住它会给你力量，但也会招来诅咒。',
    options: [
      {
        label: '握住诅咒之刃（获得「诅咒之刃」+被塞「金色大便」）',
        resultText: '你握住了诅咒之刃，力量涌现但手牌被塞了一张「金色大便」诅咒卡。',
        effects: [
          { kind: 'relic', cardId: 'cursed-blade' },
          { kind: 'addCurse', cardId: 'golden-poop' },
        ],
      },
      {
        label: '不碰诅咒之物，选择安全的路（获得「一击」）',
        resultText: '你放弃了诅咒之刃，在旁边的箱子里找到了一张「一击」卡牌。',
        effects: [{ kind: 'addCard', cardId: 'one-punch' }],
      },
    ],
  },
  {
    id: 'glass-challenge',
    title: '玻璃试炼',
    emoji: '💎',
    text: '「玻璃大炮，不是你死就是我亡」\n传说中的玻璃试炼：接受它你将获得毁天灭地的首攻力量，但之后三场战斗受到的伤害将翻倍。',
    options: [
      {
        label: '接受试炼（扣8HP，获得「玻璃大炮」+「赤红觉醒」，后续3战受伤x2）',
        resultText: '你接受了玻璃试炼，掉了 8 点血，但获得了「玻璃大炮」遗物和「赤红觉醒」。接下来的战斗将更加凶险。',
        effects: [
          { kind: 'hp', value: -8 },
          { kind: 'relic', cardId: 'glass-cannon' },
          { kind: 'addCard', cardId: 'crimson-awaken' },
          { kind: 'nextBattleHarder', value: 1 },
        ],
      },
      {
        label: '拒绝试炼，活着不好吗',
        resultText: '你拒绝了这场疯狂的试炼，回复 6 点生命。',
        effects: [{ kind: 'hp', value: 6 }],
      },
    ],
  },
  {
    id: 'heavy-choice',
    title: '沉重抉择',
    emoji: '🪨',
    text: '「重甲笨重，但我能扛」\n一套传说中的重甲摆在面前。穿上它防御力飙升，但沉重的负担会让你接下来两场战斗初始能量减少 2 点。',
    options: [
      {
        label: '穿上重甲（获得「重甲」，下两场初始能量-2）',
        resultText: '你穿上了沉重的铠甲，获得了「重甲」遗物。但接下来两场战斗你会感到行动迟缓。',
        effects: [{ kind: 'relic', cardId: 'heavy-armor' }],
      },
      {
        label: '放弃重甲，保持灵活',
        resultText: '你选择保持灵活的身手，获得 2 点意志和 2 点琥珀。',
        effects: [
          { kind: 'will', value: 2 },
          { kind: 'amber', value: 2 },
        ],
      },
    ],
  },
  {
    id: 'merchant-trap',
    title: '商人陷阱',
    emoji: '🏪',
    text: '「商人说：拿了我的折扣就别想好过」\n一个油嘴滑舌的商人向你兜售贿赂金，拿了它商店折扣巨大，但你的绳子会被他卷走。或者你可以反过来给他绳子换点好东西。',
    options: [
      {
        label: '接受贿赂（失去15绳子，获得「商人贿赂金」）',
        resultText: '你拿了商人的贿赂金，绳子少了 15 根，但获得了「商人贿赂金」遗物。',
        effects: [
          { kind: 'rope', value: -15 },
          { kind: 'relic', cardId: 'merchant-bribe' },
        ],
      },
      {
        label: '反向交易（付10绳子，获得「群疗」）',
        resultText: '你反过来给了商人 10 根绳子，换到了一张「群疗」卡牌。',
        effects: [
          { kind: 'rope', value: -10 },
          { kind: 'addCard', cardId: 'team-heal' },
        ],
      },
      {
        label: '不跟商人打交道，走人',
        resultText: '你警惕地避开了这个可疑的商人，获得 3 点意志。',
        effects: [{ kind: 'will', value: 3 }],
      },
    ],
  },
  {
    id: 'deal-with-devil',
    title: '恶魔交易',
    emoji: '😈',
    text: '「以命换命，不破不立」\n暗影中一个声音向你低语：用你的血肉换一件传说遗物。但交易的代价远不止于此……',
    options: [
      {
        label: '签下恶魔契约（扣8HP，获得「双刃剑」+被塞「魔鬼契约」）',
        resultText: '你与恶魔签下了契约，掉了 8 点血，获得了「双刃剑」遗物，但被塞了一张「魔鬼契约」诅咒卡。',
        effects: [
          { kind: 'hp', value: -8 },
          { kind: 'relic', cardId: 'double-edged' },
          { kind: 'addCurse', cardId: 'devil-curse' },
        ],
      },
      {
        label: '拒绝恶魔，净化自身（回复5HP）',
        resultText: '你抵抗了恶魔的诱惑，圣光净化了你的身心，回复 5 点生命。',
        effects: [{ kind: 'hp', value: 5 }],
      },
    ],
  },

  // ===== 宝箱事件（treasure节点触发） =====
  {
    id: 'treasure-ancient-chest',
    title: '远古宝箱',
    emoji: '💎',
    text: '一个古老的宝箱静静地躺在废墟中。箱体上铭刻着薄荷色氏族的符文——似乎有两种打开方式。',
    options: [
      {
        label: '用力砸开（获得稀有卡牌 + 绳子）',
        resultText: '你用力砸开了宝箱！里面躺着一张闪耀的稀有卡牌和一把绳子。',
        effects: [
          { kind: 'randomCard' },
          { kind: 'rope', value: 10 },
        ],
      },
      {
        label: '仔细撬锁（概率获得遗物，失败则触发陷阱扣血）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.55,
          winText: '你成功撬开了锁！获得一件稀有遗物。',
          loseText: '陷阱触发！你被毒针刺中，扣了 15 点血。',
          win: [{ kind: 'randomRelic' }],
          lose: [{ kind: 'hp', value: -15 }],
        },
      },
      {
        label: '不打开，只搜刮周围（获得绳子和意志）',
        resultText: '你搜刮了宝箱周围的杂物，找到了一些有用的东西。',
        effects: [
          { kind: 'rope', value: 20 },
          { kind: 'will', value: 2 },
        ],
      },
    ],
  },
  {
    id: 'treasure-mimic',
    title: '可疑的宝箱',
    emoji: '📦',
    text: '这个宝箱的铰链有点不对劲……它在微微颤动。群友们说过：「那不是宝箱，是宝箱怪！」',
    options: [
      {
        label: '战斗！打败宝箱怪（胜利获遗物+琥珀，失败扣血）',
        resultText: '',
        effects: [],
        gamble: {
          chance: 0.6,
          winText: '你成功打败了宝箱怪！腹中居然藏着一件遗物和 3 颗琥珀。',
          loseText: '宝箱怪咬了你一口，扣了 12 点血。',
          win: [
            { kind: 'randomRelic' },
            { kind: 'amber', value: 3 },
          ],
          lose: [{ kind: 'hp', value: -12 }],
        },
      },
      {
        label: '悄悄绕开，捡掉在外面的东西（获得绳子和意志）',
        resultText: '你小心翼翼地绕开了宝箱怪，捡起了它掉在外面的食物。',
        effects: [
          { kind: 'rope', value: 12 },
          { kind: 'will', value: 1 },
        ],
      },
    ],
  },

  // ===== 秘闻事件（mystery节点触发） =====
  {
    id: 'mystery-forgotten-lore',
    title: '被遗忘的传说',
    emoji: '🔮',
    text: '你在墙壁上发现了一段古老的文字：「星痕大陆的初代勇者们，曾将力量封印于此……」\n是否继续阅读？',
    options: [
      {
        label: '潜心研读（消耗3HP，随机升级一张卡+获得意志）',
        resultText: '你耗费心血研读了全文，知识涌入脑海，一张卡牌得到了强化。',
        effects: [
          { kind: 'hp', value: -3 },
          { kind: 'upgradeRandomCard' },
          { kind: 'will', value: 3 },
        ],
      },
      {
        label: '快速浏览（获得绳子和意志）',
        resultText: '你快速扫了一眼，记住了一些要点。',
        effects: [
          { kind: 'rope', value: 15 },
          { kind: 'will', value: 1 },
        ],
      },
      {
        label: '无视它，继续前行',
        resultText: '你转身继续赶路，但脑海中隐约还回荡着那段文字……',
        effects: [{ kind: 'rope', value: 5 }],
      },
    ],
  },
  {
    id: 'mystery-echo',
    title: '群聊回响',
    emoji: '📱',
    text: '你感受到了一阵奇异的共振——这是来自其他平行宇宙的薄荷色氏族成员的群聊回响。\n「无所谓我会选择不打等削弱」\n「弱的是职业不是玩家」\n「那你还是牢。」',
    options: [
      {
        label: '接入回响（回复15HP，获得5绳子）',
        resultText: '群聊的温暖能量涌入你的身体，疲惫消散了不少。',
        effects: [
          { kind: 'hp', value: 15 },
          { kind: 'rope', value: 5 },
        ],
      },
      {
        label: '记录回响（获得大量绳子和1点意志）',
        resultText: '你拿出笔记本匆匆记录下这些经典语录，感觉值了。',
        effects: [
          { kind: 'rope', value: 25 },
          { kind: 'will', value: 1 },
        ],
      },
    ],
  },
  {
    id: 'mystery-dark-omen',
    title: '不祥之兆',
    emoji: '🌑',
    text: '风向突然改变，天空暗了下来。你听见远处传来低沉的呢喃：「下一场战斗……会很恐怖。」\n这是一种预警，也是一种赌注。',
    options: [
      {
        label: '接受挑战（下一场战斗变成精英难度，但奖励翻倍）',
        resultText: '你挺起胸膛面对黑暗的前方。下一场将是对你真正的考验。',
        effects: [{ kind: 'nextBattleHarder' }],
      },
      {
        label: '绕道而行（跳过下一场战斗）',
        resultText: '「无所谓我会选择不打等削弱」——你明智地把这场战斗跳过了。',
        effects: [{ kind: 'skipNextBattle' }],
      },
      {
        label: '献祭生命换取力量（扣10HP，获得遗物）',
        resultText: '你向黑暗献上了鲜血，黑暗回馈了你力量。',
        effects: [
          { kind: 'hp', value: -10 },
          { kind: 'randomRelic' },
        ],
      },
    ],
  },
];

export const EVENT_MAP: Record<string, GameEvent> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);
