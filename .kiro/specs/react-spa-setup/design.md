# Design Document

## Overview

The Heart RPG Delve Map will be built as a modern React.js single page application focused on creating and managing interactive cards for Landmarks and Delves. The application will provide an intuitive card-based interface where Game Masters can create, edit, and organize their delve locations with all necessary Heart RPG mechanics and information.

## Architecture

### Technology Stack
- **Frontend Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router v6 for client-side navigation
- **Styling**: CSS Modules or Styled Components for component-scoped styling
- **State Management**: React Context API for global state, useState/useReducer for local state
- **Testing**: Vitest + React Testing Library for unit and integration tests
- **Type Safety**: TypeScript for enhanced developer experience and code reliability

### Application Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Modal, etc.)
│   ├── cards/          # Card components (LandmarkCard, DelveCard)
│   ├── forms/          # Form components for editing
│   └── ui/             # UI primitives (Input, Select, etc.)
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── utils/              # Utility functions
├── styles/             # Global styles and theme
├── types/              # TypeScript type definitions
└── __tests__/          # Test files
```

## Components and Interfaces

### Core Components

#### App Component
- Root component that provides routing and global context
- Handles error boundaries and loading states
- Manages application-wide theme and configuration

#### Layout Components
- **Header**: Navigation, branding, user actions
- **Sidebar**: Secondary navigation for different planning sections
- **Main**: Content area with dynamic routing
- **Footer**: Application info and links

#### Page Components
- **DelveMapPage**: Main delve map interface with hex grid and connections
- **LibraryPage**: Personal library for saved monsters, landmarks, and delves
- **NotFound**: 404 error page

#### Card Components
- **LandmarkCard**: Displays and manages Landmark data with drag/drop support
- **DelveCard**: Displays and manages Delve data with nested monsters and drag/drop support
- **MonsterCard**: Displays monster information within Delve cards
- **HexGrid**: Hex-based grid system for positioning cards spatially
- **ConnectionLine**: Visual connection lines between linked cards
- **DraggableCard**: Wrapper component for drag and drop functionality

#### Form Components
- **LandmarkForm**: Form for creating/editing Landmarks
- **DelveForm**: Form for creating/editing Delves
- **MonsterForm**: Form for creating/editing Monsters
- **DomainSelector**: Multi-select component for domain selection
- **ArrayEditor**: Component for managing string arrays (Haunts, Bonds, etc.)

#### Common Components
- **Button**: Consistent button styling and behavior
- **Modal**: Reusable modal dialog
- **LoadingSpinner**: Loading state indicator
- **ErrorBoundary**: Error handling wrapper

### Component Interface Patterns

```typescript
// Example component interface
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

// Page component interface
interface PageProps {
  title: string;
  description?: string;
}
```

## Data Models

### Application State Structure
```typescript
interface AppState {
  delveMap: DelveMapState;
  ui: UIState;
}

interface DelveMapState {
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

interface UIState {
  loading: boolean;
  error: string | null;
  modalOpen: boolean;
  cardFilter: 'all' | 'landmarks' | 'delves';
  showConnections: boolean;
  gridVisible: boolean;
  currentView: 'map' | 'library';
}
```

### Heart RPG Domain Models
```typescript
type Domain = 'Cursed' | 'Desolate' | 'Haven' | 'Occult' | 'Religion' | 'Technology' | 'Warren' | 'Wild';
type StressDie = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';

interface Landmark {
  id: string;
  name: string;
  domains: Domain[];
  defaultStress: StressDie;
  haunts: string[];
  bonds: string[];
}

interface Monster {
  id: string;
  name: string;
  resistance: number; // 1-20
  protection: number; // 1-12
  attacks: string[];
  resources: string[];
  notes: string;
}

interface Delve {
  id: string;
  name: string;
  resistance: number; // 1-50
  domains: Domain[];
  events: string[];
  resources: string[];
  monsters: Monster[];
}

interface HexPosition {
  q: number; // hex coordinate q
  r: number; // hex coordinate r
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: 'landmark-to-delve' | 'delve-to-delve' | 'landmark-to-landmark';
}

interface PlacedCard {
  id: string;
  type: 'landmark' | 'delve';
  position: HexPosition;
}

interface DelveMap {
  id: string;
  name: string;
  landmarks: Landmark[];
  delves: Delve[];
  placedCards: PlacedCard[];
  connections: Connection[];
  createdAt: Date;
  updatedAt: Date;
}

interface Library {
  monsters: Monster[];
  landmarks: Landmark[];
  delves: Delve[];
}
```

## Error Handling

### Error Boundary Strategy
- Implement React Error Boundaries at key component levels
- Provide fallback UI for component failures
- Log errors for debugging and monitoring

### Error Types
- **Network Errors**: Handle API failures gracefully
- **Validation Errors**: Provide clear user feedback
- **Runtime Errors**: Catch and display user-friendly messages

### Error Recovery
- Provide retry mechanisms for transient failures
- Allow users to reset application state when needed
- Maintain application stability during error conditions

## Testing Strategy

### Unit Testing
- Test individual components in isolation
- Mock external dependencies and context
- Focus on component behavior and props handling
- Achieve 80%+ code coverage for critical components

### Integration Testing
- Test component interactions and data flow
- Verify routing and navigation behavior
- Test context providers and state management

### End-to-End Testing
- Test critical user workflows
- Verify application performance and accessibility
- Test across different browsers and devices

### Testing Tools and Patterns
```typescript
// Example test structure
describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Performance Considerations

### Bundle Optimization
- Code splitting with React.lazy() for route-based chunks
- Tree shaking to eliminate unused code
- Optimize asset loading and caching strategies

### Runtime Performance
- Implement React.memo() for expensive components
- Use useMemo() and useCallback() for expensive computations
- Optimize re-renders with proper dependency arrays

### Loading Strategies
- Implement skeleton screens for better perceived performance
- Progressive loading for large datasets
- Lazy loading for images and non-critical resources

## Accessibility

### WCAG Compliance
- Ensure keyboard navigation support
- Provide proper ARIA labels and roles
- Maintain sufficient color contrast ratios
- Support screen readers and assistive technologies

### Implementation
- Use semantic HTML elements
- Implement focus management for modals and navigation
- Provide alternative text for images and icons
- Test with accessibility tools and screen readers