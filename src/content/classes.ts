// ============================================================================
// 职业定义（Class Domain）—— 首版：雷影剑士 / 神盾骑士
// ============================================================================

export interface ClassResourceDef {
  id: string;
  name: string;
  max: number;
  icon: string;
  /** 回合结束是否衰减 */
  decayPerTurn?: number;
  desc: string;
}

export interface ClassDef {
  id: string;
  name: string;
  title: string;
  weapon: string;
  desc: string;
  maxHp: number;
  maxEnergy: number;
  /** 每回合发牌数（手牌持有无上限，杀戮尖塔规则） */
  handLimit: number;
  resources: ClassResourceDef[];
  starterDeck: string[];
  /** 战利品卡池白名单 */
  cardPool: string[];
  /** 营地祭仪 */
  campRitual: { name: string; desc: string };
  uiTheme: string;
}

export const CLASS_REGISTRY = new Map<string, ClassDef>();

export function registerClass(def: ClassDef): void {
  CLASS_REGISTRY.set(def.id, def);
}

export function getClassDef(id: string): ClassDef {
  const def = CLASS_REGISTRY.get(id);
  if (!def) throw new Error(`未知职业: ${id}`);
  return def;
}

// ============================================================================
// 职业注册（首版两职业）
// ============================================================================

registerClass({
  id: 'hero_sylvanguard',
  name: '森语者',
  title: '自然之环的生机祭司',
  weapon: '森之法环',
  desc: '远程自然施法者，以【自然之种】为法力之源。惩戒流消耗种子灌注爆发、以伤养己；愈合流囤积种子点亮五阶生机光环，为全队提供源源不断的治疗与减伤，并召唤树人随从作战。',
  maxHp: 65,
  maxEnergy: 3,
  handLimit: 5,
  resources: [
    { id: 'seed', name: '自然之种', max: 99, icon: '🌱', desc: '由播种技能积累，灌注消耗，也可点亮五阶生机光环' },
  ],
  starterDeck: [
    'card_syl_light_tap', 'card_syl_light_tap', 'card_syl_light_tap',
    'card_syl_vine_tangle', 'card_syl_vine_tangle', 'card_syl_vine_tangle',
    'card_syl_life_bloom', 'card_syl_life_bloom',
    'card_syl_infusion',
    'card_syl_nourish',
  ],
  cardPool: [
    'card_syl_light_tap', 'card_syl_vine_tangle', 'card_syl_life_bloom',
    'card_syl_infusion', 'card_syl_nourish',
    'card_syl_wild_bloom', 'card_syl_thorn_strike', 'card_syl_regenerative_pulse',
    'card_syl_healing_ring', 'card_syl_ancient_treant', 'card_syl_fairy_sprout',
    'card_syl_forest_fury',
  ],
  campRitual: {
    name: '古树深根祈愿',
    desc: '下一场战斗开局，法环预装填 15 颗自然之种。',
  },
  uiTheme: '#2ecc71',
});

registerClass({
  id: 'hero_frost_mage',
  name: '冰魔导师',
  title: '玄冰结界的寒冬咏者',
  weapon: '冰魔杖',
  desc: '远距离冰系法师，以【玄冰】打破吟唱桎梏：有冰即瞬发、费用减半、伤害剧增。冰矛流专注高频瞬发单点与陨星轰炸；射线流凝聚寒冰能量，召唤水龙卷构成永续阵地炮台。',
  maxHp: 68,
  maxEnergy: 3,
  handLimit: 5,
  resources: [
    { id: 'frost_shard', name: '玄冰', max: 4, icon: '❄️', desc: '由产冰技能凝结；持有玄冰时法术瞬发减费增伤，自动消耗 1 颗' },
    { id: 'frost_energy', name: '寒冰能量', max: 100, icon: '💧', desc: '射线流专属法力池，维持水龙卷运转（每回合消耗 15 点）' },
  ],
  starterDeck: [
    'card_mage_tide_strike', 'card_mage_tide_strike',
    'card_mage_frost_spear', 'card_mage_frost_spear',
    'card_mage_waterfall_beads', 'card_mage_waterfall_beads',
    'card_mage_ice_shield', 'card_mage_ice_shield',
    'card_mage_freezing_gale', 'card_mage_tide_draw',
  ],
  cardPool: [
    'card_mage_tide_strike', 'card_mage_frost_spear', 'card_mage_waterfall_beads',
    'card_mage_ice_shield', 'card_mage_freezing_gale', 'card_mage_tide_draw',
    'card_mage_frost_infusion', 'card_mage_glacial_blizzard',
    'card_mage_frost_ray', 'card_mage_hydro_vortex', 'card_mage_converging_tides',
  ],
  campRitual: {
    name: '凝霜冥想',
    desc: '下一场战斗开局，魔杖直接凝聚 4 颗满额玄冰。',
  },
  uiTheme: '#3498db',
});

