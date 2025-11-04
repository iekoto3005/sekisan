import React, { useState, useEffect } from 'react';
import { analyzeImage, generatePdfPreviewUrl } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { Footer } from './components/Footer';
import { SpecificationSelector } from './components/SpecificationSelector';
import { EstimateDetails, Estimate, EstimateItem } from './components/EstimateDetails';
import { calculateEstimate } from './lib/calculation';
import { INITIAL_SPECS, INITIAL_OPTIONS, DEFAULT_SPEC_CATEGORIES, DEFAULT_OPTION_CATEGORIES, SpecCategory, OptionCategory, DISHWASHER_IDS, CUPBOARD_IDS } from './data/specificationsData';
import { CostItem, DEFAULT_COST_ITEMS } from './data/costData';
import { PasswordModal } from './components/PasswordModal';
import { CostEditorModal } from './components/CostEditorModal';
import { AppState, CustomFurnitureItem, PlanData, DeepFoundationParams } from './types';

const ADMIN_PASSWORD = "0000"; // Simple hardcoded password
const CONFIG_STORAGE_KEY = 'gemini-estimate-config';


// --- Print Preview Modal Component ---
const PrintPreviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    estimate: Estimate | null;
    analysis: PlanData | null;
    companyName: string;
    contactLastName: string;
    contactFirstName: string;
}> = ({ isOpen, onClose, estimate, analysis, companyName, contactLastName, contactFirstName }) => {
    const [forCustomer, setForCustomer] = useState(true);
    const [forInternal, setForInternal] = useState(true);
    
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
    };
    
    const contactFullName = `${contactLastName} ${contactFirstName}`.trim();

    const handlePrint = () => {
        window.print();
    };

    const renderHeader = () => (
         <div className="flex justify-between items-end mb-6">
            <div><p className="text-lg border-b-2 border-black pb-1">件名：{analysis?.物件名 || '御住宅新築工事'}</p></div>
            <div className="text-right">
                <p>{new Date().toLocaleDateString('ja-JP-u-ca-japanese', { era: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-lg font-semibold">{companyName}</p>
                {contactFullName && <p className="text-sm mt-1">担当（ {contactFullName} ）</p>}
            </div>
        </div>
    );

    const renderTable = (items: EstimateItem[], internal: boolean) => (
        <table className="w-full text-sm text-left text-black border-collapse">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border p-2 w-[20%] text-center">項目</th>
                    <th className="border p-2 w-[25%] text-center">仕様</th>
                    <th className="border p-2 text-center w-[8%]">数量</th>
                    <th className="border p-2 text-center w-[7%]">単位</th>
                    {internal && <th className="border p-2 text-center w-[13%]">原価</th>}
                    <th className="border p-2 text-center w-[13%]">単価</th>
                    <th className="border p-2 text-center w-[14%]">小計</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, index) => (
                    <tr key={index} className="border-b">
                        <th scope="row" className="border p-2 font-normal whitespace-nowrap overflow-hidden text-ellipsis text-center">{item.name}</th>
                        <td className="border p-2">{item.specName}</td>
                        <td className="border p-2 text-right">{typeof item.quantity === 'number' ? item.quantity.toFixed(2) : item.quantity}</td>
                        <td className="border p-2 text-center">{item.unit}</td>
                        {internal && <td className="border p-2 text-right">{formatCurrency(item.cost)}</td>}
                        <td className="border p-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="border p-2 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderSummary = (est: Estimate, internal: boolean) => (
        <div className="mt-6 ml-auto max-w-sm text-right space-y-2 text-black">
            {internal && (
                <>
                    <div className="flex justify-between"><span>原価合計</span><span className="font-medium">{formatCurrency(est.totalCost)}</span></div>
                    <div className="flex justify-between"><span>利益</span><span className="font-medium">{formatCurrency(est.profit)}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>利益率</span><span>{(est.profitMargin * 100).toFixed(1)}%</span></div>
                </>
            )}
            <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2 border-black"><span>合計 (税抜)</span><span>{formatCurrency(est.totalPrice)}</span></div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-base-200 flex justify-between items-center print-hidden">
                    <h2 className="text-xl font-bold text-content-100">印刷プレビュー</h2>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={forCustomer} onChange={(e) => setForCustomer(e.target.checked)} /><span>お客様提出用</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={forInternal} onChange={(e) => setForInternal(e.target.checked)} /><span>社内用</span></label>
                        <button onClick={handlePrint} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">印刷</button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200 text-2xl leading-none">&times;</button>
                    </div>
                </div>
                <div id="print-area" className="flex-grow overflow-y-auto p-8 bg-white text-black">
                    {estimate ? (
                        <div className="space-y-12">
                            {forCustomer && (
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">御見積書</h1>
                                    {renderHeader()}
                                    {renderTable(estimate.items, false)}
                                    {renderSummary(estimate, false)}
                                </div>
                            )}
                             {forInternal && (
                                <div className={forCustomer ? 'break-before-page' : ''}>
                                    <h1 className="text-3xl font-bold mb-2">【社内用】御見積書</h1>
                                    {renderHeader()}
                                    {renderTable(estimate.items, true)}
                                    {renderSummary(estimate, true)}
                                </div>
                            )}
                            {!forCustomer && !forInternal && <p className="text-center text-gray-500">表示する見積りの種類を選択してください。</p>}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">見積りデータがありません。</p>
                    )}
                </div>
            </div>
        </div>
    );
};


export default function App() {
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [specifications, setSpecifications] = useState(INITIAL_SPECS);
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  
  const [atticStorageSize, setAtticStorageSize] = useState<string>('4.5');
  const [solarPowerKw, setSolarPowerKw] = useState<string>('5.1');
  const [foreignDishwasher, setForeignDishwasher] = useState<string>(() => DISHWASHER_IDS.find(id => INITIAL_OPTIONS[id]) || '');
  const [cupboard, setCupboard] = useState<string>(() => CUPBOARD_IDS.find(id => INITIAL_OPTIONS[id]) || '');
  const [customFurnitureItems, setCustomFurnitureItems] = useState<CustomFurnitureItem[]>([]);
  const [deepFoundation, setDeepFoundation] = useState<DeepFoundationParams>({ A: '', B: '', C: '', landscaping: false });


  const [costItems, setCostItems] = useState<CostItem[]>(DEFAULT_COST_ITEMS);
  const [specCategories, setSpecCategories] = useState<SpecCategory[]>(DEFAULT_SPEC_CATEGORIES);
  const [optionCategories, setOptionCategories] = useState<OptionCategory[]>(DEFAULT_OPTION_CATEGORIES);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isCostEditorOpen, setIsCostEditorOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // New state for company and contact person
  const [companyName, setCompanyName] = useState<string>('株式会社トランスワークス');
  const [contactLastName, setContactLastName] = useState<string>('');
  const [contactFirstName, setContactFirstName] = useState<string>('');
  const [isKeyReady, setIsKeyReady] = useState(false);


  useEffect(() => {
    try {
      const storedData = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (storedData) {
        const config = JSON.parse(storedData);
        if (config.costItems) {
            const loadedCostItems = config.costItems.map((item: any) => ({ ...item, profitMargin: typeof item.profitMargin === 'number' ? item.profitMargin : 0.35 }));
            setCostItems(loadedCostItems);
        }
        if (config.specCategories) setSpecCategories(config.specCategories);
        if (config.optionCategories) setOptionCategories(config.optionCategories);
      }
    } catch (e) {
      console.error("Failed to load or parse config data from localStorage.", e);
      setCostItems(DEFAULT_COST_ITEMS);
      setSpecCategories(DEFAULT_SPEC_CATEGORIES);
      setOptionCategories(DEFAULT_OPTION_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    if (analysis) {
      const newEstimate = calculateEstimate(
        analysis, specifications, options, costItems, specCategories, optionCategories,
        parseFloat(atticStorageSize) || 0, parseFloat(solarPowerKw) || 0, customFurnitureItems,
        {
          A: parseFloat(deepFoundation.A) || 0,
          B: parseFloat(deepFoundation.B) || 0,
          C: parseFloat(deepFoundation.C) || 0,
          landscaping: deepFoundation.landscaping,
        }
      );
      setEstimate(newEstimate);
    } else {
      setEstimate(null);
    }
  }, [analysis, specifications, options, costItems, specCategories, optionCategories, atticStorageSize, solarPowerKw, customFurnitureItems, deepFoundation]);

  useEffect(() => {
    // Check key status when the component mounts.
    const checkKeyStatus = async () => {
        try {
            // @ts-ignore
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                // @ts-ignore
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsKeyReady(hasKey);
            } else {
                console.warn("window.aistudio.hasSelectedApiKey not found.");
                setIsKeyReady(false);
            }
        } catch (e) {
            console.error("Error checking for API key:", e);
            setIsKeyReady(false);
        }
    };
    checkKeyStatus();
  }, []);

  const handleSelectKey = async () => {
    try {
        // @ts-ignore
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // Assume the user selected a key and update the UI.
            setIsKeyReady(true);
        } else {
            setError("APIキー選択機能がこの環境では利用できません。");
        }
    } catch (e) {
        console.error("Failed to open API key selection dialog:", e);
        setError("APIキー選択ダイアログを開けませんでした。");
    }
  };

  // --- File and State Handlers ---
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });

  const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  };
  
  const getAppState = async (): Promise<AppState> => {
    let planFileState = null;
    if (planFile) {
        planFileState = {
            name: planFile.name,
            type: planFile.type,
            data: await fileToBase64(planFile),
        };
    }
    return {
        version: 1,
        planFile: planFileState,
        previewImageUrl,
        analysis,
        specifications,
        options,
        atticStorageSize,
        solarPowerKw,
        foreignDishwasher,
        cupboard,
        customFurnitureItems,
        companyName,
        contactLastName,
        contactFirstName,
        deepFoundation,
    };
  };

  const handleSaveAs = async () => {
    try {
      const appState = await getAppState();
      const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analysis?.物件名 || '無題'}_積算データ.sumrai`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to save file:", err);
      setError("ファイルの保存に失敗しました。");
    }
  };

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sumrai,application/json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const state: AppState = JSON.parse(event.target?.result as string);
                // Basic validation
                if (state.version !== 1 || !state.specifications) {
                    throw new Error("無効なファイル形式です。");
                }
                
                if (state.planFile) {
                    const loadedFile = base64ToFile(state.planFile.data, state.planFile.name, state.planFile.type);
                    setPlanFile(loadedFile);
                } else {
                    setPlanFile(null);
                }

                setPreviewImageUrl(state.previewImageUrl);
                setAnalysis(state.analysis);
                setSpecifications(state.specifications);
                setOptions(state.options);
                setAtticStorageSize(state.atticStorageSize);
                setSolarPowerKw(state.solarPowerKw);
                setForeignDishwasher(state.foreignDishwasher);
                setCupboard(state.cupboard);
                setCustomFurnitureItems(state.customFurnitureItems);
                setCompanyName(state.companyName || '株式会社トランスワークス');
                setContactLastName(state.contactLastName || '');
                setContactFirstName(state.contactFirstName || '');
                setDeepFoundation(state.deepFoundation || { A: '', B: '', C: '', landscaping: false });

                setError('');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : '不明なエラー。';
                setError(`ファイルの読み込みに失敗しました: ${errorMessage}`);
                console.error(err);
            }
        };
        reader.readAsText(file);
    };
    input.click();
  };

  const handlePrintPreview = () => setIsPrintPreviewOpen(true);

  const handleExportExcel = () => {
    if (!estimate) {
        alert("エクスポートする見積りデータがありません。");
        return;
    }
    const headers = ['項目', '仕様', '数量', '単位', '原価', '単価', '小計'];
    const escapeCsvCell = (cell: any) => `"${String(cell).replace(/"/g, '""')}"`;

    const csvRows = [headers.join(',')];
    estimate.items.forEach(item => {
        const row = [
            item.name,
            item.specName,
            typeof item.quantity === 'number' ? item.quantity.toFixed(2) : item.quantity,
            item.unit,
            item.cost,
            item.price,
            item.subtotal
        ].map(escapeCsvCell);
        csvRows.push(row.join(','));
    });
    
    // Add summary
    csvRows.push('');
    csvRows.push([`"原価合計",${estimate.totalCost}`].join(','));
    csvRows.push([`"利益",${estimate.profit}`].join(','));
    csvRows.push([`"利益率",${(estimate.profitMargin * 100).toFixed(1)}%`].join(','));
    csvRows.push([`"合計 (税抜)",${estimate.totalPrice}`].join(','));

    const csvString = '\uFEFF' + csvRows.join('\n'); // BOM for UTF-8 Excel compatibility
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis?.物件名 || '見積り'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  

  const handleFileSelect = async (file: File) => {
    if (!isKeyReady) {
        setError("APIキーが設定されていません。アップロードエリアのボタンから設定してください。");
        return;
    }

    setProgress(0); setPlanFile(file); setAnalysis(null); setError(''); setIsLoading(true); setPreviewImageUrl(null);
  
    try {
        const previewUrl = await generatePdfPreviewUrl(file);
        setPreviewImageUrl(previewUrl);
        
        let result = await analyzeImage(file, setProgress);

        if (!result.階高) {
            if (result.階数?.includes('2階')) result.階高 = '１階3000㎜, 2階2850㎜';
            else if (result.階数?.includes('平屋') || result.階数?.includes('1階')) result.階高 = '3000㎜';
        }
        setAnalysis(result);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました。';
        setError(`抽出に失敗しました: ${errorMessage}`);
        console.error(e);
        setPlanFile(null); setPreviewImageUrl(null);
        
        // If the key is invalid or not found, reset the state to prompt user to select a new key.
        if (errorMessage.includes("API_KEY") || errorMessage.includes("Requested entity was not found")) {
            setIsKeyReady(false);
        }
    } finally {
        setIsLoading(false); setProgress(null);
    }
  };
  
  const handleRemoveFile = () => { setPlanFile(null); setAnalysis(null); setError(''); setPreviewImageUrl(null); };
  const handleResultChange = (key: keyof PlanData, value: string) => { setAnalysis(prev => prev ? { ...prev, [key]: value } : null); };
  const handleSpecChange = (specId: string, value: string) => { setSpecifications(prev => ({ ...prev, [specId]: value })); };
  
  const handleOptionChange = (optionId: string, value: boolean) => {
     if (optionId === 'custom_furniture') {
        if (value && customFurnitureItems.length === 0) {
            setCustomFurnitureItems([{ id: `cf-${Date.now()}`, type: 'open', width: 1.5, depth: 0.45, height: 0.85 }]);
        } else if (!value) {
            setCustomFurnitureItems([]);
        }
    }
    if (optionId === 'deep_foundation' && !value) {
        setDeepFoundation({ A: '', B: '', C: '', landscaping: false });
    }
    setOptions(prev => ({ ...prev, [optionId]: value }));
  };
  
  const handleComplexOptionChange = (selection: string, allOptionIds: string[], selectionSetter: React.Dispatch<React.SetStateAction<string>>) => {
      selectionSetter(selection);
      setOptions(prev => {
          const next = {...prev};
          allOptionIds.forEach(id => { next[id] = id === selection; });
          return next;
      });
  };

  const handleAddCustomFurnitureItem = () => { setCustomFurnitureItems(prev => [...prev, { id: `cf-${Date.now()}`, type: 'open', width: 1.5, depth: 0.45, height: 0.85, }]); };
  const handleRemoveCustomFurnitureItem = (id: string) => { setCustomFurnitureItems(prev => { const newItems = prev.filter(item => item.id !== id); if (newItems.length === 0) { setOptions(prevOpts => ({...prevOpts, custom_furniture: false})); } return newItems; }); };
  const handleUpdateCustomFurnitureItem = (id: string, field: keyof Omit<CustomFurnitureItem, 'id'>, value: string | number) => { setCustomFurnitureItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item)); };
  const handleUpdateDeepFoundation = (field: keyof DeepFoundationParams, value: string | boolean) => { setDeepFoundation(prev => ({ ...prev, [field]: value })); };

  const handleAdminClick = () => { setIsPasswordModalOpen(true); };
  const handlePasswordSubmit = (password: string) => { if (password === ADMIN_PASSWORD) { setPasswordError(null); setIsPasswordModalOpen(false); setIsCostEditorOpen(true); } else { setPasswordError("パスワードが正しくありません。"); } };
  const handleAdminDataSave = (updatedCostItems: CostItem[], updatedSpecCategories: SpecCategory[], updatedOptionCategories: OptionCategory[]) => {
      setCostItems(updatedCostItems); setSpecCategories(updatedSpecCategories); setOptionCategories(updatedOptionCategories);
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ costItems: updatedCostItems, specCategories: updatedSpecCategories, optionCategories: updatedOptionCategories }));
      setIsCostEditorOpen(false);
  };
  const closeModals = () => { setIsPasswordModalOpen(false); setIsCostEditorOpen(false); setPasswordError(null); }

  return (
    <>
      <div className="min-h-screen flex flex-col font-sans">
        <Header 
            onAdminClick={handleAdminClick} 
            onOpenFile={handleOpenFile}
            onSaveAs={handleSaveAs}
            onPrintPreview={handlePrintPreview}
            onExportExcel={handleExportExcel}
            companyName={companyName}
            onCompanyNameChange={setCompanyName}
            contactLastName={contactLastName}
            onContactLastNameChange={setContactLastName}
            contactFirstName={contactFirstName}
            onContactFirstNameChange={setContactFirstName}
        />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-4 flex flex-col space-y-6">
              <div className="flex flex-col space-y-6">
                <h2 className="text-2xl font-bold text-content-100">1. プランをアップロード</h2>
                <ImageUploader
                    onFileChange={handleFileSelect}
                    fileName={planFile?.name || null}
                    onRemoveFile={handleRemoveFile}
                    disabled={isLoading}
                    progress={progress}
                    previewImageUrl={previewImageUrl}
                    isKeyReady={isKeyReady}
                    onSelectKey={handleSelectKey}
                />
              </div>
              <SpecificationSelector specs={specifications} options={options} onSpecChange={handleSpecChange} onOptionChange={handleOptionChange} specCategories={specCategories} optionCategories={optionCategories} disabled={!analysis} foreignDishwasher={foreignDishwasher} onForeignDishwasherChange={(value) => handleComplexOptionChange(value, DISHWASHER_IDS, setForeignDishwasher)} cupboard={cupboard} onCupboardChange={(value) => handleComplexOptionChange(value, CUPBOARD_IDS, setCupboard)} atticStorageSize={atticStorageSize} onAtticStorageSizeChange={setAtticStorageSize} solarPowerKw={solarPowerKw} onSolarPowerKwChange={setSolarPowerKw} customFurnitureItems={customFurnitureItems} onAddCustomFurnitureItem={handleAddCustomFurnitureItem} onRemoveCustomFurnitureItem={handleRemoveCustomFurnitureItem} onUpdateCustomFurnitureItem={handleUpdateCustomFurnitureItem} deepFoundation={deepFoundation} onUpdateDeepFoundation={handleUpdateDeepFoundation} />
            </div>
            <div className="lg:col-span-8 flex flex-col space-y-6">
              <div className="flex flex-col space-y-6">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-2xl font-bold text-content-100">抽出結果</h2>
                    <span className="text-sm font-medium text-red-500">※数量を確認お願いします。</span>
                  </div>
                  <AnalysisResult result={analysis} isLoading={isLoading} error={error} onResultChange={handleResultChange} />
              </div>
              <div id="estimate-details-wrapper" className="flex flex-col space-y-6">
                  <h2 className="text-2xl font-bold text-content-100 print-hidden">見積り明細</h2>
                  <EstimateDetails estimate={estimate} specs={specifications} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <PasswordModal isOpen={isPasswordModalOpen} onClose={closeModals} onSubmit={handlePasswordSubmit} error={passwordError} />
      <CostEditorModal isOpen={isCostEditorOpen} onClose={closeModals} onSave={handleAdminDataSave} initialCostItems={costItems} initialSpecCategories={specCategories} initialOptionCategories={optionCategories} />
      <PrintPreviewModal 
        isOpen={isPrintPreviewOpen} 
        onClose={() => setIsPrintPreviewOpen(false)} 
        estimate={estimate} 
        analysis={analysis} 
        companyName={companyName}
        contactLastName={contactLastName}
        contactFirstName={contactFirstName}
      />
    </>
  );
}