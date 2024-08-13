// app.js

const API_KEY = 'bd827b5dd33b1072cde8dac5cab15ada';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

searchBtn.addEventListener('click', fetchWeatherData);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeatherData();
    }
});

function fetchWeatherData() {
    const city = cityInput.value.trim();
    if (!city) return;

    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateWeatherInfo(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch weather data. Please try again.');
        });
}

function updateWeatherInfo(data) {
    cityName.textContent = data.name;
    temperature.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
    description.textContent = `Description: ${data.weather[0].description}`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
}

// Error handling function
function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// Function to capitalize first letter of each word
function capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

// Function to convert wind speed from m/s to km/h
function convertWindSpeed(speed) {
    return (speed * 3.6).toFixed(1);
}

// Function to get weather icon
function getWeatherIcon(iconCode) {
    return `http://openweathermap.org/img/wn/${iconCode}.png`;
}

// Function to format date
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Function to display loading indicator
function showLoading() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading';
    loadingIndicator.textContent = 'Loading...';
    document.body.appendChild(loadingIndicator);
}

// Function to hide loading indicator
function hideLoading() {
    const loadingIndicator = document.getElementById('loading');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Enhanced fetchWeatherData function
function fetchWeatherData() {
    const city = cityInput.value.trim();
    if (!city) return;

    showLoading();

    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(handleErrors)
        .then(response => response.json())
        .then(data => {
            updateWeatherInfo(data);
            hideLoading();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch weather data. Please try again.');
            hideLoading();
        });
}

// Enhanced updateWeatherInfo function
function updateWeatherInfo(data) {
    cityName.textContent = data.name;
    temperature.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
    description.textContent = `Description: ${capitalizeWords(data.weather[0].description)}`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${convertWindSpeed(data.wind.speed)} km/h`;

    // Add more weather information
    const weatherIcon = document.createElement('img');
    weatherIcon.src = getWeatherIcon(data.weather[0].icon);
    weatherIcon.alt = data.weather[0].description;
    description.prepend(weatherIcon);

    const dateElement = document.createElement('p');
    dateElement.textContent = formatDate(data.dt);
    cityName.after(dateElement);
}