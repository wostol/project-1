// src/api/apiClient.js
const BASE_URL = 'https://songeng.voold.online/api';

let isRefreshing = false;
let subscribers = [];

// Выполняем все ожидающие запросы после успешного рефреша
const onTokenRefreshed = (newToken) => {
  subscribers.forEach(cb => cb(newToken));
  subscribers = [];
};

// Добавляем запрос в очередь
const subscribeToTokenRefresh = (cb) => subscribers.push(cb);

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const config = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };

  // 🔹 Подставляем токен из localStorage (если используете Bearer)
  const token = localStorage.getItem('auth_token');
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, config);

  // 🔴 Если получили 401 и запрос ещё не повторялся
  if (response.status === 401 && !config._retry) {
    config._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // 🔄 Запрос на обновление токена
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!refreshRes.ok) throw new Error('Refresh failed');
        
        const data = await refreshRes.json();
        const newToken = data.token || data.accessToken; // ⚠️ Адаптируйте под ответ бэкенда
        localStorage.setItem('auth_token', newToken);
        
        onTokenRefreshed(newToken);
      } catch (err) {
        // ❌ Рефреш не прошёл → полный логаут
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/';
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    // Ждём новый токен, если рефреш уже идёт
    const newToken = await new Promise((resolve, reject) => {
      subscribeToTokenRefresh(token => token ? resolve(token) : reject(new Error('Auth failed')));
    });

    // config.headers['Authorization'] = `Bearer ${newToken}`;
    response = await fetch(url, config);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}`);
  }

  return response.json();
}