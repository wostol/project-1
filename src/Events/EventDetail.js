import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useEventStore, {
  useSelectedEvent,
  useEventLoading,
  useEventError
} from './eventStore';
import './EventDetail.css';
import logo from '../image/lionsib.svg';

// 🔹 Вспомогательная: расчёт длительности
const calculateDuration = (start, end) => {
  if (!start || !end) return '';
  const diffMs = new Date(end) - new Date(start);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return minutes === 0 ? `${hours} ч.` : `${hours} ч. ${minutes} мин.`;
};

// 🔹 Вспомогательная: склонение числительных
const pluralize = (count, one, few, many) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 📦 Store
  const event = useSelectedEvent();
  const eventLoading = useEventLoading();
  const error = useEventError();
  const fetchEventById = useEventStore((state) => state.fetchEventById);
  const clearSelectedEvent = useEventStore((state) => state.clearSelectedEvent);
  const registerForEvent = useEventStore((state) => state.registerForEvent);

  // 🎯 Local state
  const [registrationType, setRegistrationType] = useState('participant');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  // 🔄 Синхронизация роли при загрузке данных из стора
  useEffect(() => {
    if (event?.isRegistered && event.userRegistration?.role) {
      setRegistrationType(event.userRegistration.role === 'spectator' ? 'spectator' : 'participant');
    }
  }, [event?.isRegistered, event?.userRegistration]);

  // 📥 Загрузка события
  useEffect(() => {
    if (id) fetchEventById(id);
    return () => clearSelectedEvent();
  }, [id, fetchEventById, clearSelectedEvent]);

  // 📅 Форматирование
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // 🧮 Вычисляемые значения
  const duration = useMemo(() => 
    calculateDuration(event?.startDate, event?.endDate), 
    [event?.startDate, event?.endDate]
  );
  
  const calculateAvailableSpots = (type) => {
    if (!event) return 0;
    if (type === 'participant') {
      const max = event.maxParticipants || 0;
      const current = event.currentParticipants || 0;
      return Math.max(0, max - current);
    }
    // Болельщики: условный лимит, если бэкенд не вернёт maxFans
    return Math.max(0, 1000 - (event.currentFans || 0));
  };

  const availableParticipants = calculateAvailableSpots('participant');
  
  // 🚫 Регистрация доступна только если пользователь ещё не зарегистрирован
  const canRegisterAsParticipant = availableParticipants > 0 && !event?.isRegistered;
  const canRegisterAsSpectator = !event?.isRegistered;

  // 🎁 Баллы зависят от выбранной роли
  const rewardPoints = registrationType === 'participant' 
    ? event?.participantPoints ?? 0 
    : event?.fanPoints ?? 0;

  // 📤 Обработчик регистрации
  const handleRegister = async () => {
    try {
      setRegistrationError(null);
      await registerForEvent(id, registrationType);
      setRegistrationSuccess(true);
      setTimeout(() => setRegistrationSuccess(false), 3000);
    } catch (err) {
      setRegistrationError(err.message || 'Произошла ошибка при регистрации');
    }
  };

  // ⏳ Loading
  if (eventLoading) {
    return (
      <div className="loading-container">
        <button onClick={() => navigate('/')} className="back-btn">← Назад</button>
        <p>Загрузка мероприятия...</p>
      </div>
    );
  }

  // ❌ Error / Not Found
  if (error || !event) {
    return (
      <div className="error-container">
        <button onClick={() => navigate('/')} className="back-btn">← Назад</button>
        <h2>Мероприятие не найдено</h2>
        <p>{error || 'Запрошенное мероприятие не существует.'}</p>
        <button onClick={() => navigate('/')} className="back-btn">Вернуться к мероприятиям</button>
      </div>
    );
  }

  // ✅ Основной рендер (сохранена ваша структура блоков)
  return (
    <div className='event-detail'>
      {/* Кнопка назад */}
      <button onClick={() => navigate('/')} className='back-btn'>
        <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' />
        </svg>
        Назад к мероприятиям
      </button>

      <div className="event-detail-container">
        
        <div className='event-detail-header'>
          <h1 className='event-detail-title'>{event.title}</h1>
          <div className='event-header-logo'>
            <div className='event-header-logo-link'>
              <img src={logo} alt='Логотип' className='event-header-logo-img' />
            </div>
          </div>
        </div>

        <div className="event-detail-content">
          <div className="event-info">
            <div className="event-date-location">
              <div className="date-time">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 6v2h14V6H5z"/>
                </svg>
                <div>
                  {/* 🔧 Используем startDate вместо event.date */}
                  <div className="date">{formatDate(event.startDate)}</div>
                  <div className="time">{formatTime(event.startDate)} • {event.duration}</div>
                </div>
              </div>
              
              <div className="location">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <div className="address">{event.location || 'Адрес не указан'}</div>
                </div>
              </div>
            </div>

            <div className="event-full-description">
              <h3>Описание мероприятия</h3>
              {/* 🔧 description вместо fullDescription */}
              <p>{event.description || 'Описание отсутствует'}</p>
            </div>

            <div className="event-details">
              <h3>Детали мероприятия</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Баллы за участие:</span>
                  {/* 🔧 participantPoints/fanPoints вместо rewardsPoints */}
                  <span className="detail-value">{rewardPoints} баллов</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Уровень:</span>
                  <span className="detail-value">{event.level ?? 'Не указан'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Стоимость:</span>
                  <span className="detail-value">{event.price === 0 ? 'Бесплатно' : `${event.price ?? 0} ₽`}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Требования:</span>
                  <span className="detail-value">{event.requirements ?? 'Не указаны'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Правила:</span>
                  <span className="detail-value">{event.rules ?? 'Не указаны'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Оборудование:</span>
                  <span className="detail-value">{event.equipment ?? 'Не требуется'}</span>
                </div>
              </div>
            </div>

            <div className="event-contacts">
              <h3>Контакты организатора</h3>
              <div className="contacts-info">
                <a href={event.contactEmail ? `mailto:${event.contactEmail}` : '#'} className="contact-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                  </svg>
                  {event.contactEmail || 'Не указан'}
                </a>
                <a href={event.contactPhone ? `tel:${event.contactPhone}` : '#'} className="contact-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  {event.contactPhone || 'Не указан'}
                </a>
              </div>
            </div>
          </div>

          <div className="event-registration">
            <div className="registration-card">
              <h3>Регистрация</h3>
              
              {/* 🔧 Используем event.isRegistered вместо локального isRegistered */}
              {event?.isRegistered ? (
                <div className="registration-success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="#28a745">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <h4>Вы успешно зарегистрированы!</h4>
                  <p>Роль: {event.userRegistration?.role === 'spectator' ? 'Болельщик' : 'Участник'}</p>
                  <p className="reg-date">Дата регистрации: {formatDate(event.userRegistration?.registeredAt)}</p>
                </div>
              ) : (
                <>
                  <div className="registration-type">
                    <div className="type-options">
                      <button
                        className={`type-btn ${registrationType === 'participant' ? 'active' : ''}`}
                        onClick={() => setRegistrationType('participant')}
                        disabled={!canRegisterAsParticipant}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        {/* 🔧 Исправлено: availableParticipants + pluralize */}
                        <span>
                          Участник {availableParticipants > 0 && 
                            `(${availableParticipants} ${pluralize(availableParticipants, 'место', 'места', 'мест')})`}
                        </span>
                      </button>
                      
                      <button
                        className={`type-btn ${registrationType === 'spectator' ? 'active' : ''}`}
                        onClick={() => setRegistrationType('spectator')}
                        disabled={!canRegisterAsSpectator}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 13v7H4V6h5.02c.05-.71.22-1.38.48-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5l-2-2zM16 21H6v-1h10v1zm3.5-8.5L21 13l-7 7-4.5-4.5L10 14l3 3 5.5-5.5z"/>
                        </svg>
                        <span>Болельщик</span>
                      </button>
                    </div>
                    
                    <div className="type-info">
                      {registrationType === 'participant' ? (
                        <>
                          <h4>Участие в мероприятии</h4>
                          <ul>
                            <li>Активное участие в игре</li>
                            <li>Получение {rewardPoints} баллов</li>
                            <li>Командное взаимодействие</li>
                            <li>Спортивная форма обязательна</li>
                          </ul>
                        </>
                      ) : (
                        <>
                          <h4>Наблюдение за мероприятием</h4>
                          <ul>
                            <li>Посещение в качестве зрителя</li>
                            <li>Поддержка участников</li>
                            <li>Возможность фотографировать</li>
                            <li>Бесплатное посещение</li>
                          </ul>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    className="register-btn"
                    onClick={handleRegister}
                    disabled={!canRegisterAsParticipant && !canRegisterAsSpectator}
                  >
                    {registrationType === 'participant' 
                      ? (canRegisterAsParticipant ? 'Записаться как участник' : 'Мест нет')
                      : 'Записаться как болельщик'}
                  </button>

                  {registrationSuccess && (
                    <div className="success-message">Регистрация прошла успешно!</div>
                  )}
                  {registrationError && (
                    <div className="error-message">{registrationError}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;