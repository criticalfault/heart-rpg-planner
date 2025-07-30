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
}

export function ConnectionManager({
  placedCards,
  landmarks,
  delves,
  showConnections,
  onToggleConnections
}: ConnectionManagerProps) {
  const { connections, createConnection, deleteConnection } = useConnections();
  
  const [connectionMode, setConnectionMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  // Get card data by ID
  const getCardById = useCallback((id: string) => {
    const landmark = landmarks.find(l => l.id === id);
    if (landmark) return { ...landmark, type: 'landmark' as const };
    
    const delve = delves.find(d => d.id === id);
    if (delve) return { ...delve, type: 'delve' as const };
    
    return null;
  }, [landmarks, delves]);

  // Get placed card by ID
  const getPlacedCardById = useCallback((id: string) => {
    return placedCards.find(card => card.id === id);
  }, [placedCards]);

  // Determine connection type based on card types
  const getConnectionType = (fromType: string, toType: string): Connection['type'] => {
    if (fromType === 'landmark' && toType === 'delve') return 'landmark-to-delve';
    if (fromType === 'delve' && toType === 'delve') return 'delve-to-delve';
    if (fromType === 'landmark' && toType === 'landmark') return 'landmark-to-landmark';
    // Default fallback
    return 'landmark-to-delve';
  };

  // Handle card click in connection mode
  const handleCardClick = useCallback((cardId: string) => {
    if (!connectionMode) return;

    if (!selectedCard) {
      // First card selection
      setSelectedCard(cardId);
    } else if (selectedCard === cardId) {
      // Clicking same card - deselect
      setSelectedCard(null);
    } else {
      // Second card selection - create connection
      const fromCard = getCardById(selectedCard);
      const toCard = getCardById(cardId);
      
      if (fromCard && toCard) {
        // Check if connection already exists
        const existingConnection = connections.find(
          conn => 
            (conn.fromId === selectedCard && conn.toId === cardId) ||
            (conn.fromId === cardId && conn.toId === selectedCard)
        );

        if (!existingConnection) {
          const connectionType = getConnectionType(fromCard.type, toCard.type);
          createConnection(selectedCard, cardId, connectionType);
        }
      }
      
      setSelectedCard(null);
    }
  }, [connectionMode, selectedCard, connections, createConnection, getCardById]);

  // Toggle connection mode
  const toggleConnectionMode = () => {
    setConnectionMode(!connectionMode);
    setSelectedCard(null);
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
    setConnectionMode(false);
    setSelectedCard(null);
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
          {!selectedCard ? (
            <p>Click on a card to start creating a connection</p>
          ) : (
            <p>Click on another card to complete the connection</p>
          )}
        </div>
      )}

      {/* Connection lines (rendered in SVG) */}
      {showConnections && (
        <svg className="connections-overlay" style={{ pointerEvents: 'none' }}>
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

      {/* Card click handlers (invisible overlay) */}
      {connectionMode && (
        <div className="connection-click-overlay">
          {placedCards.map(card => {
            const cardData = getCardById(card.id);
            if (!cardData) return null;

            return (
              <div
                key={card.id}
                className={`connection-card-target ${
                  card.id === selectedCard ? 'selected' : ''
                }`}
                onClick={() => handleCardClick(card.id)}
                style={{
                  position: 'absolute',
                  // Position will be set by parent component based on hex position
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}