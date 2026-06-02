import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Sprout, 
  Database, 
  Flame, 
  CloudSun, 
  ShieldAlert, 
  Droplets,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { translations } from '../utils/translations';

export default function Sidebar({ lang, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const t = translations[lang] || translations.en;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: t.dashboard, icon: LayoutDashboard },
    { path: '/chatbot', label: t.chatbot, icon: MessageSquare },
    { path: '/crop-recommend', label: t.cropRecommend, icon: Sprout },
    { path: '/fertilizer', label: t.fertilizerRecommend, icon: Flame },
    { path: '/disease', label: t.diseaseDetect, icon: ShieldAlert },
    { path: '/irrigation', label: t.irrigationGuide, icon: Droplets },
    { path: '/weather', label: t.weather, icon: CloudSun }
  ];

  if (user && user.role === 'admin') {
    navItems.push({ path: '/admin', label: t.adminPanel, icon: Database });
  }

  const sidebarStyles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--text-light)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      transition: 'var(--transition-smooth)',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)'
    },
    header: {
      padding: '2rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    title: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #4ade80, #34d399)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    menu: {
      flex: 1,
      padding: '1.5rem 1rem',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.85rem 1rem',
      borderRadius: 'var(--radius-sm)',
      color: 'rgba(255, 255, 255, 0.7)',
      textDecoration: 'none',
      transition: 'var(--transition-smooth)',
      fontSize: '0.95rem'
    },
    linkActive: {
      backgroundColor: 'var(--primary)',
      color: 'var(--text-light)',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    },
    footer: {
      padding: '1.5rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)'
    },
    logoutBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.85rem 1rem',
      borderRadius: 'var(--radius-sm)',
      background: 'rgba(239, 68, 68, 0.1)',
      border: 'none',
      color: '#f87171',
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'var(--transition-smooth)'
    },
    toggleButton: {
      position: 'fixed',
      top: '1rem',
      left: '1rem',
      zIndex: 200,
      width: '40px',
      height: '40px',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--text-light)',
      border: 'none',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
  };

  return (
    <>
      <button 
        style={{
          ...sidebarStyles.toggleButton,
          display: window.innerWidth <= 992 ? 'flex' : 'none'
        }}
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div 
        style={{
          ...sidebarStyles.container,
          transform: window.innerWidth <= 992 && !isOpen ? 'translateX(-260px)' : 'translateX(0)'
        }}
      >
        <div style={sidebarStyles.header}>
          <div style={sidebarStyles.title}>
            <Sprout size={28} color="#4ade80" />
            <span>{t.appName}</span>
          </div>
        </div>

        <nav style={sidebarStyles.menu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                style={({ isActive }) => ({
                  ...sidebarStyles.link,
                  ...(isActive ? sidebarStyles.linkActive : {})
                })}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={sidebarStyles.footer}>
          <button style={sidebarStyles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>
    </>
  );
}
