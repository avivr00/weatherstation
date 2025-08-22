// Storage utility functions for localStorage and sessionStorage management

/**
 * Save user authentication data to storage
 * @param {Object} userData - User data object
 * @param {boolean} rememberMe - Whether to use localStorage (true) or sessionStorage (false)
 */
function saveUserData(userData, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Only save if we have a valid token
    if (userData.token) {
        storage.setItem("userToken", userData.token);
        storage.setItem("userData", JSON.stringify(userData));
    } else {
        console.error("No valid token provided to saveUserData:", userData);
    }
}

/**
 * Get user authentication data from storage
 * @returns {Object|null} User data object or null if not found
 */
function getUserData() {
    const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
    const userData = localStorage.getItem("userData") || sessionStorage.getItem("userData");
    
    if (!token || !userData) {
        return null;
    }
    
    try {
        return {
            token,
            user: JSON.parse(userData)
        };
    } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
function isAuthenticated() {
    return getUserData() !== null;
}

/**
 * Clear all authentication data
 */
function clearUserData() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
}

/**
 * Save user events to localStorage
 * @param {number} userId - User ID
 * @param {Array} events - Array of user events
 */
function saveUserEvents(userId, events) {
    if (!userId) return;
    
    // Save only locally created events
    const localEvents = events.filter(event => event.isLocal);
    localStorage.setItem(`userEvents_${userId}`, JSON.stringify(localEvents));
}

/**
 * Load user events from localStorage
 * @param {number} userId - User ID
 * @returns {Array} Array of user events
 */
function loadUserEvents(userId) {
    if (!userId) return [];
    
    const localEventsData = localStorage.getItem(`userEvents_${userId}`);
    if (localEventsData) {
        try {
            return JSON.parse(localEventsData);
        } catch (error) {
            console.error("Error parsing user events:", error);
            return [];
        }
    }
    return [];
}

/**
 * Save application settings
 * @param {Object} settings - Settings object
 */
function saveAppSettings(settings) {
    localStorage.setItem('appSettings', JSON.stringify(settings));
}

/**
 * Load application settings
 * @returns {Object} Settings object with defaults
 */
function loadAppSettings() {
    const defaultSettings = {
        theme: 'light',
        language: 'en',
        defaultLocation: 'Kiryat Shmona'
    };
    
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        try {
            return { ...defaultSettings, ...JSON.parse(savedSettings) };
        } catch (error) {
            console.error("Error parsing app settings:", error);
            return defaultSettings;
        }
    }
    return defaultSettings;
}

/**
 * Generic function to save data to localStorage
 * @param {string} key - Storage key
 * @param {*} data - Data to store (will be JSON.stringify'd)
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
    }
}

/**
 * Generic function to load data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed data or default value
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        if (data === null) return defaultValue;
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading from localStorage (${key}):`, error);
        return defaultValue;
    }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key to remove
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
    }
}

export {
    saveUserData,
    getUserData,
    isAuthenticated,
    clearUserData,
    saveUserEvents,
    loadUserEvents,
    saveAppSettings,
    loadAppSettings,
    saveToStorage,
    loadFromStorage,
    removeFromStorage
};