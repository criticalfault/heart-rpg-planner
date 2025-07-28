import React, { useState } from 'react';
import { HexGrid, HexPositioned } from './index';
import { useHexGrid } from '../../hooks/useHexGrid';
import { HexPosition } from '../../types';
import './HexGridExample.css';

interface ExampleCard {
  id: string;
  hex: HexPosition;
  type: 'landmark' | 'delve';
  name: string;
}

export const HexGridExample: React.FC = () => {
  const hexGrid = useHexGrid();
  const [cards, setCards] = useState<ExampleCard[]>([
    { id: '1', hex: { q: 0, r: 0 }, type: 'landmark', name: 'Starting Point' },
    { id: '2', hex: { q: 1, r: 0 }, type: 'delve', name: 'Dark Cave' },
    { id: '3', hex: { q: 0, r: 1 }, type: 'landmark', name: 'Ancient Tree' },
  ]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardPositionChange = (cardId: string, newHex: HexPosition) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, hex: newHex } : card
    ));
  };

  const handleHexClick = (hex: HexPosition) => {
    if (!selectedCard) {
      // Create new card at clicked position
      const newCard: ExampleCard = {
        id: Date.now().toString(),
        hex,
        type: Math.random() > 0.5 ? 'landmark' : 'delve',
        name: `New ${Math.random() > 0.5 ? 'Landmark' : 'Delve'}`,
      };
      setCards(prev => [...prev, newCard]);
    }
  };

  return (
    <div className="hex-grid-example">
      <div className="controls">
        <button onClick={hexGrid.toggleGrid}>
          {hexGrid.showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
        <span>Click on empty hex to add card. Drag cards to move them.</span>
      </div>
      
      <HexGrid
        width={800}
        height={600}
        config={hexGrid.config}
        showGrid={hexGrid.showGrid}
        onHexClick={handleHexClick}
        className="example-grid"
      >
        {cards.map(card => (
          <HexPositioned
            key={card.id}
            hex={card.hex}
            config={hexGrid.config}
            draggable={true}
            selected={selectedCard === card.id}
            onPositionChange={(newHex) => handleCardPositionChange(card.id, newHex)}
          >
            <div 
              className={`example-card ${card.type}`}
              onClick={() => setSelectedCard(card.id === selectedCard ? null : card.id)}
            >
              <div className="card-type">{card.type}</div>
              <div className="card-name">{card.name}</div>
              <div className="card-coords">({card.hex.q}, {card.hex.r})</div>
            </div>
          </HexPositioned>
        ))}
      </HexGrid>
    </div>
  );
};

export default HexGridExample;