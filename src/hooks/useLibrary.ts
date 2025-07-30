import { useDelveMapContext } from '../context/DelveMapContext';
import { Landmark, Delve, Monster } from '../types';

export function useLibrary() {
  const { state, dispatch } = useDelveMapContext();

  const addToLibrary = (type: 'landmark' | 'delve' | 'monster', item: Landmark | Delve | Monster) => {
    dispatch({ type: 'ADD_TO_LIBRARY', payload: { type, item } });
  };

  const updateLibraryItem = (type: 'landmark' | 'delve' | 'monster', id: string, item: Partial<Landmark | Delve | Monster>) => {
    dispatch({ type: 'UPDATE_LIBRARY_ITEM', payload: { type, id, item } });
  };

  const deleteFromLibrary = (type: 'landmark' | 'delve' | 'monster', id: string) => {
    dispatch({ type: 'DELETE_FROM_LIBRARY', payload: { type, id } });
  };

  const addLandmarkToLibrary = (landmark: Landmark) => {
    addToLibrary('landmark', landmark);
  };

  const addDelveToLibrary = (delve: Delve) => {
    addToLibrary('delve', delve);
  };

  const addMonsterToLibrary = (monster: Monster) => {
    addToLibrary('monster', monster);
  };

  const updateLibraryLandmark = (id: string, landmark: Partial<Landmark>) => {
    updateLibraryItem('landmark', id, landmark);
  };

  const updateLibraryDelve = (id: string, delve: Partial<Delve>) => {
    updateLibraryItem('delve', id, delve);
  };

  const updateLibraryMonster = (id: string, monster: Partial<Monster>) => {
    updateLibraryItem('monster', id, monster);
  };

  const deleteLandmarkFromLibrary = (id: string) => {
    deleteFromLibrary('landmark', id);
  };

  const deleteDelveFromLibrary = (id: string) => {
    deleteFromLibrary('delve', id);
  };

  const deleteMonsterFromLibrary = (id: string) => {
    deleteFromLibrary('monster', id);
  };

  const getLibraryLandmarkById = (id: string) => {
    return state.library.landmarks.find(landmark => landmark.id === id);
  };

  const getLibraryDelveById = (id: string) => {
    return state.library.delves.find(delve => delve.id === id);
  };

  const getLibraryMonsterById = (id: string) => {
    return state.library.monsters.find(monster => monster.id === id);
  };

  const copyLandmarkFromLibrary = (libraryLandmark: Landmark) => {
    const newLandmark: Landmark = {
      ...libraryLandmark,
      id: crypto.randomUUID()
    };
    dispatch({ type: 'ADD_LANDMARK', payload: newLandmark });
    return newLandmark;
  };

  const copyDelveFromLibrary = (libraryDelve: Delve) => {
    const newDelve: Delve = {
      ...libraryDelve,
      id: crypto.randomUUID(),
      monsters: libraryDelve.monsters.map(monster => ({
        ...monster,
        id: crypto.randomUUID()
      }))
    };
    dispatch({ type: 'ADD_DELVE', payload: newDelve });
    return newDelve;
  };

  const copyMonsterFromLibrary = (libraryMonster: Monster, delveId: string) => {
    const newMonster: Monster = {
      ...libraryMonster,
      id: crypto.randomUUID()
    };
    dispatch({ type: 'ADD_MONSTER', payload: { delveId, monster: newMonster } });
    return newMonster;
  };

  return {
    library: state.library,
    addToLibrary,
    updateLibraryItem,
    deleteFromLibrary,
    addLandmarkToLibrary,
    addDelveToLibrary,
    addMonsterToLibrary,
    updateLibraryLandmark,
    updateLibraryDelve,
    updateLibraryMonster,
    deleteLandmarkFromLibrary,
    deleteDelveFromLibrary,
    deleteMonsterFromLibrary,
    getLibraryLandmarkById,
    getLibraryDelveById,
    getLibraryMonsterById,
    copyLandmarkFromLibrary,
    copyDelveFromLibrary,
    copyMonsterFromLibrary
  };
}