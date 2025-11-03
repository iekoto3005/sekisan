
export interface Adjustment {
  type: 'fixed' | 'per_area';
  area_type?: '建築面積' | '延床面積' | '外壁面積';
  value: number;
}

export interface SpecOption {
  id: string;
  name: string;
  adjustmentText?: string;
  adjustment: Adjustment;
}

export interface SpecCategory {
  id: string;
  name: string;
  options: SpecOption[];
}

export interface Cost {
    type: 'fixed' | 'per_area';
    area_type?: '延床面積';
    value: number;
}

export interface Option {
    id: string;
    name: string;
    costText: string;
    cost: Cost;
}

export interface OptionCategory {
    id: string;
    name: string;
    options: Option[];
}


export const DEFAULT_SPEC_CATEGORIES: SpecCategory[] = [
  {
    id: 'entrance_porch',
    name: '玄関ポーチ',
    options: [
      { id: 'tile_600', name: '600角タイル', adjustment: { type: 'fixed', value: 0 } },
      { id: 'mortar', name: 'モルタル', adjustment: { type: 'fixed', value: -10000 } }, // Assumed cost
    ],
  },
  {
    id: 'roof',
    name: '屋根',
    options: [
      { id: 'galvalume', name: 'ガルバリウム鋼板', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'kawara', name: '瓦', adjustmentText: '+4,000円/㎡', adjustment: { type: 'per_area', area_type: '建築面積', value: 4000 } },
      { id: 'slate', name: 'スレート瓦', adjustmentText: '-2,000円/㎡', adjustment: { type: 'per_area', area_type: '建築面積', value: -2000 } },
    ],
  },
  {
    id: 'exterior_wall',
    name: '外壁材',
    options: [
      { id: 'siding_blow', name: 'サイディング上吹付け', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'ancient_brick', name: '大壁工法エンシェントブリック柄', adjustmentText: '+4,000円/㎡', adjustment: { type: 'per_area', area_type: '外壁面積', value: 4000 } },
      { id: 'ceramic_siding', name: '窯業系サイディング', adjustmentText: '-1,000円/㎡', adjustment: { type: 'per_area', area_type: '外壁面積', value: -1000 } },
      { id: 'nucool', name: 'ヌクール（付加断熱）', adjustmentText: '+5,000円/㎡', adjustment: { type: 'per_area', area_type: '外壁面積', value: 5000 } },
    ],
  },
  {
    id: 'sash',
    name: 'サッシ',
    options: [
      { id: 'ykk_apw330', name: 'YKK APW330', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'ykk_apw430', name: 'YKK APW430', adjustmentText: '+7,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 7000 } },
      { id: 'lixil_thermos2h', name: 'LIXIL サーモスⅡH', adjustmentText: '+1,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 1000 } },
      { id: 'lixil_tw', name: 'LIXIL TW', adjustmentText: '+4,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 4000 } },
    ],
  },
  {
    id: 'entrance_door',
    name: '玄関ドア',
    options: [
      { id: 'ykk', name: 'YKK', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'ykk_remote', name: 'YKK リモコンキー', adjustmentText: '+50,000円', adjustment: { type: 'fixed', value: 50000 } },
    ],
  },
  {
    id: 'floor_material',
    name: '床材',
    options: [
      { id: 'tri_layer_flooring', name: '三層フローリングW190', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'moltestone', name: 'モルテストーン', adjustmentText: '+12,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 12000 } }, // Assumed
      { id: 'tile_600_floor', name: '600角タイル', adjustmentText: '+15,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 15000 } },
    ],
  },
  {
    id: 'wall_ceiling',
    name: '壁・天井',
    options: [
      { id: 'vinyl_cloth', name: 'ビニールクロス', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'accent_cloth', name: 'アクセントクロス', adjustmentText: '+1,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 1000 } }, // Assuming延床面積
      { id: 'tile_wall', name: 'タイル張り', adjustmentText: '+20,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 20000 } }, // Assuming延床面積
      { id: 'paint', name: '塗装', adjustmentText: '+3,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 3000 } },
      { id: 'shikkui', name: '漆喰', adjustmentText: '+6,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 6000 } },
      { id: 'keisodo', name: '珪藻土', adjustmentText: '+6,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 6000 } },
    ],
  },
  {
    id: 'interior_door',
    name: '内部建具',
    options: [
      { id: 'kashiwamokko', name: '柏木工', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'kamiya', name: 'KAMIYA', adjustmentText: '+2,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 2000 } },
      { id: 'lixil_lasissa', name: 'LIXIL ラシッサ', adjustment: { type: 'fixed', value: -50000 } }, // Assumed
      { id: 'lixil_rafis', name: 'LIXIL ラフィスH2400', adjustmentText: '+1,000円/㎡', adjustment: { type: 'per_area', area_type: '延床面積', value: 1000 } },
    ],
  },
  {
    id: 'ventilation',
    name: '換気システム',
    options: [
      { id: 'type1', name: '第1種換気（ローヤル電機）', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'type3', name: '第3種換気', adjustmentText: '-150,000円', adjustment: { type: 'fixed', value: -150000 } },
    ],
  },
  {
    id: 'water_heater',
    name: '給湯器',
    options: [
      { id: 'eco_cute', name: 'エコキュート', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'eco_cute_thin', name: 'エコキュート薄型', adjustmentText: '+30,000円', adjustment: { type: 'fixed', value: 30000 } },
      { id: 'gas_24_city', name: 'ガス給湯器24号都市ガス', adjustmentText: '-50,000円', adjustment: { type: 'fixed', value: -50000 } }, // Relative to eco_cute
      { id: 'gas_24_propane', name: 'ガス給湯器24号プロパン', adjustmentText: '-100,000円', adjustment: { type: 'fixed', value: -100000 } }, // Relative to eco_cute
    ],
  },
  {
    id: 'kitchen',
    name: 'キッチン',
    options: [
      { id: 'line_peninsula', name: 'LINEキッチン ペニンシュラ型', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'line_island', name: 'LINEキッチン アイランド型', adjustmentText: '+30,000円', adjustment: { type: 'fixed', value: 30000 } },
      { id: 'line_type2', name: 'LINEキッチン Ⅱ型', adjustmentText: '+80,000円', adjustment: { type: 'fixed', value: 80000 } },
      { id: 'line_typeI', name: 'LINEキッチン I型', adjustmentText: '-50,000円', adjustment: { type: 'fixed', value: -50000 } },
      { id: 'graftect', name: 'GRAFTECT', adjustmentText: '+200,000円', adjustment: { type: 'fixed', value: 200000 } },
      { id: 'lixil_az', name: 'LIXIL AZ', adjustmentText: '-200,000円', adjustment: { type: 'fixed', value: -200000 } },
    ],
  },
  {
    id: 'wash_stand',
    name: '洗面台',
    options: [
      { id: 'smart_sanitary_open', name: 'スマートサニタリー（下部オープン）', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'smart_sanitary_closed', name: 'スマートサニタリー(下部収納）', adjustmentText: '+50,000円', adjustment: { type: 'fixed', value: 50000 } },
    ],
  },
  {
    id: 'toilet',
    name: 'トイレ',
    options: [
      { id: 'lixil_becia', name: 'LIXIL ベーシア', adjustmentText: '標準', adjustment: { type: 'fixed', value: 0 } },
      { id: 'toto', name: 'TOTO', adjustmentText: '+10,000円', adjustment: { type: 'fixed', value: 10000 } },
    ],
  },
];

export const DEFAULT_OPTION_CATEGORIES: OptionCategory[] = [
  {
    id: 'application',
    name: '申請オプション',
    options: [
      { id: 'long_term_housing', name: '長期優良住宅申請', costText: '250,000円/一式', cost: { type: 'fixed', value: 250000 } },
      { id: 'fire_resistant', name: '省令準耐火構造', costText: '3,000円/㎡', cost: { type: 'per_area', area_type: '延床面積', value: 3000 } },
      { id: 'semi_fire_proof', name: '準防火仕様', costText: '6,000円/㎡', cost: { type: 'per_area', area_type: '延床面積', value: 6000 } },
    ],
  },
  {
    id: 'other',
    name: 'その他オプション',
    options: [
      { id: 'solar_power', name: '太陽光発電', costText: '120,000円/枚', cost: { type: 'fixed', value: 120000 } }, // Assuming 1枚 as default
      { id: 'storage_battery', name: '蓄電池', costText: '1,200,000円/一式', cost: { type: 'fixed', value: 1200000 } },
      { id: 'bosch_45', name: 'BOSCH食洗機 45cm', costText: '180,000円/一式', cost: { type: 'fixed', value: 180000 } },
      { id: 'bosch_60', name: 'BOSCH食洗機 60cm', costText: '300,000円/一式', cost: { type: 'fixed', value: 300000 } },
      { id: 'miele_45', name: 'ミーレ食洗機 45cm', costText: '250,000円/一式', cost: { type: 'fixed', value: 250000 } },
      { id: 'miele_60', name: 'ミーレ食洗機 60cm', costText: '350,000円/一式', cost: { type: 'fixed', value: 350000 } },
      { id: 'cupboard_940', name: 'カップボード 940mm', costText: '200,000円/一式', cost: { type: 'fixed', value: 200000 } },
      { id: 'cupboard_1690', name: 'カップボード 1690mm', costText: '300,000円/一式', cost: { type: 'fixed', value: 300000 } },
      { id: 'cupboard_2550', name: 'カップボード 2550mm', costText: '400,000円/一式', cost: { type: 'fixed', value: 400000 } },
      { id: 'evoltz', name: 'evoltz', costText: '300,000円/一式', cost: { type: 'fixed', value: 300000 } },
      { id: 'central_ac', name: '全館空調システム', costText: '1,200,000円/一式', cost: { type: 'fixed', value: 1200000 } },
      { id: 'steel_stairs', name: '鉄骨階段', costText: '500,000円/一式', cost: { type: 'fixed', value: 500000 } },
      { id: 'attic_storage', name: '小屋裏収納', costText: '30,000円/帖', cost: { type: 'fixed', value: 30000 } }, // Assuming 1帖
      { id: 'custom_furniture', name: '造作家具工事', costText: '500,000円/一式', cost: { type: 'fixed', value: 500000 } },
    ]
  }
];


export const INITIAL_SPECS = DEFAULT_SPEC_CATEGORIES.reduce((acc, category) => {
  acc[category.id] = category.options[0].id;
  return acc;
}, {} as { [key: string]: string });

export const INITIAL_OPTIONS = DEFAULT_OPTION_CATEGORIES.flatMap(cat => cat.options).reduce((acc, option) => {
    acc[option.id] = false;
    return acc;
}, {} as { [key: string]: boolean });
