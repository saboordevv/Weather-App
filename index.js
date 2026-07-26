// =========================================
// SkyCast - Modern Weather App
// Logic & State Management
// =========================================

// =====================
// WeatherAPI Key
// =====================
const API_KEY = "ee0f764930a249fd828134920262107";

// =====================
// State variables
// =====================
let weatherData = null; // Holds the parsed weather data object from API
let currentUnit = localStorage.getItem("skycast_unit") || "C"; // 'C' or 'F'
let recentSearches = JSON.parse(localStorage.getItem("skycast_recent") || "[]");

// =====================
// DOM Elements
// =====================
const locationInput = document.getElementById("location");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.querySelector(".city-name");
const country = document.querySelector(".country");
const localTime = document.querySelector(".local-time");

const mainTempElement = document.getElementById("mainTemp");
const description = document.querySelector(".description");
const feelsLike = document.querySelector(".feels-like");

const humidity = document.querySelector(".info-humidity");
const wind = document.querySelector(".info-wind");
const pressure = document.querySelector(".info-pressure");
const visibility = document.querySelector(".info-visibility");
const sunrise = document.querySelector(".info-sunrise");
const sunset = document.querySelector(".info-sunset");
const feelsTemp = document.querySelector(".info-feels");
const clouds = document.querySelector(".info-cloud");

const weatherIcon = document.querySelector(".weather-icon");
const forecastContainer = document.querySelector(".forecast-container");

const loading = document.querySelector(".loading");
const toast = document.querySelector(".toast");
const toastMessage = document.querySelector(".toast-message");

// Unit toggles
const btnCelsius = document.getElementById("btnCelsius");
const btnFahrenheit = document.getElementById("btnFahrenheit");

// Recommendation and Recents
const recommendationCard = document.getElementById("recommendationCard");
const recommendationText = document.getElementById("recommendationText");
const recentTagsContainer = document.getElementById("recentTags");
const recentSearchesContainer = document.getElementById("recentSearches");

// =====================
// Loading Functions
// =====================
function showLoading() {
    loading.style.display = "flex";
}

function hideLoading() {
    loading.style.display = "none";
}

// =====================
// Toast Notification
// =====================
function showToast(message) {
    toastMessage.innerText = message;
    toast.style.display = "flex";

    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

// =====================
// Weather Background
// =====================
function changeBackground(condition) {
    const body = document.body;
    body.className = "";
    condition = condition.toLowerCase();

    if (condition.includes("sun") || condition.includes("clear") || condition.includes("sunny")) {
        body.classList.add("sunny");
    } else if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) {
        body.classList.add("rain");
    } else if (condition.includes("cloud") || condition.includes("overcast") || condition.includes("mist") || condition.includes("fog")) {
        body.classList.add("cloudy");
    } else if (condition.includes("snow") || condition.includes("blizzard") || condition.includes("ice")) {
        body.classList.add("snow");
    } else {
        body.classList.add("default-weather");
    }
}

// =====================
// Recent Searches Logics
// =====================
function renderRecentSearches() {
    if (recentSearches.length === 0) {
        recentSearchesContainer.style.display = "none";
        return;
    }
    recentSearchesContainer.style.display = "flex";
    recentTagsContainer.innerHTML = "";
    recentSearches.forEach(city => {
        const tag = document.createElement("span");
        tag.className = "recent-tag";
        tag.innerHTML = `<i class='bx bx-map'></i> ${city}`;
        tag.addEventListener("click", () => {
            locationInput.value = city;
            getWeather(city);
        });
        recentTagsContainer.appendChild(tag);
    });
}

function addRecentSearch(city) {
    if (!city) return;
    // Normalize city spelling
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // Remove if already in list to put it in front
    recentSearches = recentSearches.filter(item => item.toLowerCase() !== formattedCity.toLowerCase());
    recentSearches.unshift(formattedCity);

    // Limit to 5 items
    if (recentSearches.length > 5) {
        recentSearches.pop();
    }

    localStorage.setItem("skycast_recent", JSON.stringify(recentSearches));
    renderRecentSearches();
}

