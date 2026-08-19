// ============================================================================
// 剧情事件内容（Event Registry）
// 取材自「薄荷色氏族公约」QQ 群聊天记录（灵感挖掘报告三档分级）
// 深度：群内名场面/成员梗；中度：氏族文化与黑话；轻度：地名/阵营词
// ============================================================================

import type { Run } from '../core/run';
import { registerCard } from '../core/cards';

// ---------------------------------------------------------------------------
// 诅咒牌：虚空寄生虫（事件「风暴裂隙的虚空契约」奖励的代价）
// ---------------------------------------------------------------------------

registerCard({
  id: 'card_void_parasite',
  name: '虚空寄生虫',
  cardType: 'Curse',
  rarity: 'Special',
  baseCost: 99,
  targetType: 'None',
  tags: ['Curse'],
  unplayable: true,
  description: '诅咒 · 无法打出。抽到这张牌时，立即失去 3 点生命。',
  actionTree: { action_type: 'Sequence', params: { actions: [] } },
});

// ---------------------------------------------------------------------------
// 事件定义
// ---------------------------------------------------------------------------

export interface EventOptionDef {
  id: string;
  label: string;
  detail?: string;
  /** 执行后返回结果文本 */
  effect: (run: Run) => string;
}

export interface EventDef {
  id: string;
  /** 限定章节（undefined = 通用） */
  act?: number;
  name: string;
  icon: string;
  text: string;
  options: EventOptionDef[];
}

const EVENT_REGISTRY = new Map<string, EventDef>();

function registerEvent(def: EventDef): void {
  EVENT_REGISTRY.set(def.id, def);
}

// ============================================================================
// 通用事件（各章均可能出现）
// ============================================================================

registerEvent({
  id: 'evt_population_census',
  name: '主城人口普查',
  icon: '📊',
  text: '路旁的公告板上贴着最新的普查告示：「阿斯特里斯的人口数量下降了。」一位登记员拦住你：「冒险者，帮氏族统计一下活跃人口吧？」',
  options: [
    {
      id: 'census_help', label: '帮忙出城统计（失去 5% 生命）',
      detail: '深入城郊登记流动人口',
      effect: (run) => {
        const loss = run.loseHp(Math.max(1, Math.floor(run.state.hp * 0.05)));
        const draft = run.rollCardDraft(1);
        run.addCard(draft[0]);
        return `你在城郊跑断了腿（-${loss} HP），换来了一份【${cardName(draft[0])}】作为酬劳。`;
      },
    },
    {
      id: 'census_bribe', label: '塞钱糊弄（-30 金币）',
      detail: '花钱买通登记员',
      effect: (run) => {
        if (run.state.gold < 30) return '你的金币不够，登记员嗤笑着把你赶走了。';
        run.addGold(-30);
        run.heal(Math.round(run.state.maxHp * 0.1));
        return '登记员收了钱，在表上填了「人口稳定」。你心安理得地休息了一会儿（回复 10% 生命）。';
      },
    },
    {
      id: 'census_leave', label: '事不关己，离开', effect: () => '你假装没看见普查告示，悄悄离开了。',
    },
  ],
});

registerEvent({
  id: 'evt_stone_man',
  name: '石头人之问',
  icon: '🪨',
  text: '路边立着一块平平无奇的大石头，石头上刻着一行字：「为什么那个 BOSS 要叫做石头人？」旁边有人用小字补充：「是不是因为神奇四侠？」',
  options: [
    {
      id: 'stone_answer', label: '回答「因为神奇四侠」',
      detail: '似乎是个正确答案……？',
      effect: (run) => {
        run.addRelic('relic_whetstone');
        return '石头人满意地点了点头，从身下滚出一块【磨刀石】送给你。（获得遗物：磨刀石）';
      },
    },
    {
      id: 'stone_knock', label: '用力敲打石头',
      detail: '把石头人敲醒',
      effect: (run) => {
        run.loseHp(8);
        run.addGold(25);
        return '石头人惊醒，气呼呼地滚走了，掉落了 25 枚金币。你被崩飞的碎石砸到（-8 HP）。';
      },
    },
    {
      id: 'stone_leave', label: '别管它，继续前进', effect: () => '你绕着石头人走开了。它似乎叹了口气。',
    },
  ],
});

