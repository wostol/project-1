// FavoritesPage.jsx
import  { useState } from 'react';
import './FavoritesPage.css';

function FavoritesPage() {
  const [activeTab, setActiveTab] = useState('events');
  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <h1 className="favorites-title">Избранное</h1>
        <p className="favorites-subtitle">Ваши сохраненные мероприятия</p>
      </header>

      <div className="favorites-tabs">
        <button
          className={`favorites-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Мероприятия
        </button>
      </div>

      <div className="favorites-content">
        <div className="empty-favorites">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#6c757d">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <h3>Избранное пусто</h3>
          <p>
            {activeTab === 'events' 
              ? 'Добавляйте мероприятия в избранное, чтобы быстро находить их позже'
              : activeTab === 'materials'
              ? 'Сохраняйте полезные материалы для изучения'
              : 'Создавайте заметки для важной информации'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FavoritesPage;