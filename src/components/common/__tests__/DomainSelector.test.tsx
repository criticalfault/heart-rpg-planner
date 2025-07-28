import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DomainSelector } from '../DomainSelector';
import { Domain } from '../../../types';

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

describe('DomainSelector', () => {
  it('renders all domain options', () => {
    const handleChange = vi.fn();
    render(<DomainSelector selectedDomains={[]} onChange={handleChange} />);
    
    DOMAINS.forEach(domain => {
      expect(screen.getByText(domain)).toBeInTheDocument();
    });
  });

  it('renders with label when provided', () => {
    const handleChange = vi.fn();
    render(<DomainSelector label="Select Domains" selectedDomains={[]} onChange={handleChange} />);
    expect(screen.getByText('Select Domains')).toBeInTheDocument();
  });

  it('shows selected domains as pressed', () => {
    const handleChange = vi.fn();
    const selectedDomains: Domain[] = ['Cursed', 'Haven'];
    render(<DomainSelector selectedDomains={selectedDomains} onChange={handleChange} />);
    
    const cursedButton = screen.getByText('Cursed');
    const havenButton = screen.getByText('Haven');
    const desolateButton = screen.getByText('Desolate');
    
    expect(cursedButton).toHaveAttribute('aria-pressed', 'true');
    expect(havenButton).toHaveAttribute('aria-pressed', 'true');
    expect(desolateButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when domain is selected', () => {
    const handleChange = vi.fn();
    render(<DomainSelector selectedDomains={[]} onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('Cursed'));
    expect(handleChange).toHaveBeenCalledWith(['Cursed']);
  });

  it('calls onChange when domain is deselected', () => {
    const handleChange = vi.fn();
    const selectedDomains: Domain[] = ['Cursed', 'Haven'];
    render(<DomainSelector selectedDomains={selectedDomains} onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('Cursed'));
    expect(handleChange).toHaveBeenCalledWith(['Haven']);
  });

  it('displays error message when error prop is provided', () => {
    const handleChange = vi.fn();
    render(<DomainSelector selectedDomains={[]} onChange={handleChange} error="At least one domain is required" />);
    expect(screen.getByText('At least one domain is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays helper text when provided and no error', () => {
    const handleChange = vi.fn();
    render(<DomainSelector selectedDomains={[]} onChange={handleChange} helperText="Select one or more domains" />);
    expect(screen.getByText('Select one or more domains')).toBeInTheDocument();
  });

  it('does not display helper text when error is present', () => {
    const handleChange = vi.fn();
    render(
      <DomainSelector 
        selectedDomains={[]} 
        onChange={handleChange} 
        helperText="Select domains" 
        error="Required field" 
      />
    );
    expect(screen.queryByText('Select domains')).not.toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('disables all buttons when disabled prop is true', () => {
    const handleChange = vi.fn();
    render(<DomainSelector selectedDomains={[]} onChange={handleChange} disabled />);
    
    DOMAINS.forEach(domain => {
      expect(screen.getByText(domain)).toBeDisabled();
    });
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(<DomainSelector selectedDomains={[]} onChange={handleChange} disabled />);
    
    fireEvent.click(screen.getByText('Cursed'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies selected styling to selected domains', () => {
    const handleChange = vi.fn();
    const selectedDomains: Domain[] = ['Cursed'];
    render(<DomainSelector selectedDomains={selectedDomains} onChange={handleChange} />);
    
    const cursedButton = screen.getByText('Cursed');
    expect(cursedButton).toHaveClass('domain-chip--selected');
  });

  it('applies error styling when error is present', () => {
    const handleChange = vi.fn();
    render(<DomainSelector selectedDomains={[]} onChange={handleChange} error="Error message" />);
    
    const selector = screen.getByRole('group');
    expect(selector).toHaveClass('domain-selector--error');
  });
});