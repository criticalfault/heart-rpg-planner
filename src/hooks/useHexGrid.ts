import { useState, useCallback, useMemo } from 'react';
import { HexPosition } from '../types';
import { 
  HexGridConfig, 
  DEFAULT_HEX_CONFIG, 
  PixelPosition, 
  hexToPixel, 
  pixelToHex, 
  snapToHex,
  hexDistance 
} from '../utils/hexUtils';

export interface UseHexGridOptions {
  config?: HexGridConfig;
  initialShowGrid?: boolean;
}

export interface UseHexGridReturn {
  config: HexGridConfig;
  showGrid: boolean;
  toggleGrid: () => void;
  setShowGrid: (show: boolean) => void;
  hexToPixel: (hex: HexPosition) => PixelPosition;
  pixelToHex: (pixel: PixelPosition) => HexPosition;
  snapToHex: (pixel: PixelPosition) => { hex: HexPosition; pixel: PixelPosition };
  getDistance: (a: HexPosition, b: HexPosition) => number;
  isValidPosition: (hex: HexPosition, occupiedPositions?: HexPosition[]) => boolean;
  findNearestFreePosition: (target: HexPosition, occupiedPositions: HexPosition[]) => HexPosition;
}

export function useHexGrid(options: UseHexGridOptions = {}): UseHexGridReturn {
  const { config = DEFAULT_HEX_CONFIG, initialShowGrid = true } = options;
  const [showGrid, setShowGrid] = useState(initialShowGrid);

  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  // Memoized utility functions with current config
  const hexToPixelMemo = useCallback((hex: HexPosition) => {
    return hexToPixel(hex, config);
  }, [config]);

  const pixelToHexMemo = useCallback((pixel: PixelPosition) => {
    return pixelToHex(pixel, config);
  }, [config]);

  const snapToHexMemo = useCallback((pixel: PixelPosition) => {
    return snapToHex(pixel, config);
  }, [config]);

  const getDistance = useCallback((a: HexPosition, b: HexPosition) => {
    return hexDistance(a, b);
  }, []);

  // Check if a hex position is valid (not occupied)
  const isValidPosition = useCallback((hex: HexPosition, occupiedPositions: HexPosition[] = []) => {
    return !occupiedPositions.some(pos => pos.q === hex.q && pos.r === hex.r);
  }, []);

  // Find the nearest free position to a target hex
  const findNearestFreePosition = useCallback((target: HexPosition, occupiedPositions: HexPosition[]): HexPosition => {
    if (isValidPosition(target, occupiedPositions)) {
      return target;
    }

    // Search in expanding rings around the target
    for (let radius = 1; radius <= 10; radius++) {
      const candidates: HexPosition[] = [];
      
      // Generate all positions at this radius
      for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q - radius);
        const r2 = Math.min(radius, -q + radius);
        
        for (let r = r1; r <= r2; r++) {
          const candidate = { q: target.q + q, r: target.r + r };
          if (hexDistance(target, candidate) === radius && isValidPosition(candidate, occupiedPositions)) {
            candidates.push(candidate);
          }
        }
      }

      if (candidates.length > 0) {
        // Return the first valid candidate (could be randomized or sorted by preference)
        return candidates[0];
      }
    }

    // Fallback: return target position anyway
    return target;
  }, [isValidPosition]);

  return useMemo(() => ({
    config,
    showGrid,
    toggleGrid,
    setShowGrid,
    hexToPixel: hexToPixelMemo,
    pixelToHex: pixelToHexMemo,
    snapToHex: snapToHexMemo,
    getDistance,
    isValidPosition,
    findNearestFreePosition,
  }), [
    config,
    showGrid,
    toggleGrid,
    setShowGrid,
    hexToPixelMemo,
    pixelToHexMemo,
    snapToHexMemo,
    getDistance,
    isValidPosition,
    findNearestFreePosition,
  ]);
}