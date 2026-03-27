// Events/EventsPage.jsx
import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import useEventStore, { useEvents, useEventLoading, useEventError } from './eventStore';
import './EventsPage.css';

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const events = useEvents();
  const isLoading = useEventLoading();
  const error = useEventError();
  const fetchEvents = useEventStore((state) => state.fetchEvents);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Фильтрация мероприятий по дате
  const filterEvents = (events, tab) => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      if (tab === 'upcoming') {
        return eventDate >= now;
      } else {
        return eventDate < now;
      }
    });
  };

  const displayedEvents = filterEvents(events, activeTab);

  return (
    <div className='container'>
      <div className="events-page">
        <header className="events-header">
          <h1 className="events-title">Мероприятия</h1>
        </header>
      
        {/* Переключатель Прошедшие/Будущие */}
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

        {/* Индикатор загрузки */}
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка мероприятий...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#dc3545">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
            <button onClick={fetchEvents} className="retry-btn">
              Попробовать снова
            </button>
          </div>
        ) : (
          <>
            {/* Список мероприятий */}
            <div className="events-grid">
              {displayedEvents.length > 0 ? (
                displayedEvents.map(event => (
                  <div key={event.id} className="event-card-container">
                    <EventCard 
                      event={event}
                      isPast={activeTab === 'past'}
                    />
                  </div>
                ))
              ) : (
                <div className="no-events">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="#6c757d">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                  <h3>Мероприятий пока нет</h3>
                  <p>
                    {activeTab === 'upcoming' 
                      ? 'Новые мероприятия появятся здесь скоро'
                      : 'Здесь будут отображаться прошедшие мероприятия'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventsPage;