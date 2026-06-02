import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Sprout } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.register(name, email, password, role);
      // Auto login after registration
      const response = await api.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/');
      window.location.reload(); // Refresh to update layouts
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const registerStyles = {
    wrapper: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a2012 0%, #153e25 50%, #06100a 100%)',
      padding: '1rem'
    },
    card: {
      width: '100%',
      maxWidth: '420px',
      background: 'rgba(20, 35, 27, 0.65)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 'var(--radius-lg)',
      padding: '2.5rem 2rem',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      color: 'var(--text-light)'
    },
    logoSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    logoText: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginTop: '0.5rem',
      background: 'linear-gradient(to right, #4ade80, #34d399)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    errorAlert: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      padding: '0.75rem',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.9rem',
      marginBottom: '1rem'
    },
    linkText: {
      display: 'block',
      textAlign: 'center',
      marginTop: '1.5rem',
      fontSize: '0.9rem',
      color: '#a7f3d0',
      textDecoration: 'none'
    },
    select: {
      fontFamily: 'var(--font-family)',
      fontSize: '0.95rem',
      padding: '0.75rem 1rem',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid rgba(255,255,255,0.1)',
      backgroundColor: 'rgba(20, 35, 27, 0.95)',
      color: 'white',
      outline: 'none',
      cursor: 'pointer'
    }
  };

  return (
    <div style={registerStyles.wrapper}>
      <div style={registerStyles.card}>
        <div style={registerStyles.logoSection}>
          <Sprout size={48} color="#4ade80" />
          <h2 style={registerStyles.logoText}>Create Account</h2>
        </div>

        {error && <div style={registerStyles.errorAlert}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#a7f3d0' }}>Full Name</label>
            <input
              type="text"
              className="form-input"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#a7f3d0' }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#a7f3d0' }}>Password</label>
            <input
              type="password"
              className="form-input"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#a7f3d0' }}>User Role</label>
            <select
              style={registerStyles.select}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="farmer">Farmer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.25rem' }}
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : 'Register'}
          </button>
        </form>

        <Link to="/login" style={registerStyles.linkText}>
          Already have an account? Login here
        </Link>
      </div>
    </div>
  );
}
