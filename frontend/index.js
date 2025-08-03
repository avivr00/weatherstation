// Example JSON weather data
const weather_data = {
  "1722645600": { "temperature": 28.1, "humidity": 70, "precipitation": 0.0 },
  "1722649200": { "temperature": 27.6, "humidity": 72, "precipitation": 0.0 },
  "1722652800": { "temperature": 27.3, "humidity": 73, "precipitation": 0.1 }
  // Add more hours as needed...
};

// Function to render the table rows
function renderWeatherTable(data) {
  // Sort entries by timestamp (ascending)
  const sorted = Object.entries(data).sort(([a], [b]) => Number(a) - Number(b));
  const tbody = document.querySelector('#weather-table tbody');
  tbody.innerHTML = ""; // Clear existing rows

  for (const [timestamp, weather] of sorted) {
    // Convert timestamp to readable date/hour
    const dateStr = new Date(Number(timestamp) * 1000)
      .toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' });

    const row = `<tr>
      <td>${timestamp}</td>
      <td>${dateStr}</td>
      <td>${weather.temperature}</td>
      <td>${weather.humidity}</td>
      <td>${weather.precipitation}</td>
    </tr>`;
    tbody.insertAdjacentHTML('beforeend', row);
  }
}

// URL of your backend API
const API_URL = "http://localhost:8000/weather/hourly"; // Change as needed

// Fetch data from the backend and render the table
function fetchWeatherData() {
  fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    })
    .then(data => {
      renderWeatherTable(data);
    })
    .catch(error => {
      const tbody = document.querySelector('#weather-table tbody');
      tbody.innerHTML = `<tr><td colspan="5">Error loading data: ${error}</td></tr>`;
      console.error(error);
    });
}

// Function to render the table rows
function renderWeatherTable(data) {
  // If your API returns an array, convert it to the format you want here
  // Assuming data is a dict: { timestamp: {temperature, humidity, precipitation}, ... }
  const sorted = Object.entries(data).sort(([a], [b]) => Number(a) - Number(b));
  const tbody = document.querySelector('#weather-table tbody');
  tbody.innerHTML = ""; // Clear existing rows

  for (const [timestamp, weather] of sorted) {
    const dateStr = new Date(Number(timestamp) * 1000)
      .toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' });

    const row = `<tr>
      <td>${timestamp}</td>
      <td>${dateStr}</td>
      <td>${weather.temperature}</td>
      <td>${weather.humidity}</td>
      <td>${weather.precipitation}</td>
    </tr>`;
    tbody.insertAdjacentHTML('beforeend', row);
  }
}

// When the page loads, fetch the weather data from backend API
document.addEventListener("DOMContentLoaded", () => {
  fetchWeatherData();
});

