// app.js

const API_KEY = 'bd827b5dd33b1072cde8dac5cab15ada';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const geolocationBtn = document.getElementById('geolocation-btn');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weather-icon');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const feelsLike = document.getElementById('feels-like');
const visibility = document.getElementById('visibility');
const uvIndex = document.getElementById('uv-index');
const forecastContainer = document.getElementById('forecast-container');

// Global variables
let currentUnit = 'metric';
let currentWeatherData = null;
let currentForecastData = null;

// Event Listeners
searchBtn.addEventListener('click', () => fetchWeatherData(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeatherData(cityInput.value);
    }
});
geolocationBtn.addEventListener('click', useGeolocation);
celsiusBtn.addEventListener('click', () => changeUnit('metric'));
fahrenheitBtn.addEventListener('click', () => changeUnit('imperial'));

// Functions
function fetchWeatherData(city) {
    if (!city) return;

    showLoading();

    const currentWeatherUrl = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
    const forecastUrl = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`;

    Promise.all([
        fetch(currentWeatherUrl).then(handleErrors),
        fetch(forecastUrl).then(handleErrors)
    ])
        .then(([currentWeatherResponse, forecastResponse]) =>
            Promise.all([currentWeatherResponse.json(), forecastResponse.json()])
        )
        .then(([currentWeatherData, forecastData]) => {
            updateCurrentWeather(currentWeatherData);
            updateForecast(forecastData);
            saveToLocalStorage(city);
            hideLoading();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch weather data. Please try again.');
            hideLoading();
        });
}

function updateCurrentWeather(data) {
    currentWeatherData = data;
    cityName.textContent = data.name;
    updateTemperature(data.main.temp);
    weatherIcon.src = getWeatherIcon(data.weather[0].icon);
    weatherIcon.alt = data.weather[0].description;
    description.textContent = capitalizeWords(data.weather[0].description);
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${convertWindSpeed(data.wind.speed)} ${currentUnit === 'metric' ? 'km/h' : 'mph'}`;
    pressure.textContent = `${data.main.pressure} hPa`;
    updateFeelsLike(data.main.feels_like);
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Fetch UV Index data
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    fetchUVIndex(lat, lon);
}

function updateForecast(data) {
    currentForecastData = data;
    forecastContainer.innerHTML = '';
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    dailyForecasts.slice(0, 5).forEach(forecast => {
        const forecastItem = createForecastItem(forecast);
        forecastContainer.appendChild(forecastItem);
    });
}

function createForecastItem(forecast) {
    const forecastItem = document.createElement('div');
    forecastItem.classList.add('forecast-item');

    const date = new Date(forecast.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    forecastItem.innerHTML = `
        <p class="forecast-date">${dayName}</p>
        <img class="forecast-icon" src="${getWeatherIcon(forecast.weather[0].icon)}" alt="${forecast.weather[0].description}">
        <p class="forecast-temp">${Math.round(forecast.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
    `;

    return forecastItem;
}

function fetchUVIndex(lat, lon) {
    const uvIndexUrl = `${BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    fetch(uvIndexUrl)
        .then(handleErrors)
        .then(response => response.json())
        .then(data => {
            uvIndex.textContent = data.value.toFixed(1);
        })
        .catch(error => {
            console.error('Error fetching UV Index:', error);
            uvIndex.textContent = 'N/A';
        });
}

function useGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherDataByCoords(lat, lon);
            },
            error => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Please enter a city name.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser. Please enter a city name.');
    }
}

function fetchWeatherDataByCoords(lat, lon) {
    showLoading();

    const currentWeatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
    const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;

    Promise.all([
        fetch(currentWeatherUrl).then(handleErrors),
        fetch(forecastUrl).then(handleErrors)
    ])
        .then(([currentWeatherResponse, forecastResponse]) =>
            Promise.all([currentWeatherResponse.json(), forecastResponse.json()])
        )
        .then(([currentWeatherData, forecastData]) => {
            updateCurrentWeather(currentWeatherData);
            updateForecast(forecastData);
            saveToLocalStorage(currentWeatherData.name);
            hideLoading();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch weather data. Please try again.');
            hideLoading();
        });
}

function changeUnit(unit) {
    if (currentUnit === unit) return;
    currentUnit = unit;
    updateUnitButtons();
    if (currentWeatherData) {
        updateCurrentWeather(currentWeatherData);
        updateForecast(currentForecastData);
    }
}

function updateUnitButtons() {
    if (currentUnit === 'metric') {
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
    } else {
        celsiusBtn.classList.remove('active');
        fahrenheitBtn.classList.add('active');
    }
}

function updateTemperature(temp) {
    temperature.textContent = `${Math.round(temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
}

function updateFeelsLike(temp) {
    feelsLike.textContent = `${Math.round(temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
}

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

function convertWindSpeed(speed) {
    if (currentUnit === 'metric') {
        return (speed * 3.6).toFixed(1); // Convert m/s to km/h
    } else {
        return speed.toFixed(1); // Already in mph
    }
}

function getWeatherIcon(iconCode) {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function showLoading() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading';
    loadingIndicator.textContent = 'Loading...';
    document.body.appendChild(loadingIndicator);
}

function hideLoading() {
    const loadingIndicator = document.getElementById('loading');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

function saveToLocalStorage(city) {
    localStorage.setItem('lastSearchedCity', city);
}

function loadFromLocalStorage() {
    const lastSearchedCity = localStorage.getItem('lastSearchedCity');
    if (lastSearchedCity) {
        cityInput.value = lastSearchedCity;
        fetchWeatherData(lastSearchedCity);
    } else {
        // Default city if no last search
        fetchWeatherData('London');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateUnitButtons();
});