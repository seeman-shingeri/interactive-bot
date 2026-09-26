import React from 'react';
import { Sparkles, X, Check } from 'lucide-react';

export interface MemoryToastData {
  id: string;
  botName: string;
  message: string;
  memoryId?: string;
  onKeep: () => void;
  onRemove: () => void;
}

interface MemoryToastProps {
  toast: MemoryToastData | null;
  onDismiss: () => void;
}

export const MemoryToast: React.FC<MemoryToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-purple-500/40 backdrop-blur-xl shadow-2xl shadow-purple-950/40 text-slate-100 flex flex-col space-y-3 animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <div className="flex items-center space-x-1.5 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Memory Updated</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-slate-200 leading-snug">
        {toast.message}
      </p>

      <div className="flex items-center justify-end space-x-2 pt-1">
        <button
          onClick={() => {
            toast.onRemove();
            onDismiss();
          }}
          className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
        >
          Remove
        </button>
        <button
          onClick={() => {
            toast.onKeep();
            onDismiss();
          }}
          className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all active:scale-95"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Keep</span>
        </button>
      </div>
    </div>
  );
};
