import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DelveForm } from '../DelveForm';
import { Delve } from '../../../types';

// Mock the CSS imports
vi.mock('../DelveForm.css', () => ({}));
vi.mock('../../common/Modal', () => ({
  Modal: ({ children, isOpen, title }: any) => 
    isOpen ? <div data-testid="modal"><h2>{title}</h2>{children}</div> : null
}));

const mockInitialData: Partial<Delve> = {
  name: 'Test Delve',
  resistance: 20,
  domains: ['Cursed'],
  events: ['Test event'],
  resources: ['Test resource']
};

describe('DelveForm', () => {
  it('renders form when open', () => {
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        title="Create New Delve"
      />
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Create New Delve')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Resistance')).toBeInTheDocument();
    expect(screen.getByText('Domains')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <DelveForm
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('initializes with empty values by default', () => {
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const resistanceInput = screen.getByLabelText('Resistance') as HTMLInputElement;

    expect(nameInput.value).toBe('');
    expect(resistanceInput.value).toBe('1');
  });

  it('initializes with provided initial data', () => {
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        initialData={mockInitialData}
      />
    );

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const resistanceInput = screen.getByLabelText('Resistance') as HTMLInputElement;

    expect(nameInput.value).toBe('Test Delve');
    expect(resistanceInput.value).toBe('20');
  });

  it('validates required fields on submit', async () => {
    const mockOnSubmit = vi.fn();

    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={mockOnSubmit}
      />
    );

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create Delve'));

    await waitFor(() => {
      expect(screen.getByText('Delve name is required')).toBeInTheDocument();
      expect(screen.getByText('At least one domain must be selected')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates resistance range', async () => {
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const resistanceInput = screen.getByLabelText('Resistance');
    
    // Test invalid resistance (too high)
    fireEvent.change(resistanceInput, { target: { value: '100' } });
    fireEvent.click(screen.getByText('Create Delve'));

    await waitFor(() => {
      expect(screen.getByText('Delve resistance must be between 1 and 50')).toBeInTheDocument();
    });
  });

  it('submits valid form data', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnClose = vi.fn();

    render(
      <DelveForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'New Delve' } 
    });
    fireEvent.change(screen.getByLabelText('Resistance'), { 
      target: { value: '25' } 
    });

    // Select a domain (assuming DomainSelector is working)
    const cursedButton = screen.getByText('Cursed');
    fireEvent.click(cursedButton);

    // Submit form
    fireEvent.click(screen.getByText('Create Delve'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Delve',
          resistance: 25,
          domains: ['Cursed'],
          events: [],
          resources: [],
          monsters: []
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('generates unique ID for new delve', async () => {
    const mockOnSubmit = vi.fn();

    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={mockOnSubmit}
      />
    );

    // Fill in minimal valid data
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'Test Delve' } 
    });
    
    const cursedButton = screen.getByText('Cursed');
    fireEvent.click(cursedButton);

    fireEvent.click(screen.getByText('Create Delve'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^delve-\d+-[a-z0-9]+$/)
        })
      );
    });
  });

  it('cancels form and calls onClose', () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <DelveForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('resets form when reopened', () => {
    const { rerender } = render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        initialData={mockInitialData}
      />
    );

    // Modify form
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'Modified Name' } 
    });

    // Close and reopen
    rerender(
      <DelveForm
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        initialData={mockInitialData}
      />
    );

    rerender(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        initialData={mockInitialData}
      />
    );

    // Should be reset to initial data
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    expect(nameInput.value).toBe('Test Delve');
  });

  it('clears validation errors when user starts typing', async () => {
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    // Trigger validation error
    fireEvent.click(screen.getByText('Create Delve'));

    await waitFor(() => {
      expect(screen.getByText('Delve name is required')).toBeInTheDocument();
    });

    // Start typing in name field
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'T' } 
    });

    // Error should be cleared
    expect(screen.queryByText('Delve name is required')).not.toBeInTheDocument();
  });

  it('disables form during submission', async () => {
    const mockOnSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={mockOnSubmit}
      />
    );

    // Fill valid data
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'Test Delve' } 
    });
    
    const cursedButton = screen.getByText('Cursed');
    fireEvent.click(cursedButton);

    // Submit form
    fireEvent.click(screen.getByText('Create Delve'));

    // Form should be disabled during submission
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('handles resistance input correctly', () => {
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const resistanceInput = screen.getByLabelText('Resistance') as HTMLInputElement;
    
    expect(resistanceInput.type).toBe('number');
    expect(resistanceInput.min).toBe('1');
    expect(resistanceInput.max).toBe('50');

    fireEvent.change(resistanceInput, { target: { value: '30' } });
    expect(resistanceInput.value).toBe('30');
  });

  it('shows helper text for fields', () => {
    render(
      <DelveForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Difficulty rating from 1 to 50')).toBeInTheDocument();
    expect(screen.getByText('Select one or more domains that apply to this delve')).toBeInTheDocument();
    expect(screen.getByText('Events that can occur in this delve')).toBeInTheDocument();
    expect(screen.getByText('Resources that can be found in this delve')).toBeInTheDocument();
  });
});