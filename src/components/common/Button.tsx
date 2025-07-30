import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const loadingClass = loading ? 'btn--loading' : '';
  const classes = [baseClass, variantClass, sizeClass, loadingClass, className].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  return (
    <button 
      className={classes} 
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size="small" 
          className="btn-spinner"
        />
      )}
      <span className={loading ? 'btn-content--loading' : 'btn-content'}>
        {children}
      </span>
    </button>
  );
};