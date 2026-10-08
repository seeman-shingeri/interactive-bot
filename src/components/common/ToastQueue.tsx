import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'sparkle';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastItemCard: React.FC<{
  item: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ item, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const duration = item.duration ?? 4500;
    const timer = setTimeout(() => {
      onDismiss(item.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [item.id, item.duration, isPaused, onDismiss]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pointer-events-auto flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-950/95 border border-white/10 backdrop-blur-xl shadow-2xl text-slate-100 animate-in slide-in-from-bottom-2 fade-in duration-200 hover:border-white/20 transition-all"
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        {item.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
        {item.type === 'sparkle' && <Sparkles className="w-4 h-4 text-cyan-400" />}
        {item.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
        {item.message && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.message}</p>}
      </div>

      <button
        onClick={() => onDismiss(item.id)}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev.slice(-3), newToast]); // Limit to max 4 concurrent toasts
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Floating Toast Notification Container (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <ToastItemCard key={t.id} item={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
