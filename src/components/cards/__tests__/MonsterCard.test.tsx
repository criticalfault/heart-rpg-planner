
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MonsterCard } from '../MonsterCard';
import { Monster } from '../../../types';

const mockMonster: Monster = {
  id: 'monster-1',
  name: 'Shadow Wraith',
  resistance: 15,
  protection: 8,
  attacks: ['Drain Life', 'Shadow Strike'],
  resources: ['Ectoplasm', 'Shadow Essence'],
  notes: 'A terrifying creature from the depths.\nAvoids bright light.'
};

describe('MonsterCard', () => {
  it('renders monster information correctly', () => {
    render(<MonsterCard monster={mockMonster} />);

    expect(screen.getByText('Shadow Wraith')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Drain Life')).toBeInTheDocument();
    expect(screen.getByText('Shadow Strike')).toBeInTheDocument();
    expect(screen.getByText('Ectoplasm')).toBeInTheDocument();
    expect(screen.getByText('Shadow Essence')).toBeInTheDocument();
  });

  it('displays multi-line notes correctly', () => {
    render(<MonsterCard monster={mockMonster} />);

    const notesSection = screen.getByText('A terrifying creature from the depths.');
    expect(notesSection).toBeInTheDocument();
    
    const secondLine = screen.getByText('Avoids bright light.');
    expect(secondLine).toBeInTheDocument();
  });

  it('handles empty attacks array', () => {
    const monsterWithoutAttacks = { ...mockMonster, attacks: [] };
    render(<MonsterCard monster={monsterWithoutAttacks} />);

    expect(screen.queryByText('Attacks:')).not.toBeInTheDocument();
  });

  it('handles empty resources array', () => {
    const monsterWithoutResources = { ...mockMonster, resources: [] };
    render(<MonsterCard monster={monsterWithoutResources} />);

    expect(screen.queryByText('Resources:')).not.toBeInTheDocument();
  });

  it('handles empty notes', () => {
    const monsterWithoutNotes = { ...mockMonster, notes: '' };
    render(<MonsterCard monster={monsterWithoutNotes} />);

    expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<MonsterCard monster={mockMonster} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit shadow wraith/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<MonsterCard monster={mockMonster} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete shadow wraith/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('calls onSaveToLibrary when save to library button is clicked', () => {
    const onSaveToLibrary = vi.fn();
    render(<MonsterCard monster={mockMonster} onSaveToLibrary={onSaveToLibrary} />);

    const saveButton = screen.getByRole('button', { name: /save shadow wraith to library/i });
    fireEvent.click(saveButton);

    expect(onSaveToLibrary).toHaveBeenCalledWith(mockMonster);
  });

  it('does not render action buttons when handlers are not provided', () => {
    render(<MonsterCard monster={mockMonster} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MonsterCard monster={mockMonster} className="custom-class" />
    );

    const card = container.querySelector('.monster-card');
    expect(card).toHaveClass('custom-class');
  });

  it('displays resistance and protection stats with correct labels', () => {
    render(<MonsterCard monster={mockMonster} />);

    expect(screen.getByText('Resistance:')).toBeInTheDocument();
    expect(screen.getByText('Protection:')).toBeInTheDocument();
  });

  it('renders attacks and resources as lists', () => {
    render(<MonsterCard monster={mockMonster} />);

    const attacksList = screen.getByText('Drain Life').closest('ul');
    const resourcesList = screen.getByText('Ectoplasm').closest('ul');

    expect(attacksList).toBeInTheDocument();
    expect(resourcesList).toBeInTheDocument();
  });

  it('handles monster with single attack and resource', () => {
    const simpleMonster: Monster = {
      ...mockMonster,
      attacks: ['Bite'],
      resources: ['Tooth']
    };

    render(<MonsterCard monster={simpleMonster} />);

    expect(screen.getByText('Bite')).toBeInTheDocument();
    expect(screen.getByText('Tooth')).toBeInTheDocument();
  });

  it('preserves line breaks in notes', () => {
    const monsterWithMultilineNotes: Monster = {
      ...mockMonster,
      notes: 'Line 1\nLine 2\n\nLine 4'
    };

    render(<MonsterCard monster={monsterWithMultilineNotes} />);

    // Check that the notes container exists
    const notesContainer = screen.getByText('Line 1').parentElement;
    expect(notesContainer).toHaveClass('monster-card-notes');
  });
});