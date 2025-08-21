// Open-Meteo Weather API integration
// Free weather API with no API key required
// Documentation: https://open-meteo.com/en/docs

const config = {
    weatherBaseURL: "https://api.open-meteo.com/v1",
    geocodingBaseURL: "https://geocoding-api.open-meteo.com/v1",
    fetchOptions: {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'omit',
        headers: {
            'Accept': 'application/json'
        }
    }
};

/**
 * WMO Weather Code to description and icon mapping
 * Based on WMO Weather interpretation codes (WW)
 */
const weatherCodeMap = {
    0: { description: "Clear sky", icon: "clear-day", iconNight: "clear-night" },
    1: { description: "Mainly clear", icon: "clear-day", iconNight: "clear-night" },
    2: { description: "Partly cloudy", icon: "partly-cloudy-day", iconNight: "partly-cloudy-night" },
    3: { description: "Overcast", icon: "cloudy", iconNight: "cloudy" },
    45: { description: "Fog", icon: "fog", iconNight: "fog" },
    48: { description: "Depositing rime fog", icon: "fog", iconNight: "fog" },
    51: { description: "Drizzle: Light intensity", icon: "drizzle", iconNight: "drizzle" },
    53: { description: "Drizzle: Moderate intensity", icon: "drizzle", iconNight: "drizzle" },
    55: { description: "Drizzle: Dense intensity", icon: "drizzle", iconNight: "drizzle" },
    56: { description: "Freezing drizzle: Light intensity", icon: "sleet", iconNight: "sleet" },
    57: { description: "Freezing drizzle: Dense intensity", icon: "sleet", iconNight: "sleet" },
    61: { description: "Rain: Slight intensity", icon: "rain", iconNight: "rain" },
    63: { description: "Rain: Moderate intensity", icon: "rain", iconNight: "rain" },
    65: { description: "Rain: Heavy intensity", icon: "rain", iconNight: "rain" },
    66: { description: "Freezing rain: Light intensity", icon: "sleet", iconNight: "sleet" },
    67: { description: "Freezing rain: Heavy intensity", icon: "sleet", iconNight: "sleet" },
    71: { description: "Snow fall: Slight intensity", icon: "snow", iconNight: "snow" },
    73: { description: "Snow fall: Moderate intensity", icon: "snow", iconNight: "snow" },
    75: { description: "Snow fall: Heavy intensity", icon: "snow", iconNight: "snow" },
    77: { description: "Snow grains", icon: "snow", iconNight: "snow" },
    80: { description: "Rain showers: Slight", icon: "rain", iconNight: "rain" },
    81: { description: "Rain showers: Moderate", icon: "rain", iconNight: "rain" },
    82: { description: "Rain showers: Violent", icon: "rain", iconNight: "rain" },
    85: { description: "Snow showers: Slight", icon: "snow", iconNight: "snow" },
    86: { description: "Snow showers: Heavy", icon: "snow", iconNight: "snow" },
    95: { description: "Thunderstorm: Slight or moderate", icon: "thunderstorm", iconNight: "thunderstorm" },
    96: { description: "Thunderstorm with slight hail", icon: "thunderstorm", iconNight: "thunderstorm" },
    99: { description: "Thunderstorm with heavy hail", icon: "thunderstorm", iconNight: "thunderstorm" }
};

/**
 * Get weather description and icon from WMO weather code
 * @param {number} code - WMO weather code
 * @param {boolean} isDay - Whether it's daytime
 * @returns {Object} Weather info with description and icon
 */
function getWeatherInfo(code, isDay = true) {
    const weather = weatherCodeMap[code] || weatherCodeMap[0];
    return {
        description: weather.description,
        icon: isDay ? weather.icon : (weather.iconNight || weather.icon)
    };
}

/**
 * Search for locations using Open-Meteo Geocoding API
 * @param {string} query - Search query (city name, postal code, etc.)
 * @param {number} count - Number of results to return (max 100)
 * @param {string} language - Language code (e.g., 'en', 'de', 'fr')
 * @returns {Promise<Object>} Response object with location results
 */
const searchLocations = async (query, count = 10, language = "en") => {
    try {
        if (!query || query.trim().length < 2) {
            return {
                success: false,
                message: "Search query must be at least 2 characters long"
            };
        }

        const url = `${config.geocodingBaseURL}/search?name=${encodeURIComponent(query)}&count=${count}&language=${language}&format=json`;
        
        const response = await fetch(url, config.fetchOptions);

        if (!response.ok) {
            return {
                success: false,
                message: `Search failed: HTTP ${response.status}`
            };
        }

        const data = await response.json();
        
        if (data.error) {
            return {
                success: false,
                message: data.reason || "Search failed"
            };
        }

        return {
            success: true,
            data: data.results || []
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error during location search"
        };
    }
};

