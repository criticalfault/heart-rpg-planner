import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DelveMapProvider } from '../../../context/DelveMapContext';
import { ConnectionManager } from '../ConnectionManager';
import { ConnectableCard } from '../ConnectableCard';
import { useConnections } from '../../../hooks/useConnections';
import { useUI } from '../../../hooks/useUI';
import { Landmark, Delve, PlacedCard } from '../../../types';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DelveMapProvider>{children}</DelveMapProvider>
);

// Mock components for testing
function TestCard({ cardId, children }: { cardId: string; children: React.ReactNode }) {
  return (
    <ConnectableCard cardId={cardId}>
      <div data-testid={`card-${cardId}`}>{children}</div>
    </ConnectableCard>
  );
}

function TestConnectionSystem() {
  const { connections, createConnection, deleteConnection } = useConnections();
  const { showConnections, toggleConnections } = useUI();

  const landmarks: Landmark[] = [
    {
      id: 'landmark-1',
      name: 'Test Landmark',
      domains: ['Haven'],
      defaultStress: 'd6',
      haunts: [],
      bonds: []
    }
  ];

  const delves: Delve[] = [
    {
      id: 'delve-1',
      name: 'Test Delve',
      resistance: 10,
      domains: ['Cursed'],
      events: [],
      resources: [],
      monsters: []
    }
  ];

  const placedCards: PlacedCard[] = [
    {
      id: 'landmark-1',
      type: 'landmark',
      position: { q: 0, r: 0 }
    },
    {
      id: 'delve-1',
      type: 'delve',
      position: { q: 1, r: 0 }
    }
  ];

  const handleCreateConnection = () => {
    createConnection('landmark-1', 'delve-1', 'landmark-to-delve');
  };

  const handleDeleteConnection = (id: string) => {
    deleteConnection(id);
  };

  return (
    <div>
      <button onClick={handleCreateConnection} data-testid="create-connection">
        Create Connection
      </button>
      
      <div data-testid="connections-count">
        Connections: {connections.length}
      </div>

      <ConnectionManager
        placedCards={placedCards}
        landmarks={landmarks}
        delves={delves}
        showConnections={showConnections}
        onToggleConnections={toggleConnections}
      />

      <TestCard cardId="landmark-1">Landmark Card</TestCard>
      <TestCard cardId="delve-1">Delve Card</TestCard>

      {connections.map(connection => (
        <div key={connection.id} data-testid={`connection-${connection.id}`}>
          Connection: {connection.fromId} → {connection.toId}
          <button 
            onClick={() => handleDeleteConnection(connection.id)}
            data-testid={`delete-${connection.id}`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

describe('Connection System Integration', () => {
  it('creates and manages connections between cards', () => {
    render(
      <TestWrapper>
        <TestConnectionSystem />
      </TestWrapper>
    );

    // Initially no connections
    expect(screen.getByTestId('connections-count')).toHaveTextContent('Connections: 0');

    // Create a connection
    fireEvent.click(screen.getByTestId('create-connection'));

    // Should now have one connection
    expect(screen.getByTestId('connections-count')).toHaveTextContent('Connections: 1');

    // Connection should be displayed
    const connectionElement = screen.getByTestId(/connection-/);
    expect(connectionElement).toHaveTextContent('Connection: landmark-1 → delve-1');

    // Delete the connection
    const deleteButton = screen.getByTestId(/delete-/);
    fireEvent.click(deleteButton);

    // Should be back to no connections
    expect(screen.getByTestId('connections-count')).toHaveTextContent('Connections: 0');
  });

  it('renders connection manager controls', () => {
    render(
      <TestWrapper>
        <TestConnectionSystem />
      </TestWrapper>
    );

    expect(screen.getByTitle('Toggle connection visibility')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle connection creation mode')).toBeInTheDocument();
  });

  it('renders connectable cards', () => {
    render(
      <TestWrapper>
        <TestConnectionSystem />
      </TestWrapper>
    );

    expect(screen.getByTestId('card-landmark-1')).toHaveTextContent('Landmark Card');
    expect(screen.getByTestId('card-delve-1')).toHaveTextContent('Delve Card');
  });

  it('toggles connection visibility', () => {
    render(
      <TestWrapper>
        <TestConnectionSystem />
      </TestWrapper>
    );

    const toggleButton = screen.getByTitle('Toggle connection visibility');
    
    // Should start active (showConnections = true)
    expect(toggleButton).toHaveClass('active');

    // Toggle off
    fireEvent.click(toggleButton);
    expect(toggleButton).not.toHaveClass('active');
  });
});