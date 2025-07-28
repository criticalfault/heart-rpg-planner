import React from 'react';
import './TextArea.css';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  resize = 'vertical',
  className = '',
  id,
  ...props
}) => {
  const textAreaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);
  const textAreaClasses = [
    'textarea',
    `textarea--resize-${resize}`,
    hasError ? 'textarea--error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="textarea-group">
      {label && (
        <label htmlFor={textAreaId} className="textarea-label">
          {label}
        </label>
      )}
      <textarea
        id={textAreaId}
        className={textAreaClasses}
        aria-invalid={hasError}
        aria-describedby={error ? `${textAreaId}-error` : helperText ? `${textAreaId}-helper` : undefined}
        {...props}
      />
      {error && (
        <div id={`${textAreaId}-error`} className="textarea-error" role="alert">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div id={`${textAreaId}-helper`} className="textarea-helper">
          {helperText}
        </div>
      )}
    </div>
  );
};