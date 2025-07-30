import { Library, DelveMap } from '../types';

const LIBRARY_STORAGE_KEY = 'heart-rpg-library';
const MAPS_STORAGE_KEY = 'heart-rpg-maps';
const CURRENT_MAP_KEY = 'heart-rpg-current-map';
const AUTO_SAVE_KEY = 'heart-rpg-auto-save';

/**
 * Library localStorage utilities
 */
export const libraryStorage = {
  save: (library: Library): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      if (validateLibrary(library)) {
        localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
      } else {
        console.error('Invalid library data format, not saving');
      }
    } catch (error) {
      console.error('Failed to save library to localStorage:', error);
    }
  },

  load: (): Library => {
    if (!isLocalStorageAvailable()) {
      return { monsters: [], landmarks: [], delves: [] };
    }
    
    try {
      const stored = localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (validateLibrary(parsed)) {
          return parsed;
        } else {
          console.warn('Invalid library data format, returning empty library');
        }
      }
    } catch (error) {
      console.error('Failed to load library from localStorage:', error);
    }
    
    // Return empty library if nothing stored or error occurred
    return {
      monsters: [],
      landmarks: [],
      delves: []
    };
  },

  clear: (): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      localStorage.removeItem(LIBRARY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear library from localStorage:', error);
    }
  }
};

/**
 * Maps localStorage utilities
 */
export const mapsStorage = {
  save: (maps: DelveMap[]): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      // Validate all maps before saving
      const validMaps = maps.filter(map => validateDelveMap(map));
      if (validMaps.length !== maps.length) {
        console.warn(`${maps.length - validMaps.length} invalid maps filtered out during save`);
      }
      localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(validMaps));
    } catch (error) {
      console.error('Failed to save maps to localStorage:', error);
    }
  },

  load: (): DelveMap[] => {
    if (!isLocalStorageAvailable()) return [];
    
    try {
      const stored = localStorage.getItem(MAPS_STORAGE_KEY);
      if (stored) {
        const maps = JSON.parse(stored);
        if (Array.isArray(maps)) {
          // Convert date strings back to Date objects and validate
          return maps
            .filter(map => validateDelveMap(map))
            .map((map: any) => ({
              ...map,
              createdAt: new Date(map.createdAt),
              updatedAt: new Date(map.updatedAt)
            }));
        }
      }
    } catch (error) {
      console.error('Failed to load maps from localStorage:', error);
    }
    
    return [];
  },

  saveMap: (map: DelveMap): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      if (!validateDelveMap(map)) {
        console.error('Invalid map data format, not saving');
        return;
      }
      
      const maps = mapsStorage.load();
      const existingIndex = maps.findIndex(m => m.id === map.id);
      
      const updatedMap = { ...map, updatedAt: new Date() };
      
      if (existingIndex >= 0) {
        maps[existingIndex] = updatedMap;
      } else {
        maps.push(updatedMap);
      }
      
      mapsStorage.save(maps);
      // Also save as current map
      currentMapStorage.save(updatedMap);
    } catch (error) {
      console.error('Failed to save map to localStorage:', error);
    }
  },

  deleteMap: (mapId: string): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      const maps = mapsStorage.load();
      const filteredMaps = maps.filter(m => m.id !== mapId);
      mapsStorage.save(filteredMaps);
      
      // Clear current map if it's the one being deleted
      const currentMap = currentMapStorage.load();
      if (currentMap && currentMap.id === mapId) {
        currentMapStorage.clear();
      }
    } catch (error) {
      console.error('Failed to delete map from localStorage:', error);
    }
  },

  clear: (): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      localStorage.removeItem(MAPS_STORAGE_KEY);
      currentMapStorage.clear();
      autoSaveStorage.clear();
    } catch (error) {
      console.error('Failed to clear maps from localStorage:', error);
    }
  }
};

/**
 * Data validation utilities
 */
const validateLibrary = (data: any): data is Library => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.monsters) &&
    Array.isArray(data.landmarks) &&
    Array.isArray(data.delves)
  );
};

const validateDelveMap = (data: any): data is DelveMap => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    Array.isArray(data.landmarks) &&
    Array.isArray(data.delves) &&
    Array.isArray(data.placedCards) &&
    Array.isArray(data.connections) &&
    data.createdAt &&
    data.updatedAt
  );
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Auto-save utilities for current map state
 */
