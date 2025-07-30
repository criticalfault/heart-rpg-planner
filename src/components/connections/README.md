# Connection System Components

This directory contains components for managing connections between cards in the Heart RPG Delve Map application.

## Components

### ConnectionLine
Renders a visual line between two connected cards with an arrow indicator and optional delete functionality.

**Props:**
- `connection`: Connection object with from/to IDs and type
- `fromCard`: PlacedCard object for the source card
- `toCard`: PlacedCard object for the target card
- `onDelete`: Optional callback for deleting the connection
- `isSelected`: Whether the connection is currently selected
- `onClick`: Optional callback when the connection is clicked

**Features:**
- Different visual styles for different connection types
- Dashed lines for landmark-to-landmark connections
- Arrow markers showing connection direction
- Hover effects and delete buttons
- Click handling for selection

### ConnectionPoint
Small circular indicators that appear on cards to show connection points.

**Props:**
- `position`: Position on the card ('top', 'bottom', 'left', 'right')
- `isActive`: Whether the point is currently active (in connection mode)
- `isConnected`: Whether the point has existing connections
- `onClick`: Callback when the point is clicked

**Features:**
- Positioned at card edges
- Visual feedback for different states
- Pulse animation when active
- Color coding for connection status

### ConnectableCard
Wrapper component that adds connection functionality to any card component.

**Props:**
- `cardId`: Unique identifier for the card
- `children`: Card content to render
- `isSelected`: Whether the card is selected for connection
- `connectionMode`: Whether connection creation mode is active
- `onConnectionClick`: Callback when card is clicked in connection mode

**Features:**
- Renders connection points when appropriate
- Handles click events for connection creation
- Visual feedback for selection state
- Prevents event propagation for connection points

### ConnectionManager
Main component that orchestrates the entire connection system.

**Props:**
- `placedCards`: Array of cards placed on the hex grid
- `landmarks`: Array of landmark data
- `delves`: Array of delve data
- `showConnections`: Whether connections should be visible
- `onToggleConnections`: Callback to toggle connection visibility

**Features:**
- Connection creation mode toggle
- Visual connection overlay with SVG lines
- Click targets for card selection
- Connection management (create, delete)
- User instructions and feedback

## Usage Example

```tsx
import { ConnectionManager, ConnectableCard } from './components/connections';
import { useUI } from './hooks/useUI';

function DelveMapPage() {
  const { showConnections, toggleConnections } = useUI();
  
  return (
    <div className="delve-map">
      <ConnectionManager
        placedCards={placedCards}
        landmarks={landmarks}
        delves={delves}
        showConnections={showConnections}
        onToggleConnections={toggleConnections}
      />
      
      {placedCards.map(card => (
        <ConnectableCard key={card.id} cardId={card.id}>
          {card.type === 'landmark' ? (
            <LandmarkCard landmark={getLandmarkById(card.id)} />
          ) : (
            <DelveCard delve={getDelveById(card.id)} />
          )}
        </ConnectableCard>
      ))}
    </div>
  );
}
```

## Connection Types

The system supports three types of connections:

1. **landmark-to-delve**: Blue solid lines connecting landmarks to delves
2. **delve-to-delve**: Red solid lines connecting delves to other delves  
3. **landmark-to-landmark**: Green dashed lines connecting landmarks to landmarks

## State Management

Connection state is managed through:
- `useConnections()` hook for connection CRUD operations
- `useUI()` hook for UI state (show/hide connections, grid visibility)
- Context actions for state updates

## Testing

All components include comprehensive unit tests covering:
- Rendering behavior
- User interactions
- State management
- Integration scenarios

Run tests with: `npm test -- --run src/components/connections/`

## Styling

Each component has its own CSS file with:
- Responsive design considerations
- Hover and active states
- Color coding for different connection types
- Smooth transitions and animations
- Accessibility considerations