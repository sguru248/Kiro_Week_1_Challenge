# Design Document

## Overview

The Offline Map Spots application is a single-page web application built with vanilla HTML, CSS, and JavaScript. It uses Leaflet.js as the open-source mapping library and IndexedDB for robust local data storage. The application follows a simple MVC-inspired architecture where the map interface serves as the primary view, with modular JavaScript components handling data persistence, UI interactions, and spot management.

## Architecture

### Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Styling with Flexbox/Grid for responsive layout
- **Vanilla JavaScript (ES6+)**: Core application logic
- **Leaflet.js 1.9+**: Open-source interactive map library (MIT License)
- **IndexedDB**: Browser-based database for storing spots and photo data
- **OpenStreetMap**: Free map tiles (no API key required)

### Application Structure

```
offline-map-spots/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Application styles
├── js/
│   ├── app.js          # Main application initialization
│   ├── map.js          # Map interface management
│   ├── storage.js      # IndexedDB operations
│   ├── spots.js        # Spot CRUD operations
│   └── ui.js           # UI components and modals
├── lib/
│   └── leaflet/        # Leaflet.js library files
├── README.md           # User documentation
└── requirements.md     # Requirements specification
```

## Components and Interfaces

### 1. Map Manager (map.js)

Handles all map-related operations using Leaflet.js.

**Responsibilities:**
- Initialize Leaflet map with OpenStreetMap tiles
- Handle map click events to capture coordinates
- Create and manage markers for spots
- Center map on user's location (if available)
- Provide methods to add/remove markers

**Key Methods:**
- `initMap()`: Initialize the Leaflet map instance
- `addMarker(spot)`: Add a marker for a spot
- `removeMarker(spotId)`: Remove a marker by spot ID
- `onMapClick(callback)`: Register click handler for map
- `openPopup(spotId)`: Open marker popup with spot details

### 2. Storage Manager (storage.js)

Manages all IndexedDB operations for persistent storage.

**Responsibilities:**
- Initialize IndexedDB database and object stores
- Perform CRUD operations on spots
- Handle photo storage as base64 or Blob
- Provide error handling for storage operations

**Key Methods:**
- `initDB()`: Initialize IndexedDB with schema
- `saveSpot(spot)`: Save a new spot to database
- `getSpot(id)`: Retrieve a spot by ID
- `getAllSpots()`: Retrieve all saved spots
- `updateSpot(id, data)`: Update existing spot
- `deleteSpot(id)`: Delete a spot by ID

