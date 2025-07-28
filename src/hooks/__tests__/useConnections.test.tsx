import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DelveMapProvider } from '../../context/DelveMapContext';
import { useConnections } from '../useConnections';
import { Connection } from '../../types';
import { ReactNode } from 'react';

function TestWrapper({ children }: { children: ReactNode }) {
  return <DelveMapProvider>{children}</DelveMapProvider>;
}

describe('useConnections', () => {
  const mockConnection: Connection = {
    id: 'conn-1',
    fromId: 'landmark-1',
    toId: 'delve-1',
    type: 'landmark-to-delve'
  };

  it('should provide initial empty connections array', () => {
    const { result } = renderHook(() => useConnections(), {
      wrapper: TestWrapper
    });

    expect(result.current.connections).toHaveLength(0);
  });

  it('should add a connection', () => {
    const { result } = renderHook(() => useConnections(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addConnection(mockConnection);
    });

    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0]).toEqual(mockConnection);
  });

  it('should update a connection', () => {
    const { result } = renderHook(() => useConnections(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addConnection(mockConnection);
    });

    act(() => {
      result.current.updateConnection('conn-1', { type: 'delve-to-delve' });
    });

    expect(result.current.connections[0].type).toBe('delve-to-delve');
    expect(result.current.connections[0].fromId).toBe('landmark-1');
  });

  it('should delete a connection', () => {
    const { result } = renderHook(() => useConnections(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addConnection(mockConnection);
    });

    expect(result.current.connections).toHaveLength(1);

    act(() => {
      result.current.deleteConnection('conn-1');
    });

    expect(result.current.connections).toHaveLength(0);
  });

  it('should get connection by id', () => {
    const { result } = renderHook(() => useConnections(), {
      wrapper: TestWrapper
    });

    act(() => {
      result.current.addConnection(mockConnection);
    });

    const foundConnection = result.current.getConnectionById('conn-1');
    expect(foundConnection).toEqual(mockConnection);

    const notFound = result.current.getConnectionById('nonexistent');
    expect(notFound).toBeUndefined();
  });

  it('should get connections for a card', () => {
    const { result } = renderHook(() => useConnections(), {
      wrapper: TestWrapper
    });

    const connection2: Connection = {
      id: 'conn-2',
      fromId: 'delve-1',
      toId: 'delve-2',
      type: 'delve-to-delve'
    };

    act(() => {
      result.current.addConnection(mockConnection);
      result.current.addConnection(connection2);
    });

    const connectionsForDelve1 = result.current.getConnectionsForCard('delve-1');
    expect(connectionsForDelve1).toHaveLength(2);

    const connectionsForLandmark1 = result.current.getConnectionsForCard('landmark-1');
    expect(connectionsForLandmark1).toHaveLength(1);
    expect(connectionsForLandmark1[0]).toEqual(mockConnection);

    const connectionsForNonexistent = result.current.getConnectionsForCard('nonexistent');
    expect(connectionsForNonexistent).toHaveLength(0);
  });

  it('should create a connection with generated id', () => {
    const { result } = renderHook(() => useConnections(), {
      wrapper: TestWrapper
    });

    let createdConnection: Connection;

    act(() => {
      createdConnection = result.current.createConnection('landmark-1', 'delve-1', 'landmark-to-delve');
    });

    expect(result.current.connections).toHaveLength(1);
    expect(createdConnection!.fromId).toBe('landmark-1');
    expect(createdConnection!.toId).toBe('delve-1');
    expect(createdConnection!.type).toBe('landmark-to-delve');
    expect(createdConnection!.id).toBeDefined();
  });

  it('should delete connections between two cards', () => {
    const { result } = renderHook(() => useConnections(), {
      wrapper: TestWrapper
    });

    const connection2: Connection = {
      id: 'conn-2',
      fromId: 'delve-1',
      toId: 'landmark-1',
      type: 'delve-to-delve'
    };

    const connection3: Connection = {
      id: 'conn-3',
      fromId: 'delve-1',
      toId: 'delve-2',
      type: 'delve-to-delve'
    };

    act(() => {
      result.current.addConnection(mockConnection);
      result.current.addConnection(connection2);
      result.current.addConnection(connection3);
    });

    expect(result.current.connections).toHaveLength(3);

    act(() => {
      result.current.deleteConnectionsBetween('landmark-1', 'delve-1');
    });

    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0]).toEqual(connection3);
  });
});