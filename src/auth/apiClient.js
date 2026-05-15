// src/auth/apiClient.js
import authService from '../authService';

const BASE_URL = 'https://songeng.voold.online/api';
let isRefreshing = false;
let refreshPromise = null;
let requestQueue = [];
let lastRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 3000; // Защита от спама: не чаще 1 раза в 3 сек

// Разблокируем очередь после успешного refresh
const onTokenRefreshed = () => {
  console.log(`[apiClient] Token refreshed, resolving ${requestQueue.length} queued requests`);
  requestQueue.forEach(({ resolve }) => resolve());
  requestQueue = [];
  refreshPromise = null;
};

// Ставим запрос в очередь
const addToQueue = () => new Promise(resolve => requestQueue.push({ resolve }));

// Централизованный логаут
const doLogout = () => {
  console.warn('[apiClient] Session expired. Logging out...');
  requestQueue.forEach(({ reject }) => reject?.(new Error('Session expired')));
  requestQueue = [];
  refreshPromise = null;
  authService.logout();
};

// 🔹 Proactive проверка для HttpOnly: просто делегируем ответственность reactive-обработчику 401
// Если нужно строго проверять сессию при загрузке, замените на fetch('/auth/status') или '/users/me'
export async function checkAuthAndRefresh() {
  // Для HttpOnly cookies proactive check через JS невозможен.
  // Оставляем пустым или добавляем лёгкий запрос на /auth/check, если он есть на бэкенде.
  return true;
}

// 🔹 Основной API запрос с защитой от 401-спама и очередью
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const config = {
    credentials: 'include', // Браузер сам отправит HttpOnly cookies
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };

  let response = await fetch(url, config);

  // 🔴 Reactive fallback: обрабатываем 401 только один раз на запрос
  if (response.status === 401 && !config._retry) {
    config._retry = true;

    // Защита от частого refresh (спам-фильтр)
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN_MS) {
      console.warn('[apiClient] Refresh cooldown active. Ignoring 401.');
      throw new Error('Auth cooldown active. Try again later.');
    }

    // Если refresh уже идёт, ставим запрос в очередь
    if (isRefreshing || refreshPromise) {
      console.log('[apiClient] Refresh in progress, queuing request...');
      await addToQueue();
      
      // Повторяем запрос после обновления токена
      response = await fetch(url, config);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }

    // Запускаем refresh
    lastRefreshTime = now;
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        console.log('[apiClient] Starting token refresh...');
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Отправляем refresh_token из cookies
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

    // Повторяем исходный запрос
    console.log('[apiClient] Retrying original request after refresh...');
    response = await fetch(url, config);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}`);
  }

  return response.json();
}