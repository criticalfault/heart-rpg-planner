
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('loading-spinner-container');
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(document.querySelector('.loading-spinner--small')).toBeInTheDocument();

    rerender(<LoadingSpinner size="medium" />);
    expect(document.querySelector('.loading-spinner--medium')).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    expect(document.querySelector('.loading-spinner--large')).toBeInTheDocument();
  });

  it('renders as overlay when overlay prop is true', () => {
    render(<LoadingSpinner overlay message="Loading..." />);
    
    expect(document.querySelector('.loading-spinner-overlay')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />);
    
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('loading-spinner-container', 'custom-spinner');
  });

  it('renders without message when not provided', () => {
    render(<LoadingSpinner />);
    
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});