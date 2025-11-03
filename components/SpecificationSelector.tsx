import React from 'react';
import { SpecCategory, OptionCategory, DISHWASHER_IDS, CUPBOARD_IDS } from '../data/specificationsData';
import { CustomFurnitureItem } from '../types';

interface SpecificationSelectorProps {
  specs: { [key: string]: string };
  options: { [key: string]: boolean };
  onSpecChange: (specId: string, value: string) => void;
  onOptionChange: (optionId: string, value: boolean) => void;
  specCategories: SpecCategory[];
  optionCategories: OptionCategory[];
  disabled: boolean;
  foreignDishwasher: string;
  onForeignDishwasherChange: (value: string) => void;
  cupboard: string;
  onCupboardChange: (value: string) => void;
  atticStorageSize: string;
  onAtticStorageSizeChange: (value: string) => void;
  solarPowerKw: string;
  onSolarPowerKwChange: (value: string) => void;
  customFurnitureItems: CustomFurnitureItem[];
  onAddCustomFurnitureItem: () => void;
  onRemoveCustomFurnitureItem: (id: string) => void;
  onUpdateCustomFurnitureItem: (id: string, field: keyof Omit<CustomFurnitureItem, 'id'>, value: string | number) => void;
}

const SpecRadioOption: React.FC<{
  spec: any,
  option: any,
  selectedValue: string,
  onChange: (value: string) => void,
  disabled: boolean
}> = ({ spec, option, selectedValue, onChange, disabled }) => (
  <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${selectedValue === option.id ? 'border-brand-primary bg-brand-primary/10' : 'border-base-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-secondary/50'}`}>
    <input
      type="radio"
      name={spec.id}
      value={option.id}
      checked={selectedValue === option.id}
      onChange={(e) => onChange(e.target.value)}
      className="h-4 w-4 text-brand-primary focus:ring-brand-secondary"
      disabled={disabled}
    />
    <span className="flex-grow text-sm font-medium text-content-100">{option.name}</span>
    {option.adjustmentText && <span className="text-xs text-content-200">{option.adjustmentText}</span>}
  </label>
);

const OptionCheckbox: React.FC<{
  option: any,
  isChecked: boolean,
  onChange: (value: boolean) => void,
  disabled: boolean
}> = ({ option, isChecked, onChange, disabled }) => (
  <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${isChecked ? 'border-brand-primary bg-brand-primary/10' : 'border-base-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-secondary/50'}`}>
    <input
      type="checkbox"
      name={option.id}
      checked={isChecked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 text-brand-primary focus:ring-brand-secondary rounded"
      disabled={disabled}
    />
    <span className="flex-grow text-sm font-medium text-content-100">{option.name}</span>
    {option.costText && <span className="text-xs text-content-200 whitespace-nowrap">{option.costText}</span>}
  </label>
);


