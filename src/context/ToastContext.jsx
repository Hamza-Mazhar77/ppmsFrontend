/**
 * Toast notifications
 * A small provider plus a `useToast()` hook. Toasts are announced through an
 * aria-live region so screen readers hear the same feedback sighted users see.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const AUTO_DISMISS_MS = 4500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, variant }]);
      // Errors stay a little longer - they usually need reading.
      const timeout = variant === 'error' ? AUTO_DISMISS_MS + 2000 : AUTO_DISMISS_MS;
      window.setTimeout(() => dismiss(id), timeout);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: {
        success: (message) => push(message, 'success'),
        error: (message) => push(message, 'error'),
        warning: (message) => push(message, 'warning'),
        info: (message) => push(message, 'info'),
      },
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map((item) => {
          const Icon = ICONS[item.variant] || Info;
          return (
            <div key={item.id} className={'toast toast-' + item.variant}>
              <Icon size={16} className="toast-icon" aria-hidden="true" />
              <span className="toast-message">{item.message}</span>
              <button type="button" className="toast-dismiss" onClick={() => dismiss(item.id)} aria-label="Dismiss notification">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider.');
  return context.toast;
}
