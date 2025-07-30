import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  overlay = false,
  className = ''
}) => {
  const spinnerContent = (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner loading-spinner--${size}`}>
        <div className="loading-spinner-circle"></div>
        <div className="loading-spinner-circle"></div>
        <div className="loading-spinner-circle"></div>
        <div className="loading-spinner-circle"></div>
      </div>
      {message && (
        <p className="loading-spinner-message">{message}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-spinner-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};