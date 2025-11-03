import React, { useState, useEffect } from 'react';
import { analyzeImage, PlanData } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { Footer } from './components/Footer';
import { SpecificationSelector } from './components/SpecificationSelector';
import { EstimateDetails, Estimate } from './components/EstimateDetails';
import { calculateEstimate } from './lib/calculation';
import { INITIAL_SPECS, INITIAL_OPTIONS, DEFAULT_SPEC_CATEGORIES, DEFAULT_OPTION_CATEGORIES, SpecCategory, OptionCategory } from './data/specificationsData';
import { CostItem, DEFAULT_COST_ITEMS } from './data/costData';
import { PasswordModal } from './components/PasswordModal';
import { CostEditorModal } from './components/CostEditorModal';

const ADMIN_PASSWORD = "password123"; // Simple hardcoded password
const CONFIG_STORAGE_KEY = 'gemini-estimate-config';

export default function App() {
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [specifications, setSpecifications] = useState(INITIAL_SPECS);
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [estimate, setEstimate] = useState<Estimate | null>(null);

  // Admin state
  const [costItems, setCostItems] = useState<CostItem[]>(DEFAULT_COST_ITEMS);
  const [specCategories, setSpecCategories] = useState<SpecCategory[]>(DEFAULT_SPEC_CATEGORIES);
  const [optionCategories, setOptionCategories] = useState<OptionCategory[]>(DEFAULT_OPTION_CATEGORIES);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isCostEditorOpen, setIsCostEditorOpen] = useState(false);

  // Load custom config from localStorage on initial render
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (storedData) {
        const config = JSON.parse(storedData);
        // Ensure profitMargin exists on loaded costItems for backward compatibility
        if (config.costItems) {
            const loadedCostItems = config.costItems.map((item: any) => ({
                ...item,
                profitMargin: typeof item.profitMargin === 'number' ? item.profitMargin : 0.35,
            }));
            setCostItems(loadedCostItems);
        }
        if (config.specCategories) setSpecCategories(config.specCategories);
        if (config.optionCategories) setOptionCategories(config.optionCategories);
      }
    } catch (e) {
      console.error("Failed to load or parse config data from localStorage.", e);
      // Fallback to default if stored data is corrupted
      setCostItems(DEFAULT_COST_ITEMS);
      setSpecCategories(DEFAULT_SPEC_CATEGORIES);
      setOptionCategories(DEFAULT_OPTION_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    if (analysis) {
      const newEstimate = calculateEstimate(analysis, specifications, options, costItems, specCategories, optionCategories);
      setEstimate(newEstimate);
    } else {
      setEstimate(null);
    }
  }, [analysis, specifications, options, costItems, specCategories, optionCategories]);

  const handleFileSelect = async (file: File) => {
    setProgress(0);
    setPlanFile(file);
    setAnalysis(null);
    setError('');
    setIsLoading(true);

    try {
      const result = await analyzeImage(file, setProgress);
      
      if (!result.階高) {
        if (result.階数?.includes('2階')) {
          result.階高 = '１階3000㎜, 2階2850㎜';
        } else if (result.階数?.includes('平屋') || result.階数?.includes('1階')) {
          result.階高 = '3000㎜';
        }
      }

      setAnalysis(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました。';
      setError(`抽出に失敗しました: ${errorMessage}`);
      console.error(e);
      setPlanFile(null); // Clear file on error to allow re-upload
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };
  
  const handleRemoveFile = () => {
    setPlanFile(null);
    setAnalysis(null);
    setError('');
  };

  const handleResultChange = (key: keyof PlanData, value: string) => {
    setAnalysis(prev => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
  };

  const handleSpecChange = (specId: string, value: string) => {
    setSpecifications(prev => ({ ...prev, [specId]: value }));
  };
  
  const handleOptionChange = (optionId: string, value: boolean) => {
    setOptions(prev => ({ ...prev, [optionId]: value }));
  };

  // Admin handlers
  const handleAdminClick = () => {
      setIsPasswordModalOpen(true);
  };
  
  const handlePasswordSubmit = (password: string) => {
      if (password === ADMIN_PASSWORD) {
          setPasswordError(null);
          setIsPasswordModalOpen(false);
          setIsCostEditorOpen(true);
      } else {
          setPasswordError("パスワードが正しくありません。");
      }
  };

  const handleAdminDataSave = (
      updatedCostItems: CostItem[],
      updatedSpecCategories: SpecCategory[],
      updatedOptionCategories: OptionCategory[]
    ) => {
      setCostItems(updatedCostItems);
      setSpecCategories(updatedSpecCategories);
      setOptionCategories(updatedOptionCategories);
      
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({
          costItems: updatedCostItems,
          specCategories: updatedSpecCategories,
          optionCategories: updatedOptionCategories,
      }));

      setIsCostEditorOpen(false);
  };

  const closeModals = () => {
      setIsPasswordModalOpen(false);
      setIsCostEditorOpen(false);
      setPasswordError(null);
  }

  return (
    <>
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
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
                />
              </div>
              <SpecificationSelector 
                specs={specifications}
                options={options}
                onSpecChange={handleSpecChange}
                onOptionChange={handleOptionChange}
                specCategories={specCategories}
                optionCategories={optionCategories}
                disabled={!analysis}
              />
            </div>

            <div className="lg:col-span-8 flex flex-col space-y-6">
              <div className="flex flex-col space-y-6">
                  <h2 className="text-2xl font-bold text-content-100">抽出結果</h2>
                  <AnalysisResult 
                  result={analysis} 
                  isLoading={isLoading} 
                  error={error}
                  onResultChange={handleResultChange}
                  />
              </div>
              <div className="flex flex-col space-y-6">
                  <h2 className="text-2xl font-bold text-content-100">見積り明細</h2>
                  <EstimateDetails 
                      estimate={estimate}
                      specs={specifications}
                      isLoading={isLoading}
                  />
              </div>
            </div>
          </div>
        </main>
        <Footer onAdminClick={handleAdminClick} />
      </div>
      <PasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={closeModals}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
      />
      <CostEditorModal 
        isOpen={isCostEditorOpen}
        onClose={closeModals}
        onSave={handleAdminDataSave}
        initialCostItems={costItems}
        initialSpecCategories={specCategories}
        initialOptionCategories={optionCategories}
      />
    </>
  );
}