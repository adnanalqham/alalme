import React, { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextType {
  toast: (message: string, opts?: { kind?: ToastKind; timeoutMs?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);
let toastSeq = 0;

const KIND_STYLES: Record<ToastKind, { ring: string; icon: React.ReactNode }> = {
  success: { ring: 'border-green-500/40 bg-green-50', icon: <CheckCircle2 size={18} className="text-green-600 shrink-0" /> },
  error: { ring: 'border-red-500/40 bg-red-50', icon: <XCircle size={18} className="text-red-600 shrink-0" /> },
  info: { ring: 'border-navy/40 bg-navy/5', icon: <Info size={18} className="text-navy shrink-0" /> },
  warning: { ring: 'border-amber-400/60 bg-amber-50', icon: <AlertTriangle size={18} className="text-amber-600 shrink-0" /> },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, opts?: { kind?: ToastKind; timeoutMs?: number }) => {
    const id = ++toastSeq;
    const kind = opts?.kind ?? 'success';
    setToasts(prev => [...prev.slice(-4), { id, kind, message }]);
    window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, opts?.timeoutMs ?? 4000);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 start-4 z-[100] flex flex-col gap-2 max-w-[min(92vw,380px)]">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`border shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur ${KIND_STYLES[t.kind].ring}`}
            role="status"
          >
            {KIND_STYLES[t.kind].icon}
            <p className="text-sm text-primary flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-700">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};