import React, { useState } from 'react';
import { api } from '../utils/api';
import { translations } from '../utils/translations';
import { Droplets, Clock, CloudRain, AlertCircle } from 'lucide-react';

export default function IrrigationGuide({ lang }) {
  const t = translations[lang] || translations.en;

  const [crop, setCrop] = useState('rice');
  const [soilType, setSoilType] = useState('loamy');
  const [growthStage, setGrowthStage] = useState('vegetative');
  const [moisture, setMoisture] = useState(30);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const cropsList = [
    { value: 'rice', label: lang === 'ta' ? 'நெல் (Rice)' : 'Rice' },
    { value: 'wheat', label: lang === 'ta' ? 'கோதுமை (Wheat)' : 'Wheat' },
    { value: 'maize', label: lang === 'ta' ? 'சோளம் (Maize)' : 'Maize' },
    { value: 'cotton', label: lang === 'ta' ? 'பருத்தி (Cotton)' : 'Cotton' },
    { value: 'tomato', label: lang === 'ta' ? 'தக்காளி (Tomato)' : 'Tomato' },
    { value: 'chili', label: lang === 'ta' ? 'மிளகாய் (Chili)' : 'Chili' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.getIrrigationAdvice({ crop, soil_type: soilType, growth_stage: growthStage, moisture });
      setResult(res);
    } catch (err) {
      console.error(err);
      setError(lang === 'ta' ? 'நீர்ப்பாசன ஆலோசனையைப் பெறுவதில் பிழை ஏற்பட்டது.' : 'Failed to retrieve irrigation advice. Make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>{t.irrigationGuide}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.irrTitle}</p>
      </div>

      <div className="grid-2">
        {/* Input Form Card */}
        <div className="glass-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t.cropSelect}</label>
              <select 
                className="form-input" 
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {cropsList.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">{t.soilType}</label>
                <select 
                  className="form-input"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <option value="clayey">{t.clay}</option>
                  <option value="loamy">{t.loamy}</option>
                  <option value="sandy">{t.sandy}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.growthStage}</label>
                <select 
                  className="form-input"
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <option value="seedling">{t.seedling}</option>
                  <option value="vegetative">{t.vegetative}</option>
                  <option value="flowering">{t.flowering}</option>
                  <option value="fruiting">{t.fruiting}</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">{t.moisture}</label>
              <input 
                type="number" 
                className="form-input"
                min="0"
                max="100"
                value={moisture}
                onChange={(e) => setMoisture(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : t.submit}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div>
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          {!result && !error && !loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Droplets size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Input soil types, crop seedling status, and moisture sensor data to build an irrigation guidance model.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
              <span className="spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px' }}></span>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Compiling irrigation timings...</p>
            </div>
          )}

          {result && (
            <div className="glass-card" style={{ borderLeft: '6px solid var(--primary-light)', animation: 'slideIn 0.4s ease' }}>
              <span className="badge badge-success" style={{ marginBottom: '1rem', background: 'var(--primary-light)', color: 'white' }}>Schedule Output</span>
              
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplets size={24} color="var(--primary-light)" />
                {t.irrResult}
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {result.advice}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <CloudRain size={20} color="var(--primary-light)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.waterQty}</span>
                    <strong style={{ fontSize: '1.1rem' }}>{result.water_volume} L</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <Clock size={20} color="var(--secondary)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.freq}</span>
                    <strong style={{ fontSize: '1.1rem' }}>{result.watering_schedule}</strong>
                  </div>
                </div>
              </div>

              {result.soil_status && (
                <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.15rem' }}>Soil Status: {result.soil_status}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>Water percolation properties are optimized for {soilType} soil at this stage. Avoid over-watering to prevent root rot.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
