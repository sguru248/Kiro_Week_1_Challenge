// Application Controller - Main entry point
// Initializes all modules and coordinates application lifecycle

const App = {
    async init() {
        try {
            UIManager.init();
            await StorageManager.initDB();
            MapManager.initMap();
            await SpotManager.loadAllSpots();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            UIManager.showNotification('Failed to initialize app', 'error');
        }
    },

    setupEventListeners() {
        MapManager.onMapClick((e) => {
            MapManager.createTempMarker(e.latlng.lat, e.latlng.lng);
            UIManager.showSpotForm(e.latlng);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
