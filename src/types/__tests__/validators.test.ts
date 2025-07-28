/**
 * Unit tests for type validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  isValidDomain,
  isValidStressDie,
  validateLandmark,
  validateMonster,
  validateDelve,
  validateHexPosition,
  validateConnection,
  validatePlacedCard,
  isValid,
  VALID_DOMAINS,
  VALID_STRESS_DICE
} from '../validators';
import type { Domain, StressDie, Landmark, Monster, Delve, Connection, PlacedCard } from '../index';

describe('Domain and StressDie validation', () => {
  it('should validate correct domains', () => {
    VALID_DOMAINS.forEach(domain => {
      expect(isValidDomain(domain)).toBe(true);
    });
  });

  it('should reject invalid domains', () => {
    expect(isValidDomain('InvalidDomain')).toBe(false);
    expect(isValidDomain('')).toBe(false);
  });

  it('should validate correct stress dice', () => {
    VALID_STRESS_DICE.forEach(die => {
      expect(isValidStressDie(die)).toBe(true);
    });
  });

  it('should reject invalid stress dice', () => {
    expect(isValidStressDie('d20')).toBe(false);
    expect(isValidStressDie('invalid')).toBe(false);
  });
});

describe('validateLandmark', () => {
  const validLandmark: Landmark = {
    id: '1',
    name: 'Test Landmark',
    domains: ['Cursed', 'Haven'],
    defaultStress: 'd6',
    haunts: ['Ghost'],
    bonds: ['Ancient pact']
  };

  it('should pass validation for valid landmark', () => {
    const errors = validateLandmark(validLandmark);
    expect(isValid(errors)).toBe(true);
  });

  it('should fail validation for missing name', () => {
    const errors = validateLandmark({ ...validLandmark, name: '' });
    expect(errors).toContain('Landmark name is required');
  });

  it('should fail validation for empty domains', () => {
    const errors = validateLandmark({ ...validLandmark, domains: [] });
    expect(errors).toContain('At least one domain must be selected');
  });

  it('should fail validation for invalid domains', () => {
    const errors = validateLandmark({ 
      ...validLandmark, 
      domains: ['InvalidDomain' as unknown as Domain] 
    });
    expect(errors.some(error => error.includes('Invalid domains'))).toBe(true);
  });

  it('should fail validation for invalid stress die', () => {
    const errors = validateLandmark({ 
      ...validLandmark, 
      defaultStress: 'd20' as unknown as StressDie 
    });
    expect(errors).toContain('Valid default stress die must be selected');
  });
});

describe('validateMonster', () => {
  const validMonster: Monster = {
    id: '1',
    name: 'Test Monster',
    resistance: 10,
    protection: 5,
    attacks: ['Claw'],
    resources: ['Bone'],
    notes: 'Dangerous creature'
  };

  it('should pass validation for valid monster', () => {
    const errors = validateMonster(validMonster);
    expect(isValid(errors)).toBe(true);
  });

  it('should fail validation for missing name', () => {
    const errors = validateMonster({ ...validMonster, name: '' });
    expect(errors).toContain('Monster name is required');
  });

  it('should fail validation for invalid resistance', () => {
    const errors = validateMonster({ ...validMonster, resistance: 0 });
    expect(errors).toContain('Monster resistance must be between 1 and 20');
    
    const errors2 = validateMonster({ ...validMonster, resistance: 21 });
    expect(errors2).toContain('Monster resistance must be between 1 and 20');
  });

  it('should fail validation for invalid protection', () => {
    const errors = validateMonster({ ...validMonster, protection: 0 });
    expect(errors).toContain('Monster protection must be between 1 and 12');
    
    const errors2 = validateMonster({ ...validMonster, protection: 13 });
    expect(errors2).toContain('Monster protection must be between 1 and 12');
  });
});

describe('validateDelve', () => {
  const validDelve: Delve = {
    id: '1',
    name: 'Test Delve',
    resistance: 25,
    domains: ['Warren', 'Technology'],
    events: ['Cave-in'],
    resources: ['Scrap metal'],
    monsters: []
  };

  it('should pass validation for valid delve', () => {
    const errors = validateDelve(validDelve);
    expect(isValid(errors)).toBe(true);
  });

  it('should fail validation for missing name', () => {
    const errors = validateDelve({ ...validDelve, name: '' });
    expect(errors).toContain('Delve name is required');
  });

  it('should fail validation for invalid resistance', () => {
    const errors = validateDelve({ ...validDelve, resistance: 0 });
    expect(errors).toContain('Delve resistance must be between 1 and 50');
    
    const errors2 = validateDelve({ ...validDelve, resistance: 51 });
    expect(errors2).toContain('Delve resistance must be between 1 and 50');
  });

  it('should fail validation for empty domains', () => {
    const errors = validateDelve({ ...validDelve, domains: [] });
    expect(errors).toContain('At least one domain must be selected');
  });

  it('should validate nested monsters', () => {
    const invalidMonster = {
      id: '1',
      name: '',
      resistance: 0,
      protection: 0,
      attacks: [],
      resources: [],
      notes: ''
    };
    
    const errors = validateDelve({ 
      ...validDelve, 
      monsters: [invalidMonster] 
    });
    
    expect(errors.some(error => error.includes('Monster 1:'))).toBe(true);
  });
});

describe('validateHexPosition', () => {
  it('should pass validation for valid hex position', () => {
    const errors = validateHexPosition({ q: 0, r: 0 });
    expect(isValid(errors)).toBe(true);
  });

  it('should fail validation for non-integer coordinates', () => {
    const errors = validateHexPosition({ q: 1.5, r: 2 });
    expect(errors).toContain('Hex position q coordinate must be an integer');
    
    const errors2 = validateHexPosition({ q: 1, r: 2.5 });
    expect(errors2).toContain('Hex position r coordinate must be an integer');
  });

  it('should fail validation for missing coordinates', () => {
    const errors = validateHexPosition({});
    expect(errors).toContain('Hex position q coordinate must be an integer');
    expect(errors).toContain('Hex position r coordinate must be an integer');
  });
});

describe('validateConnection', () => {
  const validConnection: Connection = {
    id: '1',
    fromId: 'landmark1',
    toId: 'delve1',
    type: 'landmark-to-delve'
  };

  it('should pass validation for valid connection', () => {
    const errors = validateConnection(validConnection);
    expect(isValid(errors)).toBe(true);
  });

  it('should fail validation for missing fromId', () => {
    const errors = validateConnection({ ...validConnection, fromId: '' });
    expect(errors).toContain('Connection fromId is required');
  });

  it('should fail validation for missing toId', () => {
    const errors = validateConnection({ ...validConnection, toId: '' });
    expect(errors).toContain('Connection toId is required');
  });

  it('should fail validation for self-connection', () => {
    const errors = validateConnection({ 
      ...validConnection, 
      fromId: 'same', 
      toId: 'same' 
    });
    expect(errors).toContain('Connection cannot link to itself');
  });

  it('should fail validation for invalid type', () => {
    const errors = validateConnection({ 
      ...validConnection, 
      type: 'invalid-type' as unknown as Connection['type']
    });
    expect(errors).toContain('Valid connection type is required');
  });
});

describe('validatePlacedCard', () => {
  const validPlacedCard: PlacedCard = {
    id: 'card1',
    type: 'landmark',
    position: { q: 0, r: 0 }
  };

  it('should pass validation for valid placed card', () => {
    const errors = validatePlacedCard(validPlacedCard);
    expect(isValid(errors)).toBe(true);
  });

  it('should fail validation for missing id', () => {
    const errors = validatePlacedCard({ ...validPlacedCard, id: '' });
    expect(errors).toContain('Placed card ID is required');
  });

  it('should fail validation for invalid type', () => {
    const errors = validatePlacedCard({ 
      ...validPlacedCard, 
      type: 'invalid' as unknown as PlacedCard['type']
    });
    expect(errors).toContain('Valid card type is required');
  });

  it('should fail validation for missing position', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { position, ...cardWithoutPosition } = validPlacedCard;
    const errors = validatePlacedCard(cardWithoutPosition);
    expect(errors).toContain('Card position is required');
  });

  it('should validate nested position', () => {
    const errors = validatePlacedCard({
      ...validPlacedCard,
      position: { q: 1.5, r: 2 }
    });
    expect(errors).toContain('Hex position q coordinate must be an integer');
  });
});

describe('isValid utility', () => {
  it('should return true for empty error array', () => {
    expect(isValid([])).toBe(true);
  });

  it('should return false for non-empty error array', () => {
    expect(isValid(['error'])).toBe(false);
  });
});