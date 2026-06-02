import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatbotPage from './pages/ChatbotPage';
import CropRecommend from './pages/CropRecommend';
import FertilizerRecommend from './pages/FertilizerRecommend';
import DiseaseDetect from './pages/DiseaseDetect';
import IrrigationGuide from './pages/IrrigationGuide';
import WeatherPage from './pages/WeatherPage';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // If the user isn't logged in, they only see Login / Register
  const token = localStorage.getItem('token');
  const hasAuth = !!token && !!user;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!hasAuth ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/register" 
          element={!hasAuth ? <Register /> : <Navigate to="/" replace />} 
        />

        {/* Protected App Shell Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar lang={lang} user={user} />
                <div className="main-content">
                  <Navbar 
                    lang={lang} 
                    setLang={setLang} 
                    theme={theme} 
                    setTheme={setTheme} 
                    user={user} 
                  />
                  <Routes>
                    <Route path="/" element={<Dashboard lang={lang} />} />
                    <Route path="/chatbot" element={<ChatbotPage lang={lang} />} />
                    <Route path="/crop-recommend" element={<CropRecommend lang={lang} />} />
                    <Route path="/fertilizer" element={<FertilizerRecommend lang={lang} />} />
                    <Route path="/disease" element={<DiseaseDetect lang={lang} />} />
                    <Route path="/irrigation" element={<IrrigationGuide lang={lang} />} />
                    <Route path="/weather" element={<WeatherPage lang={lang} />} />
                    
                    {/* Admin Only Route */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminPanel lang={lang} />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Fallback to Dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
