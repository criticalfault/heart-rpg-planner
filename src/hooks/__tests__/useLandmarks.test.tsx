import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DelveMapProvider } from '../../context/DelveMapContext';
import { useLandmarks } from '../useLandmarks';
import { Landmark } from '../../types';
import { ReactNode } from 'react';

function TestWrapper({ children }: { children: ReactNode }) {
  return <DelveMapProvider>{children}</DelveMapProvider>;
}

describe('useLandmarks', () => {
  const mockLandmark: Landmark = {
    id: 'landmark-1',
    name: 'Test Landmark',
    domains: ['Cursed', 'Desolate'],
    defaultStress: 'd6',
    haunts: ['Ghost'],
    bonds: ['Ancient pact']
  };

  it('should provide initial empty landmarks array', () => {
    const { result } = renderHook(() => useLandmarks(), {
      wrapper: TestWrapper
    });

    expect(result.current.landmarks).toHaveLength(0);
  });

  it('should add a landmark', () => {
    const { result } = renderHook(() => useLandmarks(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmark(mockLandmark);
    });

    expect(result.current.landmarks).toHaveLength(1);
    expect(result.current.landmarks[0]).toEqual(mockLandmark);
  });

  it('should update a landmark', () => {
    const { result } = renderHook(() => useLandmarks(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmark(mockLandmark);
    });

    act(() => {
      result.current.updateLandmark('landmark-1', { name: 'Updated Landmark' });
    });

    expect(result.current.landmarks[0].name).toBe('Updated Landmark');
    expect(result.current.landmarks[0].domains).toEqual(['Cursed', 'Desolate']);
  });

  it('should delete a landmark', () => {
    const { result } = renderHook(() => useLandmarks(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmark(mockLandmark);
    });

    expect(result.current.landmarks).toHaveLength(1);

    act(() => {
      result.current.deleteLandmark('landmark-1');
    });

    expect(result.current.landmarks).toHaveLength(0);
  });

  it('should place a landmark on the map', () => {
    const { result } = renderHook(() => useLandmarks(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmark(mockLandmark);
      result.current.placeLandmark('landmark-1', { q: 0, r: 0 });
    });

    const placedLandmarks = result.current.getPlacedLandmarks();
    expect(placedLandmarks).toHaveLength(1);
    expect(placedLandmarks[0].position).toEqual({ q: 0, r: 0 });
    expect(placedLandmarks[0].landmark).toEqual(mockLandmark);
  });

  it('should move a placed landmark', () => {
    const { result } = renderHook(() => useLandmarks(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmark(mockLandmark);
      result.current.placeLandmark('landmark-1', { q: 0, r: 0 });
    });

    act(() => {
      result.current.moveLandmark('landmark-1', { q: 1, r: 1 });
    });

    const placedLandmarks = result.current.getPlacedLandmarks();
    expect(placedLandmarks[0].position).toEqual({ q: 1, r: 1 });
  });

  it('should remove a placed landmark', () => {
    const { result } = renderHook(() => useLandmarks(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmark(mockLandmark);
      result.current.placeLandmark('landmark-1', { q: 0, r: 0 });
    });

    expect(result.current.getPlacedLandmarks()).toHaveLength(1);

    act(() => {
      result.current.removePlacedLandmark('landmark-1');
    });

    expect(result.current.getPlacedLandmarks()).toHaveLength(0);
  });

  it('should get landmark by id', () => {
    const { result } = renderHook(() => useLandmarks(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmark(mockLandmark);
    });

    const foundLandmark = result.current.getLandmarkById('landmark-1');
    expect(foundLandmark).toEqual(mockLandmark);

    const notFound = result.current.getLandmarkById('nonexistent');
    expect(notFound).toBeUndefined();
  });
});