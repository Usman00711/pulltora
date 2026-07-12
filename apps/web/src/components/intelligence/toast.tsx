import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type ToastTone = 'success' | 'error' | 'info';
type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-sm space-y-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`motion-rise relative overflow-hidden rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-2xl ${
              toast.tone === 'success'
                ? 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100 shadow-emerald-950/40'
                : toast.tone === 'error'
                  ? 'border-rose-300/40 bg-rose-500/15 text-rose-100 shadow-rose-950/40'
                  : 'border-cyan-300/40 bg-cyan-500/15 text-cyan-100 shadow-cyan-950/40'
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  toast.tone === 'success'
                    ? 'bg-emerald-300'
                    : toast.tone === 'error'
                      ? 'bg-rose-300'
                      : 'bg-cyan-300'
                }`}
              />
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    return {
      showToast: () => undefined
    };
  }

  return context;
}
