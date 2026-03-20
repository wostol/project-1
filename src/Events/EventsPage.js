
import { useState, useEffect } from 'react'
import EventCard from './EventCard'
import './EventsPage.css'

// Временные данные (в будущем будут приходить из БД)
const mockEvents = {
  past: [
    {
      id: 1,
      title: 'Баскетбол',
      date: '2025-11-11',
      location: 'ул. Карпова, 4',
      description: 'Баскетбол почти классная игра. Приходи играть и получать баллы на физру.',
      category: 'Спорт',
      image: null,
      maxParticipants: 20,
      currentParticipants: 20
    },
    {
      id: 2,
      title: 'Лыжный марафон',
      date: '2025-11-11',
      location: 'ул. Карпова, 4',
      description: 'Приходи покататься на лыжах в красивую дату и получи баллы.',
      category: 'Спорт',
      image: null,
      maxParticipants: 30,
      currentParticipants: 25
    }
  ],
  upcoming: [
    {
      id: 3,
      title: 'Гандбол',
      date: '2025-12-15',
      location: 'ул. Карпова, 4',
      description: 'Приходи играть в гандбол. Отличная возможность проявить себя в командной игре.',
      category: 'Спорт',
      image: null,
      maxParticipants: 16,
      currentParticipants: 12
    },
    {
      id: 4,
      title: 'Шахматный турнир',
      date: '2025-12-20',
      location: 'Главный корпус, ауд. 301',
      description: 'Ежегодный шахматный турнир среди студентов. Призовой фонд - 5000 баллов.',
      category: 'Интеллектуальные',
      image: null,
      maxParticipants: 32,
      currentParticipants: 18
    },
    {
      id: 5,
      title: 'Хакатон по программированию',
      date: '2025-12-25',
      location: 'IT-центр',
      description: '48-часовой марафон программирования. Собери команду и создай интересный проект.',
      category: 'IT',
      image: null,
      maxParticipants: 50,
      currentParticipants: 45
    },
    {
      id: 6,
      title: 'Фотокросс по кампусу',
      date: '2026-01-10',
      location: 'Территория университета',
      description: 'Соревнование по фотографии. Снимай самые интересные уголки кампуса.',
      category: 'Творчество',
      image: null,
      maxParticipants: 40,
      currentParticipants: 22
    }
  ]
};

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // В будущем здесь будет запрос к БД
  useEffect(() => {
    setIsLoading(true);
    // Имитация загрузки данных
    setTimeout(() => {
      setEvents(activeTab === 'past' ? mockEvents.past : mockEvents.upcoming);
      setIsLoading(false);
    }, 300);
  }, [activeTab]);

  return (
    <div className='container'>
    <div className="events-page">
      <header className="events-header">
        <h1 className="events-title">Мероприятия</h1>
      </header>
    
      {/* Переключатель Прошедшие/Будущие */}
      <div className="events-tabs">
        <button
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Прошедшие
        </button>
        <button
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Будущие
        </button>
        
      </div>

      {/* Индикатор загрузки */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка мероприятий...</p>
        </div>
      ) : (
        <>
          {/* Список мероприятий */}
          <div className="events-grid">
            {events.length > 0 ? (
    events.map(event => (
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
                  {activeTab === 'past' 
                    ? 'Здесь будут отображаться прошедшие мероприятия'
                    : 'Новые мероприятия появятся здесь скоро'}
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