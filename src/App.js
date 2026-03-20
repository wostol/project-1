import './App.css';
import Header from './component/Header';
import Footer from './component/Footer';
import Loader from './component/Loader';
import { AuthProvider } from './AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
 import EventsPage from './Events/EventsPage';
 import EventDetail from './Events/EventDetail';
 import ProfilePage from './Profile/ProfilePage';
 import FavoritesPage from './Favorite/FavoritesPage'; 
import CartPage from './Bag/CartPage'; 
 import ShopPage from './Shop/ShopPage';
 import React, { useState, useEffect } from 'react';
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
        <AuthProvider>
        <Header />
        
        <main className="main-content">
        <div className='container-page '>
          <Routes>
            <Route path="/" element={<EventsPage />} />

            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/cart" element={<CartPage/>} />
            <Route path="/shop" element={<ShopPage />} /> 
          </Routes>
          </div>  
        </main>
        
        <Footer />
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;