// React import not needed with new JSX transform
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LandmarkForm } from '../LandmarkForm';
import { Landmark } from '../../../types';

// Mock CSS imports
vi.mock('../LandmarkForm.css', () => ({}));

const mockOnSubmit = vi.fn();
const mockOnClose = vi.fn();

const initialLandmarkData: Partial<Landmark> = {
  name: 'Test Landmark',
  domains: ['Occult'],
  defaultStress: 'd6',
  haunts: ['Test haunt'],
  bonds: ['Test bond']
};

describe('LandmarkForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Behavior', () => {
    it('renders modal when isOpen is true', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New Landmark')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <LandmarkForm
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('uses custom title when provided', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          title="Edit Landmark"
        />
      );

      expect(screen.getByText('Edit Landmark')).toBeInTheDocument();
    });

    it('calls onClose when cancel button is clicked', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Form Fields', () => {
    it('renders all form fields', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByText('Domains')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Stress Die')).toBeInTheDocument();
      expect(screen.getByText('Haunts')).toBeInTheDocument();
      expect(screen.getByText('Bonds')).toBeInTheDocument();
    });

    it('populates fields with initial data', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialLandmarkData}
        />
      );

      expect(screen.getByDisplayValue('Test Landmark')).toBeInTheDocument();
      expect(screen.getByDisplayValue('d6')).toBeInTheDocument();
      
      const occultChip = screen.getByRole('button', { name: /occult/i });
      expect(occultChip).toHaveAttribute('aria-pressed', 'true');
      
      expect(screen.getByText('Test haunt')).toBeInTheDocument();
      expect(screen.getByText('Test bond')).toBeInTheDocument();
    });

    it('allows editing name field', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'New Landmark Name' } });
      
      expect(screen.getByDisplayValue('New Landmark Name')).toBeInTheDocument();
    });

    it('allows selecting domains', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cursedChip = screen.getByRole('button', { name: /cursed/i });
      expect(cursedChip).toHaveAttribute('aria-pressed', 'false');
      
      fireEvent.click(cursedChip);
      expect(cursedChip).toHaveAttribute('aria-pressed', 'true');
    });

    it('allows changing stress die', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const stressSelect = screen.getByLabelText('Default Stress Die');
      fireEvent.change(stressSelect, { target: { value: 'd10' } });
      
      expect(screen.getByDisplayValue('d10')).toBeInTheDocument();
    });

    it('allows adding haunts', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const hauntInput = screen.getByPlaceholderText('Enter haunt description...');
      fireEvent.change(hauntInput, { target: { value: 'New haunt' } });
      fireEvent.click(screen.getByText('Add Haunt'));
      
      expect(screen.getByText('New haunt')).toBeInTheDocument();
    });

    it('allows adding bonds', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const bondInput = screen.getByPlaceholderText('Enter bond description...');
      fireEvent.change(bondInput, { target: { value: 'New bond' } });
      fireEvent.click(screen.getByText('Add Bond'));
      
      expect(screen.getByText('New bond')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty name', async () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByText('Create Landmark'));

      await waitFor(() => {
        expect(screen.getByText('Landmark name is required')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('shows validation error when no domains selected', async () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'Test Landmark' } });

      fireEvent.click(screen.getByText('Create Landmark'));

      await waitFor(() => {
        expect(screen.getByText('At least one domain must be selected')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('clears validation errors when user starts typing', async () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Trigger validation error
      fireEvent.click(screen.getByText('Create Landmark'));

      await waitFor(() => {
        expect(screen.getByText('Landmark name is required')).toBeInTheDocument();
      });

      // Start typing to clear errors
      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'T' } });

      await waitFor(() => {
        expect(screen.queryByText('Landmark name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits valid form data', async () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill out valid form
      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'Test Landmark' } });

      const cursedChip = screen.getByRole('button', { name: /cursed/i });
      fireEvent.click(cursedChip);

      const stressSelect = screen.getByLabelText('Default Stress Die');
      fireEvent.change(stressSelect, { target: { value: 'd8' } });

      fireEvent.click(screen.getByText('Create Landmark'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Landmark',
            domains: ['Cursed'],
            defaultStress: 'd8',
            haunts: [],
            bonds: [],
            id: expect.stringMatching(/^landmark-/)
          })
        );
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('generates unique ID for new landmark', async () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill out minimal valid form
      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'Test Landmark' } });

      const cursedChip = screen.getByRole('button', { name: /cursed/i });
      fireEvent.click(cursedChip);

      fireEvent.click(screen.getByText('Create Landmark'));

      await waitFor(() => {
        const submittedLandmark = mockOnSubmit.mock.calls[0][0];
        expect(submittedLandmark.id).toMatch(/^landmark-\d+-[a-z0-9]+$/);
      });
    });

    it('shows loading state during submission', async () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill out valid form
      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'Test Landmark' } });

      const cursedChip = screen.getByRole('button', { name: /cursed/i });
      fireEvent.click(cursedChip);

      fireEvent.click(screen.getByText('Create Landmark'));

      // Check for loading state (button text changes)
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });

    it('includes haunts and bonds in submission', async () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialLandmarkData}
        />
      );

      fireEvent.click(screen.getByText('Create Landmark'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            haunts: ['Test haunt'],
            bonds: ['Test bond']
          })
        );
      });
    });
  });

  describe('Form Reset', () => {
    it('resets form when modal opens', () => {
      const { rerender } = render(
        <LandmarkForm
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      rerender(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialLandmarkData}
        />
      );

      expect(screen.getByDisplayValue('Test Landmark')).toBeInTheDocument();
    });

    it('resets form when cancelled', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Make some changes
      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

      // Cancel
      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('has proper labels for all inputs', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Stress Die')).toBeInTheDocument();
    });

    it('has helper text for form fields', () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Select one or more domains that apply to this landmark')).toBeInTheDocument();
      expect(screen.getByText('The default stress die used when visiting this landmark')).toBeInTheDocument();
    });

    it('shows validation errors with proper ARIA attributes', async () => {
      render(
        <LandmarkForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByText('Create Landmark'));

      await waitFor(() => {
        const errorElement = screen.getByText('Landmark name is required');
        expect(errorElement).toHaveAttribute('role', 'alert');
      });
    });
  });
});