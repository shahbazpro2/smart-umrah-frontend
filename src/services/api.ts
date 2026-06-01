import axios, { AxiosError } from 'axios';
import { cacheGet, cacheSet, queueAdd } from './offline-storage.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.100:3000';

console.log('[API] Connecting to:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 6000,  // fail fast so the cache fallback kicks in quickly
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// ─── Request interceptor ──────────────────────────────────────────────────────
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

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} ${response.config.url}`);

    // Cache every successful GET response keyed by URL
    if (response.config.method?.toLowerCase() === 'get' && response.config.url) {
      cacheSet(response.config.url, response.data).catch(() => {});
    }

    return response;
  },
  async (error: AxiosError) => {
    const isNetworkError =
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ECONNREFUSED' ||
      !error.response;

    const method = error.config?.method?.toLowerCase();
    const url = error.config?.url ?? '';

    // ── Offline GET: serve from local cache ──────────────────────────────────
    if (isNetworkError && method === 'get' && url) {
      const cached = await cacheGet(url);
      if (cached !== null) {
        console.log(`[API] Offline — serving cached response for ${url}`);
        // Return a fake AxiosResponse so callers work unchanged
        return {
          data: cached,
          status: 200,
          statusText: 'OK (cached)',
          headers: {},
          config: error.config!,
          request: error.request,
          __fromCache: true,
        };
      }
    }

    // ── Offline POST /progress: queue for later sync ─────────────────────────
    if (isNetworkError && method === 'post' && url.includes('/progress')) {
      const ritualId = (error.config as any)?.data
        ? JSON.parse((error.config as any).data)?.ritualId
        : null;
      if (ritualId) {
        await queueAdd(ritualId);
        console.log(`[API] Offline — queued progress for ritual ${ritualId}`);
        // Return a fake success so the UI can optimistically update
        return {
          data: { ritualId, isCompleted: true, queued: true },
          status: 200,
          statusText: 'OK (queued)',
          headers: {},
          config: error.config!,
          request: error.request,
          __queued: true,
        };
      }
    }

    // ── Online errors: map to human-readable messages ────────────────────────
    const message = error.message || 'Unknown error';
    const status = error.response?.status;
    const data = error.response?.data as any;

    let errorMessage = message;

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - Check if backend is running';
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = `Network error - Cannot reach ${API_URL}`;
    } else if (status === 0) {
      errorMessage = `Cannot connect to API. Check:\n1. Backend is running on ${API_URL}\n2. API has CORS enabled\n3. Network connection is active`;
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
      data,
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