/**
 * Get current weather by coordinates using Open-Meteo
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} temperatureUnit - Temperature unit ('celsius' or 'fahrenheit')
 * @param {string} windSpeedUnit - Wind speed unit ('kmh', 'ms', 'mph', 'kn')
 * @returns {Promise<Object>} Response object with current weather data
 */
const getCurrentWeatherByCoords = async (latitude, longitude, temperatureUnit = "celsius", windSpeedUnit = "kmh") => {
    try {
        const currentParams = [
            "temperature_2m",
            "relative_humidity_2m", 
            "apparent_temperature",
            "is_day",
            "precipitation",
            "rain",
            "showers", 
            "snowfall",
            "weather_code",
            "cloud_cover",
            "pressure_msl",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m"
        ].join(",");

        const url = `${config.weatherBaseURL}/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentParams}&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}&timezone=auto`;
        
        const response = await fetch(url, config.fetchOptions);

        if (!response.ok) {
            return {
                success: false,
                message: `Weather API failed: HTTP ${response.status}`
            };
        }

        const data = await response.json();
        
        if (data.error) {
            return {
                success: false,
                message: data.reason || "Weather data fetch failed"
            };
        }

        // Transform Open-Meteo data to match expected structure
        const current = data.current;
        const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);
        
        const transformedData = {
            coord: { lat: data.latitude, lon: data.longitude },
            weather: [{
                id: current.weather_code,
                main: weatherInfo.description.split(':')[0],
                description: weatherInfo.description,
                icon: weatherInfo.icon
            }],
            main: {
                temp: current.temperature_2m,
                feels_like: current.apparent_temperature,
                humidity: current.relative_humidity_2m,
                pressure: current.pressure_msl
            },
            wind: {
                speed: current.wind_speed_10m,
                deg: current.wind_direction_10m,
                gust: current.wind_gusts_10m
            },
            clouds: {
                all: current.cloud_cover
            },
            rain: current.rain ? { "1h": current.rain } : undefined,
            snow: current.snowfall ? { "1h": current.snowfall } : undefined,
            dt: Math.floor(Date.now() / 1000),
            sys: {
                country: data.timezone?.split('/')[0] || '',
                sunrise: null, // Would need daily data for this
                sunset: null
            },
            timezone: data.utc_offset_seconds,
            name: "Current Location"
        };

        return {
            success: true,
            data: transformedData
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching current weather"
        };
    }
};

/**
 * Get current weather by city name
 * @param {string} city - City name
 * @param {string} temperatureUnit - Temperature unit ('celsius' or 'fahrenheit') 
 * @param {string} windSpeedUnit - Wind speed unit ('kmh', 'ms', 'mph', 'kn')
 * @returns {Promise<Object>} Response object with current weather data
 */
const getCurrentWeatherByCity = async (city, temperatureUnit = "celsius", windSpeedUnit = "kmh") => {
    try {
        // First, search for the city to get coordinates
        const locationSearch = await searchLocations(city, 1);
        
        if (!locationSearch.success) {
            return {
                success: false,
                message: locationSearch.message
            };
        }

        if (!locationSearch.data || locationSearch.data.length === 0) {
            return {
                success: false,
                message: `City "${city}" not found. Please check the spelling and try again.`
            };
        }

        const location = locationSearch.data[0];
        const weatherResult = await getCurrentWeatherByCoords(location.latitude, location.longitude, temperatureUnit, windSpeedUnit);
        
        if (weatherResult.success) {
            // Update the name with the actual city name
            weatherResult.data.name = location.name;
            if (location.country) {
                weatherResult.data.sys.country = location.country_code || '';
            }
        }

        return weatherResult;
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching weather data"
        };
    }
};

/**
 * Get 7-day weather forecast by coordinates
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} temperatureUnit - Temperature unit ('celsius' or 'fahrenheit')
 * @param {string} windSpeedUnit - Wind speed unit ('kmh', 'ms', 'mph', 'kn')
 * @returns {Promise<Object>} Response object with forecast data
 */
