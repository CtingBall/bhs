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
];

export const SUMMON_RECIPE_MAP: Record<string, SummonRecipe> = Object.fromEntries(
  SUMMON_RECIPES.map((r) => [r.id, r]),
);
