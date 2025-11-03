import { PlanData } from '../types';
import { Estimate } from '../components/EstimateDetails';
import { SpecCategory, OptionCategory } from '../data/specificationsData';
import { CostItem } from '../data/costData';
import { CustomFurnitureItem } from '../types';

const DEFAULT_OPTION_PROFIT_MARGIN = 0.35;

export function parseValue(value: string | undefined): number {
  if (!value) return 0;
  const match = String(value).match(/^[0-9.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// Safer formula evaluation
function evaluateFormula(formula: string, context: { [key: string]: number }): number {
    try {
        const keys = Object.keys(context);
        const values = Object.values(context);
        const func = new Function(...keys, `return ${formula}`);
        const result = func(...values);
        return typeof result === 'number' && isFinite(result) ? result : 0;
    } catch (e) {
        console.error(`Error evaluating formula "${formula}":`, e);
        return 0;
    }
}

const getSpecAdjustment = (
    category: SpecCategory,
    selectedOptionId: string,
    buildingArea: number,
    totalFloorArea: number,
    exteriorWallArea: number,
    westernArea: number,
    wetArea: number
): number => {
    const selectedOption = category.options.find((o: any) => o.id === selectedOptionId);
    if (!selectedOption?.adjustment) {
        return 0;
    }

    const adj = selectedOption.adjustment;
    if (adj.type === 'fixed') {
        return adj.value;
    }
    if (adj.type === 'per_area') {
        let area = 0;
        if (adj.area_type === '建築面積') area = buildingArea;
        else if (adj.area_type === '延床面積') area = totalFloorArea;
        else if (adj.area_type === '外壁面積') area = exteriorWallArea;
        else if (adj.area_type === '洋室床面積') area = westernArea;
        else if (adj.area_type === '水廻り床面積') area = wetArea;
        return adj.value * area;
    }
    return 0;
};


export function calculateEstimate(
  analysis: PlanData,
  specs: { [key: string]: string },
  options: { [key: string]: boolean },
  costItems: CostItem[],
  specCategories: SpecCategory[],
  optionCategories: OptionCategory[],
  atticStorageSize: number,
  solarPowerKw: number,
  customFurnitureItems: CustomFurnitureItem[]
): Estimate {
  const buildingArea = parseValue(analysis.建築面積);
  const totalFloorArea = parseValue(analysis.延床面積);
  const exteriorWallArea = parseValue(analysis.外壁面積);
  const toiletCount = parseValue(analysis.トイレ数) || 1;
  const washStandCount = parseValue(analysis.洗面台数) || 1;

  const wetArea = toiletCount * 2 + 6;
  const westernArea = totalFloorArea > wetArea ? totalFloorArea - wetArea : 0;

  const formulaContext = {
    buildingArea,
    totalFloorArea,
    exteriorWallArea,
    toiletCount,
    washStandCount
  };

  const getSpec = (categoryId: string, optionId: string) => {
    const category = specCategories.find(c => c.id === categoryId);
    return category?.options.find(o => o.id === optionId);
  }

  // --- Base Costs Calculation ---
  let baseCosts: { [key: string]: { cost: number; specName: string, quantity: number | string; unit: string, profitMargin: number } } = {};
  
  costItems.forEach(item => {
    if (item.id === 'furniture_work' && customFurnitureItems.length > 0) {
      return; // Skip base furniture cost if custom items exist
    }

    const cost = evaluateFormula(item.formula, formulaContext);
    let specName = '-';
    let quantity: number | string = 1;
    
    if (item.id === 'toilet_equipment') {
      quantity = toiletCount;
    } else if (item.id === 'wash_stand_equipment') {
      quantity = washStandCount;
    } else if (item.name === '塗装工事') {
        quantity = totalFloorArea;
        specName = getSpec('wall_ceiling', specs.wall_ceiling)?.name?.includes('塗装') ? getSpec('wall_ceiling', specs.wall_ceiling)?.name ?? '-' : '-';
    } 
    
    if (item.specCategory) {
        const selectedSpecId = specs[item.specCategory];
        specName = getSpec(item.specCategory, selectedSpecId)?.name ?? '-';
    }
    
    baseCosts[item.name] = { cost, specName, quantity, unit: item.unit, profitMargin: item.profitMargin };
  });

  if (baseCosts['内装・塗装・畳工事']) {
    const wallCeilingSpecId = specs['wall_ceiling'];
    const wallCeilingSpecName = getSpec('wall_ceiling', wallCeilingSpecId)?.name ?? '';

    const floorWesternSpecId = specs['floor_material_western'];
    const floorWesternSpecName = getSpec('floor_material_western', floorWesternSpecId)?.name ?? '';

    const floorWetSpecId = specs['floor_material_wet'];
    const floorWetSpecName = getSpec('floor_material_wet', floorWetSpecId)?.name ?? '';
    
    const floorSpec = `洋室 ${floorWesternSpecName} / 水廻り ${floorWetSpecName}`;
    
    const specParts = [];
    if (wallCeilingSpecName) specParts.push(wallCeilingSpecName);
    specParts.push(floorSpec);
    
    baseCosts['内装・塗装・畳工事'].specName = specParts.join(' / ');
  }

  const originalMapping: { [key: string]: string[] } = {
      'entrance_porch': ['左官・タイル工事'],
      'roof': ['屋根工事'],
      'exterior_wall': ['外壁'],
      'sash': ['外部建具'],
      'entrance_door': ['外部建具'],
      'floor_material_western': ['内装・塗装・畳工事'],
      'floor_material_wet': ['内装・塗装・畳工事'],
      'wall_ceiling': ['内装・塗装・畳工事'],
      'interior_door': ['内部建具'],
      'ventilation': ['電気工事'],
      'water_heater': ['給排水工事'],
      'kitchen': ['住宅設備 キッチン'],
      'wash_stand': ['住宅設備 洗面台'],
      'toilet': ['住宅設備 トイレ'],
  };

  specCategories.forEach(category => {
    const targetItemNames = originalMapping[category.id];
    if (targetItemNames) {
        const selectedOptionId = specs[category.id];
        const adjustment = getSpecAdjustment(
            category,
            selectedOptionId,
            buildingArea,
            totalFloorArea,
            exteriorWallArea,
            westernArea,
            wetArea
        );
        targetItemNames.forEach(targetItemName => {
            if (baseCosts[targetItemName]) {
                baseCosts[targetItemName].cost += adjustment;
            }
        });
    }
  });

  // --- Options Costs ---
  let optionsCosts: { [key: string]: { cost: number; specName: string, quantity: number | string; unit: string, profitMargin: number } } = {};
  
  // Handle snow guard spec name modification
  if (baseCosts['屋根工事']) {
    if (options['snow_guard']) {
        baseCosts['屋根工事'].specName += ' / 雪止め金物あり';
    }
  }
  
  for(const category of optionCategories) {
      for(const option of category.options) {
          if(options[option.id]) {
            if (option.id === 'custom_furniture') {
                continue; // Handled separately
            }
            
            // Handle snow guard cost addition and prevent it from becoming a separate line item
            if (option.id === 'snow_guard') {
                if (baseCosts['屋根工事']) {
                    baseCosts['屋根工事'].cost += option.cost.value;
                }
                continue; 
            }

            let cost = 0;
            let quantity: number | string = 1;
            let unit = '式';
            let specName = '-';

            if (option.id === 'attic_storage') {
                const size = atticStorageSize > 0 ? atticStorageSize : 0;
                cost = option.cost.value * size;
                quantity = size;
                unit = '帖';
            } else if (option.id === 'solar_power') {
                if (solarPowerKw > 0) {
                    const panelPowerKw = 0.51; // 510W per panel
                    const numberOfPanels = Math.ceil(solarPowerKw / panelPowerKw);
                    cost = option.cost.value * numberOfPanels;
                    quantity = numberOfPanels;
                    unit = '枚';
                    specName = `${(numberOfPanels * panelPowerKw).toFixed(2)}kW`;
                } else {
                    cost = 0;
                    quantity = 0;
                }
            } else {
                if (option.cost.type === 'fixed') {
                    cost = option.cost.value;
                } else if (option.cost.type === 'per_area') {
                    let area = 0;
                    if (option.cost.area_type === '延床面積') area = totalFloorArea;
                    cost = option.cost.value * area;
                }
            }
            optionsCosts[option.name] = { cost, specName, quantity, unit, profitMargin: DEFAULT_OPTION_PROFIT_MARGIN };
          }
      }
  }
  
  // --- Custom Furniture Calculation ---
  if (customFurnitureItems.length > 0) {
      const furnitureTypePrice: { [key: string]: number } = {
          open: 100000,
          hinged: 200000,
          drawer: 300000,
      };

      const customFurnitureTotalCost = customFurnitureItems.reduce((total, item) => {
          const volume = (item.width || 0) * (item.depth || 0) * (item.height || 0);
          const pricePerCubicMeter = furnitureTypePrice[item.type] || 0;
          const itemCost = volume * pricePerCubicMeter;
          return total + itemCost;
      }, 0);

      if (customFurnitureTotalCost > 0) {
          const furnitureCostItem = costItems.find(item => item.id === 'furniture_work');
          const profitMargin = furnitureCostItem ? furnitureCostItem.profitMargin : DEFAULT_OPTION_PROFIT_MARGIN;

          optionsCosts['造作家具工事'] = {
              cost: customFurnitureTotalCost,
              specName: `${customFurnitureItems.length} 点`,
              quantity: 1,
              unit: '式',
              profitMargin: profitMargin
          };
      }
  }


  const allItems = { ...baseCosts, ...optionsCosts };

  const estimateItems = Object.entries(allItems).map(([name, data]) => {
    const price = data.profitMargin < 1 ? data.cost / (1 - data.profitMargin) : data.cost;
    const subtotal = price;

    return {
      name,
      ...data,
      price,
      subtotal,
    };
  }).filter(item => item.cost !== 0); // Don't show items with zero cost

  const totalCost = estimateItems.reduce((sum, item) => sum + item.cost, 0);
  const totalPrice = estimateItems.reduce((sum, item) => sum + item.subtotal, 0);
  const profit = totalPrice - totalCost;

  return {
    items: estimateItems,
    totalCost,
    profit,
    profitMargin: totalPrice > 0 ? profit / totalPrice : 0,
    totalPrice,
  };
}
