# Requirements Document

## Introduction

The Heart RPG Planner currently has a partially implemented connection system that allows users to create visual connections between landmarks and delves on the map. However, the connection functionality is not working properly - users cannot see connection UI elements on cards, cannot create connections between cards, and existing connections are not being rendered correctly. This feature needs to be completed to allow users to visualize relationships between different locations in their RPG campaigns.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see connection controls and be able to toggle connection mode, so that I can create connections between cards on my map.

#### Acceptance Criteria

1. WHEN I view the map THEN I SHALL see connection control buttons in the top-right corner
2. WHEN I click the connection toggle button THEN the system SHALL show/hide existing connections
3. WHEN I click the connection mode button THEN the system SHALL enter connection creation mode
4. WHEN in connection mode THEN I SHALL see visual indicators on cards that they can be connected
5. WHEN in connection mode THEN I SHALL see instructions explaining how to create connections

### Requirement 2

**User Story:** As a user, I want to click on cards to create connections between them, so that I can visualize relationships between locations.

#### Acceptance Criteria

1. WHEN in connection mode AND I click on a card THEN the system SHALL select that card as the connection start point
2. WHEN I have selected a start card AND I click on a different card THEN the system SHALL create a connection between the two cards
3. WHEN I click on the same card twice THEN the system SHALL deselect it
4. WHEN I create a connection THEN the system SHALL show a success message
5. WHEN I try to create a duplicate connection THEN the system SHALL show an appropriate message
6. WHEN I complete or cancel a connection THEN the system SHALL reset the selection state

### Requirement 3

**User Story:** As a user, I want to see visual connection lines between connected cards, so that I can understand the relationships in my map.

#### Acceptance Criteria

1. WHEN connections exist AND connection visibility is enabled THEN I SHALL see lines drawn between connected cards
2. WHEN I hover over a connection line THEN the system SHALL highlight the line and show a delete button
3. WHEN I click the delete button on a connection THEN the system SHALL remove that connection
4. WHEN cards are moved THEN the connection lines SHALL update their positions automatically
5. WHEN connection lines are drawn THEN they SHALL use different colors/styles based on connection type (landmark-to-delve, delve-to-delve, landmark-to-landmark)

### Requirement 4

**User Story:** As a user, I want connection lines to be properly positioned and styled, so that the visual representation is clear and professional.

#### Acceptance Criteria

1. WHEN drawing connection lines THEN the system SHALL calculate the center points of cards accurately
2. WHEN drawing connection lines THEN the system SHALL add appropriate arrow markers to show direction
3. WHEN drawing connection lines THEN the system SHALL use different visual styles for different connection types
4. WHEN cards overlap with connection lines THEN the lines SHALL be rendered at the appropriate z-index
5. WHEN the map is zoomed THEN the connection lines SHALL scale appropriately

### Requirement 5

**User Story:** As a user, I want the drag handle to be positioned on the left side of cards, so that it doesn't interfere with connection controls on the right side.

#### Acceptance Criteria

1. WHEN I view a card THEN the drag handle SHALL be positioned on the left side of the card
2. WHEN I hover over the drag handle THEN it SHALL provide visual feedback that it can be used for dragging
3. WHEN I drag using the handle THEN the card SHALL move smoothly without interfering with other UI elements
4. WHEN in connection mode THEN the drag handle SHALL remain functional and not conflict with connection controls