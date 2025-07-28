import { describe, it, expect } from 'vitest';
import {
  hexToPixel,
  pixelToHex,
  roundHex,
  hexDistance,
  hexesInRadius,
  getHexCorners,
  isPointInHex,
  snapToHex,
  DEFAULT_HEX_CONFIG,
} from '../hexUtils';
import { HexPosition } from '../../types';

describe('hexUtils', () => {
  describe('hexToPixel', () => {
    it('should convert hex origin to pixel origin', () => {
      const hex: HexPosition = { q: 0, r: 0 };
      const pixel = hexToPixel(hex);
      expect(pixel.x).toBe(0);
      expect(pixel.y).toBe(0);
    });

    it('should convert positive q coordinate correctly', () => {
      const hex: HexPosition = { q: 1, r: 0 };
      const pixel = hexToPixel(hex);
      expect(pixel.x).toBe(DEFAULT_HEX_CONFIG.hexSize * 1.5);
      expect(pixel.y).toBeCloseTo(DEFAULT_HEX_CONFIG.hexSize * Math.sqrt(3) / 2);
    });

    it('should convert positive r coordinate correctly', () => {
      const hex: HexPosition = { q: 0, r: 1 };
      const pixel = hexToPixel(hex);
      expect(pixel.x).toBe(0);
      expect(pixel.y).toBeCloseTo(DEFAULT_HEX_CONFIG.hexSize * Math.sqrt(3));
    });

    it('should handle negative coordinates', () => {
      const hex: HexPosition = { q: -1, r: -1 };
      const pixel = hexToPixel(hex);
      expect(pixel.x).toBe(DEFAULT_HEX_CONFIG.hexSize * -1.5);
      expect(pixel.y).toBeCloseTo(DEFAULT_HEX_CONFIG.hexSize * Math.sqrt(3) * -1.5);
    });

    it('should use custom config', () => {
      const customConfig = { hexSize: 100, spacing: 20 };
      const hex: HexPosition = { q: 1, r: 0 };
      const pixel = hexToPixel(hex, customConfig);
      expect(pixel.x).toBe(150);
      expect(pixel.y).toBeCloseTo(100 * Math.sqrt(3) / 2);
    });
  });

  describe('pixelToHex', () => {
    it('should convert pixel origin to hex origin', () => {
      const pixel = { x: 0, y: 0 };
      const hex = pixelToHex(pixel);
      expect(hex.q).toBe(0);
      expect(hex.r).toBe(0);
    });

    it('should be inverse of hexToPixel for integer coordinates', () => {
      const originalHex: HexPosition = { q: 2, r: -1 };
      const pixel = hexToPixel(originalHex);
      const convertedHex = pixelToHex(pixel);
      expect(convertedHex.q).toBe(originalHex.q);
      expect(convertedHex.r).toBe(originalHex.r);
    });

    it('should handle multiple hex positions correctly', () => {
      const testCases: HexPosition[] = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: -1, r: 0 },
        { q: 0, r: -1 },
        { q: 2, r: -1 },
        { q: -2, r: 3 },
      ];

      testCases.forEach(originalHex => {
        const pixel = hexToPixel(originalHex);
        const convertedHex = pixelToHex(pixel);
        expect(convertedHex.q).toBe(originalHex.q);
        expect(convertedHex.r).toBe(originalHex.r);
      });
    });
  });

  describe('roundHex', () => {
    it('should round to nearest integer coordinates', () => {
      const hex = roundHex({ q: 1.2, r: -0.8 });
      expect(hex.q).toBe(1);
      expect(hex.r).toBe(-1);
    });

    it('should handle exact integer coordinates', () => {
      const hex = roundHex({ q: 2, r: -1 });
      expect(hex.q).toBe(2);
      expect(hex.r).toBe(-1);
    });

    it('should maintain hex coordinate constraint (q + r + s = 0)', () => {
      const testCases = [
        { q: 1.4, r: -0.6 },
        { q: -0.3, r: 1.7 },
        { q: 2.1, r: -1.9 },
      ];

      testCases.forEach(fractionalHex => {
        const rounded = roundHex(fractionalHex);
        const s = -rounded.q - rounded.r;
        expect(rounded.q + rounded.r + s).toBe(0);
      });
    });
  });

  describe('hexDistance', () => {
    it('should return 0 for same position', () => {
      const hex: HexPosition = { q: 1, r: -1 };
      expect(hexDistance(hex, hex)).toBe(0);
    });

    it('should calculate distance between adjacent hexes', () => {
      const hex1: HexPosition = { q: 0, r: 0 };
      const hex2: HexPosition = { q: 1, r: 0 };
      expect(hexDistance(hex1, hex2)).toBe(1);
    });

    it('should calculate distance correctly for various positions', () => {
      const origin: HexPosition = { q: 0, r: 0 };
      
      expect(hexDistance(origin, { q: 2, r: 0 })).toBe(2);
      expect(hexDistance(origin, { q: 0, r: 2 })).toBe(2);
      expect(hexDistance(origin, { q: 1, r: 1 })).toBe(2);
      expect(hexDistance(origin, { q: -1, r: -1 })).toBe(2);
    });

    it('should be symmetric', () => {
      const hex1: HexPosition = { q: 2, r: -1 };
      const hex2: HexPosition = { q: -1, r: 3 };
      expect(hexDistance(hex1, hex2)).toBe(hexDistance(hex2, hex1));
    });
  });

  describe('hexesInRadius', () => {
    it('should return only center for radius 0', () => {
      const center: HexPosition = { q: 1, r: -1 };
      const hexes = hexesInRadius(center, 0);
      expect(hexes).toHaveLength(1);
      expect(hexes[0]).toEqual(center);
    });

    it('should return 7 hexes for radius 1', () => {
      const center: HexPosition = { q: 0, r: 0 };
      const hexes = hexesInRadius(center, 1);
      expect(hexes).toHaveLength(7); // center + 6 neighbors
    });

    it('should return 19 hexes for radius 2', () => {
      const center: HexPosition = { q: 0, r: 0 };
      const hexes = hexesInRadius(center, 2);
      expect(hexes).toHaveLength(19); // 1 + 6 + 12
    });

    it('should include center in results', () => {
      const center: HexPosition = { q: 2, r: -1 };
      const hexes = hexesInRadius(center, 2);
      expect(hexes).toContainEqual(center);
    });

    it('should respect distance constraint', () => {
      const center: HexPosition = { q: 0, r: 0 };
      const hexes = hexesInRadius(center, 2);
      
      hexes.forEach(hex => {
        expect(hexDistance(center, hex)).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('getHexCorners', () => {
    it('should return 6 corners', () => {
      const center = { x: 0, y: 0 };
      const corners = getHexCorners(center);
      expect(corners).toHaveLength(6);
    });

    it('should return corners at correct distance from center', () => {
      const center = { x: 100, y: 100 };
      const corners = getHexCorners(center);
      
      corners.forEach(corner => {
        const distance = Math.sqrt(
          Math.pow(corner.x - center.x, 2) + Math.pow(corner.y - center.y, 2)
        );
        expect(distance).toBeCloseTo(DEFAULT_HEX_CONFIG.hexSize);
      });
    });

    it('should use custom config', () => {
      const center = { x: 0, y: 0 };
      const customConfig = { hexSize: 100, spacing: 20 };
      const corners = getHexCorners(center, customConfig);
      
      corners.forEach(corner => {
        const distance = Math.sqrt(corner.x * corner.x + corner.y * corner.y);
        expect(distance).toBeCloseTo(100);
      });
    });
  });

  describe('isPointInHex', () => {
    it('should return true for center point', () => {
      const center = { x: 0, y: 0 };
      const point = { x: 0, y: 0 };
      expect(isPointInHex(point, center)).toBe(true);
    });

    it('should return false for point outside hex', () => {
      const center = { x: 0, y: 0 };
      const point = { x: DEFAULT_HEX_CONFIG.hexSize * 2, y: 0 };
      expect(isPointInHex(point, center)).toBe(false);
    });

    it('should handle points near hex boundary', () => {
      const center = { x: 0, y: 0 };
      const nearBoundary = { x: DEFAULT_HEX_CONFIG.hexSize * 0.9, y: 0 };
      const outsideBoundary = { x: DEFAULT_HEX_CONFIG.hexSize * 1.1, y: 0 };
      
      expect(isPointInHex(nearBoundary, center)).toBe(true);
      expect(isPointInHex(outsideBoundary, center)).toBe(false);
    });
  });

  describe('snapToHex', () => {
    it('should snap to nearest hex center', () => {
      const pixel = { x: 10, y: 10 };
      const result = snapToHex(pixel);
      
      expect(result.hex).toBeDefined();
      expect(result.pixel).toBeDefined();
      expect(typeof result.hex.q).toBe('number');
      expect(typeof result.hex.r).toBe('number');
    });

    it('should return exact hex center for hex center input', () => {
      const originalHex: HexPosition = { q: 1, r: 1 };
      const pixel = hexToPixel(originalHex);
      const result = snapToHex(pixel);
      
      expect(result.hex.q).toBe(originalHex.q);
      expect(result.hex.r).toBe(originalHex.r);
      expect(result.pixel.x).toBeCloseTo(pixel.x);
      expect(result.pixel.y).toBeCloseTo(pixel.y);
    });

    it('should snap consistently for nearby points', () => {
      const basePixel = { x: 50, y: 50 };
      const nearbyPixel = { x: 52, y: 48 };
      
      const result1 = snapToHex(basePixel);
      const result2 = snapToHex(nearbyPixel);
      
      // Should snap to same hex if close enough
      const distance = Math.sqrt(
        Math.pow(basePixel.x - nearbyPixel.x, 2) + 
        Math.pow(basePixel.y - nearbyPixel.y, 2)
      );
      
      if (distance < DEFAULT_HEX_CONFIG.hexSize / 4) {
        expect(result1.hex.q).toBe(result2.hex.q);
        expect(result1.hex.r).toBe(result2.hex.r);
      }
    });
  });
});