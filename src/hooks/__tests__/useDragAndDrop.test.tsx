import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useDragAndDrop } from '../useDragAndDrop';
import { DelveMapProvider } from '../../context/DelveMapContext';
import { HexPosition, PlacedCard } from '../../types';

// Mock the context
const mockDispatch = vi.fn();
const mockState = {
  currentMap: null,
  landmarks: [],
  delves: [],
  placedCards: [] as PlacedCard[],
  connections: [],
  selectedCard: null,
  editingCard: null,
  draggedCard: null,
  library: {
    monsters: [],
    landmarks: [],
    delves: []
  }
};

vi.mock('../../context/DelveMapContext', () => ({
  useDelveMapContext: () => ({
    state: mockState,
    dispatch: mockDispatch,
  }),
  DelveMapProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('useDragAndDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.placedCards = [];
    mockState.selectedCard = null;
    mockState.draggedCard = null;
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DelveMapProvider>{children}</DelveMapProvider>
  );

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    
    expect(result.current.dragState).toEqual({
      draggedCard: null,
      draggedCardType: null,
      isDragging: false,
      previewPosition: null,
    });
  });

  it('handles drag start correctly', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    
    act(() => {
      result.current.handleDragStart('card-1', 'landmark');
    });
    
    expect(result.current.dragState).toEqual({
      draggedCard: 'card-1',
      draggedCardType: 'landmark',
      isDragging: true,
      previewPosition: null,
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_DRAGGED_CARD',
      payload: 'card-1',
    });
  });

  it('handles drag move correctly', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Start drag first
    act(() => {
      result.current.handleDragStart('card-1', 'landmark');
    });
    
    // Then move
    act(() => {
      result.current.handleDragMove('card-1', position);
    });
    
    expect(result.current.dragState.previewPosition).toEqual(position);
  });

  it('ignores drag move for different card', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Start drag for card-1
    act(() => {
      result.current.handleDragStart('card-1', 'landmark');
    });
    
    // Try to move card-2
    act(() => {
      result.current.handleDragMove('card-2', position);
    });
    
    expect(result.current.dragState.previewPosition).toBeNull();
  });

  it('handles drag end for new card placement', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Start drag
    act(() => {
      result.current.handleDragStart('card-1', 'landmark');
    });
    
    // End drag
    act(() => {
      result.current.handleDragEnd('card-1', position);
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'PLACE_CARD',
      payload: {
        id: 'card-1',
        type: 'landmark',
        position,
      },
    });
    
    expect(result.current.dragState).toEqual({
      draggedCard: null,
      draggedCardType: null,
      isDragging: false,
      previewPosition: null,
    });
  });

  it('handles drag end for existing card movement', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Set up existing placed card
    mockState.placedCards = [{
      id: 'card-1',
      type: 'landmark',
      position: { q: 0, r: 0 },
    }];
    
    // Start drag
    act(() => {
      result.current.handleDragStart('card-1', 'landmark');
    });
    
    // End drag
    act(() => {
      result.current.handleDragEnd('card-1', position);
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'MOVE_CARD',
      payload: {
        id: 'card-1',
        position,
      },
    });
  });

  it('prevents drag end to occupied position', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Set up occupied position
    mockState.placedCards = [{
      id: 'other-card',
      type: 'delve',
      position,
    }];
    
    // Start drag
    act(() => {
      result.current.handleDragStart('card-1', 'landmark');
    });
    
    // Try to end drag on occupied position
    act(() => {
      result.current.handleDragEnd('card-1', position);
    });
    
    // Should not dispatch PLACE_CARD or MOVE_CARD
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PLACE_CARD',
      })
    );
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MOVE_CARD',
      })
    );
  });

  it('checks if position is occupied correctly', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Set up occupied position
    mockState.placedCards = [{
      id: 'card-1',
      type: 'landmark',
      position,
    }];
    
    expect(result.current.isOccupied(position)).toBe(true);
    expect(result.current.isOccupied({ q: 0, r: 0 })).toBe(false);
  });

  it('excludes card from occupation check', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Set up occupied position
    mockState.placedCards = [{
      id: 'card-1',
      type: 'landmark',
      position,
    }];
    
    expect(result.current.isOccupied(position, 'card-1')).toBe(false);
    expect(result.current.isOccupied(position, 'other-card')).toBe(true);
  });

  it('gets card position correctly', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Set up placed card
    mockState.placedCards = [{
      id: 'card-1',
      type: 'landmark',
      position,
    }];
    
    expect(result.current.getCardPosition('card-1')).toEqual(position);
    expect(result.current.getCardPosition('non-existent')).toBeUndefined();
  });

  it('checks if card is selected correctly', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    
    (mockState as any).selectedCard = 'card-1';
    
    expect(result.current.isCardSelected('card-1')).toBe(true);
    expect(result.current.isCardSelected('card-2')).toBe(false);
  });

  it('checks if card is dragging correctly', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    
    // Start drag
    act(() => {
      result.current.handleDragStart('card-1', 'landmark');
    });
    
    expect(result.current.isCardDragging('card-1')).toBe(true);
    expect(result.current.isCardDragging('card-2')).toBe(false);
  });

  it('handles grid drop correctly', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Start drag
    act(() => {
      result.current.handleDragStart('card-1', 'landmark');
    });
    
    // Handle grid drop
    act(() => {
      result.current.handleGridDrop('card-1', 'landmark', position);
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'PLACE_CARD',
      payload: {
        id: 'card-1',
        type: 'landmark',
        position,
      },
    });
  });

  it('handles delve card type correctly', () => {
    const { result } = renderHook(() => useDragAndDrop(), { wrapper });
    const position: HexPosition = { q: 1, r: 2 };
    
    // Start drag with delve
    act(() => {
      result.current.handleDragStart('card-1', 'delve');
    });
    
    expect(result.current.dragState.draggedCardType).toBe('delve');
    
    // End drag
    act(() => {
      result.current.handleDragEnd('card-1', position);
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'PLACE_CARD',
      payload: {
        id: 'card-1',
        type: 'delve',
        position,
      },
    });
  });
});