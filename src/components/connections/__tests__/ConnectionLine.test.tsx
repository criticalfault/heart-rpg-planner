import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConnectionLine } from '../ConnectionLine';
import { Connection, PlacedCard } from '../../../types';

describe('ConnectionLine', () => {
  const mockConnection: Connection = {
    id: 'conn-1',
    fromId: 'card-1',
    toId: 'card-2',
    type: 'landmark-to-delve'
  };

  const mockFromCard: PlacedCard = {
    id: 'card-1',
    type: 'landmark',
    position: { q: 0, r: 0 }
  };

  const mockToCard: PlacedCard = {
    id: 'card-2',
    type: 'delve',
    position: { q: 1, r: 0 }
  };

  it('renders connection line between two cards', () => {
    render(
      <svg>
        <ConnectionLine
          connection={mockConnection}
          fromCard={mockFromCard}
          toCard={mockToCard}
        />
      </svg>
    );

    const line = document.querySelector('.connection-line');
    expect(line).toBeInTheDocument();
    expect(line).toHaveClass('connection-line--landmark-to-delve');
  });

  it('does not render when fromCard is missing', () => {
    render(
      <svg>
        <ConnectionLine
          connection={mockConnection}
          fromCard={undefined}
          toCard={mockToCard}
        />
      </svg>
    );

    const line = document.querySelector('.connection-line');
    expect(line).not.toBeInTheDocument();
  });

  it('does not render when toCard is missing', () => {
    render(
      <svg>
        <ConnectionLine
          connection={mockConnection}
          fromCard={mockFromCard}
          toCard={undefined}
        />
      </svg>
    );

    const line = document.querySelector('.connection-line');
    expect(line).not.toBeInTheDocument();
  });

  it('applies selected styling when isSelected is true', () => {
    render(
      <svg>
        <ConnectionLine
          connection={mockConnection}
          fromCard={mockFromCard}
          toCard={mockToCard}
          isSelected={true}
        />
      </svg>
    );

    const line = document.querySelector('.connection-line');
    expect(line).toHaveClass('connection-line--selected');
  });

  it('calls onClick when line is clicked', () => {
    const mockOnClick = vi.fn();
    
    render(
      <svg>
        <ConnectionLine
          connection={mockConnection}
          fromCard={mockFromCard}
          toCard={mockToCard}
          onClick={mockOnClick}
        />
      </svg>
    );

    const line = document.querySelector('.connection-line');
    fireEvent.click(line!);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockConnection);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    
    render(
      <svg>
        <ConnectionLine
          connection={mockConnection}
          fromCard={mockFromCard}
          toCard={mockToCard}
          onDelete={mockOnDelete}
          isSelected={true}
        />
      </svg>
    );

    const deleteButton = document.querySelector('.connection-delete-text');
    fireEvent.click(deleteButton!);
    
    expect(mockOnDelete).toHaveBeenCalledWith('conn-1');
  });

  it('applies correct styling for different connection types', () => {
    const delveToDelveConnection: Connection = {
      ...mockConnection,
      type: 'delve-to-delve'
    };

    render(
      <svg>
        <ConnectionLine
          connection={delveToDelveConnection}
          fromCard={mockFromCard}
          toCard={mockToCard}
        />
      </svg>
    );

    const line = document.querySelector('.connection-line');
    expect(line).toHaveClass('connection-line--delve-to-delve');
  });

  it('applies dashed line for landmark-to-landmark connections', () => {
    const landmarkToLandmarkConnection: Connection = {
      ...mockConnection,
      type: 'landmark-to-landmark'
    };

    render(
      <svg>
        <ConnectionLine
          connection={landmarkToLandmarkConnection}
          fromCard={mockFromCard}
          toCard={mockToCard}
        />
      </svg>
    );

    const line = document.querySelector('.connection-line');
    expect(line).toHaveAttribute('stroke-dasharray', '5,5');
  });

  it('renders arrow marker at the end of the line', () => {
    render(
      <svg>
        <ConnectionLine
          connection={mockConnection}
          fromCard={mockFromCard}
          toCard={mockToCard}
        />
      </svg>
    );

    const arrow = document.querySelector('.connection-arrow');
    expect(arrow).toBeInTheDocument();
  });
});