registerEvent({
  id: 'evt_xianchong_story',
  name: '线虫故事 1/1',
  icon: '🐛',
  text: '一个顶着黑眼圈的冒险者拉住你：「兄弟，听我说，我已经 24 小时没下线了……线虫故事 1/1，懂吗？」',
  options: [
    {
      id: 'xianchong_listen', label: '认真听完他的故事',
      detail: '获得一张随机卡牌',
      effect: (run) => {
        const draft = run.rollCardDraft(1);
        run.addCard(draft[0]);
        return `你听完了他通宵爬塔的光辉事迹，他感动地塞给你一张【${cardName(draft[0])}】。`;
      },
    },
    {
      id: 'xianchong_repeat', label: '复读「线虫故事1/1」',
      detail: '连续复读三次，触发隐藏奖励',
      effect: (run) => {
        run.addGold(50);
        run.heal(6);
        return '「线虫故事1/1」「线虫故事1/1」「线虫故事1/1」——他热泪盈眶，与你相拥（+50 金币，+6 生命）。';
      },
    },
    {
      id: 'xianchong_leave', label: '婉拒后离开', effect: () => '你表示自己也是线虫，然后头也不回地走了。',
    },
  ],
});

registerEvent({
  id: 'evt_clan_pill',
  name: '氏族药丸',
  icon: '💊',
  text: '氏族群里炸开了锅：「薄荷色氏族公约💊💊💊了！」改名风波席卷而来，有人提议改成「薄荷色嗜足公约」，有人提议「穗玉氏族公约」。',
  options: [
    {
      id: 'pill_rename', label: '加入改名运动（失去 10% 生命）',
      detail: '改名保平安',
      effect: (run) => {
        const loss = run.loseHp(Math.max(1, Math.floor(run.state.hp * 0.1)));
        run.addGold(40);
        return `你跟着复读了十遍新名字，嗓子哑了（-${loss} HP），却意外收到 40 枚金币的打赏。`;
      },
    },
    {
      id: 'pill_hold', label: '坚守公约',
      detail: '获得遗物：荆棘种子',
      effect: (run) => {
        run.addRelic('relic_thorn_seed');
        return '你站出来力挺旧名，族长欣慰地送给你一袋【荆棘种子】。（获得遗物：荆棘种子）';
      },
    },
    {
      id: 'pill_leave', label: '趁乱离开', effect: () => '你趁乱溜走了，什么都没发生。',
    },
  ],
});

registerEvent({
  id: 'evt_minge_trap',
  name: '敏哥的陷阱',
  icon: '🪤',
  text: '一个自称「敏哥」的铸造师神秘兮兮地凑过来：「兄弟，强化必成功！只要 50 金币，错过今天再等一年！」你总觉得哪里不对。',
  options: [
    {
      id: 'minge_forge', label: '「我信你」（-50 金币）',
      detail: '看起来超值的铸造选项',
      effect: (run) => {
        if (run.state.gold < 50) return '你掏了掏口袋，连 50 金币都没有。敏哥嫌弃地走开了。';
        run.addGold(-50);
        return '铸造瞬间火花四溅，然后炸了。你的 50 金币打了水漂。「做了就上敏哥的当了！」——你终于明白了这句话。';
      },
    },
    {
      id: 'minge_see_through', label: '识破骗局',
      detail: '获得 20 金币',
      effect: (run) => {
        run.addGold(20);
        return '你当场揭穿了他的「必成」把戏，围观群众喝彩着给你塞了 20 枚金币。敏哥灰溜溜地跑了。';
      },
    },
    {
      id: 'minge_leave', label: '无视离开', effect: () => '你绕过陷阱，继续赶路。',
    },
  ],
});

registerEvent({
  id: 'evt_immortal_king',
  name: '不死魔王',
  icon: '👑',
  act: 3,
  text: '一个自称「不死魔王」的冒险者拦住你：「我是不死的！无论什么伤害都无法击倒我——」话音未落，一群强袭虫从他头顶俯冲而过。',
  options: [
    {
      id: 'king_cheer', label: '围观他挨炸（获得 40 金币）',
      detail: '魔王翻车现场',
      effect: (run) => {
        run.addGold(40);
        return '你看着「不死魔王」被强袭虫炸得满地找牙，围观群众纷纷打赏这场演出（+40 金币）。';
      },
    },
    {
      id: 'king_fight', label: '挑战他的威严（触发战斗）',
      detail: '与强袭虫群战斗',
      effect: (run) => {
        run.state.flags['pendingSpecialCombat'] = 'm3_assault_bug,m3_assault_bug';
        return '你拔出武器：「让我看看你是怎么不死的！」强袭虫群转向了你！（准备战斗）';
      },
    },
    {
      id: 'king_leave', label: '保持沉默，悄悄离开', effect: () => '你默默路过，假装不认识这位魔王。',
    },
  ],
});

