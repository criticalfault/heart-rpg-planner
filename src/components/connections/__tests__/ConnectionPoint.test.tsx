import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConnectionPoint } from '../ConnectionPoint';

describe('ConnectionPoint', () => {
  it('renders connection point with correct position class', () => {
    render(<ConnectionPoint position="top" />);
    
    const point = document.querySelector('.connection-point');
    expect(point).toBeInTheDocument();
    expect(point).toHaveClass('connection-point--top');
  });

  it('applies active styling when isActive is true', () => {
    render(<ConnectionPoint position="top" isActive={true} />);
    
    const point = document.querySelector('.connection-point');
    expect(point).toHaveClass('connection-point--active');
  });

  it('applies connected styling when isConnected is true', () => {
    render(<ConnectionPoint position="top" isConnected={true} />);
    
    const point = document.querySelector('.connection-point');
    expect(point).toHaveClass('connection-point--connected');
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<ConnectionPoint position="top" onClick={mockOnClick} />);
    
    const point = document.querySelector('.connection-point');
    fireEvent.click(point!);
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders with correct title attribute', () => {
    render(<ConnectionPoint position="left" />);
    
    const point = document.querySelector('.connection-point');
    expect(point).toHaveAttribute('title', 'Connection point (left)');
  });

  it('applies correct position classes for all positions', () => {
    const positions = ['top', 'bottom', 'left', 'right'] as const;
    
    positions.forEach(position => {
      const { container } = render(<ConnectionPoint position={position} />);
      const point = container.querySelector('.connection-point');
      expect(point).toHaveClass(`connection-point--${position}`);
    });
  });

  it('renders connection point dot', () => {
    render(<ConnectionPoint position="top" />);
    
    const dot = document.querySelector('.connection-point-dot');
    expect(dot).toBeInTheDocument();
  });
});