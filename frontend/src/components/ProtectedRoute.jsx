import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (adminOnly && user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
