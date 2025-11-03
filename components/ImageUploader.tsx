import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageChange: (file: File) => void;
  previewUrl: string | null;
  onRemoveImage: () => void;
}

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-content-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, previewUrl, onRemoveImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleContainerClick = () => {
    if (!previewUrl && fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div
        onClick={handleContainerClick}
        className={`relative w-full aspect-video bg-base-200 border-2 border-dashed border-base-300 rounded-lg flex items-center justify-center transition-colors duration-200 ${!previewUrl ? 'hover:border-brand-primary cursor-pointer' : ''}`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="object-contain h-full w-full rounded-lg" />
            <button
                onClick={(e) => { e.stopPropagation(); onRemoveImage();}}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75 transition-colors"
                aria-label="画像を削除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="text-center">
            <ImageIcon />
            <p className="mt-2 text-content-200">クリックして画像をアップロード</p>
            <p className="text-xs text-content-200">(PNG, JPG, WEBP)</p>
          </div>
        )}
      </div>
    </div>
  );
};