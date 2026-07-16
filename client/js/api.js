// API Configuration
const API_BASE = 'http://localhost:3001/api';

// Get stored token
function getToken() {
  return localStorage.getItem('token');
}

// Generic fetch wrapper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// Auth API
const authAPI = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password, role) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  getProfile: () => apiRequest('/users/me'),

  updateProfile: (data) =>
    apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Courses API
const coursesAPI = {
  getAll: () => apiRequest('/courses'),

  getById: (id) => apiRequest(`/courses/${id}`),

  create: (data) =>
    apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/courses/${id}`, {
      method: 'DELETE',
    }),
};

// Users API
const usersAPI = {
  getAll: () => apiRequest('/users'),

  updateRole: (id, role) =>
    apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  delete: (id) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Settings API
const settingsAPI = {
  get: () => apiRequest('/settings'),

  update: (data) =>
    apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
