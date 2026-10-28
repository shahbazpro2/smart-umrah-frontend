import { ToastType } from '@/components/Toast';
import { ToastContext } from '@/store/toast.context';
import { useCallback, useContext } from 'react';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');

  const { addToast } = context;

  const show = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number,
  ) => {
    addToast({ type, title, message, duration });
  }, [addToast]);

  return {
    success: (title: string, message?: string, duration?: number) =>
      show('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      show('error', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      show('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      show('info', title, message, duration),
  };
}
