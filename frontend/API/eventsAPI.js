// Events API for backend communication
// This handles all event-related API calls to the backend server

import { authenticatedFetch, hasValidToken } from '../utils/tokenUtils.js';
import { API_BASE_URL } from '../config/api.js';

const config = {
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
};

const EVENTS_PATH = `${config.baseURL}/api/events`;

/**
 * Create a new event
 * @param {string} title - Event title
 * @param {string} description - Event description (optional)
 * @param {string} dateTime - Event date/time in ISO format
 * @returns {Promise<Object>} Response object with success/error data
 */
const createEvent = async (title, description, dateTime) => {
    try {
        if (!hasValidToken()) {
            return {
                success: false,
                message: "Not authenticated - please login first"
            };
        }

        const response = await authenticatedFetch(EVENTS_PATH, {
            method: "POST",
            body: JSON.stringify({
                title,
                description: description || null,
                date_time: dateTime
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.detail || data.message || data.error || "Failed to create event"
            };
        }

        return {
            success: true,
            data: data.data,
            message: data.message
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error - Could not connect to server"
        };
    }
};

/**
 * Get all events for the authenticated user
 * @returns {Promise<Object>} Response object with events array
 */
const getUserEvents = async () => {
    try {
        if (!hasValidToken()) {
            return {
                success: false,
                message: "Not authenticated - please login first"
            };
        }

        const response = await authenticatedFetch(EVENTS_PATH, {
            method: "GET"
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.detail || data.message || data.error || "Failed to get events"
            };
        }

        return {
            success: true,
            data: data.data || [],
            message: data.message
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error - Could not connect to server"
        };
    }
};

/**
 * Get a specific event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Response object with event data
 */
const getEventById = async (eventId) => {
    try {
        if (!hasValidToken()) {
            return {
                success: false,
                message: "Not authenticated - please login first"
            };
        }

        const response = await authenticatedFetch(`${EVENTS_PATH}/${eventId}`, {
            method: "GET"
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.detail || data.message || data.error || "Failed to get event"
            };
        }

        return {
            success: true,
            data: data.data,
            message: data.message
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error - Could not connect to server"
        };
    }
};

/**
 * Update an existing event
 * @param {number} eventId - Event ID
 * @param {Object} updates - Object with fields to update (title, description, dateTime)
 * @returns {Promise<Object>} Response object with updated event data
 */
const updateEvent = async (eventId, updates) => {
    try {
        if (!hasValidToken()) {
            return {
                success: false,
                message: "Not authenticated - please login first"
            };
        }

        const updateData = {};
        
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.dateTime !== undefined) updateData.date_time = updates.dateTime;

        const response = await authenticatedFetch(`${EVENTS_PATH}/${eventId}`, {
            method: "PUT",
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.detail || data.message || data.error || "Failed to update event"
            };
        }

        return {
            success: true,
            data: data.data,
            message: data.message
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error - Could not connect to server"
        };
    }
};

/**
 * Delete an event
 * @param {number} eventId - Event ID
 * @returns {Promise<Object>} Response object
 */
const deleteEvent = async (eventId) => {
    try {
        if (!hasValidToken()) {
            return {
                success: false,
                message: "Not authenticated - please login first"
            };
        }

        const response = await authenticatedFetch(`${EVENTS_PATH}/${eventId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.detail || data.message || data.error || "Failed to delete event"
            };
        }

        return {
            success: true,
            data: data.data,
            message: data.message
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error - Could not connect to server"
        };
    }
};

/**
 * Update server configuration (useful for switching environments)
 * @param {Object} newConfig - New configuration object
 */
const updateConfig = (newConfig) => {
    Object.assign(config, newConfig);
};

export {
    createEvent,
    getUserEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    updateConfig
};
