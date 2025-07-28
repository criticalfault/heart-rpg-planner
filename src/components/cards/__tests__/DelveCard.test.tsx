import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DelveCard } from '../DelveCard';
import { Delve } from '../../../types';

// Mock the CSS import
vi.mock('../DelveCard.css', () => ({}));

const mockDelve: Delve = {
  id: 'delve-1',
  name: 'Test Delve',
  resistance: 25,
  domains: ['Cursed', 'Desolate'],
  events: ['Strange noises', 'Flickering lights'],
  resources: ['Ancient coins', 'Mysterious artifacts'],
  monsters: [
    {
      id: 'monster-1',
      name: 'Shadow Beast',
      resistance: 15,
      protection: 8,
      attacks: ['Claw swipe', 'Shadow bolt'],
      resources: ['Shadow essence'],
      notes: 'Lurks in dark corners'
    }
  ]
};

const mockEmptyDelve: Delve = {
  id: 'delve-2',
  name: 'Empty Delve',
  resistance: 10,
  domains: ['Haven'],
  events: [],
  resources: [],
  monsters: []
};

describe('DelveCard', () => {
  it('renders delve information correctly', () => {
    render(<DelveCard delve={mockDelve} />);

    expect(screen.getByText('Test Delve')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Cursed')).toBeInTheDocument();
    expect(screen.getByText('Desolate')).toBeInTheDocument();
    expect(screen.getByText('Strange noises')).toBeInTheDocument();
    expect(screen.getByText('Flickering lights')).toBeInTheDocument();
    expect(screen.getByText('Ancient coins')).toBeInTheDocument();
    expect(screen.getByText('Mysterious artifacts')).toBeInTheDocument();
  });

  it('displays monster information correctly', () => {
    render(<DelveCard delve={mockDelve} />);

    expect(screen.getByText('Monsters (1)')).toBeInTheDocument();
    expect(screen.getByText('Shadow Beast')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // resistance
    expect(screen.getByText('8')).toBeInTheDocument(); // protection
    expect(screen.getByText('Claw swipe')).toBeInTheDocument();
    expect(screen.getByText('Shadow bolt')).toBeInTheDocument();
    expect(screen.getByText('Shadow essence')).toBeInTheDocument();
    expect(screen.getByText('Lurks in dark corners')).toBeInTheDocument();
  });

  it('shows empty state when no monsters exist', () => {
    render(<DelveCard delve={mockEmptyDelve} />);

    expect(screen.getByText('Monsters (0)')).toBeInTheDocument();
    expect(screen.getByText('No monsters added yet')).toBeInTheDocument();
  });

  it('hides empty sections when arrays are empty', () => {
    render(<DelveCard delve={mockEmptyDelve} />);

    expect(screen.queryByText('Events:')).not.toBeInTheDocument();
    expect(screen.queryByText('Resources:')).not.toBeInTheDocument();
  });

  it('calls onUpdate when edit is saved', async () => {
    const mockOnUpdate = vi.fn();
    const mockOnEditToggle = vi.fn();

    render(
      <DelveCard
        delve={mockDelve}
        onUpdate={mockOnUpdate}
        onEditToggle={mockOnEditToggle}
        isEditing={false}
      />
    );

    // Start editing
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEditToggle).toHaveBeenCalledWith(true);

    // Re-render in editing mode
    render(
      <DelveCard
        delve={mockDelve}
        onUpdate={mockOnUpdate}
        onEditToggle={mockOnEditToggle}
        isEditing={true}
      />
    );

    // Modify the name
    const nameInput = screen.getByDisplayValue('Test Delve');
    fireEvent.change(nameInput, { target: { value: 'Updated Delve' } });

    // Save changes
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Delve'
        })
      );
      expect(mockOnEditToggle).toHaveBeenCalledWith(false);
    });
  });

  it('validates resistance input range', async () => {
    const mockOnEditToggle = vi.fn();

    render(
      <DelveCard
        delve={mockDelve}
        onEditToggle={mockOnEditToggle}
        isEditing={true}
      />
    );

    // Set invalid resistance (too high)
    const resistanceInput = screen.getByDisplayValue('25');
    fireEvent.change(resistanceInput, { target: { value: '100' } });

    // Try to save
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Delve resistance must be between 1 and 50')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const mockOnEditToggle = vi.fn();

    render(
      <DelveCard
        delve={mockDelve}
        onEditToggle={mockOnEditToggle}
        isEditing={true}
      />
    );

    // Clear required fields
    const nameInput = screen.getByDisplayValue('Test Delve');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Try to save
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Delve name is required')).toBeInTheDocument();
    });
  });

  it('cancels editing without saving changes', () => {
    const mockOnUpdate = vi.fn();
    const mockOnEditToggle = vi.fn();

    render(
      <DelveCard
        delve={mockDelve}
        onUpdate={mockOnUpdate}
        onEditToggle={mockOnEditToggle}
        isEditing={true}
      />
    );

    // Modify the name
    const nameInput = screen.getByDisplayValue('Test Delve');
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

    // Cancel changes
    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(mockOnEditToggle).toHaveBeenCalledWith(false);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = vi.fn();

    render(<DelveCard delve={mockDelve} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith('delve-1');
  });

  it('calls onSaveToLibrary when save to library button is clicked', () => {
    const mockOnSaveToLibrary = vi.fn();

    render(<DelveCard delve={mockDelve} onSaveToLibrary={mockOnSaveToLibrary} />);

    fireEvent.click(screen.getByText('Save to Library'));
    expect(mockOnSaveToLibrary).toHaveBeenCalledWith(mockDelve);
  });

  it('calls onAddMonster when add monster button is clicked', () => {
    const mockOnAddMonster = vi.fn();

    render(<DelveCard delve={mockDelve} onAddMonster={mockOnAddMonster} />);

    fireEvent.click(screen.getByText('Add Monster'));
    expect(mockOnAddMonster).toHaveBeenCalledWith('delve-1');
  });

  it('calls onEditMonster when monster edit button is clicked', () => {
    const mockOnEditMonster = vi.fn();

    render(<DelveCard delve={mockDelve} onEditMonster={mockOnEditMonster} />);

    const editButtons = screen.getAllByText('Edit');
    const monsterEditButton = editButtons.find(button => 
      button.closest('.delve-card-monster')
    );
    
    if (monsterEditButton) {
      fireEvent.click(monsterEditButton);
      expect(mockOnEditMonster).toHaveBeenCalledWith('delve-1', 'monster-1');
    }
  });

  it('calls onDeleteMonster when monster delete button is clicked', () => {
    const mockOnDeleteMonster = vi.fn();

    render(<DelveCard delve={mockDelve} onDeleteMonster={mockOnDeleteMonster} />);

    const deleteButtons = screen.getAllByText('Delete');
    const monsterDeleteButton = deleteButtons.find(button => 
      button.closest('.delve-card-monster')
    );
    
    if (monsterDeleteButton) {
      fireEvent.click(monsterDeleteButton);
      expect(mockOnDeleteMonster).toHaveBeenCalledWith('delve-1', 'monster-1');
    }
  });

  it('applies custom className', () => {
    const { container } = render(
      <DelveCard delve={mockDelve} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('delve-card', 'custom-class');
  });

  it('shows editing state styling when isEditing is true', () => {
    const { container } = render(
      <DelveCard delve={mockDelve} isEditing={true} />
    );

    expect(container.firstChild).toHaveClass('delve-card--editing');
  });

  it('handles resistance input correctly', () => {
    render(
      <DelveCard
        delve={mockDelve}
        isEditing={true}
      />
    );

    const resistanceInput = screen.getByDisplayValue('25') as HTMLInputElement;
    expect(resistanceInput.type).toBe('number');
    expect(resistanceInput.min).toBe('1');
    expect(resistanceInput.max).toBe('50');

    fireEvent.change(resistanceInput, { target: { value: '30' } });
    expect(resistanceInput.value).toBe('30');
  });
});