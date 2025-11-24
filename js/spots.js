// Spot Manager - Business logic for spot operations
// Coordinates between storage, map, and UI components

const SpotManager = {
    currentSpot: null,

    async createSpot(data) {
        const spot = {
            id: this.generateId(),
            title: data.title.trim(),
            latitude: data.latitude,
            longitude: data.longitude,
            photo: data.photo || null,
            notes: data.notes.trim(),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await StorageManager.saveSpot(spot);
        MapManager.addMarker(spot);
        await this.refreshSidebar();
        UIManager.showNotification('Spot saved!', 'success');
        return spot;
    },

    async editSpot(id, data) {
        const updated = {
            ...data,
            id,
            updatedAt: Date.now()
        };

        await StorageManager.updateSpot(id, updated);
        MapManager.removeMarker(id);
        MapManager.addMarker(updated);
        await this.refreshSidebar();
        UIManager.showNotification('Spot updated!', 'success');
        return updated;
    },

    async deleteSpot(id) {
        await StorageManager.deleteSpot(id);
        MapManager.removeMarker(id);
        await this.refreshSidebar();
        UIManager.hideSpotForm();
        UIManager.showNotification('Spot deleted!', 'success');
    },

    async loadAllSpots() {
        const spots = await StorageManager.getAllSpots();
        spots.forEach(spot => MapManager.addMarker(spot));
        UIManager.updateSpotsList(spots);
    },

    async refreshSidebar() {
        const spots = await StorageManager.getAllSpots();
        UIManager.updateSpotsList(spots);
    },

    validateSpotData(data) {
        if (!data.title || data.title.trim().length === 0) {
            throw new Error('Title is required');
        }
        if (data.title.length > 100) {
            throw new Error('Title must be 100 characters or less');
        }
        if (data.notes && data.notes.length > 1000) {
            throw new Error('Notes must be 1000 characters or less');
        }
        return true;
    },

    async processPhoto(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please use JPEG, PNG, GIF, or WebP');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File too large. Maximum size is 5MB');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    async handleFormSubmit(coordinates, existingSpot) {
        try {
            const form = document.getElementById('spot-form');
            const formData = new FormData(form);
            const photoFile = formData.get('photo');

            const data = {
                title: formData.get('title'),
                latitude: coordinates.lat,
                longitude: coordinates.lng,
                notes: formData.get('notes') || '',
                photo: existingSpot?.photo || null
            };

            if (photoFile && photoFile.size > 0) {
                data.photo = await this.processPhoto(photoFile);
            }

            this.validateSpotData(data);

            if (existingSpot) {
                await this.editSpot(existingSpot.id, data);
            } else {
                await this.createSpot(data);
                MapManager.removeTempMarker();
            }

            UIManager.hideSpotForm();
        } catch (error) {
            UIManager.showNotification(error.message, 'error');
        }
    }
};
