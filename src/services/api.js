import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // FIXED: Use the correct JWT refresh endpoint
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // FIXED: Use correct JWT endpoints
  login: (username, password) =>
    apiClient.post('/auth/token/', { username, password }),
  refreshToken: (refresh) => 
    apiClient.post('/auth/token/refresh/', { refresh }),
  getCurrentUser: () => apiClient.get('/auth/user/'),
  // Remove logout for now since JWT is stateless
};

export const devicesAPI = {
  getAll: () => apiClient.get('/devices/'),
  getById: (id) => apiClient.get(`/devices/${id}/`),
  create: (data) => apiClient.post('/devices/', data),
  update: (id, data) => apiClient.put(`/devices/${id}/`, data),
  getCurrentLocation: (id) => apiClient.get(`/devices/${id}/current_location/`),
  getHistory: (id, hours = 24) =>
    apiClient.get(`/devices/${id}/history/?hours=${hours}`),
};

export const trackingAPI = {
  sendLocation: (data) => apiClient.post('/tracking/locations/', data),
  getHistory: (params) => apiClient.get('/tracking/locations/history/', { params }),
  getAll: () => apiClient.get('/tracking/locations/'),
};

export const missionsAPI = {
  getAll: () => apiClient.get('/missions/'),
  getById: (id) => apiClient.get(`/missions/${id}/`),
  create: (data) => apiClient.post('/missions/', data),
  update: (id, data) => apiClient.put(`/missions/${id}/`, data),
  track: (id) => apiClient.get(`/missions/${id}/track/`),
};

export const alertsAPI = {
  getAll: () => apiClient.get('/alerts/'),
  acknowledge: (id) => apiClient.post(`/alerts/${id}/acknowledge/`),
};

export default apiClient;