export const SpecificationSelector: React.FC<SpecificationSelectorProps> = ({
  specs,
  options,
  onSpecChange,
  onOptionChange,
  specCategories,
  optionCategories,
  disabled,
  foreignDishwasher,
  onForeignDishwasherChange,
  cupboard,
  onCupboardChange,
  atticStorageSize,
  onAtticStorageSizeChange,
  solarPowerKw,
  onSolarPowerKwChange,
  customFurnitureItems,
  onAddCustomFurnitureItem,
  onRemoveCustomFurnitureItem,
  onUpdateCustomFurnitureItem
}) => {
  const roofOptionsCategory = optionCategories.find(c => c.id === 'roof_options');
  const snowGuardOption = roofOptionsCategory?.options.find(o => o.id === 'snow_guard');
  const otherOptionsCategory = optionCategories.find(c => c.id === 'other');
  const dishwasherOptions = otherOptionsCategory?.options.filter(o => DISHWASHER_IDS.includes(o.id)) || [];
  const cupboardOptions = otherOptionsCategory?.options.filter(o => CUPBOARD_IDS.includes(o.id)) || [];

  const hasForeignDishwasher = foreignDishwasher !== '';
  const handleHasForeignDishwasherChange = (checked: boolean) => {
    if (checked) {
      if (!foreignDishwasher) {
        onForeignDishwasherChange(DISHWASHER_IDS[0]);
      }
    } else {
      onForeignDishwasherChange('');
    }
  };

  const hasCupboard = cupboard !== '';
  const handleHasCupboardChange = (checked: boolean) => {
    if (checked) {
      if (!cupboard) {
        onCupboardChange(CUPBOARD_IDS[0]);
      }
    } else {
      onCupboardChange('');
    }
  };


  return (
    <div className={`transition-opacity duration-300 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-content-100">2. 仕様セレクト</h2>
          <div className="space-y-6">
            {specCategories.map(category => (
              <div key={category.id}>
                <h4 className="font-semibold mb-2 text-content-100">{category.name}</h4>
                <div className="space-y-2">
                  {category.options.map(option => (
                    <SpecRadioOption
                      key={option.id}
                      spec={category}
                      option={option}
                      selectedValue={specs[category.id]}
                      onChange={(value) => onSpecChange(category.id, value)}
                      disabled={disabled}
                    />
                  ))}
                  {category.id === 'roof' && snowGuardOption && (
                    <div className="pl-6 pt-1">
                        <OptionCheckbox
                            option={snowGuardOption}
                            isChecked={!!options['snow_guard']}
                            onChange={(value) => onOptionChange('snow_guard', value)}
                            disabled={disabled}
                        />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {optionCategories.filter(c => c.id !== 'roof_options').map(category => {
          if (category.id === 'other') {
            const regularOptions = category.options.filter(o => !DISHWASHER_IDS.includes(o.id) && !CUPBOARD_IDS.includes(o.id));
            return (
              <div key={category.id}>
                <h3 className="text-xl font-bold mb-4 text-content-100">{category.name}</h3>
                <div className="space-y-2">
                  {regularOptions.map(option => {
                      const isChecked = options[option.id];
                      return (
                          <div key={option.id}>
                               <OptionCheckbox 
                                  option={option}
                                  isChecked={isChecked}
                                  onChange={(value) => onOptionChange(option.id, value)}
                                  disabled={disabled}
                              />
                              {isChecked && option.id === 'attic_storage' && (
                                <div className="pl-16 -mt-1 pb-2 flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={atticStorageSize}
                                    onChange={(e) => onAtticStorageSizeChange(e.target.value)}
                                    className="w-24 bg-base-100 rounded-md px-2 py-1 border border-base-300 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all duration-200"
                                    disabled={disabled}
                                    min="0"
                                    step="0.5"
                                    aria-label="小屋裏収納の帖数"
                                  />
                                  <span className="text-sm text-content-200">帖</span>
                                </div>
                              )}
                              {isChecked && option.id === 'solar_power' && (
                                <div className="pl-16 -mt-1 pb-2 flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={solarPowerKw}
                                    onChange={(e) => onSolarPowerKwChange(e.target.value)}
                                    className="w-24 bg-base-100 rounded-md px-2 py-1 border border-base-300 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all duration-200"
                                    disabled={disabled}
                                    min="0"
                                    step="0.1"
                                    aria-label="太陽光発電のkW数"
                                  />
                                  <span className="text-sm text-content-200">kW</span>
                                </div>
                              )}
                               {isChecked && option.id === 'custom_furniture' && (
                                <div className="pl-8 pt-2 space-y-4 border-l-2 border-base-300 ml-4 mt-2 pb-2">
                                    {customFurnitureItems.map((item, index) => (
                                        <div key={item.id} className="p-3 bg-base-100 rounded-lg space-y-3 relative">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-content-100">造作家具 #{index + 1}</span>
                                                <button
                                                    onClick={() => onRemoveCustomFurnitureItem(item.id)}
                                                    className="text-content-200 hover:text-red-500 transition-colors"
                                                    aria-label={`造作家具 #${index + 1} を削除`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                                <div className="md:col-span-1">
                                                    <label className="text-xs text-content-200 block mb-1">タイプ</label>
                                                    <select
                                                        value={item.type}
                                                        onChange={(e) => onUpdateCustomFurnitureItem(item.id, 'type', e.target.value as CustomFurnitureItem['type'])}
                                                        className="w-full text-sm bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"
                                                    >
                                                        <option value="open">オープン</option>
                                                        <option value="hinged">開き戸</option>
                                                        <option value="drawer">引出し</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className="text-xs text-content-200 block mb-1">W (m)</label>
                                                    <input type="number" value={item.width} onChange={(e) => onUpdateCustomFurnitureItem(item.id, 'width', parseFloat(e.target.value) || 0)} className="w-full text-sm bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none" min="0" step="0.1"/>
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className="text-xs text-content-200 block mb-1">D (m)</label>
                                                    <input type="number" value={item.depth} onChange={(e) => onUpdateCustomFurnitureItem(item.id, 'depth', parseFloat(e.target.value) || 0)} className="w-full text-sm bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none" min="0" step="0.1"/>
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className="text-xs text-content-200 block mb-1">H (m)</label>
                                                    <input type="number" value={item.height} onChange={(e) => onUpdateCustomFurnitureItem(item.id, 'height', parseFloat(e.target.value) || 0)} className="w-full text-sm bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none" min="0" step="0.1"/>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={onAddCustomFurnitureItem}
                                        disabled={disabled}
                                        className="w-full text-sm font-semibold text-brand-primary p-2 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors disabled:opacity-50"
                                    >
                                        + 造作家具を追加
                                    </button>
                                </div>
                              )}
                          </div>
                      );
                  })}
                  {/* Custom Dishwasher Group */}
                  <div>
                    <OptionCheckbox
                      option={{ name: '海外食洗器', costText: hasForeignDishwasher ? '選択中' : '未選択' }}
                      isChecked={hasForeignDishwasher}
                      onChange={handleHasForeignDishwasherChange}
                      disabled={disabled}
                    />
                    {hasForeignDishwasher && (
                      <div className="pl-8 pt-2 space-y-2 border-l-2 border-base-300 ml-4 mt-2">
                        {dishwasherOptions.map(dwOption => (
                          <SpecRadioOption
                            key={dwOption.id}
                            spec={{ id: 'foreign_dishwasher_group' }}
                            option={{ ...dwOption, adjustmentText: dwOption.costText }}
                            selectedValue={foreignDishwasher}
                            onChange={onForeignDishwasherChange}
                            disabled={disabled}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Custom Cupboard Group */}
                  <div>
                    <OptionCheckbox
                      option={{ name: 'カップボード', costText: hasCupboard ? '選択中' : '未選択' }}
                      isChecked={hasCupboard}
                      onChange={handleHasCupboardChange}
                      disabled={disabled}
                    />
                    {hasCupboard && (
                      <div className="pl-8 pt-2 space-y-2 border-l-2 border-base-300 ml-4 mt-2">
                        {cupboardOptions.map(cbOption => (
                           <SpecRadioOption
                              key={cbOption.id}
                              spec={{ id: 'cupboard_group' }}
                              option={{ ...cbOption, name: cbOption.name.replace('カップボード ', ''), adjustmentText: cbOption.costText }}
                              selectedValue={cupboard}
                              onChange={onCupboardChange}
                              disabled={disabled}
                            />
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )
          }

          return (
            <div key={category.id}>
                <h3 className="text-xl font-bold mb-4 text-content-100">{category.name}</h3>
                <div className="space-y-2">
                    {category.options.map(option => (
                        <OptionCheckbox 
                            key={option.id}
                            option={option}
                            isChecked={options[option.id]}
                            onChange={(value) => onOptionChange(option.id, value)}
                            disabled={disabled}
                        />
                    ))}
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};