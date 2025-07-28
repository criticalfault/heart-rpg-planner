import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DraggableCard } from '../DraggableCard';
import { HexPosition } from '../../../types';

// Mock hex utilities
vi.mock('../../../utils/hexUtils', () => ({
  hexToPixel: vi.fn((hex: HexPosition) => ({ x: hex.q * 60, y: hex.r * 60 })),
  pixelToHex: vi.fn((pixel: { x: number; y: number }) => ({ q: Math.round(pixel.x / 60), r: Math.round(pixel.y / 60) })),
  snapToHex: vi.fn((pixel: { x: number; y: number }) => ({
    hex: { q: Math.round(pixel.x / 60), r: Math.round(pixel.y / 60) },
    pixel: { x: Math.round(pixel.x / 60) * 60, y: Math.round(pixel.y / 60) * 60 }
  })),
  DEFAULT_HEX_CONFIG: { hexSize: 60, spacing: 10 },
}));

describe('DraggableCard', () => {
  const mockProps = {
    cardId: 'test-card-1',
    cardType: 'landmark' as const,
    position: { q: 0, r: 0 } as HexPosition,
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onDragMove: vi.fn(),
    isOccupied: vi.fn(),
    children: <div>Test Card Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(<DraggableCard {...mockProps} />);
    expect(screen.getByText('Test Card Content')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <DraggableCard {...mockProps} className="custom-class" />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('draggable-card');
    expect(card).toHaveClass('custom-class');
  });

  it('applies dragging class when isDragging is true', () => {
    const { container } = render(
      <DraggableCard {...mockProps} isDragging={true} />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('draggable-card--dragging');
  });

  it('applies selected class when isSelected is true', () => {
    const { container } = render(
      <DraggableCard {...mockProps} isSelected={true} />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('draggable-card--selected');
  });

  it('positions card correctly based on hex position', () => {
    const position = { q: 2, r: 1 };
    const { container } = render(
      <DraggableCard {...mockProps} position={position} />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card.style.transform).toBe('translate(120px, 60px)');
  });

  it('is draggable when position is provided', () => {
    const { container } = render(<DraggableCard {...mockProps} />);
    const card = container.firstChild as HTMLElement;
    expect(card.draggable).toBe(true);
  });

  it('is not draggable when position is not provided', () => {
    const { container } = render(
      <DraggableCard {...mockProps} position={undefined} />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.draggable).toBe(false);
  });

  it('calls onDragStart when drag starts', () => {
    const { container } = render(<DraggableCard {...mockProps} />);
    const card = container.firstChild as HTMLElement;
    
    fireEvent.dragStart(card);
    
    expect(mockProps.onDragStart).toHaveBeenCalledWith('test-card-1', 'landmark');
  });

  it('sets correct drag data on drag start', () => {
    const { container } = render(<DraggableCard {...mockProps} />);
    const card = container.firstChild as HTMLElement;
    
    const mockDataTransfer = {
      setData: vi.fn(),
      effectAllowed: '',
      setDragImage: vi.fn(),
    };
    
    const dragEvent = new DragEvent('dragstart', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: mockDataTransfer,
      writable: false,
    });
    
    fireEvent(card, dragEvent);
    
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      expect.stringContaining('"cardId":"test-card-1"')
    );
    expect(mockDataTransfer.effectAllowed).toBe('move');
  });

  it('calls onDragMove during drag', () => {
    const { container } = render(<DraggableCard {...mockProps} />);
    const card = container.firstChild as HTMLElement;
    
    const dragEvent = new DragEvent('drag', { 
      bubbles: true,
      clientX: 120,
      clientY: 60,
    });
    
    fireEvent(card, dragEvent);
    
    expect(mockProps.onDragMove).toHaveBeenCalledWith('test-card-1', { q: 2, r: 1 });
  });

  it('calls onDragEnd when drag ends', () => {
    const { container } = render(<DraggableCard {...mockProps} />);
    const card = container.firstChild as HTMLElement;
    
    fireEvent.dragEnd(card);
    
    expect(mockProps.onDragEnd).toHaveBeenCalledWith('test-card-1', { q: 0, r: 0 });
  });

  it('shows invalid state when position is occupied', () => {
    const isOccupied = vi.fn().mockReturnValue(true);
    const { container } = render(
      <DraggableCard {...mockProps} isOccupied={isOccupied} isDragging={true} />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('draggable-card--invalid');
  });

  it('shows drag overlay when dragging', () => {
    render(<DraggableCard {...mockProps} isDragging={true} />);
    
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows invalid overlay when dragging to occupied position', () => {
    const isOccupied = vi.fn().mockReturnValue(true);
    render(
      <DraggableCard {...mockProps} isOccupied={isOccupied} isDragging={true} />
    );
    
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('has correct z-index when dragging', () => {
    const { container } = render(
      <DraggableCard {...mockProps} isDragging={true} />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card.style.zIndex).toBe('1000');
  });

  it('has correct z-index when selected', () => {
    const { container } = render(
      <DraggableCard {...mockProps} isSelected={true} />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card.style.zIndex).toBe('100');
  });

  it('has default z-index when not dragging or selected', () => {
    const { container } = render(<DraggableCard {...mockProps} />);
    
    const card = container.firstChild as HTMLElement;
    expect(card.style.zIndex).toBe('1');
  });

  it('includes card data attributes', () => {
    const { container } = render(<DraggableCard {...mockProps} />);
    const card = container.firstChild as HTMLElement;
    
    expect(card.getAttribute('data-card-id')).toBe('test-card-1');
    expect(card.getAttribute('data-card-type')).toBe('landmark');
  });

  it('handles delve card type correctly', () => {
    const { container } = render(
      <DraggableCard {...mockProps} cardType="delve" />
    );
    const card = container.firstChild as HTMLElement;
    
    expect(card.getAttribute('data-card-type')).toBe('delve');
    
    fireEvent.dragStart(card);
    expect(mockProps.onDragStart).toHaveBeenCalledWith('test-card-1', 'delve');
  });

  it('does not call onDragEnd if position is occupied', () => {
    const isOccupied = vi.fn().mockReturnValue(true);
    const onDragEnd = vi.fn();
    
    const { container } = render(
      <DraggableCard 
        {...mockProps} 
        isOccupied={isOccupied}
        onDragEnd={onDragEnd}
        isDragging={true}
      />
    );
    const card = container.firstChild as HTMLElement;
    
    fireEvent.dragEnd(card);
    
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('excludes own card ID when checking if position is occupied', () => {
    const isOccupied = vi.fn().mockReturnValue(false);
    
    render(
      <DraggableCard {...mockProps} isOccupied={isOccupied} isDragging={true} />
    );
    
    // Simulate drag move to trigger position check
    const card = screen.getByText('Test Card Content').parentElement!;
    const dragEvent = new DragEvent('drag', { 
      bubbles: true,
      clientX: 60,
      clientY: 60,
    });
    
    fireEvent(card, dragEvent);
    
    // The isOccupied function should be called with the card's own ID as excludeId
    expect(isOccupied).toHaveBeenCalledWith({ q: 1, r: 1 }, 'test-card-1');
  });
});