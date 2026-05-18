// services/authService.js
import { oauthRedirect, oauthCodeHandler } from './authHandler.js';

const API_BASE_URL = 'https://songeng.voold.online/api';

class AuthService {
  constructor() {
    this.userKey = 'user_data';
  }

  login() {
    oauthRedirect();
  }

async logout() {
    // 1. Мгновенная локальная очистка
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem('code_verifier');
    sessionStorage.removeItem('oauth_state');

    try {
      // 2. Асинхронный запрос на бэкенд
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        console.log('[AuthService] Server logout successful');
      } else {
        console.warn('[AuthService] Server logout returned non-OK status:', response.status);
      }
    } catch (error) {
      console.warn('[AuthService] Server logout failed, but continuing with local cleanup:', error.message);
    }
    // ❌ window.location.href = '/' удалён
  }

  async handleCallback(searchParams) {
    try {
      const result = oauthCodeHandler(searchParams);

      if (!result) {
        return false;
      }

      console.log('📡 Отправка кода на бэкенд...');
      const tokenData = await this.exchangeCodeForToken(result.code, result.codeVerifier);

      if (tokenData && tokenData.user) {
        this.setUser(tokenData.user);
        console.log('✅ Пользователь авторизован:', tokenData.user.email);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Ошибка при обработке callback:', error);
      return false;
    }
  }

  async exchangeCodeForToken(code, codeVerifier) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        code: code,
        codeVerifier: codeVerifier
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Данные получены');
    return data;
  }

  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated() {
    return !!this.getUser();
  }
}

export default new AuthService();