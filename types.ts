

export interface CostItem {
  id: string;
  name: string;
  formula: string;
  unit: string;
  specCategory?: string; // To link a spec name to this item
}

export interface CustomFurnitureItem {
  id: string;
  type: 'open' | 'hinged' | 'drawer';
  width: number;
  depth: number;
  height: number;
}

export interface DeepFoundationParams {
  A: string;
  B: string;
  C: string;
  landscaping: boolean;
}

export interface PlanData {
  物件名: string;
  階数: string;
  階高?: string;
  建築面積: string;
  延床面積: string;
  外壁面積: string;
  キッチン数: string;
  洗面台数: string;
  トイレ数: string;
}

export interface AppState {
  version: number;
  planFile: {
    name: string;
    type: string;
    data: string; // base64
  } | null;
  previewImageUrl: string | null;
  analysis: PlanData | null;
  specifications: { [key: string]: string };
  options: { [key: string]: boolean };
  atticStorageSize: string;
  solarPowerKw: string;
  foreignDishwasher: string;
  cupboard: string;
  customFurnitureItems: CustomFurnitureItem[];
  companyName: string;
  contactLastName: string;
  contactFirstName: string;
  deepFoundation?: DeepFoundationParams;
}
