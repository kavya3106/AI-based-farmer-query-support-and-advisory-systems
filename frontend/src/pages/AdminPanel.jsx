import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { translations } from '../utils/translations';
import { Shield, User, Mail, Award, Search, Check } from 'lucide-react';

export default function AdminPanel({ lang }) {
  const t = translations[lang] || translations.en;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const data = await api.getUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Failed to retrieve users. Access restricted or backend offline.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'farmer' : 'admin';
    setActionLoading(userId);
    setError('');
    setSuccess('');
    
    try {
      await api.updateUserRole(userId, newRole);
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccess("User role updated successfully!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to modify user role. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={28} color="var(--primary)" />
          {t.adminPanel}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Modify agricultural advisor parameters, adjust database nodes, and configure authorization levels.</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          color: '#22c55e',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Check size={16} />
          {success}
        </div>
      )}

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--primary-glow)', borderRadius: '50%' }}>
            <User size={24} color="var(--primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Users</span>
            <strong style={{ fontSize: '1.5rem' }}>{users.length}</strong>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%' }}>
            <Shield size={24} color="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Administrators</span>
            <strong style={{ fontSize: '1.5rem' }}>{users.filter(u => u.role === 'admin').length}</strong>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
            <Award size={24} color="#3b82f6" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Farmers</span>
            <strong style={{ fontSize: '1.5rem' }}>{users.filter(u => u.role !== 'admin').length}</strong>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card">
        {/* Search bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.85rem',
          marginBottom: '1.5rem',
          maxWidth: '320px',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-family)',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
              width: '100%'
            }}
          />
        </div>

        {loading ? (
          <p>Loading administration panel...</p>
        ) : filteredUsers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No users matching selection.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 500 }}>{usr.name}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={14} />
                        {usr.email}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span className={`badge ${usr.role === 'admin' ? 'badge-warning' : 'badge-success'}`} style={{ color: usr.role === 'admin' ? 'white' : '', background: usr.role === 'admin' ? 'var(--secondary)' : '' }}>
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        disabled={actionLoading === usr.id}
                        onClick={() => handleRoleChange(usr.id, usr.role)}
                      >
                        {actionLoading === usr.id ? 'Updating...' : `Toggle to ${usr.role === 'admin' ? 'Farmer' : 'Admin'}`}
                      </button>
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
