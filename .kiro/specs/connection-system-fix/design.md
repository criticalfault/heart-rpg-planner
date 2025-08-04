# Design Document

## Overview

The connection system fix will complete the partially implemented connection functionality in the Heart RPG Planner. The system allows users to create visual connections between landmarks and delves on the map, with proper UI controls, visual feedback, and line rendering. The design focuses on fixing the existing ConnectionManager component, improving card positioning for connection points, and ensuring proper integration with the existing drag-and-drop system.

## Architecture

The connection system consists of several key components working together:

1. **ConnectionManager**: Main orchestrator component that handles connection mode, UI controls, and coordinates between other components
2. **SimpleCard**: Enhanced to support connection points and proper drag handle positioning
3. **ConnectionLine**: SVG-based component for rendering connection lines with proper styling
4. **useConnections**: Hook for managing connection state and operations
5. **Connection State**: Managed through the existing DelveMapContext and reducer

## Components and Interfaces

### ConnectionManager Component

The ConnectionManager component will be enhanced to properly handle:

- Connection mode toggle with visual feedback
- Connection creation workflow with clear instructions
- SVG overlay for rendering connection lines
- Proper event handling for card clicks in connection mode

**Key Props:**
```typescript
interface ConnectionManagerProps {
  placedCards: PlacedCard[];
  landmarks: Landmark[];
  delves: Delve[];
  showConnections: boolean;
  onToggleConnections: () => void;
}
```

**Key State:**
- `connectionMode`: Boolean indicating if connection creation is active
- `selectedCard`: ID of the first card selected for connection
- `selectedConnection`: ID of currently selected connection for deletion

### SimpleCard Component Enhancement

The SimpleCard component will be updated to:

- Move drag handle to the left side of the card
- Add connection point UI element on the right side when in connection mode
- Provide proper click handling for connection creation
- Calculate accurate center points for connection line positioning

**New Props:**
```typescript
interface SimpleCardProps {
  // ... existing props
  onConnectionClick?: (cardId: string) => void;
  isConnectionMode?: boolean;
  isConnectionSelected?: boolean;
}
```

### ConnectionLine Component

The ConnectionLine component will be enhanced to:

- Calculate proper line positioning based on card centers
- Add card dimensions to positioning calculations (cards are approximately 200px wide, 120px tall)
- Provide hover states and delete functionality
- Support different visual styles for connection types

**Enhanced Positioning Logic:**
```typescript
// Calculate card center points accounting for card dimensions
const cardWidth = 200;
const cardHeight = 120;
const fromCenter = {
  x: fromCard.position.x + cardWidth / 2,
  y: fromCard.position.y + cardHeight / 2
};
const toCenter = {
  x: toCard.position.x + cardWidth / 2,
  y: toCard.position.y + cardHeight / 2
};
```

## Data Models

### Connection Model (Existing)
```typescript
interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: 'landmark-to-delve' | 'delve-to-delve' | 'landmark-to-landmark';
}
```

### PlacedCard Model (Existing)
```typescript
interface PlacedCard {
  id: string;
  type: 'landmark' | 'delve';
  position: Position; // { x: number, y: number }
}
```

## Error Handling

### Connection Creation Errors
- **Duplicate Connection**: Check for existing connections before creating new ones
- **Invalid Card Selection**: Validate that both cards exist and are placed on the map
- **Self-Connection**: Prevent users from connecting a card to itself

### UI Error States
- **Connection Mode Feedback**: Clear visual indicators when in connection mode
- **Failed Operations**: Toast notifications for failed connection operations
- **State Recovery**: Proper cleanup when exiting connection mode

### Connection Line Rendering Errors
- **Missing Cards**: Handle cases where connected cards are removed from the map
- **Invalid Positions**: Fallback positioning for edge cases
- **SVG Rendering**: Graceful degradation if SVG is not supported

## Testing Strategy

### Unit Tests
- **ConnectionManager**: Test connection mode toggle, card selection logic, connection creation
- **SimpleCard**: Test drag handle positioning, connection point rendering, click handling
- **ConnectionLine**: Test line positioning calculations, hover states, delete functionality
- **useConnections**: Test connection CRUD operations, state management

### Integration Tests
- **Connection Workflow**: End-to-end connection creation and deletion
- **Card Movement**: Verify connection lines update when cards are moved
- **State Persistence**: Ensure connections are saved and restored properly

### Visual Tests
- **Connection Line Rendering**: Verify lines are drawn correctly between card centers
- **UI Feedback**: Test visual states for connection mode, selection, and hover
- **Responsive Behavior**: Test connection system at different zoom levels

## Implementation Notes

### Card Center Calculation
Cards need accurate center point calculation for connection lines. Based on the current SimpleCard implementation, cards are positioned absolutely with their top-left corner at the position coordinates. The center calculation should account for the actual card dimensions.

### Z-Index Management
Connection lines should be rendered at an appropriate z-index to appear above the canvas but below modal dialogs:
- Canvas: z-index 1
- Connection lines: z-index 10
- Cards: z-index 20
- Connection controls: z-index 100
- Modals: z-index 1000

### Performance Considerations
- Connection lines should only re-render when card positions change
- Use React.memo for ConnectionLine components to prevent unnecessary re-renders
- Batch connection operations when multiple connections are created/deleted

### Accessibility
- Connection controls should have proper ARIA labels
- Keyboard navigation support for connection creation
- Screen reader announcements for connection state changes

### Visual Design
- Connection types use distinct colors:
  - Landmark-to-delve: Indigo (#4f46e5)
  - Delve-to-delve: Red (#dc2626)  
  - Landmark-to-landmark: Green (#059669) with dashed line
- Hover states provide clear feedback
- Connection mode has distinct visual indicators