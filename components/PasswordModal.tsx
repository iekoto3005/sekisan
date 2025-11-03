
import React, { useState } from 'react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  error: string | null;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSubmit, error }) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-base-100 rounded-lg shadow-xl p-8 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-content-100">管理者ログイン</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password-input" className="block text-sm font-medium text-content-200 mb-1">パスワード</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-content-200 hover:bg-base-200 transition-colors">
              キャンセル
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">
              ログイン
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
