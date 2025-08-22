import {
	getCurrentWeatherByCity,
	getCurrentWeatherByCoords,
	getForecastByCity,
	getForecastByCoords,
	getHourlyForecastByCity,
	getHourlyForecastByCoords,
	getWeatherIconUrl
} from "../API/weatherAPI.js";
import {
	createEvent,
	getUserEvents,
	getEventById,
	updateEvent,
	deleteEvent
} from "../API/eventsAPI.js";
import {
	getUserData,
	isAuthenticated,
	clearUserData,
	saveUserEvents as saveEventsToStorage,
	loadUserEvents,
} from "../utils/storage.js";
import {
	formatDateToString,
	formatDateToReadable,
	getDayNames,
	isSameDay,
	isToday,
	formatMonthYear,
} from "../utils/dateUtils.js";

// Global variables
let currentDate = new Date();
let selectedDate = new Date(); // Set to today initially
let currentUser = null;
let userEvents = [];
let currentLocation = "Kiryat Shmona";
let currentCoordinates = null; // Store coordinates when using current location
let cachedForecastData = null; // Cache forecast data to avoid repeated API calls
let cachedHourlyForecastData = null; // Cache hourly forecast data
let lastForecastUpdate = null; // Track when forecast was last updated

// Initialize the application
document.addEventListener("DOMContentLoaded", async function () {
	checkAuthentication();
	setupEventListeners();
	await loadUserEventsData(); // Wait for events to load
	renderCalendar();
	displayWelcomeMessage();
	loadWeatherData();
	updateSelectedDateDisplay();
});

// Authentication check
function checkAuthentication() {
	if (!isAuthenticated()) {
		window.location.href = "../pages/login/login.html";
		return;
	}

	const authData = getUserData();
	if (authData && authData.user) {
		currentUser = authData.user;
	}
}

// Display welcome message
function displayWelcomeMessage() {
	const welcomeEl = document.getElementById("welcomeUser");
	if (currentUser && currentUser.first_name) {
		welcomeEl.textContent = `Welcome, ${currentUser.first_name}!`;
	}
}

// Setup event listeners
function setupEventListeners() {
	// Calendar navigation
	document
		.getElementById("prevMonth")
		.addEventListener("click", goToPreviousMonth);
	document.getElementById("nextMonth").addEventListener("click", goToNextMonth);

	// Weather
	document
		.getElementById("searchWeatherBtn")
		.addEventListener("click", searchWeatherByCity);
	document
		.getElementById("currentLocationBtn")
		.addEventListener("click", useCurrentLocationWeather);
	document
		.getElementById("locationInput")
		.addEventListener("keypress", function (event) {
			if (event.key === "Enter") searchWeatherByCity();
		});

	// Events
	document
		.getElementById("addEventBtn")
		.addEventListener("click", openAddEventModal);
	document
		.getElementById("saveEventBtn")
		.addEventListener("click", saveNewEvent);

	// Logout
	document.getElementById("logoutBtn").addEventListener("click", logoutUser);
}

// Show error message for events loading failures
function showEventsLoadError(message) {
	const eventsSection = document.getElementById("eventsForDay");
	if (eventsSection) {
		eventsSection.innerHTML = `
			<div class="alert alert-warning" role="alert">
				<i class="bi bi-exclamation-triangle"></i>
				${message}
			</div>
		`;
	}
}

// Load user events from backend API
async function loadUserEventsData() {
	if (!currentUser) return;

	try {
		const response = await getUserEvents();
		
		if (response.success) {
			// Convert backend events to frontend format
			userEvents = response.data.events.map(event => ({
				id: event.id,
				userId: currentUser.email, // For frontend compatibility
				title: event.title,
				description: event.description,
				date: event.date_time.split('T')[0], // Extract date part (YYYY-MM-DD)
				time: event.date_time.split('T')[1]?.substring(0, 5), // Extract time part (HH:MM)
				dateTime: event.date_time, // Keep full datetime for backend calls
				isBackend: true // Mark as backend event
			}));
			
			console.log(`Loaded ${userEvents.length} events from backend`);
		} else {
			console.error("Failed to load events:", response.message);
			// Show error message to user instead of mock data fallback
			showEventsLoadError("Unable to load events from server. Please try refreshing the page.");
			userEvents = [];
			
			// Load any local events created by the user as fallback
			const localEvents = loadUserEvents(currentUser.id);
			userEvents = [...localEvents];
		}
	} catch (error) {
		console.error("Error loading events:", error);
		// Show error message to user instead of mock data fallback
		showEventsLoadError("Network error while loading events. Please check your connection and try again.");
		userEvents = [];
		
		// Load any local events created by the user as fallback
		const localEvents = loadUserEvents(currentUser.id);
		userEvents = [...localEvents];
	}
}

