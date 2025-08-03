// Mock hourly data
const weatherData = {
  hours: [
      { hour: "09:00", temperature: 28, icon: "☀️", wind_avg: 13, precipitation: 0.0, humidity: 61 },
      { hour: "10:00", temperature: 29, icon: "☀️", wind_avg: 12, precipitation: 0.0, humidity: 60 },
      { hour: "11:00", temperature: 30, icon: "🌤️", wind_avg: 15, precipitation: 0.0, humidity: 59 },
      { hour: "12:00", temperature: 31, icon: "🌤️", wind_avg: 16, precipitation: 0.0, humidity: 58 },
      { hour: "13:00", temperature: 32, icon: "🌤️", wind_avg: 17, precipitation: 0.0, humidity: 56 },
      { hour: "14:00", temperature: 32, icon: "☀️", wind_avg: 17, precipitation: 0.1, humidity: 55 },
      { hour: "15:00", temperature: 32, icon: "☀️", wind_avg: 14, precipitation: 0.1, humidity: 55 },
      { hour: "16:00", temperature: 31, icon: "☀️", wind_avg: 13, precipitation: 0.2, humidity: 58 },
      { hour: "17:00", temperature: 31, icon: "🌥️", wind_avg: 11, precipitation: 0.2, humidity: 60 },
      { hour: "18:00", temperature: 30, icon: "🌥️", wind_avg: 10, precipitation: 0.3, humidity: 62 }
  ]
};

// Weekly forecast data
const weeklyData = [
  { day: "Sun", icon: "☀️", high: 34, low: 22 },
  { day: "Mon", icon: "☀️", high: 33, low: 21 },
  { day: "Tue", icon: "🌤️", high: 32, low: 19 },
  { day: "Wed", icon: "🌤️", high: 32, low: 19 },
  { day: "Thu", icon: "🌦️", high: 33, low: 20 },
  { day: "Fri", icon: "🌦️", high: 36, low: 21 },
  { day: "Sat", icon: "☀️", high: 36, low: 24 }
];

// For circular weekly forecast
let firstDayIndex = 0;

// Mock 10-day forecast
const tenDayForecast = [
  { day: "Today", icon: "☀️", min: 21, max: 32 },
  { day: "Mon", icon: "☀️", min: 19, max: 32 },
  { day: "Tue", icon: "☀️", min: 18, max: 32 },
  { day: "Wed", icon: "☀️", min: 18, max: 33 },
  { day: "Thu", icon: "☀️", min: 19, max: 33 },
  { day: "Fri", icon: "☀️", min: 20, max: 36 },
  { day: "Sat", icon: "☀️", min: 24, max: 36 },
  { day: "Sun", icon: "☀️", min: 22, max: 35 },
  { day: "Mon", icon: "☀️", min: 22, max: 35 },
  { day: "Tue", icon: "☀️", min: 21, max: 36 }
];

/** Render hourly forecast horizontally */
function renderHourlyWidget(hours) {
  const container = document.getElementById("hourlyWidgetScroll");
  container.innerHTML = "";
  hours.forEach(item => {
      const card = document.createElement("div");
      card.className = "hour-widget-card";
      card.innerHTML = `
          <div class="hour-widget-icon">${item.icon}</div>
          <div class="hour-widget-hour">${item.hour}</div>
          <div class="hour-widget-temp">${item.temperature}°</div>
          <div class="hour-widget-meta">
              💨 ${item.wind_avg} km/h<br>
              💧 ${item.precipitation} mm<br>
              🌫️ ${item.humidity}%
          </div>
      `;
      container.appendChild(card);
  });
}

/** Render weekly forecast horizontally with circular navigation */
function renderWeeklyForecast(days, startIdx = 0) {
  const container = document.getElementById("weeklyForecast");
  container.innerHTML = "";
  for(let i = 0; i < 7; i++) {
      const idx = (startIdx + i) % 7;
      const item = days[idx];
      const card = document.createElement("div");
      card.className = "weekly-card";
      card.innerHTML = `
          <div class="weekly-day">${item.day}</div>
          <div class="weekly-icon">${item.icon}</div>
          <div>
              <span class="weekly-temp-low">${item.low}°</span>
              <span class="weekly-temp-high">${item.high}°</span>
          </div>
      `;
      container.appendChild(card);
  }
}

/** Render 10-day forecast table */
function renderTenDayForecast(days) {
  const container = document.getElementById("tenDayForecast");
  container.innerHTML = `<div class="ten-day-table"></div>`;
  const table = container.firstElementChild;
  days.forEach(day => {
      const row = document.createElement("div");
      row.className = "ten-day-row";
      row.innerHTML = `
          <span class="day-label">${day.day}</span>
          <span class="day-icon">${day.icon}</span>
          <span class="day-min">${day.min}°</span>
          <span class="day-range">
              <span class="day-range-bar min" style="width:38%;"></span>
              <span class="day-range-bar max" style="width:55%; left:40%;"></span>
          </span>
          <span class="day-max">${day.max}°</span>
      `;
      table.appendChild(row);
  });
}

// Render everything on page load & set weekly forecast arrows
document.addEventListener("DOMContentLoaded", () => {
  fetchWeatherData();
});

