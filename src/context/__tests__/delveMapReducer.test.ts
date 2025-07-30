import { describe, it, expect } from 'vitest';
import { delveMapReducer } from '../delveMapReducer';
import { createInitialState } from '../DelveMapContext';
import { Landmark, Delve, Monster, Connection, PlacedCard } from '../../types';

// Create a helper to get fresh initial state for each test
const getInitialState = () => createInitialState();

describe('delveMapReducer', () => {
  describe('Landmark actions', () => {
    const mockLandmark: Landmark = {
      id: 'landmark-1',
      name: 'Test Landmark',
      domains: ['Cursed', 'Desolate'],
      defaultStress: 'd6',
      haunts: ['Ghost', 'Shadow'],
      bonds: ['Ancient pact', 'Blood oath']
    };

    it('should add a landmark', () => {
      const action = { type: 'ADD_LANDMARK' as const, payload: mockLandmark };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.landmarks).toHaveLength(1);
      expect(newState.landmarks[0]).toEqual(mockLandmark);
    });

    it('should update a landmark', () => {
      const stateWithLandmark = {
        ...getInitialState(),
        landmarks: [mockLandmark]
      };

      const action = {
        type: 'UPDATE_LANDMARK' as const,
        payload: { id: 'landmark-1', landmark: { name: 'Updated Landmark' } }
      };

      const newState = delveMapReducer(stateWithLandmark, action);

      expect(newState.landmarks[0].name).toBe('Updated Landmark');
      expect(newState.landmarks[0].domains).toEqual(['Cursed', 'Desolate']);
    });

    it('should delete a landmark and remove related placed cards and connections', () => {
      const placedCard: PlacedCard = {
        id: 'landmark-1',
        type: 'landmark',
        position: { q: 0, r: 0 }
      };

      const connection: Connection = {
        id: 'conn-1',
        fromId: 'landmark-1',
        toId: 'delve-1',
        type: 'landmark-to-delve'
      };

      const stateWithData = {
        ...getInitialState(),
        landmarks: [mockLandmark],
        placedCards: [placedCard],
        connections: [connection]
      };

      const action = { type: 'DELETE_LANDMARK' as const, payload: 'landmark-1' };
      const newState = delveMapReducer(stateWithData, action);

      expect(newState.landmarks).toHaveLength(0);
      expect(newState.placedCards).toHaveLength(0);
      expect(newState.connections).toHaveLength(0);
    });
  });

  describe('Delve actions', () => {
    const mockDelve: Delve = {
      id: 'delve-1',
      name: 'Test Delve',
      resistance: 25,
      domains: ['Warren', 'Wild'],
      events: ['Cave-in', 'Strange noise'],
      resources: ['Iron ore', 'Fresh water'],
      monsters: []
    };

    it('should add a delve', () => {
      const action = { type: 'ADD_DELVE' as const, payload: mockDelve };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.delves).toHaveLength(1);
      expect(newState.delves[0]).toEqual(mockDelve);
    });

    it('should update a delve', () => {
      const stateWithDelve = {
        ...getInitialState(),
        delves: [mockDelve]
      };

      const action = {
        type: 'UPDATE_DELVE' as const,
        payload: { id: 'delve-1', delve: { resistance: 30 } }
      };

      const newState = delveMapReducer(stateWithDelve, action);

      expect(newState.delves[0].resistance).toBe(30);
      expect(newState.delves[0].name).toBe('Test Delve');
    });

    it('should delete a delve and remove related placed cards and connections', () => {
      const placedCard: PlacedCard = {
        id: 'delve-1',
        type: 'delve',
        position: { q: 1, r: 1 }
      };

      const connection: Connection = {
        id: 'conn-1',
        fromId: 'landmark-1',
        toId: 'delve-1',
        type: 'landmark-to-delve'
      };

      const stateWithData = {
        ...getInitialState(),
        delves: [mockDelve],
        placedCards: [placedCard],
        connections: [connection]
      };

      const action = { type: 'DELETE_DELVE' as const, payload: 'delve-1' };
      const newState = delveMapReducer(stateWithData, action);

      expect(newState.delves).toHaveLength(0);
      expect(newState.placedCards).toHaveLength(0);
      expect(newState.connections).toHaveLength(0);
    });
  });

  describe('Monster actions', () => {
    const mockMonster: Monster = {
      id: 'monster-1',
      name: 'Test Monster',
      resistance: 15,
      protection: 8,
      attacks: ['Claw', 'Bite'],
      resources: ['Hide', 'Bone'],
      notes: 'A fearsome creature'
    };

    const mockDelve: Delve = {
      id: 'delve-1',
      name: 'Test Delve',
      resistance: 25,
      domains: ['Warren'],
      events: [],
      resources: [],
      monsters: []
    };

    it('should add a monster to a delve', () => {
      const stateWithDelve = {
        ...getInitialState(),
        delves: [mockDelve]
      };

      const action = {
        type: 'ADD_MONSTER' as const,
        payload: { delveId: 'delve-1', monster: mockMonster }
      };

      const newState = delveMapReducer(stateWithDelve, action);

      expect(newState.delves[0].monsters).toHaveLength(1);
      expect(newState.delves[0].monsters[0]).toEqual(mockMonster);
    });

    it('should update a monster in a delve', () => {
      const delveWithMonster = {
        ...mockDelve,
        monsters: [mockMonster]
      };

      const stateWithData = {
        ...getInitialState(),
        delves: [delveWithMonster]
      };

      const action = {
        type: 'UPDATE_MONSTER' as const,
        payload: {
          delveId: 'delve-1',
          monsterId: 'monster-1',
          monster: { resistance: 20 }
        }
      };

      const newState = delveMapReducer(stateWithData, action);

      expect(newState.delves[0].monsters[0].resistance).toBe(20);
      expect(newState.delves[0].monsters[0].name).toBe('Test Monster');
    });

    it('should delete a monster from a delve', () => {
      const delveWithMonster = {
        ...mockDelve,
        monsters: [mockMonster]
      };

      const stateWithData = {
        ...getInitialState(),
        delves: [delveWithMonster]
      };

      const action = {
        type: 'DELETE_MONSTER' as const,
        payload: { delveId: 'delve-1', monsterId: 'monster-1' }
      };

      const newState = delveMapReducer(stateWithData, action);

      expect(newState.delves[0].monsters).toHaveLength(0);
    });
  });

  describe('Connection actions', () => {
    const mockConnection: Connection = {
      id: 'conn-1',
      fromId: 'landmark-1',
      toId: 'delve-1',
      type: 'landmark-to-delve'
    };

    it('should add a connection', () => {
      const action = { type: 'ADD_CONNECTION' as const, payload: mockConnection };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.connections).toHaveLength(1);
      expect(newState.connections[0]).toEqual(mockConnection);
    });

    it('should update a connection', () => {
      const stateWithConnection = {
        ...getInitialState(),
        connections: [mockConnection]
      };

      const action = {
        type: 'UPDATE_CONNECTION' as const,
        payload: { id: 'conn-1', connection: { type: 'delve-to-delve' as const } }
      };

      const newState = delveMapReducer(stateWithConnection, action);

      expect(newState.connections[0].type).toBe('delve-to-delve');
      expect(newState.connections[0].fromId).toBe('landmark-1');
    });

    it('should delete a connection', () => {
      const stateWithConnection = {
        ...getInitialState(),
        connections: [mockConnection]
      };

      const action = { type: 'DELETE_CONNECTION' as const, payload: 'conn-1' };
      const newState = delveMapReducer(stateWithConnection, action);

      expect(newState.connections).toHaveLength(0);
    });
  });

  describe('Card positioning actions', () => {
    const mockPlacedCard: PlacedCard = {
      id: 'card-1',
      type: 'landmark',
      position: { q: 0, r: 0 }
    };

    it('should place a card', () => {
      const action = { type: 'PLACE_CARD' as const, payload: mockPlacedCard };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.placedCards).toHaveLength(1);
      expect(newState.placedCards[0]).toEqual(mockPlacedCard);
    });

    it('should replace existing card when placing with same id', () => {
      const stateWithCard = {
        ...getInitialState(),
        placedCards: [mockPlacedCard]
      };

      const updatedCard = {
        ...mockPlacedCard,
        position: { q: 1, r: 1 }
      };

      const action = { type: 'PLACE_CARD' as const, payload: updatedCard };
      const newState = delveMapReducer(stateWithCard, action);

      expect(newState.placedCards).toHaveLength(1);
      expect(newState.placedCards[0].position).toEqual({ q: 1, r: 1 });
    });

    it('should move a card', () => {
      const stateWithCard = {
        ...getInitialState(),
        placedCards: [mockPlacedCard]
      };

      const action = {
        type: 'MOVE_CARD' as const,
        payload: { id: 'card-1', position: { q: 2, r: 2 } }
      };

      const newState = delveMapReducer(stateWithCard, action);

      expect(newState.placedCards[0].position).toEqual({ q: 2, r: 2 });
    });

    it('should remove a placed card', () => {
      const stateWithCard = {
        ...getInitialState(),
        placedCards: [mockPlacedCard]
      };

      const action = { type: 'REMOVE_PLACED_CARD' as const, payload: 'card-1' };
      const newState = delveMapReducer(stateWithCard, action);

      expect(newState.placedCards).toHaveLength(0);
    });
  });

  describe('Drag and drop actions', () => {
    it('should set dragged card', () => {
      const action = { type: 'SET_DRAGGED_CARD' as const, payload: 'card-1' };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.draggedCard).toBe('card-1');
    });

    it('should set selected card', () => {
      const action = { type: 'SET_SELECTED_CARD' as const, payload: 'card-1' };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.selectedCard).toBe('card-1');
    });

    it('should set editing card', () => {
      const action = { type: 'SET_EDITING_CARD' as const, payload: 'card-1' };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.editingCard).toBe('card-1');
    });
  });

  describe('Library actions', () => {
    const mockLandmark: Landmark = {
      id: 'lib-landmark-1',
      name: 'Library Landmark',
      domains: ['Haven'],
      defaultStress: 'd8',
      haunts: [],
      bonds: []
    };

    const mockDelve: Delve = {
      id: 'lib-delve-1',
      name: 'Library Delve',
      resistance: 20,
      domains: ['Technology'],
      events: [],
      resources: [],
      monsters: []
    };

    const mockMonster: Monster = {
      id: 'lib-monster-1',
      name: 'Library Monster',
      resistance: 10,
      protection: 5,
      attacks: [],
      resources: [],
      notes: ''
    };

    it('should add landmark to library', () => {
      const action = {
        type: 'ADD_TO_LIBRARY' as const,
        payload: { type: 'landmark' as const, item: mockLandmark }
      };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.library.landmarks).toHaveLength(1);
      expect(newState.library.landmarks[0]).toEqual(mockLandmark);
    });

    it('should add delve to library', () => {
      const action = {
        type: 'ADD_TO_LIBRARY' as const,
        payload: { type: 'delve' as const, item: mockDelve }
      };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.library.delves).toHaveLength(1);
      expect(newState.library.delves[0]).toEqual(mockDelve);
    });

    it('should add monster to library', () => {
      const action = {
        type: 'ADD_TO_LIBRARY' as const,
        payload: { type: 'monster' as const, item: mockMonster }
      };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.library.monsters).toHaveLength(1);
      expect(newState.library.monsters[0]).toEqual(mockMonster);
    });

    it('should update library landmark', () => {
      const initialState = getInitialState();
      const stateWithLibrary = {
        ...initialState,
        library: {
          ...initialState.library,
          landmarks: [mockLandmark]
        }
      };

      const action = {
        type: 'UPDATE_LIBRARY_ITEM' as const,
        payload: {
          type: 'landmark' as const,
          id: 'lib-landmark-1',
          item: { name: 'Updated Library Landmark' }
        }
      };

      const newState = delveMapReducer(stateWithLibrary, action);

      expect(newState.library.landmarks[0].name).toBe('Updated Library Landmark');
    });

    it('should delete from library', () => {
      const stateWithLibrary = {
        ...getInitialState(),
        library: {
          landmarks: [mockLandmark],
          delves: [mockDelve],
          monsters: [mockMonster]
        }
      };

      const action = {
        type: 'DELETE_FROM_LIBRARY' as const,
        payload: { type: 'landmark' as const, id: 'lib-landmark-1' }
      };

      const newState = delveMapReducer(stateWithLibrary, action);

      expect(newState.library.landmarks).toHaveLength(0);
      expect(newState.library.delves).toHaveLength(1);
      expect(newState.library.monsters).toHaveLength(1);
    });
  });

  describe('Map actions', () => {
    const mockLandmark: Landmark = {
      id: 'landmark-1',
      name: 'Map Landmark',
      domains: ['Cursed'],
      defaultStress: 'd6',
      haunts: [],
      bonds: []
    };

    const mockDelve: Delve = {
      id: 'delve-1',
      name: 'Map Delve',
      resistance: 15,
      domains: ['Wild'],
      events: [],
      resources: [],
      monsters: []
    };

    const mockPlacedCard: PlacedCard = {
      id: 'landmark-1',
      type: 'landmark',
      position: { q: 0, r: 0 }
    };

    const mockConnection: Connection = {
      id: 'conn-1',
      fromId: 'landmark-1',
      toId: 'delve-1',
      type: 'landmark-to-delve'
    };

    const mockMap = {
      id: 'map-1',
      name: 'Test Map',
      landmarks: [mockLandmark],
      delves: [mockDelve],
      placedCards: [mockPlacedCard],
      connections: [mockConnection],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should load a map', () => {
      const action = { type: 'LOAD_MAP' as const, payload: mockMap };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.currentMap).toEqual(mockMap);
      expect(newState.landmarks).toEqual(mockMap.landmarks);
      expect(newState.delves).toEqual(mockMap.delves);
      expect(newState.placedCards).toEqual(mockMap.placedCards);
      expect(newState.connections).toEqual(mockMap.connections);
    });

    it('should create a new map', () => {
      const action = { type: 'CREATE_NEW_MAP' as const, payload: { name: 'New Map' } };
      const newState = delveMapReducer(getInitialState(), action);

      expect(newState.currentMap).toBeDefined();
      expect(newState.currentMap?.name).toBe('New Map');
      expect(newState.landmarks).toHaveLength(0);
      expect(newState.delves).toHaveLength(0);
      expect(newState.placedCards).toHaveLength(0);
      expect(newState.connections).toHaveLength(0);
    });

    it('should clear the map', () => {
      const stateWithData = {
        ...getInitialState(),
        currentMap: mockMap,
        landmarks: mockMap.landmarks,
        delves: mockMap.delves,
        placedCards: mockMap.placedCards,
        connections: mockMap.connections,
        selectedCard: 'card-1',
        editingCard: 'card-2',
        draggedCard: 'card-3'
      };

      const action = { type: 'CLEAR_MAP' as const };
      const newState = delveMapReducer(stateWithData, action);

      expect(newState.currentMap).toBeNull();
      expect(newState.landmarks).toHaveLength(0);
      expect(newState.delves).toHaveLength(0);
      expect(newState.placedCards).toHaveLength(0);
      expect(newState.connections).toHaveLength(0);
      expect(newState.selectedCard).toBeNull();
      expect(newState.editingCard).toBeNull();
      expect(newState.draggedCard).toBeNull();
    });
  });

  describe('Unknown action', () => {
    it('should return current state for unknown action', () => {
      const initialState = getInitialState();
      const unknownAction = { type: 'UNKNOWN_ACTION' as any };
      const newState = delveMapReducer(initialState, unknownAction);

      expect(newState).toBe(initialState);
    });
  });
});