// Save user events
function saveUserEventsData() {
	if (!currentUser) return;

	// Save only locally created events (not mock data events)
	const localEvents = userEvents.filter((event) => event.isLocal);
	saveEventsToStorage(currentUser.id, localEvents);
}

// Calendar rendering
function renderCalendar() {
	console.log("Rendering calendar..."); // Debug log
	const calendar = document.getElementById("calendar");
	if (!calendar) {
		console.error("Calendar element not found");
		return;
	}
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	console.log("Calendar date:", year, month); // Debug log

	// Update month display
	document.getElementById("currentMonth").textContent =
		formatMonthYear(currentDate);

	// Clear calendar
	calendar.innerHTML = "";

	// Add day headers
	const dayHeaders = getDayNames();
	dayHeaders.forEach(function (day) {
		const dayEl = document.createElement("div");
		dayEl.className = "calendar-header";
		dayEl.textContent = day;
		calendar.appendChild(dayEl);
	});

	// Get calendar data
	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const today = new Date();

	// Add empty cells for days before month starts
	for (let i = 0; i < firstDay; i++) {
		const emptyDay = document.createElement("div");
		emptyDay.className = "calendar-day other-month";
		calendar.appendChild(emptyDay);
	}

	// Add days of the month
	for (let day = 1; day <= daysInMonth; day++) {
		const dayEl = document.createElement("div");
		dayEl.className = "calendar-day";

		const dayDate = new Date(year, month, day);
		const currentDateStr = formatDateToString(dayDate);
		const dayEvents = userEvents.filter(function (event) {
			return event.date === currentDateStr;
		});

		// Check if this is today
		if (isToday(dayDate)) {
			dayEl.classList.add("today");
		}

		// Check if this is selected date
		if (isSameDay(dayDate, selectedDate)) {
			dayEl.classList.add("selected");
		}

		// Add events indicator
		if (dayEvents.length > 0) {
			dayEl.classList.add("has-events");
		}

		// Create day content
		let dayContent = `<div class="day-number">${day}</div>`;

		// Add event indicators
		dayEvents.slice(0, 2).forEach(function (event) {
			dayContent += `<div class="event-indicator" title="${event.title}">${event.title}</div>`;
		});

		if (dayEvents.length > 2) {
			dayContent += `<div class="event-indicator">+${
				dayEvents.length - 2
			} more</div>`;
		}

		dayEl.innerHTML = dayContent;

		// Add click listener
		dayEl.addEventListener("click", function () {
			selectedDate = new Date(year, month, day);
			renderCalendar();
			updateSelectedDateDisplay();
		});

		calendar.appendChild(dayEl);
	}
}

// Calendar navigation
function goToPreviousMonth() {
	currentDate.setMonth(currentDate.getMonth() - 1);
	renderCalendar();
}

function goToNextMonth() {
	currentDate.setMonth(currentDate.getMonth() + 1);
	renderCalendar();
}

// Update selected date display
function updateSelectedDateDisplay() {
	const selectedDateStr = formatDateToReadable(selectedDate);
	document.getElementById("selectedDate").textContent = selectedDateStr;
	displayEventsForSelectedDate();
}

