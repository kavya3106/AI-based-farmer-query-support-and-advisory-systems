import React, { useState } from 'react';
import { api } from '../utils/api';
import { translations } from '../utils/translations';
import { Sprout, DollarSign, Calendar, Flame, CloudRain } from 'lucide-react';

export default function CropRecommend({ lang }) {
  const t = translations[lang] || translations.en;
  
  const [formData, setFormData] = useState({
    n: 80,
    p: 40,
    k: 40,
    ph: 6.5,
    temp: 28,
    humidity: 70,
    rainfall: 100
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.getCropRecommendation(formData);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError(lang === 'ta' ? 'பரிந்துரையைப் பெறுவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.' : 'Failed to retrieve recommendation. Please check your inputs and make sure backend is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>{t.cropRecommend}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.cropTitle}</p>
      </div>

      <div className="grid-2">
        {/* Form Card */}
        <div className="glass-card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t.nitrogen}</label>
                <input
                  type="number"
                  name="n"
                  className="form-input"
                  value={formData.n}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.phosphorus}</label>
                <input
                  type="number"
                  name="p"
                  className="form-input"
                  value={formData.p}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.potassium}</label>
                <input
                  type="number"
                  name="k"
                  className="form-input"
                  value={formData.k}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">{t.ph}</label>
                <input
                  type="number"
                  name="ph"
                  step="0.1"
                  min="0"
                  max="14"
                  className="form-input"
                  value={formData.ph}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.temp}</label>
                <input
                  type="number"
                  name="temp"
                  className="form-input"
                  value={formData.temp}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">{t.humidity}</label>
                <input
                  type="number"
                  name="humidity"
                  className="form-input"
                  value={formData.humidity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.rainfall}</label>
                <input
                  type="number"
                  name="rainfall"
                  className="form-input"
                  value={formData.rainfall}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : t.getRecommendation}
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
              <Sprout size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Enter soil parameters and click analyze to see recommended crops and agricultural strategies.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
              <span className="spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px' }}></span>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Evaluating agricultural models...</p>
            </div>
          )}

          {result && (
            <div className="glass-card" style={{ borderLeft: '6px solid var(--primary)', animation: 'slideIn 0.4s ease' }}>
              <span className="badge badge-success" style={{ marginBottom: '1rem' }}>Optimal Choice</span>
              <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                <Sprout size={32} />
                {result.recommended_crop}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                {result.reasoning}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <Calendar size={20} color="var(--primary)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Growth Duration</span>
                    <strong style={{ fontSize: '0.9rem' }}>{result.details?.duration || '120 days'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <DollarSign size={20} color="var(--secondary)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Est. Market Price</span>
                    <strong style={{ fontSize: '0.9rem' }}>{result.details?.market_value || '₹45,000 / ton'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <Flame size={20} color="#f97316" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Best Sowing Season</span>
                    <strong style={{ fontSize: '0.9rem' }}>{result.details?.season || 'Kharif (Monsoon)'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <CloudRain size={20} color="#3b82f6" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Water Requirement</span>
                    <strong style={{ fontSize: '0.9rem' }}>{result.details?.water_need || 'Medium (500-1000mm)'}</strong>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {result.details?.tips && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Cultivation Recommendations</h4>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {result.details.tips.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
