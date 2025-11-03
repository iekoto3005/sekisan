import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { PlanData } from '../types';

interface AnalysisResultProps {
  result: PlanData | null;
  isLoading: boolean;
  error: string;
  onResultChange: (key: keyof PlanData, value: string) => void;
}

const Placeholder = () => (
    <div className="text-center text-content-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-4">プランの抽出結果はここに表示されます。</p>
    </div>
);

// Define the order of fields for display
const displayOrder: (keyof PlanData)[] = [
  '物件名',
  '階数',
  '階高',
  '建築面積',
  '延床面積',
  '外壁面積',
  'キッチン数',
  '洗面台数',
  'トイレ数',
];


export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, isLoading, error, onResultChange }) => {
  return (
    <div className="w-full min-h-[300px] h-full bg-base-200 border border-base-300 rounded-lg p-6 flex flex-col justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-content-200">
            <LoadingSpinner />
            <p className="mt-2">プランを抽出中...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 font-semibold">エラーが発生しました</p>
            <p className="text-sm">{error}</p>
        </div>
      ) : result ? (
        <dl className="text-content-100 font-sans space-y-3">
            {displayOrder.map((key) => {
                const value = result[key];
                if (key === '階高' && !value) return null; // 階高がなければ表示しない
                return (
                    <div key={key} className="grid grid-cols-2 items-center border-b border-base-300/50 pb-2 last:border-b-0 gap-4">
                        <dt className="font-medium text-content-200">{key}</dt>
                        <dd>
                            <input
                                type="text"
                                value={String(value ?? '')}
                                onChange={(e) => onResultChange(key as keyof PlanData, e.target.value)}
                                aria-label={`${key}の値を編集`}
                                className="w-full text-right bg-transparent rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all duration-200 font-semibold text-content-100"
                            />
                        </dd>
                    </div>
                );
            })}
        </dl>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};