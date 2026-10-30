import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ShieldAlert, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...item, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
              error: <ShieldAlert className="w-5 h-5 text-danger shrink-0" />,
              info: <Info className="w-5 h-5 text-accent-cyan shrink-0" />,
            };

            const borderColors = {
              success: 'border-accent-emerald/40 bg-bg-surface/95 shadow-[0_4px_20px_rgba(0,245,160,0.15)]',
              warning: 'border-warning/40 bg-bg-surface/95 shadow-[0_4px_20px_rgba(255,176,32,0.15)]',
              error: 'border-danger/40 bg-bg-surface/95 shadow-[0_4px_20px_rgba(255,77,106,0.2)]',
              info: 'border-accent-cyan/40 bg-bg-surface/95 shadow-[0_4px_20px_rgba(53,201,255,0.15)]',
            };

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto rounded-xl border p-4 backdrop-blur-xl flex items-start gap-3 ${borderColors[t.type]}`}
              >
                {icons[t.type]}
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-heading font-semibold text-text-primary">
                    {t.title}
                  </h5>
                  {t.message && (
                    <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                      {t.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.08]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