// Display events for selected date
function displayEventsForSelectedDate() {
	const dateStr = formatDateToString(selectedDate);
	console.log("Looking for events on:", dateStr); // Debug log
	const dayEvents = userEvents.filter(function (event) {
		console.log("Checking event:", event.date, "against:", dateStr); // Debug log
		return event.date === dateStr;
	});
	console.log("Found events:", dayEvents.length); // Debug log

	const eventsListEl = document.getElementById("eventsList");

	if (dayEvents.length === 0) {
		eventsListEl.innerHTML =
			'<p class="text-muted">No events for this date</p>';
		return;
	}

	let eventsHTML = "";
	dayEvents.forEach(function (event) {
		// Get weather forecast for this specific event time
		const eventWeather = getWeatherForEventTime(event.date, event.time);
		const uvInfo = eventWeather && !eventWeather.unavailable ? getUVIndexInfo(eventWeather.uv_index) : null;
		
		eventsHTML += `
            <div class="event-item" data-event-id="${event.id}">
                <div class="event-content">
                    ${
											event.time
												? `<div class="event-time">${event.time}</div>`
												: ""
										}
                    <div class="event-title">${event.title}</div>
                    ${
											event.description
												? `<div class="event-description">${event.description}</div>`
												: ""
										}
                    ${eventWeather ? `
                        <div class="event-weather mt-2">
                            ${eventWeather.unavailable ? `
                                <div class="text-muted small">
                                    ${getUnavailableWeatherMessage(eventWeather.reason)}
                                </div>
                            ` : `
                                <div class="d-flex align-items-center">
                                    <span class="me-2" style="font-size: 20px;">${eventWeather.icon}</span>
                                    <div class="small">
                                        <div class="fw-bold">${Math.round(eventWeather.temp)}°C, ${eventWeather.description}</div>
                                        <div class="text-muted">
                                            Feels like ${Math.round(eventWeather.feels_like)}°C in ${eventWeather.location}
                                            ${eventWeather.precipitation > 0 ? ` • ${Math.round(eventWeather.precipitation * 100)}% rain` : ''}
                                            ${uvInfo ? ` • UV ${uvInfo.level} (${uvInfo.description}) ${uvInfo.icon}` : ''}
                                        </div>
                                    </div>
                                </div>
                            `}
                        </div>
                    ` : ''}
                </div>
                ${event.isBackend ? `
                    <div class="event-actions">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteEventHandler(${event.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
	});

	eventsListEl.innerHTML = eventsHTML;
}

// Event modal functions
function openAddEventModal() {
	const modal = new bootstrap.Modal(document.getElementById("addEventModal"));
	const dateInput = document.getElementById("eventDate");
	
	// Format date without timezone conversion to avoid off-by-one day errors
	const year = selectedDate.getFullYear();
	const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
	const day = String(selectedDate.getDate()).padStart(2, '0');
	dateInput.value = `${year}-${month}-${day}`;
	
	modal.show();
}

async function saveNewEvent() {
	const title = document.getElementById("eventTitle").value.trim();
	const date = document.getElementById("eventDate").value;
	const time = document.getElementById("eventTime").value;
	const description = document.getElementById("eventDescription").value.trim();

	if (!title || !date) {
		alert("Please fill in the title and date");
		return;
	}

	// Create datetime string for backend
	const dateTime = time ? `${date}T${time}:00` : `${date}T00:00:00`;

	// Get button reference and store original text
	const saveBtn = document.getElementById("saveEventBtn");
	const originalText = saveBtn.textContent;

	try {
		// Show loading state
		saveBtn.textContent = "Saving...";
		saveBtn.disabled = true;

		const response = await createEvent(title, description, dateTime);
		
		if (response.success) {
			console.log("Event created successfully:", response.data);
			
			// Add the new event to local array
			const newEvent = {
				id: response.data.id,
				userId: currentUser.id,
				title: response.data.title,
				description: response.data.description,
				date: response.data.date_time.split('T')[0],
				time: response.data.date_time.split('T')[1]?.substring(0, 5),
				dateTime: response.data.date_time,
				isBackend: true
			};

			userEvents.push(newEvent);
			console.log("Total user events:", userEvents.length);

			// Update the selected date to the event's date so we can see it
			selectedDate = new Date(date + "T00:00:00");

			renderCalendar();
			updateSelectedDateDisplay();

			// Reset form and close modal
			document.getElementById("eventForm").reset();
			const modal = bootstrap.Modal.getInstance(
				document.getElementById("addEventModal")
			);
			modal.hide();

			// Show success message
			alert("Event created successfully!");
		} else {
			console.error("Failed to create event:", response.message);
			alert("Failed to create event: " + response.message);
		}
	} catch (error) {
		console.error("Error creating event:", error);
		alert("Error creating event: " + error.message);
	} finally {
		// Always restore button state
		saveBtn.textContent = originalText;
		saveBtn.disabled = false;
	}
}

// Weather functions
async function loadWeatherData() {
	// Try to get user's current location first
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			async function (position) {
				const latitude = position.coords.latitude;
				const longitude = position.coords.longitude;
				await getWeatherByCoordinates(latitude, longitude);
			},
			async function (error) {
				console.log("Geolocation error:", error);
				// Fallback to default location if geolocation fails
				await getWeatherForLocation(currentLocation);
			}
		);
	} else {
		// Fallback to default location if geolocation not supported
		await getWeatherForLocation(currentLocation);
	}
}