registerEvent({
  id: 'evt_repeater',
  name: '复读机',
  icon: '🔁',
  text: '一尊锈迹斑斑的复读机挡住去路，机械音不断循环：「人的本质是一个复读机。人的本质是一个复读机。人的本质是一个复读机……」',
  options: [
    {
      id: 'repeat_repeat', label: '跟着复读（+30 金币）',
      detail: '加入复读',
      effect: (run) => {
        run.addGold(30);
        return '你也开始复读，两个声音渐渐融为一体。复读机满意地吐出 30 枚金币（+30 金币）。';
      },
    },
    {
      id: 'repeat_speak', label: '说一句新的话',
      detail: '打破循环，获得随机卡牌',
      effect: (run) => {
        const draft = run.rollCardDraft(1);
        run.addCard(draft[0]);
        return `你说了句全新的台词，复读机当场死机，零件里掉出一张【${cardName(draft[0])}】。`;
      },
    },
    {
      id: 'repeat_smash', label: '砸了它（-5 生命，+50 金币）',
      effect: (run) => {
        run.loseHp(5);
        run.addGold(50);
        return '你砸碎了复读机，在残骸里翻出 50 枚金币，但手指被铁皮划伤（-5 HP）。';
      },
    },
  ],
});

// ============================================================================
// 第一章：阿斯特里斯·王都
// ============================================================================

registerEvent({
  id: 'evt_newcomer_sea_weapon',
  name: '新人报到·海武',
  act: 1,
  icon: '⚔️',
  text: '一个刚入族的萌新拦住你：「刚来，就是你们这个协会的会长要每人发一把海武是吧？」周围的人都在偷笑。',
  options: [
    {
      id: 'sea_give', label: '「没错，发你一把」（获得随机卡牌）',
      detail: '发放传说级「海武」',
      effect: (run) => {
        const draft = run.rollCardDraft(1);
        run.addCard(draft[0]);
        return `你把一张【${cardName(draft[0])}】郑重地交给他：「这是氏族特供海武。」萌新感动地走了。`;
      },
    },
    {
      id: 'sea_truth', label: '坦白真相（获得 30 金币）',
      detail: '告诉他海武是传说',
      effect: (run) => {
        run.addGold(30);
        return '你告诉他海武是遥远的传说，萌新失落地把 30 枚金币塞给你当情报费，转身继续肝去了。';
      },
    },
  ],
});

registerEvent({
  id: 'evt_bell_tower',
  name: '钟楼怪谈',
  act: 1,
  icon: '🕰️',
  text: '王都的钟楼在深夜敲响了十二下，但守夜人早已换岗。钟楼上似乎有什么东西在凝视着街道。',
  options: [
    {
      id: 'bell_climb', label: '上钟楼调查',
      detail: '触发一场战斗',
      effect: (run) => {
        run.state.flags['pendingSpecialCombat'] = 'm1_bandit_scout';
        return '你爬上了钟楼，黑暗里亮起了两双眼睛！（准备战斗）';
      },
    },
    {
      id: 'bell_ignore', label: '装作没听见', effect: () => '钟声还在响，但你决定明早再说。',
    },
  ],
});

registerEvent({
  id: 'evt_wolf_god',
  name: '狼神之怒',
  act: 1,
  icon: '🐺',
  text: '城墙上不知何时刷满了涂鸦：「狼神下令摧毁阿斯特里斯🐺🐺🐺🐺🐺🐺🐺……」涂鸦者本人正站在墙边，疯狂复读。',
  options: [
    {
      id: 'wolf_fight', label: '制止涂鸦（触发战斗）',
      detail: '与野狼群战斗',
      effect: (run) => {
        run.state.flags['pendingSpecialCombat'] = 'm2_wolfpack';
        return '你伸手去擦涂鸦，狼群从墙后低吼着扑了上来！（准备战斗）';
      },
    },
    {
      id: 'wolf_join', label: '加入复读（+25 金币）',
      detail: '一起刷屏',
      effect: (run) => {
        run.addGold(25);
        return '你和他一起复读了二十遍「狼神下令摧毁阿斯特里斯」，围观群众纷纷打赏（+25 金币）。';
      },
    },
  ],
});

// ============================================================================
// 第二章：阿斯特里斯平原
// ============================================================================

