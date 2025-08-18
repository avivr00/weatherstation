// Date utility functions for formatting and manipulation

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDateToString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse date string (YYYY-MM-DD) to Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date} Date object
 */
function parseDateString(dateString) {
    return new Date(dateString + 'T00:00:00');
}

/**
 * Format date to readable string (e.g., "Monday, January 15, 2025")
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDateToReadable(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format time to HH:MM string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
function formatTimeToString(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Parse time string (HH:MM) and set to date
 * @param {string} timeString - Time string to parse
 * @param {Date} date - Date object to set time on (optional, defaults to today)
 * @returns {Date} Date object with time set
 */
function parseTimeString(timeString, date = new Date()) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
}

/**
 * Get month names array
 * @returns {Array<string>} Array of month names
 */
function getMonthNames() {
    return [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
}

/**
 * Get day names array
 * @returns {Array<string>} Array of day names
 */
function getDayNames() {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

/**
 * Get number of days in a month
 * @param {number} year - Year
 * @param {number} month - Month (0-based, like Date object)
 * @returns {number} Number of days in the month
 */
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Get first day of month (0-6, Sunday-Saturday)
 * @param {number} year - Year
 * @param {number} month - Month (0-based)
 * @returns {number} Day of week (0-6)
 */
function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
function isToday(date) {
    return isSameDay(date, new Date());
}

/**
 * Get formatted month year string (e.g., "January 2025")
 * @param {Date} date - Date object
 * @returns {string} Formatted month year string
 */
function formatMonthYear(date) {
    const monthNames = getMonthNames();
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Add months to a date
 * @param {Date} date - Starting date
 * @param {number} months - Number of months to add (can be negative)
 * @returns {Date} New date object
 */
function addMonths(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
}

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date object
 */
function addDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

/**
 * Get start of day (00:00:00.000)
 * @param {Date} date - Date object
 * @returns {Date} New date object at start of day
 */
function getStartOfDay(date) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

/**
 * Get end of day (23:59:59.999)
 * @param {Date} date - Date object
 * @returns {Date} New date object at end of day
 */
function getEndOfDay(date) {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
}

/**
 * Format relative time (e.g., "in 2 hours", "3 days ago")
 * @param {Date} date - Date to compare
 * @param {Date} baseDate - Base date to compare against (defaults to now)
 * @returns {string} Relative time string
 */
function formatRelativeTime(date, baseDate = new Date()) {
    const diffMs = date.getTime() - baseDate.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffMinutes) < 60) {
        if (diffMinutes === 0) return 'now';
        return diffMinutes > 0 ? `in ${diffMinutes} minutes` : `${Math.abs(diffMinutes)} minutes ago`;
    } else if (Math.abs(diffHours) < 24) {
        return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
    } else if (Math.abs(diffDays) < 7) {
        return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
    } else {
        return formatDateToReadable(date);
    }
}

export {
    formatDateToString,
    parseDateString,
    formatDateToReadable,
    formatTimeToString,
    parseTimeString,
    getMonthNames,
    getDayNames,
    getDaysInMonth,
    getFirstDayOfMonth,
    isSameDay,
    isToday,
    formatMonthYear,
    addMonths,
    addDays,
    getStartOfDay,
    getEndOfDay,
    formatRelativeTime
};