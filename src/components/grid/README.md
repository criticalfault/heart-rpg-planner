# Hex Grid Components

This directory contains components for implementing a hexagonal grid system for the Heart RPG Delve Map planner.

## Components

### HexGrid

The main hex grid component that provides a canvas-based hexagonal grid overlay and handles mouse interactions.

**Props:**
- `width: number` - Grid width in pixels
- `height: number` - Grid height in pixels  
- `config?: HexGridConfig` - Hex grid configuration (size, spacing)
- `showGrid?: boolean` - Whether to show the grid overlay (default: true)
- `onHexClick?: (hex: HexPosition, pixel: PixelPosition) => void` - Called when a hex is clicked
- `onHexHover?: (hex: HexPosition | null, pixel: PixelPosition | null) => void` - Called when hovering over hexes
- `children?: React.ReactNode` - Content to render over the grid
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<HexGrid
  width={800}
  height={600}
  showGrid={true}
  onHexClick={(hex, pixel) => console.log('Clicked hex:', hex)}
>
  {/* Your positioned content here */}
</HexGrid>
```

### HexPositioned

A wrapper component that positions its children at specific hex coordinates with optional drag-and-drop functionality.

**Props:**
- `hex: HexPosition` - The hex coordinates to position at
- `config?: HexGridConfig` - Hex grid configuration (should match parent HexGrid)
- `children: React.ReactNode` - Content to position
- `className?: string` - Additional CSS classes
- `style?: React.CSSProperties` - Additional inline styles
- `onPositionChange?: (hex: HexPosition, pixel: PixelPosition) => void` - Called when position changes via drag
- `draggable?: boolean` - Whether the component can be dragged (default: false)
- `selected?: boolean` - Whether the component is selected (adds visual styling)

**Example:**
```tsx
<HexPositioned
  hex={{ q: 1, r: 0 }}
  draggable={true}
  selected={isSelected}
  onPositionChange={(newHex) => updatePosition(newHex)}
>
  <div className="my-card">Card Content</div>
</HexPositioned>
```

## Utilities

### hexUtils.ts

Contains utility functions for hex coordinate calculations:

- `hexToPixel(hex, config)` - Convert hex coordinates to pixel coordinates
- `pixelToHex(pixel, config)` - Convert pixel coordinates to hex coordinates
- `roundHex(hex)` - Round fractional hex coordinates to nearest integer hex
- `hexDistance(a, b)` - Calculate distance between two hex positions
- `hexesInRadius(center, radius)` - Get all hex positions within a radius
- `getHexCorners(center, config)` - Get the corner points of a hexagon
- `isPointInHex(point, hexCenter, config)` - Check if a point is inside a hexagon
- `snapToHex(pixel, config)` - Snap a pixel position to the nearest hex center

### useHexGrid Hook

A custom hook that provides hex grid state management and utility functions:

```tsx
const {
  config,
  showGrid,
  toggleGrid,
  setShowGrid,
  hexToPixel,
  pixelToHex,
  snapToHex,
  getDistance,
  isValidPosition,
  findNearestFreePosition,
} = useHexGrid({
  config: { hexSize: 60, spacing: 10 },
  initialShowGrid: true,
});
```

## Coordinate System

The hex grid uses a flat-topped hexagon orientation with axial coordinates (q, r):

- **q** increases to the right
- **r** increases down and to the left
- The third coordinate **s = -q - r** (not stored but implied)

Origin (0, 0) is at the center of the grid.

## Configuration

The `HexGridConfig` interface allows customization:

```typescript
interface HexGridConfig {
  hexSize: number;    // Radius of hexagons in pixels
  spacing: number;    // Additional spacing between hexagons
}
```

Default configuration:
```typescript
const DEFAULT_HEX_CONFIG = {
  hexSize: 60,
  spacing: 10,
};
```

## Styling

Components include CSS classes for styling:

- `.hex-grid` - Main grid container
- `.hex-grid-canvas` - Canvas element for grid rendering
- `.hex-grid-content` - Content area over the grid
- `.hex-positioned` - Positioned element wrapper
- `.hex-positioned-draggable` - Draggable element
- `.hex-positioned-dragging` - Element being dragged
- `.hex-positioned-selected` - Selected element

## Example Usage

See `HexGridExample.tsx` for a complete working example that demonstrates:

- Grid rendering with toggle
- Card positioning and dragging
- Click handling for adding new cards
- Selection state management

## Testing

Unit tests are provided for:

- Hex coordinate utilities (`hexUtils.test.ts`)
- HexGrid component (`HexGrid.test.tsx`)
- HexPositioned component (`HexPositioned.test.tsx`)
- useHexGrid hook (`useHexGrid.test.tsx`)

Run tests with: `npm test` (when test environment is available)