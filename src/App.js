import './App.css';
import Header from './component/Header';
import Footer from './component/Footer';
import Loader from './component/Loader';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
 import EventsPage from './Events/EventsPage';
 import EventDetail from './Events/EventDetail';
 import ProfilePage from './Profile/ProfilePage';
 import FavoritesPage from './Favorite/MyEvents'; 
import CartPage from './Bag/CartPage'; 
 import ShopPage from './Shop/ShopPage';
 import React, { useState, useEffect } from 'react';
 import AuthInitializer from './AuthInitializer';
import ProtectedRoute from './ProtectedRoute';
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Router>
      <div className="App">
        {/* AuthInitializer теперь оборачивает всё приложение */}
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
    </Router>
  );
}

export default App;