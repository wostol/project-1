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

  logout() {
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem('code_verifier');
    sessionStorage.removeItem('oauth_state');
    // Очищаем cookies на сервере через logout endpoint
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    window.location.href = '/';
  }

  async handleCallback(searchParams) {
    try {
      const result = oauthCodeHandler(searchParams);

      if (!result) {
        // Это нормально, если нет кода в URL
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