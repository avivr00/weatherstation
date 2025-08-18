import { 
    getUserByEmail, 
    addUser, 
    initializeMockData, 
    getMockUsers, 
    saveMockUsers 
} from './mockData.js';

// Initialize mock data when the module is loaded
initializeMockData();

/**
 * Mock register function using local mock data
 * @param {string} first_name - User's first name
 * @param {string} last_name - User's last name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response object with success/error data
 */
const register = async (first_name, last_name, email, password) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const users = getMockUsers();
                
                // Check if user already exists
                const existingUser = users.find(user => user.email === email);
                if (existingUser) {
                    resolve({
                        success: false,
                        message: "User with this email already exists"
                    });
                    return;
                }

                // Create new user
                const newUser = {
                    id: users.length + 1,
                    first_name,
                    last_name,
                    email,
                    password
                };

                users.push(newUser);
                saveMockUsers(users);

                // Return user data without password
                const { password: _, ...userData } = newUser;
                resolve({
                    success: true,
                    data: {
                        ...userData,
                        token: `mock_token_${newUser.id}_${Date.now()}`
                    }
                });
            } catch (err) {
                resolve({
                    success: false,
                    message: err.message || "Registration failed"
                });
            }
        }, 500); // Simulate network delay
    });
};

/**
 * Mock login function using local mock data
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response object with success/error data
 */
const login = async (email, password) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const users = getMockUsers();
                const user = users.find(u => u.email === email);

                if (!user) {
                    resolve({
                        success: false,
                        message: "User not found"
                    });
                    return;
                }

                if (user.password !== password) {
                    resolve({
                        success: false,
                        message: "Invalid password"
                    });
                    return;
                }

                // Return user data without password
                const { password: _, ...userData } = user;
                resolve({
                    success: true,
                    data: {
                        ...userData,
                        token: `mock_token_${user.id}_${Date.now()}`
                    }
                });
            } catch (err) {
                resolve({
                    success: false,
                    message: err.message || "Login failed"
                });
            }
        }, 500); // Simulate network delay
    });
};

/**
 * Mock logout function (for completeness)
 * @returns {Promise<Object>} Response object
 */
const logout = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: "Logged out successfully"
            });
        }, 200);
    });
};

/**
 * Mock function to validate token
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response object with user data or error
 */
const validateToken = async (token) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                if (!token || !token.startsWith('mock_token_')) {
                    resolve({
                        success: false,
                        message: "Invalid token"
                    });
                    return;
                }

                // Extract user ID from mock token
                const tokenParts = token.split('_');
                if (tokenParts.length < 3) {
                    resolve({
                        success: false,
                        message: "Invalid token format"
                    });
                    return;
                }

                const userId = parseInt(tokenParts[2]);
                const users = getMockUsers();
                const user = users.find(u => u.id === userId);

                if (!user) {
                    resolve({
                        success: false,
                        message: "User not found"
                    });
                    return;
                }

                // Return user data without password
                const { password: _, ...userData } = user;
                resolve({
                    success: true,
                    data: userData
                });
            } catch (err) {
                resolve({
                    success: false,
                    message: err.message || "Token validation failed"
                });
            }
        }, 300);
    });
};

export { login, register, logout, validateToken };