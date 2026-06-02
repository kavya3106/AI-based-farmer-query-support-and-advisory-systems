import React from 'react';
import { Sun, Moon, Globe, User as UserIcon } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Navbar({ lang, setLang, theme, setTheme, user }) {
  const t = translations[lang] || translations.en;

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const navStyles = {
    header: {
      height: '70px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 90
    },
    titleSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'var(--text-main)',
      fontSize: '1.1rem',
      fontWeight: 500
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem'
    },
    controlBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem',
      borderRadius: '50%',
      transition: 'var(--transition-fast)'
    },
    controlBtnHover: {
      color: 'var(--text-main)',
      backgroundColor: 'var(--border-color)'
    },
    langSelect: {
      fontFamily: 'var(--font-family)',
      fontSize: '0.9rem',
      padding: '0.4rem 0.8rem',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-color)',
      backgroundColor: 'transparent',
      color: 'var(--text-main)',
      cursor: 'pointer',
      outline: 'none'
    },
    profileBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.4rem 1rem',
      borderRadius: 'var(--radius-full)',
      backgroundColor: 'var(--border-color)',
      color: 'var(--text-main)',
      fontSize: '0.9rem',
      fontWeight: 500
    },
    roleBadge: {
      fontSize: '0.75rem',
      fontWeight: 'bold',
      padding: '0.15rem 0.5rem',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: 'var(--primary)',
      color: 'white'
    }
  };

  return (
    <header style={navStyles.header}>
      <div style={navStyles.titleSection}>
        {user && (
          <span>
            {t.welcomeBack} <strong>{user.name}</strong>
          </span>
        )}
      </div>

      <div style={navStyles.controls}>
        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={18} style={{ color: 'var(--text-muted)' }} />
          <select 
            style={navStyles.langSelect}
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="en">{t.english}</option>
            <option value="ta">{t.tamil}</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <button 
          style={navStyles.controlBtn} 
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* User Card */}
        {user && (
          <div style={navStyles.profileBadge}>
            <UserIcon size={16} />
            <span>{user.name}</span>
            <span style={navStyles.roleBadge}>
              {user.role === 'admin' ? t.admin : t.farmer}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
