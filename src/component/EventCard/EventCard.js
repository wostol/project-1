import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EventCard.module.css';

// Форматирование даты
const formatDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const day = d.getDate();
  const month = d.toLocaleDateString('ru-RU', { month: 'long' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

// Форматирование времени (длительность)
const calculateDuration = (start, end) => {
  if (!start || !end) return '';
  const diffMs = new Date(end) - new Date(start);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return minutes === 0 ? `${hours} ч.` : `${hours} ч. ${minutes} мин.`;
};

// Форматирование времени (начала мероприятия)
const formatTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

// Конфигурация статусов
const getStatusConfig = (status) => {
  const configs = {
    registration: { label: 'Регистрация', class: styles.statusRegistration },
    confirmed: { label: 'Подтверждено', class: styles.statusConfirmed },
    completed: { label: 'Завершено', class: styles.statusCompleted },
    cancelled: { label: 'Отменено', class: styles.statusCancelled },
  };
  return configs[status] || configs.registration;
};

// Иконки ролей
const getRoleIcon = (role) => {
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

//.Labels ролей
const getRoleLabel = (role) => {
  const roles = {
    participant: 'Участник',
    spectator: 'Болельщик',
    organizer: 'Организатор',
  };
  return roles[role] || role;
};

const EventCard = ({ event, onUnsubscribe, fetchEventDetails, updateEvent }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const statusConfig = getStatusConfig(event.status);
  const userRole = event.myRole || 'participant';
  const points = userRole === 'spectator' ? event.fanPoints : event.participantPoints;

  const progressPercent = event.currentParticipants && event.maxParticipants
    ? Math.round((event.currentParticipants / event.maxParticipants) * 100)
    : 0;

  const handleExpand = async (e) => {
    if (e.target.closest(`.${styles.cardAction}`)) return;

    // Если уже раскрыто - закрываем при клике
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    const newExpandedState = true;
    setIsExpanded(newExpandedState);

    // Ленивая загрузка: если нет описания — подгружаем детали
    if (newExpandedState && !event.fullDescription && event.status !== 'completed') {
      try {
        setIsLoadingDetails(true);
        const details = await fetchEventDetails(event.id);
        if (details && updateEvent) {
          updateEvent(event.id, details);
        }
      } catch (err) {
        console.error('Ошибка загрузки деталей:', err);
      } finally {
        setIsLoadingDetails(false);
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
              <span className={styles.timeText}>в {formatTime(event.startDate)}</span>
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
        <div className={styles.details}>
          {/* Прогресс участников */}
          {event.maxParticipants > 0 && (
            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                Участники
              </div>
              <div className={styles.teamProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className={styles.progressText}>
                  {event.currentParticipants} из {event.maxParticipants} участников ({progressPercent}%)
                </div>
              </div>
            </div>
          )}

          {/* Дата регистрации */}
          {event.registeredAt && (
            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Дата регистрации
              </div>
              <div className={styles.detailValue}>
                {formatDate(event.registeredAt)} в {formatTime(event.registeredAt)}
              </div>
            </div>
          )}

          {/* Время проведения (длительность) */}
          <div className={styles.detailSection}>
            <div className={styles.detailLabel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              Длительность мероприятия
            </div>
            <div className={styles.detailValue}>
              {calculateDuration(event.startDate, event.endDate)}
            </div>
          </div>

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

export default EventCard;