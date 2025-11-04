import React, { useState, useRef, useEffect } from 'react';

interface AppMenuProps {
  onOpenFile: () => void;
  onSaveAs: () => void;
  onPrintPreview: () => void;
  onExportExcel: () => void;
  onAdminClick: () => void;
  companyName: string;
  onCompanyNameChange: (name: string) => void;
  contactLastName: string;
  onContactLastNameChange: (name: string) => void;
  contactFirstName: string;
  onContactFirstNameChange: (name: string) => void;
}

const AppMenu: React.FC<AppMenuProps> = ({
  onOpenFile,
  onSaveAs,
  onPrintPreview,
  onExportExcel,
  onAdminClick,
  companyName,
  onCompanyNameChange,
  contactLastName,
  onContactLastNameChange,
  contactFirstName,
  onContactFirstNameChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-base-200/80 transition-colors"
        aria-label="メニューを開く"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-base-100 ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button onClick={() => handleAction(onOpenFile)} className="w-full text-left block px-4 py-2 text-sm text-content-100 hover:bg-base-200" role="menuitem">ファイルを開く (.sumrai)</button>
            <button onClick={() => handleAction(onSaveAs)} className="w-full text-left block px-4 py-2 text-sm text-content-100 hover:bg-base-200" role="menuitem">名前を付けて保存 (.sumrai)</button>
            <div className="border-t border-base-200 my-1"></div>
            <button onClick={() => handleAction(onPrintPreview)} className="w-full text-left block px-4 py-2 text-sm text-content-100 hover:bg-base-200" role="menuitem">印刷プレビュー</button>
            <div className="border-t border-base-200 my-1"></div>
            <button onClick={() => handleAction(onExportExcel)} className="w-full text-left block px-4 py-2 text-sm text-content-100 hover:bg-base-200" role="menuitem">エクセルで出力 (.csv)</button>
            <div className="border-t border-base-200 my-1"></div>
            <div className="px-4 py-2 text-sm text-content-100">
                <span className="font-medium">会社名</span>
                <div className="mt-2 space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="company" value="株式会社トランスワークス" checked={companyName === '株式会社トランスワークス'} onChange={(e) => onCompanyNameChange(e.target.value)} className="h-4 w-4 text-brand-primary focus:ring-brand-secondary"/>
                        <span>株式会社トランスワークス</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="company" value="株式会社Knot" checked={companyName === '株式会社Knot'} onChange={(e) => onCompanyNameChange(e.target.value)} className="h-4 w-4 text-brand-primary focus:ring-brand-secondary"/>
                        <span>株式会社Knot</span>
                    </label>
                </div>
            </div>
            <div className="border-t border-base-200 my-1"></div>
            <div className="px-4 py-2 text-sm text-content-100" onClick={(e) => e.stopPropagation()}>
                <span className="font-medium">担当者登録</span>
                <div className="mt-2 flex items-center space-x-2">
                    <input type="text" placeholder="姓" value={contactLastName} onChange={(e) => onContactLastNameChange(e.target.value)} className="w-full text-sm bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"/>
                    <input type="text" placeholder="名" value={contactFirstName} onChange={(e) => onContactFirstNameChange(e.target.value)} className="w-full text-sm bg-base-200/50 rounded-md px-2 py-1 border border-transparent hover:bg-base-300/50 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"/>
                </div>
            </div>
            <div className="border-t border-base-200 my-1"></div>
            <button onClick={() => handleAction(onAdminClick)} className="w-full text-left block px-4 py-2 text-sm text-content-100 hover:bg-base-200" role="menuitem">管理者設定</button>
          </div>
        </div>
      )}
    </div>
  );
};


interface HeaderProps {
  onAdminClick: () => void;
  onOpenFile: () => void;
  onSaveAs: () => void;
  onPrintPreview: () => void;
  onExportExcel: () => void;
  companyName: string;
  onCompanyNameChange: (name: string) => void;
  contactLastName: string;
  onContactLastNameChange: (name: string) => void;
  contactFirstName: string;
  onContactFirstNameChange: (name: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onAdminClick,
    onOpenFile,
    onSaveAs,
    onPrintPreview,
    onExportExcel,
    companyName,
    onCompanyNameChange,
    contactLastName,
    onContactLastNameChange,
    contactFirstName,
    onContactFirstNameChange,
}) => {
  const contactFullName = `${contactLastName} ${contactFirstName}`.trim();
  return (
    <header className="bg-base-200/50 backdrop-blur-sm p-4 shadow-md sticky top-0 z-10 print-hidden">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-1 flex justify-start">
             <AppMenu
              onOpenFile={onOpenFile}
              onSaveAs={onSaveAs}
              onPrintPreview={onPrintPreview}
              onExportExcel={onExportExcel}
              onAdminClick={onAdminClick}
              companyName={companyName}
              onCompanyNameChange={onCompanyNameChange}
              contactLastName={contactLastName}
              onContactLastNameChange={onContactLastNameChange}
              contactFirstName={contactFirstName}
              onContactFirstNameChange={onContactFirstNameChange}
            />
        </div>
        <div className="flex-shrink-0 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary tracking-wide">
            SMART積算
            </h1>
            <p className="text-content-200 mt-1">まずはプランをアップロード。AIが自動で積算を開始します。</p>
        </div>
        <div className="flex-1 flex justify-end items-center">
            <div className="text-left">
                <p className="font-semibold text-content-100">{companyName}</p>
                {contactFullName && <p className="text-sm text-content-200">担当: {contactFullName}</p>}
            </div>
        </div>
      </div>
    </header>
  );
};
