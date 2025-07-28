import React, { useEffect, useState, useRef, useCallback } from 'react';
import { HexPosition } from '../../types';
import { hexToPixel, HexGridConfig, DEFAULT_HEX_CONFIG, PixelPosition } from '../../utils/hexUtils';
import { DragPreviewData } from '../cards/DraggableCard';
import './HexPositioned.css';

export interface HexPositionedProps {
  hex: HexPosition;
  config?: HexGridConfig;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onPositionChange?: (hex: HexPosition, pixel: PixelPosition) => void;
  onDrop?: (cardId: string, cardType: 'landmark' | 'delve', position: HexPosition) => void;
  onDragOver?: (position: HexPosition) => void;
  onDragLeave?: () => void;
  isOccupied?: (position: HexPosition, excludeId?: string) => boolean;
  draggable?: boolean;
  selected?: boolean;
  isDropZone?: boolean;
}

export const HexPositioned: React.FC<HexPositionedProps> = ({
  hex,
  config = DEFAULT_HEX_CONFIG,
  children,
  className = '',
  style = {},
  onPositionChange,
  onDrop,
  onDragOver,
  onDragLeave,
  isOccupied,
  draggable = false,
  selected = false,
  isDropZone = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<PixelPosition>({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [canDrop, setCanDrop] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  // Calculate pixel position from hex coordinates
  const pixelPosition = hexToPixel(hex, config);

  // Handle drag over for drop zones
  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (!isDropZone) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = canDrop ? 'move' : 'none';
    
    if (!isDragOver) {
      setIsDragOver(true);
      onDragOver?.(hex);
    }
  }, [isDropZone, canDrop, isDragOver, hex, onDragOver]);

  // Handle drag enter
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    if (!isDropZone) return;

    event.preventDefault();
    
    try {
      const dragData = JSON.parse(event.dataTransfer.getData('application/json')) as DragPreviewData;
      const occupied = isOccupied ? isOccupied(hex, dragData.cardId) : false;
      setCanDrop(!occupied);
    } catch {
      setCanDrop(true);
    }
  }, [isDropZone, hex, isOccupied]);

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    if (!isDropZone) return;

    // Only trigger leave if we're actually leaving the element
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { clientX, clientY } = event;
    if (clientX < rect.left || clientX > rect.right || 
        clientY < rect.top || clientY > rect.bottom) {
      setIsDragOver(false);
      setCanDrop(true);
      onDragLeave?.();
    }
  }, [isDropZone, onDragLeave]);

  // Handle drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    if (!isDropZone) return;

    event.preventDefault();
    setIsDragOver(false);
    setCanDrop(true);

    try {
      const dragData = JSON.parse(event.dataTransfer.getData('application/json')) as DragPreviewData;
      
      if (canDrop) {
        onDrop?.(dragData.cardId, dragData.cardType, hex);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  }, [isDropZone, canDrop, hex, onDrop]);

  // Handle drag start for draggable elements
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!draggable) return;

    event.preventDefault();
    setIsDragging(true);

    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });

    // Add global mouse event listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current?.parentElement) return;

      const parentRect = elementRef.current.parentElement.getBoundingClientRect();
      const newPixel = {
        x: e.clientX - parentRect.left - dragOffset.x,
        y: e.clientY - parentRect.top - dragOffset.y,
      };

      // Update position immediately for smooth dragging
      if (elementRef.current) {
        elementRef.current.style.transform = `translate(${newPixel.x}px, ${newPixel.y}px)`;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);

      if (!elementRef.current?.parentElement) return;

      // Snap to nearest hex and notify parent
      const snappedHex = hexToPixel(hex, config);
      onPositionChange?.(hex, snappedHex);

      // Remove global listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Reset transform when not dragging
  useEffect(() => {
    if (!isDragging && elementRef.current) {
      elementRef.current.style.transform = `translate(${pixelPosition.x}px, ${pixelPosition.y}px)`;
    }
  }, [isDragging, pixelPosition.x, pixelPosition.y]);

  const combinedClassName = [
    'hex-positioned',
    draggable ? 'hex-positioned-draggable' : '',
    isDragging ? 'hex-positioned-dragging' : '',
    selected ? 'hex-positioned-selected' : '',
    isDropZone ? 'hex-positioned-drop-zone' : '',
    isDragOver ? 'hex-positioned-drag-over' : '',
    isDragOver && !canDrop ? 'hex-positioned-invalid-drop' : '',
    className,
  ].filter(Boolean).join(' ');

  const combinedStyle = {
    ...style,
    transform: `translate(${pixelPosition.x}px, ${pixelPosition.y}px)`,
  };

  return (
    <div
      ref={elementRef}
      className={combinedClassName}
      style={combinedStyle}
      onMouseDown={handleMouseDown}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export default HexPositioned;