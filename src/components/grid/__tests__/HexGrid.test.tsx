import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HexGrid from '../HexGrid';

// Mock canvas context
const mockContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
};

// Mock canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as any);

describe('HexGrid', () => {
  const defaultProps = {
    width: 800,
    height: 600,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<HexGrid {...defaultProps} />);
    
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('should render children in content area', () => {
    render(
      <HexGrid {...defaultProps}>
        <div data-testid="child">Test Child</div>
      </HexGrid>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <HexGrid {...defaultProps} className="custom-grid" />
    );
    
    expect(container.firstChild).toHaveClass('hex-grid', 'custom-grid');
  });

  it('should handle showGrid prop', () => {
    const { rerender } = render(<HexGrid {...defaultProps} showGrid={false} />);
    
    let canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveStyle({ pointerEvents: 'none' });
    
    rerender(<HexGrid {...defaultProps} showGrid={true} />);
    canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveStyle({ pointerEvents: 'auto' });
  });

  it('should call onHexClick when clicked', () => {
    const onHexClick = vi.fn();
    const { container } = render(
      <HexGrid {...defaultProps} onHexClick={onHexClick} />
    );
    
    const gridContainer = container.firstChild as HTMLElement;
    fireEvent.click(gridContainer, { clientX: 100, clientY: 100 });
    
    expect(onHexClick).toHaveBeenCalledTimes(1);
    expect(onHexClick).toHaveBeenCalledWith(
      expect.objectContaining({
        q: expect.any(Number),
        r: expect.any(Number),
      }),
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );
  });

  it('should call onHexHover when mouse moves', () => {
    const onHexHover = vi.fn();
    const { container } = render(
      <HexGrid {...defaultProps} onHexHover={onHexHover} />
    );
    
    const gridContainer = container.firstChild as HTMLElement;
    fireEvent.mouseMove(gridContainer, { clientX: 150, clientY: 150 });
    
    expect(onHexHover).toHaveBeenCalledWith(
      expect.objectContaining({
        q: expect.any(Number),
        r: expect.any(Number),
      }),
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );
  });

  it('should call onHexHover with null when mouse leaves', () => {
    const onHexHover = vi.fn();
    const { container } = render(
      <HexGrid {...defaultProps} onHexHover={onHexHover} />
    );
    
    const gridContainer = container.firstChild as HTMLElement;
    fireEvent.mouseLeave(gridContainer);
    
    expect(onHexHover).toHaveBeenCalledWith(null, null);
  });

  it('should use custom hex config', () => {
    const customConfig = { hexSize: 100, spacing: 20 };
    render(<HexGrid {...defaultProps} config={customConfig} />);
    
    // Component should render without errors with custom config
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should handle canvas resize', () => {
    const { rerender } = render(<HexGrid width={400} height={300} />);
    
    let canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveAttribute('width', '400');
    expect(canvas).toHaveAttribute('height', '300');
    
    rerender(<HexGrid width={800} height={600} />);
    canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('should clear canvas when drawing', () => {
    render(<HexGrid {...defaultProps} showGrid={true} />);
    
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('should draw hexagons when showGrid is true', () => {
    render(<HexGrid {...defaultProps} showGrid={true} />);
    
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
    expect(mockContext.closePath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should not draw when showGrid is false', () => {
    render(<HexGrid {...defaultProps} showGrid={false} />);
    
    // Canvas should still be cleared but no drawing operations
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(mockContext.beginPath).not.toHaveBeenCalled();
  });

  it('should handle getBoundingClientRect for coordinate calculations', () => {
    const mockGetBoundingClientRect = vi.fn(() => ({
      left: 10,
      top: 20,
      width: 800,
      height: 600,
      right: 810,
      bottom: 620,
      x: 10,
      y: 20,
      toJSON: () => {},
    }));

    const onHexClick = vi.fn();
    const { container } = render(
      <HexGrid {...defaultProps} onHexClick={onHexClick} />
    );
    
    const gridContainer = container.firstChild as HTMLElement;
    gridContainer.getBoundingClientRect = mockGetBoundingClientRect;
    
    fireEvent.click(gridContainer, { clientX: 110, clientY: 120 });
    
    expect(mockGetBoundingClientRect).toHaveBeenCalled();
    expect(onHexClick).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        x: 100, // clientX - left
        y: 100, // clientY - top
      })
    );
  });
});