import type { SummonRecipe } from '@/types';

// 召唤物融合配方：化用群聊"召唤物关系总表"
// 高级召唤物需要2个低级召唤物作为材料融合
export const SUMMON_RECIPES: SummonRecipe[] = [
  {
    id: 'recipe-mum-flyfish',
    resultSummonId: 'guardian-mum',
    materials: ['mum-head', 'flyfish'],
    name: '守护姆头',
    desc: '融合姆头与飞鱼：每回合+1能量且获得5格挡',
    flavor: '「5姆5丹毕业配装」',
  },
  {
    id: 'recipe-spider-amber',
    resultSummonId: 'web-amber',
    materials: ['spider', 'amber'],
    name: '蛛网琥珀',
    desc: '融合蜘蛛与琥珀：每回合全体易伤2且回复4HP',
    flavor: '「琥珀做蒂娜」',
  },
  {
    id: 'recipe-boyce-mum',
    resultSummonId: 'berserker-boyce',
    materials: ['boyce', 'mum-head'],
    name: '狂战士博伊斯',
    desc: '融合博伊斯与姆头：每回合对随机敌人造成8伤害且+1能量',
    flavor: '「博伊斯」',
  },
  {
    id: 'recipe-flyfish-amber',
    resultSummonId: 'saint-flyfish',
    materials: ['flyfish', 'amber'],
    name: '圣域飞鱼',
    desc: '融合飞鱼与琥珀：每回合格挡6且回复3HP',
    flavor: '「圣域飞鱼娘」——Infinity',
  },
  {
    id: 'recipe-spider-boyce',
    resultSummonId: 'phantom-weaver',
    materials: ['spider', 'boyce'],
    name: '幻影织者',
    desc: '融合蜘蛛与博伊斯：每回合全体易伤2且对随机敌人造成6伤害',
    flavor: '「蜘蛛与博伊斯的融合」',
  },
  {
    id: 'recipe-frozen-thunder',
    resultSummonId: 'frozen-thunder',
    materials: ['thunder-orb', 'ice-crystal'],
    name: '极寒雷魔',
    desc: '每回合对所有敌人施加1电击+1冰冻',
  },
  {
    id: 'recipe-bee-king',
    resultSummonId: 'bee-king',
    materials: ['mum-king', 'beehive'],
    name: '蜂王',
    desc: '每回合回复3HP+获得3格挡',
  },
  {
    id: 'recipe-iron-fort',
    resultSummonId: 'iron-fort',
    materials: ['iron-fang', 'black-stone'],
    name: '铁壁堡垒',
    desc: '每回合获得10格挡',
  },
  {
    id: 'recipe-web-binder',
    resultSummonId: 'web-binder',
    materials: ['crab', 'spider'],
    name: '网缚者',
    desc: '每回合全体易伤3+全体虚弱1',
  },
  {
    id: 'recipe-spirit-fox-fish',
    resultSummonId: 'spirit-fox-fish',
    materials: ['fox', 'flyfish'],
    name: '灵狐飞鱼',
    desc: '每回合抽1张牌+1能量',
  },
  {
    id: 'recipe-hunter-alliance',
    resultSummonId: 'hunter-alliance',
    materials: ['wolf-bow', 'lizard'],
    name: '猎手同盟',
    desc: '每回合对随机敌人造成6伤害+2易伤',
  },
  {
    id: 'recipe-gold-flame-horn',
    resultSummonId: 'gold-flame-horn',
    materials: ['gold-fang', 'flame-horn'],
    name: '金炎双角',
    desc: '每回合+2能量+对全体造成3燃烧',
  },
  {
    id: 'recipe-cunning-fish',
    resultSummonId: 'cunning-fish',
    materials: ['flyfish', 'goblin'],
    name: '狡诈飞鱼',
    desc: '每回合格挡6+偷取1能量',
  },
  {
    id: 'recipe-wind-fang-dragon',
    resultSummonId: 'wind-fang-dragon',
    materials: ['red-fang', 'wind-bro'],
    name: '风牙龙',
    desc: '每回合对随机敌人造成10伤害',
  },
  {
    id: 'recipe-jade-fl',
    resultSummonId: 'jade-fl',
    materials: ['green-fur', 'ffl'],
    name: '翡翠FL',
    desc: '每回合回复5HP',
  },
];

export const SUMMON_RECIPE_MAP: Record<string, SummonRecipe> = Object.fromEntries(
  SUMMON_RECIPES.map((r) => [r.id, r]),
);
