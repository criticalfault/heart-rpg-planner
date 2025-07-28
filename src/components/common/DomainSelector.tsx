import React from 'react';
import { Domain } from '../../types';
import './DomainSelector.css';

export interface DomainSelectorProps {
  label?: string;
  selectedDomains: Domain[];
  onChange: (domains: Domain[]) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

const DOMAINS: Domain[] = [
  'Cursed',
  'Desolate', 
  'Haven',
  'Occult',
  'Religion',
  'Technology',
  'Warren',
  'Wild'
];

export const DomainSelector: React.FC<DomainSelectorProps> = ({
  label,
  selectedDomains,
  onChange,
  error,
  helperText,
  disabled = false
}) => {
  const handleDomainToggle = (domain: Domain) => {
    if (disabled) return;
    
    if (selectedDomains.includes(domain)) {
      onChange(selectedDomains.filter(d => d !== domain));
    } else {
      onChange([...selectedDomains, domain]);
    }
  };

  const hasError = Boolean(error);
  const selectorId = `domain-selector-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="domain-selector-group">
      {label && (
        <label className="domain-selector-label">
          {label}
        </label>
      )}
      <div 
        className={`domain-selector ${hasError ? 'domain-selector--error' : ''}`}
        role="group"
        aria-labelledby={label ? `${selectorId}-label` : undefined}
        aria-describedby={error ? `${selectorId}-error` : helperText ? `${selectorId}-helper` : undefined}
      >
        {DOMAINS.map((domain) => {
          const isSelected = selectedDomains.includes(domain);
          return (
            <button
              key={domain}
              type="button"
              className={`domain-chip ${isSelected ? 'domain-chip--selected' : ''}`}
              onClick={() => handleDomainToggle(domain)}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              {domain}
            </button>
          );
        })}
      </div>
      {error && (
        <div id={`${selectorId}-error`} className="domain-selector-error" role="alert">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div id={`${selectorId}-helper`} className="domain-selector-helper">
          {helperText}
        </div>
      )}
    </div>
  );
};