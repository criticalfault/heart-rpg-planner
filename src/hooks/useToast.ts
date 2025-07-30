import { useState, useCallback } from 'react';
import { ToastData } from '../components/common/Toast';

export interface UseToastReturn {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  showSuccess: (title: string, message?: string, options?: Partial<ToastData>) => string;
  showError: (title: string, message?: string, options?: Partial<ToastData>) => string;
  showWarning: (title: string, message?: string, options?: Partial<ToastData>) => string;
  showInfo: (title: string, message?: string, options?: Partial<ToastData>) => string;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>): string => {
    const id = crypto.randomUUID();
    const newToast: ToastData = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<ToastData>
  ): string => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const showError = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<ToastData>
  ): string => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 8000, // Errors stay longer by default
      ...options
    });
  }, [addToast]);

  const showWarning = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<ToastData>
  ): string => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: 6000, // Warnings stay a bit longer
      ...options
    });
  }, [addToast]);

  const showInfo = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<ToastData>
  ): string => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};