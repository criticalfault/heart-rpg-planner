import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DelveMapProvider } from '../../context/DelveMapContext';
import { useDelves } from '../useDelves';
import { Delve, Monster } from '../../types';
import { ReactNode } from 'react';

function TestWrapper({ children }: { children: ReactNode }) {
  return <DelveMapProvider>{children}</DelveMapProvider>;
}

describe('useDelves', () => {
  const mockDelve: Delve = {
    id: 'delve-1',
    name: 'Test Delve',
    resistance: 25,
    domains: ['Warren', 'Wild'],
    events: ['Cave-in'],
    resources: ['Iron ore'],
    monsters: []
  };

  const mockMonster: Monster = {
    id: 'monster-1',
    name: 'Test Monster',
    resistance: 15,
    protection: 8,
    attacks: ['Claw'],
    resources: ['Hide'],
    notes: 'Dangerous creature'
  };

  it('should provide initial empty delves array', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    expect(result.current.delves).toHaveLength(0);
  });

  it('should add a delve', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
    });

    expect(result.current.delves).toHaveLength(1);
    expect(result.current.delves[0]).toEqual(mockDelve);
  });

  it('should update a delve', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
    });

    act(() => {
      result.current.updateDelve('delve-1', { resistance: 30 });
    });

    expect(result.current.delves[0].resistance).toBe(30);
    expect(result.current.delves[0].name).toBe('Test Delve');
  });

  it('should delete a delve', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
    });

    expect(result.current.delves).toHaveLength(1);

    act(() => {
      result.current.deleteDelve('delve-1');
    });

    expect(result.current.delves).toHaveLength(0);
  });

  it('should place a delve on the map', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
      result.current.placeDelve('delve-1', { q: 1, r: 1 });
    });

    const placedDelves = result.current.getPlacedDelves();
    expect(placedDelves).toHaveLength(1);
    expect(placedDelves[0].position).toEqual({ q: 1, r: 1 });
    expect(placedDelves[0].delve).toEqual(mockDelve);
  });

  it('should move a placed delve', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
      result.current.placeDelve('delve-1', { q: 1, r: 1 });
    });

    act(() => {
      result.current.moveDelve('delve-1', { q: 2, r: 2 });
    });

    const placedDelves = result.current.getPlacedDelves();
    expect(placedDelves[0].position).toEqual({ q: 2, r: 2 });
  });

  it('should remove a placed delve', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
      result.current.placeDelve('delve-1', { q: 1, r: 1 });
    });

    expect(result.current.getPlacedDelves()).toHaveLength(1);

    act(() => {
      result.current.removePlacedDelve('delve-1');
    });

    expect(result.current.getPlacedDelves()).toHaveLength(0);
  });

  it('should add a monster to a delve', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
    });

    act(() => {
      result.current.addMonster('delve-1', mockMonster);
    });

    expect(result.current.delves[0].monsters).toHaveLength(1);
    expect(result.current.delves[0].monsters[0]).toEqual(mockMonster);
  });

  it('should update a monster in a delve', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
      result.current.addMonster('delve-1', mockMonster);
    });

    act(() => {
      result.current.updateMonster('delve-1', 'monster-1', { resistance: 20 });
    });

    expect(result.current.delves[0].monsters[0].resistance).toBe(20);
    expect(result.current.delves[0].monsters[0].name).toBe('Test Monster');
  });

  it('should delete a monster from a delve', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
      result.current.addMonster('delve-1', mockMonster);
    });

    expect(result.current.delves[0].monsters).toHaveLength(1);

    act(() => {
      result.current.deleteMonster('delve-1', 'monster-1');
    });

    expect(result.current.delves[0].monsters).toHaveLength(0);
  });

  it('should get delve by id', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
    });

    const foundDelve = result.current.getDelveById('delve-1');
    expect(foundDelve).toEqual(mockDelve);

    const notFound = result.current.getDelveById('nonexistent');
    expect(notFound).toBeUndefined();
  });

  it('should get monsters by delve id', () => {
    const { result } = renderHook(() => useDelves(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addDelve(mockDelve);
      result.current.addMonster('delve-1', mockMonster);
    });

    const monsters = result.current.getMonstersByDelveId('delve-1');
    expect(monsters).toHaveLength(1);
    expect(monsters[0]).toEqual(mockMonster);

    const noMonsters = result.current.getMonstersByDelveId('nonexistent');
    expect(noMonsters).toHaveLength(0);
  });
});