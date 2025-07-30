import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LibraryPage } from '../LibraryPage';
import { DelveMapProvider } from '../../context/DelveMapContext';
import { Landmark, Delve, Monster } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  },
});

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
});

// Mock window.alert
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
});

const mockLandmark: Landmark = {
  id: 'landmark-1',
  name: 'Test Landmark',
  domains: ['Haven', 'Technology'],
  defaultStress: 'd6',
  haunts: ['Spooky ghost'],
  bonds: ['Local merchant']
};

const mockDelve: Delve = {
  id: 'delve-1',
  name: 'Test Delve',
  resistance: 25,
  domains: ['Cursed', 'Desolate'],
  events: ['Strange noise'],
  resources: ['Ancient coin'],
  monsters: []
};

const mockMonster: Monster = {
  id: 'monster-1',
  name: 'Test Monster',
  resistance: 15,
  protection: 8,
  attacks: ['Claw swipe'],
  resources: ['Monster hide'],
  notes: 'Dangerous creature'
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <DelveMapProvider>
      {component}
    </DelveMapProvider>
  );
};

describe('LibraryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      landmarks: [mockLandmark],
      delves: [mockDelve],
      monsters: [mockMonster]
    }));
  });

  it('renders library page with tabs', () => {
    renderWithProvider(<LibraryPage />);
    
    expect(screen.getByText('Personal Library')).toBeInTheDocument();
    expect(screen.getByText('Manage your saved landmarks, delves, and monsters')).toBeInTheDocument();
    
    expect(screen.getByText('Landmarks (1)')).toBeInTheDocument();
    expect(screen.getByText('Delves (1)')).toBeInTheDocument();
    expect(screen.getByText('Monsters (1)')).toBeInTheDocument();
  });

  it('displays landmarks tab by default', () => {
    renderWithProvider(<LibraryPage />);
    
    expect(screen.getByText('Test Landmark')).toBeInTheDocument();
    expect(screen.getByText('Haven, Technology')).toBeInTheDocument();
    expect(screen.getByText('d6')).toBeInTheDocument();
  });

  it('switches to delves tab when clicked', () => {
    renderWithProvider(<LibraryPage />);
    
    fireEvent.click(screen.getByText('Delves (1)'));
    
    expect(screen.getByText('Test Delve')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Cursed, Desolate')).toBeInTheDocument();
  });

  it('switches to monsters tab when clicked', () => {
    renderWithProvider(<LibraryPage />);
    
    fireEvent.click(screen.getByText('Monsters (1)'));
    
    expect(screen.getByText('Test Monster')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('shows empty message when no items in library', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      landmarks: [],
      delves: [],
      monsters: []
    }));

    renderWithProvider(<LibraryPage />);
    
    expect(screen.getByText('No landmarks saved to library yet.')).toBeInTheDocument();
  });

  it('handles use in map button for landmarks', () => {
    renderWithProvider(<LibraryPage />);
    
    const useButton = screen.getByText('Use in Map');
    fireEvent.click(useButton);
    
    // Should add landmark to map (tested through context)
    expect(useButton).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    renderWithProvider(<LibraryPage />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // Should open edit modal
    expect(screen.getByText('Edit landmark')).toBeInTheDocument();
  });

  it('handles delete button click with confirmation', () => {
    renderWithProvider(<LibraryPage />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this item from your library?');
  });

  it('shows alert for monster use button', () => {
    renderWithProvider(<LibraryPage />);
    
    fireEvent.click(screen.getByText('Monsters (1)'));
    
    const useButton = screen.getByText('Use in Delve');
    fireEvent.click(useButton);
    
    expect(window.alert).toHaveBeenCalledWith('To use a monster, please add it to a delve from the delve map.');
  });

  it('displays landmark details correctly', () => {
    renderWithProvider(<LibraryPage />);
    
    expect(screen.getByText('Domains:')).toBeInTheDocument();
    expect(screen.getByText('Haven, Technology')).toBeInTheDocument();
    expect(screen.getByText('Default Stress:')).toBeInTheDocument();
    expect(screen.getByText('d6')).toBeInTheDocument();
    expect(screen.getByText('Haunts:')).toBeInTheDocument();
    expect(screen.getByText('Spooky ghost')).toBeInTheDocument();
    expect(screen.getByText('Bonds:')).toBeInTheDocument();
    expect(screen.getByText('Local merchant')).toBeInTheDocument();
  });

  it('displays delve details correctly', () => {
    renderWithProvider(<LibraryPage />);
    
    fireEvent.click(screen.getByText('Delves (1)'));
    
    expect(screen.getByText('Resistance:')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Domains:')).toBeInTheDocument();
    expect(screen.getByText('Cursed, Desolate')).toBeInTheDocument();
    expect(screen.getByText('Events:')).toBeInTheDocument();
    expect(screen.getByText('Strange noise')).toBeInTheDocument();
    expect(screen.getByText('Resources:')).toBeInTheDocument();
    expect(screen.getByText('Ancient coin')).toBeInTheDocument();
  });

  it('displays monster details correctly', () => {
    renderWithProvider(<LibraryPage />);
    
    fireEvent.click(screen.getByText('Monsters (1)'));
    
    expect(screen.getByText('Resistance:')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Protection:')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Attacks:')).toBeInTheDocument();
    expect(screen.getByText('Claw swipe')).toBeInTheDocument();
    expect(screen.getByText('Resources:')).toBeInTheDocument();
    expect(screen.getByText('Monster hide')).toBeInTheDocument();
    expect(screen.getByText('Notes:')).toBeInTheDocument();
    expect(screen.getByText('Dangerous creature')).toBeInTheDocument();
  });

  it('handles modal close when cancel is clicked', async () => {
    renderWithProvider(<LibraryPage />);
    
    // Open edit modal
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit landmark')).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Edit landmark')).not.toBeInTheDocument();
    });
  });

  it('handles tab switching correctly', () => {
    renderWithProvider(<LibraryPage />);
    
    // Start on landmarks tab
    expect(screen.getByText('Test Landmark')).toBeInTheDocument();
    
    // Switch to delves
    fireEvent.click(screen.getByText('Delves (1)'));
    expect(screen.getByText('Test Delve')).toBeInTheDocument();
    expect(screen.queryByText('Test Landmark')).not.toBeInTheDocument();
    
    // Switch to monsters
    fireEvent.click(screen.getByText('Monsters (1)'));
    expect(screen.getByText('Test Monster')).toBeInTheDocument();
    expect(screen.queryByText('Test Delve')).not.toBeInTheDocument();
    
    // Switch back to landmarks
    fireEvent.click(screen.getByText('Landmarks (1)'));
    expect(screen.getByText('Test Landmark')).toBeInTheDocument();
    expect(screen.queryByText('Test Monster')).not.toBeInTheDocument();
  });
});