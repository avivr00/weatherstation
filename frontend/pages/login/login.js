// For testing with mock data, import from mockAuthAPI
// For production with real server, import from authAPI
import { login } from "../../API/authAPI.js";
import { saveUserData, isAuthenticated } from "../../utils/storage.js";

const form = document.getElementById("loginForm");
const msgEl = document.getElementById("msg");

function showMessage(text, type = "error") {
    msgEl.textContent = text;
    msgEl.className = `mt-3 text-center small ${type}`;
}

function validateLoginForm(formData) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Invalid email address.";
    if (!formData.password.trim()) return "Password is required.";
    return null;
}

// saveUserData function is now imported from utils/storage.js

function redirectToHomePage() {
    window.location.href = "../../home/home.html";
}

function checkExistingLogin() {
    if (isAuthenticated()) {
        redirectToHomePage();
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const formData = {
        email: form.email.value.trim(),
        password: form.password.value,
        rememberMe: form.rememberMe.checked
    };

    const validationError = validateLoginForm(formData);
    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    try {
        showMessage("Logging in...", "success");
        
        const response = await login(formData.email, formData.password);
        
        if (response.success) {
            showMessage("Login successful!", "success");
            saveUserData(response.data, formData.rememberMe);
            
            setTimeout(redirectToHomePage, 1000);
        } else {
            showMessage(response.message || "Login failed.", "error");
        }
    } catch (error) {
        showMessage(error.message || "Login failed.", "error");
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    checkExistingLogin();
    form.addEventListener("submit", handleLogin);
});