import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';
import { DelveMapState } from '../../types';
import * as localStorageUtils from '../../utils/localStorage';

// Mock localStorage utilities
vi.mock('../../utils/localStorage', () => ({
  autoSaveStorage: {
    save: vi.fn(),
    load: vi.fn(),
    clear: vi.fn(),
    hasAutoSave: vi.fn()
  },
  currentMapStorage: {
    save: vi.fn(),
    load: vi.fn(),
    clear: vi.fn()
  },
  mapsStorage: {
    saveMap: vi.fn(),
    load: vi.fn(),
    save: vi.fn(),
    deleteMap: vi.fn(),
    clear: vi.fn()
  }
}));

const mockDelveMapState: DelveMapState = {
  currentMap: {
    id: 'test-map',
    name: 'Test Map',
    landmarks: [],
    delves: [],
    placedCards: [],
    connections: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  landmarks: [
    {
      id: 'landmark-1',
      name: 'Test Landmark',
      domains: ['Cursed' as const],
      defaultStress: 'd6' as const,
      haunts: [],
      bonds: []
    }
  ],
  delves: [],
  placedCards: [
    {
      id: 'landmark-1',
      type: 'landmark',
      position: { q: 0, r: 0 }
    }
  ],
  connections: [],
  selectedCard: null,
  editingCard: null,
  draggedCard: null,
  showConnections: true,
  gridVisible: true,
  library: {
    monsters: [],
    landmarks: [],
    delves: []
  }
};

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useAutoSave(mockDelveMapState));

    expect(result.current.isAutoSaveEnabled).toBe(true);
    expect(typeof result.current.saveNow).toBe('function');
    expect(typeof result.current.hasUnsavedChanges).toBe('function');
  });

  it('should not auto-save when disabled', () => {
    const { result } = renderHook(() => 
      useAutoSave(mockDelveMapState, { enabled: false })
    );

    expect(result.current.isAutoSaveEnabled).toBe(false);
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(localStorageUtils.autoSaveStorage.save).not.toHaveBeenCalled();
  });

  it('should auto-save after debounce period', () => {
    const onSave = vi.fn();
    
    renderHook(() => 
      useAutoSave(mockDelveMapState, { 
        enabled: true, 
        debounceMs: 1000,
        onSave 
      })
    );

    // Fast-forward past debounce period
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(localStorageUtils.autoSaveStorage.save).toHaveBeenCalled();
    expect(localStorageUtils.currentMapStorage.save).toHaveBeenCalled();
    expect(localStorageUtils.mapsStorage.saveMap).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });

  it('should not save if state has not changed', () => {
    const { rerender } = renderHook(
      ({ state }) => useAutoSave(state),
      { initialProps: { state: mockDelveMapState } }
    );

    // Fast-forward past debounce period
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(localStorageUtils.autoSaveStorage.save).toHaveBeenCalledTimes(1);

    // Rerender with same state
    rerender({ state: mockDelveMapState });

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    // Should not save again since state hasn't changed
    expect(localStorageUtils.autoSaveStorage.save).toHaveBeenCalledTimes(1);
  });

  it('should save when state changes', () => {
    const { rerender } = renderHook(
      ({ state }) => useAutoSave(state),
      { initialProps: { state: mockDelveMapState } }
    );

    // Fast-forward past debounce period
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(localStorageUtils.autoSaveStorage.save).toHaveBeenCalledTimes(1);

    // Change state
    const updatedState = {
      ...mockDelveMapState,
      landmarks: [
        ...mockDelveMapState.landmarks,
        {
          id: 'landmark-2',
          name: 'New Landmark',
          domains: ['Haven' as const],
          defaultStress: 'd8' as const,
          haunts: [],
          bonds: []
        }
      ]
    };

    rerender({ state: updatedState });

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    // Should save again since state changed
    expect(localStorageUtils.autoSaveStorage.save).toHaveBeenCalledTimes(2);
  });

  it('should handle save errors gracefully', () => {
    const onError = vi.fn();
    const saveError = new Error('Save failed');
    
    vi.mocked(localStorageUtils.autoSaveStorage.save).mockImplementation(() => {
      throw saveError;
    });

    renderHook(() => 
      useAutoSave(mockDelveMapState, { onError })
    );

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(onError).toHaveBeenCalledWith(saveError);
  });

  it('should provide manual save functionality', () => {
    const { result } = renderHook(() => useAutoSave(mockDelveMapState));

    act(() => {
      result.current.saveNow();
    });

    expect(localStorageUtils.autoSaveStorage.save).toHaveBeenCalled();
    expect(localStorageUtils.currentMapStorage.save).toHaveBeenCalled();
    expect(localStorageUtils.mapsStorage.saveMap).toHaveBeenCalled();
  });

  it('should detect unsaved changes', () => {
    const { result, rerender } = renderHook(
      ({ state }) => useAutoSave(state),
      { initialProps: { state: mockDelveMapState } }
    );

    // Initially should have unsaved changes
    expect(result.current.hasUnsavedChanges()).toBe(true);

    // After auto-save, should not have unsaved changes
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(result.current.hasUnsavedChanges()).toBe(false);

    // After state change, should have unsaved changes again
    const updatedState = {
      ...mockDelveMapState,
      landmarks: [...mockDelveMapState.landmarks, {
        id: 'new-landmark',
        name: 'New',
        domains: ['Haven' as const],
        defaultStress: 'd4' as const,
        haunts: [],
        bonds: []
      }]
    };

    rerender({ state: updatedState });

    expect(result.current.hasUnsavedChanges()).toBe(true);
  });

  it('should not save when currentMap is null', () => {
    const stateWithoutMap = {
      ...mockDelveMapState,
      currentMap: null
    };

    renderHook(() => useAutoSave(stateWithoutMap));

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(localStorageUtils.autoSaveStorage.save).not.toHaveBeenCalled();
  });

  it('should debounce multiple rapid changes', () => {
    const { rerender } = renderHook(
      ({ state }) => useAutoSave(state, { debounceMs: 1000 }),
      { initialProps: { state: mockDelveMapState } }
    );

    // Make multiple rapid changes
    for (let i = 0; i < 5; i++) {
      const updatedState = {
        ...mockDelveMapState,
        landmarks: [{
          ...mockDelveMapState.landmarks[0],
          name: `Updated ${i}`
        }]
      };
      
      rerender({ state: updatedState });
      
      act(() => {
        vi.advanceTimersByTime(500); // Less than debounce time
      });
    }

    // Should not have saved yet
    expect(localStorageUtils.autoSaveStorage.save).not.toHaveBeenCalled();

    // Fast-forward past debounce period
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Should save only once
    expect(localStorageUtils.autoSaveStorage.save).toHaveBeenCalledTimes(1);
  });
});