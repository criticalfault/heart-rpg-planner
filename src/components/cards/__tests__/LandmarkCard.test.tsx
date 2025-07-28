// React import not needed with new JSX transform
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LandmarkCard } from '../LandmarkCard';
import { Landmark } from '../../../types';

// Mock CSS imports
vi.mock('../LandmarkCard.css', () => ({}));

const mockLandmark: Landmark = {
  id: 'landmark-1',
  name: 'The Crimson Library',
  domains: ['Occult', 'Religion'],
  defaultStress: 'd8',
  haunts: ['Whispering books', 'Floating candles'],
  bonds: ['The Librarian', 'Ancient tome']
};

describe('LandmarkCard', () => {
  describe('Display Mode', () => {
    it('renders landmark information correctly', () => {
      render(<LandmarkCard landmark={mockLandmark} />);

      expect(screen.getByText('The Crimson Library')).toBeInTheDocument();
      expect(screen.getByText('Occult')).toBeInTheDocument();
      expect(screen.getByText('Religion')).toBeInTheDocument();
      expect(screen.getByText('d8')).toBeInTheDocument();
      expect(screen.getByText('Whispering books')).toBeInTheDocument();
      expect(screen.getByText('Floating candles')).toBeInTheDocument();
      expect(screen.getByText('The Librarian')).toBeInTheDocument();
      expect(screen.getByText('Ancient tome')).toBeInTheDocument();
    });

    it('shows edit button when onEditToggle is provided', () => {
      const mockEditToggle = vi.fn();
      render(<LandmarkCard landmark={mockLandmark} onEditToggle={mockEditToggle} />);

      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('shows save to library button when onSaveToLibrary is provided', () => {
      const mockSaveToLibrary = vi.fn();
      render(<LandmarkCard landmark={mockLandmark} onSaveToLibrary={mockSaveToLibrary} />);

      expect(screen.getByText('Save to Library')).toBeInTheDocument();
    });

    it('shows delete button when onDelete is provided', () => {
      const mockDelete = vi.fn();
      render(<LandmarkCard landmark={mockLandmark} onDelete={mockDelete} />);

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls onEditToggle when edit button is clicked', () => {
      const mockEditToggle = vi.fn();
      render(<LandmarkCard landmark={mockLandmark} onEditToggle={mockEditToggle} />);

      fireEvent.click(screen.getByText('Edit'));
      expect(mockEditToggle).toHaveBeenCalledWith(true);
    });

    it('calls onSaveToLibrary when save to library button is clicked', () => {
      const mockSaveToLibrary = vi.fn();
      render(<LandmarkCard landmark={mockLandmark} onSaveToLibrary={mockSaveToLibrary} />);

      fireEvent.click(screen.getByText('Save to Library'));
      expect(mockSaveToLibrary).toHaveBeenCalledWith(mockLandmark);
    });

    it('calls onDelete when delete button is clicked', () => {
      const mockDelete = vi.fn();
      render(<LandmarkCard landmark={mockLandmark} onDelete={mockDelete} />);

      fireEvent.click(screen.getByText('Delete'));
      expect(mockDelete).toHaveBeenCalledWith('landmark-1');
    });

    it('does not show haunts section when haunts array is empty', () => {
      const landmarkWithoutHaunts = { ...mockLandmark, haunts: [] };
      render(<LandmarkCard landmark={landmarkWithoutHaunts} />);

      expect(screen.queryByText('Haunts:')).not.toBeInTheDocument();
    });

    it('does not show bonds section when bonds array is empty', () => {
      const landmarkWithoutBonds = { ...mockLandmark, bonds: [] };
      render(<LandmarkCard landmark={landmarkWithoutBonds} />);

      expect(screen.queryByText('Bonds:')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('renders edit form when isEditing is true', () => {
      render(<LandmarkCard landmark={mockLandmark} isEditing={true} />);

      expect(screen.getByText('Edit Landmark')).toBeInTheDocument();
      expect(screen.getByDisplayValue('The Crimson Library')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('populates form fields with landmark data', () => {
      render(<LandmarkCard landmark={mockLandmark} isEditing={true} />);

      expect(screen.getByDisplayValue('The Crimson Library')).toBeInTheDocument();
      expect(screen.getByDisplayValue('d8')).toBeInTheDocument();
      
      // Check that domain chips are selected
      const occultChip = screen.getByRole('button', { name: /occult/i });
      const religionChip = screen.getByRole('button', { name: /religion/i });
      expect(occultChip).toHaveAttribute('aria-pressed', 'true');
      expect(religionChip).toHaveAttribute('aria-pressed', 'true');
    });

    it('allows editing of name field', () => {
      render(<LandmarkCard landmark={mockLandmark} isEditing={true} />);

      const nameInput = screen.getByDisplayValue('The Crimson Library');
      fireEvent.change(nameInput, { target: { value: 'Updated Library' } });
      
      expect(screen.getByDisplayValue('Updated Library')).toBeInTheDocument();
    });

    it('allows editing of stress die selection', () => {
      render(<LandmarkCard landmark={mockLandmark} isEditing={true} />);

      const stressSelect = screen.getByDisplayValue('d8');
      fireEvent.change(stressSelect, { target: { value: 'd10' } });
      
      expect(screen.getByDisplayValue('d10')).toBeInTheDocument();
    });

    it('allows toggling domain selection', () => {
      render(<LandmarkCard landmark={mockLandmark} isEditing={true} />);

      const cursedChip = screen.getByRole('button', { name: /cursed/i });
      expect(cursedChip).toHaveAttribute('aria-pressed', 'false');
      
      fireEvent.click(cursedChip);
      expect(cursedChip).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onUpdate with updated data when save is clicked', async () => {
      const mockUpdate = vi.fn();
      const mockEditToggle = vi.fn();
      
      render(
        <LandmarkCard 
          landmark={mockLandmark} 
          isEditing={true}
          onUpdate={mockUpdate}
          onEditToggle={mockEditToggle}
        />
      );

      const nameInput = screen.getByDisplayValue('The Crimson Library');
      fireEvent.change(nameInput, { target: { value: 'Updated Library' } });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          ...mockLandmark,
          name: 'Updated Library'
        });
        expect(mockEditToggle).toHaveBeenCalledWith(false);
      });
    });

    it('calls onEditToggle with false when cancel is clicked', () => {
      const mockEditToggle = vi.fn();
      
      render(
        <LandmarkCard 
          landmark={mockLandmark} 
          isEditing={true}
          onEditToggle={mockEditToggle}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockEditToggle).toHaveBeenCalledWith(false);
    });

    it('shows validation errors for invalid data', async () => {
      const mockUpdate = vi.fn();
      
      render(
        <LandmarkCard 
          landmark={mockLandmark} 
          isEditing={true}
          onUpdate={mockUpdate}
        />
      );

      // Clear the name field to make it invalid
      const nameInput = screen.getByDisplayValue('The Crimson Library');
      fireEvent.change(nameInput, { target: { value: '' } });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Landmark name is required')).toBeInTheDocument();
        expect(mockUpdate).not.toHaveBeenCalled();
      });
    });

    it('shows validation error when no domains are selected', async () => {
      const mockUpdate = vi.fn();
      
      render(
        <LandmarkCard 
          landmark={mockLandmark} 
          isEditing={true}
          onUpdate={mockUpdate}
        />
      );

      // Deselect all domains
      const occultChip = screen.getByRole('button', { name: /occult/i });
      const religionChip = screen.getByRole('button', { name: /religion/i });
      fireEvent.click(occultChip);
      fireEvent.click(religionChip);

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('At least one domain must be selected')).toBeInTheDocument();
        expect(mockUpdate).not.toHaveBeenCalled();
      });
    });

    it('resets form data when switching to edit mode', () => {
      const { rerender } = render(<LandmarkCard landmark={mockLandmark} isEditing={false} />);
      
      rerender(<LandmarkCard landmark={mockLandmark} isEditing={true} />);
      
      expect(screen.getByDisplayValue('The Crimson Library')).toBeInTheDocument();
      expect(screen.getByDisplayValue('d8')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<LandmarkCard landmark={mockLandmark} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('The Crimson Library');
    });

    it('has proper button labels', () => {
      const mockDelete = vi.fn();
      const mockSaveToLibrary = vi.fn();
      const mockEditToggle = vi.fn();
      
      render(
        <LandmarkCard 
          landmark={mockLandmark}
          onDelete={mockDelete}
          onSaveToLibrary={mockSaveToLibrary}
          onEditToggle={mockEditToggle}
        />
      );

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save to Library' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('has proper form labels in edit mode', () => {
      render(<LandmarkCard landmark={mockLandmark} isEditing={true} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Stress Die')).toBeInTheDocument();
      expect(screen.getByText('Domains')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('applies base CSS class', () => {
      const { container } = render(<LandmarkCard landmark={mockLandmark} />);
      
      expect(container.firstChild).toHaveClass('landmark-card');
    });

    it('applies editing CSS class when in edit mode', () => {
      const { container } = render(<LandmarkCard landmark={mockLandmark} isEditing={true} />);
      
      expect(container.firstChild).toHaveClass('landmark-card--editing');
    });

    it('applies custom className', () => {
      const { container } = render(<LandmarkCard landmark={mockLandmark} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('landmark-card', 'custom-class');
    });
  });
});