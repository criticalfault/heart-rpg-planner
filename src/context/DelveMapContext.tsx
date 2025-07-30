import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import {
  DelveMapState,
  Landmark,
  Delve,
  Monster,
  Connection,
  PlacedCard,
  HexPosition,
  DelveMap,
  Library
} from '../types';
import { libraryStorage, currentMapStorage, autoSaveStorage } from '../utils/localStorage';
import { useAutoSave } from '../hooks/useAutoSave';

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
  
  // UI actions
  | { type: 'TOGGLE_CONNECTIONS'; payload?: boolean }
  | { type: 'TOGGLE_GRID'; payload?: boolean }
  
  // Library actions
  | { type: 'ADD_TO_LIBRARY'; payload: { type: 'landmark' | 'delve' | 'monster'; item: Landmark | Delve | Monster } }
  | { type: 'UPDATE_LIBRARY_ITEM'; payload: { type: 'landmark' | 'delve' | 'monster'; id: string; item: Partial<Landmark | Delve | Monster> } }
  | { type: 'DELETE_FROM_LIBRARY'; payload: { type: 'landmark' | 'delve' | 'monster'; id: string } }
  
  // Map actions
  | { type: 'LOAD_MAP'; payload: DelveMap }
  | { type: 'CREATE_NEW_MAP'; payload: { name: string } }
  | { type: 'CLEAR_MAP' }
  | { type: 'SAVE_MAP'; payload?: { name?: string } }
  
  // Persistence actions
  | { type: 'IMPORT_MAP'; payload: DelveMap }
  | { type: 'IMPORT_LIBRARY'; payload: { library: Library; merge: boolean } }
  | { type: 'RESTORE_FROM_AUTO_SAVE'; payload: Partial<DelveMap> }
  
  // Error handling actions
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state - library and current map will be loaded from localStorage
const createInitialState = (): DelveMapState => {
  const library = libraryStorage.load();
  const currentMap = currentMapStorage.load();
  
  if (currentMap) {
    return {
      currentMap,
      landmarks: currentMap.landmarks,
      delves: currentMap.delves,
      placedCards: currentMap.placedCards,
      connections: currentMap.connections,
      selectedCard: null,
      editingCard: null,
      draggedCard: null,
      showConnections: true,
      gridVisible: true,
      library,
      error: null,
      loading: false
    };
  }
  
  return {
    currentMap: null,
    landmarks: [],
    delves: [],
    placedCards: [],
    connections: [],
    selectedCard: null,
    editingCard: null,
    draggedCard: null,
    showConnections: true,
    gridVisible: true,
    library,
    error: null,
    loading: false
  };
};

// Context type
interface DelveMapContextType {
  state: DelveMapState;
  dispatch: React.Dispatch<DelveMapAction>;
  autoSave: {
    saveNow: () => void;
    hasUnsavedChanges: () => boolean;
    isAutoSaveEnabled: boolean;
  };
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
  const [state, dispatch] = useReducer(delveMapReducer, createInitialState());

  // Auto-save functionality
  const autoSave = useAutoSave(state, {
    enabled: true,
    debounceMs: 1000,
    onSave: (map) => {
      console.log('Auto-saved map:', map.name);
    },
    onError: (error) => {
      console.error('Auto-save error:', error);
    }
  });

  // Save library to localStorage whenever it changes
  useEffect(() => {
    libraryStorage.save(state.library);
  }, [state.library]);

  // Check for auto-save data on mount and offer recovery
  useEffect(() => {
    const autoSaveData = autoSaveStorage.load();
    if (autoSaveData && autoSaveData.lastSaved) {
      const lastSaved = new Date(autoSaveData.lastSaved);
      const now = new Date();
      const timeDiff = now.getTime() - lastSaved.getTime();
      
      // If auto-save is less than 5 minutes old, it might be worth recovering
      if (timeDiff < 5 * 60 * 1000) {
        console.log('Auto-save data found from', lastSaved.toLocaleString());
        // In a real app, you might want to show a recovery dialog here
      }
    }
  }, []);

  return (
    <DelveMapContext.Provider value={{ state, dispatch, autoSave }}>
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

export { DelveMapContext, createInitialState };
export type { DelveMapContextType, DelveMapProviderProps };