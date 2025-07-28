import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DelveMapProvider, useDelveMapContext } from '../DelveMapContext';
import { Landmark } from '../../types';
import { ReactNode } from 'react';

// Test wrapper component
function TestWrapper({ children }: { children: ReactNode }) {
  return <DelveMapProvider>{children}</DelveMapProvider>;
}

describe('DelveMapContext', () => {
  it('should provide initial state', () => {
    const { result } = renderHook(() => useDelveMapContext(), {
      wrapper: TestWrapper
    });

    expect(result.current.state.currentMap).toBeNull();
    expect(result.current.state.landmarks).toHaveLength(0);
    expect(result.current.state.delves).toHaveLength(0);
    expect(result.current.state.placedCards).toHaveLength(0);
    expect(result.current.state.connections).toHaveLength(0);
    expect(result.current.state.selectedCard).toBeNull();
    expect(result.current.state.editingCard).toBeNull();
    expect(result.current.state.draggedCard).toBeNull();
    expect(result.current.state.library.landmarks).toHaveLength(0);
    expect(result.current.state.library.delves).toHaveLength(0);
    expect(result.current.state.library.monsters).toHaveLength(0);
  });

  it('should provide dispatch function', () => {
    const { result } = renderHook(() => useDelveMapContext(), {
      wrapper: TestWrapper
    });

    expect(typeof result.current.dispatch).toBe('function');
  });

  it('should update state when dispatching actions', () => {
    const { result } = renderHook(() => useDelveMapContext(), {
      wrapper: TestWrapper
    });

    const mockLandmark: Landmark = {
      id: 'landmark-1',
      name: 'Test Landmark',
      domains: ['Cursed' as const],
      defaultStress: 'd6' as const,
      haunts: [],
      bonds: []
    };

    act(() => {
      result.current.dispatch({
        type: 'ADD_LANDMARK',
        payload: mockLandmark
      });
    });

    expect(result.current.state.landmarks).toHaveLength(1);
    expect(result.current.state.landmarks[0]).toEqual(mockLandmark);
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useDelveMapContext());
    }).toThrow('useDelveMapContext must be used within a DelveMapProvider');

    console.error = originalError;
  });
});