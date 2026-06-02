import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { translations } from '../utils/translations';
import { 
  CloudSun, 
  Sprout, 
  Flame, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Activity,
  Droplets
} from 'lucide-react';

export default function Dashboard({ lang }) {
  const t = translations[lang] || translations.en;
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Load weather and history
        const weatherData = await api.getWeather();
        setWeather(weatherData);

        const historyData = await api.getUserHistory();
        setHistory(historyData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data. Starting backend first is recommended.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getModuleIcon = (module) => {
    switch (module) {
      case 'crop': return <Sprout size={18} color="#22c55e" />;
      case 'fertilizer': return <Flame size={18} color="#f59e0b" />;
      case 'disease': return <ShieldAlert size={18} color="#ef4444" />;
      case 'irrigation': return <Droplets size={18} color="#3b82f6" />;
      default: return <Activity size={18} color="var(--text-muted)" />;
    }
  };

  const getModuleTitle = (module) => {
    switch (module) {
      case 'crop': return t.cropRecommend;
      case 'fertilizer': return t.fertilizerRecommend;
      case 'disease': return t.diseaseDetect;
      case 'irrigation': return t.irrigationGuide;
      default: return 'Advisory';
    }
  };

  const stats = {
    total: history.length,
    crops: history.filter(h => h.module === 'crop').length,
    diseases: history.filter(h => h.module === 'disease').length,
    irrigation: history.filter(h => h.module === 'irrigation').length,
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>{t.dashboard}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t.quickOverview}</p>
        </div>
        <div className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          System Online
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--primary-glow)',
          border: '1px solid var(--primary-light)',
          color: 'var(--text-main)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          💡 <strong>Tip:</strong> {error} (Check if Flask server is running on localhost:5000)
        </div>
      )}

      {/* Grid of widgets */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Weather Widget */}
        <div className="glass-card weather-widget" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8 }}>{t.currentWeather}</span>
              <CloudSun size={24} />
            </div>
            {weather ? (
              <div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0' }}>{Math.round(weather.temp)}°C</h2>
                <p style={{ textTransform: 'capitalize', fontSize: '1rem', opacity: 0.9 }}>{weather.description}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem', opacity: 0.8 }}>
                  <span>Humidity: {weather.humidity}%</span>
                  <span>Rain: {weather.rain_prob}%</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>Loading weather...</p>
            )}
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ 
              marginTop: '1.5rem', 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.2)', 
              padding: '0.5rem 1rem',
              fontSize: '0.85rem'
            }}
            onClick={() => navigate('/weather')}
          >
            Detailed Forecast <ArrowRight size={14} />
          </button>
        </div>

        {/* Stats Summary Widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.recommendationsCount}</span>
            <h2 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary)', margin: '0.5rem 0' }}>{stats.total}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Crops:</span> <strong>{stats.crops}</strong>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Diseases:</span> <strong>{stats.diseases}</strong>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Irrigation:</span> <strong>{stats.irrigation}</strong>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 500, marginTop: '1rem' }}>
            <TrendingUp size={16} /> Continuous monitoring active
          </div>
        </div>

        {/* Disease Alerts Widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.diseaseStatus}</span>
              <ShieldAlert size={20} color="#ef4444" />
            </div>
            {history.some(h => h.module === 'disease' && h.result && h.result.disease !== 'Healthy') ? (
              <div>
                <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.95rem' }}>Attention Needed!</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Recent upload diagnosed with:
                </p>
                <div className="badge badge-danger" style={{ marginTop: '0.5rem' }}>
                  {history.find(h => h.module === 'disease' && h.result && h.result.disease !== 'Healthy').result.disease}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.healthyStatus}</p>
            )}
          </div>
          <button 
            className="btn btn-primary" 
            style={{ 
              marginTop: '1.5rem', 
              padding: '0.5rem 1rem', 
              fontSize: '0.85rem' 
            }}
            onClick={() => navigate('/disease')}
          >
            Upload Plant Leaf
          </button>
        </div>
      </div>

      {/* Recent Activity Table/List */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.2rem' }}>{t.recentActivities}</h3>
        {loading ? (
          <p>Loading activities...</p>
        ) : history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No recent recommendations. Run any advisory tool to see history here.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 0' }}>Module</th>
                  <th style={{ padding: '0.75rem 0' }}>Parameters</th>
                  <th style={{ padding: '0.75rem 0' }}>Result / Recommendations</th>
                  <th style={{ padding: '0.75rem 0' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((act, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                      {getModuleIcon(act.module)}
                      {getModuleTitle(act.module)}
                    </td>
                    <td style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {act.params ? Object.entries(act.params).map(([k, v]) => `${k.toUpperCase()}:${v}`).join(', ') : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 0', fontWeight: 600, color: 'var(--primary)' }}>
                      {act.module === 'crop' && act.result?.recommended_crop}
                      {act.module === 'fertilizer' && act.result?.fertilizer_advice && `Urea: ${act.result.fertilizer_advice.urea}kg, DAP: ${act.result.fertilizer_advice.dap}kg`}
                      {act.module === 'disease' && act.result?.disease}
                      {act.module === 'irrigation' && act.result?.watering_schedule}
                    </td>
                    <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>
                      {new Date(act.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
