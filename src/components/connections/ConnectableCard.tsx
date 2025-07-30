import React from 'react';
import { ConnectionPoint } from './ConnectionPoint';
import { useConnections } from '../../hooks/useConnections';
import './ConnectableCard.css';

interface ConnectableCardProps {
  cardId: string;
  children: React.ReactNode;
  isSelected?: boolean;
  connectionMode?: boolean;
  onConnectionClick?: (cardId: string) => void;
}

export function ConnectableCard({
  cardId,
  children,
  isSelected = false,
  connectionMode = false,
  onConnectionClick
}: ConnectableCardProps) {
  const { getConnectionsForCard } = useConnections();
  
  const connections = getConnectionsForCard(cardId);
  const hasConnections = connections.length > 0;

  const handleCardClick = () => {
    if (connectionMode && onConnectionClick) {
      onConnectionClick(cardId);
    }
  };

  const handleConnectionPointClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectionMode && onConnectionClick) {
      onConnectionClick(cardId);
    }
  };

  return (
    <div
      className={`connectable-card ${
        connectionMode ? 'connectable-card--connection-mode' : ''
      } ${isSelected ? 'connectable-card--selected' : ''}`}
      onClick={handleCardClick}
    >
      {/* Connection points - only show in connection mode or when card has connections */}
      {(connectionMode || hasConnections) && (
        <>
          <ConnectionPoint
            position="top"
            isActive={connectionMode && isSelected}
            isConnected={hasConnections}
            onClick={handleConnectionPointClick}
          />
          <ConnectionPoint
            position="bottom"
            isActive={connectionMode && isSelected}
            isConnected={hasConnections}
            onClick={handleConnectionPointClick}
          />
          <ConnectionPoint
            position="left"
            isActive={connectionMode && isSelected}
            isConnected={hasConnections}
            onClick={handleConnectionPointClick}
          />
          <ConnectionPoint
            position="right"
            isActive={connectionMode && isSelected}
            isConnected={hasConnections}
            onClick={handleConnectionPointClick}
          />
        </>
      )}
      
      {/* Card content */}
      <div className="connectable-card-content">
        {children}
      </div>
    </div>
  );
}