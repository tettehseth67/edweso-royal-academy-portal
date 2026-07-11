import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-md w-full text-slate-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl shrink-0 bg-rose-500/15 text-rose-600">
            <AlertTriangle size={24} />
          </div>
          
          <div className="space-y-1.5 flex-1 text-left">
            <h3 className="text-sm font-black tracking-tight leading-snug text-slate-900 uppercase">
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              {message}
            </p>
          </div>

          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1 rounded-lg cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex space-x-2 mt-6 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Trash2 size={12} />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