const getForecastByCoords = async (latitude, longitude, temperatureUnit = "celsius", windSpeedUnit = "kmh") => {
    try {
        const dailyParams = [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min", 
            "apparent_temperature_max",
            "apparent_temperature_min",
            "precipitation_sum",
            "rain_sum",
            "showers_sum",
            "snowfall_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "wind_gusts_10m_max",
            "wind_direction_10m_dominant",
            "sunrise",
            "sunset"
        ].join(",");

        const url = `${config.weatherBaseURL}/forecast?latitude=${latitude}&longitude=${longitude}&daily=${dailyParams}&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}&timezone=auto&forecast_days=14`;
        
        const response = await fetch(url, config.fetchOptions);

        if (!response.ok) {
            return {
                success: false,
                message: `Forecast API failed: HTTP ${response.status}`
            };
        }

        const data = await response.json();
        
        if (data.error) {
            return {
                success: false,
                message: data.reason || "Forecast data fetch failed"
            };
        }

        // Transform to OpenWeatherMap-like structure
        const daily = data.daily;
        const list = daily.time.map((date, index) => {
            const weatherInfo = getWeatherInfo(daily.weather_code[index], true);
            
            return {
                dt: Math.floor(new Date(date).getTime() / 1000),
                main: {
                    temp_max: daily.temperature_2m_max[index],
                    temp_min: daily.temperature_2m_min[index],
                    feels_like_day: daily.apparent_temperature_max[index],
                    feels_like_night: daily.apparent_temperature_min[index],
                    humidity: null // Not available in daily data
                },
                weather: [{
                    id: daily.weather_code[index],
                    main: weatherInfo.description.split(':')[0],
                    description: weatherInfo.description,
                    icon: weatherInfo.icon
                }],
                wind: {
                    speed: daily.wind_speed_10m_max[index],
                    deg: daily.wind_direction_10m_dominant[index],
                    gust: daily.wind_gusts_10m_max[index]
                },
                rain: daily.rain_sum[index] ? { "1h": daily.rain_sum[index] } : undefined,
                snow: daily.snowfall_sum[index] ? { "1h": daily.snowfall_sum[index] } : undefined,
                pop: daily.precipitation_probability_max[index] / 100, // Convert percentage to decimal
                sunrise: Math.floor(new Date(daily.sunrise[index]).getTime() / 1000),
                sunset: Math.floor(new Date(daily.sunset[index]).getTime() / 1000)
            };
        });

        const transformedData = {
            cod: "200",
            message: 0,
            cnt: list.length,
            list: list,
            city: {
                id: 0,
                name: "Location",
                coord: { lat: data.latitude, lon: data.longitude },
                country: data.timezone?.split('/')[0] || '',
                timezone: data.utc_offset_seconds,
                sunrise: list[0]?.sunrise,
                sunset: list[0]?.sunset
            }
        };

        return {
            success: true,
            data: transformedData
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching forecast data"
        };
    }
};

/**
 * Get 7-day weather forecast by city name
 * @param {string} city - City name
 * @param {string} temperatureUnit - Temperature unit ('celsius' or 'fahrenheit')
 * @param {string} windSpeedUnit - Wind speed unit ('kmh', 'ms', 'mph', 'kn')
 * @returns {Promise<Object>} Response object with forecast data
 */
const getForecastByCity = async (city, temperatureUnit = "celsius", windSpeedUnit = "kmh") => {
    try {
        // First, search for the city to get coordinates
        const locationSearch = await searchLocations(city, 1);
        
        if (!locationSearch.success) {
            return {
                success: false,
                message: locationSearch.message
            };
        }

        if (!locationSearch.data || locationSearch.data.length === 0) {
            return {
                success: false,
                message: `City "${city}" not found. Please check the spelling and try again.`
            };
        }

        const location = locationSearch.data[0];
        const forecastResult = await getForecastByCoords(location.latitude, location.longitude, temperatureUnit, windSpeedUnit);
        
        if (forecastResult.success) {
            // Update city information
            forecastResult.data.city.name = location.name;
            forecastResult.data.city.country = location.country_code || '';
        }

        return forecastResult;
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching forecast data"
        };
    }
};

/**
 * Get weather icon URL - using a simple icon mapping
 * For a complete icon system, you might want to use a weather icon library
 * @param {string} iconCode - Icon code from weather data
 * @param {string} size - Icon size (ignored for compatibility)
 * @returns {string} Icon identifier or simple emoji
 */
function getWeatherIconUrl(iconCode, size = '') {
    // Simple emoji fallback - in production you'd want proper weather icons
    const iconMap = {
        'clear-day': '☀️',
        'clear-night': '🌙',
        'partly-cloudy-day': '⛅',
        'partly-cloudy-night': '🌙',
        'cloudy': '☁️',
        'fog': '🌫️',
        'drizzle': '🌦️',
        'rain': '🌧️',
        'sleet': '🌨️',
        'snow': '❄️',
        'thunderstorm': '⛈️'
    };
    
    return iconMap[iconCode] || iconMap['clear-day'];
}

/**
 * Check if API is available (always true for Open-Meteo)
 * @returns {boolean} Always true - no API key required
 */
function isApiKeyConfigured() {
    return true; // Open-Meteo doesn't require an API key
}

/**
 * No-op functions for API key management (Open-Meteo doesn't need them)
 */
