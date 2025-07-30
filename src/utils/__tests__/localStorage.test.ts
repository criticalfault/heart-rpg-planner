import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  libraryStorage,
  mapsStorage,
  currentMapStorage,
  autoSaveStorage,
  isLocalStorageAvailable,
  exportData,
  importData,
  clearAllData,
  getStorageInfo
} from '../localStorage';
import { Library, DelveMap } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test data
const mockLibrary: Library = {
  monsters: [
    {
      id: 'monster-1',
      name: 'Test Monster',
      resistance: 10,
      protection: 5,
      attacks: ['Bite', 'Claw'],
      resources: ['Bone'],
      notes: 'A test monster'
    }
  ],
  landmarks: [
    {
      id: 'landmark-1',
      name: 'Test Landmark',
      domains: ['Cursed'],
      defaultStress: 'd6',
      haunts: ['Ghost'],
      bonds: ['Ancient']
    }
  ],
  delves: [
    {
      id: 'delve-1',
      name: 'Test Delve',
      resistance: 25,
      domains: ['Warren'],
      events: ['Collapse'],
      resources: ['Stone'],
      monsters: []
    }
  ]
};

const mockDelveMap: DelveMap = {
  id: 'map-1',
  name: 'Test Map',
  landmarks: mockLibrary.landmarks,
  delves: mockLibrary.delves,
  placedCards: [
    {
      id: 'landmark-1',
      type: 'landmark',
      position: { q: 0, r: 0 }
    }
  ],
  connections: [
    {
      id: 'conn-1',
      fromId: 'landmark-1',
      toId: 'delve-1',
      type: 'landmark-to-delve'
    }
  ],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02')
};

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws an error', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage not available');
      });

      expect(isLocalStorageAvailable()).toBe(false);

      localStorage.setItem = originalSetItem;
    });
  });

  describe('libraryStorage', () => {
    it('should save and load library data', () => {
      libraryStorage.save(mockLibrary);
      const loaded = libraryStorage.load();
      
      expect(loaded).toEqual(mockLibrary);
    });

    it('should return empty library when no data exists', () => {
      const loaded = libraryStorage.load();
      
      expect(loaded).toEqual({
        monsters: [],
        landmarks: [],
        delves: []
      });
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('heart-rpg-library', 'invalid json');
      const loaded = libraryStorage.load();
      
      expect(loaded).toEqual({
        monsters: [],
        landmarks: [],
        delves: []
      });
    });

    it('should clear library data', () => {
      libraryStorage.save(mockLibrary);
      libraryStorage.clear();
      const loaded = libraryStorage.load();
      
      expect(loaded).toEqual({
        monsters: [],
        landmarks: [],
        delves: []
      });
    });
  });

  describe('mapsStorage', () => {
    it('should save and load maps array', () => {
      const maps = [mockDelveMap];
      mapsStorage.save(maps);
      const loaded = mapsStorage.load();
      
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe(mockDelveMap.id);
      expect(loaded[0].name).toBe(mockDelveMap.name);
    });

    it('should save individual map', () => {
      mapsStorage.saveMap(mockDelveMap);
      const loaded = mapsStorage.load();
      
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe(mockDelveMap.id);
    });

    it('should update existing map when saving', () => {
      mapsStorage.saveMap(mockDelveMap);
      
      const updatedMap = { ...mockDelveMap, name: 'Updated Map' };
      mapsStorage.saveMap(updatedMap);
      
      const loaded = mapsStorage.load();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('Updated Map');
    });

    it('should delete map', () => {
      mapsStorage.saveMap(mockDelveMap);
      mapsStorage.deleteMap(mockDelveMap.id);
      
      const loaded = mapsStorage.load();
      expect(loaded).toHaveLength(0);
    });

    it('should return empty array when no data exists', () => {
      const loaded = mapsStorage.load();
      expect(loaded).toEqual([]);
    });
  });

  describe('currentMapStorage', () => {
    it('should save and load current map', () => {
      currentMapStorage.save(mockDelveMap);
      const loaded = currentMapStorage.load();
      
      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe(mockDelveMap.id);
    });

    it('should return null when no current map exists', () => {
      const loaded = currentMapStorage.load();
      expect(loaded).toBeNull();
    });

    it('should clear current map', () => {
      currentMapStorage.save(mockDelveMap);
      currentMapStorage.clear();
      const loaded = currentMapStorage.load();
      
      expect(loaded).toBeNull();
    });
  });

  describe('autoSaveStorage', () => {
    it('should save and load auto-save data', () => {
      const autoSaveData = { ...mockDelveMap, lastSaved: new Date().toISOString() };
      autoSaveStorage.save(autoSaveData);
      const loaded = autoSaveStorage.load();
      
      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe(mockDelveMap.id);
      expect(loaded!.lastSaved).toBeDefined();
    });

    it('should detect if auto-save exists', () => {
      expect(autoSaveStorage.hasAutoSave()).toBe(false);
      
      autoSaveStorage.save(mockDelveMap);
      expect(autoSaveStorage.hasAutoSave()).toBe(true);
    });

    it('should clear auto-save data', () => {
      autoSaveStorage.save(mockDelveMap);
      autoSaveStorage.clear();
      
      expect(autoSaveStorage.hasAutoSave()).toBe(false);
    });
  });

  describe('exportData', () => {
    it('should export library as JSON string', () => {
      const exported = exportData.library(mockLibrary);
      const parsed = JSON.parse(exported);
      
      expect(parsed).toEqual(mockLibrary);
    });

    it('should export map as JSON string', () => {
      const exported = exportData.map(mockDelveMap);
      const parsed = JSON.parse(exported);
      
      expect(parsed.id).toBe(mockDelveMap.id);
      expect(parsed.name).toBe(mockDelveMap.name);
    });

    it('should export maps array as JSON string', () => {
      const maps = [mockDelveMap];
      const exported = exportData.allMaps(maps);
      const parsed = JSON.parse(exported);
      
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(mockDelveMap.id);
    });
  });

  describe('importData', () => {
    it('should import library from JSON string', () => {
      const jsonString = JSON.stringify(mockLibrary);
      const imported = importData.library(jsonString);
      
      expect(imported).toEqual(mockLibrary);
    });

    it('should throw error for invalid library JSON', () => {
      expect(() => {
        importData.library('invalid json');
      }).toThrow('Invalid JSON format');
    });

    it('should throw error for invalid library structure', () => {
      const invalidLibrary = { monsters: 'not an array' };
      const jsonString = JSON.stringify(invalidLibrary);
      
      expect(() => {
        importData.library(jsonString);
      }).toThrow('Invalid library format');
    });

    it('should import map from JSON string', () => {
      const jsonString = JSON.stringify(mockDelveMap);
      const imported = importData.map(jsonString);
      
      expect(imported.id).toBe(mockDelveMap.id);
      expect(imported.createdAt).toBeInstanceOf(Date);
    });

    it('should import maps array from JSON string', () => {
      const maps = [mockDelveMap];
      const jsonString = JSON.stringify(maps);
      const imported = importData.maps(jsonString);
      
      expect(imported).toHaveLength(1);
      expect(imported[0].id).toBe(mockDelveMap.id);
    });
  });

  describe('clearAllData', () => {
    it('should clear all application data', () => {
      libraryStorage.save(mockLibrary);
      mapsStorage.saveMap(mockDelveMap);
      currentMapStorage.save(mockDelveMap);
      autoSaveStorage.save(mockDelveMap);
      
      clearAllData();
      
      expect(libraryStorage.load()).toEqual({
        monsters: [],
        landmarks: [],
        delves: []
      });
      expect(mapsStorage.load()).toEqual([]);
      expect(currentMapStorage.load()).toBeNull();
      expect(autoSaveStorage.load()).toBeNull();
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information', () => {
      libraryStorage.save(mockLibrary);
      const info = getStorageInfo();
      
      expect(info.available).toBe(true);
      expect(info.usage).toBeGreaterThan(0);
      expect(info.total).toBeGreaterThan(0);
      expect(info.librarySize).toBeGreaterThan(0);
    });

    it('should handle localStorage unavailable', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage not available');
      });

      const info = getStorageInfo();
      expect(info.available).toBe(false);

      localStorage.getItem = originalGetItem;
    });
  });
});