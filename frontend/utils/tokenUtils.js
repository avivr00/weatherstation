// Token utility functions for consistent authentication handling

import { getUserData, clearUserData } from './storage.js';

/**
 * Get the current authentication token from storage
 * @returns {string|null} Token string or null if not authenticated
 */
export function getAuthToken() {
    const authData = getUserData();
    return authData?.token || null;
}

/**
 * Check if user has a valid authentication token
 * @returns {boolean} True if authenticated with valid token
 */
export function hasValidToken() {
    const token = getAuthToken();
    return token && token !== null && token !== 'undefined' && token.length > 10;
}

/**
 * Get authorization headers for authenticated requests
 * @returns {Object|null} Headers object with Authorization or null if not authenticated
 */
export function getAuthHeaders() {
    const token = getAuthToken();
    if (!token) {
        return null;
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Make an authenticated fetch request with automatic token handling
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If not authenticated or request fails
 */
export async function authenticatedFetch(url, options = {}) {
    const headers = getAuthHeaders();
    
    if (!headers) {
        throw new Error('Not authenticated - no valid token found');
    }
    
    const requestOptions = {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, requestOptions);
    
    // Handle token expiration or invalid token
    if (response.status === 401) {
        console.warn('Authentication token expired or invalid, clearing storage');
        clearUserData();
        throw new Error('Authentication expired - please login again');
    }
    
    return response;
}

/**
 * Validate token format (basic JWT structure check)
 * @param {string} token - Token to validate
 * @returns {boolean} True if token appears to be valid JWT format
 */
export function isValidJWTFormat(token) {
    if (!token || typeof token !== 'string') {
        return false;
    }
    
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Log out user and clear all authentication data
 */
export function handleLogout() {
    clearUserData();
    // Redirect to login page
    window.location.href = '/pages/login/login.html';
}
