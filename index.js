const catergoiesEntryPoint = "https://api.chucknorris.io/jokes/categories";
const jokeEntryPointPrefix = "https://api.chucknorris.io/jokes/random?category=";

const dropdown = document.getElementById("dropdown");
const fetchJokeButton = document.getElementById("fetchJokeButton");
const jokeTextArea = document.getElementById("jokeTextArea");
const RESPONSE_OK = 200;

async function populateCategories() {
  const response = await fetch(catergoiesEntryPoint);
  if (!response) {
    throw "Failed to fetch categories";
  }
  if (response.status !== RESPONSE_OK) {
    throw `Failed to fetch categories, status code: ${response.status}`;
  }
  const categories = await response.json();
  
  // populate the dropdown with categories
  for (let category of categories) {
    const optionEl = document.createElement("option");
    optionEl.value = category;
    optionEl.innerText = category;
    dropdown.appendChild(optionEl);
  }
}

async function fetchJoke() {
    const selectedCategory = dropdown.value;
    if (selectedCategory === "None") {
        return;
    }
    
    const url = jokeEntryPointPrefix + selectedCategory;
    const response = await fetch(url);
    if (!response) {
        throw "Failed to fetch joke";
    }
    if (response.status !== RESPONSE_OK) {
        throw `Failed to fetch joke, status code: ${response.status}`;
    }
    const responseJson = await response.json();
    if (!responseJson || !responseJson.value) {
        throw "Invalid joke response";
    }
    const joke = responseJson.value;
    jokeTextArea.innerText = joke;
}

async function fetchJokebuttonHandler() {
    fetchJokeButton.disabled = true;
    try {
        await fetchJoke()
    }
    catch (error) {
        console.error(error);
        jokeTextArea.innerText = "Error fetching joke: " + error;
    } finally {
        fetchJokeButton.disabled = false;
    }
}

function dropdownChangeHandler() {
    if (dropdown.value === "None") {
        fetchJokeButton.disabled = true;
        return
    }

    fetchJokeButton.disabled = false;
}

document.addEventListener("DOMContentLoaded", async () => {
    const domSelectionErrorPrefix = "could not select element:"
    if (!dropdown) {
        throw domSelectionErrorPrefix + "dropdown";
    }
    if (!fetchJokeButton) {
        throw domSelectionErrorPrefix + "fetchJokeButton";
    }
    if (!jokeTextArea) {
        throw domSelectionErrorPrefix + "jokeTextArea";
    }
    await populateCategories();
    dropdown.addEventListener("change", dropdownChangeHandler);
    fetchJokeButton.addEventListener("click", fetchJokebuttonHandler);
    dropdownChangeHandler(); // initialize button state

});


