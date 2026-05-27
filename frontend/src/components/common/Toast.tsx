import { useToastStore } from '@/store/toast.store';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastStyles = {
  success: 'bg-success/10 border-success/20 text-success',
  error: 'bg-danger/10 border-danger/20 text-danger',
  warning: 'bg-warning/10 border-warning/20 text-warning',
  info: 'bg-primary/10 border-primary/20 text-primary',
};

export function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-soft-lg ${toastStyles[toast.type]} animate-in slide-in-from-right-2 fade-in duration-300`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore();

  const toast = {
    success: (message: string, duration?: number) => {
      addToast({ type: 'success', message, duration });
    },
    error: (message: string, duration?: number) => {
      addToast({ type: 'error', message, duration });
    },
    warning: (message: string, duration?: number) => {
      addToast({ type: 'warning', message, duration });
    },
    info: (message: string, duration?: number) => {
      addToast({ type: 'info', message, duration });
    },
  };

  return { toast, removeToast, clearToasts };
}
