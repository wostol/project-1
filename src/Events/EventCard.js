import styles from './EventCard.module.css';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, isPast = false }) => {
  const {
    id,
    title,
    startDate,
    location,
    description,
    participantPoints,
    fanPoints,
    registrationDeadline,
    status
  } = event;

  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Оставляем глобальные селекторы для проверки клика по кнопкам
    if (e.target.closest('.btn') || e.target.closest('.event-actions')) {
      return;
    }
    navigate(`/event/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return null;
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
  };

  const getStatusText = () => {
    if (!status) return isPast ? 'Завершено' : '';
    if (status === 'active' && !isPast) return 'Идет регистрация';
    if (status === 'active' && isPast) return 'Завершено';
    if (status === 'completed') return 'Завершено';
    if (status === 'cancelled') return 'Отменено';
    return '';
  };

  const statusText = getStatusText();

  return (
    <div
      className={`${styles.eventCard} ${isPast ? styles.pastEvent : styles.futureEvent}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
      aria-label={`Подробнее о мероприятии: ${title}`}
    >
      {/* Декоративный угол (добавлен, так как в оригинале он был только в CSS) */}
      <div className={styles.cardCornerDecoration} />

      <div className={styles.cardHeader}>
        <h2 className={styles.eventTitle}>{title}</h2>
        
        <div className={styles.eventMetaTop}>
          {statusText && (
            <span className={`${styles.statusBadge} ${styles[status]}`}>
              {statusText}
            </span>
          )}
          
          <div className={styles.eventMetaRow}>
            <div className={styles.metaItem}>
              <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 6v2h14V6H5z" />
              </svg>
              <span>{formatDate(startDate)} в {formatTime(startDate)}</span>
            </div>
            
            <div className={styles.metaItem}>
              <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>

      <p className={styles.eventDescription}>{description}</p>

      {(participantPoints || fanPoints) && (
        <div className={styles.pointsSection}>
          {participantPoints && (
            <div className={styles.pointsRow}>
              <div className={styles.pointsLabel}>
                <svg className={styles.pointsIcon} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span>Участник: </span>
              </div>
              <span className={styles.pointsValue}>+{participantPoints} баллов</span>
            </div>
          )}
          
          {fanPoints && (
            <div className={styles.pointsRow}>
              <div className={styles.pointsLabel}>
                <svg className={styles.pointsIcon} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                <span>Болельщик: </span>
              </div>
              <span className={styles.pointsValue}>+{fanPoints} баллов</span>
            </div>
          )}
          
          {registrationDeadline && !isPast && (
            <div className={styles.deadlineRow}>
              <svg className={styles.deadlineIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              <span>Регистрация до {formatDeadline(registrationDeadline)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;