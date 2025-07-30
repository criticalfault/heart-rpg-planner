import { useEffect, useRef, useCallback } from 'react';
import { DelveMapState, DelveMap } from '../types';
import { autoSaveStorage, mapsStorage, currentMapStorage } from '../utils/localStorage';

interface UseAutoSaveOptions {
  enabled?: boolean;
  debounceMs?: number;
  onSave?: (map: DelveMap) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for auto-saving delve map data
 */
export function useAutoSave(
  state: DelveMapState,
  options: UseAutoSaveOptions = {}
) {
  const {
    enabled = true,
    debounceMs = 1000,
    onSave,
    onError
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<string>('');

  // Create a serializable version of the current map state
  const createMapFromState = useCallback((state: DelveMapState): DelveMap | null => {
    if (!state.currentMap) return null;

    return {
      ...state.currentMap,
      landmarks: state.landmarks,
      delves: state.delves,
      placedCards: state.placedCards,
      connections: state.connections,
      updatedAt: new Date()
    };
  }, []);

  // Auto-save function
  const performAutoSave = useCallback((mapData: DelveMap) => {
    try {
      // Save to auto-save storage for recovery
      autoSaveStorage.save(mapData);
      
      // Save to current map storage
      currentMapStorage.save(mapData);
      
      // Save to maps collection if it has an ID
      if (mapData.id) {
        mapsStorage.saveMap(mapData);
      }

      onSave?.(mapData);
    } catch (error) {
      const saveError = error instanceof Error ? error : new Error('Unknown auto-save error');
      console.error('Auto-save failed:', saveError);
      onError?.(saveError);
    }
  }, [onSave, onError]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!enabled) return;

    const currentMap = createMapFromState(state);
    if (!currentMap) return;

    // Create a hash of the current state to avoid unnecessary saves
    const stateHash = JSON.stringify({
      landmarks: state.landmarks,
      delves: state.delves,
      placedCards: state.placedCards,
      connections: state.connections
    });

    // Only save if state has actually changed
    if (stateHash === lastSaveRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      performAutoSave(currentMap);
      lastSaveRef.current = stateHash;
    }, debounceMs);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, enabled, debounceMs, createMapFromState, performAutoSave]);

  // Manual save function
  const saveNow = useCallback(() => {
    const currentMap = createMapFromState(state);
    if (currentMap) {
      performAutoSave(currentMap);
      lastSaveRef.current = JSON.stringify({
        landmarks: state.landmarks,
        delves: state.delves,
        placedCards: state.placedCards,
        connections: state.connections
      });
    }
  }, [state, createMapFromState, performAutoSave]);

  // Check if there's unsaved data
  const hasUnsavedChanges = useCallback(() => {
    const currentStateHash = JSON.stringify({
      landmarks: state.landmarks,
      delves: state.delves,
      placedCards: state.placedCards,
      connections: state.connections
    });
    return currentStateHash !== lastSaveRef.current;
  }, [state]);

  return {
    saveNow,
    hasUnsavedChanges,
    isAutoSaveEnabled: enabled
  };
}