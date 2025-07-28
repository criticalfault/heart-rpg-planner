# Heart RPG Types Module

This module contains TypeScript type definitions and validation utilities for the Heart RPG Delve Map application.

## Files

- `index.ts` - Core type definitions for Heart RPG domain models
- `validators.ts` - Runtime validation functions for type safety
- `__tests__/validators.test.ts` - Unit tests for validation utilities

## Core Types

### Domain Models
- `Domain` - Heart RPG domains (Cursed, Desolate, Haven, etc.)
- `StressDie` - Stress dice types (d4, d6, d8, d10, d12)
- `Landmark` - Location cards with domains, stress, haunts, and bonds
- `Monster` - Creature definitions with combat stats and abilities
- `Delve` - Explorable areas with resistance, events, and monsters

### Spatial Types
- `HexPosition` - Hex grid coordinates (q, r)
- `PlacedCard` - Cards positioned on the hex grid
- `Connection` - Links between landmarks and delves

### Application State
- `DelveMap` - Complete map with all cards and connections
- `Library` - Personal collection of saved content
- `DelveMapState` - Application state for map management
- `UIState` - User interface state

## Validation

The `validators.ts` file provides runtime validation functions for all domain types:

- `validateLandmark()` - Validates landmark data
- `validateMonster()` - Validates monster stats and properties
- `validateDelve()` - Validates delve data including nested monsters
- `validateHexPosition()` - Validates hex coordinates
- `validateConnection()` - Validates connections between cards
- `validatePlacedCard()` - Validates positioned cards

All validation functions return an array of error messages. Use `isValid(errors)` to check if validation passed.

## Usage

```typescript
import type { Landmark, Monster, Delve } from './types';
import { validateLandmark, isValid } from './types/validators';

const landmark: Landmark = {
  id: '1',
  name: 'Ancient Temple',
  domains: ['Religion', 'Cursed'],
  defaultStress: 'd8',
  haunts: ['Restless spirits'],
  bonds: ['Sacred oath']
};

const errors = validateLandmark(landmark);
if (isValid(errors)) {
  // Landmark is valid
} else {
  console.error('Validation errors:', errors);
}
```