import React, { useState, useEffect, useRef } from 'react';
import EventCard from './EventCard';
import useEventStore, { useEvents, useEventLoading, useEventError } from './eventStore';
import './EventsPage.css';

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  const events = useEvents();
  const isLoading = useEventLoading();
  const error = useEventError();
  const fetchEvents = useEventStore((state) => state.fetchEvents);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
    // Автофокус после завершения анимации раскрытия
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const filterEvents = (events, tab) => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return tab === 'upcoming' ? eventDate >= now : eventDate < now;
    });
  };

  const displayedEvents = filterEvents(events, activeTab).filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="events-title">Мероприятия</h1>
        
        {/* Анимированный поиск */}
        <div className={`events-search-container ${isSearchOpen ? 'open' : ''}`}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="events-search-input"
          />
          <button
            onClick={toggleSearch}
            className="search-toggle-btn"
            aria-label={isSearchOpen ? "Закрыть поиск" : "Открыть поиск"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="events-tabs">
        <button
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Будущие
        </button>
        <button
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Прошедшие
        </button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка мероприятий...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#dc3545">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
          <button onClick={fetchEvents} className="retry-btn">Попробовать снова</button>
        </div>
      ) : (
        <div className="events-grid">
          {displayedEvents.length > 0 ? (
            displayedEvents.map(event => (
              <div key={event.id} className="event-card-container">
                <EventCard event={event} isPast={activeTab === 'past'} />
              </div>
            ))
          ) : (
            <div className="no-events">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="#6c757d">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
              </svg>
              <h3>Мероприятий не найдено</h3>
              <p>
                {searchQuery 
                  ? 'Попробуйте изменить поисковый запрос'
                  : activeTab === 'upcoming' 
                    ? 'Новые мероприятия появятся здесь скоро'
                    : 'Здесь будут отображаться прошедшие мероприятия'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsPage;