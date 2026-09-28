import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger', isLoading = false }) {
  const getButtonClass = () => {
    if (confirmVariant === 'danger') {
      return 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30';
    }
    if (confirmVariant === 'warning') {
      return 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30';
    }
    return 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-400 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${getButtonClass()}`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
