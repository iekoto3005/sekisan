import { CostItem as OriginalCostItem } from '../types';

export interface CostItem extends OriginalCostItem {
  profitMargin: number;
}


export const DEFAULT_COST_ITEMS: CostItem[] = [
  { id: 'temporary_work', name: '仮設工事', formula: 'totalFloorArea * 3500 + 140000', unit: '式', profitMargin: 0.35 },
  { id: 'foundation_work', name: '基礎工事', formula: 'buildingArea * 25000 + 173500', unit: '式', profitMargin: 0.35 },
  { id: 'insulation_work', name: '断熱工事', formula: 'exteriorWallArea * 3000 + 100000', unit: '式', profitMargin: 0.35 },
  { id: 'carpentry_work', name: '木工事', formula: 'totalFloorArea * 13800 + 3350000', unit: '式', profitMargin: 0.35 },
  { id: 'roof_work', name: '屋根工事', formula: 'buildingArea * 6000 + 20000', unit: '式', specCategory: 'roof', profitMargin: 0.35 },
  { id: 'exterior_wall_work', name: '外壁', formula: 'exteriorWallArea * 6000', unit: '式', specCategory: 'exterior_wall', profitMargin: 0.35 },
  { id: 'waterproofing_work', name: '防水工事', formula: 'exteriorWallArea * 1000 + 100000', unit: '式', profitMargin: 0.35 },
  { id: 'plastering_tile_work', name: '左官・タイル工事', formula: 'totalFloorArea * 1200 + 122000', unit: '式', specCategory: 'entrance_porch', profitMargin: 0.35 },
  { id: 'building_materials_work', name: '建材工事', formula: 'totalFloorArea * 6500 + 1000000', unit: '式', profitMargin: 0.35 },
  { id: 'exterior_joinery', name: '外部建具', formula: 'totalFloorArea * 10000 + 70000', unit: '式', specCategory: 'sash', profitMargin: 0.35 },
  { id: 'interior_finishing_work', name: '内装・塗装・畳工事', formula: 'totalFloorArea * 6000 + 50000', unit: '式', specCategory: 'wall_ceiling', profitMargin: 0.35 },
  { id: 'interior_joinery', name: '内部建具', formula: 'totalFloorArea * 6500 + 70000', unit: '式', specCategory: 'interior_door', profitMargin: 0.35 },
  { id: 'kitchen_equipment', name: '住宅設備 キッチン', formula: '900000', unit: '式', specCategory: 'kitchen', profitMargin: 0.35 },
  { id: 'wash_stand_equipment', name: '住宅設備 洗面台', formula: '300000 * washStandCount', unit: '台', specCategory: 'wash_stand', profitMargin: 0.35 },
  { id: 'toilet_equipment', name: '住宅設備 トイレ', formula: '100000 * toiletCount', unit: '台', specCategory: 'toilet', profitMargin: 0.35 },
  { id: 'unit_bath_equipment', name: '住宅設備 ユニットバス', formula: '350000', unit: '式', profitMargin: 0.35 },
  { id: 'electrical_work', name: '電気工事', formula: 'totalFloorArea * 3000 + 500000', unit: '式', specCategory: 'ventilation', profitMargin: 0.35 },
  { id: 'plumbing_work', name: '給排水工事', formula: 'totalFloorArea * 6000', unit: '式', specCategory: 'water_heater', profitMargin: 0.35 },
  { id: 'furniture_work', name: '家具工事', formula: '100000', unit: '式', profitMargin: 0.35 },
  { id: 'painting_work', name: '塗装工事', formula: '4000 * totalFloorArea', unit: '㎡', profitMargin: 0.35 },
  { id: 'hardware_work', name: '金物工事', formula: 'totalFloorArea * 1200', unit: '式', profitMargin: 0.35 },
  { id: 'site_management_fee', name: '現場管理費', formula: 'totalFloorArea * 8000', unit: '式', profitMargin: 0.35 },
  { id: 'overhead_expenses', name: '諸経費', formula: '300000', unit: '式', profitMargin: 0.35 },
];