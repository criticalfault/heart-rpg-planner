import { useDelveMapContext } from '../context/DelveMapContext';
import { Landmark, PlacedCard, Position } from '../types';

export function useLandmarks() {
  const { state, dispatch } = useDelveMapContext();

  const addLandmark = (landmark: Omit<Landmark, 'id'> | Landmark) => {
    const landmarkWithId = {
      ...landmark,
      id: landmark.id || `landmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    } as Landmark;
    dispatch({ type: 'ADD_LANDMARK', payload: landmarkWithId });
    return landmarkWithId;
  };

  const updateLandmark = (id: string, landmark: Partial<Landmark>) => {
    dispatch({ type: 'UPDATE_LANDMARK', payload: { id, landmark } });
  };

  const deleteLandmark = (id: string) => {
    dispatch({ type: 'DELETE_LANDMARK', payload: id });
  };

  const placeLandmark = (id: string, position: Position) => {
    const placedCard: PlacedCard = {
      id,
      type: 'landmark',
      position
    };
    dispatch({ type: 'PLACE_CARD', payload: placedCard });
  };

  const moveLandmark = (id: string, position: Position) => {
    dispatch({ type: 'MOVE_CARD', payload: { id, position } });
  };

  const removePlacedLandmark = (id: string) => {
    dispatch({ type: 'REMOVE_PLACED_CARD', payload: id });
  };

  const getLandmarkById = (id: string) => {
    return state.landmarks.find(landmark => landmark.id === id);
  };

  const getPlacedLandmarks = () => {
    return state.placedCards
      .filter(card => card.type === 'landmark')
      .map(card => ({
        ...card,
        landmark: getLandmarkById(card.id)
      }))
      .filter(item => item.landmark);
  };

  return {
    landmarks: state.landmarks,
    addLandmark,
    updateLandmark,
    deleteLandmark,
    placeLandmark,
    moveLandmark,
    removePlacedLandmark,
    getLandmarkById,
    getPlacedLandmarks
  };
}