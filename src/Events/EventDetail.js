// components/EventDetail.js
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './EventDetail.css'
import logo from '../image/lionsib.svg'
// Моковые данные для детальной страницы (в будущем из БД)
const eventDetails = {
  3: {
    id: 3,
    title: 'Гандбол',
    date: '2025-12-15T19:30:00',
    location: 'ул. Карпова, 4',
    description: 'Приходи играть в гандбол. Отличная возможность проявить себя в командной игре.',
    fullDescription: 'Гандбольный турнир среди студентов университета. Соревнование пройдет по олимпийской системе. Все участники будут разделены на команды по 7 человек. Турнир проводится при поддержке спортивного клуба университета. Победители получат памятные призы и дополнительные баллы.',
    category: 'Спорт',
    maxParticipants: 16,
    currentParticipants: 12,
    maxSpectators: 50,
    currentSpectators: 25,
    organizer: 'Спортивный клуб университета',
    contactEmail: 'sport@university.ru',
    contactPhone: '+7 (999) 123-45-67',
    requirements: 'Спортивная форма, сменная обувь, медицинский допуск',
    price: 0,
    rewardsPoints: 150,
    duration: '2 часа',
    level: 'Любительский',
    rules: 'Игра по правилам Международной федерации гандбола. Каждый матч состоит из двух таймов по 30 минут.',
    equipment: 'Мяч предоставляется организаторами'
  },
  4: {
    id: 4,
    title: 'Шахматный турнир',
    date: '2025-12-20T15:00:00',
    location: 'Главный корпус, ауд. 301',
    description: 'Ежегодный шахматный турнир среди студентов.',
    fullDescription: 'Ежегодный открытый шахматный турнир среди студентов университета. Турнир проводится по швейцарской системе. Участие бесплатное. Призовой фонд - 5000 баллов на внутреннем счете. Для участия необходимо иметь базовые знания правил шахмат.',
    category: 'Интеллектуальные',
    maxParticipants: 32,
    currentParticipants: 18,
    maxSpectators: 100,
    currentSpectators: 40,
    organizer: 'Шахматный клуб',
    contactEmail: 'chess@university.ru',
    contactPhone: '+7 (999) 765-43-21',
    requirements: 'Знание правил шахмат',
    price: 0,
    rewardsPoints: 200,
    duration: '4 часа',
    level: 'Любой уровень',
    rules: 'Швейцарская система, контроль времени: 15 минут на партию + 10 секунд за ход',
    equipment: 'Шахматные доски и часы предоставляются'
  }
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registrationType, setRegistrationType] = useState('participant');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const event = eventDetails[id];

  if (!event) {
    return (
      <div className="event-detail not-found">
        <h1>Мероприятие не найдено</h1>
        <p>Запрошенное мероприятие не существует или было удалено.</p>
        <button onClick={() => navigate('/')} className="back-btn">
          Вернуться к мероприятиям
        </button>
      </div>
    );
  }

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Форматирование времени
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Расчет оставшихся мест
  const calculateAvailableSpots = (type) => {
    if (type === 'participant') {
      const spots = event.maxParticipants - event.currentParticipants;
      return spots > 0 ? spots : 0;
    } else {
      const spots = event.maxSpectators - event.currentSpectators;
      return spots > 0 ? spots : 0;
    }
  };

  // Обработка регистрации
  const handleRegister = () => {
    // Здесь будет запрос к API
    setRegistrationSuccess(true);
    setIsRegistered(true);
    
    // Через 3 секунды скрываем сообщение об успехе
    setTimeout(() => {
      setRegistrationSuccess(false);
    }, 3000);
  };

  const availableParticipants = calculateAvailableSpots('participant');
  const availableSpectators = calculateAvailableSpots('spectator');
  
  const canRegisterAsParticipant = availableParticipants > 0;
  const canRegisterAsSpectator = availableSpectators > 0;

  return (
    <div className="event-detail">
      {/* Кнопка назад */}
      <button onClick={() => navigate('/')} className="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Назад к мероприятиям
      </button>

      <div className="event-detail-container">
        {/* Заголовок */}
        <div className="event-detail-header">
          <h1 className="event-detail-title">{event.title}</h1>
          <div className='logo'>
                    <a href='/' className='logo-link'>
                      <img src={logo} alt='XY Connections Logo' className='logo-image' />
                    </a>
            </div>
        </div>

        {/* Основное содержимое */}
        <div className="event-detail-content">
          {/* Левая колонка - информация */}
          <div className="event-info">
            {/* Дата и место */}
            <div className="event-date-location">
              <div className="date-time">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 6v2h14V6H5z"/>
                </svg>
                <div>
                  <div className="date">{formatDate(event.date)}</div>
                  <div className="time">{formatTime(event.date)} • {event.duration}</div>
                </div>
              </div>
              
              <div className="location">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <div className="address">{event.location}</div>
                  <div className="venue">{event.organizer}</div>
                </div>
              </div>
            </div>

            {/* Полное описание */}
            <div className="event-full-description">
              <h3>Описание мероприятия</h3>
              <p>{event.fullDescription}</p>
            </div>

            {/* Детали */}
            <div className="event-details">
              <h3>Детали мероприятия</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Баллы за участие:</span>
                  <span className="detail-value">{event.rewardsPoints} баллов</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Уровень:</span>
                  <span className="detail-value">{event.level}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Стоимость:</span>
                  <span className="detail-value">{event.price === 0 ? 'Бесплатно' : `${event.price} ₽`}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Требования:</span>
                  <span className="detail-value">{event.requirements}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Правила:</span>
                  <span className="detail-value">{event.rules}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Оборудование:</span>
                  <span className="detail-value">{event.equipment}</span>
                </div>
              </div>
            </div>

            {/* Контакты */}
            <div className="event-contacts">
              <h3>Контакты организатора</h3>
              <div className="contacts-info">
                <a href={`mailto:${event.contactEmail}`} className="contact-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                  </svg>
                  {event.contactEmail}
                </a>
                <a href={`tel:${event.contactPhone}`} className="contact-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  {event.contactPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Правая колонка - регистрация */}
          <div className="event-registration">
            <div className="registration-card">
              <h3>Регистрация</h3>
              
              {isRegistered ? (
                <div className="registration-success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="#28a745">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <h4>Вы успешно зарегистрированы!</h4>
                  <p>Мы отправили подтверждение на вашу почту.</p>
                </div>
              ) : (
                <>
                  {/* Выбор типа регистрации */}
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
                        <span>Участник</span>
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
                    
                    {/* Информация о выбранном типе */}
                    <div className="type-info">
                      {registrationType === 'participant' ? (
                        <>
                          <h4>Участие в мероприятии</h4>
                          <ul>
                            <li>Активное участие в игре</li>
                            <li>Получение {event.rewardsPoints} баллов</li>
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
                    
                  {/* Кнопка регистрации */}
                  <button
                    className="register-btn"
                    onClick={handleRegister}
                    disabled={
                      (registrationType === 'participant' && !canRegisterAsParticipant) ||
                      (registrationType === 'spectator' && !canRegisterAsSpectator)
                    }
                  >
                    {registrationType === 'participant' 
                      ? (canRegisterAsParticipant ? 'Записаться как участник' : 'Мест нет')
                      : (canRegisterAsSpectator ? 'Записаться как болельщик' : 'Мест нет')
                    }
                  </button>

                  {registrationSuccess && (
                    <div className="success-message">
                      Регистрация прошла успешно!
                    </div>
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