// =====================
// Create Forecast Card
// =====================
function createForecastCard(hour) {
    const tempValue = currentUnit === "C" ? Math.round(hour.temp_c) + "°C" : Math.round(hour.temp_f) + "°F";
    const timeOnly = hour.time.split(" ")[1];
    return `
        <div class="forecast-item">
            <h4>${timeOnly}</h4>
            <img src="https:${hour.condition.icon}" alt="${hour.condition.text}">
            <p>${tempValue}</p>
        </div>
    `;
}

// =====================
// Smart Recommendations
// =====================
function generateRecommendation(data) {
    const condition = data.current.condition.text.toLowerCase();
    const tempC = data.current.temp_c;
    const windKph = data.current.wind_kph;
    const cloud = data.current.cloud;
    const city = data.location.name;

    let recommendation = "";

    if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower") || condition.includes("thunder")) {
        recommendation = `🌧️ It's currently rainy or stormy in ${city}. We highly recommend carrying an umbrella, wearing a waterproof jacket, and avoiding unnecessary road travel. Perfect weather for a hot cup of tea at home!`;
    } else if (tempC >= 32) {
        recommendation = `☀️ It is very hot in ${city} right now (${tempC}°C). Please stay hydrated, wear lightweight light-colored clothes, apply sunscreen (SPF 30+), and try to stay indoors during peak sunshine hours.`;
    } else if (tempC <= 14) {
        recommendation = `🧥 The weather is quite cold in ${city} (${tempC}°C). Keep yourself warm with a comfortable jacket or sweater, and enjoy a warm soup or coffee!`;
    } else if (windKph >= 25) {
        recommendation = `💨 Breezy weather alert! High wind speeds of ${windKph} km/h detected in ${city}. Secure any light outdoor structures and be prepared for dust if walking outside.`;
    } else if (condition.includes("snow") || condition.includes("ice") || condition.includes("freeze")) {
        recommendation = `❄️ Freezing temperatures detected. Wear heavy winter clothing, gloves, and a beanie. Watch out for black ice or slippery roads. Stay cozy!`;
    } else if (cloud >= 80) {
        recommendation = `☁️ Overcast skies cover ${city}. It's a peaceful, cool atmosphere with cloud percentage at ${cloud}%. Great for a pleasant stroll or cozy reading!`;
    } else {
        recommendation = `✨ Perfect, pleasant weather in ${city}! The conditions are clear and delightful. It's a wonderful day for outdoor activities, sports, or a picnic with your family!`;
    }

    recommendationText.textContent = recommendation;
    recommendationCard.classList.remove("hide");
}

// =====================
// Render Weather UI
// =====================
function renderWeather() {
    if (!weatherData) return;

    const data = weatherData;

    // Set Name & Location
    cityName.textContent = data.location.name;
    country.textContent = `${data.location.region}, ${data.location.country}`;
    localTime.textContent = data.location.localtime;

    // Toggle Temperatures
    if (currentUnit === "C") {
        mainTempElement.textContent = `${Math.round(data.current.temp_c)}°`;
        feelsLike.textContent = `Feels Like ${Math.round(data.current.feelslike_c)}°C`;
        feelsTemp.textContent = `${data.current.feelslike_c}°C`;
    } else {
        mainTempElement.textContent = `${Math.round(data.current.temp_f)}°`;
        feelsLike.textContent = `Feels Like ${Math.round(data.current.feelslike_f)}°F`;
        feelsTemp.textContent = `${data.current.feelslike_f}°F`;
    }

    // Condition texts
    description.textContent = data.current.condition.text;
    weatherIcon.src = "https:" + data.current.condition.icon;
    weatherIcon.alt = data.current.condition.text;

    // Detailed stats
    humidity.textContent = data.current.humidity + "%";
    wind.textContent = data.current.wind_kph + " km/h";
    pressure.textContent = data.current.pressure_mb + " hPa";
    visibility.textContent = data.current.vis_km + " km";
    clouds.textContent = data.current.cloud + "%";

    sunrise.textContent = data.forecast.forecastday[0].astro.sunrise;
    sunset.textContent = data.forecast.forecastday[0].astro.sunset;

    // Update background conditionally
    changeBackground(data.current.condition.text);

    // Dynamic Suggestion Card
    generateRecommendation(data);

    // Hourly Forecasts list
    forecastContainer.innerHTML = "";
    data.forecast.forecastday[0].hour.forEach(hour => {
        forecastContainer.innerHTML += createForecastCard(hour);
    });
}

