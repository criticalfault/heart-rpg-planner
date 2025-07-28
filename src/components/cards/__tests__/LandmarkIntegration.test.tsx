// Integration test for Landmark components
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LandmarkCard } from '../LandmarkCard';
import { LandmarkForm } from '../LandmarkForm';
import { DelveMapProvider } from '../../../context/DelveMapContext';
import { Landmark } from '../../../types';

// Mock CSS imports
vi.mock('../LandmarkCard.css', () => ({}));
vi.mock('../LandmarkForm.css', () => ({}));

const mockLandmark: Landmark = {
  id: 'landmark-1',
  name: 'Test Landmark',
  domains: ['Occult'],
  defaultStress: 'd6',
  haunts: ['Test haunt'],
  bonds: ['Test bond']
};

// Test component that uses both LandmarkCard and LandmarkForm
const TestLandmarkManager = () => {
  const [landmarks, setLandmarks] = React.useState<Landmark[]>([mockLandmark]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingLandmark, setEditingLandmark] = React.useState<string | null>(null);

  const handleAddLandmark = (landmark: Landmark) => {
    setLandmarks(prev => [...prev, landmark]);
  };

  const handleUpdateLandmark = (updatedLandmark: Landmark) => {
    setLandmarks(prev => 
      prev.map(l => l.id === updatedLandmark.id ? updatedLandmark : l)
    );
  };

  const handleDeleteLandmark = (id: string) => {
    setLandmarks(prev => prev.filter(l => l.id !== id));
  };

  return (
    <DelveMapProvider>
      <div>
        <button onClick={() => setIsFormOpen(true)}>Add Landmark</button>
        
        {landmarks.map(landmark => (
          <LandmarkCard
            key={landmark.id}
            landmark={landmark}
            isEditing={editingLandmark === landmark.id}
            onEditToggle={(editing) => setEditingLandmark(editing ? landmark.id : null)}
            onUpdate={handleUpdateLandmark}
            onDelete={handleDeleteLandmark}
          />
        ))}

        <LandmarkForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddLandmark}
        />
      </div>
    </DelveMapProvider>
  );
};

describe('Landmark Integration', () => {
  it('can create a new landmark using the form', async () => {
    render(<TestLandmarkManager />);

    // Open the form
    fireEvent.click(screen.getByText('Add Landmark'));
    
    // Fill out the form
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'New Landmark' } });

    const cursedChip = screen.getByRole('button', { name: /cursed/i });
    fireEvent.click(cursedChip);

    // Submit the form
    fireEvent.click(screen.getByText('Create Landmark'));

    // Verify the new landmark appears
    await waitFor(() => {
      expect(screen.getByText('New Landmark')).toBeInTheDocument();
    });
  });

  it('can edit an existing landmark', async () => {
    render(<TestLandmarkManager />);

    // Start editing
    fireEvent.click(screen.getByText('Edit'));

    // Modify the name
    const nameInput = screen.getByDisplayValue('Test Landmark');
    fireEvent.change(nameInput, { target: { value: 'Updated Landmark' } });

    // Save changes
    fireEvent.click(screen.getByText('Save'));

    // Verify the changes
    await waitFor(() => {
      expect(screen.getByText('Updated Landmark')).toBeInTheDocument();
      expect(screen.queryByText('Test Landmark')).not.toBeInTheDocument();
    });
  });

  it('can delete a landmark', async () => {
    render(<TestLandmarkManager />);

    // Delete the landmark
    fireEvent.click(screen.getByText('Delete'));

    // Verify it's removed
    await waitFor(() => {
      expect(screen.queryByText('Test Landmark')).not.toBeInTheDocument();
    });
  });

  it('shows validation errors in form', async () => {
    render(<TestLandmarkManager />);

    // Open the form
    fireEvent.click(screen.getByText('Add Landmark'));
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create Landmark'));

    // Verify validation errors appear
    await waitFor(() => {
      expect(screen.getByText('Landmark name is required')).toBeInTheDocument();
      expect(screen.getByText('At least one domain must be selected')).toBeInTheDocument();
    });
  });

  it('shows validation errors in card edit mode', async () => {
    render(<TestLandmarkManager />);

    // Start editing
    fireEvent.click(screen.getByText('Edit'));

    // Clear the name to make it invalid
    const nameInput = screen.getByDisplayValue('Test Landmark');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Try to save
    fireEvent.click(screen.getByText('Save'));

    // Verify validation error appears
    await waitFor(() => {
      expect(screen.getByText('Landmark name is required')).toBeInTheDocument();
    });
  });
});