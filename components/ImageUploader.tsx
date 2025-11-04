import React, { useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ImageUploaderProps {
  onFileChange: (file: File) => void;
  fileName: string | null;
  onRemoveFile: () => void;
  disabled?: boolean;
  progress?: number | null;
  previewImageUrl?: string | null;
  isKeyReady: boolean;
  onSelectKey: () => void;
}

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-content-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const FileSelectedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onFileChange, 
  fileName, 
  onRemoveFile, 
  disabled = false, 
  progress = null, 
  previewImageUrl = null,
  isKeyReady,
  onSelectKey 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !disabled) {
      onFileChange(file);
    }
    // Reset file input to allow uploading the same file again after removing it
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleContainerClick = () => {
    if (!fileName && fileInputRef.current && !disabled) {
        fileInputRef.current.click();
    }
  };

  if (!isKeyReady) {
    const isAistudioAvailable = !!window.aistudio;
    return (
      <div className="w-full">
        <div className="relative w-full aspect-video bg-base-200 border-2 border-dashed border-base-300 rounded-lg flex flex-col items-center justify-center text-center p-4">
          {isAistudioAvailable ? (
            <>
              <h3 className="text-lg font-semibold text-content-100">APIキーが必要です</h3>
              <p className="mt-2 text-sm text-content-200">続行するには、APIキーを選択してください。</p>
              <button
                onClick={onSelectKey}
                className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                aria-label="APIキーを選択"
              >
                APIキーを選択
              </button>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 font-semibold text-red-500">エラーが発生しました</p>
              <p className="text-sm text-content-200 mt-1">APIキー選択機能がこの環境では利用できません。<br />このアプリはGoogle AI Studio環境で実行する必要があります。</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf"
        disabled={disabled}
      />
      <div
        onClick={handleContainerClick}
        className={`relative w-full aspect-video bg-base-200 border-2 border-dashed border-base-300 rounded-lg flex items-center justify-center transition-colors duration-200 overflow-hidden ${!fileName && !disabled ? 'hover:border-brand-primary cursor-pointer' : ''} ${disabled && !progress ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {fileName ? (
          <>
            {previewImageUrl ? (
                <img 
                    src={previewImageUrl} 
                    alt={fileName} 
                    className="w-full h-full object-contain bg-white"
                />
            ) : (
                <div className="text-center p-4 flex flex-col items-center">
                  <FileSelectedIcon />
                  <p className="mt-2 text-content-100 font-medium break-all" title={fileName}>{fileName}</p>
                </div>
            )}
            <button
                onClick={(e) => { e.stopPropagation(); if (!disabled) onRemoveFile(); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75 transition-colors disabled:cursor-not-allowed z-10"
                aria-label="ファイルを削除"
                disabled={disabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="text-center">
            <PdfIcon />
            <p className="mt-2 text-content-200">プランをドロップしてください（PDF)</p>
          </div>
        )}
        {disabled && progress !== null && (
          <div className="absolute inset-0 bg-base-100/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-20">
            <LoadingSpinner />
            <p className="mt-4 text-content-100 font-semibold">抽出中... {Math.round(progress)}%</p>
          </div>
        )}
      </div>
    </div>
  );
};
