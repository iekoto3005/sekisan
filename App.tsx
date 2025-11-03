import React, { useState } from 'react';
import { analyzeImage, PlanData } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { Footer } from './components/Footer';

export default function App() {
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
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

          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold text-content-100">2. 抽出結果</h2>
            <AnalysisResult 
              result={analysis} 
              isLoading={isLoading} 
              error={error}
              onResultChange={handleResultChange}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}