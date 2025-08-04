import React, { useState, useCallback } from 'react';
import { Landmark, Delve } from '../../types';
import { LandmarkCard } from './LandmarkCard';
import { DelveCard } from './DelveCard';
import { Button } from '../common/Button';
import './CardPalette.css';

export interface CardPaletteProps {
  landmarks: Landmark[];
  delves: Delve[];
  placedCardIds: string[];
  onPlaceCard: (cardId: string, cardType: 'landmark' | 'delve') => void;
  onEditCard: (cardId: string, cardType: 'landmark' | 'delve') => void;
  onDeleteCard: (cardId: string, cardType: 'landmark' | 'delve') => void;
  onSaveToLibrary: (item: Landmark | Delve, type: 'landmark' | 'delve') => void;
  className?: string;
}

export const CardPalette: React.FC<CardPaletteProps> = ({
  landmarks,
  delves,
  placedCardIds,
  onPlaceCard,
  onEditCard,
  onDeleteCard,
  onSaveToLibrary,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'landmarks' | 'delves'>(
    'landmarks'
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Show all cards, but indicate which ones are already placed
  const availableLandmarks = landmarks;
  const availableDelves = delves;

  const handlePlaceCard = useCallback(
    (cardId: string, cardType: 'landmark' | 'delve') => {
      onPlaceCard(cardId, cardType);
    },
    [onPlaceCard]
  );

  const handleEditCard = useCallback(
    (cardId: string, cardType: 'landmark' | 'delve') => {
      onEditCard(cardId, cardType);
    },
    [onEditCard]
  );

  const handleDeleteCard = useCallback(
    (cardId: string, cardType: 'landmark' | 'delve') => {
      onDeleteCard(cardId, cardType);
    },
    [onDeleteCard]
  );

  const paletteClasses = [
    'card-palette',
    isCollapsed ? 'card-palette--collapsed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isCollapsed) {
    return (
      <div className={paletteClasses}>
        <div className="card-palette-header">
          <Button
            variant="secondary"
            size="small"
            onClick={() => setIsCollapsed(false)}
            title="Expand card palette"
          >
            📋 Cards ({landmarks.length + delves.length})
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={paletteClasses}>
      <div className="card-palette-header">
        <h3 className="card-palette-title">Available Cards</h3>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setIsCollapsed(true)}
          title="Collapse card palette"
        >
          ✕
        </Button>
      </div>

      <div className="card-palette-tabs">
        <button
          className={`card-palette-tab ${
            activeTab === 'landmarks' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('landmarks')}
        >
          Landmarks ({landmarks.length})
        </button>
        <button
          className={`card-palette-tab ${
            activeTab === 'delves' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('delves')}
        >
          Delves ({delves.length})
        </button>
      </div>

      <div className="card-palette-content">
        {activeTab === 'landmarks' && (
          <div className="card-palette-section">
            {landmarks.length === 0 ? (
              <div className="card-palette-empty">
                <p>No landmarks created yet.</p>
                <p>Create landmarks using the "Add Landmark" button above.</p>
              </div>
            ) : (
              <div className="card-palette-cards">
                {availableLandmarks.map((landmark) => {
                  const isPlaced = placedCardIds.includes(landmark.id);
                  return (
                    <div
                      key={landmark.id}
                      className={`card-palette-card ${
                        isPlaced ? 'card-palette-card--placed' : ''
                      }`}
                    >
                      <div
                        className="card-palette-card-preview"
                        draggable={!isPlaced}
                        onDragStart={(e) => {
                          if (isPlaced) {
                            e.preventDefault();
                            return;
                          }
                          const dragData = {
                            cardId: landmark.id,
                            cardType: 'landmark' as const,
                            offset: { x: 0, y: 0 },
                          };
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify(dragData)
                          );
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                      >
                        <LandmarkCard
                          landmark={landmark}
                          className="card-palette-card-content"
                        />
                        {isPlaced && (
                          <div className="card-palette-placed-indicator">
                            ✓ On Map
                          </div>
                        )}
                        {!isPlaced && (
                          <div className="card-palette-drag-hint">
                            🖱️ Drag to map or use button below
                          </div>
                        )}
                      </div>
                      <div className="card-palette-card-actions">
                        {!isPlaced ? (
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() =>
                              handlePlaceCard(landmark.id, 'landmark')
                            }
                            title="Place this landmark on the map"
                          >
                            Place on Map
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="small"
                            disabled
                            title="This landmark is already on the map"
                          >
                            On Map
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() =>
                            handleEditCard(landmark.id, 'landmark')
                          }
                          title="Edit this landmark"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => onSaveToLibrary(landmark, 'landmark')}
                          title="Save to library"
                        >
                          Save
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() =>
                            handleDeleteCard(landmark.id, 'landmark')
                          }
                          title="Delete this landmark"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'delves' && (
          <div className="card-palette-section">
            {delves.length === 0 ? (
              <div className="card-palette-empty">
                <p>No delves created yet.</p>
                <p>Create delves using the "Add Delve" button above.</p>
              </div>
            ) : (
              <div className="card-palette-cards">
                {availableDelves.map((delve) => {
                  const isPlaced = placedCardIds.includes(delve.id);
                  return (
                    <div
                      key={delve.id}
                      className={`card-palette-card ${
                        isPlaced ? 'card-palette-card--placed' : ''
                      }`}
                    >
                      <div
                        className="card-palette-card-preview"
                        draggable={!isPlaced}
                        onDragStart={(e) => {
                          if (isPlaced) {
                            e.preventDefault();
                            return;
                          }
                          const dragData = {
                            cardId: delve.id,
                            cardType: 'delve' as const,
                            offset: { x: 0, y: 0 },
                          };
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify(dragData)
                          );
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                      >
                        <DelveCard
                          delve={delve}
                          className="card-palette-card-content"
                        />
                        {isPlaced && (
                          <div className="card-palette-placed-indicator">
                            ✓ On Map
                          </div>
                        )}
                        {!isPlaced && (
                          <div className="card-palette-drag-hint">
                            🖱️ Drag to map or use button below
                          </div>
                        )}
                      </div>
                      <div className="card-palette-card-actions">
                        {!isPlaced ? (
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handlePlaceCard(delve.id, 'delve')}
                            title="Place this delve on the map"
                          >
                            Place on Map
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="small"
                            disabled
                            title="This delve is already on the map"
                          >
                            On Map
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleEditCard(delve.id, 'delve')}
                          title="Edit this delve"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => onSaveToLibrary(delve, 'delve')}
                          title="Save to library"
                        >
                          Save
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleDeleteCard(delve.id, 'delve')}
                          title="Delete this delve"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card-palette-help">
        <p className="card-palette-help-text">
          💡 Click "Place on Map" to add cards to the canvas, or drag them
          directly onto the map. Cards marked "✓ On Map" are already placed.
        </p>
      </div>
    </div>
  );
};

export default CardPalette;
