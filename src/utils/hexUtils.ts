import { HexPosition } from '../types';

export interface PixelPosition {
  x: number;
  y: number;
}

export interface HexGridConfig {
  hexSize: number;
  spacing: number;
}

export const DEFAULT_HEX_CONFIG: HexGridConfig = {
  hexSize: 60,
  spacing: 10,
};

// Responsive hex configurations for different screen sizes
export const RESPONSIVE_HEX_CONFIGS = {
  desktop: { hexSize: 60, spacing: 10 },
  tablet: { hexSize: 50, spacing: 8 },
  mobile: { hexSize: 40, spacing: 6 },
  small: { hexSize: 35, spacing: 5 },
};

/**
 * Get responsive hex configuration based on screen width
 */
export function getResponsiveHexConfig(screenWidth: number): HexGridConfig {
  if (screenWidth >= 1024) {
    return RESPONSIVE_HEX_CONFIGS.desktop;
  } else if (screenWidth >= 768) {
    return RESPONSIVE_HEX_CONFIGS.tablet;
  } else if (screenWidth >= 480) {
    return RESPONSIVE_HEX_CONFIGS.mobile;
  } else {
    return RESPONSIVE_HEX_CONFIGS.small;
  }
}

/**
 * Convert hex coordinates (q, r) to pixel coordinates (x, y)
 * Uses flat-topped hexagon orientation
 */
export function hexToPixel(hex: HexPosition, config: HexGridConfig = DEFAULT_HEX_CONFIG): PixelPosition {
  const { hexSize } = config;
  const x = hexSize * (3/2 * hex.q);
  const y = hexSize * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

/**
 * Convert pixel coordinates (x, y) to hex coordinates (q, r)
 * Uses flat-topped hexagon orientation
 */
export function pixelToHex(pixel: PixelPosition, config: HexGridConfig = DEFAULT_HEX_CONFIG): HexPosition {
  const { hexSize } = config;
  const q = (2/3 * pixel.x) / hexSize;
  const r = (-1/3 * pixel.x + Math.sqrt(3)/3 * pixel.y) / hexSize;
  return roundHex({ q, r });
}

/**
 * Round fractional hex coordinates to the nearest hex
 */
export function roundHex(hex: { q: number; r: number }): HexPosition {
  let q = Math.round(hex.q);
  let r = Math.round(hex.r);
  const s = Math.round(-hex.q - hex.r);

  const qDiff = Math.abs(q - hex.q);
  const rDiff = Math.abs(r - hex.r);
  const sDiff = Math.abs(s - (-hex.q - hex.r));

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  }

  return { q, r };
}

/**
 * Calculate distance between two hex positions
 */
export function hexDistance(a: HexPosition, b: HexPosition): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

/**
 * Get all hex positions within a given radius
 */
export function hexesInRadius(center: HexPosition, radius: number): HexPosition[] {
  const results: HexPosition[] = [];
  
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    
    for (let r = r1; r <= r2; r++) {
      results.push({ q: center.q + q, r: center.r + r });
    }
  }
  
  return results;
}

/**
 * Get the six corner points of a hexagon in pixel coordinates
 */
export function getHexCorners(center: PixelPosition, config: HexGridConfig = DEFAULT_HEX_CONFIG): PixelPosition[] {
  const { hexSize } = config;
  const corners: PixelPosition[] = [];
  
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = center.x + hexSize * Math.cos(angleRad);
    const y = center.y + hexSize * Math.sin(angleRad);
    corners.push({ x, y });
  }
  
  return corners;
}

/**
 * Check if a pixel position is inside a hexagon
 */
export function isPointInHex(point: PixelPosition, hexCenter: PixelPosition, config: HexGridConfig = DEFAULT_HEX_CONFIG): boolean {
  const { hexSize } = config;
  const dx = Math.abs(point.x - hexCenter.x);
  const dy = Math.abs(point.y - hexCenter.y);
  
  // Quick bounding box check
  if (dx > hexSize || dy > hexSize * Math.sqrt(3) / 2) {
    return false;
  }
  
  // Check if point is inside hexagon using cross product
  return dx <= hexSize * 3/4 && dy <= hexSize * Math.sqrt(3) / 2 - dx * Math.sqrt(3) / 3;
}

/**
 * Snap a pixel position to the nearest hex center
 */
export function snapToHex(pixel: PixelPosition, config: HexGridConfig = DEFAULT_HEX_CONFIG): { hex: HexPosition; pixel: PixelPosition } {
  const hex = pixelToHex(pixel, config);
  const snappedPixel = hexToPixel(hex, config);
  return { hex, pixel: snappedPixel };
}