import React from 'react';
import { Toast, ToastData } from './Toast';
import './ToastContainer.css';

interface ToastContainerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast,
  position = 'top-right'
}) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={`toast-container toast-container--${position}`}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
};