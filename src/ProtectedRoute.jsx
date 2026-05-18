import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from './auth/authStore';
import { useState, useEffect } from 'react';
import ConfirmDialog from './component/ConfirmDialog';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      sessionStorage.setItem('returnUrl', location.pathname);
      setShowAuthDialog(true);
    }
  }, [loading, isAuthenticated, location.pathname]);

  const handleCloseDialog = () => {
    setShowAuthDialog(false);
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

 if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#333', padding: '20px' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="#6c757d" style={{ marginBottom: '20px' }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Доступ ограничен</h3>
        <p style={{ fontSize: '1rem', color: '#666', textAlign: 'center' }}>Сначала войдите в профиль, чтобы получить доступ к этой странице</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;