async function searchWeatherByCity() {
	const location = document.getElementById("locationInput").value.trim();
	if (location) {
		currentLocation = location;
		await getWeatherForLocation(location);
	}
}

async function useCurrentLocationWeather() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			async function (position) {
				const latitude = position.coords.latitude;
				const longitude = position.coords.longitude;
				await getWeatherByCoordinates(latitude, longitude);
			},
			function (error) {
				console.error("Error getting location:", error);
				showWeatherError("Unable to get your location");
			}
		);
	} else {
		showWeatherError("Geolocation is not supported by this browser");
	}
}

async function getWeatherForLocation(location) {
	showWeatherLoading();
	try {
		const response = await getCurrentWeatherByCity(location);

		if (response.success) {
			// Update location tracking (clear coordinates since we're using city name)
			currentCoordinates = null;
			currentLocation = location;
			
			displayCurrentWeather(response.data);
			document.getElementById("locationInput").value = location;
		} else {
			showWeatherError(response.message || "Unable to fetch weather data");
		}
	} catch (error) {
		console.error("Weather API error:", error);
		showWeatherError("Network error while fetching weather");
	}
}

async function getWeatherByCoordinates(lat, lon) {
	showWeatherLoading();
	try {
		const response = await getCurrentWeatherByCoords(lat, lon);
		console.log("response", response);

		if (response.success) {
			// Update location tracking
			currentCoordinates = { lat, lon };
			currentLocation = response.data.name;
			
			displayCurrentWeather(response.data, lat, lon);
			document.getElementById("locationInput").value = response.data.name;
		} else {
			showWeatherError(response.message || "Unable to fetch weather data");
		}
	} catch (error) {
		console.error("Weather API error:", error);
		showWeatherError("Network error while fetching weather");
	}
}

function displayCurrentWeather(data, lat = null, lon = null) {
	const currentWeatherEl = document.getElementById("currentWeather");
	const temp = Math.round(data.main.temp);
	const description = data.weather[0].description;
	const iconUrl = getWeatherIconUrl(data.weather[0].icon, '2x');

	currentWeatherEl.innerHTML = `
        <div class="weather-current">
            <div class="text-muted small mb-2">Weather right now in ${data.name}, ${data.sys.country}</div>
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-description">
                <span class="weather-icon" style="font-size: 50px;">${iconUrl}</span>
                ${description}
            </div>
            <div class="weather-details">
                <div class="weather-detail">
                    <div class="weather-detail-label">Feels like</div>
                    <div class="weather-detail-value">${Math.round(data.main.feels_like)}°C</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Humidity</div>
                    <div class="weather-detail-value">${data.main.humidity}%</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Wind</div>
                    <div class="weather-detail-value">${Math.round(data.wind.speed)} km/h</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Pressure</div>
                    <div class="weather-detail-value">${data.main.pressure} hPa</div>
                </div>
            </div>
        </div>
    `;

	// Load real forecast data
	if (lat !== null && lon !== null) {
		// Use coordinates for forecast when available (for current location)
		loadRealForecastByCoords(lat, lon);
	} else {
		// Use city name for forecast (for searched locations)
		loadRealForecast(data.name);
	}
}

async function loadRealForecast(location) {
	const forecastEl = document.getElementById("weatherForecast");
	
	// Show loading state
	forecastEl.innerHTML = `
		<div class="text-center">
			<div class="spinner-border text-primary spinner-border-sm" role="status">
				<span class="visually-hidden">Loading forecast...</span>
			</div>
			<div class="mt-2 small">Loading forecast...</div>
		</div>
	`;

	try {
		// Load both daily and hourly forecasts
		const [dailyResponse, hourlyResponse] = await Promise.all([
			getForecastByCity(location),
			getHourlyForecastByCity(location)
		]);
		
		if (!dailyResponse.success) {
			forecastEl.innerHTML = `
				<div class="text-center text-muted small">
					<i class="bi bi-exclamation-triangle"></i>
					<div class="mt-1">${dailyResponse.message}</div>
				</div>
			`;
			return;
		}

		// Cache hourly forecast data for event-specific weather
		if (hourlyResponse.success) {
			cachedHourlyForecastData = {
				forecasts: hourlyResponse.data.list,
				location: currentLocation,
				coordinates: currentCoordinates,
				timestamp: new Date()
			};
		}

		displayForecastData(dailyResponse.data);
	} catch (error) {
		console.error("Forecast error:", error);
		forecastEl.innerHTML = `
			<div class="text-center text-muted small">
				<i class="bi bi-exclamation-triangle"></i>
				<div class="mt-1">Unable to load forecast</div>
			</div>
		`;
	}
}

