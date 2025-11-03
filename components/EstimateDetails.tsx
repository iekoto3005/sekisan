
import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export interface EstimateItem {
  name: string;
  specName: string;
  quantity: number | string;
  unit: string;
  cost: number;
  price: number;
  subtotal: number;
}
export interface Estimate {
  items: EstimateItem[];
  totalCost: number;
  profit: number;
  profitMargin: number;
  totalPrice: number;
}

interface EstimateDetailsProps {
    estimate: Estimate | null;
    specs: { [key: string]: string };
    isLoading: boolean;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
};

const Placeholder = () => (
    <div className="text-center text-content-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-4">プランをアップロードすると見積り明細がここに表示されます。</p>
    </div>
);

export const EstimateDetails: React.FC<EstimateDetailsProps> = ({ estimate, isLoading }) => {
    const [highlightedRows, setHighlightedRows] = useState<Set<string>>(new Set());
    const prevEstimateRef = useRef<Estimate | null>(null);

    useEffect(() => {
        if (!estimate || isLoading) {
            prevEstimateRef.current = estimate;
            return;
        }

        // FIX: Explicitly type the Maps to prevent incorrect type inference.
        const prevItemsMap = new Map<string, EstimateItem>(
            prevEstimateRef.current?.items.map(item => [item.name, item]) || []
        );
        const currentItemsMap = new Map<string, EstimateItem>(estimate.items.map(item => [item.name, item]));
        const changedRowNames = new Set<string>();

        // Check for changed or new items
        currentItemsMap.forEach((newItem, name) => {
            const prevItem = prevItemsMap.get(name);
            if (!prevItem || prevItem.subtotal !== newItem.subtotal || prevItem.specName !== newItem.specName) {
                changedRowNames.add(name);
            }
        });

        // Check for removed items
        prevItemsMap.forEach((_, name) => {
            if (!currentItemsMap.has(name)) {
                // It's not possible to highlight a row that has been removed,
                // but its cost change is reflected in totals which will be highlighted if they change.
            }
        });

        if (changedRowNames.size > 0) {
            setHighlightedRows(current => new Set([...current, ...changedRowNames]));

            changedRowNames.forEach(name => {
                setTimeout(() => {
                    setHighlightedRows(prev => {
                        const next = new Set(prev);
                        next.delete(name);
                        return next;
                    });
                }, 2000); // Corresponds to animation duration
            });
        }

        prevEstimateRef.current = estimate;
    }, [estimate, isLoading]);


    const renderTable = () => {
        if (!estimate) return null;
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-content-200 table-fixed">
                    <thead className="text-xs text-content-200 uppercase bg-base-200/50">
                        <tr>
                            <th scope="col" className="px-4 py-3 w-[20%]">項目</th>
                            <th scope="col" className="px-4 py-3 w-[25%]">仕様</th>
                            <th scope="col" className="px-4 py-3 text-right w-[8%]">数量</th>
                            <th scope="col" className="px-4 py-3 w-[7%]">単位</th>
                            <th scope="col" className="px-4 py-3 text-right w-[13%]">原価</th>
                            <th scope="col" className="px-4 py-3 text-right w-[13%]">単価</th>
                            <th scope="col" className="px-4 py-3 text-right w-[14%]">小計</th>
                        </tr>
                    </thead>
                    <tbody>
                        {estimate.items.map((item, index) => (
                            <tr key={index} className={`border-b border-base-200/80 hover:bg-base-200/30 ${highlightedRows.has(item.name) ? 'animate-highlight' : ''}`}>
                                <th scope="row" className="px-4 py-3 font-medium text-content-100 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</th>
                                <td className="px-4 py-3">{item.specName}</td>
                                <td className="px-4 py-3 text-right">{typeof item.quantity === 'number' ? item.quantity.toFixed(2) : item.quantity}</td>
                                <td className="px-4 py-3">{item.unit}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(item.cost)}</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-content-100">{formatCurrency(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-6 ml-auto max-w-sm text-right space-y-2 text-content-100">
                    <div className="flex justify-between">
                        <span>原価合計</span>
                        <span className="font-medium">{formatCurrency(estimate.totalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>利益</span>
                        <span className="font-medium">{formatCurrency(estimate.profit)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-content-200">
                        <span>利益率</span>
                        <span>{(estimate.profitMargin * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2 border-base-300 text-brand-secondary">
                        <span>合計 (税抜)</span>
                        <span>{formatCurrency(estimate.totalPrice)}</span>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-full min-h-[400px] h-full bg-base-200/80 border border-base-300 rounded-lg p-6 flex flex-col justify-center">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center text-content-200">
                    <LoadingSpinner />
                </div>
            ) : estimate ? (
                renderTable()
            ) : (
                <Placeholder />
            )}
        </div>
    );
};
