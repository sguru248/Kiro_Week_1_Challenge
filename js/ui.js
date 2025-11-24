// UI Manager - User interface components and interactions
// Handles modals, forms, notifications, and user feedback

const UIManager = {
    modalOverlay: null,
    modalContent: null,
    toast: null,
    sidebar: null,
    spotsList: null,

    init() {
        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalContent = document.getElementById('modal-content');
        this.toast = document.getElementById('toast');
        this.sidebar = document.getElementById('sidebar');
        this.spotsList = document.getElementById('spots-list');

        // Toggle sidebar
        document.getElementById('toggle-sidebar').onclick = () => {
            this.sidebar.classList.toggle('hidden');
            if (window.innerWidth <= 768) {
                this.sidebar.classList.toggle('active');
            }
        };
    },

    updateSpotsList(spots) {
        const count = spots.length;
        document.getElementById('spot-count').textContent = count;

        if (count === 0) {
            this.spotsList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M32 8C23.16 8 16 15.16 16 24C16 35 32 56 32 56C32 56 48 35 48 24C48 15.16 40.84 8 32 8ZM32 30C28.68 30 26 27.32 26 24C26 20.68 28.68 18 32 18C35.32 18 38 20.68 38 24C38 27.32 35.32 30 32 30Z"/>
                    </svg>
                    <p>No spots yet</p>
                    <small>Click on the map to add your first favorite place</small>
                </div>
            `;
            return;
        }

        const html = spots.map(spot => `
            <div class="spot-card" data-spot-id="${spot.id}">
                ${spot.photo 
                    ? `<img src="${spot.photo}" alt="${spot.title}" class="spot-card-image">`
                    : `<div class="spot-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    </div>`
                }
                <div class="spot-card-content">
                    <div class="spot-card-title">${spot.title}</div>
                    <div class="spot-card-notes">${spot.notes || 'No notes'}</div>
                </div>
                <button class="spot-card-delete" data-spot-id="${spot.id}" title="Delete spot">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');

        this.spotsList.innerHTML = html;

        // Add click handlers for cards
        document.querySelectorAll('.spot-card').forEach(card => {
            const spotId = card.dataset.spotId;
            const spot = spots.find(s => s.id === spotId);
            
            card.onclick = (e) => {
                // Don't trigger if clicking delete button
                if (e.target.closest('.spot-card-delete')) return;
                
                if (spot) {
                    // Check if already at this location
                    const currentCenter = MapManager.map.getCenter();
                    const distance = MapManager.map.distance(
                        currentCenter,
                        [spot.latitude, spot.longitude]
                    );
                    
                    if (distance < 100 && MapManager.map.getZoom() >= 15) {
                        // Already there, show details
                        this.showSpotDetailsPanel(spot);
                    } else {
                        // Fly to location first
                        MapManager.flyToSpot(spot);
                    }
                }
            };
        });

        // Add delete button handlers
        document.querySelectorAll('.spot-card-delete').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const spotId = btn.dataset.spotId;
                const spot = spots.find(s => s.id === spotId);
                if (spot) {
                    this.showConfirmDialog(`Delete "${spot.title}"?`, () => {
                        SpotManager.deleteSpot(spotId);
                    });
                }
            };
        });
    },

    showSpotForm(coordinates, existingSpot = null) {
        const isEdit = !!existingSpot;
        const html = `
            <h2>${isEdit ? 'Edit' : 'Add'} Spot</h2>
            <form id="spot-form">
                <div class="form-group">
                    <label for="title">Title *</label>
                    <input type="text" id="title" name="title" required maxlength="100" value="${existingSpot?.title || ''}">
                </div>
                <div class="form-group">
                    <label for="photo">Photo</label>
                    <input type="file" id="photo" name="photo" accept="image/jpeg,image/png,image/gif,image/webp">
                    <div id="photo-preview" class="photo-preview"></div>
                </div>
                <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" name="notes" maxlength="1000">${existingSpot?.notes || ''}</textarea>
                </div>
                <div class="btn-group">
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Save'}</button>
                    <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                </div>
            </form>
        `;
        this.modalContent.innerHTML = html;
        this.modalOverlay.classList.remove('hidden');

        if (existingSpot?.photo) {
            document.getElementById('photo-preview').innerHTML = `<img src="${existingSpot.photo}" alt="Preview">`;
        }

        document.getElementById('spot-form').onsubmit = (e) => {
            e.preventDefault();
            SpotManager.handleFormSubmit(coordinates, existingSpot);
        };

        document.getElementById('cancel-btn').onclick = () => {
            this.hideSpotForm();
            MapManager.removeTempMarker();
        };

        document.getElementById('photo').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                SpotManager.processPhoto(file).then(base64 => {
                    document.getElementById('photo-preview').innerHTML = `<img src="${base64}" alt="Preview">`;
                });
            }
        };
    },

    hideSpotForm() {
        this.modalOverlay.classList.add('hidden');
        this.modalContent.innerHTML = '';
    },

    showSpotDetails(spot) {
        this.showSpotDetailsPanel(spot);
    },

    showSpotDetailsPanel(spot) {
        // Remove existing panel if any
        const existingPanel = document.getElementById('details-panel');
        if (existingPanel) existingPanel.remove();

        const panel = document.createElement('div');
        panel.id = 'details-panel';
        panel.className = 'details-panel';
        panel.innerHTML = `
            <div class="details-panel-header">
                <h2>${spot.title}</h2>
                <button class="btn-icon-close" id="close-details">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="details-panel-content">
                ${spot.photo ? `
                    <div class="details-photo">
                        <img src="${spot.photo}" alt="${spot.title}">
                    </div>
                ` : ''}
                <div class="details-section">
                    <div class="details-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Notes
                    </div>
                    <div class="details-value">${spot.notes || 'No notes added'}</div>
                </div>
                <div class="details-section">
                    <div class="details-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Location
                    </div>
                    <div class="details-value">${spot.latitude.toFixed(6)}, ${spot.longitude.toFixed(6)}</div>
                </div>
                <div class="details-section">
                    <div class="details-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Created
                    </div>
                    <div class="details-value">${new Date(spot.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
            <div class="details-panel-actions">
                <button class="btn btn-primary btn-block" id="edit-spot-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Spot
                </button>
                <button class="btn btn-danger btn-block" id="delete-spot-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete Spot
                </button>
            </div>
        `;

        document.body.appendChild(panel);
        setTimeout(() => panel.classList.add('active'), 10);

        document.getElementById('close-details').onclick = () => {
            panel.classList.remove('active');
            setTimeout(() => panel.remove(), 300);
        };

        document.getElementById('edit-spot-btn').onclick = () => {
            panel.remove();
            this.showSpotForm({ lat: spot.latitude, lng: spot.longitude }, spot);
        };

        document.getElementById('delete-spot-btn').onclick = () => {
            panel.remove();
            this.showConfirmDialog(`Delete "${spot.title}"?`, () => {
                SpotManager.deleteSpot(spot.id);
            });
        };
    },

    showConfirmDialog(message, onConfirm) {
        const html = `
            <h2>Confirm</h2>
            <p>${message}</p>
            <div class="btn-group">
                <button class="btn btn-danger" id="confirm-btn">Yes</button>
                <button class="btn btn-secondary" id="cancel-confirm-btn">No</button>
            </div>
        `;
        this.modalContent.innerHTML = html;
        this.modalOverlay.classList.remove('hidden');

        document.getElementById('confirm-btn').onclick = () => {
            this.hideSpotForm();
            onConfirm();
        };

        document.getElementById('cancel-confirm-btn').onclick = () => {
            this.hideSpotForm();
        };
    },

    showNotification(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.remove('hidden');
        setTimeout(() => {
            this.toast.classList.add('hidden');
        }, 3000);
    }
};
