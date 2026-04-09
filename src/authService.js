// services/authService.js
import { oauthRedirect, oauthCodeHandler } from './authHandler.js';

const API_BASE_URL = 'https://songeng.voold.online/api';

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.userKey = 'user_data';
  }

  login() {
    oauthRedirect();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem('code_verifier');
    sessionStorage.removeItem('oauth_state');
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
        if (tokenData.token) {
          this.setToken(tokenData.token);
        }
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
    try {
      const response = await fetch('https://songeng.voold.online/api/auth/login', {
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
      
    } catch (error) {
      console.error('❌ Ошибка:', error);
      throw error;
    }
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
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

  async registerForEvent(eventId, registrationType) {
    try {
      const user = this.getUser();

      const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          eventId: eventId,
          userId: user?.id,
          registrationType: registrationType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Регистрация успешна:', data);
      return data;

    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      throw error;
    }
  }
}

export default new AuthService();