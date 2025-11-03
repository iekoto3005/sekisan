import React, { useState, useEffect } from 'react';
import { CostItem } from '../data/costData';
import { SpecCategory, OptionCategory, Adjustment, Cost } from '../data/specificationsData';

interface CostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    costItems: CostItem[],
    specCategories: SpecCategory[],
    optionCategories: OptionCategory[],
  ) => void;
  initialCostItems: CostItem[];
  initialSpecCategories: SpecCategory[];
  initialOptionCategories: OptionCategory[];
}

const formatAdjustmentText = (adjustment: Adjustment) => {
    if (adjustment.value === 0) return '標準';
    const formattedValue = new Intl.NumberFormat('ja-JP').format(Math.abs(adjustment.value));
    const sign = adjustment.value > 0 ? '+' : '-';
    const unit = adjustment.type === 'per_area' ? '/㎡' : '';
    return `${sign}${formattedValue}円${unit}`;
};

const formatCostText = (cost: Cost) => {
    const formattedValue = new Intl.NumberFormat('ja-JP').format(cost.value);
    const unit = cost.type === 'per_area' ? '/㎡' : '/一式';
    return `${formattedValue}円${unit}`;
};


export const CostEditorModal: React.FC<CostEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialCostItems,
  initialSpecCategories,
  initialOptionCategories,
}) => {
  const [activeTab, setActiveTab] = useState('costs');
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [specCategories, setSpecCategories] = useState<SpecCategory[]>([]);
  const [optionCategories, setOptionCategories] = useState<OptionCategory[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Deep copy to prevent modifying the original state directly
      setCostItems(JSON.parse(JSON.stringify(initialCostItems)));
      setSpecCategories(JSON.parse(JSON.stringify(initialSpecCategories)));
      setOptionCategories(JSON.parse(JSON.stringify(initialOptionCategories)));
    }
  }, [isOpen, initialCostItems, initialSpecCategories, initialOptionCategories]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Regenerate display texts before saving
    const updatedSpecCategories = specCategories.map(cat => ({
        ...cat,
        options: cat.options.map(opt => ({
            ...opt,
            adjustmentText: formatAdjustmentText(opt.adjustment),
        }))
    }));

    const updatedOptionCategories = optionCategories.map(cat => ({
        ...cat,
        options: cat.options.map(opt => ({
            ...opt,
            costText: formatCostText(opt.cost),
        }))
    }));

    onSave(costItems, updatedSpecCategories, updatedOptionCategories);
  };

  const handleItemChange = (id: string, field: 'formula' | 'unit' | 'profitMargin', value: string | number) => {
    setCostItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleSpecOptionChange = (
    categoryIndex: number, 
    optionIndex: number, 
    value: string
  ) => {
    setSpecCategories(prev => {
        const newCategories = JSON.parse(JSON.stringify(prev));
        const option = newCategories[categoryIndex].options[optionIndex];
        option.adjustment.value = Number(value) || 0;
        return newCategories;
    });
  };

  const handleOptionChange = (
    categoryIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setOptionCategories(prev => {
        const newCategories = JSON.parse(JSON.stringify(prev));
        const option = newCategories[categoryIndex].options[optionIndex];
        option.cost.value = Number(value) || 0;
        return newCategories;
    });
  };


  const renderCostsTab = () => (
    <>
      <p className="text-sm text-content-200 mb-4">
          計算式には `buildingArea`, `totalFloorArea`, `exteriorWallArea`, `toiletCount` が利用できます。
      </p>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-content-200 uppercase bg-base-200 sticky top-0">
          <tr>
            <th scope="col" className="px-4 py-3 w-[25%]">項目名</th>
            <th scope="col" className="px-4 py-3 w-[45%]">計算式</th>
            <th scope="col" className="px-4 py-3 w-[15%]">単位</th>
            <th scope="col" className="px-4 py-3 w-[15%]">利益率 (%)</th>
          </tr>
        </thead>
        <tbody>
          {costItems.map(item => (
            <tr key={item.id} className="border-b border-base-200/80">
              <th scope="row" className="px-4 py-2 font-medium text-content-100">{item.name}</th>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={item.formula}
                  onChange={(e) => handleItemChange(item.id, 'formula', e.target.value)}
                  className="w-full bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors duration-200"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                  className="w-full bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors duration-200"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  value={Math.round((item.profitMargin || 0) * 100)}
                  onChange={(e) => handleItemChange(item.id, 'profitMargin', Number(e.target.value) / 100)}
                  className="w-full bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors duration-200"
                  min="0"
                  max="100"
                  step="1"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  const renderSpecsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-content-100 mb-2">仕様セレクト オプション</h3>
         {specCategories.map((category, catIndex) => (
            <div key={category.id} className="mb-4">
              <h4 className="font-semibold text-content-200 mb-2">{category.name}</h4>
              <div className="space-y-1">
                {category.options.map((option, optIndex) => (
                  <div key={option.id} className="grid grid-cols-12 gap-x-4 items-center">
                    <span className="col-span-8 text-sm">{option.name}</span>
                    <div className="col-span-4">
                      <input type="number" placeholder="調整額 (円)" value={option.adjustment.value} onChange={(e) => handleSpecOptionChange(catIndex, optIndex, e.target.value)} className="w-full text-sm bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors duration-200"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
         ))}
      </div>
      <div className="border-t border-base-200 pt-6">
        <h3 className="text-lg font-bold text-content-100 mb-2">その他オプション</h3>
        {optionCategories.map((category, catIndex) => (
            <div key={category.id} className="mb-4">
              <h4 className="font-semibold text-content-200 mb-2">{category.name}</h4>
              <div className="space-y-1">
                {category.options.map((option, optIndex) => (
                    <div key={option.id} className="grid grid-cols-12 gap-x-4 items-center">
                        <span className="col-span-8 text-sm">{option.name}</span>
                        <div className="col-span-4">
                           <input type="number" placeholder="金額 (円)" value={option.cost.value} onChange={(e) => handleOptionChange(catIndex, optIndex, e.target.value)} className="w-full text-sm bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors duration-200"/>
                        </div>
                    </div>
                ))}
              </div>
            </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-base-200">
            <h2 className="text-2xl font-bold text-content-100">管理者設定</h2>
        </div>
         <div className="border-b border-base-200 px-6">
            <nav className="-mb-px flex space-x-6">
                <button
                    onClick={() => setActiveTab('costs')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'costs' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-content-200 hover:text-content-100 hover:border-base-300'}`}
                >
                    原価項目
                </button>
                <button
                    onClick={() => setActiveTab('specs')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'specs' ? 'border-brand-primary text-brand-secondary' : 'border-transparent text-content-200 hover:text-content-100 hover:border-base-300'}`}
                >
                    仕様オプション
                </button>
            </nav>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          {activeTab === 'costs' && renderCostsTab()}
          {activeTab === 'specs' && renderSpecsTab()}
        </div>
        <div className="p-6 border-t border-base-200 flex justify-end items-center">
            <div className="flex space-x-4">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-md text-content-200 hover:bg-base-200 transition-colors">
                キャンセル
              </button>
              <button type="button" onClick={handleSave} className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">
                保存
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};
