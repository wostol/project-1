import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LoadingContext = createContext();

export const usePageLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('usePageLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const location = useLocation();

  // Отслеживаем изменение маршрута
  useEffect(() => {
    // Начинаем показывать загрузку при переходе
    setIsNavigating(true);
    setCurrentPage(location.pathname);

    // Небольшая задержка, чтобы дать странице начать рендеринг
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  // Метод для ручного управления состоянием загрузки
  const startNavigation = () => setIsNavigating(true);
  const endNavigation = () => setIsNavigating(false);

  return (
    <LoadingContext.Provider value={{ isNavigating, currentPage, startNavigation, endNavigation }}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;