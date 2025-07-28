/**
 * Type Validation Utilities
 * 
 * This file contains validation functions for Heart RPG domain types
 * to ensure data integrity and type safety at runtime.
 */

import type { Domain, StressDie, Landmark, Monster, Delve, HexPosition, Connection, PlacedCard } from './index';

// Domain validation
export const VALID_DOMAINS: Domain[] = ['Cursed', 'Desolate', 'Haven', 'Occult', 'Religion', 'Technology', 'Warren', 'Wild'];
export const VALID_STRESS_DICE: StressDie[] = ['d4', 'd6', 'd8', 'd10', 'd12'];

export function isValidDomain(domain: string): domain is Domain {
  return VALID_DOMAINS.includes(domain as Domain);
}

export function isValidStressDie(die: string): die is StressDie {
  return VALID_STRESS_DICE.includes(die as StressDie);
}

// Landmark validation
export function validateLandmark(landmark: Partial<Landmark>): string[] {
  const errors: string[] = [];

  if (!landmark.name || landmark.name.trim() === '') {
    errors.push('Landmark name is required');
  }

  if (!landmark.domains || landmark.domains.length === 0) {
    errors.push('At least one domain must be selected');
  } else {
    const invalidDomains = landmark.domains.filter(domain => !isValidDomain(domain));
    if (invalidDomains.length > 0) {
      errors.push(`Invalid domains: ${invalidDomains.join(', ')}`);
    }
  }

  if (!landmark.defaultStress || !isValidStressDie(landmark.defaultStress)) {
    errors.push('Valid default stress die must be selected');
  }

  return errors;
}

// Monster validation
export function validateMonster(monster: Partial<Monster>): string[] {
  const errors: string[] = [];

  if (!monster.name || monster.name.trim() === '') {
    errors.push('Monster name is required');
  }

  if (monster.resistance === undefined || monster.resistance < 1 || monster.resistance > 20) {
    errors.push('Monster resistance must be between 1 and 20');
  }

  if (monster.protection === undefined || monster.protection < 1 || monster.protection > 12) {
    errors.push('Monster protection must be between 1 and 12');
  }

  return errors;
}

// Delve validation
export function validateDelve(delve: Partial<Delve>): string[] {
  const errors: string[] = [];

  if (!delve.name || delve.name.trim() === '') {
    errors.push('Delve name is required');
  }

  if (delve.resistance === undefined || delve.resistance < 1 || delve.resistance > 50) {
    errors.push('Delve resistance must be between 1 and 50');
  }

  if (!delve.domains || delve.domains.length === 0) {
    errors.push('At least one domain must be selected');
  } else {
    const invalidDomains = delve.domains.filter(domain => !isValidDomain(domain));
    if (invalidDomains.length > 0) {
      errors.push(`Invalid domains: ${invalidDomains.join(', ')}`);
    }
  }

  // Validate nested monsters
  if (delve.monsters) {
    delve.monsters.forEach((monster, index) => {
      const monsterErrors = validateMonster(monster);
      if (monsterErrors.length > 0) {
        errors.push(`Monster ${index + 1}: ${monsterErrors.join(', ')}`);
      }
    });
  }

  return errors;
}

// Hex position validation
export function validateHexPosition(position: Partial<HexPosition>): string[] {
  const errors: string[] = [];

  if (position.q === undefined || !Number.isInteger(position.q)) {
    errors.push('Hex position q coordinate must be an integer');
  }

  if (position.r === undefined || !Number.isInteger(position.r)) {
    errors.push('Hex position r coordinate must be an integer');
  }

  return errors;
}

// Connection validation
export function validateConnection(connection: Partial<Connection>): string[] {
  const errors: string[] = [];

  if (!connection.fromId || connection.fromId.trim() === '') {
    errors.push('Connection fromId is required');
  }

  if (!connection.toId || connection.toId.trim() === '') {
    errors.push('Connection toId is required');
  }

  if (connection.fromId === connection.toId) {
    errors.push('Connection cannot link to itself');
  }

  const validTypes = ['landmark-to-delve', 'delve-to-delve', 'landmark-to-landmark'];
  if (!connection.type || !validTypes.includes(connection.type)) {
    errors.push('Valid connection type is required');
  }

  return errors;
}

// Placed card validation
export function validatePlacedCard(placedCard: Partial<PlacedCard>): string[] {
  const errors: string[] = [];

  if (!placedCard.id || placedCard.id.trim() === '') {
    errors.push('Placed card ID is required');
  }

  const validTypes = ['landmark', 'delve'];
  if (!placedCard.type || !validTypes.includes(placedCard.type)) {
    errors.push('Valid card type is required');
  }

  if (placedCard.position) {
    const positionErrors = validateHexPosition(placedCard.position);
    errors.push(...positionErrors);
  } else {
    errors.push('Card position is required');
  }

  return errors;
}

// Utility function to check if validation passed
export function isValid(errors: string[]): boolean {
  return errors.length === 0;
}