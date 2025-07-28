# Card Components

This directory contains card components for displaying and managing Heart RPG game entities.

## Components

### LandmarkCard

A component for displaying and editing Landmark information.

**Props:**
- `landmark: Landmark` - The landmark data to display
- `onUpdate?: (landmark: Landmark) => void` - Called when landmark is updated
- `onDelete?: (id: string) => void` - Called when landmark is deleted
- `onSaveToLibrary?: (landmark: Landmark) => void` - Called when saving to library
- `isEditing?: boolean` - Whether the card is in edit mode
- `onEditToggle?: (editing: boolean) => void` - Called when edit mode is toggled
- `className?: string` - Additional CSS classes

**Features:**
- Display mode shows all landmark information in a clean card layout
- Edit mode provides inline editing with validation
- Supports domain selection, stress die selection, and array editing for haunts/bonds
- Validation ensures required fields are filled and data is valid
- Responsive design works on desktop and mobile

**Usage:**
```tsx
import { LandmarkCard } from './components/cards';

<LandmarkCard
  landmark={myLandmark}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  isEditing={isEditing}
  onEditToggle={setIsEditing}
/>
```

### LandmarkForm

A modal form component for creating new landmarks.

**Props:**
- `isOpen: boolean` - Whether the modal is open
- `onClose: () => void` - Called when modal should close
- `onSubmit: (landmark: Landmark) => void` - Called when form is submitted
- `initialData?: Partial<Landmark>` - Initial form data
- `title?: string` - Modal title (defaults to "Create New Landmark")

**Features:**
- Modal-based form with proper focus management
- Full validation with error messages
- Supports all landmark fields including arrays
- Auto-generates unique IDs for new landmarks
- Resets form state when opened/closed
- Loading states during submission

**Usage:**
```tsx
import { LandmarkForm } from './components/cards';

<LandmarkForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={handleCreateLandmark}
  title="Create New Landmark"
/>
```

## Validation

Both components use the validation utilities from `src/types/validators.ts`:

- **Name**: Required, non-empty string
- **Domains**: At least one domain must be selected
- **Default Stress**: Must be a valid stress die (d4, d6, d8, d10, d12)
- **Haunts/Bonds**: Optional arrays of strings

## Styling

Components use CSS modules with the following files:
- `LandmarkCard.css` - Styles for the landmark card component
- `LandmarkForm.css` - Styles for the landmark form modal

The styling follows the application's design system with:
- Consistent spacing and typography
- Hover and focus states for accessibility
- Responsive design for mobile devices
- Error state styling for validation feedback

## Testing

Comprehensive unit tests are provided:
- `__tests__/LandmarkCard.test.tsx` - Tests for the card component
- `__tests__/LandmarkForm.test.tsx` - Tests for the form component
- `__tests__/LandmarkIntegration.test.tsx` - Integration tests

Tests cover:
- Component rendering and props
- User interactions (clicking, typing, form submission)
- Validation error handling
- Accessibility features
- Edge cases and error states

## Accessibility

Both components follow accessibility best practices:
- Proper semantic HTML structure
- ARIA labels and roles where needed
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly error messages
- High contrast colors and sufficient color contrast ratios

## Dependencies

The components depend on:
- Common UI components (Button, Input, Select, etc.)
- Type definitions from `src/types`
- Validation utilities from `src/types/validators`
- React hooks for state management