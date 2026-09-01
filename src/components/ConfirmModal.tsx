import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete Permanently',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-red-900 text-white flex justify-between items-center border-b border-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-300" />
            <h2 className="font-bold text-xs uppercase tracking-wide">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-red-200 hover:text-white rounded p-1 hover:bg-red-800/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 text-xs text-slate-700 space-y-3">
          <p className="leading-relaxed font-medium">{message}</p>
          <p className="text-[11px] text-slate-500">
            This operation will remove the record directly from your local IndexedDB storage.
          </p>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-md font-semibold text-slate-700 cursor-pointer transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
