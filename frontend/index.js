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

// Load table when page is loaded
document.addEventListener("DOMContentLoaded", () => {
  renderWeatherTable(weather_data);
});
