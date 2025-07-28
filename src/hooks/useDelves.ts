import { useDelveMapContext } from '../context/DelveMapContext';
import { Delve, Monster, PlacedCard, HexPosition } from '../types';

export function useDelves() {
  const { state, dispatch } = useDelveMapContext();

  const addDelve = (delve: Delve) => {
    dispatch({ type: 'ADD_DELVE', payload: delve });
  };

  const updateDelve = (id: string, delve: Partial<Delve>) => {
    dispatch({ type: 'UPDATE_DELVE', payload: { id, delve } });
  };

  const deleteDelve = (id: string) => {
    dispatch({ type: 'DELETE_DELVE', payload: id });
  };

  const placeDelve = (id: string, position: HexPosition) => {
    const placedCard: PlacedCard = {
      id,
      type: 'delve',
      position
    };
    dispatch({ type: 'PLACE_CARD', payload: placedCard });
  };

  const moveDelve = (id: string, position: HexPosition) => {
    dispatch({ type: 'MOVE_CARD', payload: { id, position } });
  };

  const removePlacedDelve = (id: string) => {
    dispatch({ type: 'REMOVE_PLACED_CARD', payload: id });
  };

  const addMonster = (delveId: string, monster: Monster) => {
    dispatch({ type: 'ADD_MONSTER', payload: { delveId, monster } });
  };

  const updateMonster = (delveId: string, monsterId: string, monster: Partial<Monster>) => {
    dispatch({ type: 'UPDATE_MONSTER', payload: { delveId, monsterId, monster } });
  };

  const deleteMonster = (delveId: string, monsterId: string) => {
    dispatch({ type: 'DELETE_MONSTER', payload: { delveId, monsterId } });
  };

  const getDelveById = (id: string) => {
    return state.delves.find(delve => delve.id === id);
  };

  const getPlacedDelves = () => {
    return state.placedCards
      .filter(card => card.type === 'delve')
      .map(card => ({
        ...card,
        delve: getDelveById(card.id)
      }))
      .filter(item => item.delve);
  };

  const getMonstersByDelveId = (delveId: string) => {
    const delve = getDelveById(delveId);
    return delve ? delve.monsters : [];
  };

  return {
    delves: state.delves,
    addDelve,
    updateDelve,
    deleteDelve,
    placeDelve,
    moveDelve,
    removePlacedDelve,
    addMonster,
    updateMonster,
    deleteMonster,
    getDelveById,
    getPlacedDelves,
    getMonstersByDelveId
  };
}