export const autoSaveStorage = {
  save: (mapData: Partial<DelveMap>): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      const autoSaveData = {
        ...mapData,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSaveData));
    } catch (error) {
      console.error('Failed to auto-save map data:', error);
    }
  },

  load: (): (Partial<DelveMap> & { lastSaved?: string }) | null => {
    if (!isLocalStorageAvailable()) return null;
    
    try {
      const stored = localStorage.getItem(AUTO_SAVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load auto-save data:', error);
    }
    
    return null;
  },

  clear: (): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
    } catch (error) {
      console.error('Failed to clear auto-save data:', error);
    }
  },

  hasAutoSave: (): boolean => {
    return autoSaveStorage.load() !== null;
  }
};

/**
 * Current map persistence utilities
 */
export const currentMapStorage = {
  save: (map: DelveMap): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      localStorage.setItem(CURRENT_MAP_KEY, JSON.stringify(map));
    } catch (error) {
      console.error('Failed to save current map:', error);
    }
  },

  load: (): DelveMap | null => {
    if (!isLocalStorageAvailable()) return null;
    
    try {
      const stored = localStorage.getItem(CURRENT_MAP_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (validateDelveMap(parsed)) {
          return {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt)
          };
        }
      }
    } catch (error) {
      console.error('Failed to load current map:', error);
    }
    
    return null;
  },

  clear: (): void => {
    if (!isLocalStorageAvailable()) return;
    
    try {
      localStorage.removeItem(CURRENT_MAP_KEY);
    } catch (error) {
      console.error('Failed to clear current map:', error);
    }
  }
};

/**
 * Export/Import utilities for sharing data
 */
export const exportData = {
  library: (library: Library): string => {
    return JSON.stringify(library, null, 2);
  },

  map: (map: DelveMap): string => {
    return JSON.stringify(map, null, 2);
  },

  allMaps: (maps: DelveMap[]): string => {
    return JSON.stringify(maps, null, 2);
  }
};

export const importData = {
  library: (jsonString: string): Library => {
    try {
      const parsed = JSON.parse(jsonString);
      if (validateLibrary(parsed)) {
        return parsed;
      }
      throw new Error('Invalid library format - missing required fields or incorrect structure');
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw new Error(`Failed to import library: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  map: (jsonString: string): DelveMap => {
    try {
      const parsed = JSON.parse(jsonString);
      if (validateDelveMap(parsed)) {
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt)
        };
      }
      throw new Error('Invalid map format - missing required fields or incorrect structure');
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw new Error(`Failed to import map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  maps: (jsonString: string): DelveMap[] => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        const validMaps = parsed.filter(map => validateDelveMap(map));
        if (validMaps.length !== parsed.length) {
          console.warn(`${parsed.length - validMaps.length} invalid maps filtered out during import`);
        }
        return validMaps.map((map: any) => ({
          ...map,
          createdAt: new Date(map.createdAt),
          updatedAt: new Date(map.updatedAt)
        }));
      }
      throw new Error('Invalid maps format - expected array');
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw new Error(`Failed to import maps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
/**
 *
 Utility to clear all application data
 */
export const clearAllData = (): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    libraryStorage.clear();
    mapsStorage.clear();
    currentMapStorage.clear();
    autoSaveStorage.clear();
  } catch (error) {
    console.error('Failed to clear all data:', error);
  }
};

/**
 * Utility to get storage usage information
 */
export const getStorageInfo = () => {
  if (!isLocalStorageAvailable()) {
    return { available: false, usage: 0, total: 0 };
  }

  try {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    return {
      available: true,
      usage: totalSize,
      total: 5 * 1024 * 1024, // Typical localStorage limit is 5MB
      librarySize: localStorage.getItem(LIBRARY_STORAGE_KEY)?.length || 0,
      mapsSize: localStorage.getItem(MAPS_STORAGE_KEY)?.length || 0,
      currentMapSize: localStorage.getItem(CURRENT_MAP_KEY)?.length || 0,
      autoSaveSize: localStorage.getItem(AUTO_SAVE_KEY)?.length || 0
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { available: false, usage: 0, total: 0 };
  }
};