registerEvent({
  id: 'evt_pig_parade',
  name: '1x 广场小猪巡游',
  act: 2,
  icon: '🐷',
  text: '平原广场正在举办「1x 广场小猪巡游」，一个骑着粉色猪猪、戴着粉猪帽子的冒险者从你身边缓缓经过，眼神里带着故事。',
  options: [
    {
      id: 'pig_join', label: '加入巡游（回复 15% 生命）',
      detail: '快乐巡游',
      effect: (run) => {
        const heal = Math.round(run.state.maxHp * 0.15);
        run.heal(heal);
        return `你骑着租来的猪猪绕场三周，心情大好（+${heal} 生命）。`;
      },
    },
    {
      id: 'pig_confess', label: '对巡游者告白（获得遗物：幸运铜币）',
      detail: '「你是我见过最美的巡游女孩！」',
      effect: (run) => {
        run.addRelic('relic_lucky_coin');
        return '你鼓起勇气说出了土味情话，对方愣住，随后笑着把一枚【幸运铜币】塞进你手里。（获得遗物：幸运铜币）';
      },
    },
    {
      id: 'pig_watch', label: '旁观', effect: () => '你站在路边看完了整场巡游，心里暖暖的。',
    },
  ],
});

registerEvent({
  id: 'evt_mist_maze',
  name: '麦田迷宫',
  act: 2,
  icon: '🌾',
  text: '平原深处的麦田被雾气笼罩，隐约能听到镰刀划过麦穗的声音。麦田中央似乎有一顶被遗弃的巫偶帽。',
  options: [
    {
      id: 'maze_enter', label: '深入麦田（触发战斗）',
      detail: '与麦田中的存在战斗',
      effect: (run) => {
        run.state.flags['pendingSpecialCombat'] = 'm2_sad_cabbage';
        return '你拨开麦穗，一个锈迹斑斑的巫偶正对着你咧嘴笑！（准备战斗）';
      },
    },
    {
      id: 'maze_bypass', label: '绕道而行', effect: () => '你沿着田埂绕了远路，安全通过。',
    },
  ],
});

// ============================================================================
// 第三章：巴哈马尔高原
// ============================================================================

registerEvent({
  id: 'evt_goblin_cave',
  name: '哥布林洞穴·射线的复仇',
  act: 3,
  icon: '🕳️',
  text: '高原脚下有个幽深的洞穴，洞口立着一块牌子：「想听射线的复仇故事吗？v我50。」洞穴深处传来诡异的毛球蠕动声。',
  options: [
    {
      id: 'goblin_enter', label: '深入洞穴（触发战斗）',
      detail: '与洞穴深处的哥布林王战斗',
      effect: (run) => {
        run.state.flags['pendingSpecialCombat'] = 'm3_goblin_king';
        return '你刚踏入洞穴，哥布林王的怒吼震得洞壁发抖！（准备战斗）';
      },
    },
    {
      id: 'goblin_pay', label: '付 50 金币听故事（获得随机卡牌）',
      detail: 'v我50',
      effect: (run) => {
        if (run.state.gold < 50) return '你掏不出 50 金币，洞里传出失望的叹息。';
        run.addGold(-50);
        const draft = run.rollCardDraft(1);
        run.addCard(draft[0]);
        return '你听完了一整段「冰矛崛起后没给射线赎身」的恩怨情仇，得到一张【' + cardName(draft[0]) + '】作为情报费。';
      },
    },
    {
      id: 'goblin_leave', label: '不感兴趣，离开', effect: () => '你转身离开，洞口的声音还在喊：「v我50！」',
    },
  ],
});

registerEvent({
  id: 'evt_void_contract',
  name: '风暴裂隙的虚空契约',
  act: 3,
  icon: '👁️',
  text: '高原悬崖边的风暴裂隙中，悬浮着一颗散发着暗紫光芒的虚空心脏，低语声直击你的灵魂：「接受我的馈赠，你将获得永不枯竭的力量……代价是……一点小小的代价。」',
  options: [
    {
      id: 'void_accept', label: '接受深渊馈赠',
      detail: '获得遗物「虚空之眼」；代价：牌组塞入 2 张虚空寄生虫',
      effect: (run) => {
        run.addRelic('relic_void_eye');
        run.addCard('card_void_parasite');
        run.addCard('card_void_parasite');
        return '你握住了虚空心脏，一颗【虚空之眼】在掌心睁开。但同时，有什么东西爬进了你的牌组……（获得遗物：虚空之眼；牌组新增 2 张虚空寄生虫）';
      },
    },
    {
      id: 'void_purify', label: '净化裂隙（触发战斗）',
      detail: '胜利后获得大量金币并回满生命',
      effect: (run) => {
        run.state.flags['pendingSpecialCombat'] = 'm3_void_watcher';
        run.state.flags['voidContractReward'] = true;
        return '你拔剑刺向虚空心脏，风暴灵体从裂隙中涌出！（准备战斗）';
      },
    },
    {
      id: 'void_leave', label: '断然离去', effect: () => '你捂住耳朵快步离开，低语声渐渐消散。',
    },
  ],
});

