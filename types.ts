export interface CostItem {
  id: string;
  name: string;
  formula: string;
  unit: string;
  specCategory?: string; // To link a spec name to this item
}
