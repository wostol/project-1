// MyEvents.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useEventStore, { 
  useEvents, 
  useEventLoading, 
  useEventError 
} from '../Events/eventStore';
import styles from './MyEvents.module.css';

export const formatDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const day = d.getDate();
  const month = d.toLocaleDateString('ru-RU', { month: 'long' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

export const formatRegistrationDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

export const getStatusConfig = (status) => {
  const configs = {
    registration: { label: 'Регистрация', class: styles.statusRegistration },
    confirmed: { label: 'Подтверждено', class: styles.statusConfirmed },
    completed: { label: 'Завершено', class: styles.statusCompleted },
    cancelled: { label: 'Отменено', class: styles.statusCancelled },
  };
  return configs[status] || configs.registration;
};

export const getRoleIcon = (role) => {
  const icons = {
    participant: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    ),
    spectator: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
      </svg>
    ),
    organizer: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
      </svg>
    ),
  };
  return icons[role] || icons.participant;
};

export const getRoleLabel = (role) => {
  const roles = {
    participant: 'Участник',
    spectator: 'Болельщик',
    organizer: 'Организатор',
  };
  return roles[role] || role;
};

// ========================================
// API заглушки
// ========================================
const API = {
  unsubscribe: async (eventId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[API] Отписка от мероприятия #${eventId}`);
        resolve({ success: true });
      }, 300);
    });
  },
};
export const calculateDuration = (start, end) => {
  if (!start || !end) return '';
  const diffMs = new Date(end) - new Date(start);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return minutes === 0 ? `${hours} ч.` : `${hours} ч. ${minutes} мин.`;
};
// ========================================
// Карточка мероприятия
// ========================================
const EventCard = ({ event, onUnsubscribe }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = getStatusConfig(event.status);
    const fetchEventDetails = useEventStore((state) => state.fetchEventDetailsOnly);
  const updateEvent = useEventStore((state) => state.updateEvent);
    useEffect(() => {
    console.log('[EventCard] 📦 Данные:', {
      id: event.id,
      title: event.title,
      role: event.myRole,
      regDate: event.registeredAt,
      team: event.teamName,
      participants: `${event.currentParticipants}/${event.maxParticipants}`,
      status: event.status,
      type: event.eventType,
      duration: event.duration
    });
  }, [event]);
  const progressPercent = event.currentParticipants && event.maxParticipants
    ? Math.round((event.currentParticipants  / event.maxParticipants) * 100)
    : 0;
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const handleCardClick = (e) => {
    if (e.target.closest(`.${styles.cardAction}`)) return;
    setIsExpanded(!isExpanded);
  };
const handleExpand = async (e) => {
    // Не раскрываем при клике на кнопки действий
     if (e.target.closest(`.${styles.cardAction}`)) return;
    setIsExpanded(prev => !prev);
    // 👇 Ленивая загрузка: если нет описания — подгружаем детали
    if (!isExpanded && !event.fullDescription && event.status !== 'completed') {
      try {
        const details = await fetchEventDetails(event.id);
        if (details) {
          updateEvent(event.id, details);
        }
      } catch (err) {
        console.error('Ошибка загрузки деталей:', err);
      }
    }
  };
  const handleUnsubscribe = (e) => {
    e.stopPropagation();
    onUnsubscribe(event.id);
  };

  const handleNavigate = (e) => {
    e.stopPropagation();
    navigate(`/event/${event.id}`);
  };

  // Определяем баллы в зависимости от роли
  const userRole = event.myRole || 'participant';
  const points = userRole === 'spectator' ? event.fanPoints : event.participantPoints;

  return (
    <div 
      className={`${styles.eventCard} ${isExpanded ? styles.expanded : ''}`} 
      onClick={handleExpand}
    >
      {/* Шапка с градиентом */}
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerBadges}>
          <span className={`${styles.statusBadge} ${statusConfig.class}`}>
            {statusConfig.label}
          </span>
          <span className={styles.categoryBadge}>
            {event.eventType === 'sport' ? 'Спорт' : 'Мероприятие'}
          </span>
        </div>
        <h3 className={styles.title}>{event.title}</h3>
      </div>
      
      <div className={styles.points}>
        <span className={styles.pointsValue}>+{points}</span>
        <span className={styles.pointsLabel}>баллов</span>
      </div>
    </div>

      {/* Основная информация */}
<div className={styles.body}>
        <div className={styles.eventInfo}>
          {/* Дата и время */}
          <div className={styles.dateTimeBlock}>
            <svg className={styles.infoIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 6v2h14V6H5z"/>
            </svg>
            <div className={styles.dateTimeText}>
              <span className={styles.dateText}>{formatDate(event.startDate)}</span>
              <span className={styles.timeText}>{calculateDuration(event.startDate, event.endDate)}</span>
            </div>
          </div>

          {/* Место проведения */}
          <div className={styles.locationBlock}>
            <svg className={styles.infoIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className={styles.locationText}>{event.location}</span>
          </div>
        </div>

        <div className={styles.expandIndicator}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
          </svg>
        </div>
      </div>

      {isExpanded && (
  <div className={styles.details} onClick={(e) => e.stopPropagation()}>
          <div className={styles.detailSection}>
            <div className={styles.detailLabel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Ваша роль
            </div>
            <div className={styles.roleBadgeExpanded}>
              <span>{getRoleLabel(userRole)}</span>
            </div>
          </div>
    {event.fullDescription && (
      <div className={styles.detailSection}>
        <div className={styles.detailLabel}>Описание</div>
        <p className={styles.detailText}>{event.fullDescription}</p>
      </div>
    )}
    <div className={styles.cardActions}>
      {event.status !== 'completed' && event.status !== 'cancelled' && (
        <button 
          className={`${styles.cardAction} ${styles.cardActionUnsubscribe}`}
          onClick={handleUnsubscribe}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          Отписаться
        </button>
      )}
      <button 
        className={`${styles.cardAction} ${styles.cardActionDetails}`}
        onClick={handleNavigate}
      >
        Подробнее
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
        </svg>
      </button>
    </div>
  </div>
)}
    </div>
  );
};

// ========================================
// Основной компонент
// ========================================
function MyEvents() {
  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const events = useEvents();
  const loading = useEventLoading();
  const error = useEventError();
  const unsubscribeFromEvent = useEventStore((state) => state.unsubscribeFromEvent);
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
const registeredEvents = events.filter(event => event.isRegistered === true);

  const handleUnsubscribe = useCallback(async (eventId) => {
    if (!window.confirm('Вы уверены, что хотите отписаться от мероприятия?')) return;
    try {
      await unsubscribeFromEvent(eventId);
      alert('Вы отписались от мероприятия');
      fetchEvents(); // перезагружаем список после отписки
    } catch (err) {
      console.error('Ошибка при отписке:', err);
      alert('Не удалось отписаться. Попробуйте позже.');
    }
  }, [fetchEvents]);


  if (loading && events.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Мои мероприятия</h1>
          <div className={styles.loadingState}>
            <div className={styles.spinner}/>
            <p>Загрузка мероприятий...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Мои мероприятия</h1>
          <div className={styles.errorState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={fetchEvents}>
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Мои мероприятия</h1>
        <div className={styles.eventsList}>
          {registeredEvents.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
              </svg>
              <h3>Нет мероприятий</h3>
              <p>Зарегистрируйтесь на мероприятие, чтобы оно появилось здесь</p>
            </div>
          ) : (
            registeredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onUnsubscribe={handleUnsubscribe}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyEvents;