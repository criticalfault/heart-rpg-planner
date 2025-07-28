import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from '../Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true }
];

describe('Select', () => {
  it('renders select field with options', () => {
    render(<Select options={mockOptions} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(<Select label="Test Label" options={mockOptions} />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders placeholder option when provided', () => {
    render(<Select options={mockOptions} placeholder="Choose an option" />);
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
    const placeholderOption = screen.getByRole('option', { name: 'Choose an option' });
    expect(placeholderOption).toHaveAttribute('disabled');
  });

  it('displays error message when error prop is provided', () => {
    render(<Select options={mockOptions} error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays helper text when provided and no error', () => {
    render(<Select options={mockOptions} helperText="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Select options={mockOptions} error="Error message" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('select--error');
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Select options={mockOptions} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('renders disabled options correctly', () => {
    render(<Select options={mockOptions} />);
    const disabledOption = screen.getByRole('option', { name: 'Option 3' });
    expect(disabledOption).toHaveAttribute('disabled');
  });

  it('applies custom className', () => {
    render(<Select options={mockOptions} className="custom-select" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-select');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Select options={mockOptions} error="Error message" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('associates error message with select using aria-describedby', () => {
    render(<Select options={mockOptions} error="Error message" />);
    const select = screen.getByRole('combobox');
    const errorId = select.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
  });
});