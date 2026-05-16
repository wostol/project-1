// src/auth/apiClient.js
import authService from '../authService';
import useAuthStore from './authStore';

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
  // Вызываем logout из store, чтобы очистить состояние Zustand
  const store = useAuthStore.getState();
  store.logout();
};

/**
 * Proactive проверка токена при загрузке страницы
 * Сценарий А: Токен жив -> возвращает true
 * Сценарий Б: Токен умер, но refresh token жив -> делает refresh, возвращает true
 * Сценарий В: Оба токена мертвы / Ошибка сети -> вызывает doLogout(), бросает ошибку
 */
export async function checkAuthAndRefresh() {
  try {
    console.log('[apiClient] Checking auth status...');

    // Пробуем сделать запрос к защищённому эндпоинту для проверки статуса
    // Используем /users (список пользователей) - доступен только авторизованным
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    // Сценарий А: Токен жив (получили успешный ответ)
    if (response.ok) {
      console.log('[apiClient] Auth check passed, token is valid');
      const users = await response.json();
      // Находим текущего пользователя в списке (опционально)
      // Обновляем данные пользователя в store, если сервер вернул данные
      const store = useAuthStore.getState();
      const currentUser = store.user;

      // Если у нас есть пользователь в сторе, пытаемся найти его в списке
      if (currentUser && Array.isArray(users)) {
        const foundUser = users.find(u => u.id === currentUser.id || u.email === currentUser.email);
        if (foundUser) {
          store.updateUser(foundUser);
        }
      } else if (Array.isArray(users) && users.length > 0) {
        // Если пользователя нет в сторе, но мы авторизованы, берём первого (или можно выбрать логику)
        // В большинстве случаев пользователь уже должен быть в сторе
        console.log('[apiClient] Users list retrieved, but no current user in store to match');
      }
      return true;
    }

    // Сценарий Б или В: Токен умер (401), пробуем refresh
    if (response.status === 401) {
      console.log('[apiClient] Token expired (401), attempting refresh...');

      // Защита от частого refresh (спам-фильтр)
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
          // Сценарий В: Refresh token тоже умер
          console.error('[apiClient] Refresh failed:', refreshRes.status);
          throw new Error('Refresh failed');
        }

        console.log('[apiClient] Token refreshed successfully');

        // После успешного refresh снова проверяем статус пользователя
        const usersResponse = await fetch(`${BASE_URL}/users`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (usersResponse.ok) {
          const users = await usersResponse.json();
          const store = useAuthStore.getState();
          const currentUser = store.user;

          if (currentUser && Array.isArray(users)) {
            const foundUser = users.find(u => u.id === currentUser.id || u.email === currentUser.email);
            if (foundUser) {
              store.updateUser(foundUser);
            }
          }
        }

        return true;
      } catch (refreshError) {
        // Сценарий В: Ошибка refresh (оба токена мертвы или ошибка сети)
        console.error('[apiClient] Refresh failed, logging out', refreshError);
        doLogout();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    // Другие ошибки (не 401)
    throw new Error(`Auth check failed: ${response.status}`);

  } catch (error) {
    // Сценарий В: Ошибка сети или другая критическая ошибка
    console.error('[apiClient] Auth check failed with error:', error);
    // Только если это не была уже обработанная ошибка refresh
    if (error.message !== 'Refresh failed' && error.message !== 'Auth cooldown active') {
      doLogout();
    }
    throw error;
  }
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