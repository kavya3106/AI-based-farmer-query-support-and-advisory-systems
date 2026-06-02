import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { translations } from '../utils/translations';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Sun, 
  Compass, 
  CloudRain,
  AlertTriangle
} from 'lucide-react';

export default function WeatherPage({ lang }) {
  const t = translations[lang] || translations.en;

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        const data = await api.getWeather();
        setWeather(data);
      } catch (err) {
        console.error(err);
        setError(lang === 'ta' ? 'வானிலை தகவல்களைப் பெறுவதில் பிழை ஏற்பட்டது.' : 'Failed to retrieve weather forecast. Verify Flask API is running.');
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, [lang]);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>{t.weather}</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time regional forecast and soil moisture projections.</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <span className="spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px' }}></span>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching weather forecasts...</p>
        </div>
      ) : weather ? (
        <div>
          {/* Main Weather Card */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, #163c24 0%, #0d2215 100%)',
            color: 'white',
            padding: '2.5rem 2rem',
            border: 'none',
            position: 'relative',
            marginBottom: '2rem',
            overflow: 'hidden'
          }}>
            {/* Background design elements */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--secondary-glow) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.95rem', background: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)' }}>
                  📍 {weather.location || 'Coimbatore Region'}
                </span>
                <h2 style={{ fontSize: '4rem', fontWeight: 700, margin: '1rem 0 0.5rem 0', lineHeight: 1 }}>
                  {Math.round(weather.temp)}°C
                </h2>
                <p style={{ fontSize: '1.25rem', textTransform: 'capitalize', color: '#a7f3d0' }}>
                  {weather.description}
                </p>
              </div>

              {/* Forecast Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1.5rem',
                minWidth: '280px',
                background: 'rgba(0,0,0,0.15)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Wind size={20} color="#34d399" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>Wind Speed</span>
                    <strong>{weather.wind_speed} km/h</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Droplets size={20} color="#60a5fa" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>Humidity</span>
                    <strong>{weather.humidity}%</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Sun size={20} color="#fbbf24" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>UV Index</span>
                    <strong>{weather.uv_index || 'Low'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CloudRain size={20} color="#93c5fd" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7 }}>Rain Probability</span>
                    <strong>{weather.rain_prob}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Alerts if any */}
            {weather.rain_prob > 70 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fef3c7',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginTop: '2rem',
                fontSize: '0.9rem'
              }}>
                <AlertTriangle size={18} color="#fbbf24" />
                <span>Heavy rain predicted. Consider delaying fertilizer/chemical applications and opening drainage runoffs.</span>
              </div>
            )}
          </div>

          {/* 5-Day Forecast Grid */}
          <div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', color: 'var(--text-main)' }}>5-Day Agricultural Forecast</h3>
            <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              {weather.forecast && weather.forecast.map((day, idx) => (
                <div key={idx} className="glass-card" style={{ textAlign: 'center', padding: '1.25rem 0.75rem' }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    {day.day}
                  </span>
                  <CloudSun size={32} style={{ color: 'var(--primary-light)', margin: '0.5rem 0' }} />
                  <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700, margin: '0.25rem 0' }}>
                    {day.temp_max}° / {day.temp_min}°
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {day.description}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.5rem', fontWeight: 600 }}>
                    💧 {day.rain_prob}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
