import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DelveCard } from '../DelveCard';
import { MonsterForm } from '../MonsterForm';
import { DelveMapProvider } from '../../../context/DelveMapContext';
import { Delve, Monster } from '../../../types';

const mockDelve: Delve = {
  id: 'delve-1',
  name: 'Dark Cavern',
  resistance: 25,
  domains: ['Cursed', 'Desolate'],
  events: ['Cave-in', 'Strange echoes'],
  resources: ['Ancient coins', 'Crystal formations'],
  monsters: [
    {
      id: 'monster-1',
      name: 'Shadow Wraith',
      resistance: 15,
      protection: 8,
      attacks: ['Drain Life', 'Shadow Strike'],
      resources: ['Ectoplasm', 'Shadow Essence'],
      notes: 'A terrifying creature from the depths.'
    },
    {
      id: 'monster-2',
      name: 'Cave Troll',
      resistance: 18,
      protection: 10,
      attacks: ['Boulder Throw', 'Crushing Grip'],
      resources: ['Troll Hide', 'Stone Club'],
      notes: 'Large and aggressive.\nAvoids bright light.'
    }
  ]
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DelveMapProvider>{children}</DelveMapProvider>
);

describe('Monster Integration', () => {
  it('displays monsters within delve card', () => {
    render(
      <TestWrapper>
        <DelveCard delve={mockDelve} />
      </TestWrapper>
    );

    expect(screen.getByText('Monsters (2)')).toBeInTheDocument();
    expect(screen.getByText('Shadow Wraith')).toBeInTheDocument();
    expect(screen.getByText('Cave Troll')).toBeInTheDocument();
    
    // Check monster stats are displayed
    expect(screen.getByText('15')).toBeInTheDocument(); // Shadow Wraith resistance
    expect(screen.getByText('8')).toBeInTheDocument();  // Shadow Wraith protection
    expect(screen.getByText('18')).toBeInTheDocument(); // Cave Troll resistance
    expect(screen.getByText('10')).toBeInTheDocument(); // Cave Troll protection
  });

  it('shows empty state when no monsters exist', () => {
    const delveWithoutMonsters = { ...mockDelve, monsters: [] };
    
    render(
      <TestWrapper>
        <DelveCard delve={delveWithoutMonsters} />
      </TestWrapper>
    );

    expect(screen.getByText('Monsters (0)')).toBeInTheDocument();
    expect(screen.getByText('No monsters added yet')).toBeInTheDocument();
  });

  it('calls onAddMonster when add monster button is clicked', () => {
    const onAddMonster = vi.fn();
    
    render(
      <TestWrapper>
        <DelveCard delve={mockDelve} onAddMonster={onAddMonster} />
      </TestWrapper>
    );

    const addButton = screen.getByRole('button', { name: /add monster/i });
    fireEvent.click(addButton);

    expect(onAddMonster).toHaveBeenCalledWith('delve-1');
  });

  it('calls onEditMonster when edit button is clicked', () => {
    const onEditMonster = vi.fn();
    
    render(
      <TestWrapper>
        <DelveCard delve={mockDelve} onEditMonster={onEditMonster} />
      </TestWrapper>
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]); // Click first monster's edit button

    expect(onEditMonster).toHaveBeenCalledWith('delve-1', 'monster-1');
  });

  it('calls onDeleteMonster when delete button is clicked', () => {
    const onDeleteMonster = vi.fn();
    
    render(
      <TestWrapper>
        <DelveCard delve={mockDelve} onDeleteMonster={onDeleteMonster} />
      </TestWrapper>
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Click first monster's delete button

    expect(onDeleteMonster).toHaveBeenCalledWith('delve-1', 'monster-1');
  });

  it('displays monster attacks and resources', () => {
    render(
      <TestWrapper>
        <DelveCard delve={mockDelve} />
      </TestWrapper>
    );

    // Check Shadow Wraith attacks and resources
    expect(screen.getByText('Drain Life')).toBeInTheDocument();
    expect(screen.getByText('Shadow Strike')).toBeInTheDocument();
    expect(screen.getByText('Ectoplasm')).toBeInTheDocument();
    expect(screen.getByText('Shadow Essence')).toBeInTheDocument();

    // Check Cave Troll attacks and resources
    expect(screen.getByText('Boulder Throw')).toBeInTheDocument();
    expect(screen.getByText('Crushing Grip')).toBeInTheDocument();
    expect(screen.getByText('Troll Hide')).toBeInTheDocument();
    expect(screen.getByText('Stone Club')).toBeInTheDocument();
  });

  it('displays monster notes with line breaks', () => {
    render(
      <TestWrapper>
        <DelveCard delve={mockDelve} />
      </TestWrapper>
    );

    expect(screen.getByText('A terrifying creature from the depths.')).toBeInTheDocument();
    expect(screen.getByText('Large and aggressive.')).toBeInTheDocument();
    expect(screen.getByText('Avoids bright light.')).toBeInTheDocument();
  });

  it('validates monster data when creating new monster', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MonsterForm onSave={onSave} onCancel={onCancel} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /add monster/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Monster name is required')).toBeInTheDocument();
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('creates monster with valid data', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MonsterForm onSave={onSave} onCancel={onCancel} />
      </TestWrapper>
    );

    // Fill in required fields
    await user.type(screen.getByLabelText(/name/i), 'Test Monster');
    await user.clear(screen.getByLabelText(/resistance/i));
    await user.type(screen.getByLabelText(/resistance/i), '12');
    await user.clear(screen.getByLabelText(/protection/i));
    await user.type(screen.getByLabelText(/protection/i), '6');

    // Add an attack
    await user.type(screen.getByPlaceholderText(/enter attack description/i), 'Bite');
    fireEvent.click(screen.getByRole('button', { name: /add attack/i }));

    // Add a resource
    await user.type(screen.getByPlaceholderText(/enter resource/i), 'Fang');
    fireEvent.click(screen.getByRole('button', { name: /add resource/i }));

    // Add notes
    await user.type(screen.getByLabelText(/notes/i), 'A simple test monster');

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Monster',
          resistance: 12,
          protection: 6,
          attacks: ['Bite'],
          resources: ['Fang'],
          notes: 'A simple test monster'
        })
      );
    });
  });

  it('edits existing monster', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    const existingMonster: Monster = {
      id: 'monster-1',
      name: 'Original Name',
      resistance: 10,
      protection: 5,
      attacks: ['Original Attack'],
      resources: ['Original Resource'],
      notes: 'Original notes'
    };

    render(
      <TestWrapper>
        <MonsterForm 
          monster={existingMonster} 
          onSave={onSave} 
          onCancel={onCancel} 
          isEditing={true}
        />
      </TestWrapper>
    );

    // Verify form is populated with existing data
    expect(screen.getByDisplayValue('Original Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original notes')).toBeInTheDocument();

    // Edit the name
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /update monster/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'monster-1',
          name: 'Updated Name',
          resistance: 10,
          protection: 5,
          attacks: ['Original Attack'],
          resources: ['Original Resource'],
          notes: 'Original notes'
        })
      );
    });
  });

  it('validates resistance and protection ranges', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MonsterForm onSave={onSave} onCancel={onCancel} />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/name/i), 'Test Monster');
    
    // Set invalid resistance (too high)
    await user.clear(screen.getByLabelText(/resistance/i));
    await user.type(screen.getByLabelText(/resistance/i), '25');
    
    // Set invalid protection (too high)
    await user.clear(screen.getByLabelText(/protection/i));
    await user.type(screen.getByLabelText(/protection/i), '15');

    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    await waitFor(() => {
      expect(screen.getByText('Resistance must be between 1 and 20')).toBeInTheDocument();
      expect(screen.getByText('Protection must be between 1 and 12')).toBeInTheDocument();
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('handles empty attacks and resources arrays', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <TestWrapper>
        <MonsterForm onSave={onSave} onCancel={onCancel} />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText(/name/i), 'Simple Monster');

    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Simple Monster',
          attacks: [],
          resources: [],
          notes: ''
        })
      );
    });
  });
});