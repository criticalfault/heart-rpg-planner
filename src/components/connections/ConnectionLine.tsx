import React from 'react';
import { Connection, PlacedCard } from '../../types';
import { hexToPixel } from '../../utils/hexUtils';
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
    return null;
  }

  const fromPixel = hexToPixel(fromCard.position);
  const toPixel = hexToPixel(toCard.position);

  // Calculate line properties
  const dx = toPixel.x - fromPixel.x;
  const dy = toPixel.y - fromPixel.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Calculate midpoint for delete button
  const midX = (fromPixel.x + toPixel.x) / 2;
  const midY = (fromPixel.y + toPixel.y) / 2;

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
        x1={fromPixel.x}
        y1={fromPixel.y}
        x2={toPixel.x}
        y2={toPixel.y}
        className={`connection-line ${getConnectionTypeClass()} ${
          isSelected ? 'connection-line--selected' : ''
        }`}
        onClick={handleLineClick}
        strokeWidth="3"
        stroke="currentColor"
        strokeDasharray={connection.type === 'landmark-to-landmark' ? '5,5' : 'none'}
      />

      {/* Arrow marker */}
      <polygon
        points={`${toPixel.x - 8},${toPixel.y - 4} ${toPixel.x},${toPixel.y} ${toPixel.x - 8},${toPixel.y + 4}`}
        className={`connection-arrow ${getConnectionTypeClass()}`}
        transform={`rotate(${angle}, ${toPixel.x}, ${toPixel.y})`}
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