import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for centralized friendly error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.response.status === 409) {
        message = 'Conflict with existing data or state.';
      } else if (error.response.status === 500) {
        message = 'Internal server error. Please check backend logs.';
      }
    } else if (error.request) {
      message = 'Cannot connect to backend server. Make sure Spring Boot is running on port 8080.';
    }

    const enhancedError = new Error(message);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    return Promise.reject(enhancedError);
  }
);

export default api;