async function loadRealForecastByCoords(lat, lon) {
	const forecastEl = document.getElementById("weatherForecast");
	
	// Show loading state
	forecastEl.innerHTML = `
		<div class="text-center">
			<div class="spinner-border text-primary spinner-border-sm" role="status">
				<span class="visually-hidden">Loading forecast...</span>
			</div>
			<div class="mt-2 small">Loading forecast...</div>
		</div>
	`;

	try {
		// Load both daily and hourly forecasts
		const [dailyResponse, hourlyResponse] = await Promise.all([
			getForecastByCoords(lat, lon),
			getHourlyForecastByCoords(lat, lon)
		]);
		
		if (!dailyResponse.success) {
			forecastEl.innerHTML = `
				<div class="text-center text-muted small">
					<i class="bi bi-exclamation-triangle"></i>
					<div class="mt-1">${dailyResponse.message}</div>
				</div>
			`;
			return;
		}

		// Cache hourly forecast data for event-specific weather
		if (hourlyResponse.success) {
			cachedHourlyForecastData = {
				forecasts: hourlyResponse.data.list,
				location: currentLocation,
				coordinates: currentCoordinates,
				timestamp: new Date()
			};
		}

		displayForecastData(dailyResponse.data);
	} catch (error) {
		console.error("Forecast error:", error);
		forecastEl.innerHTML = `
			<div class="text-center text-muted small">
				<i class="bi bi-exclamation-triangle"></i>
				<div class="mt-1">Unable to load forecast</div>
			</div>
		`;
	}
}

function displayForecastData(forecast) {
	const forecastEl = document.getElementById("weatherForecast");
	const forecastTitleEl = document.getElementById("forecastTitle");
	const dailyForecasts = processForecastData(forecast.list);
	
	// Update the forecast title with location
	if (forecastTitleEl) {
		forecastTitleEl.innerHTML = `<i class="bi"></i> 5-Day Forecast for ${currentLocation}`;
	}
	
	// Cache the forecast data
	cachedForecastData = {
		forecasts: dailyForecasts,
		location: currentLocation,
		coordinates: currentCoordinates,
		timestamp: new Date()
	};
	lastForecastUpdate = new Date();
	
	let forecastHTML = "";
	dailyForecasts.slice(0, 5).forEach(function (day, index) {
		const dayName = index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
		const iconUrl = getWeatherIconUrl(day.icon);
		
		forecastHTML += `
			<div class="forecast-item">
				<div class="forecast-date">${dayName}</div>
				<div class="forecast-weather">
					<span class="forecast-icon" style="font-size: 24px;">${iconUrl}</span>
					<span class="forecast-desc">${day.description}</span>
				</div>
				<div class="forecast-temps">
					<span class="forecast-high">${day.high}°</span>
					<span class="forecast-low">${day.low}°</span>
				</div>
			</div>
		`;
	});

	forecastEl.innerHTML = forecastHTML;
	
	// Update weather for events when forecast data changes
	displayEventsForSelectedDate();
}

function processForecastData(forecastList) {
	// Open-Meteo returns daily forecast data directly, no need to group by date
	return forecastList.map(item => {
		const date = new Date(item.dt * 1000); // Convert Unix timestamp to Date
		const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
		
		return {
			date: dateString,
			high: Math.round(item.main.temp_max),
			low: Math.round(item.main.temp_min),
			description: item.weather[0].description,
			icon: item.weather[0].icon
		};
	});
}

// Mock weather functions removed - now using free Open-Meteo API

