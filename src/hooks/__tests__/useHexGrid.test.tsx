import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHexGrid } from '../useHexGrid';
import { HexPosition } from '../../types';
import { DEFAULT_HEX_CONFIG } from '../../utils/hexUtils';

describe('useHexGrid', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useHexGrid());
    
    expect(result.current.config).toEqual(DEFAULT_HEX_CONFIG);
    expect(result.current.showGrid).toBe(true);
    expect(typeof result.current.toggleGrid).toBe('function');
    expect(typeof result.current.setShowGrid).toBe('function');
    expect(typeof result.current.hexToPixel).toBe('function');
    expect(typeof result.current.pixelToHex).toBe('function');
    expect(typeof result.current.snapToHex).toBe('function');
    expect(typeof result.current.getDistance).toBe('function');
    expect(typeof result.current.isValidPosition).toBe('function');
    expect(typeof result.current.findNearestFreePosition).toBe('function');
  });

  it('should initialize with custom options', () => {
    const customConfig = { hexSize: 100, spacing: 20 };
    const { result } = renderHook(() => 
      useHexGrid({ config: customConfig, initialShowGrid: false })
    );
    
    expect(result.current.config).toEqual(customConfig);
    expect(result.current.showGrid).toBe(false);
  });

  describe('grid visibility', () => {
    it('should toggle grid visibility', () => {
      const { result } = renderHook(() => useHexGrid());
      
      expect(result.current.showGrid).toBe(true);
      
      act(() => {
        result.current.toggleGrid();
      });
      
      expect(result.current.showGrid).toBe(false);
      
      act(() => {
        result.current.toggleGrid();
      });
      
      expect(result.current.showGrid).toBe(true);
    });

    it('should set grid visibility directly', () => {
      const { result } = renderHook(() => useHexGrid());
      
      act(() => {
        result.current.setShowGrid(false);
      });
      
      expect(result.current.showGrid).toBe(false);
      
      act(() => {
        result.current.setShowGrid(true);
      });
      
      expect(result.current.showGrid).toBe(true);
    });
  });

  describe('coordinate conversion', () => {
    it('should convert hex to pixel coordinates', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const hex: HexPosition = { q: 1, r: 0 };
      const pixel = result.current.hexToPixel(hex);
      
      expect(pixel.x).toBe(DEFAULT_HEX_CONFIG.hexSize * 1.5);
      expect(pixel.y).toBeCloseTo(DEFAULT_HEX_CONFIG.hexSize * Math.sqrt(3) / 2);
    });

    it('should convert pixel to hex coordinates', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const pixel = { x: 90, y: 52 }; // Approximately (1, 0) in hex
      const hex = result.current.pixelToHex(pixel);
      
      expect(hex.q).toBe(1);
      expect(hex.r).toBe(0);
    });

    it('should snap pixel to nearest hex', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const pixel = { x: 85, y: 50 }; // Close to (1, 0) hex center
      const snapped = result.current.snapToHex(pixel);
      
      expect(snapped.hex.q).toBe(1);
      expect(snapped.hex.r).toBe(0);
      expect(snapped.pixel.x).toBe(DEFAULT_HEX_CONFIG.hexSize * 1.5);
    });

    it('should use custom config for conversions', () => {
      const customConfig = { hexSize: 100, spacing: 20 };
      const { result } = renderHook(() => useHexGrid({ config: customConfig }));
      
      const hex: HexPosition = { q: 1, r: 0 };
      const pixel = result.current.hexToPixel(hex);
      
      expect(pixel.x).toBe(150); // 100 * 1.5
      expect(pixel.y).toBeCloseTo(100 * Math.sqrt(3) / 2);
    });
  });

  describe('distance calculation', () => {
    it('should calculate distance between hex positions', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const hex1: HexPosition = { q: 0, r: 0 };
      const hex2: HexPosition = { q: 2, r: 0 };
      
      const distance = result.current.getDistance(hex1, hex2);
      expect(distance).toBe(2);
    });

    it('should return 0 for same position', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const hex: HexPosition = { q: 1, r: -1 };
      const distance = result.current.getDistance(hex, hex);
      
      expect(distance).toBe(0);
    });
  });

  describe('position validation', () => {
    it('should validate empty position as valid', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const hex: HexPosition = { q: 1, r: 1 };
      const isValid = result.current.isValidPosition(hex, []);
      
      expect(isValid).toBe(true);
    });

    it('should validate unoccupied position as valid', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const hex: HexPosition = { q: 1, r: 1 };
      const occupied: HexPosition[] = [{ q: 0, r: 0 }, { q: 2, r: 2 }];
      const isValid = result.current.isValidPosition(hex, occupied);
      
      expect(isValid).toBe(true);
    });

    it('should validate occupied position as invalid', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const hex: HexPosition = { q: 1, r: 1 };
      const occupied: HexPosition[] = [{ q: 0, r: 0 }, { q: 1, r: 1 }];
      const isValid = result.current.isValidPosition(hex, occupied);
      
      expect(isValid).toBe(false);
    });
  });

  describe('nearest free position', () => {
    it('should return same position if free', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const target: HexPosition = { q: 1, r: 1 };
      const occupied: HexPosition[] = [{ q: 0, r: 0 }];
      const nearest = result.current.findNearestFreePosition(target, occupied);
      
      expect(nearest).toEqual(target);
    });

    it('should find nearest free position when target is occupied', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const target: HexPosition = { q: 0, r: 0 };
      const occupied: HexPosition[] = [{ q: 0, r: 0 }];
      const nearest = result.current.findNearestFreePosition(target, occupied);
      
      // Should find a neighboring position
      expect(nearest).not.toEqual(target);
      expect(result.current.getDistance(target, nearest)).toBe(1);
    });

    it('should find position at increasing radius', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const target: HexPosition = { q: 0, r: 0 };
      // Occupy center and all immediate neighbors
      const occupied: HexPosition[] = [
        { q: 0, r: 0 },   // center
        { q: 1, r: 0 },   // neighbors
        { q: 0, r: 1 },
        { q: -1, r: 1 },
        { q: -1, r: 0 },
        { q: 0, r: -1 },
        { q: 1, r: -1 },
      ];
      
      const nearest = result.current.findNearestFreePosition(target, occupied);
      
      // Should find a position at radius 2
      expect(result.current.getDistance(target, nearest)).toBe(2);
    });

    it('should handle heavily occupied area', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const target: HexPosition = { q: 0, r: 0 };
      const occupied: HexPosition[] = [];
      
      // Create a large occupied area
      for (let q = -3; q <= 3; q++) {
        for (let r = Math.max(-3, -q - 3); r <= Math.min(3, -q + 3); r++) {
          if (q !== 0 || r !== 0) { // Don't include target initially
            occupied.push({ q, r });
          }
        }
      }
      occupied.push(target); // Now include target
      
      const nearest = result.current.findNearestFreePosition(target, occupied);
      
      // Should find some position outside the occupied area
      expect(nearest).toBeDefined();
      expect(result.current.isValidPosition(nearest, occupied)).toBe(true);
    });

    it('should return target as fallback when no free position found', () => {
      const { result } = renderHook(() => useHexGrid());
      
      const target: HexPosition = { q: 0, r: 0 };
      const occupied: HexPosition[] = [];
      
      // Create an impossibly large occupied area (beyond search radius)
      for (let q = -15; q <= 15; q++) {
        for (let r = Math.max(-15, -q - 15); r <= Math.min(15, -q + 15); r++) {
          occupied.push({ q, r });
        }
      }
      
      const nearest = result.current.findNearestFreePosition(target, occupied);
      
      // Should fallback to target position
      expect(nearest).toEqual(target);
    });
  });

  describe('memoization', () => {
    it('should memoize utility functions', () => {
      const { result, rerender } = renderHook(() => useHexGrid());
      
      const hexToPixel1 = result.current.hexToPixel;
      const pixelToHex1 = result.current.pixelToHex;
      
      rerender();
      
      const hexToPixel2 = result.current.hexToPixel;
      const pixelToHex2 = result.current.pixelToHex;
      
      expect(hexToPixel1).toBe(hexToPixel2);
      expect(pixelToHex1).toBe(pixelToHex2);
    });

    it('should update functions when config changes', () => {
      const { result, rerender } = renderHook(
        ({ config }) => useHexGrid({ config }),
        { initialProps: { config: { hexSize: 60, spacing: 10 } } }
      );
      
      const hexToPixel1 = result.current.hexToPixel;
      
      rerender({ config: { hexSize: 100, spacing: 20 } });
      
      const hexToPixel2 = result.current.hexToPixel;
      
      expect(hexToPixel1).not.toBe(hexToPixel2);
    });
  });
});