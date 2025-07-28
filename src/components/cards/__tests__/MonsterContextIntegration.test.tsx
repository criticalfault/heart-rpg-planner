import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DelveMapProvider, useDelveMapContext } from '../../../context/DelveMapContext';
import { MonsterForm } from '../MonsterForm';
import { Monster, Delve } from '../../../types';

// Test component that uses the context
const TestMonsterManager: React.FC = () => {
  const { state, dispatch } = useDelveMapContext();
  
  const testDelve: Delve = {
    id: 'test-delve',
    name: 'Test Delve',
    resistance: 20,
    domains: ['Cursed'],
    events: [],
    resources: [],
    monsters: []
  };

  const handleAddMonster = (monster: Monster) => {
    dispatch({
      type: 'ADD_MONSTER',
      payload: { delveId: testDelve.id, monster }
    });
  };

  const handleUpdateMonster = (monsterId: string, monster: Partial<Monster>) => {
    dispatch({
      type: 'UPDATE_MONSTER',
      payload: { delveId: testDelve.id, monsterId, monster }
    });
  };

  const handleDeleteMonster = (monsterId: string) => {
    dispatch({
      type: 'DELETE_MONSTER',
      payload: { delveId: testDelve.id, monsterId }
    });
  };

  return (
    <div>
      <div data-testid="monster-count">
        Monsters: {state.delves.find(d => d.id === testDelve.id)?.monsters.length || 0}
      </div>
      <MonsterForm
        onSave={handleAddMonster}
        onCancel={() => {}}
      />
      <div data-testid="actions">
        <button onClick={() => handleUpdateMonster('monster-1', { name: 'Updated Monster' })}>
          Update Monster
        </button>
        <button onClick={() => handleDeleteMonster('monster-1')}>
          Delete Monster
        </button>
      </div>
    </div>
  );
};

describe('Monster Context Integration', () => {
  it('adds monster to delve through context', async () => {
    const user = userEvent.setup();
    
    render(
      <DelveMapProvider>
        <TestMonsterManager />
      </DelveMapProvider>
    );

    // Initially no monsters
    expect(screen.getByTestId('monster-count')).toHaveTextContent('Monsters: 0');

    // Fill out monster form
    await user.type(screen.getByLabelText(/name/i), 'Test Monster');
    await user.clear(screen.getByLabelText(/resistance/i));
    await user.type(screen.getByLabelText(/resistance/i), '15');
    await user.clear(screen.getByLabelText(/protection/i));
    await user.type(screen.getByLabelText(/protection/i), '8');

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    // Wait for monster to be added
    await waitFor(() => {
      expect(screen.getByTestId('monster-count')).toHaveTextContent('Monsters: 1');
    });
  });

  it('validates monster data before adding to context', async () => {
    // const user = userEvent.setup();
    
    render(
      <DelveMapProvider>
        <TestMonsterManager />
      </DelveMapProvider>
    );

    // Try to submit without name
    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    await waitFor(() => {
      expect(screen.getByText('Monster name is required')).toBeInTheDocument();
    });

    // Monster count should still be 0
    expect(screen.getByTestId('monster-count')).toHaveTextContent('Monsters: 0');
  });

  it('validates resistance range', async () => {
    const user = userEvent.setup();
    
    render(
      <DelveMapProvider>
        <TestMonsterManager />
      </DelveMapProvider>
    );

    await user.type(screen.getByLabelText(/name/i), 'Test Monster');
    await user.clear(screen.getByLabelText(/resistance/i));
    await user.type(screen.getByLabelText(/resistance/i), '25'); // Invalid: too high

    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    await waitFor(() => {
      expect(screen.getByText('Resistance must be between 1 and 20')).toBeInTheDocument();
    });

    expect(screen.getByTestId('monster-count')).toHaveTextContent('Monsters: 0');
  });

  it('validates protection range', async () => {
    const user = userEvent.setup();
    
    render(
      <DelveMapProvider>
        <TestMonsterManager />
      </DelveMapProvider>
    );

    await user.type(screen.getByLabelText(/name/i), 'Test Monster');
    await user.clear(screen.getByLabelText(/protection/i));
    await user.type(screen.getByLabelText(/protection/i), '15'); // Invalid: too high

    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    await waitFor(() => {
      expect(screen.getByText('Protection must be between 1 and 12')).toBeInTheDocument();
    });

    expect(screen.getByTestId('monster-count')).toHaveTextContent('Monsters: 0');
  });

  it('handles attacks and resources arrays', async () => {
    const user = userEvent.setup();
    
    render(
      <DelveMapProvider>
        <TestMonsterManager />
      </DelveMapProvider>
    );

    await user.type(screen.getByLabelText(/name/i), 'Test Monster');

    // Add an attack
    await user.type(screen.getByPlaceholderText(/enter attack description/i), 'Claw Strike');
    fireEvent.click(screen.getByRole('button', { name: /add attack/i }));

    // Add a resource
    await user.type(screen.getByPlaceholderText(/enter resource/i), 'Monster Hide');
    fireEvent.click(screen.getByRole('button', { name: /add resource/i }));

    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    await waitFor(() => {
      expect(screen.getByTestId('monster-count')).toHaveTextContent('Monsters: 1');
    });
  });

  it('handles multi-line notes', async () => {
    const user = userEvent.setup();
    
    render(
      <DelveMapProvider>
        <TestMonsterManager />
      </DelveMapProvider>
    );

    await user.type(screen.getByLabelText(/name/i), 'Test Monster');
    await user.type(screen.getByLabelText(/notes/i), 'Line 1\nLine 2\n\nLine 4');

    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    await waitFor(() => {
      expect(screen.getByTestId('monster-count')).toHaveTextContent('Monsters: 1');
    });
  });

  it('generates unique IDs for monsters', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    
    render(
      <DelveMapProvider>
        <MonsterForm onSave={onSave} onCancel={() => {}} />
      </DelveMapProvider>
    );

    await user.type(screen.getByLabelText(/name/i), 'Test Monster');
    fireEvent.click(screen.getByRole('button', { name: /add monster/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f-]{36}$/) // UUID format
        })
      );
    });
  });
});