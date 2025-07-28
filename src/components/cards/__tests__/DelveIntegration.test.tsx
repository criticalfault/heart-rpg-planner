import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DelveCard } from '../DelveCard';
import { DelveForm } from '../DelveForm';
import { Delve, Domain } from '../../../types';

// Mock CSS imports
vi.mock('../DelveCard.css', () => ({}));
vi.mock('../DelveForm.css', () => ({}));
vi.mock('../../common/Modal', () => ({
  Modal: ({ children, isOpen, title }: any) => 
    isOpen ? <div data-testid="modal"><h2>{title}</h2>{children}</div> : null
}));

describe('Delve Components Integration', () => {
  it('creates a new delve and displays it in the card', async () => {
    const mockOnSubmit = vi.fn();
    let createdDelve: Delve | null = null;

    // Mock the submit handler to capture the created delve
    const handleSubmit = (delve: Delve) => {
      createdDelve = delve;
      mockOnSubmit(delve);
    };

    // Render the form
    const { rerender } = render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        title="Create New Delve"
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'Integration Test Delve' } 
    });
    fireEvent.change(screen.getByLabelText('Resistance'), { 
      target: { value: '35' } 
    });

    // Select domains
    fireEvent.click(screen.getByText('Cursed'));
    fireEvent.click(screen.getByText('Occult'));

    // Add events
    const eventInput = screen.getByPlaceholderText('Enter event description...');
    fireEvent.change(eventInput, { target: { value: 'Mysterious whispers' } });
    fireEvent.click(screen.getByText('Add Event'));

    fireEvent.change(eventInput, { target: { value: 'Cold spots appear' } });
    fireEvent.click(screen.getByText('Add Event'));

    // Add resources
    const resourceInput = screen.getByPlaceholderText('Enter resource description...');
    fireEvent.change(resourceInput, { target: { value: 'Ancient tome' } });
    fireEvent.click(screen.getByText('Add Resource'));

    // Submit the form
    fireEvent.click(screen.getByText('Create Delve'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(createdDelve).toBeTruthy();
    });

    // Now render the card with the created delve
    if (createdDelve) {
      rerender(
        <DelveCard delve={createdDelve} />
      );

      // Verify the card displays the correct information
      expect(screen.getByText('Integration Test Delve')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('Cursed')).toBeInTheDocument();
      expect(screen.getByText('Occult')).toBeInTheDocument();
      expect(screen.getByText('Mysterious whispers')).toBeInTheDocument();
      expect(screen.getByText('Cold spots appear')).toBeInTheDocument();
      expect(screen.getByText('Ancient tome')).toBeInTheDocument();
      expect(screen.getByText('Monsters (0)')).toBeInTheDocument();
      expect(screen.getByText('No monsters added yet')).toBeInTheDocument();
    }
  });

  it('edits an existing delve through the card', async () => {
    const mockOnUpdate = vi.fn();
    const mockOnEditToggle = vi.fn();

    const initialDelve: Delve = {
      id: 'delve-1',
      name: 'Original Delve',
      resistance: 20,
      domains: ['Haven'],
      events: ['Original event'],
      resources: ['Original resource'],
      monsters: []
    };

    // Render card in editing mode
    render(
      <DelveCard
        delve={initialDelve}
        onUpdate={mockOnUpdate}
        onEditToggle={mockOnEditToggle}
        isEditing={true}
      />
    );

    // Modify the delve
    fireEvent.change(screen.getByDisplayValue('Original Delve'), { 
      target: { value: 'Updated Delve Name' } 
    });
    fireEvent.change(screen.getByDisplayValue('20'), { 
      target: { value: '45' } 
    });

    // Add a new domain
    fireEvent.click(screen.getByText('Technology'));

    // Save changes
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'delve-1',
          name: 'Updated Delve Name',
          resistance: 45,
          domains: expect.arrayContaining(['Haven', 'Technology'])
        })
      );
      expect(mockOnEditToggle).toHaveBeenCalledWith(false);
    });
  });

  it('validates delve data consistently between form and card', async () => {
    // Test form validation
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    // Try to submit invalid data
    fireEvent.change(screen.getByLabelText('Resistance'), { 
      target: { value: '100' } 
    });
    fireEvent.click(screen.getByText('Create Delve'));

    await waitFor(() => {
      expect(screen.getByText('Delve name is required')).toBeInTheDocument();
      expect(screen.getByText('Delve resistance must be between 1 and 50')).toBeInTheDocument();
      expect(screen.getByText('At least one domain must be selected')).toBeInTheDocument();
    });

    // Test card validation
    const invalidDelve: Delve = {
      id: 'delve-1',
      name: '',
      resistance: 100,
      domains: [],
      events: [],
      resources: [],
      monsters: []
    };

    render(
      <DelveCard
        delve={invalidDelve}
        onEditToggle={vi.fn()}
        isEditing={true}
      />
    );

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Delve name is required')).toBeInTheDocument();
      expect(screen.getByText('Delve resistance must be between 1 and 50')).toBeInTheDocument();
      expect(screen.getByText('At least one domain must be selected')).toBeInTheDocument();
    });
  });

  it('handles resistance input validation consistently', async () => {
    // Test in form
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const formResistanceInput = screen.getByLabelText('Resistance') as HTMLInputElement;
    expect(formResistanceInput.min).toBe('1');
    expect(formResistanceInput.max).toBe('50');
    expect(formResistanceInput.type).toBe('number');

    // Test in card editing mode
    const testDelve: Delve = {
      id: 'delve-1',
      name: 'Test Delve',
      resistance: 25,
      domains: ['Haven'],
      events: [],
      resources: [],
      monsters: []
    };

    render(
      <DelveCard
        delve={testDelve}
        isEditing={true}
      />
    );

    const cardResistanceInput = screen.getByDisplayValue('25') as HTMLInputElement;
    expect(cardResistanceInput.min).toBe('1');
    expect(cardResistanceInput.max).toBe('50');
    expect(cardResistanceInput.type).toBe('number');
  });

  it('maintains data integrity when switching between form and card', async () => {
    const testData = {
      name: 'Data Integrity Test',
      resistance: 30,
      domains: ['Cursed', 'Technology'] as Domain[],
      events: ['Event 1', 'Event 2'],
      resources: ['Resource 1', 'Resource 2']
    };

    let capturedDelve: Delve | null = null;

    // Create delve through form
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={(delve) => { capturedDelve = delve; }}
        initialData={testData}
      />
    );

    fireEvent.click(screen.getByText('Create Delve'));

    await waitFor(() => {
      expect(capturedDelve).toBeTruthy();
    });

    // Display in card and verify data integrity
    expect(capturedDelve).not.toBeNull();
    if (capturedDelve) {
      const delve = capturedDelve as Delve;
      render(
        <DelveCard delve={delve} />
      );

      expect(screen.getByText('Data Integrity Test')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Cursed')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
      expect(screen.getByText('Resource 1')).toBeInTheDocument();
      expect(screen.getByText('Resource 2')).toBeInTheDocument();

      // Verify the data structure matches exactly
      expect(delve.name).toBe(testData.name);
      expect(delve.resistance).toBe(testData.resistance);
      expect(delve.domains).toEqual(testData.domains);
      expect(delve.events).toEqual(testData.events);
      expect(delve.resources).toEqual(testData.resources);
      expect(delve.monsters).toEqual([]);
    }
  });
});