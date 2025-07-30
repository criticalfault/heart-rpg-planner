import { Landmark, Delve, Monster, Domain, StressDie } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Domain validation
export const isValidDomain = (domain: string): domain is Domain => {
  const validDomains: Domain[] = ['Cursed', 'Desolate', 'Haven', 'Occult', 'Religion', 'Technology', 'Warren', 'Wild'];
  return validDomains.includes(domain as Domain);
};

// Stress die validation
export const isValidStressDie = (die: string): die is StressDie => {
  const validDice: StressDie[] = ['d4', 'd6', 'd8', 'd10', 'd12'];
  return validDice.includes(die as StressDie);
};

// String validation helpers
export const isNonEmptyString = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isValidStringArray = (arr: string[]): boolean => {
  return Array.isArray(arr) && arr.every(item => typeof item === 'string');
};

// Number validation helpers
export const isInRange = (value: number, min: number, max: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
};

// Landmark validation
export const validateLandmark = (landmark: Partial<Landmark>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!landmark.name || !isNonEmptyString(landmark.name)) {
    errors.push({
      field: 'name',
      message: 'Landmark name is required and cannot be empty.'
    });
  } else if (landmark.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Landmark name must be 100 characters or less.'
    });
  }

  // Domains validation
  if (!landmark.domains || !Array.isArray(landmark.domains)) {
    errors.push({
      field: 'domains',
      message: 'At least one domain must be selected.'
    });
  } else if (landmark.domains.length === 0) {
    errors.push({
      field: 'domains',
      message: 'At least one domain must be selected.'
    });
  } else if (!landmark.domains.every(isValidDomain)) {
    errors.push({
      field: 'domains',
      message: 'One or more selected domains are invalid.'
    });
  }

  // Default stress validation
  if (!landmark.defaultStress || !isValidStressDie(landmark.defaultStress)) {
    errors.push({
      field: 'defaultStress',
      message: 'A valid stress die must be selected (d4, d6, d8, d10, or d12).'
    });
  }

  // Haunts validation
  if (landmark.haunts && !isValidStringArray(landmark.haunts)) {
    errors.push({
      field: 'haunts',
      message: 'Haunts must be a valid list of text entries.'
    });
  }

  // Bonds validation
  if (landmark.bonds && !isValidStringArray(landmark.bonds)) {
    errors.push({
      field: 'bonds',
      message: 'Bonds must be a valid list of text entries.'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Delve validation
export const validateDelve = (delve: Partial<Delve>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!delve.name || !isNonEmptyString(delve.name)) {
    errors.push({
      field: 'name',
      message: 'Delve name is required and cannot be empty.'
    });
  } else if (delve.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Delve name must be 100 characters or less.'
    });
  }

  // Resistance validation
  if (delve.resistance === undefined || delve.resistance === null) {
    errors.push({
      field: 'resistance',
      message: 'Resistance value is required.'
    });
  } else if (!isInRange(delve.resistance, 1, 50)) {
    errors.push({
      field: 'resistance',
      message: 'Resistance must be between 1 and 50.'
    });
  }

  // Domains validation
  if (!delve.domains || !Array.isArray(delve.domains)) {
    errors.push({
      field: 'domains',
      message: 'At least one domain must be selected.'
    });
  } else if (delve.domains.length === 0) {
    errors.push({
      field: 'domains',
      message: 'At least one domain must be selected.'
    });
  } else if (!delve.domains.every(isValidDomain)) {
    errors.push({
      field: 'domains',
      message: 'One or more selected domains are invalid.'
    });
  }

  // Events validation
  if (delve.events && !isValidStringArray(delve.events)) {
    errors.push({
      field: 'events',
      message: 'Events must be a valid list of text entries.'
    });
  }

  // Resources validation
  if (delve.resources && !isValidStringArray(delve.resources)) {
    errors.push({
      field: 'resources',
      message: 'Resources must be a valid list of text entries.'
    });
  }

  // Monsters validation
  if (delve.monsters && Array.isArray(delve.monsters)) {
    delve.monsters.forEach((monster, index) => {
      const monsterValidation = validateMonster(monster);
      if (!monsterValidation.isValid) {
        monsterValidation.errors.forEach(error => {
          errors.push({
            field: `monsters[${index}].${error.field}`,
            message: `Monster ${index + 1}: ${error.message}`
          });
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Monster validation
export const validateMonster = (monster: Partial<Monster>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!monster.name || !isNonEmptyString(monster.name)) {
    errors.push({
      field: 'name',
      message: 'Monster name is required and cannot be empty.'
    });
  } else if (monster.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Monster name must be 100 characters or less.'
    });
  }

  // Resistance validation
  if (monster.resistance === undefined || monster.resistance === null) {
    errors.push({
      field: 'resistance',
      message: 'Resistance value is required.'
    });
  } else if (!isInRange(monster.resistance, 1, 20)) {
    errors.push({
      field: 'resistance',
      message: 'Monster resistance must be between 1 and 20.'
    });
  }

  // Protection validation
  if (monster.protection === undefined || monster.protection === null) {
    errors.push({
      field: 'protection',
      message: 'Protection value is required.'
    });
  } else if (!isInRange(monster.protection, 1, 12)) {
    errors.push({
      field: 'protection',
      message: 'Monster protection must be between 1 and 12.'
    });
  }

  // Attacks validation
  if (monster.attacks && !isValidStringArray(monster.attacks)) {
    errors.push({
      field: 'attacks',
      message: 'Attacks must be a valid list of text entries.'
    });
  }

  // Resources validation
  if (monster.resources && !isValidStringArray(monster.resources)) {
    errors.push({
      field: 'resources',
      message: 'Resources must be a valid list of text entries.'
    });
  }

  // Notes validation (optional, but if provided should be string)
  if (monster.notes !== undefined && typeof monster.notes !== 'string') {
    errors.push({
      field: 'notes',
      message: 'Notes must be valid text.'
    });
  } else if (monster.notes && monster.notes.length > 1000) {
    errors.push({
      field: 'notes',
      message: 'Notes must be 1000 characters or less.'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to format validation errors for display
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return `Multiple validation errors:\n${errors.map(error => `• ${error.message}`).join('\n')}`;
};

// Helper function to get field-specific errors
export const getFieldErrors = (errors: ValidationError[], fieldName: string): ValidationError[] => {
  return errors.filter(error => error.field === fieldName || error.field.startsWith(`${fieldName}.`));
};

// Helper function to check if a specific field has errors
export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return getFieldErrors(errors, fieldName).length > 0;
};