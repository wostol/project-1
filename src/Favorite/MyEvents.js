// MyEvents.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useEventStore, { 
  useEvents, 
  useEventLoading, 
  useEventError 
} from '../Events/eventStore';
import styles from './MyEvents.module.css';

// ========================================
// Утилиты
// ========================================
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

// ========================================
// Карточка мероприятия
// ========================================
const EventCard = ({ event, onUnsubscribe }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = getStatusConfig(event.status);
    const fetchEventDetails = useEventStore((state) => state.fetchEventDetailsOnly);
  const updateEvent = useEventStore((state) => state.updateEvent);
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
              <span className={styles.timeText}>{formatTime(event.startDate)} – {formatTime(event.endDate)}</span>
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

        {/* Индикатор раскрытия (стрелочка) */}
        <div className={styles.expandIndicator}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
          </svg>
        </div>
      </div>

      {/* Развёрнутая информация */}
      {isExpanded && (
  <div className={styles.details} onClick={(e) => e.stopPropagation()}>
              {/* Роль участника - перенесена сюда */}
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
    {/* Полное описание */}
    {event.fullDescription && (
      <div className={styles.detailSection}>
        <div className={styles.detailLabel}>Описание</div>
        <p className={styles.detailText}>{event.fullDescription}</p>
      </div>
    )}

    {/* Детали мероприятия */}
    {/* <div className={styles.detailSection}>
      <div className={styles.detailLabel}>Детали</div>
      <div className={styles.detailsGrid}>
        {event.format && (
          <div className={styles.detailItem}>
            <span className={styles.detailKey}>Формат:</span>
            <span className={styles.detailValue}>{event.format}</span>
          </div>
        )}
        {event.level && (
          <div className={styles.detailItem}>
            <span className={styles.detailKey}>Уровень:</span>
            <span className={styles.detailValue}>{event.level}</span>
          </div>
        )}
        {event.duration && (
          <div className={styles.detailItem}>
            <span className={styles.detailKey}>Длительность:</span>
            <span className={styles.detailValue}>{event.duration}</span>
          </div>
        )}
        {event.price !== undefined && (
          <div className={styles.detailItem}>
            <span className={styles.detailKey}>Стоимость:</span>
            <span className={styles.detailValue}>
              {event.price === 0 ? 'Бесплатно' : `${event.price} ₽`}
            </span>
          </div>
        )}
        {event.rules && (
          <div className={`${styles.detailItem} ${styles.fullWidth}`}>
            <span className={styles.detailKey}>Правила:</span>
            <span className={styles.detailValue}>{event.rules}</span>
          </div>
        )}
        {event.equipment && (
          <div className={`${styles.detailItem} ${styles.fullWidth}`}>
            <span className={styles.detailKey}>Оборудование:</span>
            <span className={styles.detailValue}>{event.equipment}</span>
          </div>
        )}
      </div>
    </div> */}

    {/* Требования
    {event.requirements && (
      <div className={styles.detailSection}>
        <div className={styles.detailLabel}>Требования</div>
        <p className={styles.detailText}>{event.requirements}</p>
      </div>
    )} */}

    {/* Состав команды */}
    {event.maxParticipants && (
      <div className={styles.detailSection}>
        <div className={styles.detailLabel}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          Команда
        </div>
        <div className={styles.teamProgress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}/>
          </div>
          <span className={styles.progressText}>
            {event.currentParticipants} из {event.maxParticipants} участников
          </span>
        </div>
        {event.teamName && <div className={styles.teamName}>{event.teamName}</div>}
      </div>
    )}

    {/* Дата регистрации */}
    {event.registeredAt && (
      <div className={styles.detailSection}>
        <div className={styles.detailLabel}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          Вы зарегистрировались
        </div>
        <span className={styles.detailValue}>{formatRegistrationDate(event.registeredAt)}</span>
      </div>
    )}

    {/* Контакты организатора
    {(event.contactEmail || event.contactPhone) && (
      <div className={styles.detailSection}>
        <div className={styles.detailLabel}>Контакты</div>
        <div className={styles.contactsList}>
          {event.contactEmail && (
            <a href={`mailto:${event.contactEmail}`} className={styles.contactLink} onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
              </svg>
              {event.contactEmail}
            </a>
          )}
          {event.contactPhone && (
            <a href={`tel:${event.contactPhone}`} className={styles.contactLink} onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              {event.contactPhone}
            </a>
          )}
        </div>
      </div>
    )} */}

    {/* Кнопки действий */}
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

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleUnsubscribe = useCallback(async (eventId) => {
    if (!window.confirm('Вы уверены, что хотите отписаться от мероприятия?')) return;
    try {
      await API.unsubscribe(eventId);
      alert('Вы отписались от мероприятия');
      fetchEvents();
    } catch (err) {
      console.error('Ошибка при отписке:', err);
      alert('Не удалось отписаться. Попробуйте позже.');
    }
  }, []);

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
          {events.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
              </svg>
              <h3>Нет мероприятий</h3>
              <p>Зарегистрируйтесь на мероприятие, чтобы оно появилось здесь</p>
            </div>
          ) : (
            events.map(event => (
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