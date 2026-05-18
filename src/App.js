import './App.css';
import Header from './component/Header';
import Footer from './component/Footer';
import Layout from './component/Layout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EventsPage from './Events/EventsPage';
import EventDetail from './Events/EventDetail';
import ProfilePage from './Profile/ProfilePage';
import FavoritesPage from './Favorite/MyEvents';
import CartPage from './Bag/CartPage';
import ShopPage from './Shop/ShopPage';
import React from 'react';
import AuthInitializer from './AuthInitializer';
import ProtectedRoute from './ProtectedRoute';
import { LoadingProvider } from './context/PageLoadingContext';


function AppContent() {
  return (
    <Layout>
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
                      <ProtectedRoute>
                    <ProfilePage />
                        </ProtectedRoute>
                }
              />
<Route
  path="/favorites"
  element={
    <ProtectedRoute message="Для просмотра избранных мероприятий необходимо авторизоваться">
      <FavoritesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/cart"
  element={
    <ProtectedRoute message="Для доступа к корзине необходимо авторизоваться">
      <CartPage />
    </ProtectedRoute>
  }
/>
            </Routes>
          </div>
        </main>

        <Footer />
      </AuthInitializer>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </Router>
  );
}

export default App;