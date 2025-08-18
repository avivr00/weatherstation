// For testing with mock data, import from mockAuthAPI
// For production with real server, import from authAPI
import { register } from "../../API/mockAuthAPI.js";

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
        
        if (response.success) {
            showMessage("Registration successful! Redirecting to login...", "success");
            
            setTimeout(() => {
                window.location.href = "../login/login.html";
            }, 1500);
        } else {
            showMessage(response.message || "Registration failed.", "error");
        }
    } catch (error) {
        showMessage(error.message || "Registration failed.", "error");
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    form.addEventListener("submit", handleRegistration);
});
