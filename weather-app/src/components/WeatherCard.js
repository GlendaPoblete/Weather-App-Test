import React from 'react';

export default function WeatherCard({ cityLabel, status, data, error }) {
  if (status === 'loading') {
    return (
      <article className="card skeleton">
        <h3>{cityLabel}</h3>
        <p>Loading...</p>
      </article>
    );
  }

  if (status === 'error') {
    return (
      <article className="card error">
        <h3>{cityLabel}</h3>
        <p>Couldn’t load weather. {error}</p>
      </article>
    );
  }

  const name = data?.name ?? cityLabel;
  const country = data?.sys?.country ? `, ${data.sys.country}` : '';
  const temp = Math.round(data?.main?.temp ?? 0);
  const feels = Math.round(data?.main?.feels_like ?? 0);
  const desc = data?.weather?.[0]?.description ?? '—';
  const icon = data?.weather?.[0]?.icon;
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : null;
  const humidity = data?.main?.humidity;
  const wind = data?.wind?.speed;

  return (
    <article className="card">
      <h3>{name}{country}</h3>
      {iconUrl ? <img className="icon" src={iconUrl} alt={desc} /> : null}
      <p>{capitalize(desc)}</p>
      <div>Temp: {temp}°C (Feels {feels}°C)</div>
      <div>Humidity: {humidity}%</div>
      <div>Wind: {wind} m/s</div>
    </article>
  );
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