registerClass({
  id: 'hero_flame_berserker',
  name: '赤炎狂战士',
  title: '狱火双斧的浴血修罗',
  weapon: '狱火双斧',
  desc: '近战火焰狂战士，双斧顺劈自带 30% 溅射与【燃烧】DOT。无相流在「炽烈升腾」与专精技能间交替施放，将无相等级推向 Lv5 极境一击；赤红流以卖血换取魂槽，魂槽越满攻击越凶、吸血越猛，化身炎魔焚尽一切。',
  maxHp: 80,
  maxEnergy: 3,
  handLimit: 5,
  resources: [
    { id: 'crimson_soul', name: '赤红魂槽', max: 100, icon: '🔥', desc: '任何血量变动均积累：受击 2/自残 3/回血 1；每 20 点攻击 +10%、吸血 +5%' },
  ],
  starterDeck: [
    'card_ber_flame_strike', 'card_ber_flame_strike',
    'card_ber_blazing_ascension',
    'card_ber_frenzied_slash',
    'card_ber_rage_guard', 'card_ber_rage_guard',
    'card_ber_dual_parry',
    'card_ber_axe_wind',
    'card_ber_blood_draw',
    'card_ber_ignite_blade',
  ],
  cardPool: [
    'card_ber_flame_strike', 'card_ber_blazing_ascension', 'card_ber_frenzied_slash',
    'card_ber_rage_guard', 'card_ber_dual_parry', 'card_ber_axe_wind',
    'card_ber_blood_draw', 'card_ber_ignite_blade',
    'card_ber_flame_assault', 'card_ber_rage_smash', 'card_ber_axe_storm', 'card_ber_arakawa_desolation',
    'card_ber_flame_dance', 'card_ber_falling_star', 'card_ber_flowing_slash', 'card_ber_flame_fiend',
  ],
  campRitual: {
    name: '沸血战痕烙印',
    desc: '失去 10 点当前生命，下一场战斗直接常驻【炎魔形态】3 回合。',
  },
  uiTheme: '#e74c3c',
});

registerClass({
  id: 'hero_titan_guardian',
  name: '巨刃守护者',
  title: '磐岩卫刃的移动要塞',
  weapon: '磐岩·卫刃',
  desc: '近战重装坦克，以【怒气】驱动爆发、【沙晶石】强化岩体。岩盾流将巨额护盾直接转化为护盾猛击的吨级伤害；格挡流以招架化解物理攻击并借力打力反震。',
  maxHp: 85,
  maxEnergy: 3,
  handLimit: 5,
  resources: [
    { id: 'rage', name: '怒气', max: 100, icon: '😡', desc: '受击与重刃攻击累积，回合结束衰减 20%；驱动怒爆/碎星冲' },
    { id: 'sand_crystal', name: '沙晶石', max: 5, icon: '✦', desc: '由凝聚技能生成，强化护盾/免死/控场' },
  ],
  starterDeck: [
    'card_grd_blade_strike', 'card_grd_blade_strike',
    'card_grd_shield_slam',
    'card_grd_parry_impact',
    'card_grd_sandstone_cloak', 'card_grd_sandstone_cloak',
    'card_grd_rock_guard', 'card_grd_rock_guard',
    'card_grd_sand_throw',
    'card_grd_rage_surge',
  ],
  cardPool: [
    'card_grd_blade_strike', 'card_grd_shield_slam', 'card_grd_parry_impact',
    'card_grd_sandstone_cloak', 'card_grd_rock_guard', 'card_grd_sand_throw', 'card_grd_rage_surge',
    'card_grd_star_shatter', 'card_grd_colossus_body', 'card_grd_rage_eruption',
    'card_grd_heroic_bulwark', 'card_grd_rock_rage_strike', 'card_grd_sandstone_grip',
  ],
  campRitual: {
    name: '重装砂岩加固',
    desc: '下一场战斗开局直接获得 30 点常驻护盾与 3 颗沙晶石。',
  },
  uiTheme: '#d35400',
});

