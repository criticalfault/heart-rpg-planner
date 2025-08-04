import { useState, useCallback } from 'react';
import { Connection, PlacedCard, Landmark, Delve } from '../../types';
import { useConnections } from '../../hooks/useConnections';
import { ConnectionLine } from './ConnectionLine';
import './ConnectionManager.css';

interface ConnectionManagerProps {
  placedCards: PlacedCard[];
  landmarks: Landmark[];
  delves: Delve[];
  showConnections: boolean;
  onToggleConnections: () => void;
  connectionMode?: boolean;
  selectedConnectionCard?: string | null;
  onToggleConnectionMode?: () => void;
}

export function ConnectionManager({
  placedCards,
  landmarks,
  delves,
  showConnections,
  onToggleConnections,
  connectionMode = false,
  selectedConnectionCard = null,
  onToggleConnectionMode
}: ConnectionManagerProps) {
  const { connections, deleteConnection } = useConnections();
  
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  // Get card data by ID
  // Get placed card by ID
  const getPlacedCardById = useCallback((id: string) => {
    return placedCards.find(card => card.id === id);
  }, [placedCards]);

  // Toggle connection mode
  const toggleConnectionMode = () => {
    if (onToggleConnectionMode) {
      onToggleConnectionMode();
    }
    setSelectedConnection(null);
  };

  // Handle connection selection
  const handleConnectionClick = (connection: Connection) => {
    setSelectedConnection(connection.id === selectedConnection ? null : connection.id);
  };

  // Handle connection deletion
  const handleDeleteConnection = (connectionId: string) => {
    deleteConnection(connectionId);
    setSelectedConnection(null);
  };

  // Exit connection mode
  const exitConnectionMode = () => {
    if (onToggleConnectionMode && connectionMode) {
      onToggleConnectionMode();
    }
    setSelectedConnection(null);
  };

  return (
    <div className="connection-manager">
      {/* Connection controls */}
      <div className="connection-controls">
        <button
          className={`connection-toggle ${showConnections ? 'active' : ''}`}
          onClick={onToggleConnections}
          title="Toggle connection visibility"
        >
          {showConnections ? '🔗' : '🔗'}
        </button>
        
        <button
          className={`connection-mode-toggle ${connectionMode ? 'active' : ''}`}
          onClick={toggleConnectionMode}
          title="Toggle connection creation mode"
        >
          {connectionMode ? '✓' : '➕'}
        </button>

        {connectionMode && (
          <button
            className="connection-cancel"
            onClick={exitConnectionMode}
            title="Exit connection mode"
          >
            ✕
          </button>
        )}
      </div>

      {/* Connection mode instructions */}
      {connectionMode && (
        <div className="connection-instructions">
          {!selectedConnectionCard ? (
            <p>Click on a card to start creating a connection</p>
          ) : (
            <p>Click on another card to complete the connection</p>
          )}
        </div>
      )}

      {/* Connection lines (rendered in SVG) */}
      {showConnections && (
        <svg 
          className="connections-overlay" 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
            zIndex: 10
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
            </marker>
          </defs>
          
          {connections.map(connection => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              fromCard={getPlacedCardById(connection.fromId)}
              toCard={getPlacedCardById(connection.toId)}
              onDelete={handleDeleteConnection}
              isSelected={connection.id === selectedConnection}
              onClick={handleConnectionClick}
            />
          ))}
        </svg>
      )}


    </div>
  );
}