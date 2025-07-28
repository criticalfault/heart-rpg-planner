
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MonsterForm } from '../MonsterForm';
import { Monster } from '../../../types';

const mockMonster: Monster = {
  id: 'monster-1',
  name: 'Shadow Wraith',
  resistance: 15,
  protection: 8,
  attacks: ['Drain Life', 'Shadow Strike'],
  resources: ['Ectoplasm', 'Shadow Essence'],
  notes: 'A terrifying creature from the depths.'
};

describe('MonsterForm', () => {
  it('renders form for creating new monster', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    expect(screen.getByText('Add New Monster')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/resistance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/protection/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/attacks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/resources/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('renders form for editing existing monster', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <MonsterForm 
        monster={mockMonster} 
        onSave={onSave} 
        onCancel={onCancel} 
        isEditing={true}
      />
    );

    expect(screen.getByText('Edit Monster')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Shadow Wraith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A terrifying creature from the depths.')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    const submitButton = screen.getByRole('button', { name: /add monster/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Monster name is required')).toBeInTheDocument();
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('validates resistance range', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    const nameInput = screen.getByLabelText(/name/i);
    const resistanceInput = screen.getByLabelText(/resistance/i);
    const submitButton = screen.getByRole('button', { name: /add monster/i });

    await user.type(nameInput, 'Test Monster');
    await user.clear(resistanceInput);
    await user.type(resistanceInput, '25');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Resistance must be between 1 and 20')).toBeInTheDocument();
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('validates protection range', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    const nameInput = screen.getByLabelText(/name/i);
    const protectionInput = screen.getByLabelText(/protection/i);
    const submitButton = screen.getByRole('button', { name: /add monster/i });

    await user.type(nameInput, 'Test Monster');
    await user.clear(protectionInput);
    await user.type(protectionInput, '15');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Protection must be between 1 and 12')).toBeInTheDocument();
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    const nameInput = screen.getByLabelText(/name/i);
    const resistanceInput = screen.getByLabelText(/resistance/i);
    const protectionInput = screen.getByLabelText(/protection/i);
    const notesInput = screen.getByLabelText(/notes/i);
    const submitButton = screen.getByRole('button', { name: /add monster/i });

    await user.type(nameInput, 'Test Monster');
    await user.clear(resistanceInput);
    await user.type(resistanceInput, '10');
    await user.clear(protectionInput);
    await user.type(protectionInput, '5');
    await user.type(notesInput, 'Test notes');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Monster',
          resistance: 10,
          protection: 5,
          attacks: [],
          resources: [],
          notes: 'Test notes'
        })
      );
    });
  });

  it('handles attacks array editing', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'Test Monster');

    // Add an attack
    const attackInput = screen.getByPlaceholderText(/enter attack description/i);
    const addAttackButton = screen.getByRole('button', { name: /add attack/i });

    await user.type(attackInput, 'Claw Strike');
    fireEvent.click(addAttackButton);

    const submitButton = screen.getByRole('button', { name: /add monster/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          attacks: ['Claw Strike']
        })
      );
    });
  });

  it('handles resources array editing', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'Test Monster');

    // Add a resource
    const resourceInput = screen.getByPlaceholderText(/enter resource/i);
    const addResourceButton = screen.getByRole('button', { name: /add resource/i });

    await user.type(resourceInput, 'Monster Hide');
    fireEvent.click(addResourceButton);

    const submitButton = screen.getByRole('button', { name: /add monster/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: ['Monster Hide']
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('resets form when monster prop changes', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    const { rerender } = render(
      <MonsterForm monster={mockMonster} onSave={onSave} onCancel={onCancel} isEditing={true} />
    );

    expect(screen.getByDisplayValue('Shadow Wraith')).toBeInTheDocument();

    const newMonster: Monster = {
      ...mockMonster,
      id: 'monster-2',
      name: 'Fire Demon',
      resistance: 12,
      protection: 6
    };

    rerender(
      <MonsterForm monster={newMonster} onSave={onSave} onCancel={onCancel} isEditing={true} />
    );

    expect(screen.getByDisplayValue('Fire Demon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    expect(screen.getByDisplayValue('6')).toBeInTheDocument();
  });

  it('clears validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /add monster/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Monster name is required')).toBeInTheDocument();
    });

    // Start typing to clear error
    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'T');

    await waitFor(() => {
      expect(screen.queryByText('Monster name is required')).not.toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    const onSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /add monster/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    await userEvent.type(nameInput, 'Test Monster');
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('applies custom className', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    const { container } = render(
      <MonsterForm onSave={onSave} onCancel={onCancel} className="custom-class" />
    );

    const form = container.querySelector('.monster-form');
    expect(form).toHaveClass('custom-class');
  });

  it('generates unique ID for new monsters', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<MonsterForm onSave={onSave} onCancel={onCancel} />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /add monster/i });

    await userEvent.type(nameInput, 'Test Monster');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String)
        })
      );
    });

    const savedMonster = onSave.mock.calls[0][0];
    expect(savedMonster.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
  });
});