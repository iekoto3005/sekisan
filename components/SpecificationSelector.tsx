
import React from 'react';
import { SpecCategory, OptionCategory } from '../data/specificationsData';

interface SpecificationSelectorProps {
  specs: { [key: string]: string };
  options: { [key: string]: boolean };
  onSpecChange: (specId: string, value: string) => void;
  onOptionChange: (optionId: string, value: boolean) => void;
  specCategories: SpecCategory[];
  optionCategories: OptionCategory[];
  disabled: boolean;
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
    <span className="text-xs text-content-200 whitespace-nowrap">{option.costText}</span>
  </label>
);


export const SpecificationSelector: React.FC<SpecificationSelectorProps> = ({
  specs,
  options,
  onSpecChange,
  onOptionChange,
  specCategories,
  optionCategories,
  disabled
}) => {
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {optionCategories.map(category => (
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
        ))}
      </div>
    </div>
  );
};
