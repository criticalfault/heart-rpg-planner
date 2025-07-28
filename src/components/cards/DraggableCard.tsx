import React, { useRef, useState, useCallback } from 'react';
import { HexPosition } from '../../types';
import { hexToPixel, snapToHex, HexGridConfig, DEFAULT_HEX_CONFIG, PixelPosition } from '../../utils/hexUtils';
import './DraggableCard.css';

export interface DragPreviewData {
  cardId: string;
  cardType: 'landmark' | 'delve';
  offset: PixelPosition;
}

export interface DraggableCardProps {
  cardId: string;
  cardType: 'landmark' | 'delve';
  position?: HexPosition;
  hexConfig?: HexGridConfig;
  onDragStart?: (cardId: string, cardType: 'landmark' | 'delve') => void;
  onDragEnd?: (cardId: string, newPosition: HexPosition) => void;
  onDragMove?: (cardId: string, currentPosition: HexPosition) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  isOccupied?: (position: HexPosition, excludeId?: string) => boolean;
  children: React.ReactNode;
  className?: string;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  cardId,
  cardType,
  position,
  hexConfig = DEFAULT_HEX_CONFIG,
  onDragStart,
  onDragEnd,
  onDragMove,
  isDragging = false,
  isSelected = false,
  isOccupied,
  children,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<PixelPosition>({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState<PixelPosition | null>(null);
  const [previewPosition, setPreviewPosition] = useState<HexPosition | null>(null);

  // Calculate pixel position from hex position
  const pixelPosition = position ? hexToPixel(position, hexConfig) : null;

  // Handle drag start
  const handleDragStart = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!cardRef.current || !pixelPosition) return;

    const rect = cardRef.current.getBoundingClientRect();
    const containerRect = cardRef.current.offsetParent?.getBoundingClientRect();
    
    if (!containerRect) return;

    // Calculate offset from mouse to card center
    const offset = {
      x: event.clientX - (rect.left + rect.width / 2),
      y: event.clientY - (rect.top + rect.height / 2),
    };

    setDragOffset(offset);

    // Set drag data
    const dragData: DragPreviewData = {
      cardId,
      cardType,
      offset,
    };

    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'move';

    // Create custom drag image (optional - browser will use element by default)
    const dragImage = cardRef.current.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);

    onDragStart?.(cardId, cardType);
  }, [cardId, cardType, pixelPosition, onDragStart]);

  // Handle drag end
  const handleDragEnd = useCallback((_event: React.DragEvent<HTMLDivElement>) => {
    setDragPosition(null);
    setPreviewPosition(null);

    // If we have a preview position and it's not occupied, use it
    if (previewPosition && (!isOccupied || !isOccupied(previewPosition, cardId))) {
      onDragEnd?.(cardId, previewPosition);
    }
  }, [cardId, previewPosition, isOccupied, onDragEnd]);

  // Handle drag over (for visual feedback)
  const handleDrag = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.clientX === 0 && event.clientY === 0) return; // Ignore final drag event

    const containerRect = cardRef.current?.offsetParent?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate position relative to container
    const containerPosition = {
      x: event.clientX - containerRect.left - dragOffset.x,
      y: event.clientY - containerRect.top - dragOffset.y,
    };

    setDragPosition(containerPosition);

    // Calculate preview hex position
    const { hex } = snapToHex(containerPosition, hexConfig);
    setPreviewPosition(hex);
    onDragMove?.(cardId, hex);
  }, [cardId, dragOffset, hexConfig, onDragMove]);

  // Determine final position for rendering
  const renderPosition = isDragging && dragPosition ? dragPosition : pixelPosition;

  // Determine if current preview position is valid
  const isValidPosition = previewPosition ? 
    (!isOccupied || !isOccupied(previewPosition, cardId)) : true;

  // Build CSS classes
  const cardClasses = [
    'draggable-card',
    isDragging ? 'draggable-card--dragging' : '',
    isSelected ? 'draggable-card--selected' : '',
    isDragging && !isValidPosition ? 'draggable-card--invalid' : '',
    className
  ].filter(Boolean).join(' ');

  // Style for positioning
  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    transform: renderPosition ? `translate(${renderPosition.x}px, ${renderPosition.y}px)` : undefined,
    transformOrigin: 'center center',
    zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
  };

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      style={cardStyle}
      draggable={!!position} // Only draggable if positioned
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      data-card-id={cardId}
      data-card-type={cardType}
    >
      {children}
      
      {/* Visual feedback for drag state */}
      {isDragging && (
        <div className="draggable-card-overlay">
          <div className={`draggable-card-status ${isValidPosition ? 'valid' : 'invalid'}`}>
            {isValidPosition ? '✓' : '✗'}
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableCard;