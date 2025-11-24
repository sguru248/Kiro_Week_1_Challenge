# Offline Map Spots

A simple, offline-first web application for marking and saving your favorite locations on an interactive map. No backend, no database servers, no signup required - everything runs locally in your browser.

## Features

- 📍 Click anywhere on the map to create a spot
- 📝 Add title, photo, and notes to each location
- 💾 All data stored locally in your browser (IndexedDB)
- 🔒 Complete privacy - no data leaves your device
- 🌐 Works offline after initial page load
- 📱 Responsive design for mobile and desktop
- ✏️ Edit and delete spots anytime

## Quick Start

### Option 1: Direct File Access (Simplest)

1. Download or clone this repository
2. Open `index.html` directly in your web browser
3. Start marking your favorite spots!

### Option 2: Local Web Server (Recommended)

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## How to Use

1. **Create a Spot**: Click anywhere on the map
2. **Add Details**: Enter a title (required), upload a photo (optional), and add notes (optional)
3. **Save**: Click the "Save" button
4. **View Details**: Click on any marker to see spot details
5. **Edit**: Click "Edit" in the spot details view
6. **Delete**: Click "Delete" and confirm to remove a spot

## Dependencies

- **Leaflet.js 1.9.4** - Open-source mapping library (MIT License)
- **OpenStreetMap** - Free map tiles (no API key required)

All dependencies are included in the `lib/` folder. No installation required.

## Browser Compatibility

Works on modern browsers with IndexedDB support:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Technical Details

### Architecture

- **HTML5** - Semantic markup
- **CSS3** - Responsive styling with Flexbox/Grid
- **Vanilla JavaScript (ES6+)** - No frameworks
- **IndexedDB** - Local data persistence
- **Leaflet.js** - Interactive maps

### Data Storage

All data is stored locally in your browser using IndexedDB:
- Spots with metadata (title, notes, coordinates)
- Photos as base64-encoded strings (max 5MB per photo)
- No external servers or cloud storage

### File Structure

```
offline-map-spots/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Application styles
├── js/
│   ├── app.js          # Application initialization
│   ├── map.js          # Map management
│   ├── storage.js      # IndexedDB operations
│   ├── spots.js        # Spot CRUD logic
│   └── ui.js           # UI components
├── lib/
│   └── leaflet/        # Leaflet.js library
└── README.md           # This file
```

## Privacy & Data

- **100% Local**: All data stays on your device
- **No Tracking**: No analytics or external requests
- **No Account**: No signup or authentication required
- **Your Control**: Export or delete data anytime by clearing browser storage

## Limitations

- Photos limited to 5MB each
- Data tied to browser (clearing browser data removes spots)
- No sync between devices
- No backup/restore (yet)

## Future Enhancements

- Export/import spots as JSON
- Search and filter functionality
- Categories and tags
- Multiple photos per spot
- Route drawing between spots

## License

MIT License - Feel free to use, modify, and distribute.

## Credits

- Maps powered by [Leaflet.js](https://leafletjs.com/)
- Map tiles from [OpenStreetMap](https://www.openstreetmap.org/)

## Troubleshooting

**Map not loading?**
- Check your internet connection (needed for initial tile download)
- Ensure JavaScript is enabled
- Try a different browser

**Spots not saving?**
- Check browser storage isn't full
- Ensure IndexedDB is enabled
- Try clearing browser cache

**Photos not uploading?**
- Check file size (max 5MB)
- Use supported formats: JPEG, PNG, GIF, WebP

---

Made with ❤️ for offline-first web apps
