import React, { useState, useCallback } from 'react';
import { analyzeImage } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { Footer } from './components/Footer';

const WandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.293 2.293a1 1 0 011.414 0l.001.001a1 1 0 010 1.414l-11 11a1 1 0 01-1.414-1.414l11-11zM11 7a1 1 0 100-2 1 1 0 000 2zm3-3a1 1 0 100-2 1 1 0 000 2zm-6 6a1 1 0 100-2 1 1 0 000 2zm-3 3a1 1 0 100-2 1 1 0 000 2zM3 7a1 1 0 100-2 1 1 0 000 2zm6 9a1 1 0 00-1.414-1.414l-2.586 2.586a1 1 0 101.414 1.414l2.586-2.586zM14.586 17H17a1 1 0 100-2h-2.414a1 1 0 100 2z" />
  </svg>
);


export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('この画像を詳細に説明してください。何が起きていますか？主なオブジェクトは何ですか？');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setAnalysis('');
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImageDataUrl(null);
    setAnalysis('');
    setError('');
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile || !prompt.trim()) {
      setError('画像をアップロードして、プロンプトを入力してください。');
      return;
    }
    setIsLoading(true);
    setAnalysis('');
    setError('');

    try {
      const result = await analyzeImage(imageFile, prompt);
      setAnalysis(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました。';
      setError(`分析に失敗しました: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold text-content-100">1. 画像をアップロード</h2>
            <ImageUploader 
              onImageChange={handleImageSelect} 
              previewUrl={imageDataUrl}
              onRemoveImage={handleRemoveImage}
            />

            <h2 className="text-2xl font-bold text-content-100 mt-4">2. プロンプトを入力</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例：この画像を説明してください..."
              className="w-full h-32 p-3 bg-base-200 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 resize-none"
              disabled={!imageFile}
            />

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !imageFile}
              className="w-full flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
            >
              <WandIcon />
              {isLoading ? '分析中...' : '画像を分析'}
            </button>
          </div>

          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold text-content-100">3. 分析結果</h2>
            <AnalysisResult result={analysis} isLoading={isLoading} error={error} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}