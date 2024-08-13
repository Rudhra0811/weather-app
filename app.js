// app.js

const API_KEY = 'bd827b5dd33b1072cde8dac5cab15ada';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
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

searchBtn.addEventListener('click', fetchWeatherData);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeatherData();
    }
});

function fetchWeatherData() {
    const city = cityInput.value.trim();
    if (!city) return;

    showLoading();

    const currentWeatherUrl = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`;

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
        hideLoading();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to fetch weather data. Please try again.');
        hideLoading();
    });
}

function updateCurrentWeather(data) {
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherIcon.src = getWeatherIcon(data.weather[0].icon);
    weatherIcon.alt = data.weather[0].description;
    description.textContent = capitalizeWords(data.weather[0].description);
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${convertWindSpeed(data.wind.speed)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    // Fetch UV Index data
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    fetchUVIndex(lat, lon);
}

function updateForecast(data) {
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
        <p class="forecast-temp">${Math.round(forecast.main.temp)}°C</p>
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
    return (speed * 3.6).toFixed(1);
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

// Initial weather data fetch for a default city
document.addEventListener('DOMContentLoaded', () => {
    cityInput.value = 'London';
    fetchWeatherData();
});