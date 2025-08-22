// Authentication using real server API
import { register } from "../../API/authAPI.js";
import { saveUserData } from "../../utils/storage.js";

const form = document.getElementById("registerForm");
const msgEl = document.getElementById("msg");

function showMessage(text, type = "error") {
    msgEl.textContent = text;
    msgEl.className = `mt-3 text-center small ${type}`;
}

function validateForm(formData) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
        return "Name fields are required.";
    }
    if (!emailRegex.test(formData.email)) {
        return "Invalid email address.";
    }
    if (formData.password.length < 8) {
        return "Password must be at least 8 characters.";
    }
    return null;
}

async function handleRegistration(event) {
    event.preventDefault();

    const formData = {
        first_name: form.first_name.value.trim(),
        last_name: form.last_name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
    };

    const validationError = validateForm(formData);
    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    try {
        showMessage("Creating account...", "success");
        
        const response = await register(
            formData.first_name, 
            formData.last_name, 
            formData.email, 
            formData.password
        );
        
        if (response && response.success === true) {
            showMessage("Registration successful! Redirecting to home page...", "success");

            // Save user data to storage (using localStorage for convenience)
            saveUserData(response.data, true);

            // Clear the form
            form.reset();

            // Redirect to home page
            window.location.href = "../../home/home.html";
        } else {
            showMessage(response?.message || "Registration failed.", "error");
        }
    } catch (error) {
        showMessage(error.message || "Registration failed.", "error");
    }
}

// Password visibility toggle functionality
function initializePasswordToggle() {
    const toggleButton = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");

    if (toggleButton && passwordInput && eyeIcon) {
        toggleButton.addEventListener("click", function() {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            
            // Toggle eye icon
            if (type === "text") {
                eyeIcon.classList.remove("bi-eye");
                eyeIcon.classList.add("bi-eye-slash");
            } else {
                eyeIcon.classList.remove("bi-eye-slash");
                eyeIcon.classList.add("bi-eye");
            }
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    form.addEventListener("submit", handleRegistration);
    initializePasswordToggle();
});
