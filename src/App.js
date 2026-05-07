import './App.css';
import Header from './component/Header';
import Footer from './component/Footer';
import Loader from './component/Loader';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import EventsPage from './Events/EventsPage';
import EventDetail from './Events/EventDetail';
import ProfilePage from './Profile/ProfilePage';
import FavoritesPage from './Favorite/MyEvents';
import CartPage from './Bag/CartPage';
import ShopPage from './Shop/ShopPage';
import React, { useState, useEffect } from 'react';
import AuthInitializer from './AuthInitializer';
import ProtectedRoute from './ProtectedRoute';
import { LoadingProvider } from './context/PageLoadingContext';

// Компонент обёртка для отслеживания переходов между страницами
function PageTransitionWrapper({ children }) {
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Показываем индикатор загрузки при изменении маршрута
    setPageLoading(true);

    // Небольшая задержка для плавного перехода
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (pageLoading) {
    return <Loader message="Переход..." />;
  }

  return children;
}

function AppContent() {
  return (
    <div className="App">
      <AuthInitializer>
        <Header />

        <main className="main-content">
          <div className='container-page'>
            <Routes>
              {/* Публичные маршруты - доступны всем */}
              <Route path="/" element={<EventsPage />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/shop" element={<ShopPage />} />

              {/* Защищенные маршруты - только для авторизованных */}
              <Route
                path="/profile"
                element={
                    <ProfilePage />
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>

        <Footer />
      </AuthInitializer>
    </div>
  );
}

function App() {
  // Убрали начальную загрузку с таймером - теперь показываем только при реальных запросах
  return (
    <Router>
      <LoadingProvider>
        <PageTransitionWrapper>
          <AppContent />
        </PageTransitionWrapper>
      </LoadingProvider>
    </Router>
  );
}

export default App;