/**
 * Heart RPG Domain Types and Interfaces
 * 
 * This file contains all TypeScript type definitions for the Heart RPG Delve Map application.
 * These types represent the core domain models and data structures used throughout the app.
 */

// Heart RPG Domain Types
export type Domain = 'Cursed' | 'Desolate' | 'Haven' | 'Occult' | 'Religion' | 'Technology' | 'Warren' | 'Wild';
export type StressDie = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';

// Core Domain Models
export interface Landmark {
  id: string;
  name: string;
  domains: Domain[];
  defaultStress: StressDie;
  haunts: string[];
  bonds: string[];
}

export interface Monster {
  id: string;
  name: string;
  resistance: number; // 1-20
  protection: number; // 1-12
  attacks: string[];
  resources: string[];
  notes: string;
}

export interface Delve {
  id: string;
  name: string;
  resistance: number; // 1-50
  domains: Domain[];
  events: string[];
  resources: string[];
  monsters: Monster[];
}

// Spatial and Connection Types
export interface HexPosition {
  q: number; // hex coordinate q
  r: number; // hex coordinate r
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: 'landmark-to-delve' | 'delve-to-delve' | 'landmark-to-landmark';
}

export interface PlacedCard {
  id: string;
  type: 'landmark' | 'delve';
  position: HexPosition;
}

// Map and Library Types
export interface DelveMap {
  id: string;
  name: string;
  landmarks: Landmark[];
  delves: Delve[];
  placedCards: PlacedCard[];
  connections: Connection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Library {
  monsters: Monster[];
  landmarks: Landmark[];
  delves: Delve[];
}

// Application State Types
export interface DelveMapState {
  currentMap: DelveMap | null;
  landmarks: Landmark[];
  delves: Delve[];
  placedCards: PlacedCard[];
  connections: Connection[];
  selectedCard: string | null;
  editingCard: string | null;
  draggedCard: string | null;
  library: Library;
}

export interface UIState {
  loading: boolean;
  error: string | null;
  modalOpen: boolean;
  cardFilter: 'all' | 'landmarks' | 'delves';
  showConnections: boolean;
  gridVisible: boolean;
  currentView: 'map' | 'library';
}

export interface AppState {
  delveMap: DelveMapState;
  ui: UIState;
}