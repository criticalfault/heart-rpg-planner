import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUI } from '../useUI';
import { DelveMapProvider } from '../../context/DelveMapContext';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DelveMapProvider>{children}</DelveMapProvider>
);

describe('useUI', () => {
  it('returns initial UI state', () => {
    const { result } = renderHook(() => useUI(), {
      wrapper: TestWrapper
    });

    expect(result.current.showConnections).toBe(true);
    expect(result.current.gridVisible).toBe(true);
  });

  it('toggles connections visibility', () => {
    const { result } = renderHook(() => useUI(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.toggleConnections();
    });

    expect(result.current.showConnections).toBe(false);

    act(() => {
      result.current.toggleConnections();
    });

    expect(result.current.showConnections).toBe(true);
  });

  it('sets connections visibility to specific value', () => {
    const { result } = renderHook(() => useUI(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.toggleConnections(false);
    });

    expect(result.current.showConnections).toBe(false);

    act(() => {
      result.current.toggleConnections(true);
    });

    expect(result.current.showConnections).toBe(true);
  });

  it('toggles grid visibility', () => {
    const { result } = renderHook(() => useUI(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.toggleGrid();
    });

    expect(result.current.gridVisible).toBe(false);

    act(() => {
      result.current.toggleGrid();
    });

    expect(result.current.gridVisible).toBe(true);
  });

  it('sets grid visibility to specific value', () => {
    const { result } = renderHook(() => useUI(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.toggleGrid(false);
    });

    expect(result.current.gridVisible).toBe(false);

    act(() => {
      result.current.toggleGrid(true);
    });

    expect(result.current.gridVisible).toBe(true);
  });
});