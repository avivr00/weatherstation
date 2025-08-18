# Weather API Setup

This application uses the OpenWeatherMap API to provide real weather data and forecasts.

## Getting Started

### 1. Get a Free API Key
1. Go to [OpenWeatherMap API](https://openweathermap.org/api)
2. Click "Sign Up" and create a free account
3. After registration, go to your API keys section
4. Copy your API key

### 2. Configure the API Key

**Option A: Through the Application**
1. Open the application in your browser
2. When you see "OpenWeatherMap API key not configured"
3. Click "Click here to add your API key"
4. Paste your API key in the prompt
5. The key will be stored in your browser's localStorage

**Option B: Direct Configuration**
1. Open `API/weatherAPI.js`
2. Replace `"YOUR_API_KEY_HERE"` with your actual API key
3. Save the file

### 3. Features

The weather integration provides:
- **Current Weather**: Real-time weather data for any city
- **Geolocation**: Automatic weather for your current location
- **5-Day Forecast**: Daily weather forecasts
- **Real Icons**: Weather condition icons from OpenWeatherMap
- **Detailed Data**: Temperature, humidity, wind speed, pressure

### 4. Usage

- **Current Location**: Click the location button (📍) to get weather for your current location
- **Search by City**: Type any city name and click search (🔍)
- **Automatic Updates**: Weather data refreshes when you change locations

### 5. API Limits

The free OpenWeatherMap plan includes:
- 1,000 API calls per day
- Current weather data
- 5-day weather forecasts
- Weather maps

### 6. Troubleshooting

**"Invalid API key" Error**:
- Make sure you copied the API key correctly
- New API keys may take up to 10 minutes to activate

**"City not found" Error**:
- Check the spelling of the city name
- Try using the format "City, Country Code" (e.g., "London, GB")

**Rate limit exceeded**:
- You've made too many requests today
- Wait until tomorrow or upgrade to a paid plan

### 7. Privacy

Your API key is stored locally in your browser and is not sent to our servers.