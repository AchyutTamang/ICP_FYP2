import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    // Try to get token from multiple possible storage keys
    const token = localStorage.getItem('access') || 
                 localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding auth header with token');
    } else {
      console.warn('No token found for request');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;