**Database Schema:**
```javascript
{
  id: string (UUID),
  title: string,
  latitude: number,
  longitude: number,
  photo: string (base64) | null,
  notes: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. Spot Manager (spots.js)

Business logic for spot operations.

**Responsibilities:**
- Coordinate between storage and map components
- Generate unique IDs for spots
- Validate spot data before saving
- Handle photo file processing

**Key Methods:**
- `createSpot(data)`: Create and save a new spot
- `editSpot(id, data)`: Update an existing spot
- `deleteSpot(id)`: Delete a spot and its marker
- `loadAllSpots()`: Load all spots and display on map
- `validateSpotData(data)`: Validate spot data structure
- `processPhoto(file)`: Convert photo to base64

### 4. UI Manager (ui.js)

Manages all user interface components and interactions.

**Responsibilities:**
- Show/hide modal dialogs
- Render spot creation/edit forms
- Display spot details in popups
- Handle form submissions
- Provide user feedback (loading, errors, success)

**Key Methods:**
- `showSpotForm(coordinates, existingSpot)`: Display form modal
- `hideSpotForm()`: Close form modal
- `showSpotDetails(spot)`: Display spot information
- `showConfirmDialog(message, callback)`: Show confirmation dialog
- `showNotification(message, type)`: Display toast notification
- `renderSpotForm(spot)`: Render form HTML

### 5. Application Controller (app.js)

Main application entry point that coordinates all components.

**Responsibilities:**
- Initialize all modules on page load
- Wire up event handlers
- Coordinate interactions between components
- Handle application lifecycle

**Key Methods:**
- `init()`: Initialize application
- `setupEventListeners()`: Register global event handlers
- `handleMapClick(event)`: Process map click events
- `handleFormSubmit(event)`: Process form submissions

## Data Models

### Spot Model

```javascript
{
  id: string,              // UUID v4
  title: string,           // Required, max 100 characters
  latitude: number,        // Required, -90 to 90
  longitude: number,       // Required, -180 to 180
  photo: string | null,    // Base64 encoded image or null
  notes: string,           // Optional, max 1000 characters
  createdAt: number,       // Unix timestamp
  updatedAt: number        // Unix timestamp
}
```

### Validation Rules

- **title**: Required, 1-100 characters, trimmed
- **latitude**: Required, number between -90 and 90
- **longitude**: Required, number between -180 and 180
- **photo**: Optional, must be valid image file (JPEG, PNG, GIF, WebP), max 5MB
- **notes**: Optional, 0-1000 characters

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Coordinate capture accuracy
*For any* click event on the map interface, the captured coordinates should match the clicked location's latitude and longitude.
**Validates: Requirements 1.1**

### Property 2: Form display with temporary marker
*For any* map click coordinates, displaying the spot creation form should create a temporary marker at those exact coordinates.
**Validates: Requirements 1.2, 1.3**

### Property 3: Cancel cleanup
*For any* spot creation or edit session, canceling should remove any temporary markers and close the form, leaving the application state unchanged.
**Validates: Requirements 1.4, 7.5**

### Property 4: Image format validation
*For any* uploaded file, the application should accept only valid image formats (JPEG, PNG, GIF, WebP) and reject all other file types.
**Validates: Requirements 2.4**

### Property 5: Storage round-trip consistency
*For any* valid spot data (with or without photo), saving to storage and then retrieving should return equivalent data with all fields preserved.
**Validates: Requirements 2.5, 3.1**

### Property 6: Unique identifier assignment
*For any* set of saved spots, all spot IDs should be unique with no collisions.
**Validates: Requirements 3.2**

### Property 7: Marker-spot correspondence
*For any* set of loaded spots, the number of displayed markers should equal the number of spots, and each marker should be positioned at its spot's coordinates.
**Validates: Requirements 3.3, 3.5**

### Property 8: Startup data loading
*For any* application restart, all previously saved spots should be loaded from storage and displayed on the map.
**Validates: Requirements 3.4**

### Property 9: Marker click reveals details
*For any* spot marker on the map, clicking it should display that spot's complete details (title, photo if present, notes).
**Validates: Requirements 4.1**

### Property 10: Details view closure
*For any* open spot details view, closing it should return the map to its previous state without the details overlay.
**Validates: Requirements 4.4**

### Property 11: Deletion removes spot and marker
*For any* confirmed spot deletion, both the spot data in storage and its corresponding marker on the map should be removed.
**Validates: Requirements 5.2, 5.3**

### Property 12: Deletion cancellation preserves state
*For any* deletion cancellation, the spot and its marker should remain unchanged in both storage and on the map.
**Validates: Requirements 5.4**

### Property 13: No external network requests
*For any* user interaction after initial page load, the application should not make HTTP requests to external servers.
**Validates: Requirements 6.2**

### Property 14: Edit form pre-population
*For any* existing spot being edited, the edit form should be pre-filled with that spot's current title, photo, and notes.
**Validates: Requirements 7.2**

### Property 15: Update persistence
*For any* spot edit that is saved, the updated data should be persisted to storage and reflected in the spot's details.
**Validates: Requirements 7.3**

### Property 16: ID stability across updates
*For any* spot that is edited and saved, its unique identifier should remain unchanged.
**Validates: Requirements 7.4**

## Error Handling

### Storage Errors

- **IndexedDB Unavailable**: Display error message and suggest using a modern browser
- **Storage Quota Exceeded**: Notify user and suggest deleting old spots or photos
- **Corrupt Data**: Log error, skip corrupt entries, continue loading valid spots
- **Transaction Failures**: Retry operation once, then display error to user

### Photo Handling Errors

- **Invalid File Type**: Display validation message listing accepted formats
- **File Too Large**: Display message with size limit (5MB)
- **Photo Processing Failure**: Allow saving spot without photo, log error

### Map Errors

- **Geolocation Denied**: Default to a standard location (e.g., world view)
- **Tile Loading Failure**: Display error message, allow continued use with cached tiles
- **Invalid Coordinates**: Validate and clamp coordinates to valid ranges

### UI Errors

- **Form Validation Failures**: Display inline error messages for each invalid field
- **Concurrent Operations**: Disable buttons during async operations to prevent race conditions
- **Missing Required Fields**: Prevent form submission and highlight required fields

## Testing Strategy

### Unit Testing

The application will use a lightweight testing approach with manual testing for UI interactions and automated tests for core logic:

**Manual Testing Checklist:**
- Map click creates form with marker
- Form submission saves spot and creates permanent marker
- Marker click shows correct spot details
- Edit functionality updates spot correctly
- Delete removes spot and marker
- Cancel operations preserve state
- Photo upload and display works correctly
- Application works offline after initial load

**Automated Unit Tests (using Jest or similar):**
- Storage operations (CRUD)
- Data validation functions
- Photo processing (base64 conversion)
- ID generation uniqueness
- Coordinate validation

### Property-Based Testing

The application will use **fast-check** (JavaScript property-based testing library) to verify correctness properties:

**Configuration:**
- Minimum 100 iterations per property test
- Custom generators for:
  - Valid coordinates (latitude: -90 to 90, longitude: -180 to 180)
  - Spot data with optional fields
  - Image file data (base64 strings)
  - Valid and invalid file types

**Property Test Requirements:**
- Each property-based test must run at least 100 iterations
- Each test must be tagged with a comment: `**Feature: offline-map-spots, Property {number}: {property_text}**`
- Each property test must reference its corresponding correctness property from this design document
- Tests should use realistic data generators that respect domain constraints

**Test Organization:**
```
tests/
├── unit/
│   ├── storage.test.js
│   ├── validation.test.js
│   └── utils.test.js
└── properties/
    ├── storage-properties.test.js
    ├── spot-properties.test.js
    └── ui-properties.test.js
