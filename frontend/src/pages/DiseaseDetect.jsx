import React, { useState } from 'react';
import { api } from '../utils/api';
import { translations } from '../utils/translations';
import { Upload, ShieldCheck, ShieldAlert, Sparkles, Sprout } from 'lucide-react';

export default function DiseaseDetect({ lang }) {
  const t = translations[lang] || translations.en;

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('biological');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const res = await api.detectPlantDisease(formData);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError(lang === 'ta' ? 'நோய் கண்டறிவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.' : 'Failed to analyze image. Please ensure the backend server is running and pip dependencies are set up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>{t.diseaseDetect}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.diseaseTitle}</p>
      </div>

      <div className="grid-2">
        {/* Upload Column */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.02)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)'
            }}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input 
              id="file-upload-input" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <img 
                  src={imagePreview} 
                  alt="Leaf preview" 
                  style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} 
                />
                {loading && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '4px',
                    background: 'linear-gradient(to right, transparent, var(--primary-light), transparent)',
                    animation: 'pulse 1.5s infinite'
                  }} />
                )}
              </div>
            ) : (
              <div>
                <Upload size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.7 }} />
                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{t.dropHere}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports JPG, JPEG, PNG formats</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading || !imageFile}
          >
            {loading ? <span className="spinner"></span> : t.detectBtn}
          </button>
        </div>

        {/* Results Column */}
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
              <p>Upload a clear photograph of the affected plant leaf. Our AI model will diagnose spots, rust, blight, or pests.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', textAlign: 'center' }}>
              <span className="spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px', marginBottom: '1rem' }}></span>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Diagnosing Image...</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scanning color distribution profiles and leaf textures</p>
            </div>
          )}

          {result && (
            <div className="glass-card" style={{ borderLeft: result.disease === 'Healthy' ? '6px solid #22c55e' : '6px solid #ef4444', animation: 'slideIn 0.4s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className={`badge ${result.disease === 'Healthy' ? 'badge-success' : 'badge-danger'}`}>
                  {result.disease === 'Healthy' ? 'Healthy Leaf' : 'Infection Detected'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {t.confidence}: <strong>{Math.round(result.confidence * 100)}%</strong>
                </span>
              </div>

              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {result.disease === 'Healthy' ? <ShieldCheck size={28} color="#22c55e" /> : <ShieldAlert size={28} color="#ef4444" />}
                {result.disease}
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                <strong>{t.symptoms}:</strong> {result.symptoms}
              </p>

              {/* Treatment Tabs */}
              {result.disease !== 'Healthy' && (
                <div>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <button
                      onClick={() => setActiveTab('biological')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: activeTab === 'biological' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'biological' ? '2px solid var(--primary)' : 'none',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      🌱 {t.biologicalRemedy}
                    </button>
                    <button
                      onClick={() => setActiveTab('chemical')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: activeTab === 'chemical' ? '#ef4444' : 'var(--text-muted)',
                        borderBottom: activeTab === 'chemical' ? '2px solid #ef4444' : 'none',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      🧪 {t.chemicalRemedy}
                    </button>
                  </div>

                  <div style={{ background: 'var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                    {activeTab === 'biological' ? (
                      <div>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Sparkles size={14} /> Organic Treatment
                        </h4>
                        <p>{result.remedy_biological}</p>
                      </div>
                    ) : (
                      <div>
                        <h4 style={{ color: '#ef4444', marginBottom: '0.25rem' }}>Chemical Spray Guidelines</h4>
                        <p>{result.remedy_chemical}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.disease === 'Healthy' && (
                <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px dashed #22c55e', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  🎉 <strong>Excellent:</strong> Your leaf appears healthy and free of primary pathogenetic activity. Keep up standard watering schedules and soil fertilization practices!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