registerClass({
  id: 'hero_sharpshooter',
  name: '神射手',
  title: '耀光长弓的荒野游侠',
  weapon: '耀光·长弓',
  desc: '远距离弓箭射手，以【光能】为箭矢附魔：光能 ≥50 激活重铸态（伤害+30%、段数+1）。驭兽流召唤野狼群协同撕咬；驯鹰流以暴击触发战隼俯冲，专精一击必杀。',
  maxHp: 70,
  maxEnergy: 3,
  handLimit: 5,
  resources: [
    { id: 'light_energy', name: '光能', max: 100, icon: '✨', desc: '由箭雨/精神凝聚积累；≥50 激活光能重铸（箭矢伤害+30% 段数+1），回合结束衰减 15' },
  ],
  starterDeck: [
    'card_sht_precise_shot', 'card_sht_precise_shot',
    'card_sht_storm_arrows',
    'card_sht_double_shot',
    'card_sht_rain_of_arrows', 'card_sht_rain_of_arrows',
    'card_sht_backflip_dodge', 'card_sht_backflip_dodge',
    'card_sht_mental_focus',
    'card_sht_beast_whistle',
  ],
  cardPool: [
    'card_sht_precise_shot', 'card_sht_storm_arrows', 'card_sht_double_shot',
    'card_sht_rain_of_arrows', 'card_sht_backflip_dodge', 'card_sht_mental_focus', 'card_sht_beast_whistle',
    'card_sht_wild_call', 'card_sht_surging_shot', 'card_sht_phantom_wolf',
    'card_sht_charged_snipe', 'card_sht_explosive_shot', 'card_sht_radiant_bombardment', 'card_sht_falcon_pact',
  ],
  campRitual: {
    name: '鹰眼校准与喂食',
    desc: '下一场战斗中，所有野狼与战隼伙伴造成的伤害翻倍。',
  },
  uiTheme: '#f1c40f',
});

registerClass({
  id: 'hero_soul_musician',
  name: '灵魂乐手',
  title: '魂韵电吉他的舞台主唱',
  weapon: '魂韵·电吉他',
  desc: '近远兼备的音波法师，攻击自带 25% 生命反哺（生机旋律）。狂音流以高频速弹与吸血转化掀起烈焰狂想；协奏流放置舞台音箱共鸣全场，以治愈乐章与五重奏守护全队。',
  maxHp: 72,
  maxEnergy: 3,
  handLimit: 5,
  resources: [
    { id: 'musical_note', name: '音符', max: 5, icon: '🎵', desc: '攻击牌生成狂音符、技能生成协奏符；满 5 音触发极境和弦' },
  ],
  starterDeck: [
    'card_mus_sonic_strike', 'card_mus_sonic_strike',
    'card_mus_amplified_beat',
    'card_mus_healing_beat',
    'card_mus_chord_rhythm', 'card_mus_chord_rhythm',
    'card_mus_sound_barrier', 'card_mus_sound_barrier',
    'card_mus_encore',
    'card_mus_tuning_slide',
  ],
  cardPool: [
    'card_mus_sonic_strike', 'card_mus_amplified_beat', 'card_mus_healing_beat',
    'card_mus_chord_rhythm', 'card_mus_sound_barrier', 'card_mus_encore', 'card_mus_tuning_slide',
    'card_mus_heroic_sonata', 'card_mus_flame_rhapsody', 'card_mus_converging_movement',
    'card_mus_healing_sonata', 'card_mus_surging_quintet', 'card_mus_passionate_flourish',
  ],
  campRitual: {
    name: '全套吉他调音',
    desc: '下一场战斗开局，音符谱表直接预填满 5 颗狂音符。',
  },
  uiTheme: '#9b59b6',
});

registerClass({
  id: 'hero_gale_knight',
  name: '青岚骑士',
  title: '破风长枪的天穹骑手',
  weapon: '青岚·破风长枪',
  desc: '风系长枪近战，以【勇气】驱动技能回流、【锐利】叠加穿刺。重装流积攒勇气不断刷新螺旋击刺形成风暴连刺；空战流以翔返腾空、刹那俯冲，在天空与地面间永动流转。',
  maxHp: 78,
  maxEnergy: 3,
  handLimit: 5,
  resources: [
    { id: 'courage', name: '勇气', max: 100, icon: '💨', desc: '长枪命中与招架积攒；消耗 30 点可将螺旋击刺捞回手牌' },
  ],
  starterDeck: [
    'card_knt_wind_strike', 'card_knt_wind_strike',
    'card_knt_gale_thrust',
    'card_knt_vaulting_leap',
    'card_knt_spear_parry', 'card_knt_spear_parry',
    'card_knt_wind_wall',
    'card_knt_wind_footwork',
    'card_knt_spiral_thrust_basic',
    'card_knt_setsuna_basic',
  ],
  cardPool: [
    'card_knt_wind_strike', 'card_knt_gale_thrust', 'card_knt_vaulting_leap',
    'card_knt_spear_parry', 'card_knt_wind_wall', 'card_knt_wind_footwork',
    'card_knt_spiral_thrust_basic', 'card_knt_setsuna_basic',
    'card_knt_spiral_thrust', 'card_knt_break_pursuit', 'card_knt_ring_of_valor',
    'card_knt_setsuna', 'card_knt_soaring_javelin', 'card_knt_keen_burst', 'card_knt_peerless_grace',
  ],
  campRitual: {
    name: '擦拭枪尖·风之誓言',
    desc: '下一场战斗开局直接获得 50 点勇气与 4 层锐利。',
  },
  uiTheme: '#1abc9c',
});