// =========================================
// Fetch Weather Data from API
// =========================================
async function getWeather(city) {
    if (!city) {
        showToast("Please enter a city name.");
        return;
    }

    showLoading();

    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=1&aqi=yes&alerts=no`
        );

        if (!response.ok) {
            throw new Error("City not found.");
        }

        const data = await response.json();

        // Save to state
        weatherData = data;

        // Save to recent searches
        addRecentSearch(data.location.name);

        // Render UI
        renderWeather();
        showToast(`Weather updated for ${data.location.name}`);
    } catch (error) {
        showToast(error.message);
    } finally {
        hideLoading();
    }
}

// ==========================
// Get User Current Location
// ==========================
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser.");
        // Fallback to default city
        getWeather("Bahawalpur");
        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {
                const response = await fetch(
                    `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=1&aqi=yes&alerts=no`
                );

                if (!response.ok) {
                    throw new Error("Unable to fetch your location.");
                }

                const data = await response.json();

                // Save to state
                weatherData = data;

                // Render UI
                renderWeather();
                showToast(`Current location weather loaded.`);
            } catch (error) {
                showToast(error.message);
                // Fallback
                getWeather("Bahawalpur");
            } finally {
                hideLoading();
            }
        },
        (error) => {
            hideLoading();
            showToast("Location permission denied. Showing default city weather.");
            // Fallback to default city
            getWeather("Bahawalpur");
        }
    );
}

// =========================================
// Event Listeners Setup
// =========================================

// Search button click
searchBtn.addEventListener("click", () => {
    const city = locationInput.value.trim();
    getWeather(city);
});

// Search when Enter key is pressed
locationInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const city = locationInput.value.trim();
        getWeather(city);
    }
});

// Location button click
locationBtn.addEventListener("click", () => {
    getCurrentLocation();
});

// Unit Toggles
btnCelsius.addEventListener("click", () => {
    if (currentUnit === "C") return;
    currentUnit = "C";
    localStorage.setItem("skycast_unit", "C");
    btnCelsius.classList.add("active");
    btnFahrenheit.classList.remove("active");
    renderWeather();
    showToast("Switched to Celsius");
});

btnFahrenheit.addEventListener("click", () => {
    if (currentUnit === "F") return;
    currentUnit = "F";
    localStorage.setItem("skycast_unit", "F");
    btnFahrenheit.classList.add("active");
    btnCelsius.classList.remove("active");
    renderWeather();
    showToast("Switched to Fahrenheit");
});

// Input Placeholder Animations
locationInput.addEventListener("focus", () => {
    locationInput.placeholder = "";
});

locationInput.addEventListener("blur", () => {
    if (locationInput.value === "") {
        locationInput.placeholder = "Search any city...";
    }
});

// =========================================
// Initialization
// =========================================
function init() {
    // Sync Unit Toggle UI state on startup
    if (currentUnit === "F") {
        btnFahrenheit.classList.add("active");
        btnCelsius.classList.remove("active");
    } else {
        btnCelsius.classList.add("active");
        btnFahrenheit.classList.remove("active");
    }

    // Render Recent Searches tag list
    renderRecentSearches();

    // Auto load current location weather
    getCurrentLocation();
}

// Run startup
init();

// =========================================
// End of SkyCast JavaScript
// =========================================