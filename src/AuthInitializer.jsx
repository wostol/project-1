// components/AuthInitializer.jsx
import { useEffect, useRef } from 'react';
import useAuthStore from './auth/authStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProfileSkeleton } from './component/Skeleton';


const AuthInitializer = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth, handleAuthCallback, loading } = useAuthStore();
  const processedRef = useRef(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const processCallback = async () => {
      const searchParams = location.search;
      console.log('🔍 Параметры URL:', searchParams);

      // Проверяем наличие кода и что ещё не обрабатывали
      if (searchParams && searchParams.includes('code=') && !processedRef.current) {
        processedRef.current = true; // ← помечаем как обработанный
        console.log('✅ Найден код авторизации, обрабатываю...');

        const success = await handleAuthCallback(searchParams);

        if (success) {
          // Очищаем URL от параметров
          window.history.replaceState({}, document.title, location.pathname);
          const returnUrl = sessionStorage.getItem('returnUrl') || '/profile';
          sessionStorage.removeItem('returnUrl');
          console.log('➡️ Перенаправление на:', returnUrl);
          navigate(returnUrl);
        } else {
          console.log('❌ Авторизация не удалась');
          navigate('/');
        }
      }
    };

    if (!loading) {
      processCallback();
    }
  }, [location, handleAuthCallback, navigate, loading]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  return children;
};

export default AuthInitializer;