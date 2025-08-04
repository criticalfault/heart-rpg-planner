import { DelveMapState, DelveMap, Library } from '../types';
import { DelveMapAction } from './DelveMapContext';
import { mapsStorage, currentMapStorage } from '../utils/localStorage';

export function delveMapReducer(state: DelveMapState, action: DelveMapAction): DelveMapState {
  switch (action.type) {
    // Landmark actions
    case 'ADD_LANDMARK':
      const newLandmarks = [...state.landmarks, action.payload];
      return {
        ...state,
        landmarks: newLandmarks,
        currentMap: state.currentMap ? {
          ...state.currentMap,
          landmarks: newLandmarks,
          updatedAt: new Date()
        } : null
      };

    case 'UPDATE_LANDMARK':
      const updatedLandmarks = state.landmarks.map(landmark =>
        landmark.id === action.payload.id
          ? { ...landmark, ...action.payload.landmark }
          : landmark
      );
      return {
        ...state,
        landmarks: updatedLandmarks,
        currentMap: state.currentMap ? {
          ...state.currentMap,
          landmarks: updatedLandmarks,
          updatedAt: new Date()
        } : null
      };

    case 'DELETE_LANDMARK':
      return {
        ...state,
        landmarks: state.landmarks.filter(landmark => landmark.id !== action.payload),
        placedCards: state.placedCards.filter(card => 
          !(card.type === 'landmark' && card.id === action.payload)
        ),
        connections: state.connections.filter(conn => 
          conn.fromId !== action.payload && conn.toId !== action.payload
        )
      };

    // Delve actions
    case 'ADD_DELVE':
      const newDelves = [...state.delves, action.payload];
      return {
        ...state,
        delves: newDelves,
        currentMap: state.currentMap ? {
          ...state.currentMap,
          delves: newDelves,
          updatedAt: new Date()
        } : null
      };

    case 'UPDATE_DELVE':
      const updatedDelves = state.delves.map(delve =>
        delve.id === action.payload.id
          ? { ...delve, ...action.payload.delve }
          : delve
      );
      return {
        ...state,
        delves: updatedDelves,
        currentMap: state.currentMap ? {
          ...state.currentMap,
          delves: updatedDelves,
          updatedAt: new Date()
        } : null
      };

    case 'DELETE_DELVE':
      return {
        ...state,
        delves: state.delves.filter(delve => delve.id !== action.payload),
        placedCards: state.placedCards.filter(card => 
          !(card.type === 'delve' && card.id === action.payload)
        ),
        connections: state.connections.filter(conn => 
          conn.fromId !== action.payload && conn.toId !== action.payload
        )
      };

    // Monster actions
    case 'ADD_MONSTER':
      return {
        ...state,
        delves: state.delves.map(delve =>
          delve.id === action.payload.delveId
            ? { ...delve, monsters: [...delve.monsters, action.payload.monster] }
            : delve
        )
      };

    case 'UPDATE_MONSTER':
      return {
        ...state,
        delves: state.delves.map(delve =>
          delve.id === action.payload.delveId
            ? {
                ...delve,
                monsters: delve.monsters.map(monster =>
                  monster.id === action.payload.monsterId
                    ? { ...monster, ...action.payload.monster }
                    : monster
                )
              }
            : delve
        )
      };

    case 'DELETE_MONSTER':
      return {
        ...state,
        delves: state.delves.map(delve =>
          delve.id === action.payload.delveId
            ? {
                ...delve,
                monsters: delve.monsters.filter(monster => monster.id !== action.payload.monsterId)
              }
            : delve
        )
      };

    // Connection actions
    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [...state.connections, action.payload]
      };

    case 'UPDATE_CONNECTION':
      return {
        ...state,
        connections: state.connections.map(connection =>
          connection.id === action.payload.id
            ? { ...connection, ...action.payload.connection }
            : connection
        )
      };

    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(connection => connection.id !== action.payload)
      };

    // Card positioning actions
    case 'PLACE_CARD':
      const newPlacedCards = [...state.placedCards.filter(card => card.id !== action.payload.id), action.payload];
      return {
        ...state,
        placedCards: newPlacedCards,
        currentMap: state.currentMap ? {
          ...state.currentMap,
          placedCards: newPlacedCards,
          updatedAt: new Date()
        } : null
      };

    case 'MOVE_CARD':
      const movedPlacedCards = state.placedCards.map(card =>
        card.id === action.payload.id
          ? { ...card, position: action.payload.position }
          : card
      );
      return {
        ...state,
        placedCards: movedPlacedCards,
        currentMap: state.currentMap ? {
          ...state.currentMap,
          placedCards: movedPlacedCards,
          updatedAt: new Date()
        } : null
      };

    case 'REMOVE_PLACED_CARD':
      return {
        ...state,
        placedCards: state.placedCards.filter(card => card.id !== action.payload)
      };

    // Drag and drop actions
    case 'SET_DRAGGED_CARD':
      return {
        ...state,
        draggedCard: action.payload
      };

    case 'SET_SELECTED_CARD':
      return {
        ...state,
        selectedCard: action.payload
      };

    case 'SET_EDITING_CARD':
      return {
        ...state,
        editingCard: action.payload
      };

    // UI actions
    case 'TOGGLE_CONNECTIONS':
      return {
        ...state,
        showConnections: action.payload !== undefined ? action.payload : !state.showConnections
      };

    case 'TOGGLE_GRID':
      return {
        ...state,
        gridVisible: action.payload !== undefined ? action.payload : !state.gridVisible
      };

    // Library actions
    case 'ADD_TO_LIBRARY':
      const { type, item } = action.payload;
      return {
        ...state,
        library: {
          ...state.library,
          [type === 'landmark' ? 'landmarks' : type === 'delve' ? 'delves' : 'monsters']: [
            ...state.library[type === 'landmark' ? 'landmarks' : type === 'delve' ? 'delves' : 'monsters'],
            item
          ]
        }
      };

    case 'UPDATE_LIBRARY_ITEM':
      const { type: updateType, id, item: updateItem } = action.payload;
      const libraryKey = updateType === 'landmark' ? 'landmarks' : updateType === 'delve' ? 'delves' : 'monsters';
      return {
        ...state,
        library: {
          ...state.library,
          [libraryKey]: state.library[libraryKey].map((libraryItem: any) =>
            libraryItem.id === id ? { ...libraryItem, ...updateItem } : libraryItem
          )
        }
      };

    case 'DELETE_FROM_LIBRARY':
      const { type: deleteType, id: deleteId } = action.payload;
      if (deleteType === 'landmark') {
        return {
          ...state,
          library: {
            ...state.library,
            landmarks: state.library.landmarks.filter(item => item.id !== deleteId)
          }
        };
      } else if (deleteType === 'delve') {
        return {
          ...state,
          library: {
            ...state.library,
            delves: state.library.delves.filter(item => item.id !== deleteId)
          }
        };
      } else {
        return {
          ...state,
          library: {
            ...state.library,
            monsters: state.library.monsters.filter(item => item.id !== deleteId)
          }
        };
      }

    // Map actions
    case 'LOAD_MAP':
      const map = action.payload;
      return {
        ...state,
        currentMap: map,
        landmarks: map.landmarks,
        delves: map.delves,
        placedCards: map.placedCards,
        connections: map.connections
      };

    case 'CREATE_NEW_MAP':
      const newMap: DelveMap = {
        id: `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: action.payload.name,
        landmarks: [],
        delves: [],
        placedCards: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return {
        ...state,
        currentMap: newMap,
        landmarks: [],
        delves: [],
        placedCards: [],
        connections: []
      };

    case 'CLEAR_MAP':
      // Clear current map from storage
      currentMapStorage.clear();
      return {
        ...state,
        currentMap: null,
        landmarks: [],
        delves: [],
        placedCards: [],
        connections: [],
        selectedCard: null,
        editingCard: null,
        draggedCard: null
      };

    case 'SAVE_MAP':
      if (state.currentMap) {
        const updatedMap: DelveMap = {
          ...state.currentMap,
          name: action.payload?.name || state.currentMap.name,
          landmarks: state.landmarks,
          delves: state.delves,
          placedCards: state.placedCards,
          connections: state.connections,
          updatedAt: new Date()
        };
        
        // Save to storage
        mapsStorage.saveMap(updatedMap);
        currentMapStorage.save(updatedMap);
        
        return {
          ...state,
          currentMap: updatedMap
        };
      }
      return state;

    // Persistence actions
    case 'IMPORT_MAP':
      const importedMap = action.payload;
      // Save imported map to storage
      mapsStorage.saveMap(importedMap);
      currentMapStorage.save(importedMap);
      
      return {
        ...state,
        currentMap: importedMap,
        landmarks: importedMap.landmarks,
        delves: importedMap.delves,
        placedCards: importedMap.placedCards,
        connections: importedMap.connections
      };

    case 'IMPORT_LIBRARY':
      const { library: importedLibrary, merge } = action.payload;
      let finalLibrary: Library;
      
      if (merge) {
        finalLibrary = {
          monsters: [...state.library.monsters, ...importedLibrary.monsters],
          landmarks: [...state.library.landmarks, ...importedLibrary.landmarks],
          delves: [...state.library.delves, ...importedLibrary.delves]
        };
      } else {
        finalLibrary = importedLibrary;
      }
      
      return {
        ...state,
        library: finalLibrary
      };

    case 'RESTORE_FROM_AUTO_SAVE':
      const autoSaveData = action.payload;
      if (state.currentMap && autoSaveData) {
        const restoredMap: DelveMap = {
          ...state.currentMap,
          landmarks: autoSaveData.landmarks || state.landmarks,
          delves: autoSaveData.delves || state.delves,
          placedCards: autoSaveData.placedCards || state.placedCards,
          connections: autoSaveData.connections || state.connections,
          updatedAt: new Date()
        };
        
        return {
          ...state,
          currentMap: restoredMap,
          landmarks: restoredMap.landmarks,
          delves: restoredMap.delves,
          placedCards: restoredMap.placedCards,
          connections: restoredMap.connections
        };
      }
      return state;

    // Error handling actions
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error // Clear error when starting to load
      };

    default:
      return state;
  }
}