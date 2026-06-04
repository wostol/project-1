// src/auth/apiClient.js
import authService from '../authService';

const BASE_URL = 'https://songeng.voold.online/api';
let isRefreshing = false;
let refreshPromise = null;
let requestQueue = [];
let lastRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 3000;

const onTokenRefreshed = () => {
  console.log(`[apiClient] Token refreshed, resolving ${requestQueue.length} queued requests`);
  requestQueue.forEach(({ resolve }) => resolve());
  requestQueue = [];
  refreshPromise = null;
};

const addToQueue = () => new Promise(resolve => requestQueue.push({ resolve }));

// 🔥 ИСПРАВЛЕНИЕ: Не вызываем store.logout() здесь, только событие
const doLogout = () => {
  console.warn('[apiClient] Session expired. Logging out...');
  requestQueue.forEach(({ reject }) => reject?.(new Error('Session expired')));
  requestQueue = [];
  refreshPromise = null;
  
  // Отправляем событие, но не вызываем store напрямую
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-logout'));
  }
};

export async function checkAuthAndRefresh() {
  try {
    console.log('[apiClient] Checking auth status...');

    const response = await fetch(`${BASE_URL}/users`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      console.log('[apiClient] Auth check passed, token is valid');
      const users = await response.json();
      // Не обновляем store здесь, чтобы избежать циклов
      return true;
    }

    if (response.status === 401) {
      console.log('[apiClient] Token expired (401), attempting refresh...');

      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN_MS) {
        console.warn('[apiClient] Refresh cooldown active.');
        throw new Error('Auth cooldown active');
      }

      lastRefreshTime = now;
      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!refreshRes.ok) {
          console.error('[apiClient] Refresh failed:', refreshRes.status);
          throw new Error('Refresh failed');
        }

        console.log('[apiClient] Token refreshed successfully');
        return true;
      } catch (refreshError) {
        console.error('[apiClient] Refresh failed, logging out', refreshError);
        doLogout();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    throw new Error(`Auth check failed: ${response.status}`);

  } catch (error) {
    console.error('[apiClient] Auth check failed with error:', error);
    if (error.message !== 'Refresh failed' && error.message !== 'Auth cooldown active') {
      doLogout();
    }
    throw error;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const config = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };

  let response = await fetch(url, config);

  if (response.status === 401 && !config._retry) {
    config._retry = true;

    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN_MS) {
      console.warn('[apiClient] Refresh cooldown active. Ignoring 401.');
      throw new Error('Auth cooldown active. Try again later.');
    }

    if (isRefreshing || refreshPromise) {
      console.log('[apiClient] Refresh in progress, queuing request...');
      await addToQueue();
      response = await fetch(url, config);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }

    lastRefreshTime = now;
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        console.log('[apiClient] Starting token refresh...');
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!refreshRes.ok) {
          console.error('[apiClient] Refresh failed:', refreshRes.status);
          throw new Error('Refresh failed');
        }

        console.log('[apiClient] Token refreshed successfully');
        onTokenRefreshed();
      } catch (err) {
        console.error('[apiClient] Refresh failed, logging out', err);
        doLogout();
        throw err;
      } finally {
        isRefreshing = false;
      }
    })();

    try {
      await refreshPromise;
    } catch (err) {
      throw err;
    }

    console.log('[apiClient] Retrying original request after refresh...');
    response = await fetch(url, config);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}`);
  }

  return response.json();
}