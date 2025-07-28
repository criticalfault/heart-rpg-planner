# Requirements Document

## Introduction

This feature creates a React.js single page application for the Heart RPG Delve Map planner. The application will display interactive UI cards representing Landmarks and Delves, allowing Game Masters to create, edit, and organize their Heart RPG delve locations with all necessary game mechanics and information.

## Requirements

### Requirement 1

**User Story:** As a Heart RPG Game Master, I want to create and manage Landmark cards, so that I can define important locations in my delve with their mechanical properties.

#### Acceptance Criteria

1. WHEN creating a Landmark THEN the system SHALL allow me to enter a Name as a string
2. WHEN setting Landmark properties THEN the system SHALL allow me to select multiple Domains from [Cursed, Desolate, Haven, Occult, Religion, Technology, Warren, Wild]
3. WHEN configuring a Landmark THEN the system SHALL allow me to select Default Stress from ['d4','d6','d8','d10','d12']
4. WHEN managing Landmark details THEN the system SHALL allow me to add, edit, and remove items from the Haunts array
5. WHEN managing Landmark relationships THEN the system SHALL allow me to add, edit, and remove items from the Bonds array
6. WHEN viewing a Landmark THEN the system SHALL display all properties in a clear, organized card format

### Requirement 2

**User Story:** As a Heart RPG Game Master, I want to create and manage Delve cards, so that I can define explorable areas with their challenges and rewards.

#### Acceptance Criteria

1. WHEN creating a Delve THEN the system SHALL allow me to enter a Name as a string
2. WHEN setting Delve difficulty THEN the system SHALL allow me to set Resistance as a number between 1 and 50
3. WHEN configuring a Delve THEN the system SHALL allow me to select multiple Domains from [Cursed, Desolate, Haven, Occult, Religion, Technology, Warren, Wild]
4. WHEN managing Delve content THEN the system SHALL allow me to add, edit, and remove items from the Events array
5. WHEN managing Delve rewards THEN the system SHALL allow me to add, edit, and remove items from the Resources array
6. WHEN managing Delve threats THEN the system SHALL allow me to add, edit, and remove Monster objects
7. WHEN viewing a Delve THEN the system SHALL display all properties in a clear, organized card format

### Requirement 3

**User Story:** As a Heart RPG Game Master, I want to create and manage Monster entries within Delves, so that I can define the threats players will encounter.

#### Acceptance Criteria

1. WHEN creating a Monster THEN the system SHALL allow me to enter a Name as a string
2. WHEN setting Monster combat stats THEN the system SHALL allow me to set Resistance as a number between 1 and 20
3. WHEN setting Monster defense THEN the system SHALL allow me to set Protection as a number between 1 and 12
4. WHEN defining Monster capabilities THEN the system SHALL allow me to add, edit, and remove items from the Attacks array
5. WHEN setting Monster rewards THEN the system SHALL allow me to add, edit, and remove items from the Resources array
6. WHEN adding Monster details THEN the system SHALL allow me to enter Notes as a multi-line text field
7. WHEN viewing a Monster THEN the system SHALL display all properties within the parent Delve card

### Requirement 4

**User Story:** As a Heart RPG Game Master, I want an intuitive card-based interface, so that I can quickly scan and manage my delve locations.

#### Acceptance Criteria

1. WHEN viewing the delve map THEN the system SHALL display Landmarks and Delves as distinct, visually differentiated cards
2. WHEN interacting with cards THEN the system SHALL provide clear visual feedback for hover and selection states
3. WHEN managing multiple cards THEN the system SHALL allow me to organize and rearrange cards in the interface
4. WHEN editing card content THEN the system SHALL provide inline editing capabilities without losing context
5. WHEN working with arrays THEN the system SHALL provide intuitive add/remove buttons for list items

### Requirement 5

**User Story:** As a Heart RPG Game Master, I want to visually connect locations and delves on a spatial map, so that I can show how areas relate to each other geographically.

#### Acceptance Criteria

1. WHEN placing cards on the map THEN the system SHALL provide a hex grid layout for positioning
2. WHEN moving cards THEN the system SHALL allow me to drag and drop cards to different hex positions
3. WHEN connecting locations THEN the system SHALL allow me to create visual connections between landmarks and delves
4. WHEN viewing connections THEN the system SHALL display connection lines or paths between linked cards
5. WHEN editing connections THEN the system SHALL allow me to add, modify, and remove connections between cards

### Requirement 6

**User Story:** As a Heart RPG Game Master, I want to save monsters, landmarks, and delves to a personal library, so that I can reuse them across different campaigns and maps.

#### Acceptance Criteria

1. WHEN creating content THEN the system SHALL provide an option to save items to my personal library
2. WHEN accessing the library THEN the system SHALL display saved monsters, landmarks, and delves in organized categories
3. WHEN using library items THEN the system SHALL allow me to copy saved items to the current map
4. WHEN managing the library THEN the system SHALL allow me to edit, delete, and organize saved items
5. WHEN using the library THEN the system SHALL persist library data locally on my PC

### Requirement 7

**User Story:** As a Heart RPG Game Master, I want the application to be responsive and performant, so that I can use it effectively during game sessions.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display the delve map interface within 3 seconds
2. WHEN creating or editing cards THEN the system SHALL respond to user interactions within 200ms
3. WHEN using the interface on different devices THEN the system SHALL provide a responsive layout that works on desktop and tablet
4. WHEN managing large numbers of cards THEN the system SHALL maintain smooth performance and scrolling
5. WHEN encountering errors THEN the system SHALL display helpful error messages and allow recovery