import axios, { AxiosError } from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.100:3000';

console.log('[API] Connecting to:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    const message = error.message || 'Unknown error';
    const status = error.response?.status;
    const data = error.response?.data as any;

    let errorMessage = message;

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - Check if backend is running';
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = `Network error - Cannot reach ${API_URL}`;
    } else if (status === 0) {
      errorMessage = `Cannot connect to API. Check:
1. Backend is running on ${API_URL}
2. API has CORS enabled
3. Network connection is active`;
    } else if (status === 404) {
      errorMessage = `Endpoint not found: ${error.config?.url}`;
    } else if (status === 500) {
      errorMessage = 'Server error - Check backend logs';
    } else if (data?.error) {
      errorMessage = data.error;
    }

    console.error(`[API Error] ${status || 'NETWORK'} - ${errorMessage}`, {
      url: error.config?.url,
      method: error.config?.method,
      data: data,
      message: error.message,
    });

    return Promise.reject({
      message: errorMessage,
      status,
      data,
      originalError: error,
    });
  }
);

export default api;
