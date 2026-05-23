import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to automatically append simple x-user-id header from localStorage
api.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('learnkins_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user._id) {
          config.headers['x-user-id'] = user._id;
        }
      } catch (err) {
        console.error('Axios interceptor localStorage error:', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
