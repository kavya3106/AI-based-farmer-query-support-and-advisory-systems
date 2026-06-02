const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(name, email, password, role) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getProfile() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },

  // Advisory Modules
  async getCropRecommendation(params) {
    const res = await fetch(`${BASE_URL}/recommend/crop`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get crop recommendations');
    return data;
  },

  async getFertilizerAdvisory(params) {
    const res = await fetch(`${BASE_URL}/recommend/fertilizer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get fertilizer advisory');
    return data;
  },

  async detectPlantDisease(formData) {
    const res = await fetch(`${BASE_URL}/disease/detect`, {
      method: 'POST',
      headers: getHeaders(true), // Content-Type is set automatically by the browser for FormData
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to analyze plant disease');
    return data;
  },

  async getIrrigationAdvice(params) {
    const res = await fetch(`${BASE_URL}/recommend/irrigation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get irrigation advice');
    return data;
  },

  async getChatResponse(message, history, language) {
    const res = await fetch(`${BASE_URL}/chatbot`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history, language })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Chatbot error');
    return data;
  },

  async getWeather(lat = 13.0827, lon = 80.2707) { // Default Chennai lat/lon
    const res = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch weather');
    return data;
  },

  // History & Tracking
  async getUserHistory() {
    const res = await fetch(`${BASE_URL}/history`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get user history');
    return data;
  },

  // Admin Features
  async getUsers() {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
    return data;
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ userId, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update user role');
    return data;
  }
};
