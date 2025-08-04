import React, { useRef, useState, useCallback } from 'react';
import { Position } from '../../types';
import './SimpleCard.css';

export interface SimpleCardProps {
  cardId: string;
  cardType: 'landmark' | 'delve';
  position: Position;
  onDragEnd?: (cardId: string, newPosition: Position) => void;
  onConnectionClick?: (cardId: string) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  isConnectionMode?: boolean;
  isConnectionSelected?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const SimpleCard: React.FC<SimpleCardProps> = ({
  cardId,
  cardType,
  position,
  onDragEnd,
  onConnectionClick,
  isDragging = false,
  isSelected = false,
  isConnectionMode = false,
  isConnectionSelected = false,
  children,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Don't start dragging if clicking on a button or interactive element
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.button')) {
      return;
    }

    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    setIsDraggingLocal(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current?.parentElement) return;

      const parentRect = cardRef.current.parentElement.getBoundingClientRect();
      const newPosition = {
        x: e.clientX - parentRect.left - offset.x,
        y: e.clientY - parentRect.top - offset.y
      };

      // Update position immediately for smooth dragging
      cardRef.current.style.left = `${newPosition.x}px`;
      cardRef.current.style.top = `${newPosition.y}px`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!cardRef.current?.parentElement) return;

      const parentRect = cardRef.current.parentElement.getBoundingClientRect();
      const finalPosition = {
        x: e.clientX - parentRect.left - offset.x,
        y: e.clientY - parentRect.top - offset.y
      };

      setIsDraggingLocal(false);
      onDragEnd?.(cardId, finalPosition);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    event.preventDefault();
  }, [cardId, onDragEnd]);

  const cardClasses = [
    'simple-card',
    isDragging || isDraggingLocal ? 'simple-card--dragging' : '',
    isSelected ? 'simple-card--selected' : '',
    isConnectionMode ? 'simple-card--connection-mode' : '',
    isConnectionSelected ? 'simple-card--connection-selected' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
      }}
      data-card-id={cardId}
      data-card-type={cardType}
    >
      <div 
        className="simple-card-drag-handle"
        onMouseDown={handleMouseDown}
        title="Drag to move card"
      >
        ⋮⋮
      </div>
      
      {/* Connection point */}
      {isConnectionMode && (
        <div 
          className="simple-card-connection-point"
          onClick={(e) => {
            e.stopPropagation();
            onConnectionClick?.(cardId);
          }}
          title="Click to connect cards"
        >
          🔗
        </div>
      )}
      
      {children}
    </div>
  );
};

export default SimpleCard;