// =========================================
// WeatherX - Modern Weather App
// Part 1 - Variables & Helper Functions
// =========================================

// =====================
// WeatherAPI Key
// =====================
const API_KEY = "ee0f764930a249fd828134920262107";

// =====================
// DOM Elements
// =====================

const locationInput = document.getElementById("location");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.querySelector(".city-name");
const country = document.querySelector(".country");
const localTime = document.querySelector(".local-time");

const temperature = document.querySelector(".temperature");
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
// Format Time
// Example:
// 06:14 AM
// =====================

function formatTime(timeString) {

    return new Date(timeString).toLocaleTimeString([], {

        hour: "2-digit",
        minute: "2-digit"

    });

}

// =====================
// Weather Background
// =====================

function changeBackground(condition) {

    const body = document.body;

    body.className = "";

    condition = condition.toLowerCase();

    if (condition.includes("sun")) {

        body.classList.add("sunny");

    }

    else if (condition.includes("rain")) {

        body.classList.add("rain");

    }

    else if (condition.includes("cloud")) {

        body.classList.add("cloudy");

    }

    else if (condition.includes("snow")) {

        body.classList.add("snow");

    }

    else {

        body.classList.add("default-weather");

    }

}

// =====================
// Create Forecast Card
// =====================

function createForecastCard(hour) {

    return `

        <div class="forecast-item">

            <h4>${hour.time.split(" ")[1]}</h4>

            <img src="https:${hour.condition.icon}" alt="icon">

            <p>${Math.round(hour.temp_c)}°C</p>

        </div>

    `;

}
// =========================================
// Part 2 - Fetch Weather & Update UI
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

        // ===========================
        // Location Information
        // ===========================

        cityName.textContent = data.location.name;

        country.textContent =
            `${data.location.region}, ${data.location.country}`;

        localTime.textContent = data.location.localtime;

        // ===========================
        // Current Weather
        // ===========================

        temperature.textContent =
            `${Math.round(data.current.temp_c)}°`;

        description.textContent =
            data.current.condition.text;

        feelsLike.textContent =
            `Feels Like ${Math.round(data.current.feelslike_c)}°C`;

        weatherIcon.src =
            "https:" + data.current.condition.icon;

        weatherIcon.alt =
            data.current.condition.text;

        // ===========================
        // Weather Details
        // ===========================

        humidity.textContent =
            data.current.humidity + "%";

        wind.textContent =
            data.current.wind_kph + " km/h";

        pressure.textContent =
            data.current.pressure_mb + " hPa";

        visibility.textContent =
            data.current.vis_km + " km";

        feelsTemp.textContent =
            data.current.feelslike_c + "°C";

        clouds.textContent =
            data.current.cloud + "%";

        sunrise.textContent =
            data.forecast.forecastday[0].astro.sunrise;

        sunset.textContent =
            data.forecast.forecastday[0].astro.sunset;

        // ===========================
        // Dynamic Background
        // ===========================

        changeBackground(data.current.condition.text);

        // ===========================
        // Hourly Forecast
        // ===========================

        forecastContainer.innerHTML = "";

        data.forecast.forecastday[0].hour.forEach(hour => {

            forecastContainer.innerHTML +=
                createForecastCard(hour);

        });

        showToast("Weather Updated Successfully");

    }

    catch (error) {

        showToast(error.message);

    }

    finally {

        hideLoading();

    }

}
// =========================================
// Part 3 - Events, Geolocation & Initialization
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

// ==========================
// Get User Current Location
// ==========================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        showToast("Geolocation is not supported by your browser.");

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

                // Update UI
                cityName.textContent = data.location.name;

                country.textContent =
                    `${data.location.region}, ${data.location.country}`;

                localTime.textContent = data.location.localtime;

                temperature.textContent =
                    `${Math.round(data.current.temp_c)}°`;

                description.textContent =
                    data.current.condition.text;

                feelsLike.textContent =
                    `Feels Like ${Math.round(data.current.feelslike_c)}°C`;

                weatherIcon.src =
                    "https:" + data.current.condition.icon;

                humidity.textContent =
                    data.current.humidity + "%";

                wind.textContent =
                    data.current.wind_kph + " km/h";

                pressure.textContent =
                    data.current.pressure_mb + " hPa";

                visibility.textContent =
                    data.current.vis_km + " km";

                feelsTemp.textContent =
                    data.current.feelslike_c + "°C";

                clouds.textContent =
                    data.current.cloud + "%";

                sunrise.textContent =
                    data.forecast.forecastday[0].astro.sunrise;

                sunset.textContent =
                    data.forecast.forecastday[0].astro.sunset;

                // Update background
                changeBackground(data.current.condition.text);

                // Update hourly forecast
                forecastContainer.innerHTML = "";

                data.forecast.forecastday[0].hour.forEach(hour => {

                    forecastContainer.innerHTML += createForecastCard(hour);

                });

                showToast("Current location weather loaded.");

            }

            catch (error) {

                showToast(error.message);

            }

            finally {

                hideLoading();

            }

        },

        () => {

            hideLoading();

            showToast("Location permission denied.");

        }

    );

}

// ==========================
// Auto Load Weather
// ==========================

// Load current location automatically
getCurrentLocation();

// ==========================
// Optional Default City
// Uncomment if you prefer loading
// Bahawalpur instead of GPS
// ==========================

// getWeather("Bahawalpur");

// ==========================
// Input Placeholder Animation
// ==========================

locationInput.addEventListener("focus", () => {

    locationInput.placeholder = "";

});

locationInput.addEventListener("blur", () => {

    if (locationInput.value === "") {

        locationInput.placeholder = "Search any city...";

    }

});

// =========================================
// End of WeatherX JavaScript
// =========================================