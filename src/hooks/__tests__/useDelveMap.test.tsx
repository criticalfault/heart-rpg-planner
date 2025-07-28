import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DelveMapProvider } from '../../context/DelveMapContext';
import { useDelveMap } from '../useDelveMap';
import { ReactNode } from 'react';

function TestWrapper({ children }: { children: ReactNode }) {
  return <DelveMapProvider>{children}</DelveMapProvider>;
}

describe('useDelveMap', () => {
  it('should provide initial values', () => {
    const { result } = renderHook(() => useDelveMap(), {
      wrapper: TestWrapper
    });

    expect(result.current.currentMap).toBeNull();
    expect(result.current.selectedCard).toBeNull();
    expect(result.current.editingCard).toBeNull();
    expect(result.current.draggedCard).toBeNull();
    expect(result.current.placedCards).toHaveLength(0);
    expect(result.current.connections).toHaveLength(0);
  });

  it('should create a new map', () => {
    const { result } = renderHook(() => useDelveMap(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.createNewMap('Test Map');
    });

    expect(result.current.currentMap).toBeDefined();
    expect(result.current.currentMap?.name).toBe('Test Map');
    expect(result.current.currentMap?.id).toBeDefined();
  });

  it('should set selected card', () => {
    const { result } = renderHook(() => useDelveMap(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.setSelectedCard('card-1');
    });

    expect(result.current.selectedCard).toBe('card-1');
  });

  it('should set editing card', () => {
    const { result } = renderHook(() => useDelveMap(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.setEditingCard('card-1');
    });

    expect(result.current.editingCard).toBe('card-1');
  });

  it('should set dragged card', () => {
    const { result } = renderHook(() => useDelveMap(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.setDraggedCard('card-1');
    });

    expect(result.current.draggedCard).toBe('card-1');
  });

  it('should clear map', () => {
    const { result } = renderHook(() => useDelveMap(), {
      wrapper: TestWrapper
    });

    // First create a map
    act(() => {
      result.current.createNewMap('Test Map');
      result.current.setSelectedCard('card-1');
    });

    expect(result.current.currentMap).toBeDefined();
    expect(result.current.selectedCard).toBe('card-1');

    // Then clear it
    act(() => {
      result.current.clearMap();
    });

    expect(result.current.currentMap).toBeNull();
    expect(result.current.selectedCard).toBeNull();
  });

  it('should load a map', () => {
    const { result } = renderHook(() => useDelveMap(), {
      wrapper: TestWrapper
    });

    const mockMap = {
      id: 'map-1',
      name: 'Loaded Map',
      landmarks: [],
      delves: [],
      placedCards: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    act(() => {
      result.current.loadMap(mockMap);
    });

    expect(result.current.currentMap).toEqual(mockMap);
  });
});