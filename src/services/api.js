import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(error);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - API server may be down');
      return Promise.reject(error);
    }
    
    // Handle 401 with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) =>
    apiClient.post('/auth/token/', { username, password }),
  refreshToken: (refresh) => 
    apiClient.post('/auth/token/refresh/', { refresh }),
  getCurrentUser: () => apiClient.get('/auth/user/'),
};

export const devicesAPI = {
  getAll: (params) => apiClient.get('/devices/', { params }),
  getById: (id) => apiClient.get(`/devices/${id}/`),
  create: (data) => apiClient.post('/devices/', data),
  update: (id, data) => apiClient.put(`/devices/${id}/`, data),
  delete: (id) => apiClient.delete(`/devices/${id}/`),
  getCurrentLocation: (id) => apiClient.get(`/devices/${id}/current_location/`),
  getHistory: (id, hours = 24) =>
    apiClient.get(`/devices/${id}/history/?hours=${hours}`),
};

export const unitsAPI = {
  getAll: (params) => apiClient.get('/units/', { params }),
  getById: (id) => apiClient.get(`/units/${id}/`),
  create: (data) => apiClient.post('/units/', data),
  update: (id, data) => apiClient.put(`/units/${id}/`, data),
  delete: (id) => apiClient.delete(`/units/${id}/`),
  getDevices: (id) => apiClient.get(`/units/${id}/devices/`),
  getActiveDevices: (id) => apiClient.get(`/units/${id}/active_devices/`),
  getLocations: (id) => apiClient.get(`/units/${id}/locations/`),
};

export const trackingAPI = {
  sendLocation: (data) => apiClient.post('/tracking/locations/', data),
  getHistory: (params) => apiClient.get('/tracking/locations/history/', { params }),
  getAll: (params) => apiClient.get('/tracking/locations/', { params }),
};

export const missionsAPI = {
  getAll: (params) => apiClient.get('/missions/', { params }),
  getById: (id) => apiClient.get(`/missions/${id}/`),
  create: (data) => apiClient.post('/missions/', data),
  update: (id, data) => apiClient.put(`/missions/${id}/`, data),
  delete: (id) => apiClient.delete(`/missions/${id}/`),
  track: (id) => apiClient.get(`/missions/${id}/track/`),
};

export const alertsAPI = {
  getAll: (params) => apiClient.get('/alerts/', { params }),
  getById: (id) => apiClient.get(`/alerts/${id}/`),
  acknowledge: (id) => apiClient.post(`/alerts/${id}/acknowledge/`),
  getUnacknowledged: () => apiClient.get('/alerts/unacknowledged/'),
  getCritical: () => apiClient.get('/alerts/critical/'),
};

export const geofencesAPI = {
  getAll: (params) => apiClient.get('/geofences/', { params }),
  getById: (id) => apiClient.get(`/geofences/${id}/`),
  create: (data) => apiClient.post('/geofences/', data),
  update: (id, data) => apiClient.put(`/geofences/${id}/`, data),
  delete: (id) => apiClient.delete(`/geofences/${id}/`),
  toggleActive: (id) => apiClient.post(`/geofences/${id}/toggle_active/`),
  addDevices: (id, deviceIds) => 
    apiClient.post(`/geofences/${id}/add_devices/`, { device_ids: deviceIds }),
  removeDevices: (id, deviceIds) => 
    apiClient.post(`/geofences/${id}/remove_devices/`, { device_ids: deviceIds }),
  checkDevice: (id, deviceId) => 
    apiClient.get(`/geofences/${id}/check_device/?device_id=${deviceId}`),
};

export default apiClient;