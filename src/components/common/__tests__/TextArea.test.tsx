import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TextArea } from '../TextArea';

describe('TextArea', () => {
  it('renders textarea field', () => {
    render(<TextArea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(<TextArea label="Test Label" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<TextArea error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays helper text when provided and no error', () => {
    render(<TextArea helperText="Enter your message" />);
    expect(screen.getByText('Enter your message')).toBeInTheDocument();
  });

  it('does not display helper text when error is present', () => {
    render(<TextArea helperText="Enter your message" error="Required field" />);
    expect(screen.queryByText('Enter your message')).not.toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<TextArea error="Error message" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('textarea--error');
  });

  it('applies resize class based on resize prop', () => {
    render(<TextArea resize="horizontal" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('textarea--resize-horizontal');
  });

  it('applies vertical resize by default', () => {
    render(<TextArea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('textarea--resize-vertical');
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<TextArea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<TextArea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<TextArea className="custom-textarea" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('forwards other HTML textarea attributes', () => {
    render(<TextArea placeholder="Enter text" rows={5} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', 'Enter text');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('sets aria-invalid when error is present', () => {
    render(<TextArea error="Error message" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('associates error message with textarea using aria-describedby', () => {
    render(<TextArea error="Error message" />);
    const textarea = screen.getByRole('textbox');
    const errorId = textarea.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
  });
});