// Get weather forecast for specific event time
function getWeatherForEventTime(eventDate, eventTime) {
	// Check if we have hourly forecast data
	if (!cachedHourlyForecastData || !cachedHourlyForecastData.forecasts || !eventTime) {
		return { unavailable: true, reason: "no_time" };
	}
	
	try {
		// Create a DateTime object for the event
		const eventDateTime = new Date(`${eventDate}T${eventTime}:00`);
		const now = new Date();
		
		// Check if event is too far in the past (more than 1 day ago)
		const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		if (eventDateTime < oneDayAgo) {
			return { unavailable: true, reason: "past" };
		}
		
		// Check if event is too far in the future (forecast covers 14 days)
		const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
		if (eventDateTime > fourteenDaysFromNow) {
			return { unavailable: true, reason: "future" };
		}
		
		// Find the closest hourly forecast to the event time
		let closestForecast = null;
		let minTimeDiff = Infinity;
		
		cachedHourlyForecastData.forecasts.forEach(forecast => {
			const forecastTime = new Date(forecast.dt_txt);
			const timeDiff = Math.abs(eventDateTime.getTime() - forecastTime.getTime());
			
			if (timeDiff < minTimeDiff) {
				minTimeDiff = timeDiff;
				closestForecast = forecast;
			}
		});
		
		if (!closestForecast) {
			return { unavailable: true, reason: "no_data" };
		}
		
		// Only show forecast if it's within 2 hours of the event time
		const maxDiffHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
		if (minTimeDiff > maxDiffHours) {
			return { unavailable: true, reason: "no_close_match" };
		}
		
		return {
			temp: closestForecast.main.temp,
			feels_like: closestForecast.main.feels_like,
			description: closestForecast.weather[0].description,
			icon: getWeatherIconUrl(closestForecast.weather[0].icon),
			precipitation: closestForecast.pop,
			humidity: closestForecast.main.humidity,
			wind_speed: closestForecast.wind.speed,
			uv_index: closestForecast.uv_index,
			location: cachedHourlyForecastData.location || currentLocation
		};
	} catch (error) {
		console.error("Error getting weather for event time:", error);
		return { unavailable: true, reason: "error" };
	}
}

// Get UV index description and safety level
function getUVIndexInfo(uvIndex) {
	if (uvIndex === null || uvIndex === undefined) {
		return null;
	}
	
	const uv = Math.round(uvIndex * 10) / 10; // Round to 1 decimal place
	
	if (uv <= 2) {
		return { level: uv, description: "Low", color: "#289500", icon: "🟢" };
	} else if (uv <= 5) {
		return { level: uv, description: "Moderate", color: "#F7D000", icon: "🟡" };
	} else if (uv <= 7) {
		return { level: uv, description: "High", color: "#F85900", icon: "🟠" };
	} else if (uv <= 10) {
		return { level: uv, description: "Very High", color: "#D8001D", icon: "🔴" };
	} else {
		return { level: uv, description: "Extreme", color: "#6B49C8", icon: "🟣" };
	}
}

// Get user-friendly message for unavailable weather forecast
function getUnavailableWeatherMessage(reason) {
	switch (reason) {
		case "no_time":
			return "⏱️ No forecast (no time specified)";
		case "past":
			return "📅 No forecast (event in past)";
		case "future":
			return "🔮 No forecast (beyond 14-day range)";
		case "no_data":
			return "❌ No forecast data available";
		case "no_close_match":
			return "⏰ No forecast (time too imprecise)";
		case "error":
			return "⚠️ Forecast unavailable";
		default:
			return "❓ No forecast available";
	}
}

function showWeatherLoading() {
	const currentWeatherEl = document.getElementById("currentWeather");
	currentWeatherEl.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-2">Loading weather data...</div>
        </div>
    `;
}

function showWeatherError(message) {
	const currentWeatherEl = document.getElementById("currentWeather");
	currentWeatherEl.innerHTML = `
        <div class="error">
            <i class="bi bi-exclamation-triangle"></i>
            <div class="mt-2">${message}</div>
        </div>
    `;
}

// Logout function
function logoutUser() {
	clearUserData();
	window.location.href = "../pages/login/login.html";
}

// Delete event handler (global function for onclick)
window.deleteEventHandler = async function(eventId) {
	if (!confirm("Are you sure you want to delete this event?")) {
		return;
	}

	try {
		const response = await deleteEvent(eventId);
		
		if (response.success) {
			// Remove event from local array
			userEvents = userEvents.filter(event => event.id !== eventId);
			
			// Refresh the display
			renderCalendar();
			updateSelectedDateDisplay();
			
			console.log("Event deleted successfully");
		} else {
			console.error("Failed to delete event:", response.message);
			alert("Failed to delete event: " + response.message);
		}
	} catch (error) {
		console.error("Error deleting event:", error);
		alert("Error deleting event: " + error.message);
	}
};
