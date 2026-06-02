import React, { useState } from 'react';
import { api } from '../utils/api';
import { translations } from '../utils/translations';
import { Flame, Activity, ListChecks, HelpCircle } from 'lucide-react';

export default function FertilizerRecommend({ lang }) {
  const t = translations[lang] || translations.en;

  const [crop, setCrop] = useState('rice');
  const [n, setN] = useState(80);
  const [p, setP] = useState(40);
  const [k, setK] = useState(40);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const cropsList = [
    { value: 'rice', label: lang === 'ta' ? 'நெல் (Rice)' : 'Rice' },
    { value: 'wheat', label: lang === 'ta' ? 'கோதுமை (Wheat)' : 'Wheat' },
    { value: 'maize', label: lang === 'ta' ? 'சோளம் (Maize)' : 'Maize' },
    { value: 'cotton', label: lang === 'ta' ? 'பருத்தி (Cotton)' : 'Cotton' },
    { value: 'sugarcane', label: lang === 'ta' ? 'கரும்பு (Sugarcane)' : 'Sugarcane' },
    { value: 'groundnut', label: lang === 'ta' ? 'நிலக்கடலை (Groundnut)' : 'Groundnut' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.getFertilizerAdvisory({ crop, n, p, k });
      setResult(res);
    } catch (err) {
      console.error(err);
      setError(lang === 'ta' ? 'உர ஆலோசனையைப் பெறுவதில் பிழை ஏற்பட்டது.' : 'Failed to retrieve fertilizer advisory. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>{t.fertilizerRecommend}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.fertTitle}</p>
      </div>

      <div className="grid-2">
        {/* Input Card */}
        <div className="glass-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t.cropSelect}</label>
              <select
                className="form-input"
                style={{ cursor: 'pointer', outline: 'none' }}
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              >
                {cropsList.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              {t.currentNPK}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t.nitrogen}</label>
                <input
                  type="number"
                  className="form-input"
                  value={n}
                  onChange={(e) => setN(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.phosphorus}</label>
                <input
                  type="number"
                  className="form-input"
                  value={p}
                  onChange={(e) => setP(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.potassium}</label>
                <input
                  type="number"
                  className="form-input"
                  value={k}
                  onChange={(e) => setK(parseInt(e.target.value) || 0)}
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
              {loading ? <span className="spinner"></span> : t.submit}
            </button>
          </form>
        </div>

        {/* Advisory Output */}
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
              <Flame size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Select your crop, input soil NPK tests, and submit to check fertilizer and soil amendment quantities.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
              <span className="spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px' }}></span>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Calculating nutrients dosage ratios...</p>
            </div>
          )}

          {result && (
            <div className="glass-card" style={{ borderLeft: '6px solid var(--secondary)', animation: 'slideIn 0.4s ease' }}>
              <span className="badge badge-warning" style={{ marginBottom: '1rem', color: 'white', background: 'var(--secondary)' }}>Advisory Output</span>
              
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                {t.advice}
              </h2>

              {/* Ratios Comparison Table */}
              <div style={{ padding: '1rem', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>NPK Deficiency Analysis</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)' }}>Nitrogen (N)</span>
                    <strong>{result.deficiencies?.n > 0 ? `Deficit: ${result.deficiencies.n}` : 'Adequate'}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)' }}>Phosphorus (P)</span>
                    <strong>{result.deficiencies?.p > 0 ? `Deficit: ${result.deficiencies.p}` : 'Adequate'}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)' }}>Potassium (K)</span>
                    <strong>{result.deficiencies?.k > 0 ? `Deficit: ${result.deficiencies.k}` : 'Adequate'}</strong>
                  </div>
                </div>
              </div>

              {/* Fertilizer Quantities */}
              <div className="grid-3" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.urea}</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--primary-light)' }}>{result.fertilizer_advice?.urea} <span style={{ fontSize: '0.85rem' }}>kg/acre</span></strong>
                </div>
                
                <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.dap}</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--primary-light)' }}>{result.fertilizer_advice?.dap} <span style={{ fontSize: '0.85rem' }}>kg/acre</span></strong>
                </div>

                <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.mop}</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--primary-light)' }}>{result.fertilizer_advice?.mop} <span style={{ fontSize: '0.85rem' }}>kg/acre</span></strong>
                </div>
              </div>

              {/* Application Timeline */}
              {result.fertilizer_advice?.schedule && (
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ListChecks size={18} /> Application Schedule
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {Object.entries(result.fertilizer_advice.schedule).map(([stage, description]) => (
                      <div key={stage} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem' }}>
                        <strong style={{ textTransform: 'capitalize', color: 'var(--text-main)', display: 'block' }}>{stage.replace('_', ' ')}:</strong>
                        <span>{description}</span>
                      </div>
                    ))}
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