registerClass({
  id: 'hero_thunderblade',
  name: '雷影剑士',
  title: '双刃雷鸣的居合客',
  weapon: '雷影·镰长刀',
  desc: '近战雷系剑客，可在长刀与镰刀之间自由切换形态。长刀锋锐专注单体，镰刀顺劈扫荡群敌。通过【超高出力】积攒雷之印，满印居合斩一刀定乾坤。',
  maxHp: 75,
  maxEnergy: 3,
  handLimit: 5,
  resources: [
    { id: 'thunder_seal', name: '雷之印', max: 5, icon: '⚡', desc: '依靠超高出力积攒，驱动居合斩与月刃召唤' },
  ],
  starterDeck: [
    'card_tb_thrust', 'card_tb_thrust',
    'card_tb_scythe_sweep',
    'card_tb_shadow_step', 'card_tb_shadow_step',
    'card_tb_blade_parry',
    'card_tb_overcharge',
    'card_tb_overdrive_slash',
    'card_tb_draw_begin',
    'card_tb_shadow_assault',
  ],
  cardPool: [
    'card_tb_iai_slash', 'card_tb_issen', 'card_tb_infinite_thunder',
    'card_tb_scythe_wheel', 'card_tb_rapid_slashes', 'card_tb_thousand_flashes',
    'card_tb_thrust', 'card_tb_scythe_sweep', 'card_tb_shadow_step',
    'card_tb_blade_parry', 'card_tb_overcharge', 'card_tb_overdrive_slash',
    'card_tb_draw_begin', 'card_tb_shadow_assault',
  ],
  campRitual: {
    name: '磨刀石·雷纹开刃',
    desc: '下一场战斗前 3 回合，所有攻击伤害提升 35%，且形态切换不占费用。',
  },
  uiTheme: '#7c4dff',
});

registerClass({
  id: 'hero_aegis_knight',
  name: '神盾骑士',
  title: '圣光铸身的壁垒',
  weapon: '圣耀·剑盾',
  desc: '神圣光系重装近战。以圣令与光明能量双轨运转：光铸身躯吸收 50% 伤害，裁决按已损生命比例巨额回血，攻防一体的移动堡垒。',
  maxHp: 82,
  maxEnergy: 3,
  handLimit: 5,
  resources: [
    { id: 'holy_order', name: '圣令', max: 5, icon: '⚜️', desc: '由神圣技能积攒，消耗以释放裁决/清算/圣剑' },
    { id: 'radiant_energy', name: '光明能量', max: 100, icon: '✨', desc: '达到 30 点激活光铸身躯（吸收 50% 伤害），受击消耗 5 点，回合结束衰减 10' },
  ],
  starterDeck: [
    'card_pal_radiant_slash', 'card_pal_radiant_slash',
    'card_pal_heroic_shield_slam',
    'card_pal_vanguard_strike',
    'card_pal_holy_parry', 'card_pal_holy_parry',
    'card_pal_lightforged_armor',
    'card_pal_radiant_infusion',
    'card_pal_judgement',
    'card_pal_devout_prayer',
  ],
  cardPool: [
    'card_pal_shield_toss', 'card_pal_reckoning', 'card_pal_holy_guardian',
    'card_pal_blade_of_light', 'card_pal_radiant_resolve', 'card_pal_crusade',
    'card_pal_radiant_slash', 'card_pal_heroic_shield_slam', 'card_pal_vanguard_strike',
    'card_pal_holy_parry', 'card_pal_lightforged_armor', 'card_pal_radiant_infusion',
    'card_pal_judgement', 'card_pal_devout_prayer',
  ],
  campRitual: {
    name: '圣水祈祷洗礼',
    desc: '本场单局爬塔最大生命值上限永久 +6 点。',
  },
  uiTheme: '#f39c12',
});
