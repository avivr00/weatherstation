import {
	getCurrentWeatherByCity,
	getCurrentWeatherByCoords,
	getForecastByCity,
	getForecastByCoords,
	getWeatherIconUrl,
	isApiKeyConfigured
} from "../API/weatherAPI.js";
import { getMockEvents, saveMockEvents } from "../API/mockData.js";
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
	getMonthNames,
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
let currentLocation = "Tel Aviv";

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
	checkAuthentication();
	setupEventListeners();
	loadUserEventsData();
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

// Load user events
function loadUserEventsData() {
	if (!currentUser) return;

	const allEvents = getMockEvents();
	userEvents = allEvents.filter((event) => event.userId === currentUser.id);

	// Also load any local events created by the user
	const localEvents = loadUserEvents(currentUser.id);
	userEvents = [...userEvents, ...localEvents];
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
		eventsHTML += `
            <div class="event-item">
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
            </div>
        `;
	});

	eventsListEl.innerHTML = eventsHTML;
}

// Event modal functions
function openAddEventModal() {
	const modal = new bootstrap.Modal(document.getElementById("addEventModal"));
	const dateInput = document.getElementById("eventDate");
	dateInput.value = selectedDate.toISOString().split("T")[0];
	modal.show();
}

function saveNewEvent() {
	const title = document.getElementById("eventTitle").value.trim();
	const date = document.getElementById("eventDate").value;
	const time = document.getElementById("eventTime").value;
	const description = document.getElementById("eventDescription").value.trim();

	if (!title || !date) {
		alert("Please fill in the title and date");
		return;
	}

	const newEvent = {
		id: Date.now(),
		userId: currentUser.id,
		title: title,
		date: date,
		time: time || null,
		description: description || null,
		isLocal: true,
	};

	console.log("Adding new event:", newEvent); // Debug log
	userEvents.push(newEvent);
	console.log("Total user events:", userEvents.length); // Debug log

	saveUserEventsData();

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
}

// Weather functions
async function loadWeatherData() {
	// Check if API key is configured
	if (!isApiKeyConfigured()) {
		showWeatherError('OpenWeatherMap API key not configured. <br><a href="#" onclick="promptForApiKey()" class="text-decoration-underline">Click here to add your API key</a><br><small class="text-muted">Get a free key from <a href="https://openweathermap.org/api" target="_blank" class="text-decoration-underline">openweathermap.org</a></small>');
		return;
	}

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

// Function to prompt user for API key
window.promptForApiKey = function() {
	const apiKey = prompt(
		'Please enter your OpenWeatherMap API key:\n\n' +
		'1. Go to https://openweathermap.org/api\n' +
		'2. Sign up for a free account\n' +
		'3. Get your API key\n' +
		'4. Paste it here:'
	);
	
	if (apiKey && apiKey.trim()) {
		// Store the API key
		import('../API/weatherAPI.js').then(module => {
			module.storeApiKey(apiKey.trim());
			// Reload weather data
			loadWeatherData();
		});
	}
};

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
			displayCurrentWeather(response.data);
			currentLocation = response.data.name;
			document.getElementById("locationInput").value = response.data.name;
		} else {
			showWeatherError(response.message || "Unable to fetch weather data");
		}
	} catch (error) {
		console.error("Weather API error:", error);
		showWeatherError("Network error while fetching weather");
	}
}

function displayCurrentWeather(data) {
	const currentWeatherEl = document.getElementById("currentWeather");
	const temp = Math.round(data.main.temp);
	const description = data.weather[0].description;
	const iconUrl = getWeatherIconUrl(data.weather[0].icon, '2x');

	currentWeatherEl.innerHTML = `
        <div class="weather-current">
            <div class="weather-location mb-2">${data.name}, ${data.sys.country}</div>
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-description">
                <img src="${iconUrl}" alt="${description}" class="weather-icon" style="width: 50px; height: 50px;">
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
                    <div class="weather-detail-value">${Math.round(data.wind.speed)} m/s</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Pressure</div>
                    <div class="weather-detail-value">${data.main.pressure} hPa</div>
                </div>
            </div>
        </div>
    `;

	// Load real forecast data
	loadRealForecast(data.name);
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
		const response = await getForecastByCity(location);
		
		if (!response.success) {
			forecastEl.innerHTML = `
				<div class="text-center text-muted small">
					<i class="bi bi-exclamation-triangle"></i>
					<div class="mt-1">${response.message}</div>
				</div>
			`;
			return;
		}

		const forecast = response.data;
		const dailyForecasts = processForecastData(forecast.list);
		
		let forecastHTML = "";
		dailyForecasts.slice(0, 5).forEach(function (day, index) {
			const dayName = index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
			const iconUrl = getWeatherIconUrl(day.icon);
			
			forecastHTML += `
				<div class="forecast-item">
					<div class="forecast-date">${dayName}</div>
					<div class="forecast-weather">
						<img src="${iconUrl}" alt="${day.description}" class="forecast-icon" style="width: 24px; height: 24px;">
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

function processForecastData(forecastList) {
	const dailyData = {};
	
	// Group forecast data by date
	forecastList.forEach(item => {
		const date = item.dt_txt.split(' ')[0]; // Get date part (YYYY-MM-DD)
		
		if (!dailyData[date]) {
			dailyData[date] = {
				date: date,
				temps: [],
				descriptions: [],
				icons: []
			};
		}
		
		dailyData[date].temps.push(item.main.temp);
		dailyData[date].descriptions.push(item.weather[0].description);
		dailyData[date].icons.push(item.weather[0].icon);
	});
	
	// Convert to array and calculate daily highs/lows
	return Object.values(dailyData).map(day => {
		const high = Math.round(Math.max(...day.temps));
		const low = Math.round(Math.min(...day.temps));
		
		// Use the most common weather description and icon
		const description = getMostCommon(day.descriptions);
		const icon = getMostCommon(day.icons);
		
		return {
			date: day.date,
			high: high,
			low: low,
			description: description,
			icon: icon
		};
	});
}

function getMostCommon(arr) {
	const frequency = {};
	let maxCount = 0;
	let mostCommon = arr[0];
	
	arr.forEach(item => {
		frequency[item] = (frequency[item] || 0) + 1;
		if (frequency[item] > maxCount) {
			maxCount = frequency[item];
			mostCommon = item;
		}
	});
	
	return mostCommon;
}

// Mock weather functions removed - now using real OpenWeatherMap API

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
