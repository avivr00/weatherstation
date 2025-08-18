// OpenWeatherMap API integration
// Get your free API key from: https://openweathermap.org/api

const config = {
    baseURL: "https://api.openweathermap.org/data/2.5",
    // Add your OpenWeatherMap API key here
    // You can get a free API key from: https://openweathermap.org/api
    apiKey: "YOUR_API_KEY_HERE", // Replace with your actual API key
    headers: {
        "Content-Type": "application/json"
    }
};

/**
 * Update the API key (useful for configuration)
 * @param {string} apiKey - Your OpenWeatherMap API key
 */
function setApiKey(apiKey) {
    config.apiKey = apiKey;
}

/**
 * Get stored API key from localStorage or return default
 * @returns {string} API key
 */
function getApiKey() {
    const storedKey = localStorage.getItem('openweather_api_key');
    return storedKey || config.apiKey;
}

/**
 * Store API key in localStorage
 * @param {string} apiKey - API key to store
 */
function storeApiKey(apiKey) {
    localStorage.setItem('openweather_api_key', apiKey);
    config.apiKey = apiKey;
}

/**
 * Fetch current weather by city name
 * @param {string} city - City name
 * @param {string} units - Temperature units (metric, imperial, kelvin)
 * @param {string} lang - Language code
 * @returns {Promise<Object>} Response object with weather data
 */
const getCurrentWeatherByCity = async (city, units = "metric", lang = "en") => {
    try {
        const apiKey = getApiKey();
        
        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
            return {
                success: false,
                message: "OpenWeatherMap API key not configured. Please add your API key to use weather features."
            };
        }

        const url = `${config.baseURL}/weather?q=${encodeURIComponent(city)}&units=${units}&lang=${lang}&appid=${apiKey}`;
        const response = await fetch(url, { headers: config.headers });

        if (!response.ok) {
            let errorMessage = "Failed to fetch weather data";
            
            if (response.status === 401) {
                errorMessage = "Invalid API key. Please check your OpenWeatherMap API key.";
            } else if (response.status === 404) {
                errorMessage = `City "${city}" not found. Please check the spelling and try again.`;
            } else if (response.status === 429) {
                errorMessage = "API rate limit exceeded. Please try again later.";
            } else {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching weather data"
        };
    }
};

/**
 * Fetch current weather by geographic coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units (metric, imperial, kelvin)
 * @param {string} lang - Language code
 * @returns {Promise<Object>} Response object with weather data
 */
const getCurrentWeatherByCoords = async (lat, lon, units = "metric", lang = "en") => {
    try {
        const apiKey = getApiKey();
        
        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
            return {
                success: false,
                message: "OpenWeatherMap API key not configured. Please add your API key to use weather features."
            };
        }

        const url = `${config.baseURL}/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${apiKey}`;
        const response = await fetch(url, { headers: config.headers });

        if (!response.ok) {
            let errorMessage = "Failed to fetch weather data";
            
            if (response.status === 401) {
                errorMessage = "Invalid API key. Please check your OpenWeatherMap API key.";
            } else if (response.status === 429) {
                errorMessage = "API rate limit exceeded. Please try again later.";
            } else {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching weather data"
        };
    }
};

/**
 * Fetch 5-day weather forecast by city name
 * @param {string} city - City name
 * @param {string} units - Temperature units (metric, imperial, kelvin)
 * @param {string} lang - Language code
 * @returns {Promise<Object>} Response object with forecast data
 */
const getForecastByCity = async (city, units = "metric", lang = "en") => {
    try {
        const apiKey = getApiKey();
        
        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
            return {
                success: false,
                message: "OpenWeatherMap API key not configured. Please add your API key to use weather features."
            };
        }

        const url = `${config.baseURL}/forecast?q=${encodeURIComponent(city)}&units=${units}&lang=${lang}&appid=${apiKey}`;
        const response = await fetch(url, { headers: config.headers });

        if (!response.ok) {
            let errorMessage = "Failed to fetch forecast data";
            
            if (response.status === 401) {
                errorMessage = "Invalid API key. Please check your OpenWeatherMap API key.";
            } else if (response.status === 404) {
                errorMessage = `City "${city}" not found. Please check the spelling and try again.`;
            } else if (response.status === 429) {
                errorMessage = "API rate limit exceeded. Please try again later.";
            } else {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching forecast data"
        };
    }
};

/**
 * Fetch 5-day weather forecast by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units (metric, imperial, kelvin)
 * @param {string} lang - Language code
 * @returns {Promise<Object>} Response object with forecast data
 */
const getForecastByCoords = async (lat, lon, units = "metric", lang = "en") => {
    try {
        const apiKey = getApiKey();
        
        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
            return {
                success: false,
                message: "OpenWeatherMap API key not configured. Please add your API key to use weather features."
            };
        }

        const url = `${config.baseURL}/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${apiKey}`;
        const response = await fetch(url, { headers: config.headers });

        if (!response.ok) {
            let errorMessage = "Failed to fetch forecast data";
            
            if (response.status === 401) {
                errorMessage = "Invalid API key. Please check your OpenWeatherMap API key.";
            } else if (response.status === 429) {
                errorMessage = "API rate limit exceeded. Please try again later.";
            } else {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching forecast data"
        };
    }
};

/**
 * Get weather icon URL from OpenWeatherMap
 * @param {string} iconCode - Icon code from weather data
 * @param {string} size - Icon size ('2x' for larger icons)
 * @returns {string} Icon URL
 */
function getWeatherIconUrl(iconCode, size = '') {
    const sizePrefix = size ? `@${size}` : '';
    return `https://openweathermap.org/img/wn/${iconCode}${sizePrefix}.png`;
}

/**
 * Check if API key is configured
 * @returns {boolean} True if API key is configured
 */
function isApiKeyConfigured() {
    const apiKey = getApiKey();
    return apiKey && apiKey !== "YOUR_API_KEY_HERE";
}

export { 
    getCurrentWeatherByCity, 
    getCurrentWeatherByCoords, 
    getForecastByCity, 
    getForecastByCoords,
    getWeatherIconUrl,
    setApiKey,
    storeApiKey,
    isApiKeyConfigured
};