# Implementation Plan

- [x] 1. Fix SimpleCard drag handle positioning and add connection point UI



  - Move drag handle from right side to left side of the card
  - Add connection point button on the right side when in connection mode
  - Update SimpleCard.css to properly position both elements
  - Ensure drag handle doesn't interfere with connection functionality



  - _Requirements: 5.1, 5.2, 5.3, 5.4, 2.4_

- [ ] 2. Fix ConnectionLine positioning calculations
  - Update ConnectionLine component to calculate card center points accurately



  - Account for card dimensions (200px width, 120px height) in positioning
  - Fix arrow positioning to point to card centers rather than corners
  - Test connection line rendering with different card positions
  - _Requirements: 4.1, 4.2, 3.4_

- [ ] 3. Fix ConnectionManager integration with DelveMapPage
  - Ensure ConnectionManager receives proper props from DelveMapPage
  - Fix connection mode state management between components
  - Update connection creation workflow to work with current card selection system
  - Add proper event handling for connection clicks on cards
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [ ] 4. Implement connection mode visual feedback and instructions
  - Add visual indicators when connection mode is active
  - Show clear instructions for creating connections
  - Implement card selection highlighting in connection mode
  - Add success/error messages for connection operations
  - _Requirements: 1.4, 1.5, 2.4, 2.5, 2.6_

- [ ] 5. Fix connection line visibility and interaction
  - Ensure connection lines are properly rendered in the SVG overlay
  - Fix hover states and delete button functionality for connection lines
  - Implement proper z-index layering for connections
  - Add connection type styling (colors and line styles)
  - _Requirements: 3.1, 3.2, 3.3, 4.3, 4.4, 4.5_

- [ ] 6. Test and debug the complete connection system
  - Test connection creation workflow end-to-end
  - Verify connection lines update when cards are moved
  - Test connection deletion functionality
  - Ensure connection state persists properly
  - Test connection system with different card types and positions
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_