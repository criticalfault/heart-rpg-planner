import React from 'react';
import './ConnectionPoint.css';

interface ConnectionPointProps {
  position: 'top' | 'bottom' | 'left' | 'right';
  isActive?: boolean;
  isConnected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function ConnectionPoint({
  position,
  isActive = false,
  isConnected = false,
  onClick
}: ConnectionPointProps) {
  const getPositionClass = () => {
    switch (position) {
      case 'top':
        return 'connection-point--top';
      case 'bottom':
        return 'connection-point--bottom';
      case 'left':
        return 'connection-point--left';
      case 'right':
        return 'connection-point--right';
      default:
        return '';
    }
  };

  return (
    <div
      className={`connection-point ${getPositionClass()} ${
        isActive ? 'connection-point--active' : ''
      } ${isConnected ? 'connection-point--connected' : ''}`}
      onClick={onClick}
      title={`Connection point (${position})`}
    >
      <div className="connection-point-dot" />
    </div>
  );
}