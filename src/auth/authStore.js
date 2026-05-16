import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../authService.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,

      login: () => {
        try {
          set({ error: null, loading: true });
          authService.login();
        } catch (error) {
          set({ error: 'Ошибка при входе', loading: false });
          console.error('Login error:', error);
        }
      },

      logout: () => {
        console.log('[AuthStore] Performing logout...');
        try {
          authService.logout();
          set({
            isAuthenticated: false,
            user: null,
            error: null,
            loading: false,
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      handleAuthCallback: async (searchParams) => {
        set({ loading: true, error: null });
        try {
          const success = await authService.handleCallback(searchParams);
          if (success) {
            const user = authService.getUser();
            set({
              isAuthenticated: true,
              user: user,
              loading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: 'Не удалось завершить авторизацию',
            });
            return false;
          }
        } catch (error) {
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: error.message || 'Ошибка при авторизации',
          });
          return false;
        }
      },

      // 🔥 Proactive проверка при загрузке страницы (только один раз при старте)
      checkAuth: async () => {
        const storedUser = get().user;
        const storedAuth = get().isAuthenticated;

        // 🔥 Если пользователь был авторизован (данные в сторе есть),
        // проверяем актуальность токена и делаем рефреш при необходимости
        if (storedAuth && storedUser) {
          try {
            // Импортируем checkAuthAndRefresh динамически чтобы избежать циклических зависимостей
            const { checkAuthAndRefresh } = await import('./apiClient.js');
            console.log('[authStore] Running proactive auth check on page load...');

            // Сценарий А или Б: checkAuthAndRefresh вернёт true
            // Сценарий В: выбросит ошибку (logout уже вызван внутри apiClient)
            const isValid = await checkAuthAndRefresh();

            if (isValid) {
              console.log('[authStore] Auth check completed successfully');
              // Получаем обновлённые данные пользователя из authService
              const updatedUser = authService.getUser();
              set({
                isAuthenticated: true,
                user: updatedUser || storedUser,
                loading: false,
                error: null,
              });
              return;
            }
          } catch (err) {
            // Сценарий В: Ошибка уже обработана в apiClient (вызван logout)
            // Zustand state уже очищен через store.logout()
            console.log('[authStore] Auth check failed, user logged out');
            set({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: null,
            });
            return;
          }
        }

        // Если не было сохранённых данных авторизации
        set({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        authService.setUser(updatedUser);
        set({ user: updatedUser });
      },

      // Новый метод для принудительной очистки без вызова authService.logout (если нужно)
      forceLogout: () => {
         set({
            isAuthenticated: false,
            user: null,
            error: null,
            loading: false,
         });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

// Глобальный слушатель события логаута
if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    console.log('[AuthStore] Received auth-logout event');
    const store = useAuthStore.getState();

    // 1. Сбрасываем состояние в памяти
    store.forceLogout();

    // 2. Явно удаляем ключ из localStorage, чтобы при перезагрузке не восстановилось старое
    // Zustand persist иногда может не успеть синхронизироваться, если событие пришло извне
    localStorage.removeItem('auth-storage');

    // 3. Опционально: перезагружаем страницу, чтобы сбросить все компоненты в начальное состояние
    // Это самый надежный способ убедиться, что UI обновился
    window.location.reload();
  });
}

export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthError = () => useAuthStore((state) => state.error);

export default useAuthStore;