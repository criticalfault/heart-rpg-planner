# Drag and Drop System

This document describes the drag and drop functionality implemented for the Heart RPG Delve Map cards.

## Overview

The drag and drop system allows users to:
- Drag Landmark and Delve cards from a palette onto a hex grid
- Move cards between hex positions on the grid
- Prevent cards from overlapping (collision detection)
- Provide visual feedback during drag operations
- Snap cards to hex grid positions

## Components

### DraggableCard

A wrapper component that makes any card draggable using HTML5 drag and drop API.

**Props:**
- `cardId`: Unique identifier for the card
- `cardType`: Either 'landmark' or 'delve'
- `position`: Optional hex position for placed cards
- `onDragStart`: Callback when drag starts
- `onDragMove`: Callback during drag (for preview)
- `onDragEnd`: Callback when drag ends
- `isDragging`: Whether the card is currently being dragged
- `isSelected`: Whether the card is selected
- `isOccupied`: Function to check if a position is occupied
- `children`: The actual card content to render

**Features:**
- Custom drag preview with rotation and opacity
- Visual feedback for valid/invalid drop positions
- Smooth animations for positioning
- Collision detection integration

### HexPositioned (Enhanced)

Enhanced to support drop zones for the hex grid system.

**New Props:**
- `onDrop`: Callback when a card is dropped
- `onDragOver`: Callback during drag over
- `onDragLeave`: Callback when drag leaves
- `isOccupied`: Function to check position occupation
- `isDropZone`: Whether this element accepts drops

**Features:**
- Visual feedback for valid/invalid drop zones
- Drag over highlighting
- Drop zone validation

### HexGrid (Enhanced)

Enhanced to handle grid-wide drop operations.

**New Props:**
- `onDrop`: Callback for drops on the grid
- `isOccupied`: Function to check position occupation

**Features:**
- Grid-wide drop zone handling
- Visual feedback for drag over positions
- Snap-to-hex positioning

## Hooks

### useDragAndDrop

Custom hook that manages drag and drop state and operations.

**Returns:**
- `dragState`: Current drag state information
- `isOccupied`: Function to check if position is occupied
- `handleDragStart`: Start drag operation
- `handleDragMove`: Handle drag movement
- `handleDragEnd`: End drag operation
- `handleGridDrop`: Handle drop on grid
- `getCardPosition`: Get position of a card
- `isCardSelected`: Check if card is selected
- `isCardDragging`: Check if card is being dragged

**Features:**
- Integrates with DelveMapContext for state management
- Handles collision detection
- Manages card placement and movement
- Provides drag state tracking

## Usage Example

```tsx
import { DraggableCard } from './DraggableCard';
import { HexGrid } from '../grid/HexGrid';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

function MyComponent() {
  const {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleGridDrop,
    getCardPosition,
    isCardDragging,
    isOccupied,
  } = useDragAndDrop();

  return (
    <div>
      {/* Draggable card */}
      <DraggableCard
        cardId="my-card"
        cardType="landmark"
        position={getCardPosition("my-card")}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        isDragging={isCardDragging("my-card")}
        isOccupied={isOccupied}
      >
        <MyCardContent />
      </DraggableCard>

      {/* Drop zone grid */}
      <HexGrid
        width={800}
        height={600}
        onDrop={handleGridDrop}
        isOccupied={isOccupied}
      >
        {/* Positioned cards render here */}
      </HexGrid>
    </div>
  );
}
```

## Visual Feedback

### Drag States
- **Dragging**: Card scales up, rotates slightly, and gains shadow
- **Valid Drop**: Green checkmark and blue border
- **Invalid Drop**: Red X and red border
- **Hover**: Slight scale up and shadow

### Drop Zones
- **Drag Over**: Dashed blue border with light blue background
- **Invalid Drop**: Dashed red border with light red background
- **Valid Indicator**: Green checkmark in corner
- **Invalid Indicator**: Red X in corner

## Collision Detection

The system prevents cards from overlapping by:
1. Checking occupied positions before allowing drops
2. Excluding the dragged card from occupation checks
3. Providing visual feedback for invalid positions
4. Preventing drop operations on occupied hexes

## Animation and Performance

- Smooth CSS transitions for positioning
- Hardware-accelerated transforms
- Optimized re-renders with React.memo patterns
- Efficient collision detection algorithms

## Testing

Comprehensive test coverage includes:
- Unit tests for individual components
- Integration tests for drag and drop workflows
- Mock implementations for browser APIs
- Edge case handling (missing elements, invalid data)

## Browser Compatibility

Uses HTML5 drag and drop API with fallbacks:
- Modern browsers: Full drag and drop support
- Touch devices: Basic touch event handling
- Older browsers: Graceful degradation to click-based interaction

## Accessibility

- Keyboard navigation support
- Screen reader announcements for drag operations
- High contrast mode compatibility
- Focus management during drag operations