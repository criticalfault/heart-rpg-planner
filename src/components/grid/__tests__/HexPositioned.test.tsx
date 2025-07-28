import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HexPositioned from '../HexPositioned';
import { HexPosition } from '../../../types';

// Mock DraggableCard
vi.mock('../../cards/DraggableCard', () => ({
  DragPreviewData: {},
}));

describe('HexPositioned', () => {
  const defaultHex: HexPosition = { q: 1, r: 1 };
  const defaultProps = {
    hex: defaultHex,
    children: <div data-testid="child">Test Content</div>,
  };

  it('should render children', () => {
    render(<HexPositioned {...defaultProps} />);
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply correct positioning based on hex coordinates', () => {
    const { container } = render(<HexPositioned {...defaultProps} />);
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('hex-positioned');
    expect(element.style.transform).toMatch(/translate\(-?\d+(\.\d+)?px, -?\d+(\.\d+)?px\)/);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <HexPositioned {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('hex-positioned', 'custom-class');
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red', width: '100px' };
    const { container } = render(
      <HexPositioned {...defaultProps} style={customStyle} />
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.style.backgroundColor).toBe('red');
    expect(element.style.width).toBe('100px');
  });

  it('should add draggable class when draggable is true', () => {
    const { container } = render(
      <HexPositioned {...defaultProps} draggable={true} />
    );
    
    expect(container.firstChild).toHaveClass('hex-positioned-draggable');
  });

  it('should add selected class when selected is true', () => {
    const { container } = render(
      <HexPositioned {...defaultProps} selected={true} />
    );
    
    expect(container.firstChild).toHaveClass('hex-positioned-selected');
  });

  it('should handle different hex positions', () => {
    const testCases: HexPosition[] = [
      { q: 0, r: 0 },
      { q: -1, r: 2 },
      { q: 3, r: -1 },
    ];

    testCases.forEach(hex => {
      const { container, unmount } = render(
        <HexPositioned hex={hex} children={<div>Test</div>} />
      );
      
      const element = container.firstChild as HTMLElement;
      expect(element.style.transform).toMatch(/translate\(-?\d+(\.\d+)?px, -?\d+(\.\d+)?px\)/);
      
      unmount();
    });
  });

  it('should use custom hex config', () => {
    const customConfig = { hexSize: 100, spacing: 20 };
    const { container } = render(
      <HexPositioned {...defaultProps} config={customConfig} />
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.style.transform).toMatch(/translate\(-?\d+(\.\d+)?px, -?\d+(\.\d+)?px\)/);
  });

  describe('drag functionality', () => {
    it('should not be draggable by default', () => {
      const { container } = render(<HexPositioned {...defaultProps} />);
      
      expect(container.firstChild).not.toHaveClass('hex-positioned-draggable');
    });

    it('should handle mouse down when draggable', () => {
      const onPositionChange = vi.fn();
      const { container } = render(
        <HexPositioned 
          {...defaultProps} 
          draggable={true} 
          onPositionChange={onPositionChange}
        />
      );
      
      const element = container.firstChild as HTMLElement;
      fireEvent.mouseDown(element, { clientX: 100, clientY: 100 });
      
      expect(element).toHaveClass('hex-positioned-dragging');
    });

    it('should handle drag and drop sequence', () => {
      const onPositionChange = vi.fn();
      
      // Mock getBoundingClientRect for parent element
      const mockGetBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      const { container } = render(
        <div>
          <HexPositioned 
            {...defaultProps} 
            draggable={true} 
            onPositionChange={onPositionChange}
          />
        </div>
      );
      
      const parentElement = container.firstChild as HTMLElement;
      const element = parentElement.firstChild as HTMLElement;
      
      parentElement.getBoundingClientRect = mockGetBoundingClientRect;
      
      // Start drag
      fireEvent.mouseDown(element, { clientX: 100, clientY: 100 });
      expect(element).toHaveClass('hex-positioned-dragging');
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
      
      // End drag
      fireEvent.mouseUp(document, { clientX: 150, clientY: 150 });
      
      expect(element).not.toHaveClass('hex-positioned-dragging');
      expect(onPositionChange).toHaveBeenCalled();
    });

    it('should prevent default on mouse down when draggable', () => {
      const { container } = render(
        <HexPositioned {...defaultProps} draggable={true} />
      );
      
      const element = container.firstChild as HTMLElement;
      const mouseDownEvent = new MouseEvent('mousedown', { 
        bubbles: true, 
        clientX: 100, 
        clientY: 100 
      });
      
      const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault');
      element.dispatchEvent(mouseDownEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not start drag when not draggable', () => {
      const { container } = render(<HexPositioned {...defaultProps} draggable={false} />);
      
      const element = container.firstChild as HTMLElement;
      fireEvent.mouseDown(element, { clientX: 100, clientY: 100 });
      
      expect(element).not.toHaveClass('hex-positioned-dragging');
    });

    it('should handle drag without parent element gracefully', () => {
      const onPositionChange = vi.fn();
      const { container } = render(
        <HexPositioned 
          {...defaultProps} 
          draggable={true} 
          onPositionChange={onPositionChange}
        />
      );
      
      const element = container.firstChild as HTMLElement;
      
      // Remove parent reference to simulate edge case
      Object.defineProperty(element, 'parentElement', {
        value: null,
        writable: true,
      });
      
      fireEvent.mouseDown(element, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(document, { clientX: 150, clientY: 150 });
      
      // Should not crash and not call onPositionChange
      expect(onPositionChange).not.toHaveBeenCalled();
    });
  });

  describe('position updates', () => {
    it('should update position when hex prop changes', () => {
      const { container, rerender } = render(<HexPositioned {...defaultProps} />);
      
      const element = container.firstChild as HTMLElement;
      const initialTransform = element.style.transform;
      
      rerender(<HexPositioned hex={{ q: 2, r: 2 }} children={defaultProps.children} />);
      
      expect(element.style.transform).not.toBe(initialTransform);
    });

    it('should maintain transform during drag', () => {
      const { container } = render(
        <HexPositioned {...defaultProps} draggable={true} />
      );
      
      const element = container.firstChild as HTMLElement;
      
      fireEvent.mouseDown(element, { clientX: 100, clientY: 100 });
      
      // During drag, transform should be managed by drag logic
      expect(element).toHaveClass('hex-positioned-dragging');
    });
  });

  describe('drop zone functionality', () => {
    it('should add drop zone class when isDropZone is true', () => {
      const { container } = render(
        <HexPositioned {...defaultProps} isDropZone={true} />
      );
      
      expect(container.firstChild).toHaveClass('hex-positioned-drop-zone');
    });

    it('should handle drag over events', () => {
      const onDragOver = vi.fn();
      const { container } = render(
        <HexPositioned {...defaultProps} isDropZone={true} onDragOver={onDragOver} />
      );
      
      const element = container.firstChild as HTMLElement;
      const dragEvent = new DragEvent('dragover', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: { dropEffect: '', getData: vi.fn().mockReturnValue('{}') },
        writable: true,
      });
      
      fireEvent(element, dragEvent);
      
      expect(onDragOver).toHaveBeenCalledWith(defaultHex);
      expect(element).toHaveClass('hex-positioned-drag-over');
    });

    it('should handle drag enter events', () => {
      const isOccupied = vi.fn().mockReturnValue(false);
      const { container } = render(
        <HexPositioned {...defaultProps} isDropZone={true} isOccupied={isOccupied} />
      );
      
      const element = container.firstChild as HTMLElement;
      const dragEvent = new DragEvent('dragenter', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: { getData: vi.fn().mockReturnValue('{"cardId":"test-card"}') },
        writable: false,
      });
      
      fireEvent(element, dragEvent);
      
      expect(isOccupied).toHaveBeenCalledWith(defaultHex, 'test-card');
    });

    it('should handle drag leave events', () => {
      const onDragLeave = vi.fn();
      const { container } = render(
        <HexPositioned {...defaultProps} isDropZone={true} onDragLeave={onDragLeave} />
      );
      
      const element = container.firstChild as HTMLElement;
      
      // Mock getBoundingClientRect
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
      
      const dragEvent = new DragEvent('dragleave', { 
        bubbles: true,
        clientX: 200, // Outside the element
        clientY: 200,
      });
      
      fireEvent(element, dragEvent);
      
      expect(onDragLeave).toHaveBeenCalled();
    });

    it('should handle drop events', () => {
      const onDrop = vi.fn();
      const { container } = render(
        <HexPositioned {...defaultProps} isDropZone={true} onDrop={onDrop} />
      );
      
      const element = container.firstChild as HTMLElement;
      const dragData = { cardId: 'test-card', cardType: 'landmark' };
      const dragEvent = new DragEvent('drop', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: { getData: vi.fn().mockReturnValue(JSON.stringify(dragData)) },
        writable: false,
      });
      
      fireEvent(element, dragEvent);
      
      expect(onDrop).toHaveBeenCalledWith('test-card', 'landmark', defaultHex);
    });

    it('should show invalid drop state when position is occupied', () => {
      const isOccupied = vi.fn().mockReturnValue(true);
      const { container } = render(
        <HexPositioned {...defaultProps} isDropZone={true} isOccupied={isOccupied} />
      );
      
      const element = container.firstChild as HTMLElement;
      const dragEvent = new DragEvent('dragenter', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: { getData: vi.fn().mockReturnValue('{"cardId":"test-card"}') },
        writable: false,
      });
      
      fireEvent(element, dragEvent);
      
      // Trigger drag over to show invalid state
      const dragOverEvent = new DragEvent('dragover', { bubbles: true });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: { dropEffect: '', getData: vi.fn().mockReturnValue('{"cardId":"test-card"}') },
        writable: true,
      });
      
      fireEvent(element, dragOverEvent);
      
      expect(element).toHaveClass('hex-positioned-invalid-drop');
    });

    it('should not handle drop zone events when isDropZone is false', () => {
      const onDrop = vi.fn();
      const onDragOver = vi.fn();
      const { container } = render(
        <HexPositioned 
          {...defaultProps} 
          isDropZone={false} 
          onDrop={onDrop} 
          onDragOver={onDragOver} 
        />
      );
      
      const element = container.firstChild as HTMLElement;
      
      fireEvent.dragOver(element);
      fireEvent.drop(element);
      
      expect(onDrop).not.toHaveBeenCalled();
      expect(onDragOver).not.toHaveBeenCalled();
    });
  });
});