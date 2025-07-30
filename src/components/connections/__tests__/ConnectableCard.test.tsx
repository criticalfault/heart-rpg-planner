import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectableCard } from '../ConnectableCard';
import { DelveMapProvider } from '../../../context/DelveMapContext';

// Mock the useConnections hook
vi.mock('../../../hooks/useConnections', () => ({
  useConnections: () => ({
    getConnectionsForCard: vi.fn().mockReturnValue([])
  })
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DelveMapProvider>{children}</DelveMapProvider>
);

describe('ConnectableCard', () => {
  const mockOnConnectionClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children content', () => {
    render(
      <TestWrapper>
        <ConnectableCard cardId="card-1">
          <div>Test Card Content</div>
        </ConnectableCard>
      </TestWrapper>
    );

    expect(screen.getByText('Test Card Content')).toBeInTheDocument();
  });

  it('applies connection mode styling when connectionMode is true', () => {
    render(
      <TestWrapper>
        <ConnectableCard cardId="card-1" connectionMode={true}>
          <div>Test Card</div>
        </ConnectableCard>
      </TestWrapper>
    );

    const card = document.querySelector('.connectable-card');
    expect(card).toHaveClass('connectable-card--connection-mode');
  });

  it('applies selected styling when isSelected is true', () => {
    render(
      <TestWrapper>
        <ConnectableCard cardId="card-1" isSelected={true}>
          <div>Test Card</div>
        </ConnectableCard>
      </TestWrapper>
    );

    const card = document.querySelector('.connectable-card');
    expect(card).toHaveClass('connectable-card--selected');
  });

  it('calls onConnectionClick when card is clicked in connection mode', () => {
    render(
      <TestWrapper>
        <ConnectableCard
          cardId="card-1"
          connectionMode={true}
          onConnectionClick={mockOnConnectionClick}
        >
          <div>Test Card</div>
        </ConnectableCard>
      </TestWrapper>
    );

    const card = document.querySelector('.connectable-card');
    fireEvent.click(card!);

    expect(mockOnConnectionClick).toHaveBeenCalledWith('card-1');
  });

  it('does not call onConnectionClick when not in connection mode', () => {
    render(
      <TestWrapper>
        <ConnectableCard
          cardId="card-1"
          connectionMode={false}
          onConnectionClick={mockOnConnectionClick}
        >
          <div>Test Card</div>
        </ConnectableCard>
      </TestWrapper>
    );

    const card = document.querySelector('.connectable-card');
    fireEvent.click(card!);

    expect(mockOnConnectionClick).not.toHaveBeenCalled();
  });

  it('renders connection points in connection mode', () => {
    render(
      <TestWrapper>
        <ConnectableCard cardId="card-1" connectionMode={true}>
          <div>Test Card</div>
        </ConnectableCard>
      </TestWrapper>
    );

    const connectionPoints = document.querySelectorAll('.connection-point');
    expect(connectionPoints).toHaveLength(4); // top, bottom, left, right
  });

  it('calls onConnectionClick when connection point is clicked', () => {
    render(
      <TestWrapper>
        <ConnectableCard
          cardId="card-1"
          connectionMode={true}
          onConnectionClick={mockOnConnectionClick}
        >
          <div>Test Card</div>
        </ConnectableCard>
      </TestWrapper>
    );

    const connectionPoint = document.querySelector('.connection-point');
    fireEvent.click(connectionPoint!);

    expect(mockOnConnectionClick).toHaveBeenCalledWith('card-1');
  });

  it('stops propagation when connection point is clicked', () => {
    const mockCardClick = vi.fn();
    
    render(
      <TestWrapper>
        <div onClick={mockCardClick}>
          <ConnectableCard
            cardId="card-1"
            connectionMode={true}
            onConnectionClick={mockOnConnectionClick}
          >
            <div>Test Card</div>
          </ConnectableCard>
        </div>
      </TestWrapper>
    );

    const connectionPoint = document.querySelector('.connection-point');
    fireEvent.click(connectionPoint!);

    expect(mockOnConnectionClick).toHaveBeenCalledWith('card-1');
    expect(mockCardClick).not.toHaveBeenCalled();
  });
});