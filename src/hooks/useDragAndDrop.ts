import { useState, useCallback } from 'react';
import { HexPosition, PlacedCard } from '../types';
import { useDelveMapContext } from '../context/DelveMapContext';

export interface DragAndDropState {
  draggedCard: string | null;
  draggedCardType: 'landmark' | 'delve' | null;
  isDragging: boolean;
  previewPosition: HexPosition | null;
}

export function useDragAndDrop() {
  const { state, dispatch } = useDelveMapContext();
  const [dragState, setDragState] = useState<DragAndDropState>({
    draggedCard: null,
    draggedCardType: null,
    isDragging: false,
    previewPosition: null,
  });

  // Check if a position is occupied by another card
  const isOccupied = useCallback((position: HexPosition, excludeId?: string): boolean => {
    return state.placedCards.some(card => 
      card.id !== excludeId && 
      card.position.q === position.q && 
      card.position.r === position.r
    );
  }, [state.placedCards]);

  // Handle drag start
  const handleDragStart = useCallback((cardId: string, cardType: 'landmark' | 'delve') => {
    setDragState({
      draggedCard: cardId,
      draggedCardType: cardType,
      isDragging: true,
      previewPosition: null,
    });
    
    dispatch({ type: 'SET_DRAGGED_CARD', payload: cardId });
  }, [dispatch]);

  // Handle drag move (for preview)
  const handleDragMove = useCallback((cardId: string, position: HexPosition) => {
    if (dragState.draggedCard === cardId) {
      setDragState(prev => ({
        ...prev,
        previewPosition: position,
      }));
    }
  }, [dragState.draggedCard]);

  // Handle drag end
  const handleDragEnd = useCallback((cardId: string, newPosition: HexPosition) => {
    // Check if the position is valid (not occupied)
    if (!isOccupied(newPosition, cardId)) {
      // Find existing placed card or create new one
      const existingCard = state.placedCards.find(card => card.id === cardId);
      
      if (existingCard) {
        // Update existing card position
        dispatch({ 
          type: 'MOVE_CARD', 
          payload: { id: cardId, position: newPosition } 
        });
      } else {
        // Place new card
        const placedCard: PlacedCard = {
          id: cardId,
          type: dragState.draggedCardType!,
          position: newPosition,
        };
        dispatch({ type: 'PLACE_CARD', payload: placedCard });
      }
    }

    // Reset drag state
    setDragState({
      draggedCard: null,
      draggedCardType: null,
      isDragging: false,
      previewPosition: null,
    });
    
    dispatch({ type: 'SET_DRAGGED_CARD', payload: null });
  }, [state.placedCards, dragState.draggedCardType, isOccupied, dispatch]);

  // Handle drop on grid
  const handleGridDrop = useCallback((cardId: string, _cardType: 'landmark' | 'delve', position: HexPosition) => {
    handleDragEnd(cardId, position);
  }, [handleDragEnd]);

  // Get position for a card
  const getCardPosition = useCallback((cardId: string): HexPosition | undefined => {
    const placedCard = state.placedCards.find(card => card.id === cardId);
    return placedCard?.position;
  }, [state.placedCards]);

  // Check if card is selected
  const isCardSelected = useCallback((cardId: string): boolean => {
    return state.selectedCard === cardId;
  }, [state.selectedCard]);

  // Check if card is being dragged
  const isCardDragging = useCallback((cardId: string): boolean => {
    return dragState.draggedCard === cardId && dragState.isDragging;
  }, [dragState.draggedCard, dragState.isDragging]);

  return {
    dragState,
    isOccupied,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleGridDrop,
    getCardPosition,
    isCardSelected,
    isCardDragging,
  };
}

export default useDragAndDrop;