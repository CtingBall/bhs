// ============================================================================
// 人物模块（Character/Persona Registry）
// 开局选择角色 → 获得固定效果（专属遗物）与风味叙事。
// 取材自「薄荷色氏族公约」群聊记录（灵感挖掘报告）。
// ============================================================================

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  icon: string;
  desc: string;
  /** 人物小传（群聊背景） */
  lore: string;
  /** 专属遗物（开局自动装配，不可卸下） */
  relicId: string;
  /** 是否已开放 */
  unlocked: boolean;
}

export const CHARACTER_REGISTRY = new Map<string, CharacterDef>();

export function registerCharacter(def: CharacterDef): void {
  CHARACTER_REGISTRY.set(def.id, def);
}

export function getCharacterDef(id: string): CharacterDef {
  const def = CHARACTER_REGISTRY.get(id);
  if (!def) throw new Error(`未知人物: ${id}`);
  return def;
}

// ============================================================================
// 第一位人物：水千夏
// ============================================================================

registerCharacter({
  id: 'char_qianxia',
  name: '水千夏',
  title: '不死魔王 · 守身如玉',
  icon: '💖',
  desc: '群内最神秘的存在：自称不死魔王，头衔却是「守身如玉」；是「阿斯特里斯的人口数量下降了」这句年度金句的发言人，也是《冰矛与射线》同人传说的作者。',
  lore: '「昨天号称不死魔王的水千夏被强袭虫一直炸。」——氏族编年史第 14106 条。她坚称自己是不死的，直到被强袭虫炸得满地找牙；但谁也不敢真的质疑她——毕竟她守身如玉。',
  relicId: 'relic_qianxia_undying',
  unlocked: true,
});

// 其余五位人物（全部取材自群聊真实名场面，见 灵感挖掘报告.md）
registerCharacter({
  id: 'char_shisan',
  name: '伏月十三',
  title: '线虫故事 1/1',
  icon: '🐛',
  desc: '群内著名的讲故事担当：上次日本人问他「为什么那个 BOSS 要叫石头人，是不是因为神奇四侠」。他的每次发言都会引发全群五连复读「十三线虫故事 1/1」。',
  lore: '「和日本人哪来的线虫故事！」——伏月十三，2026-04-14，对四人连续复读的破防回应。线虫，意为 24 小时在线、从不下线的玩家。十三坚称自己和日本人没有线虫故事，但没人信。',
  relicId: 'relic_shisan_online',
  unlocked: true,
});

registerCharacter({
  id: 'char_xiaoxi',
  name: '薄荷色小溪',
  title: '会长 · 誓讨马贼',
  icon: '👑',
  desc: '群内公认定语的氏族会长，深夜仗剑讨马贼。「小溪在谁床上？怎么不回消息」——光盾篡位逼宫事件的最大受害者。',
  lore: '「我乃薄荷色氏族会长薄荷色小溪，今日誓讨马贼！」——三角洲行动深夜故事会，英气勃发的青年声音自门外传来。会长还说过「你永远是氏族人」，也说过「做了就上敏哥的当了」。',
  relicId: 'relic_xiaoxi_president',
  unlocked: true,
});

registerCharacter({
  id: 'char_xingluo',
  name: '星落',
  title: '幸运星 · 富婆',
  icon: '⭐',
  desc: '氏族队宠与官方认证富婆（水千夏：「得在氏族花名册上给星落加上富婆词条了」）。溪谷全家福全程指挥站位：「这个位置挡住樱雪了~」。',
  lore: '「溪谷的篝火氛围最好~」——星落，一周年合照拍摄地选定者。有人骂「落落是不可缺少的，坠明是可以替代的」。可爱才是正义！',
  relicId: 'relic_xingluo_luckystar',
  unlocked: true,
});

registerCharacter({
  id: 'char_shanlan',
  name: '薄荷色第二栅栏',
  title: '脆皮鸽 · 第一活跃',
  icon: '🕊️',
  desc: '群内第一活跃与复读文化的中流砥柱。信奉居区 jk 的哲学：「人的本质是一个复读机（）」。',
  lore: '复读文化观察：Ukino 说「这里是复读群，呆在这里的都一直在复读，不吉利」；小溪附议「很多时候聊天很累啊，公式化复读」；奶蛙则直接开喷「复读的去紫砂」。而栅栏的头衔是脆皮鸽。',
  relicId: 'relic_shanlan_repeat',
  unlocked: true,
});

registerCharacter({
  id: 'char_naiwa',
  name: '奶蛙',
  title: '🌻',
  icon: '🐸',
  desc: '暴躁奶妈：口头禅「我一拳打死你」，头衔是一朵向日葵。曾自嘲斧头比她高 30 万→80 万→160 万。',
  lore: '奶蛙看到卡牌游戏成品时的第一反应是「我去 做出了肉鸽卡牌游戏吗」。她会骂「复读的去紫砂」，也会在队友倒下时递上一朵🌻——毕竟，奶妈。',
  relicId: 'relic_naiwa_punch',
  unlocked: true,
});
