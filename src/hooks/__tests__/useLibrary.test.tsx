import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DelveMapProvider } from '../../context/DelveMapContext';
import { useLibrary } from '../useLibrary';
import { Landmark, Delve, Monster } from '../../types';
import { ReactNode } from 'react';

function TestWrapper({ children }: { children: ReactNode }) {
  return <DelveMapProvider>{children}</DelveMapProvider>;
}

describe('useLibrary', () => {
  const mockLandmark: Landmark = {
    id: 'lib-landmark-1',
    name: 'Library Landmark',
    domains: ['Haven'],
    defaultStress: 'd8',
    haunts: [],
    bonds: []
  };

  const mockDelve: Delve = {
    id: 'lib-delve-1',
    name: 'Library Delve',
    resistance: 20,
    domains: ['Technology'],
    events: [],
    resources: [],
    monsters: []
  };

  const mockMonster: Monster = {
    id: 'lib-monster-1',
    name: 'Library Monster',
    resistance: 10,
    protection: 5,
    attacks: [],
    resources: [],
    notes: ''
  };

  it('should provide initial empty library', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    expect(result.current.library.landmarks).toHaveLength(0);
    expect(result.current.library.delves).toHaveLength(0);
    expect(result.current.library.monsters).toHaveLength(0);
  });

  it('should add landmark to library', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmarkToLibrary(mockLandmark);
    });

    expect(result.current.library.landmarks).toHaveLength(1);
    expect(result.current.library.landmarks[0]).toEqual(mockLandmark);
  });

  it('should add delve to library', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelveToLibrary(mockDelve);
    });

    expect(result.current.library.delves).toHaveLength(1);
    expect(result.current.library.delves[0]).toEqual(mockDelve);
  });

  it('should add monster to library', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addMonsterToLibrary(mockMonster);
    });

    expect(result.current.library.monsters).toHaveLength(1);
    expect(result.current.library.monsters[0]).toEqual(mockMonster);
  });

  it('should update library landmark', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmarkToLibrary(mockLandmark);
    });

    act(() => {
      result.current.updateLibraryLandmark('lib-landmark-1', { name: 'Updated Library Landmark' });
    });

    expect(result.current.library.landmarks[0].name).toBe('Updated Library Landmark');
  });

  it('should update library delve', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelveToLibrary(mockDelve);
    });

    act(() => {
      result.current.updateLibraryDelve('lib-delve-1', { resistance: 25 });
    });

    expect(result.current.library.delves[0].resistance).toBe(25);
  });

  it('should update library monster', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addMonsterToLibrary(mockMonster);
    });

    act(() => {
      result.current.updateLibraryMonster('lib-monster-1', { resistance: 15 });
    });

    expect(result.current.library.monsters[0].resistance).toBe(15);
  });

  it('should delete landmark from library', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmarkToLibrary(mockLandmark);
    });

    expect(result.current.library.landmarks).toHaveLength(1);

    act(() => {
      result.current.deleteLandmarkFromLibrary('lib-landmark-1');
    });

    expect(result.current.library.landmarks).toHaveLength(0);
  });

  it('should delete delve from library', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelveToLibrary(mockDelve);
    });

    expect(result.current.library.delves).toHaveLength(1);

    act(() => {
      result.current.deleteDelveFromLibrary('lib-delve-1');
    });

    expect(result.current.library.delves).toHaveLength(0);
  });

  it('should delete monster from library', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addMonsterToLibrary(mockMonster);
    });

    expect(result.current.library.monsters).toHaveLength(1);

    act(() => {
      result.current.deleteMonsterFromLibrary('lib-monster-1');
    });

    expect(result.current.library.monsters).toHaveLength(0);
  });

  it('should get library items by id', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addLandmarkToLibrary(mockLandmark);
      result.current.addDelveToLibrary(mockDelve);
      result.current.addMonsterToLibrary(mockMonster);
    });

    expect(result.current.getLibraryLandmarkById('lib-landmark-1')).toEqual(mockLandmark);
    expect(result.current.getLibraryDelveById('lib-delve-1')).toEqual(mockDelve);
    expect(result.current.getLibraryMonsterById('lib-monster-1')).toEqual(mockMonster);

    expect(result.current.getLibraryLandmarkById('nonexistent')).toBeUndefined();
    expect(result.current.getLibraryDelveById('nonexistent')).toBeUndefined();
    expect(result.current.getLibraryMonsterById('nonexistent')).toBeUndefined();
  });

  it('should use generic addToLibrary method', () => {
    const { result } = renderHook(() => useLibrary(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addToLibrary('landmark', mockLandmark);
      result.current.addToLibrary('delve', mockDelve);
      result.current.addToLibrary('monster', mockMonster);
    });

    expect(result.current.library.landmarks).toHaveLength(1);
    expect(result.current.library.delves).toHaveLength(1);
    expect(result.current.library.monsters).toHaveLength(1);
  });
});