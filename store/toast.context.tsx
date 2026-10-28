import { ToastConfig, ToastContainer } from '@/components/Toast';
import React, { createContext, useCallback, useState } from 'react';

interface ToastContextType {
    addToast: (toast: Omit<ToastConfig, 'id'>) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastConfig[]>([]);

    const addToast = useCallback((toast: Omit<ToastConfig, 'id'>) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}
