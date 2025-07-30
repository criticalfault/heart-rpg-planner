import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('LibraryPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      landmarks: [mockLandmark],
      delves: [mockDelve],
      monsters: [mockMonster]
    }));
  });

  it('integrates with localStorage and displays saved items', () => {
    renderWithProvider(<LibraryPage />);
    
    // Should load from localStorage and display items
    expect(screen.getByText('Test Landmark')).toBeInTheDocument();
    expect(screen.getByText('Landmarks (1)')).toBeInTheDocument();
    
    // Switch to delves tab
    fireEvent.click(screen.getByText('Delves (1)'));
    expect(screen.getByText('Test Delve')).toBeInTheDocument();
    
    // Switch to monsters tab
    fireEvent.click(screen.getByText('Monsters (1)'));
    expect(screen.getByText('Test Monster')).toBeInTheDocument();
  });

  it('handles empty library state', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      landmarks: [],
      delves: [],
      monsters: []
    }));

    renderWithProvider(<LibraryPage />);
    
    expect(screen.getByText('No landmarks saved to library yet.')).toBeInTheDocument();
    expect(screen.getByText('Landmarks (0)')).toBeInTheDocument();
    expect(screen.getByText('Delves (0)')).toBeInTheDocument();
    expect(screen.getByText('Monsters (0)')).toBeInTheDocument();
  });

  it('persists changes to localStorage', () => {
    renderWithProvider(<LibraryPage />);
    
    // The context should automatically save to localStorage when library changes
    // This is tested through the useEffect in DelveMapProvider
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });
});