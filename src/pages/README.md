# Pages Directory

This directory contains page-level components for the Heart RPG Delve Map application.

## Components

### LibraryPage.tsx

The LibraryPage component provides a personal library system for saving and reusing content across different delve maps.

#### Features

- **Tabbed Interface**: Separate tabs for landmarks, delves, and monsters
- **Item Management**: Edit, delete, and organize saved items
- **Use from Library**: Copy items from library to current map with new IDs
- **Local Storage Persistence**: Automatically saves library data to localStorage
- **Responsive Design**: Works on desktop and tablet devices

#### Usage

```tsx
import { LibraryPage } from '../pages/LibraryPage';

function App() {
  return (
    <DelveMapProvider>
      <LibraryPage />
    </DelveMapProvider>
  );
}
```

#### Props

The LibraryPage component doesn't accept any props. It uses the DelveMapContext to access and manage library data.

#### State Management

The component uses the following hooks:
- `useLibrary()` - For library CRUD operations
- `useState()` - For local UI state (active tab, editing modal)

#### Library Operations

1. **Save to Library**: Items can be saved from cards using the "Save to Library" button
2. **Edit Items**: Click "Edit" to modify library items in a modal form
3. **Delete Items**: Click "Delete" with confirmation to remove items
4. **Use in Map**: Click "Use in Map" to copy items to the current delve map
5. **Persistence**: All changes are automatically saved to localStorage

#### Tab Structure

- **Landmarks Tab**: Shows saved landmarks with domains, stress dice, haunts, and bonds
- **Delves Tab**: Shows saved delves with resistance, domains, events, resources, and monster count
- **Monsters Tab**: Shows saved monsters with stats, attacks, resources, and notes

#### Integration with Cards

The library system integrates with card components through the `onSaveToLibrary` prop:

```tsx
<LandmarkCard
  landmark={landmark}
  onSaveToLibrary={(landmark) => addLandmarkToLibrary(landmark)}
/>
```

#### Local Storage

Library data is automatically persisted to localStorage under the key `heart-rpg-library`. The data structure matches the `Library` interface:

```typescript
interface Library {
  monsters: Monster[];
  landmarks: Landmark[];
  delves: Delve[];
}
```

### DelveMapPage.tsx (Planned)

The main delve map interface with hex grid layout and card management.

## Testing

Each page component includes comprehensive unit tests covering:
- Component rendering
- User interactions
- State management
- Integration with context
- Error handling
- Responsive behavior

## Styling

Page components use CSS modules for styling with responsive design patterns and consistent theming.