/**
 * Get hourly weather forecast by coordinates (up to 7 days)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} temperatureUnit - Temperature unit ('celsius' or 'fahrenheit')
 * @param {string} windSpeedUnit - Wind speed unit ('kmh', 'ms', 'mph', 'kn')
 * @returns {Promise<Object>} Response object with hourly forecast data
 */
const getHourlyForecastByCoords = async (latitude, longitude, temperatureUnit = "celsius", windSpeedUnit = "kmh") => {
    try {
        const hourlyParams = [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation_probability",
            "precipitation",
            "rain",
            "showers",
            "snowfall",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
            "uv_index",
            "is_day"
        ].join(",");

        const url = `${config.weatherBaseURL}/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${hourlyParams}&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}&timezone=auto&forecast_days=14`;
        
        const response = await fetch(url, config.fetchOptions);

        if (!response.ok) {
            return {
                success: false,
                message: `Hourly forecast API failed: HTTP ${response.status}`
            };
        }

        const data = await response.json();
        
        if (data.error) {
            return {
                success: false,
                message: data.reason || "Hourly forecast data fetch failed"
            };
        }

        // Transform to a format that's easy to work with
        const hourly = data.hourly;
        const hourlyList = hourly.time.map((time, index) => {
            const weatherInfo = getWeatherInfo(hourly.weather_code[index], hourly.is_day[index]);
            
            return {
                dt: Math.floor(new Date(time).getTime() / 1000),
                dt_txt: time, // ISO string format
                main: {
                    temp: hourly.temperature_2m[index],
                    feels_like: hourly.apparent_temperature[index],
                    humidity: hourly.relative_humidity_2m[index],
                    pressure: null // Not available in hourly data
                },
                weather: [{
                    id: hourly.weather_code[index],
                    main: weatherInfo.description.split(':')[0],
                    description: weatherInfo.description,
                    icon: weatherInfo.icon
                }],
                wind: {
                    speed: hourly.wind_speed_10m[index],
                    deg: hourly.wind_direction_10m[index],
                    gust: hourly.wind_gusts_10m[index]
                },
                rain: hourly.rain[index] ? { "1h": hourly.rain[index] } : undefined,
                snow: hourly.snowfall[index] ? { "1h": hourly.snowfall[index] } : undefined,
                pop: hourly.precipitation_probability[index] / 100, // Convert percentage to decimal
                clouds: { all: hourly.cloud_cover[index] },
                uv_index: hourly.uv_index[index],
                visibility: null // Not available
            };
        });

        const transformedData = {
            cod: "200",
            message: 0,
            cnt: hourlyList.length,
            list: hourlyList,
            city: {
                id: 0,
                name: "Location",
                coord: { lat: data.latitude, lon: data.longitude },
                country: data.timezone?.split('/')[0] || '',
                timezone: data.utc_offset_seconds
            }
        };

        return {
            success: true,
            data: transformedData
        };
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching hourly forecast data"
        };
    }
};

/**
 * Get hourly weather forecast by city name
 * @param {string} city - City name
 * @param {string} temperatureUnit - Temperature unit ('celsius' or 'fahrenheit')
 * @param {string} windSpeedUnit - Wind speed unit ('kmh', 'ms', 'mph', 'kn')
 * @returns {Promise<Object>} Response object with hourly forecast data
 */
const getHourlyForecastByCity = async (city, temperatureUnit = "celsius", windSpeedUnit = "kmh") => {
    try {
        // First, search for the city to get coordinates
        const locationSearch = await searchLocations(city, 1);
        
        if (!locationSearch.success) {
            return {
                success: false,
                message: locationSearch.message
            };
        }

        if (!locationSearch.data || locationSearch.data.length === 0) {
            return {
                success: false,
                message: `City "${city}" not found. Please check the spelling and try again.`
            };
        }

        const location = locationSearch.data[0];
        const forecastResult = await getHourlyForecastByCoords(location.latitude, location.longitude, temperatureUnit, windSpeedUnit);
        
        if (forecastResult.success) {
            // Update city information
            forecastResult.data.city.name = location.name;
            if (location.country) {
                forecastResult.data.city.country = location.country_code || '';
            }
        }

        return forecastResult;
    } catch (err) {
        return {
            success: false,
            message: err.message || "Network error while fetching hourly forecast data"
        };
    }
};

function setApiKey(apiKey) {
    console.log("Open-Meteo doesn't require an API key");
}

function storeApiKey(apiKey) {
    console.log("Open-Meteo doesn't require an API key");
}

export { 
    getCurrentWeatherByCity, 
    getCurrentWeatherByCoords, 
    getForecastByCity, 
    getForecastByCoords,
    getHourlyForecastByCity,
    getHourlyForecastByCoords,
    getWeatherIconUrl,
    setApiKey,
    storeApiKey,
    isApiKeyConfigured,
    searchLocations
};
