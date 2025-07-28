import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  DelveMapState,
  Landmark,
  Delve,
  Monster,
  Connection,
  PlacedCard,
  HexPosition,
  DelveMap
} from '../types';

// Action Types
export type DelveMapAction =
  // Landmark actions
  | { type: 'ADD_LANDMARK'; payload: Landmark }
  | { type: 'UPDATE_LANDMARK'; payload: { id: string; landmark: Partial<Landmark> } }
  | { type: 'DELETE_LANDMARK'; payload: string }
  
  // Delve actions
  | { type: 'ADD_DELVE'; payload: Delve }
  | { type: 'UPDATE_DELVE'; payload: { id: string; delve: Partial<Delve> } }
  | { type: 'DELETE_DELVE'; payload: string }
  
  // Monster actions
  | { type: 'ADD_MONSTER'; payload: { delveId: string; monster: Monster } }
  | { type: 'UPDATE_MONSTER'; payload: { delveId: string; monsterId: string; monster: Partial<Monster> } }
  | { type: 'DELETE_MONSTER'; payload: { delveId: string; monsterId: string } }
  
  // Connection actions
  | { type: 'ADD_CONNECTION'; payload: Connection }
  | { type: 'UPDATE_CONNECTION'; payload: { id: string; connection: Partial<Connection> } }
  | { type: 'DELETE_CONNECTION'; payload: string }
  
  // Card positioning actions
  | { type: 'PLACE_CARD'; payload: PlacedCard }
  | { type: 'MOVE_CARD'; payload: { id: string; position: HexPosition } }
  | { type: 'REMOVE_PLACED_CARD'; payload: string }
  
  // Drag and drop actions
  | { type: 'SET_DRAGGED_CARD'; payload: string | null }
  | { type: 'SET_SELECTED_CARD'; payload: string | null }
  | { type: 'SET_EDITING_CARD'; payload: string | null }
  
  // Library actions
  | { type: 'ADD_TO_LIBRARY'; payload: { type: 'landmark' | 'delve' | 'monster'; item: Landmark | Delve | Monster } }
  | { type: 'UPDATE_LIBRARY_ITEM'; payload: { type: 'landmark' | 'delve' | 'monster'; id: string; item: Partial<Landmark | Delve | Monster> } }
  | { type: 'DELETE_FROM_LIBRARY'; payload: { type: 'landmark' | 'delve' | 'monster'; id: string } }
  
  // Map actions
  | { type: 'LOAD_MAP'; payload: DelveMap }
  | { type: 'CREATE_NEW_MAP'; payload: { name: string } }
  | { type: 'CLEAR_MAP' };

// Initial state
const initialState: DelveMapState = {
  currentMap: null,
  landmarks: [],
  delves: [],
  placedCards: [],
  connections: [],
  selectedCard: null,
  editingCard: null,
  draggedCard: null,
  library: {
    monsters: [],
    landmarks: [],
    delves: []
  }
};

// Context type
interface DelveMapContextType {
  state: DelveMapState;
  dispatch: React.Dispatch<DelveMapAction>;
}

// Create context
const DelveMapContext = createContext<DelveMapContextType | undefined>(undefined);

// Provider props
interface DelveMapProviderProps {
  children: ReactNode;
}

// Reducer import
import { delveMapReducer } from './delveMapReducer';

// Provider component
export function DelveMapProvider({ children }: DelveMapProviderProps) {
  const [state, dispatch] = useReducer(delveMapReducer, initialState);

  return (
    <DelveMapContext.Provider value={{ state, dispatch }}>
      {children}
    </DelveMapContext.Provider>
  );
}

// Custom hook to use the context
export function useDelveMapContext() {
  const context = useContext(DelveMapContext);
  if (context === undefined) {
    throw new Error('useDelveMapContext must be used within a DelveMapProvider');
  }
  return context;
}

export { DelveMapContext, initialState };
export type { DelveMapContextType, DelveMapProviderProps };