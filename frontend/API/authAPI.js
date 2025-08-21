// Real authentication API for server communication
// This will be used when connecting to an actual backend server

const config = {
    baseURL: "http://localhost:8000", // Change this to your actual server URL
    headers: {
        "Content-Type": "application/json"
    }
};

const REGISTER_PATH = `${config.baseURL}/api/auth/register`;
const LOGIN_PATH = `${config.baseURL}/api/auth/login`;
const LOGOUT_PATH = `${config.baseURL}/api/auth/logout`;
const VALIDATE_TOKEN_PATH = `${config.baseURL}/api/auth/validate`;

/**
 * Register function for server authentication
 * @param {string} first_name - User's first name
 * @param {string} last_name - User's last name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response object with success/error data
 */
const register = async (first_name, last_name, email, password) => {
    try {
        const response = await fetch(REGISTER_PATH, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                first_name,
                last_name,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || data.error || "Registration failed"
            };
        }

        return {
            success: true,
            data: {
                ...data.data,
                token: data.data.access_token || data.data.token, // Normalize token field
                user: data.data.user || { first_name, last_name, email } // Add user info if not present
            }
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error - Could not connect to server"
        };
    }
};

/**
 * Login function for server authentication
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response object with success/error data
 */
const login = async (email, password) => {
    try {
        const response = await fetch(LOGIN_PATH, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || data.error || "Login failed"
            };
        }

        return {
            success: true,
            data: {
                ...data.data,
                token: data.data.access_token || data.data.token, // Normalize token field
                user: data.data.user || { email: email } // Add user info if not present
            }
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error - Could not connect to server"
        };
    }
};

/**
 * Logout function for server authentication
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response object
 */
const logout = async (token) => {
    try {
        const response = await fetch(LOGOUT_PATH, {
            method: "POST",
            headers: {
                ...config.headers,
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || data.error || "Logout failed"
            };
        }

        return {
            success: true,
            data: data
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error - Could not connect to server"
        };
    }
};

/**
 * Validate authentication token with server
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response object with user data or error
 */
const validateToken = async (token) => {
    try {
        const response = await fetch(VALIDATE_TOKEN_PATH, {
            method: "POST",
            headers: {
                ...config.headers,
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || data.error || "Token validation failed"
            };
        }

        return {
            success: true,
            data: data
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

export { login, register, logout, validateToken, updateConfig };