// ============================================================================
// 第四章：蒙特诺尔溪谷
// ============================================================================

registerEvent({
  id: 'evt_family_photo',
  name: '溪谷全家福',
  act: 4,
  icon: '📷',
  text: '溪谷的篝火旁聚集了一大群氏族人。「@全体成员 九点合照，地点在新地图溪谷！」星落正在指挥站位：「这个位置挡住樱雪了~」',
  options: [
    {
      id: 'photo_join', label: '相信组织（回复 30% 生命）',
      detail: '全员到场，合影留念',
      effect: (run) => {
        const heal = Math.round(run.state.maxHp * 0.3);
        run.heal(heal);
        return `你挤进人群站好，快门声响起。合影结束后，你感觉充满了力量（+${heal} 生命）。`;
      },
    },
    {
      id: 'photo_stand', label: '帮忙指挥站位（获得随机卡牌）',
      detail: '成为合影导演',
      effect: (run) => {
        const draft = run.rollCardDraft(1);
        run.addCard(draft[0]);
        return `你指挥大家调整站位，效果出奇地好。星落感动地送给你一张【${cardName(draft[0])}】。`;
      },
    },
    {
      id: 'photo_absent', label: '缺席', effect: () => '你借口有事没去。后来听说合照上少了一个人，大家都很遗憾。',
    },
  ],
});

registerEvent({
  id: 'evt_usurpation',
  name: '篡位宣言',
  act: 4,
  icon: '👑',
  text: '一名身披光盾的骑士拦在你面前，高声宣布：「退位！我要当群主！」他环视四周：「小溪在谁床上？怎么不回消息？」',
  options: [
    {
      id: 'usurp_fight', label: '迎战叛军（触发战斗）',
      detail: '捍卫氏族秩序',
      effect: (run) => {
        run.state.flags['pendingSpecialCombat'] = 'm4_shell_cultist';
        return '你拔出武器：「氏族之主由大家选出，不是你说了算！」（准备战斗）';
      },
    },
    {
      id: 'usurp_negotiate', label: '谈判（失去 10% 生命，获得金币）',
      detail: '晓之以理',
      effect: (run) => {
        const loss = run.loseHp(Math.max(1, Math.floor(run.state.hp * 0.1)));
        run.addGold(60);
        return `你费尽口舌说服他放下武器（-${loss} HP），作为和解费他留下了 60 枚金币。`;
      },
    },
    {
      id: 'usurp_support', label: '支持光盾（获得遗物）',
      detail: '拥立新主',
      effect: (run) => {
        run.addRelic('relic_holy_guardian_seal');
        return '你站到了光盾这边。他大喜过望，送你一枚【圣徽护符】作为封赏。（获得遗物：圣徽护符）';
      },
    },
  ],
});

// 篡位事件的专属遗物（简版圣光守卫）
import type { Combat } from '../core/combat';
import { registerRelic } from './relics';
import { HOOK_PRIORITY } from '../core/hooks';
registerRelic({
  id: 'relic_holy_guardian_seal',
  name: '圣徽护符',
  desc: '战斗开始时获得 1 层【圣令】（若为神盾骑士）或 1 点力量。',
  rarity: 'Rare', icon: '🔱', basePrice: 200,
  install: (combat: Combat) => {
    combat.hooks.on('OnCombatStart', HOOK_PRIORITY.Relic, () => {
      if (combat.player.resourceCaps['holy_order']) {
        combat.modifyResource(combat.player, 'holy_order', 'Add', 1);
      }
      combat.applyBuff(combat.player, 'strength', 1);
    });
  },
});

// ---------------------------------------------------------------------------
// 事件池查询
// ---------------------------------------------------------------------------

export function pickEvent(run: Run, act: number): EventDef {
  const pool = [...EVENT_REGISTRY.values()].filter((e) => e.act === undefined || e.act === act);
  if (pool.length === 0) {
    throw new Error(`第 ${act} 章没有可用事件`);
  }
  return run.rng.map.pick(pool);
}

export function getEventById(id: string): EventDef {
  const ev = EVENT_REGISTRY.get(id);
  if (!ev) throw new Error(`未知事件: ${id}`);
  return ev;
}

function cardName(defId: string): string {
  try {
    return getCardDefForName(defId).name;
  } catch {
    return defId;
  }
}

import { getCardDef as getCardDefForName } from '../core/cards';
