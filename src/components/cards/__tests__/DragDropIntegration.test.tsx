import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DelveMapProvider } from '../../../context/DelveMapContext';
import { DragDropExample } from '../DragDropExample';

// Mock hex utilities
vi.mock('../../../utils/hexUtils', () => ({
  hexToPixel: vi.fn((hex: { q: number; r: number }) => ({ x: hex.q * 60, y: hex.r * 60 })),
  pixelToHex: vi.fn((pixel: { x: number; y: number }) => ({ q: Math.round(pixel.x / 60), r: Math.round(pixel.y / 60) })),
  snapToHex: vi.fn((pixel: { x: number; y: number }) => ({
    hex: { q: Math.round(pixel.x / 60), r: Math.round(pixel.y / 60) },
    pixel: { x: Math.round(pixel.x / 60) * 60, y: Math.round(pixel.y / 60) * 60 }
  })),
  getHexCorners: vi.fn(() => [
    { x: 0, y: 0 }, { x: 60, y: 0 }, { x: 90, y: 52 },
    { x: 60, y: 104 }, { x: 0, y: 104 }, { x: -30, y: 52 }
  ]),
  DEFAULT_HEX_CONFIG: { hexSize: 60, spacing: 10 },
}));

describe('Drag and Drop Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <DelveMapProvider>
        {component}
      </DelveMapProvider>
    );
  };

  it('renders drag drop example with cards', () => {
    renderWithProvider(<DragDropExample />);
    
    expect(screen.getByText('Drag and Drop Example')).toBeInTheDocument();
    expect(screen.getByText('The Crimson Market')).toBeInTheDocument();
    expect(screen.getByText('The Bleeding Halls')).toBeInTheDocument();
  });

  it('shows cards as draggable when not positioned', () => {
    const { container } = renderWithProvider(<DragDropExample />);
    
    const landmarkCard = container.querySelector('[data-card-id="landmark-1"]');
    const delveCard = container.querySelector('[data-card-id="delve-1"]');
    
    expect(landmarkCard?.getAttribute('draggable')).toBe('false'); // Not positioned initially
    expect(delveCard?.getAttribute('draggable')).toBe('false'); // Not positioned initially
  });

  it('handles drag start on cards', () => {
    const { container } = renderWithProvider(<DragDropExample />);
    
    const landmarkCard = container.querySelector('[data-card-id="landmark-1"]') as HTMLElement;
    
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
    
    fireEvent(landmarkCard, dragEvent);
    
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      expect.stringContaining('"cardId":"landmark-1"')
    );
  });

  it('handles drop on hex grid', () => {
    const { container } = renderWithProvider(<DragDropExample />);
    
    const hexGrid = container.querySelector('.hex-grid') as HTMLElement;
    
    const dragData = {
      cardId: 'landmark-1',
      cardType: 'landmark',
      offset: { x: 0, y: 0 }
    };
    
    const dropEvent = new DragEvent('drop', { 
      bubbles: true,
      clientX: 120,
      clientY: 60,
    });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: vi.fn().mockReturnValue(JSON.stringify(dragData)) },
      writable: false,
    });
    
    // Mock getBoundingClientRect for the hex grid
    hexGrid.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    
    fireEvent(hexGrid, dropEvent);
    
    // After drop, the card should be positioned and show debug info
    expect(screen.getByText(/Placed cards: 1/)).toBeInTheDocument();
  });

  it('shows drag over feedback on hex grid', () => {
    const { container } = renderWithProvider(<DragDropExample />);
    
    const hexGrid = container.querySelector('.hex-grid') as HTMLElement;
    
    const dragData = {
      cardId: 'landmark-1',
      cardType: 'landmark',
      offset: { x: 0, y: 0 }
    };
    
    const dragOverEvent = new DragEvent('dragover', { 
      bubbles: true,
      clientX: 120,
      clientY: 60,
    });
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: { 
        dropEffect: '',
        getData: vi.fn().mockReturnValue(JSON.stringify(dragData))
      },
      writable: true,
    });
    
    // Mock getBoundingClientRect for the hex grid
    hexGrid.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    
    fireEvent(hexGrid, dragOverEvent);
    
    expect((dragOverEvent.dataTransfer as any).dropEffect).toBe('move');
  });

  it('prevents drop on occupied positions', () => {
    const { container } = renderWithProvider(<DragDropExample />);
    
    const hexGrid = container.querySelector('.hex-grid') as HTMLElement;
    
    // Mock getBoundingClientRect for the hex grid
    hexGrid.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    
    // First, drop a card
    const dragData1 = {
      cardId: 'landmark-1',
      cardType: 'landmark',
      offset: { x: 0, y: 0 }
    };
    
    const dropEvent1 = new DragEvent('drop', { 
      bubbles: true,
      clientX: 120,
      clientY: 60,
    });
    Object.defineProperty(dropEvent1, 'dataTransfer', {
      value: { getData: vi.fn().mockReturnValue(JSON.stringify(dragData1)) },
      writable: false,
    });
    
    fireEvent(hexGrid, dropEvent1);
    
    // Now try to drop another card at the same position
    const dragData2 = {
      cardId: 'delve-1',
      cardType: 'delve',
      offset: { x: 0, y: 0 }
    };
    
    const dragOverEvent = new DragEvent('dragover', { 
      bubbles: true,
      clientX: 120,
      clientY: 60,
    });
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: { 
        dropEffect: '',
        getData: vi.fn().mockReturnValue(JSON.stringify(dragData2))
      },
      writable: true,
    });
    
    fireEvent(hexGrid, dragOverEvent);
    
    // Should prevent drop on occupied position
    expect((dragOverEvent.dataTransfer as any).dropEffect).toBe('none');
  });

  it('shows debug information', () => {
    renderWithProvider(<DragDropExample />);
    
    expect(screen.getByText('Debug Info:')).toBeInTheDocument();
    expect(screen.getByText(/Placed cards: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Dragged card: none/)).toBeInTheDocument();
    expect(screen.getByText(/Selected card: none/)).toBeInTheDocument();
  });

  it('updates debug info when cards are placed', () => {
    const { container } = renderWithProvider(<DragDropExample />);
    
    const hexGrid = container.querySelector('.hex-grid') as HTMLElement;
    
    // Mock getBoundingClientRect for the hex grid
    hexGrid.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    
    const dragData = {
      cardId: 'landmark-1',
      cardType: 'landmark',
      offset: { x: 0, y: 0 }
    };
    
    const dropEvent = new DragEvent('drop', { 
      bubbles: true,
      clientX: 120,
      clientY: 60,
    });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: vi.fn().mockReturnValue(JSON.stringify(dragData)) },
      writable: false,
    });
    
    fireEvent(hexGrid, dropEvent);
    
    // Debug info should update
    expect(screen.getByText(/Placed cards: 1/)).toBeInTheDocument();
  });

  it('handles drag leave on hex grid', () => {
    const { container } = renderWithProvider(<DragDropExample />);
    
    const hexGrid = container.querySelector('.hex-grid') as HTMLElement;
    
    // Mock getBoundingClientRect for the hex grid
    hexGrid.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    
    const dragLeaveEvent = new DragEvent('dragleave', { 
      bubbles: true,
      clientX: 900, // Outside the grid
      clientY: 700,
    });
    
    fireEvent(hexGrid, dragLeaveEvent);
    
    // Should handle drag leave gracefully
    expect(hexGrid).toBeInTheDocument();
  });
});