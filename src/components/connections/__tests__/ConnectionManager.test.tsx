import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionManager } from '../ConnectionManager';
import { DelveMapProvider } from '../../../context/DelveMapContext';
import { Landmark, Delve, PlacedCard } from '../../../types';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DelveMapProvider>{children}</DelveMapProvider>
);

describe('ConnectionManager', () => {
  const mockLandmarks: Landmark[] = [
    {
      id: 'landmark-1',
      name: 'Test Landmark',
      domains: ['Haven'],
      defaultStress: 'd6',
      haunts: [],
      bonds: []
    }
  ];

  const mockDelves: Delve[] = [
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

  const mockPlacedCards: PlacedCard[] = [
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

  const mockOnToggleConnections = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders connection controls', () => {
    render(
      <TestWrapper>
        <ConnectionManager
          placedCards={mockPlacedCards}
          landmarks={mockLandmarks}
          delves={mockDelves}
          showConnections={true}
          onToggleConnections={mockOnToggleConnections}
        />
      </TestWrapper>
    );

    expect(screen.getByTitle('Toggle connection visibility')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle connection creation mode')).toBeInTheDocument();
  });

  it('calls onToggleConnections when connection toggle is clicked', () => {
    render(
      <TestWrapper>
        <ConnectionManager
          placedCards={mockPlacedCards}
          landmarks={mockLandmarks}
          delves={mockDelves}
          showConnections={true}
          onToggleConnections={mockOnToggleConnections}
        />
      </TestWrapper>
    );

    const toggleButton = screen.getByTitle('Toggle connection visibility');
    fireEvent.click(toggleButton);

    expect(mockOnToggleConnections).toHaveBeenCalled();
  });

  it('shows active state for connection toggle when showConnections is true', () => {
    render(
      <TestWrapper>
        <ConnectionManager
          placedCards={mockPlacedCards}
          landmarks={mockLandmarks}
          delves={mockDelves}
          showConnections={true}
          onToggleConnections={mockOnToggleConnections}
        />
      </TestWrapper>
    );

    const toggleButton = screen.getByTitle('Toggle connection visibility');
    expect(toggleButton).toHaveClass('active');
  });

  it('enters connection mode when mode toggle is clicked', () => {
    render(
      <TestWrapper>
        <ConnectionManager
          placedCards={mockPlacedCards}
          landmarks={mockLandmarks}
          delves={mockDelves}
          showConnections={true}
          onToggleConnections={mockOnToggleConnections}
        />
      </TestWrapper>
    );

    const modeToggle = screen.getByTitle('Toggle connection creation mode');
    fireEvent.click(modeToggle);

    expect(modeToggle).toHaveClass('active');
    expect(screen.getByTitle('Exit connection mode')).toBeInTheDocument();
    expect(screen.getByText('Click on a card to start creating a connection')).toBeInTheDocument();
  });

  it('shows cancel button in connection mode', () => {
    render(
      <TestWrapper>
        <ConnectionManager
          placedCards={mockPlacedCards}
          landmarks={mockLandmarks}
          delves={mockDelves}
          showConnections={true}
          onToggleConnections={mockOnToggleConnections}
        />
      </TestWrapper>
    );

    const modeToggle = screen.getByTitle('Toggle connection creation mode');
    fireEvent.click(modeToggle);

    const cancelButton = screen.getByTitle('Exit connection mode');
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(screen.queryByTitle('Exit connection mode')).not.toBeInTheDocument();
  });

  it('renders connections overlay when showConnections is true', () => {
    render(
      <TestWrapper>
        <ConnectionManager
          placedCards={mockPlacedCards}
          landmarks={mockLandmarks}
          delves={mockDelves}
          showConnections={true}
          onToggleConnections={mockOnToggleConnections}
        />
      </TestWrapper>
    );

    const overlay = document.querySelector('.connections-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('does not render connections overlay when showConnections is false', () => {
    render(
      <TestWrapper>
        <ConnectionManager
          placedCards={mockPlacedCards}
          landmarks={mockLandmarks}
          delves={mockDelves}
          showConnections={false}
          onToggleConnections={mockOnToggleConnections}
        />
      </TestWrapper>
    );

    const overlay = document.querySelector('.connections-overlay');
    expect(overlay).not.toBeInTheDocument();
  });

  it('renders connection click overlay in connection mode', () => {
    render(
      <TestWrapper>
        <ConnectionManager
          placedCards={mockPlacedCards}
          landmarks={mockLandmarks}
          delves={mockDelves}
          showConnections={true}
          onToggleConnections={mockOnToggleConnections}
        />
      </TestWrapper>
    );

    const modeToggle = screen.getByTitle('Toggle connection creation mode');
    fireEvent.click(modeToggle);

    const clickOverlay = document.querySelector('.connection-click-overlay');
    expect(clickOverlay).toBeInTheDocument();
  });

  it('updates instructions when card is selected in connection mode', () => {
    render(
      <TestWrapper>
        <ConnectionManager
          placedCards={mockPlacedCards}
          landmarks={mockLandmarks}
          delves={mockDelves}
          showConnections={true}
          onToggleConnections={mockOnToggleConnections}
        />
      </TestWrapper>
    );

    const modeToggle = screen.getByTitle('Toggle connection creation mode');
    fireEvent.click(modeToggle);

    expect(screen.getByText('Click on a card to start creating a connection')).toBeInTheDocument();

    // Simulate card selection by clicking on a card target
    const cardTargets = document.querySelectorAll('.connection-card-target');
    fireEvent.click(cardTargets[0]);

    expect(screen.getByText('Click on another card to complete the connection')).toBeInTheDocument();
  });
});