import { DelveMapState, DelveMap } from '../types';
import { DelveMapAction } from './DelveMapContext';

export function delveMapReducer(state: DelveMapState, action: DelveMapAction): DelveMapState {
  switch (action.type) {
    // Landmark actions
    case 'ADD_LANDMARK':
      return {
        ...state,
        landmarks: [...state.landmarks, action.payload]
      };

    case 'UPDATE_LANDMARK':
      return {
        ...state,
        landmarks: state.landmarks.map(landmark =>
          landmark.id === action.payload.id
            ? { ...landmark, ...action.payload.landmark }
            : landmark
        )
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
      return {
        ...state,
        delves: [...state.delves, action.payload]
      };

    case 'UPDATE_DELVE':
      return {
        ...state,
        delves: state.delves.map(delve =>
          delve.id === action.payload.id
            ? { ...delve, ...action.payload.delve }
            : delve
        )
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
      return {
        ...state,
        placedCards: [...state.placedCards.filter(card => card.id !== action.payload.id), action.payload]
      };

    case 'MOVE_CARD':
      return {
        ...state,
        placedCards: state.placedCards.map(card =>
          card.id === action.payload.id
            ? { ...card, position: action.payload.position }
            : card
        )
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
        id: crypto.randomUUID(),
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

    default:
      return state;
  }
}