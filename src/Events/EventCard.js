// Events/EventCard.jsx
import './EventCard.css'
import { useNavigate } from 'react-router-dom'

const EventCard = ({ event, isPast = false }) => {
  const { 
    id,
    title, 
    startDate,      // ← изменили date на startDate
    location, 
    description,
    participantPoints,    // ← добавили
    fanPoints,            // ← добавили
    registrationDeadline, // ← добавили
    status                // ← добавили
  } = event;
  
  const navigate = useNavigate();

  // Обработчик клика по карточке
  const handleCardClick = (e) => {
    // Предотвращаем переход при клике на кнопки
    if (e.target.closest('.btn') || e.target.closest('.event-actions')) {
      return;
    }
    navigate(`/event/${id}`);
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Форматирование времени
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Форматирование даты регистрации
  const formatDeadline = (dateString) => {
    if (!dateString) return null;
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div 
      className={`event-card ${isPast ? 'past-event' : 'future-event'}`}
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
      <div className="event-header">
        <div className="ag-courses-item_bg"></div>
        <h3 className="event-title">{title}</h3>
        
        {/* Бейдж статуса */}
        {status && (
          <div className={`event-status-badge ${status}`}>
            {status === 'active' && !isPast ? 'Идет регистрация' : 
             status === 'active' && isPast ? 'Завершено' :
             status === 'completed' ? 'Завершено' :
             status === 'cancelled' ? 'Отменено' : ''}
          </div>
        )}
        
        <div className="event-details-header">
          <div className="event-date-header">
            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 6v2h14V6H5z"/>
            </svg>
            <span>{formatDate(startDate)} в {formatTime(startDate)}</span>
          </div>
          
          <div className="event-location-header">
            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>{location}</span>
          </div>
        </div>
      </div>
      
      {/* Основное содержимое */}
      <div className="event-content">
        {/* Описание */}
        <div className="event-description">
          <p>{description}</p>
        </div>
        
        {/* Баллы за участие */}
        {(participantPoints || fanPoints) && (
          <div className="event-points-info">
            <div className="points-item">
              <span className="points-label">🎯 Участник:</span>
              <span className="points-value">+{participantPoints} баллов</span>
            </div>
            <div className="points-item">
              <span className="points-label">👥 Болельщик:</span>
              <span className="points-value">+{fanPoints} баллов</span>
            </div>
          </div>
        )}
        
        {/* Дедлайн регистрации */}
        {registrationDeadline && !isPast && (
          <div className="event-deadline">
            <svg className="icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
            </svg>
            <span>Регистрация до {formatDeadline(registrationDeadline)}</span>
          </div>
        )}
      </div>
      
      {/* Подвал карточки */}
    </div>
  );
};

export default EventCard;