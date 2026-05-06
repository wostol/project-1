// src/auth/apiClient.js
import authService from '../authService';

const BASE_URL = 'https://songeng.voold.online/api';

let isRefreshing = false;
let subscribers = [];

// Выполняем все ожидающие запросы после успешного рефреша
const onTokenRefreshed = () => {
  subscribers.forEach(cb => cb());
  subscribers = [];
};

// Добавляем запрос в очередь
const subscribeToTokenRefresh = (cb) => subscribers.push(cb);


// Вызываем централизованный logout из authService, который:
// 1. Очищает localStorage/sessionStorage
// 2. Делает запрос на сервер для удаления куки
// 3. Перезагружает страницу
const doLogout = () => {
  console.log('[apiClient] Triggering logout via authService due to auth error...');
  authService.logout();
};

// Вспомогательная функция для получения куки
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// 🔥 НОВАЯ ФУНКЦИЯ: Проверка токена и запуск рефреша, если его нет
export async function checkAuthAndRefresh() {
  const appToken = getCookie('app_token');

  // Если токена нет, пытаемся обновить его принудительно
  if (!appToken) {
    console.log('[apiClient] No app_token found, attempting refresh before request...');

    if (isRefreshing) {
      // Если рефреш уже идет, просто ждем его завершения
      return new Promise((resolve) => {
        subscribeToTokenRefresh(() => resolve(true));
      });
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!refreshRes.ok) {
        console.error('[apiClient] Pre-request refresh failed with status:', refreshRes.status);
        throw new Error('Refresh failed');
      }

      console.log('[apiClient] Pre-request token refreshed successfully');
      onTokenRefreshed();
      return true; // Успешно обновили
    } catch (err) {
      console.error('[apiClient] Pre-request refresh failed, logging out', err);
      doLogout();
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  return true; // Токен был на месте
}

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const config = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };

  let response;

  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error('Network error: ' + networkError.message);
  }

  // 🔴 Если получили 401 и запрос ещё не повторялся
  if (response.status === 401 && !config._retry) {
    config._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        console.log('[apiClient] 401 received, attempting token refresh...');

        // 🔄 Запрос на обновление токена через refresh_token в cookies
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Отправляем refresh_token из cookies
          headers: { 'Content-Type': 'application/json' }
        });

        if (!refreshRes.ok) {
          console.error('[apiClient] Refresh request failed with status:', refreshRes.status);
          throw new Error('Refresh failed');
        }

        console.log('[apiClient] Token refreshed successfully');
        onTokenRefreshed();
      } catch (err) {
        // ❌ Рефреш не прошёл → полный логаут
        console.error('[apiClient] Refresh failed, logging out', err);
        doLogout();
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    // Ждём завершения рефреша, если он уже идёт
    await new Promise((resolve) => {
      subscribeToTokenRefresh(() => resolve());
    });

    // Повторяем запрос с новыми cookies
    console.log('[apiClient] Retrying original request...');
    response = await fetch(url, config);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}`);
  }

  return response.json();
}