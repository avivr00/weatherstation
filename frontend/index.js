// Generate 14-day forecast array with demo data (date, day, icon, high/low)
function generate14DayForecast() {
    const icons = ["☀️", "🌤️", "🌦️", "🌧️"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const forecast = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
        let d = new Date(today);
        d.setDate(d.getDate() + i);
        forecast.push({
            dateObj: d,
            dateStr: d.toLocaleDateString('en-GB'), // dd/mm/yyyy
            day: dayNames[d.getDay()],
            icon: icons[Math.floor(Math.random() * icons.length)],
            high: Math.floor(30 + Math.random() * 8),
            low: Math.floor(18 + Math.random() * 8)
        });
    }
    return forecast;
}

// This will be the single source of truth for both 14-day and 10-day
const fourteenDayForecast = generate14DayForecast();
let weekStartIndex = 0; // Start of the 7-day slider

// Mock hourly data for demo display
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

/*
=========================================
 Example: Fetch weather data from Backend API (not active yet)
 When Aviv's backend is ready, you can use this function to get real weather data.

 Usage example (async):
 const backendData = await getWeatherDataFromBackend();
 renderHourlyWidget(backendData.hourly);
 renderWeeklyForecast14(backendData.forecast14, 0);
 renderTenDayForecast(getTenDayFromFourteen(backendData.forecast14));
 // etc.

 You need to update the API URL and the data field names according to the backend response.
=========================================
*/
// async function getWeatherDataFromBackend() {
//     const apiUrl = "http://localhost:3000/api/weather";
//     try {
//         const response = await fetch(apiUrl);
//         if (!response.ok) throw new Error("Network response was not ok");
//         const data = await response.json();
//         // Make sure the backend returns all fields: forecast14, hourly, uv, sunset, etc.
//         return data;
//     } catch (error) {
//         console.error("Failed to fetch weather data from backend:", error);
//         // As a fallback, return mock data
//         return {
//             forecast14: fourteenDayForecast,
//             hourly: weatherData.hours,
//             uv: 4,
//             sunset: "7:35 PM"
//         };
//     }
// }

// Utility: Get the first 10 days out of the 14-day array (for 10 Day Forecast)
function getTenDayFromFourteen(arr) {
    return arr.slice(0, 10);
}

// Renders the hourly forecast (remains the same)
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

// Render 14-day scrollable forecast (7 days at a time)
function renderWeeklyForecast14(days, startIdx = 0) {
    const container = document.getElementById("weeklyForecast");
    container.innerHTML = "";
    for (let i = 0; i < 7; i++) {
        const idx = startIdx + i;
        if (idx >= days.length) break;
        const item = days[idx];
        container.appendChild(createWeeklyDayCard(item));
    }
}

// Helper: Build a single weekly day card
function createWeeklyDayCard(item) {
    const card = document.createElement("div");
    card.className = "weekly-card";
    card.innerHTML = `
        <div class="weekly-day">${item.day}</div>
        <div class="weekly-date">${item.dateStr}</div>
        <div class="weekly-icon">${item.icon}</div>
        <div>
            <span class="weekly-temp-low">${item.low}°</span>
            <span class="weekly-temp-high">${item.high}°</span>
        </div>
    `;
    return card;
}

// Render 10 Day Forecast from the first 10 days of the 14-day array
function renderTenDayForecast(days) {
    const container = document.getElementById("tenDayForecast");
    container.innerHTML = `<div class="ten-day-table"></div>`;
    const table = container.firstElementChild;
    days.forEach((day, idx) => {
        const row = document.createElement("div");
        row.className = "ten-day-row";
        let label = idx === 0 ? "Today" : day.day;
        row.innerHTML = `
            <span class="day-label">${label}</span>
            <span class="day-date">${day.dateStr}</span>
            <span class="day-icon">${day.icon}</span>
            <span class="day-min">${day.low}°</span>
            <span class="day-range">
                <span class="day-range-bar min" style="width:38%;"></span>
                <span class="day-range-bar max" style="width:55%; left:40%;"></span>
            </span>
            <span class="day-max">${day.high}°</span>
        `;
        table.appendChild(row);
    });
}


// DOMContentLoaded: Render all widgets and set up navigation
document.addEventListener("DOMContentLoaded", () => {
    renderHourlyWidget(weatherData.hours);

    // Weekly forecast (sliding 14-day, 7 at a time)
    renderWeeklyForecast14(fourteenDayForecast, weekStartIndex);

    // Ten day forecast always synced to the first 10 of the 14-day
    renderTenDayForecast(getTenDayFromFourteen(fourteenDayForecast));

    // Set UV index and sunset (demo values)
    document.getElementById("uvNum").textContent = 4;
    document.getElementById("uvText").textContent = "Moderate";
    document.getElementById("uvColor").style.width = "40%";
    document.getElementById("sunsetTime").textContent = "7:35 PM";

    // Navigation for weekly forecast
    document.getElementById("prevDayBtn").onclick = () => {
        if (weekStartIndex > 0) {
            weekStartIndex--;
            renderWeeklyForecast14(fourteenDayForecast, weekStartIndex);
        }
    };
    document.getElementById("nextDayBtn").onclick = () => {
        if (weekStartIndex < fourteenDayForecast.length - 7) {
            weekStartIndex++;
            renderWeeklyForecast14(fourteenDayForecast, weekStartIndex);
        }
    };
});
