import React, { useEffect, useState } from 'react';
import WeatherCard from './components/WeatherCard';
import './App.css';

console.log('API KEY from env:', process.env.REACT_APP_OWM_API_KEY);

const INITIAL_CITIES = ['Manila', 'Bern', 'Delhi', 'Lilongwe', 'Islamabad'];
const API_KEY = process.env.REACT_APP_OWM_API_KEY; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Async fetch function
async function fetchWeatherData(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try {
        const j = await response.json();
        if (j?.message) msg = j.message;
      } catch {}
      throw new Error(msg);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export default function App() {
  // separate states
  const [defaultCities, setDefaultCities] = useState(INITIAL_CITIES);
  const [defaultWeather, setDefaultWeather] = useState({});
  const [searchCity, setSearchCity] = useState(''); // for input
  const [searchError, setSearchError] = useState('');
  const [searchedWeather, setSearchedWeather] = useState(null); // store searched city’s weather separately

  // Fetch weather for a single default city and store it
  function loadDefaultCityWeather(city) {
    const key = city.toLowerCase();
    setDefaultWeather((m) => ({ ...m, [key]: { status: 'loading' } }));
    fetchWeatherData(city)
      .then((data) =>
        setDefaultWeather((m) => ({ ...m, [key]: { status: 'ready', data } }))
      )
      .catch((err) =>
        setDefaultWeather((m) => ({ ...m, [key]: { status: 'error', error: err.message } }))
      );
  }

  // Load all default cities on mount
  useEffect(() => {
    defaultCities.forEach((c) => loadDefaultCityWeather(c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle editing default city names
  function handleEditCity(index, newName) {
    const updated = [...defaultCities];
    updated[index] = newName;
    setDefaultCities(updated);
    if (newName.trim()) loadDefaultCityWeather(newName);
  }

  // Handle searching a new city (separate from default ones)
  async function handleSearch(e) {
    e.preventDefault();
    setSearchError('');
    const trimmed = searchCity.trim();
    if (!trimmed) return;

    setSearchedWeather({ status: 'loading', city: trimmed });
    try {
      const data = await fetchWeatherData(trimmed);
      setSearchedWeather({ status: 'ready', data });
    } catch (err) {
      setSearchedWeather({ status: 'error', error: err.message });
      setSearchError(`Could not find weather for "${trimmed}": ${err.message}`);
    } finally {
      setSearchCity('');
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Weather Checker 🌦️</h1>
        <p className="subtitle">Current conditions powered by OpenWeatherMap</p>
      </header>

      {/* Default weather cards */}
      <main className="grid">
        {defaultCities.map((c) => {
          const key = c.toLowerCase();
          const entry = defaultWeather[key];
          return (
            <WeatherCard
              key={key}
              cityLabel={c}
              status={entry?.status || 'loading'}
              data={entry?.data}
              error={entry?.error}
            />
          );
        })}
      </main>

      {/* Editable default cities row */}
      <div className="edit-cities">
        {defaultCities.map((city, index) => (
          <input
            key={index}
            className="city-edit-input"
            value={city}
            onChange={(e) => handleEditCity(index, e.target.value)}
          />
        ))}
      </div>

      {/* Search form centered below */}
      <form className="search" onSubmit={handleSearch} autoComplete="off">
        <input
          type="text"
          placeholder="Type a city (e.g., London)…"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          aria-label="City name"
        />
        <button type="submit" disabled={!searchCity.trim()}>Search</button>
      </form>

      {searchError ? <div className="banner warn">{searchError}</div> : null}

      {/* Searched city weather separate below */}
      <div className="searched-city">
        {searchedWeather && searchedWeather.status === 'loading' && (
          <div className="loading">Loading weather…</div>
        )}
        {searchedWeather && searchedWeather.status === 'error' && (
          <div className="banner warn">Could not load city: {searchedWeather.error}</div>
        )}
        {searchedWeather && searchedWeather.status === 'ready' && (
          <div className="search-result">
            <WeatherCard
              cityLabel={searchedWeather.data?.name}
              status="ready"
              data={searchedWeather.data}
            />
          </div>
        )}
      </div>

      <footer className="footer">
        <small>Icons & data © OpenWeatherMap. Temperatures in °C. Wind in m/s.</small>
      </footer>
    </div>
  );
}
