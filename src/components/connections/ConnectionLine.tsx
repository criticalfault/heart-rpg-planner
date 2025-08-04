import React from 'react';
import { Connection, PlacedCard } from '../../types';
import './ConnectionLine.css';
import '../../styles/animations.css';

interface ConnectionLineProps {
  connection: Connection;
  fromCard: PlacedCard | undefined;
  toCard: PlacedCard | undefined;
  onDelete?: (connectionId: string) => void;
  isSelected?: boolean;
  onClick?: (connection: Connection) => void;
}

export function ConnectionLine({
  connection,
  fromCard,
  toCard,
  onDelete,
  isSelected = false,
  onClick
}: ConnectionLineProps) {
  // Don't render if either card is missing
  if (!fromCard || !toCard) {
    console.log(`ConnectionLine: Missing card data for connection ${connection.id}`, { fromCard, toCard });
    return null;
  }

  // Debug log for connection rendering
  console.log(`Rendering connection ${connection.id}:`, {
    from: { id: fromCard.id, position: fromCard.position },
    to: { id: toCard.id, position: toCard.position }
  });

  // Calculate card center points (cards are approximately 200px wide, 120px tall)
  const cardWidth = 200;
  const cardHeight = 120;
  
  const fromCenter = {
    x: fromCard.position.x + cardWidth / 2,
    y: fromCard.position.y + cardHeight / 2
  };
  
  const toCenter = {
    x: toCard.position.x + cardWidth / 2,
    y: toCard.position.y + cardHeight / 2
  };

  // Calculate line properties
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate connection points on card edges (not centers) to avoid lines going through cards
  const edgeOffset = 60; // Half of card width to reach the edge
  const normalizedDx = dx / distance;
  const normalizedDy = dy / distance;
  
  const fromEdge = {
    x: fromCenter.x + normalizedDx * edgeOffset,
    y: fromCenter.y + normalizedDy * edgeOffset
  };
  
  const toEdge = {
    x: toCenter.x - normalizedDx * edgeOffset,
    y: toCenter.y - normalizedDy * edgeOffset
  };

  // Calculate midpoint for delete button (use center points for better positioning)
  const midX = (fromCenter.x + toCenter.x) / 2;
  const midY = (fromCenter.y + toCenter.y) / 2;

  const handleLineClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(connection);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(connection.id);
    }
  };

  const getConnectionTypeClass = () => {
    switch (connection.type) {
      case 'landmark-to-delve':
        return 'connection-line--landmark-to-delve';
      case 'delve-to-delve':
        return 'connection-line--delve-to-delve';
      case 'landmark-to-landmark':
        return 'connection-line--landmark-to-landmark';
      default:
        return '';
    }
  };

  return (
    <g className="connection-line-group animate-fade-in">
      {/* Main connection line */}
      <line
        x1={fromEdge.x}
        y1={fromEdge.y}
        x2={toEdge.x}
        y2={toEdge.y}
        className={`connection-line ${getConnectionTypeClass()} ${
          isSelected ? 'connection-line--selected' : ''
        }`}
        onClick={handleLineClick}
        strokeWidth="3"
        stroke="currentColor"
        strokeDasharray={connection.type === 'landmark-to-landmark' ? '5,5' : 'none'}
      />

      {/* Arrow marker - positioned at the end of the line */}
      <polygon
        points="0,-6 12,0 0,6"
        className={`connection-arrow ${getConnectionTypeClass()}`}
        transform={`translate(${toEdge.x}, ${toEdge.y}) rotate(${angle})`}
        fill="currentColor"
      />

      {/* Delete button (shown on hover or when selected) */}
      {(isSelected || onDelete) && (
        <g className="connection-delete-button">
          <circle
            cx={midX}
            cy={midY}
            r="8"
            className="connection-delete-bg"
            fill="white"
            stroke="currentColor"
            strokeWidth="1"
          />
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            dominantBaseline="central"
            className="connection-delete-text"
            onClick={handleDeleteClick}
            fontSize="12"
            fill="currentColor"
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}