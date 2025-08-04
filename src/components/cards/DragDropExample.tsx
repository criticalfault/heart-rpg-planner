import React from 'react';
import { HexGrid } from '../grid/HexGrid';
import { DraggableCard } from './DraggableCard';
import { LandmarkCard } from './LandmarkCard';
import { DelveCard } from './DelveCard';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useDelveMapContext } from '../../context/DelveMapContext';
import { Landmark, Delve } from '../../types';

export const DragDropExample: React.FC = () => {
  const { state } = useDelveMapContext();
  const {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleGridDrop,
    getCardPosition,
    isCardSelected,
    isCardDragging,
    isOccupied,
  } = useDragAndDrop();

  // Sample data
  const sampleLandmark: Landmark = {
    id: 'landmark-1',
    name: 'The Crimson Market',
    domains: ['Cursed', 'Warren'],
    defaultStress: 'd6',
    haunts: ['Whispers of the dead'],
    bonds: ['The Merchant Prince'],
  };

  const sampleDelve: Delve = {
    id: 'delve-1',
    name: 'The Bleeding Halls',
    resistance: 15,
    domains: ['Cursed', 'Desolate'],
    events: ['Blood rain begins'],
    resources: ['Ancient coins'],
    monsters: [],
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Drag and Drop Example</h2>
      <p>Drag the cards below onto the hex grid to position them.</p>
      
      {/* Unplaced cards */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <DraggableCard
          cardId={sampleLandmark.id}
          cardType="landmark"
          position={getCardPosition(sampleLandmark.id)}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          isDragging={isCardDragging(sampleLandmark.id)}
          isSelected={isCardSelected(sampleLandmark.id)}
          isOccupied={isOccupied}
        >
          <LandmarkCard landmark={sampleLandmark} />
        </DraggableCard>

        <DraggableCard
          cardId={sampleDelve.id}
          cardType="delve"
          position={getCardPosition(sampleDelve.id)}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          isDragging={isCardDragging(sampleDelve.id)}
          isSelected={isCardSelected(sampleDelve.id)}
          isOccupied={isOccupied}
        >
          <DelveCard delve={sampleDelve} />
        </DraggableCard>
      </div>

      {/* Hex grid */}
      <div style={{ border: '1px solid #ccc', borderRadius: '8px' }}>
        <HexGrid
          width={800}
          height={600}
          showGrid={true}
          onDrop={handleGridDrop}
          isOccupied={isOccupied}
        >
          {/* Render placed cards */}
          {state.placedCards.map((placedCard) => {
            const landmark = state.landmarks.find(l => l.id === placedCard.id);
            const delve = state.delves.find(d => d.id === placedCard.id);
            
            if (landmark) {
              return (
                <DraggableCard
                  key={placedCard.id}
                  cardId={placedCard.id}
                  cardType="landmark"
                  position={placedCard.position as any}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  isDragging={isCardDragging(placedCard.id)}
                  isSelected={isCardSelected(placedCard.id)}
                  isOccupied={isOccupied}
                >
                  <LandmarkCard landmark={landmark} />
                </DraggableCard>
              );
            }
            
            if (delve) {
              return (
                <DraggableCard
                  key={placedCard.id}
                  cardId={placedCard.id}
                  cardType="delve"
                  position={placedCard.position as any}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  isDragging={isCardDragging(placedCard.id)}
                  isSelected={isCardSelected(placedCard.id)}
                  isOccupied={isOccupied}
                >
                  <DelveCard delve={delve} />
                </DraggableCard>
              );
            }
            
            return null;
          })}
        </HexGrid>
      </div>

      {/* Debug info */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <h4>Debug Info:</h4>
        <p>Placed cards: {state.placedCards.length}</p>
        <p>Dragged card: {state.draggedCard || 'none'}</p>
        <p>Selected card: {state.selectedCard || 'none'}</p>
      </div>
    </div>
  );
};

export default DragDropExample;