```

## Implementation Notes

### Photo Storage Strategy

Photos will be stored as base64-encoded strings in IndexedDB. This approach:
- Simplifies storage (no separate file handling)
- Works reliably across browsers
- Keeps all data in one place
- Has size limitations (recommend 5MB max per photo)

### Map Library Choice: Leaflet.js

Leaflet is chosen because:
- Open-source (MIT License)
- No API keys required
- Lightweight (~40KB)
- Excellent documentation
- Works with free OpenStreetMap tiles
- Active community support

### Browser Compatibility

Target browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Required features:
- IndexedDB support
- ES6+ JavaScript
- CSS Grid/Flexbox
- FileReader API for photo processing

### Performance Considerations

- Lazy load photos (only load when viewing spot details)
- Limit photo size to 5MB to prevent storage issues
- Use efficient IndexedDB queries with indexes
- Debounce map interactions to prevent excessive event handling
- Consider pagination if user has 100+ spots

### Accessibility

- Keyboard navigation for all interactive elements
- ARIA labels for map markers and buttons
- Alt text for photos
- Focus management in modals
- High contrast mode support

## Future Enhancements

Potential features for future versions:
- Export/import spots as JSON
- Search and filter spots by title or notes
- Categories or tags for spots
- Photo gallery view
- Sharing spots via URL (with data encoded)
- Multiple photos per spot
- Drawing routes between spots
- Offline map tile caching
