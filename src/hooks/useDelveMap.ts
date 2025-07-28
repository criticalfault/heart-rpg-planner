import { useDelveMapContext } from '../context/DelveMapContext';
import { DelveMap } from '../types';

export function useDelveMap() {
  const { state, dispatch } = useDelveMapContext();

  const loadMap = (map: DelveMap) => {
    dispatch({ type: 'LOAD_MAP', payload: map });
  };

  const createNewMap = (name: string) => {
    dispatch({ type: 'CREATE_NEW_MAP', payload: { name } });
  };

  const clearMap = () => {
    dispatch({ type: 'CLEAR_MAP' });
  };

  const setSelectedCard = (cardId: string | null) => {
    dispatch({ type: 'SET_SELECTED_CARD', payload: cardId });
  };

  const setEditingCard = (cardId: string | null) => {
    dispatch({ type: 'SET_EDITING_CARD', payload: cardId });
  };

  const setDraggedCard = (cardId: string | null) => {
    dispatch({ type: 'SET_DRAGGED_CARD', payload: cardId });
  };

  return {
    currentMap: state.currentMap,
    selectedCard: state.selectedCard,
    editingCard: state.editingCard,
    draggedCard: state.draggedCard,
    placedCards: state.placedCards,
    connections: state.connections,
    loadMap,
    createNewMap,
    clearMap,
    setSelectedCard,
    setEditingCard,
    setDraggedCard
  };
}