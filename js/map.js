// Map Manager - Leaflet.js map operations
// Handles map initialization, markers, and interactions

const MapManager = {
    map: null,
    markers: new Map(),
    tempMarker: null,
    currentLayer: null,
    basemaps: {
        streets: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        },
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri',
            maxZoom: 19
        },
        terrain: {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attribution: '© OpenTopoMap contributors',
            maxZoom: 17
        },
        dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '© CartoDB',
            maxZoom: 19
        }
    },

    initMap() {
        this.map = L.map('map').setView([20, 0], 2);
        
        // Add default basemap
        this.currentLayer = L.tileLayer(this.basemaps.streets.url, {
            attribution: this.basemaps.streets.attribution,
            maxZoom: this.basemaps.streets.maxZoom
        }).addTo(this.map);

        // Update marker sizes on zoom
        this.map.on('zoomend', () => {
            this.updateMarkerSizes();
        });

        // Setup basemap selector
        this.setupBasemapSelector();

        // Prevent clicks on Leaflet controls from triggering map clicks
        setTimeout(() => {
            document.querySelectorAll('.leaflet-control').forEach(control => {
                control.onclick = (e) => {
                    e.stopPropagation();
                };
            });
        }, 100);
    },

    setupBasemapSelector() {
        document.querySelectorAll('.basemap-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const basemap = btn.dataset.basemap;
                this.changeBasemap(basemap);
                
                // Update active state
                document.querySelectorAll('.basemap-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });

        // Prevent map clicks on basemap selector
        const selector = document.querySelector('.basemap-selector');
        if (selector) {
            selector.onclick = (e) => {
                e.stopPropagation();
            };
        }
    },

    changeBasemap(basemapName) {
        if (this.currentLayer) {
            this.map.removeLayer(this.currentLayer);
        }

        const basemap = this.basemaps[basemapName];
        this.currentLayer = L.tileLayer(basemap.url, {
            attribution: basemap.attribution,
            maxZoom: basemap.maxZoom
        }).addTo(this.map);
    },

    createCustomIcon(spot) {
        const zoom = this.map.getZoom();
        const size = this.getMarkerSize(zoom);

        if (spot.photo) {
            // Photo marker
            const iconHtml = `
                <div class="photo-marker" style="width: ${size}px; height: ${size}px;">
                    <img src="${spot.photo}" alt="${spot.title}">
                </div>
            `;
            return L.divIcon({
                html: iconHtml,
                className: 'custom-marker',
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2]
            });
        } else {
            // Icon marker
            const iconHtml = `
                <div class="icon-marker" style="width: ${size}px; height: ${size}px;">
                    <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </div>
            `;
            return L.divIcon({
                html: iconHtml,
                className: 'custom-marker',
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2]
            });
        }
    },

    getMarkerSize(zoom) {
        if (zoom < 5) return 30;
        if (zoom < 8) return 40;
        if (zoom < 12) return 50;
        if (zoom < 15) return 60;
        return 70;
    },

    addMarker(spot) {
        const icon = this.createCustomIcon(spot);
        const marker = L.marker([spot.latitude, spot.longitude], { icon })
            .addTo(this.map)
            .on('click', () => {
                UIManager.showSpotDetails(spot);
            });
        
        this.markers.set(spot.id, { marker, spot });
        return marker;
    },

    updateMarkerSizes() {
        this.markers.forEach(({ marker, spot }) => {
            const newIcon = this.createCustomIcon(spot);
            marker.setIcon(newIcon);
        });
    },

    removeMarker(spotId) {
        const markerData = this.markers.get(spotId);
        if (markerData) {
            this.map.removeLayer(markerData.marker);
            this.markers.delete(spotId);
        }
    },

    onMapClick(callback) {
        this.map.on('click', callback);
    },

    createTempMarker(lat, lng) {
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }
        this.tempMarker = L.marker([lat, lng]).addTo(this.map);
    },

    removeTempMarker() {
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
    },

    flyToSpot(spot) {
        this.map.flyTo([spot.latitude, spot.longitude], 15, {
            duration: 1
        });
    }
};
